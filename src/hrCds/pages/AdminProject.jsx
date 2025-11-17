// ========================= AdminProject.jsx =========================
// (React Frontend - Enhanced Professional UI)
// -------------------------------------------------------------------
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
  InputAdornment,
  CardHeader,
  Alert,
  CircularProgress,
  IconButton
} from "@mui/material";

import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from "@mui/icons-material";

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

  // DATA STATES
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  // UI STATES
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch users & projects
  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("/users/all-users");
    setUsers(res.data);
  };

  const fetchProjects = async () => {
    const res = await axios.get("/projects");
    setProjects(res.data.items || []);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!projectName.trim()) newErrors.projectName = "Project name required";
    if (!description.trim()) newErrors.description = "Description required";
    if (!startDate) newErrors.startDate = "Start date required";
    if (!endDate) newErrors.endDate = "End date required";
    if (new Date(startDate) > new Date(endDate)) newErrors.endDate = "End date must be after start";
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
        await axios.put(`/projects/${projectId}`, formData);
      } else {
        await axios.post("/projects", formData);
      }

      setSuccess(true);
      resetForm();
      fetchProjects();
    } catch (err) {
      console.log(err);
      setErrors({ submit: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  // DELETE PROJECT
  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    await axios.delete(`/projects/${id}`);
    fetchProjects();
  };

  // EDIT PROJECT
  const editProject = (p) => {
    setProjectId(p._id);
    setProjectName(p.projectName);
    setDescription(p.description);
    setStartDate(p.startDate?.slice(0,10));
    setEndDate(p.endDate?.slice(0,10));
    setPriority(p.priority);
    setStatus(p.status);
    setMembers(p.users.map(u => u._id));
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
    setErrors({});
  };

  const getSelectedUsers = () => users.filter(u => members.includes(u._id));

  return (
    <Box p={3} maxWidth="1200px" mx="auto">
      {/* ==== CREATE / EDIT PROJECT FORM ==== */}
      <Card elevation={3}>
        <CardHeader
          title={
            <Typography variant="h4" color="white">
              {projectId ? "Edit Project" : "Create New Project"}
            </Typography>
          }
          sx={{
            background: "linear-gradient(135deg, #1b6effff 0%, #86f1ffff 100%)",
            color: "white",
          }}
        />

        <CardContent sx={{ p: 4 }}>
          {success && <Alert severity="success">Successfully saved!</Alert>}
          {errors.submit && <Alert severity="error">{errors.submit}</Alert>}

          <Stack spacing={3}>
            {/* PROJECT NAME */}
            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              error={!!errors.projectName}
              helperText={errors.projectName}
              fullWidth
            />

            {/* DESCRIPTION */}
            <TextField
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              fullWidth
            />

            {/* DATES */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* PRIORITY */}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>

            {/* STATUS */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="OnHold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>

            {/* MEMBERS */}
            <FormControl fullWidth>
              <InputLabel>Members</InputLabel>
              <Select
                multiple
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                renderValue={() => (
                  <AvatarGroup max={4}>
                    {getSelectedUsers().map((u) => (
                      <Avatar key={u._id}>{u.name.charAt(0)}</Avatar>
                    ))}
                  </AvatarGroup>
                )}
              >
                {users?.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} — {u.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* FILE */}
            <Button variant="contained" component="label">
              Upload PDF
              <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
            </Button>

            {/* SUBMIT BUTTON */}
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {projectId ? "Update Project" : "Create Project"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================== PROJECT LIST SECTION ===================== */}

      <Typography variant="h5" mt={5} mb={2}>
        All Projects
      </Typography>

      <Grid container spacing={3}>
        {projects.map((p) => (
          <Grid item xs={12} md={4} key={p._id}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6">{p.projectName}</Typography>
              <Typography>Status: {p.status}</Typography>
              <Typography>Priority: {p.priority}</Typography>

              <Stack direction="row" spacing={1} mt={2}>
                <IconButton color="primary" onClick={() => editProject(p)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => deleteProject(p._id)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminProject;
