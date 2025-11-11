import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

export default function EmployeeMeetingPage() {
  const userId = "employee-id"; // ✅ Replace with logged-in user's ID dynamically
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch Meetings for the Employee
  const fetchMeetings = async () => {
    try {
      const res = await axios.get(`${API_URL}/meetings/user/${userId}`);
      setMeetings(res.data);
    } catch (error) {
      console.error("❌ Error fetching meetings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // ✅ Mark meeting as seen
  const markSeen = async (id) => {
    try {
      await axios.post(`${API_URL}/meetings/mark-viewed`, {
        meetingId: id,
        userId,
      });
      fetchMeetings();
    } catch (err) {
      alert("❌ Failed to update status.");
      console.error(err);
    }
  };

  // ✅ Refresh button for convenience
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  // ✅ While loading
  if (loading)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>⏳ Loading meetings...</p>;

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
        <p>No meetings assigned yet.</p>
      ) : (
        meetings.map((m) => (
          <div key={m._id} style={styles.card}>
            <h3>{m.title}</h3>
            <p>{m.description || "No description provided."}</p>
            <p>
              <b>📅 Date:</b> {new Date(m.date).toLocaleDateString()}
            </p>
            <p>
              <b>🕒 Time:</b> {m.time}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span style={{ color: m.viewed ? "green" : "red" }}>
                {m.viewed ? "✅ Seen" : "❌ Not Seen"}
              </span>
            </p>
            {!m.viewed && (
              <button
                onClick={() => markSeen(m._id)}
                style={styles.btn}
                disabled={refreshing}
              >
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
    maxWidth: "750px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  meetingCount: {
    fontSize: "16px",
    fontWeight: "500",
  },
  refreshBtn: {
    background: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "15px",
    background: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  btn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
  },
};
