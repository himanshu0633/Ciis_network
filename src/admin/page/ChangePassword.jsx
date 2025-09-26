import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);

  const [form, setForm] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingChange, setLoadingChange] = useState(false);

  // ✅ Option 1: Forgot Password via Email
  const handleSendEmail = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error('Enter valid email');
    }

    try {
      setLoadingEmail(true);
      const res = await axios.post('/auth/forgot-password', { email });
      toast.success(res.data?.message || 'Reset link sent successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setLoadingEmail(false);
    }
  };

  // ✅ Option 2: Change password using old password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!form.email || !form.oldPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error('Please fill all fields');
    }

    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New and Confirm Passwords must match');
    }

    try {
      setLoadingChange(true);
      const res = await axios.post('/auth/change-password', {
        email: form.email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      toast.success(res.data?.message || 'Password changed successfully!');
      setForm({ email: '', oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoadingChange(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Change Password</Typography>

        {/* Option 1 */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>🔐 Send Reset Link via Email</Typography>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendEmail}
              disabled={loadingEmail}
            >
              {loadingEmail ? <CircularProgress size={20} /> : 'Send Email'}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Option 2 */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>🔁 Change Password using Old Password</Typography>
        <form onSubmit={handleChangePassword}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Old Password"
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loadingChange}
          >
            {loadingChange ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePassword;
