import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Tooltip,
  Switch,
  FormGroup,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  Fade,
  Badge,
  Modal,
  InputAdornment,
  OutlinedInput,
  Pagination,

} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  PauseCircle as PauseCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon



} from '@mui/icons-material';
import FilterListIcon from "@mui/icons-material/FilterList";
import PlaceIcon from "@mui/icons-material/Place";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import { styled } from '@mui/material/styles';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiXCircle, FiUsers, FiTrendingUp, FiInfo } from 'react-icons/fi';

// Enhanced Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease'
  }
}));

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.spacing(2),
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  overflowX: 'auto',
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 600,
  backgroundColor: 
    status === 'Active' ? `${theme.palette.success.main}20` :
    status === 'On Hold' ? `${theme.palette.warning.main}20` :
    `${theme.palette.grey[300]}20`,
  color: 
    status === 'Active' ? theme.palette.success.dark :
    status === 'On Hold' ? theme.palette.warning.dark :
    theme.palette.grey[700],
  border: `1px solid ${
    status === 'Active' ? `${theme.palette.success.main}40` :
    status === 'On Hold' ? `${theme.palette.warning.main}40` :
    `${theme.palette.grey[300]}40`
  }`
}));

const ProgressBar = styled(LinearProgress)(({ value, theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: 
      value >= 100 ? theme.palette.success.main :
      value >= 70 ? theme.palette.primary.main :
      value >= 40 ? theme.palette.warning.main :
      theme.palette.info.main,
    borderRadius: 4
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

// Task Details Modal Component
const TaskDetailsModal = ({ task, open, onClose, projectManagers = [] }) => {
  const getAssigneeDetails = (assigneeName) => {
    return projectManagers.find(pm => pm.name === assigneeName);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const assigneeDetails = getAssigneeDetails(task.assignee);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Task Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">Task Name</Typography>
            <Typography variant="body1" fontWeight="bold">{task.name}</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Status</Typography>
              <Chip
                label={task.completed ? 'Completed' : 'Pending'}
                color={task.completed ? 'success' : 'default'}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Priority</Typography>
              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>

          {task.dueDate && (
            <Box>
              <Typography variant="body2" color="textSecondary">Due Date</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1">
                  {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
                {isOverdue(task.dueDate) && !task.completed && (
                  <Chip
                    label="Overdue"
                    color="error"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          )}

          {task.assignee && (
            <Box>
              <Typography variant="body2" color="textSecondary">Assigned To</Typography>
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                {assigneeDetails ? (
                  <>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        fontSize: '0.8rem',
                        bgcolor: 'primary.main'
                      }}
                    >
                      {assigneeDetails.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {assigneeDetails.name}
                      </Typography>
                      {assigneeDetails.email && (
                        <Typography variant="caption" color="textSecondary">
                          {assigneeDetails.email}
                        </Typography>
                      )}
                      {assigneeDetails.id && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {/* ID: {assigneeDetails.id} */}
                        </Typography>
                      )}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1">{task.assignee}</Typography>
                )}
              </Box>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="textSecondary">Created</Typography>
            <Typography variant="body1">
              {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>

          {task.completed && task.completedAt && (
            <Box>
              <Typography variant="body2" color="textSecondary">Completed</Typography>
              <Typography variant="body1">
                {new Date(task.completedAt).toLocaleDateString()} at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Service Progress Card Component with Backend Integration
const ServiceProgressCard = ({ service, clientId, clientProjectManagers = [], onTaskUpdate, api }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    name: '',
    dueDate: '',
    assignee: '',
    priority: 'Medium'
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState({ open: false, task: null });
  const [loading, setLoading] = useState(true);
  const [localStorageTasks, setLocalStorageTasks] = useState([]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/client/${clientId}/service/${service}`);
      console.log(`Tasks response for ${service}:`, response.data);

      if (response.data.success) {
        setTasks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to localStorage if API fails
      const savedTasks = localStorage.getItem(`client_${clientId}_service_${service}_tasks`);
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          setTasks(parsedTasks.map(task => ({
            ...task,
            dueDate: task.dueDate || null,
            assignee: task.assignee || '',
            priority: task.priority || 'Medium'
          })));
        } catch (e) {
          console.error('Error parsing localStorage tasks:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
    
    // Also load localStorage tasks for fallback
    const savedTasks = localStorage.getItem(`client_${clientId}_service_${service}_tasks`);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setLocalStorageTasks(parsedTasks);
      } catch (e) {
        console.error('Error parsing localStorage tasks:', e);
      }
    }
  }, [clientId, service]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddTask = async () => {
    if (newTask.name.trim()) {
      try {
        const response = await api.post(`/client/${clientId}/service/${service}`, {
          name: newTask.name.trim(),
          dueDate: newTask.dueDate || null,
          assignee: newTask.assignee,
          priority: newTask.priority
        });

        if (response.data.success) {
          setTasks([...tasks, response.data.data]);
          setNewTask({
            name: '',
            dueDate: '',
            assignee: '',
            priority: 'Medium'
          });
          setShowAddTask(false);
          if (onTaskUpdate) {
            onTaskUpdate(service, [...tasks, response.data.data]);
          }
        }
      } catch (error) {
        console.error('Error adding task:', error);
        // Fallback to localStorage
        const newTaskObj = {
          id: Date.now(),
          name: newTask.name.trim(),
          dueDate: newTask.dueDate || null,
          assignee: newTask.assignee,
          priority: newTask.priority,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null
        };
        const updatedTasks = [...tasks, newTaskObj];
        setTasks(updatedTasks);
        localStorage.setItem(`client_${clientId}_service_${service}_tasks`, JSON.stringify(updatedTasks));
        setNewTask({
          name: '',
          dueDate: '',
          assignee: '',
          priority: 'Medium'
        });
        setShowAddTask(false);
        if (onTaskUpdate) {
          onTaskUpdate(service, updatedTasks);
        }
      }
    }
  };

  const handleEditTask = async () => {
    if (editTask && editTask.name.trim()) {
      try {
        if (editTask._id) {
          // Update in backend
          const response = await api.put(`/${editTask._id}`, {
            name: editTask.name.trim(),
            dueDate: editTask.dueDate || null,
            assignee: editTask.assignee,
            priority: editTask.priority
          });

          if (response.data.success) {
            const updatedTasks = tasks.map(task => 
              task._id === editTask._id ? response.data.data : task
            );
            setTasks(updatedTasks);
            setEditTask(null);
            if (onTaskUpdate) {
              onTaskUpdate(service, updatedTasks);
            }
          }
        } else {
          // Update locally (for localStorage tasks)
          const updatedTasks = tasks.map(task => 
            task.id === editTask.id ? {
              ...editTask,
              name: editTask.name.trim()
            } : task
          );
          setTasks(updatedTasks);
          localStorage.setItem(`client_${clientId}_service_${service}_tasks`, JSON.stringify(updatedTasks));
          setEditTask(null);
          if (onTaskUpdate) {
            onTaskUpdate(service, updatedTasks);
          }
        }
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      // First update locally for immediate feedback
      const updatedTasks = tasks.map(t => {
        if (t._id === task._id || t.id === task.id) {
          return {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date().toISOString() : null
          };
        }
        return t;
      });
      setTasks(updatedTasks);

      // Then update in backend
      if (task._id) {
        await api.patch(`/${task._id}/toggle`);
      } else {
        // Update localStorage
        localStorage.setItem(`client_${clientId}_service_${service}_tasks`, JSON.stringify(updatedTasks));
      }
      
      if (onTaskUpdate) {
        onTaskUpdate(service, updatedTasks);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert on error
      fetchTasks();
    }
  };

  const deleteTask = async (task) => {
    try {
      // First update locally for immediate feedback
      const updatedTasks = tasks.filter(t => t._id !== task._id && t.id !== task.id);
      setTasks(updatedTasks);

      // Then delete from backend
      if (task._id) {
        await api.delete(`/${task._id}`);
      } else {
        // Delete from localStorage
        localStorage.setItem(`client_${clientId}_service_${service}_tasks`, JSON.stringify(updatedTasks));
      }
      
      if (onTaskUpdate) {
        onTaskUpdate(service, updatedTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert on error
      fetchTasks();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !editTask) {
      handleAddTask();
    } else if (e.key === 'Enter' && editTask) {
      handleEditTask();
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  // Check if task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (loading) {
    return (
      <Card sx={{ mb: 2, border: `1px solid`, borderColor: 'divider' }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={3}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading tasks for {service}...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2, border: `1px solid`, borderColor: 'divider', transition: 'all 0.3s ease' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {service}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {completedTasks} / {totalTasks} tasks completed
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${Math.round(progressPercentage)}%`} 
              color={
                progressPercentage >= 100 ? 'success' :
                progressPercentage >= 70 ? 'primary' :
                progressPercentage >= 40 ? 'warning' : 'default'
              }
              variant="outlined"
              size="small"
            />
            <Tooltip title="Add Task">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => setShowAddTask(!showAddTask)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Tasks">
              <IconButton 
                size="small" 
                onClick={fetchTasks}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Bar */}
        <ProgressBar 
          variant="determinate" 
          value={progressPercentage} 
          sx={{ mb: 2 }}
        />

        {/* Add/Edit Task Form */}
        {(showAddTask || editTask) && (
          <Card variant="outlined" sx={{ mb: 2, p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {editTask ? 'Edit Task' : 'Add New Task'}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                size="small"
                placeholder="Enter task name..."
                value={editTask ? editTask.name : newTask.name}
                onChange={(e) => {
                  if (editTask) {
                    setEditTask({ ...editTask, name: e.target.value });
                  } else {
                    setNewTask({ ...newTask, name: e.target.value });
                  }
                }}
                onKeyPress={handleKeyPress}
                autoFocus
                required
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    size="small"
                    label="Due Date"
                    type="date"
                    value={editTask ? (editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '') : newTask.dueDate}
                    onChange={(e) => {
                      if (editTask) {
                        setEditTask({ ...editTask, dueDate: e.target.value });
                      } else {
                        setNewTask({ ...newTask, dueDate: e.target.value });
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Assignee</InputLabel>
                    <Select
                      value={editTask ? editTask.assignee : newTask.assignee}
                      label="Assignee"
                      onChange={(e) => {
                        if (editTask) {
                          setEditTask({ ...editTask, assignee: e.target.value });
                        } else {
                          setNewTask({ ...newTask, assignee: e.target.value });
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {clientProjectManagers.map((pm) => (
                        <MenuItem key={pm.id || pm._id || pm.name} value={pm.name}>
                          <Box display="flex" alignItems="center" width="100%">
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1,
                                fontSize: '0.7rem',
                                bgcolor: 'primary.main'
                              }}
                            >
                              {pm.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" noWrap>
                                {pm.name}
                                {pm.id && pm.id.startsWith('temp-') && (
                                  <Typography component="span" variant="caption" color="warning" sx={{ ml: 0.5 }}>
                                    (Not in system)
                                  </Typography>
                                )}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block" noWrap>
                                {/* ID: {pm.id || pm._id || 'N/A'} */}
                              </Typography>
                              {pm.email && (
                                <Typography variant="caption" color="textSecondary" display="block" noWrap>
                                  {pm.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={editTask ? editTask.priority : newTask.priority}
                      label="Priority"
                      onChange={(e) => {
                        if (editTask) {
                          setEditTask({ ...editTask, priority: e.target.value });
                        } else {
                          setNewTask({ ...newTask, priority: e.target.value });
                        }
                      }}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => {
                    if (editTask) {
                      setEditTask(null);
                    } else {
                      setShowAddTask(false);
                      setNewTask({
                        name: '',
                        dueDate: '',
                        assignee: '',
                        priority: 'Medium'
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={editTask ? handleEditTask : handleAddTask}
                  disabled={editTask ? !editTask.name.trim() : !newTask.name.trim()}
                  startIcon={editTask ? <SaveIcon /> : <AddIcon />}
                >
                  {editTask ? 'Save Changes' : 'Add Task'}
                </Button>
              </Box>
            </Box>
          </Card>
        )}

        {/* Tasks List */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Tasks ({totalTasks}):
          </Typography>
          {tasks.length > 0 ? (
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {tasks.map((task) => (
                <ListItem 
                  key={task._id || task.id} 
                  sx={{ 
                    px: 1,
                    py: 0.5,
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                  secondaryAction={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Tooltip title="View Details">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => setShowTaskDetails({ open: true, task })}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Task">
                        <IconButton 
                          edge="end" 
                          size="small" 
                          color="primary"
                          onClick={() => setEditTask(task)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Task">
                        <IconButton 
                          edge="end" 
                          size="small" 
                          color="error"
                          onClick={() => deleteTask(task)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task)}
                      size="small"
                      color="primary"
                    />
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.name}
                      </Typography>
                      
                      {task.priority && task.priority !== 'Medium' && (
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                          sx={{ height: 20 }}
                        />
                      )}
                      
                      {task.assignee && (
                        <Tooltip title={`Assigned to: ${task.assignee}`}>
                          <Chip
                            label={task.assignee}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        </Tooltip>
                      )}
                      
                      {task.dueDate && (
                        <Tooltip title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}>
                          <Chip
                            label={new Date(task.dueDate).toLocaleDateString()}
                            size="small"
                            color={isOverdue(task.dueDate) && !task.completed ? 'error' : 'default'}
                            variant="outlined"
                            sx={{ height: 20, fontSize: 11, borderRadius: 1, fontWeight: 600 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary">
                      Added: {new Date(task.createdAt).toLocaleDateString()}
                      {task.completed && task.completedAt && (
                        <> • Completed: {new Date(task.completedAt).toLocaleDateString()}</>
                      )}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 3, 
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'grey.50'
              }}
            >
              <Typography variant="body2" color="textSecondary">
                No tasks added yet. Click the + icon to add tasks.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Task Details Modal */}
      {showTaskDetails.open && (
        <TaskDetailsModal
          task={showTaskDetails.task}
          open={showTaskDetails.open}
          onClose={() => setShowTaskDetails({ open: false, task: null })}
          projectManagers={clientProjectManagers}
        />
      )}
    </Card>
  );
};

// Services Modal Component
const ServicesModal = ({ open, onClose, services, onAddService, onDeleteService }) => {
  const [newService, setNewService] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newService.trim()) {
      onAddService(newService.trim());
      setNewService('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WorkIcon sx={{ mr: 1 }} />
          Manage Services
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Add Service Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, mt: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="New Service Name"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Enter service name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Add Service
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Services List */}
        <Typography variant="h6" gutterBottom>
          All Services ({services.length})
        </Typography>
        
        {services.length > 0 ? (
          <List>
            {services.map((service) => (
              <ListItem
                key={service._id}
                sx={{
                  border: 1,
                  borderColor: 'grey.200',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon>
                  <WorkIcon color="primary" />
                </ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {service.servicename}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created: {new Date(service.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <ListItemSecondaryAction>
                  <Tooltip title="Delete Service">
                    <ActionButton
                      edge="end"
                      color="error"
                      onClick={() => onDeleteService(service._id, service.servicename)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </ActionButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={3}>
            <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Services Found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Add your first service using the form above
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Add Client Modal Component
const AddClientModal = ({ 
  open, 
  onClose, 
  onAddClient, 
  services, 
  projectManagers,
  loading = false 
}) => {
  const [newClient, setNewClient] = useState({
    client: '',
    company: '',
    city: '',
    projectManagers: [], // This will store manager IDs
    services: [],
    status: 'Active',
    progress: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    notes: ''
  });

  const [managerSearch, setManagerSearch] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newClient.client && newClient.company && newClient.city && newClient.projectManagers.length > 0) {
      // Get full manager objects for selected managers
      const selectedManagers = projectManagers.filter(pm => 
        newClient.projectManagers.includes(pm._id)
      );
      
      // Create client with full manager objects
      const clientWithManagers = {
        ...newClient,
        projectManagers: selectedManagers.map(pm => ({
          id: pm._id,
          name: pm.name,
          email: pm.email,
          role: pm.role
        }))
      };
      
      onAddClient(clientWithManagers);
      // Reset form
      setNewClient({
        client: '',
        company: '',
        city: '',
        projectManagers: [],
        services: [],
        status: 'Active',
        progress: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        notes: ''
      });
      setManagerSearch('');
    }
  };

  const filteredManagers = projectManagers.filter(manager =>
    manager.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
    manager.email?.toLowerCase().includes(managerSearch.toLowerCase()) ||
    manager.role?.toLowerCase().includes(managerSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr: 1 }} />
            Add New Client
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name *"
                value={newClient.client}
                onChange={(e) => setNewClient({...newClient, client: e.target.value})}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company *"
                value={newClient.company}
                onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City *"
                value={newClient.city}
                onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newClient.status}
                  label="Status *"
                  onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                  disabled={loading}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Project Managers Multi-Select */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Project Managers *</InputLabel>
                <Select
                  multiple
                  value={newClient.projectManagers}
                  onChange={(e) => setNewClient({...newClient, projectManagers: e.target.value})}
                  input={<OutlinedInput label="Project Managers *" />}
                  renderValue={(selected) => {
                    const selectedManagers = projectManagers.filter(pm => 
                      selected.includes(pm._id)
                    );
                    return selectedManagers.map(pm => pm.name).join(', ');
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
                  disabled={loading}
                >
                  {/* Search Bar inside Dropdown */}
                  <MenuItem disabled>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search project managers..."
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </MenuItem>
                  
                  {filteredManagers.length > 0 ? (
                    filteredManagers.map((manager) => (
                      <MenuItem key={manager._id} value={manager._id}>
                        <Checkbox checked={newClient.projectManagers.includes(manager._id)} />
                        <Box display="flex" alignItems="center" sx={{ ml: 1, width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              fontSize: '0.8rem',
                              bgcolor: 'primary.main'
                            }}
                          >
                            {manager.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap fontWeight="medium">
                              {manager.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap display="block">
                              ID: {manager._id}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap display="block">
                              {manager.role} • {manager.email}
                            </Typography>
                          </Box>
                        </Box>



                        {/* ID: {manager._id} */}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="textSecondary" align="center">
                        No project managers found
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Select one or more project managers *
              </Typography>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newClient.description}
                onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                placeholder="Enter client description..."
                helperText="Brief description about the client and project"
                disabled={loading}
              />
            </Grid>

            {/* Services */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={newClient.services}
                  onChange={(e) => setNewClient({...newClient, services: e.target.value})}
                  input={<OutlinedInput label="Services" />}
                  renderValue={(selected) => selected.join(', ')}
                  disabled={loading || services.length === 0}
                >
                  {services.map((service) => (
                    <MenuItem key={service._id} value={service.servicename}>
                      <Checkbox checked={newClient.services.includes(service.servicename)} />
                      <ListItemText primary={service.servicename} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {services.length === 0 && (
                <Typography variant="caption" color="textSecondary">
                  No services available. Please add services first.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Progress"
                value={newClient.progress}
                onChange={(e) => setNewClient({...newClient, progress: e.target.value})}
                placeholder="28/40 (70%)"
                helperText="Format: completed/total (percentage)"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                placeholder="Additional notes..."
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          disabled={
            loading || 
            !newClient.client || 
            !newClient.company || 
            !newClient.city || 
            newClient.projectManagers.length === 0 ||
            services.length === 0
          }
        >
          {loading ? 'Adding Client...' : 
           services.length === 0 ? 'Add Services First' : 'Add Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ClientManagement = () => {
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', name: '' });
  const [editDialog, setEditDialog] = useState({ open: false, client: null });
  const [viewDialog, setViewDialog] = useState({ open: false, client: null });
  const [servicesModal, setServicesModal] = useState(false);
  const [addClientModal, setAddClientModal] = useState(false);
  const [taskCounts, setTaskCounts] = useState({}); 
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    status: '',
    projectManager: '',
    service: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: `${API_URL}/clientsservice`,
    timeout: 10000,
  });

  // Tasks API instance
  const tasksApi = axios.create({
    baseURL: `${API_URL}/clienttasks`,
    timeout: 10000,
  });

  // Users API instance
  const usersApi = axios.create({
    baseURL: `${API_URL}/users`,
    timeout: 10000,
  });

  // Add request interceptor to include auth token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const tasksInterceptor = tasksApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const usersRequestInterceptor = usersApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      tasksApi.interceptors.request.eject(tasksInterceptor);
      usersApi.interceptors.request.eject(usersRequestInterceptor);
    };
  }, []);

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}) // Reset to first page when filter changes
    }));
  };

  // Helper function to get full manager objects from names
  const getFullManagerObjects = (managerNames) => {
    if (!managerNames) return [];
    
    // Handle both array and string
    const names = Array.isArray(managerNames) ? managerNames : [managerNames];
    
    return names.map(name => {
      if (typeof name === 'object' && name !== null) {
        // If it's already an object with id, return it
        if (name.id || name._id) {
          return name;
        }
        // If it's an object without id, try to find in projectManagers
        const manager = projectManagers.find(pm => pm.name === name.name);
        return manager || { name: name.name, id: `temp-${Date.now()}`, email: name.email, role: name.role };
      }
      
      // If it's a string, find the matching manager
      if (typeof name === 'string') {
        const manager = projectManagers.find(pm => pm.name === name);
        return manager || { name, id: `temp-${Date.now()}` };
      }
      
      return { name: 'Unknown', id: 'unknown' };
    });
  };

  // Fetch all data from backend with error handling
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from backend...');
      
      // Fetch all data in parallel
      const [clientsRes, servicesRes, usersRes] = await Promise.all([
        api.get('/', { params: filters }),
        api.get('/services'),
        usersApi.get('/all-users').catch(err => {
          console.warn('Failed to fetch users:', err.message);
          return { data: [] };
        })
      ]);
      
      console.log('Clients Response:', clientsRes.data);
      console.log('Services Response:', servicesRes.data);
      console.log('Users Response:', usersRes.data);
      
      // Handle services response
      if (servicesRes.data?.success) {
        setServices(servicesRes.data.data || []);
      }
      
      // Handle users response
      if (usersRes.data) {
        setProjectManagers(usersRes.data);
        
        // Handle clients response
        if (clientsRes.data?.success) {
          const clientsData = clientsRes.data.data || [];
          console.log('Clients loaded:', clientsData.length);
          
          // Enhance clients data with full manager objects
          const enhancedClients = clientsData.map(client => {
            // IMPORTANT FIX: Backend se "projectManager" field me data aaraha hai
            const managerNames = client.projectManager || [];
            const fullManagerObjects = getFullManagerObjects(managerNames);
            
            // Add projectManagers field with full objects
            return {
              ...client,
              projectManagers: fullManagerObjects,
              // Keep original projectManager field for compatibility
              projectManager: managerNames
            };
          });
          
          console.log('Enhanced clients:', enhancedClients);
          setClients(enhancedClients);
          
          if (clientsRes.data.pagination) {
            setPagination(clientsRes.data.pagination);
          } else {
            setPagination({
              currentPage: filters.page,
              totalPages: Math.ceil(enhancedClients.length / filters.limit),
              totalItems: enhancedClients.length,
              itemsPerPage: filters.limit
            });
          }
        } else {
          console.warn('Clients response not successful:', clientsRes.data);
          setClients([]);
        }
      }
      
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Data fetch failed';
      setError(errorMessage);
      
      // Set empty arrays on error
      setClients([]);
      setServices([]);
      setProjectManagers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  // Fetch tasks for a client
  const fetchClientTasks = async (clientId) => {
    try {
      const response = await tasksApi.get(`/client/${clientId}`);
      console.log(`Tasks response for client ${clientId}:`, response.data);
      
      if (response.data?.success) {
        // Handle different response structures
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data.data?.tasks) {
          return response.data.data.tasks;
        }
        return [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching client tasks for ${clientId}:`, error);
      return [];
    }
  };

  // Calculate tasks for all clients
  const calculateTasksForAll = async () => {
    const counts = {};
    let totalPending = 0;
    
    for (const client of clients) {
      try {
        const tasks = await fetchClientTasks(client._id);
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        counts[client._id] = { total, completed, pending };
        totalPending += pending;
      } catch (error) {
        console.error(`Error calculating tasks for client ${client._id}:`, error);
        counts[client._id] = { total: 0, completed: 0, pending: 0 };
      }
    }
    
    console.log('Task counts calculated:', counts);
    setTaskCounts(counts);
    
    // Update tasks stats
    setTasksStats(prev => ({
      ...prev,
      pendingTasks: totalPending
    }));
  };

  // Calculate pending tasks from backend
  const calculatePendingTasks = async () => {
    let totalPending = 0;
    for (const client of clients) {
      const tasksData = await fetchClientTasks(client._id);
      const pending = tasksData.filter(t => !t.completed).length;
      totalPending += pending;
    }
    return totalPending;
  };

  // Calculate overdue tasks from backend
  const calculateOverdueTasks = async () => {
    let totalOverdue = 0;
    for (const client of clients) {
      const tasksData = await fetchClientTasks(client._id);
      const today = new Date();
      const overdue = tasksData.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < today;
      }).length;
      totalOverdue += overdue;
    }
    return totalOverdue;
  };

  // Update tasks statistics when clients change
  useEffect(() => {
    if (clients.length > 0) {
      calculateTasksForAll();
      
      // Calculate overdue tasks
      calculateOverdueTasks().then(overdue => {
        setTasksStats(prev => ({
          ...prev,
          overdueTasks: overdue
        }));
      });
    } else {
      setTaskCounts({});
      setTasksStats({
        pendingTasks: 0,
        overdueTasks: 0
      });
    }
  }, [clients]);

  // State for tasks statistics
  const [tasksStats, setTasksStats] = useState({
    pendingTasks: 0,
    overdueTasks: 0
  });

  // Add new service
  const handleAddService = async (serviceName) => {
    if (!serviceName.trim()) return;

    try {
      const response = await api.post('/services', { 
        servicename: serviceName.trim() 
      });
      
      if (response.data.success) {
        setSuccess('Service added successfully!');
        setError('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Service add failed');
      console.error('Add service error:', err);
    }
  };

  // Add new client
  const handleAddClient = async (clientData) => {
    try {
      setAddLoading(true);
      
      // Extract just manager names for backend storage (backend expects "projectManager" field)
      const backendClientData = {
        ...clientData,
        client: clientData.client,
        company: clientData.company,
        city: clientData.city,
        projectManager: clientData.projectManagers.map(pm => pm.name), // IMPORTANT: Backend expects "projectManager" field with names
        services: clientData.services,
        status: clientData.status,
        progress: clientData.progress,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        description: clientData.description,
        notes: clientData.notes
      };
      
      console.log('Sending to backend:', backendClientData);
      
      const response = await api.post('/', backendClientData);
      
      if (response.data.success) {
        // Store the full manager objects in the response
        const fullClientData = {
          ...response.data.data,
          projectManagers: clientData.projectManagers // Keep full objects
        };
        
        setSuccess('Client added successfully!');
        setError('');
        setAddClientModal(false);
        fetchData(); // Refresh to get the latest data
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Client add failed';
      setError(errorMessage);
      console.error('Add client error:', err);
    } finally {
      setAddLoading(false);
    }
  };

  // Update client
  const handleUpdateClient = async (clientId, updateData) => {
    try {
      const response = await api.put(`/${clientId}`, updateData);
      
      if (response.data.success) {
        setSuccess('Client updated successfully!');
        setEditDialog({ open: false, client: null });
        fetchData();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Client update failed';
      setError(errorMessage);
      console.error('Update client error:', err);
    }
  };

  // Delete confirmation dialog
  const handleDeleteClick = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleDeleteConfirm = async () => {
    const { type, id } = deleteDialog;
    
    try {
      if (type === 'client') {
        // First delete all tasks for this client
        try {
          const tasksResponse = await tasksApi.get(`/client/${id}`);
          if (tasksResponse.data.success && tasksResponse.data.data.tasks) {
            // Delete each task
            for (const task of tasksResponse.data.data.tasks) {
              await tasksApi.delete(`/${task._id}`);
            }
          }
        } catch (taskError) {
          console.warn('Error deleting client tasks:', taskError);
        }
        
        // Then delete the client
        const response = await api.delete(`/${id}`);
        if (response.data.success) {
          setSuccess('Client deleted successfully!');
          fetchData();
        }
      } else if (type === 'service') {
        const response = await api.delete(`/services/${id}`);
        if (response.data.success) {
          setSuccess('Service deleted successfully!');
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      console.error('Delete error:', err);
    }
    
    setDeleteDialog({ open: false, type: '', id: '', name: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: '', id: '', name: '' });
  };

  // Edit client dialog
  const handleEditClick = (client) => {
    setEditDialog({ 
      open: true, 
      client: {
        ...client,
        projectManagers: client.projectManagers || []
      }
    });
  };

  const handleEditSave = () => {
    const { client } = editDialog;
    // Extract just manager names for backend (backend expects "projectManager" field)
    const updateData = {
      client: client.client,
      company: client.company,
      city: client.city,
      projectManager: client.projectManagers.map(pm => pm.name), // IMPORTANT: Backend expects "projectManager"
      services: client.services,
      status: client.status,
      progress: client.progress,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      description: client.description || '',
      notes: client.notes || ''
    };
    
    console.log('Updating client:', updateData);
    handleUpdateClient(client._id, updateData);
  };

  // View client details
  const handleViewClick = (client) => {
    setViewDialog({ open: true, client });
  };

  // Get project managers details - FIXED VERSION
  const getProjectManagersDetails = (client) => {
    if (!client) return [];
    
    // First check if we have projectManagers field (with full objects)
    if (client.projectManagers && Array.isArray(client.projectManagers) && client.projectManagers.length > 0) {
      return client.projectManagers;
    }
    
    // Fallback to projectManager field (names only)
    const managerNames = client.projectManager || [];
    
    // Convert names to full objects
    return managerNames.map(name => {
      const manager = projectManagers.find(pm => pm.name === name);
      return manager || { name, id: `temp-${Date.now()}` };
    });
  };

  // Helper function to render manager information with ID
  const renderManagerInfo = (manager) => {
    return (
      <Box sx={{ 
        p: 1.5, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 1, 
        mb: 1,
        backgroundColor: 'grey.50'
      }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 2,
              fontSize: '0.8rem',
              bgcolor: 'primary.main'
            }}
          >
            {manager.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {manager.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {/* ID: {manager.id || manager._id || 'N/A'} */}
            </Typography>
          </Box>
        </Box>
        <Grid container spacing={1}>
          {manager.email && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">Email:</Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>
                {manager.email}
              </Typography>
            </Grid>
          )}
          {manager.role && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">Role:</Typography>
              <Typography variant="caption" sx={{ ml: 1 }}>
                {manager.role}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  // Handle task updates for services
  const handleTaskUpdate = (serviceName, tasks) => {
    console.log(`Tasks updated for ${serviceName}:`, tasks);
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    console.log(`Progress for ${serviceName}: ${completedTasks}/${totalTasks} (${progress}%)`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading client data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <DashboardContainer sx={{ px: 2, pb: 5 }}>
      {/* Header */}
      <HeaderCard>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Client Management Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage clients and services through backend
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<WorkIcon />}
                onClick={() => setServicesModal(true)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Manage Services ({services.length})
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setAddClientModal(true)}
                variant="contained"
                sx={{ borderRadius: 2 }}
                disabled={services.length === 0}
              >
                Add New Client
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </HeaderCard>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard color="primary">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ 
                  bgcolor: `${theme.palette.primary.main}20`, 
                  color: theme.palette.primary.main 
                }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Clients
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {pagination.totalItems || clients.length}
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
                    Active Clients
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {clients.filter(client => client.status === 'Active').length}
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
                    Pending Tasks
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {tasksStats.pendingTasks}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={6} md={3}>
          <StatCard color="error">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ 
                  bgcolor: `${theme.palette.error.main}20`, 
                  color: theme.palette.error.main 
                }}>
                  <FiAlertCircle />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {tasksStats.overdueTasks}
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
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Services
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {services.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Clients Table */}
      <Grid container width="100%" maxWidth="100%">
   
  <Card
    sx={{
      width: "100%",
      borderRadius: 4,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
      }
    }}
  >

    {/* Enhanced Header with Gradient */}
    <CardHeader
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
            }}>
              <PeopleIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="white">
                Client Portfolio
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                Total {pagination.totalItems || clients.length} clients • {clients.filter(c => c.status === 'Active').length} active
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            {/* Quick Stats */}
            <Box sx={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: '#4ade80' }} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                {clients.filter(c => c.status === 'Active').length} Active
              </Typography>
            </Box>
            
            <IconButton 
              onClick={fetchData}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'rotate(45deg)'
                },
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      }
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 2.5
      }}
    />
    
    {/* Enhanced Filter Bar */}
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search clients, companies..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                  borderColor: '#667eea'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent'
                }
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={1}>
                  <FilterListIcon fontSize="small" />
                  <Typography>All Status</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Active">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                  Active
                </Box>
              </MenuItem>
              <MenuItem value="On Hold">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  On Hold
                </Box>
              </MenuItem>
              <MenuItem value="Inactive">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  Inactive
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} md={2.5}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.projectManager}
              onChange={(e) => handleFilterChange('projectManager', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent'
                }
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" />
                  <Typography>All Managers</Typography>
                </Box>
              </MenuItem>
              {projectManagers.map((manager) => (
                <MenuItem key={manager._id || manager.id} value={manager.name}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: '#667eea' }}>
                      {manager.name.charAt(0)}
                    </Avatar>
                    {manager.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} md={2.5}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent'
                }
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={1}>
                  <WorkIcon fontSize="small" />
                  <Typography>All Services</Typography>
                </Box>
              </MenuItem>
              {services.map((service) => (
                <MenuItem key={service._id} value={service.servicename}>
                  <Chip 
                    size="small" 
                    label={service.servicename} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                      color: '#667eea',
                      border: '1px solid',
                      borderColor: '#667eea40'
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setServicesModal(true)}
            startIcon={<AddIcon />}
            sx={{
              height: 40,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            New Client
          </Button>
        </Grid>
      </Grid>
    </Box>
    
    <CardContent sx={{ p: 0 }}>
      {clients.length > 0 ? (
        <>
          {/* Enhanced Table Container */}
          <Box sx={{ 
            position: 'relative',
            overflow: 'hidden'
          }}>
            <StyledTableContainer sx={{ 
              maxHeight: 600,
              '&::-webkit-scrollbar': {
                width: 8,
                height: 8
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f5f9',
                borderRadius: 4
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e1',
                borderRadius: 4,
                '&:hover': {
                  background: '#94a3b8'
                }
              }
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    '& th': {
                      fontWeight: 'bold',
                      color: '#1e293b',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid',
                      borderColor: '#e2e8f0',
                      py: 2
                    }
                  }}>
                    <TableCell>Client</TableCell>
                    <TableCell>Company</TableCell>
                    {/* <TableCell>Location</TableCell>
                    <TableCell>Managers</TableCell> */}
                    <TableCell>Services</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Tasks</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client, index) => {
                    const stats = taskCounts[client._id] || { total: 0, completed: 0, pending: 0 };
                    const pending = stats.pending || 0;
                    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                    
                    return (
                      <TableRow 
                        key={client._id}
                        hover
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%)',
                            transform: 'translateX(4px)'
                          },
                          '&:nth-of-type(even)': {
                            background: '#fafafa'
                          }
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: '#667eea',
                                fontSize: 14,
                                fontWeight: 'bold'
                              }}
                            >
                              {client.client?.charAt(0) || 'C'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {client.client || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {client.clientId || client._id?.slice(-6)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {client.company || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {client.email || 'No email'}
                            </Typography>
                          </Box>
                        </TableCell>
                     
                        
                      
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.5} maxWidth={200}>
                            {Array.isArray(client.services) && client.services.map((service, idx) => (
                              <Chip 
                                key={idx}
                                size="small"
                                label={service}
                                sx={{
                                  background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                                  color: '#667eea',
                                  border: '1px solid',
                                  borderColor: '#667eea30',
                                  fontWeight: '500',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 20,
                            background: client.status === 'Active' 
                              ? 'linear-gradient(135deg, #10b98120 0%, #05966920 100%)'
                              : client.status === 'On Hold'
                              ? 'linear-gradient(135deg, #f59e0b20 0%, #d9770620 100%)'
                              : 'linear-gradient(135deg, #ef444420 0%, #dc262620 100%)',
                            border: '1px solid',
                            borderColor: client.status === 'Active'
                              ? '#10b98140'
                              : client.status === 'On Hold'
                              ? '#f59e0b40'
                              : '#ef444440'
                          }}>
                            <Box sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: client.status === 'Active'
                                ? '#10b981'
                                : client.status === 'On Hold'
                                ? '#f59e0b'
                                : '#ef4444'
                            }} />
                            <Typography variant="caption" fontWeight="bold" sx={{
                              color: client.status === 'Active'
                                ? '#059669'
                                : client.status === 'On Hold'
                                ? '#d97706'
                                : '#dc2626'
                            }}>
                              {client.status || 'Unknown'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ minWidth: 120 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" fontWeight="medium">
                                {progress}%
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {stats.completed}/{stats.total}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e2e8f0',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: progress > 70 
                                    ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                    : progress > 30
                                    ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                                    : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                                }
                              }}
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              icon={<TaskAltIcon />}
                              label={pending}
                              size="small"
                              sx={{
                                background: pending > 0 
                                  ? 'linear-gradient(135deg, #f59e0b20 0%, #d9770620 100%)'
                                  : 'linear-gradient(135deg, #10b98120 0%, #05966920 100%)',
                                color: pending > 0 ? '#d97706' : '#059669',
                                fontWeight: 'bold',
                                border: '1px solid',
                                borderColor: pending > 0 ? '#f59e0b40' : '#10b98140'
                              }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              pending
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewClick(client)}
                              sx={{
                                background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                                color: '#667eea',
                                '&:hover': {
                                  background: '#667eea',
                                  color: 'white',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => handleEditClick(client)}
                              sx={{
                                background: 'linear-gradient(135deg, #10b98110 0%, #05966910 100%)',
                                color: '#10b981',
                                '&:hover': {
                                  background: '#10b981',
                                  color: 'white',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {/* <IconButton 
                              size="small"
                              onClick={() => handleDeleteClick('client', client._id, client.client)}
                              sx={{
                                background: 'linear-gradient(135deg, #ef444410 0%, #dc262610 100%)',
                                color: '#ef4444',
                                '&:hover': {
                                  background: '#ef4444',
                                  color: 'white',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton> */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </StyledTableContainer>
            
            {/* Enhanced Pagination */}
            <Box sx={{ 
              py: 2, 
              px: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
              borderTop: '1px solid',
              borderColor: '#e2e8f0'
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ width: 100 }}>
                  <Select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={10}>10 per page</MenuItem>
                    <MenuItem value={25}>25 per page</MenuItem>
                    <MenuItem value={50}>50 per page</MenuItem>
                    <MenuItem value={100}>100 per page</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" color="#64748b">
                  Showing <strong>{((filters.page - 1) * filters.limit) + 1}-{Math.min(filters.page * filters.limit, pagination.totalItems)}</strong> of <strong>{pagination.totalItems}</strong> clients
                </Typography>
              </Box>
              
              <Pagination
                count={pagination.totalPages}
                page={filters.page}
                onChange={(event, value) => handleFilterChange('page', value)}
                shape="rounded"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    '&:hover': {
                      background: '#667eea20'
                    }
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </>
      ) : (
        <Box textAlign="center" py={8}>
          <Box sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <PeopleIcon sx={{ fontSize: 48, color: '#94a3b8' }} />
          </Box>
          <Typography variant="h6" color="#64748b" fontWeight="bold" gutterBottom>
            No Clients Found
          </Typography>
          <Typography variant="body2" color="#94a3b8" sx={{ maxWidth: 400, mx: 'auto' }} gutterBottom>
            {services.length === 0 
              ? 'Add services first to create clients and start managing your portfolio' 
              : 'Add your first client to start building your business relationships'
            }
          </Typography>
          {services.length === 0 ? (
            <Button 
              variant="contained" 
              startIcon={<WorkIcon />}
              onClick={() => setServicesModal(true)}
              sx={{ 
                mt: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Services First
            </Button>
          ) : (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setServicesModal(true)}
              sx={{ 
                mt: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create First Client
            </Button>
          )}
        </Box>
      )}
    </CardContent>
  </Card>

</Grid>
      {/* Add Client Modal */}
      <AddClientModal
        open={addClientModal}
        onClose={() => setAddClientModal(false)}
        onAddClient={handleAddClient}
        services={services}
        projectManagers={projectManagers}
        loading={addLoading}
      />

      {/* Services Management Modal */}
      <ServicesModal
        open={servicesModal}
        onClose={() => setServicesModal(false)}
        services={services}
        onAddService={handleAddService}
        onDeleteService={(id, name) => handleDeleteClick('service', id, name)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete {deleteDialog.type === 'client' ? 'Client' : 'Service'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteDialog.type} "{deleteDialog.name}"?
            {deleteDialog.type === 'client' && ' This action will also delete all associated tasks.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Client Dialog - FIXED VERSION */}
      <Dialog 
        open={viewDialog.open} 
        onClose={() => setViewDialog({ open: false, client: null })}
        maxWidth="md"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight="bold">
              Client Details & Task Management
            </Typography>
            <IconButton onClick={() => setViewDialog({ open: false, client: null })}>
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.client && (
            <Stack spacing={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon />
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Client Name</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.client}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Company</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.company}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">City</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.city}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <StatusChip label={viewDialog.client.status} status={viewDialog.client.status} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">Progress</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.progress}</Typography>
                    </Box>
                    {viewDialog.client.email && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Email</Typography>
                        <Typography variant="body1" fontWeight={600}>{viewDialog.client.email}</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>



              {/* Project Managers with IDs - FIXED */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  Project Managers (with IDs)
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  These managers will appear in task assignment dropdowns
                </Typography>
                <Box>
                  {(() => {
                    const managers = getProjectManagersDetails(viewDialog.client);
                    return managers.length > 0 ? (
                      managers.map((manager, idx) => (
                        <React.Fragment key={idx}>
                          {renderManagerInfo(manager)}
                        </React.Fragment>
                      ))
                    ) : (
                      <Box sx={{ 
                        p: 2, 
                        border: '1px dashed', 
                        borderColor: 'divider', 
                        borderRadius: 1,
                        textAlign: 'center',
                        backgroundColor: 'grey.50'
                      }}>
                        <Typography variant="body2" color="textSecondary">
                          No project managers assigned
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              </Box>

              {/* Services Progress Section */}
              {viewDialog.client.services && viewDialog.client.services.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    Services & Task Management
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add tasks with due dates and assign them to project managers
                  </Typography>
                  
                  {viewDialog.client.services.map((service, index) => {
                    const clientProjectManagers = getProjectManagersDetails(viewDialog.client);
                    return (
                      <ServiceProgressCard
                        key={index}
                        service={service}
                        clientId={viewDialog.client._id}
                        clientProjectManagers={clientProjectManagers}
                        onTaskUpdate={handleTaskUpdate}
                        api={tasksApi}
                      />
                    );
                  })}
                </Box>
              )}

              {/* Description */}
              {viewDialog.client.description && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiInfo />
                    Description
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body1">
                      {viewDialog.client.description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Additional Information */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon />
                  Additional Information
                </Typography>
                <Grid container spacing={2}>
                  {viewDialog.client.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.phone}</Typography>
                    </Grid>
                  )}
                  {viewDialog.client.address && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Address</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.address}</Typography>
                    </Grid>
                  )}
                  {viewDialog.client.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Notes</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, client: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, client: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Client
        </DialogTitle>
        <DialogContent>
          {editDialog.client && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Name *"
                  value={editDialog.client.client}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, client: e.target.value }
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company *"
                  value={editDialog.client.company}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, company: e.target.value }
                  })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={editDialog.client.city}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, city: e.target.value }
                  })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editDialog.client.status}
                    label="Status"
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      client: { ...editDialog.client, status: e.target.value }
                    })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Project Managers */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Project Managers *</InputLabel>
                  <Select
                    multiple
                    value={editDialog.client.projectManagers.map(pm => pm.name)}
                    onChange={(e) => {
                      const selectedNames = e.target.value;
                      const selectedManagers = selectedNames.map(name => {
                        const existingPM = projectManagers.find(pm => pm.name === name);
                        return existingPM || { name, id: `temp-${Date.now()}` };
                      });
                      
                      setEditDialog({
                        ...editDialog,
                        client: { ...editDialog.client, projectManagers: selectedManagers }
                      });
                    }}
                    input={<OutlinedInput label="Project Managers *" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {projectManagers.map((manager) => (
                      <MenuItem key={manager._id} value={manager.name}>
                        <Checkbox checked={editDialog.client.projectManagers.some(pm => pm.name === manager.name)} />
                        <Box display="flex" alignItems="center" sx={{ ml: 1, width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              fontSize: '0.8rem',
                              bgcolor: 'primary.main'
                            }}
                          >
                            {manager.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap fontWeight="medium">
                              {manager.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap display="block">
                              {/* ID: {manager._id} */}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap display="block">
                              {manager.role} • {manager.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={editDialog.client.description || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, description: e.target.value }
                  })}
                  placeholder="Enter client description..."
                  helperText="Brief description about the client and project"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Progress"
                  value={editDialog.client.progress}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, progress: e.target.value }
                  })}
                  placeholder="28/40 (70%)"
                  helperText="Format: completed/total (percentage)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editDialog.client.email || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, email: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editDialog.client.phone || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, phone: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editDialog.client.address || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, address: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Services</InputLabel>
                  <Select
                    multiple
                    value={editDialog.client.services || []}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      client: { ...editDialog.client, services: e.target.value }
                    })}
                    input={<OutlinedInput label="Services" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {services.map((service) => (
                      <MenuItem key={service._id} value={service.servicename}>
                        <Checkbox checked={(editDialog.client.services || []).includes(service.servicename)} />
                        <ListItemText primary={service.servicename} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={editDialog.client.notes || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, notes: e.target.value }
                  })}
                  placeholder="Additional notes..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, client: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!editDialog.client?.client || !editDialog.client?.company || !editDialog.client?.city || !editDialog.client?.projectManagers?.length}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default ClientManagement;