import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Card, CardContent,
  Grid, Stack, Avatar, Chip, Fade, LinearProgress, useTheme,
  useMediaQuery, Divider, Snackbar, InputAdornment
} from '@mui/material';
import {
  FiEdit, FiTrash2, FiCalendar, FiUsers, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiFilter,
  FiRefreshCw, FiSearch, FiUser, FiTrendingUp
} from 'react-icons/fi';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import format from 'date-fns/format';
import EmployeeTypeFilter from '../../Filter/EmployeeTypeFilter';
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
  ...(status === 'present' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === 'halfday' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(status === 'absent' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === 'full-time' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(type === 'part-time' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(type === 'contract' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === 'intern' && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  ...(status === 'present' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'halfday' && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(status === 'absent' && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
}));

const TimeBadge = styled(Box)(({ theme, type = 'default' }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 12,
  fontSize: '0.75rem',
  fontWeight: 600,
  ...(type === 'late' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
  ...(type === 'early' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(type === 'overtime' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
}));

const EmppAttendence = () => {
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    onTime: 0,
    late: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const role = parsedUser?.role?.trim().toLowerCase() || '';
        setCurrentUserRole(role);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const fetchData = async (date = new Date()) => {
    setLoading(true);
    try {
      const formatted = format(date, 'yyyy-MM-dd');
      const res = await axios.get(`/attendance/all?date=${formatted}`);
      setRecords(res.data.data);
      calculateStats(res.data.data);
    } catch (err) {
      console.error('Failed to load attendance', err);
      setSnackbar({ 
        open: true, 
        message: 'Error loading attendance data', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const present = attendanceData.filter(rec => rec.status === 'present').length;
    const absent = attendanceData.filter(rec => rec.status === 'absent').length;
    const halfDay = attendanceData.filter(rec => rec.status === 'halfday').length;
    const late = attendanceData.filter(rec => rec.lateBy && rec.lateBy !== '00:00:00').length;
    
    setStats({
      total: attendanceData.length,
      present,
      absent,
      halfDay,
      onTime: attendanceData.length - late,
      late
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await axios.delete(`/attendance/${id}`);
        setSnackbar({ 
          open: true, 
          message: 'Attendance record deleted successfully', 
          severity: 'success' 
        });
        fetchData(selectedDate);
      } catch (err) {
        console.error(err);
        setSnackbar({ 
          open: true, 
          message: 'Failed to delete attendance record', 
          severity: 'error' 
        });
      }
    }
  };

  const handleEditOpen = (record) => {
    setEditing({ ...record });
    setOpen(true);
  };

  const handleEditChange = (e) => {
    setEditing({ ...editing, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`/attendance/${editing._id}`, editing);
      setSnackbar({ 
        open: true, 
        message: 'Attendance record updated successfully', 
        severity: 'success' 
      });
      setOpen(false);
      fetchData(selectedDate);
    } catch (err) {
      console.error(err);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update attendance record', 
        severity: 'error' 
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'absent':
        return <FiXCircle color={theme.palette.error.main} />;
      case 'halfday':
        return <FiAlertCircle color={theme.palette.warning.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter logic with search
  const filteredRecords = useMemo(() => {
    let filtered = records;
    
    // Filter by employee type
    if (selectedEmployeeType !== "all") {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.employeeType &&
          rec.user.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [records, selectedEmployeeType, searchTerm]);

  if (loading && records.length === 0) {
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
                    Attendance Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Track and manage employee attendance records
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Tooltip title="Refresh">
                    <IconButton 
                      onClick={() => fetchData(selectedDate)}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }}
                    >
                      <FiRefreshCw />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Filters Section */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      sx: { 
                        borderRadius: theme.shape.borderRadius * 2,
                        minWidth: 200
                      }
                    } 
                  }}
                />

                

                <EmployeeTypeFilter
                  selected={selectedEmployeeType}
                  onChange={setSelectedEmployeeType}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={2}>
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

            <Grid item xs={6} md={2}>
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
                        Present
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.present}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={2}>
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
                        Absent
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.absent}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={2}>
              <StatCard color="warning">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.warning.main}20`, 
                      color: theme.palette.warning.main 
                    }}>
                      <FiAlertCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Half Day
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.halfDay}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={2}>
              <StatCard color="info">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.info.main}20`, 
                      color: theme.palette.info.main 
                    }}>
                      <FiClock />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        On Time
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.onTime}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={6} md={2}>
              <StatCard color="secondary">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.secondary.main}20`, 
                      color: theme.palette.secondary.main 
                    }}>
                      <FiTrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Late Arrivals
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats.late}
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
              {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''} Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedEmployeeType !== 'all' && `Filtered by: ${selectedEmployeeType}`}
              {searchTerm && ` • Searching: "${searchTerm}"`}
            </Typography>
          </Stack>

          {/* Attendance Table */}
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
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Late By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec, index) => (
                      <StyledTableRow key={rec._id} status={rec.status}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              src={rec.user?.image} 
                              sx={{ width: 40, height: 40 }}
                            >
                              {getInitials(rec.user?.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {rec.user?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rec.user?.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <EmployeeTypeChip
                            label={rec.user?.employeeType?.toUpperCase() || 'N/A'}
                            type={rec.user?.employeeType?.toLowerCase()}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(rec.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatTime(rec.inTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatTime(rec.outTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {rec.totalTime || '00:00:00'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {rec.lateBy && rec.lateBy !== '00:00:00' ? (
                            <TimeBadge type="late">
                              {rec.lateBy}
                            </TimeBadge>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={rec.status?.charAt(0).toUpperCase() + rec.status?.slice(1)}
                            status={rec.status}
                            icon={getStatusIcon(rec.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Edit Record">
                              <IconButton 
                                size="small"
                                onClick={() => handleEditOpen(rec)}
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': { bgcolor: `${theme.palette.primary.main}10` }
                                }}
                              >
                                <FiEdit size={16} />
                              </IconButton>
                            </Tooltip>
                            {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                              <Tooltip title="Delete Record">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(rec._id)}
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
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <FiCalendar size={48} color={theme.palette.text.secondary} />
                          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                            No Records Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || selectedEmployeeType !== 'all' 
                              ? 'Try adjusting your search criteria' 
                              : 'No attendance records for selected date'
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

          {/* Enhanced Edit Dialog */}
          <Dialog 
            open={open} 
            onClose={() => setOpen(false)} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5" fontWeight={700}>
                Edit Attendance Record
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editing?.status || ''}
                    onChange={handleEditChange}
                    label="Status"
                    sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                  >
                    <MenuItem value="present">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiCheckCircle color={theme.palette.success.main} />
                        <Typography>Present</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="halfday">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiAlertCircle color={theme.palette.warning.main} />
                        <Typography>Half Day</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="absent">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiXCircle color={theme.palette.error.main} />
                        <Typography>Absent</Typography>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
                
                {['totalTime', 'lateBy', 'overTime', 'earlyLeave'].map((field) => (
                  <TextField
                    key={field}
                    name={field}
                    label={field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    value={editing?.[field] || ''}
                    onChange={handleEditChange}
                    fullWidth
                    placeholder="HH:MM:SS"
                    sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                  />
                ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setOpen(false)}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleEditSubmit}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Card sx={{ 
              minWidth: 300,
              background: snackbar.severity === 'error' 
                ? theme.palette.error.main 
                : theme.palette.success.main,
              color: 'white'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {snackbar.severity === 'error' ? 
                    <FiXCircle size={20} /> : 
                    <FiCheckCircle size={20} />
                  }
                  <Typography variant="body2" fontWeight={500}>
                    {snackbar.message}
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

export default EmppAttendence;