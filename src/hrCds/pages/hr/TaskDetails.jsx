import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, Card, CardContent, Avatar, CircularProgress,
  Snackbar, Grid, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Badge, OutlinedInput, Fade, Modal
} from '@mui/material';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FiPlus, FiCalendar, FiInfo, FiPaperclip, FiMic, FiFileText,
  FiCheck, FiX, FiAlertCircle, FiUser, FiBell, FiRefreshCw,
  FiMessageSquare, FiActivity, FiDownload, FiClock, FiCheckCircle,
  FiXCircle, FiFilter, FiSearch, FiLogOut, FiMessageCircle,
  FiChevronLeft, FiChevronRight, FiX as FiClose
} from 'react-icons/fi';
import { useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Enhanced Styled Components
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
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const CalendarFilterButton = styled(Button)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  background: active ? `${theme.palette.primary.main}15` : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 600 : 400,
  textTransform: 'none',
  minWidth: 'auto',
  px: 2,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
  },
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

const UserCreateTask = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Task Management States - OPTIMIZED
  const [myTasksGrouped, setMyTasksGrouped] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Client-side stats calculation (API call hatake)
  const [clientStats, setClientStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });

  // Pagination States
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: true
  });

  // Enhanced Features States
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [remarksDialog, setRemarksDialog] = useState({ open: false, taskId: null, remarks: [] });
  const [newRemark, setNewRemark] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityDialog, setActivityDialog] = useState({ open: false, taskId: null });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Calendar Filter States
  const [calendarFilterOpen, setCalendarFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateFilterType, setDateFilterType] = useState('dueDate');
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  // Task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDateTime: null,
    priority: 'medium',
    priorityDays: '1',
    files: null,
    voiceNote: null,
    assignedUsers: [],
    assignedGroups: []
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Helper function to count all tasks
  const countAllTasks = (groupedTasks) => {
    let count = 0;
    Object.values(groupedTasks).forEach(dateTasks => {
      if (Array.isArray(dateTasks)) {
        count += dateTasks.length;
      }
    });
    return count;
  };

  // FIXED: Proper date grouping function with correct sorting
  const groupTasksByCreatedDate = (tasks) => {
    const grouped = {};
    
    if (!Array.isArray(tasks)) return grouped;
    
    tasks.forEach((task) => {
      let dateObj;
      
      // Try different date fields
      if (task.createdAt) {
        dateObj = new Date(task.createdAt);
        if (isNaN(dateObj.getTime())) {
          dateObj = null;
        }
      }
      
      if (!dateObj && task.createdDate) {
        dateObj = new Date(task.createdDate);
        if (isNaN(dateObj.getTime())) {
          dateObj = null;
        }
      }
      
      if (!dateObj && task.updatedAt) {
        dateObj = new Date(task.updatedAt);
        if (isNaN(dateObj.getTime())) {
          dateObj = null;
        }
      }
      
      if (!dateObj && task.dueDateTime) {
        dateObj = new Date(task.dueDateTime);
        if (isNaN(dateObj.getTime())) {
          dateObj = null;
        }
      }
      
      // Final fallback
      if (!dateObj) {
        dateObj = new Date();
      }

      const dateKey = dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          tasks: [],
          date: dateObj
        };
      }
      grouped[dateKey].tasks.push(task);
    });
    
    // Sort the groups by date (newest first)
    const sortedEntries = Object.entries(grouped).sort(([, a], [, b]) => {
      return b.date.getTime() - a.date.getTime();
    });
    
    const result = {};
    sortedEntries.forEach(([dateKey, groupData]) => {
      result[dateKey] = groupData.tasks;
    });
    
    return result;
  };

  // NEW: Client-side stats calculation (API call ki jagah)
  const calculateStatsFromTasks = useCallback((tasks) => {
    let total = 0;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let rejected = 0;

    Object.values(tasks).forEach(dateTasks => {
      if (Array.isArray(dateTasks)) {
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
      }
    });

    return { total, pending, inProgress, completed, rejected };
  }, [userId]);

  // User authentication check
  const fetchUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Please log in to access tasks',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || !user.role || !user.id || !user.name) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Invalid user data. Please log in again.',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      setUserRole(user.role);
      setUserId(user.id);
      setUserName(user.name);
      setAuthError(false);
      
      setNewTask(prev => ({
        ...prev,
        assignedUsers: [user.id]
      }));
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthError(true);
      setSnackbar({
        open: true,
        message: 'Error loading user data. Please log in again.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  // OPTIMIZED: Single API call for tasks with integrated stats
  const fetchMyTasks = useCallback(async (page = 1, isLoadMore = false) => {
    if (authError || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const url = `/task?${params}`;
      const res = await axios.get(url);
      
      console.log('📊 Tasks API RESPONSE:', res.data);

      // Handle different response formats
      let tasksArray = [];
      if (Array.isArray(res.data.tasks)) {
        tasksArray = res.data.tasks;
      } else if (Array.isArray(res.data.groupedTasks)) {
        tasksArray = res.data.groupedTasks;
      } else if (res.data.groupedTasks && typeof res.data.groupedTasks === 'object') {
        // If it's already grouped, flatten it
        tasksArray = Object.values(res.data.groupedTasks).flat();
      } else if (res.data.data && Array.isArray(res.data.data)) {
        tasksArray = res.data.data;
      }
      
      // Group tasks by creation date properly with latest first
      const newTasks = groupTasksByCreatedDate(tasksArray);
      
      if (isLoadMore && page > 1) {
        // Merge new tasks with existing ones for load more
        const mergedTasks = { ...myTasksGrouped };
        Object.entries(newTasks).forEach(([date, tasks]) => {
          if (mergedTasks[date]) {
            const existingTaskIds = new Set(mergedTasks[date].map(task => task._id));
            const newUniqueTasks = tasks.filter(task => !existingTaskIds.has(task._id));
            mergedTasks[date] = [...mergedTasks[date], ...newUniqueTasks];
          } else {
            mergedTasks[date] = tasks;
          }
        });
        setMyTasksGrouped(mergedTasks);
      } else {
        setMyTasksGrouped(newTasks);
      }

      // Update all tasks flat array
      const allTasksFlat = Object.values(newTasks).flat();
      if (isLoadMore && page > 1) {
        setAllTasks(prev => [...prev, ...allTasksFlat]);
      } else {
        setAllTasks(allTasksFlat);
      }

      // Calculate stats from tasks (API call hatake)
      const calculatedStats = calculateStatsFromTasks(newTasks);
      setClientStats(calculatedStats);

      setPagination(prev => ({
        ...prev,
        page,
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        hasMore: page < (res.data.totalPages || 0)
      }));

    } catch (err) {
      console.error('Error fetching tasks:', err);
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
  }, [authError, userId, statusFilter, searchTerm, pagination.limit, myTasksGrouped, calculateStatsFromTasks]);

  // Load more tasks function
  const loadMoreTasks = () => {
    if (pagination.hasMore && !loading) {
      fetchMyTasks(pagination.page + 1, true);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMyTasks(1, false);
  }, [statusFilter, searchTerm]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        if (pagination.hasMore && !loading) {
          loadMoreTasks();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination.hasMore, loading]);

  // Enhanced Notifications Functions
  const fetchNotifications = async () => {
    if (authError || !userId) return;
    
    try {
      const res = await axios.get('/task/notifications/all');
      setNotifications(res.data.notifications || []);
      setUnreadNotificationCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/task/notifications/${notificationId}/read`);
      fetchNotifications();
      setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch('/task/notifications/read-all');
      fetchNotifications();
      setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Enhanced Remarks Functions
  const fetchTaskRemarks = async (taskId) => {
    try {
      const res = await axios.get(`/task/${taskId}/remarks`);
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
      fetchTaskRemarks(taskId);
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
      setActivityLogs(res.data.logs || []);
      setActivityDialog({ open: true, taskId });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setSnackbar({ open: true, message: 'Failed to load activity logs', severity: 'error' });
    }
  };

  // Calendar Filter Functions - OPTIMIZED
  const applyDateFilter = useCallback((tasks) => {
    if (!selectedDate && !dateRange.start && !dateRange.end) {
      return tasks;
    }

    const filteredTasks = {};

    Object.entries(tasks).forEach(([dateKey, dateTasks]) => {
      if (!Array.isArray(dateTasks)) return;
      
      const filteredDateTasks = dateTasks.filter(task => {
        let taskDate;
        
        if (dateFilterType === 'dueDate') {
          taskDate = task.dueDateTime ? new Date(task.dueDateTime) : null;
        } else {
          taskDate = task.createdAt ? new Date(task.createdAt) : null;
        }

        if (!taskDate) return false;

        // Single date filter
        if (selectedDate && !dateRange.start && !dateRange.end) {
          const selected = new Date(selectedDate);
          return (
            taskDate.getDate() === selected.getDate() &&
            taskDate.getMonth() === selected.getMonth() &&
            taskDate.getFullYear() === selected.getFullYear()
          );
        }

        // Date range filter
        if (dateRange.start && dateRange.end) {
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);

          return taskDate >= start && taskDate <= end;
        }

        return true;
      });

      if (filteredDateTasks.length > 0) {
        filteredTasks[dateKey] = filteredDateTasks;
      }
    });

    return filteredTasks;
  }, [selectedDate, dateRange, dateFilterType]);

  const clearDateFilter = () => {
    setSelectedDate(null);
    setDateRange({ start: null, end: null });
    setCalendarFilterOpen(false);
  };

  const getDateFilterSummary = () => {
    if (selectedDate) {
      return `Date: ${new Date(selectedDate).toLocaleDateString('en-IN')}`;
    }
    if (dateRange.start && dateRange.end) {
      return `Range: ${new Date(dateRange.start).toLocaleDateString('en-IN')} - ${new Date(dateRange.end).toLocaleDateString('en-IN')}`;
    }
    return null;
  };

  // OPTIMIZED: Refresh button - Ab sirf ek hi API call
  const handleRefresh = () => {
    fetchMyTasks(1, false);
  };

  // Memoized filtered tasks for better performance
  const filteredTasks = useMemo(() => {
    return applyDateFilter(myTasksGrouped);
  }, [myTasksGrouped, applyDateFilter]);

  // Get individual user status for a task
  const getUserStatusForTask = (task, userId) => {
    const userStatus = task.statusByUser?.find(s => 
      s.user === userId || s.user?._id === userId
    );
    return userStatus?.status || 'pending';
  };

  // Status Change Handler - OPTIMIZED
  const handleStatusChange = async (taskId, newStatus, remarks = '') => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to update task status',
        severity: 'error'
      });
      return;
    }

    try {
      await axios.patch(`/task/${taskId}/status`, { 
        status: newStatus, 
        remarks: remarks || `Status changed to ${newStatus}`
      });

      fetchMyTasks(pagination.page, false);
      fetchNotifications();
      
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

  // Task creation handler
  const handleCreateTask = async () => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to create tasks',
        severity: 'error'
      });
      return;
    }

    if (!newTask.title || !newTask.description || !newTask.dueDateTime) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields (Title, Description, Due Date)',
        severity: 'error'
      });
      return;
    }

    if (newTask.dueDateTime && new Date(newTask.dueDateTime) < new Date()) {
      setSnackbar({
        open: true,
        message: 'Due date cannot be in the past',
        severity: 'error'
      });
      return;
    }

    setIsCreatingTask(true);

    try {
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('dueDateTime', new Date(newTask.dueDateTime).toISOString());
      formData.append('priorityDays', newTask.priorityDays || '1');
      formData.append('priority', newTask.priority);

      // Determine which endpoint to use based on assignment type
      const isAssigningToOthers = newTask.assignedUsers && 
                                  newTask.assignedUsers.length > 0 && 
                                  !newTask.assignedUsers.includes(userId);

      const endpoint = isAssigningToOthers ? '/task/create-for-others' : '/task/create-self';

      // Only include assignment data when assigning to others
      if (isAssigningToOthers) {
        formData.append('assignedUsers', JSON.stringify(newTask.assignedUsers));
        formData.append('assignedGroups', JSON.stringify(newTask.assignedGroups || []));
      }

      if (newTask.files) {
        for (let i = 0; i < newTask.files.length; i++) {
          formData.append('files', newTask.files[i]);
        }
      }

      if (newTask.voiceNote) {
        formData.append('voiceNote', newTask.voiceNote);
      }

      await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setOpenDialog(false);
      setSnackbar({ 
        open: true, 
        message: `Task ${isAssigningToOthers ? 'assigned' : 'created'} successfully`, 
        severity: 'success' 
      });
      
      // Reset form
      setNewTask({
        title: '', 
        description: '', 
        dueDateTime: null, 
        priority: 'medium', 
        priorityDays: '1', 
        files: null, 
        voiceNote: null,
        assignedUsers: [userId], // Default to self
        assignedGroups: []
      });

      // Refresh tasks list (sirf ek API call)
      fetchMyTasks(1, false);
      fetchNotifications();

    } catch (err) {
      console.error('Error creating task:', err);
      
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
          message: err?.response?.data?.error || 'Task creation failed', 
          severity: 'error' 
        });
      }
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isOverdue = (dueDateTime) => {
    if (!dueDateTime) return false;
    return new Date(dueDateTime) < new Date();
  };

  // Enhanced table cell with new action buttons
  const renderActionButtons = (task) => {
    return (
      <Stack direction="row" spacing={0.5}>
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

        {task.files?.length > 0 && (
          <Tooltip title="Download Files">
            <ActionButton
              size="small"
              href={`http://localhost:5000/${task.files[0].path || task.files[0]}`}
              target="_blank"
              sx={{ 
                color: theme.palette.success.main,
                '&:hover': { backgroundColor: `${theme.palette.success.main}10` }
              }}
            >
              <FiDownload size={isSmallMobile ? 14 : 16} />
            </ActionButton>
          </Tooltip>
        )}
      </Stack>
    );
  };

  // Status Select Component
  const renderStatusSelect = (task) => {
    const myStatus = getUserStatusForTask(task, userId);
    
    return (
      <FormControl size="small" sx={{ minWidth: isSmallMobile ? 100 : 120 }}>
        <Select
          value={myStatus}
          onChange={(e) => handleStatusChange(task._id, e.target.value)}
          sx={{
            borderRadius: theme.shape.borderRadius,
            '& .MuiSelect-select': {
              py: 1,
              fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
            }
          }}
        >
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>
    );
  };

  // Load More Component
  const renderLoadMore = () => {
    if (!pagination.hasMore || countAllTasks(filteredTasks) === 0) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={loadMoreTasks}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <FiRefreshCw />}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Loading...' : 'Load More Tasks'}
        </Button>
      </Box>
    );
  };

  // Pagination info
  const renderPaginationInfo = () => {
    const totalTasksCount = countAllTasks(filteredTasks);
    
    if (totalTasksCount === 0) return null;

    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
        Showing {totalTasksCount} of {pagination.total} tasks
        {pagination.hasMore && ' • Scroll down to load more'}
      </Typography>
    );
  };

  // OPTIMIZED: Statistics Cards - Ab client-side calculation se
  // const renderStatsCards = () => (
  //   <Grid container spacing={2} sx={{ mb: 3 }}>
  //     {[
  //       { label: 'Total Tasks', value: clientStats.total, color: 'primary', icon: FiCalendar },
  //       { label: 'Pending', value: clientStats.pending, color: 'warning', icon: FiClock },
  //       { label: 'In Progress', value: clientStats.inProgress, color: 'info', icon: FiAlertCircle },
  //       { label: 'Completed', value: clientStats.completed, color: 'success', icon: FiCheckCircle },
  //       { label: 'Rejected', value: clientStats.rejected, color: 'error', icon: FiXCircle },
  //     ].map((stat, index) => (
  //       <Grid item xs={6} sm={4} md={2.4} key={index}>
  //         <StatCard color={stat.color}>
  //           <CardContent sx={{ p: 2 }}>
  //             <Stack direction="row" alignItems="center" spacing={1}>
  //               <Avatar sx={{
  //                 bgcolor: `${theme.palette[stat.color].main}20`,
  //                 color: theme.palette[stat.color].main,
  //                 width: 40,
  //                 height: 40
  //               }}>
  //                 <stat.icon size={18} />
  //               </Avatar>
  //               <Box sx={{ flex: 1, minWidth: 0 }}>
  //                 <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ 
  //                   fontSize: { xs: '0.7rem', sm: '0.75rem' },
  //                   overflow: 'hidden',
  //                   textOverflow: 'ellipsis',
  //                   whiteSpace: 'nowrap'
  //                 }}>
  //                   {stat.label}
  //                 </Typography>
  //                 <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
  //                   {stat.value}
  //                 </Typography>
  //               </Box>
  //             </Stack>
  //           </CardContent>
  //         </StatCard>
  //       </Grid>
  //     ))}
  //   </Grid>
  // );

  // Render Desktop Table
  const renderDesktopTable = (groupedTasks) => {
    const tasksToRender = applyDateFilter(groupedTasks);
    
    return Object.entries(tasksToRender).map(([dateKey, tasks]) => (
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
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)` 
              }}>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Files</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Actions</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: isSmallMobile ? '0.8rem' : '0.9rem', py: 2 }}>Change Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const myStatus = getUserStatusForTask(task, userId);

                return (
                  <TableRow key={task._id} sx={{ 
                    background: `${theme.palette[statusColors[myStatus]].main}05`,
                    borderLeft: `4px solid ${theme.palette[statusColors[myStatus]].main}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}08`,
                    }
                  }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: isSmallMobile ? '0.8rem' : '0.875rem' }}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: 200 }}>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  // Enhanced mobile cards with action buttons
  const renderMobileCards = (groupedTasks) => {
    const tasksToRender = applyDateFilter(groupedTasks);
    
    return Object.entries(tasksToRender).map(([dateKey, tasks]) => (
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

            return (
              <MobileTaskCard key={task._id} status={myStatus}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    {/* Header Section */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ 
                          fontSize: '1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {task.description}
                        </Typography>
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

  const renderGroupedTasks = (groupedTasks) => {
    const tasksToRender = applyDateFilter(groupedTasks);
    const totalTasksCount = countAllTasks(tasksToRender);
    
    if (totalTasksCount === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <FiCalendar size={isMobile ? 48 : 64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
            {selectedDate || dateRange.start || dateRange.end || statusFilter || searchTerm 
              ? 'No tasks found for current filters' 
              : 'No tasks found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedDate || dateRange.start || dateRange.end || statusFilter || searchTerm 
              ? 'Try changing your filters' 
              : 'You have no tasks assigned yet'}
          </Typography>
          {(selectedDate || dateRange.start || dateRange.end || statusFilter || searchTerm) && (
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedDate(null);
                setDateRange({ start: null, end: null });
                setStatusFilter('');
                setSearchTerm('');
              }}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Clear All Filters
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 2, borderRadius: 2, ml: (selectedDate || dateRange.start || dateRange.end || statusFilter || searchTerm) ? 1 : 0 }}
          >
            Create New Task
          </Button>
        </Box>
      );
    }

    return (
      <>
        {isMobile ? renderMobileCards(groupedTasks) : renderDesktopTable(groupedTasks)}
        {renderLoadMore()}
        {renderPaginationInfo()}
      </>
    );
  };

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
          {/* Add New Remark */}
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
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }} 
                    spacing={1}
                  >
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

                    {/* ⭐ UPDATED DATE + TIME */}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.createdAt).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(log.createdAt).toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {log.description}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {/* <Chip 
                      label={log.action} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ fontWeight: 600 }}
                    /> */}
                  
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


      // Calendar Filter Dialog
      const renderCalendarFilterDialog = () => (
        <Dialog
          open={calendarFilterOpen}
          onClose={() => setCalendarFilterOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`
          }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FiCalendar color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={600}>Filter by Date</Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Date Type Selection */}
              <FormControl fullWidth>
                <InputLabel>Filter By</InputLabel>
                <Select
                  value={dateFilterType}
                  onChange={(e) => setDateFilterType(e.target.value)}
                  label="Filter By"
                >
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="createdDate">Created Date</MenuItem>
                </Select>
              </FormControl>

              {/* Single Date Selection */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Select Specific Date
                </Typography>
                <DatePicker
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                    setDateRange({ start: null, end: null });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </Box>

              {/* Date Range Selection */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Or Select Date Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={dateRange.start}
                      onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={dateRange.end}
                      onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Quick Filters */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Quick Filters
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <CalendarFilterButton
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setDateRange({ start: null, end: null });
                    }}
                    active={selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString()}
                  >
                    Today
                  </CalendarFilterButton>
                  <CalendarFilterButton
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(tomorrow);
                      setDateRange({ start: null, end: null });
                    }}
                    active={selectedDate && new Date(selectedDate).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()}
                  >
                    Tomorrow
                  </CalendarFilterButton>
                  <CalendarFilterButton
                    onClick={() => {
                      const start = new Date();
                      const end = new Date();
                      end.setDate(end.getDate() + 7);
                      setSelectedDate(null);
                      setDateRange({ start, end });
                    }}
                    active={dateRange.start && dateRange.end && new Date(dateRange.start).toDateString() === new Date().toDateString()}
                  >
                    Next 7 Days
                  </CalendarFilterButton>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              onClick={clearDateFilter}
              variant="outlined"
              startIcon={<FiClose />}
              sx={{ borderRadius: 1 }}
            >
              Clear Filter
            </Button>
            <Button
              onClick={() => setCalendarFilterOpen(false)}
              variant="contained"
              sx={{ borderRadius: 1 }}
            >
              Apply Filter
            </Button>
          </DialogActions>
        </Dialog>
      );

      // CREATE TASK DIALOG
      const renderCreateTaskDialog = () => (
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 2,
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
                  Create Personal Task
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  This task will be assigned to: {userName}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: isMobile ? 2 : 3 }}>
              <Stack spacing={isMobile ? 2 : 3}>
                {/* Assignment Info */}
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    This task will be automatically assigned to you ({userName})
                  </Typography>
                </Alert>

                {/* Basic Information */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  borderRadius: 1, 
                  border: 1, 
                  borderColor: 'divider',
                  background: 'white',
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiInfo size={18} color={theme.palette.primary.main} />
                    Task Details
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
                      size={isMobile ? "small" : "medium"}
                    />

                    <TextField
                      fullWidth
                      label="Description *"
                      multiline
                      rows={isMobile ? 3 : 4}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      variant="outlined"
                      placeholder="Provide detailed description of the task..."
                      sx={{ borderRadius: 1 }}
                      size={isMobile ? "small" : "medium"}
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
                              size={isMobile ? "small" : "medium"}
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
                            size={isMobile ? "small" : "medium"}
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
                          size={isMobile ? "small" : "medium"}
                        />
                      </Grid>
                     
                    </Grid>
                  </Stack>
                </Box>

                {/* File Uploads */}
                <Box sx={{ 
                  p: isMobile ? 2 : 3, 
                  borderRadius: 1, 
                  border: 1, 
                  borderColor: 'divider',
                  background: 'white',
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiPaperclip size={18} color={theme.palette.primary.main} />
                    Attachments (Optional)
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
                      fullWidth={isMobile}
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
                      fullWidth={isMobile}
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
              </Stack>
            </Box>
          </DialogContent>

          <DialogActions sx={{ 
            p: isMobile ? 2 : 3, 
            borderTop: 1, 
            borderColor: 'divider',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 1,
                px: 3,
              }}
              fullWidth={isMobile}
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
                minWidth: isMobile ? 'auto' : '120px'
              }}
              fullWidth={isMobile}
            >
              {isCreatingTask ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogActions>
        </Dialog>
      );

      // Search Component
      const renderSearch = () => (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <TextField
            fullWidth
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <FiSearch style={{ marginRight: 8, color: '#666' }} />
            }}
            size="small"
          />
        </Paper>
      );

      useEffect(() => {
        fetchUserData();
      }, []);

      // OPTIMIZED: Initial load - Ab sirf ek hi API call
      useEffect(() => {
        if (!authError && userId) {
          fetchMyTasks(1, false);
          fetchNotifications();
        }
      }, [authError, userId]);

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
                  Please log in to access tasks.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  startIcon={<FiUser />}
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

      if (loading && pagination.page === 1) {
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
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
              {/* Header */}
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: 3,
                  borderRadius: { xs: 2, sm: 3 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                  boxShadow: 2,
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
                      My Task Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Manage and track your personal tasks efficiently
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

                    {/* Create Task Button */}
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

              {/* Search Box */}
              {/* {renderSearch()} */}

              {/* Statistics Cards - CLIENT-SIDE CALCULATION SE */}
              {/* {renderStatsCards()} */}

              {/* Tasks Section */}
              <Paper sx={{
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: 1,
                overflow: 'hidden'
              }}>
                {/* Filter Section */}
                <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Typography variant="h5" fontWeight={700}>
                      My Tasks
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      {/* Calendar Filter Button */}
                      <Tooltip title="Filter by Date">
                        <CalendarFilterButton
                          onClick={() => setCalendarFilterOpen(true)}
                          active={selectedDate || dateRange.start || dateRange.end}
                          startIcon={<FiCalendar size={16} />}
                        >
                          {getDateFilterSummary() || 'Date Filter'}
                        </CalendarFilterButton>
                      </Tooltip>

                      {/* Status Filter */}
                      <FormControl size="small" sx={{ minWidth: 150 }}>
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

                      {/* Clear Date Filter Button */}
                      {(selectedDate || dateRange.start || dateRange.end) && (
                        <Tooltip title="Clear Date Filter">
                          <ActionButton 
                            onClick={clearDateFilter}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: `${theme.palette.error.main}10`,
                                color: theme.palette.error.main
                              }
                            }}
                          >
                            <FiClose size={16} />
                          </ActionButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Refresh">
                        <ActionButton 
                          onClick={handleRefresh}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: `${theme.palette.primary.main}10`,
                            }
                          }}
                        >
                          <FiRefreshCw size={18} />
                        </ActionButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {/* Date Filter Summary */}
                  {(selectedDate || dateRange.start || dateRange.end) && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiFilter size={16} color={theme.palette.primary.main} />
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          Active Date Filter: {getDateFilterSummary()}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </Box>

                {/* Tasks Content */}
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                  {renderGroupedTasks(myTasksGrouped)}
                  {loading && pagination.page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Loading more tasks...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* DIALOGS */}
              {renderCreateTaskDialog()}
              {renderCalendarFilterDialog()}
              {renderNotificationsPanel()}
              {renderRemarksDialog()}
              {renderActivityLogsDialog()}

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

    export default UserCreateTask;