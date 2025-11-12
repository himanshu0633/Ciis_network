import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Popover, Modal, Stack, useMediaQuery, Card, CardContent,
  InputAdornment, Button, Avatar, LinearProgress, Fade,
  Tooltip, Divider, Grid
} from '@mui/material';
import {
  FiSearch, FiCalendar, FiClock, FiUser, FiTrendingUp,
  FiDownload, FiEye, FiChevronRight,
  FiCheckCircle, FiAlertCircle, FiMinusCircle
} from 'react-icons/fi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

// Styled Components
const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.01)',
  },
  ...(status === 'PRESENT' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'ABSENT' && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
  ...(status === 'HALF_DAY' && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'PRESENT' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === 'ABSENT' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
  ...(status === 'HALF_DAY' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
}));

const MobileRecordCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${
    status === 'PRESENT' ? theme.palette.success.main :
    status === 'ABSENT' ? theme.palette.error.main :
    status === 'HALF_DAY' ? theme.palette.warning.main :
    theme.palette.divider
  }`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    background: theme.palette.background.paper,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    total: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/attendance/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.data);
      calculateStats(res.data.data);
    } catch (err) {
      toast.error('❌ Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const present = data.filter(record => record.status === 'PRESENT').length;
    const absent = data.filter(record => record.status === 'ABSENT').length;
    const halfDay = data.filter(record => record.status === 'HALF_DAY').length;

    setStats({
      present,
      absent,
      halfDay,
      total: data.length
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'ABSENT':
        return <FiMinusCircle color={theme.palette.error.main} />;
      case 'HALF_DAY':
        return <FiAlertCircle color={theme.palette.warning.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const handleCalendarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = () => {
    setAnchorEl(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSearch(date ? formatDate(date) : '');
    handleCalendarClose();
  };

  const filteredData = attendance.filter(record => {
    const matchesSearch =
      formatDate(record.date).toLowerCase().includes(search.toLowerCase()) ||
      record.status.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Login', 'Logout', 'Status', 'Total Time'];
    const csvData = filteredData.map(record => [
      formatDate(record.date),
      formatTime(record.inTime),
      formatTime(record.outTime),
      record.status,
      record.totalTime || '00:00:00'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('📊 CSV exported successfully!');
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: theme.palette.background.default
      }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          background: theme.palette.background.default,
          minHeight: '100vh'
        }}>
          <ToastContainer position="top-right" autoClose={4000} />

          {/* Header */}
          <Paper sx={{
            p: 3, mb: 3,
            borderRadius: theme.shape.borderRadius * 2,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            boxShadow: theme.shadows[4]
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Attendance Records
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track your attendance history and statistics
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <SearchField
                  placeholder="Search by date or status..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Filter by date">
                          <IconButton onClick={handleCalendarClick} size="small">
                            <FiCalendar color={theme.palette.primary.main} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: { xs: '100%', sm: 280 } }}
                />

                <Tooltip title="Export to CSV">
                  <Button
                    variant="outlined"
                    startIcon={<FiDownload />}
                    onClick={exportToCSV}
                    sx={{
                      borderRadius: theme.shape.borderRadius * 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Export
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleCalendarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <Box sx={{ p: 2 }}>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateSelect}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </Box>
            </Popover>
          </Paper>

          {/* Active Filter */}
          {statusFilter !== 'ALL' && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Filter: ${statusFilter}`}
                color="primary"
                onDelete={() => setStatusFilter('ALL')}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Present */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                onClick={() => setStatusFilter('PRESENT')}
                sx={{
                  cursor: 'pointer',
                  border: statusFilter === 'PRESENT' ? `2px solid ${theme.palette.success.main}` : 'none',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.success.main}20`, color: theme.palette.success.main }}>
                      <FiCheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Present Days</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.present}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Absent */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                onClick={() => setStatusFilter('ABSENT')}
                sx={{
                  cursor: 'pointer',
                  border: statusFilter === 'ABSENT' ? `2px solid ${theme.palette.error.main}` : 'none',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.error.main}20`, color: theme.palette.error.main }}>
                      <FiMinusCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Absent Days</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.absent}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Half Day */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                onClick={() => setStatusFilter('HALF_DAY')}
                sx={{
                  cursor: 'pointer',
                  border: statusFilter === 'HALF_DAY' ? `2px solid ${theme.palette.warning.main}` : 'none',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.warning.main}20`, color: theme.palette.warning.main }}>
                      <FiAlertCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Half Days</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.halfDay}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>

            {/* Total */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                onClick={() => setStatusFilter('ALL')}
                sx={{
                  cursor: 'pointer',
                  border: statusFilter === 'ALL' ? `2px solid ${theme.palette.info.main}` : 'none',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette.info.main}20`, color: theme.palette.info.main }}>
                      <FiTrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Records</Typography>
                      <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Desktop Table */}
          {!isMobile && (
            <StatCard>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Login</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Logout</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((record) => (
                          <StyledTableRow
                            key={record._id}
                            status={record.status}
                            onClick={() => openDetailsModal(record)}
                          >
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{formatTime(record.inTime)}</TableCell>
                            <TableCell>{formatTime(record.outTime)}</TableCell>
                            <TableCell>
                              <StatusChip
                                label={record.status}
                                status={record.status}
                                size="small"
                                icon={getStatusIcon(record.status)}
                              />
                            </TableCell>
                            <TableCell>{record.totalTime || '00:00:00'}</TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton size="small"><FiEye /></IconButton>
                              </Tooltip>
                            </TableCell>
                          </StyledTableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <FiUser size={48} color={theme.palette.text.secondary} />
                            <Typography variant="h6" color="text.secondary">No records found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StatCard>
          )}

          {/* Mobile Cards */}
          {isMobile && (
            <Stack spacing={2}>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <MobileRecordCard
                    key={record._id}
                    status={record.status}
                    onClick={() => openDetailsModal(record)}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600}>{formatDate(record.date)}</Typography>
                          <Stack spacing={1}>
                            <Typography variant="body2">In: {formatTime(record.inTime)}</Typography>
                            <Typography variant="body2">Out: {formatTime(record.outTime)}</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <StatusChip label={record.status} status={record.status} size="small" />
                              <Typography variant="body2" fontWeight={500}>
                                {record.totalTime || '00:00:00'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                        <FiChevronRight color={theme.palette.text.secondary} />
                      </Stack>
                    </CardContent>
                  </MobileRecordCard>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FiUser size={48} color={theme.palette.text.secondary} />
                  <Typography variant="h6" color="text.secondary">No records found</Typography>
                </Box>
              )}
            </Stack>
          )}

          {/* Modal */}
          <Modal open={openModal} onClose={closeModal}>
            <Fade in={openModal}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isSmallMobile ? '90%' : 400,
                bgcolor: 'background.paper',
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[24],
                overflow: 'hidden'
              }}>
                {selectedRecord && (
                  <>
                    <Box sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      color: 'white'
                    }}>
                      <Typography variant="h5" fontWeight={700}>Attendance Details</Typography>
                      <Typography variant="body1">{formatDate(selectedRecord.date)}</Typography>
                    </Box>

                    <Box sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Status</Typography>
                          <StatusChip label={selectedRecord.status} status={selectedRecord.status} />
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Login</Typography>
                          <Typography>{formatTime(selectedRecord.inTime)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Logout</Typography>
                          <Typography>{formatTime(selectedRecord.outTime)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Total Time</Typography>
                          <Typography fontWeight={600}>{selectedRecord.totalTime || '00:00:00'}</Typography>
                        </Stack>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={closeModal}
                          sx={{
                            mt: 3,
                            borderRadius: theme.shape.borderRadius * 2,
                            py: 1.5,
                            fontWeight: 600
                          }}
                        >
                          Close
                        </Button>
                      </Stack>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default Attendance;
