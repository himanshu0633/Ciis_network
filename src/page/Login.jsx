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
  Business,
  Person,
  LocationOn,
  Phone
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
    
    // Pattern 1: /company/{identifier}/login
    const match1 = path.match(/\/company\/([^/]+)\/login/);
    if (match1 && match1[1]) {
      console.log('✅ Extracted identifier from /company/{id}/login:', match1[1]);
      return match1[1];
    }

    // Pattern 2: /company/{identifier}
    const match2 = path.match(/\/company\/([^/]+)/);
    if (match2 && match2[1]) {
      console.log('✅ Extracted identifier from /company/{id}:', match2[1]);
      return match2[1];
    }

    // Pattern 3: Check URL segments
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
        companyName: 'Company Portal',
        logo: null,
        ownerName: 'Administrator'
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
      const loginData = {
        ...form,
        companyIdentifier: companyIdentifier || null
      };

      const res = await axios.post('/auth/login', loginData);

      if (res.data.requiresTwoFactor) {
        setTwoFactorRequired(true);
        toast.info('Two-factor authentication required');
        return;
      }

      // Save token
      localStorage.setItem('token', res.data.token);

      // Save user data
      const userData = res.data.user;
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      // Save company identifier
      if (companyIdentifier) {
        localStorage.setItem('companyIdentifier', companyIdentifier);
      }

      if (companyDetails) {
        localStorage.setItem('companyDetails', JSON.stringify(companyDetails));
      }

      toast.success("Login successful!");

      // Redirect based on role
      const redirectPath =
        userData.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);

      let errorMsg = 'Login failed. Please try again.';
      let shouldRetry = false;

      if (err.response?.data) {
        const { errorCode, message, remainingAttempts } = err.response.data;

        errorMsg = message;

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
            if (remainingAttempts) {
              errorMsg += ` ${remainingAttempts} attempts remaining.`;
              shouldRetry = remainingAttempts > 0;
            }
            break;

          case 'COMPANY_NOT_FOUND':
            errorMsg = 'Company not found. Please check your URL.';
            break;

          default:
            break;
        }
      }

      toast.error(errorMsg);
      setErrors((prev) => ({ ...prev, general: errorMsg, shouldRetry }));
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
      navigate('/dashboard');
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
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          {/* Company Details Card */}
          {companyDetails && (
            <Grid item xs={12} md={5}>
              <Fade in={!companyLoading}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%' }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      {companyDetails.logo ? (
                        <Box
                          component="img"
                          src={companyDetails.logo}
                          alt={companyDetails.companyName}
                          sx={{
                            width: 120,
                            height: 120,
                            margin: '0 auto 20px',
                            borderRadius: 2,
                            objectFit: 'contain',
                            p: 2,
                            backgroundColor: 'white',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            margin: '0 auto 20px',
                            background:
                              'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                            boxShadow: '0 8px 16px rgba(76,175,80,0.3)'
                          }}
                        >
                          <Business sx={{ fontSize: 48 }} />
                        </Avatar>
                      )}

                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                        {companyDetails.companyName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {companyDetails.companyEmail}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                      {companyDetails.ownerName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Person color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Owner
                            </Typography>
                            <Typography variant="body2">{companyDetails.ownerName}</Typography>
                          </Box>
                        </Box>
                      )}

                      {companyDetails.companyPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Phone color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body2">{companyDetails.companyPhone}</Typography>
                          </Box>
                        </Box>
                      )}

                      {companyDetails.companyAddress && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <LocationOn color="primary" sx={{ mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body2">{companyDetails.companyAddress}</Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', textAlign: 'center' }}
                    >
                      Secure enterprise portal • {new Date().getFullYear()}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          )}

          {/* Login Form Card */}
          <Grid item xs={12} md={7}>
            <Fade in>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      margin: '0 auto 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    <LockOutlined sx={{ fontSize: 36 }} />
                  </Avatar>

                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    {twoFactorRequired ? 'Two-Factor Authentication' : 'Welcome Back'}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    {twoFactorRequired
                      ? 'Enter the code from your authenticator app'
                      : companyDetails
                      ? `Sign in to ${companyDetails.companyName}`
                      : 'Sign in to continue'}
                  </Typography>
                </Box>

                {errors.general && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errors.general}
                  </Alert>
                )}

                {!twoFactorRequired ? (
                  <form onSubmit={handleSubmit}>
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined color="action" />
                          </InputAdornment>
                        )
                      }}
                    />

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
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />

                    {/* ✅ Remember Me Removed - Only Forgot Password */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Link
                        href={`${window.location.pathname.replace('/login', '/forgot-password')}`}
                        variant="body2"
                      >
                        Forgot password?
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        mt: 3,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Link
                        href={`${window.location.pathname.replace('/login', '/register')}`}
                        variant="body2"
                      >
                        Don't have an account? Sign up
                      </Link>
                    </Box>
                  </form>
                ) : (
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined color="action" />
                          </InputAdornment>
                        )
                      }}
                    />

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setTwoFactorRequired(false)}
                        disabled={loading}
                      >
                        Back
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleTwoFactorSubmit}
                        disabled={loading || twoFactorCode.length !== 6}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2, textAlign: 'center' }}
                    >
                      Having trouble? <Link href="#" variant="body2">Resend code</Link>
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.disabled">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
