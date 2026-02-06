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
  FiAlertTriangle,
  FiCornerUpLeft
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
  
  // Job Roles और Departments State
  const [jobRoles, setJobRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [userJobRoleName, setUserJobRoleName] = useState("Loading...");
  const [userDepartmentName, setUserDepartmentName] = useState("Loading...");
  const [userCompanyName, setUserCompanyName] = useState("Loading...");
  const [jobRolesLoading, setJobRolesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  
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

  // Get user and company details
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');
  const companyDetails = localStorage.getItem('companyDetails') ? JSON.parse(localStorage.getItem('companyDetails')) : null;

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ DIRECT SOLUTION: Extract IDs and fetch names separately
  const extractAndFetchDetails = async () => {
    console.log("🔍 Extracting IDs and fetching details...");
    
    // Get IDs from user object
    const userId = user?._id || user?.id;
    const companyId = user?.company || companyDetails?._id || companyDetails?.id;
    const departmentId = user?.department;
    const jobRoleId = user?.jobRole || user?.role;
    
    console.log("Extracted IDs:", {
      userId,
      companyId,
      departmentId,
      jobRoleId
    });
    
    // Set defaults
    setUserJobRoleName("Employee");
    setUserDepartmentName("General");
    setUserCompanyName(companyDetails?.companyName || "Company");
    
    // Try to fetch company name if we have company ID
    if (companyId && (!companyDetails?.companyName || companyDetails.companyName.includes('...'))) {
      try {
        console.log(`Fetching company details for ID: ${companyId}`);
        const response = await axios.get(`/api/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.companyName) {
          setUserCompanyName(response.data.companyName);
          console.log(`✅ Got company name: ${response.data.companyName}`);
        }
      } catch (error) {
        console.log("Could not fetch company details, using ID:", companyId);
        setUserCompanyName(`Company (${companyId.substring(0, 8)}...)`);
      }
    }
    
    // Try to fetch department name if we have department ID
    if (departmentId && departmentId.length > 10) { // Check if it looks like an ID
      try {
        console.log(`Fetching department details for ID: ${departmentId}`);
        const response = await axios.get(`/api/departments/${departmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.departmentName || response.data?.name) {
          setUserDepartmentName(response.data.departmentName || response.data.name);
          console.log(`✅ Got department name: ${response.data.departmentName || response.data.name}`);
        }
      } catch (error) {
        // Try alternative endpoint
        try {
          const response = await axios.get(`/departments/${departmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.departmentName || response.data?.name) {
            setUserDepartmentName(response.data.departmentName || response.data.name);
            console.log(`✅ Got department name from alt endpoint: ${response.data.departmentName || response.data.name}`);
          }
        } catch (error2) {
          console.log("Could not fetch department details, using ID:", departmentId);
          setUserDepartmentName(`Department (${departmentId.substring(0, 8)}...)`);
        }
      }
    } else if (departmentId) {
      // If it's not an ID, maybe it's already a name
      setUserDepartmentName(departmentId);
    }
    
    // Try to fetch job role name if we have job role ID
    if (jobRoleId && jobRoleId.length > 10) { // Check if it looks like an ID
      try {
        console.log(`Fetching job role details for ID: ${jobRoleId}`);
        const response = await axios.get(`/api/job-roles/${jobRoleId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.roleName || response.data?.name) {
          setUserJobRoleName(response.data.roleName || response.data.name);
          console.log(`✅ Got job role name: ${response.data.roleName || response.data.name}`);
        }
      } catch (error) {
        // Try alternative endpoint
        try {
          const response = await axios.get(`/job-roles/${jobRoleId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.roleName || response.data?.name) {
            setUserJobRoleName(response.data.roleName || response.data.name);
            console.log(`✅ Got job role name from alt endpoint: ${response.data.roleName || response.data.name}`);
          }
        } catch (error2) {
          console.log("Could not fetch job role details, using ID:", jobRoleId);
          setUserJobRoleName(`Role (${jobRoleId.substring(0, 8)}...)`);
        }
      }
    } else if (jobRoleId) {
      // If it's not an ID, maybe it's already a name
      setUserJobRoleName(jobRoleId);
    }
  };

  // ✅ SIMPLE FETCH: Get all companies, departments, job roles
  const fetchAllMasterData = async () => {
    console.log("📊 Fetching all master data...");
    
    // Fetch companies
    try {
      setCompaniesLoading(true);
      const companiesRes = await axios.get('/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(companiesRes.data) || Array.isArray(companiesRes.data?.companies)) {
        const companiesList = Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data.companies;
        setCompanies(companiesList);
        console.log(`✅ Loaded ${companiesList.length} companies`);
        
        // Find current company
        const companyId = user?.company || companyDetails?._id;
        if (companyId) {
          const currentCompany = companiesList.find(c => c._id === companyId || c.id === companyId);
          if (currentCompany?.companyName) {
            setUserCompanyName(currentCompany.companyName);
          }
        }
      }
    } catch (error) {
      console.log("Could not fetch companies:", error.message);
    } finally {
      setCompaniesLoading(false);
    }
    
    // Fetch departments
    try {
      setDepartmentsLoading(true);
      const deptRes = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(deptRes.data) || Array.isArray(deptRes.data?.departments)) {
        const deptList = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data.departments;
        setDepartments(deptList);
        console.log(`✅ Loaded ${deptList.length} departments`);
        
        // Find user's department
        const deptId = user?.department;
        if (deptId) {
          const userDept = deptList.find(d => d._id === deptId || d.id === deptId);
          if (userDept?.departmentName || userDept?.name) {
            setUserDepartmentName(userDept.departmentName || userDept.name);
          }
        }
      }
    } catch (error) {
      console.log("Could not fetch departments:", error.message);
      // Try alternative endpoint
      try {
        const deptRes2 = await axios.get('/departments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(deptRes2.data)) {
          setDepartments(deptRes2.data);
          console.log(`✅ Loaded ${deptRes2.data.length} departments from alt endpoint`);
        }
      } catch (error2) {
        console.log("Alternative endpoint also failed");
      }
    } finally {
      setDepartmentsLoading(false);
    }
    
    // Fetch job roles
    try {
      setJobRolesLoading(true);
      const rolesRes = await axios.get('/api/job-roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(rolesRes.data) || Array.isArray(rolesRes.data?.jobRoles)) {
        const rolesList = Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.jobRoles;
        setJobRoles(rolesList);
        console.log(`✅ Loaded ${rolesList.length} job roles`);
        
        // Find user's job role
        const roleId = user?.jobRole || user?.role;
        if (roleId) {
          const userRole = rolesList.find(r => r._id === roleId || r.id === roleId);
          if (userRole?.roleName || userRole?.name) {
            setUserJobRoleName(userRole.roleName || userRole.name);
          }
        }
      }
    } catch (error) {
      console.log("Could not fetch job roles:", error.message);
      // Try alternative endpoint
      try {
        const rolesRes2 = await axios.get('/job-roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(rolesRes2.data)) {
          setJobRoles(rolesRes2.data);
          console.log(`✅ Loaded ${rolesRes2.data.length} job roles from alt endpoint`);
        }
      } catch (error2) {
        console.log("Alternative endpoint also failed");
      }
    } finally {
      setJobRolesLoading(false);
    }
  };

  // ✅ SMART DISPLAY FUNCTION: Show names instead of IDs
  const getDisplayName = (id, type = 'department') => {
    if (!id) return 'N/A';
    
    // If ID is short or looks like a name, return as is
    if (id.length < 10 || id.includes(' ') || !id.includes('6980')) {
      return id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
    }
    
    // Try to find in loaded data
    let foundItem = null;
    
    switch(type) {
      case 'department':
        foundItem = departments.find(d => d._id === id || d.id === id);
        if (foundItem) return foundItem.departmentName || foundItem.name || `Dept (${id.substring(0, 8)}...)`;
        break;
        
      case 'company':
        foundItem = companies.find(c => c._id === id || c.id === id);
        if (foundItem) return foundItem.companyName || foundItem.name || `Co (${id.substring(0, 8)}...)`;
        break;
        
      case 'jobRole':
        foundItem = jobRoles.find(r => r._id === id || r.id === id);
        if (foundItem) return foundItem.roleName || foundItem.name || `Role (${id.substring(0, 8)}...)`;
        break;
    }
    
    // If not found, return truncated ID
    return `${type} (${id.substring(0, 8)}...)`;
  };

  // ✅ FALLBACK: Check localStorage for names
  const checkLocalStorageForNames = () => {
    console.log("🔍 Checking localStorage for names...");
    
    // Check if we have company name
    if (companyDetails?.companyName && !companyDetails.companyName.includes('...')) {
      setUserCompanyName(companyDetails.companyName);
    } else {
      // Try to get from user object
      const userCompanyName = user?.companyName || user?.companyDetails?.companyName;
      if (userCompanyName) {
        setUserCompanyName(userCompanyName);
      }
    }
    
    // Check for department name in user object
    if (user?.departmentName) {
      setUserDepartmentName(user.departmentName);
    } else if (user?.department && user.department.length < 20) {
      // If department field is short, it might be a name already
      setUserDepartmentName(user.department);
    }
    
    // Check for job role name in user object
    if (user?.jobRoleName || user?.roleName) {
      setUserJobRoleName(user.jobRoleName || user.roleName);
    } else if (user?.jobRole && user.jobRole.length < 20) {
      // If jobRole field is short, it might be a name already
      setUserJobRoleName(user.jobRole);
    } else if (user?.role && user.role.length < 20) {
      setUserJobRoleName(user.role);
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
      const res = await axios.get("/leaves/status");
      const list = res.data.leaves || [];
      setLeaves(list);
      calculateStats(list);
      
      if (showRefresh) {
        setNotification({
          message: "Leaves data refreshed!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
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
    const loadAllData = async () => {
      console.log("🚀 Starting data load...");
      
      // 1. First check localStorage
      checkLocalStorageForNames();
      
      // 2. Try direct ID lookup
      await extractAndFetchDetails();
      
      // 3. Fetch all master data in parallel
      await fetchAllMasterData();
      
      // 4. Fetch leaves
      await fetchLeaves();
      
      console.log("✅ All data loaded");
    };
    
    loadAllData();
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

  // Refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    await Promise.all([
      extractAndFetchDetails(),
      fetchAllMasterData(),
      fetchLeaves(true)
    ]);
    setRefreshing(false);
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
            Fetching: Company, Department, and Job Role information
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
            
            {/* User Info Display - WITH MULTIPLE SOURCES */}
            <div className="MyLeaves-user-info">
              <div className="MyLeaves-user-info-tags">
                <span className="MyLeaves-user-tag">
                  <FiUser size={12} />
                  {user?.name || 'User'}
                </span>
                <span className="MyLeaves-user-tag MyLeaves-tag-role">
                  <FiBriefcase size={12} />
                  {userJobRoleName}
                  {jobRolesLoading && <span className="MyLeaves-loading-dot"> ...</span>}
                </span>
                <span className="MyLeaves-user-tag MyLeaves-tag-dept">
                  <FiUsers size={12} />
                  {userDepartmentName}
                  {departmentsLoading && <span className="MyLeaves-loading-dot"> ...</span>}
                </span>
                <span className="MyLeaves-user-tag MyLeaves-tag-company">
                  <FiBriefcase size={12} />
                  {userCompanyName}
                  {companiesLoading && <span className="MyLeaves-loading-dot"> ...</span>}
                </span>
              </div>
              
              {/* Status indicator */}
              <div className="MyLeaves-status-indicator">
                {jobRolesLoading || departmentsLoading || companiesLoading ? (
                  <span className="MyLeaves-status-loading">
                    <FiRefreshCw className="MyLeaves-spin" size={12} />
                    Loading details...
                  </span>
                ) : (
                  <span className="MyLeaves-status-ready">
                    <FiCheckCircle size={12} />
                    Details loaded
                  </span>
                )}
              </div>
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
              onClick={refreshAllData}
              disabled={refreshing || jobRolesLoading || departmentsLoading || companiesLoading}
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
        
        {/* Information Card with Details */}
        <div className="MyLeaves-info-card">
          <div className="MyLeaves-info-header">
            <h3>
              <FiInfo className="MyLeaves-info-icon" />
              Employee Details
            </h3>
            <button 
              className="MyLeaves-info-refresh-btn"
              onClick={refreshAllData}
              disabled={jobRolesLoading || departmentsLoading || companiesLoading}
              title="Refresh details"
            >
              <FiRefreshCw size={12} />
            </button>
          </div>
          
          <div className="MyLeaves-info-content">
            <div className="MyLeaves-info-row">
              <div className="MyLeaves-info-item">
                <div className="MyLeaves-info-label">
                  <FiBriefcase size={12} />
                  <span>Job Role:</span>
                </div>
                <div className="MyLeaves-info-value">
                  {userJobRoleName}
                  {user?.jobRole && user.jobRole.length > 20 && (
                    <span className="MyLeaves-id-hint" title={`ID: ${user.jobRole}`}>
                      (ID based)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="MyLeaves-info-item">
                <div className="MyLeaves-info-label">
                  <FiUsers size={12} />
                  <span>Department:</span>
                </div>
                <div className="MyLeaves-info-value">
                  {userDepartmentName}
                  {user?.department && user.department.length > 20 && (
                    <span className="MyLeaves-id-hint" title={`ID: ${user.department}`}>
                      (ID based)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="MyLeaves-info-row">
              <div className="MyLeaves-info-item">
                <div className="MyLeaves-info-label">
                  <FiBriefcase size={12} />
                  <span>Company:</span>
                </div>
                <div className="MyLeaves-info-value">
                  {userCompanyName}
                  {companyDetails?._id && companyDetails._id.length > 20 && (
                    <span className="MyLeaves-id-hint" title={`ID: ${companyDetails._id}`}>
                      (ID: {companyDetails._id.substring(0, 8)}...)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="MyLeaves-info-item">
                <div className="MyLeaves-info-label">
                  <FiUser size={12} />
                  <span>Employee ID:</span>
                </div>
                <div className="MyLeaves-info-value">
                  {user?.employeeId || user?.empId || user?._id?.substring(0, 8) || 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Data Source Info */}
            <div className="MyLeaves-data-source">
              <FiInfo size={10} />
              <span>
                {jobRoles.length > 0 && departments.length > 0 && companies.length > 0 
                  ? `Data: ${jobRoles.length} roles, ${departments.length} depts, ${companies.length} companies loaded`
                  : 'Fetching detailed information...'}
              </span>
            </div>
          </div>
          
          <div className="MyLeaves-info-footer">
            <button 
              className="MyLeaves-force-fetch-btn"
              onClick={extractAndFetchDetails}
              title="Try to fetch names from IDs"
            >
              <FiCornerUpLeft size={12} />
              Fetch names from IDs
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

            {/* Results Count with User Info */}
            <div className="MyLeaves-results-header">
              <h3 className="MyLeaves-results-count">
                Showing {filteredLeaves.length} of {leaves.length} records
              </h3>
              <div className="MyLeaves-user-context">
                <span className="MyLeaves-context-item">
                  <FiBriefcase size={12} />
                  {userJobRoleName}
                </span>
                <span className="MyLeaves-context-item">
                  <FiUsers size={12} />
                  {userDepartmentName}
                </span>
                <span className="MyLeaves-context-item">
                  <FiBriefcase size={12} />
                  {userCompanyName}
                </span>
              </div>
            </div>

            {/* Table/Mobile View - YOUR EXISTING CODE HERE */}
            {/* ... */}
            
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
              
              {/* Applicant Info with Smart Display */}
              <div className="MyLeaves-applicant-info">
                <div className="MyLeaves-applicant-card">
                  <div className="MyLeaves-applicant-header">
                    <FiUser className="MyLeaves-applicant-icon" />
                    <h4>Applicant Information</h4>
                    <span className="MyLeaves-applicant-status">
                      {jobRolesLoading || departmentsLoading ? 'Loading...' : 'Ready'}
                    </span>
                  </div>
                  
                  <div className="MyLeaves-applicant-grid">
                    <div className="MyLeaves-applicant-field">
                      <label>Full Name</label>
                      <div className="MyLeaves-applicant-value">{user?.name || 'N/A'}</div>
                    </div>
                    
                    <div className="MyLeaves-applicant-field">
                      <label>Job Role</label>
                      <div className="MyLeaves-applicant-value">
                        {userJobRoleName}
                        {user?.jobRole && user.jobRole.length > 20 && (
                          <div className="MyLeaves-field-note">
                            ID: {user.jobRole.substring(0, 12)}...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="MyLeaves-applicant-field">
                      <label>Department</label>
                      <div className="MyLeaves-applicant-value">
                        {userDepartmentName}
                        {user?.department && user.department.length > 20 && (
                          <div className="MyLeaves-field-note">
                            ID: {user.department.substring(0, 12)}...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="MyLeaves-applicant-field">
                      <label>Company</label>
                      <div className="MyLeaves-applicant-value">
                        {userCompanyName}
                        {companyDetails?._id && (
                          <div className="MyLeaves-field-note">
                            ID: {companyDetails._id.substring(0, 12)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="MyLeaves-applicant-footer">
                    <button 
                      className="MyLeaves-update-details-btn"
                      onClick={refreshAllData}
                    >
                      <FiRefreshCw size={12} />
                      Update Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Leave Application Form */}
              <div className="MyLeaves-form">
                {/* Your existing form code here */}
                {/* ... */}
              </div>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default MyLeaves;