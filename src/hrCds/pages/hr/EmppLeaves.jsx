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
  FiEyeOff
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

// ✅ Department Filter Component - NEW
const DepartmentFilter = ({ selected, onChange, departments = [] }) => {
  return (
    <select
      className="filter-select"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Departments</option>
      {departments.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
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
  
  // 🔥 User Role Related States
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUserDepartment, setCurrentUserDepartment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserCompanyId, setCurrentUserCompanyId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // 🔥 Permission States
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
      fetchDepartments();
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
      console.log("👤 Current user from localStorage:", user);
      
      const userId = user._id || user.id || '';
      const companyId = user.company || user.companyId || '';
      const department = user.department || '';
      const name = user.name || user.username || 'User';
      let role = '';
      
      // Check for companyRole
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
      
      // Set role flags
      const isOwnerRole = role === 'Owner' || role === 'owner' || role === 'OWNER';
      const isAdminRole = role === 'Admin' || role === 'admin' || role === 'ADMIN';
      const isHRRole = role === 'HR' || role === 'hr' || role === 'Hr';
      const isManagerRole = role === 'Manager' || role === 'manager' || role === 'MANAGER';
      
      setIsOwner(isOwnerRole);
      setIsAdmin(isAdminRole);
      setIsHR(isHRRole);
      setIsManager(isManagerRole);
      
      // Set permissions based on role
      setPermissions({
        canViewAllLeaves: isOwnerRole || isAdminRole || isHRRole,
        canApproveLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole,
        canDeleteLeaves: isOwnerRole || isAdminRole || isHRRole,
        canExportData: isOwnerRole || isAdminRole || isHRRole,
        canViewHistory: true
      });
      
      console.log("👤 User details:", {
        userId,
        companyId,
        department,
        role,
        isOwner: isOwnerRole,
        isAdmin: isAdminRole,
        isHR: isHRRole,
        isManager: isManagerRole,
        permissions: {
          canViewAllLeaves: isOwnerRole || isAdminRole || isHRRole,
          canApproveLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole,
          canDeleteLeaves: isOwnerRole || isAdminRole || isHRRole
        }
      });
      
      // If role is not found in localStorage, fetch from API
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
        
        setPermissions({
          canViewAllLeaves: isOwnerRole || isAdminRole || isHRRole,
          canApproveLeaves: isOwnerRole || isAdminRole || isHRRole || isManagerRole,
          canDeleteLeaves: isOwnerRole || isAdminRole || isHRRole,
          canExportData: isOwnerRole || isAdminRole || isHRRole,
          canViewHistory: true
        });
        
        console.log("👑 Fetched role from API:", userRole);
      }
    } catch (err) {
      console.error("Failed to fetch user role:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Get unique departments from allUsers
      const depts = [...new Set(allUsers
        .map(user => user.department)
        .filter(dept => dept && dept.trim() !== '')
      )];
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      console.log("🔄 Fetching users...");
      console.log("👑 Is Owner:", isOwner);
      
      let endpoint = '';
      if (isOwner || isAdmin || isHR) {
        endpoint = '/users/company-users';
        console.log("🏢 Using company-users endpoint");
      } else {
        endpoint = '/users/department-users';
        console.log("🏢 Using department-users endpoint");
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
      
      console.log(`✅ Found ${usersData.length} users`);
      setAllUsers(usersData);
      
      // Extract unique departments
      const depts = [...new Set(usersData
        .map(user => user.department)
        .filter(dept => dept && dept.trim() !== '')
      )];
      setDepartments(depts);
      
    } catch (err) {
      console.error("❌ Failed to load users", err);
      showSnackbar("Error loading users data", "error");
    }
  };

  // ============================================
  // LEAVE MANAGEMENT FUNCTIONS
  // ============================================
  const fetchLeaves = async () => {
    if (!currentUserCompanyId) {
      console.log("⚠️ No company ID, waiting for company data...");
      return;
    }
    
    setLoading(true);
    try {
      let url = '/leaves/all';
      const params = new URLSearchParams();
      
      params.append('company', currentUserCompanyId);
      
      if (filterDate) params.append('date', filterDate);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (leaveTypeFilter !== 'all') params.append('type', leaveTypeFilter);
      
      // 🔥 Department filter - only for managers/non-admins
      if (!isOwner && !isAdmin && !isHR && currentUserDepartment) {
        params.append('department', currentUserDepartment);
        console.log("🏢 Filtering by department:", currentUserDepartment);
      } else if (departmentFilter && departmentFilter !== 'all') {
        params.append('department', departmentFilter);
        console.log("🏢 Filtering by selected department:", departmentFilter);
      }
      
      if (params.toString()) url += `?${params}`;
      
      console.log("🌐 Fetching leaves from:", url);
      console.log("👑 Role:", currentUserRole);
      
      const res = await axios.get(url);
      console.log("✅ Leaves API response:", res.data);
      
      let data = [];
      if (res.data && res.data.data && res.data.data.leaves) {
        data = res.data.data.leaves;
      } else if (res.data && res.data.leaves) {
        data = res.data.leaves;
      } else if (res.data && Array.isArray(res.data)) {
        data = res.data;
      }
      
      console.log(`📊 Found ${data.length} leaves`);
      
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
  // PERMISSION CHECK FUNCTIONS
  // ============================================
 // ============================================
// PERMISSION CHECK FUNCTIONS - ONLY OWNER CAN UPDATE/DELETE
// ============================================

/**
 * Check if user can modify leave status (Approve/Reject)
 * RULE: ONLY OWNER can update any leave status
 */
const canModifyLeave = (leaveUserId, leaveStatus) => {
  // ✅ ONLY OWNER can update status
  return isOwner === true;
};

/**
 * Check if user can delete a leave
 * RULE: ONLY OWNER can delete any leave
 */
const canDeleteLeave = (leaveUserId, leaveStatus) => {
  // ✅ ONLY OWNER can delete leaves
  return isOwner === true;
};

/**
 * Check if user can approve/reject a leave
 * RULE: ONLY OWNER can approve/reject leaves
 */
const canApproveLeave = (leaveUserId) => {
  // ✅ ONLY OWNER can approve/reject leaves
  return isOwner === true;
};

/**
 * Get permission message for non-owners
 */
const getPermissionMessage = () => {
  if (!isOwner) {
    return "Only Company Owner can update or delete leave requests";
  }
  return null;
};



  // ============================================
  // UI HELPER FUNCTIONS
  // ============================================
  const showSnackbar = (message, type = "success") => {
    console.log(`🍿 Snackbar: ${type} - ${message}`);
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
      if (filterDate) params.append('date', filterDate);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      
      const response = await axios.get(`/leaves/export?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
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
          leave.user?.department?.toLowerCase().includes(searchTerm.toLowerCase())
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
// ============================================
// OPEN STATUS DIALOG - WITH OWNER CHECK
// ============================================
const openStatusDialog = (leaveId, newStatus, userEmail, userName, userPhone, userId, currentStatus) => {
  // 🔥 CRITICAL: Only Owner can update status
  if (!isOwner) {
    showSnackbar(
      "⛔ Access Denied: Only Company Owner can update leave status", 
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
      console.log("🔄 Updating leave status:", leaveId, newStatus);
      
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

// ============================================
// DELETE LEAVE HANDLER - WITH OWNER CHECK
// ============================================
const handleDeleteLeave = async (leaveId) => {
  try {
    const leave = leaves.find(l => l._id === leaveId);
    if (!leave) return;
    
    // 🔥 CRITICAL: Only Owner can delete leaves
    if (!isOwner) {
      showSnackbar(
        "⛔ Access Denied: Only Company Owner can delete leave requests", 
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
      showSnackbar(err.response.data.error || "Permission denied - Only Owner can delete leaves", "error");
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
  
  // Agar already object me name hai
  if (typeof userId === "object" && userId.name) {
    return userId.name;
  }

  // allUsers se find karo
  const user = allUsers.find(
    (u) => u._id === userId || u.id === userId
  );

  return user ? user.name : userId; // fallback me ID dikha dega
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

  const PermissionBadge = () => {
    if (isOwner) {
      return <span className="permission-badge owner">👑 Full Access (Owner)</span>;
    }
    if (isAdmin) {
      return <span className="permission-badge admin">🛡️ Admin Access</span>;
    }
    if (isHR) {
      return <span className="permission-badge hr">👥 HR Access</span>;
    }
    if (isManager) {
      return <span className="permission-badge manager">📋 Manager Access</span>;
    }
    return null;
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
        <div className="company-badge">
          <FiBriefcase size={14} />
          {currentUserCompanyId ? currentUserCompanyId.substring(0, 8) + '...' : 'Loading...'}
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="leaves-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Leave Details</th>
              <th>Duration</th>
              {showStatusColumn && <th>Status</th>}
              <th>Approved By</th>
              <th>History</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leavesData.length ? (
              leavesData.map((leave) => {
                const days = calculateDays(leave.startDate, leave.endDate);
                const userId = leave.user?._id || leave.user;
                const canUserApprove = canApproveLeave(userId);
                const canUserDelete = canDeleteLeave(userId, leave.status);
                const isOwnLeave = userId === currentUserId;
                
                return (
                  <tr key={leave._id} className={`${getRowClass(leave.status)} ${isOwnLeave ? 'own-leave-row' : ''}`}>
                    <td>
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
                    <td>
                      <div className="department-info">
                        {leave.user?.department || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="leave-details">
                        <div className="leave-type">
                          <span className={`leave-type-chip ${getLeaveTypeClass(leave.type)}`}>
                            {leave.type || "N/A"}
                          </span>
                        </div>
                        <div className="leave-reason">
                          {leave.reason || "No reason provided"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="duration-info">
                        <div className="date-range">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="date-separator">→</div>
                        <div className="date-range">
                          {formatDate(leave.endDate)}
                        </div>
                        <div className="days-badge">
                          {days} {days > 1 ? 'days' : 'day'}
                        </div>
                      </div>
                    </td>
                    {showStatusColumn && (
                      <td>
                        <span className={`status-chip ${getStatusClass(leave.status)}`}>
                          {leave.status || "Pending"}
                        </span>
                      </td>
                    )}
                    <td>
                      <div className="approved-by">
                        {leave.approvedBy?.name || leave.approvedBy || "-"}
                        {leave.approvedBy?.role && (
                          <span className="approver-role">
                            {normalizeRole(leave.approvedBy.role)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-history-button"
                        onClick={() => openHistoryDialog(leave)}
                        title="View History"
                      >
                        <FiList size={14} />
                        <span>History</span>
                      </button>
                    </td>
                  
<td>
  <div className="actions-container">
    {/* STATUS UPDATE BUTTONS - ONLY OWNER */}
    {leave.status === 'Pending' && canApproveLeave(userId) ? (
      <div className="approval-actions">
        <button
          className={`action-approve ${!isOwner ? 'action-disabled' : ''}`}
          onClick={() => isOwner ? openStatusDialog(
            leave._id, 
            'Approved', 
            leave.user?.email,
            leave.user?.name,
            leave.user?.phone,
            userId,
            leave.status
          ) : null}
          title={isOwner ? "Approve Leave" : "Only Owner can approve"}
          disabled={!isOwner}
        >
          <FiCheckCircle size={16} />
          <span>Approve</span>
        </button>
        <button
          className={`action-reject ${!isOwner ? 'action-disabled' : ''}`}
          onClick={() => isOwner ? openStatusDialog(
            leave._id, 
            'Rejected', 
            leave.user?.email,
            leave.user?.name,
            leave.user?.phone,
            userId,
            leave.status
          ) : null}
          title={isOwner ? "Reject Leave" : "Only Owner can reject"}
          disabled={!isOwner}
        >
          <FiXCircle size={16} />
          <span>Reject</span>
        </button>
      </div>
    ) : leave.status === 'Pending' ? (
      <span className="no-permission">
        <FiLock size={14} />
        {isOwner ? 'Action required' : 'Owner only'}
      </span>
    ) : (
      <span className={`status-text status-${leave.status?.toLowerCase()}`}>
        {leave.status}
      </span>
    )}
    
    {/* DELETE BUTTON - ONLY OWNER */}
    {canDeleteLeave(userId, leave.status) && (
      <button 
        className={`delete-button ${!isOwner ? 'action-disabled' : ''}`}
        onClick={() => isOwner ? setDeleteDialog(leave._id) : null}
        title={isOwner ? "Delete Leave" : "Only Owner can delete"}
        disabled={!isOwner}
      >
        <FiTrash2 size={16} />
      </button>
    )}
  </div>
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showStatusColumn ? 8 : 7}>
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
      {/* Header with Role Badge */}
    {/* Header with Role Badge */}
<div className="leaves-header">
  <div>
    <h1 className="leaves-title">
      Leave Management
      
    </h1>
    <p className="leaves-subtitle">
      {isOwner 
        ? "Review and manage employee leave requests with full access"
        : "View all leave requests (Read-only mode)"
      }
      <RoleBadge />
      
      {!isOwner && (
        <span className="view-only-badge">
          <FiEyeOff size={14} />
          View Only
        </span>
      )}
      
      <span className="company-badge">
        <FiBriefcase size={14} />
        {currentUserCompanyId ? currentUserCompanyId.substring(0, 12) + '...' : 'Loading...'}
      </span>
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
    
    {/* Export - Available to all (read-only) */}
    <button 
      className="action-button"
      onClick={exportData}
      title="Export Report"
    >
      <FiDownload size={20} />
    </button>
    
    <div className="stats-summary">
      <span className="stat-item">
        <FiClock color="#ff9800" /> {stats.pending} Pending
      </span>
      <span className="stat-item">
        <FiCheckCircle color="#4caf50" /> {stats.approved} Approved
      </span>
      <span className="stat-item">
        <FiXCircle color="#f44336" /> {stats.rejected} Rejected
      </span>
    </div>
  </div>
</div>

{/* Owner Warning Banner - Show for non-owners */}
{!isOwner && (
  <div className="owner-warning-banner">
    <div className="warning-content">
      <FiLock size={20} />
      <div className="warning-text">
        <strong>🔒 View Only Mode</strong>
        <p>You are viewing leave requests. Only the Company Owner can approve, reject, or delete leaves.</p>
      </div>
    </div>
  </div>
)}

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter size={20} color="#1976d2" />
          <h3>Filters & Search</h3>
          {(isOwner || isAdmin || isHR) && (
            <span className="owner-filter-badge">
              <FiEye size={14} />
              Viewing: {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
            </span>
          )}
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
          
          {(isOwner || isAdmin || isHR) && (
            <div className="filter-group">
              <label className="filter-label">Department</label>
              <DepartmentFilter
                selected={departmentFilter}
                onChange={setDepartmentFilter}
                departments={departments}
              />
            </div>
          )}
          
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <div style={{ position: 'relative' }}>
              <FiSearch 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                className="filter-input"
                placeholder="Search by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
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
      <div className="stats-container">
        {[
          { 
            label: "Total Leaves", 
            count: stats.total, 
            type: "All", 
            icon: <FiUsers />,
            statClass: "stat-card-primary",
            iconClass: "stat-icon-primary"
          },
          { 
            label: "Pending", 
            count: stats.pending, 
            type: "Pending", 
            icon: <FiClock />,
            statClass: "stat-card-warning",
            iconClass: "stat-icon-warning"
          },
          { 
            label: "Approved", 
            count: stats.approved, 
            type: "Approved", 
            icon: <FiCheckCircle />,
            statClass: "stat-card-success",
            iconClass: "stat-icon-success"
          },
          { 
            label: "Rejected", 
            count: stats.rejected, 
            type: "Rejected", 
            icon: <FiXCircle />,
            statClass: "stat-card-error",
            iconClass: "stat-icon-error"
          },
        ].map((stat) => (
          <div 
            key={stat.type}
            className={`stat-card ${stat.statClass} ${selectedStat === stat.type ? 'stat-card-active' : ''}`}
            onClick={() => handleStatFilter(stat.type)}
          >
            <div className="stat-content">
              <div className={`stat-icon ${stat.iconClass}`}>
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
          <div className="leaves-section">
            <div className="section-header">
              <h2 className="section-title">
                <FiAlertCircle size={20} />
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
              <FiList size={20} />
              All Other Leaves
            </h2>
            <span className="section-badge">{otherLeaves.length} total</span>
          </div>
          {renderLeaveTable("All Leaves", otherLeaves, false)}
        </div>
      </div>

      {/* ======================================== */}
      {/* STATUS UPDATE DIALOG */}
      {/* ======================================== */}
      {statusDialog.open && (
        <div className="dialog-overlay" onClick={closeStatusDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>
                {statusDialog.newStatus === 'Approved' ? '✅ Approve' : '❌ Reject'} Leave
              </h3>
              <button className="dialog-close" onClick={closeStatusDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="user-info">
                <div className="user-avatar large">
                  {getInitials(statusDialog.userName)}
                </div>
                <div className="user-details">
                  <h4>{statusDialog.userName}</h4>
                  <p><FiMail size={12} /> {statusDialog.userEmail}</p>
                  {statusDialog.userPhone && (
                    <p><FiPhone size={12} /> {statusDialog.userPhone}</p>
                  )}
                </div>
              </div>
              
              <div className="status-info-box">
                <span className="current-status">
                  Current: <strong>{statusDialog.currentStatus || 'Pending'}</strong>
                </span>
                <span className="new-status">
                  New: <strong style={{ color: statusDialog.newStatus === 'Approved' ? '#4caf50' : '#f44336' }}>
                    {statusDialog.newStatus}
                  </strong>
                </span>
              </div>
              
              <div className="remarks-section">
                <label>Remarks (Optional)</label>
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
                    ? `WhatsApp notification will be sent to ${statusDialog.userName}`
                    : `No phone number available for WhatsApp notification`
                  }
                </span>
              </div>
            </div>
            
            <div className="dialog-footer">
              <button className="btn btn-outlined" onClick={closeStatusDialog}>
                Cancel
              </button>
              <button 
                className={`btn btn-contained ${statusDialog.newStatus === 'Approved' ? 'btn-success' : 'btn-error'}`}
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
                <FiAlertCircle size={48} color="#ff9800" />
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
                            <span className="arrow">→</span>
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