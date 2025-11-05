import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, MenuItem,
  Select, FormControl, Snackbar, Chip, Stack, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, Badge, Card, CardContent, Grid,
  Fade, LinearProgress, useTheme, useMediaQuery, InputAdornment
} from '@mui/material';
import {
  FiTrash2, FiFilter, FiCheckCircle, FiXCircle,
  FiClock, FiCalendar, FiUsers, FiSearch, FiUser, FiAlertCircle, FiChevronRight, FiList
} from 'react-icons/fi';
import axios from '../../../utils/axiosConfig';
import { format, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

/* =========================
   Styled Components
   ========================= */
const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'Approved' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === 'Rejected' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
  ...(status === 'Pending' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
}));

const LeaveTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === 'Casual' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === 'Sick' && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
  ...(type === 'Paid' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(type === 'Unpaid' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(type === 'Other' && {
    background: `${theme.palette.grey[500]}20`,
    color: theme.palette.grey[700],
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  ...(status === 'Approved' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'Rejected' && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
  ...(status === 'Pending' && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
}));

const DurationBadge = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 16,
  fontSize: '0.75rem',
  fontWeight: 600,
  background: `${theme.palette.primary.main}20`,
  color: theme.palette.primary.dark,
}));

const MobileLeaveCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  borderLeft: `4px solid ${
    status === 'Approved'
      ? theme.palette.success.main
      : status === 'Rejected'
      ? theme.palette.error.main
      : theme.palette.warning.main
  }`,
}));

/* =========================
   Helpers
   ========================= */

// H-A: normalize role for display (ROLE only)
const normalizeRole = (role) => {
  const r = String(role || '').toLowerCase();
  if (r === 'hr') return 'HR';
  if (r === 'admin') return 'ADMIN';
  if (r === 'manager') return 'MANAGER';
  return 'EMPLOYEE';
};

// Build a safe history array (action, by, role, at, remarks)
const buildHistory = (leave) => {
  const arr = Array.isArray(leave.history) ? [...leave.history] : [];

  // If no history present (legacy), derive a best-effort single entry
  if (!arr.length) {
    const s = (leave.status || '').toLowerCase();
    if (s === 'approved' && leave.approvedBy) {
      arr.push({
        action: 'approved',
        by: leave.approvedBy,
        role: 'admin',       // fallback guess
        at: leave.updatedAt || leave.createdAt,
        remarks: leave.remarks || ''
      });
    } else if (s === 'rejected') {
      arr.push({
        action: 'rejected',
        by: leave.approvedBy || 'Employee',
        role: 'admin',
        at: leave.updatedAt || leave.createdAt,
        remarks: leave.remarks || ''
      });
    } else {
      arr.push({
        action: 'pending',
        by: 'Employee',
        role: 'employee',
        at: leave.createdAt,
        remarks: ''
      });
    }
  }

  // Normalize
  return arr.map(h => ({
    action: String(h.action || '').toLowerCase(), // applied/approved/rejected/pending
    by: h.by || 'Employee',
    role: String(h.role || 'employee').toLowerCase(),
    at: h.at || h.date || leave.updatedAt || leave.createdAt,
    remarks: h.remarks || ''
  }));
};

// Latest action (with role for H-A label)
const getLatest = (leave) => {
  const hist = buildHistory(leave);
  return hist[hist.length - 1];
};

// Format latest action line per H-A
const renderLatestText = (leave) => {
  const latest = getLatest(leave) || { action: 'pending', role: 'employee' };
  const roleLabel = normalizeRole(latest.role);
  if (latest.action === 'approved') return { text: `Approved by ${roleLabel}`, color: 'success.main' };
  if (latest.action === 'rejected') return { text: `Rejected by ${roleLabel}`, color: 'error.main' };
  if (latest.action === 'applied') return { text: `Applied by EMPLOYEE`, color: 'text.secondary' };
  return { text: 'Awaiting approval', color: 'warning.main' };
};

const EmppLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Status change + remarks (HR/Admin only)
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    leaveId: null,
    newStatus: null,
    remarks: '',
  });

  // History dialog
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    title: '',
    items: [],
  });

  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchLeaves();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const role = parsed.role?.trim().toLowerCase() || '';
      setCurrentUserRole(role);
      setCurrentUserName(parsed.name || parsed.fullName || '');
    }
  }, [filterDate, statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let url = '/leaves/all';
      const params = new URLSearchParams();
      if (filterDate) params.append('date', format(filterDate, 'yyyy-MM-dd'));
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url);
      setLeaves(res.data.leaves || []);
      calculateStats(res.data.leaves || []);
    } catch (error) {
      console.error('Error fetching leaves', error);
      showNotification('Failed to fetch leave records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leavesData) => {
    const pending = leavesData.filter(leave => leave.status === 'Pending').length;
    const approved = leavesData.filter(leave => leave.status === 'Approved').length;
    const rejected = leavesData.filter(leave => leave.status === 'Rejected').length;
    setStats({ total: leavesData.length, pending, approved, rejected });
  };

  const showNotification = (message, severity) => setNotification({ message, severity });

  // Only HR/Admin can modify
  const canModify = currentUserRole === 'hr' || currentUserRole === 'admin';

  const openStatusDialog = (leaveId, newStatus) => {
    if (!canModify) return;
    setStatusDialog({ open: true, leaveId, newStatus, remarks: '' });
  };
  const closeStatusDialog = () => setStatusDialog({ open: false, leaveId: null, newStatus: null, remarks: '' });

  const confirmStatusChange = async () => {
    const { leaveId, newStatus, remarks } = statusDialog;
    if (!leaveId || !newStatus) return;
    try {
      setActionLoading(true);
      await axios.patch(`/leaves/status/${leaveId}`, {
        status: newStatus,
        remarks: remarks?.trim() || ''
      });
      showNotification(`Leave status updated to ${newStatus}`, 'success');
      fetchLeaves();
      closeStatusDialog();
    } catch (err) {
      console.error('Status update failed:', err);
      showNotification('Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLeave = async () => {
    try {
      setActionLoading(true);
      await axios.delete(`/leaves/${deleteConfirm}`);
      showNotification('Leave deleted successfully', 'success');
      fetchLeaves();
    } catch (err) {
      console.error('Failed to delete leave:', err);
      showNotification('Failed to delete leave', 'error');
    } finally {
      setActionLoading(false);
      setDeleteConfirm(null);
    }
  };

  const clearFilters = () => {
    setFilterDate(null);
    setStatusFilter('All');
    setSearchTerm('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <FiCheckCircle color={theme.palette.success.main} />;
      case 'Rejected': return <FiXCircle color={theme.palette.error.main} />;
      case 'Pending': return <FiClock color={theme.palette.warning.main} />;
      default: return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'Casual': return <FiUser color={theme.palette.info.main} />;
      case 'Sick': return <FiAlertCircle color={theme.palette.secondary.main} />;
      case 'Paid': return <FiCheckCircle color={theme.palette.success.main} />;
      case 'Unpaid': return <FiClock color={theme.palette.warning.main} />;
      default: return <FiCalendar color={theme.palette.grey[500]} />;
    }
  };

  const filteredLeaves = leaves.filter(leave =>
    leave.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const openHistoryDialog = (leave) => {
    const items = buildHistory(leave);
    setHistoryDialog({
      open: true,
      title: `${leave.user?.name || 'Employee'} — ${leave.type} Leave`,
      items,
    });
  };
  const closeHistoryDialog = () => setHistoryDialog({ open: false, title: '', items: [] });

  if (loading && leaves.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header */}
          <Paper sx={{
            p: 3, mb: 3, borderRadius: theme.shape.borderRadius * 2,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            boxShadow: theme.shadows[4]
          }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight={800} gutterBottom>Leave Management</Typography>
                  <Typography variant="body1" color="text.secondary">Review and manage employee leave requests</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Badge badgeContent={(filterDate || statusFilter !== 'All' || searchTerm) ? 1 : 0} color="primary">
                    <Button variant="outlined" startIcon={<FiFilter />} onClick={clearFilters}
                      sx={{ borderRadius: theme.shape.borderRadius * 2, textTransform: 'none', fontWeight: 600 }}>
                      Clear Filters
                    </Button>
                  </Badge>
                </Stack>
              </Stack>

              {/* Filters */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <DatePicker
                  label="Filter by Date"
                  value={filterDate}
                  onChange={(v) => setFilterDate(v)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { borderRadius: theme.shape.borderRadius * 2, minWidth: 200 },
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FiCalendar color={theme.palette.text.secondary} />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: theme.shape.borderRadius * 2 }}>
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  placeholder="Search leaves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 2 } }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <StatCard color="primary">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.primary.main}20`, color: theme.palette.primary.main }}><FiUsers /></Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Leaves</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard color="warning">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.warning.main}20`, color: theme.palette.warning.main }}><FiClock /></Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.pending}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard color="success">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.success.main}20`, color: theme.palette.success.main }}><FiCheckCircle /></Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Approved</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.approved}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard color="error">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.error.main}20`, color: theme.palette.error.main }}><FiXCircle /></Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Rejected</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.rejected}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Results header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              {filteredLeaves.length} Leave Request{filteredLeaves.length !== 1 ? 's' : ''} Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusFilter !== 'All' && `Filtered by: ${statusFilter}`}
              {searchTerm && ` • Searching: "${searchTerm}"`}
            </Typography>
          </Stack>

          {/* Table */}
          <Paper sx={{ borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main + '10' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Leave Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Latest Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>History</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ p: 4 }}><CircularProgress /></TableCell>
                    </TableRow>
                  ) : filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => {
                      const latest = renderLatestText(leave);
                      return (
                        <StyledTableRow key={leave._id} status={leave.status} hover>
                          {/* Employee */}
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={leave.user?.avatar} alt={leave.user?.name} sx={{ width: 48, height: 48 }}>
                                {getInitials(leave.user?.name)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>{leave.user?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{leave.user?.email}</Typography>
                                <Chip label={leave.user?.role} size="small" sx={{ mt: 0.5 }} />
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Leave Details */}
                          <TableCell>
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {getLeaveTypeIcon(leave.type)}
                                <LeaveTypeChip label={leave.type} type={leave.type} size="small" />
                              </Stack>
                              <Typography variant="body2" sx={{
                                color: 'text.secondary',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {leave.reason}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Duration */}
                          <TableCell>
                            <Stack spacing={1} alignItems="flex-start">
                              <Typography variant="body2" fontWeight={500}>{format(parseISO(leave.startDate), 'MMM dd, yyyy')}</Typography>
                              <Typography variant="body2" color="text.secondary">to</Typography>
                              <Typography variant="body2" fontWeight={500}>{format(parseISO(leave.endDate), 'MMM dd, yyyy')}</Typography>
                              <DurationBadge>{leave.days} day{leave.days > 1 ? 's' : ''}</DurationBadge>
                            </Stack>
                          </TableCell>

                          {/* Latest Action (H-A) */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} sx={{ color: latest.color }}>
                              {latest.text}
                            </Typography>
                          </TableCell>

                          {/* View History */}
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<FiList />}
                              onClick={() => openHistoryDialog(leave)}
                              sx={{ textTransform: 'none', borderRadius: 2 }}
                              variant="outlined"
                            >
                              View History
                            </Button>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Tooltip title={(leave.status || '').toLowerCase() === 'pending' ? 'Awaiting approval' : latest.text}>
                              <span>
                                <StatusChip status={leave.status} icon={getStatusIcon(leave.status)} label={leave.status} />
                              </span>
                            </Tooltip>
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <FormControl size="small" sx={{ minWidth: 140 }}>
                                <Select
                                  value={leave.status}
                                  onChange={(e) => openStatusDialog(leave._id, e.target.value)}
                                  disabled={actionLoading || !canModify}
                                  sx={{ borderRadius: theme.shape.borderRadius }}
                                >
                                  <MenuItem value="Pending">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <FiClock color={theme.palette.warning.main} />
                                      <Typography>Pending</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="Approved">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <FiCheckCircle color={theme.palette.success.main} />
                                      <Typography>Approved</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="Rejected">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <FiXCircle color={theme.palette.error.main} />
                                      <Typography>Rejected</Typography>
                                    </Stack>
                                  </MenuItem>
                                </Select>
                              </FormControl>

                              {currentUserRole && currentUserRole !== 'hr' && (
                                <Tooltip title="Delete Leave">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteConfirm(leave._id)}
                                    disabled={actionLoading}
                                    sx={{ color: theme.palette.error.main, '&:hover': { bgcolor: `${theme.palette.error.main}10` } }}
                                  >
                                    <FiTrash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </StyledTableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <FiCalendar size={48} color={theme.palette.text.secondary} />
                          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                            No Leave Requests Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== 'All' ? 'Try adjusting your search criteria' : 'No leave records found for the selected filters'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Mobile cards */}
          {isMobile && (
            <Box sx={{ mt: 3 }}>
              <Stack spacing={2}>
                {leaves.length > 0 ? (
                  leaves.map((leave) => {
                    const latest = renderLatestText(leave);
                    return (
                      <MobileLeaveCard key={leave._id} status={leave.status}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>{leave.type} Leave</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {format(parseISO(leave.startDate), 'MMM dd, yyyy')} - {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                                </Typography>
                              </Box>
                              <Tooltip title={latest.text}>
                                <span>
                                  <StatusChip label={leave.status} status={leave.status} size="small" />
                                </span>
                              </Tooltip>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {leave.days} day{leave.days > 1 ? 's' : ''}
                              </Typography>
                              <FiChevronRight color={theme.palette.text.secondary} />
                            </Stack>

                            <Typography variant="body2" sx={{
                              color: 'text.secondary',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {leave.reason}
                            </Typography>

                            <Typography variant="body2" fontWeight={600} sx={{ color: latest.color }}>
                              {latest.text}
                            </Typography>

                            <Button
                              size="small"
                              onClick={() => openHistoryDialog(leave)}
                              sx={{ textTransform: 'none', alignSelf: 'flex-start', px: 0 }}
                              startIcon={<FiList />}
                            >
                              View History
                            </Button>
                          </Stack>
                        </CardContent>
                      </MobileLeaveCard>
                    );
                  })
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FiCalendar size={48} color={theme.palette.text.secondary} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                      No leave requests
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Delete dialog */}
          <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
            <DialogTitle><Typography variant="h6" fontWeight={700}>Confirm Delete</Typography></DialogTitle>
            <DialogContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <FiAlertCircle size={24} color={theme.palette.warning.main} />
                <Typography variant="body1">Are you sure you want to delete this leave request?</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDeleteConfirm(null)} sx={{ borderRadius: theme.shape.borderRadius * 2 }}>Cancel</Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteLeave}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={20} /> : <FiTrash2 />}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Delete Leave
              </Button>
            </DialogActions>
          </Dialog>

          {/* Status dialog */}
          <Dialog open={statusDialog.open} onClose={closeStatusDialog} maxWidth="sm" fullWidth>
            <DialogTitle><Typography variant="h6" fontWeight={700}>Update Status to {statusDialog.newStatus}</Typography></DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You can optionally add remarks. Your role will be recorded automatically.
              </Typography>
              <TextField
                label="Remarks (optional)"
                value={statusDialog.remarks}
                onChange={(e) => setStatusDialog(prev => ({ ...prev, remarks: e.target.value }))}
                fullWidth
                multiline
                minRows={3}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={closeStatusDialog} sx={{ borderRadius: theme.shape.borderRadius * 2 }}>Cancel</Button>
              <Button
                variant="contained"
                onClick={confirmStatusChange}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={20} /> : <FiCheckCircle />}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Update Status
              </Button>
            </DialogActions>
          </Dialog>

          {/* History dialog (H-A) */}
          <Dialog open={historyDialog.open} onClose={closeHistoryDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h6" fontWeight={700}>Action History</Typography>
              <Typography variant="body2" color="text.secondary">{historyDialog.title}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1}>
                {historyDialog.items.length > 0 ? (
                  historyDialog.items.map((h, idx) => {
                    const roleLabel = normalizeRole(h.role);
                    const color =
                      h.action === 'approved' ? 'success.main' :
                      h.action === 'rejected' ? 'error.main' : 'warning.main';
                    const icon = h.action === 'approved' ? '✅' : h.action === 'rejected' ? '❌' : h.action === 'applied' ? '📝' : '⏳';
                    return (
                      <Typography key={idx} variant="body2" fontWeight={600} sx={{ color }}>
                        {icon} {h.action.charAt(0).toUpperCase() + h.action.slice(1)} by {roleLabel}
                        {h.remarks ? ` — "${h.remarks}"` : ''}
                      </Typography>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">No history yet.</Typography>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={closeHistoryDialog}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={!!notification}
            autoHideDuration={5000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Card sx={{
              minWidth: 300,
              background: notification?.severity === 'error' ? theme.palette.error.main : theme.palette.success.main,
              color: 'white'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {notification?.severity === 'error' ? <FiXCircle size={20} /> : <FiCheckCircle size={20} />}
                  <Typography variant="body2" fontWeight={500}>{notification?.message}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Snackbar>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default EmppLeaves;
