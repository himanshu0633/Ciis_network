import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Avatar,
  Stack, Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider, Fade, LinearProgress,
  useTheme, useMediaQuery, Paper, Tooltip, Badge, Dialog,
  DialogTitle, DialogContent, IconButton
} from "@mui/material";
import {
  FiUsers, FiUser, FiCalendar, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiFilter, FiRefreshCw,
  FiTrendingUp, FiList, FiArrowRight, FiX
} from "react-icons/fi";
import { styled } from "@mui/material/styles";

// ---------------- Styled Components ---------------- //
const UserCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: "pointer",
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  background: selected
    ? `${theme.palette.primary.main}08`
    : theme.palette.background.paper,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
    borderColor: theme.palette.primary.main,
  },
}));

const TaskCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.primary.main,
  },
}));

const StatCard = styled(Card)(({ theme, color = "primary" }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === "approved" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(status === "rejected" && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
  ...(status === "pending" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(status === "in progress" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(status === "complete" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === "intern" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === "technical" && {
    background: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.dark,
  }),
  ...(type === "non-technical" && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
  ...(type === "sales" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
}));

// Employee type options
const EMPLOYEE_TYPES = [
  { value: "all", label: "All Employees", icon: FiUsers },
  { value: "intern", label: "Intern", icon: FiUser },
  { value: "technical", label: "Technical", icon: FiTrendingUp },
  { value: "non-technical", label: "Non-Technical", icon: FiUsers },
  { value: "sales", label: "Sales", icon: FiUser },
];

const TaskDetails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const theme = useTheme();

  // ✅ Role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const role = (
          parsedUser?.role ||
          parsedUser?.user?.role ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();
        setCurrentUserRole(role);
      } catch {
        setCurrentUserRole("");
      }
    }
  }, []);

  const canManage = useMemo(
    () => ["admin", "manager", "hr"].includes(currentUserRole),
    [currentUserRole]
  );

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get("/task/all-users");
        setUsers(res?.data?.users || []);
        setStats({ totalUsers: res?.data?.users?.length || 0 });
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            "Error fetching users. Please try again."
        );
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Fetch self-assigned tasks for selected user
  const fetchSelfAssignedTasks = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/task/user-self-assigned/${userId}`);
      setTasks(res?.data?.groupedTasks || {});
      const u = users.find((x) => x._id === userId) || null;
      setSelectedUser(u);
      setSelectedUserId(userId);
      setOpenDialog(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Error fetching tasks.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (selectedEmployeeType === "all") return users;
    return users.filter(
      (u) =>
        u.employeeType &&
        u.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
    );
  }, [users, selectedEmployeeType]);

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "approved":
      case "complete":
        return <FiCheckCircle color={theme.palette.success.main} />;
      case "rejected":
        return <FiXCircle color={theme.palette.error.main} />;
      case "pending":
        return <FiClock color={theme.palette.warning.main} />;
      case "in progress":
        return <FiAlertCircle color={theme.palette.info.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTaskCount = () =>
    Object.values(tasks).reduce((a, b) => a + b.length, 0);

  if (!canManage)
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6" fontWeight={700}>
            Access Denied
          </Typography>
          <Typography>
            You don’t have the required permissions to view this page.
          </Typography>
        </Alert>
      </Box>
    );

  // ---------------- JSX START ---------------- //
  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Self-Assigned Tasks Overview
              </Typography>
              <Typography color="text.secondary">
                Monitor and manage self-assigned tasks across your team
              </Typography>
            </Box>
            {/* <Tooltip title="Refresh Data">
              <Button
                variant="outlined"
                startIcon={<FiRefreshCw />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </Tooltip> */}
          </Stack>
        </Paper>

        {/* Filter */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Filter Employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select employee type to filter the list
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Employee Type</InputLabel>
              <Select
                value={selectedEmployeeType}
                label="Employee Type"
                onChange={(e) => setSelectedEmployeeType(e.target.value)}
              >
                {EMPLOYEE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {React.createElement(type.icon, {
                        color: theme.palette.primary.main,
                      })}
                      <Typography>{type.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Users */}
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {usersLoading ? (
            <LinearProgress />
          ) : filteredUsers.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              No users found.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user._id}>
                  <UserCard
                    selected={selectedUserId === user._id}
                    onClick={() => fetchSelfAssignedTasks(user._id)}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={user.avatar}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {user.name}
                            </Typography>
                            <Typography color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={user.role?.toUpperCase()}
                            color="primary"
                            size="small"
                          />
                          <EmployeeTypeChip
                            label={user.employeeType?.toUpperCase()}
                            type={user.employeeType}
                            size="small"
                          />
                        </Stack>
                        <Button
                          fullWidth
                          variant={
                            selectedUserId === user._id
                              ? "contained"
                              : "outlined"
                          }
                          endIcon={<FiArrowRight />}
                        >
                          View Tasks
                        </Button>
                      </Stack>
                    </CardContent>
                  </UserCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* ---------- Dialog Popup ---------- */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight={700}>
              {selectedUser?.name}'s Tasks
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <FiX />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {loading ? (
              <Box textAlign="center" py={3}>
                <CircularProgress />
              </Box>
            ) : Object.keys(tasks).length === 0 ? (
              <Box textAlign="center" py={3} color="text.secondary">
                <FiList size={48} />
                <Typography>No self-assigned tasks found.</Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {Object.keys(tasks).map((date) => (
                  <Box key={date}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <FiCalendar color={theme.palette.primary.main} />
                      <Typography variant="h6">{formatDate(date)}</Typography>
                    </Stack>
                    {tasks[date].map((task) => (
                      <TaskCard key={task._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight={600}>
                            {task.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          {Array.isArray(task.statusInfo) &&
                            task.statusInfo.map((s, i) => (
                              <Stack
                                key={i}
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{
                                  bgcolor: theme.palette.action.hover,
                                  p: 1,
                                  borderRadius: 1,
                                }}
                              >
                                <Avatar sx={{ width: 30, height: 30 }}>
                                  {getInitials(s.name)}
                                </Avatar>
                                <Typography variant="body2" flex={1}>
                                  {s.name} ({s.role})
                                </Typography>
                                <StatusChip
                                  label={s.status}
                                  status={s.status}
                                  icon={getStatusIcon(s.status)}
                                />
                              </Stack>
                            ))}
                        </CardContent>
                      </TaskCard>
                    ))}
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default TaskDetails;
