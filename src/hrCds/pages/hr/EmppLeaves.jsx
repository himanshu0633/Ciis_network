import React, { useEffect, useState, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import './employee-leaves.css';

// Icons
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiTrash2,
  FiList,
  FiX,
  FiSave,
  FiMail,
  FiPhone,
  FiLock,
  FiBriefcase,
  FiUser,
  FiShield,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiFileText,
  FiUserCheck,
  FiCalendar as FiCalendarIcon,
  FiMapPin,
  FiTag,
  FiMessageSquare,
  FiCheckSquare,
  FiClock as FiClockIcon,
  FiArrowRight,
  FiHome,
  FiUsers as FiUsersIcon,
  FiBriefcase as FiBriefcaseIcon
} from "react-icons/fi";

// Status Filter Component
const StatusFilter = ({ selected, onChange }) => {
  const options = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  return (
    <select
      className="filter-select"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Leave Type Filter Component
const LeaveTypeFilter = ({ selected, onChange }) => {
  const options = [
    { value: 'all', label: 'All Types' },
    { value: 'Casual', label: 'Casual' },
    { value: 'Sick', label: 'Sick' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Unpaid', label: 'Unpaid' },
  ];

  return (
    <select
      className="filter-select"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// ✅ Department Filter Component
const DepartmentFilter = ({ selected, onChange, departments = [] }) => {
  return (
    <select
      className="filter-select"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Departments</option>
      {departments.map((dept) => (
        <option key={dept._id || dept.id || dept} value={dept._id || dept.id || dept}>
          {dept.name || dept.label || dept}
        </option>
      ))}
    </select>
  );
};

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedStat, setSelectedStat] = useState("All");
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    leaveId: null,
    newStatus: null,
    remarks: "",
    userEmail: "",
    userName: "",
    userPhone: "",
    userId: null,
    currentStatus: ""
  });
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    title: "",
    items: [],
  });
  
  // User Role Related States
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUserDepartment, setCurrentUserDepartment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserCompanyId, setCurrentUserCompanyId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  
  // ✅ Department Related States
  const [departments, setDepartments] = useState([]);
  const [departmentMap, setDepartmentMap] = useState({});
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  
  // ✅ Company Name State (for header)
  const [companyName, setCompanyName] = useState("");
  
  // Permission States
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [permissions, setPermissions] = useState({
    canViewAllLeaves: false,
    canApproveLeaves: false,
    canDeleteLeaves: false,
    canExportData: false,
    canViewHistory: true
  });

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    fetchCurrentUserAndCompany();
  }, []);

  useEffect(() => {
    if (currentUserCompanyId) {
      fetchCompanyUsers();
      fetchLeaves();
      fetchDepartments(); // ✅ Department API call
      fetchCompanyDetails(); // ✅ Company details for name
    }
  }, [
    filterDate, 
    statusFilter, 
    leaveTypeFilter, 
    departmentFilter,
    currentUserCompanyId,
    isOwner
  ]);

  // ============================================
  // ✅ FETCH COMPANY DETAILS (for name)
  // ============================================
  const fetchCompanyDetails = async () => {
    if (!currentUserCompanyId) return;
    
    try {
      const response = await axios.get(`/companies/${currentUserCompanyId}`);
      if (response.data && response.data.success && response.data.data) {
        setCompanyName(response.data.data.name || response.data.data.companyName || 'Company');
      } else if (response.data && response.data.name) {
        setCompanyName(response.data.name);
      }
    } catch (error) {
      console.error("❌ Failed to fetch company details:", error);
    }
  };

  // ============================================
  // ✅ FETCH DEPARTMENTS FROM API
  // ============================================
  const fetchDepartments = async () => {
    if (!currentUserCompanyId) return;
    
    setLoadingDepartments(true);
    try {
      console.log("🏢 Fetching departments for company:", currentUserCompanyId);
      const response = await axios.get(`/departments?company=${currentUserCompanyId}`);
      console.log("✅ Departments API response:", response.data);
      
      let departmentsData = [];
      let departmentMapping = {};
      
      // Parse response data based on structure
      if (response.data && response.data.success && response.data.data) {
        departmentsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response.data && response.data.departments) {
        departmentsData = response.data.departments;
      }
      
      // Create department map { id: name }
      departmentsData.forEach(dept => {
        const deptId = dept._id || dept.id;
        const deptName = dept.name || dept.departmentName || dept.title || 'Unknown';
        if (deptId) {
          departmentMapping[deptId] = deptName;
        }
      });
      
      console.log("📊 Department mapping created:", departmentMapping);
      setDepartmentMap(departmentMapping);
      setDepartments(departmentsData);
      
    } catch (error) {
      console.error("❌ Failed to fetch departments:", error);
      showSnackbar("Error loading departments", "error");
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ============================================
  // ✅ ENHANCED GET DEPARTMENT NAME FUNCTION
  // ============================================
  const getDepartmentName = (dept) => {
    if (!dept) return null; // Return null instead of 'N/A' to hide
    
    // CASE 1: If it's an object with name property
    if (typeof dept === 'object') {
      if (dept.name) {
        return dept.name;
      }
      if (dept._id && departmentMap[dept._id]) {
        return departmentMap[dept._id];
      }
    }
    
    // CASE 2: If it's a string ID
    if (typeof dept === 'string') {
      // First check in department map (from API)
      if (departmentMap[dept]) {
        return departmentMap[dept];
      }
      
      // Second check: Look for department in departments array directly
      const foundDept = departments.find(d => (d._id || d.id) === dept);
      if (foundDept) {
        const name = foundDept.name || foundDept.departmentName || foundDept.title;
        if (name) {
          // Update map for future use
          setDepartmentMap(prev => ({ ...prev, [dept]: name }));
          return name;
        }
      }
      
      // Third check: Try to find in users data as fallback
      const userWithDept = allUsers.find(u => {
        if (u.department && typeof u.department === 'object') {
          return u.department._id === dept || u.department === dept;
        }
        if (u.departmentId) {
          return u.departmentId === dept;
        }
        if (u.department) {
          return u.department === dept || (typeof u.department === 'object' && u.department._id === dept);
        }
        return false;
      });
      
      if (userWithDept) {
        // Extract department name from found user
        if (userWithDept.department && typeof userWithDept.department === 'object') {
          const deptName = userWithDept.department.name || userWithDept.department.departmentName;
          if (deptName) {
            // Update map for future use
            setDepartmentMap(prev => ({ ...prev, [dept]: deptName }));
            return deptName;
          }
        }
        if (userWithDept.departmentName) {
          setDepartmentMap(prev => ({ ...prev, [dept]: userWithDept.departmentName }));
          return userWithDept.departmentName;
        }
      }
      
      // If it's a MongoDB ID but not found, return null to hide
      if (dept.match(/^[0-9a-f]{24}$/i)) {
        return null; // Hide unfound IDs
      }
      
      // If it doesn't look like a MongoDB ID, return as is (might be a name)
      return dept;
    }
    
    // Fallback - return null to hide
    return null;
  };

  // ============================================
  // USER & PERMISSION FUNCTIONS
  // ============================================
  const fetchCurrentUserAndCompany = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log("⚠️ No user found in localStorage");
        return;
      }

      const user = JSON.parse(userStr);
      
      const userId = user._id || user.id || '';
      const companyId = user.company || user.companyId || '';
      const department = user.department || '';
      const name = user.name || user.username || 'User';
      let role = '';
      
      if (user.companyRole) {
        role = user.companyRole;
      } else if (user.role) {
        role = user.role;
      }
      
      setCurrentUser(user);
      setCurrentUserId(userId);
      setCurrentUserCompanyId(companyId);
      setCurrentUserDepartment(department);
      setCurrentUserName(name);
      setCurrentUserRole(role);
      
      const isOwnerRole = role === 'Owner' || role === 'owner' || role === 'OWNER';
      const isAdminRole = role === 'Admin' || role === 'admin' || role === 'ADMIN';
      const isHRRole = role === 'HR' || role === 'hr' || role === 'Hr';
      const isManagerRole = role === 'Manager' || role === 'manager' || role === 'MANAGER';
      
      setIsOwner(isOwnerRole);
      setIsAdmin(isAdminRole);
      setIsHR(isHRRole);
      setIsManager(isManagerRole);
      
      // UPDATED: Set permissions - delete permission now matches approve permission
      setPermissions({
        canViewAllLeaves: isOwnerRole || isAdminRole || isHRRole,
        canApproveLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole,
        canDeleteLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole, // UPDATED: Added manager
        canExportData: isOwnerRole || isAdminRole || isHRRole,
        canViewHistory: true
      });
      
      if (!role && userId) {
        await fetchUserRole(userId);
      }
      
    } catch (error) {
      console.error("Error parsing user data:", error);
      showSnackbar("Error loading user data", "error");
    }
  };

  const fetchUserRole = async (userId) => {
    try {
      const res = await axios.get(`/users/${userId}`);
      if (res.data && res.data.success && res.data.user) {
        const user = res.data.user;
        const userRole = user.companyRole || user.role;
        
        setCurrentUserRole(userRole);
        
        const isOwnerRole = userRole === 'Owner' || userRole === 'owner' || userRole === 'OWNER';
        const isAdminRole = userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN';
        const isHRRole = userRole === 'HR' || userRole === 'hr' || userRole === 'Hr';
        const isManagerRole = userRole === 'Manager' || userRole === 'manager' || userRole === 'MANAGER';
        
        setIsOwner(isOwnerRole);
        setIsAdmin(isAdminRole);
        setIsHR(isHRRole);
        setIsManager(isManagerRole);
        
        // UPDATED: Set permissions - delete permission now matches approve permission
        setPermissions({
          canViewAllLeaves: isOwnerRole || isAdminRole || isHRRole,
          canApproveLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole,
          canDeleteLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole, // UPDATED: Added manager
          canExportData: isOwnerRole || isAdminRole || isHRRole,
          canViewHistory: true
        });
      }
    } catch (err) {
      console.error("Failed to fetch user role:", err);
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      let endpoint = '';
      
      // FIXED: Use the correct endpoint based on user role
      if (isOwner) {
        // Owner can see all company users
        endpoint = `/users/company-users?companyId=${currentUserCompanyId}`;
      } else {
        // Employees see only their department users
        endpoint = `/users/department-users?department=${currentUserDepartment}`;
      }
      
      const res = await axios.get(endpoint);
      
      let usersData = [];
      
      if (res.data && res.data.success) {
        if (res.data.message && res.data.message.users && Array.isArray(res.data.message.users)) {
          usersData = res.data.message.users;
        } else if (res.data.users && Array.isArray(res.data.users)) {
          usersData = res.data.users;
        } else if (res.data.message && Array.isArray(res.data.message)) {
          usersData = res.data.message;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          usersData = res.data.data;
        } else if (Array.isArray(res.data)) {
          usersData = res.data;
        }
      }
      
      setAllUsers(usersData);
      
      // Extract department info from users to help with mapping
      const deptFromUsers = {};
      
      usersData.forEach(user => {
        if (user.department && typeof user.department === 'object') {
          if (user.department._id && user.department.name) {
            deptFromUsers[user.department._id] = user.department.name;
          }
        } else if (user.departmentId && user.departmentName) {
          deptFromUsers[user.departmentId] = user.departmentName;
        }
      });
      
      // Merge with existing maps
      setDepartmentMap(prev => ({ ...prev, ...deptFromUsers }));
      
    } catch (err) {
      console.error("❌ Failed to load users", err);
      showSnackbar("Error loading users data", "error");
    }
  };

  // ============================================
  // LEAVE MANAGEMENT FUNCTIONS - FIXED ROLE-BASED DATA CONTROL
  // ============================================
  const fetchLeaves = async () => {
    if (!currentUserCompanyId) {
      return;
    }
    
    setLoading(true);
    try {
      // FIXED: Use the correct endpoint based on user role
      let endpoint = '';
      
      if (isOwner) {
        // Owner can see all leaves in the company
        endpoint = '/leaves/all';
        console.log("👑 Owner - fetching all company leaves");
      } else {
        // Employees see leaves from their department only
        // Using department filter endpoint or adding department param
        endpoint = '/leaves/all'; // Keep same endpoint but add department filter
        console.log("👤 Employee - fetching department leaves only");
      }
      
      const params = new URLSearchParams();
      
      // Always add company ID to all requests
      params.append('company', currentUserCompanyId);
      
      // FIXED: For non-owners, force filter by their department
      if (!isOwner) {
        if (currentUserDepartment) {
          console.log("📊 Filtering leaves by department:", currentUserDepartment);
          params.append('department', currentUserDepartment);
        } else {
          console.warn("⚠️ No department found for non-owner user");
          showSnackbar("Department information missing", "warning");
          setLoading(false);
          return;
        }
      } else {
        // For owners, apply department filter only if selected
        if (departmentFilter && departmentFilter !== 'all') {
          params.append('department', departmentFilter);
        }
      }
      
      // Add other filters
      if (filterDate) params.append('date', filterDate);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (leaveTypeFilter !== 'all') params.append('type', leaveTypeFilter);
      
      if (params.toString()) endpoint += `?${params}`;
      
      console.log("🌐 Fetching leaves from:", endpoint);
      const res = await axios.get(endpoint);
      
      let data = [];
      if (res.data && res.data.data && res.data.data.leaves) {
        data = res.data.data.leaves;
      } else if (res.data && res.data.leaves) {
        data = res.data.leaves;
      } else if (res.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && res.data.success && res.data.message && Array.isArray(res.data.message)) {
        data = res.data.message;
      }
      
      console.log(`✅ Fetched ${data.length} leaves`);
      
      // FIXED: For non-owners, double-check filtering by department (safety net)
      if (!isOwner && currentUserDepartment) {
        const beforeFilter = data.length;
        data = data.filter(leave => {
          const leaveDept = leave.user?.department?._id || leave.user?.department || leave.department;
          return leaveDept === currentUserDepartment;
        });
        
        if (data.length !== beforeFilter) {
          console.log(`🔒 Filtered out ${beforeFilter - data.length} leaves from other departments`);
        }
      }
      
      setLeaves(data);
      
      const pending = data.filter(l => l.status === 'Pending').length;
      const approved = data.filter(l => l.status === 'Approved').length;
      const rejected = data.filter(l => l.status === 'Rejected').length;
      
      setStats({
        total: data.length,
        pending,
        approved,
        rejected,
      });
      
    } catch (err) {
      console.error("❌ Failed to load leaves", err);
      
      if (err.response?.status === 403) {
        showSnackbar("Access denied - Please contact administrator", "error");
      } else if (err.response?.status === 404) {
        showSnackbar("No leaves found", "info");
      } else {
        showSnackbar("Error loading leave data", "error");
      }
      
      setLeaves([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PERMISSION CHECK FUNCTIONS - UPDATED
  // ============================================
  const canModifyLeave = (leaveUserId, leaveStatus) => {
    // Owner can modify any leave
    if (isOwner) return true;
    
    // Admin, HR, Manager can modify any leave in their scope
    if (isAdmin || isHR || isManager) return true;
    
    return false;
  };

  // UPDATED: Delete permission now matches approve permission
  const canDeleteLeave = (leaveUserId, leaveStatus) => {
    // Owner can delete any leave
    if (isOwner) return true;
    
    // Admin, HR, Manager can delete any leave in their scope
    if (isAdmin || isHR || isManager) return true;
    
    return false;
  };

  const canApproveLeave = (leaveUserId) => {
    // Owner can approve any leave
    if (isOwner) return true;
    
    // Admin, HR, Manager can approve any leave in their scope
    if (isAdmin || isHR || isManager) return true;
    
    return false;
  };

  // ============================================
  // UI HELPER FUNCTIONS
  // ============================================
  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, 4000);
  };

  const clearFilters = () => {
    setFilterDate("");
    setStatusFilter("All");
    setLeaveTypeFilter("all");
    setDepartmentFilter("all");
    setSearchTerm("");
    setSelectedStat("All");
  };

  const exportData = async () => {
    try {
      showSnackbar("Preparing export...", "info");
      
      const params = new URLSearchParams();
      params.append('company', currentUserCompanyId);
      
      // FIXED: For non-owners, force department filter
      if (!isOwner && currentUserDepartment) {
        params.append('department', currentUserDepartment);
      } else if (departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }
      
      if (filterDate) params.append('date', filterDate);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      
      const response = await axios.get(`/leaves/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaves_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar("Export completed successfully", "success");
    } catch (err) {
      console.error("Export failed:", err);
      showSnackbar("Export feature is being implemented", "info");
    }
  };

  const handleStatFilter = (type) => {
    setSelectedStat(prev => (prev === type ? 'All' : type));
    setStatusFilter(type === 'All' ? 'All' : type);
  };

  // ============================================
  // FILTERED LEAVES
  // ============================================
  const filteredLeaves = useMemo(() => {
    let filtered = leaves;

    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (getDepartmentName(leave.user?.department) || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStat !== 'All') {
      filtered = filtered.filter((leave) => leave.status === selectedStat);
    }

    return filtered;
  }, [leaves, searchTerm, selectedStat]);

  const pendingLeaves = useMemo(() => 
    filteredLeaves.filter(leave => leave.status === 'Pending'),
    [filteredLeaves]
  );

  const otherLeaves = useMemo(() => 
    filteredLeaves.filter(leave => leave.status !== 'Pending'),
    [filteredLeaves]
  );

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getLeaveTypeClass = (type) => {
    if (!type) return "";
    const typeLower = type.toLowerCase();
    if (typeLower === 'casual') return 'leave-type-casual';
    if (typeLower === 'sick') return 'leave-type-sick';
    if (typeLower === 'paid') return 'leave-type-paid';
    if (typeLower === 'unpaid') return 'leave-type-unpaid';
    return "";
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    return "";
  };

  const getRowClass = (status) => {
    if (!status) return "";
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'row-pending';
    if (statusLower === 'approved') return 'row-approved';
    if (statusLower === 'rejected') return 'row-rejected';
    return "";
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getWhatsAppLink = (phoneNumber, userName, status, remarks) => {
    if (!phoneNumber) return "#";
    
    const message = `Hello ${userName},\n\nYour leave request has been ${status.toLowerCase()}.\n${remarks ? `Remarks: ${remarks}\n` : ''}\nThank you.`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  // ============================================
  // DIALOG FUNCTIONS
  // ============================================
  const openStatusDialog = (leaveId, newStatus, userEmail, userName, userPhone, userId, currentStatus) => {
    // UPDATED: Check if user has permission to approve/reject
    if (!isOwner && !isAdmin && !isHR && !isManager) {
      showSnackbar(
        "⛔ Access Denied: You don't have permission to update leave status", 
        "error"
      );
      return;
    }
    
    setStatusDialog({
      open: true,
      leaveId,
      newStatus,
      remarks: "",
      userEmail,
      userName,
      userPhone,
      userId,
      currentStatus
    });
  };

  const closeStatusDialog = () => {
    setStatusDialog({
      open: false,
      leaveId: null,
      newStatus: null,
      remarks: "",
      userEmail: "",
      userName: "",
      userPhone: "",
      userId: null,
      currentStatus: ""
    });
  };

  const confirmStatusChange = async () => {
    const { leaveId, newStatus, remarks, userName, userPhone } = statusDialog;
    
    if (!leaveId || !newStatus) {
      showSnackbar("Invalid leave data", "error");
      return;
    }

    try {
      const res = await axios.patch(`/leaves/status/${leaveId}`, {
        status: newStatus,
        remarks
      });
      
      if (res.data.success || res.data.message) {
        showSnackbar(`Leave ${newStatus.toLowerCase()} successfully`, "success");
        
        fetchLeaves();
        closeStatusDialog();
        
        if (userPhone) {
          setTimeout(() => {
            const whatsappLink = getWhatsAppLink(userPhone, userName, newStatus, remarks);
            window.open(whatsappLink, '_blank');
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
      if (err.response?.status === 403) {
        showSnackbar(err.response.data.error || "You don't have permission", "error");
      } else if (err.response?.status === 400) {
        showSnackbar(err.response.data.error || "Invalid status value", "error");
      } else if (err.response?.status === 404) {
        showSnackbar("Leave not found", "error");
      } else {
        showSnackbar("Failed to update leave status", "error");
      }
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      const leave = leaves.find(l => l._id === leaveId);
      if (!leave) return;
      
      // UPDATED: Check if user has permission to delete
      if (!isOwner && !isAdmin && !isHR && !isManager) {
        showSnackbar(
          "⛔ Access Denied: You don't have permission to delete leave requests", 
          "error"
        );
        setDeleteDialog(null);
        return;
      }
      
      const res = await axios.delete(`/leaves/${leaveId}`);
      
      if (res.data.success || res.data.message) {
        showSnackbar("Leave deleted successfully", "success");
        fetchLeaves();
        setDeleteDialog(null);
      }
    } catch (err) {
      console.error("Failed to delete leave", err);
      if (err.response?.status === 403) {
        showSnackbar(err.response.data.error || "Permission denied", "error");
      } else {
        showSnackbar("Failed to delete leave", "error");
      }
    }
  };

  const openHistoryDialog = (leave) => {
    const history = leave.history || [];
    setHistoryDialog({
      open: true,
      title: `${leave.user?.name || 'Employee'} — ${leave.type} Leave`,
      items: history.length > 0 ? history : [
        {
          action: leave.status || 'Pending',
          from: 'N/A',
          to: leave.status || 'Pending',
          by: leave.approvedBy || 'System',
          byName: leave.approvedByName || 'System',
          byRole: 'System',
          at: leave.updatedAt || leave.createdAt,
          remarks: leave.remarks || '',
        }
      ],
    });
  };

  const closeHistoryDialog = () => {
    setHistoryDialog({
      open: false,
      title: "",
      items: [],
    });
  };

  const normalizeRole = (role) => {
    if (!role) return 'Employee';
    const r = role.toLowerCase();
    if (r === 'hr') return 'HR Manager';
    if (r === 'admin') return 'Administrator';
    if (r === 'superadmin') return 'Super Admin';
    if (r === 'manager') return 'Team Manager';
    if (r === 'owner') return 'Company Owner';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getUserNameById = (userId) => {
    if (!userId) return "System";
    
    if (typeof userId === "object" && userId.name) {
      return userId.name;
    }

    const user = allUsers.find(
      (u) => u._id === userId || u.id === userId
    );

    return user ? user.name : userId;
  };

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // COMPONENTS
  // ============================================
  const RoleBadge = () => {
    if (!currentUserRole) return null;
    
    let badgeClass = 'role-badge';
    let icon = <FiUser size={12} />;
    
    if (isOwner) {
      badgeClass += ' role-badge-owner';
      icon = <FiShield size={12} />;
    } else if (isAdmin) {
      badgeClass += ' role-badge-admin';
      icon = <FiShield size={12} />;
    } else if (isHR) {
      badgeClass += ' role-badge-hr';
    } else if (isManager) {
      badgeClass += ' role-badge-manager';
    }
    
    return (
      <span className={badgeClass}>
        {icon}
        {normalizeRole(currentUserRole)}
      </span>
    );
  };

  // ============================================
  // LEAVE DETAILS MODAL
  // ============================================
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    leave: null
  });

  const openDetailsModal = (leave) => {
    setDetailsModal({
      open: true,
      leave
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      open: false,
      leave: null
    });
  };

  const LeaveDetailsModal = ({ leave, onClose }) => {
    if (!leave) return null;

    const days = calculateDays(leave.startDate, leave.endDate);
    const createdDate = leave.createdAt ? formatDateTime(leave.createdAt) : "N/A";
    const updatedDate = leave.updatedAt ? formatDateTime(leave.updatedAt) : "N/A";
    const departmentName = getDepartmentName(leave.user?.department);

    return (
      <div className="dialog-overlay" onClick={onClose}>
        <div className="dialog-content details-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div className="dialog-header-left">
              <FiFileText size={24} color="#1976d2" />
              <h3>Leave Request Details</h3>
            </div>
            <button className="dialog-close" onClick={onClose}>
              <FiX size={20} />
            </button>
          </div>
          
          <div className="dialog-body">
            {/* Status Banner */}
            <div className={`details-status-banner status-${leave.status?.toLowerCase() || 'pending'}`}>
              <FiInfo size={20} />
              <span>This leave request is <strong>{leave.status || 'Pending'}</strong></span>
            </div>

            {/* Two Column Layout */}
            <div className="details-grid-container">
              {/* Left Column */}
              <div className="details-column">
                {/* Employee Information Card */}
                <div className="details-card employee-card">
                  <div className="card-header">
                    <FiUserCheck size={18} color="#1976d2" />
                    <h4>Employee Information</h4>
                  </div>
                  <div className="card-content">
                    <div className="employee-profile">
                      <div className="profile-avatar">
                        {getInitials(leave.user?.name)}
                      </div>
                      <div className="profile-info">
                        <div className="profile-name">{leave.user?.name || "N/A"}</div>
                        <div className="profile-email">{leave.user?.email || "N/A"}</div>
                      </div>
                    </div>
                    
                    <div className="info-rows">
                      <div className="info-row">
                        <FiMail size={14} className="info-icon" />
                        <span className="info-label">Email:</span>
                        <span className="info-value">{leave.user?.email || "N/A"}</span>
                      </div>
                      {leave.user?.phone && (
                        <div className="info-row">
                          <FiPhone size={14} className="info-icon" />
                          <span className="info-label">Phone:</span>
                          <span className="info-value">
                            <a 
                              href={getWhatsAppLink(
                                leave.user.phone, 
                                leave.user.name, 
                                leave.status, 
                                leave.remarks
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {leave.user.phone}
                            </a>
                          </span>
                        </div>
                      )}
                      {departmentName && (
                        <div className="info-row">
                          <FiHome size={14} className="info-icon" />
                          <span className="info-label">Department:</span>
                          <span className="info-value">
                            <span className="department-tag">
                              {departmentName}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Leave Information Card */}
                <div className="details-card leave-card">
                  <div className="card-header">
                    <FiCalendarIcon size={18} color="#1976d2" />
                    <h4>Leave Information</h4>
                  </div>
                  <div className="card-content">
                    <div className="info-grid">
                      <div className="grid-item">
                        <span className="grid-label">Leave Type</span>
                        <span className={`leave-type-badge ${getLeaveTypeClass(leave.type)}`}>
                          {leave.type || "N/A"}
                        </span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">Status</span>
                        <span className={`status-badge ${getStatusClass(leave.status)}`}>
                          {leave.status || "Pending"}
                        </span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">Start Date</span>
                        <span className="grid-value">{formatDate(leave.startDate)}</span>
                      </div>
                      <div className="grid-item">
                        <span className="grid-label">End Date</span>
                        <span className="grid-value">{formatDate(leave.endDate)}</span>
                      </div>
                      <div className="grid-item full-width">
                        <span className="grid-label">Duration</span>
                        <span className="duration-badge">
                          <FiClock size={14} />
                          {days} {days > 1 ? 'Calendar Days' : 'Calendar Day'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="details-column">
                {/* Reason Card */}
                <div className="details-card reason-card">
                  <div className="card-header">
                    <FiMessageSquare size={18} color="#1976d2" />
                    <h4>Reason for Leave</h4>
                  </div>
                  <div className="card-content">
                    <div className="reason-box">
                      {leave.reason || "No reason provided"}
                    </div>
                  </div>
                </div>

                {/* Admin Remarks Card (if any) */}
                {leave.remarks && (
                  <div className="details-card remarks-card">
                    <div className="card-header">
                      <FiAlertCircle size={18} color="#1976d2" />
                      <h4>Admin Remarks</h4>
                    </div>
                    <div className="card-content">
                      <div className="remarks-box">
                        {leave.remarks}
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Information Card (if not pending) */}
                {leave.status !== 'Pending' && (
                  <div className="details-card approval-card">
                    <div className="card-header">
                      <FiCheckSquare size={18} color="#1976d2" />
                      <h4>Decision Information</h4>
                    </div>
                    <div className="card-content">
                      <div className="info-rows">
                        <div className="info-row">
                          <FiUser size={14} className="info-icon" />
                          <span className="info-label">Decision By:</span>
                          <span className="info-value">
                            {leave.approvedBy?.name || leave.approvedBy || "System"}
                          </span>
                        </div>
                        {leave.approvedBy?.role && (
                          <div className="info-row">
                            <FiShield size={14} className="info-icon" />
                            <span className="info-label">Role:</span>
                            <span className="info-value">{normalizeRole(leave.approvedBy.role)}</span>
                          </div>
                        )}
                        <div className="info-row">
                          <FiClockIcon size={14} className="info-icon" />
                          <span className="info-label">Decision At:</span>
                          <span className="info-value">{formatDateTime(leave.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps Card */}
                <div className="details-card timestamps-card">
                  <div className="card-header">
                    <FiClock size={18} color="#1976d2" />
                    <h4>Timestamps</h4>
                  </div>
                  <div className="card-content">
                    <div className="info-rows">
                      <div className="info-row">
                        <FiCalendar size={14} className="info-icon" />
                        <span className="info-label">Created:</span>
                        <span className="info-value">{createdDate}</span>
                      </div>
                      <div className="info-row">
                        <FiRefreshCw size={14} className="info-icon" />
                        <span className="info-label">Last Updated:</span>
                        <span className="info-value">{updatedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dialog-footer">
            <button className="btn btn-outlined" onClick={onClose}>
              Close
            </button>
            {leave.status === 'Pending' && (isOwner || isAdmin || isHR || isManager) && (
              <div className="footer-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    onClose();
                    openStatusDialog(
                      leave._id,
                      'Approved',
                      leave.user?.email,
                      leave.user?.name,
                      leave.user?.phone,
                      leave.user?._id,
                      leave.status
                    );
                  }}
                >
                  <FiCheckCircle size={16} />
                  Approve
                </button>
                <button 
                  className="btn btn-error"
                  onClick={() => {
                    onClose();
                    openStatusDialog(
                      leave._id,
                      'Rejected',
                      leave.user?.email,
                      leave.user?.name,
                      leave.user?.phone,
                      leave.user?._id,
                      leave.status
                    );
                  }}
                >
                  <FiXCircle size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER TABLE
  // ============================================
  const renderLeaveTable = (title, leavesData, showStatusColumn = true) => (
    <div className="leaves-table-container">
      <div className="table-header">
        <h3 className="table-title">
          {title} ({leavesData.length})
          {title === 'Pending Leaves' && permissions.canApproveLeaves && (
            <span className="action-required-badge">Action Required</span>
          )}
        </h3>
        {/* <div className="company-badge">
          <FiBriefcase size={14} />
          {companyName || currentUserCompanyId?.substring(0, 8) + '...' || 'Company'}
        </div> */}
      </div>
      
      <div className="table-responsive">
        <table className="leaves-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Leave Details</th>
              <th>Duration</th>
              {showStatusColumn && <th>Status</th>}
              <th>Actioned By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leavesData.length ? (
              leavesData.map((leave) => {
                const days = calculateDays(leave.startDate, leave.endDate);
                const userId = leave.user?._id || leave.user;
                const isOwnLeave = userId === currentUserId;
                const departmentName = getDepartmentName(leave.user?.department);
                
                // Check if user has permission to modify this leave
                const hasModifyPermission = isOwner || isAdmin || isHR || isManager;
                
                // Truncate reason for preview
                const reasonPreview = leave.reason 
                  ? leave.reason.length > 40 
                    ? `${leave.reason.substring(0, 40)}...` 
                    : leave.reason
                  : "No reason provided";
                
                return (
                  <tr key={leave._id} className={`${getRowClass(leave.status)} ${isOwnLeave ? 'own-leave-row' : ''}`}>
                    <td data-show-on-mobile="true">
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {getInitials(leave.user?.name)}
                          {isOwnLeave && <span className="self-badge">You</span>}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">
                            {leave.user?.name || "N/A"}
                          </div>
                          <div className="employee-email">
                            <FiMail size={12} />
                            {leave.user?.email || "N/A"}
                          </div>
                          {leave.user?.phone && (
                            <div className="employee-phone">
                              <FiPhone size={12} />
                              <a 
                                href={getWhatsAppLink(
                                  leave.user.phone, 
                                  leave.user.name, 
                                  leave.status, 
                                  leave.remarks
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {leave.user.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td data-show-on-mobile="false">
                      {/* Department column - hidden on mobile */}
                      {departmentName ? (
                        <div className="department-info">
                          <FiHome size={14} />
                          {departmentName}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td data-show-on-mobile="true">
                      <div className="leave-details">
                        <div className="leave-type-wrapper">
                          <span className={`leave-type-chip ${getLeaveTypeClass(leave.type)}`}>
                            {leave.type || "N/A"}
                          </span>
                        </div>
                        
                        {/* HIDE REASON PREVIEW ON MOBILE - ADD HIDDEN CLASS */}
                        <div className="leave-reason-preview hide-mobile" title={leave.reason || ""}>
                          {reasonPreview}
                        </div>
                        
                        {/* VIEW DETAILS BUTTON - ALWAYS VISIBLE */}
                        <button 
                          className="view-details-button"
                          onClick={() => openDetailsModal(leave)}
                        >
                          <FiEye size={16} />
                          View Full Details
                        </button>

                        {/* QUICK ACTION BUTTONS FOR PENDING LEAVES - FOR USERS WITH PERMISSION */}
                        {leave.status === 'Pending' && hasModifyPermission && (
                          <div className="actions-container" style={{ marginTop: '12px' }}>
                            <button
                              className="action-icon-button approve"
                              onClick={() => openStatusDialog(
                                leave._id, 
                                'Approved', 
                                leave.user?.email,
                                leave.user?.name,
                                leave.user?.phone,
                                userId,
                                leave.status
                              )}
                              title="Approve Leave"
                            >
                              <FiCheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              className="action-icon-button reject"
                              onClick={() => openStatusDialog(
                                leave._id, 
                                'Rejected', 
                                leave.user?.email,
                                leave.user?.name,
                                leave.user?.phone,
                                userId,
                                leave.status
                              )}
                              title="Reject Leave"
                            >
                              <FiXCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-show-on-mobile="false">
                      {/* Duration column - hidden on mobile */}
                      <div className="duration-info">
                        <div className="date-range">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="date-separator">→</div>
                        <div className="date-range">
                          {formatDate(leave.endDate)}
                        </div>
                        <div className="days-badge">
                          <FiClock size={12} />
                          {days} {days > 1 ? 'days' : 'day'}
                        </div>
                      </div>
                    </td>
                    {showStatusColumn && (
                      <td data-show-on-mobile="false">
                        <span className={`status-chip ${getStatusClass(leave.status)}`}>
                          {leave.status || "Pending"}
                        </span>
                      </td>
                    )}
                    <td data-show-on-mobile="false">
                      <div className="approved-by">
                        {leave.approvedBy?.name || leave.approvedBy || "-"}
                        {leave.approvedBy?.role && (
                          <span className="approver-role">
                            ({normalizeRole(leave.approvedBy.role)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-show-on-mobile="false">
                      <div className="actions-container">
                        <button 
                          className="action-icon-button view-history"
                          onClick={() => openHistoryDialog(leave)}
                          title="View History"
                        >
                          <FiList size={16} />
                        </button>
                        
                        {/* UPDATED: Show approve/reject buttons for users with permission */}
                        {leave.status === 'Pending' && hasModifyPermission && (
                          <>
                            <button
                              className="action-icon-button approve"
                              onClick={() => openStatusDialog(
                                leave._id, 
                                'Approved', 
                                leave.user?.email,
                                leave.user?.name,
                                leave.user?.phone,
                                userId,
                                leave.status
                              )}
                              title="Approve Leave"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                            <button
                              className="action-icon-button reject"
                              onClick={() => openStatusDialog(
                                leave._id, 
                                'Rejected', 
                                leave.user?.email,
                                leave.user?.name,
                                leave.user?.phone,
                                userId,
                                leave.status
                              )}
                              title="Reject Leave"
                            >
                              <FiXCircle size={16} />
                            </button>
                          </>
                        )}
                        
                        {/* UPDATED: Show delete button for users with permission (same as approve/reject) */}
                        {hasModifyPermission && (
                          <button 
                            className="action-icon-button delete"
                            onClick={() => setDeleteDialog(leave._id)}
                            title="Delete Leave"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                        
                        {/* Show lock icon for users without permission */}
                        {!hasModifyPermission && leave.status === 'Pending' && (
                          <span className="no-permission" title="You don't have permission to modify leaves">
                            <FiLock size={14} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showStatusColumn ? 7 : 6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FiCalendar size={48} />
                    </div>
                    <h4 className="empty-state-title">No Leave Requests Found</h4>
                    <p className="empty-state-text">
                      {title === 'Pending Leaves' 
                        ? 'No pending leave requests requiring action'
                        : 'Try adjusting your filters or search criteria'
                      }
                    </p>
                    <button 
                      className="btn btn-contained"
                      onClick={fetchLeaves}
                    >
                      Refresh Data
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && leaves.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading leave data...</p>
        {currentUserRole && (
          <span className="loading-role">Role: {normalizeRole(currentUserRole)}</span>
        )}
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="employee-leaves">
      {/* Header */}
      <div className="leaves-header">
        <div>
          <h1 className="leaves-title">
            Leave Management
          </h1>
          <p className="leaves-subtitle">
            {isOwner 
              ? "Review and manage employee leave requests with full access"
              : isAdmin || isHR || isManager
              ? "Review and manage employee leave requests"
              : "View all leave requests"
            }
            <RoleBadge />
            
            {!isOwner && !isAdmin && !isHR && !isManager && (
              <span className="view-only-badge">
                <FiEyeOff size={14} />
                View Only
              </span>
            )}
          </p>
        </div>

        {/* Action Bar */}
        <div className="header-actions">
          <button 
            className="action-button"
            onClick={fetchLeaves}
            title="Refresh Data"
            disabled={loading}
          >
            <FiRefreshCw size={20} className={loading ? 'spinning' : ''} />
          </button>
          
          <button 
            className="action-button"
            onClick={exportData}
            title="Export Report"
          >
            <FiDownload size={20} />
          </button>
          
          <div className="stats-summary">
            <span className="stat-item pending">
              <FiClock /> {stats.pending}
            </span>
            <span className="stat-item approved">
              <FiCheckCircle /> {stats.approved}
            </span>
            <span className="stat-item rejected">
              <FiXCircle /> {stats.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Permission Banner - Show for users with modify permissions */}
      {(isAdmin || isHR || isManager) && !isOwner && (
        <div className="permission-info-banner">
          <div className="info-content">
            <FiShield size={20} color="#1976d2" />
            <div className="info-text">
              <strong>✅ You have management permissions</strong>
              <p>You can approve, reject, and delete leave requests in your department.</p>
            </div>
          </div>
        </div>
      )}

      {/* Owner Warning Banner - Show for view-only users */}
      {!isOwner && !isAdmin && !isHR && !isManager && (
        <div className="owner-warning-banner">
          <div className="warning-content">
            <FiLock size={20} />
            <div className="warning-text">
              <strong>🔒 View Only Mode</strong>
              <p>You are viewing leaves from your department only. Only managers can approve/reject requests.</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Info Banner - Show for non-owners */}
      {!isOwner && currentUserDepartment && (
        <div className="department-info-banner">
          <div className="info-content">
            {/* <FiHome size={20} /> */}
            <div className="info-text">
              <strong>🏢 Your Department: {getDepartmentName(currentUserDepartment)}</strong>
              <p>Showing leave requests only from your department</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter size={20} color="#1976d2" />
          <h3>Filters & Search</h3>
          {isOwner && departmentFilter !== 'all' && (
            <span className="owner-filter-badge">
              <FiEye size={14} />
              Filtering: {departments.find(d => (d._id || d.id) === departmentFilter)?.name || departmentFilter}
            </span>
          )}
          {loadingDepartments && <span className="loading-badge">Loading departments...</span>}
        </div>
        
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Date</label>
            <input
              type="date"
              className="filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <StatusFilter
              selected={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Leave Type</label>
            <LeaveTypeFilter
              selected={leaveTypeFilter}
              onChange={setLeaveTypeFilter}
            />
          </div>
          
          {/* FIXED: Only show department filter for owners */}
          {isOwner && (
            <div className="filter-group">
              <label className="filter-label">Department</label>
              <DepartmentFilter
                selected={departmentFilter}
                onChange={setDepartmentFilter}
                departments={departments}
              />
            </div>
          )}
          
          <div className="filter-group search-group">
            <label className="filter-label">Search</label>
            <div className="search-input-wrapper">
              <FiSearch size={18} className="search-icon" />
              <input
                type="text"
                className="filter-input search-input"
                placeholder="Search by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="btn btn-outlined"
              onClick={clearFilters}
              disabled={loading}
            >
              Clear All
            </button>
            <button 
              className="btn btn-contained"
              onClick={fetchLeaves}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
     {/* Stat Cards - Only show cards with count > 0 */}
<div className="stats-container">
  {[
    { 
      label: "Total Leaves", 
      count: stats.total, 
      type: "All", 
      icon: <FiUsersIcon />,
      color: "primary"
    },
    { 
      label: "Pending", 
      count: stats.pending, 
      type: "Pending", 
      icon: <FiClock />,
      color: "warning"
    },
    { 
      label: "Approved", 
      count: stats.approved, 
      type: "Approved", 
      icon: <FiCheckCircle />,
      color: "success"
    },
    { 
      label: "Rejected", 
      count: stats.rejected, 
      type: "Rejected", 
      icon: <FiXCircle />,
      color: "error"
    },
  ]
    .filter(stat => stat.count > 0) // ✅ FILTER: Only show cards with count > 0
    .map((stat) => (
      <div 
        key={stat.type}
        className={`stat-card stat-${stat.color} ${selectedStat === stat.type ? 'active' : ''}`}
        onClick={() => handleStatFilter(stat.type)}
      >
        <div className="stat-content">
          <div className={`stat-icon stat-icon-${stat.color}`}>
            {stat.icon}
          </div>
          <div className="stat-info">
            <div className="stat-value">{stat.count}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      </div>
    ))}
</div>

      {/* Two Sections: Pending Leaves and Other Leaves */}
      <div className="leaves-sections-container">
        {/* Pending Leaves Section */}
        {pendingLeaves.length > 0 && (
          <div className="leaves-section pending-section">
            <div className="section-header">
              <h2 className="section-title">
                <FiAlertCircle size={20} color="#f57c00" />
                Pending Leaves Requiring Action
                {permissions.canApproveLeaves && (
                  <span className="action-badge">Needs Approval</span>
                )}
              </h2>
              <span className="section-badge">{pendingLeaves.length} pending</span>
            </div>
            {renderLeaveTable("Pending Leaves", pendingLeaves, true)}
          </div>
        )}

        {/* Other Leaves Section */}
        <div className="leaves-section">
          <div className="section-header">
            <h2 className="section-title">
              <FiList size={20} color="#1976d2" />
              All Other Leaves
            </h2>
            <span className="section-badge">{otherLeaves.length} total</span>
          </div>
          {renderLeaveTable("All Leaves", otherLeaves, false)}
        </div>
      </div>

      {/* ======================================== */}
      {/* LEAVE DETAILS MODAL */}
      {/* ======================================== */}
      {detailsModal.open && (
        <LeaveDetailsModal 
          leave={detailsModal.leave} 
          onClose={closeDetailsModal} 
        />
      )}

      {/* ======================================== */}
      {/* STATUS UPDATE DIALOG */}
      {/* ======================================== */}
      {statusDialog.open && (
        <div className="dialog-overlay" onClick={closeStatusDialog}>
          <div className="dialog-content status-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>
                {statusDialog.newStatus === 'Approved' ? (
                  <>✅ Approve Leave</>
                ) : (
                  <>❌ Reject Leave</>
                )}
              </h3>
              <button className="dialog-close" onClick={closeStatusDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="user-info-compact">
                <div className="user-avatar medium">
                  {getInitials(statusDialog.userName)}
                </div>
                <div className="user-details">
                  <h4>{statusDialog.userName}</h4>
                  <p>{statusDialog.userEmail}</p>
                  {statusDialog.userPhone && (
                    <p className="user-phone">{statusDialog.userPhone}</p>
                  )}
                </div>
              </div>
              
              <div className="status-change-info">
                <div className="status-badge current">
                  Current: {statusDialog.currentStatus || 'Pending'}
                </div>
                <FiArrowRight size={16} />
                <div className={`status-badge new status-${statusDialog.newStatus?.toLowerCase()}`}>
                  New: {statusDialog.newStatus}
                </div>
              </div>
              
              <div className="remarks-section">
                <label>Remarks <span className="optional">(Optional)</span></label>
                <textarea
                  className="remarks-input"
                  value={statusDialog.remarks}
                  onChange={(e) => setStatusDialog(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder={`Add remarks for ${statusDialog.newStatus?.toLowerCase()}...`}
                  rows="3"
                  autoFocus
                />
              </div>
              
              <div className="notification-info">
                <FiPhone size={16} />
                <span>
                  {statusDialog.userPhone 
                    ? `WhatsApp notification will be sent`
                    : `No phone number available`
                  }
                </span>
              </div>
            </div>
            
            <div className="dialog-footer">
              <button className="btn btn-outlined" onClick={closeStatusDialog}>
                Cancel
              </button>
              <button 
                className={`btn btn-${statusDialog.newStatus === 'Approved' ? 'success' : 'error'}`}
                onClick={confirmStatusChange}
              >
                <FiSave size={16} />
                Confirm {statusDialog.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ======================================== */}
      {deleteDialog && (
        <div className="dialog-overlay" onClick={() => setDeleteDialog(null)}>
          <div className="dialog-content delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Delete Leave Request</h3>
              <button className="dialog-close" onClick={() => setDeleteDialog(null)}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="warning-icon">
                <FiAlertCircle size={48} color="#f57c00" />
              </div>
              <h4>Are you sure?</h4>
              <p>
                This will permanently delete the leave request. 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="dialog-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteDialog(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={() => handleDeleteLeave(deleteDialog)}
              >
                <FiTrash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* HISTORY DIALOG */}
      {/* ======================================== */}
      {historyDialog.open && (
        <div className="dialog-overlay" onClick={closeHistoryDialog}>
          <div className="dialog-content history-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Leave History</h3>
              <button className="dialog-close" onClick={closeHistoryDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="history-title">
                <h4>{historyDialog.title}</h4>
              </div>
              
              <div className="history-timeline">
                {historyDialog.items.length > 0 ? (
                  historyDialog.items.map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="history-item-header">
                        <span className={`history-action status-${item.action?.toLowerCase() || 'pending'}`}>
                          {item.action || 'Updated'}
                        </span>
                        <span className="history-date">
                          {formatHistoryDate(item.at)}
                        </span>
                      </div>
                      <div className="history-item-body">
                        {item.from && item.to && item.from !== item.to && (
                          <div className="history-status-change">
                            <span className="status-badge from">{item.from}</span>
                            <FiArrowRight size={12} />
                            <span className="status-badge to">{item.to}</span>
                          </div>
                        )}
                        <div className="history-by">
                          <strong>By:</strong> {item.byName || getUserNameById(item.by)}
                          {item.byRole && (
                            <span className="history-role">({normalizeRole(item.byRole)})</span>
                          )}
                        </div>
                        {item.remarks && (
                          <div className="history-remarks">
                            <strong>Remarks:</strong> {item.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-history">
                    <FiList size={32} />
                    <p>No history available for this leave request.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="dialog-footer">
              <button className="btn btn-contained" onClick={closeHistoryDialog}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* SNACKBAR */}
      {/* ======================================== */}
      {snackbar.open && (
        <div className="snackbar">
          <div className={`snackbar-content snackbar-${snackbar.type}`}>
            {snackbar.type === "success" && <FiCheckCircle size={20} />}
            {snackbar.type === "error" && <FiXCircle size={20} />}
            {snackbar.type === "info" && <FiAlertCircle size={20} />}
            {snackbar.type === "warning" && <FiAlertCircle size={20} />}
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;