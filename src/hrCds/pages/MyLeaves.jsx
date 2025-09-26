import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, Snackbar, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import axios from '../../utils/axiosConfig'; // ✅ use custom axios instance

const MyLeaves = () => {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({
    type: 'Casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/leaves/status');
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error('❌ Failed to fetch leaves:', err.message);
      setNotification({ message: err?.response?.data?.message || 'Failed to fetch leaves', severity: 'error' });
    }
  };

  const applyLeave = async (leaveData) => {
    try {
      const res = await axios.post('/leaves/apply', leaveData);
      setNotification({ message: res.data.message || 'Leave applied successfully', severity: 'success' });
      fetchLeaves(); // refresh list
    } catch (err) {
      console.error('❌ Failed to apply leave:', err.message);
      setNotification({ message: err?.response?.data?.message || 'Failed to apply leave', severity: 'error' });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    applyLeave(form);
    setOpen(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <Box>
      <Typography variant="h4">My Leaves</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Leave Requests" />
        <Tab label="Apply Leave" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={
                        leave.status === 'Approved'
                          ? 'success'
                          : leave.status === 'Pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => setOpen(true)}>
          Apply for Leave
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Select fullWidth name="type" value={form.type} onChange={handleChange} sx={{ mb: 2 }}>
            {['Casual', 'Sick', 'Paid', 'Unpaid', 'Other'].map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            name="startDate"
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            name="endDate"
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            name="reason"
            label="Reason"
            value={form.reason}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notification?.message}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box
          sx={{
            backgroundColor: notification?.severity === 'error' ? 'error.main' : 'success.main',
            color: 'white',
            p: 2,
            borderRadius: 1
          }}
        >
          {notification?.message}
        </Box>
      </Snackbar>
    </Box>
  );
};

export default MyLeaves;
