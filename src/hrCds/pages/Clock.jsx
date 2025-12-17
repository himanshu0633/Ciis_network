import { useState } from "react";
import axios from "../../utils/axiosConfig";

export default function Clock() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClockIn = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/attendance/in");
      setMessage(res.data?.message || "Clock In successful");
    } catch (err) {
      setMessage(err.response?.data?.message || "Clock In failed");
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/attendance/out");
      setMessage(res.data?.message || "Clock Out successful");
    } catch (err) {
      setMessage(err.response?.data?.message || "Clock Out failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h2 style={{ marginBottom: 20 }}>Attendance</h2>

        <button
          onClick={handleClockIn}
          disabled={loading}
          style={{ ...styles.btn, background: "#16a34a" }}
        >
          CLOCK IN
        </button>

        <button
          onClick={handleClockOut}
          disabled={loading}
          style={{ ...styles.btn, background: "#dc2626" }}
        >
          CLOCK OUT
        </button>

        {message && (
          <p style={{ marginTop: 20, fontWeight: "bold" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ===== SIMPLE STYLES ===== */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
  },
  box: {
    width: 300,
    padding: 20,
    background: "#fff",
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  btn: {
    width: "100%",
    padding: "15px 0",
    marginBottom: 15,
    color: "#fff",
    fontSize: 18,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
