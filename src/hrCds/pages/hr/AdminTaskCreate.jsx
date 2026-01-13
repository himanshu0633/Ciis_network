import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosConfig';
import { API_URL_IMG } from '../../../config';
import { useNavigate } from 'react-router-dom';
import './AdminTaskManagement.css';

// Icons
import {
  FiPlus, FiCalendar, FiInfo, FiPaperclip, FiMic, FiFileText,
  FiCheck, FiX, FiAlertCircle, FiUser, FiUsers, FiFolder,
  FiBell, FiEdit, FiTrash2, FiSave, FiSearch,
  FiFilter, FiDownload, FiMessageSquare, FiActivity,
  FiEye, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiMoreVertical, FiRefreshCw, FiUserCheck, FiUserX,
  FiLogOut, FiEdit3, FiTrash, FiMessageCircle,
  FiZoomIn, FiImage, FiCamera, FiExternalLink, FiList
} from 'react-icons/fi';

const AdminTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [userId, setUserId] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Date Range Filter State
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // Filtered Stats State
  const [filteredStats, setFilteredStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    overdue: 0
  });

  // Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRemarksDialog, setOpenRemarksDialog] = useState(false);
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openUserStatusDialog, setOpenUserStatusDialog] = useState(false);
  
  // Enhanced Remarks States
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState('');
  const [remarkImages, setRemarkImages] = useState([]);
  const [isUploadingRemark, setIsUploadingRemark] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  // Data States
  const [selectedTask, setSelectedTask] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [taskUserStatuses, setTaskUserStatuses] = useState([]);
  
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
    dueDateTime: '',
    assignedUsers: [],
    assignedGroups: [],
    priorityDays: '1',
    priority: 'medium',
    files: null,
    voiceNote: null
  });

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    dueDateTime: '',
    assignedUsers: [],
    assignedGroups: [],
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
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Search state for user dropdown
  const [userSearch, setUserSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');

  const navigate = useNavigate();

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.name?.toLowerCase().includes(groupSearch.toLowerCase()) ||
    group.description?.toLowerCase().includes(groupSearch.toLowerCase())
  );

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
      setJobRole(user.jobRole || '');
      setUserId(user.id);
      setAuthError(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthError(true);
      setSnackbar({ open: true, message: 'Error loading user data', severity: 'error' });
    }
  };

  // API call function - UPDATED to handle different response formats
  const apiCall = async (method, url, data = null, config = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError(true);
        throw new Error('No authentication token found');
      }

      const defaultConfig = {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...config.headers
        }
      };

      if (!(data instanceof FormData) && !config.headers?.['Content-Type']) {
        defaultConfig.headers['Content-Type'] = 'application/json';
      }

      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(url, { ...defaultConfig, ...config });
          break;
        case 'post':
          response = await axios.post(url, data, defaultConfig);
          break;
        case 'put':
          response = await axios.put(url, data, defaultConfig);
          break;
        case 'patch':
          response = await axios.patch(url, data, defaultConfig);
          break;
        case 'delete':
          response = await axios.delete(url, defaultConfig);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log(`API Response (${method} ${url}):`, response.data);
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

  // Fetch tasks with pagination, filters and date range - UPDATED
  const fetchTasks = async (page = 0, limit = rowsPerPage, filters = {}) => {
    if (authError || !userId) return;

    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: page + 1,
        limit: limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Fetching tasks with params:', params);
      
      const tasksResult = await apiCall('get', '/task', { params });
      
      // Handle different response formats
      let tasksArray = [];
      let total = 0;
      
      // Check for different possible response structures
      if (tasksResult.success && tasksResult.notifications) {
        // This is the notifications API response you provided
        tasksArray = tasksResult.notifications
          .filter(notification => notification.relatedTask)
          .map(notification => notification.relatedTask);
        total = tasksArray.length;
      } else if (tasksResult.tasks) {
        tasksArray = tasksResult.tasks;
        total = tasksResult.total || tasksResult.totalCount || tasksArray.length;
      } else if (tasksResult.data) {
        tasksArray = tasksResult.data;
        total = tasksResult.total || tasksResult.totalCount || tasksArray.length;
      } else if (Array.isArray(tasksResult)) {
        tasksArray = tasksResult;
        total = tasksResult.length;
      } else {
        tasksArray = [];
        total = 0;
      }
      
      setTasks(tasksArray);
      setTotalTasks(total);
      calculateFilteredStats(tasksArray);

      console.log('Tasks loaded:', tasksArray.length);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setTotalTasks(0);
      setFilteredStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
        overdue: 0
      });
      setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics based on filtered tasks
  const calculateFilteredStats = (tasksArray) => {
    const stats = {
      total: tasksArray.length,
      pending: tasksArray.filter(t => getTaskStatus(t) === 'pending').length,
      inProgress: tasksArray.filter(t => getTaskStatus(t) === 'in-progress').length,
      completed: tasksArray.filter(t => getTaskStatus(t) === 'completed').length,
      rejected: tasksArray.filter(t => getTaskStatus(t) === 'rejected' || getTaskStatus(t) === 'cancelled').length,
      overdue: tasksArray.filter(t => isOverdue(t)).length
    };
    setFilteredStats(stats);
  };

  // Fetch all supporting data (users, groups, notifications)
  const fetchSupportingData = async () => {
    try {
      const [usersResult, groupsResult] = await Promise.allSettled([
        apiCall('get', '/task/assignable-users'),
        apiCall('get', '/groups')
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

    } catch (error) {
      console.error('Error fetching supporting data:', error);
      setSnackbar({ open: true, message: 'Failed to load supporting data', severity: 'warning' });
    }
  };

  // Fetch notifications separately
  const fetchNotifications = async () => {
    try {
      const notificationsResult = await apiCall('get', '/task/notifications/all');
      if (notificationsResult.success) {
        setNotifications(notificationsResult.notifications || []);
        setUnreadNotificationCount(notificationsResult.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch all data
  const fetchAllData = async (page = 0, limit = rowsPerPage) => {
    await Promise.all([
      fetchTasks(page, limit, getCurrentFilters()),
      fetchSupportingData(),
      fetchNotifications()
    ]);
  };

  // Get current filters
  const getCurrentFilters = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    if (assignedToFilter) filters.assignedTo = assignedToFilter;
    if (createdByFilter) filters.createdBy = createdByFilter;
    if (overdueFilter) filters.overdue = overdueFilter;
    if (dateRange.startDate) {
      filters.startDate = new Date(dateRange.startDate).toISOString().split('T')[0];
    }
    if (dateRange.endDate) {
      filters.endDate = new Date(dateRange.endDate).toISOString().split('T')[0];
    }
    return filters;
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
      formData.append('priorityDays', newTask.priorityDays || '1');
      formData.append('priority', newTask.priority);
      formData.append('assignedUsers', JSON.stringify(newTask.assignedUsers));
      formData.append('assignedGroups', JSON.stringify(newTask.assignedGroups));

      // Handle file uploads
      if (newTask.files) {
        for (let i = 0; i < newTask.files.length; i++) {
          formData.append('files', newTask.files[i]);
        }
      }

      if (newTask.voiceNote) {
        formData.append('voiceNote', newTask.voiceNote);
      }

      const response = await apiCall('post', '/task', formData);

      setOpenCreateDialog(false);
      setSnackbar({ open: true, message: response.message || 'Task created successfully', severity: 'success' });
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

  // Edit Task function
  const handleEditTask = async () => {
    if (!editTask.title || !editTask.description || !editTask.dueDateTime) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    setIsUpdatingTask(true);
    try {
      const response = await apiCall('put', `/task/${selectedTask._id}`, editTask);
      
      setOpenEditDialog(false);
      setSnackbar({ open: true, message: response.message || 'Task updated successfully', severity: 'success' });
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
      const response = await apiCall('delete', `/task/${taskId}`);
      setSnackbar({ open: true, message: response.message || 'Task deleted successfully', severity: 'success' });
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
      const response = await apiCall('patch', `/task/${statusChange.taskId}/status`, {
        status: statusChange.status,
        remarks: statusChange.remarks,
        userId: statusChange.userId || userId
      });

      setOpenStatusDialog(false);
      setSnackbar({ open: true, message: response.message || 'Status updated successfully', severity: 'success' });
      resetStatusForm();
      fetchAllData(page, rowsPerPage);
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update status';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Enhanced Remarks Functions with Image Upload
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
    
    setIsUploadingRemark(true);
    
    try {
      const formData = new FormData();
      formData.append('text', newRemark.trim());

      if (remarkImages.length > 0) {
        formData.append('image', remarkImages[0].file);
      }

      const response = await apiCall('post', `/task/${selectedTask._id}/remarks`, formData);

      setNewRemark('');
      setRemarkImages([]);
      fetchRemarks(selectedTask._id);
      
      setSnackbar({ 
        open: true, 
        message: response.message || 'Remark added successfully', 
        severity: 'success' 
      });

    } catch (error) {
      console.error('Error adding remark:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to add remark';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsUploadingRemark(false);
    }
  };

  // Filter functions
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
    setDateRange({
      startDate: null,
      endDate: null
    });
    setPage(0);
    fetchAllData(0, rowsPerPage);
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
      dueDateTime: '',
      assignedUsers: [],
      assignedGroups: [],
      priorityDays: '1',
      priority: 'medium',
      files: null,
      voiceNote: null
    });
    setUserSearch('');
    setGroupSearch('');
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

  // Open Edit Task Dialog function
  const openEditTaskDialog = (task) => {
    console.log('Opening edit dialog for task:', task);
    setSelectedTask(task);
    setEditTask({
      title: task.title || '',
      description: task.description || '',
      dueDateTime: task.dueDateTime ? new Date(task.dueDateTime).toISOString().slice(0, 16) : '',
      assignedUsers: task.assignedUsers?.map(u => u._id || u) || [],
      assignedGroups: task.assignedGroups?.map(g => g._id || g) || [],
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

  // Data Helpers
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
    const taskStatus = getTaskStatus(task);
    return new Date(dueDate) < new Date() && 
           !['completed', 'cancelled', 'rejected'].includes(taskStatus);
  };

  const getTaskStatus = (task) => {
    return task.overallStatus || 'pending';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'cancelled': return 'default';
      case 'onhold': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      case 'cancelled': return 'Cancelled';
      case 'onhold': return 'On Hold';
      default: return status;
    }
  };

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
      <span className={`AdminTaskManagement-status-chip AdminTaskManagement-status-${getStatusColor()}`}>
        {getStatusText()}
      </span>
    );
  };

  // Priority Chip Component
  const AdminTaskManagementPriorityChip = ({ priority }) => {
  const safePriority = typeof priority === 'string' ? priority : 'medium';

  const getPriorityColor = () => {
    switch (safePriority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <span
      className={`AdminTaskManagement-priority-chip AdminTaskManagement-priority-${getPriorityColor()}`}
    >
      {safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
    </span>
  );
};


  // Stats Cards Component
  const AdminTaskManagementStatCard = ({ label, value, color, icon: Icon }) => {
    const colors = {
      primary: '#3f51b5',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50',
      error: '#f44336'
    };
      <div className="AdminTaskManagement-access-denied">
        <div className="AdminTaskManagement-card AdminTaskManagement-text-center">
          <div className="AdminTaskManagement-card-content">
            <FiAlertCircle size={48} className="AdminTaskManagement-warning-icon" />
            <h3>Access Denied</h3>
            <p>You need admin privileges to access this page.</p>
            <button className="AdminTaskManagement-btn AdminTaskManagement-btn-primary" onClick={() => navigate('/')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="AdminTaskManagement-loading-container">
        <div className="AdminTaskManagement-loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="AdminTaskManagement">
      {/* Header */}
      <div className="AdminTaskManagement-header-card">
        <div className="AdminTaskManagement-header-content">
          <div className="AdminTaskManagement-header-text">
            <h1>Admin Task Management</h1>
            <p>Manage all tasks, users, and groups in the system</p>
          </div>
          <div className="AdminTaskManagement-header-actions">
            <button 
              className="AdminTaskManagement-icon-btn AdminTaskManagement-notification-btn"
              onClick={() => setOpenNotifications(true)}
            >
              <FiBell size={18} />
              {unreadNotificationCount > 0 && (
                <span className="AdminTaskManagement-notification-badge">{unreadNotificationCount}</span>
              )}
            </button>

            <button
              className="AdminTaskManagement-btn AdminTaskManagement-btn-outline"
              onClick={() => fetchAllData(page, rowsPerPage)}
              disabled={loading}
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
              onClick={() => setOpenCreateDialog(true)}
            >
              <FiPlus /> Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="AdminTaskManagement-stats-grid">
        <div className="AdminTaskManagement-stat-card">
          <div className="AdminTaskManagement-stat-card-content">
            <div className="AdminTaskManagement-stat-icon AdminTaskManagement-stat-primary">
              <FiList size={18} />
            </div>
            <div className="AdminTaskManagement-stat-text">
              <div className="AdminTaskManagement-stat-label">Total Tasks</div>
              <div className="AdminTaskManagement-stat-value">{filteredStats.total}</div>
            </div>
          </div>
        </div>
        
        <div className="AdminTaskManagement-stat-card">
          <div className="AdminTaskManagement-stat-card-content">
            <div className="AdminTaskManagement-stat-icon AdminTaskManagement-stat-warning">
              <FiClock size={18} />
            </div>
            <div className="AdminTaskManagement-stat-text">
              <div className="AdminTaskManagement-stat-label">Pending</div>
              <div className="AdminTaskManagement-stat-value">{filteredStats.pending}</div>
            </div>
          </div>
        </div>
        
        <div className="AdminTaskManagement-stat-card">
          <div className="AdminTaskManagement-stat-card-content">
            <div className="AdminTaskManagement-stat-icon AdminTaskManagement-stat-info">
              <FiActivity size={18} />
            </div>
            <div className="AdminTaskManagement-stat-text">
              <div className="AdminTaskManagement-stat-label">In Progress</div>
              <div className="AdminTaskManagement-stat-value">{filteredStats.inProgress}</div>
            </div>
          </div>
        </div>
        
        <div className="AdminTaskManagement-stat-card">
          <div className="AdminTaskManagement-stat-card-content">
            <div className="AdminTaskManagement-stat-icon AdminTaskManagement-stat-success">
              <FiCheckCircle size={18} />
            </div>
            <div className="AdminTaskManagement-stat-text">
              <div className="AdminTaskManagement-stat-label">Completed</div>
              <div className="AdminTaskManagement-stat-value">{filteredStats.completed}</div>
            </div>
          </div>
        </div>
        
        <div className="AdminTaskManagement-stat-card">
          <div className="AdminTaskManagement-stat-card-content">
            <div className="AdminTaskManagement-stat-icon AdminTaskManagement-stat-error">
              <FiAlertTriangle size={18} />
            </div>
            <div className="AdminTaskManagement-stat-text">
              <div className="AdminTaskManagement-stat-label">Overdue</div>
              <div className="AdminTaskManagement-stat-value">{filteredStats.overdue}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="AdminTaskManagement-filter-section">
        <div className="AdminTaskManagement-filter-search-row">
          <div className="AdminTaskManagement-search-input-container">
            <FiSearch className="AdminTaskManagement-search-icon" />
            <input
              type="text"
              className="AdminTaskManagement-search-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="AdminTaskManagement-btn AdminTaskManagement-btn-primary" onClick={applyFilters}>
            <FiFilter /> Apply
          </button>
          <button className="AdminTaskManagement-btn AdminTaskManagement-btn-outline" onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div className="AdminTaskManagement-filter-grid">
          <div className="AdminTaskManagement-filter-select-container">
            <label>Status</label>
            <select
              className="AdminTaskManagement-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="AdminTaskManagement-filter-select-container">
            <label>Priority</label>
            <select
              className="AdminTaskManagement-filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="AdminTaskManagement-date-input-container">
            <label>From Date</label>
            <input
              type="date"
              className="AdminTaskManagement-date-input"
              value={dateRange.startDate || ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div className="AdminTaskManagement-date-input-container">
            <label>To Date</label>
            <input
              type="date"
              className="AdminTaskManagement-date-input"
              value={dateRange.endDate || ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="AdminTaskManagement-table-container">
        <table className="AdminTaskManagement-tasks-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="AdminTaskManagement-no-data">
                  <FiList size={24} />
                  <p>No tasks found</p>
                </td>
              </tr>
            ) : (
              tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task, index) => (
                <tr key={task._id || index}>
                  <td>{task.serialNo || index + 1}</td>
                  <td>
                    <div className="AdminTaskManagement-task-title">{task.title}</div>
                  </td>
                  <td>
                    <div className="AdminTaskManagement-task-description">
                      {task.description?.substring(0, 50)}
                      {task.description?.length > 50 ? '...' : ''}
                    </div>
                  </td>
                  <td>
                    <div className={`AdminTaskManagement-task-due-date ${isOverdue(task) ? 'AdminTaskManagement-task-overdue' : ''}`}>
                      <FiCalendar size={14} />
                      {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 'N/A'}
                      {isOverdue(task) && <FiAlertTriangle size={14} />}
                    </div>
                  </td>
                  <td>
                    <span className={`AdminTaskManagement-priority-chip AdminTaskManagement-priority-${task.priority}`}>
                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`AdminTaskManagement-status-chip AdminTaskManagement-status-${getStatusColor(getTaskStatus(task))}`}>
                      {getStatusText(getTaskStatus(task))}
                    </span>
                  </td>
                  <td>
                    <div className="AdminTaskManagement-assigned-users">
                      {task.assignedUsers && task.assignedUsers.length > 0 ? (
                        task.assignedUsers.slice(0, 2).map((user, idx) => (
                          <span key={idx} className="AdminTaskManagement-user-chip">
                            {getUserName(user).charAt(0)}
                          </span>
                        ))
                      ) : (
                        <span className="AdminTaskManagement-no-assignee">Not assigned</span>
                      )}
                      {task.assignedUsers && task.assignedUsers.length > 2 && (
                        <span className="AdminTaskManagement-more-users">
                          +{task.assignedUsers.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="AdminTaskManagement-table-actions">
                      <button
                        className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                        onClick={() => openEditTaskDialog(task)}
                        title="Edit"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                        onClick={() => fetchRemarks(task._id)}
                        title="Remarks"
                      >
                        <FiMessageSquare size={16} />
                      </button>
                      <button
                        className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                        onClick={() => openStatusChangeDialog(task)}
                        title="Change Status"
                      >
                        <FiUserCheck size={16} />
                      </button>
                      <button
                        className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm AdminTaskManagement-icon-btn-danger"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Delete"
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {tasks.length > 0 && (
          <div className="AdminTaskManagement-pagination">
            <div className="AdminTaskManagement-pagination-info">
              Showing {Math.min(page * rowsPerPage + 1, totalTasks)} to {Math.min((page + 1) * rowsPerPage, totalTasks)} of {totalTasks} tasks
            </div>
            <div className="AdminTaskManagement-pagination-controls">
              <button
                className="AdminTaskManagement-pagination-btn"
                onClick={() => handleChangePage(null, page - 1)}
                disabled={page === 0}
              >
                Previous
              </button>
              <div className="AdminTaskManagement-pagination-page">
                Page {page + 1} of {Math.ceil(totalTasks / rowsPerPage) || 1}
              </div>
              <button
                className="AdminTaskManagement-pagination-btn"
                onClick={() => handleChangePage(null, page + 1)}
                disabled={page >= Math.ceil(totalTasks / rowsPerPage) - 1 || totalTasks === 0}
              >
                Next
              </button>
              <select
                className="AdminTaskManagement-pagination-select"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      {openCreateDialog && (
        <div className="AdminTaskManagement-modal AdminTaskManagement-modal-open">
          <div className="AdminTaskManagement-modal-content">
            <div className="AdminTaskManagement-modal-header">
              <h3>Create New Task</h3>
              <button 
                className="AdminTaskManagement-icon-btn"
                onClick={() => setOpenCreateDialog(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="AdminTaskManagement-modal-body">
              <div className="AdminTaskManagement-form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  className="AdminTaskManagement-form-input"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="AdminTaskManagement-form-group">
                <label>Description *</label>
                <textarea
                  className="AdminTaskManagement-form-textarea"
                  placeholder="Enter task description"
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="AdminTaskManagement-form-group">
                <label>Due Date & Time *</label>
                <input
                  type="datetime-local"
                  className="AdminTaskManagement-form-input"
                  value={newTask.dueDateTime}
                  onChange={(e) => setNewTask({ ...newTask, dueDateTime: e.target.value })}
                />
              </div>

              <div className="AdminTaskManagement-form-row">
                <div className="AdminTaskManagement-form-group">
                  <label>Priority</label>
                  <select
                    className="AdminTaskManagement-form-select"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="AdminTaskManagement-form-group">
                  <label>Priority Days</label>
                  <input
                    type="text"
                    className="AdminTaskManagement-form-input"
                    placeholder="Enter priority days"
                    value={newTask.priorityDays}
                    onChange={(e) => setNewTask({ ...newTask, priorityDays: e.target.value })}
                  />
                </div>
              </div>

              <div className="AdminTaskManagement-form-group">
                <label>Assign to Users</label>
                <select
                  className="AdminTaskManagement-form-select"
                  multiple
                  value={newTask.assignedUsers}
                  onChange={(e) => {
                    const options = e.target.options;
                    const value = [];
                    for (let i = 0; i < options.length; i++) {
                      if (options[i].selected) {
                        value.push(options[i].value);
                      }
                    }
                    setNewTask({ ...newTask, assignedUsers: value });
                  }}
                  size="5"
                >
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl to select multiple users</small>
              </div>
            </div>
            <div className="AdminTaskManagement-modal-footer">
              <button 
                className="AdminTaskManagement-btn" 
                onClick={() => setOpenCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
                onClick={handleCreateTask}
                disabled={isCreatingTask}
              >
                {isCreatingTask ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      {openStatusDialog && (
        <div className="AdminTaskManagement-modal AdminTaskManagement-modal-open">
          <div className="AdminTaskManagement-modal-content">
            <div className="AdminTaskManagement-modal-header">
              <h3>Change Task Status</h3>
              <button 
                className="AdminTaskManagement-icon-btn"
                onClick={() => setOpenStatusDialog(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="AdminTaskManagement-modal-body">
              <div className="AdminTaskManagement-form-group">
                <label>Task</label>
                <input
                  type="text"
                  className="AdminTaskManagement-form-input"
                  value={selectedTask?.title || ''}
                  disabled
                />
              </div>

              <div className="AdminTaskManagement-form-group">
                <label>Select Status *</label>
                <select
                  className="AdminTaskManagement-form-select"
                  value={statusChange.status}
                  onChange={(e) => setStatusChange({ ...statusChange, status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="onhold">On Hold</option>
                </select>
              </div>

              <div className="AdminTaskManagement-form-group">
                <label>Remarks (Optional)</label>
                <textarea
                  className="AdminTaskManagement-form-textarea"
                  placeholder="Enter remarks for status change..."
                  rows={3}
                  value={statusChange.remarks}
                  onChange={(e) => setStatusChange({ ...statusChange, remarks: e.target.value })}
                />
              </div>
            </div>
            <div className="AdminTaskManagement-modal-footer">
              <button 
                className="AdminTaskManagement-btn" 
                onClick={() => setOpenStatusDialog(false)}
              >
                Cancel
              </button>
              <button
                className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
                onClick={handleStatusChange}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

  // Group Management Dialog
  const renderGroupManagementDialog = () => (
    <div className={`AdminTaskManagement-modal ${openGroupDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-large">
        <div className="AdminTaskManagement-modal-header">
          <div className="AdminTaskManagement-modal-title-row">
            <h3>{editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenGroupDialog(false)}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body">
          <div className="AdminTaskManagement-form-container">
            <div className="AdminTaskManagement-form-group">
              <label>Group Name *</label>
              <input
                type="text"
                className="AdminTaskManagement-form-input"
                placeholder="Enter group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
            </div>

            <div className="AdminTaskManagement-form-group">
              <label>Description *</label>
              <textarea
                className="AdminTaskManagement-form-textarea"
                placeholder="Enter group description"
                rows={3}
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
            </div>

            <div className="AdminTaskManagement-form-group">
              <label>Select Members</label>
              <div className="AdminTaskManagement-multi-select-container">
                <div className="AdminTaskManagement-multi-select-options">
                  {users.map((user) => (
                    <div key={user._id} className="AdminTaskManagement-multi-select-option">
                      <input
                        type="checkbox"
                        id={`AdminTaskManagement-group-member-${user._id}`}
                        checked={newGroup.members.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewGroup({
                              ...newGroup,
                              members: [...newGroup.members, user._id]
                            });
                          } else {
                            setNewGroup({
                              ...newGroup,
                              members: newGroup.members.filter(id => id !== user._id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`AdminTaskManagement-group-member-${user._id}`} className="AdminTaskManagement-multi-select-label">
                        <div className="AdminTaskManagement-multi-select-text">
                          <div className="AdminTaskManagement-multi-select-primary">{user.name}</div>
                          <div className="AdminTaskManagement-multi-select-secondary">{user.role}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {newGroup.members.length > 0 && (
                <div className="AdminTaskManagement-selected-chips">
                  {newGroup.members.map(value => {
                    const user = users.find(u => u._id === value);
                    return user ? (
                      <span key={value} className="AdminTaskManagement-selected-chip">
                        {user.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="AdminTaskManagement-modal-footer">
          <button 
            className="AdminTaskManagement-btn" 
            onClick={() => setOpenGroupDialog(false)}
          >
            Cancel
          </button>
          <button
            className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
            onClick={handleCreateGroup}
            disabled={isCreatingGroup}
          >
            {isCreatingGroup ? (editingGroup ? 'Updating...' : 'Creating...') : (editingGroup ? 'Update Group' : 'Create Group')}
          </button>
        </div>
      </div>
    </div>
  );

  // Group Management Tab Content
  const renderGroupManagementTab = () => (
    <div>
      <div className="AdminTaskManagement-tab-header">
        <h4>Group Management ({groups.length} groups)</h4>
        <button
          className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
          onClick={() => {
            setEditingGroup(null);
            setNewGroup({ name: '', description: '', members: [] });
            setOpenGroupDialog(true);
          }}
        >
          <FiPlus /> Create Group
        </button>
      </div>

      <div className="AdminTaskManagement-groups-grid">
        {groups.map(group => (
          <div key={group._id} className="AdminTaskManagement-group-card">
            <div className="AdminTaskManagement-group-card-content">
              <div className="AdminTaskManagement-group-card-header">
                <div className="AdminTaskManagement-group-card-info">
                  <h5>{group.name}</h5>
                  <p>{group.description}</p>
                </div>
                <div className="AdminTaskManagement-group-card-actions">
                  <button
                    className="AdminTaskManagement-icon-btn"
                    onClick={() => openGroupEditDialog(group)}
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-danger"
                    onClick={() => handleDeleteGroup(group._id)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="AdminTaskManagement-group-card-divider"></div>
              <div className="AdminTaskManagement-group-card-members">
                <div className="AdminTaskManagement-group-card-members-label">
                  Members ({group.members?.length || 0})
                </div>
                <div className="AdminTaskManagement-group-card-members-list">
                  {group.members?.slice(0, 3).map(memberId => {
                    const member = users.find(u => u._id === memberId);
                    return member ? (
                      <div key={memberId} className="AdminTaskManagement-group-card-member">
                        <div className="AdminTaskManagement-group-card-member-avatar">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="AdminTaskManagement-group-card-member-name">{member.name}</div>
                      </div>
                    ) : null;
                  })}
                  {(group.members?.length || 0) > 3 && (
                    <div className="AdminTaskManagement-group-card-members-more">
                      +{(group.members?.length || 0) - 3} more members
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="AdminTaskManagement-empty-state">
          <FiUsers size={48} className="AdminTaskManagement-empty-icon" />
          <h5>No groups created yet</h5>
          <p>Create your first group to assign tasks to multiple users at once</p>
        </div>
      )}
    </div>
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
  const isReportingAuditor = jobRole === 'Reporting-Auditor';

  if (!isAdmin && !isReportingAuditor) {
    return (
      <div className="AdminTaskManagement-access-denied">
        <div className="AdminTaskManagement-card AdminTaskManagement-text-center">
          <div className="AdminTaskManagement-card-content">
            <FiAlertCircle size={48} className="AdminTaskManagement-warning-icon" />
            <h3>Access Denied</h3>
            <p>You need admin privileges to access this page.</p>
            <button className="AdminTaskManagement-btn AdminTaskManagement-btn-primary" onClick={() => navigate('/')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="AdminTaskManagement-loading-container">
        <div className="AdminTaskManagement-loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="AdminTaskManagement">
      {/* Header */}
      <div className="AdminTaskManagement-header-card">
        <div className="AdminTaskManagement-header-content">
          <div className="AdminTaskManagement-header-text">
            <h1>Admin Task Management</h1>
            <p>Manage all tasks, users, and groups in the system</p>
          </div>
          <div className="AdminTaskManagement-header-actions">
            <button 
              className="AdminTaskManagement-icon-btn AdminTaskManagement-notification-btn"
              onClick={() => setOpenNotifications(true)}
            >
              <FiBell size={18} />
              {unreadNotificationCount > 0 && (
                <span className="AdminTaskManagement-notification-badge">{unreadNotificationCount}</span>
              )}
            </button>

            <button
              className="AdminTaskManagement-btn AdminTaskManagement-btn-outline"
              onClick={() => fetchAllData(page, rowsPerPage)}
              disabled={loading}
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
              onClick={() => setOpenCreateDialog(true)}
            >
              <FiPlus /> Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards with Filtered Data */}
      {renderFilteredStatsCards()}

      {/* Tabs */}
      <div className="AdminTaskManagement-tabs-container">
        <div className="AdminTaskManagement-tabs-header">
          <button 
            className={`AdminTaskManagement-tab-btn ${activeTab === 0 ? 'AdminTaskManagement-tab-active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            All Tasks
          </button>
          <button 
            className={`AdminTaskManagement-tab-btn ${activeTab === 1 ? 'AdminTaskManagement-tab-active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            User Management
          </button>
          <button 
            className={`AdminTaskManagement-tab-btn ${activeTab === 2 ? 'AdminTaskManagement-tab-active' : ''}`}
            onClick={() => setActiveTab(2)}
          >
            Group Management
          </button>
        </div>

        <div className="AdminTaskManagement-tab-content">
          {activeTab === 0 && (
            <>
              {/* Enhanced Filters with Date Range */}
              {renderEnhancedFilters()}

              {/* Tasks Table with Pagination */}
              <div className="AdminTaskManagement-table-container">
                <table className="AdminTaskManagement-tasks-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id} className={`AdminTaskManagement-table-row AdminTaskManagement-status-${getTaskStatus(task)}`}>
                        <td>
                          <div className="AdminTaskManagement-task-title">{task.title}</div>
                        </td>
                        <td>
                          <div className="AdminTaskManagement-task-description" title={task.description}>
                            {task.description}
                          </div>
                        </td>
                        <td>
                          <div className={`AdminTaskManagement-task-due-date ${isOverdue(task) ? 'AdminTaskManagement-task-overdue' : ''}`}>
                            <FiCalendar size={14} />
                            {task.dueDateTime ? new Date(task.dueDateTime).toLocaleDateString() : 
                             task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                            {isOverdue(task) && <FiAlertTriangle size={14} />}
                          </div>
                        </td>
                        <td>
                          <AdminTaskManagementPriorityChip priority={task.priority} />
                        </td>
                        <td>
                          <AdminTaskManagementStatusChip status={getTaskStatus(task)} />
                        </td>
                        <td>
                          <div className="AdminTaskManagement-table-actions">
                            <button
                              className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                              onClick={() => openEditTaskDialog(task)}
                              title="Edit"
                            >
                              <FiEdit3 size={16} />
                            </button>
                            <button
                              className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm AdminTaskManagement-icon-btn-info"
                              onClick={() => fetchUserStatuses(task)}
                              title="View User Statuses"
                            >
                              <FiUsers size={16} />
                            </button>
                            <button
                              className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                              onClick={() => fetchRemarks(task._id)}
                              title="Remarks"
                            >
                              <FiMessageSquare size={16} />
                            </button>
                            <button
                              className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                              onClick={() => fetchActivityLogs(task._id)}
                              title="Activity Logs"
                            >
                              <FiActivity size={16} />
                            </button>
                            <button
                              className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm"
                              onClick={() => openStatusChangeDialog(task)}
                              title="Change Status"
                            >
                              <FiUserCheck size={16} />
                            </button>
                            <button
                              className="AdminTaskManagement-icon-btn AdminTaskManagement-icon-btn-sm AdminTaskManagement-icon-btn-danger"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete"
                            >
                              <FiTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="AdminTaskManagement-pagination">
                  <div className="AdminTaskManagement-pagination-info">
                    Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, totalTasks)} of {totalTasks} tasks
                  </div>
                  <div className="AdminTaskManagement-pagination-controls">
                    <button
                      className="AdminTaskManagement-pagination-btn"
                      onClick={() => handleChangePage(null, page - 1)}
                      disabled={page === 0}
                    >
                      Previous
                    </button>
                    <div className="AdminTaskManagement-pagination-page">
                      Page {page + 1} of {Math.ceil(totalTasks / rowsPerPage)}
                    </div>
                    <button
                      className="AdminTaskManagement-pagination-btn"
                      onClick={() => handleChangePage(null, page + 1)}
                      disabled={page >= Math.ceil(totalTasks / rowsPerPage) - 1}
                    >
                      Next
                    </button>
                    <select
                      className="AdminTaskManagement-pagination-select"
                      value={rowsPerPage}
                      onChange={handleChangeRowsPerPage}
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              {tasks.length === 0 && !loading && (
                <div className="AdminTaskManagement-empty-state">
                  <FiCalendar size={48} className="AdminTaskManagement-empty-icon" />
                  <h5>No tasks found</h5>
                  <p>Try adjusting your filters or create a new task</p>
      {/* Notifications Panel */}
      {openNotifications && (
        <div className="AdminTaskManagement-modal AdminTaskManagement-modal-open">
          <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-large">
            <div className="AdminTaskManagement-modal-header">
              <h3>Notifications ({notifications.length})</h3>
              <button 
                className="AdminTaskManagement-icon-btn"
                onClick={() => setOpenNotifications(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="AdminTaskManagement-modal-body">
              {notifications.length === 0 ? (
                <div className="AdminTaskManagement-empty-state">
                  <FiBell size={32} />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="AdminTaskManagement-notifications-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`AdminTaskManagement-notification-item ${!notification.isRead ? 'AdminTaskManagement-notification-unread' : ''}`}
                    >
                      <div className="AdminTaskManagement-notification-icon">
                        {notification.type === 'task_assigned' && <FiUserCheck />}
                        {notification.type === 'status_updated' && <FiActivity />}
                        {notification.type === 'task_overdue' && <FiAlertTriangle />}
                        {notification.type === 'remark_added' && <FiMessageSquare />}
                      </div>
                      <div className="AdminTaskManagement-notification-content">
                        <div className="AdminTaskManagement-notification-title">{notification.title}</div>
                        <div className="AdminTaskManagement-notification-message">{notification.message}</div>
                        <div className="AdminTaskManagement-notification-date">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`AdminTaskManagement-snackbar AdminTaskManagement-snackbar-${snackbar.severity}`}>
          {snackbar.message}
          <button 
            className="AdminTaskManagement-snackbar-close"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            <FiX size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTaskManagement;