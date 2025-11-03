import React, { useContext, useState } from 'react';
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
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/useAuth';
import { ColorModeContext } from '../../src/Theme/ThemeContext';
import logo from '/logoo.png';
import axios from 'axios';
import API_URL from '../../src/config';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ Track unread notifications
  const [anchorEl, setAnchorEl] = useState(null);

  const handleNotificationClick = async (e) => {
    setAnchorEl(e.currentTarget);
    await fetchNotifications();
    setUnreadCount(0); // ✅ Reset count when user opens the menu
  };

  const handleNotificationClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    try {
      const [
        attendanceRes,
        leavesRes,
        assetsRes,
        myTasksRes,
        assignedTasksRes,
        groupsRes,
        alertsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/attendance/list`, { headers }),
        axios.get(`${API_URL}/leaves/status`, { headers }),
        axios.get(`${API_URL}/assets/my-requests`, { headers }),
        axios.get(`${API_URL}/task/my`, { headers }),
        axios.get(`${API_URL}/task/assigned`, { headers }),
        axios.get(`${API_URL}/groups`, { headers }),
        axios.get(`${API_URL}/alerts`, { headers }),
      ]);

      const all = [];
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const isRecent = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d >= last24h;
      };

      // ✅ Attendance
      const attendanceData = Array.isArray(attendanceRes.data)
        ? attendanceRes.data
        : attendanceRes.data?.data || [];
      attendanceData.forEach((item) => {
        if (!isRecent(item.date || item.inTime)) return;
        if (item.inTime) all.push(`🕒 In Time: ${formatDateTime(item.inTime)}`);
        if (item.outTime) all.push(`🏠 Out Time: ${formatDateTime(item.outTime)}`);
        if (!item.outTime && item.inTime)
          all.push('⚡ You are currently logged in');
      });

      // ✅ Leaves
      const leavesData = leavesRes.data?.leaves || [];
      leavesData.forEach((l) => {
        if (!isRecent(l.updatedAt || l.createdAt)) return;
        const emoji =
          l.status.toLowerCase() === 'approved'
            ? '✅'
            : l.status.toLowerCase() === 'pending'
            ? '⏳'
            : '❌';
        all.push(
          `${emoji} Leave ${l.status}: ${l.type} (${formatDateTime(
            l.startDate
          )} → ${formatDateTime(l.endDate)})`
        );
      });

      // ✅ Assets
      const assetsData = assetsRes.data?.requests || [];
      assetsData.forEach((a) => {
        if (!isRecent(a.updatedAt || a.createdAt)) return;
        all.push(
          `💻 Asset: ${a.assetName} — ${
            a.status === 'approved'
              ? 'Approved ✅'
              : a.status === 'pending'
              ? 'Pending ⏳'
              : 'Rejected ❌'
          } (${formatDateTime(a.updatedAt)})`
        );
      });

      // ✅ My Tasks
      const groupedTasks = myTasksRes.data?.groupedTasks || {};
      Object.keys(groupedTasks).forEach((dateKey) => {
        groupedTasks[dateKey].forEach((t) => {
          if (!isRecent(t.updatedAt || t.createdAt)) return;
          const taskStatus =
            t.statusInfo?.find(
              (s) => s.userId === user?._id || s.user === user?._id
            )?.status || 'N/A';
          all.push(`🧾 My Task: ${t.title || 'Untitled'} (${taskStatus})`);
        });
      });

      // ✅ Assigned Tasks
      const assignedTaskData = Array.isArray(assignedTasksRes.data)
        ? assignedTasksRes.data
        : assignedTasksRes.data?.data || [];
      assignedTaskData.forEach((t) => {
        if (!isRecent(t.updatedAt || t.createdAt)) return;
        all.push(`📋 Assigned: ${t.title || 'Unnamed'} (${t.status || 'Pending'})`);
      });

      // ✅ Groups
      const groupData = Array.isArray(groupsRes.data)
        ? groupsRes.data
        : groupsRes.data?.data || [];
      groupData.forEach((g) => {
        if (!isRecent(g.createdAt)) return;
        all.push(`👥 Group Created: ${g.groupName || g.name}`);
      });

      // ✅ Alerts
      const alertData = Array.isArray(alertsRes.data)
        ? alertsRes.data
        : alertsRes.data?.data || [];
      alertData.forEach((a) => {
        if (!isRecent(a.createdAt)) return;
        all.push(`🚨 ${a.message || 'New alert received'}`);
      });

      // ✅ Update notifications + badge count
      setNotifications(all);
      setUnreadCount(all.length); // update badge count with new notifications
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
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
        justifyContent: 'center',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: isMobile ? 1.5 : 3,
          minHeight: '100% !important',
          width: '100%',
        }}
      >
        {/* Left: Menu + logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
          <IconButton onClick={toggleSidebar} edge="start" size={isMobile ? 'small' : 'medium'}>
            <MenuIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="img"
            src={logo}
            alt="Logo"
            onClick={() => navigate('/user/dashboard')}
            sx={{
              height: isMobile ? 35 : 50,
              width: 'auto',
              cursor: 'pointer',
              display: 'block',
              objectFit: 'contain',
              '&:hover': {
                opacity: 0.9,
                transform: 'scale(1.05)',
                transition: 'all 0.3s ease',
              },
            }}
          />
        </Box>

        {/* Center: Welcome text */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {!isMobile ? (
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
            >
              Welcome, {user?.name || 'User'}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 500,
                color: theme.palette.text.secondary,
                fontSize: '0.8rem',
              }}
            >
              {user?.name || 'User'}
            </Typography>
          )}
        </Box>

        {/* Right: Theme toggle + Notification + Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
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
              sx: { mt: 1.5, maxHeight: 400, width: 300 },
            }}
          >
            {notifications.length > 0 ? (
              notifications.map((msg, i) => (
                <MenuItem key={i} sx={{ whiteSpace: 'normal', fontSize: '0.9rem' }}>
                  {msg}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No notifications</MenuItem>
            )}
          </Menu>

          {/* Theme Toggle */}
          <Tooltip title="Toggle Theme">
            <IconButton onClick={colorMode.toggleColorMode} size={isMobile ? 'small' : 'medium'}>
              {theme.palette.mode === 'dark' ? '🌞' : '🌙'}
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} color="error" size={isMobile ? 'small' : 'medium'}>
              <LogoutIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
