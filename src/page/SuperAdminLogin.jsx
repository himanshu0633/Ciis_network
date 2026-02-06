import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Grid,
  Fade,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  LockOutlined,
  EmailOutlined,
  Security,
  AdminPanelSettings,
  Dashboard,
  People,
  Settings,
  Analytics,
  Business
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API_URL from '../config';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyIdentifier, setCompanyIdentifier] = useState('');

  // Extract company identifier from URL (if any)
  useEffect(() => {
    const extractCompanyIdentifier = () => {
      const path = window.location.pathname;
      console.log('🔗 Current path:', path);
      
      const match1 = path.match(/\/company\/([^/]+)\/super-admin-login/);
      if (match1 && match1[1]) {
        console.log('✅ Extracted identifier from /company/{id}/super-admin-login:', match1[1]);
        return match1[1];
      }

      const match2 = path.match(/\/company\/([^/]+)/);
      if (match2 && match2[1]) {
        console.log('✅ Extracted identifier from /company/{id}:', match2[1]);
        return match2[1];
      }

      const segments = path.split('/').filter(Boolean);
      if (segments.length >= 2 && segments[0] === 'company') {
        console.log('✅ Extracted identifier from segments:', segments[1]);
        return segments[1];
      }

      console.log('⚠️ No company identifier found in URL, using default');
      return 'ciis'; // Default company identifier for super admin
    };

    const identifier = extractCompanyIdentifier();
    if (identifier) {
      console.log('🎯 Setting company identifier:', identifier);
      setCompanyIdentifier(identifier);
      fetchCompanyDetails(identifier);
    } else {
      setCompanyLoading(false);
    }
  }, []);

  const fetchCompanyDetails = async (identifier) => {
    try {
      setCompanyLoading(true);
      const response = await axios.get(`${API_URL}/company/details/${identifier}`);

      if (response.data.success) {
        setCompanyDetails(response.data.company);
        document.title = `${response.data.company.companyName} - Super Admin Login`;
      }
    } catch (error) {
      console.error('Error fetching company details:', error);

      if (error.response?.status === 404) {
        toast.error('Company not found. Using default configuration.');
      } else if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Company account is not active');
      }

      // Default company details for super admin
      setCompanyDetails({
        companyName: 'CIIS NETWORK',
        logo: null
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/super-admin/login`, {
        ...form,
        companyIdentifier: companyIdentifier || 'ciis'
      });

      if (response.data.success) {
        // Save super admin data to localStorage
        localStorage.setItem('superAdmin', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.token);

        // Save company details if available
        if (companyDetails) {
          localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
        }

        // Save company identifier
        if (companyIdentifier) {
          localStorage.setItem('companyIdentifier', companyIdentifier);
        }

        toast.success('Login successful! Redirecting...');

        // Redirect to super admin dashboard
        navigate('/Ciis-network/department');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check credentials.';
      toast.error(errorMsg);
      setErrors((prev) => ({ ...prev, general: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="md">
        <Fade in>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <Grid container sx={{ minHeight: '500px' }}>
              {/* LEFT SECTION - Super Admin Features */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 6.5, md: 4 },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Subtle pattern overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.3
                  }}
                />

                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    color: 'white',
                    width: '100%'
                  }}
                >
                  {/* Company/Super Admin Logo */}
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 3,
                      backgroundColor: 'white',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 32px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {companyLoading ? (
                      <CircularProgress size={40} color="inherit" />
                    ) : companyDetails?.logo ? (
                      <Box
                        component="img"
                        src={companyDetails.logo}
                        alt={companyDetails.companyName}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <AdminPanelSettings
                        sx={{
                          fontSize: 48,
                          color: 'white'
                        }}
                      />
                    )}
                  </Box>

                  {/* Company/Super Admin Title */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Oswald", sans-serif',
                      fontWeight: 600,
                      mb: 1,
                      letterSpacing: '-0.5px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {companyLoading ? 'Loading...' : (companyDetails?.companyName || 'CIIS NETWORK')}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      letterSpacing: '0.5px',
                      mb: 4
                    }}
                  >
                    {companyDetails?.companyName ? 'Super Admin Portal' : 'Master Control Panel'}
                  </Typography>

                  {/* Features List */}
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 2,
                      p: 2
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        mb: 2,
                        fontWeight: 600
                      }}
                    >
                      Super Admin Features:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Dashboard sx={{ color: 'white', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="📊 Manage all companies"
                          primaryTypographyProps={{
                            sx: { color: 'white', fontSize: '0.9rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <People sx={{ color: 'white', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="👥 View all users across companies"
                          primaryTypographyProps={{
                            sx: { color: 'white', fontSize: '0.9rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Settings sx={{ color: 'white', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="⚙️ System configuration"
                          primaryTypographyProps={{
                            sx: { color: 'white', fontSize: '0.9rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Analytics sx={{ color: 'white', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="📈 Analytics and reports"
                          primaryTypographyProps={{
                            sx: { color: 'white', fontSize: '0.9rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Security sx={{ color: 'white', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="🔐 Master access control"
                          primaryTypographyProps={{
                            sx: { color: 'white', fontSize: '0.9rem' }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Card>
                </Box>
              </Grid>

              {/* RIGHT SECTION - Login Form */}
              <Grid
                item
                xs={12}
                md={7}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: { xs: 4, md: 6 }
                }}
              >
                <Box sx={{ maxWidth: '380px', mx: 'auto', width: '100%' }}>
                  {/* Form Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: 'text.primary',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      {companyDetails?.companyName || 'CIIS NETWORK'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        mb: 3
                      }}
                    >
                      Access the master control panel
                    </Typography>
                  </Box>

                  {/* Error Alert */}
                  {errors.general && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      {errors.general}
                    </Alert>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={loading}
                      autoComplete="email"
                      margin="normal"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined color="action" />
                          </InputAdornment>
                        )
                      }}
                    />

                    {/* Password Input */}
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      disabled={loading}
                      autoComplete="current-password"
                      margin="normal"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

                    {/* Sign In Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        mt: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3a9a 100%)',
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                        }
                      }}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <LoginIcon />
                        )
                      }
                    >
                      {loading ? 'Logging in...' : 'Login as Super Admin'}
                    </Button>

                    {/* Regular Login Link */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Regular company login?{' '}
                        <Link
                          href="/"
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Go to Home
                        </Link>
                      </Typography>
                    </Box>
                  </form>

                  {/* Terms & Privacy */}
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.disabled',
                        lineHeight: 1.5,
                        display: 'block'
                      }}
                    >
                      By signing in, you agree to our{' '}
                      <Link href="#" variant="caption" sx={{ color: 'text.disabled' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" variant="caption" sx={{ color: 'text.disabled' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default SuperAdminLogin;