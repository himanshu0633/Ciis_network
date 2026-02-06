import React, { useState, useEffect, useCallback } from "react";
import axios from "../../utils/axiosConfig";
import {
  FiCalendar,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiList,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiX,
  FiBriefcase,
  FiUsers,
  FiAlertTriangle
} from "react-icons/fi";
import '../Css/MyLeaves.css';

const MyLeaves = () => {
  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debugInfo, setDebugInfo] = useState([]);
  
  // Job Roles और Departments State
  const [jobRoles, setJobRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [userJobRoleName, setUserJobRoleName] = useState("Employee");
  const [userDepartmentName, setUserDepartmentName] = useState("General");
  const [jobRolesLoading, setJobRolesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [form, setForm] = useState({
    type: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    title: "",
    items: [],
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Debug panel toggle

  // Get user and company details
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');
  const companyDetails = localStorage.getItem('companyDetails') ? JSON.parse(localStorage.getItem('companyDetails')) : null;

  // ✅ Add debug log
  const addDebugLog = (message, data = null) => {
    console.log(`🔍 DEBUG: ${message}`, data);
    setDebugInfo(prev => [...prev.slice(-10), {
      timestamp: new Date().toLocaleTimeString(),
      message,
      data: data ? JSON.stringify(data).substring(0, 100) + '...' : null
    }]);
  };

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Get Company ID Function - FIXED
  const getCompanyId = () => {
    if (!user && !companyDetails) {
      addDebugLog("No user or company details found");
      return null;
    }
    
    // Check all possible sources for company ID
    const sources = [
      { source: 'companyDetails._id', value: companyDetails?._id },
      { source: 'companyDetails.id', value: companyDetails?.id },
      { source: 'user.company', value: user?.company },
      { source: 'user.companyId', value: user?.companyId },
      { source: 'user.companyDetails._id', value: user?.companyDetails?._id },
      { source: 'companyDetails.companyId', value: companyDetails?.companyId },
    ];
    
    const foundSource = sources.find(s => s.value);
    
    if (foundSource) {
      addDebugLog(`Company ID found in ${foundSource.source}:`, foundSource.value);
      return foundSource.value;
    }
    
    addDebugLog("No company ID found in any source", { user, companyDetails });
    return null;
  };

  // ✅ FIXED: Resolve User Job Role Function (from your original code)
  const resolveUserJobRole = (roles) => {
    // ✅ FIX 1: Check if roles is undefined/null/empty first
    if (!roles || roles.length === 0) {
      addDebugLog("Roles array is empty or undefined");
      
      // Check user object directly for role information
      if (!user) {
        return "Employee";
      }
      
      if (user?.roleName) {
        return user.roleName;
      }
      if (user?.jobRoleName) {
        return user.jobRoleName;
      }
      if (user?.role) {
        return user.role;
      }
      
      return "Employee";
    }
    
    // ✅ FIX 2: Check user object properly
    if (!user) {
      addDebugLog("User object is null/undefined");
      return "Employee";
    }
    
    // ✅ FIX 3: Check user.jobRole properly
    if (!user?.jobRole && !user?.role && !user?.roleId) {
      addDebugLog("User has no jobRole, role, or roleId property");
      
      // Try to get from roleName or jobRoleName
      if (user?.roleName) {
        return user.roleName;
      }
      if (user?.jobRoleName) {
        return user.jobRoleName;
      }
      
      return "Employee";
    }
    
    // ✅ FIX 4: Use the role ID from user
    const roleId = user.jobRole || user.role || user.roleId;
    addDebugLog(`Looking for role with ID: ${roleId} in ${roles.length} roles`);
    
    // ✅ FIX 5: Find the role with proper string comparison
    const role = roles.find(
      r => {
        // Try multiple ID fields
        const match = String(r._id) === String(roleId) || 
                     String(r.id) === String(roleId) ||
                     String(r.roleId) === String(roleId) ||
                     String(r.roleNumber) === String(roleId) ||
                     r.roleName?.toLowerCase() === String(roleId).toLowerCase();
        
        if (match) {
          addDebugLog(`Role match found:`, {
            roleId: r._id,
            roleName: r.roleName,
            userRoleId: roleId
          });
        }
        return match;
      }
    );

    // ✅ FIX 6: Return role name or fallback
    if (role) {
      return role.roleName || "Employee";
    }
    
    // Additional fallback: check if user has roleName directly
    if (user?.roleName) {
      return user.roleName;
    }
    
    // Default fallback
    addDebugLog("No matching role found, returning default 'Employee'");
    return "Employee";
  };

  // ✅ FIXED: Resolve User Department Function (from your original code)
  const resolveUserDepartment = (depts) => {
    // ✅ FIX 1: Check if depts is undefined/null/empty first
    if (!depts || depts.length === 0) {
      addDebugLog("Departments array is empty or undefined");
      
      // Check user object directly for department information
      if (!user) {
        return "General";
      }
      
      if (user?.departmentName) {
        return user.departmentName;
      }
      if (user?.dept) {
        return user.dept;
      }
      
      return "General";
    }
    
    // ✅ FIX 2: Check user object properly
    if (!user) {
      addDebugLog("User object is null/undefined");
      return "General";
    }
    
    // ✅ FIX 3: Check user.department properly
    if (!user?.department && !user?.dept && !user?.departmentId) {
      addDebugLog("User has no department, dept, or departmentId property");
      
      // Try to get from departmentName
      if (user?.departmentName) {
        return user.departmentName;
      }
      
      return "General";
    }
    
    // ✅ FIX 4: Use the department ID from user
    const deptId = user.department || user.dept || user.departmentId;
    addDebugLog(`Looking for department with ID: ${deptId} in ${depts.length} departments`);
    
    // ✅ FIX 5: Find the department with proper string comparison
    const dept = depts.find(
      d => {
        // Try multiple ID fields
        const match = String(d._id) === String(deptId) || 
                     String(d.id) === String(deptId) ||
                     String(d.departmentId) === String(deptId) ||
                     String(d.departmentCode) === String(deptId) ||
                     d.departmentName?.toLowerCase() === String(deptId).toLowerCase();
        
        if (match) {
          addDebugLog(`Department match found:`, {
            deptId: d._id,
            deptName: d.departmentName,
            userDeptId: deptId
          });
        }
        return match;
      }
    );

    // ✅ FIX 6: Return department name or fallback
    if (dept) {
      return dept.departmentName || "General";
    }
    
    // Additional fallback: check if user has departmentName directly
    if (user?.departmentName) {
      return user.departmentName;
    }
    
    // Default fallback
    addDebugLog("No matching department found, returning default 'General'");
    return "General";
  };

  // ✅ UPDATED: Fetch Job Roles Function
  const fetchJobRoles = async () => {
    const companyId = getCompanyId();
    
    if (!companyId) {
      addDebugLog("No company ID available for job roles");
      setUserJobRoleName("Employee");
      return [];
    }
    
    setJobRolesLoading(true);
    addDebugLog(`Starting job roles fetch for company: ${companyId}`);
    
    try {
      const res = await axios.get(`/job-roles?company=${companyId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      addDebugLog("Job roles API response:", res.data);
      
      // Handle different response structures
      let roles = [];
      if (Array.isArray(res.data)) {
        roles = res.data;
      } else if (Array.isArray(res.data?.data)) {
        roles = res.data.data;
      } else if (Array.isArray(res.data?.jobRoles)) {
        roles = res.data.jobRoles;
      } else if (Array.isArray(res.data?.roles)) {
        roles = res.data.roles;
      }
      
      // Ensure roles is an array
      if (!Array.isArray(roles)) {
        roles = [];
      }
      
      addDebugLog(`Found ${roles.length} job roles`);
      
      // Set job roles
      setJobRoles(roles);
      
      // ✅ Use the fixed resolveUserJobRole function
      const roleName = resolveUserJobRole(roles);
      setUserJobRoleName(roleName);
      
      addDebugLog(`User job role resolved to: ${roleName}`);
      
      return roles;
      
    } catch (err) {
      console.error("Job role fetch failed", err);
      addDebugLog("Job role fetch failed", err.response?.data || err.message);
      
      // ✅ Use the fixed resolveUserJobRole with empty array as fallback
      const roleName = resolveUserJobRole([]);
      setUserJobRoleName(roleName);
      
      setNotification({
        message: "Could not load job roles",
        severity: "warning",
      });
      
      return [];
    } finally {
      setJobRolesLoading(false);
    }
  };

  // ✅ UPDATED: Fetch Departments Function
  const fetchDepartments = async () => {
    const companyId = getCompanyId();
    
    if (!companyId) {
      addDebugLog("No company ID available for departments");
      setUserDepartmentName("General");
      return [];
    }
    
    setDepartmentsLoading(true);
    addDebugLog(`Starting departments fetch for company: ${companyId}`);
    
    try {
      const res = await axios.get(`/departments?company=${companyId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      addDebugLog("Departments API response:", res.data);
      
      // Handle different response structures
      let depts = [];
      if (Array.isArray(res.data)) {
        depts = res.data;
      } else if (Array.isArray(res.data?.data)) {
        depts = res.data.data;
      } else if (Array.isArray(res.data?.departments)) {
        depts = res.data.departments;
      } else if (Array.isArray(res.data?.departmentList)) {
        depts = res.data.departmentList;
      }
      
      // Ensure depts is an array
      if (!Array.isArray(depts)) {
        depts = [];
      }
      
      addDebugLog(`Found ${depts.length} departments`);
      
      // Set departments
      setDepartments(depts);
      
      // ✅ Use the fixed resolveUserDepartment function
      const deptName = resolveUserDepartment(depts);
      setUserDepartmentName(deptName);
      
      addDebugLog(`User department resolved to: ${deptName}`);
      
      return depts;
      
    } catch (err) {
      console.error("Department fetch failed", err);
      addDebugLog("Department fetch failed", err.response?.data || err.message);
      
      // ✅ Use the fixed resolveUserDepartment with empty array as fallback
      const deptName = resolveUserDepartment([]);
      setUserDepartmentName(deptName);
      
      setNotification({
        message: "Could not load departments",
        severity: "warning",
      });
      
      return [];
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // ✅ UPDATED: Load User Info Function
  const loadUserInfo = async () => {
    addDebugLog("=== Starting user info load ===");
    addDebugLog("User object:", user);
    addDebugLog("Company details:", companyDetails);
    
    try {
      // Run both fetches in parallel
      await Promise.all([
        fetchJobRoles(),
        fetchDepartments()
      ]);
      
      addDebugLog("=== User info load complete ===");
      addDebugLog(`Final Job Role: ${userJobRoleName}`);
      addDebugLog(`Final Department: ${userDepartmentName}`);
      
    } catch (error) {
      addDebugLog("Error loading user info:", error);
      setNotification({
        message: "Failed to load user information",
        severity: "error",
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getHistoryLabel = (h) => {
    if (!h) return "";

    const dateText = h.at
      ? ` on ${new Date(h.at).toLocaleString()}`
      : "";

    const remarksText = h.remarks ? ` — "${h.remarks}"` : "";

    const approvedBy =
      typeof h.by === "object" ? h.by.name : "Unknown";

    if (h.action === "approved")
      return `✅ Approved by ${approvedBy}${dateText}${remarksText}`;

    if (h.action === "rejected")
      return `❌ Rejected by ${approvedBy}${dateText}${remarksText}`;

    if (h.action === "applied")
      return `📝 Applied${dateText}`;

    return `⏳ Pending`;
  };

  const fetchLeaves = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      addDebugLog("Fetching leaves data");
      const res = await axios.get("/leaves/status");
      const list = res.data.leaves || [];
      setLeaves(list);
      calculateStats(list);
      addDebugLog(`Fetched ${list.length} leaves`);
      
      if (showRefresh) {
        setNotification({
          message: "Leaves data refreshed!",
          severity: "success",
        });
      }
    } catch (error) {
      addDebugLog("Error fetching leaves:", error);
      setNotification({
        message: "Failed to fetch leaves",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const calculateStats = (data) => {
    const approved = data.filter((l) => l.status === "Approved").length;
    const pending = data.filter((l) => l.status === "Pending").length;
    const rejected = data.filter((l) => l.status === "Rejected").length;
    setStats({ total: data.length, approved, pending, rejected });
  };

  useEffect(() => {
    const loadData = async () => {
      addDebugLog("=== Initial data load started ===");
      // First load user info
      await loadUserInfo();
      
      // Then fetch leaves
      await fetchLeaves();
      addDebugLog("=== Initial data load complete ===");
    };
    
    loadData();
  }, [fetchLeaves]);

  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : l.status === statusFilter;
    const matchesSearch =
      l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.status.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diff = e - s;
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const applyLeave = async () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setNotification({
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setNotification({
        message: "End date cannot be before start date",
        severity: "error",
      });
      return;
    }

    const payload = {
      type: form.type,
      startDate: new Date(form.startDate).toISOString().split("T")[0],
      endDate: new Date(form.endDate).toISOString().split("T")[0],
      reason: form.reason,
      days: calculateDays(form.startDate, form.endDate),
    };

    try {
      setLoading(true);
      await axios.post("/leaves/apply", payload);
      setNotification({
        message: "Leave applied successfully",
        severity: "success",
      });
      await fetchLeaves();
      setForm({ type: "Casual", startDate: "", endDate: "", reason: "" });
      setTab(0);
    } catch (err) {
      setNotification({
        message:
          err?.response?.data?.message || "Failed to apply leave",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openHistoryModal = (leave) => {
    const items = Array.isArray(leave.history) ? leave.history : [];
    setHistoryDialog({
      open: true,
      title: `${leave.type} Leave — ${leave.user?.name || "Employee"}`,
      items,
    });
  };

  const closeHistoryModal = () => {
    setHistoryDialog({ open: false, title: "", items: [] });
  };

  // Force refresh user info
  const forceRefreshUserInfo = async () => {
    addDebugLog("Manual refresh triggered");
    await loadUserInfo();
    await fetchLeaves(true);
  };

  if (loading && !refreshing) {
    return (
      <div className="MyLeaves-loading">
        <div className="MyLeaves-loading-content">
          <div className="MyLeaves-loading-bar">
            <div className="MyLeaves-loading-progress"></div>
          </div>
          <h2 className="MyLeaves-loading-text">
            Loading your leave records...
          </h2>
          <p className="MyLeaves-loading-subtext">
            Fetching job roles and department information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="MyLeaves-container">
      {/* Header Section */}
      <div className="MyLeaves-header">
        <div className="MyLeaves-header-content">
          <div className="MyLeaves-header-text">
            <h1 className="MyLeaves-title">Leave Management</h1>
            <p className="MyLeaves-subtitle">
              Manage and track all your leave requests
            </p>
            
            {/* User Info Display - ALWAYS SHOW */}
            <div className="MyLeaves-user-info">
              <div className="MyLeaves-user-info-tags">
                <span className="MyLeaves-user-tag">
                  <FiUser size={12} />
                  {user?.name || 'User'}
                </span>
                <span className="MyLeaves-user-tag">
                  <FiBriefcase size={12} />
                  {userJobRoleName}
                  {jobRolesLoading && <span className="MyLeaves-loading-dot">...</span>}
                </span>
                <span className="MyLeaves-user-tag">
                  <FiUsers size={12} />
                  {userDepartmentName}
                  {departmentsLoading && <span className="MyLeaves-loading-dot">...</span>}
                </span>
                <span className="MyLeaves-user-tag">
                  <FiBriefcase size={12} />
                  {companyDetails?.companyName || 'Company'}
                </span>
              </div>
              
              {/* Debug Button */}
              <button 
                className="MyLeaves-debug-button"
                onClick={() => setShowDebug(!showDebug)}
                title="Toggle debug info"
              >
                <FiAlertTriangle size={12} />
                Debug
              </button>
            </div>
          </div>

          <div className="MyLeaves-header-actions">
            <div className="MyLeaves-search-container">
              <FiSearch className="MyLeaves-search-icon" />
              <input
                type="text"
                placeholder="Search leaves..."
                className="MyLeaves-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="MyLeaves-icon-button"
              onClick={forceRefreshUserInfo}
              disabled={refreshing || jobRolesLoading || departmentsLoading}
              title="Refresh all data"
            >
              <FiRefreshCw className={refreshing ? "MyLeaves-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter !== "ALL" || searchTerm) && (
          <div className="MyLeaves-active-filters">
            <span className="MyLeaves-active-filters-label">Active filters:</span>
            <div className="MyLeaves-filter-chips">
              {statusFilter !== "ALL" && (
                <div className="MyLeaves-filter-chip MyLeaves-primary">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter("ALL")}>×</button>
                </div>
              )}
              {searchTerm && (
                <div className="MyLeaves-filter-chip MyLeaves-secondary">
                  <span>Search: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm("")}>×</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="MyLeaves-debug-panel">
          <div className="MyLeaves-debug-header">
            <h3>Debug Information</h3>
            <button onClick={() => setDebugInfo([])}>Clear</button>
            <button onClick={() => setShowDebug(false)}>Hide</button>
          </div>
          <div className="MyLeaves-debug-content">
            <div className="MyLeaves-debug-section">
              <h4>User Object:</h4>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
            <div className="MyLeaves-debug-section">
              <h4>Company Details:</h4>
              <pre>{JSON.stringify(companyDetails, null, 2)}</pre>
            </div>
            <div className="MyLeaves-debug-section">
              <h4>Job Roles ({jobRoles.length}):</h4>
              <pre>{JSON.stringify(jobRoles, null, 2)}</pre>
            </div>
            <div className="MyLeaves-debug-section">
              <h4>Departments ({departments.length}):</h4>
              <pre>{JSON.stringify(departments, null, 2)}</pre>
            </div>
            <div className="MyLeaves-debug-section">
              <h4>Logs (latest 10):</h4>
              <div className="MyLeaves-debug-logs">
                {debugInfo.map((log, index) => (
                  <div key={index} className="MyLeaves-debug-log">
                    <span className="MyLeaves-debug-time">[{log.timestamp}]</span>
                    <span className="MyLeaves-debug-message">{log.message}</span>
                    {log.data && <span className="MyLeaves-debug-data">{log.data}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="MyLeaves-stats-container">
        <div className="MyLeaves-stats-grid">
          <div className="MyLeaves-stat-card MyLeaves-stat-total">
            <div className="MyLeaves-stat-header">
              <FiCalendar className="MyLeaves-stat-icon" />
              <h3>Total Leaves</h3>
            </div>
            <div className="MyLeaves-stat-value">{stats.total}</div>
            <div className="MyLeaves-stat-footer">
              <span>All time records</span>
            </div>
          </div>
          
          <div className="MyLeaves-stat-card MyLeaves-stat-approved">
            <div className="MyLeaves-stat-header">
              <FiCheckCircle className="MyLeaves-stat-icon" />
              <h3>Approved</h3>
            </div>
            <div className="MyLeaves-stat-value">{stats.approved}</div>
            <div className="MyLeaves-stat-footer">
              <span>Approved requests</span>
            </div>
          </div>
          
          <div className="MyLeaves-stat-card MyLeaves-stat-pending">
            <div className="MyLeaves-stat-header">
              <FiClock className="MyLeaves-stat-icon" />
              <h3>Pending</h3>
            </div>
            <div className="MyLeaves-stat-value">{stats.pending}</div>
            <div className="MyLeaves-stat-footer">
              <span>Awaiting approval</span>
            </div>
          </div>
          
          <div className="MyLeaves-stat-card MyLeaves-stat-rejected">
            <div className="MyLeaves-stat-header">
              <FiXCircle className="MyLeaves-stat-icon" />
              <h3>Rejected</h3>
            </div>
            <div className="MyLeaves-stat-value">{stats.rejected}</div>
            <div className="MyLeaves-stat-footer">
              <span>Declined requests</span>
            </div>
          </div>
        </div>
        
        {/* Job Role and Department Info Card - SIMPLIFIED */}
        <div className="MyLeaves-info-card">
          <div className="MyLeaves-info-header">
            <h3>
              <FiInfo className="MyLeaves-info-icon" />
              Employee Information
            </h3>
            <div className="MyLeaves-info-status">
              {jobRolesLoading || departmentsLoading ? (
                <span className="MyLeaves-loading-small">Loading...</span>
              ) : (
                <>
                  <span className="MyLeaves-status-dot MyLeaves-status-success"></span>
                  <span>Loaded</span>
                </>
              )}
            </div>
          </div>
          <div className="MyLeaves-info-content">
            <div className="MyLeaves-info-row">
              <div className="MyLeaves-info-item">
                <strong>Job Role:</strong>
                <span className="MyLeaves-info-value">
                  {userJobRoleName}
                  {jobRolesLoading && <span className="MyLeaves-loading-tiny"> (updating...)</span>}
                </span>
              </div>
              <div className="MyLeaves-info-item">
                <strong>Department:</strong>
                <span className="MyLeaves-info-value">
                  {userDepartmentName}
                  {departmentsLoading && <span className="MyLeaves-loading-tiny"> (updating...)</span>}
                </span>
              </div>
            </div>
            <div className="MyLeaves-info-row">
              <div className="MyLeaves-info-item">
                <strong>Employee ID:</strong>
                <span className="MyLeaves-info-value">
                  {user?.employeeId || user?.empId || user?.id?.substring(0, 8) || 'N/A'}
                </span>
              </div>
              <div className="MyLeaves-info-item">
                <strong>Company:</strong>
                <span className="MyLeaves-info-value">
                  {companyDetails?.companyName || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="MyLeaves-info-footer">
            <button 
              className="MyLeaves-info-refresh"
              onClick={loadUserInfo}
              disabled={jobRolesLoading || departmentsLoading}
            >
              <FiRefreshCw size={12} />
              Refresh Info
            </button>
            <button 
              className="MyLeaves-info-force"
              onClick={() => {
                setUserJobRoleName("Employee");
                setUserDepartmentName("General");
                loadUserInfo();
              }}
            >
              Reset & Reload
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="MyLeaves-tabs-container">
        <div className="MyLeaves-tabs-header">
          <button
            className={`MyLeaves-tab ${tab === 0 ? "MyLeaves-active-tab" : ""}`}
            onClick={() => setTab(0)}
          >
            <FiCalendar />
            <span>Leave Requests</span>
            {stats.total > 0 && (
              <span className="MyLeaves-tab-badge">{stats.total}</span>
            )}
          </button>
          <button
            className={`MyLeaves-tab ${tab === 1 ? "MyLeaves-active-tab" : ""}`}
            onClick={() => setTab(1)}
          >
            <FiPlus />
            <span>Apply Leave</span>
          </button>
        </div>

        {/* Leave Requests Tab */}
        {tab === 0 && (
          <div className="MyLeaves-requests-tab">
            {/* Status Filter Buttons */}
            <div className="MyLeaves-status-filters">
              <button
                className={`MyLeaves-status-filter ${statusFilter === "ALL" ? "active" : ""}`}
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </button>
              <button
                className={`MyLeaves-status-filter ${statusFilter === "Approved" ? "active" : ""}`}
                onClick={() => setStatusFilter("Approved")}
              >
                Approved
              </button>
              <button
                className={`MyLeaves-status-filter ${statusFilter === "Pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("Pending")}
              >
                Pending
              </button>
              <button
                className={`MyLeaves-status-filter ${statusFilter === "Rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("Rejected")}
              >
                Rejected
              </button>
            </div>

            {/* Results Count */}
            <h3 className="MyLeaves-results-count">
              Showing {filteredLeaves.length} of {leaves.length} records
              <span className="MyLeaves-user-role-badge">
                • Role: {userJobRoleName} • Dept: {userDepartmentName}
              </span>
            </h3>

            {/* Main Content */}
            <div className="MyLeaves-requests-content">
              {filteredLeaves.length === 0 ? (
                <div className="MyLeaves-empty-state">
                  <FiAlertCircle className="MyLeaves-empty-icon" />
                  <h3>No leaves found</h3>
                  <p>
                    {searchTerm || statusFilter !== "ALL" 
                      ? "Try adjusting your search or filter criteria" 
                      : "You haven't applied for any leaves yet"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  {!isMobile && (
                    <div className="MyLeaves-table-container">
                      <table className="MyLeaves-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Period</th>
                            <th>Days</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Applied On</th>
                            <th>History</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeaves.map((leave) => (
                            <tr key={leave._id || leave.id}>
                              <td>
                                <span className={`MyLeaves-leave-type MyLeaves-type-${leave.type?.toLowerCase()}`}>
                                  {leave.type}
                                </span>
                              </td>
                              <td>
                                <div className="MyLeaves-date-range">
                                  <FiCalendar size={12} />
                                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                </div>
                              </td>
                              <td>
                                <span className="MyLeaves-days-badge">
                                  {leave.days || calculateDays(leave.startDate, leave.endDate)} day(s)
                                </span>
                              </td>
                              <td className="MyLeaves-reason-cell">
                                {leave.reason}
                              </td>
                              <td>
                                <span className={`MyLeaves-status-badge MyLeaves-status-${leave.status?.toLowerCase()}`}>
                                  {leave.status === "Approved" && <FiCheckCircle size={12} />}
                                  {leave.status === "Pending" && <FiClock size={12} />}
                                  {leave.status === "Rejected" && <FiXCircle size={12} />}
                                  {leave.status}
                                </span>
                              </td>
                              <td>
                                {formatDate(leave.createdAt || leave.appliedOn)}
                              </td>
                              <td>
                                <button
                                  className="MyLeaves-history-button"
                                  onClick={() => openHistoryModal(leave)}
                                  disabled={!leave.history || leave.history.length === 0}
                                >
                                  <FiList size={14} />
                                  View History
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Mobile Card View */}
                  {isMobile && (
                    <div className="MyLeaves-mobile-cards">
                      {filteredLeaves.map((leave) => (
                        <div key={leave._id || leave.id} className="MyLeaves-mobile-card">
                          <div className="MyLeaves-mobile-card-header">
                            <div className="MyLeaves-mobile-card-title">
                              <span className={`MyLeaves-leave-type MyLeaves-type-${leave.type?.toLowerCase()}`}>
                                {leave.type}
                              </span>
                              <span className={`MyLeaves-status-badge MyLeaves-status-${leave.status?.toLowerCase()}`}>
                                {leave.status}
                              </span>
                            </div>
                            <div className="MyLeaves-mobile-card-dates">
                              <FiCalendar size={12} />
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </div>
                          </div>
                          
                          <div className="MyLeaves-mobile-card-content">
                            <div className="MyLeaves-mobile-card-row">
                              <span className="MyLeaves-mobile-label">Reason:</span>
                              <span className="MyLeaves-mobile-value">{leave.reason}</span>
                            </div>
                            <div className="MyLeaves-mobile-card-row">
                              <span className="MyLeaves-mobile-label">Days:</span>
                              <span className="MyLeaves-mobile-value">
                                {leave.days || calculateDays(leave.startDate, leave.endDate)} day(s)
                              </span>
                            </div>
                            <div className="MyLeaves-mobile-card-row">
                              <span className="MyLeaves-mobile-label">Applied:</span>
                              <span className="MyLeaves-mobile-value">
                                {formatDate(leave.createdAt || leave.appliedOn)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="MyLeaves-mobile-card-actions">
                            <button
                              className="MyLeaves-history-button"
                              onClick={() => openHistoryModal(leave)}
                              disabled={!leave.history || leave.history.length === 0}
                            >
                              <FiList size={14} />
                              History
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Apply Leave Tab */}
        {tab === 1 && (
          <div className="MyLeaves-apply-tab">
            <div className="MyLeaves-apply-form-container">
              <h2 className="MyLeaves-form-title">Apply for New Leave</h2>
              <p className="MyLeaves-form-subtitle">
                Fill in the details to submit a leave request
              </p>
              
              {/* Applicant Info */}
              <div className="MyLeaves-applicant-info">
                <div className="MyLeaves-applicant-card">
                  <div className="MyLeaves-applicant-header">
                    <FiUser className="MyLeaves-applicant-icon" />
                    <h4>Applicant Information</h4>
                  </div>
                  <div className="MyLeaves-applicant-details">
                    <div className="MyLeaves-applicant-detail">
                      <span className="MyLeaves-applicant-label">Name:</span>
                      <span className="MyLeaves-applicant-value">{user?.name || 'N/A'}</span>
                    </div>
                    <div className="MyLeaves-applicant-detail">
                      <span className="MyLeaves-applicant-label">Job Role:</span>
                      <span className="MyLeaves-applicant-value">{userJobRoleName}</span>
                    </div>
                    <div className="MyLeaves-applicant-detail">
                      <span className="MyLeaves-applicant-label">Department:</span>
                      <span className="MyLeaves-applicant-value">{userDepartmentName}</span>
                    </div>
                    <div className="MyLeaves-applicant-detail">
                      <span className="MyLeaves-applicant-label">Employee ID:</span>
                      <span className="MyLeaves-applicant-value">{user?.employeeId || user?.empId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Form */}
              <div className="MyLeaves-form">
                <div className="MyLeaves-form-group">
                  <label htmlFor="type">
                    <FiBriefcase className="MyLeaves-form-icon" />
                    Leave Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="MyLeaves-form-select"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Earned">Earned Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="MyLeaves-form-row">
                  <div className="MyLeaves-form-group">
                    <label htmlFor="startDate">
                      <FiCalendar className="MyLeaves-form-icon" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="MyLeaves-form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="MyLeaves-form-group">
                    <label htmlFor="endDate">
                      <FiCalendar className="MyLeaves-form-icon" />
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="MyLeaves-form-input"
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="MyLeaves-form-group">
                  <label htmlFor="days">
                    <FiClock className="MyLeaves-form-icon" />
                    Total Days
                  </label>
                  <div className="MyLeaves-days-display">
                    {calculateDays(form.startDate, form.endDate)} day(s)
                  </div>
                </div>

                <div className="MyLeaves-form-group">
                  <label htmlFor="reason">
                    <FiInfo className="MyLeaves-form-icon" />
                    Reason for Leave
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    className="MyLeaves-form-textarea"
                    placeholder="Please provide a reason for your leave request..."
                    rows={4}
                  />
                </div>

                <div className="MyLeaves-form-actions">
                  <button
                    type="button"
                    className="MyLeaves-form-cancel"
                    onClick={() => setTab(0)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="MyLeaves-form-submit"
                    onClick={applyLeave}
                    disabled={!form.startDate || !form.endDate || !form.reason.trim()}
                  >
                    <FiPlus size={16} />
                    Apply for Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {historyDialog.open && (
        <div className="MyLeaves-modal-overlay">
          <div className="MyLeaves-modal">
            <div className="MyLeaves-modal-header">
              <h2>{historyDialog.title}</h2>
              <button className="MyLeaves-modal-close" onClick={closeHistoryModal}>
                <FiX />
              </button>
            </div>
            <div className="MyLeaves-modal-content">
              {historyDialog.items.length === 0 ? (
                <div className="MyLeaves-empty-history">
                  <FiAlertCircle className="MyLeaves-empty-history-icon" />
                  <h3>No history available</h3>
                  <p>This leave request doesn't have any history records yet.</p>
                </div>
              ) : (
                <div className="MyLeaves-history-list">
                  {historyDialog.items.map((item, index) => (
                    <div key={index} className="MyLeaves-history-item">
                      <div className="MyLeaves-history-icon">
                        {item.action === "approved" && <FiCheckCircle className="MyLeaves-history-approved" />}
                        {item.action === "rejected" && <FiXCircle className="MyLeaves-history-rejected" />}
                        {item.action === "applied" && <FiClock className="MyLeaves-history-applied" />}
                      </div>
                      <div className="MyLeaves-history-content">
                        <p className="MyLeaves-history-text">
                          {getHistoryLabel(item)}
                        </p>
                        {item.remarks && (
                          <p className="MyLeaves-history-remarks">
                            <strong>Remarks:</strong> {item.remarks}
                          </p>
                        )}
                        <p className="MyLeaves-history-time">
                          {item.at ? new Date(item.at).toLocaleString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="MyLeaves-modal-footer">
              <button className="MyLeaves-modal-close-btn" onClick={closeHistoryModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Snackbar */}
      {notification?.message && (
        <div className={`MyLeaves-notification MyLeaves-notification-${notification.severity}`}>
          <div className="MyLeaves-notification-content">
            {notification.severity === "error" ? (
              <FiXCircle className="MyLeaves-notification-icon" />
            ) : notification.severity === "warning" ? (
              <FiAlertTriangle className="MyLeaves-notification-icon" />
            ) : (
              <FiCheckCircle className="MyLeaves-notification-icon" />
            )}
            <span className="MyLeaves-notification-message">
              {notification.message}
            </span>
          </div>
          <button
            className="MyLeaves-notification-close"
            onClick={() => setNotification(null)}
          >
            <FiX />
          </button>
        </div>
      )}
      
      {/* Debug info in console */}
      <div style={{ display: 'none' }}>
        Current State: {JSON.stringify({
          userJobRoleName,
          userDepartmentName,
          jobRolesCount: jobRoles.length,
          departmentsCount: departments.length,
          user: user ? 'exists' : 'null',
          companyDetails: companyDetails ? 'exists' : 'null'
        })}
      </div>
    </div>
  );
};

export default MyLeaves;