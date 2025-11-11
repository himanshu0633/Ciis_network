import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../../config";

export default function AdminMeetingPage() {
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    recurring: "No",
    attendees: [],
  });

  // ✅ Fetch all users
  useEffect(() => {
    axios
      .get(`${API_URL}/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("❌ Error fetching users:", err));
  }, []);

  // ✅ Fetch all meetings
  const fetchMeetings = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_URL}/meetings`);
      setMeetings(res.data);
    } catch (err) {
      console.error("❌ Error fetching meetings:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle attendee selection
  const handleAttendeeChange = (id) => {
    setForm((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(id)
        ? prev.attendees.filter((a) => a !== id)
        : [...prev.attendees, id],
    }));
  };

  // ✅ Create a new meeting
  const createMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/meetings/create`, {
        ...form,
        createdBy: "admin-id", // Replace with real admin ID
      });
      alert("✅ Meeting created successfully!");
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        recurring: "No",
        attendees: [],
      });
      fetchMeetings();
    } catch (error) {
      alert("❌ Failed to create meeting");
      console.error("Create Meeting Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show attendance status of a meeting
  const showStatus = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/meetings/view-status/${id}`);
      const list = res.data
        .map(
          (v) => `${v.userId.name} - ${v.viewed ? "✅ Seen" : "❌ Not Seen"}`
        )
        .join("\n");
      alert(list);
    } catch (err) {
      console.error("View status error:", err);
    }
  };

  // ✅ Refresh meetings list
  const handleRefresh = () => {
    fetchMeetings();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📅 Admin Meeting Creator</h2>

      {/* Meeting Form */}
      <form onSubmit={createMeeting} style={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="Meeting Title"
          value={form.title}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="description"
          placeholder="Meeting Description"
          value={form.description}
          onChange={handleChange}
          style={styles.textarea}
        ></textarea>

        <div style={styles.row}>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <select
            name="recurring"
            value={form.recurring}
            onChange={handleChange}
            style={styles.input}
          >
            <option>No</option>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </div>

        <h4>Select Attendees</h4>
        <div style={styles.attendees}>
          {users.map((u) => (
            <label key={u._id} style={styles.checkbox}>
              <input
                type="checkbox"
                onChange={() => handleAttendeeChange(u._id)}
                checked={form.attendees.includes(u._id)}
              />{" "}
              {u.name}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating..." : "Create Meeting"}
        </button>
      </form>

      {/* Meetings Section */}
      <div style={styles.meetingsHeader}>
        <h3>📋 All Meetings</h3>
        <button onClick={handleRefresh} style={styles.refreshBtn}>
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {meetings.length === 0 ? (
        <p>No meetings created yet.</p>
      ) : (
        meetings.map((m) => (
          <div key={m._id} style={styles.meetingCard}>
            <strong>{m.title}</strong> <br />
            {new Date(m.date).toDateString()} at {m.time}
            <br />
            <span style={styles.recurring}>
              🔁 {m.recurring === "No" ? "One-time" : m.recurring}
            </span>
            <br />
            <button onClick={() => showStatus(m._id)} style={styles.statusBtn}>
              View Status
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "8px",
    minHeight: "80px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  attendees: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  checkbox: {
    fontSize: "14px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "5px 10px",
  },
  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  meetingsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "30px",
  },
  refreshBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  meetingCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    margin: "10px 0",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  recurring: {
    fontSize: "12px",
    color: "#666",
  },
  statusBtn: {
    background: "#17a2b8",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    marginTop: "5px",
    cursor: "pointer",
  },
};
