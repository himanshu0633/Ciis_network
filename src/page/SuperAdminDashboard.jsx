import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Dashboard,
  Business,
  People,
  Settings,
  Analytics,
  Logout,
  Menu as MenuIcon,
  Close,
  PersonAdd,
} from "@mui/icons-material";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000/api";

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    todayLogins: 0,
  });

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  // ✅ Validation function with detailed logs
  const validateSuperAdmin = () => {
    console.log("=== VALIDATE SUPER ADMIN START ===");
    
    const superAdminRaw = localStorage.getItem("superAdmin");
    const token = localStorage.getItem("token");

    console.log("1. Checking localStorage:");
    console.log("   - superAdmin item exists:", !!superAdminRaw);
    console.log("   - token item exists:", !!token);

    if (!superAdminRaw) {
      console.log("❌ ERROR: No superAdmin found in localStorage");
      console.log("   LocalStorage content:", localStorage);
      forceLogout("Please login as super admin");
      return false;
    }

    if (!token) {
      console.log("❌ ERROR: No token found in localStorage");
      console.log("   LocalStorage content:", localStorage);
      forceLogout("Please login as super admin");
      return false;
    }

    // Try to parse superAdmin
    try {
      const superAdmin = JSON.parse(superAdminRaw);
      console.log("2. ✅ Successfully parsed superAdmin from localStorage:");
      console.log("   - Full object:", superAdmin);
      console.log("   - Department:", superAdmin.department);
      console.log("   - Role:", superAdmin.role);
      console.log("   - Name:", superAdmin.name);
      console.log("   - Email:", superAdmin.email);
      console.log("   - ID:", superAdmin.id);
      console.log("   - Company:", superAdmin.company);
      console.log("   - CompanyRole:", superAdmin.companyRole);
      console.log("   - EmployeeId:", superAdmin.employeeId);
      console.log("   - JobRole:", superAdmin.jobRole);

      // ✅ Check if department is "Management"
      if (superAdmin.department !== "Management") {
        console.log(`❌ ACCESS DENIED: Department is "${superAdmin.department}", expected "Management"`);
        console.log("   User department does not match requirement");
        toast.error("Access denied! Unauthorized department.");
        localStorage.removeItem("superAdmin");
        localStorage.removeItem("token");
        navigate("/");
        return false;
      }

      // ✅ Additional security checks
      if (superAdmin.role !== "super-admin") {
        console.log(`❌ ACCESS DENIED: Role is "${superAdmin.role}", expected "super-admin"`);
        toast.error("Access denied! Invalid role.");
        localStorage.removeItem("superAdmin");
        localStorage.removeItem("token");
        navigate("/");
        return false;
      }

      console.log("3. ✅ ALL VALIDATIONS PASSED:");
      console.log("   - Department is 'Management': ✓");
      console.log("   - Role is 'super-admin': ✓");
      console.log("   - User is authorized to access Super Admin Dashboard");
      console.log("=== VALIDATE SUPER ADMIN END ===");
      
      return true;
    } catch (error) {
      console.log("❌ ERROR: Failed to parse superAdmin from localStorage");
      console.log("   Raw data:", superAdminRaw);
      console.log("   Parse error:", error);
      forceLogout("Invalid session data");
      return false;
    }
  };

  // ✅ Logout function (Reusable)
  const forceLogout = (message = "Session expired, please login again!") => {
    console.log("🚪 FORCE LOGOUT TRIGGERED:", message);
    toast.error(message);
    localStorage.removeItem("superAdmin");
    localStorage.removeItem("token");
    navigate("/super-admin/login");
  };

  useEffect(() => {
    console.log("=== COMPONENT MOUNTED ===");
    console.log("URL:", window.location.href);
    
    // ✅ Validate before loading dashboard
    const isValid = validateSuperAdmin();
    console.log("Validation result:", isValid ? "✅ PASSED" : "❌ FAILED");
    
    if (isValid) {
      console.log("✅ Authorization successful, fetching dashboard data...");
      fetchDashboardData();
    } else {
      console.log("❌ Authorization failed, dashboard will not load");
    }
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    console.log("=== FETCHING DASHBOARD DATA ===");
    
    // ✅ Validate before fetching
    const isValid = validateSuperAdmin();
    if (!isValid) {
      console.log("❌ Validation failed in fetchDashboardData, returning");
      return;
    }

    try {
      setLoading(true);
      console.log("⏳ Starting to load dashboard data...");

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      console.log("🔗 API Base URL:", API_BASE);
      console.log("📤 Request Headers:", headers);

      // ✅ Fetch stats
      console.log("📊 Fetching stats from:", `${API_BASE}/super-admin/stats`);
      const statsRes = await axios.get(`${API_BASE}/super-admin/stats`, {
        headers,
      });
      console.log("✅ Stats API Response:", statsRes.data);
      setStats(statsRes.data);

      // ✅ Fetch companies
      console.log("🏢 Fetching companies from:", `${API_BASE}/super-admin/companies`);
      const companiesRes = await axios.get(
        `${API_BASE}/super-admin/companies`,
        { headers }
      );
      console.log(`✅ Companies API Response: ${companiesRes.data.length} companies found`);
      console.log("Companies sample (first 2):", companiesRes.data.slice(0, 2));
      setCompanies(companiesRes.data);

      // ✅ Fetch users
      console.log("👥 Fetching users from:", `${API_BASE}/super-admin/users`);
      const usersRes = await axios.get(`${API_BASE}/super-admin/users`, {
        headers,
      });
      console.log(`✅ Users API Response: ${usersRes.data.length} users found`);
      console.log("Users sample (first 2):", usersRes.data.slice(0, 2));
      setUsers(usersRes.data);

      console.log("🎉 All dashboard data loaded successfully!");
      console.log("   - Total Companies:", statsRes.data.totalCompanies);
      console.log("   - Active Companies:", statsRes.data.activeCompanies);
      console.log("   - Total Users:", statsRes.data.totalUsers);
      console.log("   - Today Logins:", statsRes.data.todayLogins);

    } catch (error) {
      console.error("❌ ERROR fetching dashboard data:");
      console.error("   Error Message:", error.message);
      console.error("   Error Response:", error.response?.data);
      console.error("   Error Status:", error.response?.status);
      console.error("   Error Headers:", error.response?.headers);
      console.error("   Full Error:", error);

      // ✅ Auto logout if token expired
      if (error.response?.status === 401) {
        console.log("🔒 401 Unauthorized - Token expired or invalid");
        forceLogout("Session expired. Please login again!");
        return;
      }

      toast.error("Failed to load dashboard data");
    } finally {
      console.log("🏁 Dashboard data loading completed");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("👋 USER INITIATED LOGOUT");
    console.log("User before logout:", JSON.parse(localStorage.getItem("superAdmin")));
    
    localStorage.removeItem("superAdmin");
    localStorage.removeItem("token");
    
    console.log("✅ localStorage cleared");
    console.log("superAdmin after logout:", localStorage.getItem("superAdmin"));
    console.log("token after logout:", localStorage.getItem("token"));
    
    toast.success("Logged out successfully");
    navigate("/super-admin/login");
  };

const handleCreateUser = () => {
  console.log("👤 CREATE USER button clicked");
  
  // ✅ Validate before navigation
  if (!validateSuperAdmin()) {
    console.log("❌ Validation failed in handleCreateUser, returning");
    return;
  }
  
  // Get company ID from current super admin
  const superAdminRaw = localStorage.getItem("superAdmin");
  const superAdmin = JSON.parse(superAdminRaw);
  const companyId = superAdmin.company; // इसी कंपनी ID को पास करेंगे
  const companyCode =superAdmin.companyCode


  console.log("Company ID from super admin:", companyId);
  console.log("Navigating with company ID...");
  
  // ✅ Pass company ID in URL
  window.location.href = `http://localhost:5173/create-user?company=${companyId}&companyCode=${companyCode}`;
};

  const handleCompanyAction = async (companyId, action) => {
    console.log(`🛠️ COMPANY ACTION: ${action} for company ID: ${companyId}`);
    
    // ✅ Validate before any action
    if (!validateSuperAdmin()) {
      console.log("❌ Validation failed in handleCompanyAction, returning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      console.log(`🔄 Performing ${action} action on company ${companyId}...`);

      if (action === "deactivate") {
        await axios.patch(
          `${API_BASE}/super-admin/company/${companyId}/deactivate`,
          {},
          { headers }
        );
        console.log(`✅ Company ${companyId} deactivated successfully`);
        toast.success("Company deactivated");
      } else if (action === "activate") {
        await axios.patch(
          `${API_BASE}/super-admin/company/${companyId}/activate`,
          {},
          { headers }
        );
        console.log(`✅ Company ${companyId} activated successfully`);
        toast.success("Company activated");
      } else if (action === "delete") {
        const confirmDelete = window.confirm(
          "Are you sure? This will delete the company permanently!"
        );
        if (!confirmDelete) {
          console.log("❌ Delete action cancelled by user");
          return;
        }

        console.log(`🗑️ Deleting company ${companyId}...`);
        await axios.delete(`${API_BASE}/super-admin/company/${companyId}`, {
          headers,
        });
        console.log(`✅ Company ${companyId} deleted successfully`);
        toast.success("Company deleted");
      }

      console.log("🔄 Refreshing dashboard data after action...");
      fetchDashboardData();
    } catch (error) {
      console.error("❌ COMPANY ACTION ERROR:");
      console.error("   Action:", action);
      console.error("   Company ID:", companyId);
      console.error("   Error:", error.message);
      console.error("   Response:", error.response?.data);
      console.error("   Status:", error.response?.status);

      // ✅ Auto logout if token expired
      if (error.response?.status === 401) {
        console.log("🔒 401 Unauthorized - Token expired");
        forceLogout("Session expired. Please login again!");
        return;
      }

      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const renderContent = () => {
    console.log(`🔄 RENDERING CONTENT FOR TAB: ${activeTab}`);
    console.log(`   - Stats:`, stats);
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Users: ${users.length}`);
    
    switch (activeTab) {
      case "dashboard":
        return (
          <div style={styles.dashboardGrid}>
            {/* Stats Cards */}
            <div style={styles.statsCard}>
              <Business style={styles.statsIcon} />
              <h3>Total Companies</h3>
              <p style={styles.statsNumber}>{stats.totalCompanies}</p>
            </div>

            <div style={styles.statsCard}>
              <Business style={{ ...styles.statsIcon, color: "#10b981" }} />
              <h3>Active Companies</h3>
              <p style={styles.statsNumber}>{stats.activeCompanies}</p>
            </div>

            <div style={styles.statsCard}>
              <People style={{ ...styles.statsIcon, color: "#8b5cf6" }} />
              <h3>Total Users</h3>
              <p style={styles.statsNumber}>{stats.totalUsers}</p>
            </div>

            <div style={styles.statsCard}>
              <Analytics style={{ ...styles.statsIcon, color: "#f59e0b" }} />
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
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: company.isActive
                              ? "#10b98120"
                              : "#ef444420",
                            color: company.isActive ? "#10b981" : "#ef4444",
                          }}
                        >
                          {company.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{company.ownerName}</td>
                      <td>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => {
                              console.log(`👁️ View company: ${company._id}`);
                              navigate(`/super-admin/company/${company._id}`);
                            }}
                            style={styles.viewButton}
                          >
                            View
                          </button>

                          {company.isActive ? (
                            <button
                              onClick={() =>
                                handleCompanyAction(company._id, "deactivate")
                              }
                              style={styles.deactivateButton}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleCompanyAction(company._id, "activate")
                              }
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

      case "companies":
        return (
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h2>All Companies</h2>
              <button
                onClick={() => {
                  console.log("➕ Create New Company button clicked");
                  navigate("/super-admin/create-company");
                }}
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
                      <small style={{ color: "#6b7280" }}>
                        {company.companyCode}
                      </small>
                    </td>
                    <td>
                      <strong>{company.companyName}</strong>
                    </td>
                    <td>{company.companyEmail}</td>
                    <td>{company.companyPhone}</td>
                    <td>{company.ownerName}</td>
                    <td>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: company.isActive
                            ? "#10b98120"
                            : "#ef444420",
                          color: company.isActive ? "#10b981" : "#ef4444",
                        }}
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(company.createdAt).toLocaleDateString()}</td>

                    <td>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => {
                            console.log(`👁️ View company details: ${company._id}`);
                            navigate(`/super-admin/company/${company._id}`);
                          }}
                          style={styles.viewButton}
                          title="View Details"
                        >
                          👁️
                        </button>

                        <button
                          onClick={() => {
                            console.log(`✏️ Edit company: ${company._id}`);
                            navigate(`/super-admin/company/edit/${company._id}`);
                          }}
                          style={styles.editButton}
                          title="Edit"
                        >
                          ✏️
                        </button>

                        {company.isActive ? (
                          <button
                            onClick={() =>
                              handleCompanyAction(company._id, "deactivate")
                            }
                            style={styles.deactivateButton}
                            title="Deactivate"
                          >
                            ⏸️
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleCompanyAction(company._id, "activate")
                            }
                            style={styles.activateButton}
                            title="Activate"
                          >
                            ▶️
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleCompanyAction(company._id, "delete")
                          }
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

      case "users":
        return (
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h2>All Users</h2>
              <button
                onClick={handleCreateUser}
                style={styles.createButton}
              >
                + Create New User
              </button>
            </div>
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
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <br />
                          <small>{user.employeeId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.company?.companyName || "N/A"}</td>
                    <td>
                      <span
                        style={{
                          ...styles.roleBadge,
                          background:
                            user.role === "admin"
                              ? "#6366f120"
                              : "#f59e0b20",
                          color: user.role === "admin" ? "#6366f1" : "#f59e0b",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: user.isActive
                            ? "#10b98120"
                            : "#ef444420",
                          color: user.isActive ? "#10b981" : "#ef4444",
                        }}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    
      case "settings":
        return (
          <div style={styles.settingsCard}>
            <h2>System Settings</h2>
            <div style={styles.settingsGrid}>
              <div style={styles.settingItem}>
                <h3>General Settings</h3>

                <div style={styles.settingField}>
                  <label>System Name</label>
                  <input
                    type="text"
                    defaultValue="CDS Platform"
                    style={styles.settingInput}
                  />
                </div>

                <div style={styles.settingField}>
                  <label>Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@cds.com"
                    style={styles.settingInput}
                  />
                </div>

                <button 
                  style={styles.saveButton}
                  onClick={() => {
                    console.log("💾 Save Changes clicked in General Settings");
                    toast.info("Settings saved successfully!");
                  }}
                >
                  Save Changes
                </button>
              </div>

              <div style={styles.settingItem}>
                <h3>Security Settings</h3>

                <div style={styles.settingField}>
                  <label>
                    <input type="checkbox" defaultChecked /> Enable Two-Factor
                    Authentication
                  </label>
                </div>

                <div style={styles.settingField}>
                  <label>
                    <input type="checkbox" defaultChecked /> Force Password
                    Change (90 days)
                  </label>
                </div>

                <div style={styles.settingField}>
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue="30"
                    style={styles.settingInput}
                  />
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
    console.log("⏳ SHOWING LOADING SCREEN");
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Super Admin Dashboard...</p>
        <button 
          onClick={() => {
            console.clear();
            console.log("=== MANUAL DEBUG ===");
            console.log("LocalStorage superAdmin:", localStorage.getItem("superAdmin"));
            console.log("LocalStorage token:", localStorage.getItem("token"));
            
            const superAdmin = localStorage.getItem("superAdmin");
            if (superAdmin) {
              try {
                const parsed = JSON.parse(superAdmin);
                console.log("Parsed superAdmin:", parsed);
              } catch (e) {
                console.log("Parse error:", e);
              }
            }
          }}
          style={{
            padding: "8px 16px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Debug LocalStorage in Console
        </button>
      </div>
    );
  }

  console.log("🎨 RENDERING MAIN DASHBOARD UI");
  console.log(`   - Sidebar open: ${sidebarOpen}`);
  console.log(`   - Active tab: ${activeTab}`);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? "250px" : "60px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-200px)",
        }}
      >
        <div style={styles.sidebarHeader}>
          {sidebarOpen && <h2>Super Admin</h2>}
          <button
            onClick={() => {
              console.log(`📱 Sidebar toggle: ${sidebarOpen ? "closing" : "opening"}`);
              setSidebarOpen(!sidebarOpen);
            }}
            style={styles.menuToggle}
          >
            {sidebarOpen ? <Close /> : <MenuIcon />}
          </button>
        </div>

        <div style={styles.menu}>
          <button
            onClick={() => {
              console.log("📊 Dashboard tab clicked");
              setActiveTab("dashboard");
            }}
            style={{
              ...styles.menuItem,
              background: activeTab === "dashboard" ? "#6366f120" : "transparent",
            }}
          >
            <Dashboard />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => {
              console.log("🏢 Companies tab clicked");
              setActiveTab("companies");
            }}
            style={{
              ...styles.menuItem,
              background: activeTab === "companies" ? "#6366f120" : "transparent",
            }}
          >
            <Business />
            {sidebarOpen && <span>Companies</span>}
          </button>

          <button
            onClick={() => {
              console.log("👥 Users tab clicked");
              setActiveTab("users");
            }}
            style={{
              ...styles.menuItem,
              background: activeTab === "users" ? "#6366f120" : "transparent",
            }}
          >
            <People />
            {sidebarOpen && <span>All Users</span>}
          </button>

          {/* NEW: Create User Menu Item */}
          <button
            onClick={handleCreateUser}
            style={{
              ...styles.menuItem,
              background: "transparent",
            }}
          >
            <PersonAdd />
            {sidebarOpen && <span>Create User</span>}
          </button>

          <button
            onClick={() => {
              console.log("⚙️ Settings tab clicked");
              setActiveTab("settings");
            }}
            style={{
              ...styles.menuItem,
              background: activeTab === "settings" ? "#6366f120" : "transparent",
            }}
          >
            <Settings />
            {sidebarOpen && <span>Settings</span>}
          </button>

          <div style={styles.menuSpacer} />

          <button onClick={handleLogout} style={styles.logoutButton}>
            <Logout />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          ...styles.mainContent,
          marginLeft: sidebarOpen ? "250px" : "60px",
        }}
      >
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            {activeTab === "dashboard" && "Super Admin Dashboard"}
            {activeTab === "companies" && "Company Management"}
            {activeTab === "users" && "User Management"}
            {activeTab === "settings" && "System Settings"}
          </h1>

          <div style={styles.headerActions}>
            <button
              onClick={() => {
                console.log("🔄 Refresh button clicked");
                fetchDashboardData();
              }}
              style={styles.refreshButton}
              title="Refresh Data"
            >
              🔄 Refresh
            </button>

            <button
              onClick={handleCreateUser}
              style={styles.createButton}
              title="Create New User"
            >
              👤 Create User
            </button>

            <div style={styles.userInfo}>
              <div style={styles.avatarLarge}>SA</div>
              <div>
                <strong>Super Admin</strong>
                <br />
                <small>Master Administrator</small>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>{renderContent()}</main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  sidebar: {
    background: "#1e293b",
    color: "white",
    position: "fixed",
    height: "100vh",
    transition: "all 0.3s",
    zIndex: 1000,
  },

  sidebarHeader: {
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #334155",
  },

  menuToggle: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "5px",
  },

  menu: {
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    border: "none",
    background: "none",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
    fontSize: "14px",
  },

  menuSpacer: {
    flex: 1,
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
    fontSize: "14px",
    marginTop: "20px",
  },

  mainContent: {
    flex: 1,
    transition: "all 0.3s",
  },

  header: {
    background: "white",
    padding: "20px 30px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    margin: 0,
    color: "#1e293b",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  refreshButton: {
    padding: "8px 16px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  createButton: {
    padding: "10px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatarLarge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  content: {
    padding: "30px",
    background: "#f8fafc",
    minHeight: "calc(100vh - 80px)",
  },

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  statsCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  statsIcon: {
    fontSize: "40px",
    color: "#6366f1",
    marginBottom: "10px",
  },

  statsNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "10px 0",
    color: "#1e293b",
  },

  tableCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },

  roleBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },

  actionButtons: {
    display: "flex",
    gap: "5px",
  },

  viewButton: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },

  editButton: {
    padding: "6px 12px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },

  activateButton: {
    padding: "6px 12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },

  deactivateButton: {
    padding: "6px 12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },

  deleteButton: {
    padding: "6px 12px",
    background: "#000",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  settingsCard: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginTop: "20px",
  },

  settingItem: {
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  settingField: {
    marginBottom: "15px",
  },

  settingInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    marginTop: "5px",
  },

  saveButton: {
    padding: "10px 20px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f8fafc",
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e5e7eb",
    borderTop: "5px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
};

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default SuperAdminDashboard;