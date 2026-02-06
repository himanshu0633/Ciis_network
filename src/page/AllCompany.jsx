import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config";
import {
  Business,
  People,
  ArrowBack,
  Search,
  FilterList,
  Download,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  Close,
  Email,
  Phone,
  Badge,
  Person,
  CheckCircle,
  Cancel,
  MoreVert,
  Edit,
  LocationOn,
  Security,
  CalendarToday,
  Domain,
  Link,
  Image,
  Storage,
  Add,
  Refresh,
  Delete,
  Block,
  Check,
  Warning,
  Info,
  AccountCircle,
  AssignmentInd,
  Work,
  Schedule,
  PersonAdd,
  ViewList,
  Dashboard,
  Cloud,
  DataUsage
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
  Fade,
  Slide,
  Grow,
  Container
} from "@mui/material";

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
        navigate("/super-admin/login");
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
      
      const response = await axios.get(`${API_URL}/super-admin/users`, { headers });
      
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
        `${API_URL}/super-admin/companies`,
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
          users: companyUsers.slice(0, 3)
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
          `${API_URL}/super-admin/company/${companyId}/users`,
          { headers }
        );
        users = response.data;
      } catch (error) {
        const allUsersRes = await axios.get(
          `${API_URL}/super-admin/users`,
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 0;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const csvRows = [];
      
      csvRows.push([
        'Company Code',
        'Company Name',
        'Email',
        'Phone',
        'Owner',
        'Total Users',
        'Status',
        'Created Date'
      ].join(','));
      
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
      link.setAttribute('download', `companies_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("❌ Export error:", error);
      toast.error("Failed to export report");
    }
  };

  // Toggle company expansion
  const toggleCompanyExpansion = async (companyId) => {
    if (expandedCompany === companyId) {
      setExpandedCompany(null);
    } else {
      setExpandedCompany(companyId);
    }
  };

  // Create user for specific company
  const handleCreateUserForCompany = (companyId, companyCode) => {
    window.open(`http://localhost:5173/create-user?company=${companyId}&companyCode=${companyCode}`, '_blank');
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'primary';
      case 'manager': return 'secondary';
      case 'supervisor': return 'info';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  // Handle menu actions
  const handleMenuOpen = (event, action, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedAction({ action, company });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAction(null);
  };

  const handleAction = (action) => {
    if (selectedAction && selectedAction.company) {
      switch (action) {
        case 'edit':
          handleOpenCompanyDetails(selectedAction.company);
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

  // Loading state
  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Loading Companies Data...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.disabled' }}>
          Please wait while we fetch the latest information
        </Typography>
      </Box>
    );
  }

  // Calculate statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.isActive).length;
  const totalUsers = companies.reduce((total, company) => total + (company.userCount || 0), 0);

  return (
    <Box sx={styles.container}>
      {/* Header Section */}
      <Box sx={styles.headerSection}>
        <Box sx={styles.headerContent}>
          <Box sx={styles.titleSection}>
            <Business sx={styles.titleIcon} />
            <Box>
              <Typography variant="h4" sx={styles.mainTitle}>
                All Companies & Users
              </Typography>
              <Typography variant="body1" sx={styles.subtitle}>
                Manage all companies and their users from one dashboard
              </Typography>
            </Box>
          </Box>
          
          {isDesktop && (
            <Box sx={styles.headerActions}>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={styles.addButton}
              >
                Add Company
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchCompaniesWithUsers}
                sx={styles.refreshButton}
              >
                Refresh
              </Button>
            </Box>
          )}
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={styles.statsGrid}>
          <Grid item xs={6} sm={3}>
            <Card sx={styles.statCard}>
              <CardContent>
                <Box sx={styles.statCardContent}>
                  <Box sx={{ ...styles.statIcon, bgcolor: 'primary.light' }}>
                    <Business sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={styles.statNumber}>
                      {totalCompanies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Companies
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={styles.statCard}>
              <CardContent>
                <Box sx={styles.statCardContent}>
                  <Box sx={{ ...styles.statIcon, bgcolor: 'success.light' }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={styles.statNumber}>
                      {activeCompanies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Companies
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={styles.statCard}>
              <CardContent>
                <Box sx={styles.statCardContent}>
                  <Box sx={{ ...styles.statIcon, bgcolor: 'info.light' }}>
                    <People sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={styles.statNumber}>
                      {totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={styles.statCard}>
              <CardContent>
                <Box sx={styles.statCardContent}>
                  <Box sx={{ ...styles.statIcon, bgcolor: 'warning.light' }}>
                    <DataUsage sx={{ color: 'warning.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={styles.statNumber}>
                      {filteredCompanies.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Filtered Results
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Controls Section */}
      <Card sx={styles.controlsCard}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search companies by name, email or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>

            {/* Filter Controls */}
            <Grid item xs={12} md={6}>
              <Box sx={styles.filterControls}>
                <TextField
                  select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  sx={styles.filterSelect}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterList />
                      </InputAdornment>
                    ),
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </TextField>
                
                <Box sx={styles.actionButtons}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportCSV}
                    sx={styles.exportButton}
                    size={isMobile ? "small" : "medium"}
                  >
                    {isMobile ? 'Export' : 'Export CSV'}
                  </Button>
                  
                  {isMobile && (
                    <IconButton
                      onClick={fetchCompaniesWithUsers}
                      sx={styles.mobileRefreshButton}
                    >
                      <Refresh />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* Tabs for Mobile/Tablet */}
          {!isDesktop && (
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={styles.mobileTabs}
            >
              <Tab icon={<Dashboard />} label="Companies" />
              <Tab icon={<People />} label="Users" />
              <Tab icon={<Cloud />} label="Analytics" />
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Companies List */}
      <Box sx={styles.companiesList}>
        {filteredCompanies.length === 0 ? (
          <Box sx={styles.emptyState}>
            <Business sx={styles.emptyIcon} />
            <Typography variant="h5" sx={styles.emptyTitle}>
              No companies found
            </Typography>
            <Typography variant="body1" sx={styles.emptyText}>
              Try changing your search or filter criteria
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchCompaniesWithUsers}
              sx={styles.emptyButton}
            >
              Retry Loading
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCompanies.map((company) => (
              <Grid item xs={12} key={company._id}>
                <Card sx={styles.companyCard}>
                  {/* Company Header */}
                  <CardContent>
                    <Box sx={styles.companyHeader}>
                      <Box sx={styles.companyLogoContainer}>
                        <Avatar
                          sx={{
                            ...styles.companyLogo,
                            bgcolor: company.isActive ? 'primary.main' : 'error.main'
                          }}
                        >
                          {company.companyName?.charAt(0) || 'C'}
                        </Avatar>
                      </Box>
                      
                      <Box sx={styles.companyInfo}>
                        <Box sx={styles.companyTitleRow}>
                          <Typography variant="h6" sx={styles.companyName}>
                            {company.companyName || "Unnamed Company"}
                          </Typography>
                          <Chip
                            label={company.companyCode || "N/A"}
                            size="small"
                            sx={styles.companyCode}
                          />
                        </Box>
                        
                        <Box sx={styles.companyMeta}>
                          <Chip
                            label={company.isActive ? "Active" : "Inactive"}
                            color={company.isActive ? "success" : "error"}
                            size="small"
                            icon={company.isActive ? <CheckCircle /> : <Cancel />}
                            sx={styles.statusChip}
                          />
                          
                          <Typography variant="body2" sx={styles.metaItem}>
                            <CalendarToday sx={styles.metaIcon} />
                            Created: {new Date(company.createdAt).toLocaleDateString()}
                          </Typography>
                          
                          <Typography variant="body2" sx={styles.metaItem}>
                            <People sx={styles.metaIcon} />
                            {company.userCount || 0} Users
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={styles.companyActions}>
                        <IconButton
                          onClick={() => toggleCompanyExpansion(company._id)}
                          sx={styles.expandButton}
                        >
                          {expandedCompany === company._id ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                        
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, 'actions', company)}
                          sx={styles.moreButton}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Company Details - Expanded */}
                    <Slide
                      direction="up"
                      in={expandedCompany === company._id}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Box sx={styles.companyDetails}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={styles.detailItem}>
                              <Typography variant="caption" color="textSecondary">
                                Email
                              </Typography>
                              <Typography variant="body2">
                                {company.companyEmail || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={styles.detailItem}>
                              <Typography variant="caption" color="textSecondary">
                                Phone
                              </Typography>
                              <Typography variant="body2">
                                {company.companyPhone || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={styles.detailItem}>
                              <Typography variant="caption" color="textSecondary">
                                Owner
                              </Typography>
                              <Typography variant="body2">
                                {company.ownerName || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={styles.detailItem}>
                              <Typography variant="caption" color="textSecondary">
                                Address
                              </Typography>
                              <Typography variant="body2">
                                {company.companyAddress || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Slide>

                    {/* Users Preview */}
                    <Box sx={styles.usersPreview}>
                      <Box sx={styles.usersHeader}>
                        <Box sx={styles.usersTitle}>
                          <People sx={styles.usersIcon} />
                          <Typography variant="subtitle1">
                            Users ({company.userCount || 0})
                          </Typography>
                        </Box>
                        
                        {(company.userCount || 0) > 0 && (
                          <Button
                            size="small"
                            onClick={() => handleOpenUsersPopup(company)}
                            endIcon={<Visibility />}
                            sx={styles.viewAllButton}
                          >
                            View All
                          </Button>
                        )}
                      </Box>

                      {(company.userCount || 0) > 0 ? (
                        <Box sx={styles.usersList}>
                          <Grid container spacing={2}>
                            {(company.users || []).map((user, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card variant="outlined" sx={styles.userCard}>
                                  <CardContent sx={styles.userCardContent}>
                                    <Box sx={styles.userCardHeader}>
                                      <Avatar
                                        sx={styles.userAvatar}
                                        src={user.avatar}
                                      >
                                        {user.name?.charAt(0) || 'U'}
                                      </Avatar>
                                      <Box sx={styles.userInfo}>
                                        <Typography variant="subtitle2" noWrap>
                                          {user.name || "Unknown User"}
                                        </Typography>
                                        <Chip
                                          label={user.role || "User"}
                                          size="small"
                                          color={getRoleColor(user.role)}
                                          sx={styles.userRoleChip}
                                        />
                                      </Box>
                                    </Box>
                                    
                                    <Typography variant="caption" color="textSecondary" noWrap>
                                      <AssignmentInd sx={styles.userDetailIcon} />
                                      {user.employeeId || "No ID"}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                          
                          {(company.userCount || 0) > 3 && (
                            <Box sx={styles.moreUsers}>
                              <Typography variant="body2" color="textSecondary">
                                + {(company.userCount || 0) - 3} more users
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={styles.noUsers}>
                          <Typography variant="body2" color="textSecondary">
                            No users in this company yet
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => handleCreateUserForCompany(company._id, company.companyCode)}
                            sx={styles.addFirstUserButton}
                          >
                            Add First User
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={styles.cardActions}>
                    <Button
                      fullWidth={isMobile}
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenCompanyDetails(company)}
                      sx={styles.viewDetailsButton}
                    >
                      View Details
                    </Button>
                    
                    <Button
                      fullWidth={isMobile}
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => handleCreateUserForCompany(company._id, company.companyCode)}
                      sx={styles.addUserButton}
                    >
                      Add User
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Summary Footer */}
      {!isMobile && (
        <Card sx={styles.summaryCard}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={styles.summaryItem}>
                  <Typography variant="body2" color="textSecondary">
                    Showing:
                  </Typography>
                  <Typography variant="h6" sx={styles.summaryNumber}>
                    {filteredCompanies.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    of {totalCompanies} companies
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={styles.summaryItem}>
                  <Typography variant="body2" color="textSecondary">
                    Total Users:
                  </Typography>
                  <Typography variant="h6" sx={styles.summaryNumber}>
                    {totalUsers}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={styles.summaryItem}>
                  <Typography variant="body2" color="textSecondary">
                    Active Companies:
                  </Typography>
                  <Typography variant="h6" sx={styles.summaryNumber}>
                    {activeCompanies}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={styles.fab}
            onClick={() => window.open('http://localhost:5173/create-company', '_blank')}
          >
            <Add />
          </Fab>
        </Zoom>
      )}

      {/* Company Details Dialog */}
      <Dialog
        open={companyDetailsPopupOpen}
        onClose={handleCloseCompanyDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: styles.dialogPaper
        }}
      >
        <DialogTitle sx={styles.companyDialogTitle}>
          <Box sx={styles.dialogHeader}>
            <Box sx={styles.dialogTitleContent}>
              <Business sx={styles.dialogTitleIcon} />
              <Box>
                <Typography variant="h5" sx={styles.dialogTitleText}>
                  {selectedCompany?.companyName || 'Company'} Details
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {editMode ? 'Edit Mode' : 'View Mode'} | Company Code: {selectedCompany?.companyCode}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={styles.dialogTitleActions}>
              {!editMode ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      setEditedCompany(companyDetails);
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateCompany}
                    variant="contained"
                    size="small"
                  >
                    Save
                  </Button>
                </>
              )}
              <IconButton onClick={handleCloseCompanyDetails} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {companyDetailsLoading ? (
            <Box sx={styles.loadingState}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading company details...
              </Typography>
            </Box>
          ) : companyDetails ? (
            <Grid container spacing={3}>
              {/* Company Logo and Status */}
              <Grid item xs={12}>
                <Card sx={styles.companyDetailsCard}>
                  <CardContent>
                    <Box sx={styles.companyDetailsHeader}>
                      <Avatar
                        src={companyDetails.logo}
                        sx={styles.companyDetailsLogo}
                        alt={companyDetails.companyName}
                      >
                        {companyDetails.companyName?.charAt(0) || 'C'}
                      </Avatar>
                      
                      <Box sx={styles.companyDetailsStatus}>
                        {editMode ? (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={editedCompany?.isActive || false}
                                onChange={(e) => handleEditChange('isActive', e.target.checked)}
                                color="primary"
                              />
                            }
                            label={editedCompany?.isActive ? "Active" : "Inactive"}
                          />
                        ) : (
                          <Chip
                            icon={companyDetails.isActive ? <CheckCircle /> : <Cancel />}
                            label={companyDetails.isActive ? "Active" : "Inactive"}
                            color={companyDetails.isActive ? "success" : "error"}
                            size="medium"
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business fontSize="small" /> Basic Information
                      </Typography>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Company Name</Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedCompany?.companyName || ''}
                              onChange={(e) => handleEditChange('companyName', e.target.value)}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body1">{companyDetails.companyName}</Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Company Code</Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedCompany?.companyCode || ''}
                              onChange={(e) => handleEditChange('companyCode', e.target.value)}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body1">{companyDetails.companyCode}</Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Owner Name</Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedCompany?.ownerName || ''}
                              onChange={(e) => handleEditChange('ownerName', e.target.value)}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body1">{companyDetails.ownerName}</Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" /> Contact Information
                      </Typography>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Email</Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedCompany?.companyEmail || ''}
                              onChange={(e) => handleEditChange('companyEmail', e.target.value)}
                              variant="outlined"
                              type="email"
                            />
                          ) : (
                            <Typography variant="body1">{companyDetails.companyEmail}</Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Phone</Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedCompany?.companyPhone || ''}
                              onChange={(e) => handleEditChange('companyPhone', e.target.value)}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body1">{companyDetails.companyPhone}</Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Domain</Typography>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={editedCompany?.companyDomain || ''}
                              onChange={(e) => handleEditChange('companyDomain', e.target.value)}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body1">{companyDetails.companyDomain}</Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" /> Address
                      </Typography>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {editMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={editedCompany?.companyAddress || ''}
                        onChange={(e) => handleEditChange('companyAddress', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{companyDetails.companyAddress}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info fontSize="small" /> Additional Information
                      </Typography>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Database Identifier</Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {companyDetails.dbIdentifier}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Subscription Expiry</Typography>
                          <Typography variant="body1">
                            {formatDate(companyDetails.subscriptionExpiry)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Created On</Typography>
                          <Typography variant="body1">{formatDate(companyDetails.createdAt)}</Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={styles.formField}>
                          <Typography variant="caption" color="textSecondary">Last Updated</Typography>
                          <Typography variant="body1">{formatDate(companyDetails.updatedAt)}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Box sx={styles.noData}>
              <Business sx={styles.noDataIcon} />
              <Typography variant="h6" color="textSecondary">
                Company details not found
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseCompanyDetails}>Close</Button>
          {selectedCompany && !editMode && (
            <Button
              variant="contained"
              onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}
              startIcon={<PersonAdd />}
            >
              Add User
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Users Popup Dialog */}
      <Dialog
        open={usersPopupOpen}
        onClose={handleCloseUsersPopup}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: styles.dialogPaper
        }}
      >
        <DialogTitle sx={styles.dialogTitle}>
          <Box sx={styles.dialogHeader}>
            <Box sx={styles.dialogTitleContent}>
              <Business sx={styles.dialogTitleIcon} />
              <Box>
                <Typography variant="h5" sx={styles.dialogTitleText}>
                  {selectedCompany?.companyName || 'Company'} Users
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Users: {companyUsers.length} | Company Code: {selectedCompany?.companyCode}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseUsersPopup} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {usersLoading ? (
            <Box sx={styles.loadingState}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading users...
              </Typography>
            </Box>
          ) : companyUsers.length > 0 ? (
            <TableContainer component={Paper} sx={styles.tableContainer}>
              <Table stickyHeader size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    {!isMobile && <TableCell>Email</TableCell>}
                    <TableCell>Role</TableCell>
                    {!isMobile && <TableCell>Department</TableCell>}
                    <TableCell>Status</TableCell>
                    {!isMobile && <TableCell>Last Login</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={styles.userTableCell}>
                          <Avatar sx={styles.tableAvatar}>
                            {user.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.employeeId || 'No ID'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Box sx={styles.emailCell}>
                            <Email sx={styles.tableIcon} />
                            {user.email}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={user.role || 'User'}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>{user.department || 'N/A'}</TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(user.isActive ? 'active' : 'inactive')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton size="small">
                            <Person fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={styles.noData}>
              <People sx={styles.noDataIcon} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Users Found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This company doesn't have any users yet.
              </Typography>
              {selectedCompany && (
                <Button
                  variant="contained"
                  onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}
                  startIcon={<PersonAdd />}
                  sx={{ mt: 2 }}
                >
                  Create First User
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseUsersPopup}>Close</Button>
          {selectedCompany && (
            <Button
              variant="contained"
              onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}
              startIcon={<PersonAdd />}
            >
              Add New User
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: styles.menuPaper
        }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Company</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('deactivate')}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete Company</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    bgcolor: 'background.default',
    p: { xs: 2, sm: 3, md: 4 }
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    bgcolor: 'background.default'
  },
  headerSection: {
    mb: 4
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    flexWrap: 'wrap',
    gap: 2
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  titleIcon: {
    fontSize: { xs: 32, sm: 40, md: 48 },
    color: 'primary.main'
  },
  mainTitle: {
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
  },
  subtitle: {
    color: 'text.secondary',
    fontSize: { xs: '0.875rem', sm: '1rem' }
  },
  headerActions: {
    display: 'flex',
    gap: 2
  },
  addButton: {
    borderRadius: 2,
    px: 3
  },
  refreshButton: {
    borderRadius: 2,
    px: 3
  },
  statsGrid: {
    mb: 3
  },
  statCard: {
    height: '100%',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 8
    }
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  statIcon: {
    p: 1.5,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statNumber: {
    fontWeight: 700,
    fontSize: { xs: '1.5rem', sm: '2rem' },
    lineHeight: 1
  },
  controlsCard: {
    mb: 3,
    borderRadius: 2,
    boxShadow: 2
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap'
  },
  filterSelect: {
    minWidth: 150,
    '& .MuiSelect-select': {
      py: { xs: 1.125, sm: 1.5 }
    }
  },
  actionButtons: {
    display: 'flex',
    gap: 1,
    alignItems: 'center'
  },
  exportButton: {
    borderRadius: 2
  },
  mobileRefreshButton: {
    border: '1px solid',
    borderColor: 'divider'
  },
  mobileTabs: {
    mt: 2
  },
  companiesList: {
    mb: 4
  },
  companyCard: {
    borderRadius: 2,
    boxShadow: 3,
    transition: 'all 0.3s',
    '&:hover': {
      boxShadow: 8
    }
  },
  companyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 2
  },
  companyLogoContainer: {
    flexShrink: 0
  },
  companyLogo: {
    width: { xs: 56, sm: 64 },
    height: { xs: 56, sm: 64 },
    fontSize: { xs: 24, sm: 28 }
  },
  companyInfo: {
    flex: 1,
    minWidth: 0
  },
  companyTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
    flexWrap: 'wrap'
  },
  companyName: {
    fontWeight: 600,
    fontSize: { xs: '1rem', sm: '1.25rem' }
  },
  companyCode: {
    fontSize: '0.75rem'
  },
  companyMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap'
  },
  statusChip: {
    fontSize: '0.75rem'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    fontSize: '0.875rem'
  },
  metaIcon: {
    fontSize: '1rem'
  },
  companyActions: {
    display: 'flex',
    gap: 0.5
  },
  expandButton: {
    color: 'text.secondary'
  },
  moreButton: {
    color: 'text.secondary'
  },
  companyDetails: {
    mt: 2,
    mb: 3,
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 1
  },
  detailItem: {
    p: 1
  },
  usersPreview: {
    mt: 2
  },
  usersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2
  },
  usersTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  usersIcon: {
    color: 'primary.main'
  },
  viewAllButton: {
    fontSize: '0.875rem'
  },
  usersList: {
    mb: 2
  },
  userCard: {
    height: '100%',
    transition: 'all 0.2s',
    '&:hover': {
      bgcolor: 'action.hover'
    }
  },
  userCardContent: {
    p: 2
  },
  userCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 1
  },
  userAvatar: {
    width: 40,
    height: 40,
    bgcolor: 'primary.main'
  },
  userInfo: {
    minWidth: 0
  },
  userRoleChip: {
    height: 20,
    fontSize: '0.625rem'
  },
  userDetailIcon: {
    fontSize: '0.875rem',
    mr: 0.5,
    verticalAlign: 'middle'
  },
  moreUsers: {
    textAlign: 'center',
    py: 2
  },
  noUsers: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 3
  },
  addFirstUserButton: {
    fontSize: '0.75rem'
  },
  cardActions: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' }
  },
  viewDetailsButton: {
    borderRadius: 2
  },
  addUserButton: {
    borderRadius: 2
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 8,
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: 64,
    color: 'grey.400',
    mb: 2
  },
  emptyTitle: {
    mb: 1,
    color: 'text.secondary'
  },
  emptyText: {
    color: 'text.secondary',
    mb: 3
  },
  emptyButton: {
    borderRadius: 2
  },
  summaryCard: {
    borderRadius: 2,
    boxShadow: 2
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  summaryNumber: {
    fontWeight: 700,
    color: 'primary.main'
  },
  fab: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 1000
  },
  dialogPaper: {
    borderRadius: 2,
    maxHeight: '90vh'
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  dialogTitleContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  dialogTitleIcon: {
    fontSize: 32,
    color: 'primary.main'
  },
  dialogTitleText: {
    fontWeight: 600
  },
  dialogTitleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  companyDialogTitle: {
    bgcolor: 'primary.main',
    color: 'white'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 8
  },
  companyDetailsCard: {
    mb: 3
  },
  companyDetailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  companyDetailsLogo: {
    width: 80,
    height: 80,
    fontSize: 32,
    bgcolor: 'primary.main'
  },
  companyDetailsStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  formField: {
    mb: 2
  },
  noData: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 8,
    textAlign: 'center'
  },
  noDataIcon: {
    fontSize: 64,
    color: 'grey.400',
    mb: 2
  },
  tableContainer: {
    borderRadius: 1,
    maxHeight: 400
  },
  userTableCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  tableAvatar: {
    width: 32,
    height: 32,
    fontSize: 14
  },
  emailCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  tableIcon: {
    fontSize: 16,
    color: 'grey.500'
  },
  menuPaper: {
    minWidth: 180,
    borderRadius: 2,
    boxShadow: 4
  }
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .slide-in {
    animation: slideIn 0.4s ease-out;
  }
`;
document.head.appendChild(styleSheet);

export default AllCompany;