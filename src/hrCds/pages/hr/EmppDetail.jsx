import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import './employee-directory.css';

// Icons
import {
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiUsers,
  FiAlertTriangle,
  FiSearch,
  FiX,
  FiClock,
  FiEdit,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiSave,
  FiEye,
  FiShield,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiCheckCircle,
  FiInfo,
  FiMenu,
  FiGrid,
  FiList
} from "react-icons/fi";

// Role Filter Component
const RoleFilter = ({ selected, onChange, stats }) => {
  const roleOptions = [
    { value: 'all', label: 'All Roles', count: stats.total },
    { value: 'admin', label: 'Admin', count: stats.admin, color: 'error' },
    { value: 'manager', label: 'Manager', count: stats.manager, color: 'warning' },
    { value: 'hr', label: 'HR', count: stats.hr, color: 'info' },
    { value: 'user', label: 'User', count: stats.user, color: 'success' }
  ];

  return (
    <div className="role-filter">
      <select
        className="role-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
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

// Mobile Stats Component
const MobileStats = ({ stats }) => {
  const statItems = [
    { label: 'Total', count: stats.total, color: 'primary' },
    { label: 'Technical', count: stats.technical, color: 'success' },
    { label: 'Sales', count: stats.sales, color: 'info' },
    { label: 'Interns', count: stats.intern, color: 'secondary' },
  ];

  return (
    <div className="mobile-stats">
      <div className="stats-grid">
        {statItems.map((stat) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-value">{stat.count}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'hr', label: 'HR' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'SuperAdmin', label: 'Super Admin' }
  ];

  const stats = useMemo(() => ({
    total: employees.length,
    technical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'technical').length,
    nonTechnical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'non-technical').length,
    sales: employees.filter(emp => emp.employeeType?.toLowerCase() === 'sales').length,
    intern: employees.filter(emp => emp.employeeType?.toLowerCase() === 'intern').length,
    admin: employees.filter(emp => emp.role === 'admin').length,
    manager: employees.filter(emp => emp.role === 'manager').length,
    hr: employees.filter(emp => emp.role === 'hr').length,
    user: employees.filter(emp => emp.role === 'user').length,
    superAdmin: employees.filter(emp => emp.role === 'SuperAdmin').length,
  }), [employees]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users/all-users");
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      showSnackbar('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ ...snackbar, open: false });
    }, 6000);
  };

  const handleOpenUser = (user) => setSelectedUser(user);
  const handleCloseUser = () => setSelectedUser(null);

  const handleMenuOpen = (event, user) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuAnchorEl({
      top: rect.bottom,
      left: rect.left
    });
    setSelectedMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuUser(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditFormData({ 
      ...user,
      role: user.role || 'user'
    });
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`/users/update-user/${editingUser._id}`, editFormData);
      setEmployees(prev => prev.map(emp => 
        emp._id === editingUser._id ? res.data : emp
      ));
      setEditingUser(null);
      setEditFormData({});
      showSnackbar('Employee updated successfully');
    } catch (err) {
      console.error("Failed to update user:", err);
      showSnackbar('Failed to update employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/users/delete-user/${userToDelete._id}`);
      setEmployees(prev => prev.filter(emp => emp._id !== userToDelete._id));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      showSnackbar('Employee deleted successfully');
    } catch (err) {
      console.error("Failed to delete user:", err);
      const errorMessage = err.response?.data?.error || 'Failed to delete employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone?.includes(searchTerm)
      );
    }
    
    return filtered;
  }, [employees, selectedRole, searchTerm]);

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
    return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    return roleOption ? roleOption.label : role || 'User';
  };

  const isNewEmployee = (employee) => {
    if (!employee.createdAt) return false;
    const created = new Date(employee.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getEmployeeTypeClass = (type) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === 'technical') return 'employee-tag employee-tag-technical';
    if (typeLower === 'non-technical') return 'employee-tag employee-tag-non-technical';
    if (typeLower === 'sales') return 'employee-tag employee-tag-sales';
    if (typeLower === 'intern') return 'employee-tag employee-tag-intern';
    return 'employee-tag';
  };

  const getRoleClass = (role) => {
    if (role === 'admin') return 'employee-tag employee-tag-admin';
    if (role === 'manager') return 'employee-tag employee-tag-manager';
    if (role === 'hr') return 'employee-tag employee-tag-hr';
    if (role === 'user') return 'employee-tag employee-tag-user';
    if (role === 'SuperAdmin') return 'employee-tag employee-tag-superadmin';
    return 'employee-tag';
  };

  // Employee Card Component
  const EmployeeCard = ({ emp }) => {
    const isNew = isNewEmployee(emp);
    
    return (
      <div 
        className={`employee-card ${isNew ? 'employee-card-new' : ''}`}
        onClick={() => handleOpenUser(emp)}
      >
        <button 
          className="employee-card-menu"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, emp);
          }}
        >
          <FiMoreVertical size={16} />
        </button>
        
        <div className="employee-card-content">
          <div className="employee-header">
            <div className="employee-avatar">
              {emp.image ? (
                <img src={emp.image} alt={emp.name} />
              ) : (
                getInitials(emp.name)
              )}
            </div>
            
            <div className="employee-info">
              <div className="employee-name">{emp.name || 'No Name'}</div>
              <div className="employee-role">{emp.jobRole || 'No role specified'}</div>
              
              <div className="employee-tags">
                {emp.employeeType && (
                  <span className={getEmployeeTypeClass(emp.employeeType)}>
                    {emp.employeeType.toUpperCase()}
                  </span>
                )}
                {emp.role && (
                  <span className={getRoleClass(emp.role)}>
                    {getRoleLabel(emp.role)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="employee-details">
            <div className="detail-row">
              <div className="detail-icon detail-icon-primary">
                <FiMail size={12} />
              </div>
              <div className="detail-text">{emp.email || 'No email'}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-icon detail-icon-success">
                <FiPhone size={12} />
              </div>
              <div className="detail-text">{formatPhoneNumber(emp.phone)}</div>
            </div>
          </div>
          
          <button 
            className="view-profile-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenUser(emp);
            }}
          >
            <FiEye size={14} /> View Profile
          </button>
        </div>
      </div>
    );
  };

  // Employee List Item Component
  const EmployeeListItem = ({ emp }) => {
    const isNew = isNewEmployee(emp);
    
    return (
      <div 
        className={`employee-list-item ${isNew ? 'employee-list-item-new' : ''}`}
        onClick={() => handleOpenUser(emp)}
      >
        <div className="employee-list-content">
          <div className="employee-avatar">
            {emp.image ? (
              <img src={emp.image} alt={emp.name} />
            ) : (
              getInitials(emp.name)
            )}
          </div>
          
          <div className="employee-info">
            <div className="employee-name">{emp.name || 'No Name'}</div>
            <div className="employee-role">{emp.jobRole || 'No role specified'}</div>
          </div>
          
          <div className="employee-tags">
            {emp.employeeType && (
              <span className={getEmployeeTypeClass(emp.employeeType)}>
                {emp.employeeType.toUpperCase()}
              </span>
            )}
            {emp.role && (
              <span className={getRoleClass(emp.role)}>
                {getRoleLabel(emp.role)}
              </span>
            )}
          </div>
          
          <button 
            className="employee-card-menu"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, emp);
            }}
          >
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>
    );
  };

  // User Detail Modal
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="modal-overlay" onClick={handleCloseUser}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-content">
              <h2 className="modal-title">{selectedUser.name}</h2>
              <div className="modal-subtitle">
                <span className="employee-tag employee-tag-technical">
                  {selectedUser.employeeType?.toUpperCase() || 'N/A'}
                </span>
                <span className={getRoleClass(selectedUser.role)}>
                  {getRoleLabel(selectedUser.role)}
                </span>
              </div>
            </div>
            
            <div>
              <button 
                className="btn btn-outlined"
                onClick={() => handleEdit(selectedUser)}
                style={{ marginRight: '8px' }}
              >
                <FiEdit size={14} /> Edit
              </button>
              <button className="modal-close" onClick={handleCloseUser}>
                <FiX size={20} />
              </button>
            </div>
          </div>
          
          <div className="modal-content">
            <div className="modal-section">
              <h3 className="section-title">
                <FiUser /> Personal Information
              </h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{selectedUser.name || 'Not provided'}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">System Role</div>
                  <div className="detail-value">{getRoleLabel(selectedUser.role)}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Date of Birth</div>
                  <div className="detail-value">
                    {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">{selectedUser.email || 'Not provided'}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Phone Number</div>
                  <div className="detail-value">{formatPhoneNumber(selectedUser.phone)}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">{selectedUser.address || 'Not provided'}</div>
                </div>
              </div>
            </div>
            
            {/* Add more sections as needed */}
          </div>
          
          <div className="modal-footer">
            <button className="btn btn-outlined" onClick={handleCloseUser}>
              Close
            </button>
            <button className="btn btn-contained" onClick={() => handleEdit(selectedUser)}>
              <FiEdit size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Employee Modal
  const EditEmployeeModal = () => {
    if (!editingUser) return null;

    return (
      <div className="modal-overlay" onClick={handleCancelEdit}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
          <div className="modal-header">
            <div className="modal-header-content">
              <h2 className="modal-title">Edit Employee</h2>
              <div className="modal-subtitle">{editingUser.name}</div>
            </div>
            <button className="modal-close" onClick={handleCancelEdit}>
              <FiX size={20} />
            </button>
          </div>
          
          <div className="modal-content">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="form-grid">
                {/* Core Information */}
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editFormData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editFormData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    className="form-select"
                    value={editFormData.role || 'user'}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    required
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editFormData.dob ? new Date(editFormData.dob).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={editFormData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Address */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input form-textarea"
                    value={editFormData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                  />
                </div>
                
                {/* Job Information */}
                <div className="form-group">
                  <label className="form-label">Employee Type</label>
                  <select
                    className="form-select"
                    value={editFormData.employeeType || ''}
                    onChange={(e) => handleInputChange('employeeType', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="intern">Intern</option>
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non-technical</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Job Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.jobRole || ''}
                    onChange={(e) => handleInputChange('jobRole', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.salary || ''}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                  />
                </div>
                
                {/* Bank Details */}
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.accountNumber || ''}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.ifsc || ''}
                    onChange={(e) => handleInputChange('ifsc', e.target.value)}
                  />
                </div>
                
                {/* Family Details */}
                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.fatherName || ''}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mother's Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.motherName || ''}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                  />
                </div>
                
                {/* Emergency Contact */}
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.emergencyName || ''}
                    onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Emergency Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editFormData.emergencyPhone || ''}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </div>
                
                {/* Status */}
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    className="form-select"
                    value={editFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {/* Additional Details */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Additional Details</label>
                  <textarea
                    className="form-input form-textarea"
                    value={editFormData.additionalDetails || ''}
                    onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                    rows="4"
                  />
                </div>
              </div>
            </form>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-outlined"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              <FiX size={14} /> Cancel
            </button>
            <button 
              className="btn btn-contained"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
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
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!deleteConfirmOpen) return null;

    return (
      <div className="modal-overlay" onClick={() => !deleting && setDeleteConfirmOpen(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
          <div className="modal-header">
            <div className="modal-header-content">
              <h2 className="modal-title" style={{ color: '#d32f2f' }}>
                <FiAlertTriangle style={{ marginRight: '8px' }} />
                Confirm Delete
              </h2>
            </div>
            {!deleting && (
              <button className="modal-close" onClick={() => setDeleteConfirmOpen(false)}>
                <FiX size={20} />
              </button>
            )}
          </div>
          
          <div className="modal-content">
            <p>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
              This action cannot be undone and all associated data will be permanently removed.
            </p>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-outlined"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              className="btn btn-error"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
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
    );
  };

  // Context Menu
  const ContextMenu = () => {
    if (!menuAnchorEl || !selectedMenuUser) return null;

    return (
      <>
        <div 
          className="modal-overlay"
          style={{ background: 'transparent', zIndex: 1099 }}
          onClick={handleMenuClose}
        />
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            top: menuAnchorEl.top + 'px',
            left: menuAnchorEl.left + 'px'
          }}
        >
          <button className="menu-item" onClick={() => handleEdit(selectedMenuUser)}>
            <FiEdit size={16} color="#1976d2" />
            <span className="menu-item-text">Edit Employee</span>
          </button>
          <button className="menu-item" onClick={() => handleOpenUser(selectedMenuUser)}>
            <FiEye size={16} color="#0288d1" />
            <span className="menu-item-text">View Details</span>
          </button>
          <button className="menu-item" onClick={() => handleDeleteClick(selectedMenuUser)} style={{ color: '#d32f2f' }}>
            <FiTrash2 size={16} color="#d32f2f" />
            <span className="menu-item-text">Delete Employee</span>
          </button>
        </div>
      </>
    );
  };

  // Snackbar
  const SnackbarAlert = () => {
    if (!snackbar.open) return null;

    return (
      <div className="snackbar">
        <div className={`alert alert-${snackbar.severity}`}>
          {snackbar.severity === 'success' ? (
            <FiCheckCircle size={20} />
          ) : (
            <FiAlertTriangle size={20} />
          )}
          <span>{snackbar.message}</span>
          <button 
            className="alert-close"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading employee directory...</p>
      </div>
    );
  }

  return (
    <div className="employee-directory">
      {/* Header */}
      <div className="employee-directory-header">
        <h1 className="employee-directory-title">Employee Directory</h1>
        <p className="employee-directory-subtitle">
          Find and connect with your colleagues across the organization
        </p>
        
        {/* Mobile Stats */}
        {isMobile && <MobileStats stats={stats} />}
        
        {/* Action Bar */}
        <div className="action-bar" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="total-count" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              padding: '6px 12px', 
              border: '1px solid #1976d2', 
              borderRadius: '16px',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              {stats.total} Employees
            </span>
            
            {!isMobile && (
              <div className="view-toggle" style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className={viewMode === 'grid' ? 'btn btn-contained' : 'btn btn-outlined'}
                  onClick={() => setViewMode('grid')}
                  style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                >
                  <FiGrid size={14} />
                </button>
                <button 
                  className={viewMode === 'list' ? 'btn btn-contained' : 'btn btn-outlined'}
                  onClick={() => setViewMode('list')}
                  style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                >
                  <FiList size={14} />
                </button>
              </div>
            )}
          </div>
          
          {isMobile && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-outlined"
                onClick={() => setMobileFilterOpen(true)}
                style={{ padding: '8px 16px' }}
              >
                <FiFilter size={16} /> Filters
              </button>
              <button 
                className="btn btn-contained"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                style={{ padding: '8px 16px' }}
              >
                {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      {!isMobile && (
        <div className="search-filter-container">
          <div className="search-filter-header">
            <FiFilter size={20} color="#1976d2" />
            <h3>Search & Filter</h3>
          </div>
          
          <div className="search-row">
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search employees by name, email, role, or job role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <FiX size={16} />
                </button>
              )}
            </div>
            
            <RoleFilter
              selected={selectedRole}
              onChange={setSelectedRole}
              stats={stats}
            />
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {!isMobile && (
        <div className="stats-container">
          {[
            { label: 'Total Employees', count: stats.total, color: 'primary', icon: <FiUsers />, trend: '+5%' },
            { label: 'Technical Team', count: stats.technical, color: 'success', icon: <FiBriefcase />, trend: '+12%' },
            { label: 'Non-Technical', count: stats.nonTechnical, color: 'warning', icon: <FiClock />, trend: '+3%' },
            { label: 'Sales Team', count: stats.sales, color: 'info', icon: <FiTrendingUp />, trend: '+8%' },
            { label: 'Interns', count: stats.intern, color: 'secondary', icon: <FiAward />, trend: '+15%' },
          ].map((stat, index) => (
            <div key={index} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-card-header">
                <div className={`stat-icon stat-icon-${stat.color}`}>
                  {stat.icon}
                </div>
                <span className={`trend-chip trend-chip-${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="stat-value">{stat.count}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results Header */}
      <div className="results-header">
        <div>
          <h2 className="results-title">Team Members</h2>
          <p className="results-count">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            {selectedRole !== 'all' && ` • Filtered by ${getRoleLabel(selectedRole)}`}
            {searchTerm && ` • Matching "${searchTerm}"`}
          </p>
        </div>
        
        {!isMobile && (
          <div className="tabs" style={{ display: 'flex', gap: '4px' }}>
            <button 
              className={activeTab === 0 ? 'btn btn-contained' : 'btn btn-outlined'}
              onClick={() => setActiveTab(0)}
              style={{ padding: '8px 16px' }}
            >
              All
            </button>
            <button 
              className={activeTab === 1 ? 'btn btn-contained' : 'btn btn-outlined'}
              onClick={() => setActiveTab(1)}
              style={{ padding: '8px 16px' }}
            >
              Active
            </button>
            <button 
              className={activeTab === 2 ? 'btn btn-contained' : 'btn btn-outlined'}
              onClick={() => setActiveTab(2)}
              style={{ padding: '8px 16px' }}
            >
              New
            </button>
          </div>
        )}
      </div>

      {/* Mobile Search Bar */}
      {isMobile && (
        <div className="search-filter-container">
          <div className="search-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Employees Grid/List */}
      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiUsers size={isMobile ? 48 : 64} />
          </div>
          <h3 className="empty-state-title">No Employees Found</h3>
          <p className="empty-state-text">
            {searchTerm || selectedRole !== 'all' 
              ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
              : 'The employee directory is currently empty. Add your first team member to get started.'
            }
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="employee-grid">
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp._id} emp={emp} />
          ))}
        </div>
      ) : (
        <div className="employee-list">
          {filteredEmployees.map((emp) => (
            <EmployeeListItem key={emp._id} emp={emp} />
          ))}
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobile && mobileFilterOpen && (
        <div className="modal-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div 
            className="modal" 
            onClick={e => e.stopPropagation()}
            style={{ 
              marginLeft: 'auto',
              maxWidth: '280px',
              height: '100vh',
              borderRadius: '20px 0 0 20px'
            }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Filters</h2>
              <button className="modal-close" onClick={() => setMobileFilterOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <h3 className="section-title">Filter by Role</h3>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setMobileFilterOpen(false);
                }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin ({stats.admin})</option>
                <option value="manager">Manager ({stats.manager})</option>
                <option value="hr">HR ({stats.hr})</option>
                <option value="user">User ({stats.user})</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && !mobileFilterOpen && (
        <button 
          className="btn btn-contained"
          onClick={() => setMobileFilterOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 100
          }}
        >
          <FiFilter size={20} />
        </button>
      )}

      {/* Modals */}
      <UserDetailModal />
      <EditEmployeeModal />
      <DeleteConfirmationModal />
      <ContextMenu />
      <SnackbarAlert />
    </div>
  );
};

export default EmployeeDirectory;