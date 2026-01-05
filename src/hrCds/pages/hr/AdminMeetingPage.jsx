import React, { useEffect, useState } from "react";
import axios from "../../../utils/axiosConfig";
import API_URL from "../../../config";
import { toast } from "react-toastify";

export default function AdminMeetingPage() {
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [statusModal, setStatusModal] = useState({ open: false, data: [] });

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
      const res = await axios.get(`${API_URL}/users/all-users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("❌ Failed to load users");
    }
  };

  // 🟢 Fetch all meetings
  const fetchMeetings = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_URL}/meetings`);
      setMeetings(res.data || []);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      toast.error("❌ Failed to fetch meetings");
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
    const allUserIds = users.map(user => user._id);
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
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Show view status
  const showStatus = async (meetingId) => {
    try {
      const res = await axios.get(`${API_URL}/meetings/view-status/${meetingId}`);
      if (res.data.length === 0) {
        toast.info("No attendees found for this meeting");
        return;
      }

      setStatusModal({
        open: true,
        data: res.data,
        meetingTitle: meetings.find(m => m._id === meetingId)?.title || "Meeting"
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load meeting status");
    }
  };

  // 🟢 Delete meeting
  const deleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    
    try {
      const res = await axios.delete(`${API_URL}/meetings/${meetingId}`);
      if (res.data.success) {
        toast.success("✅ Meeting deleted successfully!");
        fetchMeetings();
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete meeting");
    }
  };

  // 🟢 Format date and time
  const formatDateTime = (date, time) => {
    const meetingDate = new Date(date);
    const now = new Date();
    const isToday = meetingDate.toDateString() === now.toDateString();
    const isPast = meetingDate < now;

    return {
      date: isToday ? "Today" : meetingDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      isPast,
      isToday
    };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>📅 Meeting Management</h2>
        <p style={styles.subtitle}>Create and manage team meetings</p>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "create" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("create")}
        >
          ➕ Create Meeting
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "manage" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("manage")}
        >
          📋 Manage Meetings ({meetings.length})
        </button>
      </div>

      {/* Create Meeting Form */}
      {activeTab === "create" && (
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Meeting</h3>
            <form onSubmit={createMeeting} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Meeting Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter meeting title..."
                  value={form.title}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Meeting description..."
                  value={form.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="3"
                ></textarea>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    style={styles.input}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recurring</label>
                  <select
                    name="recurring"
                    value={form.recurring}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="No">No Recurrence</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <div style={styles.attendeesHeader}>
                  <label style={styles.label}>Select Attendees *</label>
                  <button 
                    type="button" 
                    onClick={selectAllAttendees}
                    style={styles.selectAllBtn}
                  >
                    {form.attendees.length === users.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div style={styles.attendeesGrid}>
                  {users.map((u) => (
                    <label key={u._id} style={styles.checkboxCard}>
                      <input
                        type="checkbox"
                        onChange={() => handleAttendeeChange(u._id)}
                        checked={form.attendees.includes(u._id)}
                        style={styles.checkboxInput}
                      />
                      <div style={{
                        ...styles.checkboxContent,
                        ...(form.attendees.includes(u._id) ? styles.checkboxContentSelected : {})
                      }}>
                        <span style={styles.userName}>{u.name}</span>
                        <span style={styles.userEmail}>{u.email}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={styles.attendeeCount}>
                  {form.attendees.length} of {users.length} attendees selected
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={styles.submitButton}
              >
                {loading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Creating Meeting...
                  </>
                ) : (
                  "📅 Create Meeting"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Meetings */}
      {activeTab === "manage" && (
        <div style={styles.manageSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>All Meetings</h3>
            <button 
              onClick={fetchMeetings} 
              disabled={refreshing}
              style={styles.refreshButton}
            >
              {refreshing ? (
                <>
                  <div style={styles.spinner}></div>
                  Refreshing...
                </>
              ) : (
                "🔄 Refresh"
              )}
            </button>
          </div>

          {meetings.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <h4 style={styles.emptyTitle}>No Meetings Yet</h4>
              <p style={styles.emptyText}>Create your first meeting to get started</p>
              <button 
                onClick={() => setActiveTab("create")}
                style={styles.createFirstButton}
              >
                Create Meeting
              </button>
            </div>
          ) : (
            <div style={styles.meetingsGrid}>
              {meetings.map((meeting) => {
                const datetime = formatDateTime(meeting.date, meeting.time);
                return (
                  <div key={meeting._id} style={styles.meetingCard}>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.meetingTitle}>{meeting.title}</h4>
                      <div style={styles.cardActions}>
                        <button 
                          onClick={() => showStatus(meeting._id)}
                          style={styles.statusButton}
                          title="View Status"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => deleteMeeting(meeting._id)}
                          style={styles.deleteButton}
                          title="Delete Meeting"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {meeting.description && (
                      <p style={styles.meetingDescription}>{meeting.description}</p>
                    )}
                    
                    <div style={styles.meetingDetails}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>📅</span>
                        <span style={{
                          ...styles.detailText,
                          ...(datetime.isToday ? styles.todayText : {}),
                          ...(datetime.isPast ? styles.pastText : {})
                        }}>
                          {datetime.date} at {datetime.time}
                        </span>
                      </div>
                      
                      {meeting.recurring !== "No" && (
                        <div style={styles.detailItem}>
                          <span style={styles.detailIcon}>🔁</span>
                          <span style={styles.detailText}>{meeting.recurring}</span>
                        </div>
                      )}
                      
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>👥</span>
                        <span style={styles.detailText}>
                          {meeting.attendees?.length || 0} attendees
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardFooter}>
                      <span style={styles.createdBy}>
                        Created by: {meeting.createdBy?.name || "Admin"}
                      </span>
                      <button 
                        onClick={() => showStatus(meeting._id)}
                        style={styles.viewStatusButton}
                      >
                        View Attendance
                      </button>
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Attendance Status - {statusModal.meetingTitle}</h3>
              <button 
                onClick={() => setStatusModal({ open: false, data: [] })}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalContent}>
              {statusModal.data.map((item, index) => (
                <div key={index} style={styles.statusItem}>
                  <span style={styles.userName}>{item.userId?.name || "Unknown User"}</span>
                  <span style={{
                    ...styles.statusBadge,
                    ...(item.viewed ? styles.statusSeen : styles.statusPending)
                  }}>
                    {item.viewed ? "✅ Seen" : "❌ Not Seen"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Styling
const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    fontWeight: "400",
  },
  tabContainer: {
    display: "flex",
    background: "#fff",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tab: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#64748b",
  },
  activeTab: {
    background: "#3b82f6",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
  },
  formSection: {
    background: "transparent",
  },
  formCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formRow: {
    display: "grid",
    gap: "16px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    backgroundColor: "#fff",
  },
  textarea: {
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "80px",
    fontFamily: "inherit",
  },
  attendeesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectAllBtn: {
    padding: "6px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  attendeesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "8px",
    maxHeight: "200px",
    overflowY: "auto",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  checkboxCard: {
    display: "flex",
    cursor: "pointer",
  },
  checkboxInput: {
    display: "none",
  },
  checkboxContent: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb",
  },
  checkboxContentSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#dbeafe",
  },
  userName: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#1f2937",
  },
  userEmail: {
    display: "block",
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "2px",
  },
  attendeeCount: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "right",
    marginTop: "4px",
  },
  submitButton: {
    padding: "14px 24px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  manageSection: {
    background: "transparent",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  refreshButton: {
    padding: "10px 16px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  emptyText: {
    color: "#6b7280",
    marginBottom: "20px",
  },
  createFirstButton: {
    padding: "12px 24px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  meetingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },
  meetingCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  meetingTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    flex: 1,
    marginRight: "12px",
  },
  cardActions: {
    display: "flex",
    gap: "4px",
  },
  statusButton: {
    padding: "6px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
  },
  deleteButton: {
    padding: "6px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#ef4444",
  },
  meetingDescription: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  meetingDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  detailIcon: {
    fontSize: "14px",
    width: "20px",
  },
  detailText: {
    fontSize: "14px",
    color: "#374151",
  },
  todayText: {
    color: "#059669",
    fontWeight: "600",
  },
  pastText: {
    color: "#6b7280",
    textDecoration: "line-through",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #f3f4f6",
  },
  createdBy: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  viewStatusButton: {
    padding: "6px 12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid currentColor",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "12px",
    padding: "0",
    maxWidth: "500px",
    width: "100%",
    maxHeight: "80vh",
    overflow: "hidden",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  closeButton: {
    padding: "4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
    color: "#6b7280",
  },
  modalContent: {
    padding: "24px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusSeen: {
    background: "#dcfce7",
    color: "#166534",
  },
  statusPending: {
    background: "#fef2f2",
    color: "#991b1b",
  },
};

// Add CSS animation for spinner
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);