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
import axios from "../../utils/axiosConfig";
import axiosInstance from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

// Your routes configuration
const APP_ROUTES = [
  { path: 'emp-details', name: 'Employee Details', icon: 'Person', category: 'administration' },
  { path: 'emp-leaves', name: 'Employee Leaves', icon: 'EventNote', category: 'administration' },
  { path: 'emp-assets', name: 'Employee Assets', icon: 'Computer', category: 'administration' },
  { path: 'emp-attendance', name: 'Employee Attendance', icon: 'CalendarToday', category: 'administration' },
  { path: 'admin-task-create', name: 'Admin Create Task', icon: 'Task', category: 'administration' },
  { path: 'admin-meeting', name: 'Create Employee Meeting', icon: 'MeetingRoom', category: 'meetings' },
  { path: 'adminproject', name: 'Admin Projects', icon: 'ProjectIcon', category: 'projects' },
  { path: 'company-all-task', name: 'Company All Tasks', icon: 'ListAlt', category: 'tasks' },
  { path: 'department-all-task', name: 'Department All Tasks', icon: 'ListAlt', category: 'tasks' },
  { path: 'emp-client', name: 'Client Management', icon: 'ClientIcon', category: 'clients' },
  { path: 'alert', name: 'Alerts', icon: 'Notifications', category: 'communication' },
  { path: 'attendance', name: 'My Attendance', icon: 'CalendarToday', category: 'main' },
  { path: 'my-assets', name: 'My Assets', icon: 'Computer', category: 'main' },
  { path: 'my-leaves', name: 'My Leaves', icon: 'EventNote', category: 'main' },
  { path: 'user-dashboard', name: 'Dashboard', icon: 'Dashboard', category: 'main' },
  { path: 'project', name: 'Projects', icon: 'Groups', category: 'projects' },
  { path: 'task-management', name: 'Create Task', icon: 'Task', category: 'tasks' },
  { path: 'employee-meeting', name: 'Employee Meeting', icon: 'VideoCall', category: 'meetings' },
  { path: 'client-meeting', name: 'Client Meeting', icon: 'VideoCall', category: 'meetings' },
    
];

const SidebarManagement = () => {
  // Get company from localStorage - MULTIPLE FORMAT SUPPORT
  const getCompanyFromLocalStorage = () => {
    try {
      // Try multiple possible storage formats
      const possibleKeys = ['user', 'currentUser', 'companyData', 'selectedCompany', 'currentCompany'];
      
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsedData = JSON.parse(data);
          
          // Check different possible structures
          if (parsedData.company) {
            // Format: {user: {company: {...}}}
            return parsedData.company;
          } else if (parsedData._id && parsedData.companyName) {
            // Format: direct company object
            return parsedData;
          } else if (parsedData.companyId && parsedData.companyName) {
            // Format: {companyId: "...", companyName: "..."}
            return parsedData;
          } else if (parsedData.companyDetails) {
            // Format: {companyDetails: {...}}
            return parsedData.companyDetails;
          }
        }
      }
      
      // Try to find any object that looks like a company
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('company') || key.includes('Company')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data && data._id && data.companyName) {
              return data;
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting company from localStorage:', error);
      return null;
    }
  };

  const [company, setCompany] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
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
  const [customRoles, setCustomRoles] = useState([]);

  // Initialize with your routes and get company from localStorage
  useEffect(() => {
    initializePages();
    initializeCompanyFromLocalStorage();
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

  // Get company from localStorage
  const initializeCompanyFromLocalStorage = async () => {
    try {
      const companyFromStorage = getCompanyFromLocalStorage();
      
      if (companyFromStorage && companyFromStorage._id) {
        setCompany(companyFromStorage);
        await fetchDepartments(companyFromStorage._id);
        await fetchExistingConfigs(companyFromStorage._id);
        
        setSnackbar({
          open: true,
          message: `Loaded company: ${companyFromStorage.companyName}`,
          severity: 'success'
        });
      } else {
        // Try to get company from API using token
        await tryGetCompanyFromAPI();
      }
    } catch (error) {
      console.error('Error initializing company:', error);
      setSnackbar({
        open: true,
        message: 'Error loading company information',
        severity: 'error'
      });
    }
  };

  // Try to get company from API
  const tryGetCompanyFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Try different API endpoints
      const endpoints = [
        '/auth/me',
        '/user/profile',
        '/company/current',
        '/company/my-company'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axiosInstance.get(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data) {
            let companyData = null;
            
            // Check different response formats
            if (response.data.company) {
              companyData = response.data.company;
            } else if (response.data.data && response.data.data.company) {
              companyData = response.data.data.company;
            } else if (response.data._id && response.data.companyName) {
              companyData = response.data;
            } else if (response.data.user && response.data.user.company) {
              companyData = response.data.user.company;
            }
            
            if (companyData && companyData._id) {
              setCompany(companyData);
              await fetchDepartments(companyData._id);
              await fetchExistingConfigs(companyData._id);
              
              // Save to localStorage for future
              localStorage.setItem('currentCompany', JSON.stringify(companyData));
              
              setSnackbar({
                open: true,
                message: `Loaded company from API: ${companyData.companyName}`,
                severity: 'success'
              });
              return;
            }
          }
        } catch (apiError) {
          console.log(`API endpoint ${endpoint} failed:`, apiError.message);
          continue;
        }
      }
      
      // If all API calls fail
      setSnackbar({
        open: true,
        message: 'Unable to load company information. Please check your connection.',
        severity: 'error'
      });
      
    } catch (error) {
      console.error('Error getting company from API:', error);
    }
  };

  // Manual company input fallback
  const handleManualCompanyInput = () => {
    Swal.fire({
      title: 'Enter Company ID',
      input: 'text',
      inputLabel: 'Company ID',
      inputPlaceholder: 'Enter your company ID (e.g., 698977b6159a098f2160342b)',
      showCancelButton: true,
      confirmButtonText: 'Load Company',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Company ID is required!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const companyId = result.value;
        try {
          const token = localStorage.getItem('token');
          const response = await axiosInstance.get(`/company/${companyId}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data && response.data.company) {
            setCompany(response.data.company);
            await fetchDepartments(companyId);
            await fetchExistingConfigs(companyId);
            
            setSnackbar({
              open: true,
              message: `Loaded company: ${response.data.company.companyName}`,
              severity: 'success'
            });
          } else {
            throw new Error('Company not found');
          }
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'Failed to load company from ID',
            severity: 'error'
          });
        }
      }
    });
  };

  // Fetch departments when company is available
  useEffect(() => {
    if (company && company._id) {
      fetchDepartments(company._id);
    }
  }, [company]);

  const fetchDepartments = async (companyId) => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/departments?company=${companyId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success && response.data.departments) {
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

  // Fetch job roles when department is selected
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
      
      const deptId = typeof departmentId === 'object' ? departmentId._id || departmentId.id : departmentId;
      
      if (!deptId) {
        console.error('Invalid department ID:', departmentId);
        setJobRoles([]);
        return;
      }

      const token = localStorage.getItem('token');
      
      console.log('Fetching job roles for department:', deptId);
      
      try {
        const response = await axiosInstance.get(`/job-roles/department/${deptId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success && response.data.jobRoles) {
          const formattedRoles = response.data.jobRoles.map(role => ({
            _id: role._id, // ID
            name: role.name, // Name
            description: role.description || role.name
          }));
          setJobRoles(formattedRoles);
          return;
        }
      } catch (apiError) {
        console.log('Job roles API failed:', apiError.message);
      }
      
      setJobRoles([]);
      
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  };

  // Fetch existing configurations
  const fetchExistingConfigs = async (companyId) => {
    try {
      setLoading(prev => ({ ...prev, fetching: true }));
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/sidebar`, {
        params: { companyId },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        const formattedConfigs = (response.data.data || []).map(config => {
          let departmentId = config.departmentId;
          if (typeof departmentId === 'object') {
            departmentId = departmentId._id || departmentId.id;
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
    const roleId = event.target.value;
    if (roleId === 'custom') {
      handleAddRole();
      return;
    }
    setSelectedRole(roleId);
    
    // Load existing config for this combination
    if (company && company._id && selectedDepartment && roleId) {
      loadExistingConfig(company._id, selectedDepartment, roleId);
    } else {
      setSelectedItems([]);
    }
  };

  // Load existing configuration
  const loadExistingConfig = async (companyId, departmentId, roleId) => {
    try {
      console.log('Loading config for:', { companyId, departmentId, roleId });
      
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/sidebar/config`, {
        params: { 
          companyId, 
          departmentId, 
          role: roleId 
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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

  // Edit existing configuration
  const handleEdit = async (config) => {
    try {
      const departmentId = typeof config.departmentId === 'object' ? config.departmentId._id : config.departmentId;
      const roleId = config.role; // Backend से role में ID आती है
      
      // Set the values
      setSelectedDepartment(departmentId);
      setSelectedRole(roleId);
      setSelectedItems(config.menuItems.map(item => item.id));
      setActiveTab(0);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Loaded configuration for role',
        severity: 'success'
      });
      
      // Wait a bit for state to update, then fetch roles
      setTimeout(() => {
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
        return prev.filter(id => !categoryIds.includes(id));
      } else {
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
    if (!company || !company._id || !selectedDepartment || !selectedRole) {
      setSnackbar({
        open: true,
        message: 'Please select department and role',
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
        companyId: company._id,
        departmentId: selectedDepartment,
        role: selectedRole, // ✅ Backend में role field में ID भेजें
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
      const checkResponse = await axiosInstance.get(`/sidebar/config`, {
        params: { 
          companyId: company._id, 
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
        response = await axiosInstance.put(`/sidebar/${checkResponse.data.data._id}`, configData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new config
        response = await axios.post('/sidebar', configData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Save response:', response.data);

      if (response.data.success) {
        await fetchExistingConfigs(company._id);
        
        setSnackbar({
          open: true,
          message: response.data.message || 'Configuration saved successfully!',
          severity: 'success'
        });
        
        await loadExistingConfig(company._id, selectedDepartment, selectedRole);
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

  // Delete configuration
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
        const response = await axiosInstance.delete(`/api/sidebar/${configId}`, {
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

  // Refresh job roles manually
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
        const allRoles = getAllAvailableRoles();
        const roleExists = allRoles.some(role => 
          role.name.toLowerCase() === value.toLowerCase()
        );
        if (roleExists) {
          return 'Role already exists!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newRoleName = result.value.toUpperCase();
        const newRole = {
          _id: `custom_${Date.now()}`,
          name: newRoleName,
          description: `${newRoleName} (Custom)`,
          isCustom: true
        };
        
        setCustomRoles(prev => [...prev, newRole]);
        
        // Auto-select the new role
        setSelectedRole(newRole._id);
        
        setSnackbar({
          open: true,
          message: `Custom role "${newRoleName}" added successfully`,
          severity: 'success'
        });
      }
    });
  };

  // Get all available roles for dropdown
  const getAllAvailableRoles = () => {
    const allRolesList = [...jobRoles, ...customRoles];
    return allRolesList.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get role name by ID
  const getRoleNameById = (roleId) => {
    if (!roleId) return 'Unknown Role';
    
    const allRoles = getAllAvailableRoles();
    const role = allRoles.find(r => r._id === roleId);
    
    if (role) return role.name;
    
    // Check in existing configs
    const config = existingConfigs.find(c => c.role === roleId);
    if (config && config.roleName) return config.roleName;
    
    return roleId; // Return ID if name not found
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
      'clients': 'Clients',
      'supperAdmin': 'Super Admin',
    };
    return categoryNames[category] || category;
  };

  // Get department name
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Unknown Department';
    
    const department = departments.find(d => d._id === departmentId);
    if (department) return department.name;
    
    if (typeof departmentId === 'object') {
      return departmentId.name || departmentId.departmentName || 'Unknown Department';
    }
    
    return 'Unknown Department';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 600 }}>
        <MenuIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Sidebar Menu Configuration
      </Typography>

      {/* Current Company Display or Error */}
      {/* {company ? (
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: 'primary.light', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.main'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <BusinessIcon sx={{ mr: 2, fontSize: 'large', color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ color: 'primary.dark' }}>
                    {company.companyName}
                  </Typography>
                  <Chip 
                    label={company.companyCode}
                    size="small"
                    color="secondary"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={company.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={company.isActive ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Company ID:</strong> {company._id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Domain:</strong> {company.companyDomain}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Owner:</strong> {company.ownerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {formatDate(company.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Subscription Expiry:</strong> {formatDate(company.subscriptionExpiry)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Login URL:</strong> {company.loginUrl}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Chip 
              label="Current Company"
              color="primary"
              variant="outlined"
              icon={<BusinessIcon />}
              sx={{ ml: 2 }}
            />
          </Box>
        </Paper>
      ) : (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleManualCompanyInput}
            >
              Enter Manually
            </Button>
          }
        >
          Company information not found. Please login again or enter company ID manually.
        </Alert>
      )} */}

      {/* Tabs */}
      {company ? (
        <>
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
                    Step 1: Select Department & Role
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Department Selection */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" size="small" disabled={!company || loading.departments}>
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
                          {departments.length === 0 && !loading.departments && company && (
                            <MenuItem disabled>No departments found</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      {company && !loading.departments && departments.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {departments.length} department{departments.length !== 1 ? 's' : ''} found
                        </Typography>
                      )}
                    </Grid>

                    {/* Role Selection */}
                    <Grid item xs={12} md={6}>
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
                              <MenuItem key={role._id} value={role._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <SecurityIcon sx={{ mr: 1.5, fontSize: 'small', color: 'primary.main' }} />
                                  <Box>
                                    <Typography variant="body2">
                                      {role.name}
                                    </Typography>
                                    {role.description && (
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {role.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  {role.isCustom && (
                                    <Chip 
                                      label="Custom" 
                                      size="small" 
                                      sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} 
                                    />
                                  )}
                                </Box>
                              </MenuItem>
                            ))
                          )}
                          {getAllAvailableRoles().length === 0 && !loading.roles && selectedDepartment && (
                            <MenuItem disabled>No roles found</MenuItem>
                          )}
                          <Divider />
                          <MenuItem value="custom">
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                              <AddIcon sx={{ mr: 1.5, fontSize: 'small' }} />
                              <Typography variant="body2">Add Custom Role</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefreshRoles}
                            disabled={!selectedDepartment || loading.roles}
                            variant="outlined"
                          >
                            Refresh Roles
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
                    {company && selectedDepartment && selectedRole && (
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
                                  icon={<ApartmentIcon />}
                                  label={getDepartmentName(selectedDepartment)} 
                                  size="small"
                                  color="primary"
                                />
                                <Chip 
                                  icon={<SecurityIcon />}
                                  label={getRoleNameById(selectedRole)} 
                                  size="small"
                                  color="primary"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Company: {company.companyName} ({company.companyCode}) • Role ID: {selectedRole} • {selectedItems.length} menu items selected
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
              {company && selectedDepartment && selectedRole && (
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
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => company && company._id && fetchExistingConfigs(company._id)}
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
                                {company.companyName} ({company.companyCode})
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <SecurityIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'text.secondary' }} />
                                <Chip 
                                  label={getRoleNameById(config.role)} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                  color="primary"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Role ID: {config.role} • {config.menuItems.length} menu items • Updated: {new Date(config.updatedAt || config.createdAt).toLocaleDateString()}
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
        </>
      ) : (
        // Show message when no company
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Please login or enter company information to configure sidebar menus.
        </Alert>
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
              `${company?.companyName} (${company?.companyCode}) - 
               ${getDepartmentName(previewConfig.departmentId)} - 
               ${getRoleNameById(previewConfig.role)}`
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