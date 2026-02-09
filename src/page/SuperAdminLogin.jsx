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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer
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
  Business,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { toast } from 'react-toastify';
import API_URL from '../config';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [errors, setErrors] = useState({});
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyIdentifier, setCompanyIdentifier] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract company identifier from URL (if any)
  useEffect(() => {
    const extractCompanyIdentifier = () => {
      const path = window.location.pathname;
      
      const match1 = path.match(/\/company\/([^/]+)\/super-admin-login/);
      if (match1 && match1[1]) {
        return match1[1];
      }

      const match2 = path.match(/\/company\/([^/]+)/);
      if (match2 && match2[1]) {
        return match2[1];
      }

      const segments = path.split('/').filter(Boolean);
      if (segments.length >= 2 && segments[0] === 'company') {
        return segments[1];
      }

      return 'ciis'; // Default company identifier for super admin
    };

    const identifier = extractCompanyIdentifier();
    if (identifier) {
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
=======
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
>>>>>>> 240a4e8eaa1426703358d465c5a80169fe41fa38

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
<<<<<<< HEAD
      const response = await axios.post(`${API_URL}/super-admin/login`, {
        ...form,
        companyIdentifier: companyIdentifier || 'ciis'
      });

=======
      const response = await axios.post(`${API_URL}/super-admin/login`, form);
      
>>>>>>> 240a4e8eaa1426703358d465c5a80169fe41fa38
      if (response.data.success) {
        localStorage.setItem('superAdmin', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.token);

        if (companyDetails) {
          localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
        }

        if (companyIdentifier) {
          localStorage.setItem('companyIdentifier', companyIdentifier);
        }

        toast.success('Login successful! Redirecting...');
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

  // Mobile Drawer for features
  const FeaturesDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
          color: 'white',
          p: 2
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" fontWeight={600}>
            Super Admin Features
          </Typography>
        </Box>
        
        <List>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Dashboard sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary="Manage all companies"
              primaryTypographyProps={{
                sx: { color: 'white', fontSize: '0.95rem' }
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <People sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary="View all users"
              primaryTypographyProps={{
                sx: { color: 'white', fontSize: '0.95rem' }
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary="System configuration"
              primaryTypographyProps={{
                sx: { color: 'white', fontSize: '0.95rem' }
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Analytics sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary="Analytics and reports"
              primaryTypographyProps={{
                sx: { color: 'white', fontSize: '0.95rem' }
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Security sx={{ color: 'white', fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary="Master access control"
              primaryTypographyProps={{
                sx: { color: 'white', fontSize: '0.95rem' }
              }}
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  // Features Section Component
  const FeaturesSection = () => (
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
        p: isMobile ? 3 : isTablet ? 4 : 6,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
            borderRadius: 2,
            backgroundColor: 'white',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: isMobile ? 2 : 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          {companyLoading ? (
            <CircularProgress size={isMobile ? 30 : 40} color="inherit" />
          ) : companyDetails?.logo ? (
            <Box
              component="img"
              src={companyDetails.logo}
              alt={companyDetails.companyName}
              sx={{
                width: isMobile ? 60 : 70,
                height: isMobile ? 60 : 70,
                objectFit: 'contain',
                borderRadius: '6px'
              }}
            />
          ) : (
            <AdminPanelSettings
              sx={{
                fontSize: isMobile ? 36 : 44,
                color: 'white'
              }}
            />
          )}
        </Box>

        {/* Company/Super Admin Title */}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 600,
            mb: 1,
            letterSpacing: '-0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem'
          }}
        >
          {companyLoading ? 'Loading...' : (companyDetails?.companyName || 'CIIS NETWORK')}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            letterSpacing: '0.5px',
            mb: isMobile ? 2 : 4,
            fontSize: isMobile ? '0.8rem' : '0.875rem'
          }}
        >
          {companyDetails?.companyName ? 'Super Admin Portal' : 'Master Control Panel'}
        </Typography>

        {/* Features List - Hidden on mobile, shown on tablet and desktop */}
        {!isMobile && (
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: isTablet ? 1.5 : 2
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 600,
                fontSize: isTablet ? '1rem' : '1.1rem'
              }}
            >
              Super Admin Features:
            </Typography>
            <List dense sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: isTablet ? 32 : 36 }}>
                  <Dashboard sx={{ color: 'white', fontSize: isTablet ? 18 : 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Manage all companies"
                  primaryTypographyProps={{
                    sx: { 
                      color: 'white', 
                      fontSize: isTablet ? '0.85rem' : '0.9rem' 
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: isTablet ? 32 : 36 }}>
                  <People sx={{ color: 'white', fontSize: isTablet ? 18 : 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary="View all users across companies"
                  primaryTypographyProps={{
                    sx: { 
                      color: 'white', 
                      fontSize: isTablet ? '0.85rem' : '0.9rem' 
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: isTablet ? 32 : 36 }}>
                  <Settings sx={{ color: 'white', fontSize: isTablet ? 18 : 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary="System configuration"
                  primaryTypographyProps={{
                    sx: { 
                      color: 'white', 
                      fontSize: isTablet ? '0.85rem' : '0.9rem' 
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: isTablet ? 32 : 36 }}>
                  <Analytics sx={{ color: 'white', fontSize: isTablet ? 18 : 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Analytics and reports"
                  primaryTypographyProps={{
                    sx: { 
                      color: 'white', 
                      fontSize: isTablet ? '0.85rem' : '0.9rem' 
                    }
                  }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: isTablet ? 32 : 36 }}>
                  <Security sx={{ color: 'white', fontSize: isTablet ? 18 : 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Master access control"
                  primaryTypographyProps={{
                    sx: { 
                      color: 'white', 
                      fontSize: isTablet ? '0.85rem' : '0.9rem' 
                    }
                  }}
                />
              </ListItem>
            </List>
          </Card>
        )}
      </Box>
    </Grid>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: isMobile ? 1 : 2
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          px: isMobile ? 1 : 2,
          py: isMobile ? 2 : 0
        }}
      >
        <Fade in>
          <Paper
            elevation={isMobile ? 6 : 24}
            sx={{
              borderRadius: isMobile ? 2 : 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              minHeight: isMobile ? 'auto' : '500px'
            }}
          >
            <Grid container sx={{ minHeight: isMobile ? 'auto' : '500px' }}>
              {/* Left Features Section - Shown on tablet and desktop */}
              {!isMobile && <FeaturesSection />}

              {/* Mobile Features Button */}
              {isMobile && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 16, 
                  zIndex: 10 
                }}>
                  <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white'
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}

              {/* RIGHT SECTION - Login Form */}
              <Grid
                item
                xs={12}
                md={isDesktop ? 7 : (isTablet ? 12 : 12)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: isMobile ? 3 : isTablet ? 4 : 6
                }}
              >
                <Box sx={{ 
                  maxWidth: '370px', 
                  mx: 'auto', 
                  width: '100%',
                  mt: isMobile ? 3 : 0
                }}>
                  {/* Form Header */}
                  <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 4 }}>
                    {isMobile && (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          border: '2px solid rgba(0, 0, 0, 0.1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {companyLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : companyDetails?.logo ? (
                          <Box
                            component="img"
                            src={companyDetails.logo}
                            alt={companyDetails.companyName}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'contain',
                              borderRadius: '50%'
                            }}
                          />
                        ) : (
                          <AdminPanelSettings
                            sx={{
                              fontSize: 32,
                              color: '#1e3a8a'
                            }}
                          />
                        )}
                      </Box>
                    )}

                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: 'text.primary',
                        letterSpacing: '-0.5px',
                        fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem'
                      }}
                    >
                      {companyDetails?.companyName || 'CIIS NETWORK'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        mb: isMobile ? 2 : 3,
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
                      {isMobile ? 'Super Admin Login' : 'Access the master control panel'}
                    </Typography>
                  </Box>

                  {/* Error Alert */}
                  {errors.general && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        fontSize: isMobile ? '0.875rem' : '0.9rem'
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
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: isMobile ? '0.9rem' : '1rem',
                          '&:hover fieldset': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined 
                              fontSize={isMobile ? "small" : "medium"} 
                              color="action" 
                            />
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
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: isMobile ? '0.9rem' : '1rem',
                          '&:hover fieldset': {
                            borderColor: 'primary.main'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined 
                              fontSize={isMobile ? "small" : "medium"} 
                              color="action" 
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {showPassword ? 
                                <VisibilityOff fontSize={isMobile ? "small" : "medium"} /> : 
                                <Visibility fontSize={isMobile ? "small" : "medium"} />
                              }
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
                        py: isMobile ? 1 : 1.5,
                        borderRadius: 2,
                        fontSize: isMobile ? '0.9rem' : '1rem',
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
                          <CircularProgress 
                            size={isMobile ? 16 : 20} 
                            color="inherit" 
                          />
                        ) : (
                          <LoginIcon fontSize={isMobile ? "small" : "medium"} />
                        )
                      }
                    >
                      {loading ? 'Logging in...' : 'Login as Super Admin'}
                    </Button>

                    {/* Mobile Features Button */}
                    {isMobile && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                          mt: 2,
                          py: 1,
                          borderRadius: 2,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderColor: '#1e3a8a',
                          color: '#1e3a8a',
                          '&:hover': {
                            borderColor: '#3730a3',
                            backgroundColor: 'rgba(30, 58, 138, 0.04)'
                          }
                        }}
                        startIcon={<AdminPanelSettings fontSize="small" />}
                      >
                        View Features
                      </Button>
                    )}

                    {/* Regular Login Link */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }}
                      >
                        Regular company login?{' '}
                        <Link
                          href="/"
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
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

                  {/* Terms & Privacy - Smaller on mobile */}
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.disabled',
                        lineHeight: 1.5,
                        display: 'block',
                        fontSize: isMobile ? '0.7rem' : '0.75rem'
                      }}
                    >
                      By signing in, you agree to our{' '}
                      <Link href="#" variant="caption" sx={{ 
                        color: 'text.disabled',
                        fontSize: isMobile ? '0.7rem' : '0.75rem'
                      }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" variant="caption" sx={{ 
                        color: 'text.disabled',
                        fontSize: isMobile ? '0.7rem' : '0.75rem'
                      }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Mobile Drawer for Features */}
        {isMobile && <FeaturesDrawer />}
      </Container>
    </Box>
  );
};

export default SuperAdminLogin;