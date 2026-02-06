import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config";
import {
  Business,
  Email,
  Phone,
  LocationOn,
  Person,
  CalendarToday,
  CheckCircle,
  Cancel,
  Edit,
  Refresh,
  ArrowBack,
  Security,
  Domain,
  Link,
  Image,
  Storage,
  Settings,
  People
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Box,
  LinearProgress,
  Avatar,
  CircularProgress
} from "@mui/material";

const CompanyDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    departments: 0,
    todayLogins: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [userRole, setUserRole] = useState("");

  // Current logged-in user की company fetch करें
  const fetchCurrentUserCompany = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login to view company details");
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Step 1: सबसे पहले आपके नए API से company users fetch करें
      try {
        const response = await axios.get(
          `${API_URL}/users/company-users`,
          { headers }
        );
        
        if (response.data && response.data.success) {
          const data = response.data.message;
          console.log("Company users API response:", data);
          
          // Company details को पूरा data के साथ set करें
          const companyId =
    data.company?.id?._id ||
    data.company?._id;

    if (!companyId) {
    toast.error("Company ID not found from API");
    return;
    }

    const companyData = {
    _id: companyId,
    companyName: data.company?.name || "Company",
    companyCode: data.company?.companyCode || "",
    logo: data.company?.id?.logo || "",
    isActive: data.company?.id?.isActive ?? true,

    companyEmail: "ciisnetwork@gmail.com",
    companyPhone: "8340185442",
    companyAddress: "123 Example Street",
    companyDomain: "gmail.com",
    ownerName: "company",
    loginUrl: "/company/CIISNE/login",
    dbIdentifier: "company_1770057695345_h1bxxgl",
    createdAt: "2026-02-03T12:11:00.000Z",
    updatedAt: "2026-02-03T12:11:00.000Z",
    subscriptionExpiry: "2026-03-05T12:11:00.000Z"
    };

          
          // Try to get more company details from users data
          if (data.users && data.users.length > 0) {
            const firstUser = data.users[0];
            if (firstUser.company) {
              companyData.companyEmail = firstUser.company.companyEmail || companyData.companyEmail;
              companyData.companyPhone = firstUser.company.companyPhone || companyData.companyPhone;
              companyData.companyAddress = firstUser.company.companyAddress || companyData.companyAddress;
              companyData.logo = firstUser.company.logo || companyData.logo;
            }
          }
          
          setCompany(companyData);
          
          // Users data
          const users = data.users || [];
          setRecentUsers(users.slice(0, 5)); // First 5 users for recent
          
          // Calculate statistics
          const activeUsers = users.filter(user => user.isActive).length;
          const departments = new Set(users.map(user => user.department)).size;
          
          setStats({
            totalUsers: data.count || users.length,
            activeUsers,
            departments,
            todayLogins: 0 // You can add logic for today's logins if available
          });
          
          // Set user role from current user
          if (data.currentUser) {
            setUserRole(data.currentUser.name || "user");
          }
          
          // Store in localStorage for future use
          localStorage.setItem("company", JSON.stringify(companyData));
          return;
        }
      } catch (apiError) {
        console.log("Company users API failed:", apiError.message);
        // Fallback: Try to get company from localStorage
        await fetchCompanyFromLocalStorage(headers);
      }
      
    } catch (error) {
      console.error("Error fetching company details:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again!");
        localStorage.clear();
        navigate("/login");
        return;
      }
      
      toast.error("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  // Fallback method
  const fetchCompanyFromLocalStorage = async (headers) => {
    try {
      const companyData = localStorage.getItem("company");
      if (companyData) {
        const companyInfo = JSON.parse(companyData);
        
        // Set default values if missing
        const fullCompanyData = {
          ...companyInfo,
          companyEmail: companyInfo.companyEmail || "ciisnetwork@gmail.com",
          companyPhone: companyInfo.companyPhone || "8340185442",
          companyAddress: companyInfo.companyAddress || "123 Example Street",
          companyDomain: companyInfo.companyDomain || "gmail.com",
          ownerName: companyInfo.ownerName || "company",
          loginUrl: companyInfo.loginUrl || "/company/CIISNE/login",
          dbIdentifier: companyInfo.dbIdentifier || "company_1770057695345_h1bxxgl",
          createdAt: companyInfo.createdAt || "2026-02-03T12:11:00.000Z",
          updatedAt: companyInfo.updatedAt || "2026-02-03T12:11:00.000Z",
          subscriptionExpiry: companyInfo.subscriptionExpiry || "2026-03-05T12:11:00.000Z",
          logo: companyInfo.logo || "https://cds.ciisnetwork.in/logoo.png"
        };
        
        setCompany(fullCompanyData);
        
        // Try to fetch users
        try {
          const usersRes = await axios.get(
            `${API_URL}/super-admin/company/${fullCompanyData._id}/users`,
            { headers }
          );
          
          const users = usersRes.data || [];
          setRecentUsers(users.slice(0, 5));
          
          const activeUsers = users.filter(user => user.isActive).length;
          const departments = new Set(users.map(user => user.department)).size;
          
          setStats({
            totalUsers: users.length,
            activeUsers,
            departments,
            todayLogins: 0
          });
        } catch (usersError) {
          console.error("Error fetching users:", usersError);
        }
      } else {
        toast.error("Company data not found");
      }
    } catch (error) {
      console.error("Error in fallback method:", error);
      toast.error("Failed to load company details");
    }
  };

  // Format date function
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

  // Days remaining calculation
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 27; // Default
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 27; // Default
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchCurrentUserCompany();
  };

  // Initial load
  useEffect(() => {
    fetchCurrentUserCompany();
  }, []);

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: 'primary.main' }} />
        <Typography variant="h6" color="textSecondary">
          Loading company details...
        </Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={styles.errorContainer}>
        <Typography variant="h6" color="error" gutterBottom>
          Company details not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/Ciis-network/SuperAdminDashboard")}
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const daysRemaining = getDaysRemaining(company.subscriptionExpiry);

  return (
    <Box sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        <Box sx={styles.headerContent}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={styles.backButton}
          >
            Back
          </Button>
          
          <Box sx={styles.headerTitle}>
            <Business sx={styles.headerIcon} />
            <Typography variant="h4" sx={styles.title}>
              {company.companyName} - Company Details
            </Typography>
          </Box>
          
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={styles.refreshButton}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Company Info */}
        <Grid item xs={12} md={8}>
          {/* Company Profile Card */}
          <Card sx={styles.profileCard}>
            <CardContent>
              <Box sx={styles.profileHeader}>
                <Avatar
                  src={company.logo}
                  sx={styles.companyLogo}
                  alt={company.companyName}
                >
                  {company.companyName?.charAt(0) || 'C'}
                </Avatar>
                
                <Box sx={styles.profileInfo}>
                  <Typography variant="h5" gutterBottom>
                    {company.companyName}
                  </Typography>
                  
                  <Box sx={styles.statusContainer}>
                    <Chip
                      icon={company.isActive ? <CheckCircle /> : <Cancel />}
                      label={company.isActive ? "Active" : "Inactive"}
                      color={company.isActive ? "success" : "error"}
                      sx={styles.statusChip}
                    />
                    
                    <Chip
                      label={`Code: ${company.companyCode}`}
                      variant="outlined"
                      sx={styles.codeChip}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Company Details Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Email sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {company.companyEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Phone sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {company.companyPhone || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <LocationOn sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {company.companyAddress || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Person sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Owner
                      </Typography>
                      <Typography variant="body1">
                        {company.ownerName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Domain sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Domain
                      </Typography>
                      <Typography variant="body1">
                        {company.companyDomain || "Not specified"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Link sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Login URL
                      </Typography>
                      <Typography variant="body1" sx={styles.urlText}>
                        {window.location.origin}{company.loginUrl}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Storage sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Database Identifier
                      </Typography>
                      <Typography variant="body1" sx={styles.dbText}>
                        {company.dbIdentifier}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.detailItem}>
                    <Image sx={styles.detailIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Logo URL
                      </Typography>
                      <Typography variant="body1" sx={styles.urlText}>
                        {company.logo || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Dates Section */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={styles.dateItem}>
                    <CalendarToday sx={styles.dateIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Created On
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(company.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={styles.dateItem}>
                    <CalendarToday sx={styles.dateIcon} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(company.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={styles.subscriptionCard}>
                    <Box sx={styles.subscriptionHeader}>
                      <Security sx={styles.subscriptionIcon} />
                      <Typography variant="h6">
                        Subscription Status
                      </Typography>
                    </Box>
                    
                    <Box sx={styles.subscriptionDetails}>
                      <Typography variant="body1" gutterBottom>
                        Expires on: {formatDate(company.subscriptionExpiry)}
                      </Typography>
                      
                      <Box sx={styles.daysRemaining}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: daysRemaining > 30 ? 'success.main' : 
                                  daysRemaining > 7 ? 'warning.main' : 'error.main'
                          }}
                        >
                          {daysRemaining}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          days remaining
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((daysRemaining / 30) * 100, 100)}
                        sx={{ 
                          mt: 2,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: daysRemaining > 30 ? 'success.main' : 
                                           daysRemaining > 7 ? 'warning.main' : 'error.main'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Stats and Actions */}
        <Grid item xs={12} md={4}>
          {/* Stats Card */}
          <Card sx={styles.statsCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={styles.statsTitle}>
                Company Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={styles.statItem}>
                    <Typography variant="h4" sx={styles.statNumber}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={styles.statItem}>
                    <Typography variant="h4" sx={{...styles.statNumber, color: 'success.main'}}>
                      {stats.activeUsers}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Users
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={styles.statItem}>
                    <Typography variant="h4" sx={styles.statNumber}>
                      {stats.departments}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Departments
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={styles.statItem}>
                    <Typography variant="h4" sx={{...styles.statNumber, color: 'info.main'}}>
                      {stats.todayLogins}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Today's Logins
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recent Users Card */}
          <Card sx={styles.usersCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={styles.usersTitle}>
                Recent Users ({recentUsers.length})
              </Typography>
              
              {recentUsers.length > 0 ? (
                <Box sx={styles.usersList}>
                  {recentUsers.map((user, index) => (
                    <Box key={user.id || index} sx={styles.userItem}>
                      <Avatar sx={styles.userAvatar}>
                        {user.name?.charAt(0) || 'U'}
                      </Avatar>
                      
                      <Box sx={styles.userInfo}>
                        <Typography variant="body2" sx={styles.userName}>
                          {user.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.role || 'User'} • {user.department || 'No Dept'}
                        </Typography>
                      </Box>
                      
                      <Chip
                        size="small"
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        sx={styles.userStatus}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={styles.noUsers}>
                  <People sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body2" color="textSecondary" align="center">
                    No users found
                  </Typography>
                </Box>
              )}
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(`/Ciis-network/create-user?company=${company._id}&companyCode=${company.companyCode}`)}
                sx={{ mt: 2 }}
              >
                Add New User
              </Button>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card sx={styles.actionsCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={styles.actionsTitle}>
                Quick Actions
              </Typography>
              
              <Box sx={styles.actionsList}>
                <Button
                  fullWidth
                  startIcon={<Edit />}
                  variant="contained"
                  onClick={() => navigate(`/Ciis-network/company/edit/${company._id}`)}
                  sx={styles.actionButton}
                >
                  Edit Company
                </Button>
                
                <Button
                  fullWidth
                  startIcon={<Person />}
                  variant="outlined"
                  onClick={() => navigate(`/Ciis-network/create-user?company=${company._id}&companyCode=${company.companyCode}`)}
                  sx={styles.actionButton}
                >
                  Add New User
                </Button>
                
                <Button
                  fullWidth
                  startIcon={<Settings />}
                  variant="outlined"
                  onClick={() => navigate(`/Ciis-network/company/settings/${company._id}`)}
                  sx={styles.actionButton}
                >
                  Company Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Styles (same as original)
const styles = {
  container: {
    p: 3,
    bgcolor: 'background.default',
    minHeight: '100vh'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 2
  },
  header: {
    mb: 4,
    bgcolor: 'white',
    borderRadius: 2,
    boxShadow: 1,
    p: 2
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    color: 'text.secondary'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  headerIcon: {
    fontSize: 32,
    color: 'primary.main'
  },
  title: {
    fontWeight: 600,
    color: 'text.primary'
  },
  refreshButton: {
    color: 'primary.main'
  },
  profileCard: {
    borderRadius: 2,
    boxShadow: 3,
    mb: 3
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    mb: 3
  },
  companyLogo: {
    width: 100,
    height: 100,
    fontSize: 40,
    bgcolor: 'primary.main'
  },
  profileInfo: {
    flex: 1
  },
  statusContainer: {
    display: 'flex',
    gap: 2,
    mt: 1
  },
  statusChip: {
    fontWeight: 600
  },
  codeChip: {
    fontWeight: 500
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 1,
    mb: 2
  },
  detailIcon: {
    color: 'primary.main',
    fontSize: 24
  },
  urlText: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    wordBreak: 'break-all'
  },
  dbText: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'text.secondary'
  },
  dateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 1
  },
  dateIcon: {
    color: 'secondary.main',
    fontSize: 24
  },
  subscriptionCard: {
    p: 3,
    bgcolor: 'primary.50',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'primary.100'
  },
  subscriptionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3
  },
  subscriptionIcon: {
    color: 'primary.main',
    fontSize: 28
  },
  subscriptionDetails: {
    textAlign: 'center'
  },
  daysRemaining: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    my: 2
  },
  statsCard: {
    borderRadius: 2,
    boxShadow: 2,
    mb: 3
  },
  statsTitle: {
    fontWeight: 600,
    color: 'text.primary',
    borderBottom: '2px solid',
    borderColor: 'primary.main',
    pb: 1
  },
  statItem: {
    textAlign: 'center',
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 1
  },
  statNumber: {
    fontWeight: 700,
    color: 'primary.main'
  },
  usersCard: {
    borderRadius: 2,
    boxShadow: 2,
    mb: 3
  },
  usersTitle: {
    fontWeight: 600,
    color: 'text.primary',
    borderBottom: '2px solid',
    borderColor: 'secondary.main',
    pb: 1
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 1
  },
  userAvatar: {
    width: 40,
    height: 40,
    bgcolor: 'secondary.main'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontWeight: 600
  },
  userStatus: {
    fontSize: '0.75rem'
  },
  noUsers: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4
  },
  actionsCard: {
    borderRadius: 2,
    boxShadow: 2
  },
  actionsTitle: {
    fontWeight: 600,
    color: 'text.primary',
    borderBottom: '2px solid',
    borderColor: 'info.main',
    pb: 1
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  actionButton: {
    py: 1.5,
    borderRadius: 1
  }
};

export default CompanyDetails;