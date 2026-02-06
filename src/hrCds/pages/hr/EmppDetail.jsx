// department wise h isme usi department ke log dikhenge jo login hoga 


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
        console.log("❌ No user data found in localStorage");
        return null;
      }
      
      console.log("📋 Raw user data from localStorage:", userData);
      const parsedUser = JSON.parse(userData);
      console.log("📋 Parsed user data:", parsedUser);
      
      let companyDetails = null;
      
      if (companyData) {
        try {
          companyDetails = JSON.parse(companyData);
          console.log("🏢 Company details from localStorage:", companyDetails);
        } catch (e) {
          console.error('❌ Error parsing company details:', e);
        }
      }
      
      // Combine user data with company details
      const combinedUser = {
        ...parsedUser,
        companyDetails
      };
      
      console.log("👤 Combined user object:", combinedUser);
      return combinedUser;
      
    } catch (err) {
      console.error('❌ Error parsing user data:', err);
      return null;
    }
  }, []);
  
  const getCurrentUserJobRole = useCallback(() => {
    const user = getCurrentUser();
    const jobRole = user?.jobRole || user?.role || null;
    console.log("👔 Current user job role:", jobRole);
    return jobRole;
  }, [getCurrentUser]);
  
  const getCurrentUserId = useCallback(() => {
    const user = getCurrentUser();
    const userId = user?.id || user?._id || null;
    console.log("🆔 Current user ID:", userId);
    return userId;
  }, [getCurrentUser]);
  
  const getCurrentUserCompanyId = useCallback(() => {
    const user = getCurrentUser();
    const companyId = user?.company || user?.companyId || null;
    console.log("🏢 Current user company ID:", companyId);
    return companyId;
  }, [getCurrentUser]);
  
  const getCurrentUserCompanyCode = useCallback(() => {
    const user = getCurrentUser();
    const companyCode = user?.companyCode || user?.company?.companyCode || null;
    console.log("🏷️ Current user company code:", companyCode);
    return companyCode;
  }, [getCurrentUser]);
  
  const getCurrentUserCompanyName = useCallback(() => {
    const user = getCurrentUser();
    const companyName = user?.companyName || user?.company?.companyName || null;
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
    const isAdmin = ['admin', 'SuperAdmin'].includes(jobRole);
    console.log("👑 Is current user admin?", isAdmin, "Job role:", jobRole);
    return isAdmin;
  }, [getCurrentUserJobRole]);
  
  const isCurrentUserManagerOrHR = useMemo(() => {
    const jobRole = getCurrentUserJobRole();
    const isManagerOrHR = ['manager', 'hr'].includes(jobRole);
    console.log("👥 Is current user manager/HR?", isManagerOrHR, "Job role:", jobRole);
    return isManagerOrHR;
  }, [getCurrentUserJobRole]);
  
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log("🔑 Token from localStorage:", token ? "Present (length: " + token.length + ")" : "Missing");
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

// Role Filter Component
const EmployeeDirectoryRoleFilter = ({ selected, onChange, stats }) => {
  console.log("🎯 RoleFilter props:", { selected, stats });
  
  const roleOptions = useMemo(() => [
    { value: 'all', label: 'All Employees', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active, color: 'success' },
    { value: 'inactive', label: 'Inactive', count: stats.inactive, color: 'error' }
  ], [stats]);
  
  return (
    <div className="EmployeeDirectory-role-filter">
      <select
        className="EmployeeDirectory-role-select"
        value={selected}
        onChange={(e) => {
          console.log("🔄 Role filter changed to:", e.target.value);
          onChange(e.target.value);
        }}
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
  console.log("👤 EmployeeCard rendering:", { 
    empId: emp._id || emp.id, 
    name: emp.name,
    currentUserId,
    isCurrentUser: currentUserId === (emp._id || emp.id)
  });
  
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
  
  const isCurrentUserEmp = currentUserId === (emp._id || emp.id);
  
  return (
    <div 
      className="EmployeeDirectory-employee-card"
      onClick={() => {
        console.log("👁️ Viewing employee:", emp.name || emp.email);
        onView(emp);
      }}
    >
      <button 
        className="EmployeeDirectory-employee-card-menu"
        onClick={(e) => {
          e.stopPropagation();
          console.log("📱 Opening menu for:", emp.name || emp.email);
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
                {emp.jobRole.charAt(0).toUpperCase() + emp.jobRole.slice(1)}
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="EmployeeDirectory-view-profile-btn"
          onClick={(e) => {
            e.stopPropagation();
            console.log("👁️ View profile clicked for:", emp.name || emp.email);
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
  console.log("✏️ EditEmployeeForm props:", {
    editingUserId: editingUser?._id || editingUser?.id,
    formDataKeys: Object.keys(formData),
    departmentsCount: departments.length,
    isCurrentUserAdmin,
    isSelfEdit,
    currentUserId
  });

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
  
  const jobRoleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr', label: 'HR' },
    { value: 'user', label: 'User' }
  ];
  
  const canEditDepartment = isCurrentUserAdmin;
  const canEditJobRole = isCurrentUserAdmin && !isSelfEdit;
  
  if (!editingUser) {
    console.log("⚠️ EditEmployeeForm: No editing user");
    return null;
  }
  
  console.log("✅ EditEmployeeForm rendering for:", editingUser.name);
  
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
                onChange={(e) => {
                  console.log("📝 Name changed:", e.target.value);
                  onInputChange('name', e.target.value);
                }}
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
                onChange={(e) => {
                  console.log("📱 Phone changed:", e.target.value);
                  onInputChange('phone', e.target.value);
                }}
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Date of Birth</label>
              <input
                type="date"
                className="EmployeeDirectory-form-input"
                value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  console.log("📅 DOB changed:", e.target.value);
                  onInputChange('dob', e.target.value);
                }}
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Gender</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.gender || ''}
                onChange={(e) => {
                  console.log("⚧️ Gender changed:", e.target.value);
                  onInputChange('gender', e.target.value);
                }}
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
                onChange={(e) => {
                  console.log("💍 Marital status changed:", e.target.value);
                  onInputChange('maritalStatus', e.target.value);
                }}
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
                onChange={(e) => {
                  console.log("🏠 Address changed:", e.target.value);
                  onInputChange('address', e.target.value);
                }}
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
                onChange={(e) => {
                  console.log("🆔 Employee ID changed:", e.target.value);
                  onInputChange('employeeId', e.target.value);
                }}
                disabled={!isCurrentUserAdmin}
              />
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Job Role</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.jobRole || ''}
                onChange={(e) => {
                  console.log("👔 Job role changed:", e.target.value);
                  onInputChange('jobRole', e.target.value);
                }}
                disabled={!canEditJobRole}
                title={!canEditJobRole ? "Only admins can change job role (not for yourself)" : ""}
              >
                <option value="">Select Job Role</option>
                {jobRoleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="EmployeeDirectory-form-group">
              <label className="EmployeeDirectory-form-label">Department</label>
              <select
                className="EmployeeDirectory-form-select"
                value={formData.department || ''}
                onChange={(e) => {
                  console.log("📊 Department changed:", e.target.value);
                  onInputChange('department', e.target.value);
                }}
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
                onChange={(e) => {
                  console.log("📈 Status changed:", e.target.value);
                  onInputChange('isActive', e.target.value === 'active');
                }}
                disabled={!isCurrentUserAdmin}
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

// Main Component
const EmployeeDirectory = () => {
  console.log("🚀 EmployeeDirectory component mounted");
  
  // Custom hooks
  const user = useUser();
  
  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
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
  
  console.log("📊 Component state:", {
    employeesCount: employees.length,
    departmentsCount: departments.length,
    loading,
    error,
    selectedUserId: selectedUser?._id || selectedUser?.id,
    selectedFilter,
    searchTerm,
    editingUserId: editingUser?._id || editingUser?.id,
    selectedMenuUserId: selectedMenuUser?._id || selectedMenuUser?.id,
    deleteConfirmOpen,
    userToDeleteId: userToDelete?._id || userToDelete?.id,
    isMobile,
    viewMode
  });
  
  // Form handling
  const {
    formData: editFormData,
    handleChange: handleInputChange,
    resetForm: resetEditForm,
  } = useForm({});
  
  console.log("📝 Edit form data:", editFormData);
  
  // Get current user info
  const currentUserId = user.getCurrentUserId();
  const currentUserCompanyId = user.getCurrentUserCompanyId();
  const currentUserDepartmentId = user.getCurrentUserDepartmentId();
  const currentUserCompanyCode = user.getCurrentUserCompanyCode();
  const currentUserCompanyName = user.getCurrentUserCompanyName();
  const isCurrentUserAdmin = user.isCurrentUserAdmin;
  const isCurrentUserManagerOrHR = user.isCurrentUserManagerOrHR;
  const currentUser = user.getCurrentUser();
  
  console.log("👤 Current user info:", {
    currentUserId,
    currentUserCompanyId,
    currentUserDepartmentId,
    currentUserCompanyCode,
    currentUserCompanyName,
    isCurrentUserAdmin,
    isCurrentUserManagerOrHR,
    currentUser
  });
  
  // Snackbar helper
  const showSnackbar = useCallback((message, severity = 'success') => {
    console.log(`🍿 Snackbar: ${severity} - ${message}`);
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 3000);
  }, []);
  
  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      console.log("📱 Responsive check:", mobile ? "Mobile" : "Desktop");
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch data with company filtering
  const fetchData = useCallback(async () => {
    console.log("🔍 fetchData function called");
    
    if (!currentUserCompanyId) {
      console.error("❌ No company ID found");
      showSnackbar('Company information not found. Please login again.', 'error');
      setLoading(false);
      return;
    }
    
    console.log("🏢 Starting fetch for company:", currentUserCompanyId);
    setLoading(true);
    setError(null);
    
    try {
      const token = user.getAuthToken();
      console.log("🔑 Token for request:", token ? "Present" : "Missing");
      
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
      
      // DEEP DEBUG: Check ALL possible response structures
      console.log("🔬 DEEP DEBUG - Checking response structure:");
      
      // Check if success exists
      console.log("1. data.success exists?", usersRes.data?.success);
      
      // Check if message exists
      console.log("2. data.message exists?", usersRes.data?.message);
      
      // Check message type
      if (usersRes.data?.message) {
        console.log("3. data.message type:", typeof usersRes.data.message);
        console.log("4. data.message keys:", Object.keys(usersRes.data.message));
      }
      
      // Check if users array exists in different locations
      console.log("5. data.users exists?", usersRes.data?.users);
      console.log("6. data.data exists?", usersRes.data?.data);
      console.log("7. data.message?.users exists?", usersRes.data?.message?.users);
      console.log("8. data.message?.data exists?", usersRes.data?.message?.data);
      
      if (usersRes.data && usersRes.data.success) {
        console.log("✅ API call successful");
        
        // Check EVERY possible location for users array
        if (usersRes.data.message && usersRes.data.message.users && Array.isArray(usersRes.data.message.users)) {
          employeesData = usersRes.data.message.users;
          console.log(`📍 Found ${employeesData.length} users in data.message.users`);
          console.log("📍 First user sample:", employeesData[0] ? {
            id: employeesData[0].id || employeesData[0]._id,
            name: employeesData[0].name,
            email: employeesData[0].email,
            company: employeesData[0].company,
            department: employeesData[0].department
          } : "No users");
        } 
        else if (usersRes.data.users && Array.isArray(usersRes.data.users)) {
          employeesData = usersRes.data.users;
          console.log(`📍 Found ${employeesData.length} users in data.users`);
        }
        else if (usersRes.data.message && Array.isArray(usersRes.data.message)) {
          employeesData = usersRes.data.message;
          console.log(`📍 Found ${employeesData.length} users in data.message array`);
        }
        else if (usersRes.data.data && Array.isArray(usersRes.data.data)) {
          employeesData = usersRes.data.data;
          console.log(`📍 Found ${employeesData.length} users in data.data`);
        }
        else if (Array.isArray(usersRes.data)) {
          employeesData = usersRes.data;
          console.log(`📍 Found ${employeesData.length} users in data array`);
        }
        else {
          console.log("❌ No users array found in any expected location");
          console.log("❌ Actual response structure:", {
            data: usersRes.data,
            message: usersRes.data?.message,
            keys: Object.keys(usersRes.data)
          });
        }
        
        console.log(`📊 Total users fetched: ${employeesData.length}`);
        
        if (employeesData.length > 0) {
          console.log("📋 Users data sample:", employeesData.slice(0, 3).map(emp => ({
            id: emp.id || emp._id,
            name: emp.name,
            email: emp.email,
            company: emp.company,
            department: emp.department,
            jobRole: emp.jobRole
          })));
        }
        
        // Filter by company on client side if needed
        // Also filter by department for non-admin users
        console.log("🎯 Starting filter process:");
        console.log("🎯 Current user company ID:", currentUserCompanyId);
        console.log("🎯 Current user department ID:", currentUserDepartmentId);
        console.log("🎯 Is current user admin?", isCurrentUserAdmin);
        
        const filteredEmployees = employeesData.filter(emp => {
          if (!emp) {
            console.log("❌ Skipping null employee");
            return false;
          }
          
          console.log(`\n🔍 Processing employee: ${emp.name || emp.email || 'Unnamed'}`);
          
          // Check company
          const empCompanyId = emp.company?._id || emp.company || emp.companyId;
          console.log(`   Employee company ID: ${empCompanyId}`);
          console.log(`   Expected company ID: ${currentUserCompanyId}`);
          
          const isSameCompany = empCompanyId === currentUserCompanyId;
          console.log(`   Same company? ${isSameCompany}`);
          
          if (!isSameCompany) {
            console.log(`   ❌ Filtered out - different company`);
            return false;
          }
          
          // If user is not admin, filter by department
          if (!isCurrentUserAdmin && currentUserDepartmentId) {
            const empDeptId = emp.department?._id || emp.department || emp.departmentId;
            console.log(`   Employee department ID: ${empDeptId}`);
            console.log(`   Expected department ID: ${currentUserDepartmentId}`);
            
            const deptMatch = empDeptId === currentUserDepartmentId;
            console.log(`   Same department? ${deptMatch}`);
            
            if (!deptMatch) {
              console.log(`   ❌ Filtered out - different department`);
            }
            return deptMatch;
          }
          
          console.log(`   ✅ Included`);
          return true;
        });
        
        console.log(`\n✅ Filter completed:`);
        console.log(`   Total before filter: ${employeesData.length}`);
        console.log(`   Total after filter: ${filteredEmployees.length}`);
        console.log(`   Filtered employees:`, filteredEmployees.map(e => ({
          name: e.name,
          email: e.email,
          company: e.company,
          department: e.department
        })));
        
        setEmployees(filteredEmployees);
        
      } else {
        console.log("❌ API call not successful:", usersRes.data);
        console.log('Alternative response structure:', usersRes.data);
        setEmployees([]);
      }
      
      // Fetch departments
      console.log("\n📊 Fetching departments...");
      const deptRes = await axios.get("/departments", config);
      console.log("✅ Departments API response:", {
        status: deptRes.status,
        dataKeys: Object.keys(deptRes.data)
      });
      console.log("📋 Departments data:", deptRes.data);
      
      if (deptRes.data && deptRes.data.success && Array.isArray(deptRes.data.departments)) {
        console.log(`📍 Found ${deptRes.data.departments.length} departments`);
        
        // Filter departments by company if needed
        const filteredDepartments = deptRes.data.departments.filter(dept => {
          const deptCompanyId = dept.company?._id || dept.company;
          return deptCompanyId === currentUserCompanyId;
        });
        
        console.log(`✅ Filtered to ${filteredDepartments.length} departments for current company`);
        console.log("📋 Filtered departments:", filteredDepartments.map(d => ({
          id: d._id,
          name: d.name,
          company: d.company
        })));
        
        setDepartments(filteredDepartments);
      } else {
        console.log("❌ No departments found or unexpected structure");
        console.log("❌ Full response:", deptRes.data);
        setDepartments([]);
      }
      
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      console.error("❌ Error details:", {
        message: err.message,
        code: err.code,
        config: err.config,
        response: err.response
      });
      setError(err.response?.data?.message || 'Failed to load data');
      showSnackbar('Failed to load data', 'error');
    } finally {
      console.log("🏁 Fetch completed, setting loading to false");
      setLoading(false);
    }
  }, [
    currentUserCompanyId, 
    currentUserDepartmentId, 
    isCurrentUserAdmin, 
    showSnackbar, 
    user.getAuthToken
  ]);
  
  // Initial data fetch
  useEffect(() => {
    console.log("🎬 Initial useEffect running");
    fetchData();
  }, [fetchData]);
  
  // Handle view user
  const handleOpenUser = useCallback((userData) => {
    console.log("👁️ Opening user view:", {
      userId: userData._id || userData.id,
      name: userData.name,
      email: userData.email
    });
    setSelectedUser(userData);
  }, []);
  
  const handleCloseUser = useCallback(() => {
    console.log("❌ Closing user view");
    setSelectedUser(null);
  }, []);
  
  // Handle menu
  const handleMenuOpen = useCallback((event, userData) => {
    console.log("📱 Opening context menu for:", userData.name || userData.email);
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuAnchorEl({
      top: rect.bottom,
      left: rect.left
    });
    setSelectedMenuUser(userData);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    console.log("❌ Closing context menu");
    setMenuAnchorEl(null);
    setSelectedMenuUser(null);
  }, []);
  
  // Handle edit
  const handleEdit = useCallback((userData) => {
    console.log("✏️ Handle edit called for:", {
      userId: userData._id || userData.id,
      name: userData.name,
      currentUserId,
      isCurrentUserAdmin,
      isCurrentUserManagerOrHR
    });
    
    if (!userData) return;
    
    // Check permissions
    const canModify = currentUserId === (userData._id || userData.id) || isCurrentUserAdmin || isCurrentUserManagerOrHR;
    console.log("🔐 Can modify?", canModify);
    
    if (!canModify) {
      console.log("❌ Permission denied for edit");
      showSnackbar('You do not have permission to edit this user', 'error');
      handleMenuClose();
      return;
    }
    
    console.log("✅ Permission granted, opening edit form");
    setEditingUser(userData);
    
    // Prepare form data
    const formDataToSet = { 
      ...userData,
      department: userData.department?._id || userData.department || '',
      jobRole: userData.jobRole || ''
    };
    
    console.log("📝 Form data to set:", formDataToSet);
    resetEditForm(formDataToSet);
    handleMenuClose();
  }, [
    currentUserId, 
    isCurrentUserAdmin, 
    isCurrentUserManagerOrHR, 
    resetEditForm, 
    showSnackbar, 
    handleMenuClose
  ]);
  
  const handleCancelEdit = useCallback(() => {
    console.log("❌ Canceling edit");
    setEditingUser(null);
    resetEditForm({});
  }, [resetEditForm]);
  
  // Handle save
  const handleSaveEdit = useCallback(async () => {
    console.log("💾 Handle save edit called");
    
    if (!editingUser) {
      console.log("❌ No editing user");
      return;
    }
    
    // Check permissions
    const canModify = currentUserId === (editingUser._id || editingUser.id) || isCurrentUserAdmin || isCurrentUserManagerOrHR;
    console.log("🔐 Can modify?", canModify);
    
    if (!canModify) {
      console.log("❌ Permission denied for save");
      showSnackbar('You do not have permission to edit this user', 'error');
      return;
    }
    
    console.log("✅ Starting save process");
    setSaving(true);
    
    try {
      const userId = editingUser._id || editingUser.id;
      console.log("🆔 User ID to update:", userId);
      
      if (!userId) {
        console.log("❌ User ID is missing");
        showSnackbar('User ID is missing', 'error');
        return;
      }
      
      // Prepare update data
      const updateData = { ...editFormData };
      console.log("📝 Update data before cleanup:", updateData);
      
      // Handle department
      if (updateData.department && typeof updateData.department === 'object') {
        updateData.department = updateData.department._id;
        console.log("📊 Department converted to ID:", updateData.department);
      }
      
      // Clean up data - non-admins cannot update certain fields
      if (!isCurrentUserAdmin) {
        console.log("👤 Non-admin user, removing restricted fields");
        delete updateData.jobRole;
        delete updateData.department;
        delete updateData.isActive;
        delete updateData.employeeId;
      }
      
      // Self-edit restrictions
      if (currentUserId === userId) {
        console.log("👤 Self-edit, removing jobRole and department");
        delete updateData.jobRole;
        delete updateData.department;
      }
      
      // Remove unnecessary fields
      const fieldsToDelete = [
        '_id', 'id', '__v', 'createdAt', 'updatedAt', 
        'properties', 'company', 'companyCode', 'companyId', 'createdBy'
      ];
      
      fieldsToDelete.forEach(field => {
        delete updateData[field];
      });
      
      console.log("📝 Update data after cleanup:", updateData);
      
      // Validate required fields
      if (!updateData.name?.trim()) {
        console.log("❌ Name is required");
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
      
      console.log("🌐 Sending PUT request to:", `/users/${userId}`);
      console.log("📤 Request payload:", updateData);
      
      const res = await axios.put(`/users/${userId}`, updateData, config);
      
      console.log("✅ Update response:", {
        status: res.status,
        data: res.data
      });
      
      if (res.data && res.data.success) {
        const updatedUser = res.data.user || res.data.data;
        console.log("✅ User updated successfully:", updatedUser);
        
        // Update local state
        setEmployees(prev => prev.map(emp => 
          (emp._id === userId || emp.id === userId) ? updatedUser : emp
        ));
        
        // Update local storage if editing current user
        if (currentUserId === userId) {
          console.log("💾 Updating current user in localStorage");
          const currentUserData = user.getCurrentUser();
          const updatedCurrentUser = { ...currentUserData, ...updateData };
          localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
        }
        
        // Close modal and show success
        setEditingUser(null);
        resetEditForm({});
        showSnackbar('Employee updated successfully');
        
        // Refresh data
        console.log("🔄 Refreshing data");
        fetchData();
        
      } else {
        console.log("❌ Update failed:", res.data);
        showSnackbar(res.data.message || 'Update failed', 'error');
      }
      
    } catch (err) {
      console.error("❌ Update failed:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || 'Failed to update employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      console.log("🏁 Save process completed");
      setSaving(false);
    }
  }, [
    editingUser, 
    editFormData, 
    currentUserId, 
    isCurrentUserAdmin, 
    isCurrentUserManagerOrHR,
    showSnackbar, 
    resetEditForm, 
    user,
    fetchData
  ]);
  
  // Handle delete
  const handleDeleteClick = useCallback((userData) => {
    console.log("🗑️ Handle delete click called for:", {
      userId: userData._id || userData.id,
      name: userData.name
    });
    
    if (!userData) return;
    
    // Check permissions
    const canDelete = isCurrentUserAdmin && (currentUserId !== (userData.id || userData._id));
    console.log("🔐 Can delete?", canDelete, {
      isCurrentUserAdmin,
      currentUserId,
      targetUserId: userData.id || userData._id
    });
    
    if (!canDelete) {
      const message = isCurrentUserAdmin ? 
        'You cannot delete your own account' : 
        'You do not have permission to delete users';
      console.log("❌ Delete permission denied:", message);
      showSnackbar(message, 'error');
      handleMenuClose();
      return;
    }
    
    console.log("✅ Opening delete confirmation");
    setUserToDelete(userData);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  }, [isCurrentUserAdmin, currentUserId, showSnackbar, handleMenuClose]);
  
  const handleDeleteConfirm = useCallback(async () => {
    console.log("🗑️ Handle delete confirm called");
    
    if (!userToDelete) {
      console.log("❌ No user to delete");
      return;
    }
    
    console.log("✅ Starting delete process for:", userToDelete.name);
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
      
      console.log("🌐 Sending DELETE request to:", `/users/${userId}`);
      
      const response = await axios.delete(`/users/${userId}`, config);
      
      console.log("✅ Delete response:", {
        status: response.status,
        data: response.data
      });
      
      if (response.data && response.data.success) {
        console.log("✅ User deleted successfully");
        
        // Remove from state
        setEmployees(prev => prev.filter(emp => 
          (emp._id !== userId && emp.id !== userId)
        ));
        
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
        showSnackbar('Employee deleted successfully');
        
        // Close modal if viewing deleted user
        if (selectedUser && (selectedUser.id === userId || selectedUser._id === userId)) {
          console.log("👁️ Closing detail modal for deleted user");
          handleCloseUser();
        }
        
        // Refresh data
        console.log("🔄 Refreshing data after delete");
        fetchData();
        
      } else {
        console.log("❌ Delete failed:", response.data);
        showSnackbar(response.data.message || 'Delete failed', 'error');
      }
      
    } catch (err) {
      console.error("❌ Delete failed:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || 'Failed to delete employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      console.log("🏁 Delete process completed");
      setDeleting(false);
    }
  }, [userToDelete, selectedUser, handleCloseUser, showSnackbar, fetchData, user.getAuthToken]);
  
  // Stats calculation
  const stats = useMemo(() => {
    console.log("📈 Calculating stats from employees:", employees.length);
    
    if (!Array.isArray(employees)) {
      console.log("❌ Employees is not an array");
      return {
        total: 0,
        active: 0,
        inactive: 0
      };
    }

    const activeEmployees = employees.filter(emp => emp && emp.isActive !== false);
    const inactiveEmployees = employees.filter(emp => emp && emp.isActive === false);
    
    const statsResult = {
      total: employees.length,
      active: activeEmployees.length,
      inactive: inactiveEmployees.length
    };
    
    console.log("📊 Stats calculated:", statsResult);
    return statsResult;
  }, [employees]);
  
  // Filter employees
  const filteredEmployees = useMemo(() => {
    console.log("🔍 Filtering employees:", {
      totalEmployees: employees.length,
      selectedFilter,
      searchTermLength: searchTerm.length
    });
    
    if (!Array.isArray(employees)) {
      console.log("❌ Employees is not an array");
      return [];
    }
    
    let filtered = employees;
    
    if (selectedFilter === "active") {
      filtered = filtered.filter(emp => emp && emp.isActive !== false);
      console.log("✅ Active filter applied, remaining:", filtered.length);
    } else if (selectedFilter === "inactive") {
      filtered = filtered.filter(emp => emp && emp.isActive === false);
      console.log("✅ Inactive filter applied, remaining:", filtered.length);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      console.log("🔍 Searching for:", search);
      
      filtered = filtered.filter((emp) => {
        const matches = (
          (emp.name && emp.name.toLowerCase().includes(search)) ||
          (emp.email && emp.email.toLowerCase().includes(search)) ||
          (emp.employeeId && emp.employeeId.toLowerCase().includes(search)) ||
          (emp.phone && emp.phone.toString().includes(search)) ||
          (emp.jobRole && emp.jobRole.toLowerCase().includes(search)) ||
          (emp.department && typeof emp.department === 'object' && 
           emp.department.name && emp.department.name.toLowerCase().includes(search))
        );
        
        if (matches) {
          console.log(`   ✅ "${emp.name}" matches search`);
        }
        
        return matches;
      });
      
      console.log("✅ Search filter applied, remaining:", filtered.length);
    }
    
    console.log("🔍 Final filtered count:", filtered.length);
    return filtered;
  }, [employees, selectedFilter, searchTerm]);
  
  // Helper functions
  const formatPhoneNumber = useCallback((phone) => {
    console.log("📱 Formatting phone:", phone);
    if (!phone) return 'Not provided';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phoneStr;
  }, []);
  
  const getDepartmentName = useCallback((dept) => {
    console.log("📊 Getting department name for:", dept);
    if (!dept) return 'Not assigned';
    if (typeof dept === 'object') return dept.name || 'Department';
    const department = departments.find(d => d._id === dept);
    return department ? department.name : 'Not assigned';
  }, [departments]);
  
  const formatDate = useCallback((dateString) => {
    console.log("📅 Formatting date:", dateString);
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("❌ Error formatting date:", e);
      return 'Invalid date';
    }
  }, []);
  
  console.log("🎨 Component rendering with:", {
    loading,
    error,
    employeesCount: employees.length,
    filteredEmployeesCount: filteredEmployees.length,
    stats,
    currentUserCompanyId
  });
  
  // Loading state
  if (loading) {
    console.log("⏳ Rendering loading state");
    return (
      <div className="EmployeeDirectory-loading-container">
        <div className="EmployeeDirectory-spinner"></div>
        <p>Loading employee directory...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    console.log("❌ Rendering error state:", error);
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
    console.log("❌ No company ID, rendering missing info state");
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
  
  console.log("✅ Rendering main component");
  
  return (
    <div className="EmployeeDirectory">
      <div className="EmployeeDirectory-header">
        <div className="EmployeeDirectory-company-info">
          <div className="EmployeeDirectory-company-avatar">
        
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
                  onClick={() => {
                    console.log("🔄 View mode changed to: grid");
                    setViewMode('grid');
                  }}
                >
                  <FiGrid size={14} />
                </button>
                <button 
                  className={`EmployeeDirectory-view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => {
                    console.log("🔄 View mode changed to: list");
                    setViewMode('list');
                  }}
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
                onClick={() => {
                  console.log("🔍 Clearing search term");
                  setSearchTerm('');
                }}
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
                placeholder="Search employees by name, email, ID, department..."
                value={searchTerm}
                onChange={(e) => {
                  console.log("🔍 Search term changed:", e.target.value);
                  setSearchTerm(e.target.value);
                }}
              />
              {searchTerm && (
                <button className="EmployeeDirectory-clear-search" onClick={() => {
                  console.log("❌ Clearing search term");
                  setSearchTerm('');
                }}>
                  <FiX size={16} />
                </button>
              )}
            </div>
            
            <EmployeeDirectoryRoleFilter
              selected={selectedFilter}
              onChange={(value) => {
                console.log("🎯 Role filter changed to:", value);
                setSelectedFilter(value);
              }}
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
            {!isCurrentUserAdmin && currentUserDepartmentId && (
              <span className="EmployeeDirectory-department-filter-note">
                • Showing only your department
              </span>
            )}
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
              onChange={(e) => {
                console.log("🔍 Mobile search term changed:", e.target.value);
                setSearchTerm(e.target.value);
              }}
            />
            {searchTerm && (
              <button className="EmployeeDirectory-clear-search" onClick={() => {
                console.log("❌ Clearing mobile search term");
                setSearchTerm('');
              }}>
                <FiX size={16} />
              </button>
            )}
          </div>
          
          <div className="EmployeeDirectory-mobile-filter-select">
            <select
              className="EmployeeDirectory-role-select"
              value={selectedFilter}
              onChange={(e) => {
                console.log("🎯 Mobile filter changed to:", e.target.value);
                setSelectedFilter(e.target.value);
              }}
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
              console.log("🔄 Clearing all filters");
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
                  {selectedUser.employeeId && <span>ID: {selectedUser.employeeId}</span>}
                  {selectedUser.jobRole && (
                    <span>• {selectedUser.jobRole.charAt(0).toUpperCase() + selectedUser.jobRole.slice(1)}</span>
                  )}
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
                  disabled={!isCurrentUserAdmin && !isCurrentUserManagerOrHR && currentUserId !== (selectedUser._id || selectedUser.id)}
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
                      <div className="EmployeeDirectory-detail-label">Employee ID</div>
                      <div className="EmployeeDirectory-detail-value">{selectedUser.employeeId || 'Not assigned'}</div>
                    </div>
                    
                    <div className="EmployeeDirectory-detail-item">
                      <div className="EmployeeDirectory-detail-label">Job Role</div>
                      <div className="EmployeeDirectory-detail-value">
                        {selectedUser.jobRole ? selectedUser.jobRole.charAt(0).toUpperCase() + selectedUser.jobRole.slice(1) : 'Not assigned'}
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
                <button className="EmployeeDirectory-modal-close" onClick={() => {
                  console.log("❌ Closing delete confirmation");
                  setDeleteConfirmOpen(false);
                }}>
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
                onClick={() => {
                  console.log("❌ Cancel delete");
                  setDeleteConfirmOpen(false);
                }}
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
              disabled={!isCurrentUserAdmin && !isCurrentUserManagerOrHR && currentUserId !== (selectedMenuUser.id || selectedMenuUser._id)}
            >
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
              onClick={() => {
                console.log("❌ Closing snackbar");
                setSnackbar(prev => ({ ...prev, open: false }));
              }}
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