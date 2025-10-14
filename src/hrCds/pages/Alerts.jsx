import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import {
  Box, Typography, Paper, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, IconButton, Snackbar,
  MenuItem, Stack, Card, CardContent, Grid, Avatar, Fade,
  Tooltip, Chip, useTheme, useMediaQuery, Divider, Badge
} from '@mui/material';
import {
  FiAlertCircle, FiAlertTriangle, FiInfo, FiPlus,
  FiEdit, FiTrash2, FiBell, FiClock, FiUser
} from 'react-icons/fi';
import { styled } from '@mui/material/styles';

// Enhanced Styled Components
const AlertCard = styled(Card)(({ theme, type }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `6px solid ${
    type === 'info' ? theme.palette.info.main :
    type === 'warning' ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

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

const TypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  ...(type === 'info' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(type === 'warning' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(type === 'error' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const alertTypes = [
  { value: 'info', label: 'Information', icon: FiInfo, color: 'info' },
  { value: 'warning', label: 'Warning', icon: FiAlertTriangle, color: 'warning' },
  { value: 'error', label: 'Error', icon: FiAlertCircle, color: 'error' }
];

const defaultForm = { type: 'info', message: '' };

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warning: 0,
    error: 0
  });

  // NEW: current user's role (admin/manager/etc.)
  const [currentUserRole, setCurrentUserRole] = useState('');
  const canManage = currentUserRole === 'hr' || currentUserRole === 'manager';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch alerts, token and role from localStorage
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        calculateStats(res.data);
      } catch (err) {
        console.error(err);
        setNotification({ 
          open: true, 
          message: 'Failed to load alerts', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateStats = (alertsData) => {
    const info = alertsData.filter(alert => alert.type === 'info').length;
    const warning = alertsData.filter(alert => alert.type === 'warning').length;
    const error = alertsData.filter(alert => alert.type === 'error').length;
    
    setStats({
      total: alertsData.length,
      info,
      warning,
      error
    });
  };

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
    if (!form.message.trim()) {
      setNotification({ 
        open: true, 
        message: 'Please enter a message', 
        severity: 'error' 
      });
      return;
    }

    // Guard: only admin/manager can add/edit
    if (!canManage) {
      setNotification({ 
        open: true, 
        message: 'Not authorized to add/update alerts.', 
        severity: 'error' 
      });
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(`/alerts/${editId}`, form, authHeaders());
        setAlerts(prev => prev.map(a => (a._id === editId ? res.data.alert : a)));
        setNotification({ 
          open: true, 
          message: 'Alert updated successfully!', 
          severity: 'success' 
        });
      } else {
        const res = await axios.post('/alerts', form, authHeaders());
        setAlerts(prev => [res.data.alert, ...prev]);
        setNotification({ 
          open: true, 
          message: 'Alert added successfully!', 
          severity: 'success' 
        });
      }
      setOpen(false);
      calculateStats(alerts);
    } catch (err) {
      console.error(err);
      setNotification({ 
        open: true, 
        message: 'Error: ' + (err.response?.data?.message || 'Something went wrong'), 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async id => {
    // Guard: only admin/manager can delete
    if (!canManage) {
      setNotification({ 
        open: true, 
        message: 'Not authorized to delete alerts.', 
        severity: 'error' 
      });
      return;
    }

    try {
      await axios.delete(`/alerts/${id}`, authHeaders());
      setAlerts(prev => prev.filter(a => a._id !== id));
      setNotification({ 
        open: true, 
        message: 'Alert deleted successfully!', 
        severity: 'success' 
      });
      calculateStats(alerts.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
      setNotification({ 
        open: true, 
        message: 'Error: ' + (err.response?.data?.message || 'Something went wrong'), 
        severity: 'error' 
      });
    }
  };

  const getAlertIcon = (type) => {
    const alertType = alertTypes.find(t => t.value === type);
    const IconComponent = alertType ? alertType.icon : FiInfo;
    return <IconComponent size={20} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <Typography>Loading alerts...</Typography>
      </Box>
    );
  }

  return (
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
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                System Alerts
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Important notifications and announcements
              </Typography>
            </Box>

            {/* Show Add button only to admin/manager */}
            {canManage && (
              <Button
                variant="contained"
                startIcon={<FiPlus />}
                onClick={() => handleOpen()}
                sx={{
                  borderRadius: theme.shape.borderRadius * 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
              >
                New Alert
              </Button>
            )}
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
                    <FiBell />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Alerts
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
            <StatCard color="info">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.info.main}20`, 
                    color: theme.palette.info.main 
                  }}>
                    <FiInfo />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Information
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.info}
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
                    <FiAlertTriangle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Warnings
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.warning}
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
                    <FiAlertCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Errors
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.error}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Alerts List */}
        <Paper sx={{ 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[2],
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 3 }}>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={700}>
                Active Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.total} alert{stats.total !== 1 ? 's' : ''} total
              </Typography>
            </Stack>

            {alerts.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                color: theme.palette.text.secondary
              }}>
                <FiBell size={48} style={{ marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom>
                  No Alerts
                </Typography>
                <Typography variant="body2">
                  {canManage 
                    ? 'Create your first alert to get started' 
                    : 'No alerts at this time'
                  }
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {alerts.map(alert => (
                  <AlertCard key={alert._id} type={alert.type}>
                    <CardContent>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                      >
                        <Box sx={{ flex: 1 }}>
                          <Stack 
                            direction="row" 
                            spacing={2} 
                            alignItems="center" 
                            sx={{ mb: 1 }}
                          >
                            {getAlertIcon(alert.type)}
                            <TypeChip
                              label={alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                              type={alert.type}
                              size="small"
                            />
                          </Stack>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 1,
                              fontWeight: 500
                            }}
                          >
                            {alert.message}
                          </Typography>
                          <Stack 
                            direction="row" 
                            spacing={2} 
                            alignItems="center"
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <FiClock size={14} color={theme.palette.text.secondary} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(alert.timestamp || alert.createdAt)}
                              </Typography>
                            </Stack>
                            {alert.createdBy && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <FiUser size={14} color={theme.palette.text.secondary} />
                                <Typography variant="caption" color="text.secondary">
                                  By {alert.createdBy.name || 'System'}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Box>

                        {/* Edit/Delete only for admin/manager */}
                        {canManage && (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit Alert">
                              <IconButton 
                                onClick={() => handleOpen(alert)}
                                size="small"
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&:hover': { 
                                    bgcolor: `${theme.palette.primary.main}10` 
                                  }
                                }}
                              >
                                <FiEdit size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Alert">
                              <IconButton
                                onClick={() => handleDelete(alert._id)}
                                size="small"
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': { 
                                    bgcolor: `${theme.palette.error.main}10` 
                                  }
                                }}
                              >
                                <FiTrash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </AlertCard>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Enhanced Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={700}>
              {editId ? 'Edit Alert' : 'Create New Alert'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                select
                label="Alert Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                disabled={!canManage}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                {alertTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {React.createElement(type.icon, { 
                        color: theme.palette[type.color].main 
                      })}
                      <Typography>{type.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Alert Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Enter the alert message here..."
                disabled={!canManage}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleClose}
              sx={{ 
                borderRadius: theme.shape.borderRadius * 2,
                px: 3
              }}
            >
              Cancel
            </Button>
            {canManage && (
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={!form.message.trim()}
                sx={{ 
                  borderRadius: theme.shape.borderRadius * 2,
                  px: 3
                }}
              >
                {editId ? 'Update Alert' : 'Create Alert'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Card sx={{ 
            minWidth: 300,
            background: notification.severity === 'error' 
              ? theme.palette.error.main 
              : theme.palette.success.main,
            color: 'white'
          }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {notification.severity === 'error' ? 
                  <FiAlertCircle size={20} /> : 
                  <FiInfo size={20} />
                }
                <Typography variant="body2" fontWeight={500}>
                  {notification.message}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default Alerts;