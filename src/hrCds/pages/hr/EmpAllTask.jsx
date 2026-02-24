import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import "./EmpAllTask.css";
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
  FiEdit3, FiExternalLink, FiMoreVertical, FiShare2, FiInfo, FiHash,
  FiPlay, FiPause, FiStopCircle, FiUserCheck, FiUserX, FiClock as FiTime
} from "react-icons/fi";

// Status Options
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

const TaskDetails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Activity Log states
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedTaskForActivity, setSelectedTaskForActivity] = useState(null);

  // User states
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUserCompanyRole, setCurrentUserCompanyRole] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilters, setActiveStatusFilters] = useState(['all']);
  const [showStatusFilters, setShowStatusFilters] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = new Date();

  // Helper function to check if user is Owner
  const isOwner = () => {
    return currentUserCompanyRole === 'Owner' || currentUserRole === 'Owner' || currentUserRole === 'CAREER INFOWIS Admin';
  };

  // Helper function to get company name
  const getCompanyName = (company) => {
    if (!company) return 'N/A';
    if (typeof company === 'object') {
      return company.companyName || company.name || company._id || 'N/A';
    }
    return company;
  };

  // Helper function to get department name
  const getDepartmentName = (department) => {
    if (!department) return 'N/A';
    if (typeof department === 'object') {
      return department.name || department._id || 'N/A';
    }
    return department;
  };

  const isSameDay = (d1, d2) => {
    const a = new Date(d1);
    const b = new Date(d2);
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const isThisWeek = (date) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return new Date(date) >= start && new Date(date) <= end;
  };

  // Overall Statistics
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

  // ✅ FIXED: User authentication function with proper error handling
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("Please log in to access this page");
          return;
        }

        const user = JSON.parse(userStr);
        console.log("👤 Current user data:", user);
        
        // Extract user details
        let foundUser = null;
        let userRole = 'user';
        let companyRole = 'employee';
        let userName = '';
        let userCompany = null;
        let userDepartment = null;
        
        // Handle different user object structures
        if (user.id && typeof user.id === 'string') {
          foundUser = user;
          userRole = user.role || 'user';
          companyRole = user.companyRole || user.role || 'employee';
          userName = user.name || 'Unknown User';
          userCompany = user.company || null;
          userDepartment = user.department || null;
        }
        else if (user.user && user.user.id) {
          foundUser = user.user;
          userRole = user.user.role || 'user';
          companyRole = user.user.companyRole || user.user.role || 'employee';
          userName = user.user.name || 'Unknown User';
          userCompany = user.user.company || null;
          userDepartment = user.user.department || null;
        }
        else if (user._id) {
          foundUser = user;
          userRole = user.role || 'user';
          companyRole = user.companyRole || user.role || 'employee';
          userName = user.name || 'Unknown User';
          userCompany = user.company || null;
          userDepartment = user.department || null;
        }
        
        // If no name, try to extract from email
        if (!userName && user.email) {
          userName = user.email.split('@')[0];
        }

        setCurrentUser(foundUser || user);
        setCurrentUserRole(userRole);
        setCurrentUserCompanyRole(companyRole);

        console.log("✅ User authenticated:", {
          name: userName,
          role: userRole,
          companyRole: companyRole,
          company: userCompany,
          department: userDepartment
        });
        
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("Error loading user data");
      }
    };

    fetchUserData();
  }, []);

  // Calculate overall stats from all users
  const calculateOverallStats = (usersData) => {
    if (!usersData || usersData.length === 0) {
      const emptyStats = {};
      STATUS_OPTIONS.forEach(opt => {
        if (opt.value !== 'all') {
          emptyStats[opt.value] = 0;
        }
      });
      setOverallStats({ total: 0, ...emptyStats });
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

  // ✅ FIXED: Fetch Users Function with role-based filtering
  const fetchUsersWithTasks = async () => {
    setUsersLoading(true);
    setError("");
    try {
      console.log("📤 Fetching users with role-based access...");

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to access this page");
        setUsersLoading(false);
        return;
      }

      // Add authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Try different endpoints based on role
      let response = null;
      let usersData = [];

      if (currentUser) {
        // Determine which API to call based on user role
        let apiUrl = '';
        
        if (isOwner()) {
          // Owner: Get all company users
          const companyId = currentUser?.company?._id || currentUser?.company;
          if (companyId) {
            apiUrl = `/users/company-users?companyId=${companyId}`;
            console.log("👑 Owner: Fetching all company users from:", apiUrl);
          } else {
            apiUrl = '/users/company-users';
            console.log("⚠️ No company ID found, using default endpoint");
          }
        } else {
          // Employee: Get department users
          const deptId = currentUser?.department?._id || currentUser?.department;
          if (deptId) {
            apiUrl = `/users/department-users?department=${deptId}`;
            console.log("👤 Employee: Fetching department users from:", apiUrl);
          } else {
            // Fallback to company users if no department
            const companyId = currentUser?.company?._id || currentUser?.company;
            if (companyId) {
              apiUrl = `/users/company-users?companyId=${companyId}`;
              console.log("⚠️ No department ID, falling back to company users");
            } else {
              apiUrl = '/users/company-users';
            }
          }
        }

        try {
          response = await axios.get(apiUrl, config);
        } catch (apiError) {
          console.log("Primary endpoint failed, trying fallback...");
          throw apiError;
        }
      } else {
        // If no current user, try general endpoint
        try {
          response = await axios.get('/task/users-with-counts', config);
        } catch (generalError) {
          console.log("General endpoint failed, trying users list...");
          const usersResponse = await axios.get('/auth/users', config);
          if (usersResponse.data?.users) {
            usersData = usersResponse.data.users;
          }
        }
      }

      // Handle different response formats
      if (response?.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response?.data?.message?.users && Array.isArray(response.data.message.users)) {
        usersData = response.data.message.users;
      }

      console.log("✅ Users data received:", usersData.length);

      // Ensure each user has taskStats and proper fields
      const usersWithStats = usersData.map(user => ({
        ...user,
        _id: user._id || user.id, // Ensure _id exists
        name: user.name || user.fullName || user.email?.split('@')[0] || 'Unknown User',
        role: user.role || user.designation || 'Employee',
        email: user.email || '',
        company: user.company || null,
        department: user.department || null,
        taskStats: user.taskStats || {
          total: 0,
          pending: 0,
          completed: 0,
          completionRate: 0,
          inProgress: 0,
          approved: 0,
          rejected: 0,
          overdue: 0,
          onhold: 0,
          reopen: 0,
          cancelled: 0
        }
      }));

      // Filter to ensure only same company users
      let filteredUsers = usersWithStats;
      if (currentUser?.company) {
        const currentCompanyId = currentUser.company._id || currentUser.company;
        filteredUsers = usersWithStats.filter(user => {
          const userCompanyId = user.company?._id || user.company;
          return userCompanyId?.toString() === currentCompanyId?.toString();
        });
        console.log("👥 Filtered to same company:", filteredUsers.length);
      }

      // For employees, filter to same department
      if (!isOwner() && currentUser?.department) {
        const currentDeptId = currentUser.department._id || currentUser.department;
        filteredUsers = filteredUsers.filter(user => {
          const userDeptId = user.department?._id || user.department;
          return userDeptId?.toString() === currentDeptId?.toString();
        });
        console.log("👥 Filtered to same department:", filteredUsers.length);
      }

      setUsers(filteredUsers);
      calculateOverallStats(filteredUsers);

    } catch (err) {
      console.error("❌ Error fetching users with tasks:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this page.");
      } else {
        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Unable to load employee data. Please try again."
        );
      }

      // Set empty users array
      setUsers([]);
      calculateOverallStats([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filtered users based on search query and role
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name?.toLowerCase().includes(query)) ||
        (user.email?.toLowerCase().includes(query)) ||
        (user.employeeId?.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [users, searchQuery]);

  // Get non-zero statuses for overall stats
  const getNonZeroStatuses = useMemo(() => {
    return STATUS_OPTIONS.filter(status => {
      if (status.value === 'all') return true;
      return overallStats[status.value] > 0;
    });
  }, [overallStats]);

  // Filter tasks based on active status filters
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    let filtered = [...tasks];
    const now = new Date();

    /* 🔍 SEARCH FILTER */
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.serialNo?.toString().includes(query)
      );
    }

    /* 📌 STATUS FILTER */
    if (!activeStatusFilters.includes("all")) {
      filtered = filtered.filter(task => {
        const status = task.userStatus || task.status || task.overallStatus;
        return activeStatusFilters.includes(status);
      });
    }

    /* 📅 DATE FILTER */
    filtered = filtered.filter(task => {
      const rawDate = task.dueDateTime || task.createdAt;
      if (!rawDate) return false;

      const taskTime = new Date(rawDate).setHours(0, 0, 0, 0);

      // 🔹 DATE RANGE FILTER (From – To)
      if (fromDate || toDate) {
        const fromTime = fromDate
          ? new Date(fromDate).setHours(0, 0, 0, 0)
          : null;

        const toTime = toDate
          ? new Date(toDate).setHours(23, 59, 59, 999)
          : null;

        if (fromTime && taskTime < fromTime) return false;
        if (toTime && taskTime > toTime) return false;

        return true;
      }

      // 🔹 QUICK DATE FILTERS
      if (dateFilter === "today") {
        return isSameDay(rawDate, now);
      }

      if (dateFilter === "tomorrow") {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return isSameDay(rawDate, tomorrow);
      }

      if (dateFilter === "week") {
        return isThisWeek(rawDate);
      }

      if (dateFilter === "overdue") {
        return new Date(rawDate) < now;
      }

      return true;
    });

    /* 🚦 PRIORITY FILTER */
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    /* ⭐ TODAY TASKS ALWAYS ON TOP */
    filtered.sort((a, b) => {
      const aDate = a.dueDateTime || a.createdAt;
      const bDate = b.dueDateTime || b.createdAt;

      const aToday = aDate && isSameDay(aDate, now);
      const bToday = bDate && isSameDay(bDate, now);

      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }, [
    tasks,
    searchQuery,
    activeStatusFilters,
    dateFilter,
    fromDate,
    toDate,
    priorityFilter
  ]);

  useEffect(() => {
    if (fromDate || toDate) setDateFilter("all");
  }, [fromDate, toDate]);

  // Fetch all users with task counts from backend when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      fetchUsersWithTasks();
    }
  }, [currentUser]);

  // Fetch task status counts for specific user
  const fetchTaskStatusCounts = async (userId) => {
    try {
      if (!userId) {
        console.error("❌ No userId provided to fetchTaskStatusCounts");
        return;
      }
      
      const response = await axios.get(`/task/user/${userId}/stats`);

      if (response.data.success && response.data.statusCounts) {
        const statusCounts = response.data.statusCounts;

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
      calculateStatsFromTasks();
    }
  };

  // Calculate stats from tasks data (fallback)
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

  // Handle status filter toggle
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

  // ✅ FIXED: Fetch user tasks with proper error handling
  const fetchUserTasks = async (userId) => {
    if (!userId) {
      setError("Invalid user ID");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const user = users.find((x) => x._id === userId || x.id === userId);
      if (!user) {
        setError("User not found");
        setLoading(false);
        return;
      }

      setSelectedUser(user);
      setSelectedUserId(userId);

      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const queryString = params.toString();
      const url = `/task/user/${userId}/tasks${queryString ? `?${queryString}` : ''}`;
      
      console.log("📤 Fetching tasks for user:", userId, "URL:", url);
      
      const res = await axios.get(url);

      if (res.data.success) {
        const tasksData = res.data.tasks || [];
        setTasks(tasksData);

        // Fetch stats from backend
        await fetchTaskStatusCounts(userId);
        setOpenDialog(true);
      } else {
        setError(res.data.message || "Failed to fetch user tasks");
      }

    } catch (err) {
      console.error("❌ Error fetching user tasks:", err);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error fetching tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity logs for a specific task
  const fetchActivityLogs = async (taskId) => {
    if (!taskId) return;
    
    setLoadingActivity(true);
    try {
      console.log("📤 Fetching activity logs for task:", taskId);
      const response = await axios.get(`/task/${taskId}/activity-logs`);
      
      if (response.data.success) {
        setActivityLogs(response.data.logs || []);
      } else {
        setActivityLogs([]);
      }
    } catch (err) {
      console.error("❌ Error fetching activity logs:", err);
      setActivityLogs([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Handle view activity logs
  const handleViewActivityLogs = (task, e) => {
    e.stopPropagation(); // Prevent card click
    setSelectedTaskForActivity(task);
    fetchActivityLogs(task._id);
    setShowActivityLog(true);
  };

  // Close activity log modal
  const handleCloseActivityLog = () => {
    setShowActivityLog(false);
    setSelectedTaskForActivity(null);
    setActivityLogs([]);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setActiveStatusFilters(['all']);
    setDateFilter('all');
    setPriorityFilter('all');
    setFromDate('');
    setToDate('');
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      return "";
    }
  };

  // Format date and time together
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get status count for specific user
  const getStatusCount = (status) => {
    switch (status) {
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

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user task stats
  const getUserTaskStats = (user) => {
    return user.taskStats || {
      total: 0,
      pending: 0,
      completed: 0,
      completionRate: 0,
      inProgress: 0,
      approved: 0,
      rejected: 0,
      overdue: 0,
      onhold: 0,
      reopen: 0,
      cancelled: 0
    };
  };

  // Get activity log icon based on action type
  const getActivityIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create')) return <FiPlus size={14} />;
    if (actionLower.includes('update') || actionLower.includes('edit')) return <FiEdit3 size={14} />;
    if (actionLower.includes('status')) return <FiRefreshCw size={14} />;
    if (actionLower.includes('complete')) return <FiCheckCircle size={14} />;
    if (actionLower.includes('pending')) return <FiClock size={14} />;
    if (actionLower.includes('progress')) return <FiPlay size={14} />;
    if (actionLower.includes('hold')) return <FiPause size={14} />;
    if (actionLower.includes('cancel')) return <FiStopCircle size={14} />;
    if (actionLower.includes('approve')) return <FiCheckSquare size={14} />;
    if (actionLower.includes('reject')) return <FiXCircle size={14} />;
    if (actionLower.includes('assign')) return <FiUserCheck size={14} />;
    if (actionLower.includes('unassign')) return <FiUserX size={14} />;
    return <FiActivity size={14} />;
  };

  // Get activity log color based on action type
  const getActivityColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create')) return '#10b981';
    if (actionLower.includes('complete')) return '#059669';
    if (actionLower.includes('pending')) return '#f59e0b';
    if (actionLower.includes('progress')) return '#0ea5e9';
    if (actionLower.includes('hold')) return '#8b5cf6';
    if (actionLower.includes('cancel')) return '#dc2626';
    if (actionLower.includes('reject')) return '#dc2626';
    if (actionLower.includes('approve')) return '#20c997';
    return '#6b7280';
  };

  // Render overall statistics
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
      <div className="TaskDetails-overall-stats">
        <div className="TaskDetails-overall-stats-header">
          <div className="TaskDetails-overall-stats-icon">
            <FiBarChart />
          </div>
          <h4>System-wide Task Statistics</h4>
          {!isOwner() && (
            <span className="TaskDetails-role-badge" style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
              (Your Department Only)
            </span>
          )}
        </div>

        <div className="TaskDetails-overall-stats-grid">
          {/* Total Tasks Card */}
          <div className="TaskDetails-overall-stat-card">
            <div className="TaskDetails-overall-stat-content">
              <div
                className="TaskDetails-overall-stat-icon"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <FiList color="white" />
              </div>
              <div className="TaskDetails-overall-stat-number">
                {overallStats.total}
              </div>
              <div className="TaskDetails-overall-stat-label">
                Total Tasks
              </div>
            </div>
          </div>

          {/* Status Breakdown Cards */}
          {getNonZeroStatuses
            .filter((status) => status.value !== "all" && overallStats[status.value] > 0)
            .map((status) => {
              const percentage = Math.round(
                (overallStats[status.value] / overallStats.total) * 100
              ) || 0;

              return (
                <div
                  key={status.value}
                  className="TaskDetails-overall-stat-card"
                  style={{
                    borderColor: `${status.color}30`,
                    background: overallStats[status.value] > 0 ?
                      `linear-gradient(135deg, ${status.color}15 0%, ${status.color}08 100%)` :
                      'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="TaskDetails-overall-stat-content">
                    <div
                      className="TaskDetails-overall-stat-icon"
                      style={{
                        background: getStatusGradient(status.value)
                      }}
                    >
                      {React.createElement(status.icon, {
                        color: "white",
                      })}
                    </div>
                    <div
                      className="TaskDetails-overall-stat-number"
                      style={{
                        background: getStatusGradient(status.value)
                      }}
                    >
                      {overallStats[status.value]}
                    </div>
                    <div className="TaskDetails-overall-stat-label">
                      {status.label}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Render status cards
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
      <div className="TaskDetails-status-cards">
        <div className="TaskDetails-status-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="TaskDetails-status-icon">
              <FiActivity />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Task Status Distribution</h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280' }}>
                {selectedUser ? `${selectedUser.name}'s tasks` : 'All tasks'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusFilters(!showStatusFilters)}
            style={{
              background: 'none',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {showStatusFilters ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
            {showStatusFilters ? 'Hide' : 'Show'}
          </button>
        </div>

        {showStatusFilters && (
          <div className="TaskDetails-status-grid">
            {nonZeroStatuses.map((status) => {
              const count = status.value === 'all' ? userTaskStats.total : getStatusCount(status.value);
              const isActive = activeStatusFilters.includes(status.value);
              const percentage = status.value !== 'all' ? userTaskStats[status.value]?.percentage || 0 : 0;
              const gradient = statusGradients[status.value] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

              return (
                <div
                  key={status.value}
                  className={`TaskDetails-status-card ${isActive ? 'TaskDetails-status-card-active' : ''}`}
                  onClick={() => handleStatusFilterToggle(status.value)}
                  style={{
                    borderColor: isActive ? status.color : 'rgba(102, 126, 234, 0.15)',
                    background: isActive ? `${status.color}15` : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="TaskDetails-status-content">
                    <div
                      className="TaskDetails-status-card-icon"
                      style={{
                        background: gradient
                      }}
                    >
                      {React.createElement(status.icon, {
                        color: "white"
                      })}
                    </div>
                    <div
                      className="TaskDetails-status-card-number"
                      style={{
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {count}
                    </div>
                    <div className="TaskDetails-status-card-label">
                      {status.label}
                    </div>

                    {status.value !== 'all' && (
                      <div style={{ width: '100%', marginTop: '0.25rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.125rem'
                        }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {percentage}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: gradient
                          }} />
                        </div>
                      </div>
                    )}

                    {isActive && (
                      <div style={{
                        marginTop: '0.25rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                      }}>
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          color: '#667eea'
                        }}>
                          ✓ Active
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render enhanced user card
  const renderEnhancedUserCard = (user) => {
    const isSelected = selectedUserId === (user._id || user.id);
    const userStats = getUserTaskStats(user);
    const completionRate = userStats.completionRate || 0;
    const badgeClass = completionRate >= 80 ? 'TaskDetails-user-avatar-badge-high' :
      completionRate >= 50 ? 'TaskDetails-user-avatar-badge-medium' :
        'TaskDetails-user-avatar-badge-low';
    const progressClass = completionRate >= 80 ? 'TaskDetails-progress-fill-high' :
      completionRate >= 50 ? 'TaskDetails-progress-fill-medium' :
        'TaskDetails-progress-fill-low';

    const userId = user._id || user.id;

    return (
      <div
        className={`TaskDetails-user-card ${isSelected ? 'TaskDetails-user-card-selected' : ''}`}
        onClick={() => {
          if (userId) {
            setSelectedUserId(userId);
            fetchUserTasks(userId);
          }
        }}
      >
        <div className="TaskDetails-user-card-content">
          <div className="TaskDetails-user-header">
            <div className="TaskDetails-user-avatar">
              {getInitials(user.name)}
              <div className={`TaskDetails-user-avatar-badge ${badgeClass}`}></div>
            </div>
            <div className="TaskDetails-user-info">
              <div className="TaskDetails-user-name">
                {user.name || "Unknown"}
              </div>
              <div className="TaskDetails-user-role">
                <FiBriefcase size={12} />
                {user.role || "No Role"}
              </div>
              <div className="TaskDetails-user-email">
                {user.email || "No Email"}
              </div>
              {!isOwner() && user.department && (
                <div className="TaskDetails-user-department" style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  Dept: {getDepartmentName(user.department)}
                </div>
              )}
            </div>
          </div>

          <div className="TaskDetails-stats-box">
            <div className="TaskDetails-stats-row">
              <div>
                <div className="TaskDetails-stat-number TaskDetails-total-stat">
                  {userStats.total || 0}
                </div>
                <div className="TaskDetails-stat-label">TOTAL</div>
              </div>
              <div>
                <div className="TaskDetails-stat-number TaskDetails-completed-stat">
                  {userStats.completed || 0}
                </div>
                <div className="TaskDetails-stat-label">DONE</div>
              </div>
              <div>
                <div
                  className="TaskDetails-stat-number TaskDetails-rate-stat"
                  style={{
                    color: completionRate >= 80 ? "#28a745" :
                      completionRate >= 50 ? "#FFC107" : "#F44336"
                  }}
                >
                  {completionRate}%
                </div>
                <div className="TaskDetails-stat-label">RATE</div>
              </div>
            </div>

            <div className="TaskDetails-progress-container">
              <div className="TaskDetails-progress-header">
                <div className="TaskDetails-progress-label">Progress</div>
                <div className="TaskDetails-progress-percentage">{completionRate}%</div>
              </div>
              <div className="TaskDetails-progress-bar">
                <div
                  className={`TaskDetails-progress-fill ${progressClass}`}
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            className={`TaskDetails-action-button ${isSelected ? 'TaskDetails-action-button-primary' : 'TaskDetails-action-button-outlined'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (userId) {
                setSelectedUserId(userId);
                fetchUserTasks(userId);
              }
            }}
          >
            View Tasks
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Render activity log modal
  const renderActivityLogModal = () => {
    if (!showActivityLog || !selectedTaskForActivity) return null;

    return (
      <div className="TaskDetails-activity-modal-overlay" onClick={handleCloseActivityLog}>
        <div className="TaskDetails-activity-modal" onClick={(e) => e.stopPropagation()}>
          {/* Activity Modal Header */}
          <div className="TaskDetails-activity-modal-header">
            <div className="TaskDetails-activity-modal-header-content">
              <div className="TaskDetails-activity-modal-title">
                <div className="TaskDetails-activity-modal-icon">
                  <FiActivity size={20} />
                </div>
                <div>
                  <h3>Activity Log</h3>
                  <p className="TaskDetails-activity-modal-task-title">
                    {selectedTaskForActivity.title || 'Untitled Task'} 
                    {selectedTaskForActivity.serialNo && ` (#${selectedTaskForActivity.serialNo})`}
                  </p>
                </div>
              </div>
              <button
                className="TaskDetails-activity-modal-close"
                onClick={handleCloseActivityLog}
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Activity Modal Body */}
          <div className="TaskDetails-activity-modal-body">
            {loadingActivity ? (
              <div className="TaskDetails-activity-loading">
                <div className="TaskDetails-activity-spinner" />
                <p>Loading activity logs...</p>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="TaskDetails-activity-empty">
                <div className="TaskDetails-activity-empty-icon">
                  <FiClock size={32} />
                </div>
                <h4>No Activity Logs</h4>
                <p>No activity recorded for this task yet</p>
              </div>
            ) : (
              <div className="TaskDetails-activity-timeline">
                {activityLogs.map((log, index) => (
                  <div key={log._id || index} className="TaskDetails-activity-item">
                    <div className="TaskDetails-activity-timeline-line">
                      <div 
                        className="TaskDetails-activity-dot"
                        style={{ backgroundColor: getActivityColor(log.action) }}
                      >
                        {getActivityIcon(log.action)}
                      </div>
                      {index < activityLogs.length - 1 && (
                        <div className="TaskDetails-activity-line" />
                      )}
                    </div>
                    <div className="TaskDetails-activity-content">
                      <div className="TaskDetails-activity-header">
                        <span 
                          className="TaskDetails-activity-action"
                          style={{ color: getActivityColor(log.action) }}
                        >
                          {log.action || 'Action'}
                        </span>
                        <span className="TaskDetails-activity-time">
                          <FiTime size={12} />
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      {log.description && (
                        <p className="TaskDetails-activity-description">
                          {log.description}
                        </p>
                      )}
                      {log.user && (
                        <div className="TaskDetails-activity-user">
                          <FiUser size={10} />
                          <span>by {log.user.name || log.user.email || 'Unknown User'}</span>
                        </div>
                      )}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="TaskDetails-activity-changes">
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className="TaskDetails-activity-change">
                              <span className="TaskDetails-activity-change-field">{key}:</span>
                              <span className="TaskDetails-activity-change-value">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Modal Footer */}
          <div className="TaskDetails-activity-modal-footer">
            <button
              className="TaskDetails-activity-modal-close-btn"
              onClick={handleCloseActivityLog}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render enhanced dialog
  const renderEnhancedDialog = () => {
    if (!openDialog) return null;

    return (
      <div className="TaskDetails-modal-overlay" onClick={() => setOpenDialog(false)}>
        <div className="TaskDetails-modal" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="TaskDetails-modal-header">
            <div className="TaskDetails-modal-header-content">
              <div className="TaskDetails-modal-user-badge">
                <div className="TaskDetails-modal-avatar-wrapper">
                  <div className="TaskDetails-modal-avatar">
                    {getInitials(selectedUser?.name)}
                  </div>
                  <div className={`TaskDetails-modal-status-badge ${
                    selectedUser?.isActive ? 'active' : 'inactive'
                  }`} />
                </div>
                <div className="TaskDetails-modal-user-details">
                  <h2 className="TaskDetails-modal-user-name">
                    {selectedUser?.name}
                  </h2>
                  <div className="TaskDetails-modal-user-meta">
                    <span className="TaskDetails-modal-user-role">
                      <FiBriefcase size={14} />
                      {selectedUser?.role || 'Employee'}
                    </span>
                    <span className="TaskDetails-modal-user-email">
                      <FiMail size={14} />
                      {selectedUser?.email}
                    </span>
                    {selectedUser?.department && (
                      <span className="TaskDetails-modal-user-department">
                        <FiUsers size={14} />
                        {getDepartmentName(selectedUser.department)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="TaskDetails-modal-close-btn"
                onClick={() => setOpenDialog(false)}
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Quick Stats Pills */}
            <div className="TaskDetails-modal-quick-stats">
              <div className="TaskDetails-modal-stat-pill">
                <FiList size={14} />
                <span>Total: {userTaskStats.total}</span>
              </div>
              <div className="TaskDetails-modal-stat-pill">
                <FiCheckCircle size={14} />
                <span>Completed: {userTaskStats.completed?.count || 0}</span>
              </div>
              <div className="TaskDetails-modal-stat-pill">
                <FiClock size={14} />
                <span>Pending: {userTaskStats.pending?.count || 0}</span>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="TaskDetails-modal-body">
            {/* Status Filters Section */}
            <div className="TaskDetails-modal-section">
              <div className="TaskDetails-modal-section-header">
                <div className="TaskDetails-modal-section-title">
                  <FiPieChart size={18} />
                  <h3>Task Status Overview</h3>
                </div>
                <button
                  className="TaskDetails-modal-toggle-filters"
                  onClick={() => setShowStatusFilters(!showStatusFilters)}
                >
                  {showStatusFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  <span>{showStatusFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </button>
              </div>

              {showStatusFilters && (
                <div className="TaskDetails-modal-status-grid">
                  {STATUS_OPTIONS.filter(s => s.value !== 'all').map((status) => {
                    const count = getStatusCount(status.value);
                    if (count === 0) return null;
                    
                    const isActive = activeStatusFilters.includes(status.value);
                    const percentage = userTaskStats[status.value]?.percentage || 0;

                    return (
                      <button
                        key={status.value}
                        className={`TaskDetails-modal-status-chip ${
                          isActive ? 'active' : ''
                        }`}
                        onClick={() => handleStatusFilterToggle(status.value)}
                        style={{
                          '--status-color': status.color,
                          '--status-bg': status.bgColor
                        }}
                      >
                        <div className="TaskDetails-modal-status-chip-content">
                          <div className="TaskDetails-modal-status-chip-icon">
                            {React.createElement(status.icon, { size: 14 })}
                          </div>
                          <div className="TaskDetails-modal-status-chip-info">
                            <span className="TaskDetails-modal-status-chip-label">
                              {status.label}
                            </span>
                            <span className="TaskDetails-modal-status-chip-count">
                              {count}
                            </span>
                          </div>
                          <div className="TaskDetails-modal-status-chip-progress">
                            <div 
                              className="TaskDetails-modal-status-chip-progress-bar"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        {isActive && (
                          <div className="TaskDetails-modal-status-chip-check">
                            <FiCheckCircle size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search and Filters Section */}
            <div className="TaskDetails-modal-section">
              <div className="TaskDetails-modal-search-filters">
                <div className="TaskDetails-modal-search-wrapper">
                  <FiSearch size={16} className="TaskDetails-modal-search-icon" />
                  <input
                    type="text"
                    className="TaskDetails-modal-search-input"
                    placeholder="Search tasks by title, description, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="TaskDetails-modal-search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                <div className="TaskDetails-modal-filter-group">
                  <select
                    className="TaskDetails-modal-filter-select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This Week</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  <select
                    className="TaskDetails-modal-filter-select"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                {/* Date Range Picker */}
                <div className="TaskDetails-modal-date-range">
                  <div className="TaskDetails-modal-date-input">
                    <FiCalendar size={14} />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="From"
                    />
                  </div>
                  <span className="TaskDetails-modal-date-separator">→</span>
                  <div className="TaskDetails-modal-date-input">
                    <FiCalendar size={14} />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="To"
                    />
                  </div>
                  {(fromDate || toDate) && (
                    <button
                      className="TaskDetails-modal-date-clear"
                      onClick={() => {
                        setFromDate('');
                        setToDate('');
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Active Filters Display */}
                {(activeStatusFilters.length > 0 && !activeStatusFilters.includes('all')) && (
                  <div className="TaskDetails-modal-active-filters">
                    <span className="TaskDetails-modal-active-filters-label">
                      Active filters:
                    </span>
                    {activeStatusFilters.map(status => {
                      const statusOption = STATUS_OPTIONS.find(s => s.value === status);
                      return (
                        <span
                          key={status}
                          className="TaskDetails-modal-active-filter-tag"
                          style={{ backgroundColor: statusOption?.bgColor }}
                        >
                          {statusOption?.label}
                          <button onClick={() => handleStatusFilterToggle(status)}>
                            <FiX size={12} />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      className="TaskDetails-modal-clear-filters"
                      onClick={resetFilters}
                    >
                      <FiRefreshCw size={12} />
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks List Section */}
            <div className="TaskDetails-modal-section TaskDetails-modal-tasks-section">
              <div className="TaskDetails-modal-tasks-header">
                <div className="TaskDetails-modal-tasks-title">
                  <FiList size={18} />
                  <h3>Tasks</h3>
                  <span className="TaskDetails-modal-tasks-count">
                    {filteredTasks.length} of {tasks.length}
                  </span>
                </div>
                <div className="TaskDetails-modal-tasks-sort">
                  <span>Sort by: Latest</span>
                  <FiChevronDown size={14} />
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="TaskDetails-modal-loading">
                  <div className="TaskDetails-modal-loading-spinner" />
                  <p>Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="TaskDetails-modal-empty">
                  <div className="TaskDetails-modal-empty-icon">
                    <FiArchive size={32} />
                  </div>
                  <h4>No tasks found</h4>
                  <p>Try adjusting your search or filters</p>
                  <button
                    className="TaskDetails-modal-empty-reset"
                    onClick={resetFilters}
                  >
                    <FiRefreshCw size={14} />
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="TaskDetails-modal-tasks-list">
                  {filteredTasks.map((task) => {
                    const status = task.userStatus || task.status || task.overallStatus;
                    const statusOption = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
                    const isToday = isSameDay(task.dueDateTime || task.createdAt, today);
                    const isOverdue = task.dueDateTime && new Date(task.dueDateTime) < today;

                    return (
                      <div
                        key={task._id}
                        className={`TaskDetails-modal-task-card ${
                          isToday ? 'today' : ''
                        } ${isOverdue ? 'overdue' : ''}`}
                        style={{ '--status-color': statusOption.color }}
                      >
                        <div className="TaskDetails-modal-task-card-header">
                          <div className="TaskDetails-modal-task-title-section">
                            <h4 className="TaskDetails-modal-task-title">
                              {task.title || 'Untitled Task'}
                            </h4>
                            <span 
                              className="TaskDetails-modal-task-status"
                              style={{ 
                                backgroundColor: `${statusOption.color}15`,
                                color: statusOption.color
                              }}
                            >
                              {statusOption.label}
                            </span>
                          </div>
                          <span className={`TaskDetails-modal-task-priority ${task.priority || 'medium'}`}>
                            {task.priority || 'medium'}
                          </span>
                        </div>

                        {task.description && (
                          <p className="TaskDetails-modal-task-description">
                            {task.description}
                          </p>
                        )}

                        {/* Time Information Section */}
                        <div className="TaskDetails-modal-task-time-info">
                          <div className="TaskDetails-modal-task-time-item">
                            <FiClock size={12} />
                            <span className="TaskDetails-modal-task-time-label">Created:</span>
                            <span className="TaskDetails-modal-task-time-value">
                              {formatDateTime(task.createdAt)}
                            </span>
                          </div>
                          {task.updatedAt && task.updatedAt !== task.createdAt && (
                            <div className="TaskDetails-modal-task-time-item">
                              <FiRefreshCw size={12} />
                              <span className="TaskDetails-modal-task-time-label">Updated:</span>
                              <span className="TaskDetails-modal-task-time-value">
                                {formatDateTime(task.updatedAt)}
                              </span>
                            </div>
                          )}
                          {task.dueDateTime && (
                            <div className="TaskDetails-modal-task-time-item">
                              <FiCalendar size={12} />
                              <span className="TaskDetails-modal-task-time-label">Due:</span>
                              <span className="TaskDetails-modal-task-time-value">
                                {formatDateTime(task.dueDateTime)}
                                {isToday && <span className="TaskDetails-modal-task-time-badge today">Today</span>}
                                {isOverdue && <span className="TaskDetails-modal-task-time-badge overdue">Overdue</span>}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Activity Log Button */}
                        <div className="TaskDetails-modal-task-actions">
                          <button
                            className="TaskDetails-modal-task-activity-btn"
                            onClick={(e) => handleViewActivityLogs(task, e)}
                          >
                            <FiActivity size={14} />
                            <span>View Activity Log</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="TaskDetails-modal-footer">
            <div className="TaskDetails-modal-footer-stats">
              <span>Total: {filteredTasks.length} tasks</span>
              <span>•</span>
              <span>Completed: {filteredTasks.filter(t => 
                (t.userStatus || t.status) === 'completed'
              ).length}</span>
            </div>
            <button
              className="TaskDetails-modal-close-footer-btn"
              onClick={() => setOpenDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Add error display component
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="TaskDetails-error-alert">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.5rem',
          margin: '1rem 0'
        }}>
          <FiAlertTriangle color="#dc2626" size={24} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#dc2626' }}>Error:</strong>
            <p style={{ margin: '0.25rem 0', color: '#dc2626' }}>{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}
          >
            &times;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="TaskDetails-section">
      {renderError()}

      {/* Header */}
      <div className="TaskDetails-header">
        <div className="TaskDetails-header-content">
          <div className="TaskDetails-header-top">
            <div className="TaskDetails-header-title">
              <h1>📊 Company Employee Task Management</h1>
              <p className="TaskDetails-header-subtitle">
                Comprehensive dashboard with advanced filtering and analytics
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Logged in as: {currentUser?.name} 
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: isOwner() ? '#e3f2fd' : '#fff3e0',
                    color: isOwner() ? '#1976d2' : '#f57c00',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {isOwner() ? '👑 Owner' : '👤 Employee'}
                  </span>
                </p>
                {!isOwner() && currentUser?.department && (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    <FiUsers size={14} /> Department: {getDepartmentName(currentUser.department)}
                  </p>
                )}
              </div>
            </div>
            <div className="TaskDetails-header-stats">
              <div className="TaskDetails-stats-icon">
                <FiUsers />
              </div>
              <div className="TaskDetails-stats-text">
                <h2>{filteredUsers.length}</h2>
                <p>
                  {isOwner() ? 'COMPANY EMPLOYEES' : 'DEPARTMENT EMPLOYEES'}
                </p>
              </div>
            </div>
          </div>

          {renderOverallStats()}
        </div>
      </div>

      {/* Main Card */}
      <div className="TaskDetails-card">
        <div className="TaskDetails-card-content">
          {/* Card Header */}
          <div className="TaskDetails-card-header">
            <div className="TaskDetails-card-title-section">
              <div className="TaskDetails-card-icon">
                <FiUsers />
              </div>
              <div>
                <h3 className="TaskDetails-card-title">
                  {isOwner() ? 'Company Employee Directory' : 'Department Employee Directory'}
                </h3>
                <p className="TaskDetails-card-subtitle">
                  <FiInfo size={14} />
                  {isOwner() 
                    ? 'Viewing all employees across the company' 
                    : `Viewing employees in your department only`}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="TaskDetails-filter-section">
              <input
                type="text"
                className="TaskDetails-search-input"
                placeholder={`Search ${isOwner() ? 'company' : 'department'} employees by name, email or ID...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="TaskDetails-reset-filter-button"
                onClick={resetFilters}
                disabled={!searchQuery && activeStatusFilters.length === 1 && activeStatusFilters[0] === 'all'}
              >
                <FiRefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="TaskDetails-stats-grid">
            <div className="TaskDetails-stat-item">
              <div className="TaskDetails-stat-content">
                <div className="TaskDetails-stat-icon-box">
                  <FiUsers />
                </div>
                <div className="TaskDetails-stat-text">
                  <h4>{systemStats.totalEmployees}</h4>
                  <p>{isOwner() ? 'Total Employees' : 'Dept Employees'}</p>
                </div>
              </div>
            </div>
            <div className="TaskDetails-stat-item">
              <div className="TaskDetails-stat-content">
                <div className="TaskDetails-stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                  <FiList style={{ color: '#0ea5e9' }} />
                </div>
                <div className="TaskDetails-stat-text">
                  <h4>{systemStats.totalTasks}</h4>
                  <p>Total Tasks</p>
                </div>
              </div>
            </div>
            <div className="TaskDetails-stat-item">
              <div className="TaskDetails-stat-content">
                <div className="TaskDetails-stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <FiCheckCircle style={{ color: '#10b981' }} />
                </div>
                <div className="TaskDetails-stat-text">
                  <h4>{systemStats.avgCompletion}%</h4>
                  <p>Avg Completion</p>
                </div>
              </div>
            </div>
            <div className="TaskDetails-stat-item">
              <div className="TaskDetails-stat-content">
                <div className="TaskDetails-stat-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <FiUsers style={{ color: '#8b5cf6' }} />
                </div>
                <div className="TaskDetails-stat-text">
                  <h4>{systemStats.activeEmployees}</h4>
                  <p>Active Employees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {usersLoading ? (
            <div className="TaskDetails-loading-container">
              <div className="TaskDetails-loading-spinner"></div>
              <div className="TaskDetails-loading-text">
                <h4>Loading Employee Data...</h4>
                <p>Please wait while we fetch the latest information</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="TaskDetails-empty-state">
              <div className="TaskDetails-empty-icon">
                <FiUsers />
              </div>
              <h3>No Employees Found</h3>
              <p>
                {isOwner() 
                  ? 'No employees found in your company' 
                  : 'No employees found in your department'}
              </p>
              <button
                className="TaskDetails-reset-button"
                onClick={resetFilters}
              >
                <FiRefreshCw size={16} />
                Reset Search
              </button>
            </div>
          ) : (
            <div className="TaskDetails-users-grid">
              {filteredUsers.map((user) => renderEnhancedUserCard(user))}
            </div>
          )}
        </div>
      </div>

      {/* Modal/Dialog */}
      {renderEnhancedDialog()}
      
      {/* Activity Log Modal */}
      {renderActivityLogModal()}
    </div>
  );
};

export default TaskDetails;