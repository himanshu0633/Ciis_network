import React, { useState, useEffect, useMemo } from "react";
import axios from "../../utils/axiosConfig";
import "../Css/CreateAlerts.css";
import CIISLoader from '../../Loader/CIISLoader';

// Icons as React components
const FiAlertCircle = () => <span className="CreateAlert-icon">⚠️</span>;
const FiAlertTriangle = () => <span className="CreateAlert-icon">⚠️</span>;
const FiInfo = () => <span className="CreateAlert-icon">ℹ️</span>;
const FiUsers = () => <span className="CreateAlert-icon">👥</span>;
const FiUser = () => <span className="CreateAlert-icon">👤</span>;
const FiSearch = () => <span className="CreateAlert-icon">🔍</span>;
const FiCheck = () => <span className="CreateAlert-icon">✓</span>;
const FiX = () => <span className="CreateAlert-icon">✕</span>;
const FiSend = () => <span className="CreateAlert-icon">📤</span>;
const FiRefreshCw = () => <span className="CreateAlert-icon">🔄</span>;
const FiBell = () => <span className="CreateAlert-icon">🔔</span>;
const FiEye = () => <span className="CreateAlert-icon">👁️</span>;
const FiUserCheck = () => <span className="CreateAlert-icon">✅👤</span>;
const FiFilter = () => <span className="CreateAlert-icon">🔧</span>;
const FiPlus = () => <span className="CreateAlert-icon">➕</span>;

// Custom Components
const Badge = ({ children, badgeContent, color = "error", size = "small" }) => (
  <div className="CreateAlert-badge">
    {children}
    {badgeContent > 0 && (
      <span className={`CreateAlert-badge-content CreateAlert-badge-${color}`}>
        {badgeContent > 99 ? "99+" : badgeContent}
      </span>
    )}
  </div>
);

const Chip = ({ label, color, icon, onDelete, size = "medium", variant = "default", onClick }) => (
  <span 
    className={`CreateAlert-chip CreateAlert-chip-${size} CreateAlert-chip-${variant}`}
    style={{ 
      backgroundColor: variant === "outlined" ? "transparent" : color ? `${color}20` : '#667eea20',
      color: color || '#667eea',
      borderColor: color ? `${color}30` : '#667eea30'
    }}
    onClick={onClick}
  >
    {icon && <span className="CreateAlert-chip-icon">{icon}</span>}
    {label}
    {onDelete && (
      <button className="CreateAlert-chip-delete" onClick={onDelete}>
        ×
      </button>
    )}
  </span>
);

const Avatar = ({ children, color, size = "medium" }) => (
  <div 
    className={`CreateAlert-avatar CreateAlert-avatar-${size}`}
    style={{ 
      backgroundColor: color ? `${color}20` : '#667eea20',
      color: color || '#667eea'
    }}
  >
    {children}
  </div>
);

const Tooltip = ({ title, children }) => (
  <div className="CreateAlert-tooltip">
    {children}
    <span className="CreateAlert-tooltip-text">{title}</span>
  </div>
);

const Checkbox = ({ checked, onChange }) => (
  <label className="CreateAlert-checkbox">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      className="CreateAlert-checkbox-input"
    />
    <span className="CreateAlert-checkbox-checkmark" />
  </label>
);

const CreateAlert = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [role, setRole] = useState("");
  const [alerts, setAlerts] = useState([]);
  
  // Form state
  const [form, setForm] = useState({
    type: "info",
    message: "",
    assignedUsers: [],
    assignedGroups: [],
  });
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("all");
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warning: 0,
    error: 0,
    unread: 0,
  });
  
  // UI states
  const [notification, setNotification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem("token");
  
  // FIXED: Better headers with token validation
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    console.log("Current token:", token ? "Present" : "Missing");
    
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch users from company-users API
  const fetchUsers = async () => {
    try {
      console.log("========== FETCHING USERS ==========");
      console.log("API URL: /users/company-users");
      
      const response = await axios.get("/users/company-users", getHeaders());
      
      console.log("✅ FULL RESPONSE DATA:", response.data);
      
      let fetchedUsers = [];
      
      if (response.data) {
        // Your API returns users in message object
        if (response.data.message) {
          if (Array.isArray(response.data.message)) {
            fetchedUsers = response.data.message;
          } else if (response.data.message.users && Array.isArray(response.data.message.users)) {
            fetchedUsers = response.data.message.users;
          } else if (response.data.message.data && Array.isArray(response.data.message.data)) {
            fetchedUsers = response.data.message.data;
          } else if (response.data.message.employees && Array.isArray(response.data.message.employees)) {
            fetchedUsers = response.data.message.employees;
          }
        } else if (Array.isArray(response.data)) {
          fetchedUsers = response.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          fetchedUsers = response.data.users;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          fetchedUsers = response.data.data;
        }
      }
      
      console.log("✅ FINAL FETCHED USERS COUNT:", fetchedUsers.length);
      setUsers(fetchedUsers);
      
    } catch (error) {
      console.error("❌ ERROR FETCHING USERS:", error);
      if (error.response?.status === 403) {
        setNotification({
          message: "Permission denied. Please check your access rights.",
          type: "error"
        });
      }
      setUsers([]);
    }
  };

  // Fetch groups
  const fetchGroups = async () => {
    try {
      console.log("========== FETCHING GROUPS ==========");
      const response = await axios.get("/groups", getHeaders());
      
      let fetchedGroups = [];
      if (response.data?.groups && Array.isArray(response.data.groups)) {
        fetchedGroups = response.data.groups;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedGroups = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedGroups = response.data;
      } else if (response.data?.message) {
        if (Array.isArray(response.data.message)) {
          fetchedGroups = response.data.message;
        } else if (response.data.message.groups && Array.isArray(response.data.message.groups)) {
          fetchedGroups = response.data.message.groups;
        }
      }
      
      console.log("Fetched groups:", fetchedGroups.length);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    }
  };

  // Fetch alerts for stats
  const fetchAlerts = async () => {
    try {
      const response = await axios.get("/alerts", getHeaders());
      
      let fetchedAlerts = [];
      if (response.data?.alerts && Array.isArray(response.data.alerts)) {
        fetchedAlerts = response.data.alerts;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        fetchedAlerts = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedAlerts = response.data;
      } else if (response.data?.message && Array.isArray(response.data.message)) {
        fetchedAlerts = response.data.message;
      }
      
      setAlerts(fetchedAlerts);
      calculateStats(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlerts([]);
    }
  };

  const calculateStats = (data) => {
    const info = data.filter((a) => a.type === "info").length;
    const warning = data.filter((a) => a.type === "warning").length;
    const error = data.filter((a) => a.type === "error").length;
    const unread = data.filter((a) => !a.readBy?.includes(localStorage.getItem("userId"))).length;
    
    setStats({
      total: data.length,
      info,
      warning,
      error,
      unread,
    });
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      
      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification({
          message: "No authentication token found. Please login again.",
          type: "error"
        });
        setPageLoading(false);
        return;
      }
      
      // Get user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          console.log("Parsed user:", parsed);
          
          const userRole = parsed.role || 
                          parsed.user?.role || 
                          parsed.userRole || 
                          parsed.user?.userRole || 
                          "";
          
          setRole(userRole.toLowerCase());
          
          const userId = parsed._id || 
                        parsed.id || 
                        parsed.user?._id || 
                        parsed.user?.id || 
                        "";
                        
          if (userId) {
            localStorage.setItem("userId", userId);
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      }
      
      // Fetch all data
      await Promise.all([fetchUsers(), fetchGroups(), fetchAlerts()]);
      setPageLoading(false);
    };
    
    loadData();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchGroups(), fetchAlerts()]);
    setRefreshing(false);
  };

  // Form handlers
  const handleUserSelect = (userId) => {
    setForm(prev => {
      const isSelected = prev.assignedUsers.includes(userId);
      if (isSelected) {
        return { ...prev, assignedUsers: prev.assignedUsers.filter(id => id !== userId) };
      } else {
        return { ...prev, assignedUsers: [...prev.assignedUsers, userId] };
      }
    });
  };

  const handleGroupSelect = (groupId) => {
    setForm(prev => {
      const isSelected = prev.assignedGroups.includes(groupId);
      if (isSelected) {
        return { ...prev, assignedGroups: prev.assignedGroups.filter(id => id !== groupId) };
      } else {
        return { ...prev, assignedGroups: [...prev.assignedGroups, groupId] };
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) return;
    
    if (form.assignedUsers.length === filteredUsers.length) {
      setForm(prev => ({ ...prev, assignedUsers: [] }));
    } else {
      setForm(prev => ({ ...prev, assignedUsers: filteredUsers.map(u => u._id || u.id) }));
    }
  };

  const handleSelectAllGroups = () => {
    if (!Array.isArray(filteredGroups) || filteredGroups.length === 0) return;
    
    if (form.assignedGroups.length === filteredGroups.length) {
      setForm(prev => ({ ...prev, assignedGroups: [] }));
    } else {
      setForm(prev => ({ ...prev, assignedGroups: filteredGroups.map(g => g._id || g.id) }));
    }
  };

  // FIXED: Enhanced handleSubmit with better error handling
  const handleSubmit = async () => {
    if (!form.message.trim()) {
      return setNotification({ 
        message: "Please enter an alert message", 
        type: "error" 
      });
    }

    // Check token
    const token = localStorage.getItem("token");
    if (!token) {
      return setNotification({
        message: "You are not logged in. Please login again.",
        type: "error"
      });
    }

    setLoading(true);
    try {
      const payload = {
        type: form.type,
        message: form.message.trim(),
        assignedUsers: form.assignedUsers,
        assignedGroups: form.assignedGroups,
      };

      console.log("Submitting alert with payload:", payload);
      console.log("Using token:", token ? "Present" : "Missing");
      
      // Try different endpoint variations
      let response;
      try {
        // First try with /alerts
        response = await axios.post("/alerts", payload, getHeaders());
      } catch (error) {
        if (error.response?.status === 403) {
          // If 403, try with /api/alerts
          console.log("Trying alternative endpoint: /api/alerts");
          response = await axios.post("/api/alerts", payload, getHeaders());
        } else {
          throw error;
        }
      }
      
      console.log("Alert created successfully:", response.data);
      
      setNotification({ 
        message: "Alert created successfully!", 
        type: "success" 
      });

      // Refresh alerts to update stats
      await fetchAlerts();

      // Reset form
      setForm({
        type: "info",
        message: "",
        assignedUsers: [],
        assignedGroups: [],
      });
      setUserSearch("");
      setGroupSearch("");
      
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error("Error creating alert:", error);
      
      // Better error messages based on status code
      let errorMessage = "Failed to create alert";
      if (error.response) {
        console.log("Error response:", error.response.data);
        console.log("Error status:", error.response.status);
        
        switch(error.response.status) {
          case 401:
            errorMessage = "Authentication failed. Please login again.";
            break;
          case 403:
            errorMessage = "You don't have permission to create alerts. Please check your user role.";
            break;
          case 400:
            errorMessage = error.response.data?.message || "Invalid alert data";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || `Error ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setNotification({ 
        message: errorMessage, 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      type: "info",
      message: "",
      assignedUsers: [],
      assignedGroups: [],
    });
    setUserSearch("");
    setGroupSearch("");
  };

  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) {
      return [];
    }
    
    if (!userSearch) {
      return users;
    }
    
    const query = userSearch.toLowerCase();
    return users.filter(user => {
      const name = (user.name || user.username || user.fullName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const role = (user.role || user.userRole || '').toLowerCase();
      const department = (user.department || user.departmentName || '').toLowerCase();
      const employeeId = (user.employeeId || user.empId || '').toLowerCase();
      
      return name.includes(query) || 
             email.includes(query) || 
             role.includes(query) || 
             department.includes(query) ||
             employeeId.includes(query);
    });
  }, [users, userSearch]);

  // Filtered groups based on search
  const filteredGroups = useMemo(() => {
    if (!Array.isArray(groups) || groups.length === 0) return [];
    if (!groupSearch) return groups;
    
    const query = groupSearch.toLowerCase();
    return groups.filter(group => 
      (group.name?.toLowerCase() || '').includes(query) ||
      (group.description?.toLowerCase() || '').includes(query)
    );
  }, [groups, groupSearch]);

  // Get user by ID
  const getUserById = (userId) => {
    if (!Array.isArray(users) || users.length === 0) {
      return { name: "Unknown User", email: "" };
    }
    const user = users.find(u => u._id === userId || u.id === userId);
    return user || { name: "Unknown User", email: "" };
  };

  // Get group by ID
  const getGroupById = (groupId) => {
    if (!Array.isArray(groups) || groups.length === 0) return { name: "Unknown Group" };
    return groups.find(g => g._id === groupId || g.id === groupId) || { name: "Unknown Group" };
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "error": return "#EF5350";
      case "warning": return "#FFA726";
      case "success": return "#66BB6A";
      default: return "#667eea";
    }
  };

  if (pageLoading) {
    return <CIISLoader />;
  }

  return (
    <div className="CreateAlert-container">
      {/* Header */}
      <div className="CreateAlert-gradient-header">
        <div className="CreateAlert-header-content">
          <div className="CreateAlert-header-text">
            <h1 className="CreateAlert-title">Create Alert</h1>
            <p className="CreateAlert-subtitle">Create and send notifications to users and groups</p>
          </div>
          <div className="CreateAlert-header-actions">
            <Tooltip title="Refresh">
              <button 
                className={`CreateAlert-icon-button CreateAlert-refresh-button ${refreshing ? 'CreateAlert-refreshing' : ''}`}
                onClick={handleRefresh} 
                disabled={refreshing}
              >
                <FiRefreshCw />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Stats & Filters Section */}
      <div className="CreateAlert-stats-filters">
        {/* Search Bar */}
        <div className="CreateAlert-search-container">
          <div className="CreateAlert-search-field">
            <FiSearch />
            <input
              type="text"
              placeholder="Search alerts by message or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="CreateAlert-search-input"
            />
            {searchQuery && (
              <button className="CreateAlert-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="CreateAlert-view-mode-container">
          <div className="CreateAlert-view-mode-card">
            <span className="CreateAlert-view-mode-label">View:</span>
            <div className="CreateAlert-toggle-button-group">
              <button 
                className={`CreateAlert-toggle-button ${viewMode === 'all' ? 'CreateAlert-toggle-button-active' : ''}`}
                onClick={() => setViewMode('all')}
              >
                <FiEye />
                <span>All</span>
              </button>
              <button 
                className={`CreateAlert-toggle-button ${viewMode === 'assigned' ? 'CreateAlert-toggle-button-active' : ''}`}
                onClick={() => setViewMode('assigned')}
              >
                <FiUserCheck />
                <span>Assigned</span>
              </button>
              <button 
                className={`CreateAlert-toggle-button ${viewMode === 'unread' ? 'CreateAlert-toggle-button-active' : ''}`}
                onClick={() => setViewMode('unread')}
              >
                <Badge badgeContent={stats.unread}>
                  <FiBell />
                </Badge>
                <span>Unread</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="CreateAlert-stats-grid">
          {[
            { 
              key: "total", 
              label: "Total Alerts", 
              color: "#667eea", 
              icon: <FiBell />,
              value: stats.total,
              active: filterType === "all" && viewMode === "all"
            },
            { 
              key: "info", 
              label: "Information", 
              color: "#29B6F6", 
              icon: <FiInfo />,
              value: stats.info,
              active: filterType === "info"
            },
            { 
              key: "warning", 
              label: "Warnings", 
              color: "#FFA726", 
              icon: <FiAlertTriangle />,
              value: stats.warning,
              active: filterType === "warning"
            },
            { 
              key: "error", 
              label: "Errors", 
              color: "#EF5350", 
              icon: <FiAlertCircle />,
              value: stats.error,
              active: filterType === "error"
            },
          ]
          .map((s) => (
            <div 
              key={s.key} 
              className={`CreateAlert-stat-card ${s.active ? 'CreateAlert-stat-card-active' : ''}`}
              style={{ borderTopColor: s.color }}
              onClick={() => {
                setFilterType(s.key === "total" ? "all" : s.key);
                setViewMode("all");
              }}
            >
              <div className="CreateAlert-stat-content">
                <div className="CreateAlert-stat-text">
                  <span className="CreateAlert-stat-label">{s.label}</span>
                  <h3 className="CreateAlert-stat-value">{s.value}</h3>
                </div>
                <Avatar color={s.color}>
                  {s.icon}
                </Avatar>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Chip */}
        <div className="CreateAlert-filter-chip-container">
          <Chip
            icon={<FiFilter />}
            label={`Filter: ${filterType === 'all' ? 'All Types' : filterType}`}
            onClick={() => setFilterType('all')}
            variant="outlined"
          />
        </div>
      </div>

      {/* Create Alert Form */}
      <div className="CreateAlert-form-container">
        {/* Alert Type Selection */}
        <div className="CreateAlert-form-section">
          <h3 className="CreateAlert-section-title">Alert Type</h3>
          <div className="CreateAlert-type-grid">
            {[
              { value: "info", label: "Information", color: "#29B6F6", icon: <FiInfo /> },
              { value: "warning", label: "Warning", color: "#FFA726", icon: <FiAlertTriangle /> },
              { value: "error", label: "Error / Critical", color: "#EF5350", icon: <FiAlertCircle /> }
            ].map(type => (
              <div
                key={type.value}
                className={`CreateAlert-type-card ${form.type === type.value ? 'CreateAlert-type-selected' : ''}`}
                style={{ borderColor: form.type === type.value ? type.color : 'var(--gray-300)' }}
                onClick={() => setForm(prev => ({ ...prev, type: type.value }))}
              >
                <div className="CreateAlert-type-icon" style={{ color: type.color }}>
                  {type.icon}
                </div>
                <div className="CreateAlert-type-info">
                  <h4 style={{ color: type.color }}>{type.label}</h4>
                  <p className="CreateAlert-type-desc">
                    {type.value === "info" && "General updates and announcements"}
                    {type.value === "warning" && "Important notices requiring attention"}
                    {type.value === "error" && "Urgent issues requiring immediate action"}
                  </p>
                </div>
                {form.type === type.value && (
                  <span className="CreateAlert-type-check">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="CreateAlert-form-section">
          <h3 className="CreateAlert-section-title">
            Alert Message <span className="CreateAlert-required">*</span>
          </h3>
          <textarea
            className="CreateAlert-textarea"
            rows="5"
            value={form.message}
            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Enter your alert message here..."
          />
          <div className="CreateAlert-message-counter">
            {form.message.length} / 500 characters
          </div>
        </div>

        {/* User Assignment */}
        <div className="CreateAlert-form-section">
          <div className="CreateAlert-section-header">
            <h3 className="CreateAlert-section-title">Assign to Users</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="CreateAlert-user-count" style={{ color: '#666', fontSize: '14px' }}>
                Total: {users.length}
              </span>
              {Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
                <button 
                  className="CreateAlert-select-all"
                  onClick={handleSelectAllUsers}
                >
                  {form.assignedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>
          
          {/* Selected Users */}
          {Array.isArray(form.assignedUsers) && form.assignedUsers.length > 0 && (
            <div className="CreateAlert-selected-items">
              <span className="CreateAlert-selected-label">Selected ({form.assignedUsers.length}):</span>
              <div className="CreateAlert-selected-chips">
                {form.assignedUsers.map(userId => {
                  const user = getUserById(userId);
                  return (
                    <Chip
                      key={userId}
                      label={user.name || user.email || user.username || 'Unknown User'}
                      onDelete={() => handleUserSelect(userId)}
                      color="#667eea"
                      size="small"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* User Search */}
          <div className="CreateAlert-search-field">
            <FiSearch />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="CreateAlert-search-input"
            />
          </div>

          {/* Users List */}
          <div className="CreateAlert-users-list">
            {!Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
              <div className="CreateAlert-empty-list">
                {users.length === 0 ? (
                  <>
                    <p>No users found in the company.</p>
                    <button 
                      className="CreateAlert-retry-button"
                      onClick={fetchUsers}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Retry Fetching Users
                    </button>
                  </>
                ) : (
                  'No users match your search'
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id || user.id || Math.random()}
                  className={`CreateAlert-user-item ${Array.isArray(form.assignedUsers) && (form.assignedUsers.includes(user._id) || form.assignedUsers.includes(user.id)) ? 'CreateAlert-user-item-selected' : ''}`}
                  onClick={() => handleUserSelect(user._id || user.id)}
                >
                  <Checkbox
                    checked={Array.isArray(form.assignedUsers) && (form.assignedUsers.includes(user._id) || form.assignedUsers.includes(user.id))}
                    onChange={() => handleUserSelect(user._id || user.id)}
                  />
                  <Avatar size="small" color="#667eea">
                    {user.name?.charAt(0) || user.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </Avatar>
                  <div className="CreateAlert-user-info">
                    <p className="CreateAlert-user-name">
                      {user.name || user.username || 'No Name'}
                    </p>
                    <p className="CreateAlert-user-details">
                      {user.email || 'No Email'} 
                      {user.role && ` • ${user.role}`}
                      {user.department && ` • ${user.department}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Group Assignment */}
        <div className="CreateAlert-form-section">
          <div className="CreateAlert-section-header">
            <h3 className="CreateAlert-section-title">Assign to Groups</h3>
            {Array.isArray(filteredGroups) && filteredGroups.length > 0 && (
              <button 
                className="CreateAlert-select-all"
                onClick={handleSelectAllGroups}
              >
                {form.assignedGroups.length === filteredGroups.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Selected Groups */}
          {Array.isArray(form.assignedGroups) && form.assignedGroups.length > 0 && (
            <div className="CreateAlert-selected-items">
              <span className="CreateAlert-selected-label">Selected ({form.assignedGroups.length}):</span>
              <div className="CreateAlert-selected-chips">
                {form.assignedGroups.map(groupId => {
                  const group = getGroupById(groupId);
                  return (
                    <Chip
                      key={groupId}
                      label={group.name || group.groupName || 'Unknown Group'}
                      onDelete={() => handleGroupSelect(groupId)}
                      color="#764ba2"
                      size="small"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Group Search */}
          <div className="CreateAlert-search-field">
            <FiSearch />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="CreateAlert-search-input"
            />
          </div>

          {/* Groups List */}
          <div className="CreateAlert-groups-list">
            {!Array.isArray(filteredGroups) || filteredGroups.length === 0 ? (
              <div className="CreateAlert-empty-list">
                {groups.length === 0 ? (
                  <>
                    <p>No groups found.</p>
                    <button 
                      className="CreateAlert-retry-button"
                      onClick={fetchGroups}
                      style={{
                        background: '#764ba2',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Retry Fetching Groups
                    </button>
                  </>
                ) : (
                  'No groups match your search'
                )}
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group._id || group.id || Math.random()}
                  className={`CreateAlert-group-item ${Array.isArray(form.assignedGroups) && (form.assignedGroups.includes(group._id) || form.assignedGroups.includes(group.id)) ? 'CreateAlert-group-item-selected' : ''}`}
                  onClick={() => handleGroupSelect(group._id || group.id)}
                >
                  <Checkbox
                    checked={Array.isArray(form.assignedGroups) && (form.assignedGroups.includes(group._id) || form.assignedGroups.includes(group.id))}
                    onChange={() => handleGroupSelect(group._id || group.id)}
                  />
                  <Avatar size="small" color="#764ba2">
                    <FiUsers />
                  </Avatar>
                  <div className="CreateAlert-group-info">
                    <p className="CreateAlert-group-name">{group.name || group.groupName || 'Unnamed Group'}</p>
                    {group.description && (
                      <p className="CreateAlert-group-description">{group.description}</p>
                    )}
                  </div>
                  {group.members?.length > 0 && (
                    <Chip
                      label={`${group.members.length} members`}
                      size="small"
                      variant="outlined"
                      color="#764ba2"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="CreateAlert-actions">
          <button
            className="CreateAlert-button CreateAlert-button-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
          <button
            className="CreateAlert-button CreateAlert-button-primary"
            onClick={handleSubmit}
            disabled={loading || !form.message.trim()}
          >
            {loading ? (
              <>
                <span className="CreateAlert-spinner" />
                Creating...
              </>
            ) : (
              <>
                <FiSend />
                Create Alert
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="CreateAlert-notification">
          <div 
            className={`CreateAlert-notification-card CreateAlert-notification-${notification.type}`}
            style={{ 
              background: `linear-gradient(135deg, ${getSeverityColor(notification.type)} 0%, ${getSeverityColor(notification.type)}80 100%)`
            }}
          >
            <div className="CreateAlert-notification-content">
              {notification.type === "success" ? <FiCheck /> : <FiAlertCircle />}
              <div>
                <p className="CreateAlert-notification-title">
                  {notification.type === "error" ? "Error" : "Success"}
                </p>
                <p className="CreateAlert-notification-message">{notification.message}</p>
              </div>
              <button 
                className="CreateAlert-notification-close"
                onClick={() => setNotification(null)}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAlert;