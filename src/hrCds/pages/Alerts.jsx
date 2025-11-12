import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Grid,
  Avatar,
  Fade,
  Tooltip,
  Chip,
  useTheme,
  FormControl,
  Select,
  InputLabel,
  Checkbox,
  ListItemText,
  LinearProgress,
} from "@mui/material";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiBell,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import { styled, keyframes } from "@mui/material/styles";

/* -----------------------------------
 🔹 Animations
------------------------------------ */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* -----------------------------------
 🔹 Styled Components
------------------------------------ */
const StatCard = styled(Card)(({ theme, color = "primary" }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  },
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
  },
}));

const AlertCard = styled(Card)(({ theme, type }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  animation: `${fadeIn} 0.5s ease-out`,
  borderLeft: `6px solid ${
    type === "info"
      ? theme.palette.info.main
      : type === "warning"
      ? theme.palette.warning.main
      : theme.palette.error.main
  }`,
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[6],
  },
}));

const TypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  textTransform: "capitalize",
  ...(type === "info" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === "warning" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(type === "error" && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
}));

/* -----------------------------------
 🔹 Constants
------------------------------------ */
const alertTypes = [
  { value: "info", label: "Information", icon: FiInfo },
  { value: "warning", label: "Warning", icon: FiAlertTriangle },
  { value: "error", label: "Error", icon: FiAlertCircle },
];

/* -----------------------------------
 🔹 Component
------------------------------------ */
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "info",
    message: "",
    assignedUsers: [],
    assignedGroups: [],
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warning: 0,
    error: 0,
  });
  const [filterType, setFilterType] = useState("all");
  const [role, setRole] = useState("");

  const theme = useTheme();
  const token = localStorage.getItem("token");
  const canManage = role === "hr" || role === "manager";

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  /* -----------------------------------
    🔹 Fetch Data
  ------------------------------------ */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, usersRes, groupsRes] = await Promise.all([
        axios.get("/alerts", headers),
        axios.get("/task/assignable-users", headers),
        axios.get("/groups", headers),
      ]);
      const fetchedAlerts =
        alertsRes.data.alerts || alertsRes.data.data || alertsRes.data || [];
      const fetchedUsers =
        usersRes.data.users || usersRes.data.data || usersRes.data || [];
      const fetchedGroups =
        groupsRes.data.groups || groupsRes.data.data || groupsRes.data || [];

      setAlerts(fetchedAlerts);
      setUsers(fetchedUsers);
      setGroups(fetchedGroups);
      calculateStats(fetchedAlerts);
    } catch {
      setNotification({
        message: "Failed to load alerts",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const info = data.filter((a) => a.type === "info").length;
    const warning = data.filter((a) => a.type === "warning").length;
    const error = data.filter((a) => a.type === "error").length;
    setStats({
      total: data.length,
      info,
      warning,
      error,
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userRole = parsed.role || parsed.user?.role || "";
        setRole(userRole.toLowerCase());
      } catch {}
    }
    fetchData();
  }, []);

  /* -----------------------------------
    🔹 Handlers
  ------------------------------------ */
  const handleOpen = (alert = null) => {
    if (alert) {
      setEditId(alert._id);
      setForm({
        type: alert.type,
        message: alert.message,
        assignedUsers: alert.assignedUsers || [],
        assignedGroups: alert.assignedGroups || [],
      });
    } else {
      setEditId(null);
      setForm({
        type: "info",
        message: "",
        assignedUsers: [],
        assignedGroups: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!canManage)
      return setNotification({ message: "Unauthorized", severity: "error" });
    if (!form.message.trim())
      return setNotification({ message: "Message required", severity: "error" });

    try {
      if (editId) {
        const res = await axios.put(`/alerts/${editId}`, form, headers);
        setAlerts((prev) =>
          prev.map((a) => (a._id === editId ? res.data.alert : a))
        );
        setNotification({ message: "Alert updated", severity: "success" });
      } else {
        const res = await axios.post("/alerts", form, headers);
        setAlerts((prev) => [res.data.alert, ...prev]);
        setNotification({ message: "Alert created", severity: "success" });
      }
      calculateStats(alerts);
      setOpen(false);
    } catch {
      setNotification({ message: "Error saving alert", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!canManage)
      return setNotification({ message: "Unauthorized", severity: "error" });
    try {
      await axios.delete(`/alerts/${id}`, headers);
      const updated = alerts.filter((a) => a._id !== id);
      setAlerts(updated);
      calculateStats(updated);
      setNotification({ message: "Alert deleted", severity: "success" });
    } catch {
      setNotification({ message: "Delete failed", severity: "error" });
    }
  };

  const filteredAlerts =
    filterType === "all"
      ? alerts
      : alerts.filter((a) => a.type === filterType);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* -----------------------------------
    🔹 Render UI
  ------------------------------------ */
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                System Alerts
              </Typography>
              <Typography color="text.secondary">
                Company-wide announcements and urgent notifications
              </Typography>
            </Box>
            {canManage && (
              <Button
                variant="contained"
                startIcon={<FiPlus />}
                onClick={() => handleOpen()}
                sx={{ borderRadius: 3 }}
              >
                New Alert
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { key: "total", label: "Total Alerts", color: "primary", icon: <FiBell /> },
            { key: "info", label: "Information", color: "info", icon: <FiInfo /> },
            { key: "warning", label: "Warnings", color: "warning", icon: <FiAlertTriangle /> },
            { key: "error", label: "Errors", color: "error", icon: <FiAlertCircle /> },
          ].map((s) => (
            <Grid item xs={6} md={3} key={s.key}>
              <StatCard
                color={s.color}
                onClick={() => setFilterType(s.key === "total" ? "all" : s.key)}
                sx={{
                  border:
                    filterType === s.key ||
                    (filterType === "all" && s.key === "total")
                      ? `2px solid ${theme.palette[s.color].main}`
                      : "1px solid transparent",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {s.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {stats[s.key]}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette[s.color].main}15`,
                        color: theme.palette[s.color].main,
                      }}
                    >
                      {s.icon}
                    </Avatar>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Alerts List */}
        <Paper sx={{ borderRadius: 4, p: 3 }}>
          {filteredAlerts.length === 0 ? (
            <Box textAlign="center" py={6}>
              <FiBell size={48} />
              <Typography variant="h6">No Alerts Found</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredAlerts.map((alert) => (
                <AlertCard key={alert._id} type={alert.type}>
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TypeChip
                            label={alert.type}
                            type={alert.type}
                            size="small"
                          />
                        </Stack>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <FiClock size={12} /> {formatDate(alert.createdAt)}
                        </Typography>
                      </Box>
                      {canManage && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpen(alert)}
                              color="primary"
                              size="small"
                            >
                              <FiEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(alert._id)}
                              color="error"
                              size="small"
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </AlertCard>
              ))}
            </Stack>
          )}
        </Paper>

        {/* Dialog */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>{editId ? "Edit Alert" : "Create Alert"}</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                select
                label="Alert Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
              >
                {alertTypes.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <a.icon /> <Typography>{a.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Message"
                name="message"
                multiline
                rows={3}
                value={form.message}
                onChange={handleChange}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Card
            sx={{
              background:
                notification?.severity === "error"
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              color: "white",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {notification?.severity === "error" ? (
                <FiAlertCircle />
              ) : (
                <FiTrendingUp />
              )}
              <Typography>{notification?.message}</Typography>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default Alerts;
