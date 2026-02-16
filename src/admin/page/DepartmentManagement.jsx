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
  LinearProgress, CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Edit, Delete, Add, Search, Business, 
  Description, Person, Code, Refresh,
  MoreVert, FilterList, Clear, CheckCircle,
  Cancel, CorporateFare, AdminPanelSettings,
  VerifiedUser, FolderSpecial, Today,
  Schedule, Apartment, ArrowForward
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DepartmentManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    company: '',  
    companyCode: '' 
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDeptMenu, setSelectedDeptMenu] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
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

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      setUserInfo(user);
      const isSuper = checkSuperAdminStatus(user);
      setIsSuperAdmin(isSuper);
      
      if (user.company && user.companyCode) {
        setFormData(prev => ({
          ...prev,
          company: user.company,
          companyCode: user.companyCode
        }));
      }
      
      fetchDepartments(user, isSuper);
    } else {
      toast.error('Please login to continue');
    }
  }, [refreshKey, showAllCompanies]);

  const fetchDepartments = async (user = null, isSuper = false) => {
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
      
      let url = '/departments';
      let params = {};
      
      if (!isSuper || !showAllCompanies) {
        if (user.company) {
          params.company = user.company;
        }
      }
      
      console.log('Fetching departments with params:', params);
      
      const response = await axios.get('/departments', { params });
      const depts = response.data.departments || [];
      setDepartments(depts);
      
      // Calculate stats
      setStats({
        total: depts.length,
        active: depts.filter(d => d.isActive !== false).length,
        inactive: depts.filter(d => d.isActive === false).length
      });
      
      console.log('Departments fetched:', depts.length);
    } catch (err) {
      console.error('Fetch departments error:', err);
      toast.error(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Department name is required');
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
        description: formData.description.trim()
      };
      
      if (!isSuper || formData.company) {
        submitData.company = formData.company || user.company;
        submitData.companyCode = formData.companyCode || user.companyCode;
      }
      
      console.log('Submitting department data:', submitData);
      
      if (editingDept) {
        await axios.put(`/departments/${editingDept._id}`, submitData);
        toast.success(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Department Updated!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.name} has been updated successfully
              </Typography>
            </Box>
          </Box>,
          { icon: false, autoClose: 3000 }
        );
      } else {
        await axios.post('/departments', submitData);
        toast.success(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Department Created!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.name} has been added to your organization
              </Typography>
            </Box>
          </Box>,
          { icon: false, autoClose: 3000 }
        );
      }
      
      setOpenDialog(false);
      setFormData({ 
        name: '', 
        description: '',
        company: user.company || '',
        companyCode: user.companyCode || ''
      });
      setEditingDept(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const dept = departments.find(d => d._id === id);
    if (!window.confirm(`Are you sure you want to delete "${dept?.name}"?`)) return;

    try {
      setLoading(true);
      await axios.delete(`/departments/${id}`);
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Delete sx={{ color: '#f44336', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Department Deleted!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dept?.name} has been removed
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

  const handleEdit = (dept) => {
    setEditingDept(dept);
    const user = getUserFromStorage();
    
    setFormData({ 
      name: dept.name, 
      description: dept.description || '',
      company: dept.company || user?.company || '',
      companyCode: dept.companyCode || user?.companyCode || ''
    });
    setOpenDialog(true);
    setAnchorEl(null);
  };

  // Handle menu open
  const handleMenuOpen = (event, dept) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeptMenu(dept);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeptMenu(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    toast.info('Refreshing departments...');
    setRefreshKey(prev => prev + 1);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filter departments
  const getFilteredDepartments = () => {
    let filtered = departments;
    const user = userInfo || getUserFromStorage();
    const isSuper = checkSuperAdminStatus(user);
    
    if (!isSuper || !showAllCompanies) {
      filtered = departments.filter(dept => 
        !dept.company || dept.company === user?.company
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dept.companyCode && dept.companyCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredDepartments = getFilteredDepartments();

  // Format date
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

  // Mobile card view
  const MobileDepartmentCard = ({ dept }) => (
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
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: dept.isActive !== false ? '#4caf50' : '#f44336',
        boxShadow: `0 0 0 2px ${dept.isActive !== false ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
        animation: dept.isActive !== false ? 'pulse 2s infinite' : 'none'
      }} />
      
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Header with Icon and Name */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.50',
                color: 'primary.main',
                width: 48,
                height: 48,
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(33, 150, 243, 0.2)'
              }}
            >
              <Business sx={{ fontSize: 26 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                {dept.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {dept.companyCode && (
                  <Chip 
                    label={dept.companyCode} 
                    size="small" 
                    sx={{ 
                      height: 22, 
                      fontSize: '0.65rem',
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
                <Chip
                  label={dept.isActive !== false ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    bgcolor: dept.isActive !== false ? 'success.50' : 'error.50',
                    color: dept.isActive !== false ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Description */}
          {dept.description && (
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 1.5, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Description sx={{ fontSize: 18, color: 'grey.500', mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {dept.description}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Footer with Meta Info and Actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Created">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Today sx={{ fontSize: 14, color: 'grey.500' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(dept.createdAt)}
                  </Typography>
                </Box>
              </Tooltip>
              {dept.createdBy?.name && (
                <Tooltip title="Created By">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Person sx={{ fontSize: 14, color: 'grey.500' }} />
                    <Typography variant="caption" color="text.secondary">
                      {dept.createdBy.name}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Stack>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  onClick={() => handleEdit(dept)}
                  sx={{ 
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    width: 32,
                    height: 32,
                    '&:hover': { 
                      bgcolor: 'primary.100',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Edit sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  size="small"
                  onClick={() => handleDelete(dept._id)}
                  sx={{ 
                    bgcolor: 'error.50',
                    color: 'error.main',
                    width: 32,
                    height: 32,
                    '&:hover': { 
                      bgcolor: 'error.100',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease',
                    opacity: dept.isActive === false ? 0.5 : 1
                  }}
                  disabled={dept.isActive === false}
                >
                  <Delete sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
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

      {/* Stats Cards - Always visible, in a single line with consistent blue theme */}
     {departments.length > 0 && (
  <Box sx={{ 
    display: 'grid', 
    gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
    gap: { xs: 1.5, sm: 2.5 },
    mb: 4,
    width: '100%'
  }}>
    {/* Total Departments Card */}
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
          boxShadow: '0 12px 24px rgba(33, 150, 243, 0.25)',
          borderColor: '#90caf9',
          '& .icon-box': {
            transform: 'scale(1.1) rotate(5deg)',
            bgcolor: '#e3f2fd'
          }
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box 
          className="icon-box"
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 44, sm: 52 },
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(33, 150, 243, 0.2)'
          }}
        >
          <CorporateFare sx={{ 
            fontSize: { xs: 24, sm: 28 }, 
            color: '#1976d2',
            filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3))'
          }} />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body2" 
            color="#546e7a"
            fontWeight={600}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.5
            }}
          >
            Total Departments
          </Typography>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography 
              variant="h4" 
              fontWeight={800}
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                lineHeight: 1,
                color: '#0d47a1',
                textShadow: '0 2px 4px rgba(33, 150, 243, 0.2)'
              }}
            >
              {stats.total}
            </Typography>
            <Chip 
              label="All departments"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                border: '1px solid #bbdefb'
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>

    {/* Active Departments Card */}
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
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #4caf50, #81c784)',
        },
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(76, 175, 80, 0.25)',
          borderColor: '#a5d6a7',
          '& .icon-box': {
            transform: 'scale(1.1) rotate(5deg)',
            bgcolor: '#c8e6c9'
          }
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box 
          className="icon-box"
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 44, sm: 52 },
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(76, 175, 80, 0.2)'
          }}
        >
          <CheckCircle sx={{ 
            fontSize: { xs: 24, sm: 28 }, 
            color: '#2e7d32',
            filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3))'
          }} />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body2" 
            color="#546e7a"
            fontWeight={600}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.5
            }}
          >
            Active Departments
          </Typography>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography 
              variant="h4" 
              fontWeight={800}
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                lineHeight: 1,
                color: '#1b5e20',
                textShadow: '0 2px 4px rgba(76, 175, 80, 0.2)'
              }}
            >
              {stats.active}
            </Typography>
            <Chip 
              label={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#c8e6c9',
                color: '#2e7d32',
                border: '1px solid #a5d6a7'
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>

    {/* Inactive Departments Card */}
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #ffebee 100%)',
        border: '1px solid',
        borderColor: '#ffcdd2',
        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.12)',
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
          background: 'linear-gradient(90deg, #f44336, #ef5350)',
        },
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(244, 67, 54, 0.25)',
          borderColor: '#ef9a9a',
          '& .icon-box': {
            transform: 'scale(1.1) rotate(5deg)',
            bgcolor: '#ffcdd2'
          }
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box 
          className="icon-box"
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 44, sm: 52 },
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(244, 67, 54, 0.2)'
          }}
        >
          <Cancel sx={{ 
            fontSize: { xs: 24, sm: 28 }, 
            color: '#c62828',
            filter: 'drop-shadow(0 2px 4px rgba(244, 67, 54, 0.3))'
          }} />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="body2" 
            color="#546e7a"
            fontWeight={600}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.5
            }}
          >
            Inactive Departments
          </Typography>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography 
              variant="h4" 
              fontWeight={800}
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                lineHeight: 1,
                color: '#b71c1c',
                textShadow: '0 2px 4px rgba(244, 67, 54, 0.2)'
              }}
            >
              {stats.inactive}
            </Typography>
            <Chip 
              label={`${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#ffcdd2',
                color: '#c62828',
                border: '1px solid #ef9a9a'
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  </Box>
)}

      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 3 }, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative'
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
                <CorporateFare sx={{ 
                  fontSize: { xs: 24, sm: 28 }, 
                  color: 'white' 
                }} />
              </Box>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  Department Management
                </Typography>
                {userInfo && (
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center"
                    sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}
                  >
                    <Chip 
                      avatar={<Person sx={{ fontSize: 14 }} />}
                      label={userInfo.name}
                      size="small"
                      sx={{ 
                        height: 24, 
                        fontSize: '0.7rem',
                        bgcolor: 'grey.100'
                      }}
                    />
                    <Chip 
                      label={userInfo.role}
                      size="small"
                      sx={{ 
                        height: 24, 
                        fontSize: '0.7rem',
                        bgcolor: isSuperAdmin ? 'secondary.50' : 'primary.50',
                        color: isSuperAdmin ? 'secondary.main' : 'primary.main',
                        fontWeight: 600
                      }}
                    />
                    {userInfo.companyCode && (
                      <Chip 
                        icon={<Code sx={{ fontSize: 12 }} />}
                        label={userInfo.companyCode}
                        size="small"
                        sx={{ 
                          height: 24, 
                          fontSize: '0.7rem',
                          bgcolor: 'info.50',
                          color: 'info.main'
                        }}
                      />
                    )}
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
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'white',
                  transition: 'all 0.2s ease',
                  '&:hover, &:focus-within': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: 'action.active' }} />
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
            
            {/* Add Department Button */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingDept(null);
                const user = getUserFromStorage();
                if (!user) {
                  toast.error('Please login first');
                  return;
                }
                setFormData({ 
                  name: '', 
                  description: '',
                  company: user.company || '',
                  companyCode: user.companyCode || ''
                });
                setOpenDialog(true);
              }}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                borderRadius: 3,
                py: 1,
                px: 3,
                background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isMobile ? 'Add Department' : 'Add Department'}
            </Button>
          </Stack>
        </Stack>

        {/* Super Admin Toggle (if applicable) */}
         {isSuperAdmin && (
                 <Fade in={isSuperAdmin}>
                   <Paper 
                     variant="outlined" 
                     sx={{ 
                       p: 2, 
                       mb: 3, 
                       borderRadius: 3,
                       bgcolor: 'primary.50',
                       borderColor: 'primary.200',
                       background: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)'
                     }}
                   >
                     <Stack 
                       direction={{ xs: 'column', sm: 'row' }} 
                       alignItems="center" 
                       justifyContent="space-between"
                       spacing={2}
                     >
                       <Stack direction="row" alignItems="center" spacing={1.5}>
                         <Avatar sx={{ 
                           bgcolor: 'primary.main',
                           width: 40,
                           height: 40
                         }}>
                           <AdminPanelSettings sx={{ fontSize: 24 }} />
                         </Avatar>
                         <Box>
                           <Typography variant="body1" fontWeight={600} color="primary.dark">
                             Super Admin Mode
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                             You have access to view all job roles
                           </Typography>
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
                         label={
                           <Typography variant="body2" fontWeight={500}>
                             {showAllCompanies ? 'Showing All Companies' : 'Showing My Company Only'}
                           </Typography>
                         }
                       />
                     </Stack>
                   </Paper>
                 </Fade>
               )}

        {!userInfo && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            User information not found. Please login again.
          </Alert>
        )}

        {/* Table/List View */}
        {isMobile ? (
          // Mobile Card View
          <Box sx={{ mt: 2 }}>
            {filteredDepartments.length === 0 ? (
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
                  <CorporateFare sx={{ fontSize: 50, color: 'grey.400' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  No Departments Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 300, mx: 'auto' }}>
                  {searchTerm 
                    ? 'No departments match your search criteria. Try different keywords.'
                    : 'Get started by creating your first department to organize your teams.'}
                </Typography>
                {searchTerm ? (
                  <Button 
                    variant="outlined" 
                    onClick={handleClearSearch}
                    startIcon={<Clear />}
                    sx={{ borderRadius: 3, px: 4 }}
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => {
                      setEditingDept(null);
                      setOpenDialog(true);
                    }}
                    sx={{ 
                      borderRadius: 3, 
                      px: 4,
                      py: 1.2,
                      background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)'
                    }}
                  >
                    Add Department
                  </Button>
                )}
              </Box>
            ) : (
              <>
                {filteredDepartments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(dept => (
                    <MobileDepartmentCard key={dept._id} dept={dept} />
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Department Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Description</TableCell>
                  {isSuperAdmin && showAllCompanies && (
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Company Code</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Created On</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={isSuperAdmin && showAllCompanies ? 7 : 6} 
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <CorporateFare sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          No Departments Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? 'No departments match your search' : 'Get started by adding a department'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dept, index) => (
                      <TableRow 
                        key={dept._id} 
                        hover
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            '& .action-buttons': {
                              opacity: 1
                            }
                          },
                          animation: `fadeIn 0.3s ease ${index * 0.05}s`
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: 'primary.50',
                              color: 'primary.main',
                              borderRadius: 2
                            }}>
                              <Business sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography fontWeight={600}>{dept.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250 }}>
                            {dept.description || '—'}
                          </Typography>
                        </TableCell>
                        {isSuperAdmin && showAllCompanies && (
                          <TableCell>
                            {dept.companyCode ? (
                              <Chip 
                                label={dept.companyCode} 
                                size="small" 
                                sx={{ 
                                  bgcolor: 'primary.50',
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                Global
                              </Typography>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Person sx={{ fontSize: 16, color: 'grey.500' }} />
                            <Typography variant="body2">
                              {dept.createdBy?.name || 'System'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Today sx={{ fontSize: 16, color: 'grey.500' }} />
                            <Typography variant="body2">
                              {formatDate(dept.createdAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={dept.isActive !== false ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: dept.isActive !== false ? 'success.50' : 'error.50',
                              color: dept.isActive !== false ? 'success.main' : 'error.main',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box 
                            className="action-buttons"
                            sx={{ 
                              display: 'flex', 
                              gap: 1,
                              opacity: { xs: 1, sm: 0.7 },
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            <Tooltip title="Edit Department" arrow>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(dept)}
                                sx={{ 
                                  color: 'primary.main',
                                  bgcolor: 'primary.50',
                                  width: 32,
                                  height: 32,
                                  '&:hover': { 
                                    bgcolor: 'primary.100',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Department" arrow>
                              <IconButton 
                                size="small"
                                onClick={() => handleDelete(dept._id)}
                                sx={{ 
                                  color: 'error.main',
                                  bgcolor: 'error.50',
                                  width: 32,
                                  height: 32,
                                  '&:hover': { 
                                    bgcolor: 'error.100',
                                    transform: 'scale(1.1)'
                                  },
                                  opacity: dept.isActive === false ? 0.5 : 1
                                }}
                                disabled={dept.isActive === false}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {filteredDepartments.length > 0 && (
          <TablePagination
            component="div"
            count={filteredDepartments.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={isMobile ? [5, 10, 25] : [5, 10, 25, 50]}
            sx={{
              mt: 2,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
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
                boxShadow: '0 8px 16px rgba(33, 150, 243, 0.4)',
                width: 56,
                height: 56,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 12px 24px rgba(33, 150, 243, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                const user = getUserFromStorage();
                setFormData({ 
                  name: '', 
                  description: '',
                  company: user?.company || '',
                  companyCode: user?.companyCode || ''
                });
                setOpenDialog(true);
              }}
            >
              <Add sx={{ fontSize: 28 }} />
            </Fab>
          </Zoom>
        )}

        {/* Options Menu for Mobile */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              minWidth: 200,
              overflow: 'hidden',
              '& .MuiMenuItem-root': {
                py: 1.5,
                px: 2
              }
            }
          }}
        >
          <MenuItem onClick={() => {
            handleEdit(selectedDeptMenu);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Edit fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Edit Department"
              secondary="Modify department details"
              secondaryTypographyProps={{ fontSize: '0.7rem' }}
            />
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              handleDelete(selectedDeptMenu?._id);
              handleMenuClose();
            }} 
            disabled={!selectedDeptMenu?.isActive}
            sx={{ 
              color: 'error.main',
              '&.Mui-disabled': { opacity: 0.5 }
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Delete Department"
              secondary={!selectedDeptMenu?.isActive ? 'Already inactive' : 'Remove permanently'}
              secondaryTypographyProps={{ fontSize: '0.7rem' }}
            />
          </MenuItem>
        </Menu>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse {
              0% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
              }
              70% {
                box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
              }
            }
          `}
        </style>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !loading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          py: 3,
          px: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 10s ease-in-out infinite reverse'
          }} />
          
          <Stack direction="row" alignItems="center" spacing={2} position="relative">
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}>
              {editingDept ? (
                <Edit sx={{ color: 'primary.main', fontSize: 26 }} />
              ) : (
                <Add sx={{ color: 'primary.main', fontSize: 26 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {editingDept 
                  ? 'Update department information' 
                  : 'Add a new department to organize your teams'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box pt={1}>
            {/* User Info Banner */}
            {userInfo?.companyCode && !isSuperAdmin && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1.5, 
                  mb: 3, 
                  borderRadius: 2,
                  bgcolor: 'primary.50',
                  borderColor: 'primary.200'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Apartment sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="primary.dark">
                      Creating department for {userInfo.companyCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This department will be associated with your company
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
            
            <TextField
              label="Department Name *"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ fontSize: 20, color: 'primary.main' }} />
                  </InputAdornment>
                )
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                },
                mb: 2
              }}
            />
            
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={isMobile ? 3 : 4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ fontSize: 20, color: 'grey.500' }} />
                  </InputAdornment>
                )
              }}
              placeholder="Describe the purpose of this department (optional)"
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  alignItems: 'flex-start'
                },
                mb: 1
              }}
            />

            {/* Removed Optional Company Assignment section */}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.50'
        }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
            <Button 
              onClick={() => setOpenDialog(false)} 
              variant="outlined"
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 600,
                borderColor: 'grey.400',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'grey.600',
                  bgcolor: 'grey.100'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={loading || !formData.name.trim()}
              sx={{ 
                borderRadius: 2,
                px: 5,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 700,
                background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover::after': {
                  left: '100%'
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} color="inherit" />
                  <span>Saving...</span>
                </Box>
              ) : (
                editingDept ? 'Update Department' : 'Create Department'
              )}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Refresh Indicator (hidden) */}
      <Snackbar
        open={false}
        autoHideDuration={3000}
      />
    </Box>
  );
};

export default DepartmentManagement;