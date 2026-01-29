import { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  LockOutlined,
  EmailOutlined
} from '@mui/icons-material';
import axios from '../utils/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated } = useAuth();

  // ✅ Use refs to prevent cursor jump
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const currentInputRef = useRef(null);
  const cursorPositionRef = useRef(0);
  const formRef = useRef(form);

  // Update form ref whenever form changes
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    if (location.state?.fromRegister) {
      toast.success("Registration successful! Please login.");
    }

    // Handle mouse move for parallax effect
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 20 - 10;
      const y = (e.clientY / window.innerHeight) * 20 - 10;
      setBgPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [location.state]);

  // ✅ Restore cursor position after render
  useEffect(() => {
    if (currentInputRef.current && cursorPositionRef.current !== null) {
      const input = currentInputRef.current;
      const position = cursorPositionRef.current;
      
      // Use requestAnimationFrame for smoother cursor restoration
      requestAnimationFrame(() => {
        if (document.activeElement !== input) {
          input.focus();
        }
        input.setSelectionRange(position, position);
      });
      
      // Reset refs
      currentInputRef.current = null;
      cursorPositionRef.current = 0;
    }
  });

  // ✅ FIXED: Optimized handleChange to prevent cursor jump
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Save current focused element and cursor position
    currentInputRef.current = e.target;
    cursorPositionRef.current = e.target.selectionStart;
    
    // Update form state immediately
    setForm(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // ✅ Add onBlur handler to save cursor position
  const handleBlur = useCallback((e) => {
    currentInputRef.current = e.target;
    cursorPositionRef.current = e.target.selectionStart;
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const currentForm = formRef.current;
    
    if (!currentForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!currentForm.password) {
      newErrors.password = 'Password is required';
    } else if (currentForm.password.length < 6) {
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
      const res = await axios.post('/auth/login', formRef.current);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate(location.state?.from || '/cds/user-dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
      
      // Set general error
      setErrors(prev => ({ ...prev, general: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Enter key press for better UX
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  }, [loading]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -10,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(135deg, 
              rgba(101, 0, 163, 0.15) 0%, 
              rgba(41, 121, 255, 0.15) 30%, 
              rgba(0, 212, 255, 0.15) 70%, 
              rgba(101, 0, 163, 0.15) 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(101, 0, 163, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(41, 121, 255, 0.08) 0%, transparent 50%),
            linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)
          `,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          transform: `translate(${bgPosition.x}px, ${bgPosition.y}px)`,
          transition: 'transform 0.3s ease-out',
          zIndex: 0,
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 15% 50%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
            radial-gradient(circle at 85% 30%, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
            radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.4) 2px, transparent 2px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.3,
          zIndex: 0,
        }
      }}
    >
      {/* Animated floating elements */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            background: `linear-gradient(45deg, 
              rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, 0.1),
              rgba(${Math.random() * 100 + 155}, 100, 255, 0.05)
            )`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 20 + 20}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            filter: 'blur(20px)',
            zIndex: 0,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: `translateY(${Math.random() * 100 - 50}px) rotate(${Math.random() * 180 - 90}deg)` }
            }
          }}
        />
      ))}

      <Container 
        component="main" 
        maxWidth="xs"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 4 },
              width: '100%',
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                0 8px 32px rgba(25, 118, 210, 0.15)
              `,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                borderRadius: '4px 4px 0 0',
              }
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                <LockOutlined sx={{ fontSize: 36 }} />
              </Avatar>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.875rem', sm: '2.25rem' },
                  letterSpacing: '-0.5px'
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                  fontWeight: 400
                }}
              >
                Sign in to continue to your dashboard
              </Typography>
            </Box>

            {errors.general && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
                }}
                onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
              >
                {errors.general}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                inputRef={emailInputRef}
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                error={!!errors.email}
                helperText={errors.email}
                required
                autoComplete="email"
                autoFocus
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
                    },
                    '&.Mui-focused': {
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
                      }
                    }
                  }
                }}
              />

              <TextField
                inputRef={passwordInputRef}
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                error={!!errors.password}
                helperText={errors.password}
                required
                autoComplete="current-password"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="toggle password visibility"
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
                    },
                    '&.Mui-focused': {
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
                      }
                    }
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.75,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  mb: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                    '&::before': {
                      transform: 'translateX(100%)'
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    transition: 'transform 0.6s ease'
                  }
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                <Grid item>
                  <Link
                    href="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: 'primary.dark',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href="/register"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: 'primary.dark',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Don't have an account? Sign up
                  </Link>
                </Grid>
              </Grid>
            </form>

            {/* Version info */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 3,
                pt: 2,
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'text.disabled',
                fontSize: '0.75rem'
              }}
            >
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 