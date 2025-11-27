import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Tooltip,
  Switch,
  FormGroup,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  Fade,
  Badge,
  Modal,
  InputAdornment,
  OutlinedInput,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  PauseCircle as PauseCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiXCircle, FiUsers, FiTrendingUp } from 'react-icons/fi';

// Enhanced Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease'
  }
}));

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.spacing(2),
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 600,
  backgroundColor: 
    status === 'Active' ? `${theme.palette.success.main}20` :
    status === 'On Hold' ? `${theme.palette.warning.main}20` :
    `${theme.palette.grey[300]}20`,
  color: 
    status === 'Active' ? theme.palette.success.dark :
    status === 'On Hold' ? theme.palette.warning.dark :
    theme.palette.grey[700],
  border: `1px solid ${
    status === 'Active' ? `${theme.palette.success.main}40` :
    status === 'On Hold' ? `${theme.palette.warning.main}40` :
    `${theme.palette.grey[300]}40`
  }`
}));

const ProgressBar = styled(LinearProgress)(({ value, theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: 
      value >= 100 ? theme.palette.success.main :
      value >= 70 ? theme.palette.primary.main :
      value >= 40 ? theme.palette.warning.main :
      theme.palette.info.main,
    borderRadius: 4
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

// Services Modal Component
const ServicesModal = ({ open, onClose, services, onAddService, onDeleteService }) => {
  const [newService, setNewService] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newService.trim()) {
      onAddService(newService.trim());
      setNewService('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WorkIcon sx={{ mr: 1 }} />
          Manage Services
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Add Service Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, mt: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="New Service Name"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Enter service name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                Add Service
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Services List */}
        <Typography variant="h6" gutterBottom>
          All Services ({services.length})
        </Typography>
        
        {services.length > 0 ? (
          <List>
            {services.map((service) => (
              <ListItem
                key={service._id}
                sx={{
                  border: 1,
                  borderColor: 'grey.200',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon>
                  <WorkIcon color="primary" />
                </ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {service.servicename}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Created: {new Date(service.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <ListItemSecondaryAction>
                  <Tooltip title="Delete Service">
                    <ActionButton
                      edge="end"
                      color="error"
                      onClick={() => onDeleteService(service._id, service.servicename)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </ActionButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={3}>
            <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Services Found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Add your first service using the form above
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const ClientManagement = () => {
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', name: '' });
  const [editDialog, setEditDialog] = useState({ open: false, client: null });
  const [servicesModal, setServicesModal] = useState(false);
  
  // Filter and pagination state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    status: '',
    projectManager: '',
    service: ''
  });

  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onHold: 0,
    inactive: 0
  });

  // New client form state
  const [newClient, setNewClient] = useState({
    client: '',
    company: '',
    city: '',
    projectManager: '',
    services: [],
    status: 'Active',
    progress: '0/0 (0%)',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: `${API_URL}/clientsservice`,
    timeout: 10000,
  });

  // Fetch all data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from backend...');
      
      const [clientsRes, servicesRes] = await Promise.all([
        api.get('/clients', { params: filters }),
        api.get('/services')
      ]);
      
      console.log('Clients Response:', clientsRes.data);
      console.log('Services Response:', servicesRes.data);
      
      if (clientsRes.data.success) {
        setClients(clientsRes.data.data || []);
        setStats(prev => ({
          ...prev,
          total: clientsRes.data.count || clientsRes.data.data?.length || 0
        }));
      }
      
      if (servicesRes.data.success) {
        setServices(servicesRes.data.data || []);
      }
      
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError('Data fetch failed: ' + errorMessage);
      console.error('Fetch error:', err);
      
      // Set empty arrays if fetch fails
      setClients([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  // Add new service
  const handleAddService = async (serviceName) => {
    if (!serviceName.trim()) return;

    try {
      const response = await api.post('/services', { 
        servicename: serviceName.trim() 
      });
      
      if (response.data.success) {
        setSuccess('Service added successfully!');
        setError('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Service add failed');
      console.error('Add service error:', err);
    }
  };

  // Add new client
  const handleAddClient = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/clients', newClient);
      
      if (response.data.success) {
        setNewClient({
          client: '',
          company: '',
          city: '',
          projectManager: '',
          services: [],
          status: 'Active',
          progress: '0/0 (0%)',
          email: '',
          phone: '',
          address: '',
          notes: ''
        });
        setSuccess('Client added successfully!');
        setError('');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Client add failed');
      console.error('Add client error:', err);
    }
  };

  // Update client
  const handleUpdateClient = async (clientId, updateData) => {
    try {
      const response = await api.put(`/clients/${clientId}`, updateData);
      
      if (response.data.success) {
        setSuccess('Client updated successfully!');
        setEditDialog({ open: false, client: null });
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Client update failed');
      console.error('Update client error:', err);
    }
  };

  // Delete confirmation dialog
  const handleDeleteClick = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleDeleteConfirm = async () => {
    const { type, id } = deleteDialog;
    
    try {
      if (type === 'client') {
        const response = await api.delete(`/clients/${id}`);
        if (response.data.success) {
          setSuccess('Client deleted successfully!');
          fetchData();
        }
      } else if (type === 'service') {
        const response = await api.delete(`/services/${id}`);
        if (response.data.success) {
          setSuccess('Service deleted successfully!');
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      console.error('Delete error:', err);
    }
    
    setDeleteDialog({ open: false, type: '', id: '', name: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: '', id: '', name: '' });
  };

  // Edit client dialog
  const handleEditClick = (client) => {
    setEditDialog({ open: true, client });
  };

  const handleEditSave = () => {
    const { client } = editDialog;
    handleUpdateClient(client._id, {
      client: client.client,
      company: client.company,
      city: client.city,
      projectManager: client.projectManager,
      services: client.services,
      status: client.status,
      progress: client.progress,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes
    });
  };

  // Calculate progress percentage
  const getProgressPercentage = (progressString) => {
    if (!progressString) return 0;
    const match = progressString.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'On Hold':
        return <FiAlertCircle color={theme.palette.warning.main} />;
      case 'Inactive':
        return <FiXCircle color={theme.palette.error.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading data from backend...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderCard>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Client Management Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage clients and services through backend
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<WorkIcon />}
                onClick={() => setServicesModal(true)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Manage Services ({services.length})
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </HeaderCard>

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
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Clients
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.total || clients.length}
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
                    Active Clients
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {clients.filter(client => client.status === 'Active').length}
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
                  <FiAlertCircle />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    On Hold
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {clients.filter(client => client.status === 'On Hold').length}
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
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Services
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {services.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Add Client Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1 }} />
                  Add New Client
                </Box>
              }
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              sx={{ 
                backgroundColor: 'success.main', 
                color: 'white',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent>
              <Box component="form" onSubmit={handleAddClient}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={newClient.client}
                      onChange={(e) => setNewClient({...newClient, client: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={newClient.company}
                      onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={newClient.city}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Project Manager</InputLabel>
                      <Select
                        value={newClient.projectManager}
                        label="Project Manager"
                        onChange={(e) => setNewClient({...newClient, projectManager: e.target.value})}
                      >
                        <MenuItem value="Jatin">Jatin</MenuItem>
                        <MenuItem value="Subhash">Subhash</MenuItem>
                        <MenuItem value="Rahul">Rahul</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={newClient.status}
                        label="Status"
                        onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="On Hold">On Hold</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Progress"
                      value={newClient.progress}
                      onChange={(e) => setNewClient({...newClient, progress: e.target.value})}
                      placeholder="28/40 (70%)"
                      helperText="Format: completed/total (percentage)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Services</InputLabel>
                      <Select
                        multiple
                        value={newClient.services}
                        onChange={(e) => setNewClient({...newClient, services: e.target.value})}
                        input={<OutlinedInput label="Services" />}
                        renderValue={(selected) => selected.join(', ')}
                        disabled={services.length === 0}
                      >
                        {services.map((service) => (
                          <MenuItem key={service._id} value={service.servicename}>
                            <Checkbox checked={newClient.services.includes(service.servicename)} />
                            <ListItemText primary={service.servicename} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {services.length === 0 && (
                      <Typography variant="caption" color="textSecondary">
                        No services available. <Button onClick={() => setServicesModal(true)}>Add services first</Button>
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<AddIcon />}
                      disabled={services.length === 0}
                      sx={{ borderRadius: 2 }}
                    >
                      {services.length === 0 ? 'Add Services First' : 'Add Client'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Services Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <WorkIcon sx={{ mr: 1 }} />
                    Services Overview
                  </Box>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => setServicesModal(true)}
                    size="small"
                  >
                    View All
                  </Button>
                </Box>
              }
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              sx={{ 
                backgroundColor: 'primary.main', 
                color: 'white',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent>
              {services.length > 0 ? (
                <List>
                  {services.slice(0, 5).map((service) => (
                    <ListItem
                      key={service._id}
                      sx={{
                        border: 1,
                        borderColor: 'grey.200',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <WorkIcon color="primary" />
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {service.servicename}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Created: {new Date(service.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                  {services.length > 5 && (
                    <Typography variant="body2" color="primary" textAlign="center" sx={{ mt: 1 }}>
                      +{services.length - 5} more services
                    </Typography>
                  )}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Services Available
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add services to start managing clients
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setServicesModal(true)}
                  >
                    Add First Service
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Clients Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ mr: 1 }} />
                    All Clients ({clients.length})
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      size="small"
                      placeholder="Search clients..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      sx={{ width: 200 }}
                    />
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="On Hold">On Hold</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      startIcon={<RefreshIcon />}
                      onClick={fetchData}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Box>
              }
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              sx={{ 
                backgroundColor: 'grey.900', 
                color: 'white',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8
              }}
            />
            <CardContent sx={{ p: 0 }}>
              {clients.length > 0 ? (
                <>
                  <StyledTableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: 'grey.100' }}>
                        <TableRow>
                          <TableCell><strong>Client</strong></TableCell>
                          <TableCell><strong>Company</strong></TableCell>
                          <TableCell><strong>City</strong></TableCell>
                          <TableCell><strong>Project Manager</strong></TableCell>
                          <TableCell><strong>Services</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Progress</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow 
                            key={client._id} 
                            hover
                            sx={{ 
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  {client.client?.charAt(0) || 'C'}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight="bold">
                                    {client.client}
                                  </Typography>
                                  {client.email && (
                                    <Typography variant="body2" color="textSecondary">
                                      {client.email}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                {client.company}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                {client.city}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={client.projectManager}
                                color="info"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {client.services && client.services.map((service, idx) => (
                                  <Chip
                                    key={idx}
                                    label={service}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <StatusChip
                                label={client.status}
                                status={client.status}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ minWidth: 120 }}>
                                <ProgressBar 
                                  variant="determinate" 
                                  value={getProgressPercentage(client.progress)} 
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                  {client.progress || '0/0 (0%)'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit Client">
                                  <ActionButton
                                    color="primary"
                                    onClick={() => handleEditClick(client)}
                                  >
                                    <EditIcon />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Delete Client">
                                  <ActionButton
                                    color="error"
                                    onClick={() => handleDeleteClick('client', client._id, client.client)}
                                  >
                                    <DeleteIcon />
                                  </ActionButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={Math.ceil(stats.total / filters.limit)}
                      page={filters.page}
                      onChange={(event, value) => handleFilterChange('page', value)}
                      color="primary"
                    />
                  </Box>
                </>
              ) : (
                <Box textAlign="center" py={5}>
                  <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Clients Found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Add your first client using the form above
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Services Management Modal */}
      <ServicesModal
        open={servicesModal}
        onClose={() => setServicesModal(false)}
        services={services}
        onAddService={handleAddService}
        onDeleteService={(id, name) => handleDeleteClick('service', id, name)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete {deleteDialog.type === 'client' ? 'Client' : 'Service'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteDialog.type} "{deleteDialog.name}"?
            {deleteDialog.type === 'client' && ' This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, client: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Client
        </DialogTitle>
        <DialogContent>
          {editDialog.client && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={editDialog.client.client}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, client: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={editDialog.client.company}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, company: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={editDialog.client.city}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, city: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Project Manager</InputLabel>
                  <Select
                    value={editDialog.client.projectManager}
                    label="Project Manager"
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      client: { ...editDialog.client, projectManager: e.target.value }
                    })}
                  >
                    <MenuItem value="Jatin">Jatin</MenuItem>
                    <MenuItem value="Subhash">Subhash</MenuItem>
                    <MenuItem value="Rahul">Rahul</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Services</InputLabel>
                  <Select
                    multiple
                    value={editDialog.client.services || []}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      client: { ...editDialog.client, services: e.target.value }
                    })}
                    input={<OutlinedInput label="Services" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {services.map((service) => (
                      <MenuItem key={service._id} value={service.servicename}>
                        <Checkbox checked={(editDialog.client.services || []).includes(service.servicename)} />
                        <ListItemText primary={service.servicename} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, client: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default ClientManagement;