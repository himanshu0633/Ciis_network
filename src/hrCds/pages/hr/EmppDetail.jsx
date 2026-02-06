import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  FiHome, FiCreditCard
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
      const companyData = localStorage.getItem('companyDetails');
      
      if (!userData) {
        console.warn("❌ No user data found in localStorage");
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      
      let companyDetails = null;
      if (companyData) {
        try {
          companyDetails = JSON.parse(companyData);
        } catch (e) {
          console.error('❌ Error parsing company details:', e);
        }
      }
      
      // Combine user data with company details
      const combinedUser = {
        ...parsedUser,
        companyDetails
      };
      
      console.log("👤 Current user from localStorage:", {
        id: combinedUser.id || combinedUser._id,
        email: combinedUser.email,
        company: combinedUser.company,
        companyId: combinedUser.companyId,
        department: combinedUser.department,
        departmentId: combinedUser.departmentId,
        jobRole: combinedUser.jobRole || combinedUser.role,
        isAdmin: ['admin', 'superadmin'].includes((combinedUser.jobRole || combinedUser.role || '').toLowerCase())
      });
      
      return combinedUser;
      
    } catch (err) {
      console.error('❌ Error parsing user data:', err);
      return null;
    }
  }, []);
  
  const getCurrentUserJobRole = useCallback(() => {
    const user = getCurrentUser();
    const jobRole = user?.jobRole || user?.role || '';
    console.log("👔 Current user job role:", jobRole);
    return jobRole.toLowerCase();
  }, [getCurrentUser]);
  
  const getCurrentUserId = useCallback(() => {
    const user = getCurrentUser();
    const userId = user?.id || user?._id || null;
    console.log("🆔 Current user ID:", userId);
    return userId;
  }, [getCurrentUser]);
  
  const getCurrentUserCompanyId = useCallback(() => {
    const user = getCurrentUser();
    const companyId = user?.company || user?.companyId || user?.companyDetails?._id || null;
    console.log("🏢 Current user company ID:", companyId);
    return companyId;
  }, [getCurrentUser]);
  
  const getCurrentUserCompanyCode = useCallback(() => {
    const user = getCurrentUser();
    const companyCode = user?.companyCode || user?.companyDetails?.companyCode || null;
    console.log("🏷️ Current user company code:", companyCode);
    return companyCode;
  }, [getCurrentUser]);
  
  const getCurrentUserCompanyName = useCallback(() => {
    const user = getCurrentUser();
    const companyName = user?.companyName || user?.companyDetails?.companyName || null;
    console.log("🏢 Current user company name:", companyName);
    return companyName;
  }, [getCurrentUser]);
  
  const getCurrentUserDepartmentId = useCallback(() => {
    const user = getCurrentUser();
    const deptId = user?.department || user?.departmentId || null;
    console.log("📊 Current user department ID:", deptId);
    return deptId;
  }, [getCurrentUser]);
  
  const isCurrentUserAdmin = useMemo(() => {
    const jobRole = getCurrentUserJobRole();
    const isAdmin = ['admin', 'superadmin'].includes(jobRole);
    console.log("👑 Is current user admin?", isAdmin);
    return isAdmin;
  }, [getCurrentUserJobRole]);
  
  const isCurrentUserManagerOrHR = useMemo(() => {
    const jobRole = getCurrentUserJobRole();
    const isManagerOrHR = ['manager', 'hr', 'human resources'].includes(jobRole);
    console.log("👥 Is current user manager/HR?", isManagerOrHR);
    return isManagerOrHR;
  }, [getCurrentUserJobRole]);
  
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log("🔑 Token present:", !!token);
    return token;
  }, []);
  
  return {
    getCurrentUser,
    getCurrentUserJobRole,
    getCurrentUserId,
    getCurrentUserCompanyId,
    getCurrentUserCompanyCode,
    getCurrentUserCompanyName,
    getCurrentUserDepartmentId,
    isCurrentUserAdmin,
    isCurrentUserManagerOrHR,
    getAuthToken
  };
};

// Employee Card Component
const EmployeeDirectoryEmployeeCard = React.memo(({ 
  emp, 
  onView, 
  onMenuOpen,
  currentUserId,
  jobRoles // Add jobRoles prop
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
  
  // Helper function to get job role name
  const getJobRoleName = (jobRoleId) => {
    if (!jobRoleId || !jobRoles || jobRoles.length === 0) {
      return typeof emp.jobRole === 'string' ? emp.jobRole.charAt(0).toUpperCase() + emp.jobRole.slice(1) : 'N/A';
    }
    
    // Check if jobRoleId is a string or object
    const roleId = typeof jobRoleId === 'object' ? jobRoleId._id || jobRoleId.id : jobRoleId;
    
    // Find matching job role
    const jobRole = jobRoles.find(role => 
      role._id === roleId || 
      role.id === roleId ||
      role.roleNumber === roleId
    );
    
    return jobRole ? jobRole.roleName : (typeof emp.jobRole === 'string' ? emp.jobRole : 'N/A');
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
            {emp.isActive && (
              <div className="EmployeeDirectory-avatar-status active"></div>
            )}
          </div>
          
          <div className="EmployeeDirectory-employee-info">
            <div className="EmployeeDirectory-employee-name">
              {emp.name || 'No Name'}
              {isCurrentUserEmp && (
                <span className="EmployeeDirectory-current-user-badge">(You)</span>
              )}
            </div>
            <div className="EmployeeDirectory-employee-email">
              {emp.email || 'No email'}
            </div>
            
            <div className="EmployeeDirectory-employee-tags">
              <span className={`EmployeeDirectory-employee-tag ${emp.isActive ? 'EmployeeDirectory-employee-tag-active' : 'EmployeeDirectory-employee-tag-inactive'}`}>
                {emp.isActive ? 'Active' : 'Inactive'}
              </span>
              {emp.employeeId && (
                <span className="EmployeeDirectory-employee-tag EmployeeDirectory-employee-tag-secondary">
                  ID: {emp.employeeId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="EmployeeDirectory-employee-details">
          <div className="EmployeeDirectory-detail-row">
            <div className="EmployeeDirectory-detail-icon EmployeeDirectory-detail-icon-primary">
              <FiPhone size={12} />
            </div>
            <div className="EmployeeDirectory-detail-text">{formatPhoneNumber(emp.phone)}</div>
          </div>
          
          {emp.department && (
            <div className="EmployeeDirectory-detail-row">
              <div className="EmployeeDirectory-detail-icon EmployeeDirectory-detail-icon-success">
                <FiBriefcase size={12} />
              </div>
              <div className="EmployeeDirectory-detail-text">
                {typeof emp.department === 'object' ? emp.department.name : 'Department'}
              </div>
            </div>
          )}
          
          {emp.jobRole && (
            <div className="EmployeeDirectory-detail-row">
              <div className="EmployeeDirectory-detail-icon EmployeeDirectory-detail-icon-warning">
                <FiUser size={12} />
              </div>
              <div className="EmployeeDirectory-detail-text">
                {getJobRoleName(emp.jobRole)}
              </div>
            </div>
          )}
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

// Edit Form Component - UPDATED
const EditEmployeeForm = React.memo(({ 
  editingUser, 
  formData, 
  onInputChange, 
  departments, 
  jobRoles, // Add jobRoles prop
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
  
  if (!editingUser) {
    return null;
  }
  
  // PERMISSION LOGIC
  const isEditingSelf = currentUserId === (editingUser._id || editingUser.id);
  
  // All users can edit basic personal info
  // Only admins can edit job role, department, status, employee ID
  const canEditJobRole = isCurrentUserAdmin && !isEditingSelf;
  const canEditDepartment = isCurrentUserAdmin;
  const canEditStatus = isCurrentUserAdmin && !isEditingSelf;
  const canEditEmployeeId = isCurrentUserAdmin;
  
  console.log("✏️ Edit form permissions:", {
    isEditingSelf,
    canEditJobRole,
    canEditDepartment,
    canEditStatus,
    canEditEmployeeId,
    currentUserId,
    editingUserId: editingUser._id || editingUser.id
  });
  
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
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Employee ID</label>
              <input
                type="text"
                className="EmployeeDirectory-form-input"
                value={formData.employeeId || ''}
                onChange={(e) => onInputChange('employeeId', e.target.value)}
                disabled={!canEditEmployeeId}
                title={!canEditEmployeeId ? "Only admins can change employee ID" : ""}
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Job Role</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.jobRole || ''}
                onChange={(e) => onInputChange('jobRole', e.target.value)}
                disabled={!canEditJobRole}
                title={!canEditJobRole ? "Only admins can change job role (not for yourself)" : ""}
              >
                <option value="">Select Job Role</option>
                {jobRoles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.roleName} ({role.roleNumber})
                  </option>
                ))}
              </select>
            </div>
            
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
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Status</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.isActive === false ? 'inactive' : 'active'}
                onChange={(e) => onInputChange('isActive', e.target.value === 'active')}
                disabled={!canEditStatus}
                title={!canEditStatus ? "Only admins can change status (not for yourself)" : ""}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});

// Main Component - UPDATED
const EmployeeDirectory = () => {
  console.log("🚀 EmployeeDirectory component mounted");
  
  // Custom hooks
  const user = useUser();
  
  // State - Add jobRoles state
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]); // New state for job roles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
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
  const currentUserCompanyId = user.getCurrentUserCompanyId();
  const currentUserDepartmentId = user.getCurrentUserDepartmentId();
  const currentUserCompanyCode = user.getCurrentUserCompanyCode();
  const currentUserCompanyName = user.getCurrentUserCompanyName();
  const isCurrentUserAdmin = user.isCurrentUserAdmin;
  const isCurrentUserManagerOrHR = user.isCurrentUserManagerOrHR;
  
  console.log("👤 Current user info:", {
    currentUserId,
    currentUserCompanyId,
    currentUserDepartmentId,
    currentUserCompanyCode,
    currentUserCompanyName,
    isCurrentUserAdmin,
    isCurrentUserManagerOrHR
  });
  
  // Snackbar helper
  const showSnackbar = useCallback((message, severity = 'success') => {
    console.log(`🍿 Snackbar: ${severity} - ${message}`);
    setSnackbar({ 
      open: true, 
      message, 
      severity,
      id: Date.now()
    });
    
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);
  
  // NEW FUNCTION: Fetch Job Roles from API
  const fetchJobRoles = useCallback(async () => {
    console.log("🌐 Fetching job roles from API");
    
    if (!currentUserCompanyId) {
      console.error("❌ No company ID found for fetching job roles");
      return [];
    }
    
    try {
      const token = user.getAuthToken();
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // API call to fetch job roles with company ID
      const response = await axios.get(`/job-roles?company=${currentUserCompanyId}`, config);
      
      console.log("📊 Job roles API response:", response.data);
      
      if (response.data && response.data.success) {
        // Extract job roles from response
        let jobRolesData = [];
        
        if (Array.isArray(response.data.jobRoles)) {
          jobRolesData = response.data.jobRoles;
        } else if (Array.isArray(response.data.data)) {
          jobRolesData = response.data.data;
        } else if (response.data.message && Array.isArray(response.data.message)) {
          jobRolesData = response.data.message;
        }
        
        console.log(`✅ Fetched ${jobRolesData.length} job roles`);
        
        // Transform data if needed
        const formattedJobRoles = jobRolesData.map(role => ({
          _id: role._id || role.id,
          roleName: role.roleName || role.name || 'Unnamed Role',
          roleNumber: role.roleNumber || role.roleNo || role.number || 'N/A',
          description: role.description || '',
          company: role.company || currentUserCompanyId
        }));
        
        setJobRoles(formattedJobRoles);
        return formattedJobRoles;
      } else {
        console.log("❌ Failed to fetch job roles");
        setJobRoles([]);
        return [];
      }
      
    } catch (err) {
      console.error("❌ Error fetching job roles:", err);
      setJobRoles([]);
      return [];
    }
  }, [currentUserCompanyId, user.getAuthToken]);
  
  // Helper function to get job role name by ID
  const getJobRoleName = useCallback((jobRoleId) => {
    if (!jobRoleId || jobRoles.length === 0) {
      return 'N/A';
    }
    
    // Check if jobRoleId is a string or object
    const roleId = typeof jobRoleId === 'object' ? jobRoleId._id || jobRoleId.id : jobRoleId;
    
    // Find matching job role
    const jobRole = jobRoles.find(role => 
      role._id === roleId || 
      role.id === roleId ||
      role.roleNumber === roleId
    );
    
    return jobRole ? jobRole.roleName : 'N/A';
  }, [jobRoles]);
  
  // Helper function to get job role details by ID
  const getJobRoleDetails = useCallback((jobRoleId) => {
    if (!jobRoleId || jobRoles.length === 0) {
      return null;
    }
    
    const roleId = typeof jobRoleId === 'object' ? jobRoleId._id || jobRoleId.id : jobRoleId;
    
    const jobRole = jobRoles.find(role => 
      role._id === roleId || 
      role.id === roleId ||
      role.roleNumber === roleId
    );
    
    return jobRole;
  }, [jobRoles]);
  
  // Helper function to check if current user can edit a specific user
  const canEditUser = useCallback((targetUser) => {
    if (!targetUser) {
      console.log("❌ canEditUser: targetUser is null");
      return false;
    }
    
    const targetUserId = targetUser._id || targetUser.id;
    console.log("🔍 canEditUser check - ALLOWING EDIT FOR ALL:", {
      targetUserName: targetUser.name,
      currentUserId,
      isSameUser: currentUserId === targetUserId
    });
    
    return true;
  }, [currentUserId]);
  
  // Helper function to check if current user can delete a specific user
  const canDeleteUser = useCallback((targetUser) => {
    if (!targetUser) return false;
    
    const targetUserId = targetUser._id || targetUser.id;
    
    // Cannot delete yourself
    if (currentUserId === targetUserId) {
      console.log("❌ canDeleteUser: Cannot delete yourself");
      return false;
    }
    
    // Only admin can delete users
    if (!isCurrentUserAdmin) {
      console.log("❌ canDeleteUser: Only admins can delete");
      return false;
    }
    
    console.log("✅ canDeleteUser: Admin can delete");
    return true;
  }, [currentUserId, isCurrentUserAdmin]);
  
  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch data - UPDATED to include job roles
  const fetchData = useCallback(async () => {
    console.log("🔍 Starting fetchData");
    
    if (!currentUserCompanyId) {
      console.error("❌ No company ID found");
      showSnackbar('Company information not found. Please login again.', 'error');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = user.getAuthToken();
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log("🌐 Making API request to: /users/department-users");
      
      // Use the correct endpoint from the controller
      const usersRes = await axios.get("/users/department-users", config);
      console.log("✅ API Response received:", {
        status: usersRes.status,
        statusText: usersRes.statusText,
        dataKeys: Object.keys(usersRes.data)
      });
      
      console.log("📦 Full API response data:", JSON.stringify(usersRes.data, null, 2));
      
      let employeesData = [];
      
      if (usersRes.data && usersRes.data.success) {
        // Extract users array from response
        if (usersRes.data.message && usersRes.data.message.users) {
          employeesData = usersRes.data.message.users;
        } else if (usersRes.data.users) {
          employeesData = usersRes.data.users;
        } else if (usersRes.data.message && Array.isArray(usersRes.data.message)) {
          employeesData = usersRes.data.message;
        } else if (usersRes.data.data && Array.isArray(usersRes.data.data)) {
          employeesData = usersRes.data.data;
        }
        
        console.log(`📊 Total users fetched: ${employeesData.length}`);
        
        // Filter by company
        const filteredEmployees = employeesData.filter(emp => {
          if (!emp) return false;
          
          // Check company
          const empCompanyId = emp.company?._id || emp.company || emp.companyId;
          return empCompanyId === currentUserCompanyId;
        });
        
        console.log(`✅ After filtering: ${filteredEmployees.length} employees`);
        setEmployees(filteredEmployees);
        
      } else {
        console.log("❌ Failed to fetch users");
        setEmployees([]);
      }
      
      // Fetch departments
      console.log("🌐 Fetching departments");
      const deptRes = await axios.get("/departments", config);
      
      if (deptRes.data && deptRes.data.success && Array.isArray(deptRes.data.departments)) {
        // Filter departments by company
        const filteredDepartments = deptRes.data.departments.filter(dept => {
          const deptCompanyId = dept.company?._id || dept.company;
          return deptCompanyId === currentUserCompanyId;
        });
        
        console.log(`📊 Departments: ${filteredDepartments.length}`);
        setDepartments(filteredDepartments);
      } else {
        setDepartments([]);
      }
      
      // Fetch job roles - NEW
      await fetchJobRoles();
      
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      setError(err.response?.data?.message || 'Failed to load data');
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    currentUserCompanyId, 
    currentUserDepartmentId, 
    isCurrentUserAdmin, 
    showSnackbar, 
    user.getAuthToken,
    fetchJobRoles // Add to dependencies
  ]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle view user
  const handleOpenUser = useCallback((userData) => {
    console.log("👁️ Opening user view:", userData.name);
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
    console.log("✏️ Handle edit called - ALL USERS ALLOWED");
    
    if (!userData) return;
    
    console.log("✅ Opening edit form for:", userData.name);
    
    setEditingUser(userData);
    
    // Prepare form data
    const formDataToSet = { 
      ...userData,
      department: userData.department?._id || userData.department || '',
      jobRole: userData.jobRole || ''
    };
    
    resetEditForm(formDataToSet);
    handleMenuClose();
  }, [resetEditForm, handleMenuClose]);
  
  const handleCancelEdit = useCallback(() => {
    setEditingUser(null);
    resetEditForm({});
  }, [resetEditForm]);
  
  // Handle save - UPDATED for job roles
  const handleSaveEdit = useCallback(async () => {
    console.log("💾 Saving edit");
    
    if (!editingUser) {
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
      
      // Handle job role - convert to ID if it's an object
      if (updateData.jobRole && typeof updateData.jobRole === 'object') {
        updateData.jobRole = updateData.jobRole._id || updateData.jobRole.id;
      }
      
      // IMPORTANT: Non-admin users can only update personal info
      const isSelfEdit = currentUserId === userId;
      
      if (!isCurrentUserAdmin) {
        console.log("👤 Non-admin user saving - removing restricted fields");
        
        // Non-admins can only update these fields
        const allowedFields = [
          'name', 'phone', 'dob', 'gender', 'maritalStatus', 'address'
        ];
        
        // Remove all fields except allowed ones
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key) && key !== 'email') {
            delete updateData[key];
          }
        });
        
        // Always remove these sensitive fields for non-admins
        delete updateData.jobRole;
        delete updateData.department;
        delete updateData.isActive;
        delete updateData.employeeId;
      }
      
      // Self-edit restrictions (even for admins)
      if (isSelfEdit) {
        console.log("👤 Self-edit - removing job role and department");
        delete updateData.jobRole;
        delete updateData.department;
        delete updateData.isActive;
      }
      
      // Remove unnecessary fields
      const fieldsToDelete = [
        '_id', 'id', '__v', 'createdAt', 'updatedAt', 
        'properties', 'company', 'companyCode', 'companyId', 'createdBy'
      ];
      
      fieldsToDelete.forEach(field => {
        delete updateData[field];
      });
      
      console.log("📤 Final update data:", updateData);
      
      // Validate required fields
      if (!updateData.name?.trim()) {
        showSnackbar('Name is required', 'error');
        setSaving(false);
        return;
      }
      
      // Send update request
      const token = user.getAuthToken();
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
      console.error("❌ Update failed:", err);
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
    
    const canDelete = canDeleteUser(userData);
    
    if (!canDelete) {
      const message = isCurrentUserAdmin ? 
        'You cannot delete your own account' : 
        'You do not have permission to delete users';
      showSnackbar(message, 'error');
      handleMenuClose();
      return;
    }
    
    setUserToDelete(userData);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  }, [canDeleteUser, isCurrentUserAdmin, showSnackbar, handleMenuClose]);
  
  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const userId = userToDelete._id || userToDelete.id;
      const token = user.getAuthToken();
      
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
      console.error("❌ Delete failed:", err);
      const errorMessage = err.response?.data?.message || 'Failed to delete employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleting(false);
    }
  }, [userToDelete, selectedUser, handleCloseUser, showSnackbar, fetchData, user.getAuthToken]);
  
  // Helper functions
  const formatPhoneNumber = useCallback((phone) => {
    if (!phone) return 'Not provided';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phoneStr;
  }, []);
  
  const getDepartmentName = useCallback((dept) => {
    if (!dept) return 'Not assigned';
    if (typeof dept === 'object') return dept.name || 'Department';
    const department = departments.find(d => d._id === dept);
    return department ? department.name : 'Not assigned';
  }, [departments]);
  
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  }, []);
  
  // Stats calculation
  const stats = useMemo(() => {
    if (!Array.isArray(employees)) {
      return {
        total: 0,
        active: 0,
        inactive: 0
      };
    }

    const activeEmployees = employees.filter(emp => emp && emp.isActive !== false);
    const inactiveEmployees = employees.filter(emp => emp && emp.isActive === false);
    
    return {
      total: employees.length,
      active: activeEmployees.length,
      inactive: inactiveEmployees.length
    };
  }, [employees]);
  
  // Filter employees
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) {
      return [];
    }
    
    let filtered = employees;
    
    if (selectedFilter === "active") {
      filtered = filtered.filter(emp => emp && emp.isActive !== false);
    } else if (selectedFilter === "inactive") {
      filtered = filtered.filter(emp => emp && emp.isActive === false);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((emp) => {
        const jobRoleName = getJobRoleName(emp.jobRole).toLowerCase();
        
        return (
          (emp.name && emp.name.toLowerCase().includes(search)) ||
          (emp.email && emp.email.toLowerCase().includes(search)) ||
          (emp.employeeId && emp.employeeId.toLowerCase().includes(search)) ||
          (emp.phone && emp.phone.toString().includes(search)) ||
          (emp.jobRole && jobRoleName.includes(search)) ||
          (emp.department && typeof emp.department === 'object' && 
           emp.department.name && emp.department.name.toLowerCase().includes(search))
        );
      });
    }
    
    return filtered;
  }, [employees, selectedFilter, searchTerm, getJobRoleName]);
  
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
  
  // Check if no company data
  if (!currentUserCompanyId) {
    return (
      <div className="EmployeeDirectory-error-container">
        <FiAlertTriangle size={48} color="#ff9800" />
        <h3>Company Information Missing</h3>
        <p>Unable to load employee directory. Please login again.</p>
        <button 
          className="EmployeeDirectory-btn EmployeeDirectory-btn-contained"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="EmployeeDirectory">
      <div className="EmployeeDirectory-header">
        <div className="EmployeeDirectory-company-info">
          <div className="EmployeeDirectory-company-avatar">
            {/* Company logo/avatar */}
          </div>
          <div>
            <h1 className="EmployeeDirectory-title">Employee Directory</h1>
            <p className="EmployeeDirectory-subtitle">
              {currentUserCompanyName || 'Company'} • {currentUserCompanyCode}
              {!isCurrentUserAdmin && currentUserDepartmentId && (
                <span className="EmployeeDirectory-department-badge">
                  • {getDepartmentName(currentUserDepartmentId)} Department
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="EmployeeDirectory-action-bar">
          <div className="EmployeeDirectory-total-count">
            <span className="EmployeeDirectory-count-badge">
              {stats.total} Employees
            </span>
            <span className="EmployeeDirectory-company-badge">
               {currentUserCompanyCode}
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
                placeholder="Search employees by name, email, ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="EmployeeDirectory-clear-search" onClick={() => setSearchTerm('')}>
                  <FiX size={16} />
                </button>
              )}
            </div>
            
            <select
              className="EmployeeDirectory-role-select"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Employees ({stats.total})</option>
              <option value="active">Active ({stats.active})</option>
              <option value="inactive">Inactive ({stats.inactive})</option>
            </select>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="EmployeeDirectory-stats-container">
          {[
            { label: 'Total Employees', count: stats.total, color: 'primary', icon: <FiUsers /> },
            { label: 'Active', count: stats.active, color: 'success', icon: <FiCheckCircle /> },
            { label: 'Inactive', count: stats.inactive, color: 'error', icon: <FiAlertTriangle /> },
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
            {selectedFilter !== 'all' && ` • ${selectedFilter === 'active' ? 'Active' : 'Inactive'} employees`}
            {searchTerm && ` • Matching "${searchTerm}"`}
          </p>
        </div>
        
        {/* Permission note */}
        <div className="EmployeeDirectory-permission-note">
          <FiInfo size={16} />
          <span>All users can view and edit employee information in this company.</span>
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
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Employees</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            {searchTerm || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No employees found in your company directory.'
            }
          </p>
          <button 
            className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
            onClick={() => {
              setSearchTerm('');
              setSelectedFilter('all');
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
              jobRoles={jobRoles} // Pass jobRoles to card component
            />
          ))}
        </div>
      )}

      {/* User Detail Modal - UPDATED */}
      {selectedUser && (
        <div className="EmployeeDirectory-modal-overlay" onClick={handleCloseUser}>
          <div className="EmployeeDirectory-modal EmployeeDirectory-user-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="EmployeeDirectory-modal-header">
              <div className="EmployeeDirectory-modal-header-content">
                <h2 className="EmployeeDirectory-modal-title">{selectedUser.name}</h2>
                <div className="EmployeeDirectory-modal-subtitle">
                  {selectedUser.employeeId && <span>ID: {selectedUser.employeeId}</span>}
                  {selectedUser.jobRole && (
                    <span>• {getJobRoleName(selectedUser.jobRole)}</span>
                  )}
                  {selectedUser.department && (
                    <span>• {getDepartmentName(selectedUser.department)}</span>
                  )}
                </div>
              </div>
              
              <div>
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
                      <div className="EmployeeDirectory-detail-label">Employee ID</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.employeeId || 'Not assigned'}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Job Role</div>
                      <div className="EmployeeDirectory-detail-value">
                        {getJobRoleName(selectedUser.jobRole)}
                        {(() => {
                          const jobRoleDetails = getJobRoleDetails(selectedUser.jobRole);
                          return jobRoleDetails && jobRoleDetails.roleNumber ? 
                            ` (${jobRoleDetails.roleNumber})` : '';
                        })()}
                      </div>
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
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Company</div>
                      <div className="EmployeeDirectory-detail-value">
                        {selectedUser.company?.companyName || 
                         currentUserCompanyName || 
                         currentUserCompanyCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="EmployeeDirectory-modal-footer">
              <button 
                className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined"
                onClick={() => handleEdit(selectedUser)}
                style={{ marginRight: '8px' }}
              >
                <FiEdit size={14} /> Edit
              </button>
              <button className="EmployeeDirectory-btn EmployeeDirectory-btn-outlined" onClick={handleCloseUser}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - UPDATED */}
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
                jobRoles={jobRoles} // Pass jobRoles to edit form
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
            
            <button 
              className="EmployeeDirectory-menu-item" 
              onClick={() => handleEdit(selectedMenuUser)}
            >
              <FiEdit size={16} color="#1976d2" />
              <span className="EmployeeDirectory-menu-item-text">Edit</span>
            </button>
            
            {canDeleteUser(selectedMenuUser) && (
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