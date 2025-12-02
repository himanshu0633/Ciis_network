// ========================= AdminProject.jsx =========================
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
  Paper,
  Chip,
  Avatar,
  AvatarGroup,
  FormHelperText,
  Divider,
  CardHeader,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  alpha,
  useTheme,
  Badge,
  Fade,
  Zoom,
  InputAdornment,
  Switch,
  FormControlLabel,


} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  Task as TaskIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  CalendarMonth as CalendarIcon,
  Group as GroupIcon,
  Bolt as BoltIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Folder as FolderIcon,
  CloudDownload as CloudDownloadIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Flag as FlagIcon,
  DateRange as DateRangeIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  RocketLaunch as RocketLaunchIcon
} from "@mui/icons-material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

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

  const theme = useTheme();

  // Fetch users & projects
  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

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
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return <PlayArrowIcon fontSize="small" color="success" />;
      case "completed": return <CheckCircleIcon fontSize="small" color="success" />;
      case "on hold":
      case "onhold": return <PauseIcon fontSize="small" color="warning" />;
      case "planning": return <ScheduleIcon fontSize="small" color="info" />;
      case "cancelled": return <StopIcon fontSize="small" color="error" />;
      default: return null;
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

  const getSelectedUsers = () => users.filter(u => members.includes(u._id));

  const getTaskProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const StatCard = ({ icon, value, label, color, trend, subtext }) => (
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
            {trend > 0 ? <ArrowUpwardIcon sx={{ fontSize: 16, color: color }} /> : <ArrowDownwardIcon sx={{ fontSize: 16, color: color }} />}
            <Typography variant="caption" color={color} fontWeight="500">
              {trend > 0 ? `+${trend}%` : `${trend}%`}
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
      {/* Snackbar for notifications */}
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
                PDF Document
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenPdfDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 'calc(100% - 64px)' }}>
          <iframe
            src={selectedPdfUrl}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, background: alpha('#f5f7fa', 0.8) }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const link = document.createElement('a');
              link.href = selectedPdfUrl;
              link.download = selectedPdfUrl.split('/').pop();
              link.click();
            }}
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

      {/* Project Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="700">
              Project Details
            </Typography>
            <IconButton onClick={() => setOpenDetailsDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedProject && (
            <TabContext value={tabValue.toString()}>
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                background: alpha('#f5f7fa', 0.5)
              }}>
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => setTabValue(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      minHeight: 60
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#667eea',
                      height: 3
                    }
                  }}
                >
                  <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
                  <Tab icon={<TaskIcon />} iconPosition="start" label="Tasks" />
                  <Tab icon={<FileIcon />} iconPosition="start" label="Documents" />
                </Tabs>
              </Box>

              <TabPanel value="0" sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" fontWeight="800" gutterBottom color="primary">
                      {selectedProject.projectName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {selectedProject.description}
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="700" gutterBottom display="flex" alignItems="center" gap={1}>
                            <DescriptionIcon color="primary" />
                            Project Details
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip
                                label={selectedProject.status}
                                size="small"
                                sx={{ 
                                  textTransform: 'capitalize',
                                  background: getStatusColor(selectedProject.status) + '15',
                                  color: getStatusColor(selectedProject.status),
                                  fontWeight: 600,
                                  border: `1px solid ${getStatusColor(selectedProject.status)}30`
                                }}
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Priority</Typography>
                              <Chip
                                label={selectedProject.priority}
                                size="small"
                                sx={{ 
                                  textTransform: 'capitalize',
                                  background: getPriorityColor(selectedProject.priority) + '15',
                                  color: getPriorityColor(selectedProject.priority),
                                  fontWeight: 600,
                                  border: `1px solid ${getPriorityColor(selectedProject.priority)}30`
                                }}
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Start Date</Typography>
                              <Typography variant="body2" fontWeight="500">
                                {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'Not set'}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">End Date</Typography>
                              <Typography variant="body2" fontWeight="500">
                                {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Not set'}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">Created On</Typography>
                              <Typography variant="body2" fontWeight="500">
                                {new Date(selectedProject.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="700" gutterBottom display="flex" alignItems="center" gap={1}>
                            <TimelineIcon color="primary" />
                            Progress & Analytics
                          </Typography>
                          <Box mb={3}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2" color="text.secondary">Task Completion</Typography>
                              <Typography variant="h6" fontWeight="700" color="primary">
                                {getTaskProgress(selectedProject.tasks)}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getTaskProgress(selectedProject.tasks)} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: 5
                                }
                              }}
                            />
                          </Box>
                          <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Total Tasks</Typography>
                              <Typography variant="body2" fontWeight="600">{selectedProject.tasks?.length || 0}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Completed Tasks</Typography>
                              <Typography variant="body2" fontWeight="600" color="#66BB6A">
                                {selectedProject.tasks?.filter(t => t.status === "completed").length || 0}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">In Progress</Typography>
                              <Typography variant="body2" fontWeight="600" color="#29B6F6">
                                {selectedProject.tasks?.filter(t => t.status === "in progress").length || 0}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Pending</Typography>
                              <Typography variant="body2" fontWeight="600" color="#FFA726">
                                {selectedProject.tasks?.filter(t => t.status === "pending").length || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="700" gutterBottom display="flex" alignItems="center" gap={1}>
                        <GroupIcon color="primary" />
                        Team Members ({selectedProject.users?.length || 0})
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedProject.users?.map((user) => (
                          <Grid item xs={12} sm={6} md={4} key={user._id}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
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
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Stack>
              </TabPanel>

              <TabPanel value="1" sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    Tasks ({selectedProject.tasks?.length || 0})
                  </Typography>
                  {selectedProject.tasks?.length > 0 ? (
                    <List sx={{ '& .MuiListItem-root': { p: 0, mb: 1 } }}>
                      {selectedProject.tasks.map((task) => (
                        <Paper
                          key={task._id}
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <TaskIcon color="primary" fontSize="small" />
                                <Typography variant="subtitle1" fontWeight="600">
                                  {task.title}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={task.status}
                                  size="small"
                                  sx={{ 
                                    textTransform: 'capitalize',
                                    background: getStatusColor(task.status) + '15',
                                    color: getStatusColor(task.status),
                                    fontWeight: 600,
                                    height: 24
                                  }}
                                />
                                <Chip
                                  label={task.priority}
                                  size="small"
                                  sx={{ 
                                    textTransform: 'capitalize',
                                    background: getPriorityColor(task.priority) + '15',
                                    color: getPriorityColor(task.priority),
                                    fontWeight: 600,
                                    height: 24,
                                    border: `1px solid ${getPriorityColor(task.priority)}30`
                                  }}
                                />
                              </Stack>
                            </Box>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {task.description}
                              </Typography>
                            )}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {task.assignedTo?.name || 'Unassigned'}
                                  </Typography>
                                </Box>
                                {task.dueDate && (
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              {task.pdfFile?.path && (
                                <Tooltip title="View PDF">
                                  <IconButton
                                    size="small"
                                    onClick={() => viewPdf(task.pdfFile.path, task.pdfFile.filename)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <TaskIcon sx={{ fontSize: 64, color: alpha('#667eea', 0.3), mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No tasks available for this project
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value="2" sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    Project Documents
                  </Typography>
                  
                  {/* Project Document */}
                  {selectedProject.pdfFile?.path ? (
                    <Card sx={{ mb: 3, borderRadius: 2 }}>
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
                                {selectedProject.pdfFile.filename || 'Project Document'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Project main document • Uploaded on: {new Date(selectedProject.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => viewPdf(selectedProject.pdfFile.path, selectedProject.pdfFile.filename)}
                              sx={{ borderRadius: 2 }}
                            >
                              View
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => downloadPdf(selectedProject.pdfFile.path, selectedProject.pdfFile.filename)}
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
                    Task Documents ({selectedProject.tasks?.filter(t => t.pdfFile?.path).length || 0})
                  </Typography>
                  {selectedProject.tasks?.filter(t => t.pdfFile?.path).length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedProject.tasks
                        .filter(task => task.pdfFile?.path)
                        .map((task) => (
                          <Grid item xs={12} md={6} key={task._id}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <FileIcon sx={{ fontSize: 32, color: '#29B6F6' }} />
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight="600">
                                        {task.pdfFile.filename || 'Task Document'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        From task: {task.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Assigned to: {task.assignedTo?.name || 'Unassigned'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="View PDF">
                                      <IconButton
                                        size="small"
                                        onClick={() => viewPdf(task.pdfFile.path, task.pdfFile.filename)}
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                      <IconButton
                                        size="small"
                                        onClick={() => downloadPdf(task.pdfFile.path, task.pdfFile.filename)}
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
              </TabPanel>
            </TabContext>
          )}
        </DialogContent>
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
              Project Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Admin dashboard for managing all projects
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettingsIcon color="primary" fontSize="large" />
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<FolderIcon />}
              value={stats.total}
              label="Total Projects"
              color="#667eea"
              subtext="Across all teams"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<PlayArrowIcon />}
              value={stats.active}
              label="Active Projects"
              color="#66BB6A"
              trend="+12"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CheckCircleIcon />}
              value={stats.completed}
              label="Completed"
              color="#29B6F6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<FlagIcon />}
              value={stats.highPriority}
              label="High Priority"
              color="#EF5350"
              subtext="Urgent attention"
            />
          </Grid>
        </Grid>
      </Box>

      {/* ==== CREATE / EDIT PROJECT FORM ==== */}
      <Card 
        id="project-form"
        sx={{ 
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="800">
              {projectId ? "Edit Project" : "Create New Project"}
            </Typography>
            {projectId && (
              <Button 
                onClick={resetForm} 
                variant="outlined" 
                size="small"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {projectId ? "Update project details below" : "Fill in the details to create a new project"}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* PROJECT NAME */}
            <TextField
              label="Project Name *"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              error={!!errors.projectName}
              helperText={errors.projectName}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionOutlinedIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* DESCRIPTION */}
            <TextField
              label="Description *"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* DATES */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Start Date *"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="End Date *"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* PRIORITY & STATUS */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.priority}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    label="Priority"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Low">
                      <Box display="flex" alignItems="center" gap={1}>
                        <BoltIcon sx={{ color: '#66BB6A', fontSize: 18 }} />
                        Low Priority
                      </Box>
                    </MenuItem>
                    <MenuItem value="Medium">
                      <Box display="flex" alignItems="center" gap={1}>
                        <BoltIcon sx={{ color: '#FFA726', fontSize: 18 }} />
                        Medium Priority
                      </Box>
                    </MenuItem>
                    <MenuItem value="High">
                      <Box display="flex" alignItems="center" gap={1}>
                        <BoltIcon sx={{ color: '#EF5350', fontSize: 18 }} />
                        High Priority
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Active">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PlayArrowIcon sx={{ color: '#66BB6A', fontSize: 18 }} />
                        Active
                      </Box>
                    </MenuItem>
                    <MenuItem value="On Hold">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PauseIcon sx={{ color: '#FFA726', fontSize: 18 }} />
                        On Hold
                      </Box>
                    </MenuItem>
                    <MenuItem value="Completed">
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon sx={{ color: '#29B6F6', fontSize: 18 }} />
                        Completed
                      </Box>
                    </MenuItem>
                    <MenuItem value="Planning">
                      <Box display="flex" alignItems="center" gap={1}>
                        <ScheduleIcon sx={{ color: '#AB47BC', fontSize: 18 }} />
                        Planning
                      </Box>
                    </MenuItem>
                    <MenuItem value="Cancelled">
                      <Box display="flex" alignItems="center" gap={1}>
                        <StopIcon sx={{ color: '#EF5350', fontSize: 18 }} />
                        Cancelled
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* MEMBERS */}
            <FormControl fullWidth error={!!errors.members}>
              <InputLabel>Team Members *</InputLabel>
              <Select
                multiple
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                renderValue={() => (
                  <Box display="flex" alignItems="center" gap={1}>
                    <AvatarGroup max={4}>
                      {getSelectedUsers().map((u) => (
                        <Tooltip key={u._id} title={u.name}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}>
                            {u.name?.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary">
                      {members.length} member{members.length !== 1 ? 's' : ''} selected
                    </Typography>
                  </Box>
                )}
                label="Team Members *"
                sx={{ borderRadius: 2 }}
              >
                {users.map((u) => (
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
              {errors.members && <FormHelperText error>{errors.members}</FormHelperText>}
            </FormControl>

            {/* FILE UPLOAD */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  py: 1.5
                }}
              >
                Upload Project Document (PDF)
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
              {projectId && projects.find(p => p._id === projectId)?.pdfFile?.filename && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <PdfIcon sx={{ color: '#66BB6A', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Current file: {projects.find(p => p._id === projectId)?.pdfFile?.filename}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* ACTION BUTTONS */}
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : projectId ? <EditIcon /> : <RocketLaunchIcon />}
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8c 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                {loading ? "Saving..." : projectId ? "Update Project" : "Create Project"}
              </Button>
              {!projectId && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  disabled={loading}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Clear Form
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================== PROJECT LIST SECTION ===================== */}
      <Box sx={{ 
        background: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="800">
              All Projects ({filteredProjects.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and monitor all your projects
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon color="action" sx={{ ml: 1 }} />
                  </InputAdornment>
                }
                displayEmpty
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="name">Name A-Z</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {filteredProjects.length === 0 ? (
          <Box textAlign="center" py={6}>
            <FolderIcon sx={{ fontSize: 64, color: alpha('#667eea', 0.3), mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No projects found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                px: 3
              }}
            >
              Create First Project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((p) => (
              <Grid item xs={12} md={6} lg={4} key={p._id}>
                <Card sx={{ 
                  borderRadius: 3,
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    borderColor: alpha('#667eea', 0.3),
                  }
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${getStatusColor(p.status)} 0%, ${getPriorityColor(p.priority)} 100%)`,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }} />
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <FolderIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography variant="h6" fontWeight="700" noWrap>
                            {p.projectName}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
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
                          <Chip
                            label={p.priority}
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              background: getPriorityColor(p.priority) + '15',
                              color: getPriorityColor(p.priority),
                              fontWeight: 600,
                              border: `1px solid ${getPriorityColor(p.priority)}30`
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {p.description}
                    </Typography>
                    
                    {/* Progress Bar */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Task Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="600" color="primary">
                          {getTaskProgress(p.tasks)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getTaskProgress(p.tasks)} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'No start'} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'No end'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {p.users?.length || 0}
                        </Typography>
                        <TaskIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {p.tasks?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      {/* PDF Actions */}
                      <Stack direction="row" spacing={1}>
                        {p.pdfFile?.path ? (
                          <>
                            <Tooltip title="View PDF">
                              <IconButton
                                size="small"
                                onClick={() => viewPdf(p.pdfFile.path, p.pdfFile.filename)}
                                sx={{ color: '#667eea' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download PDF">
                              <IconButton
                                size="small"
                                onClick={() => downloadPdf(p.pdfFile.path, p.pdfFile.filename)}
                                sx={{ color: '#66BB6A' }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No document
                          </Typography>
                        )}
                      </Stack>
                      
                      {/* Action Buttons */}
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => viewProjectDetails(p)}
                            sx={{ color: '#667eea' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => editProject(p)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteProject(p._id, p.projectName)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default AdminProject;