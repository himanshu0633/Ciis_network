import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "../../../utils/axiosConfig";
import './employee-directory.css';

// Icons imports
import {
  FiMail, FiPhone, FiUser, FiCalendar, FiMapPin,
  FiBriefcase, FiPhoneCall, FiUsers, FiAlertTriangle,
  FiSearch, FiX, FiEdit, FiDownload,
  FiMoreVertical, FiTrash2, FiSave, FiEye, FiShield,
  FiTrendingUp, FiFilter, FiPlus,
  FiRefreshCw, FiCheckCircle, FiInfo, FiMenu, FiGrid, FiList,
  FiHome, FiCreditCard, FiLock
} from "react-icons/fi";

// Custom hook for form management
const useForm = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const resetForm = useCallback((newData = {}) => {
    setFormData(newData);
  }, []);
  
  return {
    formData,
    handleChange,
    resetForm,
    setFormData
  };
};

// Custom hook for user management
const useUser = () => {
  const getCurrentUser = useCallback(() => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      return parsedUser;
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  }, []);
  
  const getCurrentUserJobRole = useCallback(() => {
    const user = getCurrentUser();
    return user?.jobRole || null;
  }, [getCurrentUser]);
  
  const getCurrentUserId = useCallback(() => {
    const user = getCurrentUser();
    return user?.id || user?._id || null;
  }, [getCurrentUser]);
  
  const isCurrentUserAdmin = useMemo(() => {
    const jobRole = getCurrentUserJobRole();
    return ['admin', 'SuperAdmin', 'manager', 'hr'].includes(jobRole);
  }, [getCurrentUserJobRole]);
  
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);
  
  return {
    getCurrentUser,
    getCurrentUserJobRole,
    getCurrentUserId,
    isCurrentUserAdmin,
    getAuthToken
  };
};

// Role Filter Component
const EmployeeDirectoryRoleFilter = ({ selected, onChange, stats }) => {
  const roleOptions = useMemo(() => [
    { value: 'all', label: 'All Roles', count: stats.total },
    { value: 'admin', label: 'Admin', count: stats.admin, color: 'error' },
    { value: 'SuperAdmin', label: 'Super Admin', count: stats.superAdmin, color: 'error-dark' },
    { value: 'manager', label: 'Manager', count: stats.manager, color: 'warning' },
    { value: 'hr', label: 'HR', count: stats.hr, color: 'info' },
    { value: 'user', label: 'User', count: stats.user, color: 'success' }
  ], [stats]);
  
  return (
    <div className="EmployeeDirectory-role-filter">
      <select
        className="EmployeeDirectory-role-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </div>
  );
};

// Employee Card Component
const EmployeeDirectoryEmployeeCard = React.memo(({ 
  emp, 
  onView, 
  onMenuOpen,
  currentUserId 
}) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phoneStr;
  };
  
  const getRoleLabel = (employee) => {
    if (!employee || !employee.jobRole) return 'User';
    if (employee.jobRole === 'SuperAdmin') return 'Super Admin';
    if (employee.jobRole === 'admin') return 'Admin';
    if (employee.jobRole === 'manager') return 'Manager';
    if (employee.jobRole === 'hr') return 'HR';
    return 'User';
  };
  
  const getRoleClass = (employee) => {
    if (!employee) return 'EmployeeDirectory-employee-tag';
    if (employee.jobRole === 'SuperAdmin') return 'EmployeeDirectory-employee-tag EmployeeDirectory-employee-tag-superadmin';
    if (employee.jobRole === 'admin') return 'EmployeeDirectory-employee-tag EmployeeDirectory-employee-tag-admin';
    if (employee.jobRole === 'manager') return 'EmployeeDirectory-employee-tag EmployeeDirectory-employee-tag-manager';
    if (employee.jobRole === 'hr') return 'EmployeeDirectory-employee-tag EmployeeDirectory-employee-tag-hr';
    return 'EmployeeDirectory-employee-tag EmployeeDirectory-employee-tag-user';
  };
  
  const isCurrentUserEmp = currentUserId === (emp._id || emp.id);
  
  return (
    <div 
      className="EmployeeDirectory-employee-card"
      onClick={() => onView(emp)}
    >
      <button 
        className="EmployeeDirectory-employee-card-menu"
        onClick={(e) => {
          e.stopPropagation();
          onMenuOpen(e, emp);
        }}
      >
        <FiMoreVertical size={16} />
      </button>
      
      <div className="EmployeeDirectory-employee-card-content">
        <div className="EmployeeDirectory-employee-header">
          <div className="EmployeeDirectory-employee-avatar">
            <div className="EmployeeDirectory-avatar-initials">
              {getInitials(emp.name)}
            </div>
          </div>
          
          <div className="EmployeeDirectory-employee-info">
            <div className="EmployeeDirectory-employee-name">
              {emp.name || 'No Name'}
              {isCurrentUserEmp && (
                <span className="EmployeeDirectory-current-user-badge">(You)</span>
              )}
            </div>
            <div className="EmployeeDirectory-employee-jobrole">
              {getRoleLabel(emp)}
            </div>
            
            <div className="EmployeeDirectory-employee-tags">
              <span className={getRoleClass(emp)}>
                {getRoleLabel(emp)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="EmployeeDirectory-employee-details">
          <div className="EmployeeDirectory-detail-row">
            <div className="EmployeeDirectory-detail-icon EmployeeDirectory-detail-icon-primary">
              <FiMail size={12} />
            </div>
            <div className="EmployeeDirectory-detail-text">{emp.email || 'No email'}</div>
          </div>
          
          <div className="EmployeeDirectory-detail-row">
            <div className="EmployeeDirectory-detail-icon EmployeeDirectory-detail-icon-success">
              <FiPhone size={12} />
            </div>
            <div className="EmployeeDirectory-detail-text">{formatPhoneNumber(emp.phone)}</div>
          </div>
        </div>
        
        <button 
          className="EmployeeDirectory-view-profile-btn"
          onClick={(e) => {
            e.stopPropagation();
            onView(emp);
          }}
        >
          <FiEye size={14} /> View Profile
        </button>
      </div>
    </div>
  );
});

// Edit Form Component
const EditEmployeeForm = React.memo(({ 
  editingUser, 
  formData, 
  onInputChange, 
  departments, 
  isCurrentUserAdmin,
  isSelfEdit,
  currentUserId 
}) => {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];
  
  const canEditJobRole = isCurrentUserAdmin && !isSelfEdit;
  const canEditDepartment = isCurrentUserAdmin;
  
  if (!editingUser) return null;
  
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="EmployeeDirectory-form-sections">
        <div className="EmployeeDirectory-form-section">
          <h3 className="EmployeeDirectory-section-title">
            <FiUser /> Personal Information
          </h3>
          <div className="EmployeeDirectory-form-grid">
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Full Name *</label>
              <input
                type="text"
                className="EmployeeDirectory-form-input"
                value={formData.name || ''}
                onChange={(e) => onInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Email Address *</label>
              <input
                type="email"
                className="EmployeeDirectory-form-input"
                value={formData.email || ''}
                disabled
                title="Email cannot be changed"
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Phone Number</label>
              <input
                type="tel"
                className="EmployeeDirectory-form-input"
                value={formData.phone || ''}
                onChange={(e) => onInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Date of Birth</label>
              <input
                type="date"
                className="EmployeeDirectory-form-input"
                value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                onChange={(e) => onInputChange('dob', e.target.value)}
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Gender</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.gender || ''}
                onChange={(e) => onInputChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Marital Status</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.maritalStatus || ''}
                onChange={(e) => onInputChange('maritalStatus', e.target.value)}
              >
                <option value="">Select Marital Status</option>
                {maritalStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="EmployeeDirectory-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="EmployeeDirectory-form-label">Address</label>
              <textarea
                className="EmployeeDirectory-form-input EmployeeDirectory-form-textarea"
                value={formData.address || ''}
                onChange={(e) => onInputChange('address', e.target.value)}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="EmployeeDirectory-form-section">
          <h3 className="EmployeeDirectory-section-title">
            <FiBriefcase /> Employment Information
          </h3>
          <div className="EmployeeDirectory-form-grid">
            {canEditJobRole && (
              <div className="EmployeeDirectory-form-group">
                <label className="EmployeeDirectory-form-label">Job Role</label>
                <select
                  className="EmployeeDirectory-form-select"
                  value={formData.jobRole || 'user'}
                  onChange={(e) => onInputChange('jobRole', e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="hr">HR</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
              </div>
            )}
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Department</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.department || ''}
                onChange={(e) => onInputChange('department', e.target.value)}
                disabled={!canEditDepartment}
                title={!canEditDepartment ? "Only admins can change department" : ""}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});

// Main Component
const EmployeeDirectory = () => {
  // Custom hooks
  const user = useUser();
  
  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Form handling
  const {
    formData: editFormData,
    handleChange: handleInputChange,
    resetForm: resetEditForm,
  } = useForm({});
  
  // Get current user info
  const currentUserId = user.getCurrentUserId();
  const isCurrentUserAdmin = user.isCurrentUserAdmin;
  const currentUser = user.getCurrentUser();
  
  // Snackbar helper
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);
  
  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch employees
      console.log('Fetching employees...');
      const usersRes = await axios.get("/users/all");
      console.log('Users API response:', usersRes.data);
      
      let employeesData = [];
      if (usersRes.data && usersRes.data.success) {
        // Handle different response structures
        if (Array.isArray(usersRes.data.users)) {
          employeesData = usersRes.data.users;
        } else if (usersRes.data.message && Array.isArray(usersRes.data.message.users)) {
          employeesData = usersRes.data.message.users;
        } else if (Array.isArray(usersRes.data.data)) {
          employeesData = usersRes.data.data;
        }
      }
      
      console.log('Processed employees:', employeesData.length);
      setEmployees(employeesData);
      
      // Fetch departments
      console.log('Fetching departments...');
      const deptRes = await axios.get("/departments");
      console.log('Departments API response:', deptRes.data);
      
      if (deptRes.data && deptRes.data.success && Array.isArray(deptRes.data.departments)) {
        setDepartments(deptRes.data.departments);
      }
      
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.message || 'Failed to load data');
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle view user
  const handleOpenUser = useCallback((userData) => {
    setSelectedUser(userData);
  }, []);
  
  const handleCloseUser = useCallback(() => {
    setSelectedUser(null);
  }, []);
  
  // Handle menu
  const handleMenuOpen = useCallback((event, userData) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuAnchorEl({
      top: rect.bottom,
      left: rect.left
    });
    setSelectedMenuUser(userData);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedMenuUser(null);
  }, []);
  
  // Handle edit
  const handleEdit = useCallback((userData) => {
    if (!userData) return;
    
    // Check permissions
    const canModify = currentUserId === (userData._id || userData.id) || isCurrentUserAdmin;
    
    if (!canModify) {
      showSnackbar('You do not have permission to edit this user', 'error');
      handleMenuClose();
      return;
    }
    
    setEditingUser(userData);
    
    // Prepare form data
    const formDataToSet = { 
      ...userData,
      department: userData.department?._id || userData.department || ''
    };
    
    resetEditForm(formDataToSet);
    handleMenuClose();
  }, [currentUserId, isCurrentUserAdmin, resetEditForm, showSnackbar, handleMenuClose]);
  
  const handleCancelEdit = useCallback(() => {
    setEditingUser(null);
    resetEditForm({});
  }, [resetEditForm]);
  
  // Handle save
  const handleSaveEdit = useCallback(async () => {
    if (!editingUser) return;
    
    // Check permissions
    const canModify = currentUserId === (editingUser._id || editingUser.id) || isCurrentUserAdmin;
    if (!canModify) {
      showSnackbar('You do not have permission to edit this user', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const userId = editingUser._id || editingUser.id;
      if (!userId) {
        showSnackbar('User ID is missing', 'error');
        return;
      }
      
      // Prepare update data
      const updateData = { ...editFormData };
      
      // Handle department
      if (updateData.department && typeof updateData.department === 'object') {
        updateData.department = updateData.department._id;
      }
      
      // Clean up data
      delete updateData._id;
      delete updateData.id;
      delete updateData.__v;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.properties;
      
      // Validate required fields
      if (!updateData.name?.trim()) {
        showSnackbar('Name is required', 'error');
        setSaving(false);
        return;
      }
      
      // Send update request
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const res = await axios.put(`/users/${userId}`, updateData, config);
      
      if (res.data && res.data.success) {
        const updatedUser = res.data.user || res.data.data;
        
        // Update local state
        setEmployees(prev => prev.map(emp => 
          (emp._id === userId || emp.id === userId) ? updatedUser : emp
        ));
        
        // Update local storage if editing current user
        if (currentUserId === userId) {
          const currentUserData = user.getCurrentUser();
          const updatedCurrentUser = { ...currentUserData, ...updateData };
          localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
        }
        
        // Close modal and show success
        setEditingUser(null);
        resetEditForm({});
        showSnackbar('Employee updated successfully');
        
        // Refresh data
        fetchData();
        
      } else {
        showSnackbar(res.data.message || 'Update failed', 'error');
      }
      
    } catch (err) {
      console.error("Update failed:", err);
      const errorMessage = err.response?.data?.message || 'Failed to update employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  }, [
    editingUser, 
    editFormData, 
    currentUserId, 
    isCurrentUserAdmin, 
    showSnackbar, 
    resetEditForm, 
    user,
    fetchData
  ]);
  
  // Handle delete
  const handleDeleteClick = useCallback((userData) => {
    if (!userData) return;
    
    // Check permissions
    const canDelete = isCurrentUserAdmin && (currentUserId !== (userData.id || userData._id));
    
    if (!canDelete) {
      showSnackbar(isCurrentUserAdmin ? 'You cannot delete your own account' : 'You do not have permission to delete users', 'error');
      handleMenuClose();
      return;
    }
    
    setUserToDelete(userData);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  }, [isCurrentUserAdmin, currentUserId, showSnackbar, handleMenuClose]);
  
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      const userId = userToDelete._id || userToDelete.id;
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.delete(`/users/${userId}`, config);
      
      if (response.data && response.data.success) {
        // Remove from state
        setEmployees(prev => prev.filter(emp => 
          (emp._id !== userId && emp.id !== userId)
        ));
        
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
        showSnackbar('Employee deleted successfully');
        
        // Close modal if viewing deleted user
        if (selectedUser && (selectedUser.id === userId || selectedUser._id === userId)) {
          handleCloseUser();
        }
        
        // Refresh data
        fetchData();
        
      } else {
        showSnackbar(response.data.message || 'Delete failed', 'error');
      }
      
    } catch (err) {
      console.error("Delete failed:", err);
      const errorMessage = err.response?.data?.message || 'Failed to delete employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleting(false);
    }
  }, [userToDelete, selectedUser, handleCloseUser, showSnackbar, fetchData]);
  
  // Stats calculation
  const stats = useMemo(() => {
    if (!Array.isArray(employees)) {
      return {
        total: 0,
        active: 0,
        admin: 0,
        superAdmin: 0,
        manager: 0,
        hr: 0,
        user: 0
      };
    }

    const activeEmployees = employees.filter(emp => emp && emp.isActive !== false);
    
    return {
      total: employees.length,
      active: activeEmployees.length,
      admin: activeEmployees.filter(emp => emp.jobRole === 'admin').length,
      superAdmin: activeEmployees.filter(emp => emp.jobRole === 'SuperAdmin').length,
      manager: activeEmployees.filter(emp => emp.jobRole === 'manager').length,
      hr: activeEmployees.filter(emp => emp.jobRole === 'hr').length,
      user: activeEmployees.filter(emp => emp.jobRole === 'user' || !emp.jobRole).length,
    };
  }, [employees]);
  
  // Filter employees
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    
    let filtered = employees.filter(emp => emp && emp.isActive !== false);
    
    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => {
        return u.jobRole === selectedRole;
      });
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((u) => {
        return (
          (u.name && u.name.toLowerCase().includes(search)) ||
          (u.email && u.email.toLowerCase().includes(search)) ||
          (u.jobRole && u.jobRole.toLowerCase().includes(search)) ||
          (u.phone && u.phone.toString().includes(search))
        );
      });
    }
    
    return filtered;
  }, [employees, selectedRole, searchTerm]);
  
  // Helper functions
  const formatPhoneNumber = useCallback((phone) => {
    if (!phone) return 'Not provided';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phoneStr;
  }, []);
  
  const getRoleLabel = useCallback((employee) => {
    if (!employee || !employee.jobRole) return 'User';
    if (employee.jobRole === 'SuperAdmin') return 'Super Admin';
    if (employee.jobRole === 'admin') return 'Admin';
    if (employee.jobRole === 'manager') return 'Manager';
    if (employee.jobRole === 'hr') return 'HR';
    return 'User';
  }, []);
  
  const getDepartmentName = useCallback((dept) => {
    if (!dept) return 'Not assigned';
    if (typeof dept === 'object') return dept.name;
    const department = departments.find(d => d._id === dept);
    return department ? department.name : 'Not assigned';
  }, [departments]);
  
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="EmployeeDirectory-loading-container">
        <div className="EmployeeDirectory-spinner"></div>
        <p>Loading employee directory...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="EmployeeDirectory-error-container">
        <FiAlertTriangle size={48} color="#d32f2f" />
        <h3>Error Loading Employees</h3>
        <p>{error}</p>
        <button 
          className="EmployeeDirectory-btn EmployeeDirectory-btn-contained"
          onClick={fetchData}
        >
          <FiRefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="EmployeeDirectory">
      <div className="EmployeeDirectory-header">
        <h1 className="EmployeeDirectory-title">Employee Directory</h1>
        <p className="EmployeeDirectory-subtitle">
          {currentUser ? `Welcome, ${currentUser.name}` : 'Find and connect with your colleagues'}
        </p>
        
        <div className="EmployeeDirectory-action-bar">
          <div className="EmployeeDirectory-total-count">
            <span className="EmployeeDirectory-count-badge">
              {stats.total} Employees
            </span>
            
            {!isMobile && (
              <div className="EmployeeDirectory-view-toggle">
                <button 
                  className={`EmployeeDirectory-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid size={14} />
                </button>
                <button 
                  className={`EmployeeDirectory-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList size={14} />
                </button>
              </div>
            )}
          </div>
          
          {isMobile && (
            <div className="EmployeeDirectory-mobile-actions">
              <button 
                className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
                onClick={() => setSearchTerm('')}
              >
                <FiFilter size={16} /> Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="EmployeeDirectory-search-filter-container">
          <div className="EmployeeDirectory-search-filter-header">
            <FiFilter size={20} color="#1976d2" />
            <h3>Search & Filter</h3>
          </div>
          
          <div className="EmployeeDirectory-search-row">
            <div className="EmployeeDirectory-search-input-container">
              <FiSearch className="EmployeeDirectory-search-icon" />
              <input
                type="text"
                className="EmployeeDirectory-search-input"
                placeholder="Search employees by name, email, job role, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="EmployeeDirectory-clear-search" onClick={() => setSearchTerm('')}>
                  <FiX size={16} />
                </button>
              )}
            </div>
            
            <EmployeeDirectoryRoleFilter
              selected={selectedRole}
              onChange={setSelectedRole}
              stats={stats}
            />
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="EmployeeDirectory-stats-container">
          {[
            { label: 'Total Employees', count: stats.total, color: 'primary', icon: <FiUsers /> },
            { label: 'Active', count: stats.active, color: 'success', icon: <FiCheckCircle /> },
            { label: 'Admin Users', count: stats.admin + stats.superAdmin, color: 'error', icon: <FiShield /> },
            { label: 'Managers', count: stats.manager, color: 'warning', icon: <FiBriefcase /> },
            { label: 'HR Team', count: stats.hr, color: 'info', icon: <FiUsers /> },
          ]
          .map((stat, index) => (
            <div key={index} className={`EmployeeDirectory-stat-card EmployeeDirectory-stat-card-${stat.color}`}>
              <div className="EmployeeDirectory-stat-card-header">
                <div className={`EmployeeDirectory-stat-icon EmployeeDirectory-stat-icon-${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="EmployeeDirectory-stat-value">{stat.count}</div>
              <div className="EmployeeDirectory-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="EmployeeDirectory-results-header">
        <div>
          <h2 className="EmployeeDirectory-results-title">Team Members</h2>
          <p className="EmployeeDirectory-results-count">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            {selectedRole !== 'all' && ` • Filtered by ${getRoleLabel({jobRole: selectedRole})}`}
            {searchTerm && ` • Matching "${searchTerm}"`}
          </p>
        </div>
      </div>

      {isMobile && (
        <div className="EmployeeDirectory-search-filter-container">
          <div className="EmployeeDirectory-search-input-container">
            <FiSearch className="EmployeeDirectory-search-icon" />
            <input
              type="text"
              className="EmployeeDirectory-search-input"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="EmployeeDirectory-clear-search" onClick={() => setSearchTerm('')}>
                <FiX size={16} />
              </button>
            )}
          </div>
          
          <div className="EmployeeDirectory-mobile-filter-select">
            <select
              className="EmployeeDirectory-role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="SuperAdmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <div className="EmployeeDirectory-empty-state">
          <div className="EmployeeDirectory-empty-state-icon">
            <FiUsers size={isMobile ? 48 : 64} />
          </div>
          <h3 className="EmployeeDirectory-empty-state-title">No Employees Found</h3>
          <p className="EmployeeDirectory-empty-state-text">
            {searchTerm || selectedRole !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No employees found in the directory.'
            }
          </p>
          <button 
            className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
            onClick={() => {
              setSearchTerm('');
              setSelectedRole('all');
            }}
          >
            <FiX size={16} /> Clear Filters
          </button>
        </div>
      ) : (
        <div className={`EmployeeDirectory-employee-${viewMode}`}>
          {filteredEmployees.map((emp) => (
            <EmployeeDirectoryEmployeeCard 
              key={emp._id || emp.id} 
              emp={emp} 
              onView={handleOpenUser}
              onMenuOpen={handleMenuOpen}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="EmployeeDirectory-modal-overlay" onClick={handleCloseUser}>
          <div className="EmployeeDirectory-modal EmployeeDirectory-user-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="EmployeeDirectory-modal-header">
              <div className="EmployeeDirectory-modal-header-content">
                <h2 className="EmployeeDirectory-modal-title">{selectedUser.name}</h2>
                <div className="EmployeeDirectory-modal-subtitle">
                  <span>{getRoleLabel(selectedUser)}</span>
                  {selectedUser.department && (
                    <span>• {getDepartmentName(selectedUser.department)}</span>
                  )}
                </div>
              </div>
              
              <div>
                <button 
                  className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
                  onClick={() => handleEdit(selectedUser)}
                  style={{ marginRight: '8px' }}
                >
                  <FiEdit size={14} /> Edit
                </button>
                <button className="EmployeeDirectory-modal-close" onClick={handleCloseUser}>
                  <FiX size={20} />
                </button>
              </div>
            </div>
            
            <div className="EmployeeDirectory-modal-content">
              <div className="EmployeeDirectory-user-detail-sections">
                <div className="EmployeeDirectory-modal-section">
                  <h3 className="EmployeeDirectory-section-title">
                    <FiUser /> Personal Information
                  </h3>
                  <div className="EmployeeDirectory-detail-grid">
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Full Name</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.name || 'Not provided'}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Email Address</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.email || 'Not provided'}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Phone Number</div>
                      <div className="EmployeeDirectory-detail-value">{formatPhoneNumber(selectedUser.phone)}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Date of Birth</div>
                      <div className="EmployeeDirectory-detail-value">{formatDate(selectedUser.dob)}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Gender</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.gender || 'Not specified'}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Marital Status</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.maritalStatus || 'Not specified'}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="EmployeeDirectory-detail-label">Address</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.address || 'Not provided'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="EmployeeDirectory-modal-section">
                  <h3 className="EmployeeDirectory-section-title">
                    <FiBriefcase /> Employment Information
                  </h3>
                  <div className="EmployeeDirectory-detail-grid">
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Job Role</div>
                      <div className="EmployeeDirectory-detail-value">{getRoleLabel(selectedUser)}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Department</div>
                      <div className="EmployeeDirectory-detail-value">{getDepartmentName(selectedUser.department)}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Status</div>
                      <div className="EmployeeDirectory-detail-value">
                        <span className={`EmployeeDirectory-status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Member Since</div>
                      <div className="EmployeeDirectory-detail-value">{formatDate(selectedUser.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="EmployeeDirectory-modal-footer">
              <button className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined" onClick={handleCloseUser}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="EmployeeDirectory-modal-overlay" onClick={handleCancelEdit}>
          <div className="EmployeeDirectory-modal EmployeeDirectory-edit-modal" onClick={e => e.stopPropagation()}>
            <div className="EmployeeDirectory-modal-header">
              <div className="EmployeeDirectory-modal-header-content">
                <h2 className="EmployeeDirectory-modal-title">
                  {currentUserId === (editingUser._id || editingUser.id) ? 'Edit Your Profile' : 'Edit Employee'}
                </h2>
                <div className="EmployeeDirectory-modal-subtitle">{editingUser.name}</div>
              </div>
              <button className="EmployeeDirectory-modal-close" onClick={handleCancelEdit}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="EmployeeDirectory-modal-content">
              <EditEmployeeForm 
                editingUser={editingUser}
                formData={editFormData}
                onInputChange={handleInputChange}
                departments={departments}
                isCurrentUserAdmin={isCurrentUserAdmin}
                isSelfEdit={currentUserId === (editingUser._id || editingUser.id)}
                currentUserId={currentUserId}
              />
            </div>
            
            <div className="EmployeeDirectory-modal-footer">
              <button 
                className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <FiX size={14} /> Cancel
              </button>
              <button 
                className="EmployeeDirectory-btn EmployeeDirectory-btn-contained"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="EmployeeDirectory-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="EmployeeDirectory-modal-overlay" onClick={() => !deleting && setDeleteConfirmOpen(false)}>
          <div className="EmployeeDirectory-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="EmployeeDirectory-modal-header">
              <div className="EmployeeDirectory-modal-header-content">
                <h2 className="EmployeeDirectory-modal-title" style={{ color: '#d32f2f' }}>
                  <FiAlertTriangle style={{ marginRight: '8px' }} />
                  Confirm Delete
                </h2>
              </div>
              {!deleting && (
                <button className="EmployeeDirectory-modal-close" onClick={() => setDeleteConfirmOpen(false)}>
                  <FiX size={20} />
                </button>
              )}
            </div>
            
            <div className="EmployeeDirectory-modal-content">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <FiAlertTriangle size={24} color="#d32f2f" style={{ marginRight: '12px' }} />
                <p style={{ fontWeight: '600' }}>
                  Are you sure you want to delete this employee?
                </p>
              </div>
              <p>
                You are about to delete <strong>{userToDelete?.name}</strong>. 
                This action will deactivate their account and cannot be undone.
              </p>
            </div>
            
            <div className="EmployeeDirectory-modal-footer">
              <button 
                className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="EmployeeDirectory-btn EmployeeDirectory-btn-error"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="EmployeeDirectory-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={14} /> Delete Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {menuAnchorEl && selectedMenuUser && (
        <>
          <div 
            className="EmployeeDirectory-modal-overlay"
            style={{ background: 'transparent', zIndex: 1099 }}
            onClick={handleMenuClose}
          />
          <div 
            className="EmployeeDirectory-context-menu"
            style={{
              position: 'fixed',
              top: menuAnchorEl.top + 'px',
              left: menuAnchorEl.left + 'px',
              zIndex: 1100
            }}
          >
            <button className="EmployeeDirectory-menu-item" onClick={() => handleOpenUser(selectedMenuUser)}>
              <FiEye size={16} color="#0288d1" />
              <span className="EmployeeDirectory-menu-item-text">View Details</span>
            </button>
            
            <button className="EmployeeDirectory-menu-item" onClick={() => handleEdit(selectedMenuUser)}>
              <FiEdit size={16} color="#1976d2" />
              <span className="EmployeeDirectory-menu-item-text">Edit</span>
            </button>
            
            {isCurrentUserAdmin && currentUserId !== (selectedMenuUser.id || selectedMenuUser._id) && (
              <button 
                className="EmployeeDirectory-menu-item" 
                onClick={() => handleDeleteClick(selectedMenuUser)}
                style={{ color: '#d32f2f' }}
              >
                <FiTrash2 size={16} color="#d32f2f" />
                <span className="EmployeeDirectory-menu-item-text">Delete</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="EmployeeDirectory-snackbar">
          <div className={`EmployeeDirectory-alert EmployeeDirectory-alert-${snackbar.severity}`}>
            {snackbar.severity === 'success' ? (
              <FiCheckCircle size={20} />
            ) : (
              <FiAlertTriangle size={20} />
            )}
            <span>{snackbar.message}</span>
            <button 
              className="EmployeeDirectory-alert-close"
              onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;