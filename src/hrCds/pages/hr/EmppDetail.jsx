import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  alpha,
  Container,
  InputAdornment,
  Badge,
  Tabs,
  Tab,
  Slide,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  useScrollTrigger
} from "@mui/material";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiSearch,
  FiX,
  FiClock,
  FiEdit,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiSave,
  FiEye,
  FiShield,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiCheckCircle,
  FiInfo,
  FiMenu,
  FiGrid,
  FiList
} from "react-icons/fi";
import axios from "../../../utils/axiosConfig";


// Custom hook for scroll detection
const useScrollDetection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
};

// Enhanced Role Filter Component
const RoleFilter = ({ selected, onChange, stats, variant = "desktop" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const roleOptions = [
    
    { value: 'admin', label: 'Admin', count: stats.admin, color: 'error' },
    { value: 'manager', label: 'Manager', count: stats.manager, color: 'warning' },
    { value: 'hr', label: 'HR', count: stats.hr, color: 'info' },
    { value: 'user', label: 'User', count: stats.user, color: 'success' }
  ];

  if (variant === "mobile") {
    return (
      <List sx={{ py: 0 }}>
        {roleOptions.map((option) => (
          <ListItem key={option.value} disablePadding>
            <ListItemButton
              selected={selected === option.value}
              onClick={() => onChange(option.value)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette[option.color].main, 0.1),
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette[option.color].main,
                  }}
                />
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {option.label}
                </Typography>
                {option.count !== 'all' && (
                  <Chip 
                    label={option.count} 
                    size="small" 
                    sx={{ 
                      height: 20,
                      fontSize: '0.7rem',
                      minWidth: 30,
                      background: alpha(theme.palette[option.color].main, 0.1),
                      color: theme.palette[option.color].main,
                    }} 
                  />
                )}
              </Stack>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <FormControl 
      className="role-filter-control"
      size="small"
      sx={{ minWidth: isMobile ? '100%' : 200 }}
    >
      <InputLabel>Filter by Role</InputLabel>
      <Select
        value={selected}
        label="Filter by Role"
        onChange={(e) => onChange(e.target.value)}
        className="role-filter-select"
      >
        {roleOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette[option.color].main,
                  }}
                />
                <span>{option.label}</span>
              </Stack>
              {option.count !== 'all' && (
                <Chip 
                  label={option.count} 
                  size="small" 
                  sx={{ 
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    minWidth: 30,
                    background: alpha(theme.palette[option.color].main, 0.1),
                    color: theme.palette[option.color].main,
                  }} 
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Quick Stats Component for Mobile
const MobileStats = ({ stats }) => {
  const theme = useTheme();
  
  const statItems = [
    { label: 'Total', count: stats.total, color: 'primary' },
    { label: 'Technical', count: stats.technical, color: 'success' },
    { label: 'Sales', count: stats.sales, color: 'info' },
    { label: 'Interns', count: stats.intern, color: 'secondary' },
  ];

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
      <Grid container spacing={1}>
        {statItems.map((stat) => (
          <Grid item xs={3} key={stat.label}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                fontWeight={800}
                color={`${stat.color}.main`}
              >
                {stat.count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isScrolled = useScrollDetection();

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'hr', label: 'HR' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'SuperAdmin', label: 'Super Admin' }
  ];

  const stats = useMemo(() => ({
    total: employees.length,
    technical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'technical').length,
    nonTechnical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'non-technical').length,
    sales: employees.filter(emp => emp.employeeType?.toLowerCase() === 'sales').length,
    intern: employees.filter(emp => emp.employeeType?.toLowerCase() === 'intern').length,
    admin: employees.filter(emp => emp.role === 'admin').length,
    manager: employees.filter(emp => emp.role === 'manager').length,
    hr: employees.filter(emp => emp.role === 'hr').length,
    user: employees.filter(emp => emp.role === 'user').length,
    superAdmin: employees.filter(emp => emp.role === 'SuperAdmin').length,
  }), [employees]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users/all-users");
      setEmployees(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      showSnackbar('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenUser = (user) => setSelectedUser(user);
  const handleCloseUser = () => setSelectedUser(null);

  const handleMenuOpen = (event, user) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuUser(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditFormData({ 
      ...user,
      role: user.role || 'user'
    });
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`/users/update-user/${editingUser._id}`, editFormData);
      setEmployees(prev => prev.map(emp => 
        emp._id === editingUser._id ? res.data : emp
      ));
      setEditingUser(null);
      setEditFormData({});
      showSnackbar('Employee updated successfully');
    } catch (err) {
      console.error("❌ Failed to update user:", err);
      showSnackbar('Failed to update employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/users/delete-user/${userToDelete._id}`);
      setEmployees(prev => prev.filter(emp => emp._id !== userToDelete._id));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      showSnackbar('Employee deleted successfully');
    } catch (err) {
      console.error("❌ Failed to delete user:", err);
      const errorMessage = err.response?.data?.error || 'Failed to delete employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.phone?.includes(searchTerm)
      );
    }
    
    return filtered;
  }, [employees, selectedRole, searchTerm]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    const phoneStr = phone.toString();
    return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    return roleOption ? roleOption.label : role || 'User';
  };

  const isNewEmployee = (employee) => {
    if (!employee.createdAt) return false;
    const created = new Date(employee.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getEmployeeTypeClass = (type) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === 'technical') return 'employee-type-chip employee-type-chip-technical';
    if (typeLower === 'non-technical') return 'employee-type-chip employee-type-chip-non-technical';
    if (typeLower === 'sales') return 'employee-type-chip employee-type-chip-sales';
    if (typeLower === 'intern') return 'employee-type-chip employee-type-chip-intern';
    return 'employee-type-chip';
  };

  const getRoleClass = (role) => {
    if (role === 'admin') return 'role-chip role-chip-admin';
    if (role === 'manager') return 'role-chip role-chip-manager';
    if (role === 'hr') return 'role-chip role-chip-hr';
    if (role === 'user') return 'role-chip role-chip-user';
    if (role === 'SuperAdmin') return 'role-chip role-chip-superadmin';
    return 'role-chip';
  };

  const getStatCardClass = (color) => {
    if (color === 'success') return 'gradient-stat-card gradient-stat-card-success';
    if (color === 'warning') return 'gradient-stat-card gradient-stat-card-warning';
    if (color === 'info') return 'gradient-stat-card gradient-stat-card-info';
    if (color === 'secondary') return 'gradient-stat-card gradient-stat-card-secondary';
    return 'gradient-stat-card';
  };

  // Enhanced Employee Card Component
 // Fixed EmployeeCard with forwardRef
const EmployeeCard = React.forwardRef(({ emp }, ref) => (
  <Card 
    ref={ref}
    className={`enhanced-employee-card ${isNewEmployee(emp) ? 'enhanced-employee-card-new' : ''} fade-in`}
    onClick={() => handleOpenUser(emp)}
  >
    <CardContent sx={{ p: isMobile ? 2 : 3, position: 'relative' }}>
      <IconButton 
        size="small" 
        onClick={(e) => {
          e.stopPropagation();
          handleMenuOpen(e, emp);
        }}
        className="menu-button-card"
      >
        <FiMoreVertical size={16} />
      </IconButton>

      <Stack spacing={isMobile ? 2 : 2.5}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isNewEmployee(emp) ? (
                <Box className="status-badge" />
              ) : null
            }
          >
            <Avatar 
              src={emp.image} 
              className="enhanced-avatar"
              sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
            >
              {getInitials(emp.name)}
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0, pr: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                fontWeight={700} 
                noWrap
                className="gradient-text-dark"
              >
                {emp.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="primary.main" 
                fontWeight={600}
                noWrap
                sx={{ mt: 0.5 }}
              >
                {emp.jobRole || 'No role specified'}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap" gap={0.5}>
              <Chip
                label={emp.employeeType?.toUpperCase() || 'N/A'}
                className={getEmployeeTypeClass(emp.employeeType)}
                size="small"
              />
              <Chip
                label={getRoleLabel(emp.role)}
                className={getRoleClass(emp.role)}
                size="small"
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={isMobile ? 1 : 1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box className="icon-container-primary">
              <FiMail size={14} />
            </Box>
            <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {emp.email || 'No email'}
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box className="icon-container-success">
              <FiPhone size={14} />
            </Box>
            <Typography variant="body2" sx={{ flex: 1, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {formatPhoneNumber(emp.phone)}
            </Typography>
          </Stack>
        </Stack>

        <Button 
          variant="outlined" 
          fullWidth
          size="small"
          startIcon={<FiEye size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenUser(emp);
          }}
          className="action-button-outlined"
          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
        >
          View Profile
        </Button>
      </Stack>
    </CardContent>
  </Card>
));

// Fixed EmployeeListItem with forwardRef
const EmployeeListItem = React.forwardRef(({ emp }, ref) => (
  <Card 
    ref={ref}
    className={`employee-list-item ${isNewEmployee(emp) ? 'employee-list-item-new' : ''} fade-in`}
    onClick={() => handleOpenUser(emp)}
    sx={{ mb: 1 }}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            isNewEmployee(emp) ? (
              <Box className="status-badge" />
            ) : null
          }
        >
          <Avatar 
            src={emp.image} 
            sx={{ width: 48, height: 48 }}
          >
            {getInitials(emp.name)}
          </Avatar>
        </Badge>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {emp.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {emp.jobRole || 'No role specified'}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={emp.employeeType?.toUpperCase() || 'N/A'}
            className={getEmployeeTypeClass(emp.employeeType)}
            size="small"
          />
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, emp);
            }}
          >
            <FiMoreVertical size={16} />
          </IconButton>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
));

  // List View Component
 

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading employee directory...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={600}>
      <Box className="employee-directory-wrapper">
        <Container 
          maxWidth="xl" 
          className={`employee-directory-container responsive-grid-container ${isScrolled ? 'scrolled' : ''}`}
        >
          {/* Enhanced Header Section */}
          <Box className="enhanced-header">
            <Stack spacing={3}>
              <Box>
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  fontWeight={800}
                  gutterBottom
                  className="gradient-text-primary"
                >
                  Employee Directory
                </Typography>
                <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ mt: 1 }}>
                  Find and connect with your colleagues across the organization
                </Typography>
              </Box>

              {/* Mobile Stats */}
              {isMobile && <MobileStats stats={stats} />}

              {/* Action Bar */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Chip
                    icon={<FiUsers />}
                    label={`${stats.total} Employees`}
                    variant="outlined"
                    sx={{ 
                      fontWeight: 600,
                      background: alpha(theme.palette.primary.main, 0.1),
                    }}
                  />
                  
                  {!isMobile && (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => setViewMode('grid')}
                        color={viewMode === 'grid' ? 'primary' : 'default'}
                      >
                        <FiGrid />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setViewMode('list')}
                        color={viewMode === 'list' ? 'primary' : 'default'}
                      >
                        <FiList />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
                
                {isMobile && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<FiFilter />}
                      onClick={() => setMobileFilterOpen(true)}
                      fullWidth
                    >
                      Filters
                    </Button>
                    <IconButton
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      color="primary"
                    >
                      {viewMode === 'grid' ? <FiList /> : <FiGrid />}
                    </IconButton>
                  </Stack>
                )}
              </Stack>

              {/* Search and Filter Section */}
              {!isMobile && (
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: theme.shape.borderRadius * 2,
                  background: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                }}>
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FiFilter size={20} color={theme.palette.primary.main} />
                      <Typography variant="h6" fontWeight={600}>
                        Search & Filter
                      </Typography>
                    </Stack>
                    
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2} 
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                      <TextField
                        placeholder="Search employees by name, email, role, or job role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-field"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiSearch color={theme.palette.text.secondary} />
                            </InputAdornment>
                          ),
                          endAdornment: searchTerm && (
                            <IconButton 
                              size="small" 
                              onClick={() => setSearchTerm('')}
                              sx={{ mr: -0.5 }}
                            >
                              <FiX size={16} />
                            </IconButton>
                          ),
                        }}
                        sx={{ flex: 1 }}
                      />
                      
                      <RoleFilter
                        selected={selectedRole}
                        onChange={setSelectedRole}
                        stats={stats}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>

          {/* Enhanced Statistics Cards - Hidden on mobile */}
          {!isMobile && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'Total Employees', count: stats.total, color: 'primary', icon: <FiUsers />, trend: '+5%' },
                { label: 'Technical Team', count: stats.technical, color: 'success', icon: <FiBriefcase />, trend: '+12%' },
                { label: 'Non-Technical', count: stats.nonTechnical, color: 'warning', icon: <FiClock />, trend: '+3%' },
                { label: 'Sales Team', count: stats.sales, color: 'info', icon: <FiTrendingUp />, trend: '+8%' },
                { label: 'Interns', count: stats.intern, color: 'secondary', icon: <FiAward />, trend: '+15%' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
                  <Card className={getStatCardClass(stat.color)}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                              color: theme.palette[stat.color].main,
                              width: 48,
                              height: 48,
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                          <Chip 
                            label={stat.trend} 
                            size="small"
                            className={`trend-chip trend-chip-${stat.color}`}
                          />
                        </Stack>
                        <Box>
                          <Typography variant="body2" color="text.secondary" fontSize="0.8rem" fontWeight={600}>
                            {stat.label}
                          </Typography>
                          <Typography variant="h3" fontWeight={800} lineHeight={1} sx={{ mt: 0.5 }}>
                            {stat.count}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Results Header */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} gutterBottom className="gradient-text-dark">
                Team Members
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
                {selectedRole !== 'all' && ` • Filtered by ${getRoleLabel(selectedRole)}`}
                {searchTerm && ` • Matching "${searchTerm}"`}
              </Typography>
            </Box>
            
            {!isMobile && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  className="enhanced-tabs"
                >
                  <Tab label="All" />
                  <Tab label="Active" />
                  <Tab label="New" />
                </Tabs>
              </Stack>
            )}
          </Stack>

          {/* Mobile Search Bar */}
          {isMobile && (
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
              <TextField
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiSearch color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                    >
                      <FiX size={16} />
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Paper>
          )}

          {/* Enhanced Employees Grid/List */}
          {filteredEmployees.length === 0 ? (
            <Paper className="empty-state-paper">
              <Box sx={{ mb: 3 }}>
                <FiUsers size={isMobile ? 48 : 64} color={alpha(theme.palette.text.secondary, 0.5)} />
              </Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color="text.secondary" gutterBottom>
                No Employees Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                {searchTerm || selectedRole !== 'all' 
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
                  : 'The employee directory is currently empty. Add your first team member to get started.'
                }
              </Typography>
            </Paper>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={isMobile ? 2 : 3}>
              {filteredEmployees.map((emp) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
                  <Slide direction="up" in timeout={500}>
                    <EmployeeCard emp={emp} />
                  </Slide>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>
              {filteredEmployees.map((emp) => (
                <Slide direction="up" in timeout={500} key={emp._id}>
                  <EmployeeListItem emp={emp} />
                </Slide>
              ))}
            </Box>
          )}

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="right"
            open={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            PaperProps={{
              sx: {
                width: 280,
                borderRadius: '20px 0 0 20px',
              }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Filters
                </Typography>
                <IconButton onClick={() => setMobileFilterOpen(false)}>
                  <FiX />
                </IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, px: 1 }}>
                Filter by Role
              </Typography>
              <RoleFilter
                selected={selectedRole}
                onChange={setSelectedRole}
                stats={stats}
                variant="mobile"
              />
            </Box>
          </Drawer>

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <Fab
              color="primary"
              className="mobile-fab"
              onClick={() => setMobileFilterOpen(true)}
            >
              <FiFilter />
            </Fab>
          )}

          {/* Rest of the dialogs and menus remain the same */}
          {/* User Detail Dialog */}
          <Dialog 
            open={Boolean(selectedUser)} 
            onClose={handleCloseUser} 
            maxWidth="md" 
            fullWidth
            fullScreen={isMobile}
            scroll="paper"
            PaperProps={{
              className: "dialog-paper-enhanced"
            }}
          >
            {selectedUser && (
              <>
                <DialogTitle sx={{ pb: 2 }}>
                  <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="flex-start"
                  >
                  <Box sx={{ pr: 2 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} gutterBottom>
                      {selectedUser.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                      <Chip 
                        label={selectedUser.jobRole || 'No role specified'} 
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={selectedUser.employeeType?.toUpperCase() || 'N/A'}
                        className={getEmployeeTypeClass(selectedUser.employeeType)}
                        size="small"
                      />
                      <Chip
                        label={getRoleLabel(selectedUser.role)}
                        className={getRoleClass(selectedUser.role)}
                        size="small"
                      />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Employee">
                      <IconButton 
                        onClick={() => handleEdit(selectedUser)}
                        sx={{
                          background: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <FiEdit />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      onClick={handleCloseUser}
                      sx={{
                        background: alpha(theme.palette.error.main, 0.1),
                        '&:hover': {
                          background: alpha(theme.palette.error.main, 0.2),
                        }
                      }}
                    >
                      <FiX />
                    </IconButton>
                  </Stack>
                  </Stack>
                </DialogTitle>
                
                <DialogContent dividers>
                  <Stack spacing={3}>
                    {/* Personal Information */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <FiUser />
                        Personal Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box className="detail-item">
                            <FiUser color={theme.palette.primary.main} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Full Name
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {selectedUser.name || 'Not provided'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box className="detail-item">
                            <FiShield color={theme.palette.primary.main} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                System Role
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {getRoleLabel(selectedUser.role)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box className="detail-item">
                            <FiCalendar color={theme.palette.primary.main} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Date of Birth
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not provided'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box className="detail-item">
                            <FiMail color={theme.palette.primary.main} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Email Address
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {selectedUser.email || 'Not provided'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box className="detail-item">
                            <FiPhone color={theme.palette.primary.main} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Phone Number
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {formatPhoneNumber(selectedUser.phone)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box className="detail-item">
                            <FiMapPin color={theme.palette.primary.main} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Address
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {selectedUser.address || 'Not provided'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, gap: 1 }}>
                  <Button 
                    onClick={handleCloseUser}
                    className="action-button-outlined"
                  >
                    Close
                  </Button>
                  <Button 
                    variant="contained"
                    startIcon={<FiEdit />}
                    onClick={() => handleEdit(selectedUser)}
                    className="action-button-contained"
                  >
                    Edit Profile
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Edit Employee Dialog */}

<Dialog 
  open={Boolean(editingUser)} 
  onClose={handleCancelEdit} 
  maxWidth="md" 
  fullWidth
  fullScreen={isMobile}
  scroll="paper"
  PaperProps={{
    className: "dialog-paper-enhanced"
  }}
>
  {editingUser && (
    <>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box className="edit-icon-container">
            <FiEdit size={20} />
          </Box>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
              Edit Employee
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingUser.name}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Core Information */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Core Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name *"
                  value={editFormData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Email Address *"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Phone Number"
                  value={editFormData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="System Role *"
                  value={editFormData.role || 'user'}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  fullWidth
                  margin="normal"
                  select
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={editFormData.dob ? new Date(editFormData.dob).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Gender"
                  value={editFormData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  fullWidth
                  margin="normal"
                  select
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Address & Personal Details */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Address & Personal Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  multiline
                  rows={3}
                  value={editFormData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Marital Status"
                  value={editFormData.maritalStatus || ''}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  fullWidth
                  margin="normal"
                  select
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem>
                  <MenuItem value="widowed">Widowed</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Salary"
                  value={editFormData.salary || ''}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Job Information */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Job Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Employee Type"
                  value={editFormData.employeeType || ''}
                  onChange={(e) => handleInputChange('employeeType', e.target.value)}
                  fullWidth
                  margin="normal"
                  select
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                >
                  <MenuItem value="intern">Intern</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="non-technical">Non-technical</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                </TextField>
                
                <TextField
                  label="Job Role"
                  value={editFormData.jobRole || ''}
                  onChange={(e) => handleInputChange('jobRole', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Properties"
                  value={editFormData.properties ? editFormData.properties.join(', ') : ''}
                  onChange={(e) => handleInputChange('properties', e.target.value.split(',').map(item => item.trim()))}
                  fullWidth
                  margin="normal"
                  helperText="Enter comma separated values: sim, phone, laptop, desktop, headphones"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Property Owned"
                  value={editFormData.propertyOwned || ''}
                  onChange={(e) => handleInputChange('propertyOwned', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Bank Details */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Bank Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Account Number"
                  value={editFormData.accountNumber || ''}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Bank Name"
                  value={editFormData.bankName || ''}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="IFSC Code"
                  value={editFormData.ifsc || ''}
                  onChange={(e) => handleInputChange('ifsc', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Account Holder Name"
                  value={editFormData.bankHolderName || ''}
                  onChange={(e) => handleInputChange('bankHolderName', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Family Details */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Family Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Father's Name"
                  value={editFormData.fatherName || ''}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mother's Name"
                  value={editFormData.motherName || ''}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Emergency Contact */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Emergency Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emergency Contact Name"
                  value={editFormData.emergencyName || ''}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Emergency Phone"
                  value={editFormData.emergencyPhone || ''}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emergency Relation"
                  value={editFormData.emergencyRelation || ''}
                  onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
                
                <TextField
                  label="Emergency Address"
                  multiline
                  rows={2}
                  value={editFormData.emergencyAddress || ''}
                  onChange={(e) => handleInputChange('emergencyAddress', e.target.value)}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Additional Information */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Additional Information
            </Typography>
            <TextField
              label="Additional Details"
              multiline
              rows={3}
              value={editFormData.additionalDetails || ''}
              onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
              fullWidth
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.shape.borderRadius * 2,
                }
              }}
            />
          </Box>

          <Divider />

          {/* Status */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
              Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Account Status"
                  value={editFormData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                  fullWidth
                  margin="normal"
                  select
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 2,
                    }
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleCancelEdit}
          disabled={saving}
          className="action-button-outlined"
          startIcon={<FiX />}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <FiSave />}
          onClick={handleSaveEdit}
          disabled={saving}
          className="action-button-contained"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </>
  )}
</Dialog>

          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            elevation={3}
            PaperProps={{
              sx: {
                borderRadius: theme.shape.borderRadius * 2,
                minWidth: 180,
              }
            }}
          >
            <MenuItem onClick={() => handleEdit(selectedMenuUser)}>
              <ListItemIcon>
                <FiEdit size={18} color={theme.palette.primary.main} />
              </ListItemIcon>
              <ListItemText>
                <Typography fontWeight={600}>Edit Employee</Typography>
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOpenUser(selectedMenuUser)}>
              <ListItemIcon>
                <FiEye size={18} color={theme.palette.info.main} />
              </ListItemIcon>
              <ListItemText>
                <Typography fontWeight={600}>View Details</Typography>
              </ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => handleDeleteClick(selectedMenuUser)} 
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <FiTrash2 size={18} color={theme.palette.error.main} />
              </ListItemIcon>
              <ListItemText>
                <Typography fontWeight={600}>Delete Employee</Typography>
              </ListItemText>
            </MenuItem>
          </Menu>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteConfirmOpen}
            onClose={() => !deleting && setDeleteConfirmOpen(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
              sx: {
                borderRadius: isMobile ? 0 : theme.shape.borderRadius * 3,
              }
            }}
          >
            <DialogTitle sx={{ pb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} color="error.main">
                <Box className="warning-icon-container">
                  <FiAlertTriangle size={20} />
                </Box>
                <Typography variant="h6" fontWeight={800}>
                  Confirm Delete
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone and all associated data will be permanently removed.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="action-button-outlined"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error"
                startIcon={deleting ? <CircularProgress size={16} /> : <FiTrash2 />}
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="action-button-error"
              >
                {deleting ? 'Deleting...' : 'Delete Employee'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: isMobile ? 'top' : 'bottom', horizontal: 'right' }}
          >
            <Alert 
              severity={snackbar.severity}
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              className="snackbar-alert"
              iconMapping={{
                success: <FiCheckCircle />,
                error: <FiAlertTriangle />,
                warning: <FiAlertTriangle />,
                info: <FiInfo />,
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Fade>
  );
};

export default EmployeeDirectory;