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
  FiChevronLeft, FiChevronRight, FiX as FiClose, FiBarChart2,
  FiTrendingUp, FiList, FiPause, FiTarget, FiUsers, FiSlash,
  FiImage, FiCamera, FiTrash2, FiZoomIn, FiCheckSquare,
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
    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: active ? theme.shadows[4] : theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  border: active ? `2px solid ${theme.palette[color].main}` : 'none',
  height: '100%',
  cursor: clickable ? 'pointer' : 'default',
  '&:hover': clickable ? {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
    backgroundColor: `${theme.palette[color].main}08`,
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
  ...(status === 'onhold' && {
    background: `${theme.palette.warning.light}25`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}30`,
  }),
  ...(status === 'reopen' && {
    background: `${theme.palette.secondary.main}15`,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}30`,
  }),
  ...(status === 'cancelled' && {
    background: `${theme.palette.grey[500]}20`,
    color: theme.palette.grey[700],
    border: `1px solid ${theme.palette.grey[400]}30`,
  }),
  ...(status === 'overdue' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const PriorityChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'priority'
})(({ theme, priority }) => ({
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

const MobileTaskCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'status'
})(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${status === 'completed' ? theme.palette.success.main :
    status === 'in-progress' ? theme.palette.info.main :
      status === 'pending' ? theme.palette.warning.main :
      status === 'overdue' ? theme.palette.error.main :
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

const CalendarFilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  background: active ? `${theme.palette.primary.main}15` : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 600 : 400,
  textTransform: 'none',
  minWidth: 'auto',
  padding: '4px 16px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
  },
}));

const TimeFilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: active ? `${theme.palette.primary.main}22` : "transparent",
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 700 : 500,
  textTransform: "none",
  minWidth: "auto",
  padding: "4px 10px",
  fontSize: "0.75rem",
  transition: "all 0.25s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: active
      ? `${theme.palette.primary.main}33`
      : `${theme.palette.primary.main}12`,
    color: theme.palette.primary.main,
    transform: "translateY(-2px)",
  },
}));

// Image Upload Components
const ImageUploadArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive'
})(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: isDragActive ? `${theme.palette.primary.main}08` : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}04`,
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
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

const ZoomModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

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
  return colors[status] || alpha(theme.palette.text.secondary, 0.3);
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
  const [statsLoading, setStatsLoading] = useState(false);

  // Task Management States
  const [myTasksGrouped, setMyTasksGrouped] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Enhanced Stats State
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
    assignedUsers: [],
    assignedGroups: []
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

  // Get individual user status for a task
  const getUserStatusForTask = useCallback((task, userId) => {
    if (!task || !userId) return 'pending';
    
    // First check statusByUser array
    const userStatus = task.statusByUser?.find(s => {
      if (typeof s.user === 'string') {
        return s.user === userId;
      } else if (s.user && typeof s.user === 'object') {
        return s.user._id === userId;
      }
      return false;
    });
    
    if (userStatus) {
      return userStatus.status || 'pending';
    }
    
    // Fallback to statusInfo array
    const statusInfo = task.statusInfo?.find(s => s.userId === userId);
    if (statusInfo) {
      return statusInfo.status || 'pending';
    }
    
    // Final fallback
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

        // Check overdue - only for pending and in-progress tasks
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
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (timeFilter && timeFilter !== 'all') {
        params.append('period', timeFilter);
      }

      const url = `/task/my?${params.toString()}`;
      console.log('🔍 Fetching tasks with URL:', url);
      
      const res = await axios.get(url);
      const tasks = res.data.groupedTasks || {};
      console.log('📦 Fetched tasks:', tasks);
      
      setMyTasksGrouped(tasks);
      calculateStatsFromTasks(tasks);

    } catch (err) {
      console.error('❌ Error fetching tasks:', err);
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
    setTimeFilter('today');
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

    // For single image upload, replace existing image
    const newImage = {
      file: imageFiles[0],
      preview: URL.createObjectURL(imageFiles[0]),
      name: imageFiles[0].name,
      size: imageFiles[0].size
    };

    // Clear existing images and add new one
    remarkImages.forEach(image => URL.revokeObjectURL(image.preview)); // Clean up memory
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

      // Append all images
      remarkImages.forEach((image, index) => {
        formData.append('image', image.file);
      });

      const response = await axios.post(`/task/${taskId}/remarks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setNewRemark('');
      setRemarkImages([]);
      fetchTaskRemarks(taskId);
      
      setSnackbar({ 
        open: true, 
        message: `Remark added successfully${remarkImages.length > 0 ? ' with ' + remarkImages.length + ' image(s)' : ''}`, 
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
      alert("Microphone access denied.");
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
        assignedUsers: [userId],
        assignedGroups: []
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

  // ✅ FIXED: Enhanced Statistics Cards Component
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statsData
          .filter(stat => stat.title === "Total Tasks" || stat.value > 0)
          .map((stat, index) => {
            // Get color gradient based on status
            const getGradient = (color) => {
              const gradients = {
                'primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'info': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                'warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                'secondary': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                'grey': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                'error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              };
              return gradients[color] || gradients['primary'];
            };

            const isActive = stat.status === statusFilter;
            
            return (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box 
                  component={Card}
                  onClick={() => stat.clickable && handleStatsCardClick(stat.status)}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: isActive 
                      ? `2px solid ${stat.color === 'primary' ? '#667eea' : theme.palette[stat.color]?.main || theme.palette.primary.main}`
                      : `1px solid rgba(102, 126, 234, 0.1)`,
                    background: isActive
                      ? stat.color === 'primary'
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.04) 100%)'
                        : `${alpha(theme.palette[stat.color]?.main || theme.palette.primary.main, 0.06)}`
                      : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: stat.clickable ? 'pointer' : 'default',
                    '&:hover': stat.clickable ? {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(
                        stat.color === 'primary' ? '#667eea' : theme.palette[stat.color]?.main || theme.palette.primary.main, 
                        0.15
                      )}`,
                      borderColor: stat.color === 'primary' ? '#667eea' : theme.palette[stat.color]?.main || theme.palette.primary.main,
                    } : {},
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': stat.clickable && isActive ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: getGradient(stat.color),
                    } : {}
                  }}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Stack spacing={1.5}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={600}
                            sx={{ 
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontSize: '0.7rem'
                            }}
                          >
                            {stat.title}
                          </Typography>
                          <Typography 
                            variant="h4" 
                            fontWeight={800} 
                            sx={{ 
                              mt: 0.5,
                              background: getGradient(stat.color),
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              lineHeight: 1.2
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2.5,
                          background: getGradient(stat.color),
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${alpha(
                            stat.color === 'primary' ? '#667eea' : theme.palette[stat.color]?.main || theme.palette.primary.main, 
                            0.3
                          )}`,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 'inherit',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
                          }
                        }}>
                          {React.createElement(stat.icon, { size: 20 })}
                        </Box>
                      </Box>

                      {/* Progress Bar */}
                      {stat.percentage !== undefined && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              Progress
                            </Typography>
                            <Typography 
                              variant="caption" 
                              fontWeight={700}
                              sx={{
                                background: getGradient(stat.color),
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}
                            >
                              {stat.percentage}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 6, 
                            borderRadius: 3, 
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${stat.percentage}%`, 
                              height: '100%', 
                              borderRadius: 3,
                              background: getGradient(stat.color),
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                animation: 'shimmer 2s infinite',
                                '@keyframes shimmer': {
                                  '0%': { transform: 'translateX(-100%)' },
                                  '100%': { transform: 'translateX(100%)' }
                                }
                              }
                            }} />
                          </Box>
                        </Box>
                      )}

                      {/* Description */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <FiInfo size={12} />
                        {stat.description}
                      </Typography>

                      {/* Clickable Indicator */}
                      {stat.clickable && (
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 1,
                          borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontStyle: 'italic',
                              fontSize: '0.7rem',
                              background: isActive 
                                ? getGradient(stat.color)
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: 600
                            }}
                          >
                            {isActive ? '✓ Active filter' : 'Click to filter'}
                          </Typography>
                          {isActive && (
                            <Box
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatsCardClick(null);
                              }}
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: '#ef4444',
                                  color: '#fff'
                                }
                              }}
                            >
                              <FiX size={12} />
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Box>
              </Grid>
            );
          })}
      </Grid>
    );
  };

  // ✅ Enhanced Time Filter Component
  const renderTimeFilter = () => (
    <Box sx={{ mb: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
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
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '0.75rem',
              '&:hover': {
                color: '#667eea',
                background: 'rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            Reset to All Time
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
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
            <Button
              key={period.value}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => handleTimeFilterChange(period.value)}
              size="small"
              startIcon={React.createElement(period.icon, { size: 14 })}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 1,
                fontSize: '0.8125rem',
                minWidth: 'fit-content',
                ...(isActive ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4090 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-1px)'
                  }
                } : {
                  borderColor: 'rgba(102, 126, 234, 0.2)',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#667eea',
                    color: '#667eea',
                    background: 'rgba(102, 126, 234, 0.05)',
                    transform: 'translateY(-1px)'
                  }
                }),
                transition: 'all 0.2s ease'
              }}
            >
              {period.label}
            </Button>
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
              href={`http://localhost:3000/${task.files[0].path || task.files[0]}`}
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
      PaperProps={{ sx: { borderRadius: isSmallMobile ? 0 : 2 } }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiMessageSquare color={theme.palette.info.main} />
            <Typography variant="h6" fontWeight={600}>Task Remarks</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {remarksDialog.remarks.length} remark(s)
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Add New Remark Section */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Add New Remark
              </Typography>
              
              {/* Text Input */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Your Remark"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark here... (Optional if uploading images)"
                sx={{ mb: 2 }}
              />

              {/* Image Upload Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Attach Images (Optional)
                </Typography>
                
                <ImageUploadArea
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('remark-image-upload').click()}
                  isDragActive={false}
                >
                  <Stack spacing={1} alignItems="center">
                    <FiImage size={32} color={theme.palette.primary.main} />
                    <Typography variant="body1" fontWeight={600}>
                      Click to upload or drag & drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports JPG, PNG, GIF • Max 5 images • 1MB each
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
                    multiple
                    accept="image/*"
                    onChange={handleRemarkImageUpload}
                    style={{ display: 'none' }}
                  />
                </ImageUploadArea>

                {/* Image Previews */}
                {remarkImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Selected Images ({remarkImages.length}/5)
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
                              display: 'block'
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
                    
                    // Handle status change if pending
                    if (pendingStatusChange.status) {
                      await handleStatusChange(
                        pendingStatusChange.taskId, 
                        pendingStatusChange.status, 
                        newRemark || 'Status changed with image upload'
                      );
                      setPendingStatusChange({ taskId: null, status: '' });
                    }
                  }}
                  disabled={isUploadingRemark || (!newRemark.trim() && remarkImages.length === 0)}
                  startIcon={isUploadingRemark ? <CircularProgress size={16} /> : <FiMessageSquare />}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  {isUploadingRemark ? 'Uploading...' : 
                   pendingStatusChange.status ? 'Save Remark & Update Status' : 'Add Remark'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Remarks History */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Remarks History
            </Typography>
            
            {remarksDialog.remarks.length > 0 ? (
              <Stack spacing={2}>
                {remarksDialog.remarks.map((remark, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={1.5}>
                        {/* User Info and Date */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: theme.palette.primary.main,
                                fontSize: '0.875rem'
                              }}
                            >
                              {remark.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {remark.user?.name || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {remark.user?.role || 'User'} • {new Date(remark.createdAt).toLocaleDateString()} at {' '}
                                {new Date(remark.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Remark Text */}
                        {remark.text && (
                          <Typography variant="body2" sx={{ 
                            mt: 0.5,
                            p: 1.5,
                            backgroundColor: theme.palette.background.default,
                            borderRadius: 1,
                            borderLeft: `3px solid ${theme.palette.primary.main}`
                          }}>
                            {remark.text}
                          </Typography>
                        )}

                        {/* Remark Image */}
                        {remark.image && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                              Attached Image:
                            </Typography>
                            <ImagePreview 
                              sx={{ 
                                maxWidth: 200,
                                borderRadius: 1
                              }}
                              onClick={() => setZoomImage(`http://localhost:3000/${remark.image}`)}
                            >
                              <img
                                src={`http://localhost:3000/${remark.image}`}
                                alt="Remark attachment"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: theme.shape.borderRadius,
                                  cursor: 'pointer'
                                }}
                              />
                              <Tooltip title="Zoom">
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0,0,0,0.8)',
                                    }
                                  }}
                                >
                                  <FiZoomIn size={14} />
                                </IconButton>
                              </Tooltip>
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
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
                    No remarks yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Be the first to add a remark for this task
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
      closeAfterTransition
    >
      <Fade in={!!zoomImage}>
        <Box sx={{ 
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none'
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
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
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
              borderRadius: theme.shape.borderRadius
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
          component="div" 
          variant="h6" 
          fontWeight={600} 
          gutterBottom 
          sx={{
            color: 'text.primary',
            borderBottom: `2px solid ${theme.palette.primary.main}20`,
            pb: 1,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            p: 2,
            borderRadius: 2,
            fontSize: isSmallMobile ? '1rem' : '1.125rem'
          }}
        >
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
                const statusColor = statusColors[myStatus] || 'grey';
                const statusColorMain = theme.palette[statusColor]?.main || theme.palette.grey[500];

                return (
                  <TableRow key={task._id} sx={{ 
                    background: `${statusColorMain}05`,
                    borderLeft: `4px solid ${statusColorMain}`,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      </Box>
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
                      {task.files?.length > 0 && (
                        <Tooltip title={`${task.files.length} file(s)`}>
                          <ActionButton
                            size="small"
                            href={`http://localhost:3000/${task.files[0].path || task.files[0]}`}
                            target="_blank"
                            sx={{
                              color: theme.palette.primary.main,
                              mr: 1,
                              '&:hover': { bgcolor: `${theme.palette.primary.main}10` }
                            }}
                          >
                            <FiDownload size={16} />
                          </ActionButton>
                        </Tooltip>
                      )}

                      {task.voiceNote?.path ? (
                        <Tooltip title="Voice Note">
                          <ActionButton
                            size="small"
                            href={`http://localhost:3000/${task.voiceNote.path}`}
                            target="_blank"
                            sx={{
                              color: theme.palette.success.main,
                              '&:hover': { bgcolor: `${theme.palette.success.main}10` }
                            }}
                          >
                            <FiMic size={16} />
                          </ActionButton>
                        </Tooltip>
                      ) : null}

                      {!task.files?.length && !task.voiceNote?.path && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                          sx={{ fontSize: '0.8rem' }}
                        >
                          -
                        </Typography>
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
        <Typography 
          component="div"
          variant="h6" 
          fontWeight={600} 
          gutterBottom 
          sx={{
            color: 'text.primary',
            borderBottom: `2px solid ${theme.palette.primary.main}20`,
            pb: 1,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            p: 2,
            borderRadius: 2,
            fontSize: '1rem'
          }}
        >
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
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
                    </Box>

                    {/* Info Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FiCalendar size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'} fontWeight={500}>
                          {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 'No date'}
                        </Typography>
                      </Box>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        priority={task.priority || 'medium'}
                        size="small"
                      />
                    </Box>

                    {/* Files Section */}
                    {task.files?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                          Files:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {task.files.slice(0, 2).map((file, i) => (
                            <Tooltip title="Download" key={i}>
                              <ActionButton
                                size="small"
                                href={`http://localhost:3000/${file.path || file}`}
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
                        </Box>
                      </Box>
                    )}

                    {/* Action Buttons Row */}
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
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <FiCalendar size={isMobile ? 48 : 64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
            {statusFilter ? `No ${statusFilter} tasks found` : 
             selectedDate || dateRange.start || dateRange.end ? 'No tasks found for selected date' : 'No tasks found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter ? `Try changing your status filter` :
             selectedDate || dateRange.start || dateRange.end ? 'Try changing your date filter' : 'You have no tasks assigned yet'}
          </Typography>
          {(statusFilter || selectedDate || dateRange.start || dateRange.end) && (
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Clear All Filters
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 2, borderRadius: 2, ml: (statusFilter || selectedDate || dateRange.start || dateRange.end) ? 1 : 0 }}
          >
            Create New Task
          </Button>
        </Box>
      );
    }

    return (
      <>
        {isMobile ? renderMobileCards(groupedTasks) : renderDesktopTable(groupedTasks)}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>Notifications</Typography>
            <Button 
              onClick={markAllNotificationsAsRead} 
              size="small"
              disabled={unreadNotificationCount === 0}
              sx={{ borderRadius: 1 }}
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      </Box>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiActivity color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={600}>Activity Logs</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {activityLogs.length > 0 ? (
          <Stack spacing={1}>
            {activityLogs.map((log, index) => (
              <Card key={index} variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Stack spacing={1}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: 1 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {log.description}
                    </Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiCalendar color={theme.palette.primary.main} />
          <Typography variant="h6" fontWeight={600}>Filter by Date</Typography>
        </Box>
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
              <MenuItem value="createdDate">Created Date</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
            </Box>
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
        pb: 3, 
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          position: 'relative',
          zIndex: 1 
        }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <FiPlus size={22} color="white" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              component="div"
              variant="h4" 
              fontWeight={800}
              sx={{ 
                letterSpacing: '-0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                mb: 0.5,
                color: 'white'
              }}
            >
              Create Personal Task
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              flexWrap: 'wrap'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.95,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  background: 'rgba(255,255,255,0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  backdropFilter: 'blur(4px)',
                  color: 'white'
                }}
              >
                <FiUser size={14} />
                This task will be assigned to: 
                <Box component="span" sx={{ fontWeight: 600, ml: 0.5 }}>
                  {userName}
                </Box>
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                background: 'rgba(255,255,255,0.1)',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                backdropFilter: 'blur(4px)',
                color: 'white'
              }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.8)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }} />
                <Typography variant="caption">Ready</Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Decorative corner */}
          <Box sx={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            zIndex: 0
          }} />
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
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
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
                  variant={isRecording ? "contained" : "outlined"}
                  startIcon={<FiMic />}
                  onClick={isRecording ? stopRecording : startRecording}
                  sx={{
                    borderRadius: 1,
                    py: 1,
                    borderStyle: isRecording ? "solid" : "dashed",
                    fontSize: "0.875rem",
                    background: isRecording ? "rgba(255,0,0,0.2)" : "",
                  }}
                  fullWidth={isMobile}
                >
                  {isRecording ? "Stop Recording..." : "Record Voice"}
                </Button>
              </Box>
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

  // Effects
  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter, searchTerm, timeFilter, fetchMyTasks]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!authError && userId) {
      fetchMyTasks();
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
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
          {/* Header */}
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              mb: 4,
              borderRadius: { xs: 3, sm: 4 },
              background: `linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)`,
              border: `1px solid rgba(102, 126, 234, 0.15)`,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -100,
                right: -100,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 3, md: 0 },
                justifyContent: 'space-between',
                alignItems: { xs: "flex-start", md: "center" }
              }}
            >
              {/* Left Section: Title & Info with Stats */}
              <Box sx={{ flex: 1, maxWidth: { md: '60%' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: 'inherit',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        opacity: 0.4,
                        filter: 'blur(4px)',
                        zIndex: -1
                      }
                    }}
                  >
                    <FiCheckSquare size={28} color="#fff" />
                  </Box>
                  <Box>
                    <Typography 
                      component="div"
                      variant="h3" 
                      fontWeight={800} 
                      gutterBottom 
                      sx={{ 
                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                        lineHeight: 1.2
                      }}
                    >
                      My Task Management
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <FiBarChart2 size={16} color="#667eea" />
                      Manage and track your personal tasks efficiently
                    </Typography>
                  </Box>
                </Box>
                
                {/* Quick Stats with gradient accents */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 3,
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(102, 126, 234, 0.06)',
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      <Box component="span" sx={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700 }}>
                        24
                      </Box>{' '}
                      Completed
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.1)'
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      <Box component="span" sx={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700 }}>
                        8
                      </Box>{' '}
                      In Progress
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.1)'
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                    }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      <Box component="span" sx={{ color: '#111827', fontSize: '0.9rem', fontWeight: 700 }}>
                        3
                      </Box>{' '}
                      Overdue
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Right Section: Action Buttons */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: "column", sm: "row" }, 
                gap: 1.5, 
                alignItems: "center",
                width: { xs: '100%', md: 'auto' },
                mt: { xs: 2, md: 0 }
              }}>
                {/* Notifications Badge */}
                <Tooltip title="Notifications" arrow>
                  <Box sx={{ position: 'relative' }}>
                    <IconButton
                      onClick={() => setNotificationsOpen(true)}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        backdropFilter: 'blur(8px)',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.1)',
                          borderColor: '#667eea',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(102, 126, 234, 0.2)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <FiBell size={20} color="#667eea" />
                    </IconButton>
                    {unreadNotificationCount > 0 && (
                      <Badge
                        badgeContent={unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          '& .MuiBadge-badge': {
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
                              '70%': { boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)' },
                              '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' }
                            }
                          }
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>

                {/* Action Buttons Group */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Clear All Filters Button */}
                  {(statusFilter || timeFilter !== 'today' || selectedDate || dateRange.start || dateRange.end) && (
                    <Tooltip title="Clear All Filters" arrow>
                      <Button
                        variant="outlined"
                        onClick={clearAllFilters}
                        startIcon={<FiX size={18} color="#9ca3af" />}
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 2.5,
                          py: 1.25,
                          fontSize: '0.875rem',
                          borderWidth: 2,
                          borderColor: 'rgba(156, 163, 175, 0.3)',
                          color: '#6b7280',
                          '&:hover': {
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.04)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                          }
                        }}
                      >
                        Clear All
                      </Button>
                    </Tooltip>
                  )}

                  {/* Create Task Button */}
                  <Tooltip title="Create New Task" arrow>
                    <Button
                      variant="contained"
                      startIcon={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          transition: 'transform 0.3s ease'
                        }}>
                          <FiPlus size={20} color="#fff" />
                        </Box>
                      }
                      onClick={() => setOpenDialog(true)}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.5,
                        fontSize: '0.9375rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: -100,
                          width: 100,
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          transition: 'left 0.7s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                          '&::before': {
                            left: '100%',
                          },
                          '& .MuiButton-startIcon': {
                            transform: 'rotate(90deg)',
                          }
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                          boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)',
                        }
                      }}
                    >
                      Create Task
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Decorative corner accent */}
            <Box sx={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
              zIndex: 0
            }} />
          </Paper>

          {/* ✅ FIXED: Statistics Section */}
          <Paper 
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              mb: 3,
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
              }
            }}
          >
            {/* Header Section */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiBarChart2 
                    size={20} 
                    color={theme.palette.primary.main} 
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ 
                      color: theme.palette.text.primary,
                      letterSpacing: '-0.2px'
                    }}
                  >
                    Task Statistics
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    Overview of your task performance
                  </Typography>
                </Box>
              </Box>
              
              {statsLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress 
                    size={20} 
                    thickness={5}
                    sx={{ 
                      color: theme.palette.primary.main,
                      mr: 1 
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Loading...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Time Filter Section */}
            <Box sx={{ mb: 3 }}>
              {renderTimeFilter()}
            </Box>

            {/* Statistics Cards Section */}
            <Box sx={{ mb: 3 }}>
              {renderStatisticsCards()}
            </Box>

            {/* Active Filter Summary */}
            {(statusFilter || timeFilter !== 'today') && (
              <Fade in={true}>
                <Alert 
                  severity="info" 
                  icon={<FiFilter size={18} />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.light, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    '& .MuiAlert-icon': {
                      alignItems: 'center',
                      color: theme.palette.info.main
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>
                      <Box component="span" sx={{ color: 'text.primary' }}>
                        Active Filters:
                      </Box>
                      <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                        {statusFilter && (
                          <Chip
                            size="small"
                            label={statusFilter.replace('-', ' ')}
                            onDelete={() => setStatusFilter('')}
                            sx={{
                              mx: 0.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              '& .MuiChip-deleteIcon': {
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  color: theme.palette.primary.dark
                                }
                              }
                            }}
                          />
                        )}
                        {timeFilter !== 'today' && (
                          <Chip
                            size="small"
                            label={`Time: ${timeFilter}`}
                            onDelete={() => setTimeFilter('today')}
                            sx={{
                              mx: 0.5,
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              fontWeight: 500,
                              '& .MuiChip-deleteIcon': {
                                color: theme.palette.secondary.main,
                                '&:hover': {
                                  color: theme.palette.secondary.dark
                                }
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setStatusFilter('');
                        setTimeFilter('today');
                      }}
                      sx={{
                        ml: 2,
                        color: theme.palette.info.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.info.main, 0.1)
                        }
                      }}
                    >
                      Clear All
                    </Button>
                  </Box>
                </Alert>
              </Fade>
            )}

            {/* Optional: Add a subtle footer */}
            <Box sx={{ 
              mt: 3, 
              pt: 2, 
              borderTop: `1px dashed ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Typography variant="caption" color="text.secondary">
                Last updated: Just now
              </Typography>
            </Box>
          </Paper>

          {/* Tasks Section */}
          <Paper 
            sx={{
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              transition: 'transform 0.2s ease, boxShadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            {/* Enhanced Filter Header */}
            <Box 
              sx={{ 
                p: { xs: 2.5, sm: 3, md: 3.5 },
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  mb: 2
                }}
              >
                {/* Title Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <FiCheckSquare size={20} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight={800}
                      sx={{ 
                        color: theme.palette.text.primary,
                        letterSpacing: '-0.3px',
                        lineHeight: 1.2
                      }}
                    >
                      My Tasks
                      {statusFilter && (
                        <Chip
                          label={statusFilter.replace('-', ' ')}
                          size="small"
                          sx={{
                            ml: 1.5,
                            height: 24,
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            '& .MuiChip-label': { px: 1.5 }
                          }}
                        />
                      )}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <FiInfo size={12} />
                      Manage and track your assigned tasks
                    </Typography>
                  </Box>
                </Box>
                
                {/* Action Buttons Section */}
                <Box 
                  sx={{ 
                    display: 'flex',
                    gap: 1.5, 
                    alignItems: 'center',
                    width: { xs: '100%', md: 'auto' },
                    mt: { xs: 1, md: 0 }
                  }}
                >
                  {/* Calendar Filter Button */}
                  <Tooltip title="Filter by Date" arrow>
                    <Button
                      variant={selectedDate || dateRange.start || dateRange.end ? "contained" : "outlined"}
                      onClick={() => setCalendarFilterOpen(true)}
                      startIcon={<FiCalendar size={16} />}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                        minWidth: 'fit-content',
                        ...(selectedDate || dateRange.start || dateRange.end ? {
                          bgcolor: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          }
                        } : {})
                      }}
                    >
                      {getDateFilterSummary() || 'Date Filter'}
                    </Button>
                  </Tooltip>

                  {/* Status Filter */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ fontWeight: 500 }}>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      input={<OutlinedInput label="Status" />}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 500,
                        '& .MuiSelect-select': {
                          py: 1.25
                        }
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(selected, theme),
                            }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {selected ? selected.replace('-', ' ') : 'All Status'}
                          </Typography>
                        </Box>
                      )}
                    >
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: alpha(theme.palette.text.secondary, 0.3) }} />
                          <Typography>All Status</Typography>
                        </Box>
                      </MenuItem>
                      {[
                        { value: 'pending', color: theme.palette.warning.main },
                        { value: 'in-progress', color: theme.palette.info.main },
                        { value: 'completed', color: theme.palette.success.main },
                        { value: 'rejected', color: theme.palette.error.main },
                        { value: 'onhold', color: theme.palette.grey[500] },
                        { value: 'reopen', color: theme.palette.warning.dark },
                        { value: 'cancelled', color: theme.palette.grey[700] },
                        { value: 'overdue', color: theme.palette.error.dark }
                      ].map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status.color }} />
                            <Typography>{status.value.replace('-', ' ')}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Action Buttons Group */}
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 0.5 }}>
                    {(selectedDate || dateRange.start || dateRange.end) && (
                      <Tooltip title="Clear Date Filter" arrow>
                        <IconButton
                          size="small"
                          onClick={clearDateFilter}
                          sx={{
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main,
                            '&:hover': {
                              bgcolor: theme.palette.error.main,
                              color: theme.palette.error.contrastText,
                            }
                          }}
                        >
                          <FiX size={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Refresh" arrow>
                      <IconButton
                        size="small"
                        onClick={() => fetchMyTasks()}
                        sx={{
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            animation: 'spin 0.6s ease',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }
                        }}
                      >
                        <FiRefreshCw size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Enhanced Date Filter Summary */}
              {(selectedDate || dateRange.start || dateRange.end) && (
                <Fade in={true}>
                  <Box 
                    sx={{ 
                      mt: 2.5,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FiFilter size={16} color={theme.palette.primary.main} />
                      </Box>
                      <Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          ACTIVE DATE FILTER
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {getDateFilterSummary()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="text"
                      onClick={clearDateFilter}
                      startIcon={<FiX size={14} />}
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        '&:hover': {
                          color: theme.palette.error.main,
                          bgcolor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Tasks Content Area */}
            <Box 
              sx={{ 
                p: { xs: 2, sm: 2.5, md: 3 },
                minHeight: 400,
                bgcolor: alpha(theme.palette.background.default, 0.4)
              }}
            >
              {renderGroupedTasks(myTasksGrouped)}
              
              {/* Empty State (if needed) */}
              {(!myTasksGrouped || Object.keys(myTasksGrouped).length === 0) && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 8,
                    textAlign: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.grey[300], 0.3),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <FiCheckSquare size={36} color={theme.palette.grey[500]} />
                  </Box>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No tasks found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                    {statusFilter 
                      ? `No ${statusFilter.replace('-', ' ')} tasks found for the selected date`
                      : 'Try adjusting your filters or create a new task'}
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
          {renderImageZoomModal()}

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {snackbar.severity === 'error' ?
                    <FiXCircle size={18} /> :
                    snackbar.severity === 'warning' ?
                    <FiAlertCircle size={18} /> :
                    <FiCheckCircle size={18} />
                  }
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                    {snackbar.message}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Snackbar>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default UserCreateTask;