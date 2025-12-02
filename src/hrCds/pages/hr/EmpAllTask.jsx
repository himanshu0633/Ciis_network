import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import { API_URL_IMG } from '../../../config';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Avatar,
  Stack, Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider, Fade, LinearProgress,
  useTheme, useMediaQuery, Paper, Tooltip, Dialog,
  DialogTitle, DialogContent, IconButton, TextField,
  DialogActions, Badge, InputAdornment, Tabs, Tab,
  CardHeader, CardActions, Collapse, Skeleton, alpha 
} from "@mui/material";
import {
  FiUsers, FiUser, FiCalendar, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiTrendingUp, FiList, 
  FiArrowRight, FiX, FiBarChart2, FiPieChart, FiSearch, 
  FiMail, FiBriefcase, FiMessageSquare, FiPlus, FiImage,
  FiCamera, FiZoomIn, FiSend, FiTrash2, FiFilter,
  FiCalendar as FiCal, FiChevronRight, FiChevronLeft,
  FiDownload, FiRefreshCw, FiEye, FiEyeOff, FiGrid,
  FiCheckSquare, FiArchive, FiTarget, FiPercent,
  FiAlertTriangle, FiActivity, FiTrendingDown, FiTrendingUp as FiTrendUp,
  FiChevronDown, FiChevronUp, FiStar, FiAward, FiBarChart,
  FiEdit3, FiExternalLink, FiMoreVertical, FiShare2,FiInfo,FiHash 
} from "react-icons/fi";
import { styled } from "@mui/material/styles";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// ---------------- Enhanced Styled Components ---------------- //
const StatCard = styled(Card)(({ theme, color }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
  border: `1px solid ${color}30`,
  transition: 'all 0.3s ease',
  overflow: 'visible',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: color,
    '& .stat-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    }
  },
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: theme.shadows[6],
    borderColor: theme.palette.primary.main,
  },
}));

const UserCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: selected 
    ? `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, ${theme.palette.primary.main}05 100%)`
    : theme.palette.background.paper,
  border: selected 
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const ProgressIndicator = styled(Box)(({ theme, value, color }) => ({
  height: 8,
  borderRadius: 4,
  background: theme.palette.grey[200],
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${value}%`,
    background: `linear-gradient(90deg, ${color} 0%, ${color}AA 100%)`,
    borderRadius: 4,
    transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: `0 2px 8px ${color}40`,
  },
}));

// ✅ STATUS OPTIONS with Colors and Icons
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status', color: '#6c757d', icon: FiGrid, bgColor: '#e9ecef' },
  { value: 'pending', label: 'Pending', color: '#ffc107', icon: FiClock, bgColor: '#fff3cd' },
  { value: 'in-progress', label: 'In Progress', color: '#17a2b8', icon: FiAlertCircle, bgColor: '#d1ecf1' },
  { value: 'completed', label: 'Completed', color: '#28a745', icon: FiCheckCircle, bgColor: '#d4edda' },
  { value: 'approved', label: 'Approved', color: '#20c997', icon: FiCheckSquare, bgColor: '#d1f2eb' },
  { value: 'rejected', label: 'Rejected', color: '#dc3545', icon: FiXCircle, bgColor: '#f8d7da' },
  { value: 'overdue', label: 'Overdue', color: '#fd7e14', icon: FiAlertTriangle, bgColor: '#ffe5d0' },
  { value: 'onhold', label: 'On Hold', color: '#6f42c1', icon: FiAlertCircle, bgColor: '#e9d8fd' },
  { value: 'reopen', label: 'Reopen', color: '#e83e8c', icon: FiRefreshCw, bgColor: '#fcdce8' },
  { value: 'cancelled', label: 'Cancelled', color: '#6c757d', icon: FiX, bgColor: '#f8f9fa' },
];

// ✅ EMPLOYEE_TYPES CONSTANT
const EMPLOYEE_TYPES = [
  { value: "all", label: "All Employees", icon: FiUsers, color: "#4e73df" },
  { value: "intern", label: "Intern", icon: FiUser, color: "#36b9cc" },
  { value: "technical", label: "Technical", icon: FiTrendingUp, color: "#1cc88a" },
  { value: "non-technical", label: "Non-Technical", icon: FiUsers, color: "#f6c23e" },
  { value: "sales", label: "Sales", icon: FiTarget, color: "#e74a3b" },
];

// ✅ QUICK DATE PRESETS
const QUICK_DATE_PRESETS = [
  { value: 'today', label: 'Today', getDate: () => new Date() },
  { value: 'yesterday', label: 'Yesterday', getDate: () => subDays(new Date(), 1) },
  { value: 'week', label: 'This Week', getDate: () => startOfWeek(new Date()) },
  { value: 'month', label: 'This Month', getDate: () => startOfMonth(new Date()) },
  { value: 'quarter', label: 'Last 3 Months', getDate: () => subMonths(new Date(), 3) },
  { value: 'year', label: 'This Year', getDate: () => startOfYear(new Date()) },
  { value: 'all', label: 'All Time', getDate: () => null },
];

const TaskDetails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  
  // Date Filter States
  const [quickDateFilter, setQuickDateFilter] = useState('today');
  const [singleDate, setSingleDate] = useState(new Date());
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedDateTab, setSelectedDateTab] = useState(0);
  
  // Status Filters
  const [activeStatusFilters, setActiveStatusFilters] = useState(['all']);
  const [showStatusFilters, setShowStatusFilters] = useState(true);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Overall Statistics for all users
  const [overallStats, setOverallStats] = useState({
    total: 0,
    pending: 0,
    'in-progress': 0,
    completed: 0,
    approved: 0,
    rejected: 0,
    overdue: 0,
    onhold: 0,
    reopen: 0,
    cancelled: 0
  });
  
  // Individual user statistics
  const [userTaskStats, setUserTaskStats] = useState({
    total: 0,
    pending: { count: 0, percentage: 0 },
    inProgress: { count: 0, percentage: 0 },
    completed: { count: 0, percentage: 0 },
    approved: { count: 0, percentage: 0 },
    rejected: { count: 0, percentage: 0 },
    overdue: { count: 0, percentage: 0 },
    onhold: { count: 0, percentage: 0 },
    reopen: { count: 0, percentage: 0 },
    cancelled: { count: 0, percentage: 0 }
  });
  
  const [systemStats, setSystemStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    avgCompletion: 0,
    pendingTasks: 0,
    activeEmployees: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ Calculate overall stats from all users
  const calculateOverallStats = (usersData) => {
    if (!usersData || usersData.length === 0) {
      const emptyStats = {};
      STATUS_OPTIONS.forEach(opt => {
        if (opt.value !== 'all') {
          emptyStats[opt.value] = 0;
        }
      });
      setOverallStats(emptyStats);
      return;
    }

    const stats = {
      total: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      approved: 0,
      rejected: 0,
      overdue: 0,
      onhold: 0,
      reopen: 0,
      cancelled: 0
    };

    // Calculate totals from all users
    usersData.forEach(user => {
      const userStats = user.taskStats || {};
      
      // Add all status counts
      stats.total += userStats.total || 0;
      stats.pending += userStats.pending || 0;
      stats['in-progress'] += userStats.inProgress || 0;
      stats.completed += userStats.completed || 0;
      stats.approved += userStats.approved || 0;
      stats.rejected += userStats.rejected || 0;
      stats.overdue += userStats.overdue || 0;
      stats.onhold += userStats.onhold || 0;
      stats.reopen += userStats.reopen || 0;
      stats.cancelled += userStats.cancelled || 0;
    });

    setOverallStats(stats);
    
    // Calculate system stats
    const totalTasks = stats.total;
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => (user.taskStats?.total || 0) > 0).length;
    const pendingTasks = stats.pending + stats['in-progress'];
    const completedTasks = stats.completed + stats.approved;
    const avgCompletion = totalUsers > 0 
      ? Math.round(usersData.reduce((sum, user) => sum + (user.taskStats?.completionRate || 0), 0) / totalUsers)
      : 0;
    
    setSystemStats({
      totalEmployees: totalUsers,
      totalTasks,
      avgCompletion,
      pendingTasks,
      activeEmployees: activeUsers
    });
  };

  // ✅ FILTERED USERS
  const filteredUsers = useMemo(() => {
    if (selectedEmployeeType === "all") return users;
    
    return users.filter(user => {
      if (!user.employeeType) return false;
      return user.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase();
    });
  }, [users, selectedEmployeeType]);

  // ✅ Get non-zero statuses for overall stats
  const getNonZeroStatuses = useMemo(() => {
    return STATUS_OPTIONS.filter(status => {
      if (status.value === 'all') return true;
      return overallStats[status.value] > 0;
    });
  }, [overallStats]);

  // ✅ Filter Tasks based on Active Status Filters
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    let filtered = tasks;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.serialNo && task.serialNo.toString().includes(query))
      );
    }
    
    if (activeStatusFilters.includes('all')) {
      return filtered;
    }
    
    return filtered.filter(task => {
      const status = task.userStatus || task.status || task.overallStatus;
      return activeStatusFilters.includes(status);
    });
  }, [tasks, activeStatusFilters, searchQuery]);

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
    () => ["admin", "manager", "hr", "superadmin"].includes(currentUserRole),
    [currentUserRole]
  );

  // ✅ Fetch all users with task counts from Backend
  useEffect(() => {
    const fetchUsersWithTasks = async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get(`/task/admin/users-with-tasks?employeeType=${selectedEmployeeType}`);
        
        if (res.data.success) {
          const usersData = res.data.users || [];
          setUsers(usersData);
          
          // Calculate overall stats
          calculateOverallStats(usersData);
        }
      } catch (err) {
        console.error("Error fetching users with tasks:", err);
        setError(
          err?.response?.data?.error ||
            "Error fetching users. Please try again."
        );
      } finally {
        setUsersLoading(false);
      }
    };
    
    if (canManage) {
      fetchUsersWithTasks();
    }
  }, [canManage, selectedEmployeeType]);

  // ✅ Fetch Task Status Counts for specific user from Backend
  const fetchTaskStatusCounts = async (userId, period = 'today', customStart = null, customEnd = null) => {
    try {
      setLoading(true);
      
      let params = { period };
      
      if (period === 'custom' && customStart && customEnd) {
        params.startDate = format(customStart, 'yyyy-MM-dd');
        params.endDate = format(customEnd, 'yyyy-MM-dd');
      } else if (period === 'custom' && customStart) {
        params.date = format(customStart, 'yyyy-MM-dd');
      }
      
      const response = await axios.get(`/task/user/${userId}/stats`, { params });
      
      if (response.data.success && response.data.statusCounts) {
        const statusCounts = response.data.statusCounts;
        
        // Update task stats from backend
        setUserTaskStats({
          total: statusCounts.total || 0,
          pending: statusCounts.pending || { count: 0, percentage: 0 },
          inProgress: statusCounts.inProgress || { count: 0, percentage: 0 },
          completed: statusCounts.completed || { count: 0, percentage: 0 },
          approved: statusCounts.approved || { count: 0, percentage: 0 },
          rejected: statusCounts.rejected || { count: 0, percentage: 0 },
          overdue: statusCounts.overdue || { count: 0, percentage: 0 },
          onhold: statusCounts.onHold || { count: 0, percentage: 0 },
          reopen: statusCounts.reopen || { count: 0, percentage: 0 },
          cancelled: statusCounts.cancelled || { count: 0, percentage: 0 }
        });
      }
    } catch (err) {
      console.error('❌ Error fetching task status counts:', err);
      // If API fails, calculate from local tasks
      calculateStatsFromTasks();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate stats from tasks data (fallback)
  const calculateStatsFromTasks = () => {
    if (!tasks || tasks.length === 0) {
      setUserTaskStats({
        total: 0,
        pending: { count: 0, percentage: 0 },
        inProgress: { count: 0, percentage: 0 },
        completed: { count: 0, percentage: 0 },
        approved: { count: 0, percentage: 0 },
        rejected: { count: 0, percentage: 0 },
        overdue: { count: 0, percentage: 0 },
        onhold: { count: 0, percentage: 0 },
        reopen: { count: 0, percentage: 0 },
        cancelled: { count: 0, percentage: 0 }
      });
      return;
    }
    
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      approved: 0,
      rejected: 0,
      overdue: 0,
      onhold: 0,
      reopen: 0,
      cancelled: 0
    };

    tasks.forEach(task => {
      const status = task.userStatus || task.status || task.overallStatus;
      if (status && statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const total = tasks.length;
    setUserTaskStats({
      total,
      pending: { 
        count: statusCounts.pending, 
        percentage: total > 0 ? Math.round((statusCounts.pending / total) * 100) : 0 
      },
      inProgress: { 
        count: statusCounts['in-progress'], 
        percentage: total > 0 ? Math.round((statusCounts['in-progress'] / total) * 100) : 0 
      },
      completed: { 
        count: statusCounts.completed, 
        percentage: total > 0 ? Math.round((statusCounts.completed / total) * 100) : 0 
      },
      approved: { 
        count: statusCounts.approved, 
        percentage: total > 0 ? Math.round((statusCounts.approved / total) * 100) : 0 
      },
      rejected: { 
        count: statusCounts.rejected, 
        percentage: total > 0 ? Math.round((statusCounts.rejected / total) * 100) : 0 
      },
      overdue: { 
        count: statusCounts.overdue, 
        percentage: total > 0 ? Math.round((statusCounts.overdue / total) * 100) : 0 
      },
      onhold: { 
        count: statusCounts.onhold, 
        percentage: total > 0 ? Math.round((statusCounts.onhold / total) * 100) : 0 
      },
      reopen: { 
        count: statusCounts.reopen, 
        percentage: total > 0 ? Math.round((statusCounts.reopen / total) * 100) : 0 
      },
      cancelled: { 
        count: statusCounts.cancelled, 
        percentage: total > 0 ? Math.round((statusCounts.cancelled / total) * 100) : 0 
      }
    });
  };

  // ✅ Handle Status Filter Toggle
  const handleStatusFilterToggle = (status) => {
    setActiveStatusFilters(prev => {
      if (status === 'all') {
        return ['all'];
      }
      
      const newFilters = prev.filter(f => f !== 'all');
      
      if (newFilters.includes(status)) {
        const updated = newFilters.filter(f => f !== status);
        return updated.length === 0 ? ['all'] : updated;
      } else {
        return [...newFilters, status];
      }
    });
  };

  // ✅ Handle Quick Date Filter Change
  const handleQuickDateFilterChange = (period) => {
    setQuickDateFilter(period);
    if (selectedUserId) {
      fetchTaskStatusCounts(selectedUserId, period);
      fetchUserTasks(selectedUserId, period);
    }
  };

  // ✅ Handle Single Date Change
  const handleSingleDateChange = (date) => {
    setSingleDate(date);
    if (selectedUserId) {
      fetchTaskStatusCounts(selectedUserId, 'custom', date, date);
      fetchUserTasks(selectedUserId, 'custom', date, date);
    }
  };

  // ✅ Handle Date Range Change
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // ✅ Apply Custom Date Range
  const applyDateRange = () => {
    if (startDate && endDate && selectedUserId) {
      fetchTaskStatusCounts(selectedUserId, 'custom', startDate, endDate);
      fetchUserTasks(selectedUserId, 'custom', startDate, endDate);
    }
  };

  // ✅ Handle Search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // ✅ Fetch User Tasks from Backend
  const fetchUserTasks = async (userId, period = 'today', start = null, end = null) => {
    setLoading(true);
    setError("");
    try {
      const user = users.find((x) => x._id === userId);
      setSelectedUser(user);
      setSelectedUserId(userId);

      const params = new URLSearchParams();
      
      if (period === 'custom' && start && end) {
        params.append('startDate', format(start, 'yyyy-MM-dd'));
        params.append('endDate', format(end, 'yyyy-MM-dd'));
      } else if (period === 'custom' && start) {
        params.append('date', format(start, 'yyyy-MM-dd'));
      } else {
        params.append('period', period);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const url = `/task/user/${userId}/tasks?${params.toString()}`;
      const res = await axios.get(url);

      if (res.data.success) {
        const tasksData = res.data.tasks || [];
        setTasks(tasksData);
        
        // Fetch stats from backend
        await fetchTaskStatusCounts(userId, period, start, end);
        setOpenDialog(true);
      } else {
        setError("Failed to fetch user tasks");
      }
      
    } catch (err) {
      console.error("Error fetching user tasks:", err);
      setError(
        err?.response?.data?.error || 
        err?.message || 
        "Error fetching tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset Date Filters
  const resetDateFilters = () => {
    setQuickDateFilter('today');
    setSingleDate(new Date());
    setStartDate(subDays(new Date(), 7));
    setEndDate(new Date());
    setSelectedDateTab(0);
    setActiveStatusFilters(['all']);
    setSearchQuery('');
    
    if (selectedUserId) {
      fetchTaskStatusCounts(selectedUserId, 'today');
      fetchUserTasks(selectedUserId, 'today');
    }
  };

  // ✅ Format Date for Display
  const formatDateDisplay = (date) => {
    return format(date, 'dd MMM yyyy');
  };

  // ✅ Get Status Count for specific user
  const getStatusCount = (status) => {
    switch(status) {
      case 'total': return userTaskStats.total || 0;
      case 'pending': return userTaskStats.pending?.count || 0;
      case 'in-progress': return userTaskStats.inProgress?.count || 0;
      case 'completed': return userTaskStats.completed?.count || 0;
      case 'approved': return userTaskStats.approved?.count || 0;
      case 'rejected': return userTaskStats.rejected?.count || 0;
      case 'overdue': return userTaskStats.overdue?.count || 0;
      case 'onhold': return userTaskStats.onhold?.count || 0;
      case 'reopen': return userTaskStats.reopen?.count || 0;
      case 'cancelled': return userTaskStats.cancelled?.count || 0;
      default: return 0;
    }
  };

  // ✅ Get Overall Status Count (all users)
  const getOverallStatusCount = (status) => {
    if (status === 'all') return overallStats.total;
    return overallStats[status] || 0;
  };

  // ✅ Get Status Color
  const getStatusColor = (status) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption ? statusOption.color : '#6c757d';
  };

  // ✅ Get Status Icon
  const getStatusIcon = (status) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    if (statusOption) {
      return React.createElement(statusOption.icon, { color: statusOption.color });
    }
    return <FiClock color={theme.palette.text.secondary} />;
  };

  // ✅ Get User Initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    try {
      const date = new Date(dateStr);
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return "Invalid date";
    }
  };

  // ✅ Format DateTime
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Not set";
    try {
      const date = new Date(dateStr);
      return format(date, 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return "Invalid date";
    }
  };

  // ✅ Get User Task Stats from Backend
  const getUserTaskStats = (user) => {
    return user.taskStats || {
      total: 0,
      pending: 0,
      completed: 0,
      completionRate: 0
    };
  };

  // ✅ Render Overall Statistics - All Users Combined
 const renderOverallStats = () => {
  const statusGradients = {
    'pending': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'in-progress': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    'completed': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'rejected': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'onhold': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'overdue': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    'reopen': 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    'cancelled': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  };

  const getStatusGradient = (status) => statusGradients[status] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        fontWeight={800}
        gutterBottom
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          fontSize: '1rem'
        }}
      >
        <Box sx={{ 
          p: 0.75, 
          borderRadius: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiBarChart size={16} color="white" />
        </Box>
        System-wide Task Statistics
      </Typography>

      <Grid container spacing={1.5}>
        {/* Total Tasks Card */}
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2.5,
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(102, 126, 234, 0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.1)'
            }
          }}>
            <CardContent sx={{ p: 1.5, textAlign: "center" }}>
              <Stack spacing={1} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    mb: 0.5,
                  }}
                >
                  <FiList size={18} color="white" />
                </Box>

                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: "1.8rem",
                    lineHeight: 1,
                    mb: 0.25,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {overallStats.total}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ 
                    fontSize: "0.7rem",
                    letterSpacing: '0.5px'
                  }}
                >
                  Total Tasks
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Breakdown - Compact Cards */}
        {getNonZeroStatuses
          .filter((status) => status.value !== "all" && overallStats[status.value] > 0)
          .map((status) => {
            const percentage = Math.round(
              (overallStats[status.value] / overallStats.total) * 100
            ) || 0;

            return (
              <Grid item xs={6} sm={4} md={2.4} key={status.value}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 2.5,
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: `1px solid rgba(102, 126, 234, 0.15)`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha(status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea', 0.15)}`,
                    borderColor: status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea'
                  }
                }}>
                  <CardContent sx={{ p: 1.5, textAlign: "center" }}>
                    <Stack spacing={1} alignItems="center">
                      <Box
                        sx={{
                          p: 0.75,
                          borderRadius: "50%",
                          background: getStatusGradient(status.value),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 4px 8px ${alpha(status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea', 0.3)}`,
                          mb: 0.5,
                        }}
                      >
                        {React.createElement(status.icon, {
                          size: 14,
                          color: "white",
                        })}
                      </Box>

                      <Box>
                        <Typography
                          fontWeight={900}
                          sx={{
                            fontSize: "1.4rem",
                            lineHeight: 1,
                            mb: 0.25,
                            background: getStatusGradient(status.value),
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {overallStats[status.value]}
                        </Typography>

                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{
                            opacity: 0.8,
                            fontSize: "0.65rem",
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {status.label}
                        </Typography>
                      </Box>

                      {/* Mini Progress Bar */}
                      <Box sx={{ width: '100%', mt: 0.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 0.25 
                        }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              background: getStatusGradient(status.value),
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >
                            {percentage}%
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.6rem" }}
                          >
                            of total
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: '100%', 
                          height: 4, 
                          borderRadius: 2, 
                          bgcolor: 'rgba(102, 126, 234, 0.1)',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            borderRadius: 2,
                            background: getStatusGradient(status.value),
                          }} />
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};

// ✅ Render Status Statistics Cards - Specific User
const renderStatusCards = () => {
  const statusGradients = {
    'pending': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'in-progress': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    'completed': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'rejected': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'onhold': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'overdue': 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    'reopen': 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    'cancelled': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    'all': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  const nonZeroStatuses = STATUS_OPTIONS.filter(status => {
    if (status.value === 'all') return true;
    return getStatusCount(status.value) > 0;
  });

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ 
            p: 0.75, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FiActivity size={16} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '0.95rem' }}>
              Task Status Distribution
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {selectedUser ? `${selectedUser.name}'s tasks` : 'All tasks'}
            </Typography>
          </Box>
        </Stack>
        <Button
          size="small"
          onClick={() => setShowStatusFilters(!showStatusFilters)}
          startIcon={showStatusFilters ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          variant="outlined"
          sx={{ 
            borderRadius: 2, 
            fontWeight: 600,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            minWidth: 'auto',
            borderColor: 'rgba(102, 126, 234, 0.2)',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#667eea',
              color: '#667eea',
              background: 'rgba(102, 126, 234, 0.05)'
            }
          }}
        >
          {showStatusFilters ? 'Hide' : 'Show'}
        </Button>
      </Stack>
      
      <Collapse in={showStatusFilters}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {nonZeroStatuses.map((status) => {
            const count = status.value === 'all' ? userTaskStats.total : getStatusCount(status.value);
            const isActive = activeStatusFilters.includes(status.value);
            const percentage = status.value !== 'all' ? userTaskStats[status.value]?.percentage || 0 : 0;
            const gradient = statusGradients[status.value] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            
            return (
              <Grid item xs={6} sm={3} md={2.4} key={status.value}>
                <Card 
                  onClick={() => handleStatusFilterToggle(status.value)}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2.5,
                    background: isActive 
                      ? `${alpha(status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea', 0.06)}`
                      : 'rgba(255, 255, 255, 0.7)',
                    border: isActive 
                      ? `2px solid ${status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea'}`
                      : `1px solid rgba(102, 126, 234, 0.15)`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${alpha(status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea', 0.15)}`,
                      borderColor: status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                    <Stack spacing={1} alignItems="center">
                      <Box 
                        sx={{ 
                          p: 0.75, 
                          borderRadius: '50%', 
                          background: gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 8px ${alpha(status.color === 'primary' ? '#667eea' : theme.palette[status.color]?.main || '#667eea', 0.3)}`,
                          mb: 0.5,
                        }}
                      >
                        {React.createElement(status.icon, { 
                          size: 14, 
                          color: "white" 
                        })}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={900} sx={{ 
                          lineHeight: 1,
                          fontSize: '1.3rem',
                          background: gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.25
                        }}>
                          {count}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ 
                          opacity: 0.8,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {status.label}
                        </Typography>
                      </Box>
                      
                      {status.value !== 'all' && (
                        <Box sx={{ width: '100%', mt: 0.5 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 0.25 
                          }}>
                            <Typography variant="caption" sx={{ 
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              background: gradient,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              {percentage}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 4, 
                            borderRadius: 2, 
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              borderRadius: 2,
                              background: gradient,
                            }} />
                          </Box>
                        </Box>
                      )}

                      {/* Active Filter Indicator */}
                      {isActive && (
                        <Box sx={{ 
                          mt: 0.5,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          background: 'rgba(102, 126, 234, 0.1)',
                          border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                          <Typography variant="caption" sx={{ 
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: '#667eea'
                          }}>
                            ✓ Active
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Collapse>
    </Box>
  );
};

  // ✅ Render Date Filter Section
  const renderDateFilterSection = () => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardCard sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                bgcolor: `${theme.palette.primary.main}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiCal size={22} color={theme.palette.primary.main} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Date & Time Filters
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Filter tasks by specific dates or time periods
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              startIcon={<FiRefreshCw />}
              onClick={resetDateFilters}
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Reset All
            </Button>
          </Stack>

          {/* Date Filter Tabs */}
          <Tabs
            value={selectedDateTab}
            onChange={(e, newValue) => setSelectedDateTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                minHeight: 48,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
              }
            }}
          >
            <Tab label="Quick Filters" icon={<FiFilter />} iconPosition="start" />
            <Tab label="Single Date" icon={<FiCalendar />} iconPosition="start" />
            <Tab label="Date Range" icon={<FiChevronRight />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ mt: 1 }}>
            {selectedDateTab === 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Select Time Period:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  {QUICK_DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={quickDateFilter === preset.value ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleQuickDateFilterChange(preset.value)}
                      startIcon={<FiCalendar size={14} />}
                      sx={{ 
                        borderRadius: 3,
                        fontWeight: quickDateFilter === preset.value ? 700 : 600,
                        backgroundColor: quickDateFilter === preset.value ? 
                          `${theme.palette.primary.main}20` : 'transparent',
                        borderColor: quickDateFilter === preset.value ? 
                          theme.palette.primary.main : 'divider',
                        color: quickDateFilter === preset.value ? 
                          theme.palette.primary.main : 'text.secondary',
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            {selectedDateTab === 1 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Select Specific Date:
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                  <DesktopDatePicker
                    label="Select Date"
                    value={singleDate}
                    onChange={handleSingleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        size="small" 
                        fullWidth 
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                    maxDate={new Date()}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleSingleDateChange(singleDate)}
                    sx={{ 
                      minWidth: 100, 
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
            )}

            {selectedDateTab === 2 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Select Date Range:
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                  <DesktopDatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => handleDateRangeChange(newValue, endDate)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        size="small" 
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                    maxDate={endDate || new Date()}
                  />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    to
                  </Typography>
                  <DesktopDatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => handleDateRangeChange(startDate, newValue)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        size="small" 
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                    minDate={startDate}
                    maxDate={new Date()}
                  />
                  <Button
                    variant="contained"
                    onClick={applyDateRange}
                    startIcon={<FiFilter />}
                    sx={{ 
                      minWidth: 120,
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                  >
                    Apply Range
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Current Filter Display */}
          <Card variant="outlined" sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2,
            background: theme.palette.background.default,
            borderStyle: 'dashed'
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <FiEye size={18} color={theme.palette.primary.main} />
                <Typography variant="body2" fontWeight={700}>
                  Current Filter:
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Chip 
                  label={QUICK_DATE_PRESETS.find(p => p.value === quickDateFilter)?.label || 'Custom'} 
                  color="primary" 
                  size="small"
                  variant="filled"
                  icon={<FiCalendar size={12} />}
                  sx={{ fontWeight: 700 }}
                />
                {activeStatusFilters.filter(f => f !== 'all').map(status => {
                  const statusOpt = STATUS_OPTIONS.find(s => s.value === status);
                  return statusOpt ? (
                    <Chip
                      key={status}
                      label={statusOpt.label}
                      size="small"
                      variant="filled"
                      sx={{ 
                        backgroundColor: `${statusOpt.color}20`,
                        color: statusOpt.color,
                        fontWeight: 700
                      }}
                      icon={React.createElement(statusOpt.icon, { size: 12 })}
                    />
                  ) : null;
                })}
                {searchQuery && (
                  <Chip
                    label="Search Active"
                    size="small"
                    color="info"
                    variant="filled"
                    sx={{ fontWeight: 700 }}
                    icon={<FiSearch size={12} />}
                  />
                )}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </DashboardCard>
    </LocalizationProvider>
  );

  // ✅ Render Enhanced User Card with Backend Data
  const renderEnhancedUserCard = (user) => {
    const isSelected = selectedUserId === user._id;
    const userStats = getUserTaskStats(user);
    const completionRate = userStats.completionRate || 0;
    
    return (
    <UserCard selected={isSelected}>
  <CardContent sx={{ p: 2 }}>
    <Stack spacing={2}>

      {/* USER HEADER */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor:
                  completionRate >= 80
                    ? "#4CAF50"
                    : completionRate >= 50
                    ? "#FFC107"
                    : "#F44336",
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          }
        >
          <Avatar
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              width: 48,
              height: 48,
              fontSize: "1rem",
              fontWeight: 800,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={800}
            noWrap
            sx={{ fontSize: "1rem", mb: 0.3 }}
          >
            {user.name || "Unknown"}
          </Typography>

          <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 0.5 }}>
            <FiBriefcase size={12} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.role || "No Role"}
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.7rem" }}
          >
            {user.email || "No Email"}
          </Typography>
        </Box>
      </Stack>

      {/* STATS BOX */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.default,
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Stack alignItems="center">
              <Typography
                fontWeight={900}
                sx={{ fontSize: "1.1rem" }}
                color="primary"
              >
                {userStats.total || 0}
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.65rem" }}>
                TOTAL
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={4}>
            <Stack alignItems="center">
              <Typography
                fontWeight={900}
                sx={{ fontSize: "1.1rem" }}
                color="#28a745"
              >
                {userStats.completed || 0}
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.65rem" }}>
                DONE
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={4}>
            <Stack alignItems="center">
              <Typography
                fontWeight={900}
                sx={{
                  fontSize: "1.1rem",
                  color:
                    completionRate >= 80
                      ? "#28a745"
                      : completionRate >= 50
                      ? "#FFC107"
                      : "#F44336",
                }}
              >
                {completionRate}%
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.65rem" }}>
                RATE
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* PROGRESS BAR */}
        <Box sx={{ mt: 1.8 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 0.6 }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: "0.65rem" }}>
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={800} sx={{ fontSize: "0.65rem" }}>
              {completionRate}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 6,
              borderRadius: 4,
              backgroundColor: `${theme.palette.primary.main}15`,
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background:
                  completionRate >= 80
                    ? "#28a745"
                    : completionRate >= 50
                    ? "#FFC107"
                    : "#F44336",
              },
            }}
          />
        </Box>
      </Box>

      {/* TAGS */}
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.7}>
        {user.employeeType && (
          <Chip
            label={user.employeeType.toUpperCase()}
            size="small"
            sx={{
              fontSize: "0.6rem",
              borderRadius: 1.2,
              fontWeight: 700,
            }}
          />
        )}

        {user.department && (
          <Chip
            label={user.department}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{
              fontSize: "0.6rem",
              borderRadius: 1.2,
              fontWeight: 700,
            }}
          />
        )}
      </Stack>
    </Stack>
  </CardContent>

  {/* ACTION BUTTON */}
  <CardActions sx={{ p: 2, pt: 0.5 }}>
    <Button
      fullWidth
      variant={isSelected ? "contained" : "outlined"}
      endIcon={<FiArrowRight />}
      size="small"
      onClick={() => {
        setSelectedUserId(user._id);
        fetchUserTasks(user._id);
      }}
      sx={{
        fontWeight: 800,
        borderRadius: 2,
        py: 0.8,
        fontSize: "0.75rem",
      }}
    >
      View Tasks
    </Button>
  </CardActions>
</UserCard>

    );
  };

  // ✅ Render Enhanced Dialog
const renderEnhancedDialog = () => (
  <Dialog
    open={openDialog}
    onClose={() => setOpenDialog(false)}
    fullWidth
    maxWidth="xl"
    scroll="paper"
    fullScreen={isMobile}
    PaperProps={{
      sx: {
        borderRadius: isMobile ? 0 : 4,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
      }
    }}
  >
    {/* Dialog Header */}
    <DialogTitle sx={{ 
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
      borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
      pb: 3,
      pt: 3.5,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }
    }}>
      <Stack spacing={2.5}>
        {/* User Info Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ 
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: 0.3,
                zIndex: 0
              }
            }}>
              <Avatar 
                sx={{ 
                  width: 60,
                  height: 60,
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  border: '3px solid white',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {getInitials(selectedUser?.name)}
              </Avatar>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                lineHeight: 1.2
              }}>
                {selectedUser?.name}'s Task Dashboard
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}>
                <Chip 
                  label={selectedUser?.role || 'No Role'} 
                  size="small" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.15)'
                    }
                  }}
                />
                <Chip 
                  label={selectedUser?.employeeType || 'No Type'} 
                  size="small" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'rgba(118, 75, 162, 0.1)',
                    color: '#764ba2',
                    border: '1px solid rgba(118, 75, 162, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'rgba(118, 75, 162, 0.15)'
                    }
                  }}
                />
                <Typography variant="caption" color="#6b7280" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <FiMail size={12} />
                  {selectedUser?.email}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <IconButton 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              width: 44,
              height: 44,
              borderRadius: 2.5,
              border: '2px solid rgba(102, 126, 234, 0.2)',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              color: '#6b7280',
              transition: 'all 0.2s ease',
              '&:hover': { 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderColor: 'transparent',
                transform: 'rotate(90deg)'
              }
            }}
          >
            <FiX size={20} />
          </IconButton>
        </Stack>
        
        {/* Active Filters Display */}
        <Card sx={{ 
          p: 2, 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(102, 126, 234, 0.15)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.08)'
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiFilter size={16} color="#fff" />
              </Box>
              <Typography variant="body2" fontWeight={700} color="#667eea">
                ACTIVE FILTERS:
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap gap={1}>
              <Chip 
                label={QUICK_DATE_PRESETS.find(p => p.value === quickDateFilter)?.label || 'Custom'} 
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.15)'
                  }
                }}
                icon={<FiCalendar size={12} color="#667eea" />}
              />
              {activeStatusFilters.filter(f => f !== 'all').map(status => {
                const statusOpt = STATUS_OPTIONS.find(s => s.value === status);
                return statusOpt ? (
                  <Chip
                    key={status}
                    label={statusOpt.label}
                    size="small"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      background: `${statusOpt.color}15`,
                      color: statusOpt.color,
                      border: `1px solid ${statusOpt.color}30`,
                      borderRadius: 2,
                      '&:hover': {
                        background: `${statusOpt.color}20`
                      }
                    }}
                    icon={React.createElement(statusOpt.icon, { 
                      size: 12,
                      color: statusOpt.color 
                    })}
                  />
                ) : null;
              })}
              {searchQuery && (
                <Chip
                  label="Search Active"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.15)'
                    }
                  }}
                  icon={<FiSearch size={12} color="#3b82f6" />}
                />
              )}
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </DialogTitle>
    
    <DialogContent dividers sx={{ 
      p: 3.5,
      background: 'rgba(102, 126, 234, 0.02)'
    }}>
      <Stack spacing={4}>
        {/* Date Filter Section */}
        {renderDateFilterSection()}

        {/* Status Statistics */}
        {renderStatusCards()}

        {/* Task List Section */}
        <Card sx={{ 
          p: 3.5,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(102, 126, 234, 0.15)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.08)',
          backdropFilter: 'blur(10px)'
        }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} 
                 justifyContent="space-between" 
                 alignItems={{ xs: 'flex-start', sm: 'center' }} 
                 spacing={2} 
                 mb={4}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
              }}>
                <FiList size={22} color="#fff" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Task Details
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.875rem'
                }}>
                  <FiInfo size={14} />
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </Typography>
              </Box>
            </Stack>

            {/* Search */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                size="small"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <FiSearch size={18} color="#667eea" />
                    </Box>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => handleSearch('')}
                        sx={{
                          '&:hover': {
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444'
                          }
                        }}
                      >
                        <FiX size={16} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  minWidth: { xs: '100%', sm: 300 },
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                    '&:hover': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                    }
                  }
                }}
              />
            </Stack>
          </Stack>

          {/* Loading State */}
          {loading ? (
            <Box textAlign="center" py={8}>
              <Box sx={{ 
                width: 70, 
                height: 70, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                border: '2px dashed rgba(102, 126, 234, 0.3)'
              }}>
                <CircularProgress 
                  size={50} 
                  thickness={4} 
                  sx={{ 
                    color: '#667eea'
                  }} 
                />
              </Box>
              <Typography variant="h5" fontWeight={700} mt={2} sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Loading Tasks...
              </Typography>
              <Typography variant="body2" color="#6b7280" mt={1}>
                Please wait while we fetch task details
              </Typography>
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Box textAlign="center" py={8} color="text.secondary">
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                border: '2px dashed rgba(102, 126, 234, 0.3)'
              }}>
                <FiArchive size={32} color="#667eea" />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={800} sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                No Tasks Found
              </Typography>
              <Typography color="#6b7280">
                No tasks match the current filters. Try adjusting your filter settings.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ 
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 600,
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    background: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
                onClick={resetDateFilters}
              >
                Reset All Filters
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {filteredTasks.map((task) => {
                const status = task.userStatus || task.status || task.overallStatus;
                const statusColor = getStatusColor(status);
                const statusIcon = getStatusIcon(status);
                
                return (
                  <Grid item xs={12} key={task._id}>
                    <Card sx={{ 
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(102, 126, 234, 0.15)',
                      borderLeft: `4px solid ${statusColor}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.15)',
                        borderColor: statusColor
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                          {/* Header */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="h6" fontWeight={800} sx={{ 
                                mb: 0.5,
                                color: '#111827'
                              }}>
                                {task.title || 'No Title'}
                              </Typography>
                              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                                <Typography variant="caption" color="#6b7280" sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <FiHash size={12} />
                                  Task ID: {task.serialNo || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="#6b7280" sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <FiCalendar size={12} />
                                  Created: {formatDate(task.createdAt)}
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={task.priority || 'medium'}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  borderRadius: 2,
                                  background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' :
                                            task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' :
                                            'rgba(16, 185, 129, 0.1)',
                                  color: task.priority === 'high' ? '#ef4444' :
                                        task.priority === 'medium' ? '#f59e0b' :
                                        '#10b981',
                                  border: `1px solid ${
                                    task.priority === 'high' ? 'rgba(239, 68, 68, 0.3)' :
                                    task.priority === 'medium' ? 'rgba(245, 158, 11, 0.3)' :
                                    'rgba(16, 185, 129, 0.3)'
                                  }`,
                                }}
                              />
                              <Chip
                                label={status}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  borderRadius: 2,
                                  background: `${statusColor}15`,
                                  color: statusColor,
                                  border: `1px solid ${statusColor}30`,
                                  textTransform: 'capitalize'
                                }}
                                icon={statusIcon}
                              />
                            </Stack>
                          </Stack>
                          
                          {/* Description */}
                          {task.description && (
                            <Typography variant="body2" color="#4b5563" sx={{ 
                              lineHeight: 1.6,
                              backgroundColor: 'rgba(102, 126, 234, 0.03)',
                              p: 2,
                              borderRadius: 2
                            }}>
                              {task.description}
                            </Typography>
                          )}
                          
                          {/* Footer Info */}
                          <Stack direction="row" spacing={3} flexWrap="wrap" gap={2}>
                            {task.dueDateTime && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ 
                                  p: 0.5, 
                                  borderRadius: 1,
                                  background: 'rgba(102, 126, 234, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FiCalendar size={14} color="#667eea" />
                                </Box>
                                <Typography variant="caption" fontWeight={600} color="#6b7280">
                                  Due: {formatDate(task.dueDateTime)}
                                </Typography>
                              </Stack>
                            )}
                            {task.completionDate && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ 
                                  p: 0.5, 
                                  borderRadius: 1,
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FiCheckCircle size={14} color="#10b981" />
                                </Box>
                                <Typography variant="caption" fontWeight={600} color="#10b981">
                                  Completed: {formatDate(task.completionDate)}
                                </Typography>
                              </Stack>
                            )}
                            {task.assignedUsers?.length > 0 && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ 
                                  p: 0.5, 
                                  borderRadius: 1,
                                  background: 'rgba(139, 92, 246, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FiUsers size={14} color="#8b5cf6" />
                                </Box>
                                <Typography variant="caption" fontWeight={600} color="#6b7280">
                                  {task.assignedUsers.length} assigned
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Card>
      </Stack>
    </DialogContent>
  </Dialog>
);

  if (!canManage)
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800}>
            Access Denied
          </Typography>
          <Typography>
            You don't have the required permissions to view this page.
          </Typography>
        </Alert>
      </Box>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1800, mx: "auto" }}>
        {/* Header */}
        <Paper sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, ${theme.palette.secondary.main}12 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[3],
          position: 'relative',
          overflow: 'hidden'
        }}>
         <Stack spacing={3} position="relative" zIndex={1}>
  <Stack
    direction={{ xs: "column", md: "row" }}
    spacing={2}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", md: "center" }}
  >
    {/* LEFT SIDE HEADING */}
    <Box>
      <Typography
        variant="h3"
        fontWeight={800}
        gutterBottom
        sx={{
          fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" }, // smaller
          lineHeight: 1.2,
        }}
      >
        📊 Employee Task Management
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        fontWeight={500}
        sx={{
          fontSize: { xs: "0.8rem", sm: "0.9rem" }, // smaller subtitle
          opacity: 0.8,
        }}
      >
        Comprehensive dashboard with advanced filtering and analytics
      </Typography>
    </Box>

    {/* RIGHT SIDE USER COUNT */}
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          p: 1.5, // smaller box padding
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FiUsers size={32} color={theme.palette.primary.main} /> {/* smaller icon */}
      </Box>

      <Box>
        <Typography
          fontWeight={800}
          color="primary"
          sx={{
            fontSize: { xs: "2rem", sm: "2.4rem", md: "2.6rem" }, // smaller count
            lineHeight: 1,
          }}
        >
          {filteredUsers.length}
        </Typography>

        <Typography
          color="text.secondary"
          fontWeight={700}
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem" }, // smaller caption
            letterSpacing: "0.5px",
          }}
        >
          ACTIVE EMPLOYEES
        </Typography>
      </Box>
    </Stack>
  </Stack>

  {/* Overall Statistics */}
  {renderOverallStats()}
</Stack>

        </Paper>

        {/* Main Content */}
     <DashboardCard sx={{ 
  p: 3, 
  mb: 4,
  borderRadius: 4,
  border: '1px solid rgba(102, 126, 234, 0.15)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
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
  }
}}>
  <Stack spacing={3}>
    {/* Top Bar - Optimized */}
    <Stack direction={{ xs: 'column', md: 'row' }} 
           justifyContent="space-between" 
           alignItems={{ xs: 'flex-start', md: 'center' }} 
           spacing={2}>
      
      {/* Left Side */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        }}>
          <FiUsers size={22} color="#fff" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{
            color: '#111827',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            mb: 0.5
          }}>
            Employee Directory
          </Typography>
          <Typography variant="body2" color="#6b7280" sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.875rem'
          }}>
            <FiInfo size={14} />
            Click on any employee to view their task details
          </Typography>
        </Box>
      </Stack>

      {/* Right Side - Search and Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
        <TextField
          size="small"
          placeholder="Search employees..."
          sx={{ 
            minWidth: { xs: '100%', sm: 280 },
            backgroundColor: 'white',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: 2
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <FiSearch size={18} color="#667eea" />
              </Box>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: '#6b7280' }}>Employee Type</InputLabel>
          <Select
            value={selectedEmployeeType}
            label="Employee Type"
            onChange={(e) => setSelectedEmployeeType(e.target.value)}
            sx={{ 
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e5e7eb',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              }
            }}
          >
            {EMPLOYEE_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {React.createElement(type.icon, {
                    size: 16,
                    color: type.color || '#667eea',
                  })}
                  <Typography variant="body2">{type.label}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>

    {/* Employee Type Chips */}
    <Box>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ 
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#6b7280',
        mb: 1.5
      }}>
        Filter by Department:
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {EMPLOYEE_TYPES.map((type) => {
          const isActive = selectedEmployeeType === type.value;
          return (
            <Chip
              key={type.value}
              label={type.label}
              onClick={() => setSelectedEmployeeType(type.value)}
              variant={isActive ? "filled" : "outlined"}
              icon={React.createElement(type.icon, { size: 14 })}
              sx={{
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.8125rem',
                backgroundColor: isActive ? 
                  `${type.color || '#667eea'}15` : 'transparent',
                borderColor: isActive ? 
                  type.color || '#667eea' : '#e5e7eb',
                color: isActive ? 
                  type.color || '#667eea' : '#6b7280',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: `${type.color || '#667eea'}10`,
                },
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}
      </Stack>
    </Box>

    {/* Stats Summary */}
    <Grid container spacing={1.5}>
      {[
        { 
          label: "Total Employees", 
          value: systemStats.totalEmployees, 
          icon: FiUsers, 
          color: '#667eea',
          bgColor: 'rgba(102, 126, 234, 0.1)'
        },
        { 
          label: "Total Tasks", 
          value: systemStats.totalTasks, 
          icon: FiList, 
          color: '#0ea5e9',
          bgColor: 'rgba(14, 165, 233, 0.1)'
        },
        { 
          label: "Avg Completion", 
          value: `${systemStats.avgCompletion}%`, 
          icon: FiPercent, 
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        { 
          label: "Active Employees", 
          value: systemStats.activeEmployees, 
          icon: FiActivity, 
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)'
        },
      ].map((stat, index) => (
        <Grid item xs={6} md={3} key={index}>
          <Card
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${stat.bgColor}`,
              background: 'white',
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 8px 16px ${alpha(stat.color, 0.1)}`,
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {React.createElement(stat.icon, {
                  size: 16,
                  color: stat.color,
                })}
              </Box>

              <Box>
                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: "1.4rem",
                    lineHeight: 1,
                    mb: 0.25,
                    color: '#111827'
                  }}
                >
                  {stat.value}
                </Typography>

                <Typography
                  variant="caption"
                  color="#6b7280"
                  fontWeight={600}
                  sx={{
                    fontSize: "0.7rem",
                    letterSpacing: '0.5px'
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Loading State */}
    {usersLoading ? (
      <Box sx={{ 
        textAlign: 'center', 
        py: 6,
        background: 'rgba(102, 126, 234, 0.03)',
        borderRadius: 3,
        border: '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ 
            mb: 2,
            color: '#667eea'
          }} 
        />
        <Typography variant="h5" fontWeight={700} mt={2} color="#111827">
          Loading Employee Data...
        </Typography>
        <Typography variant="body2" color="#6b7280" mt={1}>
          Please wait while we fetch the latest information
        </Typography>
      </Box>
    ) : filteredUsers.length === 0 ? (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8, 
        background: 'rgba(102, 126, 234, 0.03)',
        borderRadius: 3,
        border: '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'rgba(102, 126, 234, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}>
          <FiUsers size={32} color="#667eea" />
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom color="#111827">
          No Employees Found
        </Typography>
        <Typography variant="body1" color="#6b7280" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          Try selecting a different employee type or check your search terms
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<FiRefreshCw />}
          onClick={() => {
            setSelectedEmployeeType('all');
            setSearchQuery('');
          }}
          sx={{ 
            borderRadius: 3, 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4090 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
            }
          }}
        >
          Reset All Filters
        </Button>
      </Box>
    ) : (
      <Grid container spacing={2}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
            {renderEnhancedUserCard(user)}
          </Grid>
        ))}
      </Grid>
    )}
  </Stack>
</DashboardCard>
        {/* Enhanced Dialog */}
        {renderEnhancedDialog()}
      </Box>
    </LocalizationProvider>
  );
};

export default TaskDetails;