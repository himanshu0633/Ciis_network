import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Paper
} from '@mui/material';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New password and confirm password must match.');
    }

    try {
      setLoading(true);
      const res = await axios.post('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      toast.success(res.data?.message || 'Password changed successfully.');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Change Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Old Password"
            type="password"
            name="oldPassword"
            margin="normal"
            required
            value={form.oldPassword}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            name="newPassword"
            margin="normal"
            required
            value={form.newPassword}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            margin="normal"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePassword;
