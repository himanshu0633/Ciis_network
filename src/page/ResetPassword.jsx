import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Zoom
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import BackgroundImage from '../image/login.jpg';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('id');
  const token = queryParams.get('token');

  const [form, setForm] = useState({ 
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!userId || !token) {
      toast.error('Invalid or missing reset link parameters');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await axios.post('/auth/reset-password', {
        userId,
        token,
        newPassword: form.password
      });
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Zoom in timeout={500}>
          <Paper
            elevation={10}
            sx={{
              padding: { xs: 3, sm: 4 },
              borderRadius: 3,
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              color: '#fff',
              transform: shake ? 'translateX(-5px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
            }}
          >
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: '#fff',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  mb: 1
                }}
              >
                Reset Password
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Enter your new password
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={form.password}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(144, 202, 249, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#90caf9',
                    },
                  },
                }}
                InputLabelProps={{
                  style: {
                    color: 'rgba(144, 202, 249, 0.7)',
                  }
                }}
                InputProps={{
                  style: {
                    color: '#fff',
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            color: '#90caf9',
                            backgroundColor: 'rgba(144, 202, 249, 0.1)'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(144, 202, 249, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#90caf9',
                    },
                  },
                }}
                InputLabelProps={{
                  style: {
                    color: 'rgba(144, 202, 249, 0.7)',
                  }
                }}
                InputProps={{
                  style: {
                    color: '#fff',
                  },
                }}
              />

              <Box mt={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                    },
                    '&:disabled': {
                      background: 'rgba(25, 118, 210, 0.5)',
                    }
                  }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockReset />}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Box>
            </form>

            <Box mt={4} textAlign="center">
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Remember your password?{' '}
                <Typography 
                  component="span"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#90caf9',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Login
                </Typography>
              </Typography>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default ResetPassword;