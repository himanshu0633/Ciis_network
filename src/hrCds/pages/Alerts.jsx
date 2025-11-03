import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import {
  Box, Typography, Paper, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, IconButton, Snackbar,
  MenuItem, Stack, Card, CardContent, Grid, Avatar, Fade,
  Tooltip, Chip, useTheme, FormControl, Select, InputLabel,
  Checkbox, ListItemText
} from "@mui/material";
import {
  FiAlertCircle, FiAlertTriangle, FiInfo, FiPlus,
  FiEdit, FiTrash2, FiBell, FiClock,
} from "react-icons/fi";
import { styled } from "@mui/material/styles";

const AlertCard = styled(Card)(({ theme, type }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(["all"]),
  borderLeft: `6px solid ${
    type === "info"
      ? theme.palette.info.main
      : type === "warning"
      ? theme.palette.warning.main
      : theme.palette.error.main
  }`,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
  },
}));

const TypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  ...(type === "info" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(type === "warning" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(type === "error" && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const alertTypes = [
  { value: "info", label: "Information", icon: FiInfo },
  { value: "warning", label: "Warning", icon: FiAlertTriangle },
  { value: "error", label: "Error", icon: FiAlertCircle },
];

const defaultForm = { type: "info", message: "", assignedUsers: [], assignedGroups: [] };

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, info: 0, warning: 0, error: 0 });
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");

  const canManage = currentUserRole === "hr" || currentUserRole === "manager";
  const theme = useTheme();

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const role = (parsedUser?.role || parsedUser?.user?.role || "").toLowerCase();
            setCurrentUserRole(role);
          } catch (e) {
            console.error("Failed to parse user:", e);
          }
        }

        // ✅ Updated Safe API Calls
        const [usersRes, groupsRes, alertsRes] = await Promise.all([
          axios.get("/task/assignable-users", authHeaders()),
          axios.get("/groups", authHeaders()),
          axios.get("/alerts", authHeaders())
        ]);

        // ✅ Safe Array Extraction
        const fetchedUsers = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data?.users || usersRes.data?.data || [];

        const fetchedGroups = Array.isArray(groupsRes.data)
          ? groupsRes.data
          : groupsRes.data?.groups || groupsRes.data?.data || [];

        const fetchedAlerts = Array.isArray(alertsRes.data)
          ? alertsRes.data
          : alertsRes.data?.alerts || alertsRes.data?.data || [];

        setUsers(fetchedUsers);
        setGroups(fetchedGroups);
        setAlerts(fetchedAlerts);
        calculateStats(fetchedAlerts);
      } catch (err) {
        console.error(err);
        setNotification({ open: true, message: "Failed to load alerts", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateStats = (alertsData) => {
    const info = alertsData.filter((a) => a.type === "info").length;
    const warning = alertsData.filter((a) => a.type === "warning").length;
    const error = alertsData.filter((a) => a.type === "error").length;
    setStats({ total: alertsData.length, info, warning, error });
  };

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
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      setNotification({ open: true, message: "Please enter a message", severity: "error" });
      return;
    }
    if (!canManage) {
      setNotification({ open: true, message: "Not authorized", severity: "error" });
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(`/alerts/${editId}`, form, authHeaders());
        setAlerts((prev) => prev.map((a) => (a._id === editId ? res.data.alert : a)));
        setNotification({ open: true, message: "Alert updated!", severity: "success" });
      } else {
        const res = await axios.post("/alerts", form, authHeaders());
        setAlerts((prev) => [res.data.alert, ...prev]);
        setNotification({ open: true, message: "Alert created!", severity: "success" });
      }
      setOpen(false);
      calculateStats(alerts);
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Something went wrong",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) {
      setNotification({ open: true, message: "Not authorized", severity: "error" });
      return;
    }

    try {
      await axios.delete(`/alerts/${id}`, authHeaders());
      const newAlerts = alerts.filter((a) => a._id !== id);
      setAlerts(newAlerts);
      calculateStats(newAlerts);
      setNotification({ open: true, message: "Alert deleted", severity: "success" });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Something went wrong",
        severity: "error",
      });
    }
  };

  const getAlertIcon = (type) => {
    const alertType = alertTypes.find((t) => t.value === type);
    const IconComponent = alertType ? alertType.icon : FiInfo;
    return <IconComponent size={20} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Typography>Loading alerts...</Typography>
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: theme.shape.borderRadius * 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="space-between">
            <Box>
              <Typography variant="h4" fontWeight={800}>
                System Alerts
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Important notifications and announcements
              </Typography>
            </Box>
            {canManage && (
              <Button variant="contained" startIcon={<FiPlus />} onClick={() => handleOpen()} sx={{ borderRadius: 6 }}>
                New Alert
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Total Alerts", count: stats.total, icon: <FiBell />, color: "primary" },
            { label: "Information", count: stats.info, icon: <FiInfo />, color: "info" },
            { label: "Warnings", count: stats.warning, icon: <FiAlertTriangle />, color: "warning" },
            { label: "Errors", count: stats.error, icon: <FiAlertCircle />, color: "error" },
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.label}>
              <Card sx={{ borderLeft: `4px solid ${theme.palette[item.color].main}` }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette[item.color].main}20`, color: theme.palette[item.color].main }}>
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {item.count}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Alerts List */}
        <Paper sx={{ borderRadius: 4, p: 3 }}>
          {alerts.length === 0 ? (
            <Box textAlign="center" py={6}>
              <FiBell size={48} />
              <Typography variant="h6">No Alerts</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {alerts.map((alert) => (
                <AlertCard key={alert._id} type={alert.type}>
                  <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          {getAlertIcon(alert.type)}
                          <TypeChip label={alert.type} type={alert.type} size="small" />
                        </Stack>
                        <Typography variant="body1" fontWeight={500}>
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <FiClock size={12} /> {formatDate(alert.createdAt)}
                        </Typography>
                      </Box>
                      {canManage && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpen(alert)} color="primary" size="small">
                              <FiEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(alert._id)} color="error" size="small">
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
          <DialogTitle>{editId ? "Edit Alert" : "New Alert"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              <TextField select name="type" label="Alert Type" value={form.type} onChange={handleChange}>
                {alertTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {React.createElement(type.icon)} {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="message"
                label="Alert Message"
                value={form.message}
                onChange={handleChange}
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Assign Users</InputLabel>
                <Select multiple name="assignedUsers" value={form.assignedUsers} onChange={handleChange}>
                  {Array.isArray(users) &&
                    users.map((user) => (
                      <MenuItem key={user._id || user.id} value={user._id || user.id}>
                        <Checkbox checked={form.assignedUsers.includes(user._id || user.id)} />
                        <ListItemText primary={user.name || user.fullName || user.email} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign Groups</InputLabel>
                <Select multiple name="assignedGroups" value={form.assignedGroups} onChange={handleChange}>
                  {Array.isArray(groups) &&
                    groups.map((group) => (
                      <MenuItem key={group._id || group.id} value={group._id || group.id}>
                        <Checkbox checked={form.assignedGroups.includes(group._id || group.id)} />
                        <ListItemText primary={group.name || group.title} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Card
            sx={{
              background:
                notification.severity === "error"
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              color: "white",
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {notification.severity === "error" ? <FiAlertCircle /> : <FiInfo />}
              <Typography>{notification.message}</Typography>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default Alerts;
