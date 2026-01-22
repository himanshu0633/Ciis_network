import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, 
  CircularProgress, IconButton, InputAdornment, Grid, Checkbox,
  FormControlLabel, FormGroup, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  Chip, Tooltip, Icon, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Edit, Delete, Add,
  Lock, LockOpen, Search, FilterList
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

// Constants
const genderOptions = ['male', 'female', 'other'];
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];
const emergencyRelationOptions = ['father', 'mother', 'spouse', 'sibling', 'friend', 'other'];
const jobRoleOptions = ['admin', 'user', 'hr', 'manager', 'SuperAdmin', 'intern'];
const propertyOptions = ['phone', 'sim', 'laptop', 'desktop', 'headphone'];

// Initial form state
const initialFormState = {
  name: '', email: '', password: '', confirmPassword: '', 
  department: '', jobRole: 'user',
  // Optional fields
  phone: '', address: '', gender: '', maritalStatus: '', dob: '', salary: '',
  accountNumber: '', ifsc: '', bankName: '', bankHolderName: '',
  employeeType: '', properties: [], propertyOwned: '', additionalDetails: '',
  fatherName: '', motherName: '', emergencyName: '', emergencyPhone: '', 
  emergencyRelation: '', emergencyAddress: ''
};

const CreateUser = () => {
  const [form, setForm] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');

  // Fetch departments and current user on mount
  useEffect(() => {
    fetchDepartments();
  
    // Get current user role from localStorage/token
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserRole(userData.jobRole || '');
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(response.data.departments || []);
    } catch (err) {
      toast.error('Failed to load departments');
    }
  };



  // Handle input changes with validation
  const handleTextChange = (e) => {
    const { name, value } = e.target;

    // Name validation (letters and spaces only)
    if (['name', 'fatherName', 'motherName', 'emergencyName', 'bankHolderName'].includes(name)) {
      if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
    // Number validation
    else if (['phone', 'salary', 'accountNumber', 'emergencyPhone'].includes(name)) {
      if (/^\d*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
    // IFSC validation (alphanumeric)
    else if (name === 'ifsc') {
      if (/^[a-zA-Z0-9]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle select dropdowns
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox selection for properties
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      properties: checked
        ? [...prev.properties, value]
        : prev.properties.filter(p => p !== value)
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!form.name || form.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }
    if (!form.email.includes('@')) {
      toast.error('Enter a valid email');
      return false;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!form.department) {
      toast.error('Please select a department');
      return false;
    }
    if (!form.jobRole) {
      toast.error('Please select a job role');
      return false;
    }
    if (form.phone && form.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return false;
    }
    if (form.emergencyPhone && form.emergencyPhone.length !== 10) {
      toast.error('Emergency phone must be 10 digits');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;

      await axios.post('/auth/register', submitData);
      toast.success('✅ User created successfully');
      
      setForm(initialFormState);
      
    } catch (err) {
      const msg = err?.response?.data?.message || '❌ User creation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle user edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setOpenEditDialog(true);
  };


  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (

     
       
          <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }} elevation={6}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Create New User
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              All fields marked with * are required
            </Typography>

            <form onSubmit={handleSubmit}>
              {/* Required Fields */}
              <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                Required Information
              </Typography>

              <TextField
                label="Full Name *"
                name="name"
                fullWidth
                required
                margin="normal"
                value={form.name}
                onChange={handleTextChange}
                helperText="Only letters and spaces"
              />

              <TextField
                label="Email Address *"
                name="email"
                type="email"
                fullWidth
                required
                margin="normal"
                value={form.email}
                onChange={handleTextChange}
              />

              <TextField
                label="Password *"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                margin="normal"
                value={form.password}
                onChange={handleTextChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(prev => !prev)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="Minimum 8 characters"
              />

              <TextField
                label="Confirm Password *"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                margin="normal"
                value={form.confirmPassword}
                onChange={handleTextChange}
              />

              <TextField
                label="Department *"
                name="department"
                fullWidth
                select
                required
                margin="normal"
                value={form.department}
                onChange={handleSelectChange}
              >
                {departments.map(dept => (
                  <MenuItem key={dept._id} value={dept._id }>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Job Role *"
                name="jobRole"
                fullWidth
                select
                required
                margin="normal"
                value={form.jobRole}
                onChange={handleSelectChange}
              >
                {jobRoleOptions.map(role => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </TextField>

              {/* Optional Fields Section */}
              <Typography variant="subtitle1" fontWeight={600} color="primary" mt={3} gutterBottom>
                Optional Information (Editable by anyone)
              </Typography>

              <TextField
                label="Phone Number"
                name="phone"
                fullWidth
                margin="normal"
                value={form.phone}
                onChange={handleTextChange}
                inputProps={{ maxLength: 10 }}
                helperText="10 digits only"
              />

              <TextField
                label="Address"
                name="address"
                fullWidth
                margin="normal"
                value={form.address}
                onChange={handleTextChange}
                multiline
                rows={2}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Gender"
                    name="gender"
                    fullWidth
                    select
                    margin="normal"
                    value={form.gender}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {genderOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Marital Status"
                    name="maritalStatus"
                    fullWidth
                    select
                    margin="normal"
                    value={form.maritalStatus}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {maritalStatusOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={form.dob}
                onChange={handleTextChange}
              />

              <Box mt={3}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </Box>
            </form>
          </Paper>
        

    
   
 
  );
};

export default CreateUser;