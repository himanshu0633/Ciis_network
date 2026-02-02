import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, Alert, Snackbar, FormControlLabel,
  Switch, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

const JobRoleManagement = () => {
  const [jobRoles, setJobRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingJobRole, setEditingJobRole] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    department: '',
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
      
      // Set company info in form data for new job roles
      if (user.company && user.companyCode) {
        setFormData(prev => ({
          ...prev,
          company: user.company,
          companyCode: user.companyCode
        }));
      }
      
      // Fetch job roles and departments
      fetchJobRoles(user, isSuper);
      fetchDepartments(user, isSuper);
    } else {
      toast.error('Please login to continue');
    }
  }, []);

  const fetchJobRoles = async (user = null, isSuper = false) => {
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
      // Otherwise, fetch only job roles for user's company
      let url = '/job-roles';
      let params = {};
      
      if (!isSuper || !showAllCompanies) {
        if (user.company) {
          params.company = user.company;
        }
      }
      
      console.log('Fetching job roles with params:', params);
      
      const response = await axios.get('/job-roles', { params });
      setJobRoles(response.data.jobRoles || []);
      
      console.log('Job roles fetched:', response.data.jobRoles?.length);
    } catch (err) {
      console.error('Fetch job roles error:', err);
      toast.error(err.response?.data?.message || 'Failed to load job roles');
    }
  };

  const fetchDepartments = async (user = null, isSuper = false) => {
    try {
      if (!user) {
        user = getUserFromStorage();
        if (!user) return;
        isSuper = checkSuperAdminStatus(user);
      }
      
      let url = '/departments';
      let params = {};
      
      if (!isSuper) {
        if (user.company) {
          params.company = user.company;
        }
      }
      
      const response = await axios.get('/departments', { params });
      setDepartments(response.data.departments || []);
      
      console.log('Departments fetched for dropdown:', response.data.departments?.length);
    } catch (err) {
      console.error('Fetch departments error:', err);
      toast.error(err.response?.data?.message || 'Failed to load departments');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Job role name is required');
      return;
    }

    if (!formData.department) {
      toast.error('Please select a department');
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
        description: formData.description.trim(),
        department: formData.department
      };
      
      // Add company info if not super-admin or if explicitly setting company
      if (!isSuper || formData.company) {
        submitData.company = formData.company || user.company;
        submitData.companyCode = formData.companyCode || user.companyCode;
      }
      
      console.log('Submitting job role data:', submitData);
      
      if (editingJobRole) {
        await axios.put(`/job-roles/${editingJobRole._id}`, submitData);
        toast.success('Job role updated successfully');
      } else {
        await axios.post('/job-roles', submitData);
        toast.success('Job role created successfully');
      }
      
      setOpenDialog(false);
      setFormData({ 
        name: '', 
        description: '',
        department: '',
        company: user.company || '',
        companyCode: user.companyCode || ''
      });
      setEditingJobRole(null);
      
      // Refresh job roles
      fetchJobRoles(user, isSuper);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job role?')) return;

    try {
      await axios.delete(`/job-roles/${id}`);
      toast.success('Job role deleted successfully');
      
      // Refresh job roles
      const user = getUserFromStorage();
      const isSuper = checkSuperAdminStatus(user);
      fetchJobRoles(user, isSuper);
    } catch (err) {
      const msg = err.response?.data?.message || 'Deletion failed';
      toast.error(msg);
    }
  };

  const handleEdit = (jobRole) => {
    setEditingJobRole(jobRole);
    const user = getUserFromStorage();
    
    setFormData({ 
      name: jobRole.name, 
      description: jobRole.description || '',
      department: jobRole.department?._id || jobRole.department || '',
      company: jobRole.company?._id || jobRole.company || user?.company || '',
      companyCode: jobRole.companyCode || user?.companyCode || ''
    });
    setOpenDialog(true);
  };

  // Filter job roles based on user role and search
  const getFilteredJobRoles = () => {
    let filtered = jobRoles;
    const user = userInfo || getUserFromStorage();
    const isSuper = checkSuperAdminStatus(user);
    
    // Apply company filter if not showing all companies
    if (!isSuper || !showAllCompanies) {
      filtered = jobRoles.filter(jobRole => 
        !jobRole.company || 
        (typeof jobRole.company === 'object' ? jobRole.company._id : jobRole.company) === user?.company
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(jobRole =>
        jobRole.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (jobRole.description && jobRole.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (jobRole.companyCode && jobRole.companyCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (jobRole.department?.name && jobRole.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredJobRoles = getFilteredJobRoles();

  // Handle show all companies toggle
  const handleShowAllToggle = (event) => {
    setShowAllCompanies(event.target.checked);
    // We'll refetch when the toggle changes
    const user = userInfo || getUserFromStorage();
    const isSuper = checkSuperAdminStatus(user);
    
    if (event.target.checked && isSuper) {
      // Fetch all job roles for super admin
      axios.get('/job-roles')
        .then(response => {
          setJobRoles(response.data.jobRoles || []);
        })
        .catch(err => {
          toast.error('Failed to load all job roles');
        });
    } else {
      // Fetch only company-specific job roles
      fetchJobRoles(user, isSuper);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Job Role Management
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
            {isSuperAdmin && (
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
            )}
            
            <TextField
              size="small"
              placeholder="Search job roles..."
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
                setEditingJobRole(null);
                const user = getUserFromStorage();
                
                if (!user) {
                  toast.error('Please login first');
                  return;
                }
                
                setFormData({ 
                  name: '', 
                  description: '',
                  department: '',
                  company: user.company || '',
                  companyCode: user.companyCode || ''
                });
                setOpenDialog(true);
              }}
            >
              Add Job Role
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
                <TableCell>Job Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Department</TableCell>
                {isSuperAdmin && showAllCompanies && <TableCell>Company Code</TableCell>}
                <TableCell>Created By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobRoles.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={isSuperAdmin && showAllCompanies ? 6 : 5} 
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary">
                      {searchTerm ? 'No job roles match your search' : 'No job roles found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobRoles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(jobRole => (
                    <TableRow key={jobRole._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{jobRole.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {jobRole.description || 'No description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {jobRole.department?.name ? (
                          <Chip 
                            label={jobRole.department.name} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      {isSuperAdmin && showAllCompanies && (
                        <TableCell>
                          {jobRole.companyCode ? (
                            <Chip 
                              label={jobRole.companyCode} 
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
                        {jobRole.createdBy?.name || 'System'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(jobRole)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(jobRole._id)}
                              disabled={!jobRole.isActive}
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
          count={filteredJobRoles.length}
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
          {editingJobRole ? 'Edit Job Role' : 'Add New Job Role'}
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
                As Super Admin, you can create job roles for any company and department.
              </Alert>
            )}
            
            <TextField
              label="Job Role Name *"
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
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Department *</InputLabel>
              <Select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                label="Department *"
              >
                <MenuItem value="">
                  <em>Select Department</em>
                </MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name} {dept.companyCode && `(${dept.companyCode})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {isSuperAdmin && !editingJobRole && (
              <Box mt={2}>
                <TextField
                  label="Company ID (Optional)"
                  fullWidth
                  margin="normal"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Leave empty for current company"
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
            disabled={loading || !formData.name.trim() || !formData.department}
          >
            {loading ? 'Saving...' : editingJobRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobRoleManagement;