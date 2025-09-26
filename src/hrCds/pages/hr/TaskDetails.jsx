import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";

const EMPLOYEE_TYPES = ["all", "intern", "technical", "non-technical", "sales"];

const TaskDetails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all"); // 👈 new filter

  // ✅ Role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser?.role || parsedUser?.user?.role || "")
          .toString()
          .trim()
          .toLowerCase();
        setCurrentUserRole(role);
      } catch (err) {
        setCurrentUserRole("");
      }
    }
  }, []);

  const canManage = useMemo(
    () => ["admin", "manager", "hr"].includes(currentUserRole),
    [currentUserRole]
  );

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setError("");
      try {
        const res = await axios.get("/task/all-users");
        setUsers(res?.data?.users || []);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            "Error fetching users please try again."
        );
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Fetch self-assigned tasks for selected user
  const fetchSelfAssignedTasks = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/task/user-self-assigned/${userId}`);
      setTasks(res?.data?.groupedTasks || {});
      setSelectedUserId(userId);
      const u = users.find((x) => x._id === userId) || null;
      setSelectedUser(u);
    } catch (err) {
      setError(err?.response?.data?.error || "Error fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply employeeType filter
  const filteredUsers = useMemo(() => {
    if (selectedEmployeeType === "all") return users;
    return users.filter(
      (u) =>
        u.employeeType &&
        u.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
    );
  }, [users, selectedEmployeeType]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Self-Assigned Tasks</h1>

      {!canManage ? (
        <div
          style={{
            padding: 12,
            border: "1px solid #eee",
            background: "#fff7f7",
            color: "#b71c1c",
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          You have no required permission.(Required role: admin/manager/hr)
        </div>
      ) : (
        <>
          {/* 👇 Employee Type Filter */}
          <section style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 600, marginRight: 8 }}>
              Filter by Employee Type:
            </label>
            <select
              value={selectedEmployeeType}
              onChange={(e) => setSelectedEmployeeType(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 16,
              }}
            >
              {EMPLOYEE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
          </section>

          {/* 👇 Users Grid */}
          <section>
            <h3 style={{ marginBottom: 8 }}>User</h3>

            {usersLoading ? (
              <p>Users loading…</p>
            ) : error ? (
              <p style={{ color: "#c62828" }}>{error}</p>
            ) : filteredUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 8,
                }}
              >
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => fetchSelfAssignedTasks(user._id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border:
                        selectedUserId === user._id
                          ? "2px solid #1976d2"
                          : "1px solid #ddd",
                      background:
                        selectedUserId === user._id ? "#e3f2fd" : "#fff",
                      cursor: "pointer",
                    }}
                    aria-pressed={selectedUserId === user._id}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {user.name || "Unnamed"}
                    </div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      {user.role?.toUpperCase() || "N/A"}
                    </div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      {user.employeeType?.toUpperCase() || "N/A"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* 👇 Task Section */}
          {selectedUserId && (
            <section style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <h2 style={{ margin: 0 }}>Tasks</h2>
                {selectedUser && (
                  <span style={{ color: "#555" }}>
                    — {selectedUser.name} ({selectedUser.role})
                  </span>
                )}
              </div>

              {loading ? (
                <p style={{ marginTop: 12 }}>Tasks load ho rahe hain…</p>
              ) : Object.keys(tasks).length === 0 ? (
                <p style={{ marginTop: 12 }}>Self task not assigned.</p>
              ) : (
                Object.keys(tasks).map((date) => (
                  <div
                    key={date}
                    style={{
                      marginTop: 16,
                      padding: 12,
                      border: "1px solid #eee",
                      borderRadius: 8,
                    }}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                      {date} Tasks
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {tasks[date].map((task) => (
                        <li key={task._id} style={{ marginBottom: 10 }}>
                          <div style={{ fontWeight: 600 }}>
                            Task {task.serialNo}: {task.title}
                          </div>
                          {task.description && (
                            <div style={{ color: "#444", marginTop: 2 }}>
                              {task.description}
                            </div>
                          )}
                          {Array.isArray(task.statusInfo) &&
                            task.statusInfo.length > 0 && (
                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 13,
                                  color: "#555",
                                }}
                              >
                                {task.statusInfo.map((s, idx) => (
                                  <div key={idx}>
                                    Status: <strong>{s.status}</strong> by{" "}
                                    {s.name} ({s.role})
                                  </div>
                                ))}
                              </div>
                            )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default TaskDetails;
