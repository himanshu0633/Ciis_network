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
  Slide
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
  FiInfo
} from "react-icons/fi";
import axios from "../../../utils/axiosConfig";
import { styled } from "@mui/material/styles";

// Enhanced Styled Components
const EnhancedEmployeeCard = styled(Card)(({ theme, status = 'active' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'visible',
  '&::before': status === 'new' ? {
    content: '""',
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: theme.palette.success.main,
    zIndex: 1,
  } : {},
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-8px)',
    borderColor: theme.palette.primary.main,
  },
}));

const GradientStatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette[color].main}15, ${theme.palette[color].light}08)`,
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: `0 4px 20px ${alpha(theme.palette[color].main, 0.1)}`,
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.2)}`,
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  },
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.default,
  transition: theme.transitions.create(['background'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  }
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 700,
  borderRadius: 20,
  fontSize: '0.7rem',
  ...(type === 'technical' && {
    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    color: theme.palette.success.contrastText,
    boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(type === 'non-technical' && {
    background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
    color: theme.palette.warning.contrastText,
    boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(type === 'sales' && {
    background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
    color: theme.palette.info.contrastText,
    boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.3)}`,
  }),
  ...(type === 'intern' && {
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
    color: theme.palette.secondary.contrastText,
    boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`,
  }),
}));

const RoleChip = styled(Chip)(({ theme, role }) => ({
  fontWeight: 700,
  fontSize: '0.65rem',
  borderRadius: 16,
  ...(role === 'admin' && {
    background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    color: theme.palette.error.contrastText,
  }),
  ...(role === 'manager' && {
    background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
    color: theme.palette.warning.contrastText,
  }),
  ...(role === 'hr' && {
    background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
    color: theme.palette.info.contrastText,
  }),
  ...(role === 'user' && {
    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    color: theme.palette.success.contrastText,
  }),
  ...(role === 'SuperAdmin' && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    color: theme.palette.primary.contrastText,
  }),
}));

const EnhancedHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
  },
}));

const RoleFilter = ({ selected, onChange, stats }) => {
  const theme = useTheme();
  
  const roleOptions = [
    { value: 'all', label: 'All Roles', count: 'all', color: 'primary' },
    { value: 'SuperAdmin', label: 'Super Admin', count: stats.superAdmin, color: 'primary' },
    { value: 'admin', label: 'Admin', count: stats.admin, color: 'error' },
    { value: 'manager', label: 'Manager', count: stats.manager, color: 'warning' },
    { value: 'hr', label: 'HR', count: stats.hr, color: 'info' },
    { value: 'user', label: 'User', count: stats.user, color: 'success' }
  ];

  return (
    <FormControl 
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.shape.borderRadius * 2,
          background: theme.palette.background.paper,
        }
      }} 
      size="small"
    >
      <InputLabel>Filter by Role</InputLabel>
      <Select
        value={selected}
        label="Filter by Role"
        onChange={(e) => onChange(e.target.value)}
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading employee directory...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={600}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Enhanced Header Section */}
        <EnhancedHeader>
          <Stack spacing={3}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight={800}
                gutterBottom
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Employee Directory
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                Find and connect with your colleagues across the organization
              </Typography>
            </Box>

            {/* Action Bar */}
            <Stack direction="row" spacing={2} alignItems="center">

         
              
              <Box sx={{ flex: 1 }} />
              
              <Chip
                icon={<FiUsers />}
                label={`${stats.total} Employees`}
                variant="outlined"
                sx={{ 
                  fontWeight: 600,
                  background: alpha(theme.palette.primary.main, 0.1),
                }}
              />
            </Stack>

            {/* Search and Filter Section */}
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
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: theme.shape.borderRadius * 2,
                      }
                    }}
                  />
                  
                  <RoleFilter
                    selected={selectedRole}
                    onChange={setSelectedRole}
                    stats={stats}
                  />
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </EnhancedHeader>

        {/* Enhanced Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Employees', count: stats.total, color: 'primary', icon: <FiUsers />, trend: '+5%' },
            { label: 'Technical Team', count: stats.technical, color: 'success', icon: <FiBriefcase />, trend: '+12%' },
            { label: 'Non-Technical', count: stats.nonTechnical, color: 'warning', icon: <FiClock />, trend: '+3%' },
            { label: 'Sales Team', count: stats.sales, color: 'info', icon: <FiTrendingUp />, trend: '+8%' },
            { label: 'Interns', count: stats.intern, color: 'secondary', icon: <FiAward />, trend: '+15%' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
              <GradientStatCard color={stat.color}>
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
                        sx={{
                          background: alpha(theme.palette[stat.color].main, 0.1),
                          color: theme.palette[stat.color].main,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
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
              </GradientStatCard>
            </Grid>
          ))}
        </Grid>

        {/* Results Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Team Members
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
              {selectedRole !== 'all' && ` • Filtered by ${getRoleLabel(selectedRole)}`}
              {searchTerm && ` • Matching "${searchTerm}"`}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  borderRadius: theme.shape.borderRadius * 2,
                  minHeight: 32,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }
              }}
            >
              <Tab label="All" />
              <Tab label="Active" />
              <Tab label="New" />
            </Tabs>
          </Stack>
        </Stack>

        {/* Enhanced Employees Grid - FIXED VERSION */}
        {filteredEmployees.length === 0 ? (
          <Paper sx={{ 
            textAlign: 'center', 
            py: 10,
            borderRadius: theme.shape.borderRadius * 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          }}>
            <Box sx={{ mb: 3 }}>
              <FiUsers size={64} color={alpha(theme.palette.text.secondary, 0.5)} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.secondary" gutterBottom>
              No Employees Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              {searchTerm || selectedRole !== 'all' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
                : 'The employee directory is currently empty. Add your first team member to get started.'
              }
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEmployees.map((emp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
                <Slide direction="up" in timeout={500}>
                  <EnhancedEmployeeCard 
                    status={isNewEmployee(emp) ? 'new' : 'active'}
                    onClick={() => handleOpenUser(emp)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <CardContent sx={{ p: 3, position: 'relative' }}>
                      {/* Menu Button - Positioned absolutely outside the clickable area */}
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, emp);
                        }}
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <FiMoreVertical size={16} />
                      </IconButton>

                      <Stack spacing={2.5}>
                        {/* Header with Avatar and Basic Info */}
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              isNewEmployee(emp) ? (
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.success.main,
                                    border: `2px solid ${theme.palette.background.paper}`,
                                  }}
                                />
                              ) : null
                            }
                          >
                            <Avatar 
                              src={emp.image} 
                              sx={{ 
                                width: 60, 
                                height: 60,
                                border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                fontSize: '1.2rem',
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(emp.name)}
                            </Avatar>
                          </Badge>
                          <Box sx={{ flex: 1, minWidth: 0, pr: 4 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                fontWeight={700} 
                                noWrap
                                sx={{ 
                                  background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.8)})`,
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }}
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
                            
                            {/* Chips */}
                            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap" gap={0.5}>
                              <EmployeeTypeChip
                                label={emp.employeeType?.toUpperCase() || 'N/A'}
                                type={emp.employeeType?.toLowerCase()}
                                size="small"
                              />
                              <RoleChip
                                label={getRoleLabel(emp.role)}
                                role={emp.role}
                                size="small"
                              />
                            </Stack>
                          </Box>
                        </Stack>

                        <Divider sx={{ my: 1 }} />

                        {/* Contact Information */}
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                flexShrink: 0,
                              }}
                            >
                              <FiMail size={14} />
                            </Box>
                            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                              {emp.email || 'No email'}
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                flexShrink: 0,
                              }}
                            >
                              <FiPhone size={14} />
                            </Box>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {formatPhoneNumber(emp.phone)}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: alpha(theme.palette.warning.main, 0.1),
                                color: theme.palette.warning.main,
                                flexShrink: 0,
                              }}
                            >
                              <FiShield size={14} />
                            </Box>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {getRoleLabel(emp.role)}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Action Button */}
                        <Button 
                          variant="outlined" 
                          fullWidth
                          size="small"
                          startIcon={<FiEye size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUser(emp);
                          }}
                          sx={{ 
                            borderRadius: theme.shape.borderRadius * 2,
                            mt: 1,
                            fontWeight: 600,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          View Profile
                        </Button>
                      </Stack>
                    </CardContent>
                  </EnhancedEmployeeCard>
                </Slide>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Rest of the dialogs and components */}
        {/* User Detail Dialog */}
        <Dialog 
          open={Boolean(selectedUser)} 
          onClose={handleCloseUser} 
          maxWidth="md" 
          fullWidth
          scroll="paper"
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius * 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
            }
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
                  <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                      {selectedUser.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                      <Chip 
                        label={selectedUser.jobRole || 'No role specified'} 
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <EmployeeTypeChip
                        label={selectedUser.employeeType?.toUpperCase() || 'N/A'}
                        type={selectedUser.employeeType?.toLowerCase()}
                        size="small"
                      />
                      <RoleChip
                        label={getRoleLabel(selectedUser.role)}
                        role={selectedUser.role}
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
                        <DetailItem>
                          <FiUser color={theme.palette.primary.main} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Full Name
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.name || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiShield color={theme.palette.primary.main} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              System Role
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {getRoleLabel(selectedUser.role)}
                            </Typography>
                          </Box>
                        </DetailItem>

                        <DetailItem>
                          <FiCalendar color={theme.palette.primary.main} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Date of Birth
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiMail color={theme.palette.primary.main} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email Address
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.email || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiPhone color={theme.palette.primary.main} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone Number
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatPhoneNumber(selectedUser.phone)}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiMapPin color={theme.palette.primary.main} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedUser.address || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button 
                  onClick={handleCloseUser}
                  sx={{ 
                    borderRadius: theme.shape.borderRadius * 2,
                    fontWeight: 600,
                  }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<FiEdit />}
                  onClick={() => handleEdit(selectedUser)}
                  sx={{ 
                    borderRadius: theme.shape.borderRadius * 2,
                    fontWeight: 600,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
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
          scroll="paper"
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius * 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
            }
          }}
        >
          {editingUser && (
            <>
              <DialogTitle sx={{ pb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: 'white',
                    }}
                  >
                    <FiEdit size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>
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
                  {/* Personal Information */}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: theme.palette.primary.main }}>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Full Name"
                          value={editFormData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          fullWidth
                          margin="normal"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: theme.shape.borderRadius * 2,
                            }
                          }}
                        />
                        <TextField
                          label="System Role"
                          value={editFormData.role || 'user'}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          fullWidth
                          margin="normal"
                          select
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
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email Address"
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          fullWidth
                          margin="normal"
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
                          <MenuItem value="technical">Technical</MenuItem>
                          <MenuItem value="non-technical">Non-technical</MenuItem>
                          <MenuItem value="sales">Sales</MenuItem>
                          <MenuItem value="intern">Intern</MenuItem>
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
                  sx={{ 
                    borderRadius: theme.shape.borderRadius * 2,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <FiSave />}
                  onClick={handleSaveEdit}
                  disabled={saving}
                  sx={{ 
                    borderRadius: theme.shape.borderRadius * 2,
                    fontWeight: 600,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
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
          PaperProps={{
            sx: {
              borderRadius: theme.shape.borderRadius * 3,
            }
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} color="error.main">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: alpha(theme.palette.error.main, 0.1),
                }}
              >
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
              sx={{ 
                borderRadius: theme.shape.borderRadius * 2,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              startIcon={deleting ? <CircularProgress size={16} /> : <FiTrash2 />}
              onClick={handleDeleteConfirm}
              disabled={deleting}
              sx={{ 
                borderRadius: theme.shape.borderRadius * 2,
                fontWeight: 600,
                boxShadow: `0 4px 16px ${alpha(theme.palette.error.main, 0.3)}`,
              }}
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ 
              borderRadius: theme.shape.borderRadius * 2,
              fontWeight: 600,
              boxShadow: theme.shadows[8],
            }}
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
    </Fade>
  );
};

export default EmployeeDirectory;