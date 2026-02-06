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
  FiBriefcase
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

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
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
  });
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    title: "",
    items: [],
  });
  const [currentUserDepartment, setCurrentUserDepartment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserCompanyId, setCurrentUserCompanyId] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchCompanyUsers();
  }, []);

  useEffect(() => {
    if (currentUserCompanyId) {
      fetchLeaves();
    }
  }, [filterDate, statusFilter, leaveTypeFilter, currentUserCompanyId]);

  const fetchCompanyUsers = async () => {
    try {
      console.log("🔄 Fetching department users...");
      const res = await axios.get('/users/department-users');
      
      let usersData = [];
      
      if (res.data && res.data.success) {
        if (res.data.message && res.data.message.users && Array.isArray(res.data.message.users)) {
          usersData = res.data.message.users;
          console.log(`✅ Found ${usersData.length} users in data.message.users`);
        }
        else if (res.data.users && Array.isArray(res.data.users)) {
          usersData = res.data.users;
          console.log(`✅ Found ${usersData.length} users in data.users`);
        }
        else if (res.data.message && Array.isArray(res.data.message)) {
          usersData = res.data.message;
          console.log(`✅ Found ${usersData.length} users in message array`);
        }
        else if (res.data.data && Array.isArray(res.data.data)) {
          usersData = res.data.data;
          console.log(`✅ Found ${usersData.length} users in data.data`);
        }
        else if (Array.isArray(res.data)) {
          usersData = res.data;
          console.log(`✅ Found ${usersData.length} users in data array`);
        }
        else {
          console.log("⚠️ No users array found. Full response:", res.data);
        }
      }
      
      console.log("👥 Processed users data:", usersData.map(u => ({
        id: u.id || u._id,
        name: u.name,
        email: u.email,
        employeeType: u.employeeType || 'full-time',
        department: u.department,
        jobRole: u.jobRole
      })));
      
      setAllUsers(usersData);
      
      // Get current user info
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log("👤 Current user from localStorage:", user);
        
        const userId = user._id || user.id || '';
        const companyId = user.company || user.companyId || '';
        const department = user.department || '';
        
        setCurrentUserId(userId);
        setCurrentUserCompanyId(companyId);
        setCurrentUserDepartment(department);
        
        // Add test users if no users found
        if (usersData.length === 0 && companyId) {
          console.log("⚠️ No users found, adding test data");
          const testUsers = [
            {
              id: 'test1',
              _id: 'test1',
              name: 'IT Manager',
              email: 'manager@gmail.com',
              employeeType: 'full-time',
              department: 'IT',
              jobRole: { _id: '6980f3cac3721b782411d904', name: 'Manager' }
            },
            {
              id: 'test2',
              _id: 'test2',
              name: 'Sales Executive',
              email: 'sales@ciisnetwork.com',
              employeeType: 'full-time',
              department: 'SALES',
              jobRole: { _id: 'user123', name: 'Employee' }
            }
          ];
          setAllUsers(testUsers);
        }
        
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
      
    } catch (err) {
      console.error("❌ Failed to load users", err);
      showSnackbar("Error loading users data", "error");
      
      // Add test data on error
      const testUsers = [
        {
          id: 'test1',
          _id: 'test1',
          name: 'IT Manager',
          email: 'manager@gmail.com',
          employeeType: 'full-time',
          department: 'IT',
          jobRole: { _id: '6980f3cac3721b782411d904', name: 'Manager' }
        },
        {
          id: 'test2',
          _id: 'test2',
          name: 'Sales Executive',
          email: 'sales@ciisnetwork.com',
          employeeType: 'full-time',
          department: 'SALES',
          jobRole: { _id: 'user123', name: 'Employee' }
        }
      ];
      setAllUsers(testUsers);
    }
  };

  const fetchLeaves = async () => {
    if (!currentUserCompanyId) {
      console.log("⚠️ No company ID, waiting for company data...");
      return;
    }
    
    setLoading(true);
    try {
      let url = '/leaves/all';
      const params = new URLSearchParams();
      
      // 🔧 Updated: Use company parameter instead of companyId
      params.append('company', currentUserCompanyId);
      
      if (filterDate) params.append('date', filterDate);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (leaveTypeFilter !== 'all') params.append('type', leaveTypeFilter);
      
      // 🔧 Remove department filter - show all departments
      if (currentUserDepartment) {
        params.append('department', currentUserDepartment);
      }
      
      if (params.toString()) url += `?${params}`;
      
      console.log("🌐 Fetching leaves from:", url);
      console.log("🏢 User department:", currentUserDepartment);
      console.log("👤 User ID:", currentUserId);
      console.log("🏢 Company ID:", currentUserCompanyId);
      
      const res = await axios.get(url);
      console.log("✅ Leaves API response:", res.data);
      
      // Process the response
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
        showSnackbar("No leaves found for your company", "info");
      } else {
        showSnackbar("Error loading leave data", "error");
      }
      
      setLeaves([]);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    } finally {
      setLoading(false);
    }
  };

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
    setSearchTerm("");
    setSelectedStat("All");
  };

  const exportData = () => {
    showSnackbar("Export feature coming soon!", "info");
  };

  const handleStatFilter = (type) => {
    setSelectedStat(prev => (prev === type ? 'All' : type));
    setStatusFilter(type === 'All' ? 'All' : type);
  };

  // 🔧 Everyone can modify now
  const canModify = true;

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

  const openStatusDialog = (leaveId, newStatus, userEmail, userName, userPhone, userId) => {
    if (userId === currentUserId) {
      showSnackbar("You cannot update the status of your own leave", "error");
      return;
    }
    
    // 🔧 Everyone can modify now
    setStatusDialog({
      open: true,
      leaveId,
      newStatus,
      remarks: "",
      userEmail,
      userName,
      userPhone,
      userId,
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
    });
  };

  const confirmStatusChange = async () => {
    const { leaveId, newStatus, remarks, userEmail, userName, userPhone, userId } = statusDialog;
    
    if (!leaveId || !newStatus) {
      showSnackbar("Invalid leave data", "error");
      return;
    }

    if (userId === currentUserId) {
      showSnackbar("You cannot update the status of your own leave", "error");
      closeStatusDialog();
      return;
    }

    try {
      console.log("🔄 Updating leave status:", leaveId, newStatus);
      
      const res = await axios.patch(`/leaves/status/${leaveId}`, {
        status: newStatus,
        remarks
      });
      
      if (res.data.message) {
        showSnackbar(`Leave ${newStatus.toLowerCase()} successfully`, "success");
        
        fetchLeaves();
        closeStatusDialog();
        
        if (userPhone) {
          setTimeout(() => {
            const whatsappLink = getWhatsAppLink(userPhone, userName, newStatus, remarks);
            showSnackbar(
              <span>
                <FiPhone style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'underline' }}
                >
                  Click to send WhatsApp notification
                </a>
              </span>,
              "info"
            );
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
      if (err.response?.status === 403) {
        showSnackbar("You don't have permission to update leave status", "error");
      } else if (err.response?.status === 400) {
        showSnackbar(err.response.data.error || "Invalid status value", "error");
      } else if (err.response?.status === 404) {
        showSnackbar("Leave not found", "error");
      } else {
        showSnackbar("Failed to update leave status", "error");
      }
    }
  };

  const handleDeleteLeave = async () => {
    try {
      const res = await axios.delete(`/leaves/${deleteDialog}`);
      
      if (res.data.message) {
        showSnackbar("Leave deleted successfully", "success");
        fetchLeaves();
        setDeleteDialog(null);
      }
    } catch (err) {
      console.error("Failed to delete leave", err);
      if (err.response?.status === 403) {
        showSnackbar("You don't have permission to delete this leave", "error");
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
          by: leave.approvedBy || 'System',
          role: 'System',
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
    return role.charAt(0).toUpperCase() + role.slice(1);
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

  const renderLeaveTable = (title, leavesData, showStatusColumn = true) => (
    <div className="leaves-table-container">
      <div className="table-header">
        <h3 className="table-title">{title} ({leavesData.length})</h3>
        <div className="company-badge">
          <FiBriefcase size={14} style={{ marginRight: '4px' }} />
          Company: {currentUserCompanyId ? currentUserCompanyId.substring(0, 8) + '...' : 'Loading...'}
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
                
                return (
                  <tr key={leave._id} className={getRowClass(leave.status)}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {getInitials(leave.user?.name)}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">
                            {leave.user?.name || "N/A"}
                          </div>
                          <div className="employee-email">
                            <FiMail size={12} style={{ marginRight: '4px' }} />
                            {leave.user?.email || "N/A"}
                          </div>
                          {leave.user?.phone && (
                            <div className="employee-phone">
                              <FiPhone size={12} style={{ marginRight: '4px' }} />
                              <a 
                                href={getWhatsAppLink(
                                  leave.user.phone, 
                                  leave.user.name, 
                                  leave.status, 
                                  leave.remarks
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#666', textDecoration: 'none' }}
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
                        <div className="date-separator">to</div>
                        <div className="date-range">
                          {formatDate(leave.endDate)}
                        </div>
                        <div className="days-badge">
                          {days} day{days > 1 ? 's' : ''}
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
                        {leave.approvedBy || "-"}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-history-button"
                        onClick={() => openHistoryDialog(leave)}
                      >
                        <FiList size={14} /> View History
                      </button>
                    </td>
                    <td>
                      <div className="actions-container">
                        {leave.status === 'Pending' ? (
                          <select
                            className="action-dropdown"
                            value={leave.status || "Pending"}
                            onChange={(e) => openStatusDialog(
                              leave._id, 
                              e.target.value, 
                              leave.user?.email,
                              leave.user?.name,
                              leave.user?.phone,
                              userId
                            )}
                            disabled={userId === currentUserId} // Only disable for own leaves
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        ) : (
                          <div className="status-info">
                            {leave.status}
                          </div>
                        )}
                        <button 
                          className="delete-button"
                          onClick={() => setDeleteDialog(leave._id)}
                          title="Delete Leave"
                        >
                          <FiTrash2 size={16} />
                        </button>
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
                        ? 'No pending leave requests'
                        : 'Try adjusting your filters or search criteria'
                      }
                    </p>
                    <button 
                      className="btn btn-contained"
                      onClick={fetchLeaves}
                      style={{ marginTop: '8px' }}
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

  if (loading && leaves.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading leave data...</p>
      </div>
    );
  }

  return (
    <div className="employee-leaves">
      {/* Header */}
      <div className="leaves-header">
        <div>
          <h1 className="leaves-title">Leave Management</h1>
          <p className="leaves-subtitle">
            Review and manage employee leave requests
            {currentUserDepartment && (
              <span className="department-badge">
                Department: {currentUserDepartment}
              </span>
            )}
            <span className="company-badge">
              Company: {currentUserCompanyId ? currentUserCompanyId.substring(0, 12) + '...' : 'Loading...'}
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

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter size={20} color="#1976d2" />
          <h3>Filters & Search</h3>
        </div>
        
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Filter by Date (Optional)</label>
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
                  color: '#666'
                }}
              />
              <input
                type="text"
                className="filter-input"
                placeholder="Search by name, email, department, reason..."
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
            style={{ cursor: 'pointer' }}
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
                <FiAlertCircle size={20} style={{ marginRight: '8px' }} />
                Pending Leaves Requiring Action
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
              <FiList size={20} style={{ marginRight: '8px' }} />
              All Other Leaves
            </h2>
            <span className="section-badge">{otherLeaves.length} total</span>
          </div>
          {renderLeaveTable("All Leaves", otherLeaves, false)}
        </div>
      </div>

      {/* Status Update Dialog */}
      {statusDialog.open && (
        <div className="dialog-overlay" onClick={closeStatusDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Update Leave Status</h3>
              <button className="dialog-close" onClick={closeStatusDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="user-info">
                <div className="user-avatar">
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
              
              <div className="status-selection">
                <h4>Change Status to:</h4>
                <div className="status-options">
                  <button 
                    className={`status-option ${statusDialog.newStatus === 'Approved' ? 'selected' : ''}`}
                    onClick={() => setStatusDialog(prev => ({ ...prev, newStatus: 'Approved' }))}
                  >
                    <FiCheckCircle /> Approved
                  </button>
                  <button 
                    className={`status-option ${statusDialog.newStatus === 'Rejected' ? 'selected' : ''}`}
                    onClick={() => setStatusDialog(prev => ({ ...prev, newStatus: 'Rejected' }))}
                  >
                    <FiXCircle /> Rejected
                  </button>
                </div>
              </div>
              
              <div className="remarks-section">
                <label>Remarks (Optional)</label>
                <textarea
                  className="remarks-input"
                  value={statusDialog.remarks}
                  onChange={(e) => setStatusDialog(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Add any remarks or notes..."
                  rows="3"
                />
              </div>
              
              <div className="notification-info">
                <FiPhone size={16} />
                <span>
                  WhatsApp notification will be sent to {statusDialog.userName} if phone number is available.
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
                disabled={!statusDialog.newStatus}
              >
                <FiSave size={16} style={{ marginRight: '8px' }} />
                Confirm {statusDialog.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
                This will permanently delete the leave request. This action cannot be undone.
              </p>
            </div>
            
            <div className="dialog-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteDialog(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDeleteLeave}>
                <FiTrash2 size={16} style={{ marginRight: '8px' }} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Dialog */}
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
                        <span className="history-action">{item.action}</span>
                        <span className="history-date">{formatHistoryDate(item.at)}</span>
                      </div>
                      <div className="history-item-body">
                        <div className="history-by">
                          <strong>By:</strong> {item.by || 'System'}
                        </div>
                        {item.role && (
                          <div className="history-role">
                            <strong>Role:</strong> {normalizeRole(item.role)}
                          </div>
                        )}
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

      {/* Snackbar */}
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