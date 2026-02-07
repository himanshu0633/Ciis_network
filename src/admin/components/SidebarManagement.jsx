import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Divider,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  CircularProgress,
  Tab,
  Tabs,
  InputAdornment,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventNoteIcon,
  Computer as ComputerIcon,
  Task as TaskIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
  VideoCall as VideoCallIcon,
  Person as PersonIcon,
  Business as ClientIcon,
  ListAlt as ListAltIcon,
  MeetingRoom as MeetingRoomIcon,
  Apartment as ProjectIcon,
  PersonAdd as PersonAddIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';

// Your routes configuration
const APP_ROUTES = [
  { path: 'change-password', name: 'Change Password', icon: 'Key', category: 'settings' },
  { path: 'emp-details', name: 'Employee Details', icon: 'Person', category: 'administration' },
  { path: 'emp-leaves', name: 'Employee Leaves', icon: 'EventNote', category: 'administration' },
  { path: 'emp-assets', name: 'Employee Assets', icon: 'Computer', category: 'administration' },
  { path: 'emp-attendance', name: 'Employee Attendance', icon: 'CalendarToday', category: 'administration' },
  { path: 'emp-task-management', name: 'Employee Task Management', icon: 'Task', category: 'administration' },
  { path: 'emp-task-details', name: 'Task Details', icon: 'Task', category: 'administration' },
  { path: 'admin-task-create', name: 'Admin Create Task', icon: 'Task', category: 'administration' },
  { path: 'admin-meeting', name: 'Admin Meeting', icon: 'MeetingRoom', category: 'meetings' },
  { path: 'adminproject', name: 'Admin Projects', icon: 'ProjectIcon', category: 'projects' },
  { path: 'company-all-task', name: 'Company All Tasks', icon: 'ListAlt', category: 'tasks' },
  { path: 'department-all-task', name: 'Department All Tasks', icon: 'ListAlt', category: 'tasks' },
  { path: 'emp-client', name: 'Client Management', icon: 'ClientIcon', category: 'clients' },
  { path: 'alert', name: 'Alerts', icon: 'Notifications', category: 'communication' },
  { path: 'attendance', name: 'My Attendance', icon: 'CalendarToday', category: 'main' },
  { path: 'my-assets', name: 'My Assets', icon: 'Computer', category: 'main' },
  { path: 'my-leaves', name: 'My Leaves', icon: 'EventNote', category: 'main' },
  { path: 'my-task-management', name: 'My Tasks', icon: 'Task', category: 'tasks' },
  { path: 'profile', name: 'Profile', icon: 'Person', category: 'settings' },
  { path: 'user-dashboard', name: 'Dashboard', icon: 'Dashboard', category: 'main' },
  { path: 'project', name: 'Projects', icon: 'Groups', category: 'projects' },
  { path: 'task-management', name: 'Task Management', icon: 'Task', category: 'tasks' },
  { path: 'employee-meeting', name: 'Employee Meeting', icon: 'VideoCall', category: 'meetings' },
  { path: 'client-meeting', name: 'Client Meeting', icon: 'VideoCall', category: 'meetings' },
  { path: 'create-user', name: 'Create User', icon: 'PersonAdd', category: 'administration' },
  { path: 'sidebar-management', name: 'Sidebar Management', icon: 'Menu', category: 'administration' }
];

const SidebarManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState({
    companies: false,
    departments: false,
    roles: false,
    saving: false,
    fetching: false
  });
  const [availablePages, setAvailablePages] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [existingConfigs, setExistingConfigs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [allRoles, setAllRoles] = useState(['admin', 'user', 'hr', 'manager', 'SuperAdmin', 'intern', 'employee', 'team-lead']);
  const [customRoles, setCustomRoles] = useState([]);

  // Initialize with your routes
  useEffect(() => {
    initializePages();
    fetchCompanies();
  }, []);

  const initializePages = () => {
    const pages = APP_ROUTES.map(route => ({
      id: route.path,
      name: route.name,
      path: `/ciisUser/${route.path}`,
      icon: route.icon,
      category: route.category,
      description: `Access: ${route.category === 'administration' ? 'Admin Only' : 'All Users'}`
    }));
    setAvailablePages(pages);
  };

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      setLoading(prev => ({ ...prev, companies: true }));
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/company', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Companies API Response:', response.data);
      
      if (response.data && response.data.success && Array.isArray(response.data.companies)) {
        const activeCompanies = response.data.companies.filter(company => company.isActive);
        setCompanies(activeCompanies);
      } else if (Array.isArray(response.data)) {
        const activeCompanies = response.data.filter(company => company.isActive);
        setCompanies(activeCompanies);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load companies',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, companies: false }));
    }
  };

  // ✅ FIXED: Fetch departments when company is selected
  useEffect(() => {
    if (selectedCompany) {
      fetchDepartments(selectedCompany);
      fetchExistingConfigs(selectedCompany);
    } else {
      setDepartments([]);
      setSelectedDepartment('');
      setJobRoles([]);
      setSelectedRole('');
    }
  }, [selectedCompany]);

  const fetchDepartments = async (companyId) => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/departments?company=${companyId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Departments API Response:', response.data);
      
      if (response.data && response.data.success && response.data.departments) {
        // ✅ Ensure we store only department objects with _id and name
        const formattedDepartments = response.data.departments.map(dept => ({
          _id: dept._id || dept.id,
          name: dept.name || dept.departmentName,
          description: dept.description || ''
        }));
        setDepartments(formattedDepartments);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load departments',
        severity: 'error'
      });
      setDepartments([]);
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };

  // ✅ FIXED: Fetch job roles when department is selected
  useEffect(() => {
    if (selectedDepartment) {
      fetchJobRoles(selectedDepartment);
    } else {
      setJobRoles([]);
      setSelectedRole('');
    }
  }, [selectedDepartment]);

  const fetchJobRoles = async (departmentId) => {
    try {
      setLoading(prev => ({ ...prev, roles: true }));
      
      // ✅ Ensure departmentId is a string, not an object
      const deptId = typeof departmentId === 'object' ? departmentId._id || departmentId.id : departmentId;
      
      if (!deptId) {
        console.error('Invalid department ID:', departmentId);
        setJobRoles([]);
        return;
      }

      const token = localStorage.getItem('token');
      
      console.log('Fetching job roles for department:', deptId);
      
      try {
        // Try to get job roles from API
        const response = await axios.get(`/api/job-roles/department/${deptId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Job Roles API Response:', response.data);
        
        if (response.data && response.data.success && response.data.jobRoles) {
          const formattedRoles = response.data.jobRoles.map(role => ({
            _id: role._id || role.id,
            name: role.name || role.roleName,
            description: role.description || ''
          }));
          setJobRoles(formattedRoles);
          return;
        }
      } catch (apiError) {
        console.log('Job roles API failed, trying alternative methods:', apiError.message);
      }
      
      // Alternative: Get roles from system roles
      setJobRoles(allRoles.map(role => ({ name: role })));
      
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  };

  // ✅ FIXED: Fetch existing configurations
  const fetchExistingConfigs = async (companyId) => {
    try {
      setLoading(prev => ({ ...prev, fetching: true }));
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/sidebar`, {
        params: { companyId },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Existing configs response:', response.data);
      
      if (response.data && response.data.success) {
        // ✅ Ensure we handle populated data correctly
        const formattedConfigs = (response.data.data || []).map(config => {
          // Extract departmentId correctly (could be string or object)
          let departmentId = config.departmentId;
          if (typeof departmentId === 'object') {
            departmentId = departmentId._id || departmentId.id;
          }
          
          // Extract companyId correctly
          let companyId = config.companyId;
          if (typeof companyId === 'object') {
            companyId = companyId._id || companyId.id;
          }
          
          return {
            ...config,
            departmentId,
            companyId,
            _id: config._id || config.id
          };
        });
        
        setExistingConfigs(formattedConfigs);
      } else {
        setExistingConfigs([]);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      setExistingConfigs([]);
    } finally {
      setLoading(prev => ({ ...prev, fetching: false }));
    }
  };

  // Handle company selection
  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);
    setSelectedDepartment('');
    setSelectedRole('');
    setSelectedItems([]);
    setDepartments([]);
    setJobRoles([]);
  };

  // Handle department selection
  const handleDepartmentChange = (event) => {
    const departmentId = event.target.value;
    setSelectedDepartment(departmentId);
    setSelectedRole('');
    setSelectedItems([]);
    setJobRoles([]);
  };

  // Handle role selection
  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    
    // Load existing config for this combination
    if (selectedCompany && selectedDepartment && role) {
      loadExistingConfig(selectedCompany, selectedDepartment, role);
    } else {
      setSelectedItems([]);
    }
  };

  // ✅ FIXED: Load existing configuration
  const loadExistingConfig = async (companyId, departmentId, role) => {
    try {
      console.log('Loading config for:', { companyId, departmentId, role });
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/sidebar/config`, {
        params: { 
          companyId, 
          departmentId, 
          role 
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Load existing config response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        setSelectedItems(response.data.data.menuItems.map(item => item.id));
      } else {
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Error loading existing config:', error);
      setSelectedItems([]);
    }
  };

  // ✅ FIXED: Edit existing configuration
  const handleEdit = async (config) => {
    try {
      console.log('Editing config:', config);
      
      // Extract IDs correctly
      const companyId = typeof config.companyId === 'object' ? config.companyId._id : config.companyId;
      const departmentId = typeof config.departmentId === 'object' ? config.departmentId._id : config.departmentId;
      const role = config.role;
      
      console.log('Extracted IDs:', { companyId, departmentId, role });
      
      // Set the values
      setSelectedCompany(companyId);
      setSelectedDepartment(departmentId);
      setSelectedRole(role);
      setSelectedItems(config.menuItems.map(item => item.id));
      setActiveTab(0);
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Loaded configuration for ${role} role`,
        severity: 'success'
      });
      
      // Wait a bit for state to update, then fetch departments and roles
      setTimeout(() => {
        if (companyId) {
          fetchDepartments(companyId);
        }
        if (departmentId) {
          fetchJobRoles(departmentId);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error in handleEdit:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load configuration',
        severity: 'error'
      });
    }
  };

  // Handle menu item selection
  const handleMenuItemToggle = (pageId) => {
    setSelectedItems(prev => {
      if (prev.includes(pageId)) {
        return prev.filter(id => id !== pageId);
      } else {
        return [...prev, pageId];
      }
    });
  };

  // Select all items in category
  const handleSelectAllCategory = (category) => {
    const categoryPages = availablePages.filter(page => page.category === category);
    const categoryIds = categoryPages.map(page => page.id);
    
    setSelectedItems(prev => {
      const allSelected = categoryIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect all
        return prev.filter(id => !categoryIds.includes(id));
      } else {
        // Select all
        return [...new Set([...prev, ...categoryIds])];
      }
    });
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Group pages by category
  const groupedPages = availablePages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {});

  // Save configuration
  const handleSave = async () => {
    if (!selectedCompany || !selectedDepartment || !selectedRole) {
      setSnackbar({
        open: true,
        message: 'Please select company, department and role',
        severity: 'warning'
      });
      return;
    }

    if (selectedItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one menu item',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, saving: true }));
      const token = localStorage.getItem('token');
      
      const configData = {
        companyId: selectedCompany,
        departmentId: selectedDepartment,
        role: selectedRole,
        menuItems: selectedItems.map(id => {
          const page = availablePages.find(p => p.id === id);
          return {
            id: page.id,
            name: page.name,
            icon: page.icon,
            path: page.path,
            category: page.category
          };
        })
      };

      console.log('Saving config data:', configData);

      // Check if config exists
      const checkResponse = await axios.get(`/api/sidebar/config`, {
        params: { 
          companyId: selectedCompany, 
          departmentId: selectedDepartment, 
          role: selectedRole 
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let response;
      if (checkResponse.data && checkResponse.data.success && checkResponse.data.data) {
        // Update existing config
        response = await axios.put(`/api/sidebar/${checkResponse.data.data._id}`, configData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new config
        response = await axios.post('/api/sidebar', configData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Save response:', response.data);

      if (response.data.success) {
        // Refresh existing configs
        await fetchExistingConfigs(selectedCompany);
        
        setSnackbar({
          open: true,
          message: response.data.message || 'Configuration saved successfully!',
          severity: 'success'
        });
        
        // Also reload the config for current selection
        await loadExistingConfig(selectedCompany, selectedDepartment, selectedRole);
      } else {
        throw new Error(response.data.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      
      let errorMessage = 'Failed to save configuration';
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // ✅ FIXED: Delete configuration
  const handleDelete = async (configId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This configuration will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`/api/sidebar/${configId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setExistingConfigs(prev => prev.filter(config => config._id !== configId));
          
          setSnackbar({
            open: true,
            message: 'Configuration deleted successfully',
            severity: 'success'
          });
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Error deleting config:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete configuration',
          severity: 'error'
        });
      }
    }
  };

  // ✅ FIXED: Refresh job roles manually
  const handleRefreshRoles = async () => {
    if (selectedDepartment) {
      await fetchJobRoles(selectedDepartment);
      setSnackbar({
        open: true,
        message: 'Roles refreshed successfully',
        severity: 'success'
      });
    }
  };

  // Preview configuration
  const handlePreview = (config) => {
    setPreviewConfig(config);
    setOpenPreview(true);
  };

  // Add custom role
  const handleAddRole = () => {
    Swal.fire({
      title: 'Add Custom Role',
      input: 'text',
      inputLabel: 'Enter role name',
      inputPlaceholder: 'e.g., team-lead, supervisor, executive',
      showCancelButton: true,
      confirmButtonText: 'Add Role',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Role name is required!';
        }
        const allAvailableRoles = getAllAvailableRoles();
        if (allAvailableRoles.includes(value.toLowerCase())) {
          return 'Role already exists!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newRole = result.value.toLowerCase();
        setCustomRoles(prev => [...prev, newRole]);
        setSnackbar({
          open: true,
          message: `Role "${result.value}" added successfully`,
          severity: 'success'
        });
      }
    });
  };

  // Get all available roles
  const getAllAvailableRoles = () => {
    const jobRoleNames = jobRoles.map(role => typeof role === 'string' ? role : role.name).filter(Boolean);
    return [...new Set([...allRoles, ...customRoles, ...jobRoleNames])]
      .sort();
  };

  // Render icon component
  const renderIcon = (iconName) => {
    const iconComponents = {
      Dashboard: <DashboardIcon />,
      CalendarToday: <CalendarIcon />,
      EventNote: <EventNoteIcon />,
      Computer: <ComputerIcon />,
      Task: <TaskIcon />,
      Groups: <GroupsIcon />,
      Notifications: <NotificationsIcon />,
      VideoCall: <VideoCallIcon />,
      Person: <PersonIcon />,
      ClientIcon: <ClientIcon />,
      ListAlt: <ListAltIcon />,
      MeetingRoom: <MeetingRoomIcon />,
      ProjectIcon: <ProjectIcon />,
      PersonAdd: <PersonAddIcon />,
      Key: <KeyIcon />,
      Menu: <MenuIcon />
    };
    
    return iconComponents[iconName] || <DashboardIcon />;
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'main': 'Main Menu',
      'tasks': 'Tasks',
      'projects': 'Projects',
      'meetings': 'Meetings',
      'administration': 'Administration',
      'settings': 'Settings',
      'communication': 'Communication',
      'clients': 'Clients'
    };
    return categoryNames[category] || category;
  };

  // ✅ FIXED: Get company name
  const getCompanyName = (companyId) => {
    if (!companyId) return 'Unknown Company';
    
    const company = companies.find(c => c._id === companyId);
    if (company) return company.companyName;
    
    // Check if companyId is an object
    if (typeof companyId === 'object') {
      return companyId.companyName || 'Unknown Company';
    }
    
    return 'Unknown Company';
  };

  // ✅ FIXED: Get department name
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Unknown Department';
    
    const department = departments.find(d => d._id === departmentId);
    if (department) return department.name;
    
    // Check if departmentId is an object
    if (typeof departmentId === 'object') {
      return departmentId.name || departmentId.departmentName || 'Unknown Department';
    }
    
    return 'Unknown Department';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 600 }}>
        <MenuIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Sidebar Menu Configuration
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Configure Menu" />
          <Tab label="Existing Configurations" />
        </Tabs>
      </Paper>

      {/* Tab 1: Configuration */}
      {activeTab === 0 && (
        <>
          {/* Selection Card */}
          <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
                Step 1: Select Company, Department & Role
              </Typography>
              
              <Grid container spacing={3}>
                {/* Company Selection */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Company</InputLabel>
                    <Select
                      value={selectedCompany}
                      onChange={handleCompanyChange}
                      label="Company"
                      disabled={loading.companies}
                    >
                      <MenuItem value="">
                        <em>Select Company</em>
                      </MenuItem>
                      {loading.companies ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading companies...
                        </MenuItem>
                      ) : (
                        companies.map((company) => (
                          <MenuItem key={company._id} value={company._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BusinessIcon sx={{ mr: 1.5, fontSize: 'small', color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body2">{company.companyName}</Typography>
                                {company.companyCode && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Code: {company.companyCode}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                      {companies.length === 0 && !loading.companies && (
                        <MenuItem disabled>No active companies found</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  {!loading.companies && companies.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {companies.length} active company{companies.length !== 1 ? 'ies' : ''} found
                    </Typography>
                  )}
                </Grid>

                {/* Department Selection */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" size="small" disabled={!selectedCompany || loading.departments}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      label="Department"
                    >
                      <MenuItem value="">
                        <em>Select Department</em>
                      </MenuItem>
                      {loading.departments ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading departments...
                        </MenuItem>
                      ) : (
                        departments.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ApartmentIcon sx={{ mr: 1.5, fontSize: 'small', color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body2">{dept.name}</Typography>
                                {dept.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {dept.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                      {departments.length === 0 && !loading.departments && selectedCompany && (
                        <MenuItem disabled>No departments found</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  {selectedCompany && !loading.departments && departments.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {departments.length} department{departments.length !== 1 ? 's' : ''} found
                    </Typography>
                  )}
                </Grid>

                {/* Role Selection */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined" size="small" disabled={!selectedDepartment}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedRole}
                      onChange={handleRoleChange}
                      label="Role"
                    >
                      <MenuItem value="">
                        <em>Select Role</em>
                      </MenuItem>
                      {loading.roles ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading roles...
                        </MenuItem>
                      ) : (
                        getAllAvailableRoles().map((role) => (
                          <MenuItem key={role} value={role}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SecurityIcon sx={{ mr: 1.5, fontSize: 'small', color: 'primary.main' }} />
                              <Typography variant="body2">
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                {customRoles.includes(role) && (
                                  <Chip label="Custom" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                                )}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                      {getAllAvailableRoles().length === 0 && !loading.roles && selectedDepartment && (
                        <MenuItem disabled>No roles found</MenuItem>
                      )}
                    </Select>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddRole}
                        disabled={!selectedDepartment}
                        variant="outlined"
                      >
                        Add Role
                      </Button>
                      <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefreshRoles}
                        disabled={!selectedDepartment || loading.roles}
                        variant="outlined"
                      >
                        Refresh
                      </Button>
                    </Box>
                  </FormControl>
                  {selectedDepartment && !loading.roles && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {getAllAvailableRoles().length} role{getAllAvailableRoles().length !== 1 ? 's' : ''} available
                    </Typography>
                  )}
                </Grid>

                {/* Selected Combination Display */}
                {selectedCompany && selectedDepartment && selectedRole && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: 'primary.light', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'primary.main'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" color="primary.dark">
                            Configuring for:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Chip 
                              icon={<BusinessIcon />}
                              label={getCompanyName(selectedCompany)} 
                              size="small"
                              color="primary"
                            />
                            <Chip 
                              icon={<ApartmentIcon />}
                              label={getDepartmentName(selectedDepartment)} 
                              size="small"
                              color="primary"
                            />
                            <Chip 
                              icon={<SecurityIcon />}
                              label={selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} 
                              size="small"
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {selectedItems.length} menu items selected
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={loading.saving || selectedItems.length === 0}
                          size="small"
                        >
                          {loading.saving ? <CircularProgress size={20} /> : 'Save Configuration'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Menu Items Selection */}
          {selectedCompany && selectedDepartment && selectedRole && (
            <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Step 2: Select Menu Items
                    <Chip 
                      label={`${selectedItems.length} selected`} 
                      color="primary" 
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                  
                  <TextField
                    size="small"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Menu Items by Category */}
                {Object.entries(groupedPages).map(([category, pages]) => {
                  const filteredCategoryPages = searchTerm 
                    ? pages.filter(page =>
                        page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        page.path.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    : pages;

                  if (filteredCategoryPages.length === 0) return null;

                  const isExpanded = expandedCategories[category] !== false;
                  const categorySelectedCount = filteredCategoryPages.filter(page => 
                    selectedItems.includes(page.id)
                  ).length;
                  const isAllSelected = categorySelectedCount === filteredCategoryPages.length;

                  return (
                    <Box key={category} sx={{ mb: 3 }}>
                      {/* Category Header */}
                      <Paper 
                        elevation={1}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          cursor: 'pointer',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => toggleCategory(category)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small" sx={{ mr: 1 }}>
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 600,
                              color: 'primary.dark'
                            }}>
                              {getCategoryDisplayName(category)}
                            </Typography>
                            <Chip 
                              label={`${categorySelectedCount}/${filteredCategoryPages.length}`}
                              size="small"
                              color={isAllSelected ? "success" : "default"}
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAllCategory(category);
                            }}
                          >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                        </Box>
                      </Paper>

                      {/* Category Items */}
                      <Collapse in={isExpanded}>
                        <Grid container spacing={2}>
                          {filteredCategoryPages.map((page) => {
                            const isSelected = selectedItems.includes(page.id);
                            return (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={page.id}>
                                <Paper
                                  elevation={isSelected ? 3 : 1}
                                  sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    bgcolor: isSelected ? 'primary.light' : 'background.paper',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: 3
                                    },
                                    position: 'relative'
                                  }}
                                  onClick={() => handleMenuItemToggle(page.id)}
                                >
                                  {isSelected && (
                                    <CheckCircleIcon 
                                      sx={{ 
                                        position: 'absolute', 
                                        top: 8, 
                                        right: 8, 
                                        color: 'success.main',
                                        fontSize: '1rem'
                                      }} 
                                    />
                                  )}
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Checkbox
                                      checked={isSelected}
                                      color="primary"
                                      size="small"
                                      sx={{ mr: 1 }}
                                    />
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      color: isSelected ? 'primary.main' : 'text.primary'
                                    }}>
                                      {renderIcon(page.icon)}
                                      <Typography variant="body2" sx={{ fontWeight: 500, ml: 1 }}>
                                        {page.name}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ 
                                    ml: 4, 
                                    display: 'block',
                                    fontFamily: 'monospace',
                                    fontSize: '0.7rem'
                                  }}>
                                    {page.path}
                                  </Typography>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Collapse>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tab 2: Existing Configurations */}
      {activeTab === 1 && (
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Existing Menu Configurations
                {existingConfigs.length > 0 && (
                  <Chip 
                    label={`${existingConfigs.length} configs`} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                  <InputLabel>Filter by Company</InputLabel>
                  <Select
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    label="Filter by Company"
                  >
                    <MenuItem value="">All Companies</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company._id} value={company._id}>
                        {company.companyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => selectedCompany && fetchExistingConfigs(selectedCompany)}
                  disabled={loading.fetching}
                  size="small"
                >
                  {loading.fetching ? <CircularProgress size={20} /> : 'Refresh'}
                </Button>
              </Box>
            </Box>

            {loading.fetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : existingConfigs.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No configurations found. Create a new configuration in the "Configure Menu" tab.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {existingConfigs.map((config) => (
                  <Grid item xs={12} md={6} lg={4} key={config._id}>
                    <Paper sx={{ 
                      p: 2, 
                      borderLeft: '4px solid', 
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      height: '100%',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {getDepartmentName(config.departmentId)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <BusinessIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle' }} />
                            {getCompanyName(config.companyId)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <SecurityIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'text.secondary' }} />
                            <Chip 
                              label={config.role} 
                              size="small" 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {config.menuItems.length} menu items • Updated: {new Date(config.updatedAt || config.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => handlePreview(config)}
                              sx={{ mr: 0.5 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(config)}
                              sx={{ mr: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(config._id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ maxHeight: 120, overflow: 'auto', mb: 1 }}>
                        <Grid container spacing={0.5}>
                          {config.menuItems.slice(0, 5).map((item) => (
                            <Grid item key={item.id}>
                              <Chip
                                label={item.name}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                icon={renderIcon(item.icon)}
                                variant="outlined"
                              />
                            </Grid>
                          ))}
                          {config.menuItems.length > 5 && (
                            <Grid item>
                              <Chip
                                label={`+${config.menuItems.length - 5} more`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                                variant="outlined"
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={openPreview} 
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Menu Preview
          <Typography variant="caption" display="block" color="text.secondary">
            {previewConfig && 
              `${getCompanyName(previewConfig.companyId)} - 
               ${getDepartmentName(previewConfig.departmentId)} - 
               ${previewConfig.role}`
            }
          </Typography>
        </DialogTitle>
        <DialogContent>
          {previewConfig && (
            <List>
              {previewConfig.menuItems.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemIcon>
                    {renderIcon(item.icon)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {item.path}
                        </Typography>
                        <Chip 
                          label={getCategoryDisplayName(item.category)}
                          size="small"
                          sx={{ ml: 1 }}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SidebarManagement;