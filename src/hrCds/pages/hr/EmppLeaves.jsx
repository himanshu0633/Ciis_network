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
  FiClock, FiCalendar, FiUsers, FiSearch, FiUser,
  FiAlertCircle, FiChevronRight, FiList
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
const StatCard = styled(Card)(({ theme, active, color = 'primary' }) => ({
  background: active
    ? `linear-gradient(135deg, ${theme.palette[color].main}15, ${theme.palette[color].main}10)`
    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  borderLeft: active
    ? `4px solid ${theme.palette[color].main}`
    : `4px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
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
   Helper Functions
   ========================= */
const normalizeRole = (role) => {
  const r = String(role || '').toLowerCase();
  if (r === 'hr') return 'HR';
  if (r === 'admin') return 'ADMIN';
  if (r === 'manager') return 'MANAGER';
  return 'EMPLOYEE';
};

const buildHistory = (leave) => {
  const arr = Array.isArray(leave.history) ? [...leave.history] : [];
  if (!arr.length) {
    arr.push({
      action: leave.status || 'Pending',
      by: leave.approvedBy || 'Employee',
      role: 'admin',
      at: leave.updatedAt || leave.createdAt,
      remarks: leave.remarks || '',
    });
  }
  return arr.map((h) => ({
    action: String(h.action || '').toLowerCase(),
    by: h.by || 'Employee',
    role: String(h.role || 'employee').toLowerCase(),
    at: h.at || leave.updatedAt || leave.createdAt,
    remarks: h.remarks || '',
  }));
};

const getLatest = (leave) => {
  const hist = buildHistory(leave);
  return hist[hist.length - 1];
};

const renderLatestText = (leave) => {
  const latest = getLatest(leave) || { action: 'pending', role: 'employee' };
  const roleLabel = normalizeRole(latest.role);
  if (latest.action === 'approved')
    return { text: `Approved by ${roleLabel}`, color: 'success.main' };
  if (latest.action === 'rejected')
    return { text: `Rejected by ${roleLabel}`, color: 'error.main' };
  return { text: 'Awaiting approval', color: 'warning.main' };
};

/* =========================
   MAIN COMPONENT
   ========================= */
const EmppLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStat, setSelectedStat] = useState('All');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusDialog, setStatusDialog] = useState({
    open: false, leaveId: null, newStatus: null, remarks: '',
  });
  const [historyDialog, setHistoryDialog] = useState({
    open: false, title: '', items: [],
  });
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /* Fetch Leaves */
  useEffect(() => {
    fetchLeaves();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserRole(user.role?.toLowerCase() || '');
  }, [filterDate, statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let url = '/leaves/all';
      const params = new URLSearchParams();
      if (filterDate) params.append('date', format(filterDate, 'yyyy-MM-dd'));
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (params.toString()) url += `?${params}`;
      const res = await axios.get(url);
      const data = res.data.leaves || [];
      setLeaves(data);
      const pending = data.filter(l => l.status === 'Pending').length;
      const approved = data.filter(l => l.status === 'Approved').length;
      const rejected = data.filter(l => l.status === 'Rejected').length;
      setStats({ total: data.length, pending, approved, rejected });
    } catch {
      showNotification('Failed to fetch leave records', 'error');
    } finally { setLoading(false); }
  };

  const showNotification = (msg, type) => setNotification({ message: msg, severity: type });

  const handleStatFilter = (type) => {
    setSelectedStat(prev => (prev === type ? 'All' : type));
    setStatusFilter(type === 'All' ? 'All' : type);
  };

  const canModify = ['admin', 'hr'].includes(currentUserRole);

  const filteredLeaves = leaves.filter(l => {
    const matchSearch = l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStat === 'All' || l.status === selectedStat;
    return matchSearch && matchStatus;
  });

  const clearFilters = () => { setFilterDate(null); setSearchTerm(''); setSelectedStat('All'); setStatusFilter('All'); };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <FiCheckCircle color={theme.palette.success.main} />;
      case 'Rejected': return <FiXCircle color={theme.palette.error.main} />;
      case 'Pending': return <FiClock color={theme.palette.warning.main} />;
      default: return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'Casual': return <FiUser color={theme.palette.info.main} />;
      case 'Sick': return <FiAlertCircle color={theme.palette.secondary.main} />;
      case 'Paid': return <FiCheckCircle color={theme.palette.success.main} />;
      case 'Unpaid': return <FiClock color={theme.palette.warning.main} />;
      default: return <FiCalendar color={theme.palette.grey[500]} />;
    }
  };

  const openStatusDialog = (id, newStatus) => { if (canModify) setStatusDialog({ open: true, leaveId: id, newStatus, remarks: '' }); };
  const closeStatusDialog = () => setStatusDialog({ open: false, leaveId: null, newStatus: null, remarks: '' });

  const confirmStatusChange = async () => {
    const { leaveId, newStatus, remarks } = statusDialog;
    try {
      setActionLoading(true);
      await axios.patch(`/leaves/status/${leaveId}`, { status: newStatus, remarks });
      showNotification(`Leave ${newStatus.toLowerCase()} successfully`, 'success');
      closeStatusDialog();
      fetchLeaves();
    } catch {
      showNotification('Failed to update status', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDeleteLeave = async () => {
    try {
      setActionLoading(true);
      await axios.delete(`/leaves/${deleteConfirm}`);
      showNotification('Leave deleted successfully', 'success');
      fetchLeaves();
    } catch {
      showNotification('Failed to delete leave', 'error');
    } finally {
      setActionLoading(false);
      setDeleteConfirm(null);
    }
  };

  const openHistoryDialog = (leave) => setHistoryDialog({
    open: true,
    title: `${leave.user?.name || 'Employee'} — ${leave.type} Leave`,
    items: buildHistory(leave),
  });
  const closeHistoryDialog = () => setHistoryDialog({ open: false, title: '', items: [] });

  /* =========================
     UI Rendering
     ========================= */
  if (loading && !leaves.length)
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><LinearProgress sx={{ width: '100px' }} /></Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>

          {/* HEADER + FILTERS */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[4] }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={800}>Leave Management</Typography>
                  <Typography variant="body1" color="text.secondary">Review and manage employee leave requests</Typography>
                </Box>
                <Badge badgeContent={(filterDate || statusFilter !== 'All' || searchTerm) ? 1 : 0} color="primary">
                  <Button variant="outlined" startIcon={<FiFilter />} onClick={clearFilters} sx={{ borderRadius: 3 }}>Clear Filters</Button>
                </Badge>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <DatePicker
                  label="Filter by Date"
                  value={filterDate}
                  onChange={setFilterDate}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { borderRadius: 3, minWidth: 200 },
                      InputProps: {
                        startAdornment: <InputAdornment position="start"><FiCalendar /></InputAdornment>,
                      },
                    },
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 3 }}>
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
                    startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment>,
                  }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* CLICKABLE STAT CARDS */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Total Leaves', count: stats.total, color: 'primary', type: 'All', icon: <FiUsers /> },
              { label: 'Pending', count: stats.pending, color: 'warning', type: 'Pending', icon: <FiClock /> },
              { label: 'Approved', count: stats.approved, color: 'success', type: 'Approved', icon: <FiCheckCircle /> },
              { label: 'Rejected', count: stats.rejected, color: 'error', type: 'Rejected', icon: <FiXCircle /> },
            ].map((item) => (
              <Grid item xs={6} md={3} key={item.type}>
                <StatCard color={item.color} active={selectedStat === item.type} onClick={() => handleStatFilter(item.type)}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: `${theme.palette[item.color].main}20`, color: theme.palette[item.color].main }}>{item.icon}</Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        <Typography variant="h4" fontWeight={700}>{item.count}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          {/* TABLE SECTION */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Leave Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>History</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => {
                      const latest = renderLatestText(leave);
                      return (
                        <StyledTableRow key={leave._id} status={leave.status}>
                          <TableCell>
                            <Stack direction="row" spacing={2}>
                              <Avatar>{getInitials(leave.user?.name)}</Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>{leave.user?.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{leave.user?.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {getLeaveTypeIcon(leave.type)}
                                <LeaveTypeChip label={leave.type} type={leave.type} size="small" />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">{leave.reason}</Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" fontWeight={600}>{format(parseISO(leave.startDate), 'MMM dd')}</Typography>
                              <Typography variant="body2" color="text.secondary">to</Typography>
                              <Typography variant="body2" fontWeight={600}>{format(parseISO(leave.endDate), 'MMM dd')}</Typography>
                              <DurationBadge>{leave.days} day{leave.days > 1 ? 's' : ''}</DurationBadge>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <StatusChip status={leave.status} label={leave.status} />
                          </TableCell>

                          <TableCell>
                            <Button size="small" startIcon={<FiList />} variant="outlined" onClick={() => openHistoryDialog(leave)}>View</Button>
                          </TableCell>

                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <FormControl size="small" sx={{ minWidth: 140 }}>
                                <Select
                                  value={leave.status}
                                  onChange={(e) => openStatusDialog(leave._id, e.target.value)}
                                  disabled={!canModify}
                                >
                                  <MenuItem value="Pending">Pending</MenuItem>
                                  <MenuItem value="Approved">Approved</MenuItem>
                                  <MenuItem value="Rejected">Rejected</MenuItem>
                                </Select>
                              </FormControl>
                              <Tooltip title="Delete Leave">
                                <IconButton color="error" onClick={() => setDeleteConfirm(leave._id)}>
                                  <FiTrash2 />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </StyledTableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <FiCalendar size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">No Leave Requests Found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Fade>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight={700}>Confirm Delete</Typography></DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this leave request?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteLeave}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* STATUS DIALOG */}
      <Dialog open={statusDialog.open} onClose={closeStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status to {statusDialog.newStatus}</DialogTitle>
        <DialogContent>
          <TextField label="Remarks (optional)" fullWidth multiline rows={3} value={statusDialog.remarks}
            onChange={(e) => setStatusDialog(prev => ({ ...prev, remarks: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog}>Cancel</Button>
          <Button variant="contained" onClick={confirmStatusChange}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* HISTORY DIALOG */}
      <Dialog open={historyDialog.open} onClose={closeHistoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Action History</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            {historyDialog.items.length > 0 ? historyDialog.items.map((h, i) => (
              <Typography key={i} variant="body2">
                {h.action.toUpperCase()} by {normalizeRole(h.role)} {h.remarks && `– "${h.remarks}"`}
              </Typography>
            )) : <Typography variant="body2">No history available.</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={closeHistoryDialog}>Close</Button></DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <AlertWrapper severity={notification?.severity}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {notification?.severity === 'error' ? <FiXCircle /> : <FiCheckCircle />}
            <Typography variant="body2">{notification?.message}</Typography>
          </Stack>
        </AlertWrapper>
      </Snackbar>
    </LocalizationProvider>
  );
};

const AlertWrapper = styled(Box)(({ theme, severity }) => ({
  background: severity === 'error' ? theme.palette.error.main : theme.palette.success.main,
  color: 'white',
  borderRadius: 12,
  padding: '8px 16px',
}));

export default EmppLeaves;
