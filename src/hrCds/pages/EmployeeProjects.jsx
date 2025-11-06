import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  Chip,
  Stack,
  Divider,
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
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import axiosInstance from "../../utils/axiosConfig"; // ✅ auto-adds token

// --- constants ---
const STATUS_OPTIONS = ["Pending", "Active", "Done"];
const statusColor = (s) =>
  s === "Pending" ? "warning" : s === "Active" ? "primary" : "success";

const EmployeeProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Status dialog
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("Pending");

  // Logged-in user (used to allow status change only for own tasks)
  const me = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // ------------------------ FETCH PROJECTS ------------------------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/projects?page=1&limit=100");
      const items = Array.isArray(data?.items) ? data.items : [];

      // Normalize rows so columns never read undefined
      const normalized = items.map((p, i) => ({
        sno: i + 1,
        _id: p?._id,
        projectName: p?.projectName ?? "",
        status: p?.status ?? "Active",
        startDate: p?.startDate ?? null,
        endDate: p?.endDate ?? null,
        users: Array.isArray(p?.users) ? p.users : [],
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
  }, []);

  // ------------------------ DRAWER OPEN ------------------------
  const openTaskDrawer = (project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  // ------------------------ STATUS DIALOG ------------------------
  const openStatusDialog = (task) => {
    setSelectedTask(task);
    setNewStatus(task?.status || "Pending");
    setStatusOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusOpen(false);
    setSelectedTask(null);
  };

  // ------------------------ PATCH STATUS ------------------------
  const handleUpdateStatus = async () => {
    if (!selectedProject || !selectedTask) return;
    try {
      const res = await axiosInstance.patch(
        `/projects/${selectedProject._id}/tasks/${selectedTask._id}`,
        { status: newStatus }
      );
      const updatedProject = res.data;

      // Update list + drawer without refetch
      setProjects((prev) => prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)));
      setSelectedProject(updatedProject);

      closeStatusDialog();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // ------------------------ OWNERSHIP CHECK ------------------------
  const isMyTask = (task) => {
    const myId = me?._id;
    const assignedId = task?.assignedTo?._id || task?.assignedTo;
    return Boolean(myId && assignedId && String(myId) === String(assignedId));
  };

  // ------------------------ DATAGRID COLUMNS (NULL-SAFE) ------------------------
  const columns = [
    { field: "sno", headerName: "S.No", width: 80 },

    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1.4,
      valueGetter: (params) => params?.row?.projectName || "Untitled",
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip size="small" label={params?.row?.status || "Active"} />
      ),
    },

    {
      field: "tasks",
      headerName: "Tasks",
      width: 90,
      valueGetter: (params) =>
        Array.isArray(params?.row?.tasks) ? params.row.tasks.length : 0,
    },

    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueGetter: (params) =>
        params?.row?.startDate
          ? dayjs(params.row.startDate).format("DD/MM/YYYY HH:mm")
          : "-",
    },

    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      valueGetter: (params) =>
        params?.row?.endDate
          ? dayjs(params.row.endDate).format("DD/MM/YYYY HH:mm")
          : "-",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} mb={2}>
        Employee Projects
      </Typography>

      {/* PROJECT LIST */}
      <Box sx={{ height: 480, width: "100%" }}>
        <DataGrid
          rows={projects}
          columns={columns}
          getRowId={(row) => row?._id}
          loading={loading}
          disableRowSelectionOnClick
          onRowClick={(params) => openTaskDrawer(params.row)}
          sx={{
            "& .MuiDataGrid-cell": { outline: "none !important", cursor: "pointer" },
            backgroundColor: "background.paper",
          }}
        />
      </Box>

      {/* TASK DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 420, p: 2 } }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>
          {selectedProject?.projectName}
        </Typography>

        {/* Project Meta */}
        <Stack direction="row" spacing={1} mb={1} alignItems="center">
          <Chip size="small" label={`Status: ${selectedProject?.status || "Active"}`} />
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Start:{" "}
          {selectedProject?.startDate
            ? dayjs(selectedProject.startDate).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          End:&nbsp;&nbsp;
          {selectedProject?.endDate
            ? dayjs(selectedProject.endDate).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Typography>

        <Divider />

        {/* Members */}
        <Typography variant="subtitle2" mt={2} mb={1}>
          Assigned Members:
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(selectedProject?.users || []).map((u) => (
            <Chip
              key={u._id}
              label={`${u.name} (${u.employeeType || "N/A"})`}
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Tasks */}
        <Typography variant="subtitle2" mb={1}>
          Tasks:
        </Typography>

        {selectedProject?.tasks?.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {selectedProject.tasks.map((t) => (
                <TableRow key={t._id} hover>
                  <TableCell>{t.taskName}</TableCell>
                  <TableCell>
                    {t.assignedTo?.name || "N/A"} (
                    {t.assignedTo?.employeeType || "N/A"})
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={
                        isMyTask(t)
                          ? "Click to change status"
                          : "You can update only your assigned tasks"
                      }
                    >
                      <Chip
                        label={t.status}
                        color={statusColor(t.status)}
                        size="small"
                        onClick={() => isMyTask(t) && openStatusDialog(t)}
                        sx={{ cursor: isMyTask(t) ? "pointer" : "not-allowed" }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography color="text.secondary" mt={1}>
            No tasks assigned.
          </Typography>
        )}
      </Drawer>

      {/* STATUS UPDATE DIALOG */}
      <Dialog open={statusOpen} onClose={closeStatusDialog}>
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
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
          <Button onClick={closeStatusDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProjects;
