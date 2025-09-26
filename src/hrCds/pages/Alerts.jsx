import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

const alertTypes = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' }
];

const defaultForm = { type: 'info', message: '' };

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(null);

  // NEW: current user's role (admin/manager/etc.)
  const [currentUserRole, setCurrentUserRole] = useState('');
  const canManage = currentUserRole === 'hr' || currentUserRole === 'manager';

  // Fetch alerts, token and role from localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) setToken(storedToken);

        // read role like your other page
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const role = (parsedUser?.role || parsedUser?.user?.role || '')
              .toString()
              .trim()
              .toLowerCase();
            setCurrentUserRole(role);
          } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
            setCurrentUserRole('');
          }
        }

        const res = await axios.get('/alerts');
        setAlerts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleOpen = (alert = null) => {
    if (alert) {
      setEditId(alert._id);
      setForm({ type: alert.type, message: alert.message });
    } else {
      setEditId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.message.trim()) return;

    // Guard: only admin/manager can add/edit
    if (!canManage) {
      setNotification('Not authorized to add/update alerts.');
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(`/alerts/${editId}`, form, authHeaders());
        setAlerts(prev => prev.map(a => (a._id === editId ? res.data.alert : a)));
        setNotification('Alert updated!');
      } else {
        const res = await axios.post('/alerts', form, authHeaders());
        setAlerts(prev => [res.data.alert, ...prev]);
        setNotification('Alert added!');
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      setNotification('Error: ' + (err.response?.data?.message || 'Something went wrong'));
    }
  };

  const handleDelete = async id => {
    // Guard: only admin/manager can delete
    if (!canManage) {
      setNotification('Not authorized to delete alerts.');
      return;
    }

    try {
      await axios.delete(`/alerts/${id}`, authHeaders());
      setAlerts(prev => prev.filter(a => a._id !== id));
      setNotification('Alert deleted!');
    } catch (err) {
      console.error(err);
      setNotification('Error: ' + (err.response?.data?.message || 'Something went wrong'));
    }
  };

  return (
    <Box sx={{ p: 3, background: '#f5f5f5', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={2}
        >
          <Typography variant="h5" fontWeight={600}>Alerts</Typography>

          {/* Show Add button only to admin/manager */}
          {canManage && (
            <Button variant="contained" onClick={() => handleOpen()}>
              Add Alert
            </Button>
          )}
        </Stack>

        {alerts.length === 0 ? (
          <Typography variant="body1">No alerts at this time.</Typography>
        ) : (
          <Stack spacing={2}>
            {alerts.map(alert => (
              <Paper
                key={alert._id}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderLeft: `6px solid ${
                    alert.type === 'info'
                      ? '#1976d2'
                      : alert.type === 'warning'
                      ? '#ffa726'
                      : '#e53935'
                  }`
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    color={
                      alert.type === 'info'
                        ? 'primary'
                        : alert.type === 'warning'
                        ? 'warning.main'
                        : 'error.main'
                    }
                  >
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                  </Typography>
                  <Typography variant="body1">{alert.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(alert.timestamp || alert.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {/* Edit/Delete only for admin/manager */}
                {canManage && (
                  <>
                    <IconButton onClick={() => handleOpen(alert)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(alert._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Edit Alert' : 'Add Alert'}</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <TextField
            select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            fullWidth
            disabled={!canManage}
          >
            {alertTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            disabled={!canManage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {canManage && (
            <Button onClick={handleSubmit} variant="contained">
              {editId ? 'Update' : 'Add'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        message={notification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Alerts;
