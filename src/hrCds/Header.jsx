import React, { useState, useEffect } from "react";
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

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchNotifications();

    let interval;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
        interval = setInterval(fetchNotifications, 15000); // 15 sec
      } else {
        clearInterval(interval);
      }
    };

    if (document.visibilityState === "visible") {
      interval = setInterval(fetchNotifications, 15000); // 15 sec
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

      const all = [];
      const today = new Date().toDateString();

      const formatTime = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      // Attendance Notifications
      const attendanceData = attendanceRes.value?.data?.data || [];
      attendanceData.forEach((item) => {
        if (item.inTime) all.push({ msg: `🕒In`, time: item.inTime });
        if (item.outTime) all.push({ msg: `🏠Out`, time: item.outTime });

      });

      // Leaves
      const leavesData = leavesRes.value?.data?.leaves || [];
      leavesData.forEach((l) => {
        const emoji =
          l.status?.toLowerCase() === "approved"
            ? "✅"
            : l.status?.toLowerCase() === "pending"
            ? "⏳"
            : "❌";
        all.push({
          msg: `${emoji} Leave ${l.status}: ${l.type}`,
          time: l.updatedAt || l.startDate,
        });
      });

      // Assets
      const assetsData = assetsRes.value?.data?.requests || [];
      assetsData.forEach((a) => {
        all.push({
          msg: `💻 Asset Request: ${a.assetName} — ${a.status.toUpperCase()}`,
          time: a.updatedAt,
        });
      });

      // My Tasks
    // My Tasks (Skip completed)
const groupedTasks = myTasksRes.value?.data?.groupedTasks || {};
Object.keys(groupedTasks).forEach((dateKey) => {
  groupedTasks[dateKey].forEach((t) => {
    const status =
      t.statusInfo?.find(
        (s) => s.userId === user?._id || s.user === user?._id
      )?.status || "N/A";

    if (status.toLowerCase() === "completed") return; // 🚫 Skip completed tasks

    all.push({
      msg: `🧾 Task Update: ${t.title} (${status})`,
      time: t.createdAt,
    });
  });
});

// Assigned Tasks (Skip completed)
const assignedTaskData = assignedTasksRes.value?.data?.data || [];
assignedTaskData.forEach((t) => {
  if (t.status?.toLowerCase() === "completed") return; // 🚫 Skip completed tasks

  all.push({
    msg: `📋 New Task Assigned: ${t.title} (${t.status})`,
    time: t.createdAt,
  });
});


      // Groups
      const groupData = groupsRes.value?.data?.data || [];
      groupData.forEach((g) => {
        all.push({ msg: `👥 New Group Created: ${g.groupName}`, time: g.createdAt });
      });

      // Alerts
      const alertData = alertsRes.value?.data?.data || [];
      alertData.forEach((a) => {
        all.push({ msg: `🚨 ${a.message}`, time: a.createdAt });
      });

      // ✅ Sorting Latest First + Only Today's Notifications
      const sorted = all.sort((a, b) => new Date(b.time) - new Date(a.time));
      const todayNotifications = sorted.filter(
        (n) => new Date(n.time).toDateString() === today
      );

      setNotifications(todayNotifications);
      setUnreadCount(todayNotifications.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleNotificationClick = async (e) => {
    setAnchorEl(e.currentTarget);
    await fetchNotifications();
  };

  const handleNotificationClose = () => setAnchorEl(null);
  const markAllAsRead = () => setUnreadCount(0);

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
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#bdbdbd",
        borderRadius: "3px",
      },
    },
  }}
>
  {notifications.length > 0 ? (
    <>
      {notifications.map((n, i) => (
        <MenuItem
          key={i}
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
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {n.msg}
          </Typography>
          <Typography variant="caption" sx={{ color: "gray" }}>
            {new Date(n.time).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
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
