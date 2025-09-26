import React, { useEffect, useState, useMemo } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, TextField,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import format from 'date-fns/format';
import EmployeeTypeFilter from '../../Filter/EmployeeTypeFilter'; // 👈 import filter

const EmppAttendence = () => {
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all"); // 👈 filter state

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
    try {
      const formatted = format(date, 'yyyy-MM-dd');
      const res = await axios.get(`/attendance/all?date=${formatted}`);
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to load attendance', err);
      alert('❌ Error loading attendance data.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await axios.delete(`/attendance/${id}`);
        alert('✅ Attendance record deleted successfully.');
        fetchData(selectedDate);
      } catch (err) {
        console.error(err);
        alert('❌ Failed to delete attendance record.');
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
      alert('✅ Attendance record updated successfully.');
      setOpen(false);
      fetchData(selectedDate);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update attendance record.');
    }
  };

  // 👇 filter applied
  const filteredRecords = useMemo(() => {
    if (selectedEmployeeType === "all") return records;
    return records.filter(
      (rec) =>
        rec.user?.employeeType &&
        rec.user.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
    );
  }, [records, selectedEmployeeType]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>🗂 All Users Attendance</Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
        />
      </LocalizationProvider>

      {/* 👇 Employee Type Filter Dropdown */}
      <EmployeeTypeFilter
        selected={selectedEmployeeType}
        onChange={setSelectedEmployeeType}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Employee Type</TableCell> {/* 👈 added */}
              <TableCell>Date</TableCell>
              <TableCell>In</TableCell>
              <TableCell>Out</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Late By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((rec, index) => (
              <TableRow key={rec._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{rec.user?.name || 'N/A'}</TableCell>
                <TableCell>{rec.user?.employeeType || 'N/A'}</TableCell> {/* 👈 show type */}
                <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                <TableCell>{rec.inTime ? new Date(rec.inTime).toLocaleTimeString() : '-'}</TableCell>
                <TableCell>{rec.outTime ? new Date(rec.outTime).toLocaleTimeString() : '-'}</TableCell>
                <TableCell>{rec.totalTime || '00:00:00'}</TableCell>
                <TableCell>{rec.lateBy || '-'}</TableCell>
                <TableCell>{rec.status}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditOpen(rec)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                    <Tooltip title="Delete Attendance">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(rec._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No attendance records found for selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Attendance</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={editing?.status || ''}
              onChange={handleEditChange}
              label="Status"
            >
              <MenuItem value="present">Present</MenuItem>
              <MenuItem value="halfday">Half Day</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
            </Select>
          </FormControl>
          {['totalTime', 'lateBy', 'overTime', 'earlyLeave'].map((field) => (
            <TextField
              key={field}
              margin="dense"
              name={field}
              label={field.replace(/([A-Z])/g, ' $1')}
              value={editing?.[field] || ''}
              onChange={handleEditChange}
              fullWidth
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmppAttendence;
