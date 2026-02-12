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
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Edit, Delete, Add, Search, Business, 
  Description, Person, Code, Refresh,
  MoreVert, FilterList, Clear, CheckCircle,
  Cancel, CorporateFare, AdminPanelSettings,
  VerifiedUser, FolderSpecial
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
      setDepartments(response.data.departments || []);
      
      console.log('Departments fetched:', response.data.departments?.length);
    } catch (err) {
      console.error('Fetch departments error:', err);
      toast.error(err.response?.data?.message || 'Failed to load departments');
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
                {formData.name} has been updated
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
                {formData.name} has been added
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

  // Mobile card view
  const MobileDepartmentCard = ({ dept }) => (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.100',
                  color: 'primary.main',
                  width: 40,
                  height: 40
                }}
              >
                <Business sx={{ fontSize: 22 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
                  {dept.name}
                </Typography>
                {dept.companyCode && (
                  <Chip 
                    label={dept.companyCode} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.6rem',
                      bgcolor: 'primary.50',
                      color: 'primary.main'
                    }}
                  />
                )}
              </Box>
            </Box>
            <IconButton onClick={(e) => handleMenuOpen(e, dept)} size="small">
              <MoreVert fontSize="small" />
            </IconButton>
          </Stack>

          {dept.description && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Description sx={{ fontSize: 18, color: 'grey.500', mt: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                {dept.description}
              </Typography>
            </Box>
          )}

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 16, color: 'grey.500' }} />
              <Typography variant="caption" color="text.secondary">
                {dept.createdBy?.name || 'System'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit">
                <IconButton 
                  size="small" 
                  onClick={() => handleEdit(dept)}
                  sx={{ 
                    bgcolor: 'primary.50',
                    '&:hover': { bgcolor: 'primary.100' }
                  }}
                >
                  <Edit sx={{ fontSize: 18, color: 'primary.main' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  size="small"
                  onClick={() => handleDelete(dept._id)}
                  sx={{ 
                    bgcolor: 'error.50',
                    '&:hover': { bgcolor: 'error.100' }
                  }}
                  disabled={!dept.isActive}
                >
                  <Delete sx={{ fontSize: 18, color: 'error.main' }} />
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
                bgcolor: 'primary.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CorporateFare sx={{ 
                  fontSize: { xs: 24, sm: 28 }, 
                  color: 'primary.main' 
                }} />
              </Box>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  Department Management
                </Typography>
                {userInfo && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}
                  >
                    <Person sx={{ fontSize: 14 }} />
                    {userInfo.name} • 
                    <Chip 
                      label={userInfo.role} 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        fontSize: '0.6rem',
                        bgcolor: isSuperAdmin ? 'secondary.50' : 'primary.50',
                        color: isSuperAdmin ? 'secondary.main' : 'primary.main'
                      }}
                    />
                    {userInfo.companyCode && (
                      <Chip 
                        icon={<Code sx={{ fontSize: 12 }} />}
                        label={userInfo.companyCode} 
                        size="small" 
                        sx={{ height: 18, fontSize: '0.6rem' }}
                      />
                    )}
                  </Typography>
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
                width: { xs: '100%', sm: 250 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'grey.50'
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
                bgcolor: 'primary.main',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isMobile ? 'Add' : 'Add Department'}
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
                bgcolor: 'secondary.50',
                borderColor: 'secondary.200'
              }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems="center" 
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AdminPanelSettings sx={{ color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Super Admin Mode
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You have access to all departments
                    </Typography>
                  </Box>
                </Stack>
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
                bgcolor: 'grey.50',
                borderRadius: 3
              }}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <CorporateFare sx={{ fontSize: 40, color: 'grey.400' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  No Departments Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm 
                    ? 'No departments match your search criteria'
                    : 'Get started by creating your first department'}
                </Typography>
                {searchTerm ? (
                  <Button 
                    variant="outlined" 
                    onClick={handleClearSearch}
                    startIcon={<Clear />}
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
          <TableContainer sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  {isSuperAdmin && showAllCompanies && (
                    <TableCell sx={{ fontWeight: 700 }}>Company Code</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={isSuperAdmin && showAllCompanies ? 5 : 4} 
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <CorporateFare sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
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
                    .map(dept => (
                      <TableRow 
                        key={dept._id} 
                        hover
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'primary.50',
                              color: 'primary.main'
                            }}>
                              <Business sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Typography fontWeight={600}>{dept.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {dept.description || '—'}
                          </Typography>
                        </TableCell>
                        {isSuperAdmin && showAllCompanies && (
                          <TableCell>
                            {dept.companyCode ? (
                              <Chip 
                                label={dept.companyCode} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
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
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(dept)}
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'primary.50' }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small"
                                onClick={() => handleDelete(dept._id)}
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': { bgcolor: 'error.50' }
                                }}
                                disabled={!dept.isActive}
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
                boxShadow: '0 8px 16px rgba(33, 150, 243, 0.4)'
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
              <Add />
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              minWidth: 180
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
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem onClick={() => {
            handleDelete(selectedDeptMenu?._id);
            handleMenuClose();
          }} disabled={!selectedDeptMenu?.isActive}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
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
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: 2.5,
          px: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {editingDept ? (
                <Edit sx={{ color: 'primary.main' }} />
              ) : (
                <Add sx={{ color: 'primary.main' }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </Typography>
              {userInfo?.companyCode && !isSuperAdmin && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Company: {userInfo.companyCode}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box pt={1}>
            {isSuperAdmin && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-message': { fontSize: '0.875rem' }
                }}
              >
                {editingDept?.companyCode 
                  ? `Editing department from ${editingDept.companyCode}`
                  : 'Create departments for any company or leave company fields empty for global departments'}
              </Alert>
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
                    <Business sx={{ fontSize: 20, color: 'action.active' }} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={isMobile ? 2 : 3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ fontSize: 20, color: 'action.active' }} />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            
            {isSuperAdmin && !editingDept && (
              <Box mt={2}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Optional Company Assignment" size="small" />
                </Divider>
                
                <TextField
                  label="Company ID"
                  fullWidth
                  margin="normal"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Leave empty for global"
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CorporateFare sx={{ fontSize: 20, color: 'action.active' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Company Code"
                  fullWidth
                  margin="normal"
                  value={formData.companyCode}
                  onChange={(e) => setFormData({...formData, companyCode: e.target.value})}
                  placeholder="e.g., CIIS"
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Code sx={{ fontSize: 20, color: 'action.active' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 0,
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
                px: 3,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 600
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
                px: 4,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 700,
                background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                '&:hover': {
                  background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Saving...' : editingDept ? 'Update' : 'Create'}
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