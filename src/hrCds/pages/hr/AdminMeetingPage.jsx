import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminMeetingPage() {
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "", recurring: "No", attendees: []
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/users").then(res => setUsers(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAttendeeChange = (id) => {
    const updated = form.attendees.includes(id)
      ? form.attendees.filter(a => a !== id)
      : [...form.attendees, id];
    setForm({ ...form, attendees: updated });
  };

  const createMeeting = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/meetings/create", {
      ...form,
      createdBy: "admin-id" // replace with actual admin ID
    });
    alert("Meeting created successfully");
  };

  const showStatus = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/meetings/view-status/${id}`);
    const list = res.data.map(v => `${v.userId.name} - ${v.viewed ? "✅ Seen" : "❌ Not Seen"}`).join("\n");
    alert(list);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <h2>📅 Admin Meeting Creator</h2>
      <form onSubmit={createMeeting}>
        <input type="text" name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="time" onChange={handleChange} required />
        <select name="recurring" onChange={handleChange}>
          <option>No</option>
          <option>Daily</option>
        </select>

        <h4>Select Attendees</h4>
        {users.map(u => (
          <label key={u._id}>
            <input
              type="checkbox"
              onChange={() => handleAttendeeChange(u._id)}
              checked={form.attendees.includes(u._id)}
            /> {u.name}
          </label>
        ))}

        <button type="submit">Create</button>
      </form>

      <h3>Meetings</h3>
      {meetings.map(m => (
        <div key={m._id}>
          <strong>{m.title}</strong> - {new Date(m.date).toDateString()}
          <button onClick={() => showStatus(m._id)}>View Status</button>
        </div>
      ))}
    </div>
  );
}
    