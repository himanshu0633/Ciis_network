import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { CircularProgress } from '@mui/material';
import {
  Box, Typography, Paper, Chip, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Tooltip, Tabs, Tab, Button, Dialog,
  DialogTitle, DialogContent, TextField, DialogActions, InputLabel,
  OutlinedInput, Checkbox, ListItemText, Snackbar, Card, CardContent,
  Grid, Stack, Avatar, LinearProgress, Fade, Badge, Divider,
  useTheme, useMediaQuery, InputAdornment, List, ListItem,
  ListItemIcon, ListItemSecondaryAction,
  Modal, Backdrop
} from '@mui/material';
import {
  FiRefreshCw, FiPlus, FiCalendar, FiUser, FiInfo, FiPaperclip, FiFolder, FiCheck, FiFileText,
  FiMic, FiMessageCircle, FiAlertCircle, FiCheckCircle,
  FiClock, FiXCircle, FiDownload, FiFilter, FiSearch,
  FiChevronRight, FiUsers, FiFlag, FiEdit2, FiTrash2,
  FiSave, FiX, FiUserPlus, FiUserMinus, FiLogOut, FiRepeat,
  FiMessageSquare, FiBell, FiActivity, FiEdit3, FiTrash
} from 'react-icons/fi';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Enhanced Styled Components with better responsiveness
const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  height: '100%',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.shape.borderRadius,
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  minWidth: 80,
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}15`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}30`,
  }),
  ...(status === 'in-progress' && {
    background: `${theme.palette.info.main}15`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}30`,
  }),
  ...(status === 'completed' && {
    background: `${theme.palette.success.main}15`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}30`,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}15`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}30`,
  }),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
    minWidth: 70,
    height: 24,
  }
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.6rem',
    height: 22,
  }
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}08`,
  },
  ...(status === 'completed' && {
    background: `${theme.palette.success.main}05`,
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'in-progress' && {
    background: `${theme.palette.info.main}05`,
    borderLeft: `4px solid ${theme.palette.info.main}`,
  }),
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}05`,
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}05`,
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
  [theme.breakpoints.down('md')]: {
    '&:hover': {
      transform: 'none',
    }
  }
}));

const MobileTaskCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${status === 'completed' ? theme.palette.success.main :
    status === 'in-progress' ? theme.palette.info.main :
      status === 'pending' ? theme.palette.warning.main :
        theme.palette.error.main
    }`,
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
  }
}));

const GroupChip = styled(Chip)(({ theme }) => ({
  background: `${theme.palette.secondary.main}15`,
  color: theme.palette.secondary.dark,
  border: `1px solid ${theme.palette.secondary.main}30`,
  fontWeight: 500,
}));

const RecurringBadge = styled(Chip)(({ theme }) => ({
  background: `${theme.palette.info.main}15`,
  color: theme.palette.info.dark,
  border: `1px solid ${theme.palette.info.main}30`,
  fontWeight: 500,
  fontSize: '0.6rem',
  height: 20,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
  }
}));

const statusColors = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  rejected: 'error'
};

const statusIcons = {
  pending: FiClock,
  'in-progress': FiAlertCircle,
  completed: FiCheckCircle,
  rejected: FiXCircle
};

const repeatPatternLabels = {
  none: 'No Repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
};

const MyTaskManagement = () => {
  const [tab, setTab] = useState(0);
  const [myTasksGrouped, setMyTasksGrouped] = useState({});
  const [assignedTasksGrouped, setAssignedTasksGrouped] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  // New states for enhanced features
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [remarksDialog, setRemarksDialog] = useState({ open: false, taskId: null, remarks: [] });
  const [newRemark, setNewRemark] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityDialog, setActivityDialog] = useState({ open: false, taskId: null });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskManagementDialog, setTaskManagementDialog] = useState({ open: false, task: null });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);

  // Status Change Dialog State
  const [statusChangeDialog, setStatusChangeDialog] = useState({
    open: false,
    taskId: null,
    newStatus: '',
    remarks: '',
    selectedUserId: null
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDateTime: null,
    assignedUsers: [],
    assignedGroups: [],
    whatsappNumber: '',
    priorityDays: '1',
    priority: 'medium',
    files: null,
    voiceNote: null,
    repeatPattern: 'none',
    repeatDays: []
  });
  const [newGroup, setNewGroup] = useState({
    name: '', description: '', members: []
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();

  // Check if user is regular user
  const isRegularUser = userRole === 'user';
  // Check if user is admin/manager/hr
  const isPrivilegedUser = ['admin', 'manager', 'hr', 'SuperAdmin'].includes(userRole);

  // Fixed: Proper user data fetching with error handling
  const fetchUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found in localStorage');
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Please log in to access task management',
          severity: 'error'
        });
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || !user.role || !user.id) {
        console.error('Invalid user data structure:', user);
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Invalid user data. Please log in again.',
          severity: 'error'
        });
        return;
      }

      setUserRole(user.role);
      setUserId(user.id);
      setAuthError(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthError(true);
      setSnackbar({
        open: true,
        message: 'Error loading user data. Please log in again.',
        severity: 'error'
      });
    }
  };

  // Enhanced Notifications Functions
  const fetchNotifications = async () => {
    if (authError || !userId) return;
    
    try {
      const res = await axios.get('/task/notifications/all');
      console.log('Notifications response:', res.data);
      setNotifications(res.data.notifications || []);
      setUnreadNotificationCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/task/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
      setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch('/task/notifications/read-all');
      fetchNotifications(); // Refresh notifications
      setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Enhanced Remarks Functions
  const fetchTaskRemarks = async (taskId) => {
    try {
      const res = await axios.get(`/task/${taskId}/remarks`);
      console.log('Remarks response:', res.data);
      setRemarksDialog({ 
        open: true, 
        taskId, 
        remarks: res.data.remarks || [] 
      });
    } catch (error) {
      console.error('Error fetching remarks:', error);
      setSnackbar({ open: true, message: 'Failed to load remarks', severity: 'error' });
    }
  };

  const addRemark = async (taskId) => {
    if (!newRemark.trim()) {
      setSnackbar({ open: true, message: 'Please enter a remark', severity: 'warning' });
      return;
    }
    
    try {
      await axios.post(`/task/${taskId}/remarks`, { text: newRemark });
      setNewRemark('');
      fetchTaskRemarks(taskId); // Refresh remarks
      setSnackbar({ open: true, message: 'Remark added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding remark:', error);
      setSnackbar({ open: true, message: 'Failed to add remark', severity: 'error' });
    }
  };

  // Enhanced Activity Logs Functions
  const fetchActivityLogs = async (taskId) => {
    try {
      const res = await axios.get(`/task/${taskId}/activity-logs`);
      console.log('Activity logs response:', res.data);
      setActivityLogs(res.data.logs || []);
      setActivityDialog({ open: true, taskId });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setSnackbar({ open: true, message: 'Failed to load activity logs', severity: 'error' });
    }
  };

  // Enhanced Task Update Function
  const updateTask = async (taskId, updateData) => {
    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'files' && key !== 'voiceNote' && updateData[key] !== undefined) {
          if (key === 'dueDateTime' && updateData[key]) {
            formData.append(key, new Date(updateData[key]).toISOString());
          } else if (key === 'assignedUsers' || key === 'assignedGroups') {
            formData.append(key, JSON.stringify(updateData[key]));
          } else {
            formData.append(key, updateData[key]);
          }
        }
      });

      // Handle file uploads
      if (updateData.files) {
        for (let i = 0; i < updateData.files.length; i++) {
          formData.append('files', updateData.files[i]);
        }
      }

      if (updateData.voiceNote) {
        formData.append('voiceNote', updateData.voiceNote);
      }

      console.log('Updating task:', taskId, updateData);

      const response = await axios.put(`/task/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Task update response:', response.data);

      setTaskManagementDialog({ open: false, task: null });
      setEditTaskData(null);
      fetchMyTasks();
      fetchAssignedTasks();
      fetchNotifications();
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error response:', error.response?.data);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.error || 'Failed to update task', 
        severity: 'error' 
      });
    }
  };

  // Enhanced Delete Task Function
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting task:', taskId);
      
      const response = await axios.delete(`/task/${taskId}`);
      console.log('Task deletion response:', response.data);

      setTaskManagementDialog({ open: false, task: null });
      fetchMyTasks();
      fetchAssignedTasks();
      fetchNotifications();
      setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting task:', error);
      console.error('Error response:', error.response?.data);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.error || 'Failed to delete task', 
        severity: 'error' 
      });
    }
  };

  // Enhanced Status Change with Individual User Status and User Selection Dialog
  const handleStatusChange = async (taskId, newStatus, remarks = '', selectedUserId = null) => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to update task status',
        severity: 'error'
      });
      return;
    }

    try {
      // Find the task to check permissions
      let task;
      try {
        const allMyTasks = Object.values(myTasksGrouped).flat();
        task = allMyTasks.find(t => t._id === taskId);
        
        if (!task) {
          const allAssignedTasks = Object.values(assignedTasksGrouped).flat();
          task = allAssignedTasks.find(t => t._id === taskId);
        }
      } catch (error) {
        console.error('Error finding task:', error);
      }

      if (!task) {
        setSnackbar({
          open: true,
          message: 'Task not found',
          severity: 'error'
        });
        return;
      }

      // Check permissions
      const isTaskCreator = task.createdBy === userId || task.createdBy?._id === userId;
      const isAssignedUser = task.assignedUsers?.some(assignedUserId => 
        assignedUserId === userId || assignedUserId._id === userId
      );
      const isPrivilegedUser = ['admin', 'manager', 'hr', 'SuperAdmin'].includes(userRole);

      let finalUserId = userId;
      let finalRemarks = remarks;

      // Permission Logic
      if (isTaskCreator || isPrivilegedUser) {
        // Task creator or admin can update anyone's status
        if (selectedUserId) {
          // Specific user selected for status update
          finalUserId = selectedUserId;
          finalRemarks = remarks || `Status changed to ${newStatus} by ${isTaskCreator ? 'task creator' : userRole}`;
        } else if (task.assignedUsers && task.assignedUsers.length > 1) {
          // Multiple users assigned - show dialog to select which user
          setStatusChangeDialog({
            open: true,
            taskId,
            newStatus,
            remarks: remarks || '',
            selectedUserId: null
          });
          return;
        } else {
          // Only one user assigned or no specific user selected
          finalRemarks = remarks || `Status changed to ${newStatus} by ${isTaskCreator ? 'task creator' : userRole}`;
        }
      } else if (isAssignedUser) {
        // Regular user can only update their own status
        finalRemarks = remarks || `Status changed to ${newStatus}`;
      } else {
        setSnackbar({
          open: true,
          message: 'You are not authorized to update status for this task',
          severity: 'error'
        });
        return;
      }

      // Make API call
      await axios.patch(`/task/${taskId}/status`, { 
        status: newStatus, 
        remarks: finalRemarks,
        userId: finalUserId // Send which user's status to update
      });

      // Refresh data
      await fetchMyTasks();
      await fetchAssignedTasks();
      await fetchNotifications();
      
      setSnackbar({ 
        open: true, 
        message: 'Status updated successfully', 
        severity: 'success' 
      });

    } catch (err) {
      console.error("❌ Error in handleStatusChange:", err.response || err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: err?.response?.data?.error || 'Failed to update status', 
          severity: 'error' 
        });
      }
    }
  };

  // User Selection Dialog for Status Change
  const renderStatusChangeDialog = () => (
    <Dialog 
      open={statusChangeDialog.open} 
      onClose={() => setStatusChangeDialog({ open: false, taskId: null, newStatus: '', remarks: '', selectedUserId: null })}
      maxWidth="sm"
      fullWidth
      fullScreen={isSmallMobile}
    >
      <DialogTitle>
        <Typography variant="h6">Select User to Update Status</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Multiple users are assigned to this task. Please select which user's status you want to update.
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel>Select User</InputLabel>
            <Select
              value={statusChangeDialog.selectedUserId || ''}
              onChange={(e) => setStatusChangeDialog(prev => ({ ...prev, selectedUserId: e.target.value }))}
              label="Select User"
            >
              {(() => {
                const task = Object.values(myTasksGrouped).flat().find(t => t._id === statusChangeDialog.taskId) ||
                            Object.values(assignedTasksGrouped).flat().find(t => t._id === statusChangeDialog.taskId);
                
                return task?.assignedUsers?.map(assignedUserId => {
                  const user = users.find(u => u._id === assignedUserId);
                  return user ? (
                    <MenuItem key={user._id} value={user._id}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ) : null;
                }) || [];
              })()}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={isSmallMobile ? 2 : 3}
            value={statusChangeDialog.remarks}
            onChange={(e) => setStatusChangeDialog(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Add remarks for this status change..."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ 
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? 1 : 0
      }}>
        <Button 
          onClick={() => setStatusChangeDialog({ open: false, taskId: null, newStatus: '', remarks: '', selectedUserId: null })}
          fullWidth={isSmallMobile}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => {
            if (statusChangeDialog.selectedUserId) {
              handleStatusChange(
                statusChangeDialog.taskId, 
                statusChangeDialog.newStatus, 
                statusChangeDialog.remarks,
                statusChangeDialog.selectedUserId
              );
              setStatusChangeDialog({ open: false, taskId: null, newStatus: '', remarks: '', selectedUserId: null });
            } else {
              setSnackbar({
                open: true,
                message: 'Please select a user',
                severity: 'warning'
              });
            }
          }}
          variant="contained"
          disabled={!statusChangeDialog.selectedUserId}
          fullWidth={isSmallMobile}
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Get individual user status for a task
  const getUserStatusForTask = (task, userId) => {
    const userStatus = task.statusByUser?.find(s => 
      s.user === userId || s.user?._id === userId
    );
    return userStatus?.status || 'pending';
  };

  // Get all users status for a task (only for privileged users)
  const getAllUsersStatus = (task) => {
    if (!task.assignedUsers || !task.statusByUser) return [];
    
    return task.assignedUsers.map(assignedUserId => {
      const userStatus = task.statusByUser.find(s => 
        s.user === assignedUserId || s.user?._id === assignedUserId
      );
      const user = users.find(u => u._id === assignedUserId);
      
      return {
        userId: assignedUserId,
        userName: user?.name || 'Unknown User',
        userRole: user?.role || 'N/A',
        status: userStatus?.status || 'pending',
        updatedAt: userStatus?.updatedAt || task.createdAt
      };
    });
  };

  const calculateStats = (tasks) => {
    let total = 0;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let rejected = 0;

    Object.values(tasks).forEach(dateTasks => {
      dateTasks.forEach(task => {
        total++;
        const myStatus = getUserStatusForTask(task, userId);

        switch (myStatus) {
          case 'pending':
            pending++;
            break;
          case 'in-progress':
            inProgress++;
            break;
          case 'completed':
            completed++;
            break;
          case 'rejected':
            rejected++;
            break;
        }
      });
    });

    setStats({ total, pending, inProgress, completed, rejected });
  };

  const fetchAssignableData = async () => {
    if (authError || !userId) {
      console.log('Skipping data fetch due to authentication issues');
      return;
    }

    try {
      const [usersRes, groupsRes] = await Promise.all([
        axios.get('/task/assignable-users'),
        axios.get('/groups')
      ]);

      setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);
      setGroups(Array.isArray(groupsRes.data.groups) ? groupsRes.data.groups : []);
    } catch (error) {
      console.error('Error fetching assignable data:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      }
      setUsers([]);
      setGroups([]);
    }
  };

  const fetchMyTasks = async () => {
    if (authError || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = statusFilter ? `/task?status=${statusFilter}` : '/task/my';
      const res = await axios.get(url);
      console.log('My tasks response:', res.data);
      setMyTasksGrouped(res.data.groupedTasks || {});
      if (tab === 0) calculateStats(res.data.groupedTasks || {});
    } catch (err) {
      console.error('Error fetching my tasks:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    if (authError || !userId) return;

    try {
      const res = await axios.get('/task/assigned');
      console.log('Assigned tasks response:', res.data);
      setAssignedTasksGrouped(res.data.groupedTasks || {});
      if (tab === 1) calculateStats(res.data.groupedTasks || {});
    } catch (err) {
      console.error('Error fetching assigned tasks:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: 'Failed to load assigned tasks', severity: 'error' });
      }
    }
  };

  const handleCreateTask = async () => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to create tasks',
        severity: 'error'
      });
      return;
    }

    // Basic validation
    if (!newTask.title || !newTask.description || !newTask.dueDateTime) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields (Title, Description, Due Date)',
        severity: 'error'
      });
      return;
    }

    // Validate due date is not in the past
    if (newTask.dueDateTime && new Date(newTask.dueDateTime) < new Date()) {
      setSnackbar({
        open: true,
        message: 'Due date cannot be in the past',
        severity: 'error'
      });
      return;
    }

    // For users, validate they can only create tasks for current and upcoming dates
    if (userRole === 'user' && newTask.dueDateTime) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(newTask.dueDateTime);
      if (dueDate < today) {
        setSnackbar({
          open: true,
          message: 'You can only create tasks for current and upcoming dates',
          severity: 'error'
        });
        return;
      }
    }

    // Loading state start
    setIsCreatingTask(true);

    try {
      const formData = new FormData();
      const finalAssignedUsers = userRole === 'user' ? [userId] : newTask.assignedUsers;

      // Append basic fields
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('dueDateTime', new Date(newTask.dueDateTime).toISOString());
      formData.append('whatsappNumber', newTask.whatsappNumber || '');
      formData.append('priorityDays', newTask.priorityDays || '1');
      formData.append('priority', newTask.priority);
      formData.append('assignedUsers', JSON.stringify(finalAssignedUsers));
      formData.append('assignedGroups', JSON.stringify(newTask.assignedGroups || []));
      formData.append('repeatPattern', newTask.repeatPattern);
      formData.append('repeatDays', JSON.stringify(newTask.repeatDays || []));

      // Handle file uploads
      if (newTask.files) {
        for (let i = 0; i < newTask.files.length; i++) {
          formData.append('files', newTask.files[i]);
        }
      }

      if (newTask.voiceNote) {
        formData.append('voiceNote', newTask.voiceNote);
      }

      console.log('Creating task with data:', {
        title: newTask.title,
        description: newTask.description,
        dueDateTime: newTask.dueDateTime,
        assignedUsers: finalAssignedUsers,
        assignedGroups: newTask.assignedGroups
      });

      const response = await axios.post('/task/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Task creation response:', response.data);

      // Refresh data
      await fetchAssignedTasks();
      await fetchMyTasks();
      await fetchNotifications();
      
      setOpenDialog(false);
      setSnackbar({ 
        open: true, 
        message: newTask.repeatPattern !== 'none' 
          ? 'Recurring task created successfully' 
          : 'Task created successfully', 
        severity: 'success' 
      });
      
      // Reset form
      setNewTask({
        title: '', 
        description: '', 
        dueDateTime: null, 
        assignedUsers: [],
        assignedGroups: [], 
        whatsappNumber: '', 
        priorityDays: '1', 
        priority: 'medium', 
        files: null, 
        voiceNote: null,
        repeatPattern: 'none',
        repeatDays: []
      });

    } catch (err) {
      console.error('Error creating task:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: err?.response?.data?.error || err?.response?.data?.message || 'Task creation failed', 
          severity: 'error' 
        });
      }
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCreateGroup = async () => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to manage groups',
        severity: 'error'
      });
      return;
    }

    try {
      if (editingGroup) {
        await axios.put(`/groups/${editingGroup._id}`, newGroup);
        setSnackbar({ open: true, message: 'Group updated successfully', severity: 'success' });
      } else {
        await axios.post('/groups', newGroup);
        setSnackbar({ open: true, message: 'Group created successfully', severity: 'success' });
      }
      fetchAssignableData();
      setOpenGroupDialog(false);
      setNewGroup({ name: '', description: '', members: [] });
      setEditingGroup(null);
    } catch (err) {
      console.error('Error in group operation:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.error || 'Group operation failed', severity: 'error' });
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to manage groups',
        severity: 'error'
      });
      return;
    }

    try {
      await axios.delete(`/groups/${groupId}`);
      fetchAssignableData();
      setSnackbar({ open: true, message: 'Group deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting group:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.error || 'Group deletion failed', severity: 'error' });
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description,
      members: group.members.map(m => m._id || m)
    });
    setOpenGroupDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    const IconComponent = statusIcons[status] || FiClock;
    return <IconComponent color={theme.palette[statusColors[status]]?.main} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDateTime) => {
    if (!dueDateTime) return false;
    return new Date(dueDateTime) < new Date();
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  const getRepeatInfo = (task) => {
    if (!task.repeatPattern || task.repeatPattern === 'none') return null;
    
    let info = repeatPatternLabels[task.repeatPattern];
    
    if (task.repeatPattern === 'weekly' && task.repeatDays && task.repeatDays.length > 0) {
      const dayLabels = task.repeatDays.map(day => 
        day.charAt(0).toUpperCase() + day.slice(1)
      );
      info += ` (${dayLabels.join(', ')})`;
    }
    
    return info;
  };

  // Check if user can change status for a task
  const canUserChangeStatus = (task) => {
    const isTaskCreator = task.createdBy === userId || task.createdBy?._id === userId;
    const isAssignedUser = task.assignedUsers?.some(assignedUserId => 
      assignedUserId === userId || assignedUserId._id === userId
    );
    const isPrivileged = ['admin', 'manager', 'hr', 'SuperAdmin'].includes(userRole);
    
    return isTaskCreator || isAssignedUser || isPrivileged;
  };

  // Enhanced table cell with new action buttons
  const renderActionButtons = (task) => {
    const isPrivileged = ['admin', 'manager', 'hr', 'SuperAdmin'].includes(userRole);
    const isTaskCreator = task.createdBy === userId || task.createdBy?._id === userId;
    const canEditDelete = isPrivileged || isTaskCreator;
    
    return (
      <Stack direction="row" spacing={0.5}>
        {/* Remarks Button - Everyone can view remarks */}
        <Tooltip title="View Remarks">
          <ActionButton 
            size="small" 
            onClick={() => fetchTaskRemarks(task._id)}
            sx={{ 
              color: theme.palette.info.main,
              '&:hover': { backgroundColor: `${theme.palette.info.main}10` }
            }}
          >
            <FiMessageSquare size={isSmallMobile ? 14 : 16} />
          </ActionButton>
        </Tooltip>

        {/* Activity Logs Button - Everyone can view activity logs */}
        <Tooltip title="Activity Logs">
          <ActionButton 
            size="small" 
            onClick={() => fetchActivityLogs(task._id)}
            sx={{ 
              color: theme.palette.primary.main,
              '&:hover': { backgroundColor: `${theme.palette.primary.main}10` }
            }}
          >
            <FiActivity size={isSmallMobile ? 14 : 16} />
          </ActionButton>
        </Tooltip>

        {/* Edit/Delete Buttons for privileged users or task creator */}
        {canEditDelete && (
          <>
            <Tooltip title="Edit Task">
              <ActionButton 
                size="small" 
                onClick={() => {
                  setEditTaskData(task);
                  setTaskManagementDialog({ open: true, task });
                }}
                sx={{ 
                  color: theme.palette.warning.main,
                  '&:hover': { backgroundColor: `${theme.palette.warning.main}10` }
                }}
              >
                <FiEdit3 size={isSmallMobile ? 14 : 16} />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Delete Task">
              <ActionButton 
                size="small" 
                onClick={() => deleteTask(task._id)}
                sx={{ 
                  color: theme.palette.error.main,
                  '&:hover': { backgroundColor: `${theme.palette.error.main}10` }
                }}
              >
                <FiTrash size={isSmallMobile ? 14 : 16} />
              </ActionButton>
            </Tooltip>
          </>
        )}
      </Stack>
    );
  };

  // Status Select Component with enhanced permission logic
  const renderStatusSelect = (task) => {
    const myStatus = getUserStatusForTask(task, userId);
    const canChangeStatus = canUserChangeStatus(task);
    
    return (
      <FormControl size="small" disabled={!canChangeStatus} sx={{ minWidth: isSmallMobile ? 100 : 120 }}>
        <Tooltip title={canChangeStatus ? '' : 'You are not authorized to update status for this task'}>
          <Select
            value={myStatus}
            onChange={(e) => {
              const isTaskCreator = task.createdBy === userId || task.createdBy?._id === userId;
              const isPrivileged = ['admin', 'manager', 'hr', 'SuperAdmin'].includes(userRole);
              
              if ((isTaskCreator || isPrivileged) && task.assignedUsers && task.assignedUsers.length > 1) {
                // Show user selection dialog for task creators/admins with multiple users
                setStatusChangeDialog({
                  open: true,
                  taskId: task._id,
                  newStatus: e.target.value,
                  remarks: '',
                  selectedUserId: null
                });
              } else {
                // Direct status update for single user or regular users
                handleStatusChange(task._id, e.target.value);
              }
            }}
            sx={{
              borderRadius: theme.shape.borderRadius,
              '& .MuiSelect-select': {
                py: 1,
                fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
              }
            }}
          >
            <MenuItem value="pending" sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}>Pending</MenuItem>
            <MenuItem value="in-progress" sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}>In Progress</MenuItem>
            <MenuItem value="completed" sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}>Completed</MenuItem>
            <MenuItem value="rejected" sx={{ fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}>Rejected</MenuItem>
          </Select>
        </Tooltip>
      </FormControl>
    );
  };

  // Enhanced Edit Task Dialog
  const handleEditTask = () => {
    if (!editTaskData) return;
    
    const updateData = {
      title: editTaskData.title,
      description: editTaskData.description,
      dueDateTime: editTaskData.dueDateTime,
      priority: editTaskData.priority,
      priorityDays: editTaskData.priorityDays,
      whatsappNumber: editTaskData.whatsappNumber,
      assignedUsers: editTaskData.assignedUsers || [],
      assignedGroups: editTaskData.assignedGroups || [],
    };

    updateTask(editTaskData._id, updateData);
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!authError && userId) {
      fetchMyTasks();
      fetchAssignedTasks();
      fetchAssignableData();
      fetchNotifications();
    }
  }, [statusFilter, tab, authError, userId]);

  // Show authentication error message
  if (authError) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 3,
        p: 2
      }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400, borderRadius: 3, width: '100%' }}>
          <CardContent>
            <FiAlertCircle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please log in to access the Task Management system.
            </Typography>
            <Button
              variant="contained"
              onClick={handleLogout}
              startIcon={<FiLogOut />}
              sx={{ borderRadius: 2 }}
              fullWidth
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const renderDesktopTable = (groupedTasks, showAssignedByMe = false) => {
    return Object.entries(groupedTasks).map(([dateKey, tasks]) => (
      <Box key={dateKey} sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{
          color: 'text.primary',
          borderBottom: `2px solid ${theme.palette.primary.main}20`,
          pb: 1,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          p: 2,
          borderRadius: 2,
          fontSize: isSmallMobile ? '1rem' : '1.125rem'
        }}>
          <Box component="span" sx={{ mr: 1 }}>📅</Box>
          {dateKey}
        </Typography>
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: theme.shape.borderRadius * 2, 
            overflow: 'hidden',
            maxWidth: '100%'
          }}
        >
          <Table sx={{ minWidth: isTablet ? 800 : '100%' }}>
            <TableHead>
              <TableRow sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)` 
              }}>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>My Status</TableCell>
                {/* Show All Users Status only for privileged users in "Assigned by Me" tab */}
                {showAssignedByMe && isPrivilegedUser && (
                  <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Assigned Users</TableCell>
                )}
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Repeat</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Files</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Actions</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Change Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const myStatus = getUserStatusForTask(task, userId);
                const allUsersStatus = getAllUsersStatus(task);
                const repeatInfo = getRepeatInfo(task);

                return (
                  <StyledTableRow key={task._id} status={myStatus}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.875rem' }}>
                          {task.title}
                        </Typography>
                        {task.isRecurring && (
                          <Tooltip title="Recurring Task">
                            <FiRepeat size={14} color={theme.palette.info.main} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: isTablet ? 150 : 200 }}>
                      <Tooltip title={task.description}>
                        <Typography variant="body2" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: isSmallMobile ? '0.8rem' : '0.875rem'
                        }}>
                          {task.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiCalendar size={14} color={theme.palette.text.secondary} />
                        <Typography
                          variant="body2"
                          color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'}
                          fontWeight={500}
                          sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.875rem' }}
                        >
                          {task.dueDateTime
                            ? new Date(task.dueDateTime).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '—'}
                        </Typography>
                        {isOverdue(task.dueDateTime) && (
                          <FiAlertCircle size={14} color={theme.palette.error.main} />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 1.5 }}>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        priority={task.priority || 'medium'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <StatusChip
                        label={myStatus.charAt(0).toUpperCase() + myStatus.slice(1)}
                        status={myStatus}
                        size="small"
                      />
                    </TableCell>
                    
                    {/* Show All Users Status only for privileged users in "Assigned by Me" tab */}
                    {showAssignedByMe && isPrivilegedUser && (
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={0.5}>
                          {allUsersStatus.slice(0, 2).map((userStatus, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                {userStatus.userName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" display="block" fontWeight={600} sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {userStatus.userName}
                                </Typography>
                                <StatusChip
                                  label={userStatus.status}
                                  status={userStatus.status}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          ))}
                          {allUsersStatus.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{allUsersStatus.length - 2} more
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    )}

                    <TableCell sx={{ py: 1.5 }}>
                      {repeatInfo ? (
                        <RecurringBadge
                          label={repeatInfo.split(' ')[0]}
                          size="small"
                          icon={<FiRepeat size={10} />}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.8rem' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      {task.files?.length ? (
                        <Tooltip title={`${task.files.length} file(s)`}>
                          <ActionButton
                            size="small"
                            href={`http://localhost:5000/${task.files[0].path || task.files[0]}`}
                            target="_blank"
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': { 
                                bgcolor: `${theme.palette.primary.main}10`,
                              }
                            }}
                          >
                            <FiDownload size={16} />
                          </ActionButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.8rem' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      {renderActionButtons(task)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      {renderStatusSelect(task)}
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  // Enhanced mobile cards with action buttons
  const renderMobileCards = (groupedTasks, showAssignedByMe = false) => {
    return Object.entries(groupedTasks).map(([dateKey, tasks]) => (
      <Box key={dateKey} sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{
          color: 'text.primary',
          borderBottom: `2px solid ${theme.palette.primary.main}20`,
          pb: 1,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          p: 2,
          borderRadius: 2,
          fontSize: '1rem'
        }}>
          <Box component="span" sx={{ mr: 1 }}>📅</Box>
          {dateKey}
        </Typography>
        <Stack spacing={2}>
          {tasks.map((task) => {
            const myStatus = getUserStatusForTask(task, userId);
            const allUsersStatus = getAllUsersStatus(task);
            const repeatInfo = getRepeatInfo(task);

            return (
              <MobileTaskCard key={task._id} status={myStatus}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    {/* Header Section */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ 
                            fontSize: '1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.title}
                          </Typography>
                          {task.isRecurring && (
                            <Tooltip title="Recurring Task">
                              <FiRepeat size={14} color={theme.palette.info.main} />
                            </Tooltip>
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {task.description}
                        </Typography>
                        {repeatInfo && (
                          <RecurringBadge
                            label={repeatInfo}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Box>
                      <StatusChip
                        label={myStatus}
                        status={myStatus}
                        size="small"
                      />
                    </Stack>

                    {/* Info Row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiCalendar size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'} fontWeight={500}>
                          {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 'No date'}
                        </Typography>
                      </Stack>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        priority={task.priority || 'medium'}
                        size="small"
                      />
                    </Stack>

                    {/* Show All Users Status only for privileged users in "Assigned by Me" tab */}
                    {showAssignedByMe && isPrivilegedUser && allUsersStatus.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                          Assigned Users:
                        </Typography>
                        <Stack spacing={1}>
                          {allUsersStatus.slice(0, 3).map((userStatus, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                {userStatus.userName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={600} sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {userStatus.userName}
                                </Typography>
                                <StatusChip
                                  label={userStatus.status}
                                  status={userStatus.status}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          ))}
                          {allUsersStatus.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{allUsersStatus.length - 3} more users
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Files Section */}
                    {task.files?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                          Files:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {task.files.slice(0, 2).map((file, i) => (
                            <Tooltip title="Download" key={i}>
                              <ActionButton
                                size="small"
                                href={`http://localhost:5000/${file.path || file}`}
                                target="_blank"
                                sx={{
                                  color: theme.palette.primary.main,
                                }}
                              >
                                <FiDownload size={14} />
                              </ActionButton>
                            </Tooltip>
                          ))}
                          {task.files.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{task.files.length - 2} more
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Action Buttons Row */}
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={0.5}>
                        {renderActionButtons(task)}
                      </Stack>
                      <Box sx={{ minWidth: 100 }}>
                        {renderStatusSelect(task)}
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </MobileTaskCard>
            );
          })}
        </Stack>
      </Box>
    ));
  };

  const renderGroupedTasks = (groupedTasks, showAssignedByMe = false) => {
    if (Object.keys(groupedTasks).length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <FiCalendar size={isMobile ? 48 : 64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {showAssignedByMe ? 'You have not assigned any tasks' : 'You have no tasks assigned'}
          </Typography>
        </Box>
      );
    }

    return isMobile ? renderMobileCards(groupedTasks, showAssignedByMe) : renderDesktopTable(groupedTasks, showAssignedByMe);
  };

  const renderGroupsManagement = () => (
    <Box sx={{ mt: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Group Management
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => {
            setEditingGroup(null);
            setNewGroup({ name: '', description: '', members: [] });
            setOpenGroupDialog(true);
          }}
          sx={{
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          Create Group
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} lg={4} key={group._id}>
            <Card sx={{ 
              borderRadius: theme.shape.borderRadius * 2,
              transition: 'all 0.3s ease',
              height: '100%',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={600} sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {group.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit Group">
                        <ActionButton
                          size="small"
                          onClick={() => handleEditGroup(group)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': { backgroundColor: `${theme.palette.primary.main}10` }
                          }}
                        >
                          <FiEdit2 size={16} />
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="Delete Group">
                        <ActionButton
                          size="small"
                          onClick={() => handleDeleteGroup(group._id)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': { backgroundColor: `${theme.palette.error.main}10` }
                          }}
                        >
                          <FiTrash2 size={16} />
                        </ActionButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Divider />
    
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                      Members ({group.members.length})
                    </Typography>
                    <Stack spacing={1}>
                      {group.members.slice(0, 3).map(memberId => {
                        const member = users.find(u => u._id === memberId);
                        return member ? (
                          <Stack key={memberId} direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              fontSize: '0.875rem',
                              bgcolor: theme.palette.primary.main 
                            }}>
                              {member.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.role}
                              </Typography>
                            </Box>
                          </Stack>
                        ) : null;
                      })}
                      {group.members.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{group.members.length - 3} more members
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {groups.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <FiUsers size={isMobile ? 48 : 64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
            No groups created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first group to assign tasks to multiple users at once
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Enhanced Notifications Panel
  const renderNotificationsPanel = () => (
    <Modal
      open={notificationsOpen}
      onClose={() => setNotificationsOpen(false)}
      closeAfterTransition
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isSmallMobile ? '90%' : 400,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>Notifications</Typography>
            <Button 
              onClick={markAllNotificationsAsRead} 
              size="small"
              disabled={unreadNotificationCount === 0}
              sx={{ borderRadius: 1 }}
            >
              Mark all as read
            </Button>
          </Stack>
        </Box>
        <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 1 }}>
          {notifications.length > 0 ? (
            <Stack spacing={1}>
              {notifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  variant="outlined"
                  sx={{ 
                    bgcolor: notification.isRead ? 'background.default' : 'action.hover',
                    borderLeft: notification.isRead ? null : `4px solid ${theme.palette.primary.main}`,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[1]
                    }
                  }}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2">
                        {notification.message}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </Typography>
                        {!notification.isRead && (
                          <Button 
                            size="small" 
                            onClick={() => markNotificationAsRead(notification._id)}
                            sx={{ borderRadius: 1 }}
                          >
                            Mark read
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FiBell size={32} color={theme.palette.text.secondary} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                No notifications
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );

  // Enhanced Remarks Dialog
  const renderRemarksDialog = () => (
    <Dialog 
      open={remarksDialog.open} 
      onClose={() => setRemarksDialog({ open: false, taskId: null, remarks: [] })}
      maxWidth="md"
      fullWidth
      fullScreen={isSmallMobile}
      PaperProps={{ sx: { borderRadius: isSmallMobile ? 0 : 2 } }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)` 
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiMessageSquare color={theme.palette.info.main} />
          <Typography variant="h6" fontWeight={600}>Task Remarks</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Add New Remark - Everyone can add remarks */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Add New Remark
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={isSmallMobile ? 2 : 3}
              label="Your Remark"
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Enter your remark here..."
              sx={{ borderRadius: 1 }}
            />
            <Button
              variant="contained"
              onClick={() => addRemark(remarksDialog.taskId)}
              disabled={!newRemark.trim()}
              sx={{ mt: 1, borderRadius: 1 }}
              fullWidth={isSmallMobile}
            >
              Add Remark
            </Button>
          </Box>

          {/* Remarks List */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>Remarks History</Typography>
            {remarksDialog.remarks.length > 0 ? (
              <Stack spacing={1}>
                {remarksDialog.remarks.map((remark, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 1 }}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              fontSize: '0.875rem',
                              bgcolor: theme.palette.primary.main 
                            }}>
                              {remark.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {remark.user?.name || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {remark.user?.role || 'User'}
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(remark.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {remark.text}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={3} fontWeight={500}>
                No remarks yet. Be the first to add one!
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );

  // Enhanced Activity Logs Dialog
  const renderActivityLogsDialog = () => (
    <Dialog 
      open={activityDialog.open} 
      onClose={() => setActivityDialog({ open: false, taskId: null })}
      maxWidth="lg"
      fullWidth
      fullScreen={isSmallMobile}
      PaperProps={{ sx: { borderRadius: isSmallMobile ? 0 : 2 } }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)` 
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiActivity color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={600}>Activity Logs</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {activityLogs.length > 0 ? (
          <Stack spacing={1}>
            {activityLogs.map((log, index) => (
              <Card key={index} variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Stack spacing={1}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.875rem',
                          bgcolor: theme.palette.primary.main 
                        }}>
                          {log.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {log.user?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user?.role || 'User'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {log.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip 
                        label={log.action} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 600 }}
                      />
                      {log.ipAddress && (
                        <Typography variant="caption" color="text.secondary">
                          IP: {log.ipAddress}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={3} fontWeight={500}>
            No activity logs found for this task
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );

  // Enhanced Edit Task Dialog
  const renderEditTaskDialog = () => {
    const task = taskManagementDialog.task;
    
    if (!task) return null;

    return (
      <Dialog 
        open={taskManagementDialog.open} 
        onClose={() => {
          setTaskManagementDialog({ open: false, task: null });
          setEditTaskData(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallMobile}
        PaperProps={{ sx: { borderRadius: isSmallMobile ? 0 : 2 } }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}05 100%)` 
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FiEdit3 color={theme.palette.warning.main} />
            <Typography variant="h6" fontWeight={600}>Edit Task</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={editTaskData?.title || task.title}
              onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={isSmallMobile ? 2 : 3}
              value={editTaskData?.description || task.description}
              onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />

            <DateTimePicker
              label="Due Date & Time"
              value={editTaskData?.dueDateTime ? new Date(editTaskData.dueDateTime) : new Date(task.dueDateTime)}
              onChange={(date) => setEditTaskData({ ...editTaskData, dueDateTime: date })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ borderRadius: 1 }} />}
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editTaskData?.priority || task.priority}
                onChange={(e) => setEditTaskData({ ...editTaskData, priority: e.target.value })}
                label="Priority"
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Priority Days"
              value={editTaskData?.priorityDays || task.priorityDays}
              onChange={(e) => setEditTaskData({ ...editTaskData, priorityDays: e.target.value })}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />

            <TextField
              fullWidth
              label="WhatsApp Number"
              value={editTaskData?.whatsappNumber || task.whatsappNumber}
              onChange={(e) => setEditTaskData({ ...editTaskData, whatsappNumber: e.target.value })}
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: isSmallMobile ? 'column' : 'row',
          gap: isSmallMobile ? 1 : 0,
          p: 2
        }}>
          <Button 
            onClick={() => {
              setTaskManagementDialog({ open: false, task: null });
              setEditTaskData(null);
            }}
            fullWidth={isSmallMobile}
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditTask}
            variant="contained"
            color="primary"
            fullWidth={isSmallMobile}
            sx={{ borderRadius: 1 }}
          >
            Update Task
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // CREATE TASK DIALOG
  const renderCreateTaskDialog = () => (
    <Dialog 
      open={openDialog} 
      onClose={() => setOpenDialog(false)} 
      maxWidth="md" 
      fullWidth
      fullScreen={isSmallMobile}
      PaperProps={{
        sx: {
          borderRadius: isSmallMobile ? 0 : 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            background: 'rgba(255,255,255,0.2)',
          }}>
            <FiPlus size={20} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Create New Task
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Fill in the details to create a new task
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: isSmallMobile ? 2 : 3 }}>
          <Stack spacing={isSmallMobile ? 2 : 3}>
            {/* Basic Information */}
            <Box sx={{ 
              p: isSmallMobile ? 2 : 3, 
              borderRadius: 1, 
              border: 1, 
              borderColor: 'divider',
              background: 'white',
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiInfo size={18} color={theme.palette.primary.main} />
                Basic Information
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Task Title *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  variant="outlined"
                  placeholder="Enter a descriptive task title"
                  sx={{ borderRadius: 1 }}
                  size={isSmallMobile ? "small" : "medium"}
                />

                <TextField
                  fullWidth
                  label="Description *"
                  multiline
                  rows={isSmallMobile ? 2 : 3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  variant="outlined"
                  placeholder="Provide detailed description of the task..."
                  sx={{ borderRadius: 1 }}
                  size={isSmallMobile ? "small" : "medium"}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Due Date & Time *"
                      value={newTask.dueDateTime}
                      onChange={(dateTime) => setNewTask({ ...newTask, dueDateTime: dateTime })}
                      minDate={new Date()}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          sx={{ borderRadius: 1 }}
                          size={isSmallMobile ? "small" : "medium"}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        label="Priority"
                        sx={{ borderRadius: 1 }}
                        size={isSmallMobile ? "small" : "medium"}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Priority Days"
                      value={newTask.priorityDays}
                      onChange={(e) => setNewTask({ ...newTask, priorityDays: e.target.value })}
                      variant="outlined"
                      placeholder="Enter priority days"
                      sx={{ borderRadius: 1 }}
                      size={isSmallMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="WhatsApp Number"
                      value={newTask.whatsappNumber}
                      onChange={(e) => setNewTask({ ...newTask, whatsappNumber: e.target.value })}
                      variant="outlined"
                      placeholder="Enter WhatsApp number"
                      sx={{ borderRadius: 1 }}
                      size={isSmallMobile ? "small" : "medium"}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            {/* Repeat Section */}
            <Box sx={{ 
              p: isSmallMobile ? 2 : 3, 
              borderRadius: 1, 
              border: 1, 
              borderColor: 'divider',
              background: 'white',
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiRepeat size={18} color={theme.palette.primary.main} />
                Repeat Task
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Repeat Pattern</InputLabel>
                <Select
                  value={newTask.repeatPattern}
                  onChange={(e) => setNewTask({ ...newTask, repeatPattern: e.target.value })}
                  label="Repeat Pattern"
                  sx={{ borderRadius: 1 }}
                  size={isSmallMobile ? "small" : "medium"}
                >
                  <MenuItem value="none">No Repeat</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              {newTask.repeatPattern === 'weekly' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Select Week Days
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {[
                      { value: 'monday', label: 'Mon' },
                      { value: 'tuesday', label: 'Tue' },
                      { value: 'wednesday', label: 'Wed' },
                      { value: 'thursday', label: 'Thu' },
                      { value: 'friday', label: 'Fri' },
                      { value: 'saturday', label: 'Sat' },
                      { value: 'sunday', label: 'Sun' }
                    ].map((day) => (
                      <Chip
                        key={day.value}
                        label={day.label}
                        onClick={() => {
                          const currentDays = newTask.repeatDays || [];
                          if (currentDays.includes(day.value)) {
                            setNewTask({
                              ...newTask,
                              repeatDays: currentDays.filter(d => d !== day.value)
                            });
                          } else {
                            setNewTask({
                              ...newTask,
                              repeatDays: [...currentDays, day.value]
                            });
                          }
                        }}
                        color={newTask.repeatDays?.includes(day.value) ? 'primary' : 'default'}
                        variant={newTask.repeatDays?.includes(day.value) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ borderRadius: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* File Uploads */}
            <Box sx={{ 
              p: isSmallMobile ? 2 : 3, 
              borderRadius: 1, 
              border: 1, 
              borderColor: 'divider',
              background: 'white',
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiPaperclip size={18} color={theme.palette.primary.main} />
                Attachments
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button 
                  variant="outlined" 
                  component="label" 
                  startIcon={<FiFileText />}
                  sx={{ 
                    borderRadius: 1,
                    py: 1,
                    borderStyle: 'dashed',
                    fontSize: '0.875rem'
                  }}
                  fullWidth={isSmallMobile}
                >
                  Upload Files
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => setNewTask({ ...newTask, files: e.target.files })}
                  />
                </Button>

                <Button 
                  variant="outlined" 
                  component="label" 
                  startIcon={<FiMic />}
                  sx={{ 
                    borderRadius: 1,
                    py: 1,
                    borderStyle: 'dashed',
                    fontSize: '0.875rem'
                  }}
                  fullWidth={isSmallMobile}
                >
                  Voice Note
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={(e) => setNewTask({ ...newTask, voiceNote: e.target.files[0] })}
                  />
                </Button>
              </Stack>
            </Box>

            {/* User Assignment - Only for privileged users */}
            {!isRegularUser && (
              <Box sx={{ 
                p: isSmallMobile ? 2 : 3, 
                borderRadius: 1, 
                border: 1, 
                borderColor: 'divider',
                background: 'white',
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiUsers size={18} color={theme.palette.primary.main} />
                  Assign to Team Members
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Select Team Members</InputLabel>
                  <Select
                    multiple
                    value={newTask.assignedUsers}
                    onChange={(e) => setNewTask({ ...newTask, assignedUsers: e.target.value })}
                    input={<OutlinedInput label="Select Team Members" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {users
                          .filter((u) => selected.includes(u._id))
                          .map((u) => (
                            <Chip 
                              key={u._id}
                              label={u.name}
                              size="small"
                              sx={{ borderRadius: 0.5 }}
                            />
                          ))}
                      </Box>
                    )}
                    sx={{ borderRadius: 1 }}
                    size={isSmallMobile ? "small" : "medium"}
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        <Checkbox checked={newTask.assignedUsers.includes(user._id)} />
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{user.name}</Typography>
                              <Chip 
                                label={user.role} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderRadius: 0.5 }}
                              />
                            </Box>
                          } 
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Group Assignment for privileged users */}
            {isPrivilegedUser && (
              <Box sx={{ 
                p: isSmallMobile ? 2 : 3, 
                borderRadius: 1, 
                border: 1, 
                borderColor: 'divider',
                background: 'white',
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiFolder size={18} color={theme.palette.primary.main} />
                  Assign to Groups
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Select Groups</InputLabel>
                  <Select
                    multiple
                    value={newTask.assignedGroups}
                    onChange={(e) => setNewTask({ ...newTask, assignedGroups: e.target.value })}
                    input={<OutlinedInput label="Select Groups" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {groups
                          .filter((g) => selected.includes(g._id))
                          .map((g) => (
                            <Chip 
                              key={g._id}
                              label={`${g.name} (${g.members.length})`}
                              size="small"
                              sx={{ borderRadius: 0.5 }}
                            />
                          ))}
                      </Box>
                    )}
                    sx={{ borderRadius: 1 }}
                    size={isSmallMobile ? "small" : "medium"}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group._id} value={group._id}>
                        <Checkbox checked={newTask.assignedGroups.includes(group._id)} />
                        <ListItemText
                          primary={`${group.name}`}
                          secondary={`${group.members.length} members`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: isSmallMobile ? 2 : 3, 
        borderTop: 1, 
        borderColor: 'divider',
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? 1 : 0
      }}>
        <Button
          onClick={() => setOpenDialog(false)}
          variant="outlined"
          sx={{ 
            borderRadius: 1,
            px: 3,
          }}
          fullWidth={isSmallMobile}
        >
          Cancel
        </Button>

        <Button
          onClick={handleCreateTask}
          variant="contained"
          disabled={!newTask.title || !newTask.description || !newTask.dueDateTime || isCreatingTask}
          startIcon={isCreatingTask ? <CircularProgress size={16} color="inherit" /> : <FiCheck />}
          sx={{ 
            borderRadius: 1,
            px: 3,
            minWidth: isSmallMobile ? 'auto' : '120px'
          }}
          fullWidth={isSmallMobile}
        >
          {isCreatingTask ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // GROUP MANAGEMENT DIALOG
  const renderGroupManagementDialog = () => (
    <Dialog
      open={openGroupDialog}
      onClose={() => setOpenGroupDialog(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isSmallMobile}
      PaperProps={{ sx: { borderRadius: isSmallMobile ? 0 : 2 } }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)` 
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{
            bgcolor: theme.palette.primary.main,
            width: 32,
            height: 32
          }}>
            <FiUsers size={16} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600} color="primary.main">
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingGroup ? 'Update group details and members' : 'Create a new group to assign tasks efficiently'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: isSmallMobile ? 2 : 3 }}>
        <Stack spacing={3}>
          {/* Group Basic Info */}
          <Card variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Group Name"
                value={newGroup.name}
                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Enter a descriptive group name"
                sx={{ borderRadius: 1 }}
                size={isSmallMobile ? "small" : "medium"}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={isSmallMobile ? 2 : 3}
                value={newGroup.description}
                onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Describe the purpose of this group..."
                sx={{ borderRadius: 1 }}
                size={isSmallMobile ? "small" : "medium"}
              />
            </Stack>
          </Card>

          {/* Group Members Selection */}
          <Card variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Group Members
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Select Members</InputLabel>
              <Select
                multiple
                value={newGroup.members}
                onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value })}
                input={<OutlinedInput label="Select Members" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users.find(u => u._id === value);
                      return user ? (
                        <Chip
                          key={value}
                          label={user.name}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 0.5 }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
                sx={{ borderRadius: 1 }}
                size={isSmallMobile ? "small" : "medium"}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    <Checkbox checked={newGroup.members.includes(user._id)} />
                    <ListItemText
                      primary={user.name}
                      secondary={user.role}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: isSmallMobile ? 2 : 3,
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? 1 : 0
      }}>
        <Button
          onClick={() => setOpenGroupDialog(false)}
          variant="outlined"
          sx={{ borderRadius: 1 }}
          fullWidth={isSmallMobile}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateGroup}
          variant="contained"
          disabled={!newGroup.name || !newGroup.description || newGroup.members.length === 0}
          sx={{ borderRadius: 1 }}
          fullWidth={isSmallMobile}
        >
          {editingGroup ? 'Update Group' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2,
        p: 2
      }}>
        <CircularProgress size={isMobile ? 32 : 40} />
        <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ textAlign: 'center' }}>
          Loading Tasks...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {/* Header Section */}
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: { xs: 2, sm: 3 },
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: 2,
              position: "sticky",
              top: 0,
              zIndex: 20,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              {/* Left Section: Title & Info */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {tab === 2 ? "Group Management" : "Task Management"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {tab === 2
                    ? "Create and manage user groups easily"
                    : "Manage and track your tasks efficiently"}
                </Typography>
              </Box>

              {/* Right Section: Buttons */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {/* Notifications Badge */}
                <Tooltip title="Notifications">
                  <ActionButton 
                    onClick={() => setNotificationsOpen(true)}
                    sx={{ 
                      position: 'relative',
                      '&:hover': { 
                        backgroundColor: `${theme.palette.primary.main}10`,
                      }
                    }}
                  >
                    <FiBell size={18} />
                    {unreadNotificationCount > 0 && (
                      <Badge 
                        badgeContent={unreadNotificationCount} 
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                        }}
                      />
                    )}
                  </ActionButton>
                </Tooltip>

                {/* Show Manage Groups only when NOT already on tab 2 and for privileged users */}
                {tab !== 2 && isPrivilegedUser && (
                  <Button
                    variant="outlined"
                    startIcon={<FiUsers />}
                    onClick={() => setTab(2)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 2,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Manage Groups
                  </Button>
                )}

                {/* Create Task Button - Show for all users */}
                <Button
                  variant="contained"
                  startIcon={<FiPlus />}
                  onClick={() => setOpenDialog(true)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Create Task
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {tab === 2 ? (
            renderGroupsManagement()
          ) : (
            <>
              {/* Statistics Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Total Tasks', value: stats.total, color: 'primary', icon: FiCalendar },
                  { label: 'Pending', value: stats.pending, color: 'warning', icon: FiClock },
                  { label: 'In Progress', value: stats.inProgress, color: 'info', icon: FiAlertCircle },
                  { label: 'Completed', value: stats.completed, color: 'success', icon: FiCheckCircle },
                  { label: 'Rejected', value: stats.rejected, color: 'error', icon: FiXCircle },
                ].map((stat, index) => (
                  <Grid item xs={6} sm={4} md={2.4} key={index}>
                    <StatCard color={stat.color}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{
                            bgcolor: `${theme.palette[stat.color].main}20`,
                            color: theme.palette[stat.color].main,
                            width: 40,
                            height: 40
                          }}>
                            <stat.icon size={18} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {stat.label}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                              {stat.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </StatCard>
                  </Grid>
                ))}
              </Grid>

              {/* Tabs Section */}
              <Paper sx={{
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: 1,
                overflow: 'hidden'
              }}>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 2 },
                      minHeight: 'auto'
                    }
                  }}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons="auto"
                >
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiUser size={16} />
                        <Typography fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>My Tasks</Typography>
                        {stats.total > 0 && (
                          <Badge
                            badgeContent={stats.total}
                            color="primary"
                            sx={{ ml: 0.5 }}
                          />
                        )}
                      </Stack>
                    }
                  />
                  {/* Show "Assigned by Me" tab only for privileged users */}
                  {isPrivilegedUser && (
                    <Tab
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FiUsers size={16} />
                          <Typography fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Assigned by Me</Typography>
                        </Stack>
                      }
                    />
                  )}
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                  {/* Filter Section */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mb: 2 }}
                  >
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, mb: { xs: 1, sm: 0 } }}>
                      <InputLabel>Status Filter</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        input={<OutlinedInput label="Status Filter" />}
                        sx={{ borderRadius: 1 }}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Showing {stats.total} tasks
                    </Typography>
                  </Stack>

                  {/* Tasks Content */}
                  {renderGroupedTasks(
                    tab === 0 ? myTasksGrouped : assignedTasksGrouped,
                    tab === 1 // showAssignedByMe flag
                  )}
                </Box>
              </Paper>
            </>
          )}

          {/* DIALOGS */}
          {renderCreateTaskDialog()}
          {renderGroupManagementDialog()}
          {renderNotificationsPanel()}
          {renderRemarksDialog()}
          {renderActivityLogsDialog()}
          {renderEditTaskDialog()}
          {renderStatusChangeDialog()}

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Card sx={{
              minWidth: 280,
              background: snackbar.severity === 'error'
                ? theme.palette.error.main
                : snackbar.severity === 'warning'
                ? theme.palette.warning.main
                : theme.palette.success.main,
              color: 'white',
              borderRadius: 1
            }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {snackbar.severity === 'error' ?
                    <FiXCircle size={18} /> :
                    snackbar.severity === 'warning' ?
                    <FiAlertCircle size={18} /> :
                    <FiCheckCircle size={18} />
                  }
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                    {snackbar.message}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Snackbar>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default MyTaskManagement;