// src/HRCDS/Pages/AdminProjects.jsx
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
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----- PROJECT DIALOG -----
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [projectForm, setProjectForm] = useState({
    projectName: "",
    users: [],
    status: "Active",
    startDate: "",
    endDate: "",
  });

  // ----- TASK DRAWER -----
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [taskProject, setTaskProject] = useState(null);

  // ----- TASK FORM -----
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskForm, setTaskForm] = useState({
    taskName: "",
    assignedTo: "",
    status: "Pending",
  });

  // ----------------- FETCH USERS -----------------
  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/users/all-users");
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Users fetch error:", err);
    }
  };

  // ----------------- FETCH PROJECTS -----------------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/projects?page=1&limit=50");
      const list = Array.isArray(data?.items) ? data.items : [];

      const normalized = list.map((p, i) => ({
        sno: i + 1,
        _id: p?._id,
        projectName: p?.projectName ?? "",
        users: Array.isArray(p?.users) ? p.users : [],
        status: p?.status ?? "Active",
        startDate: p?.startDate ?? null,
        endDate: p?.endDate ?? null,
        tasks: Array.isArray(p?.tasks) ? p.tasks : [],
      }));

      setProjects(normalized);
    } catch (err) {
      console.error("Projects fetch error:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // ----------------- PROJECT CRUD -----------------

  const handleOpenAdd = () => {
    setEditingProject(null);
    setProjectForm({
      projectName: "",
      users: [],
      status: "Active",
      startDate: "",
      endDate: "",
    });
    setOpenProjectDialog(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setProjectForm({
      projectName: project?.projectName || "",
      users: project?.users?.map((u) => u._id) || [],
      status: project?.status || "Active",
      startDate: project?.startDate ? dayjs(project.startDate).format("YYYY-MM-DDTHH:mm") : "",
      endDate: project?.endDate ? dayjs(project.endDate).format("YYYY-MM-DDTHH:mm") : "",
    });
    setOpenProjectDialog(true);
  };

  const handleSaveProject = async () => {
    if (saveLoading) return; // prevent double submit
    if (!projectForm.projectName || !projectForm.projectName.trim()) {
      toast.error("Project Name is required");
      return;
    }

    try {
      setSaveLoading(true);

      const body = {
        projectName: projectForm.projectName.trim(),
        users: projectForm.users,
        status: projectForm.status,
        startDate: projectForm.startDate ? new Date(projectForm.startDate) : null,
        endDate: projectForm.endDate ? new Date(projectForm.endDate) : null,
      };

      if (editingProject) {
        await axiosInstance.put(`/projects/${editingProject._id}`, body);
      } else {
        await axiosInstance.post("/projects", body);
      }

      // Fast UX: close now, refresh in background
      setOpenProjectDialog(false);
      toast.success("✅ Project saved successfully");

      // Fresh populated list (prevents stale/partial UI & ensures members are visible)
      fetchProjects();
    } catch (err) {
      console.error("Save Project Error:", err);
      toast.error("Failed to save project");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      // Re-number S.No after delete (local)
      setProjects((prev) => prev.filter((p) => p._id !== id).map((p, i) => ({ ...p, sno: i + 1 })));
      toast.success("Project deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete");
    }
  };

  // ----------------- COLUMNS -----------------
  const columns = [
    { field: "sno", headerName: "S.No", width: 80 },

    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1.1,
      valueGetter: (params) => params?.row?.projectName?.trim() || "Untitled",
    },

    // Members as chips (first 3 + “+X more”)
    {
      field: "users",
      headerName: "Members",
      flex: 1.3,
      sortable: false,
      renderCell: (params) => {
        const list = Array.isArray(params?.row?.users) ? params.row.users : [];
        const visible = list.slice(0, 3);
        const more = Math.max(list.length - visible.length, 0);

        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
            {visible.map((u) => (
              <Chip key={u._id} label={u?.name || "Unknown"} size="small" />
            ))}
            {more > 0 && (
              <Tooltip title={list.slice(3).map((u) => u?.name).join(", ")}>
                <Chip label={`+${more} more`} size="small" variant="outlined" />
              </Tooltip>
            )}
          </Stack>
        );
      },
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.row?.status || "Active"}
          color={
            params?.row?.status === "Active"
              ? "primary"
              : params?.row?.status === "OnHold"
              ? "warning"
              : "success"
          }
          size="small"
        />
      ),
    },

    // Dates (DD/MM/YYYY HH:mm)
  
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => openTaskDrawer(params.row)}>
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteProject(params.row._id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // ----------------- TASK DRAWER + ACTIONS -----------------
  const openTaskDrawer = (project) => {
    setTaskProject(project);
    setDrawerOpen(true);
  };

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      taskName: "",
      assignedTo: "",
      status: "Pending",
    });
    setOpenTaskDialog(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      taskName: task.taskName,
      assignedTo: task.assignedTo?._id || task.assignedTo,
      status: task.status,
    });
    setOpenTaskDialog(true);
  };

  const handleSaveTask = async () => {
    try {
      let res;

      if (editingTask) {
        res = await axiosInstance.patch(
          `/projects/${taskProject._id}/tasks/${editingTask._id}`,
          taskForm
        );
      } else {
        res = await axiosInstance.post(`/projects/${taskProject._id}/tasks`, taskForm);
      }

      const updated = res.data;

      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setTaskProject(updated);

      setOpenTaskDialog(false);
      toast.success("✅ Task saved");
    } catch (err) {
      console.error("Save Task Error:", err);
      toast.error("Failed to save task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/projects/${taskProject._id}/tasks/${taskId}`);

      setProjects((prev) =>
        prev.map((p) =>
          p._id === taskProject._id
            ? { ...p, tasks: p.tasks.filter((t) => t._id !== taskId) }
            : p
        )
      );

      setTaskProject((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t._id !== taskId),
      }));
      toast.success("Task deleted");
    } catch (err) {
      console.error("Delete Task Error:", err);
      toast.error("Failed to delete task");
    }
  };

  // ----------------- JSX RETURN -----------------
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Admin Projects
        </Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          + Add Project
        </Button>
      </Stack>

      {/* PROJECT LIST */}
      <Box sx={{ height: 540, width: "100%" }}>
        <DataGrid
          rows={projects}
          columns={columns}
          getRowId={(row) => row?._id}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": { outline: "none !important" },
            backgroundColor: "background.paper",
          }}
        />
      </Box>

      {/* ADD / EDIT PROJECT DIALOG */}
      <Dialog
        open={openProjectDialog}
        onClose={() => (saveLoading ? null : setOpenProjectDialog(false))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingProject ? "Edit Project" : "Add Project"}</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Project Name"
            required
            value={projectForm.projectName}
            onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
            error={!projectForm.projectName?.trim()}
            helperText={!projectForm.projectName?.trim() ? "Project Name is required" : " "}
          />

          <FormControl fullWidth>
            <InputLabel>Assign Users</InputLabel>
            <Select
              multiple
              value={projectForm.users}
              label="Assign Users"
              onChange={(e) => setProjectForm({ ...projectForm, users: e.target.value })}
              renderValue={(selected) =>
                users.filter((u) => selected.includes(u._id)).map((u) => u.name).join(", ")
              }
            >
              {users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  <Checkbox checked={projectForm.users.includes(u._id)} />
                  <ListItemText primary={u.name} secondary={u.employeeType || u.role || ""} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={projectForm.status}
              label="Status"
              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="OnHold">OnHold</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="datetime-local"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={projectForm.startDate}
            onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
          />

          <TextField
            type="datetime-local"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={projectForm.endDate}
            onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button disabled={saveLoading} onClick={() => setOpenProjectDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProject}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={16} /> : null}
          >
            {saveLoading ? "" : editingProject ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TASK DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 460, p: 2 } }}
      >
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {taskProject?.projectName || "Project"}
        </Typography>

        {/* Meta */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Chip
            size="small"
            label={taskProject?.status || "Active"}
            color={
              taskProject?.status === "Active"
                ? "primary"
                : taskProject?.status === "OnHold"
                ? "warning"
                : "success"
            }
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Start:&nbsp;
          {taskProject?.startDate
            ? dayjs(taskProject.startDate).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          End:&nbsp;&nbsp;
          {taskProject?.endDate
            ? dayjs(taskProject.endDate).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Typography>

        {/* Members */}
        <Typography variant="subtitle2" mt={1} mb={1}>
          Members:
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={2}>
          {(taskProject?.users || []).map((u) => (
            <Chip key={u._id} label={u?.name || "Unknown"} size="small" />
          ))}
        </Stack>

        <Button variant="contained" size="small" sx={{ mb: 1 }} onClick={handleOpenAddTask}>
          + Add Task
        </Button>

        <Divider sx={{ mb: 2 }} />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={60}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskProject?.tasks?.map((t) => (
              <TableRow key={t._id} hover>
                <TableCell>{t.taskName}</TableCell>
                <TableCell>{t.assignedTo?.name || "-"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={t.status}
                    color={
                      t.status === "Pending"
                        ? "warning"
                        : t.status === "Active"
                        ? "primary"
                        : "success"
                    }
                    onClick={() => handleOpenEditTask(t)}
                    sx={{ cursor: "pointer" }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDeleteTask(t._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!(taskProject?.tasks?.length > 0) && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary">No tasks added.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Drawer>

      {/* ADD / EDIT TASK DIALOG */}
      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Task Name"
            value={taskForm.taskName}
            onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={taskForm.assignedTo}
              label="Assign To"
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
            >
              {users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name} {u.employeeType ? `(${u.employeeType})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={taskForm.status}
              label="Status"
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            {editingTask ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProjects;
