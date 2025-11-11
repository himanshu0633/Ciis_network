import { useState, useEffect, useMemo } from "react";
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
  Select
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
  FiShield
} from "react-icons/fi";
import axios from "../../../utils/axiosConfig";
import { styled } from "@mui/material/styles";

// Enhanced Styled Components
const EmployeeCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
  },
}));

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
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

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  ...(type === 'technical' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(type === 'non-technical' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(type === 'sales' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(type === 'intern' && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}40`,
  }),
}));

// New Role Chip Component
const RoleChip = styled(Chip)(({ theme, role }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  ...(role === 'admin' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
  ...(role === 'manager' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(role === 'hr' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(role === 'user' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(role === 'SuperAdmin' && {
    background: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.dark,
    border: `1px solid ${theme.palette.primary.main}40`,
  }),
}));

// Role Filter Component - Employee Type Filter की जगह यही use होगा
const RoleFilter = ({ selected, onChange, stats }) => {
  const theme = useTheme();
  
  const roleOptions = [
    { value: 'all', label: 'All Roles', count: 'all' },
    { value: 'SuperAdmin', label: 'Super Admin', count: stats.superAdmin },
    { value: 'admin', label: 'Admin', count: stats.admin },
    { value: 'manager', label: 'Manager', count: stats.manager },
    { value: 'hr', label: 'HR', count: stats.hr },
    { value: 'user', label: 'User', count: stats.user }
  ];

  return (
    <FormControl 
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.shape.borderRadius * 2,
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{option.label}</span>
              {option.count !== 'all' && (
                <Chip 
                  label={option.count} 
                  size="small" 
                  sx={{ 
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    minWidth: 30
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
  const [selectedRole, setSelectedRole] = useState("all"); // Employee Type की जगह Role
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

  // Role options for dropdown
  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'hr', label: 'HR' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'SuperAdmin', label: 'Super Admin' }
  ];

  // Corrected stats calculation with role stats
  const stats = useMemo(() => ({
    total: employees.length,
    technical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'technical').length,
    nonTechnical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'non-technical').length,
    sales: employees.filter(emp => emp.employeeType?.toLowerCase() === 'sales').length,
    intern: employees.filter(emp => emp.employeeType?.toLowerCase() === 'intern').length,
    // Role-based stats
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
      role: user.role || 'user' // Default to 'user' if role is not set
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

  // Filter logic with search - Employee Type की जगह Role based filtering
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    // Role-based filtering (Employee Type की जगह)
    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.role?.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by role
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

  // Function to get role display label
  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(opt => opt.value === role);
    return roleOption ? roleOption.label : role || 'User';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[4]
        }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Employee Directory
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find and connect with your colleagues
              </Typography>
            </Box>

            {/* Search and Filter Section - Employee Type Filter की जगह Role Filter */}
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
                    <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />
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
              
              {/* Employee Type Filter की जगह Role Filter */}
              <RoleFilter
                selected={selectedRole}
                onChange={setSelectedRole}
                stats={stats}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Statistics Cards - पहले जैसे ही रहेंगे */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={2.4}>
            <StatCard color="primary">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.primary.main}20`, 
                    color: theme.palette.primary.main 
                  }}>
                    <FiUsers />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={2.4}>
            <StatCard color="success">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.success.main}20`, 
                    color: theme.palette.success.main 
                  }}>
                    <FiBriefcase />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Technical
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.technical}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={2.4}>
            <StatCard color="warning">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.warning.main}20`, 
                    color: theme.palette.warning.main 
                  }}>
                    <FiClock />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Non-Tech
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.nonTechnical}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={2.4}>
            <StatCard color="info">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.info.main}20`, 
                    color: theme.palette.info.main 
                  }}>
                    <FiUser />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Sales
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.sales}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>
           <Grid item xs={6} md={2.4}>
            <StatCard color="success">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.success.main}20`, 
                    color: theme.palette.success.main,
                    width: 40,
                    height: 40
                  }}>
                    <FiUsers />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Interns
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {stats.intern}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Results Header */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedRole !== 'all' && `Filtered by: ${getRoleLabel(selectedRole)}`}
          </Typography>
        </Stack>

        {/* Employees Grid - यह पहले जैसा ही रहेगा */}
        {filteredEmployees.length === 0 ? (
          <Paper sx={{ 
            textAlign: 'center', 
            py: 8,
            borderRadius: theme.shape.borderRadius * 2
          }}>
            <FiUsers size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Employees Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedRole !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No employees in the directory'
              }
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEmployees.map((emp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
                <EmployeeCard>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Header with Avatar and Basic Info */}
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar 
                          src={emp.image} 
                          sx={{ 
                            width: 56, 
                            height: 56,
                            border: `2px solid ${theme.palette.primary.main}20`
                          }}
                        >
                          {getInitials(emp.name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="h6" fontWeight={600} noWrap>
                                {emp.name}
                              </Typography>
                              <Typography variant="body2" color="primary.main" fontWeight={500}>
                                {emp.jobRole || 'No role specified'}
                              </Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" gap={0.5}>
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
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMenuOpen(e, emp)}
                              sx={{ mt: -0.5, mr: -0.5 }}
                            >
                              <FiMoreVertical size={16} />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Stack>

                      <Divider />

                      {/* Contact Information */}
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiMail size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2" noWrap title={emp.email}>
                            {emp.email || 'No email'}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiPhone size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2">
                            {formatPhoneNumber(emp.phone)}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiShield size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2">
                            Role: {getRoleLabel(emp.role)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Action Button */}
                      <Button 
                        variant="outlined" 
                        fullWidth
                        size="small"
                        startIcon={<FiEye size={14} />}
                        onClick={() => handleOpenUser(emp)}
                        sx={{ 
                          borderRadius: theme.shape.borderRadius * 2,
                          mt: 1
                        }}
                      >
                        View Profile
                      </Button>
                    </Stack>
                  </CardContent>
                </EmployeeCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* बाकी सभी Dialog और Components पहले जैसे ही रहेंगे */}
        {/* User Detail Dialog */}
        <Dialog 
          open={Boolean(selectedUser)} 
          onClose={handleCloseUser} 
          maxWidth="md" 
          fullWidth
          scroll="paper"
        >
          {selectedUser && (
            <>
              <DialogTitle>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {selectedUser.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                      <Chip 
                        label={selectedUser.jobRole || 'No role specified'} 
                        color="primary"
                        size="small"
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
                      <IconButton onClick={() => handleEdit(selectedUser)}>
                        <FiEdit />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={handleCloseUser}>
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
                          <FiUser color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Full Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.name || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiShield color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              System Role
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {getRoleLabel(selectedUser.role)}
                            </Typography>
                          </Box>
                        </DetailItem>

                        <DetailItem>
                          <FiCalendar color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Date of Birth
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiUser color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Gender
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.gender || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiHeart color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Marital Status
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.maritalStatus || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiMail color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email Address
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.email || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiPhone color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone Number
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {formatPhoneNumber(selectedUser.phone)}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiMapPin color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
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
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<FiEdit />}
                  onClick={() => handleEdit(selectedUser)}
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
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
        >
          {editingUser && (
            <>
              <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiEdit />
                  <Typography variant="h5" fontWeight={600}>
                    Edit Employee - {editingUser.name}
                  </Typography>
                </Stack>
              </DialogTitle>
              
              <DialogContent dividers>
                <Stack spacing={3}>
                  {/* Personal Information */}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
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
                        />
                        <TextField
                          label="System Role"
                          value={editFormData.role || 'user'}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          fullWidth
                          margin="normal"
                          select
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
                        />
                        <TextField
                          label="Gender"
                          value={editFormData.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          fullWidth
                          margin="normal"
                          select
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
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
                        />
                        <TextField
                          label="Phone Number"
                          value={editFormData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Address"
                          multiline
                          rows={2}
                          value={editFormData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Job Information */}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
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
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <FiSave />}
                  onClick={handleSaveEdit}
                  disabled={saving}
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
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
        >
          <MenuItem onClick={() => handleEdit(selectedMenuUser)}>
            <ListItemIcon>
              <FiEdit size={18} />
            </ListItemIcon>
            <ListItemText>Edit Employee</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleOpenUser(selectedMenuUser)}>
            <ListItemIcon>
              <FiEye size={18} />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDeleteClick(selectedMenuUser)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <FiTrash2 size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText>Delete Employee</ListItemText>
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => !deleting && setDeleteConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1} color="error.main">
              <FiAlertTriangle />
              <Typography variant="h6" fontWeight={600}>
                Confirm Delete
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              startIcon={deleting ? <CircularProgress size={16} /> : <FiTrash2 />}
              onClick={handleDeleteConfirm}
              disabled={deleting}
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              {deleting ? 'Deleting...' : 'Delete Employee'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ borderRadius: theme.shape.borderRadius * 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default EmployeeDirectory;