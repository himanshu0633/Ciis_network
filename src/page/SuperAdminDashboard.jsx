import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dashboard,
  Business,
  People,
  Settings,
  Analytics,
  Security,
  Logout,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    todayLogins: 0
  });
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    // Check if super admin is logged in
    const superAdmin = JSON.parse(localStorage.getItem('superAdmin'));
    if (!superAdmin) {
      toast.error('Please login as super admin');
      navigate('/super-admin/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsRes = await axios.get(`${API_BASE}/super-admin/stats`, { headers });
      setStats(statsRes.data);

      // Fetch companies
      const companiesRes = await axios.get(`${API_BASE}/super-admin/companies`, { headers });
      setCompanies(companiesRes.data);

      // Fetch all users
      const usersRes = await axios.get(`${API_BASE}/super-admin/users`, { headers });
      setUsers(usersRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdmin');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/super-admin/login');
  };

  const handleCompanyAction = async (companyId, action) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (action === 'deactivate') {
        await axios.patch(`${API_BASE}/super-admin/company/${companyId}/deactivate`, {}, { headers });
        toast.success('Company deactivated');
      } else if (action === 'activate') {
        await axios.patch(`${API_BASE}/super-admin/company/${companyId}/activate`, {}, { headers });
        toast.success('Company activated');
      } else if (action === 'delete') {
        if (window.confirm('Are you sure? This will delete the company permanently!')) {
          await axios.delete(`${API_BASE}/super-admin/company/${companyId}`, { headers });
          toast.success('Company deleted');
        }
      }

      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={styles.dashboardGrid}>
            {/* Stats Cards */}
            <div style={styles.statsCard}>
              <Business style={styles.statsIcon} />
              <h3>Total Companies</h3>
              <p style={styles.statsNumber}>{stats.totalCompanies}</p>
            </div>
            <div style={styles.statsCard}>
              <Business style={{ ...styles.statsIcon, color: '#10b981' }} />
              <h3>Active Companies</h3>
              <p style={styles.statsNumber}>{stats.activeCompanies}</p>
            </div>
            <div style={styles.statsCard}>
              <People style={{ ...styles.statsIcon, color: '#8b5cf6' }} />
              <h3>Total Users</h3>
              <p style={styles.statsNumber}>{stats.totalUsers}</p>
            </div>
            <div style={styles.statsCard}>
              <Analytics style={{ ...styles.statsIcon, color: '#f59e0b' }} />
              <h3>Today's Logins</h3>
              <p style={styles.statsNumber}>{stats.todayLogins}</p>
            </div>

            {/* Companies Table */}
            <div style={styles.tableCard}>
              <h3>Recent Companies</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.slice(0, 5).map((company) => (
                    <tr key={company._id}>
                      <td>{company.companyName}</td>
                      <td>{company.companyEmail}</td>
                      <td>
                        <span style={{
                          ...styles.statusBadge,
                          background: company.isActive ? '#10b98120' : '#ef444420',
                          color: company.isActive ? '#10b981' : '#ef4444'
                        }}>
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{company.ownerName}</td>
                      <td>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => navigate(`/super-admin/company/${company._id}`)}
                            style={styles.viewButton}
                          >
                            View
                          </button>
                          {company.isActive ? (
                            <button
                              onClick={() => handleCompanyAction(company._id, 'deactivate')}
                              style={styles.deactivateButton}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCompanyAction(company._id, 'activate')}
                              style={styles.activateButton}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'companies':
        return (
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h2>All Companies</h2>
              <button
                onClick={() => navigate('/super-admin/create-company')}
                style={styles.createButton}
              >
                + Create New Company
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company._id}>
                    <td>
                      <small style={{ color: '#6b7280' }}>{company.companyCode}</small>
                    </td>
                    <td>
                      <strong>{company.companyName}</strong>
                    </td>
                    <td>{company.companyEmail}</td>
                    <td>{company.companyPhone}</td>
                    <td>{company.ownerName}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: company.isActive ? '#10b98120' : '#ef444420',
                        color: company.isActive ? '#10b981' : '#ef4444'
                      }}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => navigate(`/super-admin/company/${company._id}`)}
                          style={styles.viewButton}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => navigate(`/super-admin/company/edit/${company._id}`)}
                          style={styles.editButton}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {company.isActive ? (
                          <button
                            onClick={() => handleCompanyAction(company._id, 'deactivate')}
                            style={styles.deactivateButton}
                            title="Deactivate"
                          >
                            ⏸️
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCompanyAction(company._id, 'activate')}
                            style={styles.activateButton}
                            title="Activate"
                          >
                            ▶️
                          </button>
                        )}
                        <button
                          onClick={() => handleCompanyAction(company._id, 'delete')}
                          style={styles.deleteButton}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'users':
        return (
          <div style={styles.tableCard}>
            <h2>All Users</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <br />
                          <small>{user.employeeId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.company?.companyName || 'N/A'}</td>
                    <td>
                      <span style={{
                        ...styles.roleBadge,
                        background: user.role === 'admin' ? '#6366f120' : '#f59e0b20',
                        color: user.role === 'admin' ? '#6366f1' : '#f59e0b'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: user.isActive ? '#10b98120' : '#ef444420',
                        color: user.isActive ? '#10b981' : '#ef4444'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'settings':
        return (
          <div style={styles.settingsCard}>
            <h2>System Settings</h2>
            <div style={styles.settingsGrid}>
              <div style={styles.settingItem}>
                <h3>General Settings</h3>
                <div style={styles.settingField}>
                  <label>System Name</label>
                  <input type="text" defaultValue="CDS Platform" style={styles.settingInput} />
                </div>
                <div style={styles.settingField}>
                  <label>Support Email</label>
                  <input type="email" defaultValue="support@cds.com" style={styles.settingInput} />
                </div>
                <button style={styles.saveButton}>Save Changes</button>
              </div>

              <div style={styles.settingItem}>
                <h3>Security Settings</h3>
                <div style={styles.settingField}>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable Two-Factor Authentication
                  </label>
                </div>
                <div style={styles.settingField}>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Force Password Change (90 days)
                  </label>
                </div>
                <div style={styles.settingField}>
                  <label>Session Timeout (minutes)</label>
                  <input type="number" defaultValue="30" style={styles.settingInput} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: sidebarOpen ? '250px' : '60px',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-200px)'
      }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen && <h2>Super Admin</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.menuToggle}
          >
            {sidebarOpen ? <Close /> : <MenuIcon />}
          </button>
        </div>

        <div style={styles.menu}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              ...styles.menuItem,
              background: activeTab === 'dashboard' ? '#6366f120' : 'transparent'
            }}
          >
            <Dashboard />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            style={{
              ...styles.menuItem,
              background: activeTab === 'companies' ? '#6366f120' : 'transparent'
            }}
          >
            <Business />
            {sidebarOpen && <span>Companies</span>}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              ...styles.menuItem,
              background: activeTab === 'users' ? '#6366f120' : 'transparent'
            }}
          >
            <People />
            {sidebarOpen && <span>All Users</span>}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              ...styles.menuItem,
              background: activeTab === 'settings' ? '#6366f120' : 'transparent'
            }}
          >
            <Settings />
            {sidebarOpen && <span>Settings</span>}
          </button>

          <div style={styles.menuSpacer} />

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            <Logout />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.mainContent,
        marginLeft: sidebarOpen ? '250px' : '60px'
      }}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab === 'dashboard' && 'Super Admin Dashboard'}
            {activeTab === 'companies' && 'Company Management'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'settings' && 'System Settings'}
          </h1>
          <div style={styles.headerActions}>
            <button
              onClick={fetchDashboardData}
              style={styles.refreshButton}
              title="Refresh Data"
            >
              🔄 Refresh
            </button>
            <div style={styles.userInfo}>
              <div style={styles.avatarLarge}>
                SA
              </div>
              <div>
                <strong>Super Admin</strong>
                <br />
                <small>Master Administrator</small>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  sidebar: {
    background: '#1e293b',
    color: 'white',
    position: 'fixed',
    height: '100vh',
    transition: 'all 0.3s',
    zIndex: 1000
  },
  sidebarHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #334155'
  },
  menuToggle: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '5px'
  },
  menu: {
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    border: 'none',
    background: 'none',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    fontSize: '14px'
  },
  menuSpacer: {
    flex: 1
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    border: 'none',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    fontSize: '14px',
    marginTop: '20px'
  },
  mainContent: {
    flex: 1,
    transition: 'all 0.3s'
  },
  header: {
    background: 'white',
    padding: '20px 30px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    margin: 0,
    color: '#1e293b'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  refreshButton: {
    padding: '8px 16px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatarLarge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#6366f1',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  content: {
    padding: '30px',
    background: '#f8fafc',
    minHeight: 'calc(100vh - 80px)'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statsCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    textAlign: 'center'
  },
  statsIcon: {
    fontSize: '40px',
    color: '#6366f1',
    marginBottom: '10px'
  },
  statsNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '10px 0',
    color: '#1e293b'
  },
  tableCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    overflowX: 'auto'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  createButton: {
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableTh: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
    color: '#374151'
  },
  tableTd: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  actionButtons: {
    display: 'flex',
    gap: '5px'
  },
  viewButton: {
    padding: '6px 12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  editButton: {
    padding: '6px 12px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  activateButton: {
    padding: '6px 12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deactivateButton: {
    padding: '6px 12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#6366f1',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  settingsCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '20px'
  },
  settingItem: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  },
  settingField: {
    marginBottom: '15px'
  },
  settingInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginTop: '5px'
  },
  saveButton: {
    padding: '10px 20px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#f8fafc'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  }
};

export default SuperAdminDashboard;