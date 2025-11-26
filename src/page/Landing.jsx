import React, { useState, useEffect } from 'react';


const App = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const animateCount = (setter, target, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCount(setEmployeeCount, 125);
    animateCount(setAttendanceCount, 3420);
    animateCount(setLeaveCount, 87);
    animateCount(setTaskCount, 64);
    animateCount(setAssetCount, 210);
  }, []);

  const keyFeatures = [
    { title: 'Attendance Management', description: 'Mark IN/OUT, track login/logout, and view total work hours with precision analytics.', image: '📊' },
    { title: 'Leave Management', description: 'Apply, approve, and track employee leaves with automated workflows and notifications.', image: '🏖️' },
    { title: 'Asset Management', description: 'Request and manage company assets with tracking, maintenance alerts, and inventory control.', image: '💻' },
    { title: 'Task Management', description: 'Create, assign, and monitor task progress with real-time status updates and deadlines.', image: '✅' },
    { title: 'System Alerts', description: 'Get instant notifications and important announcements with smart prioritization.', image: '🔔' },
    { title: 'Employee Directory', description: 'View, search, and manage employee profiles with advanced filtering and analytics.', image: '👥' }
  ];

  const stats = [
    { label: 'Employees', value: employeeCount, icon: '👥' },
    { label: 'Attendance Records', value: attendanceCount, icon: '⏰' },
    { label: 'Leaves Processed', value: leaveCount, icon: '🌴' },
    { label: 'Tasks in Progress', value: taskCount, icon: '📋' },
    { label: 'Assets Managed', value: assetCount, icon: '💻' }
  ];

  const benefits = [
    { icon: '🔄', title: 'Real-time Updates', description: 'Instant synchronization across all devices' },
    { icon: '🔒', title: 'Secure Data', description: 'Enterprise-grade security and encryption' },
    { icon: '📱', title: 'User-friendly', description: 'Intuitive interface for all users' },
    { icon: '💻', title: 'Fully Responsive', description: 'Perfect experience on any device' }
  ];

  const adminFeatures = [
    'Manage all employees and departments',
    'Approve leaves and asset requests',
    'Assign tasks and track progress',
    'Generate comprehensive reports and analytics',
    'System configuration and permissions'
  ];

  const employeeFeatures = [
    'Check attendance records and work hours',
    'Apply for leaves with easy workflows',
    'Track assigned tasks and deadlines',
    'Request company assets and resources',
    'Update personal profile and preferences'
  ];

  return (
    <div className="ciis-app">
      {/* Header */}
      <header className="ciis-header">
        <div className="ciis-header-container">
          <div className="ciis-logo-section">
            <div className="ciis-logo-placeholder">
              {/* Logo Image */}
              <img 
                src="/logo.png" 
                alt="CIIS Network Logo" 
                className="ciis-logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback text logo */}
              <div className="ciis-logo-fallback">
                <span className="ciis-logo-text">CIIS NETWORK</span>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="ciis-mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>


          <button className="ciis-login-btn" route="/login">LOGIN</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="ciis-hero">
        <div className="ciis-hero-background">
          <div className="ciis-hero-radial-light-1"></div>
          <div className="ciis-hero-radial-light-2"></div>
          <div className="ciis-hero-floating-shape ciis-floating-1"></div>
          <div className="ciis-hero-floating-shape ciis-floating-2"></div>
          <div className="ciis-hero-floating-shape ciis-floating-3"></div>
        </div>

        <div className="ciis-hero-container">
          <div className="ciis-hero-content">
            <div className="ciis-hero-badge">
              🎯 Enterprise Ready Employee Portal
            </div>
            <h1 className="ciis-hero-title">
              <span className="ciis-hero-main">Smart Employee</span>
              <span className="ciis-hero-subtitle">Management Platform</span>
            </h1>
            <p className="ciis-hero-description">
              Streamline attendance, leaves, assets, and tasks with our intelligent dashboard. 
              Boost productivity with real-time insights and automated workflows designed for modern workplaces.
            </p>
            <div className="ciis-feature-chips">
              <span className="ciis-feature-chip">📊 Attendance Tracking</span>
              <span className="ciis-feature-chip">🌴 Leave Management</span>
              <span className="ciis-feature-chip">💻 Asset Management</span>
              <span className="ciis-feature-chip">✅ Task Automation</span>
            </div>
            <div className="ciis-hero-actions">
              <button className="ciis-hero-btn ciis-primary-btn">
                LOGIN →
              </button>
            </div>
            <div className="ciis-trust-indicators">
              <div className="ciis-trust-item">
                <strong>500+</strong> Companies
              </div>
              <div className="ciis-trust-item">
                <span className="ciis-stars">★★★★★</span> 4.9/5 Rating
              </div>
              <div className="ciis-trust-item">
                <strong>24/7</strong> Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="ciis-features">
        <div className="ciis-section-container">
          <div className="ciis-section-header">
            <span className="ciis-section-badge">Core Features</span>
            <h2 className="ciis-section-title">Everything You Need</h2>
            <p className="ciis-section-description">
              Comprehensive tools to manage your workforce efficiently and effectively
            </p>
          </div>
          <div className="ciis-key-features-grid">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="ciis-key-feature-card">
                <div className="ciis-key-feature-header">
                  <div className="ciis-key-feature-image">
                    <span>{feature.image}</span>
                  </div>
                  <h3 className="ciis-key-feature-title">{feature.title}</h3>
                </div>
                <p className="ciis-key-feature-description">{feature.description}</p>
                <button className="ciis-feature-learn-more">
                  Learn more →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="ciis-dashboard-preview">
        <div className="ciis-section-container">
          <div className="ciis-section-header">
            <h2 className="ciis-section-title">Smart Dashboard</h2>
            <p className="ciis-section-description">
              Real-time insights and beautiful analytics at your fingertips
            </p>
          </div>
          <div className="ciis-dashboard-mockup">
            <div className="ciis-dashboard-grid">
              {stats.map((stat, index) => (
                <div key={index} className="ciis-dashboard-stat">
                  <div className="ciis-dashboard-stat-icon">{stat.icon}</div>
                  <div className="ciis-dashboard-stat-info">
                    <div className="ciis-dashboard-stat-value">{stat.value.toLocaleString()}</div>
                    <div className="ciis-dashboard-stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section id="access" className="ciis-access">
        <div className="ciis-section-container">
          <div className="ciis-section-header">
            <h2 className="ciis-section-title">Role-Based Access</h2>
            <p className="ciis-section-description">
              Tailored experiences for different user roles with comprehensive functionality
            </p>
          </div>
          <div className="ciis-access-grid">
            <div className="ciis-access-card ciis-admin-card">
              <div className="ciis-access-badge">Administrator</div>
              <div className="ciis-access-header">
                <div className="ciis-access-icon">🛡️</div>
                <h3 className="ciis-access-title">Admin Portal</h3>
                <p className="ciis-access-subtitle">Full system control & management</p>
              </div>
              <ul className="ciis-access-list">
                {adminFeatures.map((feature, index) => (
                  <li key={index} className="ciis-access-list-item">
                    <span className="ciis-list-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="ciis-access-btn">Admin Login</button>
            </div>

            <div className="ciis-access-card ciis-employee-card">
              <div className="ciis-access-badge">Employee</div>
              <div className="ciis-access-header">
                <div className="ciis-access-icon">💼</div>
                <h3 className="ciis-access-title">Employee Portal</h3>
                <p className="ciis-access-subtitle">Streamlined daily operations</p>
              </div>
              <ul className="ciis-access-list">
                {employeeFeatures.map((feature, index) => (
                  <li key={index} className="ciis-access-list-item">
                    <span className="ciis-list-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="ciis-access-btn">Employee Login</button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="ciis-benefits">
        <div className="ciis-section-container">
          <div className="ciis-section-header">
            <h2 className="ciis-section-title">Why Choose Our Platform?</h2>
            <p className="ciis-section-description">
              Experience the difference with our cutting-edge employee management solution
            </p>
          </div>
          <div className="ciis-benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="ciis-benefit-card">
                <div className="ciis-benefit-icon">
                  <span>{benefit.icon}</span>
                </div>
                <h3 className="ciis-benefit-title">{benefit.title}</h3>
                <p className="ciis-benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ciis-cta">
        <div className="ciis-section-container">
          <div className="ciis-cta-content">
            <h2 className="ciis-cta-title">Ready to Transform Your Workplace?</h2>
            <p className="ciis-cta-description">
              Join thousands of companies that trust our platform for their employee management needs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ciis-footer">
        <div className="ciis-footer-container">
          <div className="ciis-footer-content">
            <div className="ciis-footer-section">
              <div className="ciis-footer-logo">
                {/* Footer Logo Image */}
                <img 
                  src="/logo.png" 
                  alt="CIIS Network Logo" 
                  className="ciis-footer-logo-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback text logo */}
                {/* <div className="ciis-footer-logo-fallback">
                  <span className="ciis-footer-logo-text">CIIS NETWORK</span>
                </div> */}
              </div>
              <p className="ciis-footer-description">
                Streamlining employee management for modern businesses with innovative
                solutions and cutting-edge technology.
              </p>
            </div>

            <div className="ciis-footer-section">
              <h4 className="ciis-footer-title">Company</h4>
              <ul className="ciis-footer-list">
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>

            <div className="ciis-footer-section">
              <h4 className="ciis-footer-title">Contact</h4>
              <ul className="ciis-footer-list">
                <li>📧 info@ciisnetwork.com</li>
                <li>📞 +91 98759 29761</li>
                <li>📍 Phase - 8B Azda Tower Mohali</li>
              </ul>
            </div>
          </div>

          <div className="ciis-footer-bottom">
            <p className="ciis-copyright">
              © 2025 CIIS Network. All rights reserved.
            </p>
            <div className="ciis-social-links">
              <a href="#" className="ciis-social-link">Twitter</a>
              <a href="#" className="ciis-social-link">LinkedIn</a>
              <a href="#" className="ciis-social-link">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;