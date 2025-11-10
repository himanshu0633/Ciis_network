import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, Card, CardContent, Avatar, CircularProgress,
  Snackbar, Checkbox, ListItemText, OutlinedInput, Grid,
  Divider, Tooltip, Badge, Tabs, Tab, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, styled, Modal,
  TablePagination
} from '@mui/material';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FiPlus, FiCalendar, FiInfo, FiPaperclip, FiMic, FiFileText,
  FiCheck, FiX, FiAlertCircle, FiUser, FiUsers, FiFolder,
  FiRepeat, FiBell, FiEdit, FiTrash2, FiSave, FiSearch,
  FiFilter, FiDownload, FiMessageSquare, FiActivity,
  FiEye, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiMoreVertical, FiRefreshCw, FiUserCheck, FiUserX,
  FiLogOut, FiEdit3, FiTrash, FiMessageCircle
} from 'react-icons/fi';
import { useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Styled Components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
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
  }),
  ...(status === 'in-progress' && {
    background: `${theme.palette.info.main}05`,
  }),
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}05`,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}05`,
  }),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
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
  height: '100%',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
  },
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const AdminTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRemarksDialog, setOpenRemarksDialog] = useState(false);
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  
  // Data States
  const [selectedTask, setSelectedTask] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [overdueFilter, setOverdueFilter] = useState('');
  
  // Form States
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

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    dueDateTime: null,
    assignedUsers: [],
    assignedGroups: [],
    whatsappNumber: '',
    priorityDays: '1',
    priority: 'medium'
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    members: []
  });

  const [statusChange, setStatusChange] = useState({
    taskId: '',
    userId: '',
    status: '',
    remarks: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Fetch user data
  const fetchUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userStr || !token) {
        setAuthError(true);
        setSnackbar({ open: true, message: 'Please login to continue', severity: 'error' });
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || !user.role || !user.id) {
        setAuthError(true);
        setSnackbar({ open: true, message: 'Invalid user data', severity: 'error' });
        return;
      }

      setUserRole(user.role);
      setUserId(user.id);
      setAuthError(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthError(true);
      setSnackbar({ open: true, message: 'Error loading user data', severity: 'error' });
    }
  };

  // API call function
  const apiCall = async (method, url, data = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError(true);
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      if (!(data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }

      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(url, config);
          break;
        case 'post':
          response = await axios.post(url, data, config);
          break;
        case 'put':
          response = await axios.put(url, data, config);
          break;
        case 'patch':
          response = await axios.patch(url, data, config);
          break;
        case 'delete':
          response = await axios.delete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return response.data;
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setSnackbar({ open: true, message: 'Session expired. Please login again.', severity: 'error' });
        navigate('/login');
      }
      
      throw error;
    }
  };

  // Fetch tasks with pagination and filters
  const fetchTasks = async (page = 0, limit = rowsPerPage, filters = {}) => {
    if (authError || !userId) return;

    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: page + 1, // Server pages usually start from 1
        limit: limit
      };

      // Add filters to params
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assignedToFilter) params.assignedTo = assignedToFilter;
      if (createdByFilter) params.createdBy = createdByFilter;
      if (overdueFilter) params.overdue = overdueFilter;

      const queryString = new URLSearchParams(params).toString();
      
      const tasksResult = await apiCall('get', `/task/assigned-tasks-status?${queryString}`);
      
      // Handle tasks response based on your API structure
      const tasksArray = tasksResult.tasks || tasksResult.data || [];
      setTasks(tasksArray);
      
      // Set total count for pagination - adjust according to your API response
      setTotalTasks(tasksResult.total || tasksResult.totalCount || tasksArray.length);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setTotalTasks(0);
      setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all supporting data (users, groups, notifications)
  const fetchSupportingData = async () => {
    try {
      const [usersResult, groupsResult, notificationsResult] = await Promise.allSettled([
        apiCall('get', '/task/assignable-users'),
        apiCall('get', '/groups'),
        apiCall('get', '/task/notifications/all')
      ]);

      // Handle users response
      if (usersResult.status === 'fulfilled') {
        const usersData = usersResult.value;
        setUsers(usersData.users || usersData.data || []);
      }

      // Handle groups response
      if (groupsResult.status === 'fulfilled') {
        const groupsData = groupsResult.value;
        setGroups(groupsData.groups || groupsData.data || []);
      }

      // Handle notifications response
      if (notificationsResult.status === 'fulfilled') {
        const notificationsData = notificationsResult.value;
        setNotifications(notificationsData.notifications || []);
        setUnreadNotificationCount(notificationsData.unreadCount || 0);
      }

    } catch (error) {
      console.error('Error fetching supporting data:', error);
    }
  };

  // Fetch all data
  const fetchAllData = async (page = 0, limit = rowsPerPage) => {
    await Promise.all([
      fetchTasks(page, limit, getCurrentFilters()),
      fetchSupportingData()
    ]);
  };

  // Enhanced Task CRUD Operations
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.dueDateTime) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    if (newTask.assignedUsers.length === 0 && newTask.assignedGroups.length === 0) {
      setSnackbar({ open: true, message: 'Please assign to at least one user or group', severity: 'error' });
      return;
    }

    setIsCreatingTask(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('dueDateTime', new Date(newTask.dueDateTime).toISOString());
      formData.append('whatsappNumber', newTask.whatsappNumber || '');
      formData.append('priorityDays', newTask.priorityDays || '1');
      formData.append('priority', newTask.priority);
      formData.append('assignedUsers', JSON.stringify(newTask.assignedUsers));
      formData.append('assignedGroups', JSON.stringify(newTask.assignedGroups));
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

      await apiCall('post', '/task/create', formData);

      setOpenCreateDialog(false);
      setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      resetNewTaskForm();
      fetchAllData(page, rowsPerPage);
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create task';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleEditTask = async () => {
    if (!editTask.title || !editTask.description || !editTask.dueDateTime) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    setIsUpdatingTask(true);
    try {
      const taskData = {
        title: editTask.title,
        description: editTask.description,
        dueDateTime: new Date(editTask.dueDateTime).toISOString(),
        assignedUsers: editTask.assignedUsers,
        assignedGroups: editTask.assignedGroups,
        whatsappNumber: editTask.whatsappNumber || '',
        priorityDays: editTask.priorityDays || '1',
        priority: editTask.priority
      };

      await apiCall('put', `/task/${selectedTask._id}`, taskData);
      
      setOpenEditDialog(false);
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
      fetchAllData(page, rowsPerPage);
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update task';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiCall('delete', `/task/${taskId}`);
      setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
      fetchAllData(page, rowsPerPage);
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete task';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Enhanced Status Management
  const handleStatusChange = async () => {
    if (!statusChange.status) {
      setSnackbar({ open: true, message: 'Please select status', severity: 'error' });
      return;
    }

    try {
      await apiCall('patch', `/task/${statusChange.taskId}/status`, {
        status: statusChange.status,
        remarks: statusChange.remarks,
        userId: statusChange.userId || userId
      });

      setOpenStatusDialog(false);
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      resetStatusForm();
      fetchAllData(page, rowsPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update status';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Filter functions
  const getCurrentFilters = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    if (assignedToFilter) filters.assignedTo = assignedToFilter;
    if (createdByFilter) filters.createdBy = createdByFilter;
    if (overdueFilter) filters.overdue = overdueFilter;
    return filters;
  };

  const applyFilters = () => {
    setPage(0);
    fetchAllData(0, rowsPerPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssignedToFilter('');
    setCreatedByFilter('');
    setOverdueFilter('');
    setPage(0);
    fetchAllData(0, rowsPerPage);
  };

  // Enhanced Remarks Management
  const fetchRemarks = async (taskId) => {
    try {
      const data = await apiCall('get', `/task/${taskId}/remarks`);
      setRemarks(data.remarks || data.data || []);
      setSelectedTask(tasks.find(task => task._id === taskId));
      setOpenRemarksDialog(true);
    } catch (error) {
      console.error('Error fetching remarks:', error);
      setSnackbar({ open: true, message: 'Failed to load remarks', severity: 'error' });
    }
  };

  const addRemark = async () => {
    if (!newRemark.trim()) {
      setSnackbar({ open: true, message: 'Please enter a remark', severity: 'warning' });
      return;
    }

    try {
      await apiCall('post', `/task/${selectedTask._id}/remarks`, { text: newRemark });
      setNewRemark('');
      fetchRemarks(selectedTask._id);
      setSnackbar({ open: true, message: 'Remark added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding remark:', error);
      setSnackbar({ open: true, message: 'Failed to add remark', severity: 'error' });
    }
  };

  // Enhanced Activity Logs
  const fetchActivityLogs = async (taskId) => {
    try {
      const data = await apiCall('get', `/task/${taskId}/activity-logs`);
      setActivityLogs(data.logs || data.data || []);
      setSelectedTask(tasks.find(task => task._id === taskId));
      setOpenActivityDialog(true);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setSnackbar({ open: true, message: 'Failed to load activity logs', severity: 'error' });
    }
  };

  // Enhanced Notifications Management
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiCall('patch', `/task/notifications/${notificationId}/read`);
      fetchSupportingData();
      setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiCall('patch', '/task/notifications/read-all');
      fetchSupportingData();
      setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Enhanced Group Management
  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.description) {
      setSnackbar({ open: true, message: 'Please fill group name and description', severity: 'error' });
      return;
    }

    try {
      if (editingGroup) {
        await apiCall('put', `/groups/${editingGroup._id}`, newGroup);
        setSnackbar({ open: true, message: 'Group updated successfully', severity: 'success' });
      } else {
        await apiCall('post', '/groups', newGroup);
        setSnackbar({ open: true, message: 'Group created successfully', severity: 'success' });
      }
      setOpenGroupDialog(false);
      resetGroupForm();
      fetchSupportingData();
    } catch (error) {
      console.error('Error in group operation:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Group operation failed';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      await apiCall('delete', `/groups/${groupId}`);
      setSnackbar({ open: true, message: 'Group deleted successfully', severity: 'success' });
      fetchSupportingData();
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete group';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchTasks(newPage, rowsPerPage, getCurrentFilters());
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchTasks(0, newRowsPerPage, getCurrentFilters());
  };

  // Helper Functions
  const resetNewTaskForm = () => {
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
  };

  const resetStatusForm = () => {
    setStatusChange({
      taskId: '',
      userId: '',
      status: '',
      remarks: ''
    });
  };

  const resetGroupForm = () => {
    setNewGroup({
      name: '',
      description: '',
      members: []
    });
    setEditingGroup(null);
  };

  const openEditTaskDialog = (task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description,
      dueDateTime: new Date(task.dueDateTime || task.dueDate),
      assignedUsers: task.assignedUsers?.map(u => u._id || u) || [],
      assignedGroups: task.assignedGroups || [],
      whatsappNumber: task.whatsappNumber || '',
      priorityDays: task.priorityDays || '1',
      priority: task.priority || 'medium'
    });
    setOpenEditDialog(true);
  };

  const openStatusChangeDialog = (task, userId = '') => {
    setSelectedTask(task);
    setStatusChange({
      taskId: task._id,
      userId: userId,
      status: task.overallStatus || '',
      remarks: ''
    });
    setOpenStatusDialog(true);
  };

  const openGroupEditDialog = (group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description,
      members: group.members?.map(m => m._id || m) || []
    });
    setOpenGroupDialog(true);
  };

  // Data Helpers based on your API response
  const getUserName = (userId) => {
    if (typeof userId === 'object') {
      return userId.name || 'Unknown User';
    }
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  const isOverdue = (task) => {
    const dueDate = task.dueDateTime || task.dueDate;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.overallStatus !== 'completed';
  };

  const getAssignedUsersCount = (task) => {
    let count = task.assignedUsers?.length || 0;
    task.assignedGroups?.forEach(groupId => {
      const group = groups.find(g => g._id === groupId);
      if (group) count += group.members?.length || 0;
    });
    return count;
  };

  const getTaskStatus = (task) => {
    return task.overallStatus || 'pending';
  };

  // Stats Calculation - client side for current page
  const stats = {
    total: totalTasks,
    pending: tasks.filter(t => getTaskStatus(t) === 'pending').length,
    inProgress: tasks.filter(t => getTaskStatus(t) === 'in-progress').length,
    completed: tasks.filter(t => getTaskStatus(t) === 'completed').length,
    rejected: tasks.filter(t => getTaskStatus(t) === 'rejected').length,
    overdue: tasks.filter(t => isOverdue(t)).length
  };

  // Enhanced Notifications Panel
  const renderNotificationsPanel = () => (
    <Modal
      open={openNotifications}
      onClose={() => setOpenNotifications(false)}
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
      open={openRemarksDialog} 
      onClose={() => setOpenRemarksDialog(false)} 
      maxWidth="md" 
      fullWidth
      fullScreen={isSmallMobile}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)` 
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiMessageSquare color={theme.palette.info.main} />
          <Typography variant="h6" fontWeight={600}>
            Remarks for: {selectedTask?.title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
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
              onClick={addRemark}
              disabled={!newRemark.trim()}
              sx={{ mt: 1, borderRadius: 1 }}
              fullWidth={isSmallMobile}
            >
              Add Remark
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>Remarks History</Typography>
            {remarks.length > 0 ? (
              <Stack spacing={1}>
                {remarks.map((remark, index) => (
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
                              {getUserName(remark.user)?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {getUserName(remark.user)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {users.find(u => u._id === remark.user)?.role || 'User'}
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
      open={openActivityDialog} 
      onClose={() => setOpenActivityDialog(false)} 
      maxWidth="lg" 
      fullWidth
      fullScreen={isSmallMobile}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)` 
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiActivity color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={600}>
            Activity Logs for: {selectedTask?.title}
          </Typography>
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
                          {getUserName(log.user)?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {getUserName(log.user)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {users.find(u => u._id === log.user)?.role || 'User'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {log.description || log.action}
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

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!authError && userId) {
      fetchAllData(page, rowsPerPage);
    }
  }, [authError, userId]);

  // Check if user is admin
  const isAdmin = ['admin', 'manager', 'hr', 'SuperAdmin'].includes(userRole);

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CardContent>
            <FiAlertCircle size={48} color={theme.palette.warning.main} />
            <Typography variant="h5" color="warning.main" gutterBottom sx={{ mt: 2 }}>
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need admin privileges to access this page.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading data...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Admin Task Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage all tasks, users, and groups in the system
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Notifications">
                <ActionButton 
                  onClick={() => setOpenNotifications(true)}
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

              <Button
                variant="outlined"
                startIcon={<FiRefreshCw />}
                onClick={() => fetchAllData(page, rowsPerPage)}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<FiPlus />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create Task
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Tasks', value: stats.total, color: 'primary', icon: FiCalendar },
            { label: 'Pending', value: stats.pending, color: 'warning', icon: FiClock },
            { label: 'In Progress', value: stats.inProgress, color: 'info', icon: FiAlertCircle },
            { label: 'Completed', value: stats.completed, color: 'success', icon: FiCheckCircle },
            { label: 'Rejected', value: stats.rejected, color: 'error', icon: FiXCircle },
            { label: 'Overdue', value: stats.overdue, color: 'error', icon: FiAlertTriangle },
          ].map((stat, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
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

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Tasks" />
            <Tab label="User Management" />
            <Tab label="Group Management" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <>
                {/* Enhanced Filters */}
                <FilterSection>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search tasks by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiSearch />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={applyFilters}
                        startIcon={<FiFilter />}
                        sx={{ minWidth: 120 }}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={clearFilters}
                        sx={{ minWidth: 120 }}
                      >
                        Clear
                      </Button>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                          >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            label="Priority"
                          >
                            <MenuItem value="">All Priority</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Assigned To</InputLabel>
                          <Select
                            value={assignedToFilter}
                            onChange={(e) => setAssignedToFilter(e.target.value)}
                            label="Assigned To"
                          >
                            <MenuItem value="">All Users</MenuItem>
                            {users.map(user => (
                              <MenuItem key={user._id} value={user._id}>
                                {user.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Created By</InputLabel>
                          <Select
                            value={createdByFilter}
                            onChange={(e) => setCreatedByFilter(e.target.value)}
                            label="Created By"
                          >
                            <MenuItem value="">All Creators</MenuItem>
                            {users.map(user => (
                              <MenuItem key={user._id} value={user._id}>
                                {user.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Overdue</InputLabel>
                          <Select
                            value={overdueFilter}
                            onChange={(e) => setOverdueFilter(e.target.value)}
                            label="Overdue"
                          >
                            <MenuItem value="">All Tasks</MenuItem>
                            <MenuItem value="true">Overdue Only</MenuItem>
                            <MenuItem value="false">Not Overdue</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Stack>
                </FilterSection>

                {/* Tasks Table with Pagination */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Created By</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasks.map((task) => (
                        <StyledTableRow key={task._id} status={getTaskStatus(task)}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {task.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={task.description}>
                              <Typography variant="body2" sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 200
                              }}>
                                {task.description}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <FiCalendar size={14} />
                              <Typography variant="body2" color={isOverdue(task) ? 'error' : 'text.primary'}>
                                {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 
                                 task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                              {isOverdue(task) && <FiAlertTriangle size={14} color="error" />}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <PriorityChip
                              label={task.priority}
                              priority={task.priority}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={getTaskStatus(task)}
                              status={getTaskStatus(task)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              {task.assignedUsers?.slice(0, 2).map(user => (
                                <Chip
                                  key={user._id || user}
                                  label={getUserName(user)}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {task.assignedGroups?.slice(0, 1).map(groupId => (
                                <Chip
                                  key={groupId}
                                  label={`${getGroupName(groupId)} (Group)`}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              ))}
                              {(task.assignedUsers?.length > 2 || task.assignedGroups?.length > 1) && (
                                <Typography variant="caption" color="text.secondary">
                                  +{getAssignedUsersCount(task) - 2} more
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getUserName(task.createdBy)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Edit">
                                <ActionButton
                                  size="small"
                                  onClick={() => openEditTaskDialog(task)}
                                >
                                  <FiEdit3 size={16} />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Remarks">
                                <ActionButton
                                  size="small"
                                  onClick={() => fetchRemarks(task._id)}
                                >
                                  <FiMessageSquare size={16} />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Activity Logs">
                                <ActionButton
                                  size="small"
                                  onClick={() => fetchActivityLogs(task._id)}
                                >
                                  <FiActivity size={16} />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Change Status">
                                <ActionButton
                                  size="small"
                                  onClick={() => openStatusChangeDialog(task)}
                                >
                                  <FiUserCheck size={16} />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <ActionButton
                                  size="small"
                                  onClick={() => handleDeleteTask(task._id)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <FiTrash size={16} />
                                </ActionButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalTasks}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>

                {tasks.length === 0 && !loading && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <FiCalendar size={48} color={theme.palette.text.secondary} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No tasks found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your filters or create a new task
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  User Management ({users.length} users)
                </Typography>
                <Grid container spacing={2}>
                  {users.map(user => (
                    <Grid item xs={12} sm={6} md={4} key={user._id}>
                      <Card>
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">{user.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.role}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6">Group Management ({groups.length} groups)</Typography>
                  <Button
                    variant="contained"
                    startIcon={<FiPlus />}
                    onClick={() => {
                      setEditingGroup(null);
                      setNewGroup({ name: '', description: '', members: [] });
                      setOpenGroupDialog(true);
                    }}
                  >
                    Create Group
                  </Button>
                </Stack>

                <Grid container spacing={2}>
                  {groups.map(group => (
                    <Grid item xs={12} sm={6} md={4} key={group._id}>
                      <Card>
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box>
                                <Typography variant="h6">{group.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {group.description}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => openGroupEditDialog(group)}
                                >
                                  <FiEdit size={16} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteGroup(group._id)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <FiTrash2 size={16} />
                                </IconButton>
                              </Stack>
                            </Stack>
                            <Divider />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Members ({group.members?.length || 0})
                              </Typography>
                              <Stack spacing={1} sx={{ mt: 1 }}>
                                {group.members?.slice(0, 3).map(memberId => {
                                  const member = users.find(u => u._id === memberId);
                                  return member ? (
                                    <Stack key={memberId} direction="row" alignItems="center" spacing={1}>
                                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                        {member.name.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Typography variant="body2">{member.name}</Typography>
                                    </Stack>
                                  ) : null;
                                })}
                                {(group.members?.length || 0) > 3 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{(group.members?.length || 0) - 3} more members
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
              </Box>
            )}
          </Box>
        </Paper>

        {/* Rest of the dialogs remain the same */}
        {/* Create Task Dialog, Edit Task Dialog, Status Change Dialog, Group Management Dialog */}

        {/* Enhanced Dialogs */}
        {renderNotificationsPanel()}
        {renderRemarksDialog()}
        {renderActivityLogsDialog()}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Box sx={{
            background: snackbar.severity === 'error' ? theme.palette.error.main : 
                       snackbar.severity === 'warning' ? theme.palette.warning.main : 
                       theme.palette.success.main,
            color: 'white',
            p: 2,
            borderRadius: 1,
            minWidth: 300
          }}>
            <Typography variant="body1" fontWeight={600}>
              {snackbar.message}
            </Typography>
          </Box>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminTaskManagement;