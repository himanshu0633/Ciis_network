import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeMeetingPage() {
  const userId = "employee-id"; // replace dynamically with logged-in user
  const [meetings, setMeetings] = useState([]);

  const fetchMeetings = async () => {
    const res = await axios.get(`http://localhost:5000/api/meetings/user/${userId}`);
    setMeetings(res.data);
  };

  useEffect(() => { fetchMeetings(); }, []);

  const markSeen = async (id) => {
    await axios.post("http://localhost:5000/api/meetings/mark-viewed", { meetingId: id, userId });
    fetchMeetings();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>👨‍💻 My Meetings</h2>
      {meetings.map(m => (
        <div key={m._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h4>{m.title}</h4>
          <p>{m.description}</p>
          <p><b>Date:</b> {new Date(m.date).toDateString()}</p>
          <p><b>Time:</b> {m.time}</p>
          <button onClick={() => markSeen(m._id)}>Mark as Seen</button>
        </div>
      ))}
    </div>
  );
}
