import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Drawer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Tooltip,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [projectForm, setProjectForm] = useState({
    projectName: "",
    users: [],
    startDate: "",
    endDate: "",
    status: "Active",
    pdfFile: null,
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    remarks: "",
    status: "Pending",
    pdfFile: null,
  });

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/users/all-users");
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  // ✅ Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/projects?page=1&limit=50");
      setProjects(data?.items || []);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // ✅ Handle Project Create/Edit
  const handleSaveProject = async () => {
    if (!projectForm.projectName.trim()) {
      return toast.error("Project name is required");
    }

    try {
      setSaveLoading(true);
      const formData = new FormData();
      Object.entries(projectForm).forEach(([key, value]) => {
        if (key === "users") {
          value.forEach((id) => formData.append("users[]", id));
        } else if (value) {
          formData.append(key, value);
        }
      });

      let res;
      if (editingProject) {
        res = await axiosInstance.put(`/projects/${editingProject._id}`, formData);
        toast.success("Project updated successfully");
      } else {
        res = await axiosInstance.post("/projects", formData);
        toast.success("Project created successfully");
      }
      setOpenDialog(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error("Error saving project");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axiosInstance.delete(`/projects/${id}`);
      toast.success("Project deleted");
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    }
  };

  // ✅ Task Management
  const handleSaveTask = async () => {
    if (!taskForm.title || !taskForm.assignedTo)
      return toast.error("Task title and assignee required");

    try {
      setSaveLoading(true);
      const formData = new FormData();
      Object.entries(taskForm).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });

      let res;
      if (editingTask) {
        res = await axiosInstance.patch(
          `/projects/${selectedProject._id}/tasks/${editingTask._id}`,
          formData
        );
        toast.success("Task updated");
      } else {
        res = await axiosInstance.post(
          `/projects/${selectedProject._id}/tasks`,
          formData
        );
        toast.success("Task added");
      }
      setTaskDialogOpen(false);
      setSelectedProject(res.data);
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save task");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axiosInstance.delete(`/projects/${selectedProject._id}/tasks/${taskId}`);
      toast.success("Task deleted");
      fetchProjects();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  // ✅ Project Statistics
  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === "Active").length;
    const completed = projects.filter(p => p.status === "Completed").length;
    const onHold = projects.filter(p => p.status === "OnHold").length;
    
    return { total, active, completed, onHold };
  };

  const stats = getProjectStats();

  // ✅ DataGrid Columns
  const columns = [
    { 
      field: "projectName", 
      headerName: "Project Name", 
      flex: 1.4,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500">
          {params.row.projectName}
        </Typography>
      )
    },
    {
      field: "users",
      headerName: "Members",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem' } }}>
          {params.row.users?.map((u) => (
            <Tooltip key={u._id} title={u.name}>
              <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                {u.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.startDate ? dayjs(params.row.startDate).format('MMM DD, YYYY') : '-'}
        </Typography>
      ),
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.endDate ? dayjs(params.row.endDate).format('MMM DD, YYYY') : '-'}
        </Typography>
      ),
    },
    {
      field: "tasks",
      headerName: "Tasks",
      width: 80,
      align: "center",
      renderCell: (params) => (
        <Chip 
          label={params.row.tasks?.length || 0} 
          size="small" 
          variant="outlined"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={
            params.row.status === "Active"
              ? "primary"
              : params.row.status === "Completed"
              ? "success"
              : "warning"
          }
          size="small"
          variant="filled"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => viewProjectDetails(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Tasks">
            <IconButton 
              color="secondary" 
              size="small"
              onClick={() => openProjectTasks(params.row)}
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Project">
            <IconButton 
              color="default" 
              size="small"
              onClick={() => handleEditProject(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Project">
            <IconButton 
              color="error" 
              size="small"
              onClick={() => handleDeleteProject(params.row._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // ✅ Edit project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      projectName: project.projectName,
      users: project.users?.map((u) => u._id) || [],
      startDate: project.startDate ? dayjs(project.startDate).format("YYYY-MM-DDTHH:mm") : "",
      endDate: project.endDate ? dayjs(project.endDate).format("YYYY-MM-DDTHH:mm") : "",
      status: project.status,
      pdfFile: null,
    });
    setOpenDialog(true);
  };

  const openProjectTasks = (project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary">
          Project Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProject(null);
            setProjectForm({
              projectName: "",
              users: [],
              startDate: "",
              endDate: "",
              status: "Active",
              pdfFile: null,
            });
            setOpenDialog(true);
          }}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          New Project
        </Button>
      </Stack>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {stats.completed}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="text.secondary">
                {stats.onHold}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                On Hold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Paper 
        sx={{ 
          height: 600, 
          borderRadius: 3,
          boxShadow: 2,
          overflow: 'hidden'
        }}
      >
        <DataGrid
          rows={projects}
          getRowId={(r) => r._id}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderRadius: 0,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }}
        />
      </Paper>

      {/* ✅ Project Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          {editingProject ? "Edit Project" : "Create New Project"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Project Name"
              value={projectForm.projectName}
              onChange={(e) =>
                setProjectForm({ ...projectForm, projectName: e.target.value })
              }
              fullWidth
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel>Team Members</InputLabel>
              <Select
                multiple
                value={projectForm.users}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, users: e.target.value })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {users
                      .filter((u) => selected.includes(u._id))
                      .map((u) => (
                        <Chip key={u._id} label={u.name} size="small" />
                      ))}
                  </Box>
                )}
              >
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    <Checkbox checked={projectForm.users.includes(u._id)} />
                    <ListItemText primary={u.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  type="datetime-local"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={projectForm.startDate}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, startDate: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="datetime-local"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={projectForm.endDate}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, endDate: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Project Status</InputLabel>
              <Select
                value={projectForm.status}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, status: e.target.value })
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="OnHold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ py: 1 }}
            >
              Upload Project Document
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) =>
                  setProjectForm({ ...projectForm, pdfFile: e.target.files[0] })
                }
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProject}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={18} /> : null}
            sx={{ borderRadius: 2 }}
          >
            {saveLoading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Project Details & Tasks Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ 
          sx: { 
            width: { xs: '100%', sm: 700 }, 
            p: 3,
            borderRadius: '16px 0 0 16px'
          } 
        }}
      >
        {selectedProject && (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {selectedProject.projectName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={selectedProject.status}
                    color={
                      selectedProject.status === "Active"
                        ? "primary"
                        : selectedProject.status === "Completed"
                        ? "success"
                        : "warning"
                    }
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {selectedProject.tasks?.length || 0} tasks
                  </Typography>
                </Stack>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingTask(null);
                  setTaskForm({
                    title: "",
                    description: "",
                    assignedTo: "",
                    dueDate: "",
                    priority: "Medium",
                    remarks: "",
                    status: "Pending",
                    pdfFile: null,
                  });
                  setTaskDialogOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Add Task
              </Button>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Project Info */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Project Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {selectedProject.startDate ? dayjs(selectedProject.startDate).format('MMM DD, YYYY') : 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {selectedProject.endDate ? dayjs(selectedProject.endDate).format('MMM DD, YYYY') : 'Not set'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Project Tasks
            </Typography>

            {selectedProject.tasks?.length > 0 ? (
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell><b>Task</b></TableCell>
                    <TableCell><b>Assignee</b></TableCell>
                    <TableCell><b>Priority</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedProject.tasks.map((t) => (
                    <TableRow key={t._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {t.title}
                          </Typography>
                          {t.description && (
                            <Typography variant="caption" color="text.secondary">
                              {t.description.length > 50 ? `${t.description.substring(0, 50)}...` : t.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={t.assignedTo?.name || "Unassigned"} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t.priority || "Medium"}
                          color={
                            t.priority === "High"
                              ? "error"
                              : t.priority === "Low"
                              ? "default"
                              : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          color={
                            t.status === "Completed"
                              ? "success"
                              : t.status === "In Progress"
                              ? "primary"
                              : t.status === "Rejected"
                              ? "error"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {t.pdfFile?.path && (
                            <Tooltip title="View PDF">
                              <IconButton 
                                size="small"
                                onClick={() => window.open(t.pdfFile.path, "_blank")}
                              >
                                <PictureAsPdfIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Edit Task">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingTask(t);
                                setTaskForm({
                                  title: t.title,
                                  description: t.description || "",
                                  assignedTo: t.assignedTo?._id || "",
                                  dueDate: t.dueDate
                                    ? dayjs(t.dueDate).format("YYYY-MM-DDTHH:mm")
                                    : "",
                                  priority: t.priority || "Medium",
                                  remarks: t.remarks || "",
                                  status: t.status || "Pending",
                                  pdfFile: null,
                                });
                                setTaskDialogOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Task">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTask(t._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box textAlign="center" py={4}>
                <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No tasks created for this project yet.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setTaskDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Create First Task
                </Button>
              </Box>
            )}
          </>
        )}
      </Drawer>

      {/* ✅ Task Dialog */}
      <Dialog 
        open={taskDialogOpen} 
        onClose={() => setTaskDialogOpen(false)} 
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'secondary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    label="Assign To"
                  >
                    {selectedProject?.users?.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="datetime-local"
                  label="Due Date"
                  InputLabelProps={{ shrink: true }}
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Remarks"
              multiline
              rows={2}
              value={taskForm.remarks}
              onChange={(e) => setTaskForm({ ...taskForm, remarks: e.target.value })}
              fullWidth
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ py: 1 }}
            >
              Upload Task Document
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) =>
                  setTaskForm({ ...taskForm, pdfFile: e.target.files[0] })
                }
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setTaskDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTask}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={18} /> : null}
            sx={{ borderRadius: 2 }}
          >
            {saveLoading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProjects;