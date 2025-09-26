import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, MenuItem,
  Select, FormControl, Snackbar, Chip, Stack, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, Badge
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from '../../../utils/axiosConfig';
import { format, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const StatusChip = ({ status }) => {
  const getStatusProps = () => {
    switch (status) {
      case 'Approved':
        return { icon: <ApprovedIcon fontSize="small" />, color: 'success' };
      case 'Rejected':
        return { icon: <RejectedIcon fontSize="small" />, color: 'error' };
      default:
        return { icon: <PendingIcon fontSize="small" />, color: 'warning' };
    }
  };

  const { icon, color } = getStatusProps();

  return (
    <Chip
      icon={icon}
      label={status}
      color={color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

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
  const [showDeleteBtn, setShowDeleteButton] = useState(false);


  useEffect(() => {
  fetchLeaves();

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    const role = parsedUser.role?.trim().toLowerCase() || '';
    setCurrentUserRole(role);
    console.log('Parsed role:', role); // ✅ Final debug
  } else {
    console.log('User not found in localStorage');
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
    } catch (error) {
      console.error("Error fetching leaves", error);
      showNotification('Failed to fetch leave records', 'error');
    } finally {
      setLoading(false);
    }
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
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Leave Management
          </Typography>
          <Badge badgeContent={(filterDate || statusFilter !== 'All') ? 1 : 0} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={clearFilters}
            >
              Filters
            </Button>
          </Badge>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <DatePicker
            label="Filter by Date"
            value={filterDate}
            onChange={(newValue) => setFilterDate(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <CalendarIcon color="action" sx={{ mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: filterDate && (
                    <IconButton size="small" onClick={() => setFilterDate(null)}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            )}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>#</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Details</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ p: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : leaves.length > 0 ? (
                  leaves.map((leave, index) => (
                    <TableRow key={leave._id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            src={leave.user?.avatar}
                            alt={leave.user?.name}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography variant="subtitle2">{leave.user?.name}</Typography>
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
                        <Typography variant="subtitle2">{leave.type} Leave</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {leave.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">
                            {format(parseISO(leave.startDate), 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            to
                          </Typography>
                          <Typography variant="body2">
                            {format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                          </Typography>
                          <Chip
                            label={`${leave.days} day${leave.days > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ mt: 1, width: 'fit-content' }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={leave.status} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={leave.status}
                              onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                              disabled={actionLoading}
                            >
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Approved">Approved</MenuItem>
                              <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                          </FormControl>

                          {/* <Tooltip title="Edit Leave">
                            <IconButton
                              size="small"
                              onClick={() => setEditDialog(leave)}
                              disabled={actionLoading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip> */}

                          {currentUserRole && currentUserRole !== 'hr' && (
                            <Tooltip title="Delete Leave">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteConfirm(leave._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}


                          {/* {currentUserRole != 'hr' && (
                            <Tooltip title="Delete Leave">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteConfirm(leave._id)}
                                disabled={actionLoading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )} */}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ p: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No leave records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this leave request?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteLeave}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        {editDialog && (
          <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField label="Employee" value={editDialog.user?.name || ''} disabled fullWidth />

                <FormControl fullWidth>
                  <Select
                    value={editDialog.type}
                    onChange={(e) => setEditDialog({ ...editDialog, type: e.target.value })}
                    label="Leave Type"
                  >
                    {['Casual', 'Sick', 'Paid', 'Unpaid', 'Other'].map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <DatePicker
                  label="Start Date"
                  value={parseISO(editDialog.startDate)}
                  onChange={(date) => setEditDialog({ ...editDialog, startDate: format(date, 'yyyy-MM-dd') })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />

                <DatePicker
                  label="End Date"
                  value={parseISO(editDialog.endDate)}
                  onChange={(date) => setEditDialog({ ...editDialog, endDate: format(date, 'yyyy-MM-dd') })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={parseISO(editDialog.startDate)}
                />

                <TextField
                  label="Reason"
                  multiline
                  rows={4}
                  value={editDialog.reason}
                  onChange={(e) => setEditDialog({ ...editDialog, reason: e.target.value })}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => handleUpdateLeave(editDialog._id, {
                  type: editDialog.type,
                  startDate: editDialog.startDate,
                  endDate: editDialog.endDate,
                  reason: editDialog.reason
                })}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={20} /> : null}
              >
                Update Leave
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Box
            sx={{
              backgroundColor: notification?.severity === 'error' ? 'error.main' : 'success.main',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontWeight: 500
            }}
          >
            {notification?.severity === 'error' ? (
              <RejectedIcon fontSize="small" />
            ) : (
              <ApprovedIcon fontSize="small" />
            )}
            {notification?.message}
          </Box>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default EmppLeaves;
