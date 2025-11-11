import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Drawer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  Chat as ChatIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Rejected"];

const statusColor = (status) => {
  switch (status) {
    case "Pending":
      return "warning";
    case "In Progress":
      return "primary";
    case "Completed":
      return "success";
    case "Rejected":
      return "error";
    default:
      return "default";
  }
};

const EmployeeProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Dialogs
  const [statusDialog, setStatusDialog] = useState(false);
  const [remarkDialog, setRemarkDialog] = useState(false);
  const [reassignDialog, setReassignDialog] = useState(false);

  // Inputs
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRemark, setNewRemark] = useState("");
  const [reassignUser, setReassignUser] = useState("");
  const [updating, setUpdating] = useState(false);

  // 🟢 Get logged in user
  const me = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // 🟢 Fetch all projects (employee view)
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/projects?page=1&limit=100");
      const filtered = data.items?.filter((p) =>
        p.users?.some((u) => String(u._id) === String(me?._id))
      );
      setProjects(filtered || []);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (me?._id) fetchProjects();
  }, [me]);

  const openDrawer = (project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const openPDF = (path) => {
    if (!path) return toast.error("No PDF found");
    window.open(
      path.startsWith("http") ? path : `/${path}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const isMyTask = (task) =>
    String(task.assignedTo?._id || task.assignedTo) === String(me?._id);

  // 🟢 Open dialogs
  const handleOpenStatusDialog = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setStatusDialog(true);
  };

  const handleOpenRemarkDialog = (task) => {
    setSelectedTask(task);
    setNewRemark(task.remarks || "");
    setRemarkDialog(true);
  };

  const handleOpenReassignDialog = (task) => {
    setSelectedTask(task);
    setReassignUser("");
    setReassignDialog(true);
  };

  // 🟢 Update status
  const handleUpdateStatus = async () => {
    if (!selectedProject || !selectedTask) return;
    setUpdating(true);
    try {
      const res = await axiosInstance.patch(
        `/api/projects/${selectedProject._id}/tasks/${selectedTask._id}`,
        { status: newStatus }
      );
      setSelectedProject(res.data);
      toast.success("Task status updated");
      fetchProjects();
      setStatusDialog(false);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // 🟢 Add remark
  const handleAddRemark = async () => {
    if (!newRemark.trim()) return toast.error("Enter a remark");
    setUpdating(true);
    try {
      const res = await axiosInstance.patch(
        `/api/projects/${selectedProject._id}/tasks/${selectedTask._id}`,
        { remarks: newRemark }
      );
      setSelectedProject(res.data);
      toast.success("Remark added");
      fetchProjects();
      setRemarkDialog(false);
    } catch (err) {
      toast.error("Failed to add remark");
    } finally {
      setUpdating(false);
    }
  };

  // 🟢 Reassign task
  const handleReassignTask = async () => {
    if (!reassignUser) return toast.error("Select a user to reassign");
    setUpdating(true);
    try {
      const res = await axiosInstance.patch(
        `/api/projects/${selectedProject._id}/tasks/${selectedTask._id}`,
        { assignedTo: reassignUser }
      );
      setSelectedProject(res.data);
      toast.success("Task reassigned successfully");
      fetchProjects();
      setReassignDialog(false);
    } catch (err) {
      toast.error("Failed to reassign task");
    } finally {
      setUpdating(false);
    }
  };

  // 🟢 Table columns
  const columns = [
    { field: "projectName", headerName: "Project", flex: 1.5 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={statusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: "tasks",
      headerName: "Tasks",
      width: 80,
      valueGetter: (params) => params.row.tasks?.length || 0,
    },
    {
      field: "endDate",
      headerName: "Deadline",
      width: 150,
      valueGetter: (params) =>
        params.row.endDate
          ? dayjs(params.row.endDate).format("DD MMM YYYY")
          : "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Tooltip title="View Tasks">
          <IconButton color="primary" onClick={() => openDrawer(params.row)}>
            <AssignmentIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        My Projects
      </Typography>

      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={projects}
          columns={columns}
          getRowId={(r) => r._id}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* 🟢 Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 520, p: 3 } }}
      >
        {selectedProject && (
          <>
            <Typography variant="h6" fontWeight={700}>
              {selectedProject.projectName}
            </Typography>
            <Chip
              label={selectedProject.status}
              color={statusColor(selectedProject.status)}
              sx={{ mt: 1 }}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Members
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
              {selectedProject.users.map((u) => (
                <Chip key={u._id} label={u.name} size="small" />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Tasks
            </Typography>

            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProject.tasks.map((t) => (
                  <TableRow key={t._id} hover>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        color={statusColor(t.status)}
                        size="small"
                        onClick={() => isMyTask(t) && handleOpenStatusDialog(t)}
                        sx={{
                          cursor: isMyTask(t) ? "pointer" : "not-allowed",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {t.pdfFile?.path && (
                        <Tooltip title="View PDF">
                          <IconButton onClick={() => openPDF(t.pdfFile.path)}>
                            <PictureAsPdfIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Add Remark">
                        <IconButton onClick={() => handleOpenRemarkDialog(t)}>
                          <ChatIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reassign Task">
                        <span>
                          <IconButton
                            onClick={() => handleOpenReassignDialog(t)}
                            disabled={!isMyTask(t)}
                          >
                            <EditIcon
                              color={isMyTask(t) ? "secondary" : "disabled"}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Drawer>

      {/* 🟢 Status Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={updating}
            startIcon={updating && <CircularProgress size={18} />}
          >
            {updating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🟢 Remark Dialog */}
      <Dialog open={remarkDialog} onClose={() => setRemarkDialog(false)}>
        <DialogTitle>Add Remark</DialogTitle>
        <DialogContent>
          <TextField
            label="Remark"
            fullWidth
            multiline
            rows={3}
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemarkDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddRemark}
            disabled={updating}
          >
            {updating ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🟢 Reassign Dialog */}
      <Dialog open={reassignDialog} onClose={() => setReassignDialog(false)}>
        <DialogTitle>Reassign Task</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={reassignUser}
              onChange={(e) => setReassignUser(e.target.value)}
            >
              {selectedProject?.users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReassignTask}
            disabled={updating}
            startIcon={updating && <CircularProgress size={18} />}
          >
            {updating ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProjects;
