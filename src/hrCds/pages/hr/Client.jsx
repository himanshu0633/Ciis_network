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
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiXCircle, FiUsers, FiTrendingUp, FiInfo } from 'react-icons/fi';

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
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  overflowX: 'auto',
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

// Service Progress Card Component
const ServiceProgressCard = ({ service, clientId, onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem(`client_${clientId}_service_${service}_tasks`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [clientId, service]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(`client_${clientId}_service_${service}_tasks`, JSON.stringify(tasks));
    if (onTaskUpdate) {
      onTaskUpdate(service, tasks);
    }
  }, [tasks, clientId, service, onTaskUpdate]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newTaskObj = {
        id: Date.now(),
        name: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
      setShowAddTask(false);
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <Card sx={{ mb: 2, border: `1px solid`, borderColor: 'divider', transition: 'all 0.3s ease' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {service}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {completedTasks} / {totalTasks} tasks completed
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${Math.round(progressPercentage)}%`} 
              color={
                progressPercentage >= 100 ? 'success' :
                progressPercentage >= 70 ? 'primary' :
                progressPercentage >= 40 ? 'warning' : 'default'
              }
              variant="outlined"
              size="small"
            />
            <Tooltip title="Add Task">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => setShowAddTask(!showAddTask)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Bar */}
        <ProgressBar 
          variant="determinate" 
          value={progressPercentage} 
          sx={{ mb: 2 }}
        />

        {/* Add Task Input */}
        {showAddTask && (
          <Box display="flex" gap={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Enter task name..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ flexGrow: 1 }}
              autoFocus
            />
            <Button 
              size="small" 
              variant="contained" 
              onClick={handleAddTask}
              disabled={!newTask.trim()}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => {
                setShowAddTask(false);
                setNewTask('');
              }}
            >
              Cancel
            </Button>
          </Box>
        )}

        {/* Tasks List */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Tasks ({totalTasks}):
          </Typography>
          {tasks.length > 0 ? (
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {tasks.map((task) => (
                <ListItem 
                  key={task.id} 
                  sx={{ 
                    px: 1,
                    py: 0.5,
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                  secondaryAction={
                    <Tooltip title="Delete Task">
                      <IconButton 
                        edge="end" 
                        size="small" 
                        color="error"
                        onClick={() => deleteTask(task.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      size="small"
                      color="primary"
                    />
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Added: {new Date(task.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 3, 
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'grey.50'
              }}
            >
              <Typography variant="body2" color="textSecondary">
                No tasks added yet. Click the + icon to add tasks.
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

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

// Add Client Modal Component
const AddClientModal = ({ 
  open, 
  onClose, 
  onAddClient, 
  services, 
  projectManagers,
  loading = false 
}) => {
  const [newClient, setNewClient] = useState({
    client: '',
    company: '',
    city: '',
    projectManagers: [],
    services: [],
    status: 'Active',
    progress: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    notes: ''
  });

  const [managerSearch, setManagerSearch] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newClient.client && newClient.company && newClient.city && newClient.projectManagers.length > 0) {
      onAddClient(newClient);
      // Reset form
      setNewClient({
        client: '',
        company: '',
        city: '',
        projectManagers: [],
        services: [],
        status: 'Active',
        progress: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        notes: ''
      });
      setManagerSearch('');
    }
  };

  const filteredManagers = projectManagers.filter(manager =>
    manager.name?.toLowerCase().includes(managerSearch.toLowerCase()) ||
    manager.email?.toLowerCase().includes(managerSearch.toLowerCase()) ||
    manager.role?.toLowerCase().includes(managerSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ mr: 1 }} />
            Add New Client
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name *"
                value={newClient.client}
                onChange={(e) => setNewClient({...newClient, client: e.target.value})}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company *"
                value={newClient.company}
                onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City *"
                value={newClient.city}
                onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newClient.status}
                  label="Status *"
                  onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                  disabled={loading}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Project Managers Multi-Select */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Project Managers *</InputLabel>
                <Select
                  multiple
                  value={newClient.projectManagers}
                  onChange={(e) => setNewClient({...newClient, projectManagers: e.target.value})}
                  input={<OutlinedInput label="Project Managers *" />}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 400,
                      },
                    },
                  }}
                  disabled={loading}
                >
                  {/* Search Bar inside Dropdown */}
                  <MenuItem disabled>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search project managers..."
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </MenuItem>
                  
                  {filteredManagers.length > 0 ? (
                    filteredManagers.map((manager) => (
                      <MenuItem key={manager._id} value={manager.name}>
                        <Checkbox checked={newClient.projectManagers.includes(manager.name)} />
                        <Box display="flex" alignItems="center" sx={{ ml: 1, width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              fontSize: '0.8rem',
                              bgcolor: 'primary.main'
                            }}
                          >
                            {manager.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {manager.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap>
                              {manager.role} • {manager.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="textSecondary" align="center">
                        No project managers found
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Select one or more project managers *
              </Typography>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newClient.description}
                onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                placeholder="Enter client description..."
                helperText="Brief description about the client and project"
                disabled={loading}
              />
            </Grid>

            {/* Services */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={newClient.services}
                  onChange={(e) => setNewClient({...newClient, services: e.target.value})}
                  input={<OutlinedInput label="Services" />}
                  renderValue={(selected) => selected.join(', ')}
                  disabled={loading || services.length === 0}
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
                  No services available. Please add services first.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Progress"
                value={newClient.progress}
                onChange={(e) => setNewClient({...newClient, progress: e.target.value})}
                placeholder="28/40 (70%)"
                helperText="Format: completed/total (percentage)"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                placeholder="Additional notes..."
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          disabled={
            loading || 
            !newClient.client || 
            !newClient.company || 
            !newClient.city || 
            newClient.projectManagers.length === 0 ||
            services.length === 0
          }
        >
          {loading ? 'Adding Client...' : 
           services.length === 0 ? 'Add Services First' : 'Add Client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ClientManagement = () => {
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', name: '' });
  const [editDialog, setEditDialog] = useState({ open: false, client: null });
  const [viewDialog, setViewDialog] = useState({ open: false, client: null });
  const [servicesModal, setServicesModal] = useState(false);
  const [addClientModal, setAddClientModal] = useState(false);
  
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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: `${API_URL}/clientsservice`,
    timeout: 10000,
  });

  // Users API instance
  const usersApi = axios.create({
    baseURL: `${API_URL}/users`,
    timeout: 10000,
  });

  // Add request interceptor to include auth token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const usersRequestInterceptor = usersApi.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      usersApi.interceptors.request.eject(usersRequestInterceptor);
    };
  }, []);

  // Fetch all data from backend with error handling
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from backend...');
      
      // Fetch clients and services
      const [clientsRes, servicesRes] = await Promise.all([
        api.get('/', { params: filters }),
        api.get('/services')
      ]);
      
      console.log('Clients Response:', clientsRes.data);
      console.log('Services Response:', servicesRes.data);
      
      // Handle clients response
      if (clientsRes.data.success) {
        setClients(clientsRes.data.data || []);
        if (clientsRes.data.pagination) {
          setPagination(clientsRes.data.pagination);
        }
      }
      
      // Handle services response
      if (servicesRes.data.success) {
        setServices(servicesRes.data.data || []);
      }
      
      // Fetch project managers separately with better error handling
      try {
        const usersRes = await usersApi.get('/all-users');
        console.log('Users Response:', usersRes.data);
        
        if (usersRes.data) {
          setProjectManagers(usersRes.data);
        }
      } catch (usersError) {
        console.warn('Failed to fetch users, using empty array:', usersError.message);
        setProjectManagers([]);
        // Don't set error for users fetch failure as it's not critical
      }
      
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Data fetch failed';
      setError(errorMessage);
      
      // Set empty arrays on error
      setClients([]);
      setServices([]);
      setProjectManagers([]);
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

  // Add new client - UPDATED FOR MODAL
  const handleAddClient = async (clientData) => {
    try {
      setAddLoading(true);
      
      const response = await api.post('/', clientData);
      
      if (response.data.success) {
        setSuccess('Client added successfully!');
        setError('');
        setAddClientModal(false);
        fetchData();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Client add failed';
      setError(errorMessage);
      console.error('Add client error:', err);
    } finally {
      setAddLoading(false);
    }
  };

  // Update client
  const handleUpdateClient = async (clientId, updateData) => {
    try {
      const response = await api.put(`/${clientId}`, updateData);
      
      if (response.data.success) {
        setSuccess('Client updated successfully!');
        setEditDialog({ open: false, client: null });
        fetchData();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Client update failed';
      setError(errorMessage);
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
        const response = await api.delete(`/${id}`);
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
    setEditDialog({ 
      open: true, 
      client: {
        ...client,
        projectManagers: Array.isArray(client.projectManager) 
          ? client.projectManager 
          : client.projectManager ? [client.projectManager] : []
      }
    });
  };

  const handleEditSave = () => {
    const { client } = editDialog;
    handleUpdateClient(client._id, {
      client: client.client,
      company: client.company,
      city: client.city,
      projectManagers: client.projectManagers,
      services: client.services,
      status: client.status,
      progress: client.progress,
      email: client.email,
      phone: client.phone,
      address: client.address,
      description: client.description || '',
      notes: client.notes
    });
  };

  // View client details
  const handleViewClick = (client) => {
    setViewDialog({ open: true, client });
  };

  // Calculate progress percentage
  const getProgressPercentage = (progressString) => {
    if (!progressString) return 0;
    const match = progressString.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  // Format project managers for display
  const formatProjectManagers = (projectManager) => {
    if (!projectManager || projectManager.length === 0) return 'Not assigned';
    if (Array.isArray(projectManager)) {
      return projectManager.join(', ');
    }
    return projectManager;
  };

  // Handle task updates for services
  const handleTaskUpdate = (serviceName, tasks) => {
    console.log(`Tasks updated for ${serviceName}:`, tasks);
    // You can save this to your backend here if needed
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    console.log(`Progress for ${serviceName}: ${completedTasks}/${totalTasks} (${progress}%)`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading client data...
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
                startIcon={<AddIcon />}
                onClick={() => setAddClientModal(true)}
                variant="contained"
                sx={{ borderRadius: 2 }}
                disabled={services.length === 0}
              >
                Add New Client
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
                    {pagination.totalItems || clients.length}
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

      {/* Clients Table */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <PeopleIcon sx={{ mr: 1 }} />
                  All Clients ({pagination.totalItems || clients.length})
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Search clients..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
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
                  <FormControl size="small" sx={{ width: 180 }}>
                    <InputLabel>Project Manager</InputLabel>
                    <Select
                      value={filters.projectManager}
                      label="Project Manager"
                      onChange={(e) => handleFilterChange('projectManager', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {projectManagers.map((manager) => (
                        <MenuItem key={manager._id} value={manager.name}>
                          {manager.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ width: 150 }}>
                    <InputLabel>Service</InputLabel>
                    <Select
                      value={filters.service}
                      label="Service"
                      onChange={(e) => handleFilterChange('service', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {services.map((service) => (
                        <MenuItem key={service._id} value={service.servicename}>
                          {service.servicename}
                        </MenuItem>
                      ))}
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
                  <Table sx={{ minWidth: 1200 }}>
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
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {formatProjectManagers(client.projectManager)
                                .split(', ')
                                .map((manager, idx) => (
                                  <Chip
                                    key={idx}
                                    label={manager}
                                    color="info"
                                    size="small"
                                    variant="outlined"
                                  />
                                ))
                              }
                            </Box>
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
                              <Tooltip title="View Details & Manage Tasks">
                                <ActionButton
                                  color="info"
                                  onClick={() => handleViewClick(client)}
                                >
                                  <VisibilityIcon />
                                </ActionButton>
                              </Tooltip>
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
                {/* Pagination */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} entries
                  </Typography>
                  <Pagination
                    count={pagination.totalPages}
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
                  {services.length === 0 ? 
                    'Add services first to create clients' : 
                    'Add your first client using the "Add New Client" button'
                  }
                </Typography>
                {services.length === 0 && (
                  <Button 
                    variant="contained" 
                    startIcon={<WorkIcon />}
                    onClick={() => setServicesModal(true)}
                    sx={{ mt: 2 }}
                  >
                    Add Services First
                  </Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Add Client Modal */}
      <AddClientModal
        open={addClientModal}
        onClose={() => setAddClientModal(false)}
        onAddClient={handleAddClient}
        services={services}
        projectManagers={projectManagers}
        loading={addLoading}
      />

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

      {/* View Client Dialog - UPDATED WITH SERVICES PROGRESS */}
      <Dialog 
        open={viewDialog.open} 
        onClose={() => setViewDialog({ open: false, client: null })}
        maxWidth="md"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight="bold">
              Client Details & Task Management
            </Typography>
            <IconButton onClick={() => setViewDialog({ open: false, client: null })}>
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.client && (
            <Stack spacing={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon />
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Client Name</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.client}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Company</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.company}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">City</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.city}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <StatusChip label={viewDialog.client.status} status={viewDialog.client.status} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">Progress</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.progress}</Typography>
                    </Box>
                    {viewDialog.client.email && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Email</Typography>
                        <Typography variant="body1" fontWeight={600}>{viewDialog.client.email}</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Project Managers */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  Project Managers
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formatProjectManagers(viewDialog.client.projectManager)
                    .split(', ')
                    .map((manager, idx) => (
                      <Chip
                        key={idx}
                        label={manager}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
                </Box>
              </Box>

              {/* Services Progress Section - UPDATED */}
              {viewDialog.client.services && viewDialog.client.services.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    Services & Task Management
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Click the + icon to add tasks and checkboxes to mark them as completed
                  </Typography>
                  
                  {viewDialog.client.services.map((service, index) => (
                    <ServiceProgressCard
                      key={index}
                      service={service}
                      clientId={viewDialog.client._id}
                      onTaskUpdate={handleTaskUpdate}
                    />
                  ))}
                </Box>
              )}

              {/* Description */}
              {viewDialog.client.description && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiInfo />
                    Description
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body1">
                      {viewDialog.client.description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Additional Information */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon />
                  Additional Information
                </Typography>
                <Grid container spacing={2}>
                  {viewDialog.client.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.phone}</Typography>
                    </Grid>
                  )}
                  {viewDialog.client.address && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Address</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.address}</Typography>
                    </Grid>
                  )}
                  {viewDialog.client.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Notes</Typography>
                      <Typography variant="body1" fontWeight={600}>{viewDialog.client.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, client: null })}>Close</Button>
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
                  label="Client Name *"
                  value={editDialog.client.client}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, client: e.target.value }
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company *"
                  value={editDialog.client.company}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, company: e.target.value }
                  })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={editDialog.client.city}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, city: e.target.value }
                  })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editDialog.client.status}
                    label="Status"
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      client: { ...editDialog.client, status: e.target.value }
                    })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Project Managers */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Project Managers *</InputLabel>
                  <Select
                    multiple
                    value={editDialog.client.projectManagers || []}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      client: { ...editDialog.client, projectManagers: e.target.value }
                    })}
                    input={<OutlinedInput label="Project Managers *" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {projectManagers.map((manager) => (
                      <MenuItem key={manager._id} value={manager.name}>
                        <Checkbox checked={(editDialog.client.projectManagers || []).includes(manager.name)} />
                        <Box display="flex" alignItems="center" sx={{ ml: 1, width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              fontSize: '0.8rem',
                              bgcolor: 'primary.main'
                            }}
                          >
                            {manager.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {manager.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap>
                              {manager.role} • {manager.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={editDialog.client.description || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, description: e.target.value }
                  })}
                  placeholder="Enter client description..."
                  helperText="Brief description about the client and project"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Progress"
                  value={editDialog.client.progress}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, progress: e.target.value }
                  })}
                  placeholder="28/40 (70%)"
                  helperText="Format: completed/total (percentage)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editDialog.client.email || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, email: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editDialog.client.phone || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, phone: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editDialog.client.address || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, address: e.target.value }
                  })}
                />
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={editDialog.client.notes || ''}
                  onChange={(e) => setEditDialog({
                    ...editDialog,
                    client: { ...editDialog.client, notes: e.target.value }
                  })}
                  placeholder="Additional notes..."
                />
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
            disabled={!editDialog.client?.client || !editDialog.client?.company || !editDialog.client?.city || !editDialog.client?.projectManagers?.length}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default ClientManagement;