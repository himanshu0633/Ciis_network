import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Snackbar, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Grid, Stack, Avatar, LinearProgress,
  Fade, Tooltip, useTheme, useMediaQuery, Badge
} from "@mui/material";
import {
  FiCalendar, FiPlus, FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiInfo, FiUser, FiList
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
  borderLeft: `4px solid ${theme.palette[color].main}`,
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  cursor: "pointer",
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
  "&:hover": { backgroundColor: theme.palette.action.hover },
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

const getHistoryLabel = (h) => {
  if (!h) return "";
  const dateText = h.at ? ` on ${new Date(h.at).toLocaleString()}` : "";
  const remarksText = h.remarks ? ` — "${h.remarks}"` : "";
  if (h.action === "approved") return `✅ Approved by ${h.role}${dateText}${remarksText}`;
  if (h.action === "rejected") return `❌ Rejected by ${h.role}${dateText}${remarksText}`;
  if (h.action === "applied") return `📝 Applied${dateText}${remarksText}`;
  return `⏳ Pending${dateText}${remarksText}`;
};

/* Main Component */
const MyLeaves = () => {
  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
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
  const [historyDialog, setHistoryDialog] = useState({ open: false, title: "", items: [] });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/leaves/status");
      const list = res.data.leaves || [];
      setLeaves(list);
      calculateStats(list);
    } catch {
      setNotification({ message: "Failed to fetch leaves", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (data) => {
    const approved = data.filter((l) => l.status === "Approved").length;
    const pending = data.filter((l) => l.status === "Pending").length;
    const rejected = data.filter((l) => l.status === "Rejected").length;
    setStats({ total: data.length, approved, pending, rejected });
  };

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  /* Part 3 — Filters, Apply Leave logic, Loading UI */

  // Filtered list based on statusFilter
  const filteredLeaves = leaves.filter((l) =>
    statusFilter === "ALL" ? true : l.status === statusFilter
  );

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Helper to calculate number of days (inclusive)
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    // Reset time portion to avoid DST issues
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diff = e - s;
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Apply leave (validate, post, refresh)
  const applyLeave = async () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setNotification({ message: "Please fill all fields", severity: "error" });
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setNotification({ message: "End date cannot be before start date", severity: "error" });
      return;
    }

    const payload = {
      type: form.type,
      startDate: form.startDate.toISOString().split("T")[0],
      endDate: form.endDate.toISOString().split("T")[0],
      reason: form.reason,
      days: calculateDays(form.startDate, form.endDate),
    };

    try {
      setLoading(true);
      await axios.post("/leaves/apply", payload);
      setNotification({ message: "Leave applied successfully", severity: "success" });
      // refresh
      await fetchLeaves();
      // reset
      setForm({ type: "Casual", startDate: null, endDate: null, reason: "" });
      // switch back to requests tab
      setTab(0);
    } catch (err) {
      setNotification({
        message: err?.response?.data?.message || "Failed to apply leave",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // History modal helpers
  const openHistoryModal = (leave) => {
    const items = Array.isArray(leave.history) ? leave.history : [];
    setHistoryDialog({
      open: true,
      title: `${leave.type} Leave — ${leave.user?.name || "Employee"}`,
      items,
    });
  };

  const closeHistoryModal = () => {
    setHistoryDialog({ open: false, title: "", items: [] });
  };

  // Loading UI early return
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LinearProgress sx={{ width: "150px" }} />
      </Box>
    );
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: theme.shape.borderRadius * 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: theme.shadows[4],
            }}
          >
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Leave Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track all your leave requests
            </Typography>
          </Paper>

          {/* Active Filter Chip */}
          {statusFilter !== "ALL" && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Filter: ${statusFilter}`}
                color="primary"
                onDelete={() => setStatusFilter("ALL")}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Leaves */}
            <Grid item xs={6} md={3}>
              <StatCard
                color="primary"
                onClick={() => setStatusFilter("ALL")}
                sx={{
                  border:
                    statusFilter === "ALL"
                      ? `2px solid ${theme.palette.primary.main}`
                      : "none",
                }}
              >
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
                        Total
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.total}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Approved Leaves */}
            <Grid item xs={6} md={3}>
              <StatCard
                color="success"
                onClick={() => setStatusFilter("Approved")}
                sx={{
                  border:
                    statusFilter === "Approved"
                      ? `2px solid ${theme.palette.success.main}`
                      : "none",
                }}
              >
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

            {/* Pending Leaves */}
            <Grid item xs={6} md={3}>
              <StatCard
                color="warning"
                onClick={() => setStatusFilter("Pending")}
                sx={{
                  border:
                    statusFilter === "Pending"
                      ? `2px solid ${theme.palette.warning.main}`
                      : "none",
                }}
              >
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

            {/* Rejected Leaves */}
            <Grid item xs={6} md={3}>
              <StatCard
                color="error"
                onClick={() => setStatusFilter("Rejected")}
                sx={{
                  border:
                    statusFilter === "Rejected"
                      ? `2px solid ${theme.palette.error.main}`
                      : "none",
                }}
              >
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
          {/* Tabs Section */}
          <Paper
            sx={{
              borderRadius: theme.shape.borderRadius * 2,
              overflow: "hidden",
              boxShadow: theme.shadows[3],
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
                  <Stack direction="row" alignItems="center" spacing={1}>
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
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>History</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLeaves.length > 0 ? (
                          filteredLeaves.map((leave) => (
                            <StyledTableRow key={leave._id} status={leave.status}>
                              <TableCell>
                                <LeaveTypeChip label={leave.type} type={leave.type} size="small" />
                              </TableCell>
                              <TableCell>{formatDate(leave.startDate)}</TableCell>
                              <TableCell>{formatDate(leave.endDate)}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600} color="primary.main">
                                  {leave.days}
                                </Typography>
                              </TableCell>
                              <TableCell>{leave.reason}</TableCell>
                              <TableCell>
                                <StatusChip
                                  label={leave.status}
                                  status={leave.status}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  startIcon={<FiList />}
                                  onClick={() => openHistoryModal(leave)}
                                  sx={{ textTransform: "none" }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </StyledTableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                  /* Mobile View Cards */
                  <Stack spacing={2}>
                    {filteredLeaves.length > 0 ? (
                      filteredLeaves.map((leave) => (
                        <MobileLeaveCard key={leave._id} status={leave.status}>
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="h6" fontWeight={600}>
                                  {leave.type} Leave
                                </Typography>
                                <StatusChip label={leave.status} status={leave.status} size="small" />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
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
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => openHistoryModal(leave)}
                                startIcon={<FiList />}
                                sx={{ alignSelf: "flex-start", textTransform: "none" }}
                              >
                                View History
                              </Button>
                            </Stack>
                          </CardContent>
                        </MobileLeaveCard>
                      ))
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
                      Apply for New Leave
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Fill in the details to submit a leave request.
                    </Typography>

                    <Stack spacing={3}>
                      {/* Leave Type */}
                      <Select
                        fullWidth
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                      >
                        {["Casual", "Sick", "Paid", "Unpaid", "Other"].map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>

                      {/* Start Date */}
                      <DatePicker
                        label="Start Date"
                        value={form.startDate}
                        onChange={(date) => handleDateChange("startDate", date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />

                      {/* End Date */}
                      <DatePicker
                        label="End Date"
                        value={form.endDate}
                        onChange={(date) => handleDateChange("endDate", date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />

                      {/* Day Count */}
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

                      {/* Reason */}
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="reason"
                        label="Reason for Leave"
                        value={form.reason}
                        onChange={handleChange}
                        placeholder="Enter the reason for your leave..."
                      />

                      {/* Submit Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={applyLeave}
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
          {/* View History Dialog */}
          <Dialog
            open={historyDialog.open}
            onClose={closeHistoryModal}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight={700}>
                Action History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {historyDialog.title}
              </Typography>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={1}>
                {historyDialog.items.length ? (
                  historyDialog.items.map((h, i) => (
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
                  <Typography variant="body2" color="text.secondary">
                    No history yet.
                  </Typography>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={closeHistoryModal}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar Notification */}
          <Snackbar
            open={!!notification?.message}
            autoHideDuration={4000}
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
