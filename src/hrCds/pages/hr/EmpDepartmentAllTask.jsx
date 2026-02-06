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
  FiEdit3, FiExternalLink, FiMoreVertical, FiShare2, FiInfo, FiHash
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

  // User states
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilters, setActiveStatusFilters] = useState(['all']);
  const [showStatusFilters, setShowStatusFilters] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = new Date();

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

  // ✅ FIXED: User authentication function - NO ACCESS RESTRICTIONS
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("Please log in to access this page");
          return;
        }

        const user = JSON.parse(userStr);
        setCurrentUser(user);
        
        // Check if user has a name field or use email
        if (!user.name && user.email) {
          user.name = user.email.split('@')[0];
        }

        setCurrentUserRole('user'); // Set default role for all users
        
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("Error loading user data");
      }
    };

    fetchUserData();
  }, []);

  // ✅ REMOVED: Role-based access control - ALL USERS CAN ACCESS
  const canManage = true;

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

  // ✅ FIXED: Fetch Users Function - NO RESTRICTIONS
  const fetchUsersWithTasks = async () => {
    setUsersLoading(true);
    setError("");
    try {
      console.log("📤 Fetching all users with tasks...");

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

      // Try different endpoints
      let response = null;

      // Try general users endpoint first
      try {
        console.log("🔍 Trying general endpoint...");
        response = await axios.get('/task/department-users-with-counts', config);
      } catch (generalError) {
        console.log("General endpoint failed, trying fallback...");
        try {
          // Fallback: Get all users
          const usersResponse = await axios.get('/auth/users', config);
          if (usersResponse.data?.users) {
            const usersWithEmptyStats = usersResponse.data.users.map(user => ({
              ...user,
              taskStats: {
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
            setUsers(usersWithEmptyStats);
            calculateOverallStats(usersWithEmptyStats);
            setUsersLoading(false);
            return;
          }
          throw new Error("Unable to fetch users");
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw fallbackError;
        }
      }

      // Handle different response formats
      let usersData = [];

      if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      }

      console.log("✅ Users data received:", usersData.length);

      // Ensure each user has taskStats
      const usersWithStats = usersData.map(user => ({
        ...user,
        name: user.name || user.email?.split('@')[0] || 'Unknown User',
        role: user.role || 'Employee',
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

      setUsers(usersWithStats);
      calculateOverallStats(usersWithStats);

    } catch (err) {
      console.error("❌ Error fetching users with tasks:", err);

      // Better error handling
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

  // Filtered users based on search query
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

  // Fetch all users with task counts from backend
  useEffect(() => {
    fetchUsersWithTasks();
  }, []);

  // Fetch task status counts for specific user
  const fetchTaskStatusCounts = async (userId) => {
    try {
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

  // Fetch user tasks
  const fetchUserTasks = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const user = users.find((x) => x._id === userId);
      if (!user) {
        setError("User not found");
        return;
      }

      setSelectedUser(user);
      setSelectedUserId(userId);

      const params = new URLSearchParams();

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const url = `/task/user/${userId}/tasks?${params.toString()}`;
      const res = await axios.get(url);

      if (res.data.success) {
        const tasksData = res.data.tasks || [];
        setTasks(tasksData);

        // Fetch stats from backend
        await fetchTaskStatusCounts(userId);
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
      completionRate: 0
    };
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
      <div className="emp-all-task-overall-stats">
        <div className="emp-all-task-overall-stats-header">
          <div className="emp-all-task-overall-stats-icon">
            <FiBarChart />
          </div>
          <h4>System-wide Task Statistics</h4>
        </div>

        <div className="emp-all-task-overall-stats-grid">
          {/* Total Tasks Card */}
          <div className="emp-all-task-overall-stat-card">
            <div className="emp-all-task-overall-stat-content">
              <div
                className="emp-all-task-overall-stat-icon"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <FiList color="white" />
              </div>
              <div className="emp-all-task-overall-stat-number">
                {overallStats.total}
              </div>
              <div className="emp-all-task-overall-stat-label">
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
                  className="emp-all-task-overall-stat-card"
                  style={{
                    borderColor: `${status.color}30`,
                    background: overallStats[status.value] > 0 ?
                      `linear-gradient(135deg, ${status.color}15 0%, ${status.color}08 100%)` :
                      'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="emp-all-task-overall-stat-content">
                    <div
                      className="emp-all-task-overall-stat-icon"
                      style={{
                        background: getStatusGradient(status.value)
                      }}
                    >
                      {React.createElement(status.icon, {
                        color: "white",
                      })}
                    </div>
                    <div
                      className="emp-all-task-overall-stat-number"
                      style={{
                        background: getStatusGradient(status.value)
                      }}
                    >
                      {overallStats[status.value]}
                    </div>
                    <div className="emp-all-task-overall-stat-label">
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
      <div className="emp-all-task-status-cards">
        <div className="emp-all-task-status-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="emp-all-task-status-icon">
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
          <div className="emp-all-task-status-grid">
            {nonZeroStatuses.map((status) => {
              const count = status.value === 'all' ? userTaskStats.total : getStatusCount(status.value);
              const isActive = activeStatusFilters.includes(status.value);
              const percentage = status.value !== 'all' ? userTaskStats[status.value]?.percentage || 0 : 0;
              const gradient = statusGradients[status.value] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

              return (
                <div
                  key={status.value}
                  className={`emp-all-task-status-card ${isActive ? 'emp-all-task-status-card-active' : ''}`}
                  onClick={() => handleStatusFilterToggle(status.value)}
                  style={{
                    borderColor: isActive ? status.color : 'rgba(102, 126, 234, 0.15)',
                    background: isActive ? `${status.color}15` : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="emp-all-task-status-content">
                    <div
                      className="emp-all-task-status-card-icon"
                      style={{
                        background: gradient
                      }}
                    >
                      {React.createElement(status.icon, {
                        color: "white"
                      })}
                    </div>
                    <div
                      className="emp-all-task-status-card-number"
                      style={{
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {count}
                    </div>
                    <div className="emp-all-task-status-card-label">
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
    const isSelected = selectedUserId === user._id;
    const userStats = getUserTaskStats(user);
    const completionRate = userStats.completionRate || 0;
    const badgeClass = completionRate >= 80 ? 'emp-all-task-user-avatar-badge-high' :
      completionRate >= 50 ? 'emp-all-task-user-avatar-badge-medium' :
        'emp-all-task-user-avatar-badge-low';
    const progressClass = completionRate >= 80 ? 'emp-all-task-progress-fill-high' :
      completionRate >= 50 ? 'emp-all-task-progress-fill-medium' :
        'emp-all-task-progress-fill-low';

    return (
      <div
        className={`emp-all-task-user-card ${isSelected ? 'emp-all-task-user-card-selected' : ''}`}
        onClick={() => {
          setSelectedUserId(user._id);
          fetchUserTasks(user._id);
        }}
      >
        <div className="emp-all-task-user-card-content">
          <div className="emp-all-task-user-header">
            <div className="emp-all-task-user-avatar">
              {getInitials(user.name)}
              <div className={`emp-all-task-user-avatar-badge ${badgeClass}`}></div>
            </div>
            <div className="emp-all-task-user-info">
              <div className="emp-all-task-user-name">
                {user.name || "Unknown"}
              </div>
              <div className="emp-all-task-user-role">
                <FiBriefcase size={12} />
                {user.role || "No Role"}
              </div>
              <div className="emp-all-task-user-email">
                {user.email || "No Email"}
              </div>
            </div>
          </div>

          <div className="emp-all-task-stats-box">
            <div className="emp-all-task-stats-row">
              <div>
                <div className="emp-all-task-stat-number emp-all-task-total-stat">
                  {userStats.total || 0}
                </div>
                <div className="emp-all-task-stat-label">TOTAL</div>
              </div>
              <div>
                <div className="emp-all-task-stat-number emp-all-task-completed-stat">
                  {userStats.completed || 0}
                </div>
                <div className="emp-all-task-stat-label">DONE</div>
              </div>
              <div>
                <div
                  className="emp-all-task-stat-number emp-all-task-rate-stat"
                  style={{
                    color: completionRate >= 80 ? "#28a745" :
                      completionRate >= 50 ? "#FFC107" : "#F44336"
                  }}
                >
                  {completionRate}%
                </div>
                <div className="emp-all-task-stat-label">RATE</div>
              </div>
            </div>

            <div className="emp-all-task-progress-container">
              <div className="emp-all-task-progress-header">
                <div className="emp-all-task-progress-label">Progress</div>
                <div className="emp-all-task-progress-percentage">{completionRate}%</div>
              </div>
              <div className="emp-all-task-progress-bar">
                <div
                  className={`emp-all-task-progress-fill ${progressClass}`}
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            className={`emp-all-task-action-button ${isSelected ? 'emp-all-task-action-button-primary' : 'emp-all-task-action-button-outlined'}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserId(user._id);
              fetchUserTasks(user._id);
            }}
          >
            View Tasks
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Render enhanced dialog
  const renderEnhancedDialog = () => {
    if (!openDialog) return null;

    return (
      <div className="emp-all-task-modal-overlay" onClick={() => setOpenDialog(false)}>
        <div className="emp-all-task-modal" onClick={(e) => e.stopPropagation()}>
          <div className="emp-all-task-modal-header">
            <div className="emp-all-task-modal-title-section">
              <div className="emp-all-task-modal-user-info">
                <div className="emp-all-task-modal-avatar">
                  {getInitials(selectedUser?.name)}
                </div>
                <div>
                  <div className="emp-all-task-modal-title">
                    {selectedUser?.name}'s Task Dashboard
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {selectedUser?.role || 'No Role'}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#6b7280',
                      fontSize: '0.75rem'
                    }}>
                      <FiMail size={12} />
                      {selectedUser?.email}
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="emp-all-task-modal-close"
                onClick={() => setOpenDialog(false)}
              >
                <FiX />
              </button>
            </div>
          </div>

          <div className="emp-all-task-modal-content">
            {renderStatusCards()}

            <div className="emp-all-task-list-container">
              <div className="emp-all-task-list-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiList color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#111827' }}>Task Details</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                      <FiInfo size={14} />
                      Showing {filteredTasks.length} of {tasks.length} tasks
                    </p>
                  </div>
                </div>

                <div className="emp-all-task-search-container">
                  <input
                    type="text"
                    className="emp-all-task-task-search"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer'
                      }}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              <div className="emp-all-task-extra-filters">
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <div className="emp-all-task-date-range">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="emp-all-task-date-picker"
                    placeholder="From"
                  />
                  <span className="emp-all-task-date-separator">to</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="emp-all-task-date-picker"
                    placeholder="To"
                  />
                  {(fromDate || toDate) && (
                    <button
                      className="emp-all-task-clear-date"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="emp-all-task-loading-container">
                  <div className="emp-all-task-loading-spinner"></div>
                  <div className="emp-all-task-loading-text">
                    <h4>Loading Tasks...</h4>
                    <p>Please wait while we fetch task details</p>
                  </div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="emp-all-task-empty-state">
                  <div className="emp-all-task-empty-icon">
                    <FiArchive />
                  </div>
                  <h3>No Tasks Found</h3>
                  <p>No tasks match the current filters. Try adjusting your filter settings.</p>
                </div>
              ) : (
                <div className="emp-all-task-task-list">
                  {filteredTasks.map((task) => {
                    const status = task.userStatus || task.status || task.overallStatus;
                    const statusOption = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

                    return (
                      <div
                        key={task._id}
                        className={`emp-all-task-task-item ${
                          isSameDay(task.dueDateTime || task.createdAt, today) ? "today-task" : ""
                          }`}
                        style={{ borderLeftColor: statusOption.color }}
                      >
                        <div className="emp-all-task-task-header">
                          <div className="emp-all-task-task-title">
                            {task.title || 'No Title'}
                          </div>
                          <div className={`emp-all-task-task-priority emp-all-task-task-priority-${task.priority || 'medium'}`}>
                            {task.priority || 'medium'}
                          </div>
                        </div>

                        {task.description && (
                          <div className="emp-all-task-task-description">
                            {task.description}
                          </div>
                        )}

                        <div className="emp-all-task-task-footer">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FiHash size={12} />
                            Task ID: {task.serialNo || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FiCalendar size={12} />
                            Created: {formatDate(task.createdAt)}
                          </div>
                          {task.dueDateTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FiClock size={12} />
                              Due: {formatDate(task.dueDateTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Add error display component
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="emp-all-task-error-alert">
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
    <div className="emp-all-task-section">
      {renderError()}

      {/* Header */}
      <div className="emp-all-task-header">
        <div className="emp-all-task-header-content">
          <div className="emp-all-task-header-top">
            <div className="emp-all-task-header-title">
              <h1>📊 Department Employee Task Management</h1>
              <p className="emp-all-task-header-subtitle">
                Comprehensive dashboard with advanced filtering and analytics
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Logged in as: {currentUser?.name} ({currentUserRole})
              </p>
            </div>
            <div className="emp-all-task-header-stats">
              <div className="emp-all-task-stats-icon">
                <FiUsers />
              </div>
              <div className="emp-all-task-stats-text">
                <h2>{filteredUsers.length}</h2>
                <p>ACTIVE EMPLOYEES</p>
              </div>
            </div>
          </div>

          {renderOverallStats()}
        </div>
      </div>

      {/* Main Card */}
      <div className="emp-all-task-card">
        <div className="emp-all-task-card-content">
          {/* Card Header */}
          <div className="emp-all-task-card-header">
            <div className="emp-all-task-card-title-section">
              <div className="emp-all-task-card-icon">
                <FiUsers />
              </div>
              <div>
                <h3 className="emp-all-task-card-title">Employee Directory</h3>
                <p className="emp-all-task-card-subtitle">
                  <FiInfo size={14} />
                  Click on any employee to view their task details
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="emp-all-task-filter-section">
              <input
                type="text"
                className="emp-all-task-search-input"
                placeholder="Search employees by name, email or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="emp-all-task-reset-filter-button"
                onClick={resetFilters}
                disabled={!searchQuery && activeStatusFilters.length === 1 && activeStatusFilters[0] === 'all'}
              >
                <FiRefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="emp-all-task-stats-grid">
            <div className="emp-all-task-stat-item">
              <div className="emp-all-task-stat-content">
                <div className="emp-all-task-stat-icon-box">
                  <FiUsers />
                </div>
                <div className="emp-all-task-stat-text">
                  <h4>{systemStats.totalEmployees}</h4>
                  <p>Total Employees</p>
                </div>
              </div>
            </div>
            <div className="emp-all-task-stat-item">
              <div className="emp-all-task-stat-content">
                <div className="emp-all-task-stat-icon-box" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                  <FiList style={{ color: '#0ea5e9' }} />
                </div>
                <div className="emp-all-task-stat-text">
                  <h4>{systemStats.totalTasks}</h4>
                  <p>Total Tasks</p>
                </div>
              </div>
            </div>
            <div className="emp-all-task-stat-item">
              <div className="emp-all-task-stat-content">
                <div className="emp-all-task-stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <FiCheckCircle style={{ color: '#10b981' }} />
                </div>
                <div className="emp-all-task-stat-text">
                  <h4>{systemStats.avgCompletion}%</h4>
                  <p>Avg Completion</p>
                </div>
              </div>
            </div>
            <div className="emp-all-task-stat-item">
              <div className="emp-all-task-stat-content">
                <div className="emp-all-task-stat-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <FiUsers style={{ color: '#8b5cf6' }} />
                </div>
                <div className="emp-all-task-stat-text">
                  <h4>{systemStats.activeEmployees}</h4>
                  <p>Active Employees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {usersLoading ? (
            <div className="emp-all-task-loading-container">
              <div className="emp-all-task-loading-spinner"></div>
              <div className="emp-all-task-loading-text">
                <h4>Loading Employee Data...</h4>
                <p>Please wait while we fetch the latest information</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="emp-all-task-empty-state">
              <div className="emp-all-task-empty-icon">
                <FiUsers />
              </div>
              <h3>No Employees Found</h3>
              <p>Try checking your search terms</p>
              <button
                className="emp-all-task-reset-button"
                onClick={resetFilters}
              >
                <FiRefreshCw size={16} />
                Reset Search
              </button>
            </div>
          ) : (
            <div className="emp-all-task-users-grid">
              {filteredUsers.map((user) => renderEnhancedUserCard(user))}
            </div>
          )}
        </div>
      </div>

      {/* Modal/Dialog */}
      {renderEnhancedDialog()}
    </div>
  );
};

export default TaskDetails;