import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, Card, CardContent, Avatar, CircularProgress,
  Snackbar, Grid, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Badge, OutlinedInput, Fade, Modal, useTheme, useMediaQuery
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
  FiBarChart2, FiTrendingUp, FiList, FiPause, FiTarget, FiUsers,
  FiSlash, FiImage, FiCamera, FiTrash2, FiZoomIn, FiCheckSquare,
  FiGlobe, FiSun, FiRotateCcw
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';

// Enhanced Styled Components
const StatCard = styled(Card, {
  shouldForwardProp: (prop) => !['color', 'clickable', 'active'].includes(prop)
})(({ theme, color = 'primary', clickable = true, active = false }) => ({
  background: active 
    ? `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].main}08 100%)`
    : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  height: '100%',
  cursor: clickable ? 'pointer' : 'default',
  '&:hover': clickable ? {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  } : {},
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status'
})(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  minWidth: 80,
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}15`,
    color: theme.palette.warning.dark,
  }),
  ...(status === 'in-progress' && {
    background: `${theme.palette.info.main}15`,
    color: theme.palette.info.dark,
  }),
  ...(status === 'completed' && {
    background: `${theme.palette.success.main}15`,
    color: theme.palette.success.dark,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}15`,
    color: theme.palette.error.dark,
  }),
  ...(status === 'onhold' && {
    background: `${theme.palette.warning.light}25`,
    color: theme.palette.warning.dark,
  }),
  ...(status === 'reopen' && {
    background: `${theme.palette.secondary.main}15`,
    color: theme.palette.secondary.dark,
  }),
  ...(status === 'cancelled' && {
    background: `${theme.palette.grey[500]}20`,
    color: theme.palette.grey[700],
  }),
  ...(status === 'overdue' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
}));

const PriorityChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.65rem',
  borderRadius: theme.shape.borderRadius * 2,
}));

const MobileTaskCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  marginBottom: theme.spacing(1.5),
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CalendarFilterButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  minWidth: 'auto',
  padding: theme.spacing(0.5, 2),
}));

const TimeFilterButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  minWidth: "auto",
  padding: theme.spacing(0.5, 1.5),
  fontSize: "0.75rem",
  transition: "all 0.2s ease",
}));

// Image Upload Components
const ImageUploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: theme.palette.error.main,
  color: 'white',
  width: 24,
  height: 24,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

const ZoomModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Status constants
const statusColors = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  rejected: 'error',
  onhold: 'warning',
  reopen: 'secondary',
  cancelled: 'grey',
  overdue: 'error'
};

const statusIcons = {
  pending: FiClock,
  'in-progress': FiAlertCircle,
  completed: FiCheckCircle,
  rejected: FiXCircle,
  onhold: FiClock,
  reopen: FiRefreshCw,
  cancelled: FiXCircle,
  overdue: FiAlertCircle
};

const getStatusColor = (status, theme) => {
  const colors = {
    'pending': theme.palette.warning.main,
    'in-progress': theme.palette.info.main,
    'completed': theme.palette.success.main,
    'rejected': theme.palette.error.main,
    'onhold': theme.palette.grey[500],
    'reopen': theme.palette.warning.dark,
    'cancelled': theme.palette.grey[700],
    'overdue': theme.palette.error.dark
  };
  return colors[status] || theme.palette.text.secondary;
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

  // Task Management States
  const [myTasksGrouped, setMyTasksGrouped] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats State
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: { count: 0, percentage: 0 },
    inProgress: { count: 0, percentage: 0 },
    completed: { count: 0, percentage: 0 },
    rejected: { count: 0, percentage: 0 },
    onHold: { count: 0, percentage: 0 },
    reopen: { count: 0, percentage: 0 },
    cancelled: { count: 0, percentage: 0 },
    overdue: { count: 0, percentage: 0 }
  });

  // Time Filter State
  const [timeFilter, setTimeFilter] = useState("all");

  // Enhanced Features States
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [remarksDialog, setRemarksDialog] = useState({ open: false, taskId: null, remarks: [] });
  const [newRemark, setNewRemark] = useState('');
  const [remarkImages, setRemarkImages] = useState([]);
  const [isUploadingRemark, setIsUploadingRemark] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityDialog, setActivityDialog] = useState({ open: false, taskId: null });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

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
  });

  const [pendingStatusChange, setPendingStatusChange] = useState({ taskId: null, status: '' });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // User authentication check
  const fetchUserData = useCallback(() => {
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
      if (!user?.role || !user?.id || !user?.name) {
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
  }, []);

  // Get individual user status for a task
  const getUserStatusForTask = useCallback((task, userId) => {
    if (!task || !userId) return 'pending';
    
    const userStatus = task.statusByUser?.find(s => {
      if (typeof s.user === 'string') return s.user === userId;
      if (s.user && typeof s.user === 'object') return s.user._id === userId;
      return false;
    });
    
    if (userStatus) return userStatus.status || 'pending';
    
    const statusInfo = task.statusInfo?.find(s => s.userId === userId);
    if (statusInfo) return statusInfo.status || 'pending';
    
    return 'pending';
  }, []);

  // Calculate stats from tasks data
  const calculateStatsFromTasks = useCallback((tasks) => {
    if (!tasks || Object.keys(tasks).length === 0) {
      setTaskStats({
        total: 0,
        pending: { count: 0, percentage: 0 },
        inProgress: { count: 0, percentage: 0 },
        completed: { count: 0, percentage: 0 },
        rejected: { count: 0, percentage: 0 },
        onHold: { count: 0, percentage: 0 },
        reopen: { count: 0, percentage: 0 },
        cancelled: { count: 0, percentage: 0 },
        overdue: { count: 0, percentage: 0 }
      });
      return;
    }
    
    let total = 0;
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      rejected: 0,
      onhold: 0,
      reopen: 0,
      cancelled: 0,
      overdue: 0
    };

    Object.values(tasks).forEach(dateTasks => {
      dateTasks.forEach(task => {
        total++;
        const myStatus = getUserStatusForTask(task, userId);

        if (statusCounts[myStatus] !== undefined) {
          statusCounts[myStatus]++;
        }

        if (task.dueDateTime && 
            new Date(task.dueDateTime) < new Date() && 
            (myStatus === 'pending' || myStatus === 'in-progress')) {
          statusCounts.overdue++;
        }
      });
    });

    const calculatePercentage = (count) => total > 0 ? Math.round((count / total) * 100) : 0;

    setTaskStats({
      total,
      pending: { count: statusCounts.pending, percentage: calculatePercentage(statusCounts.pending) },
      inProgress: { count: statusCounts['in-progress'], percentage: calculatePercentage(statusCounts['in-progress']) },
      completed: { count: statusCounts.completed, percentage: calculatePercentage(statusCounts.completed) },
      rejected: { count: statusCounts.rejected, percentage: calculatePercentage(statusCounts.rejected) },
      onHold: { count: statusCounts.onhold, percentage: calculatePercentage(statusCounts.onhold) },
      reopen: { count: statusCounts.reopen, percentage: calculatePercentage(statusCounts.reopen) },
      cancelled: { count: statusCounts.cancelled, percentage: calculatePercentage(statusCounts.cancelled) },
      overdue: { count: statusCounts.overdue, percentage: calculatePercentage(statusCounts.overdue) }
    });
  }, [userId, getUserStatusForTask]);

  // Fetch tasks with proper filtering
  const fetchMyTasks = useCallback(async () => {
    if (authError || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (timeFilter && timeFilter !== 'all') params.append('period', timeFilter);

      const url = `/task/my?${params.toString()}`;
      const res = await axios.get(url);
      const tasks = res.data.groupedTasks || {};
      
      setMyTasksGrouped(tasks);
      calculateStatsFromTasks(tasks);

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
  }, [authError, userId, statusFilter, searchTerm, timeFilter, calculateStatsFromTasks]);

  // Handle Time Filter Change
  const handleTimeFilterChange = (period) => {
    setTimeFilter(period);
  };

  // Handle Status Filter from Stats Cards
  const handleStatsCardClick = (status) => {
    if (status) {
      const newStatusFilter = statusFilter === status ? '' : status;
      setStatusFilter(newStatusFilter);
      
      setSnackbar({
        open: true,
        message: newStatusFilter 
          ? `Filtering tasks by: ${status.replace('-', ' ')}` 
          : 'Cleared status filter',
        severity: 'info'
      });
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('');
    setTimeFilter('all');
    setSelectedDate(null);
    setDateRange({ start: null, end: null });
    setSearchTerm('');
    setSnackbar({
      open: true,
      message: 'All filters cleared',
      severity: 'info'
    });
  };

  // Enhanced Remarks Functions with Image Upload
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

  const handleRemarkImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setSnackbar({ open: true, message: 'Please select valid image files', severity: 'warning' });
      return;
    }

    const newImage = {
      file: imageFiles[0],
      preview: URL.createObjectURL(imageFiles[0]),
      name: imageFiles[0].name,
      size: imageFiles[0].size
    };

    remarkImages.forEach(image => URL.revokeObjectURL(image.preview));
    setRemarkImages([newImage]);
  };

  const handleRemoveRemarkImage = (index) => {
    setRemarkImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const inputEvent = {
        target: {
          files: event.dataTransfer.files
        }
      };
      handleRemarkImageUpload(inputEvent);
    }
  };

  const addRemark = async (taskId) => {
    if (!newRemark.trim() && remarkImages.length === 0) {
      setSnackbar({ open: true, message: 'Please enter a remark or upload an image', severity: 'warning' });
      return;
    }
    
    setIsUploadingRemark(true);
    
    try {
      const formData = new FormData();
      formData.append('text', newRemark.trim());

      remarkImages.forEach((image) => {
        formData.append('image', image.file);
      });

      await axios.post(`/task/${taskId}/remarks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setNewRemark('');
      setRemarkImages([]);
      fetchTaskRemarks(taskId);
      
      setSnackbar({ 
        open: true, 
        message: `Remark added successfully${remarkImages.length > 0 ? ' with image' : ''}`, 
        severity: 'success' 
      });

    } catch (error) {
      console.error('Error adding remark:', error);
      setSnackbar({ open: true, message: 'Failed to add remark', severity: 'error' });
    } finally {
      setIsUploadingRemark(false);
    }
  };

  // Enhanced Notifications Functions
  const fetchNotifications = useCallback(async () => {
    if (authError || !userId) return;
    
    try {
      const res = await axios.get('/task/notifications/all');
      setNotifications(res.data.notifications || []);
      setUnreadNotificationCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [authError, userId]);

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

  // Calendar Filter Functions
  const applyDateFilter = useCallback((tasks) => {
    if (!selectedDate && !dateRange.start && !dateRange.end) {
      return tasks;
    }

    const filteredTasks = {};

    Object.entries(tasks).forEach(([dateKey, dateTasks]) => {
      const filteredDateTasks = dateTasks.filter(task => {
        let taskDate;
        
        if (dateFilterType === 'dueDate') {
          taskDate = task.dueDateTime ? new Date(task.dueDateTime) : null;
        } else {
          taskDate = task.createdAt ? new Date(task.createdAt) : null;
        }

        if (!taskDate) return false;

        if (selectedDate && !dateRange.start && !dateRange.end) {
          const selected = new Date(selectedDate);
          return (
            taskDate.getDate() === selected.getDate() &&
            taskDate.getMonth() === selected.getMonth() &&
            taskDate.getFullYear() === selected.getFullYear()
          );
        }

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

  // Memoized filtered tasks for better performance
  const filteredTasks = useMemo(() => {
    return applyDateFilter(myTasksGrouped);
  }, [myTasksGrouped, applyDateFilter]);

  // Status Change Handler
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

      fetchMyTasks();
      fetchNotifications();
      
      setSnackbar({ 
        open: true, 
        message: 'Status updated successfully', 
        severity: 'success' 
      });

    } catch (err) {
      console.error("Error in handleStatusChange:", err.response || err);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        chunks.current = [];

        const file = new File([blob], "voice-note.webm", { type: "audio/webm" });
        setNewTask({ ...newTask, voiceNote: file });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error:", err);
      setSnackbar({
        open: true,
        message: 'Microphone access denied',
        severity: 'error'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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

      if (newTask.files) {
        for (let i = 0; i < newTask.files.length; i++) {
          formData.append('files', newTask.files[i]);
        }
      }

      if (newTask.voiceNote) {
        formData.append('voiceNote', newTask.voiceNote);
      }

      await axios.post('/task/create-self', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setOpenDialog(false);
      setSnackbar({ 
        open: true, 
        message: 'Task created successfully', 
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
      });

      // Refresh tasks list
      fetchMyTasks();
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

  // Enhanced Statistics Cards Component
  const renderStatisticsCards = () => {
    const statsData = [
      {
        title: 'Total Tasks',
        value: taskStats.total,
        icon: FiList,
        color: 'primary',
        description: `All tasks (${timeFilter})`,
        clickable: false,
        status: null
      },
      {
        title: 'Completed',
        value: taskStats.completed.count,
        percentage: taskStats.completed.percentage,
        icon: FiCheckCircle,
        color: 'success',
        description: `${taskStats.completed.percentage}% of total`,
        status: 'completed',
        clickable: true
      },
      {
        title: 'In Progress',
        value: taskStats.inProgress.count,
        percentage: taskStats.inProgress.percentage,
        icon: FiTrendingUp,
        color: 'info',
        description: `${taskStats.inProgress.percentage}% of total`,
        status: 'in-progress',
        clickable: true
      },
      {
        title: 'Pending',
        value: taskStats.pending.count,
        percentage: taskStats.pending.percentage,
        icon: FiClock,
        color: 'warning',
        description: `${taskStats.pending.percentage}% of total`,
        status: 'pending',
        clickable: true
      },
      {
        title: 'On Hold',
        value: taskStats.onHold.count,
        percentage: taskStats.onHold.percentage,
        icon: FiPause,
        color: 'secondary',
        description: `${taskStats.onHold.percentage}% of total`,
        status: 'onhold',
        clickable: true
      },
      {
        title: 'Cancelled',
        value: taskStats.cancelled.count,
        percentage: taskStats.cancelled.percentage,
        icon: FiSlash,
        color: 'grey',
        description: `${taskStats.cancelled.percentage}% of total`,
        status: 'cancelled',
        clickable: true
      },
      {
        title: 'Overdue',
        value: taskStats.overdue.count,
        percentage: taskStats.overdue.percentage,
        icon: FiAlertCircle,
        color: 'error',
        description: `${taskStats.overdue.percentage}% of total`,
        status: 'overdue',
        clickable: true
      },
      {
        title: 'Rejected',
        value: taskStats.rejected.count,
        percentage: taskStats.rejected.percentage,
        icon: FiXCircle,
        color: 'error',
        description: `${taskStats.rejected.percentage}% of total`,
        status: 'rejected',
        clickable: true
      }
    ];

    return (
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
        {statsData
          .filter(stat => stat.title === "Total Tasks" || stat.value > 0)
          .map((stat, index) => {
            const isActive = stat.status === statusFilter;
            
            return (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <StatCard
                  color={stat.color}
                  clickable={stat.clickable}
                  active={isActive}
                  onClick={() => stat.clickable && handleStatsCardClick(stat.status)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={600}
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography 
                            variant="h5" 
                            fontWeight={700} 
                            sx={{ mt: 0.5 }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          p: 1, 
                          borderRadius: 2,
                          bgcolor: `${theme.palette[stat.color].main}15`,
                          color: theme.palette[stat.color].main,
                        }}>
                          {React.createElement(stat.icon, { size: 18 })}
                        </Box>
                      </Box>

                      {stat.percentage !== undefined && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {stat.percentage}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 4, 
                            borderRadius: 2, 
                            bgcolor: 'action.hover',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${stat.percentage}%`, 
                              height: '100%', 
                              borderRadius: 2,
                              bgcolor: theme.palette[stat.color].main,
                            }} />
                          </Box>
                        </Box>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {stat.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>
            );
          })}
      </Grid>
    );
  };

  // Enhanced Time Filter Component
  const renderTimeFilter = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Filter by Time Period
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Select a timeframe to view task statistics
          </Typography>
        </Box>
        {timeFilter !== 'all' && (
          <Button
            size="small"
            variant="text"
            onClick={() => handleTimeFilterChange('all')}
            startIcon={<FiRotateCcw size={14} />}
          >
            Reset to All Time
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {[
          { value: "all", label: "All Time", icon: FiGlobe },
          { value: "today", label: "Today", icon: FiSun },
          { value: "yesterday", label: "Yesterday", icon: FiCalendar },
          { value: "this-week", label: "This Week", icon: FiClock },
          { value: "last-week", label: "Last Week", icon: FiCalendar },
          { value: "this-month", label: "This Month", icon: FiCalendar },
          { value: "last-month", label: "Last Month", icon: FiCalendar },
        ].map((period) => {
          const isActive = timeFilter === period.value;
          
          return (
            <TimeFilterButton
              key={period.value}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => handleTimeFilterChange(period.value)}
              size="small"
              startIcon={React.createElement(period.icon, { size: 14 })}
              active={isActive}
            >
              {period.label}
            </TimeFilterButton>
          );
        })}
      </Box>
    </Box>
  );

  // Enhanced table cell with new action buttons
  const renderActionButtons = (task) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="View Remarks">
          <ActionButton 
            size="small" 
            onClick={() => fetchTaskRemarks(task._id)}
          >
            <FiMessageSquare size={isSmallMobile ? 14 : 16} />
          </ActionButton>
        </Tooltip>

        <Tooltip title="Activity Logs">
          <ActionButton 
            size="small" 
            onClick={() => fetchActivityLogs(task._id)}
          >
            <FiActivity size={isSmallMobile ? 14 : 16} />
          </ActionButton>
        </Tooltip>

        {task.files?.length > 0 && (
          <Tooltip title="Download Files">
            <ActionButton
              size="small"
              href={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/${task.files[0].path || task.files[0]}`}
              target="_blank"
            >
              <FiDownload size={isSmallMobile ? 14 : 16} />
            </ActionButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  // Status Select Component
  const renderStatusSelect = (task) => {
    const myStatus = getUserStatusForTask(task, userId);
    
    return (
      <FormControl size="small" sx={{ minWidth: isSmallMobile ? 100 : 120 }}>
        <Select
          value={myStatus}
          onChange={(e) => {
            const selectedStatus = e.target.value;
            if (["completed", "onhold", "reopen", "cancelled", "rejected"].includes(selectedStatus)) {
              setPendingStatusChange({ taskId: task._id, status: selectedStatus });
              setRemarksDialog({ open: true, taskId: task._id, remarks: [] });
            } else {
              handleStatusChange(task._id, selectedStatus);
            }
          }}
        >
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="onhold">On Hold</MenuItem>
          <MenuItem value="reopen">Reopen</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </FormControl>
    );
  };

  // Enhanced Remarks Dialog with Image Upload
  const renderRemarksDialog = () => (
    <Dialog 
      open={remarksDialog.open} 
      onClose={() => {
        setRemarksDialog({ open: false, taskId: null, remarks: [] });
        setRemarkImages([]);
        setNewRemark('');
      }}
      maxWidth="md"
      fullWidth
      fullScreen={isSmallMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiMessageSquare />
          <Typography variant="h6">Task Remarks</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Add New Remark Section */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Remark
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Your Remark"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark here..."
                sx={{ mb: 2 }}
              />

              {/* Image Upload Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Attach Images (Optional)
                </Typography>
                
                <ImageUploadArea
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('remark-image-upload').click()}
                >
                  <Stack spacing={1} alignItems="center">
                    <FiImage size={32} color={theme.palette.primary.main} />
                    <Typography variant="body1">
                      Click to upload or drag & drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports JPG, PNG, GIF
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<FiCamera />}
                      sx={{ mt: 1 }}
                    >
                      Choose Images
                    </Button>
                  </Stack>
                  
                  <input
                    id="remark-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleRemarkImageUpload}
                    style={{ display: 'none' }}
                  />
                </ImageUploadArea>

                {/* Image Previews */}
                {remarkImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Image
                    </Typography>
                    <ImagePreviewContainer>
                      {remarkImages.map((image, index) => (
                        <ImagePreview key={index}>
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                            }}
                            onClick={() => setZoomImage(image.preview)}
                          />
                          <RemoveImageButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRemarkImage(index);
                            }}
                          >
                            <FiX size={14} />
                          </RemoveImageButton>
                        </ImagePreview>
                      ))}
                    </ImagePreviewContainer>
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={async () => {
                    await addRemark(remarksDialog.taskId);
                    
                    if (pendingStatusChange.status) {
                      await handleStatusChange(
                        pendingStatusChange.taskId, 
                        pendingStatusChange.status, 
                        newRemark || 'Status changed'
                      );
                      setPendingStatusChange({ taskId: null, status: '' });
                    }
                  }}
                  disabled={isUploadingRemark || (!newRemark.trim() && remarkImages.length === 0)}
                  startIcon={isUploadingRemark ? <CircularProgress size={16} /> : <FiMessageSquare />}
                  fullWidth
                >
                  {isUploadingRemark ? 'Uploading...' : 
                   pendingStatusChange.status ? 'Save Remark & Update Status' : 'Add Remark'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Remarks History */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Remarks History
            </Typography>
            
            {remarksDialog.remarks.length > 0 ? (
              <Stack spacing={2}>
                {remarksDialog.remarks.map((remark, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36 }}>
                              {remark.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {remark.user?.name || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(remark.createdAt).toLocaleDateString()} at {' '}
                                {new Date(remark.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {remark.text && (
                          <Typography variant="body2" sx={{ 
                            p: 1.5,
                            backgroundColor: 'background.default',
                            borderRadius: 1,
                          }}>
                            {remark.text}
                          </Typography>
                        )}

                        {remark.image && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" display="block" gutterBottom>
                              Attached Image:
                            </Typography>
                            <ImagePreview 
                              onClick={() => setZoomImage(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/${remark.image}`)}
                            >
                              <img
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/${remark.image}`}
                                alt="Remark attachment"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: theme.shape.borderRadius,
                                }}
                              />
                            </ImagePreview>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <FiMessageSquare size={48} color={theme.palette.text.secondary} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    No remarks yet
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );

  // Image Zoom Modal
  const renderImageZoomModal = () => (
    <ZoomModal
      open={!!zoomImage}
      onClose={() => setZoomImage(null)}
    >
      <Fade in={!!zoomImage}>
        <Box sx={{ 
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}>
          <IconButton
            onClick={() => setZoomImage(null)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              zIndex: 1,
            }}
          >
            <FiX size={20} />
          </IconButton>
          <img
            src={zoomImage}
            alt="Zoomed view"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Fade>
    </ZoomModal>
  );

  // Render Desktop Table
  const renderDesktopTable = (groupedTasks) => {
    const tasksToRender = applyDateFilter(groupedTasks);
    
    return Object.entries(tasksToRender).map(([dateKey, tasks]) => (
      <Box key={dateKey} sx={{ mt: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          📅 {dateKey}
        </Typography>
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Files</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Change Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const myStatus = getUserStatusForTask(task, userId);
                const statusColor = statusColors[myStatus] || 'grey';

                return (
                  <TableRow key={task._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Tooltip title={task.description}>
                        <Typography variant="body2" noWrap>
                          {task.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiCalendar size={14} />
                        <Typography
                          variant="body2"
                          color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'}
                          fontWeight={500}
                        >
                          {task.dueDateTime
                            ? new Date(task.dueDateTime).toLocaleDateString()
                            : '—'}
                        </Typography>
                        {isOverdue(task.dueDateTime) && (
                          <FiAlertCircle size={14} color={theme.palette.error.main} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        sx={{
                          bgcolor: `${theme.palette[task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'].main}15`,
                          color: theme.palette[task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'].main,
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={myStatus}
                        status={myStatus}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.files?.length > 0 && (
                        <Tooltip title={`${task.files.length} file(s)`}>
                          <ActionButton
                            size="small"
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/${task.files[0].path || task.files[0]}`}
                            target="_blank"
                          >
                            <FiDownload size={16} />
                          </ActionButton>
                        </Tooltip>
                      )}
                    </TableCell>

                    <TableCell>
                      {renderActionButtons(task)}
                    </TableCell>
                    <TableCell>
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
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{
            p: 2,
            bgcolor: 'background.paper',
          }}
        >
          📅 {dateKey}
        </Typography>
        <Stack spacing={2}>
          {tasks.map((task) => {
            const myStatus = getUserStatusForTask(task, userId);
            const statusColor = getStatusColor(myStatus, theme);

            return (
              <MobileTaskCard key={task._id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} noWrap>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
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
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiCalendar size={14} />
                        <Typography variant="body2" color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'}>
                          {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 'No date'}
                        </Typography>
                      </Box>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        sx={{
                          bgcolor: `${theme.palette[task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'].main}15`,
                          color: theme.palette[task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'].main,
                        }}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {renderActionButtons(task)}
                      </Box>
                      <Box sx={{ minWidth: 100 }}>
                        {renderStatusSelect(task)}
                      </Box>
                    </Box>
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
    
    if (Object.keys(tasksToRender).length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <FiCalendar size={isMobile ? 48 : 64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            {statusFilter ? `No ${statusFilter} tasks found` : 'No tasks found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter ? 'Try changing your status filter' : 'You have no tasks assigned yet'}
          </Typography>
          {(statusFilter || selectedDate || dateRange.start || dateRange.end) && (
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ mt: 2 }}
            >
              Clear All Filters
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 2, ml: (statusFilter || selectedDate || dateRange.start || dateRange.end) ? 1 : 0 }}
          >
            Create New Task
          </Button>
        </Box>
      );
    }

    return isMobile ? renderMobileCards(groupedTasks) : renderDesktopTable(groupedTasks);
  };

  // Enhanced Notifications Panel
  const renderNotificationsPanel = () => (
    <Modal
      open={notificationsOpen}
      onClose={() => setNotificationsOpen(false)}
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
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            <Button 
              onClick={markAllNotificationsAsRead} 
              size="small"
              disabled={unreadNotificationCount === 0}
            >
              Mark all as read
            </Button>
          </Box>
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
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2">
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </Typography>
                        {!notification.isRead && (
                          <Button 
                            size="small" 
                            onClick={() => markNotificationAsRead(notification._id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FiBell size={32} color={theme.palette.text.secondary} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                No notifications
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );

  // Enhanced Activity Logs Dialog
  const renderActivityLogsDialog = () => (
    <Dialog 
      open={activityDialog.open} 
      onClose={() => setActivityDialog({ open: false, taskId: null })}
      maxWidth="lg"
      fullWidth
      fullScreen={isSmallMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiActivity />
          <Typography variant="h6">Activity Logs</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {activityLogs.length > 0 ? (
          <Stack spacing={1}>
            {activityLogs.map((log, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {log.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {log.user?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user?.role || 'User'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {log.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={3}>
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
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiCalendar />
          <Typography variant="h6">Filter by Date</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value)}
              label="Filter By"
            > 
              <MenuItem value="createdDate">Created Date</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
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

          <Box>
            <Typography variant="subtitle1" gutterBottom>
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

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Quick Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <CalendarFilterButton
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setDateRange({ start: null, end: null });
                }}
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
              >
                Next 7 Days
              </CalendarFilterButton>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={clearDateFilter}
          variant="outlined"
        >
          Clear Filter
        </Button>
        <Button
          onClick={() => setCalendarFilterOpen(false)}
          variant="contained"
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
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FiPlus />
          <Typography variant="h4">Create Personal Task</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          This task will be automatically assigned to you ({userName})
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="info">
            This task will be automatically assigned to you ({userName})
          </Alert>

          <TextField
            fullWidth
            label="Task Title *"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Enter a descriptive task title"
          />

          <TextField
            fullWidth
            label="Description *"
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Provide detailed description of the task..."
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Due Date & Time *"
                value={newTask.dueDateTime}
                onChange={(dateTime) => setNewTask({ ...newTask, dueDateTime: dateTime })}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
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
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Priority Days"
            value={newTask.priorityDays}
            onChange={(e) => setNewTask({ ...newTask, priorityDays: e.target.value })}
            placeholder="Enter priority days"
          />

          <Box>
            <Typography variant="h6" gutterBottom>
              Attachments (Optional)
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
              <Button 
                variant="outlined" 
                component="label" 
                startIcon={<FiFileText />}
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
                variant={isRecording ? "contained" : "outlined"}
                color={isRecording ? "error" : "primary"}
                startIcon={<FiMic />}
                onClick={isRecording ? stopRecording : startRecording}
                fullWidth={isMobile}
              >
                {isRecording ? "Stop Recording" : "Record Voice"}
              </Button>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => setOpenDialog(false)}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          onClick={handleCreateTask}
          variant="contained"
          disabled={!newTask.title || !newTask.description || !newTask.dueDateTime || isCreatingTask}
          startIcon={isCreatingTask ? <CircularProgress size={16} color="inherit" /> : <FiCheck />}
        >
          {isCreatingTask ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Effects
  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter, searchTerm, timeFilter, fetchMyTasks]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (!authError && userId) {
      fetchMyTasks();
      fetchNotifications();
    }
  }, [authError, userId, fetchMyTasks, fetchNotifications]);

  if (authError) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 3,
      }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <CardContent>
            <FiAlertCircle size={48} color={theme.palette.error.main} />
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
              fullWidth
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2,
      }}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Loading Tasks...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: "column", md: "row" }, gap: 3, justifyContent: 'space-between', alignItems: { xs: "flex-start", md: "center" } }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                My Task Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track your personal tasks efficiently
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {taskStats.completed.count} Completed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {taskStats.inProgress.count} In Progress
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {taskStats.overdue.count} Overdue
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: "center" }}>
              <Tooltip title="Notifications">
                <IconButton
                  onClick={() => setNotificationsOpen(true)}
                  sx={{ position: 'relative' }}
                >
                  <FiBell />
                  {unreadNotificationCount > 0 && (
                    <Badge
                      badgeContent={unreadNotificationCount}
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<FiPlus />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Create Task
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Statistics Section */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Task Statistics
          </Typography>
          
          {renderTimeFilter()}
          {renderStatisticsCards()}

          {(statusFilter || timeFilter !== 'all') && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Active Filters:
                {statusFilter && (
                  <Chip
                    size="small"
                    label={statusFilter.replace('-', ' ')}
                    onDelete={() => setStatusFilter('')}
                    sx={{ mx: 0.5 }}
                  />
                )}
                {timeFilter !== 'all' && (
                  <Chip
                    size="small"
                    label={`Time: ${timeFilter}`}
                    onDelete={() => setTimeFilter('all')}
                    sx={{ mx: 0.5 }}
                  />
                )}
              </Typography>
            </Alert>
          )}
        </Paper>

        {/* Tasks Section */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FiCheckSquare />
                <Typography variant="h5" fontWeight={700}>
                  My Tasks
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                <Button
                  variant="outlined"
                  onClick={() => setCalendarFilterOpen(true)}
                  startIcon={<FiCalendar />}
                  size="small"
                >
                  {getDateFilterSummary() || 'Date Filter'}
                </Button>

                <FormControl size="small" sx={{ minWidth: 120 }}>
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
                    <MenuItem value="onhold">On Hold</MenuItem>
                    <MenuItem value="reopen">Reopen</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>

                <IconButton onClick={fetchMyTasks}>
                  <FiRefreshCw />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {renderGroupedTasks(myTasksGrouped)}
          </Box>
        </Paper>

        {/* DIALOGS */}
        {renderCreateTaskDialog()}
        {renderCalendarFilterDialog()}
        {renderNotificationsPanel()}
        {renderRemarksDialog()}
        {renderActivityLogsDialog()}
        {renderImageZoomModal()}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default UserCreateTask;