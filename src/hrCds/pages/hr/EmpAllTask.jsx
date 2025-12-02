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
  CardHeader, CardActions, Collapse, Skeleton
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
  FiEdit3, FiExternalLink, FiMoreVertical, FiShare2
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
  // { value: 'yesterday', label: 'Yesterday', getDate: () => subDays(new Date(), -1) },
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
  const renderOverallStats = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FiBarChart size={24} color={theme.palette.primary.main} />
        System-wide Task Statistics
      </Typography>
      
      <Grid container spacing={2}>
        {/* Total Tasks Card */}
        <Grid item xs={12} md={3}>
          <DashboardCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: `${theme.palette.primary.main}10`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <FiList size={32} color={theme.palette.primary.main} />
              </Box>
              <Typography variant="h1" fontWeight={900} sx={{ fontSize: '3.5rem', lineHeight: 1 }}>
                {overallStats.total}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={700}>
                Total Tasks
              </Typography>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Status Breakdown - Show only non-zero statuses */}
        {getNonZeroStatuses
          .filter(status => status.value !== 'all' && overallStats[status.value] > 0)
          .map((status, index) => (
            <Grid item xs={6} sm={4} md={2} key={status.value}>
              <StatCard color={status.color}>
                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                  <Stack spacing={1.5} alignItems="center">
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        backgroundColor: `${status.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.createElement(status.icon, { 
                        size: 20, 
                        color: status.color 
                      })}
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1 }}>
                        {overallStats[status.value]}
                      </Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ opacity: 0.8 }}>
                        {status.label}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      color: status.color
                    }}>
                      {Math.round((overallStats[status.value] / overallStats.total) * 100) || 0}%
                    </Typography>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
      </Grid>
    </Box>
  );

  // ✅ Render Status Statistics Cards - Specific User
  const renderStatusCards = () => {
    const nonZeroStatuses = STATUS_OPTIONS.filter(status => {
      if (status.value === 'all') return true;
      return getStatusCount(status.value) > 0;
    });

    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: `${theme.palette.primary.main}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiActivity size={20} color={theme.palette.primary.main} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Task Status Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser ? `${selectedUser.name}'s tasks` : 'All tasks'}
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            onClick={() => setShowStatusFilters(!showStatusFilters)}
            startIcon={showStatusFilters ? <FiChevronUp /> : <FiChevronDown />}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {showStatusFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Stack>
        
        <Collapse in={showStatusFilters}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {nonZeroStatuses.map((status) => {
              const count = status.value === 'all' ? userTaskStats.total : getStatusCount(status.value);
              const isActive = activeStatusFilters.includes(status.value);
              const percentage = status.value !== 'all' ? userTaskStats[status.value]?.percentage || 0 : 0;
              
              return (
                <Grid item xs={6} sm={4} md={2.4} key={status.value}>
                  <StatCard 
                    color={status.color}
                    onClick={() => handleStatusFilterToggle(status.value)}
                    sx={{ 
                      cursor: 'pointer',
                      borderColor: isActive ? status.color : `${status.color}20`,
                      borderWidth: isActive ? 2 : 1,
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Stack spacing={1.5} alignItems="center">
                        <Box 
                          className="stat-icon"
                          sx={{ 
                            p: 1.5, 
                            borderRadius: '50%', 
                            backgroundColor: `${status.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          {React.createElement(status.icon, { 
                            size: 22, 
                            color: status.color 
                          })}
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1 }}>
                            {count}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} sx={{ opacity: 0.8 }}>
                            {status.label}
                          </Typography>
                        </Box>
                        {status.value !== 'all' && (
                          <Box sx={{ width: '100%' }}>
                            <ProgressIndicator 
                              value={percentage}
                              color={status.color}
                            />
                            <Typography variant="caption" sx={{ 
                              display: 'block', 
                              textAlign: 'right', 
                              mt: 0.5,
                              fontWeight: 600,
                              color: status.color
                            }}>
                              {percentage}%
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </StatCard>
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
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {/* User Header */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box sx={{ 
                    width: 14, 
                    height: 14, 
                    borderRadius: '50%',
                    bgcolor: completionRate >= 80 ? '#4CAF50' : 
                            completionRate >= 50 ? '#FFC107' : '#F44336',
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: theme.shadows[2]
                  }} />
                }
              >
                <Avatar 
                  sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    width: 60,
                    height: 60,
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    boxShadow: theme.shadows[3]
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={900} noWrap sx={{ mb: 0.5 }}>
                  {user.name || "Unknown User"}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <FiBriefcase size={14} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.role || "No Role"}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {user.email || 'No email'}
                </Typography>
              </Box>
            </Stack>
            
            {/* Stats with Visual Indicators */}
            <Box sx={{ 
              p: 2, 
              borderRadius: 2.5, 
              background: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h5" fontWeight={900} color="primary">
                      {userStats.total || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      TOTAL
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h5" fontWeight={900} color="#28a745">
                      {userStats.completed || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      DONE
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography 
                      variant="h5" 
                      fontWeight={900}
                      sx={{
                        color: completionRate >= 80 ? '#28a745' :
                               completionRate >= 50 ? '#FFC107' : '#F44336'
                      }}
                    >
                      {completionRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      RATE
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
              
              {/* Progress Bar */}
              <Box sx={{ mt: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Progress
                  </Typography>
                  <Typography variant="caption" fontWeight={800}>
                    {completionRate}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={completionRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: `${theme.palette.primary.main}15`,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, 
                        ${completionRate >= 80 ? '#28a745' :
                          completionRate >= 50 ? '#FFC107' : '#F44336'} 0%, 
                        ${completionRate >= 80 ? '#28a745' :
                          completionRate >= 50 ? '#FFC107' : '#F44336'}AA 100%)`,
                    }
                  }}
                />
              </Box>
            </Box>
            
            {/* Tags */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {user.employeeType && (
                <Chip
                  label={user.employeeType.toUpperCase()}
                  color="primary"
                  size="small"
                  variant="filled"
                  sx={{ 
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    letterSpacing: '0.5px',
                    borderRadius: 1.5
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
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    borderRadius: 1.5
                  }}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
        
        {/* Action Button */}
        <CardActions sx={{ p: 2.5, pt: 0 }}>
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
              borderRadius: 2.5,
              py: 1.2,
              fontSize: '0.85rem',
              background: isSelected ? 
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` : undefined,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isSelected ? theme.shadows[6] : theme.shadows[3],
              },
              transition: 'all 0.3s ease',
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
          background: theme.palette.background.default,
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 3,
        pt: 3
      }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 56,
                  height: 56,
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  boxShadow: theme.shadows[4]
                }}
              >
                {getInitials(selectedUser?.name)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={900} color="primary">
                  {selectedUser?.name}'s Task Dashboard
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
                  <Chip 
                    label={selectedUser?.role || 'No Role'} 
                    size="small" 
                    color="primary" 
                    variant="filled"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip 
                    label={selectedUser?.employeeType || 'No Type'} 
                    size="small" 
                    color="secondary" 
                    variant="filled"
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser?.email}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <IconButton 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                border: `2px solid ${theme.palette.divider}`,
                '&:hover': { 
                  backgroundColor: theme.palette.error.main,
                  color: 'white',
                  borderColor: theme.palette.error.main
                }
              }}
            >
              <FiX />
            </IconButton>
          </Stack>
          
          {/* Current Filters Display */}
          <Card variant="outlined" sx={{ 
            p: 1.5, 
            borderRadius: 2,
            background: theme.palette.background.paper
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <FiFilter size={18} color={theme.palette.primary.main} />
                <Typography variant="body2" fontWeight={700}>
                  Active Filters:
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Date Filter Section */}
          {renderDateFilterSection()}

          {/* Status Statistics */}
          {renderStatusCards()}

          {/* Task List Section */}
          <DashboardCard sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} 
                   justifyContent="space-between" 
                   alignItems={{ xs: 'flex-start', sm: 'center' }} 
                   spacing={2} 
                   mb={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  bgcolor: `${theme.palette.info.main}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiList size={24} color={theme.palette.info.main} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    Task Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
                    startAdornment: <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => handleSearch('')}>
                          <FiX size={14} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 280 },
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Stack>
            </Stack>

            {/* Loading State */}
            {loading ? (
              <Box textAlign="center" py={6}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h6" fontWeight={700}>
                  Loading Tasks...
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Please wait while we fetch task details
                </Typography>
              </Box>
            ) : filteredTasks.length === 0 ? (
              <Box textAlign="center" py={6} color="text.secondary">
                <FiArchive size={72} style={{ marginBottom: 16, opacity: 0.3 }} />
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  No Tasks Found
                </Typography>
                <Typography>
                  No tasks match the current filters. Try adjusting your filter settings.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 3 }}
                  onClick={resetDateFilters}
                >
                  Reset All Filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredTasks.map((task) => {
                  const status = task.userStatus || task.status || task.overallStatus;
                  const statusColor = getStatusColor(status);
                  const statusIcon = getStatusIcon(status);
                  
                  return (
                    <Grid item xs={12} key={task._id}>
                      <Card variant="outlined" sx={{ 
                        borderRadius: 3,
                        borderLeft: `4px solid ${statusColor}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                        }
                      }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
                                  {task.title || 'No Title'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Task ID: {task.serialNo || 'N/A'} • Created: {formatDate(task.createdAt)}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={task.priority || 'medium'}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    borderRadius: 1.5,
                                    backgroundColor: 
                                      task.priority === 'high' ? `${theme.palette.error.main}20` :
                                      task.priority === 'medium' ? `${theme.palette.warning.main}20` :
                                      `${theme.palette.success.main}20`,
                                    color: 
                                      task.priority === 'high' ? theme.palette.error.main :
                                      task.priority === 'medium' ? theme.palette.warning.main :
                                      theme.palette.success.main,
                                  }}
                                />
                                <Chip
                                  label={status}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    borderRadius: 1.5,
                                    backgroundColor: `${statusColor}20`,
                                    color: statusColor,
                                    textTransform: 'capitalize'
                                  }}
                                  icon={statusIcon}
                                />
                              </Stack>
                            </Stack>
                            
                            {task.description && (
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                            )}
                            
                            <Stack direction="row" spacing={3} flexWrap="wrap" gap={2}>
                              {task.dueDateTime && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <FiCalendar size={16} color={theme.palette.text.secondary} />
                                  <Typography variant="caption" fontWeight={600}>
                                    Due: {formatDate(task.dueDateTime)}
                                  </Typography>
                                </Stack>
                              )}
                              {task.completionDate && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <FiCheckCircle size={16} color="#28a745" />
                                  <Typography variant="caption" fontWeight={600} color="#28a745">
                                    Completed: {formatDate(task.completionDate)}
                                  </Typography>
                                </Stack>
                              )}
                              {task.assignedUsers?.length > 0 && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <FiUsers size={16} color={theme.palette.text.secondary} />
                                  <Typography variant="caption" fontWeight={600}>
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
          </DashboardCard>
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
          <Stack spacing={4} position="relative" zIndex={1}>
            <Stack direction={{ xs: "column", md: "row" }} 
                   spacing={3} 
                   justifyContent="space-between" 
                   alignItems={{ xs: "flex-start", md: "center" }}>
              <Box>
                <Typography variant="h1" fontWeight={900} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  📊 Employee Task Management
                </Typography>
                <Typography variant="h5" color="text.secondary" fontWeight={500}>
                  Comprehensive dashboard with advanced filtering and analytics
                </Typography>
              </Box>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ 
                  p: 2.5, 
                  borderRadius: 4, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FiUsers size={48} color={theme.palette.primary.main} />
                </Box>
                <Box>
                  <Typography variant="h1" fontWeight={900} color="primary" sx={{ fontSize: { xs: '3rem', md: '4rem' }, lineHeight: 1 }}>
                    {filteredUsers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    ACTIVE EMPLOYEES
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            
            {/* Overall Statistics from All Users */}
            {renderOverallStats()}
          </Stack>
        </Paper>

        {/* Main Content */}
        <DashboardCard sx={{ p: 3, mb: 3 }}>
          <Stack spacing={4}>
            {/* Top Bar */}
            <Stack direction={{ xs: 'column', md: 'row' }} 
                   justifyContent="space-between" 
                   alignItems={{ xs: 'flex-start', md: 'center' }} 
                   spacing={3}>
              
              {/* Left Side */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  bgcolor: `${theme.palette.primary.main}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiUsers size={28} color={theme.palette.primary.main} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={900}>
                    Employee Directory
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Click on any employee to view their task details
                  </Typography>
                </Box>
              </Stack>

              {/* Right Side - Search and Filters */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search employees..."
                  sx={{ 
                    minWidth: { xs: '100%', sm: 280 },
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  InputProps={{
                    startAdornment: <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Employee Type</InputLabel>
                  <Select
                    value={selectedEmployeeType}
                    label="Employee Type"
                    onChange={(e) => setSelectedEmployeeType(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {EMPLOYEE_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {React.createElement(type.icon, {
                            size: 18,
                            color: type.color,
                          })}
                          <Typography>{type.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            {/* Employee Type Chips */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Filter by Department:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                {EMPLOYEE_TYPES.map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => setSelectedEmployeeType(type.value)}
                    variant={selectedEmployeeType === type.value ? "filled" : "outlined"}
                    color="primary"
                    icon={React.createElement(type.icon, { size: 16 })}
                    sx={{
                      fontWeight: selectedEmployeeType === type.value ? 800 : 600,
                      backgroundColor: selectedEmployeeType === type.value ? 
                        `${type.color}20` : 'transparent',
                      borderColor: selectedEmployeeType === type.value ? 
                        type.color : 'divider',
                      color: selectedEmployeeType === type.value ? 
                        type.color : 'text.secondary',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[2],
                      },
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* System Stats Summary */}
            <Grid container spacing={2}>
              {[
                { label: 'Total Employees', value: systemStats.totalEmployees, icon: FiUsers, color: theme.palette.primary.main },
                { label: 'Total Tasks', value: systemStats.totalTasks, icon: FiList, color: theme.palette.info.main },
                { label: 'Avg Completion', value: `${systemStats.avgCompletion}%`, icon: FiPercent, color: theme.palette.success.main },
                { label: 'Active Employees', value: systemStats.activeEmployees, icon: FiActivity, color: theme.palette.secondary.main },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Card variant="outlined" sx={{ 
                    p: 2.5, 
                    borderRadius: 3,
                    border: `1px solid ${stat.color}30`,
                    background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: stat.color,
                    }
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2.5}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2.5, 
                        bgcolor: `${stat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {React.createElement(stat.icon, { 
                          size: 20, 
                          color: stat.color 
                        })}
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight={900}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={80} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h5" fontWeight={700} mt={3}>
                  Loading Employee Data...
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Please wait while we fetch the latest information
                </Typography>
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                <FiUsers size={96} style={{ marginBottom: 24, opacity: 0.2 }} />
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  No Employees Found
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
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
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                  Reset All Filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
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