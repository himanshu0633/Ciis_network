import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  FiEdit, FiTrash2, FiPackage, FiCheckCircle,
  FiXCircle, FiClock, FiMessageCircle, FiSearch, 
  FiUsers, FiBriefcase, FiFilter
} from 'react-icons/fi';
import './EmpAssets.css';

const EmpAssets = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStat, setSelectedStat] = useState('All');
  const [notification, setNotification] = useState(null);
  const [editingCommentReq, setEditingCommentReq] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get company code from localStorage
  const companyCode = localStorage.getItem('companyCode') || 'Mohit';

  // Fetch data when filters change
  useEffect(() => { 
    fetchRequests();
  }, [statusFilter, selectedCompany, selectedDepartment]);

  // Load departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      let url = '/departments';
      const params = [];
      
      if (selectedCompany) {
        params.push(`companyCode=${selectedCompany}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const { data } = await axios.get(url);
      
      // Handle different response structures
      if (data.success && data.departments) {
        if (Array.isArray(data.departments) && data.departments.length > 0) {
          if (typeof data.departments[0] === 'object' && data.departments[0].name) {
            const deptNames = data.departments.map(dept => dept.name);
            setDepartments(deptNames);
          } else {
            setDepartments(data.departments);
          }
        } else {
          setDepartments(data.departments);
        }
      } else {
        extractDepartmentsFromRequests(requests);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      extractDepartmentsFromRequests(requests);
    }
  };

  const extractDepartmentsFromRequests = (requestsData) => {
    const deptSet = new Set();
    requestsData.forEach(req => {
      if (req.department && typeof req.department === 'string') {
        deptSet.add(req.department);
      } else if (req.department && req.department.name) {
        deptSet.add(req.department.name);
      }
    });
    setDepartments(Array.from(deptSet).sort());
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `/assets/all`;
      const params = [];
      
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (selectedCompany) params.push(`companyCode=${selectedCompany}`);
      if (selectedDepartment) params.push(`department=${selectedDepartment}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const { data } = await axios.get(url);
      setRequests(data.requests);
      calculateStats(data.requests);
      
      // Update departments based on fetched requests
      extractDepartmentsFromRequests(data.requests);
    } catch (err) {
      setNotification({ message: 'Failed to fetch requests', severity: 'error' });
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const pending = data.filter(r => r.status === 'pending').length;
    const approved = data.filter(r => r.status === 'approved').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    setStats({ total: data.length, pending, approved, rejected });
  };

  const handleStatFilter = (type) => {
    if (selectedStat === type) {
      // If clicking the same filter, clear it
      setSelectedStat('All');
      setStatusFilter('');
    } else {
      setSelectedStat(type);
      setStatusFilter(type.toLowerCase());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/assets/delete/${id}`);
      setNotification({ message: 'Request deleted successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      setNotification({ message: 'Failed to delete request', severity: 'error' });
      console.error('Delete error:', err);
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${reqId}`, { status: newStatus });
      setNotification({ message: 'Status updated successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      setNotification({ message: 'Failed to update status', severity: 'error' });
      console.error('Status update error:', err);
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleCommentEditOpen = (req) => {
    setEditingCommentReq(req);
    setCommentText(req.adminComment || '');
  };

  const handleCommentUpdate = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${editingCommentReq._id}`, {
        adminComment: commentText,
        status: editingCommentReq.status
      });
      setNotification({ message: 'Comment updated successfully', severity: 'success' });
      setEditingCommentReq(null);
      fetchRequests();
    } catch (err) {
      setNotification({ message: 'Failed to update comment', severity: 'error' });
      console.error('Comment update error:', err);
    } finally { 
      setActionLoading(false); 
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U';

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    
    // Handle department search properly
    let departmentMatch = false;
    if (req.department) {
      if (typeof req.department === 'string') {
        departmentMatch = req.department.toLowerCase().includes(searchLower);
      } else if (req.department.name) {
        departmentMatch = req.department.name.toLowerCase().includes(searchLower);
      }
    }
    
    return (
      req.user?.name?.toLowerCase().includes(searchLower) ||
      req.user?.email?.toLowerCase().includes(searchLower) ||
      req.assetName?.toLowerCase().includes(searchLower) ||
      req.adminComment?.toLowerCase().includes(searchLower) ||
      departmentMatch ||
      req.companyCode?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'EmpAssets-chip-status-approved';
      case 'pending': return 'EmpAssets-chip-status-pending';
      case 'rejected': return 'EmpAssets-chip-status-rejected';
      default: return '';
    }
  };

  const getAssetClass = (assetName) => {
    switch(assetName?.toLowerCase()) {
      case 'phone': return 'EmpAssets-chip-asset-phone';
      case 'laptop': return 'EmpAssets-chip-asset-laptop';
      case 'desktop': return 'EmpAssets-chip-asset-desktop';
      case 'headphone': return 'EmpAssets-chip-asset-headphone';
      case 'sim': return 'EmpAssets-chip-asset-sim';
      default: return 'EmpAssets-chip-asset-phone';
    }
  };

  const getRowClass = (status) => {
    switch(status) {
      case 'approved': return 'EmpAssets-table-row-approved';
      case 'pending': return 'EmpAssets-table-row-pending';
      case 'rejected': return 'EmpAssets-table-row-rejected';
      default: return '';
    }
  };

  const getAvatarClass = (type) => {
    switch(type) {
      case 'All': return 'EmpAssets-avatar-primary';
      case 'Pending': return 'EmpAssets-avatar-warning';
      case 'Approved': return 'EmpAssets-avatar-success';
      case 'Rejected': return 'EmpAssets-avatar-error';
      default: return '';
    }
  };

  const getActiveClass = (type, selected) => {
    if (selected !== type) return '';
    switch(type) {
      case 'All': return 'EmpAssets-active EmpAssets-active-primary';
      case 'Pending': return 'EmpAssets-active EmpAssets-active-warning';
      case 'Approved': return 'EmpAssets-active EmpAssets-active-success';
      case 'Rejected': return 'EmpAssets-active EmpAssets-active-error';
      default: return '';
    }
  };

  const handleCompanyFilter = () => {
    if (selectedCompany === companyCode) {
      // If already filtering by this company, clear the filter
      setSelectedCompany('');
    } else {
      setSelectedCompany(companyCode);
    }
    // Don't clear department when toggling company
    fetchDepartments();
  };

  const handleClearFilters = () => {
    setSelectedCompany('');
    setSelectedDepartment('');
    setStatusFilter('');
    setSelectedStat('All');
    setSearchTerm('');
    fetchDepartments();
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    // Don't clear other filters, just update department
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCompany) count++;
    if (selectedDepartment) count++;
    if (statusFilter) count++;
    if (searchTerm) count++;
    return count;
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Helper function to display department name
  const getDepartmentName = (dept) => {
    if (!dept) return 'N/A';
    if (typeof dept === 'string') return dept;
    if (dept.name) return dept.name;
    return 'N/A';
  };

  if (loading && !requests.length) {
    return (
      <div className="EmpAssets-loading-container">
        <div className="EmpAssets-loading-spinner"></div>
        <p>Loading asset requests...</p>
      </div>
    );
  }

  return (
    <div className="EmpAssets-container">
      {/* Header Section */}
      <div className="EmpAssets-header">
        <h1>Asset Requests Management</h1>
        <p>Review and manage employee asset requests for {companyCode}</p>
      </div>

      {/* Company Info Bar */}
      <div className="EmpAssets-company-bar">
        <div className="EmpAssets-company-info">
          <span>Company: <strong>{companyCode}</strong></span>
          <button 
            className={`EmpAssets-filter-btn ${selectedCompany === companyCode ? 'active' : ''}`}
            onClick={handleCompanyFilter}
            title={selectedCompany === companyCode ? "Show all companies" : `Show only ${companyCode} requests`}
          >
            <FiUsers /> {selectedCompany === companyCode ? 'All Companies' : 'My Company Only'}
          </button>
        </div>
        
        <div className="EmpAssets-filter-actions">
          <button 
            className="EmpAssets-toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> 
            Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </button>
          
          {getActiveFilterCount() > 0 && (
            <button 
              className="EmpAssets-clear-btn"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="EmpAssets-stats-grid">
        {[
          { label: 'Total Requests', count: stats.total, color: 'primary', type: 'All', icon: <FiPackage /> },
          { label: 'Pending', count: stats.pending, color: 'warning', type: 'Pending', icon: <FiClock /> },
          { label: 'Approved', count: stats.approved, color: 'success', type: 'Approved', icon: <FiCheckCircle /> },
          { label: 'Rejected', count: stats.rejected, color: 'error', type: 'Rejected', icon: <FiXCircle /> },
        ].map((item) => (
          <div 
            key={item.type}
            className={`EmpAssets-stat-card ${getActiveClass(item.type, selectedStat)}`}
            onClick={() => handleStatFilter(item.type)}
          >
            <div className="EmpAssets-stat-content">
              <div className={`EmpAssets-stat-avatar ${getAvatarClass(item.type)}`}>
                {item.icon}
              </div>
              <div className="EmpAssets-stat-info">
                <h3>{item.label}</h3>
                <h2>{item.count}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className={`EmpAssets-filters-container ${showFilters ? 'expanded' : ''}`}>
        <div className="EmpAssets-search-container">
          <div className="EmpAssets-search-input">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, email, asset, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="EmpAssets-filter-options">
          <div className="EmpAssets-department-filter">
            <FiBriefcase />
            <select 
              value={selectedDepartment} 
              onChange={handleDepartmentChange}
            >
              <option value="">All Departments</option>
              {departments.length > 0 ? (
                departments.map((dept, index) => {
                  const deptValue = typeof dept === 'string' ? dept : dept?.name || dept?.toString() || `Department-${index}`;
                  return (
                    <option key={index} value={deptValue}>
                      {deptValue}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>No departments found</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCompany || selectedDepartment || statusFilter) && (
        <div className="EmpAssets-active-filters">
          <span className="EmpAssets-active-filters-label">Active Filters:</span>
          {selectedCompany && (
            <span className="EmpAssets-filter-tag">
              Company: {selectedCompany}
              <button onClick={() => setSelectedCompany('')}>×</button>
            </span>
          )}
          {selectedDepartment && (
            <span className="EmpAssets-filter-tag">
              Department: {selectedDepartment}
              <button onClick={() => setSelectedDepartment('')}>×</button>
            </span>
          )}
          {statusFilter && (
            <span className="EmpAssets-filter-tag">
              Status: {statusFilter}
              <button onClick={() => {
                setStatusFilter('');
                setSelectedStat('All');
              }}>×</button>
            </span>
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="EmpAssets-table-container">
        <table className="EmpAssets-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Asset</th>
              <th>Status</th>
              <th>Comment</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req._id} className={getRowClass(req.status)}>
                  <td>
                    <div className="EmpAssets-employee-cell">
                      <div className="EmpAssets-employee-avatar">
                        {getInitials(req.user?.name)}
                      </div>
                      <div className="EmpAssets-employee-info">
                        <h4>{req.user?.name || 'Unknown User'}</h4>
                        <p>{req.user?.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="EmpAssets-department-badge">
                      {getDepartmentName(req.department)}
                    </span>
                  </td>
                  <td>
                    <span className={`EmpAssets-chip ${getAssetClass(req.assetName)}`}>
                      {req.assetName || 'Unknown Asset'}
                    </span>
                  </td>
                  <td>
                    <span className={`EmpAssets-chip ${getStatusClass(req.status)}`}>
                      {req.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>
                    <div 
                      className={`EmpAssets-comment-badge ${req.adminComment ? 'EmpAssets-has-comment' : 'EmpAssets-no-comment'}`}
                      title={req.adminComment || "Click to add comment"}
                      onClick={() => handleCommentEditOpen(req)}
                    >
                      <FiMessageCircle size={12} />
                      <span>{req.adminComment ? 
                        (req.adminComment.length > 20 ? req.adminComment.substring(0, 20) + '...' : req.adminComment) 
                        : 'Add Comment'}
                      </span>
                    </div>
                  </td>
                  <td className="EmpAssets-actions-cell">
                    <div className="EmpAssets-actions-container">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            className="EmpAssets-status-btn EmpAssets-approve"
                            onClick={() => handleStatusChange(req._id, 'approved')}
                            disabled={actionLoading}
                          >
                            Approve
                          </button>
                          <button 
                            className="EmpAssets-status-btn EmpAssets-reject"
                            onClick={() => handleStatusChange(req._id, 'rejected')}
                            disabled={actionLoading}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        className="EmpAssets-icon-button EmpAssets-edit"
                        title="Edit Comment"
                        onClick={() => handleCommentEditOpen(req)}
                        disabled={actionLoading}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="EmpAssets-icon-button EmpAssets-delete"
                        title="Delete Request"
                        onClick={() => handleDelete(req._id)}
                        disabled={actionLoading}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="EmpAssets-empty-state">
                  <FiPackage size={40} />
                  <h3>No Asset Requests Found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  {getActiveFilterCount() > 0 && (
                    <button 
                      className="EmpAssets-clear-filters-btn"
                      onClick={handleClearFilters}
                    >
                      Clear All Filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Comment Dialog */}
      {editingCommentReq && (
        <div className="EmpAssets-dialog-overlay">
          <div className="EmpAssets-dialog">
            <div className="EmpAssets-dialog-header">
              <h2>Edit Admin Comment</h2>
              <p>Request from: {editingCommentReq.user?.name} | Department: {getDepartmentName(editingCommentReq.department)}</p>
            </div>
            <div className="EmpAssets-dialog-body">
              <textarea
                className="EmpAssets-textarea-field"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your comment..."
                rows={5}
                autoFocus
              />
            </div>
            <div className="EmpAssets-dialog-footer">
              <button 
                className="EmpAssets-btn EmpAssets-btn-cancel"
                onClick={() => setEditingCommentReq(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="EmpAssets-btn EmpAssets-btn-save"
                onClick={handleCommentUpdate}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {notification && (
        <div className="EmpAssets-snackbar" onClick={() => setNotification(null)}>
          <div className={`EmpAssets-snackbar-content ${notification.severity}`}>
            {notification.severity === 'error' ? <FiXCircle /> : <FiCheckCircle />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpAssets;