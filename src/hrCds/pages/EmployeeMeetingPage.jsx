import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import API_URL from "../../config";
import { toast } from "react-toastify";

export default function EmployeeMeetingPage() {
  const [userId, setUserId] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🟢 Load userId safely from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const id = storedUser?._id || storedUser?.id || localStorage.getItem("userId");
    if (!id) {
      toast.error("⚠️ No user found. Please log in again.");
      return;
    }
    setUserId(id);
  }, []);

  // 🟢 Fetch employee’s meetings
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
      toast.success("✅ Marked as Seen");
      fetchMeetings(userId);
    } catch (err) {
      console.error("❌ Mark Seen error:", err);
      toast.error("Failed to update");
    }
  };

  // 🟢 Manual refresh
  const handleRefresh = () => {
    if (!userId) return;
    setRefreshing(true);
    fetchMeetings(userId);
  };

  // 🕒 Loading
  if (loading)
    return (
      <div style={styles.container}>
        <p style={{ textAlign: "center" }}>⏳ Loading your meetings...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👨‍💻 My Meetings</h2>

      <div style={styles.topBar}>
        <p style={styles.meetingCount}>Total Meetings: {meetings.length}</p>
        <button onClick={handleRefresh} style={styles.refreshBtn}>
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {meetings.length === 0 ? (
        <p style={styles.empty}>No meetings assigned yet.</p>
      ) : (
        meetings.map((m) => (
          <div key={m._id} style={styles.card}>
            <h3 style={styles.title}>{m.title}</h3>
            <p style={styles.desc}>{m.description || "No description provided."}</p>
            <p>
              <b>📅 Date:</b> {new Date(m.date).toLocaleDateString()} &nbsp;
              <b>🕒 Time:</b> {m.time}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span style={{ color: m.viewed ? "green" : "red" }}>
                {m.viewed ? "✅ Seen" : "❌ Not Seen"}
              </span>
            </p>
            {!m.viewed && (
              <button onClick={() => markSeen(m._id)} style={styles.btn}>
                Mark as Seen
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "15px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  meetingCount: {
    fontWeight: "500",
  },
  refreshBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
    marginTop: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#222",
  },
  desc: {
    fontSize: "15px",
    color: "#555",
  },
  btn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    marginTop: "10px",
  },
};
