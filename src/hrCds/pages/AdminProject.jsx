// AdminProject.jsx
import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import "../Css/AdminProject.css";

// Icons (you can replace these with actual icon fonts or SVG files)
const Icons = {
  Add: () => <span>+</span>,
  Upload: () => <span>📤</span>,
  Schedule: () => <span>📅</span>,
  Person: () => <span>👤</span>,
  Description: () => <span>📝</span>,
  Delete: () => <span>🗑️</span>,
  Edit: () => <span>✏️</span>,
  AttachFile: () => <span>📎</span>,
  CheckCircle: () => <span>✅</span>,
  Pause: () => <span>⏸️</span>,
  Download: () => <span>⬇️</span>,
  Visibility: () => <span>👁️</span>,
  Pdf: () => <span>📄</span>,
  File: () => <span>📁</span>,
  Close: () => <span>✕</span>,
  Task: () => <span>✓</span>,
  Dashboard: () => <span>📊</span>,
  TrendingUp: () => <span>📈</span>,
  ArrowUpward: () => <span>↑</span>,
  ArrowDownward: () => <span>↓</span>,
  MoreVert: () => <span>⋮</span>,
  Filter: () => <span>🔍</span>,
  Search: () => <span>🔍</span>,
  Sort: () => <span>⇅</span>,
  Calendar: () => <span>📅</span>,
  Group: () => <span>👥</span>,
  Bolt: () => <span>⚡</span>,
  Timeline: () => <span>📈</span>,
  BarChart: () => <span>📊</span>,
  Folder: () => <span>📁</span>,
  CloudDownload: () => <span>⬇️</span>,
  PlayArrow: () => <span>▶️</span>,
  Stop: () => <span>⏹️</span>,
  Flag: () => <span>🚩</span>,
  DateRange: () => <span>📅</span>,
  DescriptionOutlined: () => <span>📝</span>,
  AdminPanelSettings: () => <span>⚙️</span>,
  RocketLaunch: () => <span>🚀</span>,
  CloudUpload: () => <span>📤</span>,
};

export const AdminProject = () => {
  // FORM STATES
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Active");
  const [members, setMembers] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  // DATA STATES
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // UI STATES
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    highPriority: 0
  });

  // DROPDOWN STATES
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  // Fetch users & projects
  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  // Update stats when projects change
  useEffect(() => {
    if (projects.length > 0) {
      const active = projects.filter(p => p.status?.toLowerCase() === "active").length;
      const completed = projects.filter(p => p.status?.toLowerCase() === "completed").length;
      const onHold = projects.filter(p => p.status?.toLowerCase() === "on hold" || p.status?.toLowerCase() === "onhold").length;
      const highPriority = projects.filter(p => p.priority?.toLowerCase() === "high").length;
      
      setStats({
        total: projects.length,
        active,
        completed,
        onHold,
        highPriority
      });
    }
  }, [projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.AdminProject-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Filter users for member dropdown
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Handle member toggle
  const handleMemberToggle = (userId) => {
    if (members.includes(userId)) {
      setMembers(members.filter(id => id !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };

  // Handle member remove from avatars
  const handleMemberRemove = (userId) => {
    setMembers(members.filter(id => id !== userId));
  };

  // Get selected users for display
  const getSelectedUsers = () => users.filter(u => members.includes(u._id));

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users/all-users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error loading users", "error");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects");
      setProjects(res.data.items || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showSnackbar("Error loading projects", "error");
    }
  };

  // Filter and sort projects
  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      project.projectName.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.status.toLowerCase().includes(searchLower) ||
      project.priority.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority?.toLowerCase()] || 0) - (priorityOrder[a.priority?.toLowerCase()] || 0);
      case "name":
        return a.projectName.localeCompare(b.projectName);
      default:
        return 0;
    }
  });

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) newErrors.projectName = "Project name required";
    if (!description.trim()) newErrors.description = "Description required";
    
    if (!startDate) {
      newErrors.startDate = "Start date required";
    } else if (new Date(startDate) < new Date().toISOString().split('T')[0]) {
      newErrors.startDate = "Start date cannot be in the past";
    }
    
    if (!endDate) {
      newErrors.endDate = "End date required";
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    if (members.length === 0) newErrors.members = "Select at least one member";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CREATE / UPDATE PROJECT
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("priority", priority);
    formData.append("status", status);
    formData.append("users", JSON.stringify(members));
    if (file) formData.append("pdfFile", file);

    try {
      if (projectId) {
        await axios.put(`/projects/${projectId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showSnackbar("Project updated successfully!", "success");
      } else {
        await axios.post("/projects", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showSnackbar("Project created successfully!", "success");
      }

      resetForm();
      fetchProjects();
    } catch (err) {
      console.error("Error saving project:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong";
      showSnackbar(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE PROJECT
  const deleteProject = async (id, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"?`)) return;

    try {
      await axios.delete(`/projects/${id}`);
      showSnackbar("Project deleted successfully!", "success");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      showSnackbar("Error deleting project", "error");
    }
  };

  // EDIT PROJECT
  const editProject = (p) => {
    setProjectId(p._id);
    setProjectName(p.projectName);
    setDescription(p.description);
    setStartDate(p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : "");
    setEndDate(p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : "");
    setPriority(p.priority.charAt(0).toUpperCase() + p.priority.slice(1));
    setStatus(p.status.charAt(0).toUpperCase() + p.status.slice(1));
    setMembers(p.users.map(u => u._id));
    setFile(null);
    setFileName("");
    
    // Scroll to form
    document.getElementById('AdminProject-project-form').scrollIntoView({ behavior: 'smooth' });
  };

  // VIEW PROJECT DETAILS
  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setTabValue(0);
    setOpenDetailsDialog(true);
  };

  // VIEW PDF
  const viewPdf = (pdfPath, filename) => {
    if (!pdfPath) {
      showSnackbar("No PDF file available", "warning");
      return;
    }
    
    const pathParts = pdfPath.split('/');
    const pdfFilename = pathParts[pathParts.length - 1];
    const pdfUrl = `${axios.defaults.baseURL}/uploads/projects/${pdfFilename}`;
    setSelectedPdfUrl(pdfUrl);
    setOpenPdfDialog(true);
  };

  // DOWNLOAD PDF
  const downloadPdf = (pdfPath, filename) => {
    if (!pdfPath) {
      showSnackbar("No PDF file available", "warning");
      return;
    }
    
    const pathParts = pdfPath.split('/');
    const pdfFilename = pathParts[pathParts.length - 1];
    const pdfUrl = `${axios.defaults.baseURL}/uploads/projects/${pdfFilename}`;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset form
  const resetForm = () => {
    setProjectId(null);
    setProjectName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setPriority("Medium");
    setStatus("Active");
    setMembers([]);
    setFile(null);
    setFileName("");
    setErrors({});
    setIsDropdownOpen(false);
    setMemberSearchTerm("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        showSnackbar("Only PDF files are allowed", "error");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "#66BB6A";
      case "completed": return "#29B6F6";
      case "on hold":
      case "onhold": return "#FFA726";
      case "planning": return "#AB47BC";
      case "cancelled": return "#EF5350";
      default: return "#9E9E9E";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#EF5350";
      case "medium": return "#FFA726";
      case "low": return "#66BB6A";
      default: return "#9E9E9E";
    }
  };

  const getTaskProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const StatCard = ({ icon, value, label, color, trend, subtext }) => (
    <div className={`AdminProject-stat-card ${color === "#66BB6A" ? "AdminProject-stat-card-green" : color === "#29B6F6" ? "AdminProject-stat-card-blue" : color === "#EF5350" ? "AdminProject-stat-card-red" : ""}`}>
      <div className="AdminProject-stat-content">
        <div className="AdminProject-stat-content-inner">
          <div>
            <div className="AdminProject-stat-value" style={{ color }}>{value}</div>
            <div className="AdminProject-stat-label">{label}</div>
            {subtext && <div className="AdminProject-stat-subtext">{subtext}</div>}
          </div>
          <div className="AdminProject-stat-icon-container" style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`, color }}>
            {icon}
          </div>
        </div>
        {trend && (
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "4px" }}>
            {trend > 0 ? <Icons.ArrowUpward /> : <Icons.ArrowDownward />}
            <span style={{ fontSize: "0.75rem", color, fontWeight: "500" }}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const SnackbarComponent = () => {
    if (!snackbar.open) return null;
    
    return (
      <div className={`AdminProject-snackbar AdminProject-snackbar-${snackbar.severity}`}>
        <div className="AdminProject-snackbar-content">
          <div className="AdminProject-snackbar-message">{snackbar.message}</div>
          <button className="AdminProject-snackbar-close" onClick={handleCloseSnackbar}>
            <Icons.Close />
          </button>
        </div>
      </div>
    );
  };

  const PdfDialog = () => {
    if (!openPdfDialog) return null;
    
    return (
      <div className="AdminProject-dialog-backdrop">
        <div className="AdminProject-dialog" style={{ maxWidth: "1200px", height: "90vh" }}>
          <div className="AdminProject-dialog-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icons.Pdf />
              <div className="AdminProject-dialog-title">PDF Document</div>
            </div>
            <button className="AdminProject-dialog-close" onClick={() => setOpenPdfDialog(false)}>
              <Icons.Close />
            </button>
          </div>
          <div className="AdminProject-dialog-content" style={{ padding: 0, height: "calc(100% - 64px)" }}>
            <iframe
              src={selectedPdfUrl}
              title="PDF Viewer"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          </div>
          <div style={{ padding: "16px", background: "rgba(245, 247, 250, 0.8)", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              className="AdminProject-button AdminProject-button-primary"
              onClick={() => {
                const link = document.createElement('a');
                link.href = selectedPdfUrl;
                link.download = selectedPdfUrl.split('/').pop();
                link.click();
              }}
            >
              <Icons.Download /> Download
            </button>
            <button
              className="AdminProject-button AdminProject-button-outline"
              onClick={() => setOpenPdfDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DetailsDialog = () => {
    if (!openDetailsDialog || !selectedProject) return null;
    
    return (
      <div className="AdminProject-dialog-backdrop">
        <div className="AdminProject-dialog" style={{ maxWidth: "900px" }}>
          <div className="AdminProject-dialog-header">
            <div className="AdminProject-dialog-title">Project Details</div>
            <button className="AdminProject-dialog-close" onClick={() => setOpenDetailsDialog(false)}>
              <Icons.Close />
            </button>
          </div>
          <div className="AdminProject-dialog-content">
            <div className="AdminProject-tabs">
              <button 
                className={`AdminProject-tab ${tabValue === 0 ? "AdminProject-tab-active" : ""}`}
                onClick={() => setTabValue(0)}
              >
                <Icons.Dashboard /> Overview
              </button>
              <button 
                className={`AdminProject-tab ${tabValue === 1 ? "AdminProject-tab-active" : ""}`}
                onClick={() => setTabValue(1)}
              >
                <Icons.Task /> Tasks
              </button>
              <button 
                className={`AdminProject-tab ${tabValue === 2 ? "AdminProject-tab-active" : ""}`}
                onClick={() => setTabValue(2)}
              >
                <Icons.File /> Documents
              </button>
            </div>
            
            {tabValue === 0 && (
              <div className="AdminProject-tab-panel">
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px", color: "#667eea" }}>
                      {selectedProject.projectName}
                    </h3>
                    <p style={{ color: "#666", marginBottom: "16px" }}>
                      {selectedProject.description}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "24px" }}>
                    <div style={{ gridColumn: "span 1" }}>
                      <div className="AdminProject-stat-card" style={{ border: "1px solid #eee" }}>
                        <div className="AdminProject-stat-content">
                          <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Icons.Description /> Project Details
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {[
                              { label: "Status", value: selectedProject.status },
                              { label: "Priority", value: selectedProject.priority },
                              { label: "Start Date", value: selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "Not set" },
                              { label: "End Date", value: selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : "Not set" },
                              { label: "Created On", value: new Date(selectedProject.createdAt).toLocaleDateString() }
                            ].map((item, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.875rem", color: "#666" }}>{item.label}</span>
                                <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ gridColumn: "span 1" }}>
                      <div className="AdminProject-stat-card" style={{ border: "1px solid #eee" }}>
                        <div className="AdminProject-stat-content">
                          <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Icons.Timeline /> Progress & Analytics
                          </h4>
                          <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "0.875rem", color: "#666" }}>Task Completion</span>
                              <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "#667eea" }}>
                                {getTaskProgress(selectedProject.tasks)}%
                              </span>
                            </div>
                            <div className="AdminProject-progress-bar">
                              <div 
                                className="AdminProject-progress-fill"
                                style={{ width: `${getTaskProgress(selectedProject.tasks)}%` }}
                              />
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                              { label: "Total Tasks", value: selectedProject.tasks?.length || 0 },
                              { label: "Completed Tasks", value: selectedProject.tasks?.filter(t => t.status === "completed").length || 0, color: "#66BB6A" },
                              { label: "In Progress", value: selectedProject.tasks?.filter(t => t.status === "in progress").length || 0, color: "#29B6F6" },
                              { label: "Pending", value: selectedProject.tasks?.filter(t => t.status === "pending").length || 0, color: "#FFA726" }
                            ].map((item, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.875rem" }}>{item.label}</span>
                                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: item.color || "inherit" }}>
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="AdminProject-stat-card" style={{ border: "1px solid #eee" }}>
                    <div className="AdminProject-stat-content">
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icons.Group /> Team Members ({selectedProject.users?.length || 0})
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "16px" }}>
                        {selectedProject.users?.map((user) => (
                          <div key={user._id} style={{ border: "1px solid #eee", padding: "16px", borderRadius: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div className="AdminProject-avatar">
                                {user.name?.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: "1rem", fontWeight: "600" }}>{user.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                                  {user.email}
                                </div>
                                {user.role && (
                                  <span className="AdminProject-chip" style={{ marginTop: "4px", fontSize: "0.7rem", background: "rgba(0,0,0,0.05)", padding: "2px 8px" }}>
                                    {user.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tabValue === 1 && (
              <div className="AdminProject-tab-panel">
                <div>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px" }}>
                    Tasks ({selectedProject.tasks?.length || 0})
                  </h4>
                  {selectedProject.tasks?.length > 0 ? (
                    <div className="AdminProject-task-list">
                      {selectedProject.tasks.map((task) => (
                        <div key={task._id} className="AdminProject-task-item">
                          <div className="AdminProject-task-content">
                            <div className="AdminProject-task-header">
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Icons.Task />
                                <div className="AdminProject-task-title">{task.title}</div>
                              </div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span className="AdminProject-chip AdminProject-chip-status" style={{
                                  "--status-color": getStatusColor(task.status),
                                  "--status-color-rgb": getStatusColor(task.status).replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(',')
                                }}>
                                  {task.status}
                                </span>
                                <span className="AdminProject-chip AdminProject-chip-priority" style={{
                                  "--priority-color": getPriorityColor(task.priority),
                                  "--priority-color-rgb": getPriorityColor(task.priority).replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(',')
                                }}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            {task.description && (
                              <p style={{ color: "#666", marginBottom: "16px" }}>
                                {task.description}
                              </p>
                            )}
                            <div className="AdminProject-task-meta">
                              <div className="AdminProject-task-info">
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Icons.Person />
                                  <span>{task.assignedTo?.name || "Unassigned"}</span>
                                </div>
                                {task.dueDate && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Icons.Calendar />
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              {task.pdfFile?.path && (
                                <button
                                  className="AdminProject-icon-button"
                                  onClick={() => viewPdf(task.pdfFile.path, task.pdfFile.filename)}
                                  title="View PDF"
                                >
                                  <Icons.Visibility />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "32px 16px" }}>
                      <Icons.Task style={{ fontSize: "64px", color: "rgba(102, 126, 234, 0.3)", marginBottom: "16px" }} />
                      <p style={{ color: "#666" }}>No tasks available for this project</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tabValue === 2 && (
              <div className="AdminProject-tab-panel">
                <div>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px" }}>
                    Project Documents
                  </h4>
                  
                  {selectedProject.pdfFile?.path ? (
                    <div className="AdminProject-stat-card" style={{ border: "1px solid #eee", marginBottom: "24px" }}>
                      <div className="AdminProject-stat-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "8px",
                              background: "linear-gradient(135deg, rgba(239, 83, 80, 0.1) 0%, rgba(239, 83, 80, 0.05) 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid rgba(239, 83, 80, 0.2)"
                            }}>
                              <Icons.Pdf style={{ fontSize: "32px", color: "#EF5350" }} />
                            </div>
                            <div>
                              <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                                {selectedProject.pdfFile.filename || "Project Document"}
                              </div>
                              <div style={{ fontSize: "0.875rem", color: "#666" }}>
                                Project main document • Uploaded on: {new Date(selectedProject.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="AdminProject-button AdminProject-button-outline"
                              onClick={() => viewPdf(selectedProject.pdfFile.path, selectedProject.pdfFile.filename)}
                            >
                              <Icons.Visibility /> View
                            </button>
                            <button
                              className="AdminProject-button AdminProject-button-primary"
                              onClick={() => downloadPdf(selectedProject.pdfFile.path, selectedProject.pdfFile.filename)}
                            >
                              <Icons.Download /> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: "#e3f2fd", color: "#1565c0", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                      No project document uploaded
                    </div>
                  )}

                  <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "16px" }}>
                    Task Documents ({selectedProject.tasks?.filter(t => t.pdfFile?.path).length || 0})
                  </h4>
                  {selectedProject.tasks?.filter(t => t.pdfFile?.path).length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "16px" }}>
                      {selectedProject.tasks
                        .filter(task => task.pdfFile?.path)
                        .map((task) => (
                          <div key={task._id} className="AdminProject-stat-card" style={{ border: "1px solid #eee" }}>
                            <div className="AdminProject-stat-content">
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                  <Icons.File style={{ fontSize: "32px", color: "#29B6F6" }} />
                                  <div>
                                    <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                                      {task.pdfFile.filename || "Task Document"}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                                      From task: {task.title}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                                      Assigned to: {task.assignedTo?.name || "Unassigned"}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "4px" }}>
                                  <button
                                    className="AdminProject-icon-button"
                                    onClick={() => viewPdf(task.pdfFile.path, task.pdfFile.filename)}
                                    title="View PDF"
                                  >
                                    <Icons.Visibility />
                                  </button>
                                  <button
                                    className="AdminProject-icon-button AdminProject-icon-button-green"
                                    onClick={() => downloadPdf(task.pdfFile.path, task.pdfFile.filename)}
                                    title="Download"
                                  >
                                    <Icons.Download />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ background: "#e3f2fd", color: "#1565c0", padding: "16px", borderRadius: "8px" }}>
                      No task documents available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="AdminProject-container">
      <SnackbarComponent />
      <PdfDialog />
      <DetailsDialog />

      {/* Header */}
      <div className="AdminProject-header">
        <div className="AdminProject-header-content">
          <div>
            <div className="AdminProject-header-title">Project Management</div>
            <div className="AdminProject-header-subtitle">
              Admin dashboard for managing all projects
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Icons.AdminPanelSettings />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="AdminProject-stats-grid">
          <StatCard
            icon={<Icons.Folder />}
            value={stats.total}
            label="Total Projects"
            color="#667eea"
            subtext="Across all teams"
          />
          <StatCard
            icon={<Icons.PlayArrow />}
            value={stats.active}
            label="Active Projects"
            color="#66BB6A"
            trend="+12"
          />
          <StatCard
            icon={<Icons.CheckCircle />}
            value={stats.completed}
            label="Completed"
            color="#29B6F6"
          />
          <StatCard
            icon={<Icons.Flag />}
            value={stats.highPriority}
            label="High Priority"
            color="#EF5350"
            subtext="Urgent attention"
          />
        </div>
      </div>

      {/* CREATE / EDIT PROJECT FORM */}
      <div id="AdminProject-project-form" className="AdminProject-form-card">
        <div className="AdminProject-form-header">
          <div className="AdminProject-form-header-content">
            <div>
              <div className="AdminProject-form-title">
                {projectId ? "Edit Project" : "Create New Project"}
              </div>
              <div className="AdminProject-form-subtitle">
                {projectId ? "Update project details below" : "Fill in the details to create a new project"}
              </div>
            </div>
            {projectId && (
              <button 
                className="AdminProject-button AdminProject-button-outline"
                onClick={resetForm}
                style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="AdminProject-form-content">
          <div className="AdminProject-form-stack">
            {/* PROJECT NAME */}
            <div className="AdminProject-form-group">
              <label className="AdminProject-form-label AdminProject-form-label-required">
                Project Name
              </label>
              <input
                type="text"
                className={`AdminProject-textfield ${errors.projectName ? "AdminProject-textfield-error" : ""}`}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
              {errors.projectName && (
                <div className="AdminProject-helper-text AdminProject-helper-text-error">
                  {errors.projectName}
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="AdminProject-form-group">
              <label className="AdminProject-form-label AdminProject-form-label-required">
                Description
              </label>
              <textarea
                className={`AdminProject-textarea ${errors.description ? "AdminProject-textfield-error" : ""}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
              {errors.description && (
                <div className="AdminProject-helper-text AdminProject-helper-text-error">
                  {errors.description}
                </div>
              )}
            </div>

            {/* DATES */}
            <div className="AdminProject-form-grid">
              <div className="AdminProject-form-group">
                <label className="AdminProject-form-label AdminProject-form-label-required">
                  Start Date
                </label>
                <input
                  type="date"
                  className={`AdminProject-textfield ${errors.startDate ? "AdminProject-textfield-error" : ""}`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && (
                  <div className="AdminProject-helper-text AdminProject-helper-text-error">
                    {errors.startDate}
                  </div>
                )}
              </div>
              <div className="AdminProject-form-group">
                <label className="AdminProject-form-label AdminProject-form-label-required">
                  End Date
                </label>
                <input
                  type="date"
                  className={`AdminProject-textfield ${errors.endDate ? "AdminProject-textfield-error" : ""}`}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.endDate && (
                  <div className="AdminProject-helper-text AdminProject-helper-text-error">
                    {errors.endDate}
                  </div>
                )}
              </div>
            </div>

            {/* PRIORITY & STATUS */}
            <div className="AdminProject-form-grid">
              <div className="AdminProject-form-group">
                <label className="AdminProject-form-label">Priority</label>
                <select
                  className="AdminProject-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">
                    <Icons.Bolt /> Low Priority
                  </option>
                  <option value="Medium">
                    <Icons.Bolt /> Medium Priority
                  </option>
                  <option value="High">
                    <Icons.Bolt /> High Priority
                  </option>
                </select>
              </div>
              <div className="AdminProject-form-group">
                <label className="AdminProject-form-label">Status</label>
                <select
                  className="AdminProject-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">
                    <Icons.PlayArrow /> Active
                  </option>
                  <option value="On Hold">
                    <Icons.Pause /> On Hold
                  </option>
                  <option value="Completed">
                    <Icons.CheckCircle /> Completed
                  </option>
                  <option value="Planning">
                    <Icons.Schedule /> Planning
                  </option>
                  <option value="Cancelled">
                    <Icons.Stop /> Cancelled
                  </option>
                </select>
              </div>
            </div>

            {/* MEMBERS */}
            <div className="AdminProject-form-group">
              <label className="AdminProject-form-label AdminProject-form-label-required">
                Team Members
              </label>
              
              {/* Dropdown Container */}
              <div className="AdminProject-dropdown-container">
                {/* Dropdown Trigger - Shows selected members count */}
                <div 
                  className="AdminProject-dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="AdminProject-dropdown-placeholder">
                    {members.length > 0 
                      ? `${members.length} member${members.length > 1 ? 's' : ''} selected` 
                      : 'Select team members'}
                  </span>
                  <span className={`AdminProject-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="AdminProject-dropdown-menu">
                    <div className="AdminProject-dropdown-search">
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        className="AdminProject-dropdown-search-input"
                      />
                    </div>
                    
                    <div className="AdminProject-dropdown-options">
                      {filteredUsers.map((u) => (
                        <div 
                          key={u._id}
                          className={`AdminProject-dropdown-option ${members.includes(u._id) ? 'selected' : ''}`}
                          onClick={() => handleMemberToggle(u._id)}
                        >
                          <div className="AdminProject-dropdown-option-checkbox">
                            <input
                              type="checkbox"
                              checked={members.includes(u._id)}
                              onChange={() => {}}
                              className="AdminProject-checkbox"
                            />
                          </div>
                          <div className="AdminProject-dropdown-option-avatar">
                            {u.name?.charAt(0)}
                          </div>
                          <div className="AdminProject-dropdown-option-info">
                            <div className="AdminProject-dropdown-option-name">{u.name}</div>
                            <div className="AdminProject-dropdown-option-email">{u.email}</div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <div className="AdminProject-dropdown-no-results">
                          No members found
                        </div>
                      )}
                    </div>
                    
                    <div className="AdminProject-dropdown-footer">
                      <button
                        type="button"
                        className="AdminProject-dropdown-close-btn"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selected Members Avatars */}
              <div className="AdminProject-avatar-group">
                {getSelectedUsers().map((u) => (
                  <div key={u._id} className="AdminProject-avatar" title={`${u.name} (${u.email})`}>
                    {u.name?.charAt(0)}
                    <span 
                      className="AdminProject-avatar-remove"
                      onClick={() => handleMemberRemove(u._id)}
                      title="Remove"
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
              
              {errors.members && (
                <div className="AdminProject-helper-text AdminProject-helper-text-error">
                  {errors.members}
                </div>
              )}
            </div>

            {/* FILE UPLOAD */}
            <div className="AdminProject-form-group">
              <label className="AdminProject-form-label">Project Document (PDF)</label>
              <div>
                <label className="AdminProject-file-upload">
                  <Icons.CloudUpload /> Upload Project Document (PDF)
                  <input
                    type="file"
                    className="AdminProject-file-input"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
                {fileName && (
                  <div className="AdminProject-file-info">
                    <Icons.Pdf /> Selected: {fileName}
                  </div>
                )}
                {projectId && projects.find(p => p._id === projectId)?.pdfFile?.filename && (
                  <div className="AdminProject-file-info">
                    <Icons.Pdf /> Current file: {projects.find(p => p._id === projectId)?.pdfFile?.filename}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="AdminProject-button-group">
              <button
                className="AdminProject-button AdminProject-button-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : projectId ? "Update Project" : "Create Project"}
              </button>
              {!projectId && (
                <button
                  className="AdminProject-button AdminProject-button-outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Clear Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT LIST SECTION */}
      <div className="AdminProject-list-section">
        <div className="AdminProject-list-header">
          <div>
            <div className="AdminProject-list-title">
              All Projects ({filteredProjects.length})
            </div>
            <div className="AdminProject-list-subtitle">
              Manage and monitor all your projects
            </div>
          </div>
          
          <div className="AdminProject-list-controls">
            <div style={{ position: "relative" }}>
              <Icons.Search className="AdminProject-search-icon" />
              <input
                type="text"
                className="AdminProject-search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="AdminProject-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="AdminProject-empty-state">
            <div className="AdminProject-empty-icon">
              <Icons.Folder />
            </div>
            <div className="AdminProject-empty-title">No projects found</div>
            <div className="AdminProject-empty-description">
              {searchTerm ? "Try a different search term" : "Create your first project to get started"}
            </div>
            <button
              className="AdminProject-button AdminProject-button-primary"
              onClick={() => {
                resetForm();
                document.getElementById('AdminProject-project-form').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Icons.Add /> Create First Project
            </button>
          </div>
        ) : (
          <div className="AdminProject-grid">
            {filteredProjects.map((p) => (
              <div key={p._id} className="AdminProject-project-card">
                <div 
                  className="AdminProject-project-top-bar"
                  style={{
                    "--status-color": getStatusColor(p.status),
                    "--priority-color": getPriorityColor(p.priority)
                  }}
                />
                
                <div className="AdminProject-project-content">
                  <div className="AdminProject-project-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Icons.Folder style={{ color: "#667eea", fontSize: "20px" }} />
                        <div className="AdminProject-project-title">
                          {p.projectName}
                        </div>
                      </div>
                      <div className="AdminProject-chip-group">
                        <span className="AdminProject-chip AdminProject-chip-status" style={{
                          "--status-color": getStatusColor(p.status),
                          "--status-color-rgb": getStatusColor(p.status).replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(',')
                        }}>
                          {p.status}
                        </span>
                        <span className="AdminProject-chip AdminProject-chip-priority" style={{
                          "--priority-color": getPriorityColor(p.priority),
                          "--priority-color-rgb": getPriorityColor(p.priority).replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16)).join(',')
                        }}>
                          {p.priority}
                        </span>
                      </div>
                    </div>
                    <button className="AdminProject-icon-button">
                      <Icons.MoreVert />
                    </button>
                  </div>
                  
                  <div className="AdminProject-project-description">
                    {p.description}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="AdminProject-progress-container">
                    <div className="AdminProject-progress-header">
                      <div className="AdminProject-progress-label">Task Progress</div>
                      <div className="AdminProject-progress-value">{getTaskProgress(p.tasks)}%</div>
                    </div>
                    <div className="AdminProject-progress-bar">
                      <div 
                        className="AdminProject-progress-fill"
                        style={{ width: `${getTaskProgress(p.tasks)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="AdminProject-project-meta">
                    <div className="AdminProject-project-meta-left">
                      <Icons.Calendar />
                      <span>
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : "No start"} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : "No end"}
                      </span>
                    </div>
                    <div className="AdminProject-project-meta-right">
                      <Icons.Group />
                      <span>{p.users?.length || 0}</span>
                      <Icons.Task />
                      <span>{p.tasks?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="AdminProject-divider" />
                  
                  <div className="AdminProject-project-actions">
                    {/* PDF Actions */}
                    <div className="AdminProject-pdf-actions">
                      {p.pdfFile?.path ? (
                        <>
                          <button
                            className="AdminProject-icon-button"
                            onClick={() => viewPdf(p.pdfFile.path, p.pdfFile.filename)}
                            title="View PDF"
                          >
                            <Icons.Visibility />
                          </button>
                          <button
                            className="AdminProject-icon-button AdminProject-icon-button-green"
                            onClick={() => downloadPdf(p.pdfFile.path, p.pdfFile.filename)}
                            title="Download PDF"
                          >
                            <Icons.Download />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#666" }}>No document</span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="AdminProject-action-buttons">
                      <button
                        className="AdminProject-icon-button"
                        onClick={() => viewProjectDetails(p)}
                        title="View Details"
                      >
                        <Icons.Visibility />
                      </button>
                      <button
                        className="AdminProject-icon-button"
                        onClick={() => editProject(p)}
                        title="Edit"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        className="AdminProject-icon-button AdminProject-icon-button-red"
                        onClick={() => deleteProject(p._id, p.projectName)}
                        title="Delete"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProject;