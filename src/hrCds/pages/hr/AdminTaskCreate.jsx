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
  FiZoomIn, FiImage, FiCamera
} from 'react-icons/fi';

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
    dueDateTime: null,
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
    dueDateTime: null,
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
      setUserId(user.id);
      setAuthError(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthError(true);
      setSnackbar({ open: true, message: 'Error loading user data', severity: 'error' });
    }
  };

  // API call function
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
          response = await axios.get(url, defaultConfig);
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

  // Fetch tasks with pagination, filters and date range
  const fetchTasks = async (page = 0, limit = rowsPerPage, filters = {}) => {
    if (authError || !userId) return;

    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: page + 1,
        limit: limit
      };

      // Add filters to params
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assignedToFilter) params.assignedTo = assignedToFilter;
      if (createdByFilter) params.createdBy = createdByFilter;
      if (overdueFilter) params.overdue = overdueFilter;
      
      // Add date range filters
      if (dateRange.startDate) {
        params.startDate = new Date(dateRange.startDate).toISOString();
      }
      if (dateRange.endDate) {
        params.endDate = new Date(dateRange.endDate).toISOString();
      }

      const queryString = new URLSearchParams(params).toString();
      
      const tasksResult = await apiCall('get', `/task/assigned`);
      
      // Handle tasks response
      const tasksArray = tasksResult.tasks || tasksResult.data || tasksResult.groupedTasks ? 
        Object.values(tasksResult.groupedTasks || {}).flat() : [];
      setTasks(tasksArray);
      
      // Set total count for pagination
      setTotalTasks(tasksResult.total || tasksResult.totalCount || tasksArray.length);

      // Calculate filtered stats
      calculateFilteredStats(tasksArray);

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
      rejected: tasksArray.filter(t => getTaskStatus(t) === 'rejected').length,
      overdue: tasksArray.filter(t => isOverdue(t)).length
    };
    setFilteredStats(stats);
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

      await apiCall('post', '/task/create-for-others', formData);

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

  // Edit Task function
  const handleEditTask = async () => {
    if (!editTask.title || !editTask.description || !editTask.dueDateTime) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    setIsUpdatingTask(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', editTask.title);
      formData.append('description', editTask.description);
      formData.append('dueDateTime', new Date(editTask.dueDateTime).toISOString());
      formData.append('priorityDays', editTask.priorityDays || '1');
      formData.append('priority', editTask.priority);
      formData.append('assignedUsers', JSON.stringify(editTask.assignedUsers));
      formData.append('assignedGroups', JSON.stringify(editTask.assignedGroups));

      await apiCall('put', `/task/${selectedTask._id}`, formData);
      
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

  // Enhanced Group Management
  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.description) {
      setSnackbar({ open: true, message: 'Please fill group name and description', severity: 'error' });
      return;
    }

    if (newGroup.members.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one member', severity: 'error' });
      return;
    }

    setIsCreatingGroup(true);
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
    } finally {
      setIsCreatingGroup(false);
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

  // Function to fetch and show user statuses for a task
  const fetchUserStatuses = async (task) => {
    try {
      setSelectedTask(task);
      
      if (task.statusInfo && Array.isArray(task.statusInfo)) {
        setTaskUserStatuses(task.statusInfo);
      } else if (task.statusByUser && Array.isArray(task.statusByUser)) {
        const enrichedStatuses = task.statusByUser.map(status => {
          const user = users.find(u => u._id === status.user || u._id === status.user?._id);
          return {
            userId: status.user,
            name: user?.name || 'Unknown User',
            role: user?.role || 'N/A',
            email: user?.email || 'N/A',
            status: status.status,
            updatedAt: status.updatedAt
          };
        });
        setTaskUserStatuses(enrichedStatuses);
      } else {
        setTaskUserStatuses([]);
      }
      
      setOpenUserStatusDialog(true);
    } catch (error) {
      console.error('Error fetching user statuses:', error);
      setSnackbar({ open: true, message: 'Failed to load user statuses', severity: 'error' });
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

  const addRemark = async () => {
    if (!newRemark.trim() && remarkImages.length === 0) {
      setSnackbar({ open: true, message: 'Please enter a remark or upload an image', severity: 'warning' });
      return;
    }
    
    setIsUploadingRemark(true);
    
    try {
      const formData = new FormData();
      formData.append('text', newRemark.trim());

      if (remarkImages.length > 0) {
        formData.append('image', remarkImages[0].file);
      }

      await apiCall('post', `/task/${selectedTask._id}/remarks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setNewRemark('');
      setRemarkImages([]);
      fetchRemarks(selectedTask._id);
      
      setSnackbar({ 
        open: true, 
        message: `Remark added successfully${remarkImages.length > 0 ? ' with image' : ''}`, 
        severity: 'success' 
      });

    } catch (error) {
      console.error('Error adding remark:', error);
      
      if (error.response?.status === 413) {
        setSnackbar({ open: true, message: 'File size too large. Maximum 5MB per image', severity: 'error' });
      } else if (error.response?.status === 400) {
        setSnackbar({ open: true, message: error.response.data.error || 'Invalid file type', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Failed to add remark', severity: 'error' });
      }
    } finally {
      setIsUploadingRemark(false);
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

  // Filter functions
  const getCurrentFilters = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;
    if (assignedToFilter) filters.assignedTo = assignedToFilter;
    if (createdByFilter) filters.createdBy = createdByFilter;
    if (overdueFilter) filters.overdue = overdueFilter;
    if (dateRange.startDate) filters.startDate = dateRange.startDate;
    if (dateRange.endDate) filters.endDate = dateRange.endDate;
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
      dueDateTime: null,
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
      dueDateTime: task.dueDateTime ? new Date(task.dueDateTime) : null,
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
    return new Date(dueDate) < new Date() && getTaskStatus(task) !== 'completed';
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

  // Get individual user status for a task
  const getUserStatusForTask = (task, userId) => {
    if (task.statusInfo && Array.isArray(task.statusInfo)) {
      const userStatus = task.statusInfo.find(s => 
        s.userId === userId || s.userId?._id === userId
      );
      return userStatus?.status || 'pending';
    }
    
    if (task.statusByUser && Array.isArray(task.statusByUser)) {
      const userStatus = task.statusByUser.find(s => 
        s.user === userId || s.user?._id === userId
      );
      return userStatus?.status || 'pending';
    }
    
    return 'pending';
  };

  // Get all assigned users with their status
  const getAllAssignedUsersWithStatus = (task) => {
    const assignedUsers = [];
    
    // Add direct assigned users
    if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
      task.assignedUsers.forEach(user => {
        const userId = user._id || user;
        const userObj = users.find(u => u._id === userId);
        if (userObj) {
          assignedUsers.push({
            user: userObj,
            status: getUserStatusForTask(task, userId),
            type: 'direct'
          });
        }
      });
    }
    
    // Add group members
    if (task.assignedGroups && Array.isArray(task.assignedGroups)) {
      task.assignedGroups.forEach(groupId => {
        const group = groups.find(g => g._id === groupId);
        if (group && group.members) {
          group.members.forEach(memberId => {
            const userObj = users.find(u => u._id === memberId);
            if (userObj && !assignedUsers.some(u => u.user._id === userObj._id)) {
              assignedUsers.push({
                user: userObj,
                status: getUserStatusForTask(task, memberId),
                type: 'group'
              });
            }
          });
        }
      });
    }
    
    return assignedUsers;
  };

  // Status Chip Component
  const AdminTaskManagementStatusChip = ({ status }) => {
    const getStatusColor = () => {
      switch(status) {
        case 'pending': return 'warning';
        case 'in-progress': return 'info';
        case 'completed': return 'success';
        case 'rejected': return 'error';
        default: return 'default';
      }
    };

    const getStatusText = () => {
      switch(status) {
        case 'pending': return 'Pending';
        case 'in-progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'rejected': return 'Rejected';
        default: return status;
      }
    };

    return (
      <span className={`AdminTaskManagement-status-chip AdminTaskManagement-status-${getStatusColor()}`}>
        {getStatusText()}
      </span>
    );
  };

  // Priority Chip Component
  const AdminTaskManagementPriorityChip = ({ priority }) => {
    const getPriorityColor = () => {
      switch(priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'default';
      }
    };

    return (
      <span className={`AdminTaskManagement-priority-chip AdminTaskManagement-priority-${getPriorityColor()}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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

    return (
      <div className="AdminTaskManagement-stat-card" style={{ borderLeftColor: colors[color] || colors.primary }}>
        <div className="AdminTaskManagement-stat-card-content">
          <div className="AdminTaskManagement-stat-icon" style={{ backgroundColor: `${colors[color]}20`, color: colors[color] }}>
            <Icon size={18} />
          </div>
          <div className="AdminTaskManagement-stat-text">
            <div className="AdminTaskManagement-stat-label">{label}</div>
            <div className="AdminTaskManagement-stat-value">{value}</div>
          </div>
        </div>
      </div>
    );
  };

  // Status Change Dialog
  const renderStatusChangeDialog = () => (
    <div className={`AdminTaskManagement-modal ${openStatusDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-medium">
        <div className="AdminTaskManagement-modal-header">
          <div className="AdminTaskManagement-modal-title-row">
            <div className="AdminTaskManagement-modal-title-icon">
              <FiUserCheck />
              <h3>Change Task Status</h3>
            </div>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenStatusDialog(false)}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body">
          <div className="AdminTaskManagement-form-container">
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
                <option value="rejected">Rejected</option>
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
  );

  // Enhanced Filters Section with Date Range
  const renderEnhancedFilters = () => (
    <div className="AdminTaskManagement-filter-section">
      <div className="AdminTaskManagement-filter-stack">
        <div className="AdminTaskManagement-filter-search-row">
          <div className="AdminTaskManagement-search-input-container">
            <FiSearch className="AdminTaskManagement-search-icon" />
            <input
              type="text"
              className="AdminTaskManagement-search-input"
              placeholder="Search tasks by title or description..."
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

        {/* Date Range Filters */}
        <div className="AdminTaskManagement-date-range-filters">
          <div className="AdminTaskManagement-date-input-container">
            <label>From Date</label>
            <input
              type="datetime-local"
              className="AdminTaskManagement-date-input"
              value={dateRange.startDate ? new Date(dateRange.startDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : null }))}
            />
          </div>
          <div className="AdminTaskManagement-date-input-container">
            <label>To Date</label>
            <input
              type="datetime-local"
              className="AdminTaskManagement-date-input"
              value={dateRange.endDate ? new Date(dateRange.endDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : null }))}
            />
          </div>
        </div>

        {/* Other Filters */}
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
              <option value="rejected">Rejected</option>
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

          <div className="AdminTaskManagement-filter-select-container">
            <label>Assigned To</label>
            <select
              className="AdminTaskManagement-filter-select"
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="AdminTaskManagement-filter-select-container">
            <label>Created By</label>
            <select
              className="AdminTaskManagement-filter-select"
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
            >
              <option value="">All Creators</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="AdminTaskManagement-filter-select-container">
            <label>Overdue</label>
            <select
              className="AdminTaskManagement-filter-select"
              value={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.value)}
            >
              <option value="">All Tasks</option>
              <option value="true">Overdue Only</option>
              <option value="false">Not Overdue</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Stats Cards with Filtered Data
  const renderFilteredStatsCards = () => (
    <div className="AdminTaskManagement-stats-grid">
      <AdminTaskManagementStatCard label="Total Tasks" value={filteredStats.total} color="primary" icon={FiCalendar} />
      <AdminTaskManagementStatCard label="Pending" value={filteredStats.pending} color="warning" icon={FiClock} />
      <AdminTaskManagementStatCard label="In Progress" value={filteredStats.inProgress} color="info" icon={FiAlertCircle} />
      <AdminTaskManagementStatCard label="Completed" value={filteredStats.completed} color="success" icon={FiCheckCircle} />
      <AdminTaskManagementStatCard label="Rejected" value={filteredStats.rejected} color="error" icon={FiXCircle} />
      <AdminTaskManagementStatCard label="Overdue" value={filteredStats.overdue} color="error" icon={FiAlertTriangle} />
    </div>
  );

  // Enhanced Remarks Dialog with Image Upload
  const renderRemarksDialog = () => (
    <div className={`AdminTaskManagement-modal ${openRemarksDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-large">
        <div className="AdminTaskManagement-modal-header AdminTaskManagement-modal-info">
          <div className="AdminTaskManagement-modal-title-row">
            <div className="AdminTaskManagement-modal-title-icon">
              <FiMessageSquare />
              <h3>Remarks for: {selectedTask?.title}</h3>
            </div>
            <div className="AdminTaskManagement-modal-subtitle">{remarks.length} remark(s)</div>
          </div>
          <button 
            className="AdminTaskManagement-icon-btn"
            onClick={() => setOpenRemarksDialog(false)}
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="AdminTaskManagement-modal-body">
          <div className="AdminTaskManagement-remarks-container">
            {/* Add New Remark Section */}
            <div className="AdminTaskManagement-card AdminTaskManagement-card-outline">
              <div className="AdminTaskManagement-card-content">
                <h4>Add New Remark</h4>
                
                {/* Text Input */}
                <textarea
                  className="AdminTaskManagement-remark-textarea"
                  placeholder="Enter your remark here... (Optional if uploading images)"
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  rows={3}
                />

                {/* Image Upload Section */}
                <div className="AdminTaskManagement-image-upload-section">
                  <label>Attach Image (Optional)</label>
                  
                  <div 
                    className="AdminTaskManagement-image-upload-area"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('AdminTaskManagement-remark-image-upload').click()}
                  >
                    <div className="AdminTaskManagement-upload-content">
                      <FiImage size={32} className="AdminTaskManagement-upload-icon" />
                      <div className="AdminTaskManagement-upload-text">
                        Click to upload or drag & drop
                      </div>
                      <div className="AdminTaskManagement-upload-subtext">
                        Supports JPG, PNG, GIF • Max 5MB
                      </div>
                      <button className="AdminTaskManagement-btn AdminTaskManagement-btn-outline AdminTaskManagement-upload-btn">
                        <FiCamera /> Choose Image
                      </button>
                    </div>
                    
                    <input
                      id="AdminTaskManagement-remark-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleRemarkImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Image Preview */}
                  {remarkImages.length > 0 && (
                    <div className="AdminTaskManagement-image-preview-container">
                      <label>Selected Image:</label>
                      <div className="AdminTaskManagement-image-preview-grid">
                        {remarkImages.map((image, index) => (
                          <div key={index} className="AdminTaskManagement-image-preview-item">
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              onClick={() => setZoomImage(image.preview)}
                            />
                            <button
                              className="AdminTaskManagement-remove-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRemarkImage(index);
                              }}
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  className="AdminTaskManagement-btn AdminTaskManagement-btn-primary AdminTaskManagement-btn-block"
                  onClick={addRemark}
                  disabled={isUploadingRemark || (!newRemark.trim() && remarkImages.length === 0)}
                >
                  {isUploadingRemark ? 'Uploading...' : 'Add Remark'}
                </button>
              </div>
            </div>

            {/* Remarks History */}
            <div className="AdminTaskManagement-remarks-history">
              <h4>Remarks History</h4>
              
              {remarks.length > 0 ? (
                <div className="AdminTaskManagement-remarks-list">
                  {remarks.map((remark, index) => (
                    <div key={index} className="AdminTaskManagement-card AdminTaskManagement-card-outline">
                      <div className="AdminTaskManagement-card-content">
                        <div className="AdminTaskManagement-remark-item">
                          {/* User Info and Date */}
                          <div className="AdminTaskManagement-remark-header">
                            <div className="AdminTaskManagement-remark-user">
                              <div className="AdminTaskManagement-remark-avatar">
                                {getUserName(remark.user)?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="AdminTaskManagement-remark-user-info">
                                <div className="AdminTaskManagement-remark-user-name">
                                  {getUserName(remark.user)}
                                </div>
                                <div className="AdminTaskManagement-remark-user-details">
                                  {users.find(u => u._id === remark.user)?.role || 'User'} • {new Date(remark.createdAt).toLocaleDateString()} at {' '}
                                  {new Date(remark.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Remark Text */}
                          {remark.text && (
                            <div className="AdminTaskManagement-remark-text">
                              {remark.text}
                            </div>
                          )}

                          {/* Remark Image */}
                          {remark.image && (
                            <div className="AdminTaskManagement-remark-image-container">
                              <label>Attached Image:</label>
                              <div className="AdminTaskManagement-remark-image-preview">
                                <img
                                  src={`${API_URL_IMG}/${remark.image}`}
                                  alt="Remark attachment"
                                  onClick={() => setZoomImage(`${API_URL_IMG}/${remark.image}`)}
                                />
                                <button
                                  className="AdminTaskManagement-zoom-image-btn"
                                  onClick={() => setZoomImage(`${API_URL_IMG}/${remark.image}`)}
                                >
                                  <FiZoomIn size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="AdminTaskManagement-card AdminTaskManagement-card-outline AdminTaskManagement-text-center">
                  <div className="AdminTaskManagement-card-content">
                    <FiMessageSquare size={48} className="AdminTaskManagement-empty-icon" />
                    <h5>No remarks yet</h5>
                    <p>Be the first to add a remark for this task</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="AdminTaskManagement-modal-footer">
          <button 
            className="AdminTaskManagement-btn" 
            onClick={() => setOpenRemarksDialog(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Image Zoom Modal
  const renderImageZoomModal = () => (
    <div className={`AdminTaskManagement-modal ${zoomImage ? 'AdminTaskManagement-modal-open' : ''} AdminTaskManagement-modal-zoom`}>
      <div className="AdminTaskManagement-modal-zoom-content">
        <button
          className="AdminTaskManagement-zoom-close-btn"
          onClick={() => setZoomImage(null)}
        >
          <FiX size={20} />
        </button>
        <img
          src={zoomImage}
          alt="Zoomed view"
          className="AdminTaskManagement-zoomed-image"
        />
      </div>
    </div>
  );

  // Enhanced Notifications Panel
  const renderNotificationsPanel = () => (
    <div className={`AdminTaskManagement-modal ${openNotifications ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-notifications">
        <div className="AdminTaskManagement-modal-header AdminTaskManagement-modal-primary">
          <div className="AdminTaskManagement-modal-title-row">
            <div className="AdminTaskManagement-modal-title-icon">
              <FiBell />
              <h3>Notifications</h3>
            </div>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenNotifications(false)}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="AdminTaskManagement-modal-subtitle">
            {unreadNotificationCount > 0 ? `${unreadNotificationCount} unread` : 'All caught up'}
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body AdminTaskManagement-modal-scroll">
          {notifications.length > 0 ? (
            <div className="AdminTaskManagement-notifications-list">
              <div className="AdminTaskManagement-modal-title-row" style={{ marginBottom: '16px' }}>
                <span>{notifications.length} notification(s)</span>
                <button 
                  className="AdminTaskManagement-btn AdminTaskManagement-btn-sm"
                  onClick={markAllNotificationsAsRead} 
                  disabled={unreadNotificationCount === 0}
                >
                  Mark all as read
                </button>
              </div>
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`AdminTaskManagement-notification-item ${notification.isRead ? '' : 'AdminTaskManagement-notification-unread'}`}
                >
                  <div className="AdminTaskManagement-notification-content">
                    <div className="AdminTaskManagement-notification-title">{notification.title}</div>
                    <div className="AdminTaskManagement-notification-message">{notification.message}</div>
                    <div className="AdminTaskManagement-notification-footer">
                      <div className="AdminTaskManagement-notification-date">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                      {!notification.isRead && (
                        <button 
                          className="AdminTaskManagement-btn AdminTaskManagement-btn-sm"
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="AdminTaskManagement-text-center">
              <FiBell size={32} className="AdminTaskManagement-empty-icon" />
              <h5>No notifications</h5>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
        <div className="AdminTaskManagement-modal-footer">
          <button 
            className="AdminTaskManagement-btn" 
            onClick={() => setOpenNotifications(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced Activity Logs Dialog
  const renderActivityLogsDialog = () => (
    <div className={`AdminTaskManagement-modal ${openActivityDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-large">
        <div className="AdminTaskManagement-modal-header AdminTaskManagement-modal-primary">
          <div className="AdminTaskManagement-modal-title-row">
            <div className="AdminTaskManagement-modal-title-icon">
              <FiActivity />
              <h3>Activity Logs for: {selectedTask?.title}</h3>
            </div>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenActivityDialog(false)}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="AdminTaskManagement-modal-subtitle">
            {activityLogs.length} activity log(s)
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body">
          {activityLogs.length > 0 ? (
            <div className="AdminTaskManagement-activity-logs">
              {activityLogs.map((log, index) => (
                <div key={index} className="AdminTaskManagement-card AdminTaskManagement-card-outline">
                  <div className="AdminTaskManagement-card-content">
                    <div className="AdminTaskManagement-activity-log">
                      <div className="AdminTaskManagement-activity-header">
                        <div className="AdminTaskManagement-activity-user">
                          <div className="AdminTaskManagement-activity-avatar">
                            {getUserName(log.user)?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="AdminTaskManagement-activity-user-info">
                            <div className="AdminTaskManagement-activity-user-name">{getUserName(log.user)}</div>
                            <div className="AdminTaskManagement-activity-user-role">
                              {users.find(u => u._id === log.user)?.role || 'User'}
                            </div>
                          </div>
                        </div>
                        <div className="AdminTaskManagement-activity-date">
                          {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="AdminTaskManagement-activity-description">
                        {log.description || log.action}
                      </div>
                      <div className="AdminTaskManagement-activity-footer">
                        <span className="AdminTaskManagement-activity-tag">{log.action}</span>
                        {log.ipAddress && (
                          <span className="AdminTaskManagement-activity-ip">IP: {log.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="AdminTaskManagement-text-center">
              <FiActivity size={32} className="AdminTaskManagement-empty-icon" />
              <h5>No activity logs found</h5>
              <p>No activity logs found for this task</p>
            </div>
          )}
        </div>
        <div className="AdminTaskManagement-modal-footer">
          <button 
            className="AdminTaskManagement-btn" 
            onClick={() => setOpenActivityDialog(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // User Status Dialog
  const renderUserStatusDialog = () => (
    <div className={`AdminTaskManagement-modal ${openUserStatusDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-medium">
        <div className="AdminTaskManagement-modal-header AdminTaskManagement-modal-info">
          <div className="AdminTaskManagement-modal-title-row">
            <div className="AdminTaskManagement-modal-title-icon">
              <FiUsers />
              <h3>User Statuses for: {selectedTask?.title}</h3>
            </div>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenUserStatusDialog(false)}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="AdminTaskManagement-modal-subtitle">
            {taskUserStatuses.length} user(s)
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body">
          <div className="AdminTaskManagement-user-statuses">
            {taskUserStatuses.length > 0 ? (
              taskUserStatuses.map((userStatus, index) => (
                <div key={index} className="AdminTaskManagement-card AdminTaskManagement-card-outline">
                  <div className="AdminTaskManagement-card-content">
                    <div className="AdminTaskManagement-user-status-item">
                      <div className="AdminTaskManagement-user-status-header">
                        <div className="AdminTaskManagement-user-status-user">
                          <div className="AdminTaskManagement-user-status-avatar">
                            {userStatus.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="AdminTaskManagement-user-status-info">
                            <div className="AdminTaskManagement-user-status-name">{userStatus.name}</div>
                            <div className="AdminTaskManagement-user-status-details">
                              {userStatus.role} • {userStatus.email}
                            </div>
                          </div>
                        </div>
                        <AdminTaskManagementStatusChip status={userStatus.status} />
                      </div>
                      {userStatus.updatedAt && (
                        <div className="AdminTaskManagement-user-status-updated">
                          Last updated: {new Date(userStatus.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="AdminTaskManagement-text-center">
                <FiUsers size={32} className="AdminTaskManagement-empty-icon" />
                <h5>No user status information available</h5>
                <p>No user status data found for this task</p>
              </div>
            )}
          </div>
        </div>
        <div className="AdminTaskManagement-modal-footer">
          <button 
            className="AdminTaskManagement-btn" 
            onClick={() => setOpenUserStatusDialog(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Create Task Dialog
  const renderCreateTaskDialog = () => (
    <div className={`AdminTaskManagement-modal ${openCreateDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-large">
        <div className="AdminTaskManagement-modal-header">
          <div className="AdminTaskManagement-modal-title-row">
            <h3>Create New Task</h3>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenCreateDialog(false)}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body">
          <div className="AdminTaskManagement-form-container">
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
                value={newTask.dueDateTime ? new Date(newTask.dueDateTime).toISOString().slice(0, 16) : ''}
                onChange={(e) => setNewTask({ ...newTask, dueDateTime: e.target.value ? new Date(e.target.value) : null })}
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

            {/* Assign to Users with Search */}
            <div className="AdminTaskManagement-form-group">
              <label>Assign to Users</label>
              <div className="AdminTaskManagement-multi-select-container">
                <div className="AdminTaskManagement-select-search-bar">
                  <FiSearch className="AdminTaskManagement-select-search-icon" />
                  <input
                    type="text"
                    className="AdminTaskManagement-select-search-input"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button className="AdminTaskManagement-select-search-clear" onClick={() => setUserSearch('')}>
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                <div className="AdminTaskManagement-multi-select-options">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="AdminTaskManagement-multi-select-option">
                      <input
                        type="checkbox"
                        id={`AdminTaskManagement-user-${user._id}`}
                        checked={newTask.assignedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTask({
                              ...newTask,
                              assignedUsers: [...newTask.assignedUsers, user._id]
                            });
                          } else {
                            setNewTask({
                              ...newTask,
                              assignedUsers: newTask.assignedUsers.filter(id => id !== user._id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`AdminTaskManagement-user-${user._id}`} className="AdminTaskManagement-multi-select-label">
                        <div className="AdminTaskManagement-multi-select-text">
                          <div className="AdminTaskManagement-multi-select-primary">{user.name}</div>
                          <div className="AdminTaskManagement-multi-select-secondary">
                            <span>{user.role}</span>
                            <span className="AdminTaskManagement-separator">•</span>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="AdminTaskManagement-multi-select-empty">
                      No users found
                    </div>
                  )}
                </div>
              </div>
              {newTask.assignedUsers.length > 0 && (
                <div className="AdminTaskManagement-selected-chips">
                  {newTask.assignedUsers.map(value => {
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

            {/* Assign to Groups with Search */}
            <div className="AdminTaskManagement-form-group">
              <label>Assign to Groups</label>
              <div className="AdminTaskManagement-multi-select-container">
                <div className="AdminTaskManagement-select-search-bar">
                  <FiSearch className="AdminTaskManagement-select-search-icon" />
                  <input
                    type="text"
                    className="AdminTaskManagement-select-search-input"
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                  {groupSearch && (
                    <button className="AdminTaskManagement-select-search-clear" onClick={() => setGroupSearch('')}>
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                <div className="AdminTaskManagement-multi-select-options">
                  {filteredGroups.map((group) => (
                    <div key={group._id} className="AdminTaskManagement-multi-select-option">
                      <input
                        type="checkbox"
                        id={`AdminTaskManagement-group-${group._id}`}
                        checked={newTask.assignedGroups.includes(group._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTask({
                              ...newTask,
                              assignedGroups: [...newTask.assignedGroups, group._id]
                            });
                          } else {
                            setNewTask({
                              ...newTask,
                              assignedGroups: newTask.assignedGroups.filter(id => id !== group._id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`AdminTaskManagement-group-${group._id}`} className="AdminTaskManagement-multi-select-label">
                        <div className="AdminTaskManagement-multi-select-text">
                          <div className="AdminTaskManagement-multi-select-primary">{group.name}</div>
                          <div className="AdminTaskManagement-multi-select-secondary">
                            {group.members?.length || 0} members • {group.description || 'No description'}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                  {filteredGroups.length === 0 && (
                    <div className="AdminTaskManagement-multi-select-empty">
                      No groups found
                    </div>
                  )}
                </div>
              </div>
              {newTask.assignedGroups.length > 0 && (
                <div className="AdminTaskManagement-selected-chips">
                  {newTask.assignedGroups.map(value => {
                    const group = groups.find(g => g._id === value);
                    return group ? (
                      <span key={value} className="AdminTaskManagement-selected-chip AdminTaskManagement-selected-chip-secondary">
                        {group.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="AdminTaskManagement-form-group">
              <label>Attachments</label>
              <div className="AdminTaskManagement-attachment-buttons">
                <button className="AdminTaskManagement-btn AdminTaskManagement-btn-outline AdminTaskManagement-attachment-btn">
                  <FiFileText /> Upload Files
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setNewTask({ ...newTask, files: e.target.files })}
                  />
                </button>
                <button className="AdminTaskManagement-btn AdminTaskManagement-btn-outline AdminTaskManagement-attachment-btn">
                  <FiMic /> Voice Note
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setNewTask({ ...newTask, voiceNote: e.target.files[0] })}
                  />
                </button>
              </div>
            </div>
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
  );

  // Edit Task Dialog
  const renderEditTaskDialog = () => (
    <div className={`AdminTaskManagement-modal ${openEditDialog ? 'AdminTaskManagement-modal-open' : ''}`}>
      <div className="AdminTaskManagement-modal-content AdminTaskManagement-modal-large">
        <div className="AdminTaskManagement-modal-header">
          <div className="AdminTaskManagement-modal-title-row">
            <h3>Edit Task: {selectedTask?.title}</h3>
            <button 
              className="AdminTaskManagement-icon-btn"
              onClick={() => setOpenEditDialog(false)}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="AdminTaskManagement-modal-body">
          <div className="AdminTaskManagement-form-container">
            <div className="AdminTaskManagement-form-group">
              <label>Task Title *</label>
              <input
                type="text"
                className="AdminTaskManagement-form-input"
                placeholder="Enter task title"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              />
            </div>

            <div className="AdminTaskManagement-form-group">
              <label>Description *</label>
              <textarea
                className="AdminTaskManagement-form-textarea"
                placeholder="Enter task description"
                rows={3}
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              />
            </div>

            <div className="AdminTaskManagement-form-group">
              <label>Due Date & Time *</label>
              <input
                type="datetime-local"
                className="AdminTaskManagement-form-input"
                value={editTask.dueDateTime ? new Date(editTask.dueDateTime).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditTask({ ...editTask, dueDateTime: e.target.value ? new Date(e.target.value) : null })}
              />
            </div>

            <div className="AdminTaskManagement-form-row">
              <div className="AdminTaskManagement-form-group">
                <label>Priority</label>
                <select
                  className="AdminTaskManagement-form-select"
                  value={editTask.priority}
                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
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
                  value={editTask.priorityDays}
                  onChange={(e) => setEditTask({ ...editTask, priorityDays: e.target.value })}
                />
              </div>
            </div>

            {/* Assign to Users with Search */}
            <div className="AdminTaskManagement-form-group">
              <label>Assign to Users</label>
              <div className="AdminTaskManagement-multi-select-container">
                <div className="AdminTaskManagement-select-search-bar">
                  <FiSearch className="AdminTaskManagement-select-search-icon" />
                  <input
                    type="text"
                    className="AdminTaskManagement-select-search-input"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button className="AdminTaskManagement-select-search-clear" onClick={() => setUserSearch('')}>
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                <div className="AdminTaskManagement-multi-select-options">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="AdminTaskManagement-multi-select-option">
                      <input
                        type="checkbox"
                        id={`AdminTaskManagement-edit-user-${user._id}`}
                        checked={editTask.assignedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditTask({
                              ...editTask,
                              assignedUsers: [...editTask.assignedUsers, user._id]
                            });
                          } else {
                            setEditTask({
                              ...editTask,
                              assignedUsers: editTask.assignedUsers.filter(id => id !== user._id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`AdminTaskManagement-edit-user-${user._id}`} className="AdminTaskManagement-multi-select-label">
                        <div className="AdminTaskManagement-multi-select-text">
                          <div className="AdminTaskManagement-multi-select-primary">{user.name}</div>
                          <div className="AdminTaskManagement-multi-select-secondary">
                            <span>{user.role}</span>
                            <span className="AdminTaskManagement-separator">•</span>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="AdminTaskManagement-multi-select-empty">
                      No users found
                    </div>
                  )}
                </div>
              </div>
              {editTask.assignedUsers.length > 0 && (
                <div className="AdminTaskManagement-selected-chips">
                  {editTask.assignedUsers.map(value => {
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

            {/* Assign to Groups with Search */}
            <div className="AdminTaskManagement-form-group">
              <label>Assign to Groups</label>
              <div className="AdminTaskManagement-multi-select-container">
                <div className="AdminTaskManagement-select-search-bar">
                  <FiSearch className="AdminTaskManagement-select-search-icon" />
                  <input
                    type="text"
                    className="AdminTaskManagement-select-search-input"
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                  {groupSearch && (
                    <button className="AdminTaskManagement-select-search-clear" onClick={() => setGroupSearch('')}>
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                <div className="AdminTaskManagement-multi-select-options">
                  {filteredGroups.map((group) => (
                    <div key={group._id} className="AdminTaskManagement-multi-select-option">
                      <input
                        type="checkbox"
                        id={`AdminTaskManagement-edit-group-${group._id}`}
                        checked={editTask.assignedGroups.includes(group._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditTask({
                              ...editTask,
                              assignedGroups: [...editTask.assignedGroups, group._id]
                            });
                          } else {
                            setEditTask({
                              ...editTask,
                              assignedGroups: editTask.assignedGroups.filter(id => id !== group._id)
                            });
                          }
                        }}
                      />
                      <label htmlFor={`AdminTaskManagement-edit-group-${group._id}`} className="AdminTaskManagement-multi-select-label">
                        <div className="AdminTaskManagement-multi-select-text">
                          <div className="AdminTaskManagement-multi-select-primary">{group.name}</div>
                          <div className="AdminTaskManagement-multi-select-secondary">
                            {group.members?.length || 0} members • {group.description || 'No description'}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                  {filteredGroups.length === 0 && (
                    <div className="AdminTaskManagement-multi-select-empty">
                      No groups found
                    </div>
                  )}
                </div>
              </div>
              {editTask.assignedGroups.length > 0 && (
                <div className="AdminTaskManagement-selected-chips">
                  {editTask.assignedGroups.map(value => {
                    const group = groups.find(g => g._id === value);
                    return group ? (
                      <span key={value} className="AdminTaskManagement-selected-chip AdminTaskManagement-selected-chip-secondary">
                        {group.name}
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
            onClick={() => setOpenEditDialog(false)}
          >
            Cancel
          </button>
          <button
            className="AdminTaskManagement-btn AdminTaskManagement-btn-primary"
            onClick={handleEditTask}
            disabled={isUpdatingTask}
          >
            {isUpdatingTask ? 'Updating...' : 'Update Task'}
          </button>
        </div>
      </div>
    </div>
  );

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

  if (!isAdmin) {
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
                </div>
              )}
            </>
          )}

          {activeTab === 1 && (
            <div>
              <h4>User Management ({users.length} users)</h4>
              <div className="AdminTaskManagement-users-grid">
                {users.map(user => (
                  <div key={user._id} className="AdminTaskManagement-user-card">
                    <div className="AdminTaskManagement-user-card-content">
                      <div className="AdminTaskManagement-user-card-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="AdminTaskManagement-user-card-info">
                        <h5>{user.name}</h5>
                        <p>{user.role}</p>
                        <small>{user.email}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 2 && renderGroupManagementTab()}
        </div>
      </div>

      {/* Dialogs */}
      {renderCreateTaskDialog()}
      {renderEditTaskDialog()}
      {renderGroupManagementDialog()}
      {renderStatusChangeDialog()}
      {renderNotificationsPanel()}
      {renderRemarksDialog()}
      {renderActivityLogsDialog()}
      {renderUserStatusDialog()}
      {renderImageZoomModal()}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`AdminTaskManagement-snackbar AdminTaskManagement-snackbar-${snackbar.severity}`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default AdminTaskManagement;