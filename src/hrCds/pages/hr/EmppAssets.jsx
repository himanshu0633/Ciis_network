import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  FiEdit, FiTrash2, FiPackage, FiCheckCircle,
  FiXCircle, FiClock, FiMessageCircle, FiSearch, 
  FiUsers,  FiBriefcase
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
  const [filterType, setFilterType] = useState('all'); // 'all', 'company', 'department'
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  // Get company code from localStorage
  const companyCode = localStorage.getItem('companyCode') || 'Mohit';

  useEffect(() => { 
    fetchRequests(); 
    extractDepartments();
  }, [statusFilter, selectedCompany, selectedDepartment]);

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
    } catch (err) {
      setNotification({ message: 'Failed to fetch requests', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const extractDepartments = () => {
    const deptSet = new Set();
    requests.forEach(req => {
      if (req.department) {
        deptSet.add(req.department);
      }
    });
    setDepartments(Array.from(deptSet));
  };

  const calculateStats = (data) => {
    const pending = data.filter(r => r.status === 'pending').length;
    const approved = data.filter(r => r.status === 'approved').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    setStats({ total: data.length, pending, approved, rejected });
  };

  const handleStatFilter = (type) => {
    const newSelected = selectedStat === type ? 'All' : type;
    setSelectedStat(newSelected);
    setStatusFilter(newSelected === 'All' ? '' : newSelected.toLowerCase());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/assets/delete/${id}`);
      setNotification({ message: 'Request deleted successfully', severity: 'success' });
      fetchRequests();
    } catch {
      setNotification({ message: 'Failed to delete request', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${reqId}`, { status: newStatus });
      setNotification({ message: 'Status updated successfully', severity: 'success' });
      fetchRequests();
    } catch {
      setNotification({ message: 'Failed to update status', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleCommentEditOpen = (req) => {
    setEditingCommentReq(req);
    setCommentText(req.adminComment || '');
  };

  const handleCommentUpdate = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${editingCommentReq._id}`, {
        comment: commentText,
        status: editingCommentReq.status
      });
      setNotification({ message: 'Comment updated successfully', severity: 'success' });
      setEditingCommentReq(null);
      fetchRequests();
    } catch {
      setNotification({ message: 'Failed to update comment', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U';

  const filteredRequests = requests.filter(req =>
    req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.adminComment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.companyCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setSelectedCompany(companyCode);
    setSelectedDepartment('');
  };

  const handleClearFilters = () => {
    setSelectedCompany('');
    setSelectedDepartment('');
    setStatusFilter('');
    setSelectedStat('All');
  };

  if (loading && !requests.length) {
    return (
      <div className="EmpAssets-loading-container">
        <div className="EmpAssets-loading-bar"></div>
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
        {/* <FiBuilding /> */}
        <span>Company: <strong>{companyCode}</strong></span>
        <button 
          className="EmpAssets-filter-btn"
          onClick={handleCompanyFilter}
          title={`Show only ${companyCode} requests`}
        >
         My Company Only
        </button>
        {(selectedCompany || selectedDepartment || statusFilter) && (
          <button 
            className="EmpAssets-clear-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="EmpAssets-stats-grid">
        {[
          { label: 'Total Requests', count: stats.total, color: 'primary', type: 'All', icon: <FiUsers /> },
          { label: 'Pending', count: stats.pending, color: 'warning', type: 'Pending', icon: <FiClock /> },
          { label: 'Approved', count: stats.approved, color: 'success', type: 'Approved', icon: <FiCheckCircle /> },
          { label: 'Rejected', count: stats.rejected, color: 'error', type: 'Rejected', icon: <FiXCircle /> },
        ]  
        .map((item) => (
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
      <div className="EmpAssets-filters-container">
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
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
                        <h4>{req.user?.name}</h4>
                        <p>{req.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="EmpAssets-department-badge">
                      {req.department || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`EmpAssets-chip ${getAssetClass(req.assetName)}`}>
                      {req.assetName}
                    </span>
                  </td>
                  <td>
                    <span className={`EmpAssets-chip ${getStatusClass(req.status)}`}>
                      {req.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div 
                      className={`EmpAssets-comment-badge ${req.adminComment ? 'EmpAssets-has-comment' : 'EmpAssets-no-comment'}`}
                      title={req.adminComment || "No comment"}
                      onClick={() => handleCommentEditOpen(req)}
                    >
                      <FiMessageCircle size={12} />
                      <span>{req.adminComment || 'Add Comment'}</span>
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
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="EmpAssets-icon-button EmpAssets-delete"
                        title="Delete Request"
                        onClick={() => handleDelete(req._id)}
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
                  No Asset Requests Found
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
              <p>Request from: {editingCommentReq.user?.name} | Department: {editingCommentReq.department}</p>
            </div>
            <div className="EmpAssets-dialog-body">
              <textarea
                className="EmpAssets-textarea-field"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your comment..."
                rows={5}
              />
            </div>
            <div className="EmpAssets-dialog-footer">
              <button 
                className="EmpAssets-btn EmpAssets-btn-cancel"
                onClick={() => setEditingCommentReq(null)}
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
        <div className="EmpAssets-snackbar">
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