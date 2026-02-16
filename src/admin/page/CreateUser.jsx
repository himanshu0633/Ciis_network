import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, MenuItem,
  CircularProgress, IconButton, InputAdornment,
  Autocomplete, FormControl, InputLabel, Select, Divider
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Add, Business, Person, 
  Work, Lock, Email, Phone, Home, Cake, Badge, 
  AccountBalance, Emergency, FamilyRestroom 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import './CreateUser.css';

// Constants
const genderOptions = ['male', 'female', 'other'];
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];
const employeeTypeOptions = ['permanent', 'probation', 'contract', 'intern', 'trainee'];

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        const userData = JSON.parse(localStorage.getItem('superAdmin'));

        if (userData) {
          console.log("📋 LocalStorage User Data:", userData);
          setCurrentUser(userData);

          if (userData.company && userData.companyCode) {
            setCompanyId(userData.company);
            setCompanyCode(userData.companyCode);
          } else {
            toast.error("Company information not found in your profile");
            navigate('/dashboard');
          }
        } else {
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

  // ✅ FIXED: Departments fetch with DEBUGGING
  useEffect(() => {
    if (companyId) {
      console.log("🔍 Company ID found, fetching departments for:", companyId);
      fetchDepartments();
    } else {
      console.log("⚠️ No company ID yet");
    }
  }, [companyId]);

  // Department change pe job roles fetch karna
  useEffect(() => {
    if (form.department) {
      fetchJobRolesByDepartment(form.department);
    } else {
      setJobRoles([]);
      setForm(prev => ({ ...prev, jobRole: '' }));
    }
  }, [form.department]);

  // ✅ FIXED: Fetch Departments - All possible endpoints try karo
  const fetchDepartments = async () => {
    try {
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }
      
      setLoadingDepartments(true);
      console.log("📡 Fetching departments for company:", companyId);
      
      let response = null;
      let success = false;
      
      // 🔥 TRY MULTIPLE ENDPOINTS - Backend ke according adjust karo
      const endpoints = [
        `/departments?company=${companyId}`,
        `/departments/company/${companyId}`,
        `/api/departments?company=${companyId}`,
        `/department?companyId=${companyId}`,
        `/departments?companyId=${companyId}`,
        `/departments?companyCode=${companyCode}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint);
          console.log(`✅ Success with: ${endpoint}`, response.data);
          success = true;
          break;
        } catch (err) {
          console.log(`❌ Failed: ${endpoint}`, err.message);
        }
      }
      
      if (!success) {
        throw new Error("All endpoints failed");
      }

      // 🔥 HANDLE ALL RESPONSE FORMATS
      let departmentsData = [];
      
      // Response data ko normalize karo
      const data = response.data;
      console.log("📦 Raw response data:", data);
      
      if (data) {
        // Case 1: Direct array
        if (Array.isArray(data)) {
          departmentsData = data;
        }
        // Case 2: { departments: [...] }
        else if (data.departments && Array.isArray(data.departments)) {
          departmentsData = data.departments;
        }
        // Case 3: { data: [...] }
        else if (data.data && Array.isArray(data.data)) {
          departmentsData = data.data;
        }
        // Case 4: { result: [...] }
        else if (data.result && Array.isArray(data.result)) {
          departmentsData = data.result;
        }
        // Case 5: { success: true, data: [...] }
        else if (data.success && data.data && Array.isArray(data.data)) {
          departmentsData = data.data;
        }
        // Case 6: { success: true, departments: [...] }
        else if (data.success && data.departments && Array.isArray(data.departments)) {
          departmentsData = data.departments;
        }
      }
      
      console.log("✅ Processed departments:", departmentsData);
      setDepartments(departmentsData);

      if (departmentsData.length === 0) {
        toast.warning('No departments found for this company');
      } else {
        toast.success(`${departmentsData.length} departments loaded`);
      }

    } catch (err) {
      console.error("❌ All department fetch attempts failed:", err);
      toast.error('Failed to load departments. Check API endpoint.');
      setDepartments([]);
      
      // 🔥 DEBUG: Show current company ID
      console.log("🔍 Current company ID:", companyId);
      console.log("🔍 Current company Code:", companyCode);
      console.log("🔍 Current user:", currentUser);
      
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ✅ FIXED: Fetch Job Roles - Multiple endpoints
  const fetchJobRolesByDepartment = async (departmentId) => {
    try {
      if (!departmentId) {
        setJobRoles([]);
        return;
      }

      setLoadingJobRoles(true);
      console.log("📡 Fetching job roles for department:", departmentId);
      
      let response = null;
      let success = false;
      
      // 🔥 TRY MULTIPLE ENDPOINTS
      const endpoints = [
        `/job-roles?department=${departmentId}`,
        `/job-roles/department/${departmentId}`,
        `/api/job-roles?department=${departmentId}`,
        `/job-roles?departmentId=${departmentId}`,
        `/job-roles?dept=${departmentId}`,
        `/job-roles/by-department/${departmentId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint);
          console.log(`✅ Success with: ${endpoint}`, response.data);
          success = true;
          break;
        } catch (err) {
          console.log(`❌ Failed: ${endpoint}`, err.message);
        }
      }
      
      if (!success) {
        throw new Error("All job role endpoints failed");
      }

      // 🔥 HANDLE ALL RESPONSE FORMATS
      let jobRolesData = [];
      const data = response.data;
      
      if (data) {
        if (Array.isArray(data)) {
          jobRolesData = data;
        }
        else if (data.jobRoles && Array.isArray(data.jobRoles)) {
          jobRolesData = data.jobRoles;
        }
        else if (data.data && Array.isArray(data.data)) {
          jobRolesData = data.data;
        }
        else if (data.result && Array.isArray(data.result)) {
          jobRolesData = data.result;
        }
        else if (data.success && data.jobRoles && Array.isArray(data.jobRoles)) {
          jobRolesData = data.jobRoles;
        }
        else if (data.success && data.data && Array.isArray(data.data)) {
          jobRolesData = data.data;
        }
      }
      
      console.log("✅ Processed job roles:", jobRolesData);
      setJobRoles(jobRolesData);

      // Auto-select first job role
      if (jobRolesData.length > 0) {
        const firstRoleId = jobRolesData[0]._id || jobRolesData[0].id;
        setForm(prev => ({ ...prev, jobRole: firstRoleId }));
        toast.info(`${jobRolesData.length} job role(s) available`);
      } else {
        toast.warning('No job roles found for this department');
      }

    } catch (err) {
      console.error("❌ Failed to load job roles:", err);
      toast.error('Failed to load job roles');
      setJobRoles([]);
    } finally {
      setLoadingJobRoles(false);
    }
  };

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

  const handleDepartmentChange = (event, newValue) => {
    if (newValue) {
      const departmentId = newValue._id || newValue.id;
      console.log("✅ Department selected:", departmentId, newValue.name || newValue.departmentName);
      
      setForm(prev => ({
        ...prev,
        department: departmentId,
        jobRole: ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        department: '',
        jobRole: ''
      }));
      setJobRoles([]);
    }
  };

  const handleJobRoleChange = (e) => {
    const { value } = e.target;
    console.log("✅ Job Role selected:", value);
    setForm(prev => ({ ...prev, jobRole: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!companyId || !companyCode) {
      toast.error("Company reference is missing");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;

      const userData = {
        ...submitData,
        company: companyId,
        companyCode: companyCode
      };

      console.log("📦 Submitting user data:", userData);
      
      const response = await axios.post('/auth/register', userData);
      console.log("✅ Server response:", response.data);
      toast.success('✅ User created successfully');
      
      setForm({ ...initialFormState });

    } catch (err) {
      console.error("❌ Registration error:", err);
      const msg = err?.response?.data?.message || '❌ User creation failed';
      toast.error(msg);

      if (err.response?.status === 409) {
        toast.error('Email already exists in this company');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get selected department object
  const selectedDepartment = departments.find(
    dept => (dept._id === form.department || dept.id === form.department)
  ) || null;

  // Get user display name
  const getUserDisplayName = () => {
    if (currentUser?.name) {
      return currentUser.name.toUpperCase();
    }
    return 'USER';
  };

  // 🔥 DEBUG: Show current state
  console.log("🏢 Current departments state:", departments);
  console.log("📋 Selected department:", selectedDepartment);
  console.log("🎯 Form department ID:", form.department);

  return (
    <Box className="create-user-container">
      <Paper className="user-paper" elevation={6}>
        {/* Header Section */}
        <Box className="form-header">
          <Box>
            <Typography className="header-title">
              Create New User
            </Typography>
            <Typography className="header-subtitle">
              <Badge fontSize="small" />
              Add a new team member to your organization
            </Typography>
          </Box>
        </Box>

        {/* Company Info Box */}
        {currentUser && (
          <Box className="company-info-box">
            <Typography className="company-name">
              <Business sx={{ fontSize: 24 }} /> 
              {getUserDisplayName()}
            </Typography>
            <Typography className="company-details">
              <Person fontSize="small" /> Created by: {currentUser.name} ({currentUser.jobRole || 'super_admin'})
            </Typography>
            <Typography className="company-details">
              <Work fontSize="small" /> Company ID: {companyId?.substring(0, 8)}...
            </Typography>
            <Typography className="company-details" sx={{ color: '#1976d2', fontWeight: 500 }}>
              <Badge fontSize="small" /> Departments: {departments.length} loaded
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <span className="required-star">*</span> All marked fields are required
        </Typography>

        <Divider className="custom-divider" />

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <Typography className="section-title">
            <Person className="section-icon" /> Personal Information
          </Typography>

          <Box className="form-grid">
            {/* ROW 1: Name & Email */}
            <Box className="form-row">
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={handleTextChange}
                className="custom-textfield"
                helperText="Only letters and spaces"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={handleTextChange}
                className="custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* ROW 2: Password & Confirm Password */}
            <Box className="form-row">
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={form.password}
                onChange={handleTextChange}
                className="custom-textfield password-field"
                helperText="Minimum 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(prev => !prev)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                required
                value={form.confirmPassword}
                onChange={handleTextChange}
                className="custom-textfield password-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(prev => !prev)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* ROW 3: Department & Job Role - FIXED */}
            <Box className="form-row">
              {/* Department - Autocomplete */}
              <Autocomplete
                options={departments}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return option.name || option.departmentName || option.title || 'Unnamed';
                }}
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                loading={loadingDepartments}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return (option._id === value._id) || (option.id === value.id);
                }}
                noOptionsText={
                  loadingDepartments 
                    ? "Loading departments..." 
                    : "No departments found"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    required
                    fullWidth
                    className="custom-textfield"
                    helperText={
                      loadingDepartments
                        ? "Loading departments..."
                        : departments.length === 0
                          ? "No departments available. Please create departments first."
                          : `${departments.length} department(s) available`
                    }
                    error={departments.length === 0 && !loadingDepartments}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color={departments.length === 0 ? "disabled" : "primary"} fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Job Role - Select */}
              <FormControl 
                fullWidth 
                required 
                className="custom-textfield"
                error={jobRoles.length === 0 && form.department && !loadingJobRoles}
              >
                <InputLabel>Job Role</InputLabel>
                <Select
                  label="Job Role"
                  name="jobRole"
                  value={form.jobRole || ''}
                  onChange={handleJobRoleChange}
                  disabled={!form.department || loadingJobRoles || jobRoles.length === 0}
                  startAdornment={
                    <InputAdornment position="start">
                      <Work 
                        color={
                          !form.department ? "disabled" : 
                          loadingJobRoles ? "action" : 
                          jobRoles.length === 0 ? "disabled" : "primary"
                        } 
                        fontSize="small" 
                      />
                    </InputAdornment>
                  }
                >
                  {loadingJobRoles ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading job roles...
                    </MenuItem>
                  ) : jobRoles.length === 0 ? (
                    <MenuItem disabled>
                      {form.department ? "No job roles found for this department" : "Select a department first"}
                    </MenuItem>
                  ) : (
                    jobRoles.map((role) => (
                      <MenuItem key={role._id || role.id} value={role._id || role.id}>
                        {role.name || role.title || role.roleName}
                        {role.description && ` - ${role.description}`}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {form.department && jobRoles.length === 0 && !loadingJobRoles && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    No job roles defined for this department
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* ROW 4: Phone Number & Employee Type */}
         

       

            {/* ROW 6: Gender & Marital Status */}
            <Box className="form-row">
              <FormControl fullWidth className="custom-textfield">
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  required
                  name="gender"
                  value={form.gender}
                  onChange={handleTextChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {genderOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth className="custom-textfield">
                <InputLabel>Marital Status</InputLabel>
                <Select
                  label="Marital Status"
                  name="maritalStatus"
                  required
                  value={form.maritalStatus}
                  onChange={handleTextChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {maritalStatusOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

                 {/* ROW 5: Date of Birth & Salary */}
            <Box className="form-row">
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dob}
                onChange={handleTextChange}
                className="custom-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cake color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

             
            </Box>

               <Box className="form-row">
              <TextField
                label="Phone Number"
                name="phone"
                required
                fullWidth
                value={form.phone}
                onChange={handleTextChange}
                className="custom-textfield"
                inputProps={{ maxLength: 10 }}
                helperText="10 digits only"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

            
            </Box>
          </Box>


          <Divider className="custom-divider" />

          {/* Address Information */}
          <Typography className="section-title">
            <Home className="section-icon" /> Address Information
          </Typography>

          <Box className="form-grid">
            <TextField
              label="Address"
              name="address"
              required
              fullWidth
              value={form.address}
              onChange={handleTextChange}
              multiline
              rows={2}
              className="custom-textfield"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Rest of the form sections remain same */}
          <Divider className="custom-divider" />
          
          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className="submit-button"
            disabled={loading || !companyId || !companyCode || departments.length === 0 || !form.jobRole}
            startIcon={loading ? <CircularProgress size={20} className="loading-spinner" /> : <Add />}
          >
            {loading ? 'Creating User...' : 'Create New User'}
          </Button>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="caption" display="block" color="text.secondary">
                🔍 Debug: Company ID: {companyId || 'Not set'} | Departments: {departments.length} | 
                Selected Dept: {form.department || 'None'} | Job Roles: {jobRoles.length}
              </Typography>
            </Box>
          )}

          {/* Warning Messages */}
          {(!companyId || !companyCode) && (
            <Typography className="info-message error-message">
              ⚠️ Company information is missing. Please login again or contact support.
            </Typography>
          )}

          {departments.length === 0 && companyId && !loadingDepartments && (
            <Typography className="info-message warning-message">
              ⚠️ No departments found. Please create departments first before adding users.
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser;