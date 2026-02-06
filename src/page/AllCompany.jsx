import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config";
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
  MoreVert,
  Edit,
  LocationOn,
  Security,
  CalendarToday,
  Domain,
  Link,
  Image,
  Storage,
  Person as PersonIcon
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
  Tooltip,
  TextField,
  Box,
  Typography,
  Divider,
  Grid,
  LinearProgress,
  Switch,
  FormControlLabel
} from "@mui/material";

const AllCompany = () => {
  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedCompany, setExpandedCompany] = useState(null);
  
  // Popup states
  const [usersPopupOpen, setUsersPopupOpen] = useState(false);
  const [companyDetailsPopupOpen, setCompanyDetailsPopupOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyDetailsLoading, setCompanyDetailsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedCompany, setEditedCompany] = useState(null);

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

  // Fetch company details by ID
  const fetchCompanyDetails = async (companyId) => {
    try {
      setCompanyDetailsLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log("📡 Fetching company details from:", `${API_URL}/company/${companyId}`);
      
      const response = await axios.get(
        `${API_URL}/company/${companyId}`,
        { headers }
      );
      
      console.log("✅ Company details API response:", response.data);
      
      if (response.data) {
        setCompanyDetails(response.data.company);
        setEditedCompany(response.data.company); // Initialize edit form with current data
        setCompanyDetailsPopupOpen(true);
      } else {
        toast.error("Company details not found");
      }
    } catch (error) {
      console.error("❌ ERROR fetching company details:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.clear();
        navigate("/super-admin/login");
        return;
      }
      
      toast.error("Failed to load company details");
    } finally {
      setCompanyDetailsLoading(false);
    }
  };

  // Update company details
  const handleUpdateCompany = async () => {
    try {
      if (!validateSuperAdmin()) return;
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log("🔄 Updating company:", editedCompany._id);
      console.log("Updated data:", editedCompany);
      
      const response = await axios.put(
        `${API_URL}/company/${editedCompany?._id}`,
        editedCompany,
        { headers }
      );
      
      if (response.data) {
        toast.success("Company updated successfully!");
        
        // Update the companies list
        const updatedCompanies = companies.map(company => 
          company._id === editedCompany._id ? { ...company, ...editedCompany } : company
        );
        
        setCompanies(updatedCompanies);
        setFilteredCompanies(updatedCompanies);
        setCompanyDetails(response.data);
        setEditMode(false);
        
        // Refresh the data
        fetchCompaniesWithUsers();
      }
    } catch (error) {
      console.error("❌ ERROR updating company:", error);
      toast.error(error.response?.data?.message || "Failed to update company");
    }
  };

  // Fetch all users and group by company
  const fetchAllUsers = async () => {
    console.log("🔍 Fetching all users...");
    
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log("📡 API URL:", `${API_URL}/super-admin/users`);
      
      const response = await axios.get(`${API_URL}/super-admin/users`, { headers });
      
      console.log("✅ Users API response received");
      console.log("Total users:", response.data?.length || 0);
      
      if (response.data && response.data.length > 0) {
        // Create a map of users grouped by company ID
        const usersByCompany = {};
        
        response.data.forEach(user => {
          const companyId = user.company?._id || user.company;
          if (companyId) {
            if (!usersByCompany[companyId]) {
              usersByCompany[companyId] = [];
            }
            usersByCompany[companyId].push(user);
          } else {
            console.log("⚠️ User without company:", user.email);
          }
        });
        
        console.log("📊 Users grouped by company:", Object.keys(usersByCompany).length, "companies have users");
        
        return usersByCompany;
      }
      return {};
    } catch (error) {
      console.error("❌ ERROR in fetchAllUsers:", error.response?.data || error.message);
      console.error("Status:", error.response?.status);
      return {};
    }
  };

  // Main function to fetch companies with users
  const fetchCompaniesWithUsers = async () => {
    if (!validateSuperAdmin()) {
      console.log("❌ Validation failed");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Starting to fetch companies with users...");
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Step 1: Fetch all companies
      console.log("📡 Fetching companies from:", `${API_URL}/super-admin/companies`);
      const companiesRes = await axios.get(
        `${API_URL}/super-admin/companies`,
        { headers }
      );

      const companiesData = companiesRes.data || [];
      console.log("✅ Companies fetched:", companiesData.length);

      // Step 2: Fetch all users
      const usersByCompany = await fetchAllUsers();

      // Step 3: Combine companies with their users
      const companiesWithUsers = companiesData.map(company => {
        const companyUsers = usersByCompany[company._id] || [];
        return {
          ...company,
          userCount: companyUsers.length,
          users: companyUsers.slice(0, 3) // Show only first 3 users for preview
        };
      });

      console.log("📊 Final companies data with user counts:");
      companiesWithUsers.forEach(company => {
        console.log(`   - ${company.companyName}: ${company.userCount} users`);
      });

      setCompanies(companiesWithUsers);
      setFilteredCompanies(companiesWithUsers);

    } catch (error) {
      console.error("❌ ERROR in fetchCompaniesWithUsers:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.clear();
        navigate("/super-admin/login");
        return;
      }

      toast.error("Failed to load data. Please try again.");
      
      // Try alternative method
      await fetchCompaniesAndUsersSeparately();
    } finally {
      setLoading(false);
      console.log("🏁 Data loading completed");
    }
  };

  // Fallback method for separate API calls
  const fetchCompaniesAndUsersSeparately = async () => {
    console.log("🔄 Trying fallback method...");
    
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch companies
      const companiesRes = await axios.get(
        `${API_URL}/super-admin/companies`,
        { headers }
      );

      const companiesData = companiesRes.data || [];
      console.log("📊 Companies in fallback:", companiesData.length);

      // For each company, fetch users separately
      const companiesWithUsers = await Promise.all(
        companiesData.map(async (company) => {
          try {
            console.log(`👥 Fetching users for company: ${company.companyName} (${company._id})`);
            
            const usersRes = await axios.get(
              `${API_URL}/super-admin/company/${company._id}/users`,
              { headers }
            );
            
            console.log(`   ✅ Users for ${company.companyName}:`, usersRes.data.length);
            
            return {
              ...company,
              userCount: usersRes.data.length,
              users: usersRes.data.slice(0, 3)
            };
          } catch (err) {
            console.error(`   ❌ Error fetching users for ${company.companyName}:`, err.message);
            return {
              ...company,
              userCount: 0,
              users: []
            };
          }
        })
      );

      console.log("✅ Fallback completed successfully");
      setCompanies(companiesWithUsers);
      setFilteredCompanies(companiesWithUsers);
      
    } catch (error) {
      console.error("❌ Fallback method failed:", error);
      toast.error("Failed to load company data");
    }
  };

  // Handle search and filter
  useEffect(() => {
    let results = companies;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(company =>
        company.companyName?.toLowerCase().includes(term) ||
        company.companyEmail?.toLowerCase().includes(term) ||
        company.companyCode?.toLowerCase().includes(term) ||
        company.ownerName?.toLowerCase().includes(term)
      );
    }

    if (filter === "active") {
      results = results.filter(company => company.isActive === true);
    } else if (filter === "inactive") {
      results = results.filter(company => company.isActive === false);
    }

    console.log(`🔍 Filter applied: ${searchTerm ? 'Search: ' + searchTerm : ''} ${filter !== 'all' ? 'Filter: ' + filter : ''}`);
    console.log(`   Results: ${results.length} companies`);
    
    setFilteredCompanies(results);
  }, [searchTerm, filter, companies]);

  // Initial load
  useEffect(() => {
    console.log("🚀 AllCompany component mounted");
    fetchCompaniesWithUsers();
  }, []);

  // Fetch users for popup
  const fetchCompanyUsers = async (companyId) => {
    try {
      setUsersLoading(true);
      console.log(`👥 Fetching users for company ID: ${companyId}`);
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Try multiple endpoints
      let users = [];
      
      try {
        // First try the direct company users endpoint
        const response = await axios.get(
          `${API_URL}/super-admin/company/${companyId}/users`,
          { headers }
        );
        users = response.data;
        console.log(`✅ Got ${users.length} users from company-specific endpoint`);
      } catch (error) {
        console.log(`⚠️ Company-specific endpoint failed, trying all users endpoint`);
        
        // Fallback: Fetch all users and filter by company
        const allUsersRes = await axios.get(
          `${API_URL}/super-admin/users`,
          { headers }
        );
        
        users = allUsersRes.data.filter(user => 
          user.company?._id === companyId || user.company === companyId
        );
        console.log(`✅ Got ${users.length} users from all users endpoint`);
      }
      
      setCompanyUsers(users);
    } catch (error) {
      console.error("❌ Error fetching company users:", error);
      toast.error("Failed to load users");
      setCompanyUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Open users popup
  const handleOpenUsersPopup = async (company) => {
    console.log(`📂 Opening users popup for: ${company.companyName}`);
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

  // Open company details popup
  const handleOpenCompanyDetails = async (company) => {
    console.log(`🏢 Opening company details for: ${company.companyName}`);
    setSelectedCompany(company);
    await fetchCompanyDetails(company._id);
  };

  // Close company details popup
  const handleCloseCompanyDetails = () => {
    setCompanyDetailsPopupOpen(false);
    setSelectedCompany(null);
    setCompanyDetails(null);
    setEditMode(false);
    setEditedCompany(null);
  };

  // Handle edit field change
  const handleEditChange = (field, value) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 0;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      console.log("📤 Exporting CSV...");
      
      const csvRows = [];
      
      // Headers
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
      
      // Data rows
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
      
      console.log(`✅ CSV exported with ${filteredCompanies.length} companies`);
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("❌ Export error:", error);
      toast.error("Failed to export report");
    }
  };

  // Toggle company expansion
  const toggleCompanyExpansion = async (companyId) => {
    if (expandedCompany === companyId) {
      console.log(`📂 Collapsing company: ${companyId}`);
      setExpandedCompany(null);
    } else {
      console.log(`📂 Expanding company: ${companyId}`);
      setExpandedCompany(companyId);
    }
  };

  // Create user for specific company
  const handleCreateUserForCompany = (companyId, companyCode) => {
    console.log(`👤 Creating user for company: ${companyId}, Code: ${companyCode}`);
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

  // Debug function
  const handleDebug = () => {
    console.log("=== DEBUG INFO ===");
    console.log("Companies:", companies.length);
    console.log("Filtered Companies:", filteredCompanies.length);
    console.log("Search Term:", searchTerm);
    console.log("Filter:", filter);
    
    companies.forEach((company, index) => {
      console.log(`Company ${index + 1}: ${company.companyName}`);
      console.log(`  - Users: ${company.userCount}`);
      console.log(`  - Users array:`, company.users?.length || 0);
    });
    
    console.log("API URL:", API_URL);
    console.log("LocalStorage superAdmin:", localStorage.getItem("superAdmin")?.substring(0, 100) + "...");
    console.log("LocalStorage token exists:", !!localStorage.getItem("token"));
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading Companies Data...</p>
        <button 
          onClick={handleDebug}
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
          Debug in Console
        </button>
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
          <button 
            onClick={handleDebug}
            style={{
              marginLeft: "20px",
              padding: "8px 16px",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Debug
          </button>
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
            <button 
              onClick={fetchCompaniesWithUsers}
              style={{
                padding: "10px 20px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "15px"
              }}
            >
              Retry Loading
            </button>
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
              <div style={{
                ...styles.companyDetails,
                display: expandedCompany === company._id ? 'block' : 'none'
              }}>
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
                    <button
                      onClick={() => handleCreateUserForCompany(company._id, company.companyCode)}
                      style={{
                        padding: "8px 16px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        marginTop: "10px",
                        fontSize: "12px"
                      }}
                    >
                      + Add First User
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                <button
                  onClick={() => handleOpenCompanyDetails(company)}
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

      {/* Company Details Popup Dialog */}
      <Dialog
        open={companyDetailsPopupOpen}
        onClose={handleCloseCompanyDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle style={styles.companyDialogTitle}>
          <div style={styles.companyDialogHeader}>
            <div style={styles.companyDialogTitleContent}>
              <Business style={{ fontSize: 28, marginRight: 10, color: '#6366f1' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b' }}>
                  {selectedCompany?.companyName || 'Company'} Details
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                  {editMode ? 'Edit Mode' : 'View Mode'} | Company Code: {selectedCompany?.companyCode}
                </p>
              </div>
            </div>
            <Box>
              {!editMode ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  variant="outlined"
                  size="small"
                  style={{ marginRight: '10px' }}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      setEditedCompany(companyDetails);
                    }}
                    variant="outlined"
                    size="small"
                    style={{ marginRight: '10px' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateCompany}
                    variant="contained"
                    size="small"
                    color="primary"
                  >
                    Save
                  </Button>
                </>
              )}
              <IconButton onClick={handleCloseCompanyDetails} style={styles.closeButton}>
                <Close />
              </IconButton>
            </Box>
          </div>
        </DialogTitle>
        
        <DialogContent dividers style={styles.companyDialogContent}>
          {companyDetailsLoading ? (
            <div style={styles.loadingUsers}>
              <div style={styles.smallSpinner}></div>
              <p>Loading company details...</p>
            </div>
          ) : companyDetails ? (
            <Grid container spacing={3}>
              {/* Company Logo and Status */}
              <Grid item xs={12}>
                <Box sx={styles.companyDetailsHeader}>
                  <Avatar
                    src={companyDetails.logo}
                    sx={styles.companyDetailsLogo}
                    alt={companyDetails.companyName}
                  >
                    {companyDetails.companyName?.charAt(0) || 'C'}
                  </Avatar>
                  <Box sx={styles.companyDetailsStatus}>
                    {editMode ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editedCompany?.isActive || false}
                            onChange={(e) => handleEditChange('isActive', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={editedCompany?.isActive ? "Active" : "Inactive"}
                      />
                    ) : (
                      <Chip
                        icon={companyDetails.isActive ? <CheckCircle /> : <Cancel />}
                        label={companyDetails.isActive ? "Active" : "Inactive"}
                        color={companyDetails.isActive ? "success" : "error"}
                        size="medium"
                      />
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" /> Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Company Name</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.companyName || ''}
                      onChange={(e) => handleEditChange('companyName', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1">{companyDetails.companyName}</Typography>
                  )}
                </Box>
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Company Code</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.companyCode || ''}
                      onChange={(e) => handleEditChange('companyCode', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1">{companyDetails.companyCode}</Typography>
                  )}
                </Box>
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Owner Name</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.ownerName || ''}
                      onChange={(e) => handleEditChange('ownerName', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1">{companyDetails.ownerName}</Typography>
                  )}
                </Box>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" /> Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.companyEmail || ''}
                      onChange={(e) => handleEditChange('companyEmail', e.target.value)}
                      variant="outlined"
                      type="email"
                    />
                  ) : (
                    <Typography variant="body1">{companyDetails.companyEmail}</Typography>
                  )}
                </Box>
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Phone</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.companyPhone || ''}
                      onChange={(e) => handleEditChange('companyPhone', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1">{companyDetails.companyPhone}</Typography>
                  )}
                </Box>
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Domain</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.companyDomain || ''}
                      onChange={(e) => handleEditChange('companyDomain', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1">{companyDetails.companyDomain}</Typography>
                  )}
                </Box>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" /> Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editedCompany?.companyAddress || ''}
                    onChange={(e) => handleEditChange('companyAddress', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{companyDetails.companyAddress}</Typography>
                )}
              </Grid>

              {/* URLs */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Link fontSize="small" /> URLs
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Login URL</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.loginUrl || ''}
                      onChange={(e) => handleEditChange('loginUrl', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {window.location.origin}{companyDetails.loginUrl}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Logo URL</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.logo || ''}
                      onChange={(e) => handleEditChange('logo', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {companyDetails.logo || 'Not provided'}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Database */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage fontSize="small" /> Database
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Database Identifier</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedCompany?.dbIdentifier || ''}
                      onChange={(e) => handleEditChange('dbIdentifier', e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {companyDetails.dbIdentifier}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Dates */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" /> Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Created On</Typography>
                  <Typography variant="body1">{formatDate(companyDetails.createdAt)}</Typography>
                </Box>
                
                <Box sx={styles.detailField}>
                  <Typography variant="body2" color="textSecondary">Last Updated</Typography>
                  <Typography variant="body1">{formatDate(companyDetails.updatedAt)}</Typography>
                </Box>
              </Grid>

              {/* Subscription */}
              {companyDetails.subscriptionExpiry && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security fontSize="small" /> Subscription Status
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={styles.detailField}>
                    <Typography variant="body2" color="textSecondary">Expires On</Typography>
                    <Typography variant="body1">{formatDate(companyDetails.subscriptionExpiry)}</Typography>
                  </Box>
                  
                  <Box sx={styles.detailField}>
                    <Typography variant="body2" color="textSecondary">Days Remaining</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ 
                        color: getDaysRemaining(companyDetails.subscriptionExpiry) > 30 ? 'success.main' : 
                               getDaysRemaining(companyDetails.subscriptionExpiry) > 7 ? 'warning.main' : 'error.main'
                      }}>
                        {getDaysRemaining(companyDetails.subscriptionExpiry)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">days</Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((getDaysRemaining(companyDetails.subscriptionExpiry) / 30) * 100, 100)}
                    sx={{ 
                      mt: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getDaysRemaining(companyDetails.subscriptionExpiry) > 30 ? 'success.main' : 
                                       getDaysRemaining(companyDetails.subscriptionExpiry) > 7 ? 'warning.main' : 'error.main'
                      }
                    }}
                  />
                </Grid>
              )}
            </Grid>
          ) : (
            <Box sx={styles.noData}>
              <Business sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">Company details not found</Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions style={styles.companyDialogActions}>
          <Button 
            onClick={handleCloseCompanyDetails}
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
              + Add User to this Company
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Users Popup Dialog (Existing) */}
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
              {selectedCompany && (
                <Button 
                  onClick={() => handleCreateUserForCompany(selectedCompany._id, selectedCompany.companyCode)}
                  variant="contained"
                  style={{
                    marginTop: "20px",
                    background: "#10b981",
                    color: "white"
                  }}
                >
                  + Create First User
                </Button>
              )}
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
  // Company Details Dialog Styles
  companyDialogTitle: {
    padding: "20px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  companyDialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  companyDialogTitleContent: {
    display: "flex",
    alignItems: "center",
  },
  companyDialogContent: {
    padding: "20px",
    overflowY: "auto",
  },
  companyDetailsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mb: 3,
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 2,
  },
  companyDetailsLogo: {
    width: 80,
    height: 80,
    fontSize: 32,
    bgcolor: 'primary.main',
  },
  companyDetailsStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  detailField: {
    mb: 2,
    p: 1.5,
    bgcolor: 'grey.50',
    borderRadius: 1,
  },
  companyDialogActions: {
    padding: "16px 24px",
    background: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
  },
  noData: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 6,
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