import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Avatar,
  Stack, Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider, Fade, LinearProgress,
  useTheme, useMediaQuery, Paper, Tooltip, Badge
} from "@mui/material";
import {
  FiUsers, FiUser, FiCalendar, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiFilter, FiRefreshCw,
  FiTrendingUp, FiList, FiArrowRight
} from "react-icons/fi";
import { styled } from "@mui/material/styles";

// Enhanced Styled Components
const UserCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  border: selected 
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  background: selected 
    ? `${theme.palette.primary.main}08`
    : theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
    borderColor: theme.palette.primary.main,
  },
}));

const TaskCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.primary.main,
  },
}));

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'approved' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(status === 'in progress' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(status === 'complete' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === 'intern' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === 'technical' && {
    background: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.dark,
  }),
  ...(type === 'non-technical' && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
  ...(type === 'sales' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
}));

const EMPLOYEE_TYPES = [
  { value: "all", label: "All Employees", icon: FiUsers },
  { value: "intern", label: "Intern", icon: FiUser },
  { value: "technical", label: "Technical", icon: FiTrendingUp },
  { value: "non-technical", label: "Non-Technical", icon: FiUsers },
  { value: "sales", label: "Sales", icon: FiUser }
];

const TaskDetails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ✅ Role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser?.role || parsedUser?.user?.role || "")
          .toString()
          .trim()
          .toLowerCase();
        setCurrentUserRole(role);
      } catch (err) {
        setCurrentUserRole("");
      }
    }
  }, []);

  const canManage = useMemo(
    () => ["admin", "manager", "hr"].includes(currentUserRole),
    [currentUserRole]
  );

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setError("");
      try {
        const res = await axios.get("/task/all-users");
        setUsers(res?.data?.users || []);
        calculateStats(res?.data?.users || []);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            "Error fetching users. Please try again."
        );
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const calculateStats = (usersData) => {
    setStats({
      totalUsers: usersData.length,
      totalTasks: 0, // This would need to be calculated from tasks data
      completedTasks: 0,
      pendingTasks: 0
    });
  };

  // ✅ Fetch self-assigned tasks for selected user
  const fetchSelfAssignedTasks = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/task/user-self-assigned/${userId}`);
      setTasks(res?.data?.groupedTasks || {});
      setSelectedUserId(userId);
      const u = users.find((x) => x._id === userId) || null;
      setSelectedUser(u);
    } catch (err) {
      setError(err?.response?.data?.error || "Error fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply employeeType filter
  const filteredUsers = useMemo(() => {
    if (selectedEmployeeType === "all") return users;
    return users.filter(
      (u) =>
        u.employeeType &&
        u.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
    );
  }, [users, selectedEmployeeType]);

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'complete':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'rejected':
        return <FiXCircle color={theme.palette.error.main} />;
      case 'pending':
        return <FiClock color={theme.palette.warning.main} />;
      case 'in progress':
        return <FiAlertCircle color={theme.palette.info.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTaskCount = () => {
    return Object.values(tasks).reduce((total, dayTasks) => total + dayTasks.length, 0);
  };

  if (!canManage) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: theme.shape.borderRadius * 2,
            fontSize: '1rem',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have the required permissions to view this page. 
            Required roles: Admin, Manager, or HR.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[4]
        }}>
          <Stack spacing={3}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Self-Assigned Tasks Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Monitor and manage self-assigned tasks across your team
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Tooltip title="Refresh Data">
                  <Button
                    variant="outlined"
                    startIcon={<FiRefreshCw />}
                    onClick={() => window.location.reload()}
                    sx={{
                      borderRadius: theme.shape.borderRadius * 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Refresh
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Statistics Cards */}
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <StatCard color="primary">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: `${theme.palette.primary.main}20`, 
                        color: theme.palette.primary.main 
                      }}>
                        <FiUsers />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Users
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {stats.totalUsers}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>

              <Grid item xs={6} md={3}>
                <StatCard color="info">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: `${theme.palette.info.main}20`, 
                        color: theme.palette.info.main 
                      }}>
                        <FiList />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Tasks
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {getTaskCount()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>

              <Grid item xs={6} md={3}>
                <StatCard color="success">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: `${theme.palette.success.main}20`, 
                        color: theme.palette.success.main 
                      }}>
                        <FiCheckCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Completed
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {stats.completedTasks}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>

              <Grid item xs={6} md={3}>
                <StatCard color="warning">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: `${theme.palette.warning.main}20`, 
                        color: theme.palette.warning.main 
                      }}>
                        <FiClock />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Pending
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {stats.pendingTasks}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Filter Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[2]
        }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Filter Employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select employee type to filter the list
              </Typography>
            </Box>

            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Employee Type</InputLabel>
              <Select
                value={selectedEmployeeType}
                label="Employee Type"
                onChange={(e) => setSelectedEmployeeType(e.target.value)}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                {EMPLOYEE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {React.createElement(type.icon, { 
                        color: theme.palette.primary.main 
                      })}
                      <Typography>{type.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Users Grid Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[2]
        }}>
          <Stack spacing={3}>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
            >
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Team Members
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''} found
                  {selectedEmployeeType !== 'all' && ` • Filtered by: ${selectedEmployeeType}`}
                </Typography>
              </Box>

              {usersLoading && (
                <CircularProgress size={24} />
              )}
            </Stack>

            {error ? (
              <Alert 
                severity="error" 
                sx={{ borderRadius: theme.shape.borderRadius }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                color: theme.palette.text.secondary
              }}>
                <FiUsers size={48} style={{ marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom>
                  No Users Found
                </Typography>
                <Typography variant="body2">
                  {selectedEmployeeType !== 'all' 
                    ? 'No users match the selected filter' 
                    : 'No users available'
                  }
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredUsers.map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user._id}>
                    <UserCard 
                      selected={selectedUserId === user._id}
                      onClick={() => fetchSelfAssignedTasks(user._id)}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar
                              src={user.avatar}
                              sx={{ width: 50, height: 50 }}
                            >
                              {getInitials(user.name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600} noWrap>
                                {user.name || "Unnamed User"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email || "No email"}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                                <Chip
                                  label={user.role?.toUpperCase() || "N/A"}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <EmployeeTypeChip
                                  label={user.employeeType?.toUpperCase() || "N/A"}
                                  type={user.employeeType}
                                  size="small"
                                />
                              </Stack>
                            </Box>
                          </Stack>

                          <Button
                            fullWidth
                            variant={selectedUserId === user._id ? "contained" : "outlined"}
                            endIcon={<FiArrowRight />}
                            sx={{
                              borderRadius: theme.shape.borderRadius * 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            View Tasks
                          </Button>
                        </Stack>
                      </CardContent>
                    </UserCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Stack>
        </Paper>

        {/* Tasks Section */}
        {selectedUserId && (
          <Fade in={!!selectedUserId} timeout={500}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: theme.shape.borderRadius * 2,
              boxShadow: theme.shadows[2]
            }}>
              <Stack spacing={3}>
                {/* Selected User Header */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={selectedUser?.avatar}
                      sx={{ width: 60, height: 60 }}
                    >
                      {getInitials(selectedUser?.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {selectedUser?.name}'s Tasks
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="body2" color="text.secondary">
                          {selectedUser?.role} • {selectedUser?.employeeType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedUser?.email}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Badge 
                    badgeContent={getTaskCount()} 
                    color="primary"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: '1rem', 
                        height: 28, 
                        minWidth: 28,
                        borderRadius: 14 
                      } 
                    }}
                  >
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      Total Tasks
                    </Typography>
                  </Badge>
                </Stack>

                <Divider />

                {/* Tasks Content */}
                {loading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 4 
                  }}>
                    <Stack spacing={2} alignItems="center">
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary">
                        Loading tasks...
                      </Typography>
                    </Stack>
                  </Box>
                ) : Object.keys(tasks).length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: theme.palette.text.secondary
                  }}>
                    <FiList size={48} style={{ marginBottom: 16 }} />
                    <Typography variant="h6" gutterBottom>
                      No Self-Assigned Tasks
                    </Typography>
                    <Typography variant="body2">
                      This user hasn't assigned any tasks to themselves yet.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {Object.keys(tasks).map((date) => (
                      <Box key={date}>
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          alignItems="center" 
                          sx={{ mb: 2 }}
                        >
                          <FiCalendar color={theme.palette.primary.main} />
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            {formatDate(date)}
                          </Typography>
                          <Chip
                            label={`${tasks[date].length} task${tasks[date].length !== 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>

                        <Grid container spacing={2}>
                          {tasks[date].map((task) => (
                            <Grid item xs={12} key={task._id}>
                              <TaskCard>
                                <CardContent>
                                  <Stack spacing={2}>
                                    {/* Task Header */}
                                    <Stack 
                                      direction={{ xs: 'column', sm: 'row' }} 
                                      spacing={2} 
                                      justifyContent="space-between" 
                                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    >
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                          {task.title}
                                        </Typography>
                                        {task.description && (
                                          <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden'
                                            }}
                                          >
                                            {task.description}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                          #{task.serialNo}
                                        </Typography>
                                      </Stack>
                                    </Stack>

                                    {/* Status Information */}
                                    {Array.isArray(task.statusInfo) && task.statusInfo.length > 0 && (
                                      <>
                                        <Divider />
                                        <Box>
                                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            Status Updates
                                          </Typography>
                                          <Stack spacing={1}>
                                            {task.statusInfo.map((s, idx) => (
                                              <Stack 
                                                key={idx}
                                                direction="row" 
                                                spacing={2} 
                                                alignItems="center"
                                                sx={{ 
                                                  p: 1, 
                                                  borderRadius: 1,
                                                  bgcolor: theme.palette.action.hover
                                                }}
                                              >
                                                <Avatar sx={{ width: 32, height: 32 }}>
                                                  {getInitials(s.name)}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                  <Typography variant="body2" fontWeight={600}>
                                                    {s.name}
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                    {s.role || 'No role specified'}
                                                  </Typography>
                                                </Box>
                                                <StatusChip
                                                  label={s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}
                                                  status={s.status?.toLowerCase()}
                                                  icon={getStatusIcon(s.status)}
                                                />
                                              </Stack>
                                            ))}
                                          </Stack>
                                        </Box>
                                      </>
                                    )}
                                  </Stack>
                                </CardContent>
                              </TaskCard>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Fade>
        )}
      </Box>
    </Fade>
  );
};

export default TaskDetails;