import React, { useEffect, useState, useMemo } from "react";
import axios from "../../utils/axiosConfig";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Grid,
  Avatar,
  Fade,
  Tooltip,
  Chip,
  useTheme,
  FormControl,
  Select,
  InputLabel,
  Checkbox,
  ListItemText,
  LinearProgress,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiBell,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiUser,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiGlobe,
  FiUserCheck,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
} from "react-icons/fi";
import { styled, keyframes } from "@mui/material/styles";

/* -----------------------------------
 🔹 Animations
------------------------------------ */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* -----------------------------------
 🔹 Styled Components
------------------------------------ */
const GradientHeader = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },
}));

const StatCard = styled(Card)(({ theme, color = "primary", active }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: active ? '0 12px 32px rgba(0,0,0,0.15)' : '0 8px 24px rgba(0,0,0,0.08)',
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: active ? `2px solid ${theme.palette[color].main}` : '1px solid transparent',
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: active ? 'translateY(-4px)' : 'translateY(0)',
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
  },
}));

const AlertCard = styled(Card)(({ theme, type, isread }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[2],
  animation: `${fadeIn} 0.5s ease-out`,
  borderLeft: `6px solid ${theme.palette[type].main}`,
  backgroundColor: isread ? theme.palette.background.default : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderLeftWidth: '8px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: isread ? 'transparent' : `linear-gradient(90deg, ${theme.palette[type].light}10, transparent)`,
    pointerEvents: 'none',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
  },
}));

const AssigneeBadge = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  fontWeight: 500,
  '&.user-badge': {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}20)`,
    border: `1px solid ${theme.palette.primary.main}30`,
  },
  '&.group-badge': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light}20, ${theme.palette.secondary.main}20)`,
    border: `1px solid ${theme.palette.secondary.main}30`,
  },
}));

/* -----------------------------------
 🔹 Component
------------------------------------ */
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "info",
    message: "",
    assignedUsers: [],
    assignedGroups: [],
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warning: 0,
    error: 0,
    unread: 0,
  });
  const [filterType, setFilterType] = useState("all");
  const [role, setRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all', 'assigned', 'unread'
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const token = localStorage.getItem("token");
  const canManage = ["admin", "hr", "manager"].includes(role?.toLowerCase());

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  /* -----------------------------------
    🔹 Fetch Data
  ------------------------------------ */
  const fetchData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const [alertsRes, usersRes, groupsRes] = await Promise.all([
        axios.get("/alerts", headers),
        axios.get("/task/assignable-users", headers).catch(() => ({ data: [] })),
        axios.get("/groups", headers).catch(() => ({ data: [] })),
      ]);
      
      const fetchedAlerts = alertsRes.data?.alerts || alertsRes.data?.data || alertsRes.data || [];
      const fetchedUsers = usersRes.data?.users || usersRes.data?.data || usersRes.data || [];
      const fetchedGroups = groupsRes.data?.groups || groupsRes.data?.data || groupsRes.data || [];

      setAlerts(fetchedAlerts);
      setUsers(fetchedUsers);
      setGroups(fetchedGroups);
      calculateStats(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification({
        message: error.response?.data?.message || "Failed to load alerts",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    const info = data.filter((a) => a.type === "info").length;
    const warning = data.filter((a) => a.type === "warning").length;
    const error = data.filter((a) => a.type === "error").length;
    const unread = data.filter((a) => !a.readBy?.includes(localStorage.getItem("userId"))).length;
    
    setStats({
      total: data.length,
      info,
      warning,
      error,
      unread,
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userRole = parsed.role || parsed.user?.role || "";
        setRole(userRole.toLowerCase());
        // Store user ID for read status tracking
        const userId = parsed._id || parsed.user?._id || "";
        if (userId) localStorage.setItem("userId", userId);
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
    fetchData();
  }, []);

  /* -----------------------------------
    🔹 Handlers
  ------------------------------------ */
  const handleOpen = (alert = null) => {
    if (alert) {
      setEditId(alert._id);
      setForm({
        type: alert.type,
        message: alert.message,
        assignedUsers: alert.assignedUsers?.map(u => u._id || u) || [],
        assignedGroups: alert.assignedGroups?.map(g => g._id || g) || [],
      });
    } else {
      setEditId(null);
      setForm({
        type: "info",
        message: "",
        assignedUsers: [],
        assignedGroups: [],
      });
    }
    setUserSearch("");
    setGroupSearch("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (userId) => {
    setForm(prev => {
      const isSelected = prev.assignedUsers.includes(userId);
      if (isSelected) {
        return { ...prev, assignedUsers: prev.assignedUsers.filter(id => id !== userId) };
      } else {
        return { ...prev, assignedUsers: [...prev.assignedUsers, userId] };
      }
    });
  };

  const handleGroupSelect = (groupId) => {
    setForm(prev => {
      const isSelected = prev.assignedGroups.includes(groupId);
      if (isSelected) {
        return { ...prev, assignedGroups: prev.assignedGroups.filter(id => id !== groupId) };
      } else {
        return { ...prev, assignedGroups: [...prev.assignedGroups, groupId] };
      }
    });
  };

  const handleSubmit = async () => {
    if (!canManage)
      return setNotification({ message: "Unauthorized", severity: "error" });
    if (!form.message.trim())
      return setNotification({ message: "Message required", severity: "error" });

    try {
      const payload = {
        ...form,
        message: form.message.trim(),
      };

      if (editId) {
        const res = await axios.put(`/alerts/${editId}`, payload, headers);
        setAlerts((prev) =>
          prev.map((a) => (a._id === editId ? res.data.alert : a))
        );
        setNotification({ message: "Alert updated successfully", severity: "success" });
      } else {
        const res = await axios.post("/alerts", payload, headers);
        setAlerts((prev) => [res.data.alert, ...prev]);
        setNotification({ message: "Alert created successfully", severity: "success" });
      }
      calculateStats(alerts);
      setOpen(false);
      setTimeout(() => fetchData(), 500); // Refresh data with delay
    } catch (error) {
      console.error("Error saving alert:", error);
      setNotification({ 
        message: error.response?.data?.message || "Error saving alert", 
        severity: "error" 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!canManage)
      return setNotification({ message: "Unauthorized", severity: "error" });
    
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    
    try {
      await axios.delete(`/alerts/${id}`, headers);
      const updated = alerts.filter((a) => a._id !== id);
      setAlerts(updated);
      calculateStats(updated);
      setNotification({ message: "Alert deleted successfully", severity: "success" });
    } catch (error) {
      setNotification({ 
        message: error.response?.data?.message || "Delete failed", 
        severity: "error" 
      });
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      
      await axios.patch(`/alerts/${alertId}/read`, {}, headers);
      
      setAlerts(prev => prev.map(alert => {
        if (alert._id === alertId) {
          return {
            ...alert,
            readBy: [...(alert.readBy || []), { _id: userId }]
          };
        }
        return alert;
      }));
      
      // Update unread count
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      
      setNotification({ 
        message: "Marked as read", 
        severity: "success" 
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  /* -----------------------------------
    🔹 Filtered Data
  ------------------------------------ */
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.message?.toLowerCase().includes(query) ||
        alert.type?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((a) => a.type === filterType);
    }
    
    // Apply view mode filter
    if (viewMode === "unread") {
      const userId = localStorage.getItem("userId");
      filtered = filtered.filter(alert => 
        !alert.readBy?.some(user => user._id === userId)
      );
    } else if (viewMode === "assigned") {
      const userId = localStorage.getItem("userId");
      filtered = filtered.filter(alert => {
        const isAssignedToUser = alert.assignedUsers?.some(
          user => (user._id || user) === userId
        );
        const hasAssignments = alert.assignedUsers?.length > 0 || alert.assignedGroups?.length > 0;
        return isAssignedToUser || !hasAssignments;
      });
    }
    
    return filtered;
  }, [alerts, searchQuery, filterType, viewMode]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const query = userSearch.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  }, [users, userSearch]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch) return groups;
    const query = groupSearch.toLowerCase();
    return groups.filter(group => 
      group.name?.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    );
  }, [groups, groupSearch]);

  /* -----------------------------------
    🔹 Helper Functions
  ------------------------------------ */
  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getUserNameById = (userId) => {
    if (typeof userId === 'object' && userId._id) {
      return userId.name || userId.email || "Unknown User";
    }
    const user = users.find(u => u._id === userId);
    return user ? user.name || user.email : "Unknown User";
  };

  const getGroupNameById = (groupId) => {
    if (typeof groupId === 'object' && groupId._id) {
      return groupId.name || "Unknown Group";
    }
    const group = groups.find(g => g._id === groupId);
    return group ? group.name : "Unknown Group";
  };

  const isAlertUnread = (alert) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return false;
    return !alert.readBy?.some(user => (user._id || user) === userId);
  };

  const toggleAlertExpansion = (alertId) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography color="text.secondary">
          Loading alerts...
        </Typography>
      </Box>
    );

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Enhanced Header with Gradient */}
        <GradientHeader>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  mb: 1,
                }}
              >
                System Alerts
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Real-time notifications & announcements
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ zIndex: 1 }}>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={fetchData} 
                  disabled={refreshing}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <FiRefreshCw className={refreshing ? 'spin' : ''} />
                </IconButton>
              </Tooltip>
              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<FiPlus />}
                  onClick={() => handleOpen()}
                  sx={{ 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  New Alert
                </Button>
              )}
            </Stack>
          </Stack>
        </GradientHeader>

        {/* Stats & Filters Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Search Bar */}
          <Grid item xs={12} md={6}>
            <SearchField
              fullWidth
              placeholder="Search alerts by message or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      ✕
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* View Mode Toggle */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="text.secondary">
                  View:
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newView) => newView && setViewMode(newView)}
                  size="small"
                >
                  <ToggleButton value="all">
                    <FiEye size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      All
                    </Typography>
                  </ToggleButton>
                  <ToggleButton value="assigned">
                    <FiUserCheck size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Assigned
                    </Typography>
                  </ToggleButton>
                  <ToggleButton value="unread">
                    <Badge badgeContent={stats.unread} color="error" size="small">
                      <FiBell size={16} />
                    </Badge>
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Unread
                    </Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Paper>
          </Grid>

          {/* Stat Cards */}
          {[
            { 
              key: "total", 
              label: "Total Alerts", 
              color: "primary", 
              icon: <FiBell />,
              active: filterType === "all" && viewMode === "all"
            },
            { 
              key: "info", 
              label: "Information", 
              color: "info", 
              icon: <FiInfo />,
              active: filterType === "info"
            },
            { 
              key: "warning", 
              label: "Warnings", 
              color: "warning", 
              icon: <FiAlertTriangle />,
              active: filterType === "warning"
            },
            { 
              key: "error", 
              label: "Errors", 
              color: "error", 
              icon: <FiAlertCircle />,
              active: filterType === "error"
            },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.key}>
              <StatCard
                color={s.color}
                active={s.active}
                onClick={() => {
                  setFilterType(s.key === "total" ? "all" : s.key);
                  setViewMode("all");
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {s.label}
                      </Typography>
                      <Typography variant="h3" fontWeight={800}>
                        {stats[s.key]}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette[s.color].main}20`,
                        color: theme.palette[s.color].main,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {s.icon}
                    </Avatar>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Alerts List */}
        <Paper sx={{ borderRadius: 4, p: 3, position: 'relative' }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Alerts ({filteredAlerts.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {viewMode === 'unread' ? 'Showing unread alerts' : 
                   viewMode === 'assigned' ? 'Showing assigned alerts' : 
                   'Showing all alerts'}
                </Typography>
              </Box>
              <Chip
                icon={<FiFilter />}
                label={`Filter: ${filterType === 'all' ? 'All Types' : filterType}`}
                onClick={() => setFilterType('all')}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            </Stack>

            {/* Alerts */}
            {filteredAlerts.length === 0 ? (
              <Box textAlign="center" py={8}>
                <FiBell size={64} color={theme.palette.text.disabled} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  No Alerts Found
                </Typography>
                <Typography color="text.secondary">
                  {searchQuery ? 'Try a different search term' : 
                   viewMode === 'unread' ? 'You have no unread alerts' : 
                   'No alerts match your current filters'}
                </Typography>
              </Box>
            ) : (
              filteredAlerts.map((alert) => {
                const assignedUsers = alert.assignedUsers || [];
                const assignedGroups = alert.assignedGroups || [];
                const unread = isAlertUnread(alert);
                const expanded = expandedAlert === alert._id;
                
                return (
                  <AlertCard key={alert._id} type={alert.type} isread={!unread}>
                    <CardContent>
                      <Stack spacing={2}>
                        {/* Header Row */}
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={alert.type}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                textTransform: "uppercase",
                                fontSize: '0.7rem',
                                letterSpacing: '0.5px',
                                background: theme.palette[alert.type].main,
                                color: 'white',
                              }}
                            />
                            {unread && (
                              <Chip
                                size="small"
                                label="NEW"
                                color="error"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              <FiClock size={12} style={{ marginRight: 4 }} />
                              {formatDate(alert.createdAt)}
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" spacing={1}>
                            {unread && (
                              <Tooltip title="Mark as read">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(alert._id);
                                  }}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: `${theme.palette.success.main}15`,
                                    color: theme.palette.success.main,
                                    '&:hover': {
                                      backgroundColor: `${theme.palette.success.main}25`,
                                    }
                                  }}
                                >
                                  <FiEye size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canManage && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpen(alert);
                                    }}
                                    color="primary"
                                    size="small"
                                  >
                                    <FiEdit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(alert._id);
                                    }}
                                    color="error"
                                    size="small"
                                  >
                                    <FiTrash2 />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title={expanded ? "Collapse" : "Expand"}>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAlertExpansion(alert._id);
                                }}
                                size="small"
                              >
                                {expanded ? <FiChevronUp /> : <FiChevronDown />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Message */}
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: unread ? 600 : 400,
                            color: unread ? 'text.primary' : 'text.secondary',
                          }}
                        >
                          {alert.message}
                        </Typography>

                        {/* Assigned Users & Groups (Collapsible) */}
                        {(expanded || assignedUsers.length > 0 || assignedGroups.length > 0) && (
                          <Box sx={{ animation: `${slideIn} 0.3s ease-out` }}>
                            <Divider sx={{ my: 1 }} />
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                ASSIGNED TO:
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {assignedUsers.length > 0 ? (
                                  assignedUsers.map((user, index) => (
                                    <AssigneeBadge
                                      key={index}
                                      className="user-badge"
                                      icon={<FiUser size={12} />}
                                      label={getUserNameById(user)}
                                      size="small"
                                    />
                                  ))
                                ) : (
                                  <AssigneeBadge
                                    className="user-badge"
                                    icon={<FiGlobe size={12} />}
                                    label="All Users"
                                    size="small"
                                  />
                                )}
                                
                                {assignedGroups.length > 0 && (
                                  assignedGroups.map((group, index) => (
                                    <AssigneeBadge
                                      key={index}
                                      className="group-badge"
                                      icon={<FiUsers size={12} />}
                                      label={getGroupNameById(group)}
                                      size="small"
                                    />
                                  ))
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </AlertCard>
                );
              })
            )}
          </Stack>
        </Paper>

        {/* Enhanced Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          fullWidth 
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            pb: 2
          }}>
            <Typography variant="h5" fontWeight={600}>
              {editId ? "✏️ Edit Alert" : "🆕 Create New Alert"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {editId ? "Update your alert details" : "Create a new system alert"}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ mt: 3 }}>
            <Stack spacing={3}>
              {/* Alert Type Selection */}
              <FormControl fullWidth>
                <InputLabel>Alert Type *</InputLabel>
                <Select
                  label="Alert Type *"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  sx={{
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }
                  }}
                >
                  <MenuItem value="info">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FiInfo color={theme.palette.info.main} />
                      <Box>
                        <Typography>Information</Typography>
                        <Typography variant="caption" color="text.secondary">
                          General updates and announcements
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="warning">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FiAlertTriangle color={theme.palette.warning.main} />
                      <Box>
                        <Typography>Warning</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Important notices requiring attention
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="error">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FiAlertCircle color={theme.palette.error.main} />
                      <Box>
                        <Typography>Error / Critical</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Urgent issues requiring immediate action
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {/* Message */}
              <TextField
                label="Alert Message *"
                name="message"
                multiline
                rows={4}
                value={form.message}
                onChange={handleChange}
                fullWidth
                placeholder="Enter your alert message here..."
                required
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />

              {/* Assign Users Section */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  📋 Assign Users
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Select specific users or leave empty for all users
                </Typography>
                
                {/* User Search */}
                <SearchField
                  fullWidth
                  placeholder="Search users by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  sx={{ mb: 2 }}
                />
                
                {/* Selected Users Chips */}
                {form.assignedUsers.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {form.assignedUsers.map(userId => {
                      const user = users.find(u => u._id === userId);
                      return user ? (
                        <Chip
                          key={userId}
                          label={user.name || user.email}
                          onDelete={() => handleUserSelect(userId)}
                          size="small"
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}20)`,
                          }}
                        />
                      ) : null;
                    })}
                  </Stack>
                )}
                
                {/* Users List */}
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 1 }}>
                  {filteredUsers.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No users found
                    </Typography>
                  ) : (
                    filteredUsers.map((user) => (
                      <Paper
                        key={user._id}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: form.assignedUsers.includes(user._id) 
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          backgroundColor: form.assignedUsers.includes(user._id) 
                            ? `${theme.palette.primary.main}10`
                            : 'transparent',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}05`,
                            transform: 'translateY(-1px)',
                          }
                        }}
                        onClick={() => handleUserSelect(user._id)}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Checkbox
                            checked={form.assignedUsers.includes(user._id)}
                            onChange={() => handleUserSelect(user._id)}
                          />
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.main,
                              fontSize: '0.875rem'
                            }}
                          >
                            
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {user.name || user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email} • {user.role || 'User'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))
                  )}
                </Box>
              </Paper>

              {/* Assign Groups Section */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  👥 Assign Groups
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Select specific groups or leave empty for all groups
                </Typography>
                
                {/* Group Search */}
                <SearchField
                  fullWidth
                  placeholder="Search groups by name..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  sx={{ mb: 2 }}
                />
                
                {/* Selected Groups Chips */}
                {form.assignedGroups.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {form.assignedGroups.map(groupId => {
                      const group = groups.find(g => g._id === groupId);
                      return group ? (
                        <Chip
                          key={groupId}
                          label={group.name}
                          onDelete={() => handleGroupSelect(groupId)}
                          size="small"
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.secondary.light}20, ${theme.palette.secondary.main}20)`,
                          }}
                        />
                      ) : null;
                    })}
                  </Stack>
                )}
                
                {/* Groups List */}
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 1 }}>
                  {filteredGroups.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No groups found
                    </Typography>
                  ) : (
                    filteredGroups.map((group) => (
                      <Paper
                        key={group._id}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: form.assignedGroups.includes(group._id) 
                            ? `2px solid ${theme.palette.secondary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          backgroundColor: form.assignedGroups.includes(group._id) 
                            ? `${theme.palette.secondary.main}10`
                            : 'transparent',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: `${theme.palette.secondary.main}05`,
                            transform: 'translateY(-1px)',
                          }
                        }}
                        onClick={() => handleGroupSelect(group._id)}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Checkbox
                            checked={form.assignedGroups.includes(group._id)}
                            onChange={() => handleGroupSelect(group._id)}
                          />
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: theme.palette.secondary.light,
                              color: theme.palette.secondary.main,
                            }}
                          >
                            <FiUsers size={16} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {group.name}
                            </Typography>
                            {group.description && (
                              <Typography variant="caption" color="text.secondary">
                                {group.description}
                              </Typography>
                            )}
                          </Box>
                          {group.members && (
                            <Chip
                              size="small"
                              label={`${group.members.length} members`}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Paper>
                    ))
                  )}
                </Box>
              </Paper>
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleClose} 
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!form.message.trim()}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  transform: 'translateY(-2px)',
                },
                '&.Mui-disabled': {
                  background: theme.palette.action.disabledBackground,
                }
              }}
            >
              {editId ? "Update Alert" : "Create Alert"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ 
            '& .MuiSnackbarContent-root': {
              borderRadius: 3,
              boxShadow: theme.shadows[8],
            }
          }}
        >
          <Card
            sx={{
              background: 
                notification?.severity === "error" 
                  ? `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)` :
                notification?.severity === "warning"
                  ? `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
              color: "white",
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: theme.shadows[8],
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
              {notification?.severity === "error" ? (
                <FiAlertCircle size={24} />
              ) : notification?.severity === "warning" ? (
                <FiAlertTriangle size={24} />
              ) : (
                <FiTrendingUp size={24} />
              )}
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {notification?.severity === "error" ? "Error" : 
                   notification?.severity === "warning" ? "Warning" : "Success"}
                </Typography>
                <Typography variant="body2">{notification?.message}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default Alerts;