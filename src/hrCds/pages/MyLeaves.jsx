import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Snackbar, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Grid, Stack, Avatar, LinearProgress,
  Fade, Tooltip, useTheme, useMediaQuery, Badge, InputAdornment, IconButton, alpha
} from "@mui/material";
import {
  FiCalendar, FiPlus, FiClock, FiCheckCircle, FiXCircle,
  FiAlertCircle, FiInfo, FiUser, FiList, FiSearch, FiFilter,
  FiDownload, FiRefreshCw, FiX
} from "react-icons/fi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "../../utils/axiosConfig";
import { styled } from "@mui/material/styles";

/* Enhanced Styled Components with Glass Morphism */
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.95)} 0%, 
    ${alpha(theme.palette.common.white, 0.85)} 100%)`,
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 15px 35px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
    transform: 'translateY(-5px)',
  },
}));

const StatCard = styled(GlassCard)(({ theme, color = "primary", active }) => ({
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  background: active 
    ? `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.95)} 0%, ${alpha(theme.palette.common.white, 0.85)} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: active ? `linear-gradient(90deg, 
      ${theme.palette[color].main} 0%, 
      ${theme.palette[color].light} 100%)` : 'transparent',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  fontWeight: 700,
  borderRadius: '16px',
  padding: '12px 24px',
  textTransform: 'none',
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.6)}`,
    '&::before': {
      left: '100%',
    },
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.75rem',
  borderRadius: '12px',
  padding: '4px 12px',
  height: '32px',
  ...(status === "Approved" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.3)} 100%)`,
    color: theme.palette.success.dark,
    border: `2px solid ${alpha(theme.palette.success.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.2)}`,
  }),
  ...(status === "Pending" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.3)} 100%)`,
    color: theme.palette.warning.dark,
    border: `2px solid ${alpha(theme.palette.warning.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.warning.main, 0.2)}`,
  }),
  ...(status === "Rejected" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, ${alpha(theme.palette.error.main, 0.3)} 100%)`,
    color: theme.palette.error.dark,
    border: `2px solid ${alpha(theme.palette.error.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.2)}`,
  }),
}));

const LeaveTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  borderRadius: '10px',
  ...(type === "Casual" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)} 0%, ${alpha(theme.palette.info.main, 0.3)} 100%)`,
    color: theme.palette.info.dark,
    border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
  }),
  ...(type === "Sick" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.3)} 100%)`,
    color: theme.palette.secondary.dark,
    border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
  }),
  ...(type === "Paid" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.3)} 100%)`,
    color: theme.palette.success.dark,
    border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(type === "Unpaid" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.3)} 100%)`,
    color: theme.palette.warning.dark,
    border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(type === "Other" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.2)} 0%, ${alpha(theme.palette.grey[500], 0.3)} 100%)`,
    color: theme.palette.grey[700],
    border: `2px solid ${alpha(theme.palette.grey[500], 0.3)}`,
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: "pointer",
  transition: 'all 0.3s ease',
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.9)} 0%, 
    ${alpha(theme.palette.common.white, 0.8)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '70%',
    borderRadius: '0 8px 8px 0',
    background: 
      status === "Approved" ? `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)` :
      status === "Pending" ? `linear-gradient(180deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)` :
      `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(8px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const MobileLeaveCard = styled(GlassCard)(({ theme, status }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '5px',
    height: '80%',
    borderRadius: '0 8px 8px 0',
    background: 
      status === "Approved" ? `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)` :
      status === "Pending" ? `linear-gradient(180deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)` :
      `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.common.white, 0.9)} 0%, 
      ${alpha(theme.palette.common.white, 0.8)} 100%)`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderWidth: 2,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const ResponsiveTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '20px',
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.95)} 0%, 
    ${alpha(theme.palette.common.white, 0.85)} 100%)`,
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.05)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    fontWeight: 800,
    color: theme.palette.primary.dark,
    fontSize: '1rem',
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
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchLeaves = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await axios.get("/leaves/status");
      const list = res.data.leaves || [];
      setLeaves(list);
      calculateStats(list);
      if (showRefresh) setNotification({ message: "Leaves data refreshed!", severity: "success" });
    } catch {
      setNotification({ message: "Failed to fetch leaves", severity: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  // Filtered list based on statusFilter and search
  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = statusFilter === "ALL" ? true : l.status === statusFilter;
    const matchesSearch = 
      l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
      await fetchLeaves();
      setForm({ type: "Casual", startDate: null, endDate: null, reason: "" });
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
  if (loading && !refreshing) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <LinearProgress 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              mb: 3,
              background: alpha('#fff', 0.2),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, #fff 0%, ${alpha('#fff', 0.7)} 100%)`,
                borderRadius: 4,
              }
            }} 
          />
          <Typography 
            variant={isSmallMobile ? "h6" : "h5"} 
            color="white"
            fontWeight={700}
            sx={{ opacity: 0.9 }}
          >
            Loading your leave records...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={800}>
        <Box sx={{ 
          px: { xs: 2, sm: 3, md: 4 }, 
          py: { xs: 3, sm: 4 },
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          minHeight: '100vh'
        }}>
          {/* Enhanced Header */}
          <GlassCard sx={{ 
            p: { xs: 3, sm: 4 }, 
            mb: { xs: 3, sm: 4 },
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, 0.98)} 0%, 
              ${alpha(theme.palette.common.white, 0.92)} 100%)`,
          }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 3, sm: 4 }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography 
                  variant={isSmallMobile ? "h3" : isMobile ? "h2" : "h1"}
                  fontWeight={900}
                  sx={{
                    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    mb: 1.5,
                    lineHeight: 1.1
                  }}
                >
                  Leave Management
                </Typography>
                <Typography 
                  variant={isSmallMobile ? "body1" : "h6"}
                  color="text.secondary" 
                  sx={{ opacity: 0.8, fontWeight: 500 }}
                >
                  Manage and track all your leave requests
                </Typography>
              </Box>

              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems="center"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <SearchField
                  placeholder="Search leaves..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color={theme.palette.primary.main} size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    width: { xs: '100%', sm: 280 },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 500
                    }
                  }}
                />

                <Tooltip title="Refresh data">
                  <IconButton 
                    onClick={() => fetchLeaves(true)}
                    disabled={refreshing}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                      borderRadius: '14px',
                      p: 1.5,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                      }
                    }}
                  >
                    <FiRefreshCw 
                      className={refreshing ? 'spin' : ''} 
                      size={20}
                      color={theme.palette.primary.main}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Active Filters Display */}
            {(statusFilter !== "ALL" || searchTerm) && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="body1" fontWeight={700} color="primary.main" sx={{ mr: 2 }}>
                    Active filters:
                  </Typography>
                  {statusFilter !== "ALL" && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      color="primary"
                      size="medium"
                      onDelete={() => setStatusFilter("ALL")}
                      sx={{ 
                        mb: 1,
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    />
                  )}
                  {searchTerm && (
                    <Chip
                      label={`Search: "${searchTerm}"`}
                      color="secondary"
                      size="medium"
                      onDelete={() => setSearchTerm("")}
                      sx={{ 
                        mb: 1,
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                        border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </GlassCard>

       <Grid 
  container 
  spacing={{ xs: 1.5, sm: 2, md: 3 }} 
  sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}
>
  {[
    { key: 'total', label: 'Total Leaves', value: stats.total, icon: FiCalendar, color: 'primary', filter: 'ALL' },
    { key: 'approved', label: 'Approved', value: stats.approved, icon: FiCheckCircle, color: 'success', filter: 'Approved' },
    { key: 'pending', label: 'Pending', value: stats.pending, icon: FiClock, color: 'warning', filter: 'Pending' },
    { key: 'rejected', label: 'Rejected', value: stats.rejected, icon: FiXCircle, color: 'error', filter: 'Rejected' }
  ].map((stat) => (
    <Grid item xs={6} sm={6} md={3} key={stat.key}>
      <StatCard 
        color={stat.color}
        active={statusFilter === stat.filter}
        onClick={() => setStatusFilter(
          statusFilter === stat.filter ? 'ALL' : stat.filter
        )}
      >
        <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={{ xs: 1.6, sm: 2 }}
          >
            <Avatar
              sx={{
                bgcolor: `${theme.palette[stat.color].main}15`,
                color: theme.palette[stat.color].main,
                borderRadius: '14px',
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                boxShadow: `0 6px 18px ${alpha(theme.palette[stat.color].main, 0.25)}`
              }}
            >
              <stat.icon size={isSmallMobile ? 18 : 20} />
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.75,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: 600,
                  fontSize: { xs: "0.70rem", sm: "0.78rem" }
                }}
              >
                {stat.label}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ lineHeight: 1, fontSize: { xs: "1.4rem", sm: "1.7rem" } }}
              >
                {stat.value}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </StatCard>
    </Grid>
  ))}
</Grid>

          {/* Enhanced Tabs Section */}
          <GlassCard>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 2.5,
                  minHeight: '60px',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FiCalendar size={20} />
                    <Typography fontWeight={600}>Leave Requests</Typography>
                    {stats.total > 0 && (
                      <Badge 
                        badgeContent={stats.total} 
                        color="primary" 
                        sx={{ 
                          '& .MuiBadge-badge': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            fontWeight: 700,
                          }
                        }} 
                      />
                    )}
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FiPlus size={20} />
                    <Typography fontWeight={600}>Apply Leave</Typography>
                  </Stack>
                }
              />
            </Tabs>

            {/* Leave Requests Tab */}
            {tab === 0 && (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Results Count */}
                <Typography 
                  variant="h6" 
                  color="primary.main"
                  fontWeight={700}
                  sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}
                >
                  Showing {filteredLeaves.length} of {leaves.length} records
                </Typography>

                {!isMobile ? (
                  <ResponsiveTableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}></TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>Days</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5 }}>History</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLeaves.length > 0 ? (
                          filteredLeaves.map((leave) => (
                            <StyledTableRow key={leave._id} status={leave.status}>
                              <TableCell>
                                <LeaveTypeChip label={leave.type} type={leave.type} size="medium" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight={600}>
                                  {formatDate(leave.startDate)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight={600}>
                                  {formatDate(leave.endDate)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight={800} color="primary.main">
                                  {leave.days}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  variant="body1" 
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {leave.reason}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <StatusChip
                                  label={leave.status}
                                  status={leave.status}
                                  size="medium"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  startIcon={<FiList size={16} />}
                                  onClick={() => openHistoryModal(leave)}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                                    borderRadius: '10px',
                                    '&:hover': {
                                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                                    }
                                  }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </StyledTableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <FiCalendar size={60} color={theme.palette.primary.main} style={{ opacity: 0.5 }} />
                                <Typography variant="h5" color="primary.main" fontWeight={800} sx={{ mt: 2, opacity: 0.7 }}>
                                  No leave requests found
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, opacity: 0.5, fontWeight: 600 }}>
                                  Try adjusting your filters or search terms
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ResponsiveTableContainer>
                ) : (
                  /* Mobile View Cards */
                  <Stack spacing={2}>
                    {filteredLeaves.length > 0 ? (
                      filteredLeaves.map((leave) => (
                        <MobileLeaveCard key={leave._id} status={leave.status}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="h6" fontWeight={800}>
                                  {leave.type} Leave
                                </Typography>
                                <StatusChip label={leave.status} status={leave.status} size="small" />
                              </Stack>
                              <Typography variant="body1" fontWeight={600} color="primary.main">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {leave.reason}
                              </Typography>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1" fontWeight={700} color="primary.main">
                                  {leave.days} days
                                </Typography>
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => openHistoryModal(leave)}
                                  startIcon={<FiList />}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: 'primary.main'
                                  }}
                                >
                                  History
                                </Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </MobileLeaveCard>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <FiCalendar size={60} color={theme.palette.primary.main} style={{ opacity: 0.5 }} />
                        <Typography variant="h5" color="primary.main" fontWeight={800} sx={{ mt: 2, opacity: 0.7 }}>
                          No leave requests
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, opacity: 0.5, fontWeight: 600 }}>
                          Adjust your search or filters
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>
            )}

            {/* Apply Leave Tab */}
            {tab === 1 && (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <GlassCard sx={{ maxWidth: 600, mx: 'auto' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight={800} gutterBottom color="primary.main">
                      Apply for New Leave
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                      Fill in the details to submit a leave request
                    </Typography>

                    <Stack spacing={3}>
                      {/* Leave Type */}
                      <Select
                        fullWidth
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        sx={{ 
                          borderRadius: '16px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                          },
                        }}
                      >
                        {["Casual", "Sick", "Paid", "Unpaid", "Other"].map((type) => (
                          <MenuItem key={type} value={type}>
                            <Typography fontWeight={600}>{type}</Typography>
                          </MenuItem>
                        ))}
                      </Select>

                      {/* Start Date */}
                      <DatePicker
                        label="Start Date"
                        value={form.startDate}
                        onChange={(date) => handleDateChange("startDate", date)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                '& fieldset': {
                                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                },
                              },
                            }}
                          />
                        )}
                      />

                      {/* End Date */}
                      <DatePicker
                        label="End Date"
                        value={form.endDate}
                        onChange={(date) => handleDateChange("endDate", date)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                '& fieldset': {
                                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                },
                              },
                            }}
                          />
                        )}
                      />

                      {/* Day Count */}
                      {form.startDate && form.endDate && (
                        <Box
                          sx={{
                            p: 2.5,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                            borderRadius: '12px',
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        >
                          <Typography variant="h6" fontWeight={800} color="primary.main">
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            '& fieldset': {
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          },
                        }}
                      />

                      {/* Submit Button */}
                      <GradientButton
                        fullWidth
                        onClick={applyLeave}
                        sx={{
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                        }}
                      >
                        Submit Leave Application
                      </GradientButton>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Box>
            )}
          </GlassCard>

          {/* Enhanced View History Dialog */}
          <Dialog
            open={historyDialog.open}
            onClose={closeHistoryModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.common.white, 0.98)} 0%, 
                  ${alpha(theme.palette.common.white, 0.92)} 100%)`,
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight={900} color="primary.main">
                Action History
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={600}>
                {historyDialog.title}
              </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 2 }}>
              <Stack spacing={2}>
                {historyDialog.items.length ? (
                  historyDialog.items.map((h, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, 
                          ${alpha(
                            h.action === "approved" ? theme.palette.success.main :
                            h.action === "rejected" ? theme.palette.error.main :
                            theme.palette.warning.main, 0.1
                          )} 0%, 
                          ${alpha(
                            h.action === "approved" ? theme.palette.success.main :
                            h.action === "rejected" ? theme.palette.error.main :
                            theme.palette.warning.main, 0.05
                          )} 100%)`,
                        border: `2px solid ${alpha(
                          h.action === "approved" ? theme.palette.success.main :
                          h.action === "rejected" ? theme.palette.error.main :
                          theme.palette.warning.main, 0.2
                        )}`,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={700}
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
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FiInfo size={40} color={theme.palette.text.secondary} style={{ opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                      No history available
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <GradientButton onClick={closeHistoryModal}>
                Close
              </GradientButton>
            </DialogActions>
          </Dialog>

          {/* Enhanced Snackbar Notification */}
          <Snackbar
            open={!!notification?.message}
            autoHideDuration={4000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <GlassCard
              sx={{
                minWidth: 300,
                background: notification?.severity === "error"
                  ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: "white",
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {notification?.severity === "error" ? (
                    <FiXCircle size={24} />
                  ) : (
                    <FiCheckCircle size={24} />
                  )}
                  <Typography variant="body1" fontWeight={700}>
                    {notification?.message}
                  </Typography>
                </Stack>
              </CardContent>
            </GlassCard>
          </Snackbar>

          {/* Custom CSS for spinning animation */}
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .spin {
              animation: spin 1s linear infinite;
            }
          `}</style>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default MyLeaves;