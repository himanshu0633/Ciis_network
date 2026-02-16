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
  Apartment,
  Groups,
  NotificationsNone,
  ChevronRight,
  CorporateFare,
  Language,
  Storage,
  Schedule,
  TrendingUp,
  Assessment,
  ArrowUpward,
  ArrowDownward,
  Sort
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
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
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
  Pagination,
  Breadcrumbs,
  Link,
  Grow,
  Fade,
  Slide,
  ButtonGroup,
  Skeleton,
  Alert,
  AlertTitle,
  Checkbox,
  Select,
  MenuItem as SelectMenuItem
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

const GradientButton = styled(Button)(({ variant }) => ({
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

const ActionIconButton = styled(IconButton)({
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: 'white',
  },
});

const LogoContainer = styled(Box)(({ size = 'medium' }) => ({
  width: size === 'large' ? 100 : size === 'medium' ? 70 : 50,
  height: size === 'large' ? 100 : size === 'medium' ? 70 : 50,
  borderRadius: size === 'large' ? 20 : size === 'medium' ? 16 : 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  border: '1px solid #eef2f6',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
}));

const MetricCard = styled(Paper)({
  padding: '16px',
  borderRadius: 16,
  background: 'white',
  border: '1px solid #eef2f6',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#2563eb',
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.1)',
  },
});

const AllCompany = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // State variables
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New company registered', time: '5 min ago', read: false, type: 'registration' },
    { id: 2, message: 'Subscription expiring soon', time: '1 hour ago', read: false, type: 'subscription' },
    { id: 3, message: 'User limit reached', time: '2 hours ago', read: true, type: 'alert' },
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
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

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

      const companiesRes = await axios.get(
        `${API_URL}/superAdmin/companies`,
        { headers }
      );

      const companiesData = companiesRes.data || [];
      const usersByCompany = await fetchAllUsers();

      const companiesWithUsers = companiesData.map(company => {
        const companyUsers = usersByCompany[company._id] || [];
        return {
          ...company,
          userCount: companyUsers.length,
          users: companyUsers.slice(0, 2)
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

  // Handle search and filter with sorting
  useEffect(() => {
    let results = [...companies];

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

    results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.companyName || '').localeCompare(b.companyName || '');
          break;
        case 'users':
          comparison = (a.userCount || 0) - (b.userCount || 0);
          break;
        case 'date':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCompanies(results);
  }, [searchTerm, filter, sortBy, sortOrder, companies]);

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

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
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

  // Navigate to create user page
  const handleNavigateToCreateUser = (companyId, companyCode) => {
    navigate(`/create-user?company=${companyId}&companyCode=${companyCode}`);
  };

  // Navigate to create company page
  const handleNavigateToCreateCompany = () => {
    navigate('/RegisterCompany');
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

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Security fontSize="small" />;
      case 'manager': return <AssignmentInd fontSize="small" />;
      case 'supervisor': return <Visibility fontSize="small" />;
      case 'employee': return <Person fontSize="small" />;
      default: return <Person fontSize="small" />;
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
        case 'users':
          handleOpenUsersPopup(selectedAction);
          break;
        case 'deactivate':
          toast.info('Deactivate functionality coming soon');
          break;
        case 'delete':
          toast.info('Delete functionality coming soon');
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

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    handleNotificationsClose();
    toast.success('All notifications cleared');
  };

  // Handle bulk selection
  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map(c => c._id));
    }
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // Calculate statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.isActive).length;
  const totalUsers = companies.reduce((total, company) => total + (company.userCount || 0), 0);
  const activePercentage = totalCompanies > 0 ? Math.round((activeCompanies / totalCompanies) * 100) : 0;

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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
          </Stack>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: 4, mb: 4 }} />
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 4 }} />
            ))}
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header with Breadcrumbs */}
        <Stack spacing={2} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Breadcrumbs separator={<ChevronRight fontSize="small" />}>
            <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
              Dashboard
            </Link>
            <Typography color="text.primary">Companies</Typography>
          </Breadcrumbs>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#2563eb', borderRadius: { xs: 2, sm: 3 } }}>
                <CorporateFare sx={{ fontSize: { xs: 28, sm: 32 }, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant={{ xs: 'h5', sm: 'h4' }} sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Companies
                </Typography>
                <Typography variant="body2" color="#64748b">
                  {totalCompanies} organizations • {totalUsers} total users
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={1.5}>
              {!isMobile && (
                <>
                  <GradientButton
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleNavigateToCreateCompany}
                  >
                    Add Company
                  </GradientButton>
                  <GradientButton
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchCompaniesWithUsers}
                  >
                    Refresh
                  </GradientButton>
                </>
              )}
              <ActionIconButton onClick={handleNotificationsOpen}>
                <MuiBadge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <NotificationsNone />
                </MuiBadge>
              </ActionIconButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={6} md={3}>
            <Grow in timeout={300}>
              <StatCard>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="#64748b" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Companies
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mt: 1 }}>
                        {totalCompanies}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#e0e7ff', borderRadius: 3, color: '#2563eb' }}>
                      <Apartment sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={6} md={3}>
            <Grow in timeout={400}>
              <StatCard>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="#64748b" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Active Companies
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mt: 1 }}>
                        {activeCompanies}
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        {activePercentage}% of total
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#e6f7e6', borderRadius: 3, color: '#0a5e0a' }}>
                      <CheckCircle sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={6} md={3}>
            <Grow in timeout={500}>
              <StatCard>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="#64748b" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Users
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mt: 1 }}>
                        {totalUsers}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#e0f2fe', borderRadius: 3, color: '#0284c7' }}>
                      <Groups sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={6} md={3}>
            <Grow in timeout={600}>
              <StatCard>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="#64748b" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        Current View
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mt: 1 }}>
                        {filteredCompanies.length}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 3, color: '#b45309' }}>
                      <FilterList sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>
        </Grid>

        {/* Search and Filter Section */}
        <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: { xs: 3, sm: 4 }, borderRadius: { xs: 3, sm: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Close fontSize="small" />
                    </IconButton>
                  ),
                  sx: { borderRadius: { xs: 2, sm: 3 }, bgcolor: '#ffffff' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={7}>
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
                  sx={{ bgcolor: '#ffffff' }}
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="active">Active</ToggleButton>
                  <ToggleButton value="inactive">Inactive</ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  endIcon={sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                  onClick={handleFilterMenuOpen}
                  sx={{ borderRadius: { xs: 2, sm: 3 }, borderColor: '#e2e8f0' }}
                  size={isMobile ? "small" : "medium"}
                >
                  Sort
                </Button>

                <GradientButton
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportCSV}
                  size={isMobile ? "small" : "medium"}
                >
                  Export
                </GradientButton>

                {selectedCompanies.length > 0 && (
                  <Fade in>
                    <Chip
                      label={`${selectedCompanies.length} selected`}
                      onDelete={() => setSelectedCompanies([])}
                      color="primary"
                      sx={{ borderRadius: 2 }}
                    />
                  </Fade>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Companies List */}
        {filteredCompanies.length === 0 ? (
          <Fade in>
            <Paper sx={{ p: { xs: 4, sm: 6, md: 8 }, textAlign: 'center', borderRadius: { xs: 3, sm: 4 } }}>
              <CorporateFare sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: '#cbd5e1', mb: 2 }} />
              <Typography variant={{ xs: 'body1', sm: 'h6' }} sx={{ color: '#64748b', mb: 2 }}>
                No companies found
              </Typography>
              <GradientButton
                variant="contained"
                startIcon={<Add />}
                onClick={handleNavigateToCreateCompany}
              >
                Add New Company
              </GradientButton>
            </Paper>
          </Fade>
        ) : (
          <Stack spacing={{ xs: 2, sm: 2.5 }}>
            {filteredCompanies.map((company, index) => (
              <Grow in timeout={300 + index * 100} key={company._id}>
                <CompanyCard>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    {/* Header Row */}
                    <Stack 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      sx={{ mb: 2 }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {bulkMode && (
                          <Checkbox
                            checked={selectedCompanies.includes(company._id)}
                            onChange={() => handleSelectCompany(company._id)}
                            size="small"
                          />
                        )}
                        <Chip
                          label={company.companyCode || 'N/A'}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getCompanyColor(company), 0.1),
                            color: getCompanyColor(company),
                            fontWeight: 600,
                          }}
                        />
                        <StatusBadge active={company.isActive ? 1 : 0}>
                          {company.isActive ? <CheckCircle /> : <Cancel />}
                          {company.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </Stack>
                      
                      <Stack direction="row" spacing={1}>
                        <ActionIconButton size="small" onClick={() => toggleCompanyExpansion(company._id)}>
                          {expandedCompany === company._id ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                        </ActionIconButton>
                        <ActionIconButton size="small" onClick={(e) => handleMenuOpen(e, company)}>
                          <MoreVert fontSize="small" />
                        </ActionIconButton>
                      </Stack>
                    </Stack>

                    {/* Main Company Info */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
                          <LogoContainer size={isMobile ? 'small' : 'medium'}>
                            {company.logo ? (
                              <img src={company.logo} alt={company.companyName} />
                            ) : (
                              <Avatar 
                                sx={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  bgcolor: getCompanyColor(company),
                                  fontSize: isMobile ? 20 : 28,
                                }}
                              >
                                {company.companyName?.charAt(0) || 'C'}
                              </Avatar>
                            )}
                          </LogoContainer>

                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant={isMobile ? "h6" : "h5"} 
                              sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}
                            >
                              {company.companyName || "Unnamed Company"}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                              <Chip
                                icon={<Email sx={{ fontSize: 14 }} />}
                                label={company.companyEmail || "No email"}
                                size="small"
                                variant="outlined"
                              />
                              {company.companyPhone && (
                                <Chip
                                  icon={<Phone sx={{ fontSize: 14 }} />}
                                  label={company.companyPhone}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {company.ownerName && (
                                <Chip
                                  icon={<Person sx={{ fontSize: 14 }} />}
                                  label={company.ownerName}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Stack>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color="#64748b" sx={{ display: 'block', fontWeight: 600 }}>
                                  Total Users
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2563eb' }}>
                                  {company.userCount || 0}
                                </Typography>
                              </Box>
                              {/* <Box>
                                <Typography variant="caption" color="#64748b" sx={{ display: 'block', fontWeight: 600 }}>
                                  Domain
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                  {company.companyDomain || "Not set"}
                                </Typography>
                              </Box> */}
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <MetricCard sx={{ p: 2, height: '100%' }}>
                          <Typography variant="caption" color="#64748b" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            COMPANY METRICS
                          </Typography>
                          
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 16, color: '#64748b' }} />
                              <Typography variant="body2" color="#1e293b" noWrap>
                                {company.companyAddress?.substring(0, 40) || "No address"}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday sx={{ fontSize: 16, color: '#64748b' }} />
                              <Typography variant="body2" color="#1e293b">
                                Created {formatRelativeTime(company.createdAt)}
                              </Typography>
                            </Box>

                            {company.subscriptionExpiry && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule sx={{ fontSize: 16, color: '#64748b' }} />
                                <Typography variant="body2" color="#1e293b">
                                  Expires: {formatDate(company.subscriptionExpiry)}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </MetricCard>
                      </Grid>
                    </Grid>

                    {/* Expanded Details */}
                    <Collapse in={expandedCompany === company._id}>
                      <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid #eef2f6' }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                              Additional Information
                            </Typography>
                            <Stack spacing={2}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <InfoLabel>Company Type:</InfoLabel>
                                <InfoValue>{company.companyType || "Standard"}</InfoValue>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <InfoLabel>Database ID:</InfoLabel>
                                <InfoValue>{company.dbIdentifier || "Not provided"}</InfoValue>
                              </Box>
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                              System Information
                            </Typography>
                            <Stack spacing={2}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <InfoLabel>Last Active:</InfoLabel>
                                <InfoValue>{formatRelativeTime(company.lastActive) || "Never"}</InfoValue>
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>

                    {/* Team Section */}
                    <Box sx={{ mt: 3 }}>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        sx={{ mb: 2 }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Groups sx={{ color: '#2563eb', fontSize: { xs: 20, sm: 24 } }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Team Members
                          </Typography>
                          <Chip 
                            label={company.userCount || 0} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha('#2563eb', 0.1),
                              color: '#2563eb',
                              fontWeight: 600,
                            }} 
                          />
                        </Stack>
                        
                        <Stack direction="row" spacing={1}>
                          {(company.userCount || 0) > 0 && (
                            <Button 
                              size="small"
                              onClick={() => handleOpenUsersPopup(company)}
                              endIcon={<ChevronRight />}
                              sx={{ color: '#2563eb', textTransform: 'none' }}
                            >
                              View All
                            </Button>
                          )}
                          <GradientButton
                            size="small"
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => handleNavigateToCreateUser(company._id, company.companyCode)}
                            sx={{ py: 0.5 }}
                          >
                            Add
                          </GradientButton>
                        </Stack>
                      </Stack>

                      {company.userCount > 0 ? (
                        <Grid container spacing={2}>
                          {(company.users || []).map((user, idx) => (
                            <Grid item xs={6} sm={3} key={idx}>
                              <Paper sx={{ 
                                p: { xs: 1.5, sm: 2 }, 
                                borderRadius: 3, 
                                border: '1px solid #eef2f6',
                                '&:hover': {
                                  borderColor: '#2563eb',
                                },
                              }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <MuiBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                      <Box sx={{ 
                                        width: 10, 
                                        height: 10, 
                                        borderRadius: '50%', 
                                        bgcolor: user.isActive ? '#10b981' : '#ef4444',
                                        border: '2px solid white',
                                      }} />
                                    }
                                  >
                                    <Avatar 
                                      sx={{ 
                                        width: { xs: 36, sm: 44 }, 
                                        height: { xs: 36, sm: 44 },
                                        bgcolor: getRoleColor(user.role),
                                      }}
                                    >
                                      {user.name?.charAt(0) || 'U'}
                                    </Avatar>
                                  </MuiBadge>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                      {user.name || "User"}
                                    </Typography>
                                    <Chip 
                                      label={user.role || "User"} 
                                      size="small" 
                                      sx={{ 
                                        height: 20, 
                                        fontSize: '0.6rem',
                                        bgcolor: alpha(getRoleColor(user.role), 0.1),
                                        color: getRoleColor(user.role),
                                        fontWeight: 600,
                                      }} 
                                    />
                                  </Box>
                                </Stack>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ 
                          p: { xs: 3, sm: 4 }, 
                          bgcolor: '#f8fafc', 
                          borderRadius: 4, 
                          textAlign: 'center',
                          border: '2px dashed #e2e8f0',
                        }}>
                          <PersonAdd sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                          <Typography color="#64748b" sx={{ mb: 2 }}>
                            No team members yet
                          </Typography>
                          <GradientButton
                            size="small"
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => handleNavigateToCreateUser(company._id, company.companyCode)}
                          >
                            Add First Member
                          </GradientButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </CompanyCard>
              </Grow>
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {!isMobile && filteredCompanies.length > 0 && (
          <Paper sx={{ p: 2, mt: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="#64748b" variant="body2">
                Showing {filteredCompanies.length} of {totalCompanies} companies
              </Typography>
              <Pagination 
                count={Math.ceil(filteredCompanies.length / 10)} 
                page={page} 
                onChange={(e, v) => setPage(v)} 
                shape="rounded" 
                color="primary"
                size={isTablet ? "small" : "medium"}
              />
            </Stack>
          </Paper>
        )}
      </Container>

      {/* Mobile FAB */}
      {isMobile && (
        <Zoom in>
          <SpeedDial
            ariaLabel="Actions"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            FabProps={{ sx: { bgcolor: '#2563eb' } }}
          >
            <SpeedDialAction
              icon={<Add />}
              tooltipTitle="Add Company"
              onClick={handleNavigateToCreateCompany}
            />
            <SpeedDialAction
              icon={<PersonAdd />}
              tooltipTitle="Add User"
              onClick={() => navigate('/create-user')}
            />
            <SpeedDialAction
              icon={<Refresh />}
              tooltipTitle="Refresh"
              onClick={fetchCompaniesWithUsers}
            />
            <SpeedDialAction
              icon={<Download />}
              tooltipTitle="Export"
              onClick={handleExportCSV}
            />
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
        TransitionComponent={isMobile ? Slide : Fade}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 4,
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2.5, sm: 3 }, borderBottom: '1px solid #eef2f6' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <LogoContainer size="medium">
                <Avatar src={selectedCompany?.logo} sx={{ bgcolor: getCompanyColor(selectedCompany) }}>
                  {selectedCompany?.companyName?.charAt(0) || 'C'}
                </Avatar>
              </LogoContainer>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedCompany?.companyName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={selectedCompany?.companyCode} 
                    size="small" 
                    sx={{ bgcolor: alpha('#2563eb', 0.1), color: '#2563eb' }}
                  />
                  <StatusBadge active={selectedCompany?.isActive ? 1 : 0}>
                    {selectedCompany?.isActive ? <CheckCircle /> : <Cancel />}
                    {selectedCompany?.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                </Stack>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              {!editMode ? (
                <GradientButton
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                >
                  Edit
                </GradientButton>
              ) : (
                <>
                  <Button 
                    onClick={() => { 
                      setEditMode(false); 
                      setEditedCompany(companyDetails); 
                    }}
                    size={isMobile ? "small" : "medium"}
                  >
                    Cancel
                  </Button>
                  <GradientButton
                    onClick={handleUpdateCompany}
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                  >
                    Save Changes
                  </GradientButton>
                </>
              )}
              <IconButton onClick={handleCloseCompanyDetails}>
                <Close />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {companyDetailsLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ color: '#2563eb', mb: 2 }} />
              <Typography>Loading company details...</Typography>
            </Box>
          ) : companyDetails ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MetricCard sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {companyDetails.description || "No description provided."}
                  </Typography>
                </MetricCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Basic Information
                </Typography>
                <MetricCard sx={{ p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <InfoLabel>Company Name</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyName || ''} 
                          onChange={(e) => handleEditChange('companyName', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyName}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Company Code</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyCode || ''} 
                          onChange={(e) => handleEditChange('companyCode', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyCode}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Owner Name</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.ownerName || ''} 
                          onChange={(e) => handleEditChange('ownerName', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.ownerName || "Not specified"}</InfoValue>
                      )}
                    </Box>
                  </Stack>
                </MetricCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Contact Information
                </Typography>
                <MetricCard sx={{ p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <InfoLabel>Email Address</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyEmail || ''} 
                          onChange={(e) => handleEditChange('companyEmail', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyEmail || "Not provided"}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Phone Number</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyPhone || ''} 
                          onChange={(e) => handleEditChange('companyPhone', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyPhone || "Not provided"}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Domain</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyDomain || ''} 
                          onChange={(e) => handleEditChange('companyDomain', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyDomain || "Not specified"}</InfoValue>
                      )}
                    </Box>
                  </Stack>
                </MetricCard>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Address
                </Typography>
                <MetricCard sx={{ p: 2.5 }}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editedCompany?.companyAddress || ''}
                      onChange={(e) => handleEditChange('companyAddress', e.target.value)}
                      placeholder="Enter full address"
                    />
                  ) : (
                    <InfoValue>{companyDetails.companyAddress || "No address provided"}</InfoValue>
                  )}
                </MetricCard>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  System Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <InfoLabel>Database ID</InfoLabel>
                      <InfoValue>{companyDetails.dbIdentifier || "N/A"}</InfoValue>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <InfoLabel>Subscription</InfoLabel>
                      <InfoValue>{formatDate(companyDetails.subscriptionExpiry)}</InfoValue>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <InfoLabel>Created</InfoLabel>
                      <InfoValue>{formatDate(companyDetails.createdAt)}</InfoValue>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <InfoLabel>Last Updated</InfoLabel>
                      <InfoValue>{formatDate(companyDetails.updatedAt)}</InfoValue>
                    </MetricCard>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              <AlertTitle>Error</AlertTitle>
              Company details could not be loaded
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2.5, sm: 3 }, borderTop: '1px solid #eef2f6', gap: 1 }}>
          <Button onClick={handleCloseCompanyDetails} variant="outlined">
            Close
          </Button>
          {selectedCompany && !editMode && (
            <GradientButton
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                handleCloseCompanyDetails();
                handleNavigateToCreateUser(selectedCompany._id, selectedCompany.companyCode);
              }}
            >
              Add Team Member
            </GradientButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Users Dialog */}
      <Dialog 
        open={usersPopupOpen} 
        onClose={handleCloseUsersPopup} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Slide : Fade}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 4,
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2.5, sm: 3 }, borderBottom: '1px solid #eef2f6' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: getCompanyColor(selectedCompany) }}>
                <Groups />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedCompany?.companyName}
                </Typography>
                <Typography variant="body2" color="#64748b">
                  {companyUsers.length} team members
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={handleCloseUsersPopup}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {usersLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ color: '#2563eb', mb: 2 }} />
              <Typography>Loading team members...</Typography>
            </Box>
          ) : companyUsers.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={user.avatar} sx={{ bgcolor: getRoleColor(user.role), width: 32, height: 32 }}>
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role || 'User'} size="small" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={user.isActive ? 1 : 0}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PersonAdd sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 1 }}>
                No team members yet
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
                Start building your team by adding members
              </Typography>
              <GradientButton
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => {
                  handleCloseUsersPopup();
                  handleNavigateToCreateUser(selectedCompany?._id, selectedCompany?.companyCode);
                }}
              >
                Add Team Member
              </GradientButton>
            </Box>
          )}
        </DialogContent>

        {companyUsers.length > 0 && (
          <DialogActions sx={{ p: { xs: 2.5, sm: 3 }, borderTop: '1px solid #eef2f6' }}>
            <Button onClick={handleCloseUsersPopup}>Close</Button>
            <GradientButton
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                handleCloseUsersPopup();
                handleNavigateToCreateUser(selectedCompany?._id, selectedCompany?.companyCode);
              }}
            >
              Add Member
            </GradientButton>
          </DialogActions>
        )}
      </Dialog>

      {/* Notifications Popover */}
      <Popover
        open={notificationsOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 360 },
            maxWidth: '100%',
            borderRadius: 3,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button size="small" onClick={clearAllNotifications}>
                Clear All
              </Button>
            )}
          </Stack>

          {notifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: notification.read ? 'transparent' : alpha('#2563eb', 0.04),
                  }}
                  secondaryAction={
                    !notification.read && (
                      <IconButton edge="end" size="small" onClick={() => markNotificationAsRead(notification.id)}>
                        <CheckCircle fontSize="small" sx={{ color: '#10b981' }} />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: notification.type === 'registration' ? '#10b981' :
                               notification.type === 'subscription' ? '#f59e0b' :
                               notification.type === 'alert' ? '#ef4444' : '#8b5cf6',
                      width: 36,
                      height: 36,
                    }}>
                      {notification.type === 'registration' ? <Business /> :
                       notification.type === 'subscription' ? <Schedule /> :
                       notification.type === 'alert' ? <Info /> : <Person />}
                    </Avatar>
                  </ListItemAvatar>
                  <MuiListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={notification.time}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsNone sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography color="#64748b">No notifications</Typography>
            </Box>
          )}
        </Box>
      </Popover>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon><Edit fontSize="small" sx={{ color: '#2563eb' }} /></ListItemIcon>
          <ListItemText primary="Edit Company" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('users')}>
          <ListItemIcon><Groups fontSize="small" sx={{ color: '#8b5cf6' }} /></ListItemIcon>
          <ListItemText primary="View Users" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('deactivate')}>
          <ListItemIcon><Block fontSize="small" sx={{ color: '#f59e0b' }} /></ListItemIcon>
          <ListItemText primary="Deactivate" />
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#ef4444' }}>
          <ListItemIcon><Delete fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Filter/Sort Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 200 } }}
      >
        <MenuItem disabled>
          <Typography variant="caption" color="#64748b">Sort By</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('name'); handleFilterMenuClose(); }}>
          <ListItemText>Company Name</ListItemText>
          {sortBy === 'name' && <CheckCircle fontSize="small" sx={{ color: '#2563eb', ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('users'); handleFilterMenuClose(); }}>
          <ListItemText>User Count</ListItemText>
          {sortBy === 'users' && <CheckCircle fontSize="small" sx={{ color: '#2563eb', ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('date'); handleFilterMenuClose(); }}>
          <ListItemText>Created Date</ListItemText>
          {sortBy === 'date' && <CheckCircle fontSize="small" sx={{ color: '#2563eb', ml: 1 }} />}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); handleFilterMenuClose(); }}>
          <ListItemIcon>
            {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AllCompany;