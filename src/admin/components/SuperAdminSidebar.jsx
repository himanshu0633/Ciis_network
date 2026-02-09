import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { path: '/Ciis-network/SuperAdminDashboard', label: 'Dashboard', icon: '📊' },
    { path: '/Ciis-network/all-company', label: 'All Company', icon: '🏭' }, 
    { path: '/Ciis-network/company-details', label: 'Company Details', icon: '🏢' },
    { path: '/Ciis-network/department', label: 'Department', icon: '🏢' },
    { path: '/Ciis-network/JobRoleManagement', label: 'Job Roles', icon: '👔' },
    { path: '/Ciis-network/create-user', label: 'Create User', icon: '👤' },
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>CIIS Network</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;