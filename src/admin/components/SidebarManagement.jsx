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
  ListItemText,
  Badge,
  Avatar,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Stack 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
  Settings as SettingsIcon,
  MenuBook as MenuBookIcon,
  FolderSpecial as FolderSpecialIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Forum as ForumIcon,
  Analytics as AnalyticsIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon
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

// Helper function to get icon component
const getIconComponent = (iconName) => {
  const icons = {
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
    Menu: <MenuIcon />,
    Settings: <SettingsIcon />,
    MenuBook: <MenuBookIcon />,
    FolderSpecial: <FolderSpecialIcon />,
    Assignment: <AssignmentIcon />,
    Work: <WorkIcon />,
    People: <PeopleIcon />,
    Forum: <ForumIcon />,
    Analytics: <AnalyticsIcon />,
    Receipt: <ReceiptIcon />,
    Assessment: <AssessmentIcon />
  };
  return icons[iconName] || <DashboardIcon />;
};

const SidebarManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
  const [activeStep, setActiveStep] = useState(0);

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
    setActiveStep(1);
  };

  // Handle role selection
  const handleRoleChange = (event) => {
    const roleId = event.target.value;
    if (roleId === 'custom') {
      handleAddRole();
      return;
    }
    setSelectedRole(roleId);
    setActiveStep(2);
    
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
      setActiveStep(2);
      
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
        setActiveStep(2);
        
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

  // Get progress percentage
  const getProgressPercentage = () => {
    let steps = 0;
    if (company) steps++;
    if (selectedDepartment) steps++;
    if (selectedRole) steps++;
    if (selectedItems.length > 0) steps++;
    return (steps / 4) * 100;
  };

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 2, md: 3 },
      minHeight: '100vh',
      bgcolor: '#f8fafc'
    }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: { xs: 2, sm: 3 },
          background: 'linear-gradient(145deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        
        <Stack direction="row" alignItems="center" spacing={2} position="relative">
          <Avatar sx={{ 
            bgcolor: 'white', 
            width: { xs: 48, sm: 56 }, 
            height: { xs: 48, sm: 56 },
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            <MenuBookIcon sx={{ color: '#0d47a1', fontSize: { xs: 28, sm: 32 } }} />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
              Sidebar Menu Configuration
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Configure custom sidebar menus for different departments and roles
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Current Company Display */}
      {company ? (
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'primary.200',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.1)'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Company</Typography>
                  <Typography variant="h6" fontWeight={600}>{company.companyName}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.50', color: 'secondary.main' }}>
                  <CodeIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Company Code</Typography>
                  <Typography variant="h6" fontWeight={600}>{company.companyCode}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={company.isActive ? 'Active' : 'Inactive'} 
                    size="small"
                    color={company.isActive ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => fetchExistingConfigs(company._id)}
                disabled={loading.fetching}
              >
                {loading.fetching ? 'Loading...' : 'Refresh'}
              </Button>
            </Grid>
          </Grid>
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
      )}

      {/* Progress Bar */}
      {company && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Configuration Progress
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {Math.round(getProgressPercentage())}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #2196f3, #64b5f6)'
              }
            }}
          />
        </Box>
      )}

      {/* Tabs */}
      {company ? (
        <>
          <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600
                }
              }}
            >
              <Tab 
                label="Configure Menu" 
                icon={<SettingsIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={`Existing Configurations (${existingConfigs.length})`} 
                icon={<FolderSpecialIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {/* Tab 1: Configuration */}
          {activeTab === 0 && (
            <>
              {/* Selection Stepper */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stepper activeStep={activeStep} orientation={isMobile ? "vertical" : "horizontal"}>
                  <Step>
                    <StepLabel>Select Department</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Select Role</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Configure Menu Items</StepLabel>
                  </Step>
                </Stepper>
              </Paper>

              {/* Selection Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Department Selection */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: selectedDepartment ? 'primary.200' : 'grey.200',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
                      borderColor: 'primary.200'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.50', mr: 1.5 }}>
                          <ApartmentIcon color="primary" />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          Department
                        </Typography>
                      </Box>
                      <FormControl fullWidth variant="outlined" size="medium" disabled={!company || loading.departments}>
                        <InputLabel>Select Department</InputLabel>
                        <Select
                          value={selectedDepartment}
                          onChange={handleDepartmentChange}
                          label="Select Department"
                        >
                          <MenuItem value="">
                            <em>Choose Department</em>
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
                        </Select>
                      </FormControl>
                      {departments.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`${departments.length} departments available`} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {selectedDepartment && (
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Selected"
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Role Selection */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid',
                    borderColor: selectedRole ? 'primary.200' : 'grey.200',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
                      borderColor: 'primary.200'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.50', mr: 1.5 }}>
                          <SecurityIcon color="secondary" />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          Role
                        </Typography>
                      </Box>
                      <FormControl fullWidth variant="outlined" size="medium" disabled={!selectedDepartment}>
                        <InputLabel>Select Role</InputLabel>
                        <Select
                          value={selectedRole}
                          onChange={handleRoleChange}
                          label="Select Role"
                        >
                          <MenuItem value="">
                            <em>Choose Role</em>
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
                                  <SecurityIcon sx={{ mr: 1.5, fontSize: 'small', color: 'secondary.main' }} />
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
                          <Divider />
                          <MenuItem value="custom">
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                              <AddIcon sx={{ mr: 1.5, fontSize: 'small' }} />
                              <Typography variant="body2">Add Custom Role</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {selectedDepartment && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`${getAllAvailableRoles().length} roles available`} 
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          <Button
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefreshRoles}
                            disabled={loading.roles}
                            variant="text"
                          >
                            Refresh
                          </Button>
                          {selectedRole && (
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Selected"
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Menu Items Selection */}
              {company && selectedDepartment && selectedRole && (
                <Card sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Menu Items Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Select the menu items you want to display for this role
                        </Typography>
                      </Box>
                      
                      <Badge 
                        badgeContent={selectedItems.length} 
                        color="primary"
                        sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                      >
                        <Chip 
                          icon={<CheckCircleOutlineIcon />}
                          label="Selected Items"
                          variant="outlined"
                          color="primary"
                        />
                      </Badge>
                    </Box>

                    {/* Search Bar */}
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white'
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setSearchTerm('')}>
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

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
                            elevation={0}
                            sx={{
                              p: 1.5,
                              mb: 2,
                              cursor: 'pointer',
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
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
                                  sx={{ ml: 2, fontWeight: 600 }}
                                />
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAllCategory(category);
                                }}
                                sx={{ borderRadius: 2 }}
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
                                      elevation={isSelected ? 2 : 1}
                                      sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: isSelected ? 'primary.main' : 'transparent',
                                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                                        transition: 'all 0.2s',
                                        borderRadius: 2,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: 3,
                                          borderColor: isSelected ? 'primary.main' : 'primary.light'
                                        }
                                      }}
                                      onClick={() => handleMenuItemToggle(page.id)}
                                    >
                                      {isSelected && (
                                        <Box sx={{
                                          position: 'absolute',
                                          top: 8,
                                          right: 8,
                                          color: 'success.main'
                                        }}>
                                          <CheckCircleIcon fontSize="small" />
                                        </Box>
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
                                          {getIconComponent(page.icon)}
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
                  
                  {/* Save Button at Bottom */}
                  <CardActions sx={{ 
                    p: 3, 
                    pt: 0,
                    borderTop: '1px solid',
                    borderColor: 'grey.200',
                    bgcolor: 'grey.50',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSave}
                      disabled={loading.saving || selectedItems.length === 0}
                      startIcon={loading.saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ 
                        px: 6,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                        boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                          boxShadow: '0 12px 24px rgba(33, 150, 243, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading.saving ? 'Saving Configuration...' : 'Save Configuration'}
                    </Button>
                  </CardActions>
                </Card>
              )}
            </>
          )}

          {/* Tab 2: Existing Configurations */}
          {activeTab === 1 && (
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Existing Configurations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and edit existing sidebar configurations
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => company && company._id && fetchExistingConfigs(company._id)}
                    disabled={loading.fetching}
                    sx={{ borderRadius: 2 }}
                  >
                    {loading.fetching ? 'Refreshing...' : 'Refresh'}
                  </Button>
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
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ApartmentIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {getDepartmentName(config.departmentId)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SecurityIcon sx={{ fontSize: '1rem', color: 'secondary.main' }} />
                                <Chip 
                                  label={getRoleNameById(config.role)} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                  color="secondary"
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {config.menuItems.length} menu items • Updated: {formatDate(config.updatedAt || config.createdAt)}
                              </Typography>
                            </Box>
                            <Box>
                              <Tooltip title="Preview">
                                <IconButton
                                  size="small"
                                  onClick={() => handlePreview(config)}
                                  sx={{ color: 'info.main' }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(config)}
                                  sx={{ color: 'primary.main' }}
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
                                    icon={getIconComponent(item.icon)}
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
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon />
            <Typography variant="h6">Menu Preview</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block', mt: 0.5 }}>
            {previewConfig && 
              `${company?.companyName} (${company?.companyCode}) - 
               ${getDepartmentName(previewConfig.departmentId)} - 
               ${getRoleNameById(previewConfig.role)}`
            }
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, maxHeight: 400 }}>
          {previewConfig && (
            <List>
              {previewConfig.menuItems.map((item, index) => (
                <ListItem 
                  key={item.id} 
                  divider={index < previewConfig.menuItems.length - 1}
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: 'primary.50', 
                      color: 'primary.main',
                      width: 32,
                      height: 32
                    }}>
                      {getIconComponent(item.icon)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight={600}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {item.path}
                        </Typography>
                        <Chip 
                          label={getCategoryDisplayName(item.category)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.6rem' }}
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
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setOpenPreview(false)}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Zoom}
      >
        <Alert 
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for Mobile */}
      {isMobile && selectedDepartment && selectedRole && selectedItems.length > 0 && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: '0 8px 16px rgba(33, 150, 243, 0.4)',
              width: 56,
              height: 56
            }}
            onClick={handleSave}
            disabled={loading.saving}
          >
            {loading.saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
          </Fab>
        </Zoom>
      )}
    </Box>
  );
};

// Add missing import for CodeIcon
const CodeIcon = (props) => (
  <svg {...props} width="1em" height="1em" viewBox="0 0 24 24">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor"/>
  </svg>
);

export default SidebarManagement;