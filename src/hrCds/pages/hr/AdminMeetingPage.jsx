import React, { useEffect, useState } from "react";
import axios from "../../../utils/axiosConfig";
import API_URL from "../../../config";
import { toast } from "react-toastify";
import "./AdminMeetingPage.css"; // Import CSS file

export default function AdminMeetingPage() {
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [statusModal, setStatusModal] = useState({ open: false, data: [], meetingTitle: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, meetingId: null, meetingTitle: "" });

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    recurring: "No",
    attendees: [],
  });

  const adminId = localStorage.getItem("userId");

  // 🟢 Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/department-users`);
      if (res.data?.success && res.data.message?.users) {
        setUsers(res.data.message.users || []);
      } else {
        console.warn("Unexpected API response structure:", res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("❌ Failed to load users");
      setUsers([]);
    }
  };

  // 🟢 Fetch all meetings
  const fetchMeetings = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_URL}/meetings`);
      
      if (Array.isArray(res.data)) setMeetings(res.data);
      else if (res.data?.data) setMeetings(res.data.data);
      else if (res.data?.meetings) setMeetings(res.data.meetings);
      else if (res.data?.success && res.data.data) setMeetings(res.data.data);
      else {
        console.warn("Unexpected meetings API response:", res.data);
        setMeetings([]);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      toast.error("❌ Failed to fetch meetings");
      setMeetings([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMeetings();
  }, []);

  // 🟢 Handle form inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟢 Helper function to get user ID
  const getUserId = (user) => user._id || user.id;

  // 🟢 Handle attendee selection
  const handleAttendeeChange = (id) => {
    setForm((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(id)
        ? prev.attendees.filter((a) => a !== id)
        : [...prev.attendees, id],
    }));
  };

  // 🟢 Select all attendees
  const selectAllAttendees = () => {
    const allUserIds = users.map(user => getUserId(user));
    setForm(prev => ({
      ...prev,
      attendees: prev.attendees.length === allUserIds.length ? [] : allUserIds
    }));
  };

  // 🟢 Create meeting
  const createMeeting = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || form.attendees.length === 0) {
      toast.warning("⚠️ Please fill all fields and select attendees");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, createdBy: adminId };
      const res = await axios.post(`${API_URL}/meetings/create`, payload);
      if (res.data.success) {
        toast.success("✅ Meeting created successfully!");
        setForm({
          title: "",
          description: "",
          date: "",
          time: "",
          recurring: "No",
          attendees: [],
        });
        fetchMeetings();
        setActiveTab("manage");
      } else {
        toast.error(res.data.message || "❌ Failed to create meeting");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Show view status
  const showStatus = async (meetingId, meetingTitle) => {
    try {
      const res = await axios.get(`${API_URL}/meetings/view-status/${meetingId}`);
      setStatusModal({
        open: true,
        data: res.data || [],
        meetingTitle: meetingTitle || "Meeting"
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load meeting status");
    }
  };

  // 🟢 Delete meeting
  const deleteMeeting = async () => {
    if (!deleteConfirm.meetingId) return;
    
    try {
      const res = await axios.delete(`${API_URL}/meetings/${deleteConfirm.meetingId}`);
      if (res.data.success) {
        toast.success("✅ Meeting deleted successfully!");
        fetchMeetings();
        setDeleteConfirm({ open: false, meetingId: null, meetingTitle: "" });
      } else {
        toast.error(res.data.message || "❌ Failed to delete meeting");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete meeting");
    }
  };

  // 🟢 Format date and time
  const formatDateTime = (date, time) => {
    if (!date) return { date: "N/A", time: "N/A", isPast: false, isToday: false };
    
    const meetingDate = new Date(date);
    const now = new Date();
    const isToday = meetingDate.toDateString() === now.toDateString();
    const isPast = meetingDate < now;
    const isTomorrow = meetingDate.getTime() - now.getTime() < 86400000 && meetingDate > now;

    return {
      date: isToday ? "Today" : isTomorrow ? "Tomorrow" : meetingDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: time ? new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }) : "N/A",
      isPast,
      isToday,
      isTomorrow
    };
  };

  return (
    <div className="amp-container">
      {/* Header with Gradient */}
      <div className="amp-header">
        <div className="amp-header-content">
          <div className="amp-header-left">
            <div className="amp-header-icon">📅</div>
            <div>
              <h1 className="amp-header-title">Meeting Management</h1>
              <p className="amp-header-subtitle">Create and manage team meetings efficiently</p>
            </div>
          </div>
          <div className="amp-stats">
            <div className="amp-stat-item">
              <span className="amp-stat-value">{meetings.length}</span>
              <span className="amp-stat-label">Total Meetings</span>
            </div>
            <div className="amp-stat-item">
              <span className="amp-stat-value">{users.length}</span>
              <span className="amp-stat-label">Team Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Modern Design */}
      <div className="amp-tabs-container">
        <div className="amp-tabs">
          <button 
            className={`amp-tab ${activeTab === "create" ? "amp-tab-active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <span className="amp-tab-icon">➕</span>
            <span>Create Meeting</span>
          </button>
          <button 
            className={`amp-tab ${activeTab === "manage" ? "amp-tab-active" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            <span className="amp-tab-icon">📋</span>
            <span>Manage Meetings</span>
            {meetings.length > 0 && (
              <span className="amp-tab-badge">{meetings.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Create Meeting Form */}
      {activeTab === "create" && (
        <div className="amp-create-section">
          <div className="amp-form-card">
            <div className="amp-form-header">
              <div className="amp-form-title-wrapper">
                <div className="amp-form-icon">📅</div>
                <h2 className="amp-form-title">Create New Meeting</h2>
              </div>
              <p className="amp-form-subtitle">Fill in the details to schedule a meeting</p>
            </div>

            <form onSubmit={createMeeting} className="amp-form">
              <div className="amp-form-grid">
                {/* Left Column */}
                <div className="amp-form-left">
                  <div className="amp-form-group">
                    <label className="amp-label amp-required">Meeting Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Weekly Team Sync"
                      value={form.title}
                      onChange={handleChange}
                      className="amp-input"
                      required
                    />
                  </div>

                  <div className="amp-form-group">
                    <label className="amp-label">Description</label>
                    <textarea
                      name="description"
                      placeholder="Meeting agenda, goals, etc..."
                      value={form.description}
                      onChange={handleChange}
                      className="amp-textarea"
                      rows="4"
                    />
                  </div>

                  <div className="amp-form-row">
                    <div className="amp-form-group">
                      <label className="amp-label amp-required">Date</label>
                      <div className="amp-input-icon-wrapper">
                        <span className="amp-input-icon">📅</span>
                        <input
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          className="amp-input amp-input-with-icon"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="amp-form-group">
                      <label className="amp-label amp-required">Time</label>
                      <div className="amp-input-icon-wrapper">
                        <span className="amp-input-icon">⏰</span>
                        <input
                          type="time"
                          name="time"
                          value={form.time}
                          onChange={handleChange}
                          className="amp-input amp-input-with-icon"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="amp-form-group">
                    <label className="amp-label">Recurrence</label>
                    <div className="amp-select-wrapper">
                      <select
                        name="recurring"
                        value={form.recurring}
                        onChange={handleChange}
                        className="amp-select"
                      >
                        <option value="No">No Recurrence</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column - Attendees */}
                <div className="amp-form-right">
                  <div className="amp-attendees-header">
                    <div className="amp-attendees-title-wrapper">
                      <label className="amp-label amp-required">Select Attendees</label>
                      <span className="amp-attendees-count">
                        {form.attendees.length} / {users.length} selected
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={selectAllAttendees}
                      className="amp-select-all-btn"
                      disabled={!users.length}
                    >
                      {form.attendees.length === users.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="amp-attendees-grid-container">
                    {users.length > 0 ? (
                      <div className="amp-attendees-grid">
                        {users.map((u) => {
                          const userId = getUserId(u);
                          const isSelected = form.attendees.includes(userId);
                          return (
                            <label 
                              key={userId} 
                              className={`amp-attendee-card ${isSelected ? 'amp-attendee-selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                onChange={() => handleAttendeeChange(userId)}
                                checked={isSelected}
                                className="amp-attendee-checkbox"
                              />
                              <div className="amp-attendee-avatar">
                                {u.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="amp-attendee-info">
                                <span className="amp-attendee-name">{u.name || "Unknown User"}</span>
                                <span className="amp-attendee-email">{u.email || "No email"}</span>
                              </div>
                              {isSelected && (
                                <span className="amp-attendee-check">✓</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="amp-no-users">
                        <div className="amp-no-users-icon">👥</div>
                        <p>No users available</p>
                        <span>Please check your connection</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="amp-form-actions">
                <button 
                  type="button"
                  className="amp-btn amp-btn-secondary"
                  onClick={() => {
                    setForm({
                      title: "",
                      description: "",
                      date: "",
                      time: "",
                      recurring: "No",
                      attendees: [],
                    });
                  }}
                >
                  Clear Form
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !users.length} 
                  className="amp-btn amp-btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="amp-spinner"></span>
                      Creating Meeting...
                    </>
                  ) : (
                    <>
                      <span>📅</span>
                      Create Meeting
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Meetings */}
      {activeTab === "manage" && (
        <div className="amp-manage-section">
          <div className="amp-manage-header">
            <div className="amp-manage-title-wrapper">
              <h2 className="amp-manage-title">All Meetings</h2>
              <p className="amp-manage-subtitle">
                {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} scheduled
              </p>
            </div>
            <button 
              onClick={fetchMeetings} 
              disabled={refreshing}
              className="amp-refresh-btn"
            >
              <span className={`amp-refresh-icon ${refreshing ? 'amp-spin' : ''}`}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {!meetings.length ? (
            <div className="amp-empty-state">
              <div className="amp-empty-icon">📅</div>
              <h3 className="amp-empty-title">No Meetings Yet</h3>
              <p className="amp-empty-text">Get started by creating your first meeting</p>
              <button 
                onClick={() => setActiveTab("create")}
                className="amp-btn amp-btn-primary amp-empty-btn"
              >
                <span>➕</span>
                Create Meeting
              </button>
            </div>
          ) : (
            <div className="amp-meetings-grid">
              {meetings.map((meeting) => {
                const datetime = formatDateTime(meeting.date, meeting.time);
                const attendeeCount = Array.isArray(meeting.attendees) ? meeting.attendees.length : 0;
                
                return (
                  <div key={meeting._id || meeting.id} className="amp-meeting-card">
                    <div className="amp-meeting-status-bar" data-status={
                      datetime.isPast ? 'past' : datetime.isToday ? 'today' : 'upcoming'
                    } />
                    
                    <div className="amp-meeting-content">
                      <div className="amp-meeting-header">
                        <div className="amp-meeting-title-wrapper">
                          <span className="amp-meeting-icon">📅</span>
                          <h3 className="amp-meeting-title">{meeting.title || "Untitled Meeting"}</h3>
                        </div>
                        <div className="amp-meeting-badges">
                          {meeting.recurring && meeting.recurring !== "No" && (
                            <span className="amp-badge amp-badge-recurring">
                              🔁 {meeting.recurring}
                            </span>
                          )}
                          <span className={`amp-badge amp-badge-status ${
                            datetime.isPast ? 'amp-badge-past' : 
                            datetime.isToday ? 'amp-badge-today' : 'amp-badge-upcoming'
                          }`}>
                            {datetime.isPast ? 'Past' : datetime.isToday ? 'Today' : 'Upcoming'}
                          </span>
                        </div>
                      </div>

                      {meeting.description && (
                        <p className="amp-meeting-description">{meeting.description}</p>
                      )}

                      <div className="amp-meeting-details">
                        <div className="amp-detail-item">
                          <span className="amp-detail-icon">📆</span>
                          <span className={`amp-detail-text ${
                            datetime.isPast ? 'amp-text-past' : 
                            datetime.isToday ? 'amp-text-today' : ''
                          }`}>
                            {datetime.date}
                          </span>
                        </div>
                        <div className="amp-detail-item">
                          <span className="amp-detail-icon">⏰</span>
                          <span className="amp-detail-text">{datetime.time}</span>
                        </div>
                        <div className="amp-detail-item">
                          <span className="amp-detail-icon">👥</span>
                          <span className="amp-detail-text">{attendeeCount} attendees</span>
                        </div>
                      </div>

                      <div className="amp-meeting-footer">
                        <div className="amp-creator-info">
                          <span className="amp-creator-avatar">
                            {meeting.createdBy?.name?.charAt(0) || 'A'}
                          </span>
                          <span className="amp-creator-name">
                            {meeting.createdBy?.name || 'Admin'}
                          </span>
                        </div>
                        
                        <div className="amp-meeting-actions">
                          <button 
                            onClick={() => showStatus(meeting._id || meeting.id, meeting.title)}
                            className="amp-action-btn amp-action-view"
                            title="View Attendance"
                          >
                            👁️
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm({
                              open: true,
                              meetingId: meeting._id || meeting.id,
                              meetingTitle: meeting.title
                            })}
                            className="amp-action-btn amp-action-delete"
                            title="Delete Meeting"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Status Modal */}
      {statusModal.open && (
        <div className="amp-modal-overlay" onClick={() => setStatusModal({ open: false, data: [], meetingTitle: "" })}>
          <div className="amp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="amp-modal-header">
              <div className="amp-modal-title-wrapper">
                <span className="amp-modal-icon">📋</span>
                <h3 className="amp-modal-title">Attendance Status</h3>
              </div>
              <button 
                onClick={() => setStatusModal({ open: false, data: [], meetingTitle: "" })}
                className="amp-modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="amp-modal-subheader">
              <span className="amp-meeting-badge">{statusModal.meetingTitle}</span>
              <span className="amp-attendee-total">
                {statusModal.data.length} {statusModal.data.length === 1 ? 'attendee' : 'attendees'}
              </span>
            </div>

            <div className="amp-modal-content">
              {statusModal.data.length > 0 ? (
                <div className="amp-status-list">
                  <div className="amp-status-header">
                    <span>Attendee</span>
                    <span>Status</span>
                  </div>
                  {statusModal.data.map((item, index) => (
                    <div key={index} className="amp-status-item">
                      <div className="amp-status-user">
                        <div className="amp-status-avatar">
                          {item.userId?.name?.charAt(0) || item.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="amp-status-user-info">
                          <span className="amp-status-user-name">
                            {item.userId?.name || item.user?.name || "Unknown User"}
                          </span>
                          <span className="amp-status-user-email">
                            {item.userId?.email || item.user?.email || "No email"}
                          </span>
                        </div>
                      </div>
                      <div className={`amp-status-badge ${item.viewed ? 'amp-status-seen' : 'amp-status-pending'}`}>
                        {item.viewed ? (
                          <>
                            <span>✅</span>
                            <span>Seen</span>
                          </>
                        ) : (
                          <>
                            <span>⏳</span>
                            <span>Not Seen</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="amp-no-status">
                  <div className="amp-no-status-icon">📭</div>
                  <p>No attendance data available</p>
                  <span>No one has viewed this meeting yet</span>
                </div>
              )}
            </div>

            <div className="amp-modal-footer">
              <button 
                onClick={() => setStatusModal({ open: false, data: [], meetingTitle: "" })}
                className="amp-btn amp-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="amp-modal-overlay" onClick={() => setDeleteConfirm({ open: false, meetingId: null, meetingTitle: "" })}>
          <div className="amp-modal amp-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="amp-modal-header amp-modal-header-danger">
              <div className="amp-modal-title-wrapper">
                <span className="amp-modal-icon">⚠️</span>
                <h3 className="amp-modal-title">Delete Meeting</h3>
              </div>
              <button 
                onClick={() => setDeleteConfirm({ open: false, meetingId: null, meetingTitle: "" })}
                className="amp-modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="amp-modal-content amp-modal-content-center">
              <div className="amp-delete-icon">🗑️</div>
              <p className="amp-delete-text">
                Are you sure you want to delete <strong>"{deleteConfirm.meetingTitle}"</strong>?
              </p>
              <p className="amp-delete-subtext">This action cannot be undone.</p>
            </div>

            <div className="amp-modal-footer amp-modal-footer-center">
              <button 
                onClick={() => setDeleteConfirm({ open: false, meetingId: null, meetingTitle: "" })}
                className="amp-btn amp-btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={deleteMeeting}
                className="amp-btn amp-btn-danger"
              >
                Delete Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}