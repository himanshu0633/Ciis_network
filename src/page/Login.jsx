import React, { useState, useEffect } from 'react';
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
  Avatar,
  Fade,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  LockOutlined,
  EmailOutlined,
  Business
} from '@mui/icons-material';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyIdentifier, setCompanyIdentifier] = useState('');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  // Extract company identifier from URL
  useEffect(() => {
    const extractCompanyIdentifier = () => {
      const path = window.location.pathname;
      console.log('🔗 Current path:', path);
      
      const match1 = path.match(/\/company\/([^/]+)\/login/);
      if (match1 && match1[1]) {
        console.log('✅ Extracted identifier from /company/{id}/login:', match1[1]);
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

      console.log('⚠️ No company identifier found in URL');
      return null;
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
      const response = await axios.get(`/company/details/${identifier}`);

      if (response.data.success) {
        setCompanyDetails(response.data.company);
        document.title = `${response.data.company.companyName} - Login`;
      }
    } catch (error) {
      console.error('Error fetching company details:', error);

      if (error.response?.status === 404) {
        toast.error('Company not found. Please check the URL.');
      } else if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Company account is not active');
      }

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

    if (twoFactorRequired && !twoFactorCode) {
      newErrors.twoFactor = 'Two-factor code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);

  try {
    // Create login data with correct field names
    const loginData = {
      email: form.email.trim(),
      password: form.password,
      companyCode: companyIdentifier || null  // Changed from companyIdentifier to companyCode
    };

    console.log('Login attempt:', {
      email: loginData.email,
      companyCode: loginData.companyCode,
      timestamp: new Date().toISOString()
    });

    const res = await axios.post('/auth/login', loginData);

    if (res.data.requiresTwoFactor) {
      setTwoFactorRequired(true);
      toast.info('Two-factor authentication required');
      return;
    }

    // Save token
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    // Save user data
    if (res.data.user) {
      const userData = res.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    }

    // Save company info
    if (companyIdentifier) {
      localStorage.setItem('companyIdentifier', companyIdentifier);
      localStorage.setItem('companyCode', companyIdentifier); // Also save as companyCode for consistency
    }

    if (companyDetails) {
      localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
    }

    toast.success("Login successful!");

    // Check for redirect path in response or use default
    let redirectPath = '/ciisUser/user-dashboard';
    
    if (res.data.redirectTo) {
      redirectPath = res.data.redirectTo;
    } else if (res.data.user?.role) {
      redirectPath = res.data.user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/ciisUser/user-dashboard';
    }

    console.log('Redirecting to:', redirectPath);
    navigate(redirectPath);
    
  } catch (err) {
    console.error('Login error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: {
        url: err.config?.url,
        data: err.config?.data
      }
    });

    let errorMsg = 'Login failed. Please try again.';
    let shouldRetry = false;

    if (err.response?.data) {
      const { errorCode, message, remainingAttempts } = err.response.data;

      // Use server message if available
      if (message) errorMsg = message;

      switch (errorCode) {
        case 'ACCOUNT_LOCKED':
          const retryAfter = err.response.data.retryAfter;
          const lockTime = new Date(retryAfter).toLocaleTimeString();
          errorMsg = `Account locked until ${lockTime}. Please try again later.`;
          break;

        case 'ACCOUNT_DEACTIVATED':
          errorMsg = 'Your account has been deactivated. Contact your administrator.';
          break;

        case 'SUBSCRIPTION_EXPIRED':
          errorMsg = 'Company subscription has expired. Contact your company admin.';
          break;

        case 'INVALID_CREDENTIALS':
          errorMsg = 'Invalid email or password.';
          if (remainingAttempts !== undefined) {
            errorMsg += ` ${remainingAttempts} attempts remaining.`;
            shouldRetry = remainingAttempts > 0;
          }
          break;

        case 'COMPANY_NOT_FOUND':
          errorMsg = 'Company not found. Please check your URL.';
          break;

        case 'USER_NOT_FOUND':
          errorMsg = 'No account found with this email.';
          break;

        case 'INVALID_COMPANY_CODE':
          errorMsg = 'Invalid company code. Please check the URL.';
          break;

        default:
          // For generic 401 error
          if (err.response.status === 401) {
            errorMsg = 'Invalid credentials. Please check your email and password.';
          }
          break;
      }
    } else if (err.code === 'ERR_NETWORK') {
      errorMsg = 'Network error. Please check your connection.';
    }

    toast.error(errorMsg);
    setErrors((prev) => ({ 
      ...prev, 
      general: errorMsg, 
      shouldRetry 
    }));
    
  } finally {
    setLoading(false);
  }
};

  const handleTwoFactorSubmit = async () => {
    if (!twoFactorCode.trim()) {
      setErrors((prev) => ({ ...prev, twoFactor: 'Two-factor code is required' }));
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/auth/verify-2fa', {
        email: form.email,
        code: twoFactorCode
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setUser(res.data.user);
      setIsAuthenticated(true);

      toast.success("Two-factor authentication successful!");
      navigate('/ciisUser/user-dashboard');
    } catch (err) {
      toast.error('Invalid two-factor code. Please try again.');
      setTwoFactorCode('');
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
            <Grid container sx={{ minHeight: '600px' }}>
              {/* LEFT SECTION - Company Branding */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
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
                    color: 'white'
                  }}
                >
                  {/* Company Logo */}
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
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Business
                        sx={{
                          fontSize: 48,
                          color: 'white'
                        }}
                      />
                    )}
                  </Box>

                  {/* Company Name */}
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
                      letterSpacing: '0.5px'
                    }}
                  >
                    Secure Enterprise Portal
                  </Typography>
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
                <Box sx={{ maxWidth: '400px', mx: 'auto', width: '100%' }}>
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
                      {twoFactorRequired ? 'Two-Factor Authentication' : 'Welcome Back'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        mb: 3
                      }}
                    >
                      {twoFactorRequired
                        ? 'Enter the code from your authenticator app'
                        : `Sign in to ${companyDetails?.companyName || 'CIIS NETWORK'}`}
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
                  {!twoFactorRequired ? (
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

                      {/* Forgot Password Link */}
                      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Link
                          href={`${window.location.pathname.replace('/login', '/forgot-password')}`}
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Forgot password?
                        </Link>
                      </Box> */}

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
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>

                      {/* Sign Up Link */}
                      {/* <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Don't have an account?{' '}
                          <Link
                            href={`${window.location.pathname.replace('/login', '/register')}`}
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
                            Sign up
                          </Link>
                        </Typography>
                      </Box> */}
                    </form>
                  ) : (
                    /* Two-Factor Authentication Form */
                    <Box>
                      <TextField
                        fullWidth
                        label="Enter 6-digit code"
                        value={twoFactorCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setTwoFactorCode(value);
                          if (errors.twoFactor) {
                            setErrors((prev) => ({ ...prev, twoFactor: '' }));
                          }
                        }}
                        error={!!errors.twoFactor}
                        helperText={errors.twoFactor}
                        disabled={loading}
                        margin="normal"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined color="action" />
                            </InputAdornment>
                          )
                        }}
                      />

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setTwoFactorRequired(false)}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Back
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleTwoFactorSubmit}
                          disabled={loading || twoFactorCode.length !== 6}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3a9a 100%)',
                              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)'
                            }
                          }}
                        >
                          {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          textAlign: 'center',
                          color: 'text.secondary'
                        }}
                      >
                        Having trouble?{' '}
                        <Link href="#" variant="body2" sx={{ fontWeight: 600 }}>
                          Resend code
                        </Link>
                      </Typography>
                    </Box>
                  )}

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

export default Login;