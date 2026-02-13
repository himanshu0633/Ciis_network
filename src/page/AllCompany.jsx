import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config";
import {
  Business,
  People,
  Search,
  FilterList,
  Download,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  Close,
  Email,
  Phone,
  Person,
  CheckCircle,
  Cancel,
  MoreVert,
  Edit,
  LocationOn,
  CalendarToday,
  Add,
  Refresh,
  Delete,
  Block,
  Info,
  AssignmentInd,
  PersonAdd,
  Dashboard,
  DataUsage,
  Apartment,
  Groups,
  Verified,
  Settings,
  NotificationsNone,
  ChevronRight,
  CorporateFare,
  AccountCircle,
  Language,
  Storage,
  Schedule
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  TextField,
  Box,
  Typography,
  Divider,
  Grid,
  LinearProgress,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Collapse,
  Container,
  alpha,
  styled,
  Badge as MuiBadge,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  AvatarGroup,
  Pagination,
  Breadcrumbs,
  Link
} from "@mui/material";

// Professional Styled Components
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  border: '1px solid #edf2f7',
  height: '100%',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    borderColor: '#2563eb',
  },
}));

const CompanyCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
  border: '1px solid #edf2f7',
  transition: 'all 0.2s ease',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
    borderColor: '#2563eb',
  },
}));

const StatusBadge = styled(Box)(({ active }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 30,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: active ? '#e6f7e6' : '#fee9e7',
  color: active ? '#0a5e0a' : '#b71c1c',
  border: `1px solid ${active ? '#a5d6a5' : '#ffcdd2'}`,
  '& svg': {
    fontSize: 14,
    marginRight: 4,
  },
}));

const InfoLabel = styled(Typography)({
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#64748b',
  marginBottom: 4,
});

const InfoValue = styled(Typography)({
  fontSize: '0.95rem',
  fontWeight: 500,
  color: '#1e293b',
  wordBreak: 'break-word',
});

const ActionButton = styled(Button)(({ variant }) => ({
  borderRadius: 12,
  padding: '8px 20px',
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'none',
  boxShadow: 'none',
  ...(variant === 'contained' && {
    background: '#2563eb',
    color: 'white',
    '&:hover': {
      background: '#1d4ed8',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: '#e2e8f0',
    color: '#1e293b',
    '&:hover': {
      borderColor: '#2563eb',
      backgroundColor: '#f8fafc',
    },
  }),
}));

const ViewButton = styled(Button)({
  borderRadius: 12,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'none',
  backgroundColor: '#f8fafc',
  color: '#1e293b',
  border: '1px solid #e2e8f0',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderColor: '#2563eb',
    color: '#2563eb',
  },
  '& svg': {
    fontSize: 18,
  },
});

const AddUserBtn = styled(Button)({
  borderRadius: 12,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'none',
  background: '#2563eb',
  color: 'white',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  '&:hover': {
    background: '#1d4ed8',
    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
  },
  '& svg': {
    fontSize: 18,
  },
});

const LogoBox = styled(Box)({
  width: 80,
  height: 80,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  border: '2px solid #edf2f7',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
});

// Mobile optimized logo
const MobileLogoBox = styled(Box)({
  width: 50,
  height: 50,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  border: '2px solid #edf2f7',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const AllCompany = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // State variables
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications] = useState([
    { id: 1, message: 'New company registered', time: '5 min ago', read: false },
    { id: 2, message: 'Subscription expiring soon', time: '1 hour ago', read: false },
    { id: 3, message: 'User limit reached', time: '2 hours ago', read: true },
  ]);
  
  // Popup states
  const [usersPopupOpen, setUsersPopupOpen] = useState(false);
  const [companyDetailsPopupOpen, setCompanyDetailsPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyDetailsLoading, setCompanyDetailsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedCompany, setEditedCompany] = useState(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  // Validation function
  const validateSuperAdmin = () => {
    try {
      const superAdminRaw = localStorage.getItem("superAdmin");
      const token = localStorage.getItem("token");

      if (!superAdminRaw || !token) {
        toast.error("Please login as super admin");
        localStorage.clear();
        navigate("/superAdmin/login");
        return false;
      }

      const superAdmin = JSON.parse(superAdminRaw);
      
      if (superAdmin.department !== "Management" || superAdmin.role !== "super-admin") {
        toast.error("Access denied! Unauthorized access.");
        localStorage.clear();
        navigate("/");
        return false;
      }

      return true;
    } catch (error) {
      toast.error("Invalid session data");
      localStorage.clear();
      navigate("/super-admin/login");
      return false;
    }
  };

  // Fetch company details by ID
  const fetchCompanyDetails = async (companyId) => {
    try {
      setCompanyDetailsLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/company/${companyId}`,
        { headers }
      );
      
      if (response.data) {
        setCompanyDetails(response.data.company);
        setEditedCompany(response.data.company);
        setCompanyDetailsPopupOpen(true);
      } else {
        toast.error("Company details not found");
      }
    } catch (error) {
      console.error("❌ ERROR fetching company details:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.clear();
        navigate("/super-admin/login");
        return;
      }
      
      toast.error("Failed to load company details");
    } finally {
      setCompanyDetailsLoading(false);
    }
  };

  // Update company details
  const handleUpdateCompany = async () => {
    try {
      if (!validateSuperAdmin()) return;
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put(
        `${API_URL}/company/${editedCompany?._id}`,
        editedCompany,
        { headers }
      );
      
      if (response.data) {
        toast.success("Company updated successfully!");
        
        const updatedCompanies = companies.map(company => 
          company._id === editedCompany._id ? { ...company, ...editedCompany } : company
        );
        
        setCompanies(updatedCompanies);
        setFilteredCompanies(updatedCompanies);
        setCompanyDetails(response.data);
        setEditMode(false);
        
        fetchCompaniesWithUsers();
      }
    } catch (error) {
      console.error("❌ ERROR updating company:", error);
      toast.error(error.response?.data?.message || "Failed to update company");
    }
  };

  // Fetch all users and group by company
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(`${API_URL}/superAdmin/users`, { headers });
      
      if (response.data && response.data.length > 0) {
        const usersByCompany = {};
        
        response.data.forEach(user => {
          const companyId = user.company?._id || user.company;
          if (companyId) {
            if (!usersByCompany[companyId]) {
              usersByCompany[companyId] = [];
            }
            usersByCompany[companyId].push(user);
          }
        });
        
        return usersByCompany;
      }
      return {};
    } catch (error) {
      console.error("❌ ERROR in fetchAllUsers:", error);
      return {};
    }
  };

  // Main function to fetch companies with users
  const fetchCompaniesWithUsers = async () => {
    if (!validateSuperAdmin()) return;

    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch companies
      const companiesRes = await axios.get(
        `${API_URL}/superAdmin/companies`,
        { headers }
      );

      const companiesData = companiesRes.data || [];

      // Fetch users
      const usersByCompany = await fetchAllUsers();

      // Combine companies with their users
      const companiesWithUsers = companiesData.map(company => {
        const companyUsers = usersByCompany[company._id] || [];
        return {
          ...company,
          userCount: companyUsers.length,
          users: companyUsers.slice(0, 2) // Only show max 2 users on mobile
        };
      });

      setCompanies(companiesWithUsers);
      setFilteredCompanies(companiesWithUsers);

    } catch (error) {
      console.error("❌ ERROR in fetchCompaniesWithUsers:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.clear();
        navigate("/super-admin/login");
        return;
      }

      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search and filter
  useEffect(() => {
    let results = companies;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(company =>
        company.companyName?.toLowerCase().includes(term) ||
        company.companyEmail?.toLowerCase().includes(term) ||
        company.companyCode?.toLowerCase().includes(term) ||
        company.ownerName?.toLowerCase().includes(term)
      );
    }

    if (filter === "active") {
      results = results.filter(company => company.isActive === true);
    } else if (filter === "inactive") {
      results = results.filter(company => company.isActive === false);
    }

    setFilteredCompanies(results);
  }, [searchTerm, filter, companies]);

  // Initial load
  useEffect(() => {
    fetchCompaniesWithUsers();
  }, []);

  // Fetch users for popup
  const fetchCompanyUsers = async (companyId) => {
    try {
      setUsersLoading(true);
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      let users = [];
      
      try {
        const response = await axios.get(
          `${API_URL}/superAdmin/company/${companyId}/users`,
          { headers }
        );
        users = response.data;
      } catch (error) {
        const allUsersRes = await axios.get(
          `${API_URL}/superAdmin/users`,
          { headers }
        );
        
        users = allUsersRes.data.filter(user => 
          user.company?._id === companyId || user.company === companyId
        );
      }
      
      setCompanyUsers(users);
    } catch (error) {
      console.error("❌ Error fetching company users:", error);
      toast.error("Failed to load users");
      setCompanyUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Open users popup
  const handleOpenUsersPopup = async (company) => {
    setSelectedCompany(company);
    await fetchCompanyUsers(company._id);
    setUsersPopupOpen(true);
  };

  // Close users popup
  const handleCloseUsersPopup = () => {
    setUsersPopupOpen(false);
    setSelectedCompany(null);
    setCompanyUsers([]);
  };

  // Open company details popup
  const handleOpenCompanyDetails = async (company) => {
    setSelectedCompany(company);
    await fetchCompanyDetails(company._id);
  };

  // Close company details popup
  const handleCloseCompanyDetails = () => {
    setCompanyDetailsPopupOpen(false);
    setSelectedCompany(null);
    setCompanyDetails(null);
    setEditMode(false);
    setEditedCompany(null);
  };

  // Handle edit field change
  const handleEditChange = (field, value) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const csvRows = [];
      csvRows.push(['Company Code', 'Company Name', 'Email', 'Phone', 'Owner', 'Users', 'Status', 'Created'].join(','));
      
      filteredCompanies.forEach(company => {
        csvRows.push([
          company.companyCode || '',
          `"${company.companyName || ''}"`,
          company.companyEmail || '',
          company.companyPhone || '',
          `"${company.ownerName || ''}"`,
          company.userCount || 0,
          company.isActive ? 'Active' : 'Inactive',
          new Date(company.createdAt).toLocaleDateString()
        ].join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  // Toggle company expansion
  const toggleCompanyExpansion = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  // Create user for specific company
  const handleCreateUserForCompany = (companyId, companyCode) => {
    window.open(`http://localhost:5173/create-user?company=${companyId}&companyCode=${companyCode}`, '_blank');
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#2563eb';
      case 'manager': return '#7e22ce';
      case 'supervisor': return '#0891b2';
      case 'employee': return '#0a5e0a';
      default: return '#64748b';
    }
  };

  // Handle menu actions
  const handleMenuOpen = (event, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedAction(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAction(null);
  };

  const handleAction = (action) => {
    if (selectedAction) {
      switch (action) {
        case 'edit':
          handleOpenCompanyDetails(selectedAction);
          break;
        case 'delete':
          toast.info('Delete functionality coming soon');
          break;
        case 'deactivate':
          toast.info('Deactivate functionality coming soon');
          break;
      }
    }
    handleMenuClose();
  };

  const handleNotificationsOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
    setNotificationAnchor(null);
  };

  // Calculate statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.isActive).length;
  const totalUsers = companies.reduce((total, company) => total + (company.userCount || 0), 0);
  const activePercentage = totalCompanies > 0 ? Math.round((activeCompanies / totalCompanies) * 100) : 0;

  // Get company logo or fallback
  const getCompanyLogo = (company) => {
    return company?.logo || null;
  };

  // Get company color
  const getCompanyColor = (company) => {
    if (!company) return '#2563eb';
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
    const index = (company.companyName?.length || 0) % colors.length;
    return colors[index];
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#2563eb', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>Loading Companies...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          spacing={{ xs: 2, sm: 0 }}
          sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: '#2563eb', borderRadius: { xs: 2, sm: 3 } }}>
              <CorporateFare sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant={{ xs: 'h5', sm: 'h4' }} sx={{ fontWeight: 700, color: '#0f172a' }}>Companies</Typography>
              <Typography variant="body2" color="#64748b">Manage all organizations</Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
            <IconButton onClick={handleNotificationsOpen} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
              <MuiBadge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <NotificationsNone />
              </MuiBadge>
            </IconButton>
            {isDesktop && (
              <>
                <ActionButton 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={() => navigate('/RegisterCompany')}
                >                  
                Add Company
                </ActionButton>
                <ActionButton variant="outlined" startIcon={<Refresh />} onClick={fetchCompaniesWithUsers}>
                  Refresh
                </ActionButton>
              </>
            )}
            {!isDesktop && (
              <>
                <IconButton sx={{ bgcolor: '#2563eb', color: 'white', '&:hover': { bgcolor: '#1d4ed8' } }} onClick={() => window.open('http://localhost:5173/create-company', '_blank')}>
                  <Add />
                </IconButton>
                <IconButton sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }} onClick={fetchCompaniesWithUsers}>
                  <Refresh />
                </IconButton>
              </>
            )}
          </Stack>
        </Stack>

        {/* Stats Cards - 2 per row on mobile */}
       
<Box sx={{ 
  display: 'grid',
  gridTemplateColumns: { 
    xs: 'repeat(2, 1fr)',    // 2 columns on mobile
    md: 'repeat(4, 1fr)'      // 4 columns on desktop
  },
  gap: { xs: 1.5, sm: 2, md: 3 },
  mb: { xs: 2, sm: 3, md: 4 }
}}>
  {[ 
    { label: 'TOTAL', value: totalCompanies, icon: <Apartment />, bgcolor: '#e0e7ff', color: '#2563eb' },
    { label: 'ACTIVE', value: activeCompanies, icon: <CheckCircle />, bgcolor: '#e6f7e6', color: '#0a5e0a' },
    { label: 'USERS', value: totalUsers, icon: <Groups />, bgcolor: '#e0f2fe', color: '#0284c7' },
    { label: 'FILTERED', value: filteredCompanies.length, icon: <FilterList />, bgcolor: '#fff3e0', color: '#b45309' }
  ].map((item, index) => (
    <StatCard key={index}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {item.label}
            </Typography>
            <Typography variant={{ xs: 'h5', sm: 'h4', md: 'h3' }} sx={{ fontWeight: 700, color: '#0f172a' }}>
              {item.value}
            </Typography>
          </Box>
          <Box sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: item.bgcolor, borderRadius: { xs: 2, sm: 3 }, color: item.color }}>
            {React.cloneElement(item.icon, { sx: { fontSize: { xs: 20, sm: 28, md: 32 } } })}
          </Box>
        </Stack>
      </CardContent>
    </StatCard>
  ))}
</Box>

<Grid 
  container 
  spacing={{ xs: 1.5, sm: 2, md: 3 }} 
  sx={{ 
    mb: { xs: 2, sm: 3, md: 4 },
    display: 'grid',
    gridTemplateColumns: { 
      xs: 'repeat(2, 1fr)',    // 2 columns mobile
      md: 'repeat(4, 1fr)'      // 4 columns desktop
    },
    gap: '20px !important',      // Force gap
    '& > .MuiGrid-item': {
      padding: '0 !important',    // Remove default padding
      width: '100% !important',   // Full width
      maxWidth: 'none !important' // Override max-width
    }
  }}
>
  <Grid item xs={12}>
    <StatCard>...</StatCard>
  </Grid>
  {/* ... other items */}
</Grid>

        {/* Search and Filter */}
        <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, sm: 3, md: 4 }, borderRadius: { xs: 3, sm: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94a3b8', fontSize: isMobile ? 18 : 20 }} /></InputAdornment>,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Close fontSize="small" />
                    </IconButton>
                  ),
                  sx: { borderRadius: { xs: 2, sm: 3 }, bgcolor: '#ffffff' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1.5} 
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              >
                <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={(e, value) => value && setFilter(value)}
                  size={isMobile ? "small" : "medium"}
                  sx={{ bgcolor: '#ffffff', width: { xs: '100%', sm: 'auto' } }}
                >
                  <ToggleButton value="all" sx={{ flex: { xs: 1, sm: 'none' } }}>All</ToggleButton>
                  <ToggleButton value="active" sx={{ flex: { xs: 1, sm: 'none' } }}>Active</ToggleButton>
                  <ToggleButton value="inactive" sx={{ flex: { xs: 1, sm: 'none' } }}>Inactive</ToggleButton>
                </ToggleButtonGroup>
                <Button 
                  variant="outlined" 
                  startIcon={<Download />} 
                  onClick={handleExportCSV} 
                  sx={{ borderRadius: { xs: 2, sm: 3 }, width: { xs: '100%', sm: 'auto' } }}
                  size={isMobile ? "small" : "medium"}
                >
                  Export
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Companies List */}
        {filteredCompanies.length === 0 ? (
          <Paper sx={{ p: { xs: 4, sm: 6, md: 8 }, textAlign: 'center', borderRadius: { xs: 3, sm: 4 } }}>
            <CorporateFare sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: '#cbd5e1', mb: 2 }} />
            <Typography variant={{ xs: 'body1', sm: 'h6' }} sx={{ color: '#64748b' }}>No companies found</Typography>
          </Paper>
        ) : (
          <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {filteredCompanies.map((company) => (
              <CompanyCard key={company._id}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  {/* Main Row - Mobile Optimized */}
                  <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                    <Grid item xs={12} md={8}>
                      <Stack 
                        direction={{ xs: 'row', sm: 'row' }} 
                        spacing={{ xs: 2, sm: 3 }}
                        alignItems="flex-start"
                      >
                        {/* Mobile Optimized Logo */}
                        <MobileLogoBox>
                          {company.logo ? (
                            <img src={company.logo} alt={company.companyName} />
                          ) : (
                            <Avatar sx={{ width: '100%', height: '100%', bgcolor: getCompanyColor(company), fontSize: 20 }}>
                              {company.companyName?.charAt(0) || 'C'}
                            </Avatar>
                          )}
                        </MobileLogoBox>

                        {/* Company Info - Mobile Optimized */}
                        <Box sx={{ flex: 1 }}>
                          <Stack 
                            direction="column"
                            alignItems="flex-start" 
                            spacing={1} 
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                              {company.companyName || "Unnamed Company"}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                              <Chip label={company.companyCode || "N/A"} size="small" sx={{ bgcolor: '#e0e7ff', color: '#2563eb', fontWeight: 600, height: 22 }} />
                              <StatusBadge active={company.isActive ? 1 : 0} sx={{ py: '2px', px: '8px' }}>
                                {company.isActive ? <CheckCircle sx={{ fontSize: 12 }} /> : <Cancel sx={{ fontSize: 12 }} />}
                                {company.isActive ? "Active" : "Inactive"}
                              </StatusBadge>
                            </Stack>
                          </Stack>

                          {/* Only show essential info on mobile */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Email sx={{ fontSize: 14, color: '#94a3b8' }} />
                            <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.75rem' }}>
                              {company.companyEmail || "No email"}
                            </Typography>
                          </Box>

                          <Box>
                            <InfoLabel sx={{ fontSize: '0.65rem' }}>Total Users</InfoLabel>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb' }}>
                              {company.userCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Stack 
                        direction="row" 
                        justifyContent="flex-end" 
                        spacing={1} 
                        sx={{ mb: 2 }}
                      >
                        <IconButton size="small" onClick={() => toggleCompanyExpansion(company._id)} sx={{ bgcolor: '#f8fafc' }}>
                          {expandedCompany === company._id ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, company)} sx={{ bgcolor: '#f8fafc' }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#f8fafc', borderRadius: { xs: 2, sm: 3 } }}>
                        <InfoLabel sx={{ fontSize: '0.65rem' }}>Address</InfoLabel>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="caption" color="#1e293b" sx={{ fontSize: '0.7rem' }}>
                            {company.companyAddress?.substring(0, 30) || "No address"}
                            {company.companyAddress?.length > 30 ? '...' : ''}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Expanded Details - Hide company details on mobile */}
                  {!isMobile && (
                    <Collapse in={expandedCompany === company._id}>
                      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Language sx={{ color: '#64748b' }} />
                              <Box>
                                <InfoLabel>Domain</InfoLabel>
                                <InfoValue>{company.companyDomain || "Not provided"}</InfoValue>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Storage sx={{ color: '#64748b' }} />
                              <Box>
                                <InfoLabel>Database ID</InfoLabel>
                                <InfoValue>{company.dbIdentifier || "N/A"}</InfoValue>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Schedule sx={{ color: '#64748b' }} />
                              <Box>
                                <InfoLabel>Subscription</InfoLabel>
                                <InfoValue>{formatDate(company.subscriptionExpiry)}</InfoValue>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  )}

                  {/* Users Preview - Only show max 2 users */}
                  <Box sx={{ mt: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Groups sx={{ color: '#2563eb', fontSize: { xs: 18, sm: 20 } }} />
                        <Typography variant={{ xs: 'body2', sm: 'subtitle1' }} sx={{ fontWeight: 700 }}>Team</Typography>
                        <Chip label={`${company.userCount || 0}`} size="small" sx={{ bgcolor: '#e0e7ff', color: '#2563eb', height: 20 }} />
                      </Stack>
                      {(company.userCount || 0) > 0 && (
                        <Button 
                          size="small" 
                          onClick={() => handleOpenUsersPopup(company)} 
                          endIcon={<ChevronRight />} 
                          sx={{ color: '#2563eb', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                        >
                          View All
                        </Button>
                      )}
                    </Stack>

                    {company.userCount > 0 ? (
                      <Grid container spacing={2}>
                        {(company.users || []).map((user, index) => (
                          <Grid item xs={6} sm={6} md={3} key={index}>
                            <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: { xs: 2, sm: 3 }, border: '1px solid #e2e8f0' }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <MuiBadge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  badgeContent={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: user.isActive ? '#0a5e0a' : '#b71c1c', border: '2px solid white' }} />}
                                >
                                  <Avatar sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 }, bgcolor: getRoleColor(user.role), fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                    {user.name?.charAt(0) || 'U'}
                                  </Avatar>
                                </MuiBadge>
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                    {user.name?.split(' ')[0] || "User"}
                                  </Typography>
                                  <Chip 
                                    label={user.role || "User"} 
                                    size="small" 
                                    sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#f1f5f9' }} 
                                  />
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc', borderRadius: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                        <Typography color="#64748b" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>No team members yet</Typography>
                        <AddUserBtn 
                          size="small" 
                          startIcon={<PersonAdd />} 
                          onClick={() => handleCreateUserForCompany(company._id, company.companyCode)}
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Add Member
                        </AddUserBtn>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pt: 0 }}>
                  <Stack 
                    direction={{ xs: 'row', sm: 'row' }} 
                    spacing={{ xs: 1, sm: 2 }} 
                    justifyContent="flex-end" 
                    sx={{ width: '100%' }}
                  >
                    <ViewButton 
                      startIcon={<Visibility />} 
                      onClick={() => handleOpenCompanyDetails(company)}
                      sx={{ width: { xs: '50%', sm: 'auto' }, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                      size="small"
                    >
                      Details
                    </ViewButton>
                    <AddUserBtn 
                      startIcon={<PersonAdd />} 
                      onClick={() => handleCreateUserForCompany(company._id, company.companyCode)}
                      sx={{ width: { xs: '50%', sm: 'auto' }, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                      size="small"
                    >
                      Add
                    </AddUserBtn>
                  </Stack>
                </CardActions>
              </CompanyCard>
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {!isMobile && filteredCompanies.length > 0 && (
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, mt: { xs: 2, sm: 3 }, borderRadius: { xs: 3, sm: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="#64748b" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Showing {filteredCompanies.length} of {totalCompanies} companies
              </Typography>
              <Pagination 
                count={Math.ceil(filteredCompanies.length / 10)} 
                page={page} 
                onChange={(e, v) => setPage(v)} 
                shape="rounded" 
                size={isTablet ? "small" : "medium"}
              />
            </Stack>
          </Paper>
        )}
      </Container>

      {/* Mobile FAB */}
      {isMobile && (
        <Zoom in={true}>
          <SpeedDial 
            ariaLabel="Actions" 
            sx={{ position: 'fixed', bottom: 16, right: 16 }} 
            icon={<SpeedDialIcon />} 
            FabProps={{ sx: { bgcolor: '#2563eb' } }}
          >
            <SpeedDialAction icon={<Add />} tooltipTitle="Add Company" onClick={() => window.open('http://localhost:5173/create-company', '_blank')} />
            <SpeedDialAction icon={<Refresh />} tooltipTitle="Refresh" onClick={fetchCompaniesWithUsers} />
            <SpeedDialAction icon={<Download />} tooltipTitle="Export" onClick={handleExportCSV} />
          </SpeedDial>
        </Zoom>
      )}

      {/* Company Details Dialog */}
      <Dialog 
        open={companyDetailsPopupOpen} 
        onClose={handleCloseCompanyDetails} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 4,
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid #e2e8f0' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={selectedCompany?.logo} sx={{ bgcolor: getCompanyColor(selectedCompany) }}>
                {selectedCompany?.companyName?.charAt(0) || 'C'}
              </Avatar>
              <Box>
                <Typography variant={{ xs: 'subtitle1', sm: 'h6' }} sx={{ fontWeight: 700 }}>{selectedCompany?.companyName} Details</Typography>
                <Typography variant="body2" color="#64748b">Code: {selectedCompany?.companyCode}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              {!editMode ? (
                <Button startIcon={<Edit />} onClick={() => setEditMode(true)} variant="outlined" size={isMobile ? "small" : "medium"}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={() => { setEditMode(false); setEditedCompany(companyDetails); }} size={isMobile ? "small" : "medium"}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCompany} variant="contained" size={isMobile ? "small" : "medium"}>
                    Save
                  </Button>
                </>
              )}
              <IconButton onClick={handleCloseCompanyDetails}><Close /></IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {companyDetailsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : companyDetails ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc', borderRadius: 3 }}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 3 }} 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Avatar src={companyDetails.logo} sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, bgcolor: getCompanyColor(companyDetails) }} />
                    <Box>
                      <Typography variant={{ xs: 'h6', sm: 'h5' }} sx={{ fontWeight: 700 }}>{companyDetails.companyName}</Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        <StatusBadge active={companyDetails.isActive ? 1 : 0}>
                          {companyDetails.isActive ? <CheckCircle /> : <Cancel />}
                          {companyDetails.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                        <Chip label={`ID: ${companyDetails.companyCode}`} />
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Basic Information</Typography>
                <Stack spacing={2}>
                  <Box>
                    <InfoLabel>Company Name</InfoLabel>
                    {editMode ? (
                      <TextField fullWidth size="small" value={editedCompany?.companyName || ''} onChange={(e) => handleEditChange('companyName', e.target.value)} />
                    ) : (
                      <InfoValue>{companyDetails.companyName}</InfoValue>
                    )}
                  </Box>
                  <Box>
                    <InfoLabel>Company Code</InfoLabel>
                    {editMode ? (
                      <TextField fullWidth size="small" value={editedCompany?.companyCode || ''} onChange={(e) => handleEditChange('companyCode', e.target.value)} />
                    ) : (
                      <InfoValue>{companyDetails.companyCode}</InfoValue>
                    )}
                  </Box>
                  <Box>
                    <InfoLabel>Owner</InfoLabel>
                    {editMode ? (
                      <TextField fullWidth size="small" value={editedCompany?.ownerName || ''} onChange={(e) => handleEditChange('ownerName', e.target.value)} />
                    ) : (
                      <InfoValue>{companyDetails.ownerName || "Not specified"}</InfoValue>
                    )}
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Contact Information</Typography>
                <Stack spacing={2}>
                  <Box>
                    <InfoLabel>Email</InfoLabel>
                    {editMode ? (
                      <TextField fullWidth size="small" value={editedCompany?.companyEmail || ''} onChange={(e) => handleEditChange('companyEmail', e.target.value)} />
                    ) : (
                      <InfoValue>{companyDetails.companyEmail || "Not provided"}</InfoValue>
                    )}
                  </Box>
                  <Box>
                    <InfoLabel>Phone</InfoLabel>
                    {editMode ? (
                      <TextField fullWidth size="small" value={editedCompany?.companyPhone || ''} onChange={(e) => handleEditChange('companyPhone', e.target.value)} />
                    ) : (
                      <InfoValue>{companyDetails.companyPhone || "Not provided"}</InfoValue>
                    )}
                  </Box>
                  <Box>
                    <InfoLabel>Domain</InfoLabel>
                    {editMode ? (
                      <TextField fullWidth size="small" value={editedCompany?.companyDomain || ''} onChange={(e) => handleEditChange('companyDomain', e.target.value)} />
                    ) : (
                      <InfoValue>{companyDetails.companyDomain || "Not specified"}</InfoValue>
                    )}
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Address</Typography>
                {editMode ? (
                  <TextField fullWidth multiline rows={2} value={editedCompany?.companyAddress || ''} onChange={(e) => handleEditChange('companyAddress', e.target.value)} />
                ) : (
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <InfoValue>{companyDetails.companyAddress || "No address provided"}</InfoValue>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Additional Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><InfoLabel>Database ID</InfoLabel><InfoValue>{companyDetails.dbIdentifier}</InfoValue></Grid>
                  <Grid item xs={6}><InfoLabel>Subscription</InfoLabel><InfoValue>{formatDate(companyDetails.subscriptionExpiry)}</InfoValue></Grid>
                  <Grid item xs={6}><InfoLabel>Created</InfoLabel><InfoValue>{formatDate(companyDetails.createdAt)}</InfoValue></Grid>
                  <Grid item xs={6}><InfoLabel>Updated</InfoLabel><InfoValue>{formatDate(companyDetails.updatedAt)}</InfoValue></Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Typography>No details found</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCloseCompanyDetails}>Close</Button>
          {selectedCompany && !editMode && (
            <Button variant="contained" onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}>
              Add Member
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Users Dialog */}
      <Dialog 
        open={usersPopupOpen} 
        onClose={handleCloseUsersPopup} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 4,
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant={{ xs: 'subtitle1', sm: 'h6' }}>{selectedCompany?.companyName} - Team Members</Typography>
            <IconButton onClick={handleCloseUsersPopup}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {usersLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : companyUsers.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'auto' }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    {!isMobile && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={user.avatar} sx={{ bgcolor: getRoleColor(user.role), width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 } }}>
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="#64748b" sx={{ display: { xs: 'block', sm: 'none' } }}>
                              {user.employeeId || ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{user.email}</TableCell>
                      <TableCell><Chip label={user.role || 'User'} size="small" sx={{ height: { xs: 20, sm: 24 }, fontSize: { xs: '0.65rem', sm: '0.75rem' } }} /></TableCell>
                      <TableCell>
                        <StatusBadge active={user.isActive ? 1 : 0} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {user.isActive ? <CheckCircle /> : <Cancel />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </TableCell>
                      {!isMobile && (
                        <TableCell align="right">
                          <IconButton size="small"><Person /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="#64748b">No members found</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCloseUsersPopup}>Close</Button>
          {selectedCompany && (
            <Button variant="contained" onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}>
              Add Member
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Popover 
        open={notificationsOpen} 
        anchorEl={notificationAnchor} 
        onClose={handleNotificationsClose} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 320 },
            maxWidth: '100%',
            m: { xs: 1, sm: 0 }
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Notifications</Typography>
          <List>
            {notifications.map((n) => (
              <ListItem key={n.id} sx={{ bgcolor: n.read ? 'transparent' : '#f8fafc', borderRadius: 2, mb: 1 }}>
                <ListItemAvatar><Avatar sx={{ bgcolor: '#e0e7ff' }}><Info /></Avatar></ListItemAvatar>
                <MuiListItemText primary={n.message} secondary={n.time} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>

      {/* Action Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('deactivate')}>
          <ListItemIcon><Block fontSize="small" /></ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AllCompany;