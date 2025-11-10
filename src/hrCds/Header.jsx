import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/context/useAuth";
import logo from "/logoo.png";
import axios from "axios";
import API_URL from "../../src/config";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // notifications: [{ key, msg, time, removing? }]
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // store removal timers to clear on unmount
  const removalTimersRef = useRef({});

  useEffect(() => {
    fetchNotifications();

    let interval;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
        interval = setInterval(fetchNotifications, 15000); // 15s
      } else {
        clearInterval(interval);
      }
    };

    if (document.visibilityState === "visible") {
      interval = setInterval(fetchNotifications, 15000);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // clear any pending removal timers
      Object.values(removalTimersRef.current).forEach(clearTimeout);
      removalTimersRef.current = {};
    };
  }, []);

  // -------- Helpers --------
  const timeOnly12h = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const isToday = (dateStr) =>
    new Date(dateStr).toDateString() === new Date().toDateString();

  const byLatest = (a, b) => new Date(b.time) - new Date(a.time);

  const addIfToday = (arr, obj) => {
    if (!obj?.time || !isToday(obj.time)) return;
    arr.push(obj);
  };

  // stable keys per type
  const keyFor = {
    attendance: (type, time) => `attendance:${type}:${new Date(time).toISOString()}`,
    leave: (idOrType, time) => `leave:${idOrType || "type"}:${new Date(time).toISOString()}`,
    asset: (idOrName, time) => `asset:${idOrName || "unknown"}:${new Date(time).toISOString()}`,
    taskMine: (taskId) => `task:mine:${taskId}`,
    taskAssigned: (taskId) => `task:assigned:${taskId}`,
    group: (idOrName, time) => `group:${idOrName || "group"}:${new Date(time).toISOString()}`,
    alert: (idOrMsg, time) =>
      `alert:${(idOrMsg || "").toString().slice(0, 50)}:${new Date(time).toISOString()}`,
  };

  // -------- Fetch & Build Notifications --------
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [
        attendanceRes,
        leavesRes,
        assetsRes,
        myTasksRes,
        assignedTasksRes,
        groupsRes,
        alertsRes,
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/attendance/list`, { headers }),
        axios.get(`${API_URL}/leaves/status`, { headers }),
        axios.get(`${API_URL}/assets/my-requests`, { headers }),
        axios.get(`${API_URL}/task/my`, { headers }),
        axios.get(`${API_URL}/task/assigned`, { headers }),
        axios.get(`${API_URL}/groups`, { headers }),
        axios.get(`${API_URL}/alerts`, { headers }),
      ]);

      const next = [];

      // Attendance
      const attendanceData = attendanceRes.value?.data?.data || [];
      attendanceData.forEach((item) => {
        if (item.inTime)
          addIfToday(next, {
            key: keyFor.attendance("in", item.inTime),
            msg: "Punched In",
            time: item.inTime,
          });
        if (item.outTime)
          addIfToday(next, {
            key: keyFor.attendance("out", item.outTime),
            msg: "Punched Out",
            time: item.outTime,
          });
      });

      // Leaves (left as-is, always shown if today)
      const leavesData = leavesRes.value?.data?.leaves || [];
      leavesData.forEach((l) => {
        const status = (l.status || "").toString(); // keep as-is (could be 'Approved' etc.)
        addIfToday(next, {
          key: keyFor.leave(l._id || l.type, l.updatedAt || l.startDate || new Date()),
          msg: `Leave ${status}: ${l.type}`,
          time: l.updatedAt || l.startDate || new Date(),
        });
      });

      // Assets
      const assetsData = assetsRes.value?.data?.requests || [];
      assetsData.forEach((a) => {
        addIfToday(next, {
          key: keyFor.asset(a._id || a.assetName, a.updatedAt || new Date()),
          msg: `Asset Request: ${a.assetName} — ${(a.status || "").toUpperCase()}`,
          time: a.updatedAt || new Date(),
        });
      });

      // My Tasks (skip "completed"; keep DB values as-is)
      const groupedTasks = myTasksRes.value?.data?.groupedTasks || {};
      Object.keys(groupedTasks).forEach((dateKey) => {
        groupedTasks[dateKey].forEach((t) => {
          // find my status from statusInfo; fallback to t.status if present
          const myStatusRaw =
            t.statusInfo?.find(
              (s) => s.userId === user?._id || s.user === user?._id
            )?.status ?? t.status ?? "pending";

          const status = (myStatusRaw || "").toString(); // DB value e.g., 'pending', 'in-progress', 'completed', 'rejected'
          if (status === "completed") return;

          addIfToday(next, {
            key: keyFor.taskMine(t._id || t.id || t.title),
            msg: `Task Update: ${t.title} (${status})`,
            time: t.updatedAt || t.createdAt || new Date(),
          });
        });
      });

      // Assigned Tasks (skip "completed", show "rejected")
      const assignedTaskData =
        assignedTasksRes.value?.data?.data ||
        (Array.isArray(assignedTasksRes.value?.data) ? assignedTasksRes.value?.data : []);
      assignedTaskData.forEach((t) => {
        const status = (t.status || "").toString();
        if (status === "completed") return;

        addIfToday(next, {
          key: keyFor.taskAssigned(t._id || t.id || t.title),
          msg: `New Task Assigned: ${t.title} (${status})`,
          time: t.updatedAt || t.createdAt || new Date(),
        });
      });

      // Groups
      const groupData =
        groupsRes.value?.data?.data ||
        (Array.isArray(groupsRes.value?.data) ? groupsRes.value?.data : []);
      groupData.forEach((g) => {
        addIfToday(next, {
          key: keyFor.group(g._id || g.groupName || g.name, g.createdAt || new Date()),
          msg: `New Group Created: ${g.groupName || g.name}`,
          time: g.createdAt || new Date(),
        });
      });

      // Alerts
      const alertData =
        alertsRes.value?.data?.data ||
        (Array.isArray(alertsRes.value?.data) ? alertsRes.value?.data : []);
      alertData.forEach((a) => {
        addIfToday(next, {
          key: keyFor.alert(a._id || a.message, a.createdAt || new Date()),
          msg: `${a.message}`,
          time: a.createdAt || new Date(),
        });
      });

      // latest first
      next.sort(byLatest);

      // ---- Diff with fade-remove for items that disappeared (e.g., became "completed") ----
      setNotifications((prev) => {
        const prevByKey = new Map(prev.map((n) => [n.key, n]));
        const nextByKey = new Map(next.map((n) => [n.key, n]));

        const result = [];

        // keep/update existing items if still present
        prev.forEach((item) => {
          const still = nextByKey.get(item.key);
          if (still) {
            result.push({ ...still, removing: false });
          } else {
            // disappeared -> fade remove
            if (!item.removing) {
              const removingItem = { ...item, removing: true };
              result.push(removingItem);
              if (!removalTimersRef.current[item.key]) {
                removalTimersRef.current[item.key] = setTimeout(() => {
                  setNotifications((curr) => curr.filter((x) => x.key !== item.key));
                  clearTimeout(removalTimersRef.current[item.key]);
                  delete removalTimersRef.current[item.key];
                }, 300); // 0.3s fade duration
              }
            } else {
              result.push(item);
            }
          }
        });

        // add brand-new ones
        next.forEach((item) => {
          if (!prevByKey.has(item.key)) {
            result.push({ ...item, removing: false });
          }
        });

        result.sort(byLatest);

        // unread = visible items (not removing)
        const visibleCount = result.filter((r) => !r.removing).length;
        setUnreadCount(visibleCount);

        return result;
      });
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleNotificationClick = async (e) => {
    setAnchorEl(e.currentTarget);
    // reset unread on open
    setUnreadCount(0);
    await fetchNotifications();
  };

  const handleNotificationClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: isMobile ? 56 : 64,
        justifyContent: "center",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: isMobile ? 1.5 : 3,
          minHeight: "100% !important",
          width: "100%",
        }}
      >
        {/* LEFT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 1 : 2 }}>
          <IconButton onClick={toggleSidebar} edge="start" size={isMobile ? "small" : "medium"}>
            <MenuIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="img"
            src={logo}
            alt="Logo"
            onClick={() => navigate("/user/dashboard")}
            sx={{
              height: isMobile ? 35 : 50,
              width: "auto",
              cursor: "pointer",
              objectFit: "contain",
              "&:hover": { opacity: 0.9, transform: "scale(1.05)", transition: "0.3s" },
            }}
          />
        </Box>

        {/* CENTER */}
        <Box sx={{ flex: 1, textAlign: "center" }}>
          {!isMobile ? (
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
              Welcome, {user?.name || "User"}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
              {user?.name || "User"}
            </Typography>
          )}
        </Box>

        {/* RIGHT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 1 : 2 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error" overlap="circular">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                width: 330,
                maxHeight: 500,
                overflowY: "auto",
                p: 1,
                borderRadius: 2,
                boxShadow: 4,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "#bdbdbd", borderRadius: "3px" },
              },
            }}
          >
            {notifications.length > 0 ? (
              <>
                {notifications.map((n) => (
                  <MenuItem
                    key={n.key}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      whiteSpace: "normal",
                      gap: 0.3,
                      p: 1,
                      borderRadius: 1,
                      mb: 0.8,
                      backgroundColor: "#fafafa",
                      transition: "opacity .3s ease, transform .3s ease",
                      opacity: n.removing ? 0 : 1,
                      transform: n.removing ? "translateY(-8px)" : "translateY(0)",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {n.msg}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "gray" }}>
                      {timeOnly12h(n.time)}
                    </Typography>
                  </MenuItem>
                ))}
              </>
            ) : (
              <MenuItem disabled>No notifications for today</MenuItem>
            )}
          </Menu>

          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} color="error" size={isMobile ? "small" : "medium"}>
              <LogoutIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
