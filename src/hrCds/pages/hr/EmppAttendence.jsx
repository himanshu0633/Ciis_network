import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../../utils/axiosConfig";
import './employee-attendance.css';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiDownload,
  FiFileText,
  FiImage,
  FiWatch,
  FiAlertTriangle,
  FiUserCheck,
  FiUserX,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";

// Employee Type Filter Component
const EmployeeTypeFilter = ({ selected, onChange }) => {
  const options = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
  ];

  return (
    <select
      className="filter-input"
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

// Department Filter Component
const DepartmentFilter = ({ selected, onChange, departments }) => {
  const options = [
    { value: 'all', label: 'All Departments' },
    ...departments.map(dept => ({
      value: dept.name || dept,
      label: dept.name || dept
    }))
  ];

  return (
    <select
      className="filter-input"
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

// Status Filter Component - UPDATED to include LATE
const StatusFilter = ({ selected, onChange }) => {
  const options = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'late', label: 'Late' },
    { value: 'halfday', label: 'Half Day' },
    { value: 'absent', label: 'Absent' },
  ];

  return (
    <select
      className="filter-input"
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

// Add New Attendance Modal
const AddAttendanceModal = ({ onClose, onSave, users, selectedDate }) => {
  const [formData, setFormData] = useState({
    user: '',
    date: selectedDate,
    inTime: '09:00',
    outTime: '18:00',
    status: 'present',
    lateBy: '00:00:00',
    earlyLeave: '00:00:00',
    overTime: '00:00:00',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUser.toLowerCase())
    );
  }, [users, searchUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create full datetime strings
      const inDateTime = new Date(`${selectedDate}T${formData.inTime}`);
      const outDateTime = new Date(`${selectedDate}T${formData.outTime}`);
      
      const payload = {
        user: formData.user,
        date: selectedDate,
        inTime: inDateTime.toISOString(),
        outTime: outDateTime.toISOString(),
        status: formData.status.toUpperCase(),
        lateBy: formData.lateBy,
        earlyLeave: formData.earlyLeave,
        overTime: formData.overTime,
        notes: formData.notes
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error adding attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = () => {
    if (!formData.inTime) return "absent";
    
    const [hours, minutes] = formData.inTime.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    
    if (totalMinutes >= 600) return "halfday";
    if (totalMinutes >= 550) return "late";
    return "present";
  };

  const handleTimeChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'inTime') {
      newFormData.status = calculateStatus();
    }
    
    setFormData(newFormData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Attendance</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Select Employee *</label>
                <select
                  className="form-input"
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  required
                >
                  <option value="">Select an employee...</option>
                  {users.map(user => (
                    <option key={user.id || user._id} value={user.id || user._id}>
                      {user.name} - {user.email} ({user.department || 'N/A'}) - {user.employeeType || 'N/A'}
                    </option>
                  ))}
                </select>
                
                {/* Display selected employee info if available */}
                {formData.user && (
                  <div className="selected-user-info">
                    {(() => {
                      const selectedUser = users.find(u => (u.id || u._id) === formData.user);
                      if (!selectedUser) return null;
                      return (
                        <div className="user-display">
                          <div className="user-avatar-small">
                            {selectedUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                          </div>
                          <div className="user-details">
                            <strong>{selectedUser.name || 'Unknown'}</strong>
                            <small>{selectedUser.email || 'N/A'} • {selectedUser.department || 'N/A'} • {selectedUser.employeeType || 'N/A'}</small>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Check In Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.inTime}
                  onChange={(e) => handleTimeChange('inTime', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Check Out Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.outTime}
                  onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="halfday">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Late By</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lateBy}
                  onChange={(e) => setFormData({ ...formData, lateBy: e.target.value })}
                  placeholder="00:00:00"
                />
              </div>

              <div className="form-group">
                <label>Early Leave</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.earlyLeave}
                  onChange={(e) => setFormData({ ...formData, earlyLeave: e.target.value })}
                  placeholder="00:00:00"
                />
              </div>

              <div className="form-group">
                <label>Overtime</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.overTime}
                  onChange={(e) => setFormData({ ...formData, overTime: e.target.value })}
                  placeholder="00:00:00"
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>
            </div>

            <div className="calculated-info">
              <div className="info-item">
                <span>Calculated Status:</span>
                <span className={`status-chip ${calculateStatus()}`}>
                  {calculateStatus().toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <span>Hours Worked:</span>
                <span>
                  {(() => {
                    if (!formData.inTime || !formData.outTime) return "00:00:00";
                    const [inHour, inMinute] = formData.inTime.split(':').map(Number);
                    const [outHour, outMinute] = formData.outTime.split(':').map(Number);
                    const totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-outlined" 
              type="button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn btn-contained" 
              type="submit"
              disabled={loading || !formData.user}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Attendance Modal
const EditAttendanceModal = ({ record, onClose, onSave, onDelete, users }) => {
  const [editedRecord, setEditedRecord] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (record) {
      setEditedRecord({
        user: record.user?.id || record.user?._id || record.user || '',
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        inTime: record.inTime ? new Date(record.inTime).toTimeString().slice(0, 5) : '',
        outTime: record.outTime ? new Date(record.outTime).toTimeString().slice(0, 5) : '',
        status: record.status?.toLowerCase() || 'absent',
        lateBy: record.lateBy || '00:00:00',
        earlyLeave: record.earlyLeave || '00:00:00',
        overTime: record.overTime || '00:00:00',
        notes: record.notes || ''
      });
    }
  }, [record]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create full datetime strings
      const inDateTime = new Date(`${editedRecord.date}T${editedRecord.inTime}`);
      const outDateTime = new Date(`${editedRecord.date}T${editedRecord.outTime}`);
      
      const payload = {
        inTime: editedRecord.inTime ? inDateTime.toISOString() : null,
        outTime: editedRecord.outTime ? outDateTime.toISOString() : null,
        status: editedRecord.status.toUpperCase(),
        lateBy: editedRecord.lateBy,
        earlyLeave: editedRecord.earlyLeave,
        overTime: editedRecord.overTime,
        notes: editedRecord.notes,
        date: editedRecord.date
      };

      await onSave(record._id, payload);
      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(record._id);
      onClose();
    } catch (error) {
      console.error("Error deleting attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = () => {
    if (!editedRecord.inTime) return "absent";
    
    const [hours, minutes] = editedRecord.inTime.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    
    if (totalMinutes >= 600) return "halfday";
    if (totalMinutes >= 550) return "late";
    return "present";
  };

  const handleTimeChange = (field, value) => {
    const newRecord = { ...editedRecord, [field]: value };
    
    if (field === 'inTime') {
      newRecord.status = calculateStatus();
    }
    
    setEditedRecord(newRecord);
  };

  const getEmployeeName = () => {
    if (!record.user) return "Unknown Employee";
    return record.user.name || record.user.email || "Unknown Employee";
  };

  if (!record) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Attendance</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="employee-info-summary">
            <div className="employee-avatar large">
              {(() => {
                const name = getEmployeeName();
                return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              })()}
            </div>
            <div>
              <h4>{getEmployeeName()}</h4>
              <p className="text-muted">{record.user?.email || "N/A"}</p>
              <p className="text-muted">
                {record.user?.department || "N/A"} • {record.user?.employeeType?.toUpperCase() || "N/A"} • 
                {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-input"
                value={editedRecord.date}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Check In Time</label>
              <input
                type="time"
                className="form-input"
                value={editedRecord.inTime}
                onChange={(e) => handleTimeChange('inTime', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Check Out Time</label>
              <input
                type="time"
                className="form-input"
                value={editedRecord.outTime}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, outTime: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-input"
                value={editedRecord.status}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="halfday">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Late By</label>
              <input
                type="text"
                className="form-input"
                value={editedRecord.lateBy}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, lateBy: e.target.value }))}
                placeholder="00:00:00"
              />
            </div>

            <div className="form-group">
              <label>Early Leave</label>
              <input
                type="text"
                className="form-input"
                value={editedRecord.earlyLeave}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, earlyLeave: e.target.value }))}
                placeholder="00:00:00"
              />
            </div>

            <div className="form-group">
              <label>Overtime</label>
              <input
                type="text"
                className="form-input"
                value={editedRecord.overTime}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, overTime: e.target.value }))}
                placeholder="00:00:00"
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                className="form-input"
                value={editedRecord.notes}
                onChange={(e) => setEditedRecord(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                rows="3"
              />
            </div>
          </div>

          <div className="calculated-info">
            <div className="info-item">
              <span>Calculated Status:</span>
              <span className={`status-chip ${calculateStatus()}`}>
                {calculateStatus().toUpperCase()}
              </span>
            </div>
            {editedRecord.inTime && editedRecord.outTime && (
              <div className="info-item">
                <span>Hours Worked:</span>
                <span>
                  {(() => {
                    const [inHour, inMinute] = editedRecord.inTime.split(':').map(Number);
                    const [outHour, outMinute] = editedRecord.outTime.split(':').map(Number);
                    const totalMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                  })()}
                </span>
              </div>
            )}
          </div>

          {showConfirmDelete && (
            <div className="confirm-delete">
              <FiAlertTriangle size={24} color="#ff6b6b" />
              <h4>Delete Attendance Record?</h4>
              <p>Are you sure you want to delete this attendance record? This action cannot be undone.</p>
              <div className="confirm-buttons">
                <button 
                  className="btn btn-outlined" 
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            <button 
              className="btn btn-danger" 
              onClick={() => setShowConfirmDelete(true)}
              disabled={showConfirmDelete}
            >
              <FiTrash2 /> Delete Record
            </button>
          </div>
          <div className="footer-right">
            <button className="btn btn-outlined" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn btn-contained" 
              onClick={handleSave}
              disabled={loading || showConfirmDelete}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Edit Modal
const QuickEditModal = ({ records, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('present');

  const handleSave = async () => {
    setLoading(true);
    try {
      const promises = records.map(record =>
        axios.put(`/attendance/${record._id}`, { status: status.toUpperCase() })
      );
      
      await Promise.all(promises);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error in quick edit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quick-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quick Edit {records.length} Records</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="selected-count">
            <FiUsers size={20} />
            <span>{records.length} employee(s) selected</span>
          </div>

          <div className="status-selector">
            <h4>Set Status To:</h4>
            <div className="status-options">
              <button 
                className={`status-option ${status === 'present' ? 'selected' : ''}`}
                onClick={() => setStatus('present')}
              >
                <FiCheckCircle /> Present
              </button>
              <button 
                className={`status-option ${status === 'late' ? 'selected' : ''}`}
                onClick={() => setStatus('late')}
              >
                <FiClock /> Late
              </button>
              <button 
                className={`status-option ${status === 'halfday' ? 'selected' : ''}`}
                onClick={() => setStatus('halfday')}
              >
                <FiAlertCircle /> Half Day
              </button>
              <button 
                className={`status-option ${status === 'absent' ? 'selected' : ''}`}
                onClick={() => setStatus('absent')}
              >
                <FiUserX /> Absent
              </button>
            </div>
          </div>

          <div className="selected-employees">
            <h4>Affected Employees:</h4>
            <div className="employee-list">
              {records.slice(0, 5).map(record => (
                <div key={record._id} className="employee-item">
                  <div className="employee-avatar small">
                    {getInitials(record.user?.name)}
                  </div>
                  <span>{record.user?.name || 'Unknown'} - {record.user?.department || 'N/A'}</span>
                </div>
              ))}
              {records.length > 5 && (
                <div className="more-count">
                  +{records.length - 5} more employees
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outlined" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-contained" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Updating...' : `Update to ${status.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions (outside components)
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getStatusClass = (status) => {
  if (status === "present") return "status-present";
  if (status === "absent") return "status-absent";
  if (status === "halfday") return "status-halfday";
  if (status === "late") return "status-late";
  return "";
};

const getEmployeeTypeClass = (type) => {
  if (!type) return "";
  const typeLower = type.toLowerCase();
  if (typeLower.includes("full")) return "type-full-time";
  if (typeLower.includes("part")) return "type-part-time";
  if (typeLower.includes("contract")) return "type-contract";
  if (typeLower.includes("intern")) return "type-intern";
  return "";
};

const getRowClass = (status) => {
  if (status === "present") return "row-present";
  if (status === "absent") return "row-absent";
  if (status === "halfday") return "row-halfday";
  if (status === "late") return "row-late";
  return "";
};

const calculateHoursWorked = (inTime, outTime) => {
  if (!inTime || !outTime) return { hours: 0, formatted: "00:00:00" };
  
  const start = new Date(inTime);
  const end = new Date(outTime);
  const diffMs = end - start;
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  
  return {
    hours: diffMs / (1000 * 60 * 60),
    formatted: `${hours}:${minutes}:${seconds}`
  };
};

// Main Component
const EmployeeAttendance = () => {
  const [records, setRecords] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    late: 0,
    onTime: 0,
  });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [quickEditModalOpen, setQuickEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);

  const tableRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (allUsers.length > 0) {
      fetchAttendanceData(selectedDate);
    }
  }, [selectedDate, allUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Updated fetchAllUsers function to get all company users and resolve department names
  const fetchAllUsers = async () => {
    try {
      console.log("🔄 Fetching all company users...");
      
      // First fetch departments to get the mapping
      let departmentsMap = {};
      try {
        const deptRes = await axios.get('/departments');
        console.log("✅ Departments API response:", deptRes.data);
        
        // Handle different response structures
        let departmentsData = [];
        if (deptRes.data && deptRes.data.success) {
          if (deptRes.data.data && Array.isArray(deptRes.data.data)) {
            departmentsData = deptRes.data.data;
          } else if (deptRes.data.departments && Array.isArray(deptRes.data.departments)) {
            departmentsData = deptRes.data.departments;
          } else if (Array.isArray(deptRes.data)) {
            departmentsData = deptRes.data;
          }
        }
        
        departmentsMap = departmentsData.reduce((acc, dept) => {
          acc[dept._id] = dept.name;
          return acc;
        }, {});
        
        setDepartments(departmentsData);
        console.log("✅ Departments loaded:", departmentsMap);
      } catch (deptErr) {
        console.error("❌ Failed to load departments", deptErr);
      }
      
      const res = await axios.get('/users/company-users');
      
      let usersData = [];
      
      if (res.data && res.data.success) {
        if (res.data.message && res.data.message.users && Array.isArray(res.data.message.users)) {
          usersData = res.data.message.users;
          console.log(`✅ Found ${usersData.length} users in message.users`);
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
      
      // Process users with department information - resolve department name from ID
      const usersWithDepartment = usersData.map(user => {
        // Get department ID from user object
        let deptId = null;
        let deptName = "Unassigned";
        
        if (user.department) {
          if (typeof user.department === "object") {
            deptId = user.department._id;
            deptName = user.department.name || "Unassigned";
          } else {
            deptId = user.department;
            // Try to get department name from the map
            deptName = departmentsMap[user.department] || user.departmentName || "Unassigned";
          }
        } else if (user.departmentId) {
          deptId = user.departmentId;
          deptName = departmentsMap[user.departmentId] || "Unassigned";
        }
        
        return {
          id: user.id || user._id,
          _id: user.id || user._id,
          name: user.name,
          email: user.email,
          employeeType: user.employeeType || 'full-time',
          departmentId: deptId,
          department: deptName, // This will now show the name instead of ID
          jobRole: user.jobRole
        };
      });
      
      console.log("👥 Users by department:", 
        usersWithDepartment.reduce((acc, user) => {
          const dept = user.department;
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push(user.name);
          return acc;
        }, {})
      );
      
      setAllUsers(usersWithDepartment);
      
      if (usersData.length === 0) {
        console.log("⚠️ No users found, adding test data");
        const testUsers = [
          {
            id: 'test1',
            _id: 'test1',
            name: 'IT Manager',
            email: 'manager@gmail.com',
            employeeType: 'full-time',
            department: 'IT',
            jobRole: 'manager'
          },
          {
            id: 'test2',
            _id: 'test2',
            name: 'Sales Executive',
            email: 'sales@ciisnetwork.com',
            employeeType: 'full-time',
            department: 'SALES',
            jobRole: 'user'
          },
          {
            id: 'test3',
            _id: 'test3',
            name: 'HR Specialist',
            email: 'hr@company.com',
            employeeType: 'full-time',
            department: 'HR',
            jobRole: 'user'
          },
          {
            id: 'test4',
            _id: 'test4',
            name: 'Marketing Lead',
            email: 'marketing@company.com',
            employeeType: 'full-time',
            department: 'MARKETING',
            jobRole: 'manager'
          }
        ];
        setAllUsers(testUsers);
      }
      
    } catch (err) {
      console.error("❌ Failed to load users", err);
      showSnackbar("Error loading users data", "error");
      
      const testUsers = [
        {
          id: 'test1',
          _id: 'test1',
          name: 'IT Manager',
          email: 'manager@gmail.com',
          employeeType: 'full-time',
          department: 'IT',
          jobRole: 'manager'
        },
        {
          id: 'test2',
          _id: 'test2',
          name: 'Sales Executive',
          email: 'sales@ciisnetwork.com',
          employeeType: 'full-time',
          department: 'SALES',
          jobRole: 'user'
        },
        {
          id: 'test3',
          _id: 'test3',
          name: 'HR Specialist',
          email: 'hr@company.com',
          employeeType: 'full-time',
          department: 'HR',
          jobRole: 'user'
        }
      ];
      setAllUsers(testUsers);
    }
  };

  // Helper function to get department name
  const getDepartmentName = (user) => {
    if (!user) return 'Unassigned';
    
    // If department is already a string name, return it
    if (typeof user.department === 'string') return user.department;
    
    // If department is an object with name property
    if (user.department && typeof user.department === 'object' && user.department.name) {
      return user.department.name;
    }
    
    // If we have departments state and user has departmentId
    if (user.departmentId && departments.length > 0) {
      const dept = departments.find(d => d._id === user.departmentId);
      if (dept) return dept.name;
    }
    
    return 'Unassigned';
  };

  // Calculate status based on LATE rules (9:10 AM to 9:30 AM)
  const calculateStatusFromTime = (inTime) => {
    if (!inTime) return "absent";
    
    const loginTime = new Date(inTime);
    const loginHour = loginTime.getHours();
    const loginMinute = loginTime.getMinutes();
    const totalMinutes = (loginHour * 60) + loginMinute;
    
    // 9:10 AM = 550 minutes, 9:30 AM = 570 minutes, 10:00 AM = 600 minutes
    if (totalMinutes >= 600) return "halfday";
    if (totalMinutes >= 550 && totalMinutes < 570) return "late";
    if (totalMinutes >= 570) return "halfday";
    return "present";
  };

  const fetchAttendanceData = async (date) => {
    setLoading(true);
    try {
      const formatted = date;
      console.log("📅 Fetching attendance for date:", formatted);
      const res = await axios.get(`/attendance/all?date=${formatted}`);
      
      console.log("✅ Attendance API response:", res.data);
      
      const attendanceMap = {};
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        res.data.data.forEach(record => {
          if (record.user && (record.user._id || record.user.id)) {
            const userId = record.user._id || record.user.id;
            attendanceMap[userId] = {
              ...record,
              status: record.status ? record.status.toLowerCase() : 'absent'
            };
          }
        });
      }
      
      console.log("📊 Attendance map:", attendanceMap);

      const combinedRecords = allUsers.map(user => {
        const userId = user.id || user._id;
        const attendanceRecord = attendanceMap[userId];
        
        if (attendanceRecord) {
          const calculatedStatus = calculateStatusFromTime(attendanceRecord.inTime);
          const hoursWorked = calculateHoursWorked(attendanceRecord.inTime, attendanceRecord.outTime);
          
          let finalStatus = calculatedStatus;
          if (calculatedStatus === 'present' && hoursWorked.hours > 0 && hoursWorked.hours < 9) {
            finalStatus = hoursWorked.hours >= 5 ? 'halfday' : 'absent';
          }
          
          return {
            ...attendanceRecord,
            user: {
              id: user.id || user._id,
              _id: user.id || user._id,
              name: user.name,
              email: user.email,
              employeeType: user.employeeType || 'full-time',
              department: user.department, // This will now be the name, not ID
              jobRole: user.jobRole
            },
            status: finalStatus,
            calculatedStatus: calculatedStatus,
            hoursWorked: hoursWorked.formatted,
            totalHours: hoursWorked.hours
          };
        } else {
          return {
            _id: `absent_${userId}_${date}`,
            user: {
              id: user.id || user._id,
              _id: user.id || user._id,
              name: user.name,
              email: user.email,
              employeeType: user.employeeType || 'full-time',
              department: user.department, // This will now be the name, not ID
              jobRole: user.jobRole
            },
            date: new Date(date),
            inTime: null,
            outTime: null,
            hoursWorked: "00:00:00",
            totalHours: 0,
            lateBy: "00:00:00",
            earlyLeave: "00:00:00",
            overTime: "00:00:00",
            status: "absent",
            calculatedStatus: "absent",
            isClockedIn: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      });

      console.log("📋 Combined records by department:", 
        combinedRecords.reduce((acc, rec) => {
          const dept = rec.user.department;
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push({ name: rec.user.name, status: rec.status });
          return acc;
        }, {})
      );
      
      setRecords(combinedRecords);
      calculateStats(combinedRecords);
    } catch (err) {
      console.error("❌ Failed to load attendance", err);
      showSnackbar("Error loading attendance data", "error");
      
      const mockRecords = allUsers.map(user => ({
        _id: `mock_${user.id || user._id}_${date}`,
        user: {
          id: user.id || user._id,
          _id: user.id || user._id,
          name: user.name,
          email: user.email,
          employeeType: user.employeeType || 'full-time',
          department: user.department,
          jobRole: user.jobRole
        },
        date: new Date(date),
        inTime: '09:00:00',
        outTime: '18:00:00',
        hoursWorked: "09:00:00",
        totalHours: 9,
        lateBy: "00:00:00",
        earlyLeave: "00:00:00",
        overTime: "00:00:00",
        status: "present",
        calculatedStatus: "present",
        isClockedIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      setRecords(mockRecords);
      calculateStats(mockRecords);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const present = attendanceData.filter((r) => r.status === "present").length;
    const absent = attendanceData.filter((r) => r.status === "absent").length;
    const halfDay = attendanceData.filter((r) => r.status === "halfday").length;
    const late = attendanceData.filter((r) => r.status === "late").length;
    const onTime = attendanceData.filter((r) => r.calculatedStatus === "present").length;
    
    console.log("📊 Stats calculated:", {
      total: attendanceData.length,
      present,
      absent,
      halfDay,
      late,
      onTime
    });
    
    setStats({
      total: attendanceData.length,
      present,
      absent,
      halfDay,
      late,
      onTime,
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSelectedEmployeeType("all");
    setSelectedDepartment("all");
    setSearchTerm("");
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar({ ...snackbar, open: false });
    }, 4000);
  };

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedEmployeeType !== "all") {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.employeeType &&
          rec.user.employeeType.toLowerCase() ===
            selectedEmployeeType.toLowerCase()
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (rec) => rec.user?.department === selectedDepartment
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((rec) => rec.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.user?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by department then by name
    filtered.sort((a, b) => {
      const deptA = a.user?.department || 'Unassigned';
      const deptB = b.user?.department || 'Unassigned';
      if (deptA < deptB) return -1;
      if (deptA > deptB) return 1;
      
      const nameA = a.user?.name || '';
      const nameB = b.user?.name || '';
      return nameA.localeCompare(nameB);
    });

    console.log("🔍 Filtered records:", filtered.length);
    return filtered;
  }, [records, selectedEmployeeType, selectedDepartment, searchTerm, statusFilter]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLoginTimeCategory = (inTime) => {
    if (!inTime) return "No Login";
    
    const loginTime = new Date(inTime);
    const hour = loginTime.getHours();
    const minute = loginTime.getMinutes();
    const totalMinutes = (hour * 60) + minute;
    
    if (totalMinutes >= 600) return "After 10:00 AM";
    if (totalMinutes >= 570) return "9:30 AM - 10:00 AM";
    if (totalMinutes >= 550) return "9:10 AM - 9:30 AM (LATE)";
    return "Before 9:10 AM";
  };

  const formatExportDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleAddRecord = () => {
    setAddModalOpen(true);
  };

  const handleSaveRecord = async (recordId, updatedData) => {
    try {
      setLoading(true);
      
      let response;
      
      if (recordId.startsWith('absent_')) {
        const parts = recordId.split('_');
        const userId = parts[1];
        const date = parts[2];
        
        response = await axios.post('/attendance/manual', {
          ...updatedData,
          user: userId,
          date: date
        });
      } else {
        response = await axios.put(`/attendance/${recordId}`, updatedData);
      }
      
      showSnackbar("Attendance record saved successfully!", "success");
      fetchAttendanceData(selectedDate);
    } catch (error) {
      console.error("Error saving attendance:", error);
      showSnackbar("Failed to save attendance record", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewRecord = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post('/attendance/manual', data);
      
      showSnackbar("Attendance record added successfully!", "success");
      fetchAttendanceData(selectedDate);
    } catch (error) {
      console.error("Error adding attendance:", error);
      showSnackbar("Failed to add attendance record", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      setLoading(true);
      
      if (recordId.startsWith('absent_')) {
        showSnackbar("Cannot delete absent record - it doesn't exist in database", "warning");
        setEditModalOpen(false);
        return;
      }
      
      await axios.delete(`/attendance/${recordId}`);
      
      showSnackbar("Attendance record deleted successfully!", "success");
      fetchAttendanceData(selectedDate);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error deleting attendance:", error);
      showSnackbar("Failed to delete attendance record", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedRecords.length === 0) {
      showSnackbar("Please select records to update", "warning");
      return;
    }

    try {
      setLoading(true);
      const promises = selectedRecords.map(recordId =>
        axios.put(`/attendance/${recordId}`, { status: status.toUpperCase() })
      );
      
      await Promise.all(promises);
      
      setRecords(prev => prev.map(record =>
        selectedRecords.includes(record._id)
          ? { ...record, status: status.toLowerCase() }
          : record
      ));
      
      showSnackbar(`Updated ${selectedRecords.length} record(s) to ${status}`, "success");
      setSelectedRecords([]);
      setBulkEditMode(false);
      fetchAttendanceData(selectedDate);
    } catch (error) {
      console.error("Error in bulk update:", error);
      showSnackbar("Failed to update records", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecordSelection = (recordId) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const selectAllRecords = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record._id));
    }
  };

  const handleQuickEdit = () => {
    if (selectedRecords.length === 0) {
      showSnackbar("Please select records to edit", "warning");
      return;
    }
    setQuickEditModalOpen(true);
  };

  const handleQuickEditSave = () => {
    showSnackbar(`Updated ${selectedRecords.length} records`, "success");
    fetchAttendanceData(selectedDate);
    setSelectedRecords([]);
    setBulkEditMode(false);
  };

  // Export functions
  const exportToPDF = async () => {
    setExportMenuOpen(false);
    setLoading(true);

    try {
      const input = tableRef.current;
      input.classList.add("pdf-export");

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: input.scrollWidth,
        height: input.scrollHeight,
      });

      input.classList.remove("pdf-export");

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const usableWidth = pdfWidth - margin * 2;
      const usableHeight = pdfHeight - margin * 2;

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.setFontSize(16);
      pdf.text(
        `Attendance Report - ${formatExportDate(selectedDate)}`,
        pdfWidth / 2,
        8,
        { align: "center" }
      );

      pdf.setFontSize(10);
      pdf.text(
        `Total: ${stats.total} | Present: ${stats.present} | Late: ${stats.late} | Half Day: ${stats.halfDay} | Absent: ${stats.absent}`,
        margin,
        15
      );

      position = 20;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - heightLeft;

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= usableHeight;
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pdfWidth - 20,
          pdfHeight - 8
        );
      }

      pdf.save(`attendance_report_${selectedDate}.pdf`);
      showSnackbar("Attendance PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF Export Error:", error);
      showSnackbar("Failed to export PDF", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToImage = async () => {
    setExportMenuOpen(false);
    setLoading(true);
    
    try {
      const input = tableRef.current;
      input.classList.add('image-export');
      
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
      });
      
      input.classList.remove('image-export');
      
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `attendance_report_${selectedDate}.jpg`;
      link.href = image;
      link.click();
      
      showSnackbar("Image exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting to image:", error);
      showSnackbar("Error exporting image", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    setExportMenuOpen(false);
    
    const excelData = filteredRecords.map(record => ({
      'Department': record.user?.department || 'Unassigned',
      'Employee ID': record.user?.id || record.user?._id || 'N/A',
      'Name': record.user?.name || 'N/A',
      'Email': record.user?.email || 'N/A',
      'Employee Type': record.user?.employeeType?.toUpperCase() || 'N/A',
      'Date': formatDate(record.date),
      'Check In': formatTime(record.inTime),
      'Check Out': formatTime(record.outTime),
      'Hours Worked': record.hoursWorked || '00:00:00',
      'Status': record.status.toUpperCase(),
      'Late By': record.lateBy || '00:00:00',
      'Early Leave': record.earlyLeave || '00:00:00',
      'Overtime': record.overTime || '00:00:00',
      'Total Hours': record.totalHours?.toFixed(2) || '0.00'
    }));

    const summaryRows = [
      {},
      { 'Department': 'SUMMARY REPORT' },
      { 'Department': 'Total Employees', 'Name': stats.total },
      { 'Department': 'Present', 'Name': stats.present },
      { 'Department': 'Late', 'Name': stats.late },
      { 'Department': 'Half Day', 'Name': stats.halfDay },
      { 'Department': 'Absent', 'Name': stats.absent },
      { 'Department': 'On Time', 'Name': stats.onTime },
      { 'Department': 'Report Date', 'Name': formatExportDate(selectedDate) }
    ];

    const allData = [...excelData, ...summaryRows];
    
    const worksheet = XLSX.utils.json_to_sheet(allData, {
      header: ['Department', 'Employee ID', 'Name', 'Email', 'Employee Type', 'Date', 'Check In', 'Check Out', 
               'Hours Worked', 'Status', 'Late By', 'Early Leave', 'Overtime', 'Total Hours']
    });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    XLSX.writeFile(workbook, `attendance_report_${selectedDate}.xlsx`);
    showSnackbar("Excel file exported successfully!", "success");
  };

  const exportToCSV = () => {
    setExportMenuOpen(false);
    
    const headers = ['Department', 'Employee Name', 'Email', 'Employee Type', 'Date', 'Check In', 'Check Out', 
                     'Hours Worked', 'Status', 'Late By', 'Early Leave', 'Overtime'];
    
    const csvData = filteredRecords.map(record => [
      record.user?.department || 'Unassigned',
      record.user?.name || 'N/A',
      record.user?.email || 'N/A',
      record.user?.employeeType?.toUpperCase() || 'N/A',
      formatDate(record.date),
      formatTime(record.inTime),
      formatTime(record.outTime),
      record.hoursWorked || '00:00:00',
      record.status.toUpperCase(),
      record.lateBy || '00:00:00',
      record.earlyLeave || '00:00:00',
      record.overTime || '00:00:00'
    ]);
    
    csvData.push([]);
    csvData.push(['SUMMARY REPORT']);
    csvData.push(['Total Employees', stats.total]);
    csvData.push(['Present', stats.present]);
    csvData.push(['Late', stats.late]);
    csvData.push(['Half Day', stats.halfDay]);
    csvData.push(['Absent', stats.absent]);
    csvData.push(['On Time', stats.onTime]);
    csvData.push(['Report Date', formatExportDate(selectedDate)]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading State
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="employee-attendance">
      {/* Header */}
      <div className="attendance-header">
        <div>
          <h1 className="attendance-title">Attendance Management</h1>
          <p className="attendance-subtitle">
            Monitor and manage employee attendance by department
          </p>
          <div className="timing-rules">
            <span className="rule-item"><FiCheckCircle /> Before 9:10 AM → PRESENT</span>
            <span className="rule-item"><FiAlertTriangle /> 9:10 AM - 9:30 AM → LATE</span>
            <span className="rule-item"><FiAlertCircle /> 9:30 AM - 10:00 AM → HALF DAY</span>
            <span className="rule-item"><FiUserX /> After 10:00 AM → HALF DAY / No Login → ABSENT</span>
          </div>
          
          {bulkEditMode && selectedRecords.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-selection-count">
                <FiUsers size={16} />
                {selectedRecords.length} record(s) selected
              </span>
              <div className="bulk-action-buttons">
                <button 
                  className="btn btn-outlined btn-sm"
                  onClick={() => handleBulkStatusChange('present')}
                >
                  Mark as Present
                </button>
                <button 
                  className="btn btn-outlined btn-sm"
                  onClick={() => handleBulkStatusChange('late')}
                >
                  Mark as Late
                </button>
                <button 
                  className="btn btn-outlined btn-sm"
                  onClick={() => handleBulkStatusChange('halfday')}
                >
                  Mark as Half Day
                </button>
                <button 
                  className="btn btn-outlined btn-sm"
                  onClick={() => handleBulkStatusChange('absent')}
                >
                  Mark as Absent
                </button>
                <button 
                  className="btn btn-contained btn-sm"
                  onClick={handleQuickEdit}
                >
                  <FiEdit /> Quick Edit
                </button>
                <button 
                  className="btn btn-outlined btn-sm"
                  onClick={() => {
                    setSelectedRecords([]);
                    setBulkEditMode(false);
                  }}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="header-actions">
          {/* Export Button */}
          <div className="export-container" ref={exportMenuRef}>
            <button
              className="date-chip"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              title="Export Report"
              disabled={loading}
            >
              <FiDownload size={16} />
              <span>Export</span>
            </button>

            {exportMenuOpen && (
              <div className="export-dropdown">
                <button className="export-option" onClick={exportToExcel}>
                  <FiFileText size={16} />
                  <span>Export as Excel (XLSX)</span>
                </button>

                <button className="export-option" onClick={exportToCSV}>
                  <FiFileText size={16} />
                  <span>Export as CSV</span>
                </button>

                <button className="export-option" onClick={exportToPDF}>
                  <FiFileText size={16} />
                  <span>Export as PDF</span>
                </button>

                <button className="export-option" onClick={exportToImage}>
                  <FiImage size={16} />
                  <span>Export as Image</span>
                </button>
              </div>
            )}
          </div>

          <div className="date-chip">
            <FiCalendar size={16} />
            {new Date(selectedDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
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
            <label className="filter-label">Select Date</label>
            <input
              type="date"
              className="filter-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Employee Type</label>
            <EmployeeTypeFilter
              selected={selectedEmployeeType}
              onChange={setSelectedEmployeeType}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Department</label>
            <DepartmentFilter
              selected={selectedDepartment}
              onChange={setSelectedDepartment}
              departments={departments}
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
                placeholder="Search by name, email, department or status..."
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
              Clear Filters
            </button>
            <button 
              className="btn btn-contained"
              onClick={() => fetchAttendanceData(selectedDate)}
              disabled={loading}
            >
              {loading ? <FiRefreshCw className="spin" /> : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-container">
        {[
          { 
            label: "Total Employees", 
            count: stats.total, 
            icon: <FiUsers />,
            description: "Total tracked employees",
            statClass: "stat-card-primary",
            iconClass: "stat-icon-primary"
          },
          { 
            label: "Present", 
            count: stats.present, 
            icon: <FiCheckCircle />,
            description: "Before 9:10 AM",
            statClass: "stat-card-success",
            iconClass: "stat-icon-success"
          },
          { 
            label: "Late", 
            count: stats.late, 
            icon: <FiClock />,
            description: "9:10 AM - 9:30 AM",
            statClass: "stat-card-warning",
            iconClass: "stat-icon-warning"
          },
          { 
            label: "Half Day", 
            count: stats.halfDay, 
            icon: <FiAlertCircle />,
            description: "After 9:30 AM",
            statClass: "stat-card-info",
            iconClass: "stat-icon-info"
          },
          { 
            label: "Absent", 
            count: stats.absent, 
            icon: <FiUserX />,
            description: "No login recorded",
            statClass: "stat-card-error",
            iconClass: "stat-icon-error"
          },
          { 
            label: "On Time", 
            count: stats.onTime, 
            icon: <FiUserCheck />,
            description: "Arrived before 9:10 AM",
            statClass: "stat-card-secondary",
            iconClass: "stat-icon-secondary"
          },
        ].map((stat) => (
          <div 
            key={stat.label}
            className={`stat-card ${stat.statClass} ${statusFilter === stat.label.toLowerCase() ? 'stat-card-active' : ''}`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === stat.label.toLowerCase() ? "all" : stat.label.toLowerCase()
              )
            }
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-content">
              <div className={`stat-icon ${stat.iconClass}`}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.count}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table with Department Grouping */}
      <div className="attendance-table-container" ref={tableRef}>
        <div className="table-header">
          <div>
            <h3 className="table-title">Attendance Records by Department</h3>
            <div className="table-count">
              {filteredRecords.length} records found • 
              <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                Date: {formatExportDate(selectedDate)}
              </span>
              <span style={{ marginLeft: '16px', color: '#666' }}>
                Showing: {statusFilter === 'all' ? 'All Status' : statusFilter.toUpperCase()}
              </span>
            </div>
          </div>
          
          {bulkEditMode && (
            <div className="bulk-select-all">
              <input
                type="checkbox"
                checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                onChange={selectAllRecords}
              />
              <span>Select All ({selectedRecords.length} selected)</span>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                {bulkEditMode && <th style={{ width: '50px' }}></th>}
                <th>Employee</th>
                <th>Department</th>
                <th>Type</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Worked</th>
                <th>Login Time</th>
                <th>Status</th>
                <th>Late By</th>
                {!bulkEditMode && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length ? (
                // Group records by department
                Object.entries(
                  filteredRecords.reduce((acc, rec) => {
                    const dept = rec.user?.department || 'Unassigned';
                    if (!acc[dept]) acc[dept] = [];
                    acc[dept].push(rec);
                    return acc;
                  }, {})
                ).map(([department, deptRecords]) => (
                  <React.Fragment key={department}>
                    {/* Department Header Row */}
                    <tr className="department-header">
                      <td colSpan={bulkEditMode ? 12 : 11}>
                        <div className="department-title">
                          <FiUsers size={18} />
                          <strong>{department} Department</strong>
                          <span className="department-count">
                            ({deptRecords.length} employees)
                          </span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Department Records */}
                    {deptRecords.map((rec) => (
                      <tr key={rec._id} className={getRowClass(rec.status)}>
                        {bulkEditMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(rec._id)}
                              onChange={() => toggleRecordSelection(rec._id)}
                            />
                          </td>
                        )}
                        <td>
                          <div className="employee-info">
                            <div className="employee-avatar">
                              {getInitials(rec.user?.name)}
                            </div>
                            <div className="employee-details">
                              <div className="employee-name">
                                {rec.user?.name || "N/A"}
                              </div>
                              <div className="employee-email">
                                {rec.user?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="department-chip">
                            {rec.user?.department || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <span className={`type-chip ${getEmployeeTypeClass(rec.user?.employeeType)}`}>
                            {rec.user?.employeeType?.toUpperCase() || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                            {formatDate(rec.date)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {formatTime(rec.inTime)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {formatTime(rec.outTime)}
                          </div>
                        </td>
                        <td>
                          <span className={`time-chip ${rec.totalHours >= 9 ? 'time-full' : rec.totalHours >= 5 ? 'time-half' : 'time-low'}`}>
                            {rec.hoursWorked || "00:00:00"}
                          </span>
                        </td>
                        <td>
                          <div className="login-time-info">
                            {getLoginTimeCategory(rec.inTime)}
                          </div>
                        </td>
                        <td>
                          <span className={`status-chip ${getStatusClass(rec.status)}`}>
                            {rec.status.toUpperCase()}
                          </span>
                          <div className="status-explanation">
                            {rec.status === 'present' && 'Arrived before 9:10 AM'}
                            {rec.status === 'late' && 'Arrived between 9:10-9:30 AM'}
                            {rec.status === 'halfday' && 'Arrived after 9:30 AM'}
                            {rec.status === 'absent' && 'No attendance recorded'}
                          </div>
                        </td>
                        <td>
                          <span className="late-chip">
                            {rec.lateBy || "00:00:00"}
                          </span>
                        </td>
                        {!bulkEditMode && (
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon edit-btn"
                                onClick={() => handleEditRecord(rec)}
                                title="Edit Attendance"
                              >
                                <FiEdit size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={bulkEditMode ? 12 : 11}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FiCalendar size={48} />
                      </div>
                      <h4 className="empty-state-title">No Records Found</h4>
                      <p className="empty-state-text">
                        Try adjusting your filters or add a new attendance record
                      </p>
                      <button 
                        className="btn btn-contained"
                        onClick={handleAddRecord}
                      >
                        Add Attendance
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h4>Attendance Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Employees:</span>
            <span className="summary-value">{stats.total}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Attendance Rate:</span>
            <span className="summary-value">
              {stats.total > 0 ? ((stats.present + stats.late + stats.halfDay) / stats.total * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">On Time Rate:</span>
            <span className="summary-value">
              {stats.total > 0 ? (stats.onTime / stats.total * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Late Rate:</span>
            <span className="summary-value">
              {stats.total > 0 ? (stats.late / stats.total * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editModalOpen && (
        <EditAttendanceModal
          record={selectedRecord}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
          users={allUsers}
        />
      )}

      {addModalOpen && (
        <AddAttendanceModal
          onClose={() => setAddModalOpen(false)}
          onSave={handleAddNewRecord}
          users={allUsers}
          selectedDate={selectedDate}
        />
      )}

      {quickEditModalOpen && (
        <QuickEditModal
          records={filteredRecords.filter(rec => selectedRecords.includes(rec._id))}
          onClose={() => setQuickEditModalOpen(false)}
          onSave={handleQuickEditSave}
        />
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="snackbar">
          <div className={`snackbar-content snackbar-${snackbar.type}`}>
            {snackbar.type === "success" && <FiCheckCircle size={20} />}
            {snackbar.type === "error" && <FiXCircle size={20} />}
            {snackbar.type === "info" && <FiAlertCircle size={20} />}
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;