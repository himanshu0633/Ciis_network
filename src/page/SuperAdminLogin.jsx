import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { toast } from 'react-toastify';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

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
      const response = await axios.post(`${API_URL}/superAdmin/login`, form);
      
      if (response.data.success) {
        localStorage.setItem('superAdmin', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('company', JSON.stringify(response.data.data));

        toast.success('Login successful! Redirecting...');
        navigate('/Ciis-network/company-details');
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

  const AdminPanelIcon = () => (
    <svg className="ciis-login-icon" width="48" height="48" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );

  const PeopleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm8 6h-3v-3c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3h-3v-6h-2v6h-3v-3c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3H1v2h22v-2zm-4 0h-3v-3h3v3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );

  const SecurityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  );

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
          max-width: 1000px;
          width: 100%;
          min-height: 600px;
          display: flex;
        }

        .ciis-login-left {
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          position: relative;
          overflow: hidden;
          flex: 0 0 45%;
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
          width: 100%;
        }

        .ciis-login-logo-container {
          width: 120px;
          height: 120px;
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
          margin-bottom: 24px;
        }

        .ciis-login-features-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 16px;
          width: 100%;
          text-align: left;
          margin-top: 16px;
        }

        .ciis-login-features-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .ciis-login-feature-item {
          display: flex;
          align-items: center;
          padding: 4px 0;
        }

        .ciis-login-feature-icon {
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ciis-login-feature-text {
          color: white;
          font-size: 0.9rem;
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

        .ciis-login-form-logo {
          display: none;
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

        .ciis-login-link-text {
          margin-top: 24px;
          text-align: center;
          color: #666;
          font-size: 0.875rem;
        }

        .ciis-login-link {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }

        .ciis-login-link:hover {
          text-decoration: underline;
        }

        .ciis-login-terms {
          margin-top: 32px;
          text-align: center;
          color: #999;
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .ciis-login-terms-link {
          color: #999;
          text-decoration: none;
        }

        .ciis-login-terms-link:hover {
          text-decoration: underline;
        }

        .ciis-login-fade-in {
          animation: ciis-fade-in 0.5s ease-in-out;
        }

        @keyframes ciis-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Desktop styles */
        @media (min-width: 901px) {
          .ciis-login-right-mobile-logo {
            display: none;
          }
        }

        /* Responsive styles */
        @media (max-width: 900px) {
          .ciis-login-paper {
            flex-direction: column;
            min-height: auto;
            max-width: 500px;
          }

          .ciis-login-left {
            padding: 32px 24px;
            flex: none;
            min-height: auto;
            display: none; /* Hide left section on mobile */
          }

          .ciis-login-right {
            padding: 32px 24px;
          }

          .ciis-login-form-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 32px;
          }

          .ciis-login-form-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
          }

          .ciis-login-mobile-logo {
            width: 100px;
            height: 100px;
            border-radius: 12px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          .ciis-login-mobile-logo svg {
            width: 48px;
            height: 48px;
          }

          .ciis-login-form-title {
            font-size: 1.75rem;
            margin-bottom: 4px;
          }

          .ciis-login-form-subtitle {
            font-size: 0.95rem;
            margin-bottom: 16px;
          }
        }

        @media (max-width: 480px) {
          .ciis-login-container {
            padding: 8px;
          }

          .ciis-login-right {
            padding: 24px 20px;
          }

          .ciis-login-mobile-logo {
            width: 80px;
            height: 80px;
          }

          .ciis-login-mobile-logo svg {
            width: 40px;
            height: 40px;
          }

          .ciis-login-form-title {
            font-size: 1.5rem;
          }

          .ciis-login-form-subtitle {
            font-size: 0.875rem;
          }

          .ciis-login-input {
            padding: 10px 16px;
            padding-left: 40px;
            font-size: 0.95rem;
          }

          .ciis-login-button {
            padding: 12px;
            font-size: 0.95rem;
          }

          .ciis-login-terms {
            margin-top: 24px;
          }
        }

        @media (max-width: 360px) {
          .ciis-login-right {
            padding: 20px 16px;
          }

          .ciis-login-mobile-logo {
            width: 70px;
            height: 70px;
          }

          .ciis-login-mobile-logo svg {
            width: 35px;
            height: 35px;
          }

          .ciis-login-form-title {
            font-size: 1.35rem;
          }
        }
      `}</style>

      <div className="ciis-login-paper ciis-login-fade-in">
        {/* LEFT SECTION - Super Admin Features (Hidden on mobile) */}
        <div className="ciis-login-left">
          <div className="ciis-login-left-pattern"></div>
          
          <div className="ciis-login-left-content">
            {/* Super Admin Icon */}
            <div className="ciis-login-logo-container">
              <AdminPanelIcon />
            </div>

            {/* Super Admin Title */}
            <h1 className="ciis-login-company-name">
              CIIS NETWORK
            </h1>

            <p className="ciis-login-company-subtitle">
              Super Admin Portal
            </p>

            {/* Features List */}
            <div className="ciis-login-features-card">
              <h3 className="ciis-login-features-title">
                Super Admin Features:
              </h3>
              
              <div className="ciis-login-feature-item">
                <div className="ciis-login-feature-icon">
                  <DashboardIcon />
                </div>
                <span className="ciis-login-feature-text">📊 Manage all companies</span>
              </div>
              
              <div className="ciis-login-feature-item">
                <div className="ciis-login-feature-icon">
                  <PeopleIcon />
                </div>
                <span className="ciis-login-feature-text">👥 View all users across companies</span>
              </div>
              
              <div className="ciis-login-feature-item">
                <div className="ciis-login-feature-icon">
                  <SettingsIcon />
                </div>
                <span className="ciis-login-feature-text">⚙️ System configuration</span>
              </div>
              
              <div className="ciis-login-feature-item">
                <div className="ciis-login-feature-icon">
                  <AnalyticsIcon />
                </div>
                <span className="ciis-login-feature-text">📈 Analytics and reports</span>
              </div>
              
              <div className="ciis-login-feature-item">
                <div className="ciis-login-feature-icon">
                  <SecurityIcon />
                </div>
                <span className="ciis-login-feature-text">🔐 Master access control</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Login Form */}
        <div className="ciis-login-right">
          <div className="ciis-login-form-container">
            {/* Form Header - With Logo on Mobile */}
            <div className="ciis-login-form-header">
              {/* Mobile Logo - Only visible on mobile */}
              <div className="ciis-login-form-logo">
                <div className="ciis-login-mobile-logo">
                  <AdminPanelIcon />
                </div>
              </div>
              
              <h2 className="ciis-login-form-title">
                CIIS NETWORK
              </h2>
              <p className="ciis-login-form-subtitle">
                Access the master control panel
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
                    placeholder="Enter super admin email"
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
                    Logging in...
                  </>
                ) : (
                  <>
                    <div className="ciis-login-button-icon">
                      <LoginIcon />
                    </div>
                    Login as Super Admin
                  </>
                )}
              </button>

              {/* Regular Login Link */}
              <div className="ciis-login-link-text">
                Regular company login?{' '}
                <a 
                  href="/" 
                  className="ciis-login-link"
                >
                  Go to Home
                </a>
              </div>
            </form>

            {/* Terms & Privacy */}
            <div className="ciis-login-terms">
              By signing in, you agree to our{' '}
              <a href="#" className="ciis-login-terms-link">Terms of Service</a> and{' '}
              <a href="#" className="ciis-login-terms-link">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;