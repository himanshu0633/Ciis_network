import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import API_URL from "../../config";
import { toast } from "react-toastify";
import '../Css/EmployeeMeetingPage.css';

export default function EmployeeMeetingPage() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, unseen

  // 🟢 Load user data safely from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const id = storedUser?._id || storedUser?.id || localStorage.getItem("userId");
    const name = storedUser?.name || "Employee";
    
    if (!id) {
      toast.error("⚠️ No user found. Please log in again.");
      return;
    }
    setUserId(id);
    setUserName(name);
  }, []);

  // 🟢 Fetch employee's meetings
  const fetchMeetings = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/meetings/user/${id}`);
      console.log("📩 Meeting API response:", res.data);
      if (Array.isArray(res.data)) {
        setMeetings(res.data);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error("❌ Error fetching meetings:", err);
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🟢 Refetch when userId available
  useEffect(() => {
    if (userId) fetchMeetings(userId);
  }, [userId]);

  // 🟢 Mark as Seen
  const markSeen = async (meetingId) => {
    if (!userId) return;
    try {
      await axios.post(`${API_URL}/meetings/mark-viewed`, {
        meetingId,
        userId,
      });
      toast.success("✅ Marked as seen!");
      fetchMeetings(userId);
    } catch (err) {
      console.error("❌ Mark Seen error:", err);
      toast.error("Failed to update status");
    }
  };

  // 🟢 Manual refresh
  const handleRefresh = () => {
    if (!userId) return;
    setRefreshing(true);
    fetchMeetings(userId);
  };

  // 🟢 Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    
    switch (filter) {
      case "upcoming":
        return meetingDate >= now;
      case "past":
        return meetingDate < now;
      case "unseen":
        return !meeting.viewed;
      default:
        return true;
    }
  });

  // 🟢 Get meeting status
  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    
    if (meetingDate < now) {
      return { type: "past", text: "Completed", color: "#6b7280" };
    } else if (meetingDate.toDateString() === now.toDateString()) {
      return { type: "today", text: "Today", color: "#059669" };
    } else {
      return { type: "upcoming", text: "Upcoming", color: "#2563eb" };
    }
  };

  // 🟢 Format time
  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // 🟢 Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 🕒 Loading State
  if (loading) {
    return (
      <div className="UserCreateTask-meeting-loading-container">
        <div className="UserCreateTask-meeting-spinner"></div>
        <p className="UserCreateTask-meeting-loading-text">Loading your meetings...</p>
      </div>
    );
  }

  return (
    <div className="UserCreateTask-meeting-container">
      {/* Header Section */}
      <div className="UserCreateTask-meeting-header">
        <div className="UserCreateTask-meeting-header-content">
          <div className="UserCreateTask-meeting-user-info">
            <h1 className="UserCreateTask-meeting-greeting">Hello, {userName} 👋</h1>
            <p className="UserCreateTask-meeting-subtitle">Here are your scheduled meetings</p>
          </div>
          <div className="UserCreateTask-meeting-header-stats">
            <div className="UserCreateTask-meeting-stat-card">
              <span className="UserCreateTask-meeting-stat-number">{meetings.length}</span>
              <span className="UserCreateTask-meeting-stat-label">Total Meetings</span>
            </div>
            <div className="UserCreateTask-meeting-stat-card">
              <span className="UserCreateTask-meeting-stat-number">
                {meetings.filter(m => !m.viewed).length}
              </span>
              <span className="UserCreateTask-meeting-stat-label">Unseen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="UserCreateTask-meeting-controls">
        <div className="UserCreateTask-meeting-filter-tabs">
          <button
            className={`UserCreateTask-meeting-filter-tab ${filter === "all" ? "UserCreateTask-meeting-filter-tab-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Meetings
          </button>
          <button
            className={`UserCreateTask-meeting-filter-tab ${filter === "upcoming" ? "UserCreateTask-meeting-filter-tab-active" : ""}`}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`UserCreateTask-meeting-filter-tab ${filter === "past" ? "UserCreateTask-meeting-filter-tab-active" : ""}`}
            onClick={() => setFilter("past")}
          >
            Past
          </button>
          <button
            className={`UserCreateTask-meeting-filter-tab ${filter === "unseen" ? "UserCreateTask-meeting-filter-tab-active" : ""}`}
            onClick={() => setFilter("unseen")}
          >
            Unseen
          </button>
        </div>

        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="UserCreateTask-meeting-refresh-button"
        >
          {refreshing ? (
            <>
              <div className="UserCreateTask-meeting-small-spinner"></div>
              Refreshing...
            </>
          ) : (
            "🔄 Refresh"
          )}
        </button>
      </div>

      {/* Meetings List */}
      <div className="UserCreateTask-meeting-section">
        {filteredMeetings.length === 0 ? (
          <div className="UserCreateTask-meeting-empty-state">
            <div className="UserCreateTask-meeting-empty-icon">📅</div>
            <h3 className="UserCreateTask-meeting-empty-title">
              {filter === "all" ? "No Meetings Scheduled" :
               filter === "upcoming" ? "No Upcoming Meetings" :
               filter === "past" ? "No Past Meetings" : "No Unseen Meetings"}
            </h3>
            <p className="UserCreateTask-meeting-empty-text">
              {filter === "all" ? "You don't have any meetings scheduled yet." :
               filter === "unseen" ? "You've seen all your meetings! 🎉" :
               `No ${filter} meetings found.`}
            </p>
            {filter !== "all" && (
              <button 
                onClick={() => setFilter("all")}
                className="UserCreateTask-meeting-view-all-button"
              >
                View All Meetings
              </button>
            )}
          </div>
        ) : (
          <div className="UserCreateTask-meeting-grid">
            {filteredMeetings.map((meeting) => {
              const status = getMeetingStatus(meeting);
              return (
                <div key={meeting._id} className="UserCreateTask-meeting-card">
                  {/* Card Header */}
                  <div className="UserCreateTask-meeting-card-header">
                    <div className="UserCreateTask-meeting-title-section">
                      <h3 className="UserCreateTask-meeting-title">{meeting.title}</h3>
                      <span 
                        className="UserCreateTask-meeting-status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.text}
                      </span>
                    </div>
                    <div className="UserCreateTask-meeting-view-status">
                      <span className={`UserCreateTask-meeting-view-indicator ${meeting.viewed ? "UserCreateTask-meeting-viewed" : "UserCreateTask-meeting-not-viewed"}`}>
                        {meeting.viewed ? "✅ Seen" : "👁️ Not Seen"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {meeting.description && (
                    <p className="UserCreateTask-meeting-description">{meeting.description}</p>
                  )}

                  {/* Meeting Details */}
                  <div className="UserCreateTask-meeting-details">
                    <div className="UserCreateTask-meeting-detail-row">
                      <div className="UserCreateTask-meeting-detail-item">
                        <span className="UserCreateTask-meeting-detail-icon">📅</span>
                        <div>
                          <div className="UserCreateTask-meeting-detail-label">Date</div>
                          <div className="UserCreateTask-meeting-detail-value">
                            {formatDate(meeting.date)}
                          </div>
                        </div>
                      </div>
                      <div className="UserCreateTask-meeting-detail-item">
                        <span className="UserCreateTask-meeting-detail-icon">🕒</span>
                        <div>
                          <div className="UserCreateTask-meeting-detail-label">Time</div>
                          <div className="UserCreateTask-meeting-detail-value">
                            {formatTime(meeting.time)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {meeting.recurring !== "No" && (
                      <div className="UserCreateTask-meeting-detail-item">
                        <span className="UserCreateTask-meeting-detail-icon">🔁</span>
                        <div>
                          <div className="UserCreateTask-meeting-detail-label">Recurrence</div>
                          <div className="UserCreateTask-meeting-detail-value">{meeting.recurring}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {!meeting.viewed && status.type !== "past" && (
                    <div className="UserCreateTask-meeting-action-section">
                      <button 
                        onClick={() => markSeen(meeting._id)}
                        className="UserCreateTask-meeting-mark-seen-button"
                      >
                        <span className="UserCreateTask-meeting-button-icon">👁️</span>
                        Mark as Seen
                      </button>
                    </div>
                  )}

                  {/* Past Meeting Note */}
                  {status.type === "past" && !meeting.viewed && (
                    <div className="UserCreateTask-meeting-past-note">
                      <span className="UserCreateTask-meeting-past-icon">💡</span>
                      This meeting has passed but you haven't marked it as seen
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="UserCreateTask-meeting-footer">
        <div className="UserCreateTask-meeting-footer-stats">
          <span className="UserCreateTask-meeting-footer-stat">
            📊 Showing {filteredMeetings.length} of {meetings.length} meetings
          </span>
          <span className="UserCreateTask-meeting-footer-stat">
            👁️ {meetings.filter(m => !m.viewed).length} unseen
          </span>
        </div>
      </div>
    </div>
  );
}