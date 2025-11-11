import React, { useState } from "react";
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
  CircularProgress
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
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Remove all automatic fetching - only manual fetch on button click
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
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
        if (item.inTime) all.push({ 
          msg: `🕒 Clocked In at ${formatTime(item.inTime)}`, 
          time: item.inTime 
        });
        if (item.outTime) all.push({ 
          msg: `🏠 Clocked Out at ${formatTime(item.outTime)}`, 
          time: item.outTime 
        });
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

      // My Tasks (Skip completed)
      const groupedTasks = myTasksRes.value?.data?.groupedTasks || {};
      Object.keys(groupedTasks).forEach((dateKey) => {
        groupedTasks[dateKey].forEach((t) => {
          const status =
            t.statusInfo?.find(
              (s) => s.userId === user?._id || s.user === user?._id
            )?.status || "N/A";

          if (status.toLowerCase() === "completed") return;

          all.push({
            msg: `🧾 Task Update: ${t.title} (${status})`,
            time: t.createdAt,
          });
        });
      });

      // Assigned Tasks (Skip completed)
      const assignedTaskData = assignedTasksRes.value?.data?.data || [];
      assignedTaskData.forEach((t) => {
        if (t.status?.toLowerCase() === "completed") return;

        all.push({
          msg: `📋 New Task Assigned: ${t.title} (${t.status})`,
          time: t.createdAt,
        });
      });

      // Groups
      const groupData = groupsRes.value?.data?.data || [];
      groupData.forEach((g) => {
        all.push({ 
          msg: `👥 New Group Created: ${g.groupName}`, 
          time: g.createdAt 
        });
      });

      // Alerts
      const alertData = alertsRes.value?.data?.data || [];
      alertData.forEach((a) => {
        all.push({ 
          msg: `🚨 ${a.message}`, 
          time: a.createdAt 
        });
      });

      // ✅ Sorting Latest First + Only Today's Notifications
      const sorted = all.sort((a, b) => new Date(b.time) - new Date(a.time));
      const todayNotifications = sorted.filter(
        (n) => new Date(n.time).toDateString() === today
      );

      setNotifications(todayNotifications);
      setUnreadCount(todayNotifications.length);
      setHasFetched(true);
      
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (e) => {
    setAnchorEl(e.currentTarget);
    
    // Fetch notifications only when button is clicked for the first time
    if (!hasFetched) {
      await fetchNotifications();
    }
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleRefreshNotifications = async () => {
    await fetchNotifications();
  };

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
          <IconButton 
            onClick={toggleSidebar} 
            edge="start" 
            size={isMobile ? "small" : "medium"}
          >
            <MenuIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>

          <Typography
    variant="h6"
    noWrap
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      height: isMobile ? 35 : 50,
      width: "auto",
      objectFit: "contain",
      cursor: "default", // 👈 no pointer effect
      "&:hover": { 
        transform: "none", // 👈 no hover zoom
        opacity: 1,
        transition: "none"
      },
    }}
  />
</Box>


        {/* CENTER */}
        <Box sx={{ flex: 1, textAlign: "center" }}>
          {!isMobile ? (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 500, 
                color: theme.palette.text.secondary 
              }}
            >
              Welcome, {user?.name || "User"}
            </Typography>
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                color: theme.palette.text.secondary 
              }}
            >
              {user?.name || "User"}
            </Typography>
          )}
        </Box>

        {/* RIGHT */}
   <Box sx={{ display: "flex", alignItems: "center", gap: isMobile ? 1 : 2 }}>
  {/* Notifications */}
  <Tooltip title="Notifications">
    <IconButton 
      onClick={handleNotificationClick}
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        '&:hover': {
          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        },
        transition: 'all 0.3s ease',
        width: isMobile ? 36 : 44,
        height: isMobile ? 36 : 44,
      }}
    >
      <Badge 
        badgeContent={unreadCount} 
        color="error" 
        overlap="circular"
        sx={{
          '& .MuiBadge-badge': {
            fontSize: isMobile ? '0.6rem' : '0.7rem',
            fontWeight: 'bold',
            minWidth: isMobile ? 18 : 20,
            height: isMobile ? 18 : 20,
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
          }
        }}
      >
        <NotificationsIcon 
          sx={{ 
            fontSize: isMobile ? 20 : 24,
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            }
          }} 
        />
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
        width: 380,
        maxHeight: 500,
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#c1c1c1",
          borderRadius: "4px",
          '&:hover': {
            backgroundColor: "#a8a8a8",
          }
        },
      },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    {/* Header with Gradient Background */}
    <Box sx={{ 
      p: 2, 
      borderBottom: 1, 
      borderColor: 'divider',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          Notifications
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
        </Typography>
      </Box>
      <Tooltip title="Refresh notifications">
        <IconButton 
          size="small" 
          onClick={handleRefreshNotifications}
          disabled={loading}
          sx={{
            color: 'white',
            background: 'rgba(255,255,255,0.2)',
            '&:hover': {
              background: 'rgba(255,255,255,0.3)',
              transform: 'rotate(45deg)',
            },
            transition: 'all 0.3s ease',
            width: 32,
            height: 32,
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: 'white' }} />
          ) : (
            <Box
              component="span"
              sx={{
                fontSize: '1rem',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)',
                }
              }}
            >
              🔄
            </Box>
          )}
        </IconButton>
      </Tooltip>
    </Box>

    {/* Notifications List */}
    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 4 
        }}>
          <CircularProgress size={28} sx={{ color: '#667eea' }} />
        </Box>
      ) : notifications.length > 0 ? (
        notifications.map((n, i) => (
          <MenuItem
            key={i}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              whiteSpace: "normal",
              gap: 1,
              p: 2,
              borderBottom: i < notifications.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              backgroundColor: "transparent",
              position: 'relative',
              "&:hover": {
                backgroundColor: "rgba(102, 126, 234, 0.05)",
                transform: 'translateX(4px)',
              },
              transition: 'all 0.2s ease',
              minHeight: '72px',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 1,
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              width: '100%',
              gap: 1 
            }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  flexShrink: 0,
                  mt: 0.5,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500, 
                    lineHeight: 1.4,
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  }}
                >
                  {n.msg}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 0.5 
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "text.secondary",
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  >
                    {new Date(n.time).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "text.secondary",
                      fontSize: '0.7rem',
                    }}
                  >
                    {new Date(n.time).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MenuItem>
        ))
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            px: 2 
          }}
        >
          <Box
            sx={{
              fontSize: '3rem',
              mb: 1,
              opacity: 0.5,
            }}
          >
            🔔
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              mb: 1 
            }}
          >
            {hasFetched ? "No notifications for today" : "No notifications yet"}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ opacity: 0.7 }}
          >
            {hasFetched ? "You're all caught up!" : "Notifications will appear here"}
          </Typography>
        </Box>
      )}
    </Box>

    {/* Footer */}
    {notifications.length > 0 && (
      <Box sx={{ 
        p: 1.5, 
        borderTop: 1, 
        borderColor: 'divider',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.02)'
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    )}
  </Menu>

  {/* Logout */}
  <Tooltip title="Logout">
    <IconButton 
      onClick={handleLogout} 
      sx={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
        color: 'white',
        '&:hover': {
          background: 'linear-gradient(135deg, #ff5252 0%, #e53935 100%)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
        },
        transition: 'all 0.3s ease',
        width: isMobile ? 36 : 44,
        height: isMobile ? 36 : 44,
      }}
      size={isMobile ? "small" : "medium"}
    >
      <LogoutIcon 
        fontSize={isMobile ? "small" : "medium"} 
        sx={{
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateX(2px)',
          }
        }}
      />
    </IconButton>
  </Tooltip>
</Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;