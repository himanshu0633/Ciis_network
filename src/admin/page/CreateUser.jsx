import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, 
  CircularProgress, IconButton, InputAdornment, Grid,
  Autocomplete, FormControl, InputLabel, Select
} from '@mui/material';
import { Visibility, VisibilityOff, Add } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

// Constants
const genderOptions = ['male', 'female', 'other'];
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];

// Initial form state
const initialFormState = {
  name: '', email: '', password: '', confirmPassword: '', 
  department: '', jobRole: '',
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
  const [jobRoles, setJobRoles] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);
  const navigate = useNavigate();
  
  // LocalStorage se company data
  const [companyId, setCompanyId] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // LocalStorage se current user aur company data fetch karna
  useEffect(() => {
    const fetchDataFromLocalStorage = () => {
      try {
        // Current user ka data localStorage se
        const userData = JSON.parse(localStorage.getItem('superAdmin'));
        
        if (userData) {
          console.log("📋 LocalStorage User Data:", userData);
          setCurrentUser(userData);
          
          // Company data extract karna
          if (userData.company && userData.companyCode) {
            setCompanyId(userData.company);
            setCompanyCode(userData.companyCode);
            console.log("✅ Company data set from localStorage:", {
              companyId: userData.company,
              companyCode: userData.companyCode
            });
          } else {
            console.log("❌ Company data missing in user object");
            toast.error("Company information not found in your profile");
            navigate('/dashboard');
          }
        } else {
          console.log("❌ No user data found in localStorage");
          toast.error("Please login again");
          navigate('/login');
        }
      } catch (error) {
        console.error("❌ Error parsing localStorage data:", error);
        toast.error("Error loading user data");
        navigate('/login');
      }
    };

    fetchDataFromLocalStorage();
  }, [navigate]);

  // Company ID ke change pe departments fetch karna
  useEffect(() => {
    if (companyId) {
      fetchDepartments();
    }
  }, [companyId]);

  // Department change pe job roles fetch karna
  useEffect(() => {
    if (form.department) {
      fetchJobRolesByDepartment(form.department);
    } else {
      setJobRoles([]);
    }
  }, [form.department]);

  const fetchDepartments = async () => {
    try {
      if (!companyId) {
        console.log("⚠️ Company ID not available, skipping department fetch");
        return;
      }
      
      setLoadingDepartments(true);
      console.log(`📡 Fetching departments for company: ${companyId}`);
      
      const response = await axios.get(`/departments?company=${companyId}`);
      
      if (response.data && response.data.departments) {
        setDepartments(response.data.departments);
        console.log("✅ Departments loaded:", response.data.departments);
      } else if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
        console.log("✅ Departments loaded (array format):", response.data);
      } else {
        console.log("⚠️ No departments found");
        setDepartments([]);
        toast.info('No departments found for this company');
      }
    } catch (err) {
      console.error("❌ Failed to load departments:", err);
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
      }
      
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Job roles fetch karne ka function
  const fetchJobRolesByDepartment = async (departmentId) => {
    try {
      if (!departmentId) {
        console.log("⚠️ No department ID provided");
        setJobRoles([]);
        return;
      }

      setLoadingJobRoles(true);
      console.log(`📡 Fetching job roles for department: ${departmentId}`);
      
      const response = await axios.get(`/job-roles/department/${departmentId}`);
      
      if (response.data && response.data.success) {
        setJobRoles(response.data.jobRoles || []);
        console.log("✅ Job roles loaded:", response.data.jobRoles);
        
        // Agar koi job role selected nahi hai, aur job roles available hain, to pehla select karo
        if (!form.jobRole && response.data.jobRoles.length > 0) {
          setForm(prev => ({ ...prev, jobRole: response.data.jobRoles[0]._id }));
        }
      } else {
        console.log("⚠️ No job roles found for this department");
        setJobRoles([]);
      }
    } catch (err) {
      console.error("❌ Failed to load job roles:", err);
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
      }
      
      toast.error('Failed to load job roles for this department');
      setJobRoles([]);
    } finally {
      setLoadingJobRoles(false);
    }
  };

  // Handle input changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;

    if (['name', 'fatherName', 'motherName', 'emergencyName', 'bankHolderName'].includes(name)) {
      if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
    else if (['phone', 'salary', 'accountNumber', 'emergencyPhone'].includes(name)) {
      if (/^\d*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
    else if (name === 'ifsc') {
      if (/^[a-zA-Z0-9]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle department selection
  const handleDepartmentChange = (event, newValue) => {
    if (newValue) {
      setForm(prev => ({ 
        ...prev, 
        department: newValue._id,
        jobRole: '' // Reset job role when department changes
      }));
      console.log("Selected department:", newValue.name, "ID:", newValue._id);
    } else {
      setForm(prev => ({ 
        ...prev, 
        department: '',
        jobRole: ''
      }));
    }
  };

  // Handle job role selection
  const handleJobRoleChange = (e) => {
    const { value } = e.target;
    setForm(prev => ({ ...prev, jobRole: value }));
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
    
    if (!companyId || !companyCode) {
      toast.error('Company information is missing');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!companyId || !companyCode) {
      toast.error("Company reference is missing");
      return;
    }

    console.log("🚀 Submitting form:");
    console.log("Company ID:", companyId);
    console.log("Company Code:", companyCode);
    console.log("Department ID:", form.department);
    console.log("Job Role ID:", form.jobRole);
    console.log("Form data:", form);

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      
      // ✅ FIXED: createdBy and createdByName remove karna hai
      // Server automatically createdBy set karega
      const userData = {
        ...submitData,
        company: companyId,
        companyCode: companyCode
        // ❌ createdBy and createdByName mat bhejo
      };

      console.log("📦 Final data being sent to server:", userData);
      
      const response = await axios.post('/auth/register', userData);
      
      console.log("✅ Server response:", response.data);
      toast.success('✅ User created successfully');
      
      // Reset form
      setForm({
        ...initialFormState
      });
      
    } catch (err) {
      console.error("❌ Registration error:", err);
      console.error("Response data:", err.response?.data);
      
      const msg = err?.response?.data?.message || '❌ User creation failed';
      toast.error(msg);
      
      if (err.response?.status === 409) {
        toast.error('Email already exists in this company');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current user's info display
  const renderCurrentUserInfo = () => {
    if (!currentUser) return null;
    
    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
        <Typography variant="body2" color="primary" fontWeight={600}>
          Creating user for: {currentUser.companyCode}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Logged in as: {currentUser.name} ({currentUser.jobRole})
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Company ID: {companyId?.substring(0, 8)}...
        </Typography>
      </Box>
    );
  };

  // Get selected department object for Autocomplete
  const selectedDepartment = departments.find(dept => dept._id === form.department) || null;
  
  // Get selected job role object
  const selectedJobRole = jobRoles.find(role => role._id === form.jobRole) || null;

  return (
    <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }} elevation={6}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Create New User
      </Typography>
      
      {/* Display current user and company info */}
      {renderCurrentUserInfo()}
      
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

        {/* Department Field */}
        <Autocomplete
          options={departments}
          getOptionLabel={(option) => option.name || ''}
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          loading={loadingDepartments}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Department *"
              required
              margin="normal"
              fullWidth
              helperText={
                loadingDepartments 
                  ? "Loading departments..." 
                  : departments.length === 0 
                    ? "No departments found. Please create departments first." 
                    : "Select a department"
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingDepartments ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <MenuItem {...props} key={option._id}>
              {option.name}
            </MenuItem>
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          disabled={loadingDepartments || departments.length === 0}
        />

        {/* Job Role Field - Department ke hisab se */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Job Role *</InputLabel>
          <Select
            label="Job Role *"
            name="jobRole"
            value={form.jobRole}
            onChange={handleJobRoleChange}
            disabled={!form.department || loadingJobRoles || jobRoles.length === 0}
          >
            {loadingJobRoles ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading job roles...
              </MenuItem>
            ) : jobRoles.length === 0 ? (
              <MenuItem disabled>
                {form.department ? "No job roles found for this department" : "Please select a department first"}
              </MenuItem>
            ) : (
              jobRoles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                  {role.description && ` - ${role.description}`}
                </MenuItem>
              ))
            )}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {!form.department 
              ? "Select a department to see available job roles" 
              : loadingJobRoles 
                ? "Loading job roles..." 
                : jobRoles.length > 0 
                  ? `${jobRoles.length} job role(s) available` 
                  : "No job roles defined for this department"}
          </Typography>
        </FormControl>

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
              onChange={handleTextChange}
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
              onChange={handleTextChange}
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
            disabled={loading || !companyId || !companyCode || departments.length === 0 || !form.jobRole}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
          
          {(!companyId || !companyCode) && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Company information is missing. Please login again or contact support.
            </Typography>
          )}
          
          {departments.length === 0 && companyId && (
            <Typography variant="caption" color="warning" sx={{ mt: 1, display: 'block' }}>
              No departments found. Please create departments first before adding users.
            </Typography>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default CreateUser;