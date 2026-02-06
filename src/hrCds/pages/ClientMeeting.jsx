import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./ClientMeeting.css";

export default function ClientMeeting() {
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    company: "",
    meetingType: "Online",
    priority: "Normal",
    location: "",
    meetingDate: "",
    meetingTime: "",
    duration: "30",
    description: "",
    followUpRequired: "No",
  });

  /* ================= FETCH ================= */
  const fetchMeetings = async () => {
    try {
      const res = await axiosInstance.get("/cmeeting");
      setMeetings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  /* ================= FILTER ================= */
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || meeting.meetingType === filterType;
    return matchesSearch && matchesType;
  });

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SAVE ================= */
  const saveMeeting = async () => {
    if (!form.clientName || !form.phone || !form.meetingDate || !form.meetingTime) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await axiosInstance.post("/cmeeting/create", form);
      resetForm();
      setShowModal(false);
      fetchMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const deleteMeeting = async (id) => {
    if (!window.confirm("Delete this meeting?")) return;
    try {
      await axiosInstance.delete(`/cmeeting/${id}`);
      fetchMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm({
      clientName: "",
      phone: "",
      email: "",
      company: "",
      meetingType: "Online",
      priority: "Normal",
      location: "",
      meetingDate: "",
      meetingTime: "",
      duration: "30",
      description: "",
      followUpRequired: "No",
    });
  };

  /* ================= STATS ================= */
  const totalMeetings = meetings.length;
  const todayMeetings = meetings.filter(m => 
    m.meetingDate === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="client-meeting-container">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Client Meetings</h2>
          <p className="page-subtitle">Manage and schedule client meetings</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Meeting
        </button>
      </div>

      {/* ================= QUICK STATS ================= */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{totalMeetings}</span>
          <span className="stat-label">Total Meetings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{todayMeetings}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{meetings.filter(m => m.priority === "High").length}</span>
          <span className="stat-label">High Priority</span>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="filters-row">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search meetings..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="Online">Online</option>
          <option value="Demo">Demo</option>
          <option value="Discussion">Discussion</option>
          <option value="Sales">Sales</option>
        </select>

        <select 
          className="filter-select"
          value={form.priority}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule New Meeting</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                {/* Column 1 */}
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company Name"
                  />
                </div>

                {/* Column 2 */}
                <div className="form-group">
                  <label>Meeting Type</label>
                  <select
                    name="meetingType"
                    value={form.meetingType}
                    onChange={handleChange}
                  >
                    <option>Online</option>
                    <option>Demo</option>
                    <option>Discussion</option>
                    <option>Sales</option>
                    <option>Review</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="meetingDate"
                    value={form.meetingDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    name="meetingTime"
                    value={form.meetingTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Full Width Fields */}
              <div className="form-group">
                <label>Location / Platform *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Zoom link or physical address"
                />
              </div>

         

              <div className="form-group">
                <label>Agenda / Notes</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Meeting agenda, discussion points..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveMeeting}>
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
              <path d="M8 14h8M8 18h8" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h4>No meetings found</h4>
            <p>Schedule a new meeting to get started</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Schedule First Meeting
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting._id}>
                  <td>
                    <div className="client-cell">
                      <div className="client-name">{meeting.clientName}</div>
                      <div className="client-meta">
                        {meeting.company && <span>{meeting.company}</span>}
                        {meeting.email && <span>• {meeting.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`meeting-type ${meeting.meetingType.toLowerCase()}`}>
                      {meeting.meetingType}
                    </span>
                  </td>
                  <td>
                    <div className="datetime-cell">
                      <div>{meeting.meetingDate}</div>
                      <div className="time">{meeting.meetingTime}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge priority-${meeting.priority.toLowerCase()}`}>
                      {meeting.priority}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge">Scheduled</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        onClick={() => window.open(meeting.location, '_blank')}
                        title="Join Meeting"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        onClick={() => deleteMeeting(meeting._id)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}