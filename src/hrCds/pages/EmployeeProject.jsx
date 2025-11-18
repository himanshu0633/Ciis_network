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
  AvatarGroup,
  Divider,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  // Load all projects
  useEffect(() => {
    loadProjects();
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

  // Load selected project details + tasks
  const handleSelectProject = async (id) => {
    setLoading(true);
    try {
      setSelectedProject(id);
      const res = await axios.get(`/projects/${id}`);
      setProjectUsers(res.data.users);
      setTasks(res.data.tasks);
    } catch (error) {
      console.error("Error loading project details:", error);
    } finally {
      setLoading(false);
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
        status: "Pending",
      });
      setFile(null);
      setFileName("");
      setOpenTaskDialog(false);

      // Refresh tasks
      handleSelectProject(selectedProject);
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
      // Reload tasks
      handleSelectProject(selectedProject);
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
      case "Completed": return "success";
      case "In Progress": return "warning";
      case "Pending": return "info";
      case "Rejected": return "error";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircleIcon fontSize="small" />;
      case "In Progress": return <ScheduleIcon fontSize="small" />;
      case "Pending": return <ScheduleIcon fontSize="small" />;
      case "Rejected": return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Box p={3} maxWidth="1200px" margin="0 auto">
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        My Projects
      </Typography>

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
                            label={t.status}
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
                                  {r.createdAt && (
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(r.createdAt).toLocaleString()}
                                    </Typography>
                                  )}
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
              label="Task Title"
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
                      {u.name}
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
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
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