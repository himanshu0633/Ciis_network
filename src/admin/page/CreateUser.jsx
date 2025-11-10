import { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, CircularProgress, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

const roleOptions = ['admin', 'user', 'hr', 'manager'];
const propertyOptions = ['phone', 'sim', 'laptop', 'desktop', 'headphone'];
const genderOptions = ['male', 'female', 'other'];
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];
const employeeTypeOptions = ['intern', 'technical', 'non-technical', 'sales'];
const emergencyRelationOptions = ['father', 'mother', 'spouse', 'sibling', 'friend', 'other'];

// ✅ Initial form structure for easy reset
const initialFormState = {
  name: '', email: '', password: '', confirmPassword: '', role: '',
  phone: '', address: '', gender: '', maritalStatus: '', dob: '', salary: '',
  accountNumber: '', ifsc: '', bankName: '', bankHolderName: '',
  employeeType: '', jobRole: '', properties: [], propertyOwned: '', additionalDetails: '',
  fatherName: '', motherName: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '', emergencyAddress: ''
};

const CreateUser = () => {
  const [form, setForm] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle text input with validation
  const handleTextChange = (e) => {
    const { name, value } = e.target;

    if (['name', 'fatherName', 'motherName', 'emergencyName', 'bankHolderName'].includes(name)) {
      if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else if (['phone', 'salary', 'accountNumber', 'emergencyPhone'].includes(name)) {
      if (/^\d*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'ifsc') {
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

  // Handle checkbox selection for assets
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      properties: checked
        ? [...prev.properties, value]
        : prev.properties.filter(p => p !== value)
    }));
  };

  // ✅ Form validation
  const validateForm = () => {
    if (!form.name || form.name.length < 2) return toast.error('Name must be at least 2 characters');
    if (!form.email.includes('@')) return toast.error('Enter a valid email');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!roleOptions.includes(form.role)) return toast.error('Select a valid role');

    // Extra checks for role = user
    if (form.role === 'user') {
      if (form.phone && form.phone.length !== 10) return toast.error('Phone number must be 10 digits');
      if (form.emergencyPhone && form.emergencyPhone.length !== 10) return toast.error('Emergency phone must be 10 digits');
      if (form.accountNumber && form.accountNumber.length < 8) return toast.error('Account number must be at least 8 digits');
    }
    return true;
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;

      // Remove extra fields if role is not 'user'
      let finalData = { ...submitData };
      if (form.role !== 'user') {
        const userSpecificFields = [
          'phone', 'address', 'gender', 'maritalStatus', 'dob', 'salary',
          'accountNumber', 'ifsc', 'bankName', 'bankHolderName', 'employeeType', 'jobRole',
          'properties', 'propertyOwned', 'additionalDetails',
          'fatherName', 'motherName', 'emergencyName', 'emergencyPhone', 'emergencyRelation', 'emergencyAddress'
        ];
        userSpecificFields.forEach(field => delete finalData[field]);
      }

      await axios.post('/auth/register', finalData);
      toast.success('✅ User created successfully');

      setForm(initialFormState);
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        '❌ User creation failed';
      console.error('User creation error:', err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Create New User
        </Typography>
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            required
            margin="normal"
            value={form.name}
            onChange={handleTextChange}
            inputProps={{ pattern: '[a-zA-Z\\s]*' }}
            helperText="Only letters and spaces allowed"
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={form.email}
            onChange={handleTextChange}
          />

          <TextField
            label="Password"
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
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            margin="normal"
            value={form.confirmPassword}
            onChange={handleTextChange}
          />

          <TextField
            label="Role"
            name="role"
            fullWidth
            select
            required
            margin="normal"
            value={form.role}
            onChange={handleSelectChange}
          >
            {roleOptions.map(role => (
              <MenuItem key={role} value={role}>
                {role.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          {/* Extra fields only for 'user' */}
          {form.role === 'user' && (
            <>
              <Typography variant="h6" mt={2}>Basic Details</Typography>

              <TextField
                label="Phone Number"
                name="phone"
                fullWidth
                margin="normal"
                value={form.phone}
                onChange={handleTextChange}
                inputProps={{ maxLength: 10, pattern: '\\d*' }}
                helperText="10 digits only"
              />

              <TextField
                label="Address"
                name="address"
                fullWidth
                margin="normal"
                value={form.address}
                onChange={handleTextChange}
              />

              <TextField
                label="Gender"
                name="gender"
                fullWidth
                select
                margin="normal"
                value={form.gender}
                onChange={handleSelectChange}
              >
                {genderOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Marital Status"
                name="maritalStatus"
                fullWidth
                select
                margin="normal"
                value={form.maritalStatus}
                onChange={handleSelectChange}
              >
                {maritalStatusOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>

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

              <TextField
                label="Salary"
                name="salary"
                fullWidth
                margin="normal"
                value={form.salary}
                onChange={handleTextChange}
                inputProps={{ pattern: '\\d*' }}
                helperText="Numbers only"
              />

              <Typography variant="h6" mt={2}>Bank Details</Typography>

              <TextField
                label="Account Number"
                name="accountNumber"
                fullWidth
                margin="normal"
                value={form.accountNumber}
                onChange={handleTextChange}
              />

              <TextField
                label="IFSC Code"
                name="ifsc"
                fullWidth
                margin="normal"
                value={form.ifsc}
                onChange={handleTextChange}
              />

              <TextField
                label="Bank Name"
                name="bankName"
                fullWidth
                margin="normal"
                value={form.bankName}
                onChange={handleTextChange}
              />

              <TextField
                label="Bank Holder Name"
                name="bankHolderName"
                fullWidth
                margin="normal"
                value={form.bankHolderName}
                onChange={handleTextChange}
              />

              <TextField
                label="Employee Type"
                name="employeeType"
                select
                fullWidth
                margin="normal"
                value={form.employeeType}
                onChange={handleSelectChange}
              >
                {employeeTypeOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Job Role"
                name="jobRole"
                fullWidth
                margin="normal"
                value={form.jobRole}
                onChange={handleTextChange}
              />

              <Typography variant="h6" mt={2}>Assets</Typography>
              <Box mt={1}>
                <Typography>Select Properties:</Typography>
                {propertyOptions.map(item => (
                  <label key={item} style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      value={item}
                      checked={form.properties.includes(item)}
                      onChange={handleCheckboxChange}
                    />{' '}
                    {item}
                  </label>
                ))}
              </Box>

              <TextField
                label="Property Owned"
                name="propertyOwned"
                fullWidth
                margin="normal"
                value={form.propertyOwned}
                onChange={handleTextChange}
              />

              <TextField
                label="Additional Details"
                name="additionalDetails"
                fullWidth
                margin="normal"
                value={form.additionalDetails}
                onChange={handleTextChange}
              />

              <Typography variant="h6" mt={2}>Family Details</Typography>

              <TextField
                label="Father's Name"
                name="fatherName"
                fullWidth
                margin="normal"
                value={form.fatherName}
                onChange={handleTextChange}
              />

              <TextField
                label="Mother's Name"
                name="motherName"
                fullWidth
                margin="normal"
                value={form.motherName}
                onChange={handleTextChange}
              />

              <Typography variant="h6" mt={2}>Emergency Contact</Typography>

              <TextField
                label="Name"
                name="emergencyName"
                fullWidth
                margin="normal"
                value={form.emergencyName}
                onChange={handleTextChange}
              />

              <TextField
                label="Phone"
                name="emergencyPhone"
                fullWidth
                margin="normal"
                value={form.emergencyPhone}
                onChange={handleTextChange}
                inputProps={{ maxLength: 10, pattern: '\\d*' }}
                helperText="10 digits only"
              />

              <TextField
                label="Relationship"
                name="emergencyRelation"
                fullWidth
                select
                margin="normal"
                value={form.emergencyRelation}
                onChange={handleSelectChange}
              >
                {emergencyRelationOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Present Address"
                name="emergencyAddress"
                fullWidth
                margin="normal"
                value={form.emergencyAddress}
                onChange={handleTextChange}
              />
            </>
          )}

          <Box mt={3}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser;
