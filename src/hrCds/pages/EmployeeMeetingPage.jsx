import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import API_URL from "../../config";
import { toast } from "react-toastify";

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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your meetings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.userInfo}>
            <h1 style={styles.greeting}>Hello, {userName} 👋</h1>
            <p style={styles.subtitle}>Here are your scheduled meetings</p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>{meetings.length}</span>
              <span style={styles.statLabel}>Total Meetings</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>
                {meetings.filter(m => !m.viewed).length}
              </span>
              <span style={styles.statLabel}>Unseen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div style={styles.controls}>
        <div style={styles.filterTabs}>
          <button
            style={{
              ...styles.filterTab,
              ...(filter === "all" ? styles.filterTabActive : {})
            }}
            onClick={() => setFilter("all")}
          >
            All Meetings
          </button>
          <button
            style={{
              ...styles.filterTab,
              ...(filter === "upcoming" ? styles.filterTabActive : {})
            }}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </button>
          <button
            style={{
              ...styles.filterTab,
              ...(filter === "past" ? styles.filterTabActive : {})
            }}
            onClick={() => setFilter("past")}
          >
            Past
          </button>
          <button
            style={{
              ...styles.filterTab,
              ...(filter === "unseen" ? styles.filterTabActive : {})
            }}
            onClick={() => setFilter("unseen")}
          >
            Unseen
          </button>
        </div>

        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          style={styles.refreshButton}
        >
          {refreshing ? (
            <>
              <div style={styles.smallSpinner}></div>
              Refreshing...
            </>
          ) : (
            "🔄 Refresh"
          )}
        </button>
      </div>

      {/* Meetings List */}
      <div style={styles.meetingsSection}>
        {filteredMeetings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <h3 style={styles.emptyTitle}>
              {filter === "all" ? "No Meetings Scheduled" :
               filter === "upcoming" ? "No Upcoming Meetings" :
               filter === "past" ? "No Past Meetings" : "No Unseen Meetings"}
            </h3>
            <p style={styles.emptyText}>
              {filter === "all" ? "You don't have any meetings scheduled yet." :
               filter === "unseen" ? "You've seen all your meetings! 🎉" :
               `No ${filter} meetings found.`}
            </p>
            {filter !== "all" && (
              <button 
                onClick={() => setFilter("all")}
                style={styles.viewAllButton}
              >
                View All Meetings
              </button>
            )}
          </div>
        ) : (
          <div style={styles.meetingsGrid}>
            {filteredMeetings.map((meeting) => {
              const status = getMeetingStatus(meeting);
              return (
                <div key={meeting._id} style={styles.meetingCard}>
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.titleSection}>
                      <h3 style={styles.meetingTitle}>{meeting.title}</h3>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: status.color
                      }}>
                        {status.text}
                      </span>
                    </div>
                    <div style={styles.viewStatus}>
                      <span style={{
                        ...styles.viewIndicator,
                        color: meeting.viewed ? "#059669" : "#dc2626"
                      }}>
                        {meeting.viewed ? "✅ Seen" : "👁️ Not Seen"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {meeting.description && (
                    <p style={styles.meetingDescription}>{meeting.description}</p>
                  )}

                  {/* Meeting Details */}
                  <div style={styles.meetingDetails}>
                    <div style={styles.detailRow}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>📅</span>
                        <div>
                          <div style={styles.detailLabel}>Date</div>
                          <div style={styles.detailValue}>
                            {formatDate(meeting.date)}
                          </div>
                        </div>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>🕒</span>
                        <div>
                          <div style={styles.detailLabel}>Time</div>
                          <div style={styles.detailValue}>
                            {formatTime(meeting.time)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {meeting.recurring !== "No" && (
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>🔁</span>
                        <div>
                          <div style={styles.detailLabel}>Recurrence</div>
                          <div style={styles.detailValue}>{meeting.recurring}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {!meeting.viewed && status.type !== "past" && (
                    <div style={styles.actionSection}>
                      <button 
                        onClick={() => markSeen(meeting._id)}
                        style={styles.markSeenButton}
                      >
                        <span style={styles.buttonIcon}>👁️</span>
                        Mark as Seen
                      </button>
                    </div>
                  )}

                  {/* Past Meeting Note */}
                  {status.type === "past" && !meeting.viewed && (
                    <div style={styles.pastNote}>
                      <span style={styles.pastIcon}>💡</span>
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
      <div style={styles.footer}>
        <div style={styles.footerStats}>
          <span style={styles.footerStat}>
            📊 Showing {filteredMeetings.length} of {meetings.length} meetings
          </span>
          <span style={styles.footerStat}>
            👁️ {meetings.filter(m => !m.viewed).length} unseen
          </span>
        </div>
      </div>
    </div>
  );
}

// Enhanced Styling
const styles = {
  container: {
    padding: "0",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  smallSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid currentColor",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    color: "#6b7280",
    fontWeight: "500",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "40px 24px",
    borderRadius: "0 0 20px 20px",
    marginBottom: "32px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "900px",
    margin: "0 auto",
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "white",
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    margin: 0,
    fontWeight: "400",
  },
  headerStats: {
    display: "flex",
    gap: "20px",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(255,255,255,0.15)",
    padding: "16px 20px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "0.875rem",
    opacity: 0.9,
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "900px",
    margin: "0 auto 24px auto",
    padding: "0 24px",
  },
  filterTabs: {
    display: "flex",
    background: "#fff",
    borderRadius: "12px",
    padding: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  filterTab: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#64748b",
  },
  filterTabActive: {
    background: "#3b82f6",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
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
    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
  },
  meetingsSection: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "0 24px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
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
    fontSize: "14px",
  },
  viewAllButton: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  meetingsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  meetingCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  meetingTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    flex: 1,
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    whiteSpace: "nowrap",
  },
  viewStatus: {
    textAlign: "right",
  },
  viewIndicator: {
    fontSize: "14px",
    fontWeight: "500",
  },
  meetingDescription: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "20px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "8px",
    borderLeft: "3px solid #3b82f6",
  },
  meetingDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  detailRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  detailIcon: {
    fontSize: "18px",
    width: "24px",
    textAlign: "center",
  },
  detailLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailValue: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },
  actionSection: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },
  markSeenButton: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
  },
  buttonIcon: {
    fontSize: "16px",
  },
  pastNote: {
    marginTop: "16px",
    padding: "12px",
    background: "#fef3c7",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#92400e",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pastIcon: {
    fontSize: "16px",
  },
  footer: {
    maxWidth: "900px",
    margin: "32px auto 0 auto",
    padding: "20px 24px",
    borderTop: "1px solid #e5e7eb",
  },
  footerStats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#6b7280",
  },
  footerStat: {
    fontWeight: "500",
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