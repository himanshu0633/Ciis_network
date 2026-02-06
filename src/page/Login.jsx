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
      console.log('🔍 Fetching company details for:', identifier);

      const response = await axios.get(`/company/details/${identifier}`);

      if (response.data.success) {
        console.log('✅ Company details fetched:', response.data.company);
        setCompanyDetails(response.data.company);
        document.title = `${response.data.company.companyName} - Login`;
        
        // Store company details in localStorage for future use
        localStorage.setItem('companyDetails', JSON.stringify(response.data.company));
      }
    } catch (error) {
      console.error('❌ Error fetching company details:', error);

      if (error.response?.status === 404) {
        toast.error('Company not found. Please check the URL.');
      } else if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Company account is not active');
      } else {
        toast.error('Failed to load company details. Please try again.');
      }

      // Set fallback company details
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

  // Login.jsx में handleSubmit function update करें
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);

  try {
    console.log('🔐 Login attempt for:', form.email);
    console.log('🏢 Company identifier from URL:', companyIdentifier);

    // ✅ Prepare login data based on what backend accepts
    const loginData = {
      email: form.email.trim(),
      password: form.password
    };

    // ✅ Add companyIdentifier field (backend इसे accept करता है)
    if (companyIdentifier) {
      loginData.companyIdentifier = companyIdentifier;
      // ✅ Optional: companyCode भी भेजें (दोनों में से कोई एक काम करेगा)
      loginData.companyCode = companyIdentifier;
    }

    console.log('📤 Sending login data:', { 
      ...loginData, 
      password: '***' 
    });

    const res = await axios.post('/auth/login', loginData);
    console.log('✅ Login response received:', res.data);

    if (res.data.requiresTwoFactor) {
      setTwoFactorRequired(true);
      toast.info('Two-factor authentication required');
      return;
    }

    // ✅ Save token
    if (!res.data.token) {
      throw new Error('No token received from server');
    }
    
    localStorage.setItem('token', res.data.token);
    console.log('💾 Token saved to localStorage');

    // ✅ Save user data
    const userData = res.data.user;
    if (!userData) {
      throw new Error('No user data received from server');
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('👤 User data saved:', {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      companyCode: userData.companyCode
    });

    // ✅ Save company details from response
    if (res.data.companyDetails) {
      localStorage.setItem('companyDetails', JSON.stringify(res.data.companyDetails));
      console.log('🏢 Company details saved:', res.data.companyDetails);
    }

    // ✅ Set auth context
    setUser(userData);
    setIsAuthenticated(true);

    toast.success("Login successful!");

    
    const storedCompanyCode = res.data.companyDetails?.companyCode;
    const userCompanyCode = userData.companyCode;
    
    if (storedCompanyCode && userCompanyCode) {
      console.log('🔍 Company code check:', {
        stored: storedCompanyCode,
        user: userCompanyCode,
        match: storedCompanyCode === userCompanyCode
      });
    }


    // ✅ Decode token to see payloadu
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔐 Decoded token payload:', payload);
      }
    } catch (decodeError) {
      console.warn('⚠️ Could not decode token:', decodeError);
    }

    // ✅ Redirect logic
    let redirectPath = '/ciisUser/user-dashboard'; // Default
    
    const userRole = userData.role?.name || userData.role || userData.jobRole;
    console.log('🎭 User role detected:', userRole);
    
    if (userRole) {
      const roleLower = userRole.toLowerCase();
      
      if (roleLower.includes('admin') || roleLower.includes('manager')) {
        redirectPath = '/admin/dashboard';
      } else if (roleLower.includes('employee') || roleLower.includes('staff')) {
        redirectPath = '/user/dashboard';
      }
    }

    console.log('🔄 Redirecting to:', redirectPath);
    
    // Small delay to show success message
    setTimeout(() => {
      navigate(redirectPath);
    }, 1000);

  } catch (err) {
    console.error('❌ Login error:', err);
    
    let errorMsg = 'Login failed. Please try again.';
    let shouldRetry = false;

    if (err.response?.data) {
      const { errorCode, message, remainingAttempts, expectedCode } = err.response.data;
      console.log('🔍 Server error response:', err.response.data);

      errorMsg = message || errorMsg;

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

        case 'COMPANY_MISMATCH':
          if (expectedCode) {
            errorMsg = `Invalid company access. You belong to company: ${expectedCode.toUpperCase()}`;
          } else {
            errorMsg = 'User does not belong to this company.';
          }
          break;

        case 'NO_COMPANY':
          errorMsg = 'User is not associated with any company. Contact administrator.';
          break;

        case 'COMPANY_DEACTIVATED':
          errorMsg = 'Company account is deactivated.';
          break;

        default:
          break;
      }
    } else if (err.message) {
      errorMsg = err.message;
    }

    console.error('❌ Login error details:', {
      message: errorMsg,
      status: err.response?.status,
      data: err.response?.data
    });

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
                      
                      <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                        Company Code: {companyDetails.companyCode}
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
                      sx={{ display: 'block', textAlign: 'center', mt: 2 }}
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
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  position: 'relative'
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
                  
                  {companyIdentifier && !companyLoading && (
                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                      Company: {companyIdentifier.toUpperCase()}
                    </Typography>
                  )}
                </Box>

                {errors.general && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    action={
                      errors.shouldRetry && (
                        <Button color="inherit" size="small" onClick={handleSubmit}>
                          Retry
                        </Button>
                      )
                    }
                  >
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
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6c429b 100%)'
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