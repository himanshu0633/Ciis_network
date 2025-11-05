import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  LinearProgress,
  Fade,
  Tooltip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  FiCalendar,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiList,
} from "react-icons/fi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "../../utils/axiosConfig";
import { styled } from "@mui/material/styles";

/* Styled Components */
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
  ...(status === "Approved" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === "Pending" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(status === "Rejected" && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const LeaveTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === "Casual" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === "Sick" && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
  ...(type === "Paid" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(type === "Unpaid" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(type === "Other" && {
    background: `${theme.palette.grey[500]}20`,
    color: theme.palette.grey[700],
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: "pointer",
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  ...(status === "Approved" && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === "Pending" && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(status === "Rejected" && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
}));

const MobileLeaveCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: "pointer",
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${
    status === "Approved"
      ? theme.palette.success.main
      : status === "Pending"
      ? theme.palette.warning.main
      : theme.palette.error.main
  }`,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
  },
}));

/* Helpers */
const formatPrettyDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeRole = (role) => {
  if (!role) return "UNKNOWN";

  const r = String(role).toLowerCase();

  if (r === "hr") return "HR";
  if (r === "admin") return "ADMIN";
  if (r === "manager") return "MANAGER";

  return "EMPLOYEE"; // fallback
};
const getHistoryLabel = (h) => {
  const role = normalizeRole(h.role); // ✅ FIX: use h.role
  const dateText = h.at ? ` on ${formatPrettyDate(h.at)}` : ""; // ✅ FIX: use h.at
  const remarksText = h.remarks ? ` — "${h.remarks}"` : "";

  if (h.action === "approved")
    return `✅ Approved by ${role}${dateText}${remarksText}`;

  if (h.action === "rejected")
    return `❌ Rejected by ${role}${dateText}${remarksText}`;

  if (h.action === "applied")
    return `📝 Applied by Employee${dateText}${remarksText}`;

  // default pending
  return `⏳ Pending approval${dateText}${remarksText}`;
};
const MyLeaves = () => {
  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [form, setForm] = useState({
    type: "Casual",
    startDate: null,
    endDate: null,
    reason: "",
  });

  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    title: "",
    items: [],
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/leaves/status");
      const list = res.data.leaves || [];
      setLeaves(list);
      calculateStats(list);
    } catch (err) {
      setNotification({
        message: err?.response?.data?.message || "Failed to fetch leaves",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leavesData) => {
    const approved = leavesData.filter((l) => l.status === "Approved").length;
    const pending = leavesData.filter((l) => l.status === "Pending").length;
    const rejected = leavesData.filter((l) => l.status === "Rejected").length;
    setStats({ total: leavesData.length, approved, pending, rejected });
  };

  const applyLeave = async (leaveData) => {
    try {
      const res = await axios.post("/leaves/apply", leaveData);
      setNotification({
        message: res.data.message || "Leave applied successfully",
        severity: "success",
      });
      fetchLeaves();
    } catch (err) {
      setNotification({
        message: err?.response?.data?.message || "Failed to apply leave",
        severity: "error",
      });
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleDateChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setNotification({ message: "Please fill in all required fields", severity: "error" });
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setNotification({ message: "End date cannot be before start date", severity: "error" });
      return;
    }
    const submitData = {
      ...form,
      startDate: form.startDate.toISOString().split("T")[0],
      endDate: form.endDate.toISOString().split("T")[0],
    };
    applyLeave(submitData);
    setForm({ type: "Casual", startDate: null, endDate: null, reason: "" });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <FiCheckCircle color={theme.palette.success.main} />;
      case "Pending":
        return <FiClock color={theme.palette.warning.main} />;
      case "Rejected":
        return <FiXCircle color={theme.palette.error.main} />;
      default:
        return <FiInfo color={theme.palette.text.secondary} />;
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case "Casual":
        return <FiUser color={theme.palette.info.main} />;
      case "Sick":
        return <FiAlertCircle color={theme.palette.secondary.main} />;
      case "Paid":
        return <FiCheckCircle color={theme.palette.success.main} />;
      case "Unpaid":
        return <FiClock color={theme.palette.warning.main} />;
      default:
        return <FiInfo color={theme.palette.grey[500]} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openHistoryModal = (leave) => {
    const items = Array.isArray(leave.history) ? leave.history : [];
    setHistoryDialog({
      open: true,
      title: `${leave.type} Leave — ${leave.user?.name || "Employee"}`,
      items,
    });
  };
  const closeHistoryModal = () => setHistoryDialog({ open: false, title: "", items: [] });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <LinearProgress sx={{ width: "100px" }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: theme.shape.borderRadius * 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: theme.shadows[4],
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Leave Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your leave requests and track their status
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <StatCard color="primary">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette.primary.main}20`,
                        color: theme.palette.primary.main,
                      }}
                    >
                      <FiCalendar />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Leaves
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.total}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={3}>
              <StatCard color="success">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette.success.main}20`,
                        color: theme.palette.success.main,
                      }}
                    >
                      <FiCheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Approved
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.approved}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={3}>
              <StatCard color="warning">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette.warning.main}20`,
                        color: theme.palette.warning.main,
                      }}
                    >
                      <FiClock />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.pending}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={3}>
              <StatCard color="error">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette.error.main}20`,
                        color: theme.palette.error.main,
                      }}
                    >
                      <FiXCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Rejected
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.rejected}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          <Paper
            sx={{
              borderRadius: theme.shape.borderRadius * 2,
              boxShadow: theme.shadows[2],
              overflow: "hidden",
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  py: 2,
                },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <FiCalendar />
                    <Typography>Leave Requests</Typography>
                    {stats.total > 0 && (
                      <Badge badgeContent={stats.total} color="primary" sx={{ ml: 1 }} />
                    )}
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FiPlus />
                    <Typography>Apply Leave</Typography>
                  </Stack>
                }
              />
            </Tabs>

            {/* Leave Requests Tab */}
            {tab === 0 && (
              <Box sx={{ p: 3 }}>
                {!isMobile ? (
                  /* Desktop D2: Latest + Latest Remarks + Full History + Status */
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Last Action</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Latest Remarks</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>History (Full)</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaves.length > 0 ? (
                          leaves.map((leave) => {
                            const history = Array.isArray(leave.history) ? leave.history : [];
                            const latest = history.length ? history[history.length - 1] : null;
                            const lastActionLabel = latest
                              ? getHistoryLabel(latest).split(" — ")[0] // action + by + date only
                              : "Awaiting approval";
                            const latestRemarks = latest?.remarks || "No remarks";

                            return (
                              <StyledTableRow key={leave._id} status={leave.status}>
                                <TableCell>
                                  <LeaveTypeChip
                                    label={leave.type}
                                    type={leave.type}
                                    size="small"
                                    icon={getLeaveTypeIcon(leave.type)}
                                  />
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    {formatDate(leave.startDate)}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    {formatDate(leave.endDate)}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Typography variant="body2" fontWeight={600} color="primary.main">
                                    {leave.days}
                                  </Typography>
                                </TableCell>

                                <TableCell>
                                  <Tooltip title={leave.reason}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: 220,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {leave.reason}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>

                                {/* Last Action (Latest only) */}
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={
                                      latest?.action === "approved"
                                        ? "success.main"
                                        : latest?.action === "rejected"
                                        ? "error.main"
                                        : "warning.main"
                                    }
                                  >
                                    {lastActionLabel}
                                  </Typography>
                                </TableCell>

                                {/* Latest Remarks */}
                                <TableCell>
                                  <Tooltip title={latestRemarks}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: 220,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      color="text.secondary"
                                    >
                                      {latestRemarks}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>

                                {/* Full History (S2 + HF3) + View History button */}
                                <TableCell>
                                  {history.length ? (
                                    <Stack spacing={0.5}>
                                      {history.map((h, i) => (
                                        <Typography
                                          key={i}
                                          variant="body2"
                                          fontWeight={600}
                                          sx={{
                                            color:
                                              h.action === "approved"
                                                ? "success.main"
                                                : h.action === "rejected"
                                                ? "error.main"
                                                : "warning.main",
                                          }}
                                        >
                                          {getHistoryLabel(h)}
                                        </Typography>
                                      ))}
                                      <Button
                                        size="small"
                                        startIcon={<FiList />}
                                        onClick={() => openHistoryModal(leave)}
                                        sx={{ textTransform: "none", alignSelf: "flex-start", mt: 0.5 }}
                                      >
                                        View History
                                      </Button>
                                    </Stack>
                                  ) : (
                                    <Typography variant="body2" color="warning.main">
                                      Awaiting approval
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                  <Tooltip title={lastActionLabel}>
                                    <span>
                                      <StatusChip
                                        label={leave.status}
                                        status={leave.status}
                                        icon={getStatusIcon(leave.status)}
                                      />
                                    </span>
                                  </Tooltip>
                                </TableCell>
                              </StyledTableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                              <Box sx={{ textAlign: "center" }}>
                                <FiCalendar size={48} color={theme.palette.text.secondary} />
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                                  No leave requests found
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  /* Mobile M1: Full History inline */
                  <Stack spacing={2}>
                    {leaves.length > 0 ? (
                      leaves.map((leave) => {
                        const history = Array.isArray(leave.history) ? leave.history : [];
                        const latest = history.length ? history[history.length - 1] : null;
                        return (
                          <MobileLeaveCard key={leave._id} status={leave.status}>
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                      {leave.type} Leave
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                    </Typography>
                                  </Box>
                                  <StatusChip label={leave.status} status={leave.status} size="small" />
                                </Stack>

                                <Typography variant="body2" fontWeight={600} color="primary.main">
                                  {leave.days} day{leave.days > 1 ? "s" : ""}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {leave.reason}
                                </Typography>

                                {/* Latest Action quick line */}
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{
                                    color:
                                      latest?.action === "approved"
                                        ? "success.main"
                                        : latest?.action === "rejected"
                                        ? "error.main"
                                        : "warning.main",
                                  }}
                                >
                                  {latest ? getHistoryLabel(latest).split(" — ")[0] : "Awaiting approval"}
                                </Typography>

                                {/* Full History (S2 + HF3) */}
                                <Stack spacing={0.5}>
                                  {history.length ? (
                                    history.map((h, i) => (
                                      <Typography
                                        key={i}
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                          color:
                                            h.action === "approved"
                                              ? "success.main"
                                              : h.action === "rejected"
                                              ? "error.main"
                                              : "warning.main",
                                        }}
                                      >
                                        {getHistoryLabel(h)}
                                      </Typography>
                                    ))
                                  ) : (
                                    <Typography variant="body2" color="warning.main">
                                      Awaiting approval
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            </CardContent>
                          </MobileLeaveCard>
                        );
                      })
                    ) : (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <FiCalendar size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                          No leave requests
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>
            )}

            {/* Apply Leave Tab */}
            {tab === 1 && (
              <Box sx={{ p: 3 }}>
                <Card sx={{ maxWidth: 600, mx: "auto" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      New Leave Application
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Fill in the details to apply for leave
                    </Typography>

                    <Stack spacing={3}>
                      <Select
                        fullWidth
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                      >
                        {["Casual", "Sick", "Paid", "Unpaid", "Other"].map((type) => (
                          <MenuItem key={type} value={type}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {getLeaveTypeIcon(type)}
                              <Typography>{type}</Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>

                      <DatePicker
                        label="Start Date"
                        value={form.startDate}
                        onChange={(date) => handleDateChange("startDate", date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />

                      <DatePicker
                        label="End Date"
                        value={form.endDate}
                        onChange={(date) => handleDateChange("endDate", date)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />

                      {form.startDate && form.endDate && (
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: `${theme.palette.primary.main}10`,
                            borderRadius: theme.shape.borderRadius,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            Total Days: {calculateDays(form.startDate, form.endDate)}
                          </Typography>
                        </Box>
                      )}

                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="reason"
                        label="Reason for Leave"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Please provide a detailed reason for your leave application..."
                        sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!form.startDate || !form.endDate || !form.reason.trim()}
                        sx={{
                          borderRadius: theme.shape.borderRadius * 2,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      >
                        Submit Leave Application
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Paper>

          {/* View History Modal */}
          <Dialog open={historyDialog.open} onClose={closeHistoryModal} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h6" fontWeight={700}>Action History</Typography>
              <Typography variant="body2" color="text.secondary">{historyDialog.title}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1}>
                {historyDialog.items.length ? (
                  historyDialog.items.map((h, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color:
                          h.action === "approved"
                            ? "success.main"
                            : h.action === "rejected"
                            ? "error.main"
                            : "warning.main",
                      }}
                    >
                      {getHistoryLabel(h)}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No history yet.</Typography>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={closeHistoryModal}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={!!notification?.message}
            autoHideDuration={5000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Card
              sx={{
                minWidth: 300,
                background:
                  notification?.severity === "error"
                    ? theme.palette.error.main
                    : theme.palette.success.main,
                color: "white",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {notification?.severity === "error" ? (
                    <FiXCircle size={20} />
                  ) : (
                    <FiCheckCircle size={20} />
                  )}
                  <Typography variant="body2" fontWeight={500}>
                    {notification?.message}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Snackbar>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default MyLeaves;
