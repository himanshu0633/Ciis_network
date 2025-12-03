// ========================= EmployeeProject.jsx =========================
import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  Tooltip,
  Snackbar,
  LinearProgress,
  Tabs,
  Tab,
  alpha,
  useTheme
} from "@mui/material";
import {
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarIcon,
  PriorityHigh as PriorityIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Update as UpdateIcon,
  ClearAll as ClearAllIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  Task as TaskIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  FiberNew as NewIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Folder as FolderIcon,
  CloudUpload as CloudUploadIcon,
  Bolt as BoltIcon
} from "@mui/icons-material";

const EmployeeProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectUsers, setProjectUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState({ projects: false, tasks: false });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openActivityDrawer, setOpenActivityDrawer] = useState(false);
  const [openNotificationsDrawer, setOpenNotificationsDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [statusRemark, setStatusRemark] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0
  });

  const theme = useTheme();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    status: "pending",
  });

  const [taskErrors, setTaskErrors] = useState({});

  const TASK_STATUS_OPTIONS = [
    { value: "pending", label: "Pending", icon: <ScheduleIcon />, color: "#FFA726" },
    { value: "in progress", label: "In Progress", icon: <UpdateIcon />, color: "#29B6F6" },
    { value: "completed", label: "Completed", icon: <CheckCircleIcon />, color: "#66BB6A" },
    { value: "on hold", label: "On Hold", icon: <PauseIcon />, color: "#AB47BC" },
    { value: "cancelled", label: "Cancelled", icon: <CancelIcon />, color: "#EF5350" },
  ];

  // Load all projects
  useEffect(() => {
    loadProjects();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(t => t.status === "completed").length;
      const pending = tasks.filter(t => t.status === "pending").length;
      const inProgress = tasks.filter(t => t.status === "in progress").length;
      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        inProgressTasks: inProgress
      });
    }
  }, [tasks]);

  const loadProjects = async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const res = await axios.get("/projects");
      setProjects(res.data.items || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      showSnackbar("Error loading projects", "error");
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await axios.get("/projects/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Load selected project details + tasks
  const handleSelectProject = async (id) => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      setSelectedProject(id);
      const res = await axios.get(`/projects/${id}`);
      setProjectDetails(res.data);
      setProjectUsers(res.data.users || []);
      setTasks(res.data.tasks || []);
      setTabValue(0); // Reset to tasks tab
    } catch (error) {
      console.error("Error loading project details:", error);
      showSnackbar("Error loading project details", "error");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Validate task form
  const validateTaskForm = () => {
    const errors = {};
    if (!newTask.title.trim()) errors.title = "Task title is required";
    if (!newTask.assignedTo) errors.assignedTo = "Please assign task to a user";
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      await axios.patch(`/projects/${selectedProject}/tasks/${taskId}/status`, {
        status: newStatus,
        remark: statusRemark,
      });

      // Refresh tasks and notifications
      handleSelectProject(selectedProject);
      loadNotifications();
      
      // Reset and close dialog
      setStatusRemark("");
      setOpenStatusDialog(false);
      setSelectedTask(null);
      showSnackbar("Task status updated successfully!", "success");

    } catch (error) {
      console.error("Error updating task status:", error);
      showSnackbar("Error updating task status", "error");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Open status update dialog
  const handleOpenStatusDialog = (task) => {
    setSelectedTask(task);
    setStatusRemark("");
    setOpenStatusDialog(true);
  };

  // Load activity logs
  const handleLoadActivityLogs = async (taskId) => {
    try {
      const res = await axios.get(`/projects/${selectedProject}/tasks/${taskId}/activity`);
      const task = tasks.find(t => t._id === taskId);
      setSelectedTask({
        ...task,
        activityLogs: res.data.activityLogs || [],
      });
      setOpenActivityDrawer(true);
    } catch (error) {
      console.error("Error loading activity logs:", error);
      showSnackbar("Error loading activity logs", "error");
    }
  };

  // Mark notification as read
  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/projects/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Clear all notifications
  const handleClearAllNotifications = async () => {
    try {
      await axios.delete("/projects/notifications/clear");
      setNotifications([]);
      showSnackbar("All notifications cleared", "success");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      showSnackbar("Error clearing notifications", "error");
    }
  };

  // Add Task
  const handleAddTask = async () => {
    if (!validateTaskForm()) return;

    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const formData = new FormData();
      Object.keys(newTask).forEach((key) => {
        formData.append(key, newTask[key]);
      });

      if (file) formData.append("pdfFile", file);

      await axios.post(`/projects/${selectedProject}/tasks`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Reset form and close dialog
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "Medium",
        status: "pending",
      });
      setFile(null);
      setFileName("");
      setTaskErrors({});
      setOpenTaskDialog(false);

      // Refresh tasks and notifications
      handleSelectProject(selectedProject);
      loadNotifications();
      
      showSnackbar("Task added successfully!", "success");
    } catch (error) {
      console.error("Error adding task:", error);
      showSnackbar("Error adding task", "error");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Add Remark to a Task
  const handleAddRemark = async (taskId, text) => {
    if (!text || text.trim() === "") {
      showSnackbar("Please enter a remark", "warning");
      return;
    }

    try {
      await axios.post(
        `/projects/${selectedProject}/tasks/${taskId}/remarks`,
        { text }
      );
      // Reload tasks and notifications
      handleSelectProject(selectedProject);
      loadNotifications();
      
      // Clear the remark input
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, _newRemark: "" } : task
      ));
      
      showSnackbar("Remark added successfully!", "success");
    } catch (error) {
      console.error("Error adding remark:", error);
      showSnackbar("Error adding remark", "error");
    }
  };

  // VIEW PDF
  const viewPdf = (pdfPath, filename) => {
    if (!pdfPath) {
      showSnackbar("No PDF file available", "warning");
      return;
    }
    
    const pathParts = pdfPath.split('/');
    const pdfFilename = pathParts[pathParts.length - 1];
    const pdfUrl = `${axios.defaults.baseURL.replace('/api', '')}/${pdfPath}`;
    
    setSelectedPdfUrl(pdfUrl);
    setSelectedPdfName(filename || pdfFilename);
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
    const pdfUrl = `${axios.defaults.baseURL.replace('/api', '')}/${pdfPath}`;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename || pdfFilename || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#EF5350";
      case "medium": return "#FFA726";
      case "low": return "#66BB6A";
      default: return "#9E9E9E";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#66BB6A";
      case "in progress": return "#29B6F6";
      case "pending": return "#FFA726";
      case "cancelled": return "#EF5350";
      case "on hold": return "#AB47BC";
      default: return "#9E9E9E";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircleIcon fontSize="small" />;
      case "in progress": return <UpdateIcon fontSize="small" />;
      case "pending": return <ScheduleIcon fontSize="small" />;
      case "cancelled": return <CancelIcon fontSize="small" />;
      case "on hold": return <PauseIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const getTaskProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const StatCard = ({ icon, value, label, color, subtext, trend }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
      borderRadius: 3,
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="800" color={color} sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            {subtext && (
              <Typography variant="caption" color="text.secondary">
                {subtext}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 28
          }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: color }} />
            <Typography variant="caption" color={color} fontWeight="500">
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      maxWidth: '1600px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            background: alpha(theme.palette.background.paper, 0.9)
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={openPdfDialog}
        onClose={() => setOpenPdfDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <PdfIcon />
              <Typography variant="h6">
                {selectedPdfName}
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenPdfDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(100% - 64px)' }}>
          {selectedPdfUrl ? (
            <iframe
              src={selectedPdfUrl}
              title="PDF Viewer"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="text.secondary">
                PDF cannot be loaded
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: alpha('#f5f7fa', 0.8) }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const link = document.createElement('a');
              link.href = selectedPdfUrl;
              link.download = selectedPdfName || 'document.pdf';
              link.click();
            }}
            disabled={!selectedPdfUrl}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
              }
            }}
          >
            Download
          </Button>
          <Button 
            onClick={() => setOpenPdfDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ 
        mb: 4,
        background: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" fontWeight="800" color="primary" gutterBottom>
              Project Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your projects and tasks efficiently
            </Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton 
              onClick={() => setOpenNotificationsDrawer(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: 48,
                height: 48,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
                }
              }}
            >
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stats Cards */}
        {selectedProject && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<DashboardIcon />}
                value={stats.totalTasks}
                label="Total Tasks"
                color="#667eea"
                subtext="This project"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<CheckCircleIcon />}
                value={stats.completedTasks}
                label="Completed"
                color="#66BB6A"
                trend={`${getTaskProgress()}% of total`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<UpdateIcon />}
                value={stats.inProgressTasks}
                label="In Progress"
                color="#29B6F6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<ScheduleIcon />}
                value={stats.pendingTasks}
                label="Pending"
                color="#FFA726"
              />
            </Grid>
          </Grid>
        )}
      </Box>

      {loading.projects && (
        <LinearProgress sx={{ 
          mb: 3, 
          borderRadius: 3,
          height: 6,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
        }} />
      )}

      {/* PROJECT LIST */}
      <Grid container spacing={3}>
        {projects.map((p) => (
          <Grid item xs={12} md={6} lg={4} key={p._id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                border: selectedProject === p._id ? "2px solid" : "1px solid",
                borderColor: selectedProject === p._id ? "#667eea" : "rgba(0,0,0,0.08)",
                borderRadius: 3,
                height: "100%",
                position: 'relative',
                overflow: 'visible',
                background: selectedProject === p._id 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  : 'white',
                boxShadow: selectedProject === p._id 
                  ? '0 20px 40px rgba(102, 126, 234, 0.15)'
                  : '0 4px 20px rgba(0,0,0,0.05)',
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
                  borderColor: alpha('#667eea', 0.5),
                },
              }}
              onClick={() => handleSelectProject(p._id)}
            >
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }} />
              
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <FolderIcon sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="h6" fontWeight="700">
                        {p.projectName}
                      </Typography>
                    </Box>
                    <Chip
                      label={p.status}
                      size="small"
                      sx={{ 
                        textTransform: 'capitalize',
                        background: getStatusColor(p.status) + '15',
                        color: getStatusColor(p.status),
                        fontWeight: 600,
                        border: `1px solid ${getStatusColor(p.status)}30`
                      }}
                    />
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
                  <Chip
                    label={p.priority}
                    size="small"
                    sx={{ 
                      textTransform: 'capitalize',
                      background: getPriorityColor(p.priority) + '15',
                      color: getPriorityColor(p.priority),
                      border: `1px solid ${getPriorityColor(p.priority)}30`
                    }}
                  />
                  <Chip
                    icon={<GroupIcon />}
                    label={`${p.users?.length || 0}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: alpha('#000', 0.1) }}
                  />
                  <Chip
                    icon={<TaskIcon />}
                    label={`${p.tasks?.length || 0}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: alpha('#000', 0.1) }}
                  />
                </Stack>
                
                {p.description && (
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    {p.description.length > 120 
                      ? `${p.description.substring(0, 120)}...` 
                      : p.description}
                  </Typography>
                )}
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} sx={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      <CalendarIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'No date'}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: selectedProject === p._id 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(102, 126, 234, 0.1)',
                      color: selectedProject === p._id ? 'white' : '#667eea',
                      borderRadius: 2,
                      '&:hover': {
                        background: selectedProject === p._id 
                          ? 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)'
                          : 'rgba(102, 126, 234, 0.2)',
                      }
                    }}
                  >
                    View
                  </Button>
                </Box>
                
                {/* Project PDF indicator */}
                {p.pdfFile?.path && (
                  <Box mt={2} pt={2} sx={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PdfIcon fontSize="small" sx={{ color: '#EF5350' }} />
                        <Typography variant="caption" color="text.secondary">
                          Document attached
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View PDF">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewPdf(p.pdfFile.path, p.pdfFile.filename);
                            }}
                            sx={{ color: '#667eea' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPdf(p.pdfFile.path, p.pdfFile.filename);
                            }}
                            sx={{ color: '#66BB6A' }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TASK PANEL */}
      {selectedProject && projectDetails && (
        <Paper elevation={0} sx={{ 
          mt: 4,
          borderRadius: 3,
          background: 'white',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 3,
            pt: 2,
            pb: 1
          }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                '& .MuiTab-root': {
                  color: alpha('#fff', 0.7),
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  '&.Mui-selected': {
                    color: 'white',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab label="Tasks" icon={<TaskIcon />} iconPosition="start" />
              <Tab label="Documents" icon={<PdfIcon />} iconPosition="start" />
              <Tab label="Project Info" icon={<DescriptionIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box p={3}>
            {/* TASKS TAB */}
            {tabValue === 0 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                      {projectDetails.projectName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {projectDetails.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenTaskDialog(true)}
                    disabled={loading.tasks}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    New Task
                  </Button>
                </Box>

                {/* Project Progress */}
                <Card sx={{ 
                  mb: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight="600">
                        Project Progress
                      </Typography>
                      <Typography variant="h5" fontWeight="700" color="primary">
                        {getTaskProgress()}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={getTaskProgress()} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 6
                        }
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {stats.completedTasks} of {stats.totalTasks} tasks completed
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.pendingTasks} pending • {stats.inProgressTasks} in progress
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {loading.tasks ? (
                  <Box display="flex" justifyContent="center" my={8}>
                    <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
                  </Box>
                ) : tasks.length === 0 ? (
                  <Card sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                    borderRadius: 3
                  }}>
                    <TaskIcon sx={{ fontSize: 64, color: alpha('#667eea', 0.3), mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No tasks yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start by creating your first task
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenTaskDialog(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Create First Task
                    </Button>
                  </Card>
                ) : (
                  <Grid container spacing={3}>
                    {tasks.map((t) => (
                      <Grid item xs={12} key={t._id}>
                        <Card sx={{ 
                          borderRadius: 3,
                          borderLeft: `4px solid ${getStatusColor(t.status)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
                          }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Box flex={1}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                  <Box>
                                    <Typography variant="h6" fontWeight="700" gutterBottom>
                                      {t.title}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Chip
                                        icon={getStatusIcon(t.status)}
                                        label={t.status.replace(/_/g, ' ')}
                                        size="small"
                                        sx={{ 
                                          textTransform: 'capitalize',
                                          background: getStatusColor(t.status) + '15',
                                          color: getStatusColor(t.status),
                                          fontWeight: 600,
                                          border: `1px solid ${getStatusColor(t.status)}30`
                                        }}
                                      />
                                      <Chip
                                        icon={<PriorityIcon />}
                                        label={`Priority: ${t.priority}`}
                                        size="small"
                                        sx={{ 
                                          textTransform: 'capitalize',
                                          background: getPriorityColor(t.priority) + '15',
                                          color: getPriorityColor(t.priority),
                                          fontWeight: 600,
                                          border: `1px solid ${getPriorityColor(t.priority)}30`
                                        }}
                                      />
                                    </Stack>
                                  </Box>
                                  <Box display="flex" gap={1}>
                                    {/* Task PDF buttons */}
                                    {t.pdfFile?.path && (
                                      <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="View PDF">
                                          <IconButton
                                            size="small"
                                            onClick={() => viewPdf(t.pdfFile.path, t.pdfFile.filename)}
                                            sx={{ color: '#667eea' }}
                                          >
                                            <VisibilityIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download PDF">
                                          <IconButton
                                            size="small"
                                            onClick={() => downloadPdf(t.pdfFile.path, t.pdfFile.filename)}
                                            sx={{ color: '#66BB6A' }}
                                          >
                                            <DownloadIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    )}
                                    <Tooltip title="Update Status">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenStatusDialog(t)}
                                        sx={{ color: '#FFA726' }}
                                      >
                                        <UpdateIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View Activity">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleLoadActivityLogs(t._id)}
                                        sx={{ color: '#29B6F6' }}
                                      >
                                        <HistoryIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                
                                {t.description && (
                                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                                    {t.description}
                                  </Typography>
                                )}
                                
                                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={3}>
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {t.assignedTo?.name || "Unassigned"}
                                    </Typography>
                                  </Box>
                                  {t.dueDate && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Due: {new Date(t.dueDate).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      Created: {new Date(t.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Existing remarks */}
                                {t.remarks?.length > 0 && (
                                  <Box mt={3}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                                      <CommentIcon fontSize="small" />
                                      Remarks ({t.remarks.length})
                                    </Typography>
                                    <Stack spacing={1.5}>
                                      {t.remarks.map((r, idx) => (
                                        <Paper
                                          key={idx}
                                          variant="outlined"
                                          sx={{ 
                                            p: 2, 
                                            borderRadius: 2,
                                            background: 'rgba(0,0,0,0.02)',
                                            borderColor: 'rgba(0,0,0,0.08)'
                                          }}
                                        >
                                          <Typography variant="body2" sx={{ mb: 1 }}>
                                            {r.text}
                                          </Typography>
                                          <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                                                {r.createdBy?.name?.charAt(0)}
                                              </Avatar>
                                              <Typography variant="caption" color="text.secondary">
                                                {r.createdBy?.name}
                                              </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                              {new Date(r.createdAt).toLocaleString()}
                                            </Typography>
                                          </Box>
                                        </Paper>
                                      ))}
                                    </Stack>
                                  </Box>
                                )}
                              </Box>
                            </Box>

                            {/* Add New Remark */}
                            <Box mt={4} pt={3} sx={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                              <Stack direction="row" spacing={1}>
                                <TextField
                                  size="small"
                                  placeholder="Add a remark..."
                                  fullWidth
                                  value={t._newRemark || ""}
                                  onChange={(e) =>
                                    setTasks((prev) =>
                                      prev.map((x) =>
                                        x._id === t._id
                                          ? { ...x, _newRemark: e.target.value }
                                          : x
                                      )
                                    )
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddRemark(t._id, t._newRemark);
                                    }
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                    }
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  startIcon={<CommentIcon />}
                                  onClick={() => handleAddRemark(t._id, t._newRemark)}
                                  disabled={!t._newRemark?.trim()}
                                  sx={{
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* DOCUMENTS TAB */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                  Project Documents
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  All project-related documents and files
                </Typography>
                
                {/* Project Document */}
                {projectDetails.pdfFile?.path ? (
                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, rgba(239, 83, 80, 0.1) 0%, rgba(239, 83, 80, 0.05) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(239, 83, 80, 0.2)'
                          }}>
                            <PdfIcon sx={{ fontSize: 32, color: '#EF5350' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              {projectDetails.pdfFile.filename || 'Project Document'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Main project document • Uploaded on: {new Date(projectDetails.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => viewPdf(projectDetails.pdfFile.path, projectDetails.pdfFile.filename)}
                            sx={{ borderRadius: 2 }}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => downloadPdf(projectDetails.pdfFile.path, projectDetails.pdfFile.filename)}
                            sx={{
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
                              }
                            }}
                          >
                            Download
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    No project document uploaded
                  </Alert>
                )}

                {/* Task Documents */}
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  Task Documents ({tasks.filter(t => t.pdfFile?.path).length})
                </Typography>
                {tasks.filter(t => t.pdfFile?.path).length > 0 ? (
                  <Grid container spacing={2}>
                    {tasks
                      .filter(task => task.pdfFile?.path)
                      .map((task) => (
                        <Grid item xs={12} md={6} key={task._id}>
                          <Card sx={{ borderRadius: 2, height: '100%' }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box display="flex" alignItems="center" gap={2} flex={1}>
                                  <FileIcon sx={{ fontSize: 32, color: '#29B6F6' }} />
                                  <Box flex={1}>
                                    <Typography variant="subtitle1" fontWeight="600">
                                      {task.pdfFile.filename || 'Task Document'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      From: {task.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Assigned to: {task.assignedTo?.name || 'Unassigned'} • Status: 
                                      <Chip
                                        label={task.status}
                                        size="small"
                                        sx={{ 
                                          ml: 1,
                                          height: 16,
                                          fontSize: '0.7rem',
                                          textTransform: 'capitalize',
                                          background: getStatusColor(task.status) + '15',
                                          color: getStatusColor(task.status),
                                          fontWeight: 500
                                        }}
                                      />
                                    </Typography>
                                  </Box>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="View PDF">
                                    <IconButton
                                      size="small"
                                      onClick={() => viewPdf(task.pdfFile.path, task.pdfFile.filename)}
                                      sx={{ color: '#667eea' }}
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download">
                                    <IconButton
                                      size="small"
                                      onClick={() => downloadPdf(task.pdfFile.path, task.pdfFile.filename)}
                                      sx={{ color: '#66BB6A' }}
                                    >
                                      <DownloadIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No task documents available
                  </Alert>
                )}
              </Box>
            )}

            {/* PROJECT INFO TAB */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                  Project Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                          Project Details
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Project Name
                              </Typography>
                              <Typography variant="body1" fontWeight="500">{projectDetails.projectName}</Typography>
                            </Box>
                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Status
                              </Typography>
                              <Chip
                                label={projectDetails.status}
                                sx={{ 
                                  textTransform: 'capitalize',
                                  background: getStatusColor(projectDetails.status) + '15',
                                  color: getStatusColor(projectDetails.status),
                                  fontWeight: 600,
                                  border: `1px solid ${getStatusColor(projectDetails.status)}30`
                                }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Priority
                              </Typography>
                              <Chip
                                label={projectDetails.priority}
                                sx={{ 
                                  textTransform: 'capitalize',
                                  background: getPriorityColor(projectDetails.priority) + '15',
                                  color: getPriorityColor(projectDetails.priority),
                                  fontWeight: 600,
                                  border: `1px solid ${getPriorityColor(projectDetails.priority)}30`
                                }}
                              />
                            </Box>
                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Project Timeline
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                {projectDetails.startDate ? new Date(projectDetails.startDate).toLocaleDateString() : 'Not set'} - {projectDetails.endDate ? new Date(projectDetails.endDate).toLocaleDateString() : 'Not set'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Description
                              </Typography>
                              <Typography variant="body1">{projectDetails.description}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={4}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                          Quick Stats
                        </Typography>
                        <Stack spacing={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
                            <Typography variant="h6" fontWeight="700">{stats.totalTasks}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Completed</Typography>
                            <Typography variant="h6" fontWeight="700" color="#66BB6A">{stats.completedTasks}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">In Progress</Typography>
                            <Typography variant="h6" fontWeight="700" color="#29B6F6">{stats.inProgressTasks}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Pending</Typography>
                            <Typography variant="h6" fontWeight="700" color="#FFA726">{stats.pendingTasks}</Typography>
                          </Box>
                          <Divider />
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Team Members</Typography>
                            <Typography variant="h6" fontWeight="700">{projectDetails.users?.length || 0}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="700" gutterBottom display="flex" alignItems="center" gap={1}>
                          <GroupIcon />
                          Team Members ({projectDetails.users?.length || 0})
                        </Typography>
                        <Grid container spacing={2}>
                          {projectDetails.users?.map((user) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                                <CardContent>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar sx={{ 
                                      width: 48, 
                                      height: 48,
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      fontSize: '1.2rem',
                                      fontWeight: 600
                                    }}>
                                      {user.name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight="600">{user.name}</Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {user.email}
                                      </Typography>
                                      {user.role && (
                                        <Chip
                                          label={user.role}
                                          size="small"
                                          sx={{ 
                                            mt: 0.5,
                                            height: 20,
                                            fontSize: '0.7rem',
                                            background: 'rgba(0,0,0,0.05)'
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* UPDATE STATUS DIALOG */}
      <Dialog 
        open={openStatusDialog} 
        onClose={() => {
          setOpenStatusDialog(false);
          setSelectedTask(null);
          setStatusRemark("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight="700">
            Update Task Status
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <Typography variant="body1" fontWeight="600">
              Task: {selectedTask?.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Current Status:
              </Typography>
              <Chip 
                label={selectedTask?.status?.replace(/_/g, ' ')} 
                size="small" 
                sx={{ 
                  textTransform: 'capitalize',
                  background: getStatusColor(selectedTask?.status) + '15',
                  color: getStatusColor(selectedTask?.status),
                  fontWeight: 600
                }}
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>New Status *</InputLabel>
              <Select
                value={selectedTask?.status || ""}
                label="New Status *"
                onChange={(e) => setSelectedTask({
                  ...selectedTask,
                  status: e.target.value
                })}
                sx={{ borderRadius: 2 }}
              >
                {TASK_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ color: status.color }}>
                        {status.icon}
                      </Box>
                      <Typography>{status.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Remark (Optional)"
              multiline
              rows={3}
              value={statusRemark}
              onChange={(e) => setStatusRemark(e.target.value)}
              fullWidth
              placeholder="Add any remarks about this status change..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: alpha('#f5f7fa', 0.8) }}>
          <Button 
            onClick={() => {
              setOpenStatusDialog(false);
              setSelectedTask(null);
              setStatusRemark("");
            }}
            disabled={loading.tasks}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleUpdateTaskStatus(selectedTask._id, selectedTask.status)}
            disabled={loading.tasks || !selectedTask?.status}
            startIcon={loading.tasks ? <CircularProgress size={16} /> : <UpdateIcon />}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
              }
            }}
          >
            {loading.tasks ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ACTIVITY LOGS DRAWER */}
      <Drawer
        anchor="right"
        open={openActivityDrawer}
        onClose={() => setOpenActivityDrawer(false)}
        PaperProps={{
          sx: {
            width: 450,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
            borderLeft: '1px solid rgba(255,255,255,0.3)'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="700">
              Activity Logs
            </Typography>
            <IconButton onClick={() => setOpenActivityDrawer(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body1" fontWeight="600" color="primary" gutterBottom>
            {selectedTask?.title}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ overflow: 'auto', height: 'calc(100% - 100px)' }}>
            <List>
              {selectedTask?.activityLogs?.map((log, index) => (
                <ListItem 
                  key={index} 
                  alignItems="flex-start"
                  sx={{
                    background: 'white',
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <HistoryIcon fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="500">
                        {log.description}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" color="text.primary">
                            {log.performedBy?.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                          {new Date(log.performedAt).toLocaleString()}
                        </Typography>
                        {log.remark && (
                          <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderRadius: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Remark: {log.remark}
                            </Typography>
                          </Paper>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
              {(!selectedTask?.activityLogs || selectedTask.activityLogs.length === 0) && (
                <Box textAlign="center" py={4}>
                  <HistoryIcon sx={{ fontSize: 48, color: alpha('#667eea', 0.3), mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No activity logs found.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* NOTIFICATIONS DRAWER */}
      <Drawer
        anchor="right"
        open={openNotificationsDrawer}
        onClose={() => setOpenNotificationsDrawer(false)}
        PaperProps={{
          sx: {
            width: 450,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
            borderLeft: '1px solid rgba(255,255,255,0.3)'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="700">
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Tooltip title="Clear All">
                <IconButton onClick={handleClearAllNotifications} size="small">
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Box flex={1} overflow="auto">
            <List>
              {notifications.map((notification) => (
                <ListItem 
                  key={notification._id}
                  alignItems="flex-start"
                  sx={{
                    background: notification.isRead ? 'white' : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%)',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: notification.isRead ? 'rgba(0,0,0,0.08)' : alpha('#667eea', 0.2),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }
                  }}
                  onClick={() => handleMarkNotificationAsRead(notification._id)}
                >
                  <ListItemIcon>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: notification.isRead 
                        ? 'rgba(0,0,0,0.06)' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: notification.isRead ? '#667eea' : 'white'
                    }}>
                      <NotificationsIcon fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={notification.isRead ? "500" : "700"}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="New"
                              size="small"
                              sx={{ 
                                height: 16,
                                fontSize: '0.65rem',
                                background: '#667eea',
                                color: 'white',
                                ml: 'auto'
                              }}
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {notifications.length === 0 && (
                <Box textAlign="center" py={8}>
                  <NotificationsIcon sx={{ fontSize: 64, color: alpha('#667eea', 0.3), mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No notifications yet.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    You'll see project updates here
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* ADD TASK DIALOG */}
      <Dialog 
        open={openTaskDialog} 
        onClose={() => setOpenTaskDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight="700">
            Create New Task
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <TextField
              label="Task Title *"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              error={!!taskErrors.title}
              helperText={taskErrors.title}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <FormControl fullWidth error={!!taskErrors.assignedTo}>
              <InputLabel>Assign To *</InputLabel>
              <Select
                value={newTask.assignedTo}
                label="Assign To *"
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedTo: e.target.value })
                }
                sx={{ borderRadius: 2 }}
              >
                {projectUsers.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        {u.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Low">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BoltIcon sx={{ color: '#66BB6A', fontSize: 18 }} />
                      Low
                    </Box>
                  </MenuItem>
                  <MenuItem value="Medium">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BoltIcon sx={{ color: '#FFA726', fontSize: 18 }} />
                      Medium
                    </Box>
                  </MenuItem>
                  <MenuItem value="High">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BoltIcon sx={{ color: '#EF5350', fontSize: 18 }} />
                      High
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Initial Status</InputLabel>
                <Select
                  value={newTask.status}
                  label="Initial Status"
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                }
                  sx={{ borderRadius: 2 }}
                >
                  {TASK_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ color: status.color }}>
                          {status.icon}
                        </Box>
                        <Typography>{status.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  mb: 1,
                  borderRadius: 2,
                  borderStyle: 'dashed'
                }}
              >
                Upload Task File (PDF)
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </Button>
              {fileName && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <PdfIcon sx={{ color: '#EF5350', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Selected: {fileName}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: alpha('#f5f7fa', 0.8) }}>
          <Button 
            onClick={() => setOpenTaskDialog(false)} 
            disabled={loading.tasks}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTask}
            disabled={loading.tasks}
            startIcon={loading.tasks ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
              }
            }}
          >
            {loading.tasks ? "Adding..." : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProject;