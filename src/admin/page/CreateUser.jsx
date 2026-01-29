import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, 
  CircularProgress, IconButton, InputAdornment, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, Add } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

// Constants
const genderOptions = ['male', 'female', 'other'];
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];
const jobRoleOptions = ['admin', 'user', 'hr', 'manager',  'intern'];

// Initial form state
const initialFormState = {
  name: '', email: '', password: '', confirmPassword: '', 
  department: '', jobRole: 'user',
  phone: '', address: '', gender: '', maritalStatus: '', dob: '', salary: '',
  accountNumber: '', ifsc: '', bankName: '', bankHolderName: '',
  employeeType: '', properties: [], propertyOwned: '', additionalDetails: '',
  fatherName: '', motherName: '', emergencyName: '', emergencyPhone: '', 
  emergencyRelation: '', emergencyAddress: ''
};

const CreateUser = () => {
  const [form, setForm] = useState(initialFormState);
  const [searchParams] = useSearchParams(); 
  const [companyId, setCompanyId] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Fetch departments and get company data from URL
  useEffect(() => {
    // ✅ Get both parameters from URL
    const companyFromURL = searchParams.get('company');
    const companyCodeFromURL = searchParams.get('companyCode');
    
    console.log("📋 URL Parameters:");
    console.log("Company ID:", companyFromURL);
    console.log("Company Code:", companyCodeFromURL);
    
    if (companyFromURL && companyCodeFromURL) {
      setCompanyId(companyFromURL);
      setCompanyCode(companyCodeFromURL);
      console.log("✅ Company data set from URL");
    } else {
      console.log("❌ Missing company data in URL");
      toast.error("Invalid company reference");
    }
    
    fetchDepartments();
  }, [searchParams]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(response.data.departments || []);
      console.log("📊 Departments loaded:", response.data.departments?.length || 0);
    } catch (err) {
      console.error("Failed to load departments:", err);
      toast.error('Failed to load departments');
    }
  };

  // Handle input changes
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
    
    // ✅ Check company data
    if (!companyId || !companyCode) {
      toast.error('Company information is missing');
      return false;
    }
    
    return true;
  };

  // ✅ UPDATED: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!companyId || !companyCode) {
      toast.error("Company reference is missing");
      return;
    }

    console.log("🚀 Submitting form with company data:");
    console.log("Company ID:", companyId);
    console.log("Company Code:", companyCode);
    console.log("Form data:", form);

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      
      // ✅ Add company data to form
      const userData = {
        ...submitData,
        company: companyId,
        companyCode: companyCode
      };

      console.log("📦 Final data being sent to server:", userData);
      
      const response = await axios.post('/auth/register', userData);
      
      console.log("✅ Server response:", response.data);
      toast.success('✅ User created successfully');
      
      // Reset form
      setForm(initialFormState);
      
    } catch (err) {
      console.error("❌ Registration error:");
      console.error("Error:", err);
      console.error("Response data:", err.response?.data);
      
      const msg = err?.response?.data?.message || '❌ User creation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }} elevation={6}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Create New User
      </Typography>
      
      {/* ✅ Display company information */}
      {/* {companyId && companyCode && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
          <Typography variant="body2" color="primary" fontWeight={600}>
            Creating user for:
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Company ID: {companyId.substring(0, 8)}... | 
            Company Code: {companyCode}
          </Typography>
        </Box>
      )} */}
      
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
            <MenuItem key={dept._id} value={dept._id}>
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
          Optional Information
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
            disabled={loading || !companyId || !companyCode}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
          
          {(!companyId || !companyCode) && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Company information is missing. Please go back and try again.
            </Typography>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default CreateUser;