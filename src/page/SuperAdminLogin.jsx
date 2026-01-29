import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/super-admin/login`, formData);
      
      if (response.data.success) {
        // Save super admin data to localStorage
        localStorage.setItem('superAdmin', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.token);
        
        toast.success('Login successful! Redirecting...');
        
        // Redirect to super admin dashboard immediately
        navigate('/super-admin/dashboard');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Super Admin Login</h2>
          <p style={styles.subtitle}>Access the master control panel</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Logging in...
              </>
            ) : (
              'Login as Super Admin'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Regular company login?{' '}
            <Link to="/" style={styles.link}>
              Go to Home
            </Link>
          </p>
        </div>
      </div>

      <div style={styles.infoBox}>
        <h3>Super Admin Features:</h3>
        <ul style={styles.featuresList}>
          <li>📊 Manage all companies</li>
          <li>👥 View all users across companies</li>
          <li>⚙️ System configuration</li>
          <li>📈 Analytics and reports</li>
          <li>🔐 Master access control</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    zIndex: 2
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: '#333',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#444'
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s',
    outline: 'none'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  footerText: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  },
  infoBox: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    padding: '30px',
    marginLeft: '30px',
    width: '100%',
    maxWidth: '300px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  }
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
`;
document.head.appendChild(style);

export default SuperAdminLogin;