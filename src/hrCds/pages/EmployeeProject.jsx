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
} from "@mui/icons-material";

const EmployeeProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectUsers, setProjectUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openActivityDrawer, setOpenActivityDrawer] = useState(false);
  const [openNotificationsDrawer, setOpenNotificationsDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [statusRemark, setStatusRemark] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    status: "pending",
  });

  const TASK_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Load all projects
  useEffect(() => {
    loadProjects();
    loadNotifications();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/projects");
      setProjects(res.data.items);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      setSelectedProject(id);
      const res = await axios.get(`/projects/${id}`);
      setProjectUsers(res.data.users);
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Error loading project details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setLoading(true);
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

    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Error updating task status");
    } finally {
      setLoading(false);
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
        activityLogs: res.data.activityLogs,
      });
      setOpenActivityDrawer(true);
    } catch (error) {
      console.error("Error loading activity logs:", error);
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
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Add Task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }
    if (!newTask.assignedTo) {
      alert("Please select user to assign task");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(newTask).forEach((key) =>
        formData.append(key, newTask[key])
      );

      if (file) formData.append("pdfFile", file);

      await axios.post(`/projects/${selectedProject}/tasks`, formData);

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
      setOpenTaskDialog(false);

      // Refresh tasks and notifications
      handleSelectProject(selectedProject);
      loadNotifications();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Error adding task");
    } finally {
      setLoading(false);
    }
  };

  // Add Remark to a Task
  const handleAddRemark = async (taskId, text) => {
    if (!text || text.trim() === "") return alert("Enter remark");

    try {
      await axios.post(
        `/projects/${selectedProject}/tasks/${taskId}/remarks`,
        { text }
      );
      // Reload tasks and notifications
      handleSelectProject(selectedProject);
      loadNotifications();
    } catch (error) {
      console.error("Error adding remark:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "in progress": return "warning";
      case "pending": return "info";
      case "cancelled": return "error";
      case "on hold": return "secondary";
      default: return "default";
    }
  };

  const getStatusLabel = (status) => {
    const statusOption = TASK_STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircleIcon fontSize="small" />;
      case "in progress": return <ScheduleIcon fontSize="small" />;
      case "pending": return <ScheduleIcon fontSize="small" />;
      case "cancelled": return <CancelIcon fontSize="small" />;
      case "on hold": return <PauseIcon fontSize="small" />;
      default: return null;
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box p={3} maxWidth="1200px" margin="0 auto">
      {/* Header with Notifications */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          My Projects
        </Typography>
        <Tooltip title="Notifications">
          <IconButton 
            onClick={() => setOpenNotificationsDrawer(true)}
            color="inherit"
          >
            <Badge badgeContent={unreadNotificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      {/* PROJECT LIST */}
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3} mt={1}>
        {projects.map((p) => (
          <Grid item xs={12} md={6} lg={4} key={p._id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: selectedProject === p._id ? "2px solid" : "1px solid",
                borderColor: selectedProject === p._id ? "primary.main" : "divider",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => handleSelectProject(p._id)}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {p.projectName}
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <Chip
                    label={p.priority}
                    size="small"
                    color={getPriorityColor(p.priority)}
                    variant="outlined"
                  />
                  <Chip
                    label={p.status}
                    size="small"
                    color={getStatusColor(p.status)}
                    variant="filled"
                  />
                </Stack>
                {p.description && (
                  <Typography variant="body2" color="text.secondary">
                    {p.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Tasks: {p.tasks?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TASK PANEL */}
      {selectedProject && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Project Tasks
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTaskDialog(true)}
            >
              New Task
            </Button>
          </Box>

          {/* TASK LIST */}
          {tasks.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tasks available for this project. Create the first task!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((t) => (
                <Grid item xs={12} key={t._id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {t.title}
                        </Typography>
                        {t.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {t.description}
                          </Typography>
                        )}
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                          <Chip
                            icon={getStatusIcon(t.status)}
                            label={getStatusLabel(t.status)}
                            size="small"
                            color={getStatusColor(t.status)}
                          />
                          <Chip
                            icon={<PriorityIcon />}
                            label={`Priority: ${t.priority}`}
                            size="small"
                            color={getPriorityColor(t.priority)}
                            variant="outlined"
                          />
                          <Chip
                            icon={<PersonIcon />}
                            label={t.assignedTo?.name || "Unassigned"}
                            size="small"
                            variant="outlined"
                          />
                          {t.dueDate && (
                            <Chip
                              icon={<CalendarIcon />}
                              label={`Due: ${new Date(t.dueDate).toLocaleDateString()}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        {/* Status Update Button */}
                        <Box mb={2}>
                          <Button
                            variant="outlined"
                            startIcon={<UpdateIcon />}
                            onClick={() => handleOpenStatusDialog(t)}
                            size="small"
                          >
                            Update Status
                          </Button>
                          <Button
                            variant="text"
                            startIcon={<HistoryIcon />}
                            onClick={() => handleLoadActivityLogs(t._id)}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            Activity Log
                          </Button>
                        </Box>

                        {/* Existing remarks */}
                        {t.remarks?.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              <CommentIcon fontSize="small" sx={{ mr: 1 }} />
                              Remarks:
                            </Typography>
                            <Stack spacing={1}>
                              {t.remarks.map((r, idx) => (
                                <Paper
                                  key={idx}
                                  variant="outlined"
                                  sx={{ p: 1.5, backgroundColor: 'grey.50' }}
                                >
                                  <Typography variant="body2">
                                    {r.text}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    By {r.createdBy?.name} • {new Date(r.createdAt).toLocaleString()}
                                  </Typography>
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Add New Remark */}
                    <Box mt={2}>
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
                        />
                        <Button
                          variant="outlined"
                          startIcon={<CommentIcon />}
                          onClick={() => handleAddRemark(t._id, t._newRemark)}
                          disabled={!t._newRemark?.trim()}
                        >
                          Add
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
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
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Update Task Status
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <Typography variant="body1" fontWeight="bold">
              Task: {selectedTask?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Status: <Chip 
                label={getStatusLabel(selectedTask?.status)} 
                size="small" 
                color={getStatusColor(selectedTask?.status)}
                variant="outlined"
              />
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>New Status *</InputLabel>
              <Select
                value={selectedTask?.status || ""}
                label="New Status *"
                onChange={(e) => setSelectedTask({
                  ...selectedTask,
                  status: e.target.value
                })}
              >
                {TASK_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Chip 
                      label={status.label} 
                      size="small" 
                      color={getStatusColor(status.value)}
                      variant="outlined"
                    />
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
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenStatusDialog(false);
              setSelectedTask(null);
              setStatusRemark("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleUpdateTaskStatus(selectedTask._id, selectedTask.status)}
            disabled={loading || !selectedTask?.status}
            startIcon={loading ? <CircularProgress size={16} /> : <UpdateIcon />}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ACTIVITY LOGS DRAWER */}
      <Drawer
        anchor="right"
        open={openActivityDrawer}
        onClose={() => setOpenActivityDrawer(false)}
      >
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Activity Logs - {selectedTask?.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {selectedTask?.activityLogs?.map((log, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemIcon>
                  <HistoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={log.description}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        By: {log.performedBy?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.performedAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            {(!selectedTask?.activityLogs || selectedTask.activityLogs.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No activity logs found.
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>

      {/* NOTIFICATIONS DRAWER */}
      <Drawer
        anchor="right"
        open={openNotificationsDrawer}
        onClose={() => setOpenNotificationsDrawer(false)}
      >
        <Box sx={{ width: 400, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
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
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleMarkNotificationAsRead(notification._id)}
                >
                  <ListItemIcon>
                    <NotificationsIcon 
                      color={notification.isRead ? "disabled" : "primary"} 
                      fontSize="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={notification.isRead ? "normal" : "bold"}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
              {notifications.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No notifications.
                </Typography>
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
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Create New Task
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Task Title *"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              fullWidth
              required
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
            />

            <FormControl fullWidth>
              <InputLabel>Assign To *</InputLabel>
              <Select
                value={newTask.assignedTo}
                label="Assign To *"
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedTo: e.target.value })
                }
              >
                {projectUsers.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                        {u.name?.charAt(0)}
                      </Avatar>
                      {u.name} ({u.email})
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
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTask.status}
                  label="Status"
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                >
                  {TASK_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                Upload Task File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {fileName && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Selected: {fileName}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTask}
            disabled={loading || !newTask.title.trim() || !newTask.assignedTo}
            startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {loading ? "Adding..." : "Add Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProject;