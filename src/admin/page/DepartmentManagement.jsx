import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, Alert, Snackbar, FormControlLabel,
  Switch
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

const DepartmentManagement = () => {
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // Function to get user from localStorage
  const getUserFromStorage = () => {
    // Try 'superAdmin' key first
    let userStr = localStorage.getItem('superAdmin');
    
    // If not found, try 'user' key
    if (!userStr) {
      userStr = localStorage.getItem('user');
    }
    
    // If still not found, try sessionStorage
    if (!userStr) {
      userStr = sessionStorage.getItem('superAdmin') || sessionStorage.getItem('user');
    }
    
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
    
    // Multiple ways to check for super-admin
    const isSuper = 
      (user.role === 'super-admin' && 
       user.department === 'Management' && 
       user.jobRole === 'super_admin') ||
      user.role === 'super-admin' ||
      user.jobRole === 'super_admin';
    
    console.log('Super admin check:', {
      user,
      isSuper,
      role: user.role,
      department: user.department,
      jobRole: user.jobRole
    });
    
    return isSuper;
  };

  useEffect(() => {
    // Get user info from storage
    const user = getUserFromStorage();
    
    if (user) {
      setUserInfo(user);
      const isSuper = checkSuperAdminStatus(user);
      setIsSuperAdmin(isSuper);
      
      // Set company info in form data for new departments
      if (user.company && user.companyCode) {
        setFormData(prev => ({
          ...prev,
          company: user.company,
          companyCode: user.companyCode
        }));
      }
      
      // Fetch departments
      fetchDepartments(user, isSuper);
    } else {
      toast.error('Please login to continue');
    }
  }, []);

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
      
      // If super-admin and showing all companies, fetch all
      // Otherwise, fetch only departments for user's company
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
      
      // Prepare data
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };
      
      // Add company info if not super-admin or if explicitly setting company
      if (!isSuper || formData.company) {
        submitData.company = formData.company || user.company;
        submitData.companyCode = formData.companyCode || user.companyCode;
      }
      
      console.log('Submitting department data:', submitData);
      
      if (editingDept) {
        await axios.put(`/departments/${editingDept._id}`, submitData);
        toast.success('Department updated successfully');
      } else {
        await axios.post('/departments', submitData);
        toast.success('Department created successfully');
      }
      
      setOpenDialog(false);
      setFormData({ 
        name: '', 
        description: '',
        company: user.company || '',
        companyCode: user.companyCode || ''
      });
      setEditingDept(null);
      
      // Refresh departments
      fetchDepartments(user, isSuper);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      await axios.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      
      // Refresh departments
      const user = getUserFromStorage();
      const isSuper = checkSuperAdminStatus(user);
      fetchDepartments(user, isSuper);
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
  };

  // Filter departments based on user role and search
  const getFilteredDepartments = () => {
    let filtered = departments;
    const user = userInfo || getUserFromStorage();
    const isSuper = checkSuperAdminStatus(user);
    
    // Apply company filter if not showing all companies
    if (!isSuper || !showAllCompanies) {
      filtered = departments.filter(dept => 
        !dept.company || dept.company === user?.company
      );
    }
    
    // Apply search filter
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

  // Handle show all companies toggle
  const handleShowAllToggle = (event) => {
    setShowAllCompanies(event.target.checked);
    // We'll refetch when the toggle changes
    const user = userInfo || getUserFromStorage();
    const isSuper = checkSuperAdminStatus(user);
    
    if (event.target.checked && isSuper) {
      // Fetch all departments for super admin
      axios.get('/departments')
        .then(response => {
          setDepartments(response.data.departments || []);
        })
        .catch(err => {
          toast.error('Failed to load all departments');
        });
    } else {
      // Fetch only company-specific departments
      fetchDepartments(user, isSuper);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Department Management
            </Typography>
            {userInfo && (
              <Typography variant="body2" color="text.secondary">
                Logged in as: {userInfo.name} ({userInfo.role})
                {userInfo.companyCode && ` • Company: ${userInfo.companyCode}`}
                {isSuperAdmin && " • Super Admin"}
              </Typography>
            )}
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            {/* {isSuperAdmin && (
              <FormControlLabel
                control={
                  <Switch
                    checked={showAllCompanies}
                    onChange={handleShowAllToggle}
                    color="primary"
                  />
                }
                label="Show All Companies"
              />
            )} */}
            
            <TextField
              size="small"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
            
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
            >
              Add Department
            </Button>
          </Box>
        </Box>

        {!userInfo && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            User information not found. Please login again.
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department Name</TableCell>
                <TableCell>Description</TableCell>
                {isSuperAdmin && showAllCompanies && <TableCell>Company Code</TableCell>}
                <TableCell>Created By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={isSuperAdmin && showAllCompanies ? 5 : 4} 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary">
                      {searchTerm ? 'No departments match your search' : 'No departments found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(dept => (
                    <TableRow key={dept._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{dept.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {dept.description || 'No description'}
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
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {dept.createdBy?.name || 'System'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(dept)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(dept._id)}
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
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDept ? 'Edit Department' : 'Add New Department'}
          {userInfo?.companyCode && !isSuperAdmin && (
            <Typography variant="caption" display="block" color="primary">
              Company: {userInfo.companyCode}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box pt={2}>
            {isSuperAdmin && (
              <Alert severity="info" sx={{ mb: 2 }}>
                As Super Admin, you can create departments for any company.
                {editingDept?.companyCode && ` Currently editing department from ${editingDept.companyCode}`}
              </Alert>
            )}
            
            <TextField
              label="Department Name *"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            
            {isSuperAdmin && !editingDept && (
              <Box mt={2}>
                <TextField
                  label="Company ID (Optional)"
                  fullWidth
                  margin="normal"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Leave empty for global department"
                />
                <TextField
                  label="Company Code (Optional)"
                  fullWidth
                  margin="normal"
                  value={formData.companyCode}
                  onChange={(e) => setFormData({...formData, companyCode: e.target.value})}
                  placeholder="e.g., CIIS"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Saving...' : editingDept ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;