import { useState, useEffect } from 'react';
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
  Link,
  Zoom
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import axios from '../utils/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import BackgroundImage from '../image/login.jpg';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    if (location.state?.fromRegister) {
      toast.success("Registration successful! Please login.");
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
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
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate(location.state?.from || '/user/dashboard');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
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
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: {
            xs: 'rgba(0, 0, 0, 0.7)',
            sm: 'rgba(0, 0, 0, 0.6)',
          },
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 0 } }}>
        <Zoom in timeout={500}>
          <Paper
            elevation={10}
            sx={{
              padding: { xs: 2, sm: 4 },
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
                  mb: 1,
                  fontSize: { xs: '1.8rem', sm: '2.125rem' }
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                Sign in to continue to your account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(144, 202, 249, 0.5)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                    '&.Mui-focused fieldset': { borderColor: '#90caf9' }
                  }
                }}
                InputLabelProps={{
                  style: { color: 'rgba(144, 202, 249, 0.7)', fontSize: '0.85rem' }
                }}
                InputProps={{
                  style: { color: '#fff', fontSize: '0.9rem' }
                }}
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(144, 202, 249, 0.5)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                    '&.Mui-focused fieldset': { borderColor: '#90caf9' }
                  }
                }}
                InputLabelProps={{
                  style: { color: 'rgba(144, 202, 249, 0.7)', fontSize: '0.85rem' }
                }}
                InputProps={{
                  style: { color: '#fff', fontSize: '0.9rem' },
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
                  )
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
                    py: { xs: 1.2, sm: 1.5 },
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)'
                    },
                    '&:disabled': {
                      background: 'rgba(25, 118, 210, 0.5)'
                    }
                  }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
            </form>

            <Box mt={2} textAlign="center">
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                By continuing, you agree to our Terms and Privacy Policy
              </Typography>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Login;
