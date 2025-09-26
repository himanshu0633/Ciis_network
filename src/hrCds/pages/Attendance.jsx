import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Popover, Modal, Stack, useMediaQuery
} from '@mui/material';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@mui/material/styles';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/attendance/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.data);
    } catch (err) {
      toast.error('❌ Failed to load attendance records');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const filteredData = attendance.filter(record =>
    formatDate(record.date).toLowerCase().includes(search.toLowerCase())
  );

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ px: { xs: 1, md: 3 }, py: 2, background: '#f7f7f7', minHeight: '100vh' }}>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        {/* Header & Search */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
              My Attendance Records
            </Typography>

            <TextField
              label="Search by Date"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton onClick={handleCalendarClick}>
                    <FiCalendar style={{ color: '#757575' }} />
                  </IconButton>
                ),
                endAdornment: (
                  <FiSearch style={{ color: '#757575', marginRight: 8 }} />
                )
              }}
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
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

        {/* Desktop Table */}
        {!isMobile && (
          <Paper sx={{ p: 2, borderRadius: 3, overflowX: 'auto' }}>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Login</TableCell>
                    <TableCell>Logout</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total Time</TableCell>
                    <TableCell>Overtime</TableCell>
                    <TableCell>Late By</TableCell>
                    <TableCell>Early Leave</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((record, idx) => (
                      <TableRow key={record._id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{formatTime(record.inTime)}</TableCell>
                        <TableCell>{formatTime(record.outTime)}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={
                              record.status === 'PRESENT'
                                ? 'success'
                                : record.status === 'HALF DAY'
                                  ? 'warning'
                                  : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.totalTime || '00:00:00'}</TableCell>
                        <TableCell>{record.overTime || '00:00:00'}</TableCell>
                        <TableCell>{record.lateBy || '00:00:00'}</TableCell>
                        <TableCell>{record.earlyLeave || '00:00:00'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Mobile View Card List */}
        {isMobile && (
          <Stack spacing={2}>
            {filteredData.map((record, idx) => (
              <Paper key={record._id} sx={{ p: 2, cursor: 'pointer' }} onClick={() => openDetailsModal(record)}>
                <Typography variant="body1" fontWeight="bold">
                  {formatDate(record.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tap to view details
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Modal for Mobile Details */}
        <Modal open={openModal} onClose={closeModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            boxShadow: 24
          }}>
            {selectedRecord && (
              <>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {formatDate(selectedRecord.date)}
                </Typography>
                <Typography variant="body2">Login: {formatTime(selectedRecord.inTime)}</Typography>
                <Typography variant="body2">Logout: {formatTime(selectedRecord.outTime)}</Typography>
                <Typography variant="body2">Status: {selectedRecord.status}</Typography>
                <Typography variant="body2">Total Time: {selectedRecord.totalTime || '00:00:00'}</Typography>
                <Typography variant="body2">Overtime: {selectedRecord.overTime || '00:00:00'}</Typography>
                <Typography variant="body2">Late By: {selectedRecord.lateBy || '00:00:00'}</Typography>
                <Typography variant="body2">Early Leave: {selectedRecord.earlyLeave || '00:00:00'}</Typography>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default Attendance;
