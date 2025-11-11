import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Avatar,
  Stack, Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider, Fade, LinearProgress,
  useTheme, useMediaQuery, Paper, Tooltip, Badge, Dialog,
  DialogTitle, DialogContent, IconButton, Tab, Tabs,
  TextField, List, ListItem, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  DialogActions, Menu, Snackbar
} from "@mui/material";
import {
  FiUsers, FiUser, FiCalendar, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiFilter, FiRefreshCw,
  FiTrendingUp, FiList, FiArrowRight, FiX, FiMessageSquare,
  FiActivity, FiFileText, FiDownload, FiBarChart2,
  FiPlayCircle, FiPauseCircle, FiAlertTriangle, FiUserCheck,
  FiEdit, FiTrash2, FiPlus, FiSearch, FiArrowUp, FiArrowDown,
  FiMoreVertical, FiSave, FiEdit2
} from "react-icons/fi";
import { styled } from "@mui/material/styles";

// ---------------- Styled Components ---------------- //
const UserCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: "pointer",
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  background: selected
    ? `${theme.palette.primary.main}08`
    : theme.palette.background.paper,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
    borderColor: theme.palette.primary.main,
  },
}));

const TaskCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  borderLeft: `4px solid ${
    status === 'completed' ? theme.palette.success.main :
    status === 'in-progress' ? theme.palette.info.main :
    status === 'pending' ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    boxShadow: theme.shadows[3],
    transform: "translateY(-1px)",
  },
}));

const StatCard = styled(Card)(({ theme, color = "primary" }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-2px)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === "approved" || status === "completed" && {
    background: `${theme.palette.success.main}15`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}30`,
  }),
  ...(status === "rejected" && {
    background: `${theme.palette.error.main}15`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}30`,
  }),
  ...(status === "pending" && {
    background: `${theme.palette.warning.main}15`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}30`,
  }),
  ...(status === "in progress" || status === "in-progress" && {
    background: `${theme.palette.info.main}15`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}30`,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  fontSize: '0.7rem',
  ...(type === "intern" && {
    background: `${theme.palette.info.main}15`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}30`,
  }),
  ...(type === "technical" && {
    background: `${theme.palette.primary.main}15`,
    color: theme.palette.primary.dark,
    border: `1px solid ${theme.palette.primary.main}30`,
  }),
  ...(type === "non-technical" && {
    background: `${theme.palette.secondary.main}15`,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}30`,
  }),
  ...(type === "sales" && {
    background: `${theme.palette.success.main}15`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}30`,
  }),
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => ({
  fontWeight: 500,
  fontSize: '0.65rem',
  ...(priority === 'high' && {
    background: `${theme.palette.error.main}15`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}30`,
  }),
  ...(priority === 'medium' && {
    background: `${theme.palette.warning.main}15`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}30`,
  }),
  ...(priority === 'low' && {
    background: `${theme.palette.success.main}15`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}30`,
  }),
}));

// Employee type options
const EMPLOYEE_TYPES = [
  { value: "all", label: "All Employees", icon: FiUsers },
  { value: "intern", label: "Intern", icon: FiUser },
  { value: "technical", label: "Technical", icon: FiTrendingUp },
  { value: "non-technical", label: "Non-Technical", icon: FiUsers },
  { value: "sales", label: "Sales", icon: FiUser },
];

// Task status options
const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'in-progress', label: 'In Progress', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
];

// Priority options
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
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
  const [openDialog, setOpenDialog] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState({
    remarks: [],
    activityLogs: [],
    files: []
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editTask, setEditTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ Role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const role = (
          parsedUser?.role ||
          parsedUser?.user?.role ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();
        setCurrentUserRole(role);
      } catch {
        setCurrentUserRole("");
      }
    }
  }, []);

  const canManage = useMemo(
    () => ["admin", "manager", "hr", "SuperAdmin"].includes(currentUserRole),
    [currentUserRole]
  );

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get("/task/all-users");
        const usersData = res?.data?.users || [];
        setUsers(usersData);
        
        // Fetch counts for all users
        await fetchAllUserCounts(usersData);
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

  // ✅ Fetch counts for all users using the counts endpoint - FIXED
  const fetchAllUserCounts = async (usersData) => {
    const stats = {};
    
    // Fetch counts for each user
    const countPromises = usersData.map(async (user) => {
      try {
        const countRes = await axios.get(`/task/user/${user._id}/counts`);
        const counts = countRes?.data?.counts || {};
        const assigned = counts.assigned || {};
        const summary = counts.summary || {};
        
        stats[user._id] = {
          total: assigned.total || assigned.total || 0,
          pending: assigned.pending || 0,
          inProgress: assigned.inProgress || 0,
          completed: assigned.completed || 0,
          overdue: assigned.overdue || 0
        };
      } catch (err) {
        console.error(`Error fetching counts for user ${user._id}:`, err);
        // Set default counts if API fails
        stats[user._id] = {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0
        };
      }
    });

    await Promise.all(countPromises);
    setUserStats(stats);
  };

  // ✅ Fetch counts for a specific user - FIXED
  const fetchUserCounts = async (userId) => {
    try {
      const countRes = await axios.get(`/task/user/${userId}/counts`);
      const counts = countRes?.data?.counts || {};
      const assigned = counts.assigned || {};
      const summary = counts.summary || {};
      
      setUserStats(prev => ({
        ...prev,
        [userId]: {
          total: assigned.total || assigned.total || 0,
          pending: assigned.pending || 0,
          inProgress: assigned.inProgress || 0,
          completed: assigned.completed || 0,
          overdue: assigned.overdue || 0
        }
      }));
    } catch (err) {
      console.error(`Error fetching counts for user ${userId}:`, err);
    }
  };

  // ✅ Fetch self-assigned tasks for selected user
  const fetchSelfAssignedTasks = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/task/user-self-assigned/${userId}`);
      const tasksData = res?.data?.groupedTasks || {};
      setTasks(tasksData);
      
      const user = users.find((x) => x._id === userId) || null;
      setSelectedUser(user);
      setSelectedUserId(userId);
      
      // Also fetch updated counts for this user
      await fetchUserCounts(userId);
      setOpenDialog(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Error fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch task details (remarks, activity logs, files)
  const fetchTaskDetails = async (taskId) => {
    try {
      setSelectedTask(tasks => Object.values(tasks).flat().find(t => t._id === taskId));
      
      const [remarksRes, activityRes] = await Promise.allSettled([
        axios.get(`/task/${taskId}/remarks`),
        axios.get(`/task/${taskId}/activity-logs`)
      ]);

      setTaskDetails({
        remarks: remarksRes.status === 'fulfilled' ? remarksRes.value.data.remarks || [] : [],
        activityLogs: activityRes.status === 'fulfilled' ? activityRes.value.data.logs || [] : [],
        files: [] // You can add file fetching logic here
      });
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  // Edit Task Functions
  const handleEditTask = (task) => {
    setEditTask({
      ...task,
      dueDateTime: task.dueDateTime ? new Date(task.dueDateTime).toISOString().slice(0, 16) : ''
    });
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveTask = async () => {
    try {
      const response = await axios.put(`/task/${editTask._id}`, {
        title: editTask.title,
        description: editTask.description,
        dueDateTime: editTask.dueDateTime,
        priority: editTask.priority,
        overallStatus: editTask.overallStatus
      });

      if (response.data.success) {
        // Update local tasks state
        const updatedTasks = { ...tasks };
        Object.keys(updatedTasks).forEach(date => {
          updatedTasks[date] = updatedTasks[date].map(task => 
            task._id === editTask._id ? { ...task, ...editTask } : task
          );
        });
        setTasks(updatedTasks);
        
        // Refresh counts for the user
        await fetchUserCounts(selectedUserId);
        
        setEditDialogOpen(false);
        setEditTask(null);
        showSnackbar('Task updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Error updating task', 'error');
    }
  };

  // Delete Task Functions
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleDeleteTask = async () => {
    try {
      const response = await axios.delete(`/task/${taskToDelete._id}`);
      
      if (response.data.success) {
        // Remove task from local state
        const updatedTasks = { ...tasks };
        Object.keys(updatedTasks).forEach(date => {
          updatedTasks[date] = updatedTasks[date].filter(task => task._id !== taskToDelete._id);
          // Remove empty dates
          if (updatedTasks[date].length === 0) {
            delete updatedTasks[date];
          }
        });
        setTasks(updatedTasks);
        
        // Refresh counts for the user
        await fetchUserCounts(selectedUserId);
        
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
        showSnackbar('Task deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Error deleting task', 'error');
    }
  };

  // Menu Functions
  const handleMenuOpen = (event, task) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTaskForMenu(task);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTaskForMenu(null);
  };

  // Snackbar Functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Refresh all user counts
  const refreshAllCounts = async () => {
    if (users.length > 0) {
      await fetchAllUserCounts(users);
      showSnackbar('Counts refreshed successfully!', 'success');
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (selectedEmployeeType !== "all") {
      filtered = users.filter(
        (u) =>
          u.employeeType &&
          u.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [users, selectedEmployeeType, searchTerm]);

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "approved":
      case "complete":
      case "completed":
        return <FiCheckCircle color={theme.palette.success.main} />;
      case "rejected":
        return <FiXCircle color={theme.palette.error.main} />;
      case "pending":
        return <FiClock color={theme.palette.warning.main} />;
      case "in progress":
      case "in-progress":
        return <FiPlayCircle color={theme.palette.info.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("-");
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        weekday: "long",
      });
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        weekday: "long",
    });
  };

  const isOverdue = (task) => {
    if (!task.dueDateTime) return false;
    return new Date(task.dueDateTime) < new Date() && 
           (task.overallStatus !== 'completed' && task.overallStatus !== 'approved');
  };

  const getTaskCount = () =>
    Object.values(tasks).reduce((a, b) => a + b.length, 0);

  // Enhanced User Card with Statistics - FIXED
  const UserCardWithStats = ({ user }) => {
    const stats = userStats[user._id] || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    const isSelected = selectedUserId === user._id;

    return (
      <UserCard selected={isSelected} onClick={() => fetchSelfAssignedTasks(user._id)}>
        <CardContent>
          <Stack spacing={2}>
            {/* User Info */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={user.avatar} sx={{ width: 56, height: 56 }}>
                {getInitials(user.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} noWrap>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip
                    label={user.role?.toUpperCase()}
                    color="primary"
                    size="small"
                    sx={{ height: 20, fontSize: '0.6rem' }}
                  />
                  <EmployeeTypeChip
                    label={user.employeeType?.toUpperCase()}
                    type={user.employeeType}
                    size="small"
                    sx={{ height: 20, fontSize: '0.6rem' }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* Statistics - FIXED */}
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <StatCard sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Tasks
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard sx={{ p: 1.5, textAlign: 'center' }} color="warning">
                  <Typography variant="h6" fontWeight={700} color="warning.main">
                    {stats.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard sx={{ p: 1.5, textAlign: 'center' }} color="error">
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {stats.overdue}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overdue
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard sx={{ p: 1.5, textAlign: 'center' }} color="success">
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {stats.completed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant={isSelected ? "contained" : "outlined"}
              endIcon={<FiArrowRight />}
              size="small"
            >
              View Details
            </Button>
          </Stack>
        </CardContent>
      </UserCard>
    );
  };

  // Task Details Dialog Content
  const TaskDetailsContent = ({ task }) => (
    <Box>
      <Stack spacing={3}>
        {/* Task Basic Info */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={700}>
                {task.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {task.description}
              </Typography>
              
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <StatusChip
                  label={task.overallStatus || 'pending'}
                  status={task.overallStatus}
                  icon={getStatusIcon(task.overallStatus)}
                />
                <PriorityChip
                  label={task.priority || 'medium'}
                  priority={task.priority}
                />
                {isOverdue(task) && (
                  <Chip
                    label="OVERDUE"
                    color="error"
                    size="small"
                    icon={<FiAlertTriangle />}
                  />
                )}
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={600}>
                    Due Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(task.dueDateTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={600}>
                    Created
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(task.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs for Details */}
        <Paper sx={{ p: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Remarks" icon={<FiMessageSquare />} iconPosition="start" />
            <Tab label="Activity Logs" icon={<FiActivity />} iconPosition="start" />
            <Tab label="Files" icon={<FiFileText />} iconPosition="start" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && (
              <List>
                {taskDetails.remarks.length > 0 ? (
                  taskDetails.remarks.map((remark, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getInitials(remark.user?.name)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={remark.user?.name || 'Unknown User'}
                        secondary={
                          <Box>
                            <Typography variant="body2">{remark.text}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(remark.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={3}>
                    No remarks found
                  </Typography>
                )}
              </List>
            )}

            {activeTab === 1 && (
              <List>
                {taskDetails.activityLogs.length > 0 ? (
                  taskDetails.activityLogs.map((log, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getInitials(log.user?.name)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={log.user?.name || 'Unknown User'}
                        secondary={
                          <Box>
                            <Typography variant="body2">{log.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(log.createdAt)} • {log.action}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={3}>
                    No activity logs found
                  </Typography>
                )}
              </List>
            )}

            {activeTab === 2 && (
              <Box>
                {taskDetails.files.length > 0 ? (
                  <List>
                    {taskDetails.files.map((file, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <FiFileText />
                        </ListItemIcon>
                        <ListItemText primary={file.name} />
                        <IconButton>
                          <FiDownload />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={3}>
                    No files attached
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>
    </Box>
  );

  // Edit Task Dialog
  const EditTaskDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiEdit2 />
          <Typography variant="h6">Edit Task</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <TextField
            label="Task Title"
            value={editTask?.title || ''}
            onChange={(e) => setEditTask({...editTask, title: e.target.value})}
            fullWidth
          />
          <TextField
            label="Description"
            value={editTask?.description || ''}
            onChange={(e) => setEditTask({...editTask, description: e.target.value})}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Due Date & Time"
            type="datetime-local"
            value={editTask?.dueDateTime || ''}
            onChange={(e) => setEditTask({...editTask, dueDateTime: e.target.value})}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={editTask?.priority || 'medium'}
              label="Priority"
              onChange={(e) => setEditTask({...editTask, priority: e.target.value})}
            >
              {PRIORITY_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette[option.color].main
                      }}
                    />
                    <Typography>{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editTask?.overallStatus || 'pending'}
              label="Status"
              onChange={(e) => setEditTask({...editTask, overallStatus: e.target.value})}
            >
              {TASK_STATUSES.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getStatusIcon(status.value)}
                    <Typography>{status.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={handleSaveTask} 
          variant="contained" 
          startIcon={<FiSave />}
          disabled={!editTask?.title?.trim()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Delete Confirmation Dialog
  const DeleteConfirmationDialog = () => (
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiTrash2 color={theme.palette.error.main} />
          <Typography variant="h6">Delete Task</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the task "<strong>{taskToDelete?.title}</strong>"?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={handleDeleteTask} 
          variant="contained" 
          color="error"
          startIcon={<FiTrash2 />}
        >
          Delete Task
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!canManage)
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6" fontWeight={700}>
            Access Denied
          </Typography>
          <Typography>
            You don't have the required permissions to view this page.
          </Typography>
        </Alert>
      </Box>
    );

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Employee Task Dashboard
              </Typography>
              <Typography color="text.secondary">
                Monitor and manage self-assigned tasks across your team with detailed analytics
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FiRefreshCw />}
                onClick={refreshAllCounts}
              >
                Refresh Counts
              </Button>
              <Button
                variant="outlined"
                startIcon={<FiRefreshCw />}
                onClick={() => window.location.reload()}
              >
                Refresh All
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Filters and Search */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Employee Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor team performance and task distribution
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee Type</InputLabel>
                <Select
                  value={selectedEmployeeType}
                  label="Employee Type"
                  onChange={(e) => setSelectedEmployeeType(e.target.value)}
                >
                  {EMPLOYEE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {React.createElement(type.icon, {
                          color: theme.palette.primary.main,
                        })}
                        <Typography>{type.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Employees"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Users Grid */}
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {usersLoading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Loading employees...
              </Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box textAlign="center" py={4}>
              <FiUsers size={48} color={theme.palette.text.secondary} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No employees found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your filters or search terms
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                  <UserCardWithStats user={user} />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Task Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="lg"
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {selectedUser?.name}'s Tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userStats[selectedUserId]?.total || 0} total tasks • 
                  {userStats[selectedUserId]?.pending || 0} pending • 
                  {userStats[selectedUserId]?.overdue || 0} overdue
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenDialog(false)}>
                <FiX />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent dividers sx={{ minHeight: 400 }}>
            {loading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Loading tasks...
                </Typography>
              </Box>
            ) : Object.keys(tasks).length === 0 ? (
              <Box textAlign="center" py={4}>
                <FiList size={48} color={theme.palette.text.secondary} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  No tasks found
                </Typography>
                <Typography color="text.secondary">
                  This user hasn't been assigned any tasks yet
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {Object.keys(tasks).map((date) => (
                  <Box key={date}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <FiCalendar color={theme.palette.primary.main} />
                      <Typography variant="h6" fontWeight={600}>
                        {formatDate(date)}
                      </Typography>
                      <Chip 
                        label={`${tasks[date].length} tasks`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Stack>
                    
                    <Grid container spacing={2}>
                      {tasks[date].map((task) => (
                        <Grid item xs={12} key={task._id}>
                          <TaskCard status={task.overallStatus}>
                            <CardContent>
                              <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                spacing={2}
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                justifyContent="space-between"
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {task.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" paragraph>
                                    {task.description}
                                  </Typography>
                                  
                                  <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <StatusChip
                                      label={task.overallStatus || 'pending'}
                                      status={task.overallStatus}
                                      icon={getStatusIcon(task.overallStatus)}
                                    />
                                    <PriorityChip
                                      label={task.priority || 'medium'}
                                      priority={task.priority}
                                    />
                                    {isOverdue(task) && (
                                      <Chip
                                        label="OVERDUE"
                                        color="error"
                                        size="small"
                                        icon={<FiAlertTriangle />}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                                
  
                              </Stack>
                              
                              {/* Task Details Section */}
                              {selectedTask?._id === task._id && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                                  <TaskDetailsContent task={task} />
                                </Box>
                              )}
                            </CardContent>
                          </TaskCard>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <EditTaskDialog />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog />

        {/* Task Actions Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleEditTask(selectedTaskForMenu)}>
            <ListItemIcon>
              <FiEdit size={18} />
            </ListItemIcon>
            <ListItemText>Edit Task</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => handleDeleteClick(selectedTaskForMenu)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <FiTrash2 size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText>Delete Task</ListItemText>
          </MenuItem>
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default TaskDetails;