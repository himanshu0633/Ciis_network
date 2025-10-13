import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, MenuItem,
  Select, FormControl, Snackbar, Chip, Stack, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, Badge, Card, CardContent, Grid,
  Fade, LinearProgress, useTheme, useMediaQuery, Divider,
  InputAdornment
} from '@mui/material';
import {
  FiTrash2, FiFilter, FiX, FiCheckCircle, FiXCircle,
  FiClock, FiEdit, FiCalendar, FiUsers, FiTrendingUp,
  FiAlertCircle, FiRefreshCw, FiSearch, FiUser, FiDownload
} from 'react-icons/fi';
import axios from '../../../utils/axiosConfig';
import { format, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// Enhanced Styled Components
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

const EmppLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editDialog, setEditDialog] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchLeaves();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const role = parsedUser.role?.trim().toLowerCase() || '';
      setCurrentUserRole(role);
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
      console.error("Error fetching leaves", error);
      showNotification('Failed to fetch leave records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leavesData) => {
    const pending = leavesData.filter(leave => leave.status === 'Pending').length;
    const approved = leavesData.filter(leave => leave.status === 'Approved').length;
    const rejected = leavesData.filter(leave => leave.status === 'Rejected').length;
    
    setStats({
      total: leavesData.length,
      pending,
      approved,
      rejected
    });
  };

  const showNotification = (message, severity) => {
    setNotification({ message, severity });
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      setActionLoading(true);
      await axios.patch(`/leaves/status/${leaveId}`, { status: newStatus });
      showNotification(`Leave status updated to ${newStatus}`, 'success');
      fetchLeaves();
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
      console.error("Failed to delete leave:", err);
      showNotification('Failed to delete leave', 'error');
    } finally {
      setActionLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleUpdateLeave = async (leaveId, updatedData) => {
    try {
      setActionLoading(true);
      await axios.put(`/leaves/${leaveId}`, updatedData);
      showNotification('Leave updated successfully', 'success');
      fetchLeaves();
      setEditDialog(null);
    } catch (err) {
      console.error("Failed to update leave:", err);
      showNotification('Failed to update leave', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterDate(null);
    setStatusFilter('All');
    setSearchTerm('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'Rejected':
        return <FiXCircle color={theme.palette.error.main} />;
      case 'Pending':
        return <FiClock color={theme.palette.warning.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'Casual':
        return <FiUser color={theme.palette.info.main} />;
      case 'Sick':
        return <FiAlertCircle color={theme.palette.secondary.main} />;
      case 'Paid':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'Unpaid':
        return <FiClock color={theme.palette.warning.main} />;
      default:
        return <FiCalendar color={theme.palette.grey[500]} />;
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
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && leaves.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header Section */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: theme.shape.borderRadius * 2,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            boxShadow: theme.shadows[4]
          }}>
            <Stack spacing={3}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={3} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Box>
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    Leave Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Review and manage employee leave requests
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Tooltip title="Refresh">
                    <IconButton 
                      onClick={fetchLeaves}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }}
                    >
                      <FiRefreshCw />
                    </IconButton>
                  </Tooltip>
                  <Badge 
                    badgeContent={
                      (filterDate || statusFilter !== 'All' || searchTerm) ? 1 : 0
                    } 
                    color="primary"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FiFilter />}
                      onClick={clearFilters}
                      sx={{
                        borderRadius: theme.shape.borderRadius * 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Badge>
                </Stack>
              </Stack>

              {/* Filters Section */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <DatePicker
                  label="Filter by Date"
                  value={filterDate}
                  onChange={(newValue) => setFilterDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      sx: { 
                        borderRadius: theme.shape.borderRadius * 2,
                        minWidth: 200
                      },
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FiCalendar color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                      }
                    } 
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                  >
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
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <StatCard color="primary">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.primary.main}20`, 
                      color: theme.palette.primary.main 
                    }}>
                      <FiUsers />
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
              <StatCard color="warning">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.warning.main}20`, 
                      color: theme.palette.warning.main 
                    }}>
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
              <StatCard color="success">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.success.main}20`, 
                      color: theme.palette.success.main 
                    }}>
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
              <StatCard color="error">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.error.main}20`, 
                      color: theme.palette.error.main 
                    }}>
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

          {/* Results Header */}
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            <Typography variant="h6" fontWeight={700}>
              {filteredLeaves.length} Leave Request{filteredLeaves.length !== 1 ? 's' : ''} Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusFilter !== 'All' && `Filtered by: ${statusFilter}`}
              {searchTerm && ` • Searching: "${searchTerm}"`}
            </Typography>
          </Stack>

          {/* Leaves Table */}
          <Paper sx={{ 
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[2],
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main + '10' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Leave Details</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ p: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave, index) => (
                      <StyledTableRow key={leave._id} status={leave.status} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={leave.user?.avatar}
                              alt={leave.user?.name}
                              sx={{ width: 48, height: 48 }}
                            >
                              {getInitials(leave.user?.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {leave.user?.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {leave.user?.email}
                              </Typography>
                              <Chip
                                label={leave.user?.role}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {getLeaveTypeIcon(leave.type)}
                              <LeaveTypeChip
                                label={leave.type}
                                type={leave.type}
                                size="small"
                              />
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
                        <TableCell>
                          <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={500}>
                              {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              to
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                            </Typography>
                            <DurationBadge>
                              {leave.days} day{leave.days > 1 ? 's' : ''}
                            </DurationBadge>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            status={leave.status}
                            icon={getStatusIcon(leave.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={leave.status}
                                onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                                disabled={actionLoading}
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
                                  sx={{
                                    color: theme.palette.error.main,
                                    '&:hover': { bgcolor: `${theme.palette.error.main}10` }
                                  }}
                                >
                                  <FiTrash2 size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <FiCalendar size={48} color={theme.palette.text.secondary} />
                          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                            No Leave Requests Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || statusFilter !== 'All' 
                              ? 'Try adjusting your search criteria' 
                              : 'No leave records found for the selected filters'
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Enhanced Delete Confirmation Dialog */}
          <Dialog 
            open={!!deleteConfirm} 
            onClose={() => setDeleteConfirm(null)} 
            maxWidth="xs" 
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight={700}>
                Confirm Delete
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <FiAlertCircle size={24} color={theme.palette.warning.main} />
                <Typography variant="body1">
                  Are you sure you want to delete this leave request?
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setDeleteConfirm(null)}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Cancel
              </Button>
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

          {/* Enhanced Snackbar */}
          <Snackbar
            open={!!notification}
            autoHideDuration={5000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Card sx={{ 
              minWidth: 300,
              background: notification?.severity === 'error' 
                ? theme.palette.error.main 
                : theme.palette.success.main,
              color: 'white'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {notification?.severity === 'error' ? 
                    <FiXCircle size={20} /> : 
                    <FiCheckCircle size={20} />
                  }
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

export default EmppLeaves;