import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  FiEdit, FiTrash2, FiPackage, FiCheckCircle,
  FiXCircle, FiClock, FiMessageCircle, FiSearch, FiUsers
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

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/assets/all${statusFilter ? `?status=${statusFilter}` : ''}`);
      setRequests(data.requests);
      calculateStats(data.requests);
    } catch (err) {
      setNotification({ message: 'Failed to fetch requests', severity: 'error' });
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
    req.adminComment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'chip-status-approved';
      case 'pending': return 'chip-status-pending';
      case 'rejected': return 'chip-status-rejected';
      default: return '';
    }
  };

  const getAssetClass = (assetName) => {
    switch(assetName?.toLowerCase()) {
      case 'phone': return 'chip-asset-phone';
      case 'laptop': return 'chip-asset-laptop';
      case 'desktop': return 'chip-asset-desktop';
      case 'headphone': return 'chip-asset-headphone';
      case 'sim': return 'chip-asset-sim';
      default: return 'chip-asset-phone';
    }
  };

  const getRowClass = (status) => {
    switch(status) {
      case 'approved': return 'table-row-approved';
      case 'pending': return 'table-row-pending';
      case 'rejected': return 'table-row-rejected';
      default: return '';
    }
  };

  const getAvatarClass = (type) => {
    switch(type) {
      case 'All': return 'avatar-primary';
      case 'Pending': return 'avatar-warning';
      case 'Approved': return 'avatar-success';
      case 'Rejected': return 'avatar-error';
      default: return '';
    }
  };

  const getActiveClass = (type, selected) => {
    if (selected !== type) return '';
    switch(type) {
      case 'All': return 'active active-primary';
      case 'Pending': return 'active active-warning';
      case 'Approved': return 'active active-success';
      case 'Rejected': return 'active active-error';
      default: return '';
    }
  };

  if (loading && !requests.length) {
    return (
      <div className="loading-container">
        <div className="loading-bar"></div>
      </div>
    );
  }

  return (
    <div className="emp-assets-container">
      {/* Header Section */}
      <div className="emp-assets-header">
        <h1>Asset Requests Management</h1>
        <p>Review and manage employee asset requests</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: 'Total Requests', count: stats.total, color: 'primary', type: 'All', icon: <FiUsers /> },
          { label: 'Pending', count: stats.pending, color: 'warning', type: 'Pending', icon: <FiClock /> },
          { label: 'Approved', count: stats.approved, color: 'success', type: 'Approved', icon: <FiCheckCircle /> },
          { label: 'Rejected', count: stats.rejected, color: 'error', type: 'Rejected', icon: <FiXCircle /> },
        ].map((item) => (
          <div 
            key={item.type}
            className={`stat-card ${getActiveClass(item.type, selectedStat)}`}
            onClick={() => handleStatFilter(item.type)}
          >
            <div className="stat-content">
              <div className={`stat-avatar ${getAvatarClass(item.type)}`}>
                {item.icon}
              </div>
              <div className="stat-info">
                <h3>{item.label}</h3>
                <h2>{item.count}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-input">
          <FiSearch />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>Employee</th>
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
                    <div className="employee-cell">
                      <div className="employee-avatar">
                        {getInitials(req.user?.name)}
                      </div>
                      <div className="employee-info">
                        <h4>{req.user?.name}</h4>
                        <p>{req.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${getAssetClass(req.assetName)}`}>
                      {req.assetName}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${getStatusClass(req.status)}`}>
                      {req.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div 
                      className={`comment-badge ${req.adminComment ? 'has-comment' : 'no-comment'}`}
                      title={req.adminComment || "No comment"}
                      onClick={() => handleCommentEditOpen(req)}
                    >
                      <FiMessageCircle size={12} />
                      <span>{req.adminComment || 'Add Comment'}</span>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-container">
                      <button 
                        className="icon-button edit"
                        title="Edit Comment"
                        onClick={() => handleCommentEditOpen(req)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="icon-button delete"
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
                <td colSpan="5" className="empty-state">
                  No Asset Requests Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Comment Dialog */}
      {editingCommentReq && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h2>Edit Admin Comment</h2>
            </div>
            <div className="dialog-body">
              <textarea
                className="textarea-field"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your comment..."
              />
            </div>
            <div className="dialog-footer">
              <button 
                className="btn btn-cancel"
                onClick={() => setEditingCommentReq(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-save"
                onClick={handleCommentUpdate}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {notification && (
        <div className="snackbar">
          <div className={`snackbar-content ${notification.severity}`}>
            {notification.severity === 'error' ? <FiXCircle /> : <FiCheckCircle />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpAssets;