import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Login = () => {
 const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

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
  
  // Forget password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // email, otp, reset
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  // Extract company identifier from URL
  useEffect(() => {
    const extractCompanyIdentifier = () => {
      const path = window.location.pathname;
      
      const match1 = path.match(/\/company\/([^/]+)\/login/);
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

      return null;
    };

    const identifier = extractCompanyIdentifier();
    if (identifier) {
      setCompanyIdentifier(identifier);
      fetchCompanyDetails(identifier);
    } else {
      setCompanyLoading(false);
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
        companyCode: companyIdentifier || null
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
        localStorage.setItem('companyCode', companyIdentifier);
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

  // Forget Password Handlers
  const handleForgotPassword = async () => {
  if (!forgotPasswordEmail.trim()) {
    setErrors({ forgotPassword: 'Email is required' });
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post('/auth/forgot-password', {
      email: forgotPasswordEmail
    });

    if (response.data.success) {
      toast.success('OTP sent to your email!');
      setForgotPasswordStep('reset'); // direct reset step
    }

  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to send OTP');
  } finally {
    setLoading(false);
  }
};

  const handleResetPassword = async () => {

  if (!otpCode || otpCode.length !== 6) {
    setErrors({ otp: 'Enter valid 6-digit OTP' });
    return;
  }

  if (!newPassword || newPassword.length < 6) {
    setErrors({ newPassword: 'Password must be at least 6 characters' });
    return;
  }

  if (newPassword !== confirmPassword) {
    setErrors({ confirmPassword: 'Passwords do not match' });
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post('/auth/reset-password', {
      email: forgotPasswordEmail,
      otp: otpCode,
      newPassword: newPassword
    });

    toast.success("Password reset successful!");

    setShowForgotPassword(false);
    setForgotPasswordStep('email');

  } catch (error) {
    toast.error(error.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
  }
};


  // Back to login
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotPasswordEmail('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  // Icons as inline SVG components
  const VisibilityIcon = () => (
    <svg className="ciis-login-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  );

  const VisibilityOffIcon = () => (
    <svg className="ciis-login-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
  );

  const LoginIcon = () => (
    <svg className="ciis-login-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 7L9.6 8.4 12.2 11H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
    </svg>
  );

  const LockIcon = () => (
    <svg className="ciis-login-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg className="ciis-login-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
    </svg>
  );

  const BusinessIcon = () => (
    <svg className="ciis-login-icon" width="48" height="48" viewBox="0 0 24 24" fill="white">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
    </svg>
  );

  const ArrowBackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  );

  const renderForgotPasswordForm = () => {
    switch (forgotPasswordStep) {
      case 'email':
        return (
          <div className="ciis-login-forgot-password">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <button
                onClick={handleBackToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <ArrowBackIcon />
                Back to Login
              </button>
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#333' }}>Forgot Password?</h3>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.9rem' }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </p>

            <div className="ciis-login-input-group">
              <label className="ciis-login-input-label">Email Address</label>
              <div className="ciis-login-input-container">
                <div className="ciis-login-input-icon">
                  <EmailIcon />
                </div>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  disabled={loading}
                  className={`ciis-login-input ${errors.forgotPassword ? 'ciis-login-input-error' : ''}`}
                  placeholder="Enter your registered email"
                />
              </div>
              {errors.forgotPassword && <span className="ciis-login-error-text">{errors.forgotPassword}</span>}
            </div>

            <button
              onClick={handleForgotPassword}
              className="ciis-login-primary-button"
              disabled={loading}
              style={{ marginTop: '16px', width: '100%', padding: '14px' }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        );

      case 'reset':
        return (
          <div className="ciis-login-forgot-password">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <button
                onClick={() => setForgotPasswordStep('email')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <ArrowBackIcon />
                Back
              </button>
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#333' }}>Reset Password</h3>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '0.9rem' }}>
              Create a new password for your account
            </p>

            <div className="ciis-login-input-group">
                <label className="ciis-login-input-label">6-Digit OTP</label>
                <div className="ciis-login-input-container">
                  <div className="ciis-login-input-icon">
                    <LockIcon />
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    className={`ciis-login-input ${errors.otp ? 'ciis-login-input-error' : ''}`}
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
                {errors.otp && <span className="ciis-login-error-text">{errors.otp}</span>}
            </div>
            <div className="ciis-login-input-group">
              <label className="ciis-login-input-label">New Password</label>
              <div className="ciis-login-input-container">
                <div className="ciis-login-input-icon">
                  <LockIcon />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className={`ciis-login-input ${errors.newPassword ? 'ciis-login-input-error' : ''}`}
                  placeholder="Enter new password"
                />
                <div 
                  className="ciis-login-input-adornment"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </div>
              </div>
              {errors.newPassword && <span className="ciis-login-error-text">{errors.newPassword}</span>}
            </div>

            <div className="ciis-login-input-group">
              <label className="ciis-login-input-label">Confirm Password</label>
              <div className="ciis-login-input-container">
                <div className="ciis-login-input-icon">
                  <LockIcon />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className={`ciis-login-input ${errors.confirmPassword ? 'ciis-login-input-error' : ''}`}
                  placeholder="Confirm new password"
                />
                <div 
                  className="ciis-login-input-adornment"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </div>
              </div>
              {errors.confirmPassword && <span className="ciis-login-error-text">{errors.confirmPassword}</span>}
            </div>

            {errors.reset && (
              <div style={{ color: '#f44336', fontSize: '0.875rem', marginBottom: '12px' }}>
                {errors.reset}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              className="ciis-login-primary-button"
              disabled={loading || !newPassword || !confirmPassword}
              style={{ marginTop: '16px', width: '100%', padding: '14px' }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ciis-login-container">
      <style>{`
        .ciis-login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
         
        }

        .ciis-login-paper {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          background: white;
          max-width: 900px;
          width: 100%;
          min-height: 600px;
          display: flex;
        }

        .ciis-login-left {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          flex: 0 0 40%;
        }

        .ciis-login-left-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.3;
        }

        .ciis-login-left-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }

        .ciis-login-logo-container {
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .ciis-login-logo {
          padding: 8px;
          object-fit: cover;
        }

        .ciis-login-company-name {
          font-family: 'Oswald', sans-serif;
          font-size: 2.125rem;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          color: white;
        }

        .ciis-login-company-subtitle {
          opacity: 0.9;
          letter-spacing: 0.5px;
          font-size: 0.875rem;
          color: white;
        }

        .ciis-login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 48px;
        }

        .ciis-login-form-container {
          max-width: 400px;
          margin: 0 auto;
          width: 100%;
        }

        .ciis-login-form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .ciis-login-form-title {
          font-size: 2.125rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #333;
          letter-spacing: -0.5px;
        }

        .ciis-login-form-subtitle {
          color: #666;
          margin-bottom: 24px;
          font-size: 1rem;
        }

        .ciis-login-error-alert {
          background-color: #fdeded;
          color: #5f2120;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border: 1px solid #f5c6cb;
          display: flex;
          align-items: center;
        }

        .ciis-login-error-icon {
          margin-right: 12px;
          display: flex;
          align-items: center;
        }

        .ciis-login-input-group {
          margin-bottom: 16px;
        }

        .ciis-login-input-label {
          display: block;
          margin-bottom: 6px;
          color: #333;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .ciis-login-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ciis-login-input {
          width: 100%;
          padding: 12px 16px;
          padding-left: 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .ciis-login-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .ciis-login-input-error {
          border-color: #f44336;
        }

        .ciis-login-input-error:focus {
          border-color: #f44336;
          box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
        }

        .ciis-login-input-icon {
          position: absolute;
          left: 12px;
          color: #777;
        }

        .ciis-login-input-adornment {
          position: absolute;
          right: 12px;
          cursor: pointer;
          color: #777;
        }

        .ciis-login-error-text {
          color: #f44336;
          font-size: 0.75rem;
          margin-top: 4px;
          display: block;
        }

        .ciis-login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4);
        }

        .ciis-login-button:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a3a9a 100%);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .ciis-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ciis-login-button-icon {
          margin-right: 8px;
          display: flex;
          align-items: center;
        }

        .ciis-login-spinner {
          animation: ciis-spin 1s linear infinite;
        }

        @keyframes ciis-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ciis-login-terms {
          margin-top: 32px;
          text-align: center;
          color: #999;
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .ciis-login-link {
          color: #999;
          text-decoration: none;
        }

        .ciis-login-link:hover {
          text-decoration: underline;
        }

        .ciis-login-two-factor-buttons {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .ciis-login-secondary-button {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid #667eea;
          color: #667eea;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .ciis-login-secondary-button:hover {
          background-color: rgba(102, 126, 234, 0.1);
        }

        .ciis-login-primary-button {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4);
        }

        .ciis-login-primary-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a3a9a 100%);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .ciis-login-primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ciis-login-fade-in {
          animation: ciis-fade-in 0.5s ease-in-out;
        }

        @keyframes ciis-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .ciis-login-paper {
            flex-direction: column;
            min-height: auto;
          }

          .ciis-login-left {
            padding: 32px 24px;
            flex: none;
            min-height: 250px;
          }

          .ciis-login-right {
            padding: 32px 24px;
          }

          .ciis-login-form-title {
            font-size: 1.75rem;
          }

          .ciis-login-company-name {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .ciis-login-container {
            padding: 8px;
          }

          .ciis-login-left {
            padding: 24px 16px;
          }

          .ciis-login-right {
            padding: 24px 16px;
          }

          .ciis-login-logo-container {
            width: 100px;
            height: 100px;
            margin-bottom: 24px;
          }

          .ciis-login-logo {
            width: 60px;
            height: 60px;
          }

          .ciis-login-two-factor-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="ciis-login-paper ciis-login-fade-in">
        {/* LEFT SECTION - Company Branding */}
        <div className="ciis-login-left">
          <div className="ciis-login-left-pattern"></div>
          
          <div className="ciis-login-left-content">
            {/* Company Logo */}
            <div className="ciis-login-logo-container" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }} title="Go to Dashboard">
              {companyLoading ? (
                <div style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                  <div className="ciis-login-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}></div>
                </div>
              ) : companyDetails?.logo ? (
                <img 
                  src={companyDetails.logo} 
                  alt={companyDetails.companyName} 
                  className="ciis-login-logo"
                />
              ) : (
                <BusinessIcon />
              )}
            </div>

            {/* Company Name */}
            <h1 className="ciis-login-company-name">
              {companyLoading ? 'Loading...' : (companyDetails?.companyName || 'CIIS NETWORK')}
            </h1>

            <p className="ciis-login-company-subtitle">
              Secure Enterprise Portal
            </p>
          </div>
        </div>

        {/* RIGHT SECTION - Login/Forget Password Form */}
        <div className="ciis-login-right">
          <div className="ciis-login-form-container">
            {showForgotPassword ? (
              // Forget Password Forms
              renderForgotPasswordForm()
            ) : (
              // Login or 2FA Form
              <>
                {/* Form Header */}
                <div className="ciis-login-form-header">
                  <h2 className="ciis-login-form-title">
                    {twoFactorRequired ? 'Two-Factor Authentication' : 'Welcome Back'}
                  </h2>
                  <p className="ciis-login-form-subtitle">
                    {twoFactorRequired
                      ? 'Enter the code from your authenticator app'
                      : `Sign in to ${companyDetails?.companyName || 'CIIS NETWORK'}`}
                  </p>
                </div>

                {/* Error Alert */}
                {errors.general && (
                  <div className="ciis-login-error-alert">
                    <div className="ciis-login-error-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f2120">
                        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      </svg>
                    </div>
                    {errors.general}
                  </div>
                )}

                {/* Login Form */}
                {!twoFactorRequired ? (
                  <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="ciis-login-input-group">
                      <label className="ciis-login-input-label">Email Address</label>
                      <div className="ciis-login-input-container">
                        <div className="ciis-login-input-icon">
                          <EmailIcon />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="email"
                          className={`ciis-login-input ${errors.email ? 'ciis-login-input-error' : ''}`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {errors.email && <span className="ciis-login-error-text">{errors.email}</span>}
                    </div>

                    {/* Password Input */}
                    <div className="ciis-login-input-group">
                      <label className="ciis-login-input-label">Password</label>
                      <div className="ciis-login-input-container">
                        <div className="ciis-login-input-icon">
                          <LockIcon />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="current-password"
                          className={`ciis-login-input ${errors.password ? 'ciis-login-input-error' : ''}`}
                          placeholder="Enter your password"
                        />
                        <div 
                          className="ciis-login-input-adornment"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </div>
                      </div>
                      {errors.password && <span className="ciis-login-error-text">{errors.password}</span>}
                    </div>

                    {/* Forgot Password Link */}
                    <div style={{ textAlign: 'right', marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: '#667eea',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </span>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      className="ciis-login-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="ciis-login-button-icon">
                            <div className="ciis-login-spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}></div>
                          </div>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <div className="ciis-login-button-icon">
                            <LoginIcon />
                          </div>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Two-Factor Authentication Form */
                  <div>
                    <div className="ciis-login-input-group">
                      <label className="ciis-login-input-label">Enter 6-digit code</label>
                      <div className="ciis-login-input-container">
                        <div className="ciis-login-input-icon">
                          <LockIcon />
                        </div>
                        <input
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setTwoFactorCode(value);
                            if (errors.twoFactor) {
                              setErrors((prev) => ({ ...prev, twoFactor: '' }));
                            }
                          }}
                          disabled={loading}
                          className={`ciis-login-input ${errors.twoFactor ? 'ciis-login-input-error' : ''}`}
                          placeholder="Enter authentication code"
                        />
                      </div>
                      {errors.twoFactor && <span className="ciis-login-error-text">{errors.twoFactor}</span>}
                    </div>

                    <div className="ciis-login-two-factor-buttons">
                      <button
                        className="ciis-login-secondary-button"
                        onClick={() => setTwoFactorRequired(false)}
                        disabled={loading}
                      >
                        Back
                      </button>

                      <button
                        className="ciis-login-primary-button"
                        onClick={handleTwoFactorSubmit}
                        disabled={loading || twoFactorCode.length !== 6}
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'center', color: '#666' }}>
                      <small>
                        Having trouble?{' '}
                        <a href="#" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
                          Resend code
                        </a>
                      </small>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Terms & Privacy - Only show for login, not for forget password */}
            {!showForgotPassword && (
              <div className="ciis-login-terms">
                By signing in, you agree to our{' '}
                <a href="#" className="ciis-login-link">Terms of Service</a> and{' '}
                <a href="#" className="ciis-login-link">Privacy Policy</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;