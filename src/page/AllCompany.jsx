import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Business,
  People,
  ArrowBack,
  Search,
  FilterList,
  Download,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  Close,
  Email,
  Phone,
  Badge,
  Person,
  CheckCircle,
  Cancel,
  MoreVert
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from "@mui/material";

const AllCompany = () => {
  const navigate = useNavigate();
  // const API_BASE = "http://localhost:3000/api";

  // State variables
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedCompany, setExpandedCompany] = useState(null);
  
  // Popup states
  const [usersPopupOpen, setUsersPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Validation function
  const validateSuperAdmin = () => {
    try {
      const superAdminRaw = localStorage.getItem("superAdmin");
      const token = localStorage.getItem("token");

      if (!superAdminRaw || !token) {
        toast.error("Please login as super admin");
        localStorage.clear();
        navigate("/super-admin/login");
        return false;
      }

      const superAdmin = JSON.parse(superAdminRaw);
      
      if (superAdmin.department !== "Management" || superAdmin.role !== "super-admin") {
        toast.error("Access denied! Unauthorized access.");
        localStorage.clear();
        navigate("/");
        return false;
      }

      return true;
    } catch (error) {
      toast.error("Invalid session data");
      localStorage.clear();
      navigate("/super-admin/login");
      return false;
    }
  };

  // Fetch all companies with user counts
  const fetchCompaniesWithUsers = async () => {
    if (!validateSuperAdmin()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${API_URL}/super-admin/companies-with-users`,
        { headers }
      );

      if (response.data && response.data.length > 0) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } else {
        await fetchCompaniesAndUsersSeparately();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.clear();
        navigate("/super-admin/login");
        return;
      }

      await fetchCompaniesAndUsersSeparately();
    } finally {
      setLoading(false);
    }
  };

  // Fallback method for separate API calls
  const fetchCompaniesAndUsersSeparately = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const companiesRes = await axios.get(
        `${API_URL}/super-admin/companies`,
        { headers }
      );

      const companiesWithUsers = await Promise.all(
        companiesRes.data.map(async (company) => {
          try {
            const usersRes = await axios.get(
              `${API_URL}/super-admin/company/${company._id}/users`,
              { headers }
            );
            
            return {
              ...company,
              userCount: usersRes.data.length,
              users: usersRes.data.slice(0, 3)
            };
          } catch (err) {
            return {
              ...company,
              userCount: 0,
              users: []
            };
          }
        })
      );

      setCompanies(companiesWithUsers);
      setFilteredCompanies(companiesWithUsers);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Backup fetch error:", error);
    }
  };

  // Handle search and filter
  useEffect(() => {
    let results = companies;

    if (searchTerm) {
      results = results.filter(company =>
        company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === "active") {
      results = results.filter(company => company.isActive === true);
    } else if (filter === "inactive") {
      results = results.filter(company => company.isActive === false);
    }

    setFilteredCompanies(results);
  }, [searchTerm, filter, companies]);

  // Initial load
  useEffect(() => {
    fetchCompaniesWithUsers();
  }, []);

  // Fetch users for popup
  const fetchCompanyUsers = async (companyId) => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/super-admin/company/${companyId}/users`,
        { headers }
      );
      
      setCompanyUsers(response.data);
    } catch (error) {
      console.error("Error fetching company users:", error);
      toast.error("Failed to load users");
      setCompanyUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Open users popup
  const handleOpenUsersPopup = async (company) => {
    setSelectedCompany(company);
    await fetchCompanyUsers(company._id);
    setUsersPopupOpen(true);
  };

  // Close users popup
  const handleCloseUsersPopup = () => {
    setUsersPopupOpen(false);
    setSelectedCompany(null);
    setCompanyUsers([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const csvRows = [];
      
      csvRows.push([
        'Company Code',
        'Company Name',
        'Email',
        'Phone',
        'Owner',
        'Total Users',
        'Status',
        'Created Date'
      ].join(','));
      
      filteredCompanies.forEach(company => {
        csvRows.push([
          company.companyCode || '',
          `"${company.companyName || ''}"`,
          company.companyEmail || '',
          company.companyPhone || '',
          `"${company.ownerName || ''}"`,
          company.userCount || 0,
          company.isActive ? 'Active' : 'Inactive',
          new Date(company.createdAt).toLocaleDateString()
        ].join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `companies_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
      console.error("Export error:", error);
    }
  };

  // View company details
  const handleViewCompanyDetails = (companyId) => {
    navigate(`/super-admin/company/${companyId}`);
  };

  // Toggle company expansion
  const toggleCompanyExpansion = async (companyId) => {
    if (expandedCompany === companyId) {
      setExpandedCompany(null);
    } else {
      setExpandedCompany(companyId);
    }
  };

  // Create user for specific company
  const handleCreateUserForCompany = (companyId, companyCode) => {
    window.open(`http://localhost:5173/create-user?company=${companyId}&companyCode=${companyCode}`, '_blank');
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'primary';
      case 'manager': return 'secondary';
      case 'supervisor': return 'info';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Companies Data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerSection}>        
        <div style={styles.titleSection}>
          <Business style={styles.titleIcon} />
          <h1>All Companies & Users</h1>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <h3>{companies.length}</h3>
            <p>Total Companies</p>
          </div>
          <div style={styles.statCard}>
            <h3>{companies.filter(c => c.isActive).length}</h3>
            <p>Active Companies</p>
          </div>
          <div style={styles.statCard}>
            <h3>
              {companies.reduce((total, company) => total + (company.userCount || 0), 0)}
            </h3>
            <p>Total Users</p>
          </div>
          <div style={styles.statCard}>
            <h3>{filteredCompanies.length}</h3>
            <p>Filtered Results</p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div style={styles.controlsSection}>
        <div style={styles.searchContainer}>
          <Search style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search companies by name, email or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterControls}>
          <div style={styles.filterContainer}>
            <FilterList style={styles.filterIcon} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            style={styles.exportButton}
          >
            <Download style={{ marginRight: "8px" }} />
            Export CSV
          </button>

          <button
            onClick={fetchCompaniesWithUsers}
            style={styles.refreshButton}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Companies List */}
      <div style={styles.companiesList}>
        {filteredCompanies.length === 0 ? (
          <div style={styles.emptyState}>
            <Business style={styles.emptyIcon} />
            <h3>No companies found</h3>
            <p>Try changing your search or filter criteria</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div key={company._id} style={styles.companyCard}>
              {/* Company Header */}
              <div style={styles.companyHeader}>
                <div 
                  style={{
                    ...styles.companyLogo,
                    background: `linear-gradient(135deg, ${
                      company.isActive ? '#667eea' : '#f87171'
                    } 0%, ${
                      company.isActive ? '#764ba2' : '#ef4444'
                    } 100%)`
                  }}
                >
                  {company.companyName?.charAt(0) || 'C'}
                </div>
                
                <div style={styles.companyInfo}>
                  <div style={styles.companyNameRow}>
                    <h3 style={styles.companyName}>{company.companyName || "Unnamed Company"}</h3>
                    <span style={styles.companyCode}>Code: {company.companyCode || "N/A"}</span>
                  </div>
                  
                  <div style={styles.companyMeta}>
                    <span style={{
                      ...styles.statusBadge,
                      background: company.isActive ? "#d1fae5" : "#fee2e2",
                      color: company.isActive ? "#065f46" : "#991b1b"
                    }}>
                      {company.isActive ? "Active" : "Inactive"}
                    </span>
                    <span style={styles.createdDate}>
                      Created: {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                    <span style={styles.userCount}>
                      <People style={{ fontSize: "14px", marginRight: "5px" }} />
                      {company.userCount || 0} Users
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleCompanyExpansion(company._id)}
                  style={styles.expandButton}
                >
                  {expandedCompany === company._id ? (
                    <KeyboardArrowUp />
                  ) : (
                    <KeyboardArrowDown />
                  )}
                </button>
              </div>

              {/* Company Details */}
              <div style={styles.companyDetails}>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <label>Email</label>
                    <p>{company.companyEmail || "N/A"}</p>
                  </div>
                  <div style={styles.detailItem}>
                    <label>Phone</label>
                    <p>{company.companyPhone || "N/A"}</p>
                  </div>
                  <div style={styles.detailItem}>
                    <label>Owner</label>
                    <p>{company.ownerName || "N/A"}</p>
                  </div>
                  <div style={styles.detailItem}>
                    <label>Address</label>
                    <p>{company.companyAddress || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Users Preview */}
              <div style={styles.usersPreview}>
                <div style={styles.usersHeader}>
                  <People style={styles.usersIcon} />
                  <h4>Users ({company.userCount || 0})</h4>
                  {(company.userCount || 0) > 0 && (
                    <button
                      onClick={() => handleOpenUsersPopup(company)}
                      style={styles.viewAllButton}
                    >
                      View All →
                    </button>
                  )}
                </div>

                {(company.userCount || 0) > 0 ? (
                  <div style={styles.usersList}>
                    {(company.users || []).map((user, index) => (
                      <div key={index} style={styles.userItem}>
                        <div style={styles.userAvatar}>
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div style={styles.userDetails}>
                          <span style={styles.userName}>{user.name || "Unknown User"}</span>
                          <span style={styles.userRole}>{user.role || "User"}</span>
                        </div>
                        <span style={styles.userId}>{user.employeeId || "No ID"}</span>
                      </div>
                    ))}
                    
                    {(company.userCount || 0) > 3 && (
                      <div style={styles.moreUsers}>
                        + {(company.userCount || 0) - 3} more users
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.noUsers}>
                    <p>No users in this company yet</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                <button
                  onClick={() => handleViewCompanyDetails(company._id)}
                  style={styles.viewDetailsButton}
                >
                  <Visibility style={{ marginRight: "8px" }} />
                  View Details
                </button>
                
                <button
                  onClick={() => handleCreateUserForCompany(company._id, company.companyCode)}
                  style={styles.addUserButton}
                >
                  + Add User
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div style={styles.summaryFooter}>
        <div style={styles.summaryItem}>
          <span>Showing:</span>
          <strong>{filteredCompanies.length}</strong>
          <span>of</span>
          <strong>{companies.length}</strong>
          <span>companies</span>
        </div>
        
        <div style={styles.summaryItem}>
          <span>Total Users:</span>
          <strong>
            {companies.reduce((total, company) => total + (company.userCount || 0), 0)}
          </strong>
        </div>
        
        <div style={styles.summaryItem}>
          <span>Active Companies:</span>
          <strong>{companies.filter(c => c.isActive).length}</strong>
        </div>
      </div>

      {/* Users Popup Dialog */}
      <Dialog
        open={usersPopupOpen}
        onClose={handleCloseUsersPopup}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle style={styles.dialogTitle}>
          <div style={styles.dialogHeader}>
            <div style={styles.dialogTitleContent}>
              <Business style={{ fontSize: 24, marginRight: 10, color: '#6366f1' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
                  {selectedCompany?.companyName || 'Company'} Users
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  Total Users: {companyUsers.length} | Company Code: {selectedCompany?.companyCode}
                </p>
              </div>
            </div>
            <IconButton onClick={handleCloseUsersPopup} style={styles.closeButton}>
              <Close />
            </IconButton>
          </div>
        </DialogTitle>
        
        <DialogContent dividers style={styles.dialogContent}>
          {usersLoading ? (
            <div style={styles.loadingUsers}>
              <div style={styles.smallSpinner}></div>
              <p>Loading users...</p>
            </div>
          ) : companyUsers.length > 0 ? (
            <TableContainer component={Paper} style={styles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow style={styles.tableHeaderRow}>
                    <TableCell style={styles.tableHeaderCell}>User</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Email</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Employee ID</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Role</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Department</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Status</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Last Login</TableCell>
                    <TableCell style={styles.tableHeaderCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow key={user._id} style={styles.tableRow}>
                      <TableCell>
                        <div style={styles.userCell}>
                          <Avatar 
                            style={{
                              backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                              marginRight: '10px'
                            }}
                          >
                            {user.name?.charAt(0) || 'U'}
                          </Avatar>
                          <div>
                            <strong style={{ display: 'block' }}>{user.name}</strong>
                            <small style={{ color: '#6b7280', fontSize: '12px' }}>
                              {user.jobRole || 'Employee'}
                            </small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={styles.emailCell}>
                          <Email style={{ fontSize: 16, marginRight: 8, color: '#9ca3af' }} />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={styles.idCell}>
                          <Badge style={{ fontSize: 16, marginRight: 8, color: '#9ca3af' }} />
                          {user.employeeId || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || 'User'}
                          color={getRoleColor(user.role)}
                          size="small"
                          style={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <span style={{ color: '#6b7280' }}>
                          {user.department || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isActive ? <CheckCircle /> : <Cancel />}
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(user.isActive ? 'active' : 'inactive')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <span style={{ 
                          color: user.lastLogin ? '#6b7280' : '#9ca3af',
                          fontSize: '13px'
                        }}>
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Never logged in'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Profile">
                          <IconButton size="small" style={{ color: '#6366f1' }}>
                            <Person fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions">
                          <IconButton size="small">
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div style={styles.noUsersInPopup}>
              <People style={{ fontSize: 64, color: '#d1d5db', marginBottom: 20 }} />
              <h3 style={{ color: '#6b7280', marginBottom: 8 }}>No Users Found</h3>
              <p style={{ color: '#9ca3af' }}>This company doesn't have any users yet.</p>
            </div>
          )}
        </DialogContent>
        
        <DialogActions style={styles.dialogActions}>
          <Button 
            onClick={handleCloseUsersPopup}
            style={styles.closeDialogButton}
          >
            Close
          </Button>
          {selectedCompany && (
            <Button 
              onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}
              variant="contained"
              style={styles.addUserDialogButton}
            >
              + Add New User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: "20px",
    background: "#f8fafc",
    minHeight: "100vh",
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
  headerSection: {
    marginBottom: "30px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "20px",
    transition: "background 0.3s",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },
  titleIcon: {
    fontSize: "36px !important",
    color: "#6366f1",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    transition: "transform 0.3s",
  },
  controlsSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "10px 15px",
    flex: 1,
    maxWidth: "500px",
  },
  searchIcon: {
    color: "#9ca3af !important",
    marginRight: "10px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "16px",
    background: "transparent",
  },
  filterControls: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "10px 15px",
  },
  filterIcon: {
    color: "#9ca3af !important",
    marginRight: "10px",
  },
  filterSelect: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "transparent",
    color: "#374151",
    cursor: "pointer",
  },
  exportButton: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
  refreshButton: {
    padding: "10px 20px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
  companiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  companyCard: {
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    transition: "all 0.3s",
  },
  companyHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  companyLogo: {
    width: "70px",
    height: "70px",
    borderRadius: "12px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginRight: "20px",
    flexShrink: 0,
  },
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  companyName: {
    margin: 0,
    color: "#1e293b",
    fontSize: "22px",
  },
  companyCode: {
    color: "#6b7280",
    fontSize: "14px",
    background: "#f3f4f6",
    padding: "4px 10px",
    borderRadius: "4px",
  },
  companyMeta: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  statusBadge: {
    padding: "6px 15px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  createdDate: {
    color: "#6b7280",
    fontSize: "13px",
  },
  userCount: {
    display: "flex",
    alignItems: "center",
    color: "#6366f1",
    fontSize: "14px",
    fontWeight: "600",
  },
  expandButton: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    transition: "all 0.3s",
  },
  companyDetails: {
    marginBottom: "20px",
    padding: "20px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  detailItem: {
    marginBottom: "10px",
  },
  usersPreview: {
    marginBottom: "20px",
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  usersHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  usersIcon: {
    color: "#8b5cf6 !important",
  },
  viewAllButton: {
    background: "none",
    border: "none",
    color: "#6366f1",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    padding: "5px 10px",
    borderRadius: "4px",
    transition: "all 0.3s",
  },
  usersList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    background: "white",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#8b5cf6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    marginRight: "12px",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  userRole: {
    fontSize: "12px",
    color: "#6b7280",
  },
  userId: {
    fontSize: "11px",
    color: "#9ca3af",
    background: "#f3f4f6",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  moreUsers: {
    textAlign: "center",
    padding: "10px",
    color: "#6b7280",
    fontSize: "14px",
    background: "white",
    borderRadius: "6px",
    border: "1px dashed #d1d5db",
  },
  noUsers: {
    textAlign: "center",
    padding: "20px",
    color: "#9ca3af",
  },
  actionButtons: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
  },
  viewDetailsButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
  addUserButton: {
    flex: 1,
    padding: "12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "12px",
    border: "2px dashed #d1d5db",
  },
  emptyIcon: {
    fontSize: "64px !important",
    color: "#d1d5db !important",
    marginBottom: "20px",
  },
  summaryFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginTop: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6b7280",
  },
  // Popup Styles
  dialogTitle: {
    padding: "20px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dialogTitleContent: {
    display: "flex",
    alignItems: "center",
  },
  closeButton: {
    padding: "8px",
  },
  dialogContent: {
    padding: 0,
    overflow: "hidden",
  },
  loadingUsers: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  smallSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  tableContainer: {
    borderRadius: 0,
    boxShadow: "none",
    maxHeight: "400px",
    overflowY: "auto",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
  },
  tableHeaderCell: {
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
  },
  tableRow: {
    '&:hover': {
      backgroundColor: "#f9fafb",
    },
  },
  userCell: {
    display: "flex",
    alignItems: "center",
  },
  emailCell: {
    display: "flex",
    alignItems: "center",
    color: "#4b5563",
  },
  idCell: {
    display: "flex",
    alignItems: "center",
    color: "#4b5563",
  },
  noUsersInPopup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  dialogActions: {
    padding: "16px 24px",
    background: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
  },
  closeDialogButton: {
    color: "#6b7280",
  },
  addUserDialogButton: {
    background: "#10b981",
    color: "white",
    fontWeight: "600",
    '&:hover': {
      background: "#059669",
    },
  },
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AllCompany;