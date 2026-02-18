import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, Alert, Snackbar, FormControlLabel,
  Switch, Card, CardContent, Stack, Avatar, 
  InputAdornment, Divider, Fade, Zoom, Slide,
  useTheme, useMediaQuery, Badge, Grid, Fab,
  Menu, MenuItem, ListItemIcon, ListItemText,
  LinearProgress, CircularProgress, Select, FormControl,
  InputLabel, FormHelperText, Rating, Stepper, Step,
  StepLabel, StepContent, Accordion, AccordionSummary,
  AccordionDetails, Tabs, Tab, Radio, RadioGroup,
  Checkbox, FormControlLabel as RadioFormLabel
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Edit, Delete, Add, Search, Business, 
  Description, Person, Code, Refresh,
  MoreVert, FilterList, Clear, CheckCircle,
  Cancel, CorporateFare, AdminPanelSettings,
  VerifiedUser, FolderSpecial, Today,
  Schedule, Apartment, ArrowForward, Inventory,
  Computer, Phone, Print, Build, Devices,
  Assignment, AssignmentReturn, AssignmentTurnedIn,
  AttachMoney, DateRange, Category, QrCode,
  BarChart, Warning, CheckCircleOutline,
  ErrorOutline, Pending, LocalShipping,
  LocationOn, AccountBalance, Receipt,
  History, CompareArrows, Download, Upload,
  Print as PrintIcon, Share, Archive, Unarchive,
  Settings, CloudUpload, CloudDownload
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Asset Categories with Icons and Colors
const ASSET_CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: Computer, color: '#2196f3' },
  { value: 'furniture', label: 'Furniture', icon: Business, color: '#ff9800' },
  { value: 'vehicles', label: 'Vehicles', icon: LocalShipping, color: '#4caf50' },
  { value: 'machinery', label: 'Machinery', icon: Build, color: '#9c27b0' },
  { value: 'software', label: 'Software', icon: Devices, color: '#00bcd4' },
  { value: 'office_equipment', label: 'Office Equipment', icon: Print, color: '#795548' },
  { value: 'it_equipment', label: 'IT Equipment', icon: Computer, color: '#3f51b5' },
  { value: 'other', label: 'Other', icon: Category, color: '#757575' }
];

// Asset Status with Icons and Colors
const ASSET_STATUS = [
  { value: 'available', label: 'Available', icon: CheckCircle, color: '#4caf50' },
  { value: 'assigned', label: 'Assigned', icon: AssignmentTurnedIn, color: '#2196f3' },
  { value: 'maintenance', label: 'Under Maintenance', icon: Build, color: '#ff9800' },
  { value: 'damaged', label: 'Damaged', icon: ErrorOutline, color: '#f44336' },
  { value: 'retired', label: 'Retired', icon: Cancel, color: '#9e9e9e' },
  { value: 'reserved', label: 'Reserved', icon: Schedule, color: '#9c27b0' }
];

// Condition Types
const CONDITION_TYPES = [
  { value: 'new', label: 'New', color: '#4caf50' },
  { value: 'excellent', label: 'Excellent', color: '#8bc34a' },
  { value: 'good', label: 'Good', color: '#2196f3' },
  { value: 'fair', label: 'Fair', color: '#ff9800' },
  { value: 'poor', label: 'Poor', color: '#f44336' }
];

const AssetManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State Management
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    model: '',
    serialNumber: '',
    assetTag: '',
    purchaseDate: null,
    purchaseCost: '',
    warrantyExpiry: null,
    condition: 'good',
    status: 'available',
    location: '',
    department: '',
    assignedTo: null,
    description: '',
    supplier: '',
    manufacturer: '',
    notes: '',
    attachments: [],
    // For maintenance
    maintenanceType: 'scheduled',
    scheduledDate: null,
    maintenanceCost: '',
    vendor: ''
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userInfo, setUserInfo] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssetMenu, setSelectedAssetMenu] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    maintenance: 0,
    totalValue: 0
  });

  // Function to get user from localStorage
  const getUserFromStorage = () => {
    let userStr = localStorage.getItem('superAdmin');
    if (!userStr) userStr = localStorage.getItem('user');
    if (!userStr) userStr = sessionStorage.getItem('superAdmin') || sessionStorage.getItem('user');
    
    if (!userStr) {
      console.log('No user found in storage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('User found in storage:', user);
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Error loading user data');
      return null;
    }
  };

  // Check if user is super-admin
  const checkSuperAdminStatus = (user) => {
    if (!user) return false;
    return user.role === 'super-admin' || 
           user.jobRole === 'super_admin' ||
           (user.role === 'super-admin' && user.department === 'Management');
  };

  // Initial Data Load
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserInfo(user);
      const isSuper = checkSuperAdminStatus(user);
      setIsSuperAdmin(isSuper);
      
      fetchAssets(user, isSuper);
      fetchDepartments(user, isSuper);
    } else {
      toast.error('Please login to continue');
    }
  }, [refreshKey, showAllCompanies, categoryFilter, statusFilter]);

  // Fetch employees whenever departments change or when needed
  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      const isSuper = checkSuperAdminStatus(user);
      fetchEmployees(user, isSuper);
    }
  }, [departments, showAllCompanies]);

  // Fetch Assets
  const fetchAssets = async (user = null, isSuper = false) => {
    try {
      setLoading(true);
      if (!user) {
        user = getUserFromStorage();
        if (!user) {
          toast.error('User not found');
          return;
        }
        isSuper = checkSuperAdminStatus(user);
      }
      
      let params = {};
      
      if (!isSuper || !showAllCompanies) {
        if (user.company) {
          params.company = user.company;
        }
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      console.log('Fetching assets with params:', params);
      
      const response = await axios.get('/assets12', { params });
      const assetsData = response.data.assets || [];
      setAssets(assetsData);
      
      // Calculate stats
      const total = assetsData.length;
      const available = assetsData.filter(a => a.status === 'available').length;
      const assigned = assetsData.filter(a => a.status === 'assigned').length;
      const maintenance = assetsData.filter(a => a.status === 'maintenance').length;
      const totalValue = assetsData.reduce((sum, asset) => sum + (asset.purchaseCost || 0), 0);
      
      setStats({
        total,
        available,
        assigned,
        maintenance,
        totalValue
      });
      
      console.log('Assets fetched:', assetsData.length);
    } catch (err) {
      console.error('Fetch assets error:', err);
      toast.error(err.response?.data?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async (user = null, isSuper = false) => {
    try {
      if (!user) {
        user = getUserFromStorage();
        if (!user) return;
        isSuper = checkSuperAdminStatus(user);
      }
      
      let params = {};
      if (!isSuper || !showAllCompanies) {
        if (user.company) {
          params.company = user.company;
        }
      }
      
      console.log('Fetching departments with params:', params);
      const response = await axios.get('/departments', { params });
      const departmentsData = response.data.departments || [];
      setDepartments(departmentsData);
      console.log('Departments fetched:', departmentsData);
    } catch (err) {
      console.error('Fetch departments error:', err);
    }
  };

  // Fetch Employees with department information
  const fetchEmployees = async (user = null, isSuper = false) => {
    try {
      setLoadingEmployees(true);
      if (!user) {
        user = getUserFromStorage();
        if (!user) return;
        isSuper = checkSuperAdminStatus(user);
      }
      
      let params = {};
      if (!isSuper || !showAllCompanies) {
        if (user.company) {
          params.company = user.company;
        }
      }
      
      // Add populate parameter to get department details
      params.populate = 'department';
      
      console.log('Fetching employees with params:', params);
      const response = await axios.get('/users/company-users', { params });
      console.log('Employees API response:', response.data);
      
      // Handle different response structures
      let employeesData = [];
      if (response.data.users) {
        employeesData = response.data.users;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else {
        employeesData = response.data.data || [];
      }
      
      // Enhance employee data with department names
      const enhancedEmployees = employeesData.map(emp => {
        // Create a copy of the employee
        const enhanced = { ...emp };
        
        // If department is an ID, try to find the department name
        if (emp.department && typeof emp.department === 'string') {
          const foundDept = departments.find(d => d._id === emp.department);
          if (foundDept) {
            enhanced.departmentDetails = foundDept;
            enhanced.departmentName = foundDept.name;
            enhanced.department = foundDept; // Replace ID with object
          } else {
            enhanced.departmentName = emp.department;
          }
        } else if (emp.department && typeof emp.department === 'object') {
          // Department is already populated
          enhanced.departmentName = emp.department.name;
          enhanced.departmentDetails = emp.department;
        } else {
          enhanced.departmentName = 'No Department';
        }
        
        return enhanced;
      });
      
      setEmployees(enhancedEmployees);
      console.log('Enhanced employees:', enhancedEmployees);
      
    } catch (err) {
      console.error('Fetch employees error:', err);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Asset name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Asset category is required');
      return;
    }
    if (!formData.serialNumber) {
      toast.error('Serial number is required');
      return;
    }

    setLoading(true);
    try {
      const user = getUserFromStorage();
      if (!user) {
        toast.error('User not found. Please login again.');
        return;
      }
      
      const isSuper = checkSuperAdminStatus(user);
      
      const submitData = {
        name: formData.name.trim(),
        category: formData.category,
        model: formData.model,
        serialNumber: formData.serialNumber,
        assetTag: formData.assetTag || `AST-${Date.now()}`,
        purchaseDate: formData.purchaseDate,
        purchaseCost: parseFloat(formData.purchaseCost) || 0,
        warrantyExpiry: formData.warrantyExpiry,
        condition: formData.condition,
        status: formData.status,
        location: formData.location,
        department: formData.department,
        assignedTo: formData.assignedTo,
        description: formData.description,
        supplier: formData.supplier,
        manufacturer: formData.manufacturer,
        notes: formData.notes
      };
      
      if (!isSuper || formData.company) {
        submitData.company = formData.company || user.company;
        submitData.companyCode = formData.companyCode || user.companyCode;
      }
      
      console.log('Submitting asset data:', submitData);
      
      if (editingAsset) {
        await axios.put(`/assets12/${editingAsset._id}`, submitData);
        toast.success(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Asset Updated!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.name} has been updated successfully
              </Typography>
            </Box>
          </Box>,
          { icon: false, autoClose: 3000 }
        );
      } else {
        await axios.post('/assets12', submitData);
        toast.success(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Asset Created!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.name} has been added to inventory
              </Typography>
            </Box>
          </Box>,
          { icon: false, autoClose: 3000 }
        );
      }
      
      setOpenDialog(false);
      resetForm();
      setEditingAsset(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Asset Assignment
  const handleAssign = async () => {
    if (!selectedAsset) return;
    if (!formData.assignedTo && !formData.department) {
      toast.error('Please select an employee or department to assign to');
      return;
    }

    try {
      setLoading(true);
      
      // Find the selected employee to get their department if needed
      let assignedDepartment = formData.department;
      let assignedTo = formData.assignedTo;
      
      if (formData.assignedTo) {
        const selectedEmp = employees.find(emp => emp._id === formData.assignedTo);
        if (selectedEmp) {
          // If employee has a department, use that
          if (selectedEmp.department) {
            assignedDepartment = typeof selectedEmp.department === 'object' 
              ? selectedEmp.department._id 
              : selectedEmp.department;
          }
        }
      }
      
      const assignData = {
        assetId: selectedAsset._id,
        assignedTo: assignedTo || null,
        department: assignedDepartment || null,
        notes: formData.notes || `Assigned on ${new Date().toLocaleDateString()}`,
        assignedDate: new Date()
      };
      
      console.log('Assigning asset with data:', assignData);
      
      const response = await axios.post('/assets12/assign', assignData);
      console.log('Assignment response:', response.data);
      
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentTurnedIn sx={{ color: '#2196f3', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Asset Assigned!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedAsset.name} has been assigned successfully
            </Typography>
          </Box>
        </Box>,
        { icon: false, autoClose: 3000 }
      );
      
      setOpenAssignDialog(false);
      // Reset form data for next use
      setFormData(prev => ({
        ...prev,
        assignedTo: null,
        department: '',
        notes: ''
      }));
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Assign error:', err);
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Asset Return
  const handleReturn = async (assetId) => {
    try {
      setLoading(true);
      
      await axios.post(`/assets12/${assetId}/return`);
      
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentReturn sx={{ color: '#ff9800', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Asset Returned!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Asset has been returned to inventory
            </Typography>
          </Box>
        </Box>,
        { icon: false, autoClose: 3000 }
      );
      
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Return error:', err);
      toast.error(err.response?.data?.message || 'Return failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Maintenance Request
  const handleMaintenance = async () => {
    if (!selectedAsset) return;
    if (!formData.notes) {
      toast.error('Please provide maintenance details');
      return;
    }

    try {
      setLoading(true);
      
      const maintenanceData = {
        type: formData.maintenanceType || 'scheduled',
        scheduledDate: formData.scheduledDate || new Date(),
        description: formData.notes,
        cost: parseFloat(formData.maintenanceCost) || 0,
        vendor: formData.vendor || ''
      };
      
      console.log('Scheduling maintenance:', maintenanceData);
      
      await axios.post(`/assets12/${selectedAsset._id}/maintenance`, maintenanceData);
      
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Build sx={{ color: '#ff9800', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Maintenance Scheduled!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Maintenance request has been created
            </Typography>
          </Box>
        </Box>,
        { icon: false, autoClose: 3000 }
      );
      
      setOpenMaintenanceDialog(false);
      // Reset maintenance form fields
      setFormData(prev => ({
        ...prev,
        maintenanceType: 'scheduled',
        scheduledDate: null,
        notes: '',
        maintenanceCost: '',
        vendor: ''
      }));
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Maintenance error:', err);
      toast.error(err.response?.data?.message || 'Maintenance request failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    const asset = assets.find(a => a._id === id);
    if (!window.confirm(`Are you sure you want to delete "${asset?.name}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await axios.delete(`/assets12/${id}`);
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Delete sx={{ color: '#f44336', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Asset Deleted!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {asset?.name} has been removed from inventory
            </Typography>
          </Box>
        </Box>,
        { icon: false, autoClose: 3000 }
      );
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Deletion failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedAssets.length} assets?`)) return;

    try {
      setLoading(true);
      await axios.post('/assets12/bulk-delete', { assetIds: selectedAssets });
      toast.success(`${selectedAssets.length} assets deleted successfully`);
      setSelectedAssets([]);
      setBulkMode(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk deletion failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    const user = getUserFromStorage();
    
    setFormData({
      name: asset.name || '',
      category: asset.category || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      assetTag: asset.assetTag || '',
      purchaseDate: asset.purchaseDate || null,
      purchaseCost: asset.purchaseCost || '',
      warrantyExpiry: asset.warrantyExpiry || null,
      condition: asset.condition || 'good',
      status: asset.status || 'available',
      location: asset.location || '',
      department: asset.department?._id || asset.department || '',
      assignedTo: asset.assignedTo?._id || asset.assignedTo || null,
      description: asset.description || '',
      supplier: asset.supplier || '',
      manufacturer: asset.manufacturer || '',
      notes: asset.notes || '',
      company: asset.company || user?.company || '',
      companyCode: asset.companyCode || user?.companyCode || '',
      // Reset maintenance fields
      maintenanceType: 'scheduled',
      scheduledDate: null,
      maintenanceCost: '',
      vendor: ''
    });
    setOpenDialog(true);
    setAnchorEl(null);
  };

  // Handle View History
  const handleViewHistory = async (asset) => {
    try {
      setLoading(true);
      const response = await axios.get(`/assets12/${asset._id}/history`);
      setSelectedAsset({
        ...asset,
        history: response.data.history || [],
        maintenanceRecords: response.data.maintenanceRecords || []
      });
      setOpenHistoryDialog(true);
    } catch (err) {
      console.error('Fetch history error:', err);
      toast.error('Failed to load asset history');
    } finally {
      setLoading(false);
    }
  };

  // Handle Menu Open
  const handleMenuOpen = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssetMenu(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssetMenu(null);
  };

  // Handle Refresh
  const handleRefresh = () => {
    toast.info('Refreshing assets...');
    setRefreshKey(prev => prev + 1);
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    switch (newValue) {
      case 0:
        setStatusFilter('all');
        break;
      case 1:
        setStatusFilter('available');
        break;
      case 2:
        setStatusFilter('assigned');
        break;
      case 3:
        setStatusFilter('maintenance');
        break;
      default:
        setStatusFilter('all');
    }
  };

  // Reset Form
  const resetForm = () => {
    const user = getUserFromStorage();
    setFormData({
      name: '',
      category: '',
      model: '',
      serialNumber: '',
      assetTag: '',
      purchaseDate: null,
      purchaseCost: '',
      warrantyExpiry: null,
      condition: 'good',
      status: 'available',
      location: '',
      department: '',
      assignedTo: null,
      description: '',
      supplier: '',
      manufacturer: '',
      notes: '',
      company: user?.company || '',
      companyCode: user?.companyCode || '',
      maintenanceType: 'scheduled',
      scheduledDate: null,
      maintenanceCost: '',
      vendor: ''
    });
  };

  // Handle Select All
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedAssets(filteredAssets.map(asset => asset._id));
    } else {
      setSelectedAssets([]);
    }
  };

  // Handle Select One
  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedAssets.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedAssets, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedAssets.slice(1));
    } else if (selectedIndex === selectedAssets.length - 1) {
      newSelected = newSelected.concat(selectedAssets.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedAssets.slice(0, selectedIndex),
        selectedAssets.slice(selectedIndex + 1)
      );
    }

    setSelectedAssets(newSelected);
  };

  // Filter Assets
  const getFilteredAssets = () => {
    let filtered = assets;
    const user = userInfo || getUserFromStorage();
    const isSuper = checkSuperAdminStatus(user);
    
    if (!isSuper || !showAllCompanies) {
      filtered = assets.filter(asset => 
        !asset.company || asset.company === user?.company
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.model && asset.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.assetTag && asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredAssets = getFilteredAssets();

  // Format Currency
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get Category Icon
  const getCategoryIcon = (category) => {
    const cat = ASSET_CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : Category;
  };

  // Get Category Color
  const getCategoryColor = (category) => {
    const cat = ASSET_CATEGORIES.find(c => c.value === category);
    return cat ? cat.color : '#757575';
  };

  // Get Status Icon
  const getStatusIcon = (status) => {
    const stat = ASSET_STATUS.find(s => s.value === status);
    return stat ? stat.icon : CheckCircle;
  };

  // Get Status Color
  const getStatusColor = (status) => {
    const stat = ASSET_STATUS.find(s => s.value === status);
    return stat ? stat.color : '#4caf50';
  };

  // Get Condition Color
  const getConditionColor = (condition) => {
    const cond = CONDITION_TYPES.find(c => c.value === condition);
    return cond ? cond.color : '#2196f3';
  };

  // Mobile Card View
  const MobileAssetCard = ({ asset }) => {
    const CategoryIcon = getCategoryIcon(asset.category);
    const StatusIcon = getStatusIcon(asset.status);
    const statusColor = getStatusColor(asset.status);
    const categoryColor = getCategoryColor(asset.category);
    const conditionColor = getConditionColor(asset.condition);

    return (
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
            borderColor: 'primary.200'
          }
        }}
      >
        {/* Status Indicator */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 0.5
        }}>
          {bulkMode && (
            <Checkbox
              checked={selectedAssets.indexOf(asset._id) !== -1}
              onChange={(e) => handleSelectOne(e, asset._id)}
              size="small"
              sx={{ p: 0 }}
            />
          )}
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: statusColor,
            boxShadow: `0 0 0 2px ${alpha(statusColor, 0.2)}`,
            animation: asset.status === 'available' ? 'pulse 2s infinite' : 'none'
          }} />
        </Box>
        
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Header with Icon and Name */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(categoryColor, 0.1),
                  color: categoryColor,
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  boxShadow: `0 4px 8px ${alpha(categoryColor, 0.2)}`
                }}
              >
                <CategoryIcon sx={{ fontSize: 26 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                  {asset.name}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                  {asset.assetTag && (
                    <Chip 
                      label={asset.assetTag} 
                      size="small" 
                      sx={{ 
                        height: 22, 
                        fontSize: '0.65rem',
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        fontWeight: 600
                      }}
                    />
                  )}
                  <Chip
                    icon={<StatusIcon sx={{ fontSize: 12 }} />}
                    label={asset.status}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      bgcolor: alpha(statusColor, 0.1),
                      color: statusColor,
                      fontWeight: 600,
                      '& .MuiChip-icon': { fontSize: 12, color: statusColor }
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* Details Grid */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 1.5, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Model
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {asset.model || '—'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 1.5, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Serial #
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {asset.serialNumber || '—'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 1.5, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Condition
                  </Typography>
                  <Chip
                    label={asset.condition}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6rem',
                      bgcolor: alpha(conditionColor, 0.1),
                      color: conditionColor,
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 1.5, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {asset.location || '—'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Assignment Info */}
            {asset.assignedTo && (
              <Box sx={{ 
                bgcolor: alpha(statusColor, 0.05),
                p: 1.5, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(statusColor, 0.2)
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person sx={{ fontSize: 16, color: statusColor }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {asset.assignedTo.name}
                    </Typography>
                    {asset.assignedTo.department && (
                      <Typography variant="caption" color="text.secondary">
                        {asset.assignedTo.department.name || asset.assignedTo.department}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Purchase Info */}
            {asset.purchaseCost > 0 && (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'primary.50',
                p: 1.5,
                borderRadius: 2
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AttachMoney sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight={600} color="primary.dark">
                    Purchase Cost
                  </Typography>
                </Stack>
                <Typography variant="body1" fontWeight={700} color="primary.main">
                  {formatCurrency(asset.purchaseCost)}
                </Typography>
              </Box>
            )}

            {/* Footer with Meta Info and Actions */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5}>
                {asset.purchaseDate && (
                  <Tooltip title="Purchase Date">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Today sx={{ fontSize: 14, color: 'grey.500' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(asset.purchaseDate)}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Stack>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="View History">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewHistory(asset)}
                    sx={{ 
                      bgcolor: 'info.50',
                      color: 'info.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    <History sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(asset)}
                    sx={{ 
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More">
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, asset)}
                    sx={{ 
                      bgcolor: 'grey.100',
                      color: 'grey.700',
                      width: 32,
                      height: 32
                    }}
                  >
                    <MoreVert sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: '100vh',
        bgcolor: '#f8fafc'
      }}>
        {/* Loading Overlay */}
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress sx={{ borderRadius: 1, height: 4 }} />
          </Box>
        )}

        {/* Stats Cards */}
        {assets.length > 0 && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr 1fr', 
              sm: 'repeat(4, 1fr)' 
            },
            gap: { xs: 1.5, sm: 2.5 },
            mb: 4,
            width: '100%'
          }}>
            {/* Total Assets */}
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)',
                border: '1px solid',
                borderColor: '#e3f2fd',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.12)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                },
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(33, 150, 243, 0.25)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Inventory sx={{ 
                    fontSize: { xs: 24, sm: 28 }, 
                    color: '#1976d2'
                  }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="#546e7a" fontWeight={600}>
                    Total Assets
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#0d47a1">
                    {stats.total}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Available */}
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
                border: '1px solid',
                borderColor: '#c8e6c9',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.12)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(76, 175, 80, 0.25)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleOutline sx={{ 
                    fontSize: { xs: 24, sm: 28 }, 
                    color: '#2e7d32'
                  }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="#546e7a" fontWeight={600}>
                    Available
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#1b5e20">
                    {stats.available}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Assigned */}
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
                border: '1px solid',
                borderColor: '#bbdefb',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.12)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(33, 150, 243, 0.25)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AssignmentTurnedIn sx={{ 
                    fontSize: { xs: 24, sm: 28 }, 
                    color: '#1976d2'
                  }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="#546e7a" fontWeight={600}>
                    Assigned
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#0d47a1">
                    {stats.assigned}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Total Value */}
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)',
                border: '1px solid',
                borderColor: '#ffe0b2',
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.12)',
                transition: 'all 0.3s ease',
                gridColumn: { xs: 'span 2', sm: 'span 1' },
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(255, 152, 0, 0.25)'
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: { xs: 44, sm: 52 },
                  height: { xs: 44, sm: 52 },
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #ffe0b2 0%, #ffcc80 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoney sx={{ 
                    fontSize: { xs: 24, sm: 28 }, 
                    color: '#f57c00'
                  }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="#546e7a" fontWeight={600}>
                    Total Value
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#e65100">
                    {formatCurrency(stats.totalValue)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Main Content */}
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }} 
          elevation={6}
        >
          {/* Header Section */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }} 
            spacing={2}
            mb={3}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                }}>
                  <Inventory sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                    Asset Management
                  </Typography>
                  {userInfo && (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        avatar={<Person sx={{ fontSize: 14 }} />}
                        label={userInfo.name}
                        size="small"
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                      <Chip 
                        label={userInfo.role || userInfo.jobRole}
                        size="small"
                        sx={{ 
                          height: 24, 
                          fontSize: '0.7rem',
                          bgcolor: isSuperAdmin ? 'secondary.50' : 'primary.50'
                        }}
                      />
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1.5}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {/* Search Bar */}
              <TextField
                size="small"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  width: { xs: '100%', sm: 280 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'white'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <Clear sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {/* Category Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {ASSET_CATEGORIES.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: 1,
                          bgcolor: alpha(cat.color, 0.2),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <cat.icon sx={{ fontSize: 14, color: cat.color }} />
                        </Box>
                        <span>{cat.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {ASSET_STATUS.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: 1,
                          bgcolor: alpha(status.color, 0.2),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <status.icon sx={{ fontSize: 14, color: status.color }} />
                        </Box>
                        <span>{status.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Add Asset Button */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingAsset(null);
                  resetForm();
                  setOpenDialog(true);
                }}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Add Asset
              </Button>

              {/* Bulk Actions */}
              {bulkMode && selectedAssets.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                  sx={{ borderRadius: 3 }}
                >
                  Delete ({selectedAssets.length})
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Super Admin Toggle */}
          {isSuperAdmin && (
            <Fade in={isSuperAdmin}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 3,
                  bgcolor: 'primary.50',
                  borderColor: 'primary.200'
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <AdminPanelSettings />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>Super Admin Mode</Typography>
                      <Typography variant="caption">You have access to view all assets</Typography>
                    </Box>
                  </Stack>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAllCompanies}
                        onChange={(e) => setShowAllCompanies(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show All Companies"
                  />
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Quick Filters Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              mb: 3,
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem'
              }
            }}
          >
            <Tab label="All Assets" />
            <Tab label="Available" />
            <Tab label="Assigned" />
            <Tab label="Under Maintenance" />
          </Tabs>

          {/* Bulk Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={bulkMode}
                  onChange={(e) => {
                    setBulkMode(e.target.checked);
                    if (!e.target.checked) setSelectedAssets([]);
                  }}
                  color="primary"
                  size="small"
                />
              }
              label="Bulk Mode"
            />
          </Box>

          {/* Table/List View */}
          {isMobile ? (
            // Mobile Card View
            <Box sx={{ mt: 2 }}>
              {filteredAssets.length === 0 ? (
                <Box sx={{ 
                  py: 8, 
                  px: 2, 
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'grey.200'
                }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}>
                    <Inventory sx={{ fontSize: 50, color: 'grey.400' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    No Assets Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? 'No assets match your filters. Try adjusting your search criteria.'
                      : 'Get started by adding your first asset to inventory.'}
                  </Typography>
                  {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') ? (
                    <Button 
                      variant="outlined" 
                      onClick={handleClearFilters}
                      startIcon={<Clear />}
                      sx={{ borderRadius: 3 }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      startIcon={<Add />}
                      onClick={() => {
                        setEditingAsset(null);
                        resetForm();
                        setOpenDialog(true);
                      }}
                      sx={{ borderRadius: 3 }}
                    >
                      Add Asset
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  {filteredAssets
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(asset => (
                      <MobileAssetCard key={asset._id} asset={asset} />
                    ))
                  }
                </>
              )}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer 
              sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                overflow: 'auto'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    {bulkMode && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedAssets.length > 0 && selectedAssets.length < filteredAssets.length}
                          checked={filteredAssets.length > 0 && selectedAssets.length === filteredAssets.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700 }}>Asset</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Serial/Model</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Purchase Cost</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={bulkMode ? 10 : 9} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Inventory sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            No Assets Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                              ? 'No assets match your filters'
                              : 'Get started by adding an asset'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((asset) => {
                        const CategoryIcon = getCategoryIcon(asset.category);
                        const categoryColor = getCategoryColor(asset.category);
                        const StatusIcon = getStatusIcon(asset.status);
                        const statusColor = getStatusColor(asset.status);
                        
                        return (
                          <TableRow 
                            key={asset._id} 
                            hover
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                              }
                            }}
                          >
                            {bulkMode && (
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedAssets.indexOf(asset._id) !== -1}
                                  onChange={(e) => handleSelectOne(e, asset._id)}
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ 
                                  width: 36, 
                                  height: 36, 
                                  bgcolor: alpha(categoryColor, 0.1),
                                  color: categoryColor,
                                  borderRadius: 2
                                }}>
                                  <CategoryIcon sx={{ fontSize: 20 }} />
                                </Avatar>
                                <Box>
                                  <Typography fontWeight={600}>{asset.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {asset.assetTag || 'No tag'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={asset.category}
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(categoryColor, 0.1),
                                  color: categoryColor,
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {asset.model || '—'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SN: {asset.serialNumber || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<StatusIcon sx={{ fontSize: 14 }} />}
                                label={asset.status}
                                size="small"
                                sx={{
                                  bgcolor: alpha(statusColor, 0.1),
                                  color: statusColor,
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: statusColor }
                                }}
                              />
                              {asset.condition && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                  Condition: {asset.condition}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {asset.assignedTo ? (
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {asset.assignedTo.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {asset.assignedTo.department?.name || asset.assignedTo.department || '—'}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.disabled">
                                  Not assigned
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {asset.location || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {formatCurrency(asset.purchaseCost)}
                              </Typography>
                              {asset.purchaseDate && (
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(asset.purchaseDate)}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Assign">
                                  <IconButton 
                                    size="small"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setFormData(prev => ({
                                        ...prev,
                                        assignedTo: null,
                                        department: '',
                                        notes: ''
                                      }));
                                      setOpenAssignDialog(true);
                                    }}
                                    disabled={asset.status !== 'available'}
                                    sx={{ 
                                      color: 'success.main',
                                      bgcolor: 'success.50',
                                      width: 32,
                                      height: 32,
                                      opacity: asset.status === 'available' ? 1 : 0.5
                                    }}
                                  >
                                    <AssignmentTurnedIn fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Maintenance">
                                  <IconButton 
                                    size="small"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setFormData(prev => ({
                                        ...prev,
                                        maintenanceType: 'scheduled',
                                        scheduledDate: null,
                                        notes: '',
                                        maintenanceCost: '',
                                        vendor: ''
                                      }));
                                      setOpenMaintenanceDialog(true);
                                    }}
                                    sx={{ 
                                      color: 'warning.main',
                                      bgcolor: 'warning.50',
                                      width: 32,
                                      height: 32
                                    }}
                                  >
                                    <Build fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="History">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleViewHistory(asset)}
                                    sx={{ 
                                      color: 'info.main',
                                      bgcolor: 'info.50',
                                      width: 32,
                                      height: 32
                                    }}
                                  >
                                    <History fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleEdit(asset)}
                                    sx={{ 
                                      color: 'primary.main',
                                      bgcolor: 'primary.50',
                                      width: 32,
                                      height: 32
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {asset.status === 'assigned' && (
                                  <Tooltip title="Return">
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleReturn(asset._id)}
                                      sx={{ 
                                        color: 'secondary.main',
                                        bgcolor: 'secondary.50',
                                        width: 32,
                                        height: 32
                                      }}
                                    >
                                      <AssignmentReturn fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {filteredAssets.length > 0 && (
            <TablePagination
              component="div"
              count={filteredAssets.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={isMobile ? [5, 10, 25] : [5, 10, 25, 50]}
              sx={{ mt: 2 }}
            />
          )}

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <Zoom in={isMobile}>
              <Fab
                color="primary"
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  boxShadow: '0 8px 16px rgba(33, 150, 243, 0.4)'
                }}
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
              >
                <Add />
              </Fab>
            </Zoom>
          )}

          {/* Options Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            TransitionComponent={Zoom}
            PaperProps={{ sx: { borderRadius: 3, minWidth: 200 } }}
          >
            <MenuItem onClick={() => {
              setSelectedAsset(selectedAssetMenu);
              setFormData(prev => ({
                ...prev,
                assignedTo: null,
                department: '',
                notes: ''
              }));
              setOpenAssignDialog(true);
              handleMenuClose();
            }}>
              <ListItemIcon><AssignmentTurnedIn fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText primary="Assign Asset" />
            </MenuItem>
            <MenuItem onClick={() => {
              setSelectedAsset(selectedAssetMenu);
              setFormData(prev => ({
                ...prev,
                maintenanceType: 'scheduled',
                scheduledDate: null,
                notes: '',
                maintenanceCost: '',
                vendor: ''
              }));
              setOpenMaintenanceDialog(true);
              handleMenuClose();
            }}>
              <ListItemIcon><Build fontSize="small" color="warning" /></ListItemIcon>
              <ListItemText primary="Schedule Maintenance" />
            </MenuItem>
            <MenuItem onClick={() => {
              handleViewHistory(selectedAssetMenu);
              handleMenuClose();
            }}>
              <ListItemIcon><History fontSize="small" color="info" /></ListItemIcon>
              <ListItemText primary="View History" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              handleEdit(selectedAssetMenu);
              handleMenuClose();
            }}>
              <ListItemIcon><Edit fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleDelete(selectedAssetMenu?._id);
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>

          {/* CSS Animations */}
          <style>
            {`
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
              }
            `}
          </style>
        </Paper>

        {/* Add/Edit Asset Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => !loading && setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 4,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            py: 3,
            px: 3
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {editingAsset ? (
                  <Edit sx={{ color: 'primary.main', fontSize: 26 }} />
                ) : (
                  <Add sx={{ color: 'primary.main', fontSize: 26 }} />
                )}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {editingAsset ? 'Update asset information' : 'Add a new asset to inventory'}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box pt={1}>
              {/* Basic Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Asset Name *"
                    fullWidth
                    size="small"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Inventory sx={{ fontSize: 18, color: 'primary.main' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category *</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      label="Category *"
                    >
                      {ASSET_CATEGORIES.map(cat => (
                        <MenuItem key={cat.value} value={cat.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <cat.icon sx={{ fontSize: 18, color: cat.color }} />
                            <span>{cat.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Model"
                    fullWidth
                    size="small"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Serial Number *"
                    fullWidth
                    size="small"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Asset Tag"
                    fullWidth
                    size="small"
                    value={formData.assetTag}
                    onChange={(e) => setFormData({...formData, assetTag: e.target.value})}
                    helperText="Auto-generated if left blank"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      label="Condition"
                    >
                      {CONDITION_TYPES.map(cond => (
                        <MenuItem key={cond.value} value={cond.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: cond.color
                            }} />
                            <span>{cond.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Purchase Information */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                Purchase Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Purchase Date"
                    value={formData.purchaseDate}
                    onChange={(date) => setFormData({...formData, purchaseDate: date})}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Purchase Cost"
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({...formData, purchaseCost: e.target.value})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Warranty Expiry"
                    value={formData.warrantyExpiry}
                    onChange={(date) => setFormData({...formData, warrantyExpiry: date})}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Supplier"
                    fullWidth
                    size="small"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Manufacturer"
                    fullWidth
                    size="small"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Location & Assignment */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>
                Location & Assignment
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    fullWidth
                    size="small"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Building A, Floor 3"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      label="Department"
                    >
                      <MenuItem value="">None</MenuItem>
                      {departments.map(dept => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Initial Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      label="Initial Status"
                    >
                      {ASSET_STATUS.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <status.icon sx={{ fontSize: 18, color: status.color }} />
                            <span>{status.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional details about the asset"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Internal notes (not visible to employees)"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
              <Button 
                onClick={() => setOpenDialog(false)} 
                variant="outlined"
                disabled={loading}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={loading || !formData.name || !formData.category || !formData.serialNumber}
                sx={{ 
                  borderRadius: 2,
                  px: 5,
                  background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)'
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    <span>Saving...</span>
                  </Box>
                ) : (
                  editingAsset ? 'Update Asset' : 'Create Asset'
                )}
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Assign Asset Dialog - FIXED VERSION */}
        <Dialog 
          open={openAssignDialog} 
          onClose={() => !loading && setOpenAssignDialog(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Transition}
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
            py: 2.5
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                <AssignmentTurnedIn />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Assign Asset
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {selectedAsset?.name}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ pt: 2 }}>
              {/* Employee Assignment */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Assign To Employee</InputLabel>
                <Select
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    assignedTo: e.target.value,
                    department: '' // Clear department when employee is selected
                  })}
                  label="Assign To Employee"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {loadingEmployees ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <span>Loading employees...</span>
                      </Box>
                    </MenuItem>
                  ) : employees.length > 0 ? (
                    employees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                          <Person sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">{emp.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp.email || ''}
                              {emp.departmentName && ` • ${emp.departmentName}`}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography color="text.secondary">No employees available</Typography>
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>Select an employee to assign this asset</FormHelperText>
              </FormControl>

              <Typography align="center" sx={{ my: 2 }} color="text.secondary">
                OR
              </Typography>

              {/* Department Assignment */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Assign to Department</InputLabel>
                <Select
                  value={formData.department || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    department: e.target.value,
                    assignedTo: null // Clear employee when department is selected
                  })}
                  label="Assign to Department"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {departments.length > 0 ? (
                    departments.map(dept => (
                      <MenuItem key={dept._id} value={dept._id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Business sx={{ fontSize: 18, color: 'secondary.main' }} />
                          <Box>
                            <Typography variant="body2">{dept.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dept.code || ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments available</MenuItem>
                  )}
                </Select>
                <FormHelperText>Or assign to a department directly</FormHelperText>
              </FormControl>

              {/* Assignment Notes */}
              <TextField
                label="Assignment Notes"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes about this assignment (e.g., purpose, duration, etc.)"
                sx={{ mt: 3 }}
              />

              {/* Assignment Summary */}
              {(formData.assignedTo || formData.department) && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    mt: 3, 
                    p: 2, 
                    bgcolor: 'success.50',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} color="success.dark" gutterBottom>
                    Assignment Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Asset:</strong> {selectedAsset?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Assigned to:</strong> {
                        formData.assignedTo 
                          ? employees.find(e => e._id === formData.assignedTo)?.name 
                          : departments.find(d => d._id === formData.department)?.name
                      }
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {formData.assignedTo ? 'Individual' : 'Department'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date().toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Paper>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={2} width="100%" justifyContent="flex-end">
              <Button 
                onClick={() => {
                  setOpenAssignDialog(false);
                  setFormData(prev => ({
                    ...prev,
                    assignedTo: null,
                    department: '',
                    notes: ''
                  }));
                }} 
                variant="outlined"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssign} 
                variant="contained"
                disabled={loading || (!formData.assignedTo && !formData.department)}
                sx={{
                  background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)'
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    <span>Assigning...</span>
                  </Box>
                ) : (
                  'Assign Asset'
                )}
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Maintenance Dialog */}
        <Dialog 
          open={openMaintenanceDialog} 
          onClose={() => !loading && setOpenMaintenanceDialog(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'warning.main',
            color: 'white',
            py: 2.5
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: 'white', color: 'warning.main' }}>
                <Build />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Schedule Maintenance
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {selectedAsset?.name}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Maintenance Type</InputLabel>
                <Select
                  value={formData.maintenanceType || 'scheduled'}
                  onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
                  label="Maintenance Type"
                >
                  <MenuItem value="scheduled">Scheduled Maintenance</MenuItem>
                  <MenuItem value="repair">Repair</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                  <MenuItem value="calibration">Calibration</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Scheduled Date"
                value={formData.scheduledDate}
                onChange={(date) => setFormData({...formData, scheduledDate: date})}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />

              <TextField
                label="Maintenance Description *"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Describe the maintenance required"
              />

              <TextField
                label="Estimated Cost"
                fullWidth
                type="number"
                margin="normal"
                value={formData.maintenanceCost}
                onChange={(e) => setFormData({...formData, maintenanceCost: e.target.value})}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />

              <TextField
                label="Service Vendor"
                fullWidth
                margin="normal"
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                placeholder="Company performing the maintenance"
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={2} width="100%" justifyContent="flex-end">
              <Button 
                onClick={() => {
                  setOpenMaintenanceDialog(false);
                  setFormData(prev => ({
                    ...prev,
                    maintenanceType: 'scheduled',
                    scheduledDate: null,
                    notes: '',
                    maintenanceCost: '',
                    vendor: ''
                  }));
                }} 
                variant="outlined"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleMaintenance} 
                variant="contained"
                color="warning"
                disabled={loading || !formData.notes}
                sx={{
                  '&:hover': {
                    background: 'linear-gradient(145deg, #f57c00 0%, #ef6c00 100%)'
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    <span>Scheduling...</span>
                  </Box>
                ) : (
                  'Schedule Maintenance'
                )}
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* History Dialog */}
        <Dialog 
          open={openHistoryDialog} 
          onClose={() => setOpenHistoryDialog(false)} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'info.main',
            color: 'white',
            py: 2.5
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: 'white', color: 'info.main' }}>
                <History />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Asset History
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {selectedAsset?.name}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, maxHeight: '60vh', overflow: 'auto' }}>
            <Box sx={{ pt: 2 }}>
              {selectedAsset?.history?.length > 0 || selectedAsset?.maintenanceRecords?.length > 0 ? (
                <Stepper orientation="vertical" sx={{ '& .MuiStepContent-root': { ml: 2 } }}>
                  {/* Combine and sort history and maintenance records by date */}
                  {[...(selectedAsset.history || []), ...(selectedAsset.maintenanceRecords || [])]
                    .sort((a, b) => new Date(b.date || b.scheduledDate) - new Date(a.date || a.scheduledDate))
                    .map((event, index) => {
                      const isMaintenance = event.type || event.maintenanceType;
                      const date = event.date || event.scheduledDate;
                      const title = event.action || event.type || 'Maintenance';
                      const description = event.description || event.notes || 'No description';
                      
                      return (
                        <Step key={index} active>
                          <StepLabel
                            StepIconComponent={() => (
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: isMaintenance ? 'warning.light' : 'info.light',
                                  color: isMaintenance ? 'warning.dark' : 'info.dark'
                                }}
                              >
                                {isMaintenance ? <Build sx={{ fontSize: 16 }} /> : <History sx={{ fontSize: 16 }} />}
                              </Avatar>
                            )}
                          >
                            <Typography variant="subtitle2" fontWeight={600}>
                              {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(date)}
                            </Typography>
                          </StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {description}
                            </Typography>
                            {event.performedBy && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                <strong>By:</strong> {event.performedBy.name}
                              </Typography>
                            )}
                            {event.cost > 0 && (
                              <Typography variant="caption" display="block">
                                <strong>Cost:</strong> {formatCurrency(event.cost)}
                              </Typography>
                            )}
                            {event.vendor && (
                              <Typography variant="caption" display="block">
                                <strong>Vendor:</strong> {event.vendor}
                              </Typography>
                            )}
                          </StepContent>
                        </Step>
                      );
                    })}
                </Stepper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <History sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No History Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This asset doesn't have any history or maintenance records yet.
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Button 
              onClick={() => setOpenHistoryDialog(false)} 
              variant="contained"
              sx={{ width: '100%' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AssetManagement;