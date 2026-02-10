import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../../config";
import {
  Business,
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
  People,
  ListAlt,
  Close,
  Save,
  Delete,
  Code,
  Work,
  Email,
  Phone,
  Language,
  AccessTime,
  Today,
  Group,
  School,
  Login,
  CardMembership,
  MoreVert,
  Dashboard,
  AdminPanelSettings,
  VerifiedUser,
  CorporateFare,
  Badge,
  Web,
  Description,
  Speed,
  TrendingUp
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Autocomplete,
  Paper,
  Stack,
  Tooltip,
  Badge as MuiBadge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Menu,
  MenuItem,
  alpha,
  CardHeader,
  CardActions,
  Fade,
  Grow
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
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    department: "",
    isActive: true,
    designation: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Separate states for departments and job roles
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);

  // Fetch departments API - Updated to match your API response
  const fetchDepartments = async (companyId) => {
    if (!companyId) return;
    
    try {
      setLoadingDepartments(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/departments`,
        { 
          headers,
          params: { company: companyId } // Add company as query parameter
        }
      );
      
      console.log("Departments API Response:", response.data);
      
      if (response.data && response.data.success) {
        const departmentsData = response.data.departments || [];
        
        // Extract department names for dropdown
        const departmentOptions = departmentsData.map(dept => ({
          id: dept._id,
          name: dept.name,
          label: dept.name, // For Autocomplete
          value: dept.name  // For form value
        }));
        
        console.log("Processed departments:", departmentOptions);
        setDepartments(departmentOptions);
        
        // Also update stats with department count
        setStats(prev => ({
          ...prev,
          departments: response.data.count || departmentsData.length
        }));
      } else {
        toast.error("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error(error.response?.data?.message || "Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch job roles API - Updated to match your API response
  const fetchJobRoles = async (companyId) => {
    if (!companyId) return;
    
    try {
      setLoadingJobRoles(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/job-roles`,
        { 
          headers,
          params: { company: companyId } // Add company as query parameter
        }
      );
      
      console.log("Job Roles API Response:", response.data);
      
      if (response.data && response.data.success) {
        const jobRolesData = response.data.jobRoles || [];
        
        // Extract job role names for dropdown
        const jobRoleOptions = jobRolesData.map(role => ({
          id: role._id,
          name: role.name,
          label: role.name, // For Autocomplete
          value: role.name, // For form value
          departmentId: role.department?._id,
          departmentName: role.department?.name
        }));
        
        console.log("Processed job roles:", jobRoleOptions);
        setJobRoles(jobRoleOptions);
      } else {
        toast.error("Failed to fetch job roles");
      }
    } catch (error) {
      console.error("Error fetching job roles:", error);
      toast.error(error.response?.data?.message || "Error loading job roles");
    } finally {
      setLoadingJobRoles(false);
    }
  };

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

      // Step 1: Company users API से data fetch करें
      try {
        const response = await axios.get(
          `${API_URL}/users/company-users`,
          { headers }
        );
        
        if (response.data && response.data.success) {
          const data = response.data.message;
          
          // Extract company ID properly
          let companyId = "";
          let companyDetails = {};
          
          // Multiple ways to get company ID
          if (data.company?.id?._id) {
            companyId = data.company.id._id;
            companyDetails = data.company.id;
          } else if (data.company?._id) {
            companyId = data.company._id;
            companyDetails = data.company;
          } else if (data.company?.id) {
            companyId = data.company.id;
            companyDetails = data.company;
          } else if (data.users && data.users.length > 0 && data.users[0].company) {
            // Try to get from first user's company data
            companyId = data.users[0].company._id || data.users[0].company.id;
            companyDetails = data.users[0].company;
          }
          
          if (!companyId) {
            console.error("Company ID not found in response");
            toast.error("Company information not found in API response");
            await fetchCompanyFromLocalStorage(headers);
            return;
          }
          
          // Build company data object
          const companyData = {
            _id: companyId,
            companyName: companyDetails.name || data.company?.name || "Company",
            companyCode: companyDetails.companyCode || data.company?.companyCode || "",
            logo: companyDetails.logo || data.company?.logo || "",
            isActive: companyDetails.isActive ?? data.company?.isActive ?? true,
            // companyEmail: companyDetails.email || data.company?.email || companyDetails.companyEmail || "ciisnetwork@gmail.com",
            // companyPhone: companyDetails.phone || data.company?.phone || companyDetails.companyPhone || "8340185442",
            // companyAddress: companyDetails.address || data.company?.address || companyDetails.companyAddress || "123 Example Street",
            companyDomain: companyDetails.domain || data.company?.domain || "gmail.com",
            ownerName: companyDetails.ownerName || data.company?.ownerName || "company",
            loginUrl: companyDetails.loginUrl || data.company?.loginUrl || `/company/${companyDetails.companyCode || "COMPANY"}/login`,
            dbIdentifier: companyDetails.dbIdentifier || data.company?.dbIdentifier || `company_${companyId}`,
            createdAt: companyDetails.createdAt || data.company?.createdAt || new Date().toISOString(),
            updatedAt: companyDetails.updatedAt || data.company?.updatedAt || new Date().toISOString(),
            subscriptionExpiry: companyDetails.subscriptionExpiry || data.company?.subscriptionExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          console.log("Company data set:", companyData);
          setCompany(companyData);
          
          // Users data
          const users = data.users || [];
          console.log("Users fetched:", users);
          setRecentUsers(users.slice(0, 5)); // First 5 users for recent
          
          // Calculate statistics
          const activeUsers = users.filter(user => user.isActive).length;
          // Note: department count will be updated from departments API
          
          setStats(prev => ({
            ...prev,
            totalUsers: data.count || users.length,
            activeUsers,
            todayLogins: Math.floor(Math.random() * 50) // Demo data
          }));
          
          // Set user role from current user
          if (data.currentUser) {
            setUserRole(data.currentUser.name || data.currentUser.role || "user");
          }
          
          // Store in localStorage for future use
          localStorage.setItem("company", JSON.stringify(companyData));
          
          // Also store company code if available
          if (companyData.companyCode) {
            localStorage.setItem("companyCode", companyData.companyCode);
          }
          
          // Fetch departments and job roles for this company
          console.log("Fetching departments and job roles for company:", companyId);
          await fetchDepartments(companyId);
          await fetchJobRoles(companyId);
          
          return;
        }
      } catch (apiError) {
        console.error("Company users API failed:", apiError);
        console.log("API Error details:", apiError.response?.data);
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

  // Fetch company from localStorage
  const fetchCompanyFromLocalStorage = async (headers) => {
    try {
      const companyData = localStorage.getItem("company");
      if (companyData) {
        const companyInfo = JSON.parse(companyData);
        
        // Set default values if missing
        const fullCompanyData = {
          ...companyInfo,
          companyName: companyInfo.companyName || companyInfo.name || "Company",
          companyCode: companyInfo.companyCode || "",
          // companyEmail: companyInfo.companyEmail || "ciisnetwork@gmail.com",
          // companyPhone: companyInfo.companyPhone || "8340185442",
          // companyAddress: companyInfo.companyAddress || "123 Example Street",
          companyDomain: companyInfo.companyDomain || "gmail.com",
          ownerName: companyInfo.ownerName || "company",
          loginUrl: companyInfo.loginUrl || "/company/CIISNE/login",
          dbIdentifier: companyInfo.dbIdentifier || "company_1770057695345_h1bxxgl",
          createdAt: companyInfo.createdAt || "2026-02-03T12:11:00.000Z",
          updatedAt: companyInfo.updatedAt || "2026-02-03T12:11:00.000Z",
          subscriptionExpiry: companyInfo.subscriptionExpiry || "2026-03-05T12:11:00.000Z",
          logo: companyInfo.logo || "https://cds.ciisnetwork.in/logoo.png"
        };
        
        console.log("Company from localStorage:", fullCompanyData);
        setCompany(fullCompanyData);
        
        // Fetch departments and job roles for this company
        if (fullCompanyData._id) {
          console.log("Fetching for localStorage company:", fullCompanyData._id);
          await fetchDepartments(fullCompanyData._id);
          await fetchJobRoles(fullCompanyData._id);
          
          // Try to fetch users using company ID
          try {
            const usersRes = await axios.get(
              `${API_URL}/superAdmin/company/${fullCompanyData._id}/users`,
              { headers }
            );
            
            const users = usersRes.data || [];
            setRecentUsers(users.slice(0, 5));
            
            const activeUsers = users.filter(user => user.isActive).length;
            
            setStats({
              totalUsers: users.length,
              activeUsers,
              departments: 0, // Will be updated by departments API
              todayLogins: Math.floor(Math.random() * 50)
            });
          } catch (usersError) {
            console.error("Error fetching users:", usersError);
          }
        } else {
          toast.error("Company ID not found in localStorage");
        }
      } else {
        toast.error("Company data not found in localStorage");
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
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Days remaining calculation
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 27;
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 27;
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchCurrentUserCompany();
    toast.success("Data refreshed successfully!");
  };

  // Handle user edit - Open modal with user data
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      // email: user.email || "",
      role: user.role || "user",
      department: user.department || "",
      isActive: user.isActive ?? true,
      // phone: user.phone || "",
      designation: user.designation || ""
    });
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  // Handle department change with Autocomplete
  const handleDepartmentChange = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setEditFormData(prev => ({
        ...prev,
        department: newValue.name || newValue
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        department: newValue || ""
      }));
    }
  };

  // Handle job role change with Autocomplete
  const handleRoleChange = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setEditFormData(prev => ({
        ...prev,
        role: newValue.name || newValue
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        role: newValue || ""
      }));
    }
  };

  // Save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Determine which API to use based on your backend
      const userId = selectedUser.id || selectedUser._id;
      
      // Update user API call
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        editFormData,
        { headers }
      );
      
      if (response.data.success) {
        toast.success("User updated successfully!");
        
        // Update local state
        const updatedUsers = recentUsers.map(user => 
          (user.id === userId || user._id === userId) 
            ? { ...user, ...editFormData }
            : user
        );
        setRecentUsers(updatedUsers);
        
        // Update stats
        const activeUsers = updatedUsers.filter(user => user.isActive).length;
        setStats(prev => ({
          ...prev,
          activeUsers
        }));
        
        setEditModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser || !window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const userId = selectedUser.id || selectedUser._id;
      
      const response = await axios.delete(
        `${API_URL}/users/${userId}`,
        { headers }
      );
      
      if (response.data.success) {
        toast.success("User deleted successfully!");
        
        // Remove user from list
        const filteredUsers = recentUsers.filter(user => 
          user.id !== userId && user._id !== userId
        );
        setRecentUsers(filteredUsers);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          activeUsers: filteredUsers.filter(user => user.isActive).length
        }));
        
        setEditModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle view all users
  const handleViewAllUsers = () => {
    if (company && company._id) {
      navigate(`/Ciis-network/company/${company._id}/users`);
    } else {
      toast.error("Company ID not available");
    }
  };

  // Handle add new department
  const handleAddNewDepartment = async () => {
    const newDept = prompt("Enter new department name:");
    if (newDept && newDept.trim()) {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post(
          `${API_URL}/departments`,
          {
            name: newDept.trim(),
            company: company._id,
            companyCode: company.companyCode
          },
          { headers }
        );
        
        if (response.data.success) {
          toast.success("Department added successfully!");
          // Refresh departments
          fetchDepartments(company._id);
        } else {
          toast.error("Failed to add department");
        }
      } catch (error) {
        console.error("Error adding department:", error);
        toast.error(error.response?.data?.message || "Failed to add department");
      }
    }
  };

  // Handle add new job role
  const handleAddNewJobRole = async () => {
    const newRole = prompt("Enter new job role:");
    if (newRole && newRole.trim()) {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // First, let user select department for this role
        const deptResponse = await axios.get(
          `${API_URL}/departments`,
          { 
            headers,
            params: { company: company._id }
          }
        );
        
        if (deptResponse.data.success && deptResponse.data.departments.length > 0) {
          const departmentsList = deptResponse.data.departments;
          const deptOptions = departmentsList.map(dept => `${dept.name} (${dept._id})`).join('\n');
          const selectedDept = prompt(`Select department for this role:\n${deptOptions}\n\nEnter department ID:`);
          
          if (selectedDept) {
            const response = await axios.post(
              `${API_URL}/job-roles`,
              {
                name: newRole.trim(),
                company: company._id,
                companyCode: company.companyCode,
                department: selectedDept
              },
              { headers }
            );
            
            if (response.data.success) {
              toast.success("Job role added successfully!");
              // Refresh job roles
              fetchJobRoles(company._id);
            } else {
              toast.error("Failed to add job role");
            }
          }
        } else {
          toast.error("No departments found. Please create a department first.");
        }
      } catch (error) {
        console.error("Error adding job role:", error);
        toast.error(error.response?.data?.message || "Failed to add job role");
      }
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Initial load
  useEffect(() => {
    fetchCurrentUserCompany();
  }, []);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CircularProgress 
          size={80} 
          thickness={4} 
          sx={{ 
            mb: 3, 
            color: 'white',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          Loading Company Details...
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.8)',
            mt: 1
          }}
        >
          Please wait while we fetch the information
        </Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3,
        textAlign: 'center'
      }}>
        <Business sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Company Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Unable to load company details. Please try again.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/Ciis-network/SuperAdminDashboard")}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  const daysRemaining = getDaysRemaining(company.subscriptionExpiry);
  const subscriptionProgress = Math.min((daysRemaining / 30) * 100, 100);

  // Prepare department options for Autocomplete
  const departmentOptions = departments.map(dept => ({
    ...dept,
    label: dept.name
  }));

  // Prepare job role options for Autocomplete
  const jobRoleOptions = jobRoles.map(role => ({
    ...role,
    label: role.name
  }));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }} />
        <Box sx={{ 
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }} />
        
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          alignItems="center" 
          justifyContent="space-between"
          spacing={3}
          position="relative"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <ArrowBack />
            </IconButton>
            
            <Avatar
              src={company.logo}
              sx={{
                width: 80,
                height: 80,
                border: '4px solid white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              {company.companyName?.charAt(0) || 'C'}
            </Avatar>
            
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                {company.companyName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  icon={company.isActive ? <CheckCircle /> : <Cancel />}
                  label={company.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    bgcolor: company.isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                  }}
                />
                {company.companyCode && (
                  <Chip
                    icon={<Code />}
                    label={`Code: ${company.companyCode}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
          
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Company Overview */}
        <Grid item xs={12} lg={8}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <People sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'success.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <CheckCircle sx={{ fontSize: 28, color: 'success.main' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'warning.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <CorporateFare sx={{ fontSize: 28, color: 'warning.main' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mb: 0.5 }}>
                    {stats.departments}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Departments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'info.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <Today sx={{ fontSize: 28, color: 'info.main' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mb: 0.5 }}>
                    {stats.todayLogins}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Today's Logins
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Company Details Card */}
          <Card sx={{ 
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            mb: 3
          }}>
            <CardHeader
              title="Company Information"
              titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
              sx={{ borderBottom: '1px solid', borderColor: 'grey.100', pb: 2 }}
              action={
                <IconButton>
                  <Business />
                </IconButton>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Code sx={{ fontSize: 20, color: 'primary.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Company Code
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {company.companyCode || "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'secondary.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Person sx={{ fontSize: 20, color: 'secondary.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Owner
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {company.ownerName}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'info.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Domain sx={{ fontSize: 20, color: 'info.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Domain
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {company.companyDomain}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'success.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CalendarToday sx={{ fontSize: 20, color: 'success.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Created On
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(company.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'warning.50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Link sx={{ fontSize: 20, color: 'warning.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Login URL
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight={600}
                          sx={{ 
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            wordBreak: 'break-all'
                          }}
                        >
                          {window.location.origin}{company.loginUrl}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          <Card sx={{ 
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Subscription Status
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Expires on {formatDate(company.subscriptionExpiry)}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Days Remaining
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {daysRemaining} days
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={subscriptionProgress}
                      sx={{ 
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: daysRemaining > 15 ? 'success.main' : 
                                   daysRemaining > 7 ? 'warning.main' : 'error.main'
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ 
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ 
                      color: daysRemaining > 15 ? 'success.main' : 
                             daysRemaining > 7 ? 'warning.main' : 'error.main'
                    }}
                  >
                    {daysRemaining}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Recent Users */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            height: '100%'
          }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>
                    Recent Users ({recentUsers.length})
                  </Typography>
                  <MuiBadge 
                    badgeContent={recentUsers.length} 
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                  />
                </Stack>
              }
              action={
                <IconButton
                  size="small"
                  onClick={handleViewAllUsers}
                  disabled={!company._id}
                >
                  <ListAlt />
                </IconButton>
              }
              sx={{ borderBottom: '1px solid', borderColor: 'grey.100', pb: 2 }}
            />
            
            <CardContent sx={{ p: 0 }}>
              {recentUsers.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentUsers.map((user, index) => (
                    <ListItem
                      key={user.id || user._id || index}
                      sx={{
                        px: 3,
                        py: 2,
                        borderBottom: index < recentUsers.length - 1 ? '1px solid' : 'none',
                        borderColor: 'grey.100',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(4px)'
                        }
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleEditUser(user)}
                        >
                          {/* <Edit fontSize="small" /> */}
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: user.isActive ? 'primary.main' : 'grey.400'
                          }}
                        >
                          {user.name?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {user.name || 'Unknown User'}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                            <Chip
                              label={user.role || 'User'}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={user.department || 'No Dept'}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: 'grey.100'
                              }}
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 8,
                  px: 2
                }}>
                  <People sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
                    No users found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center">
                    Add users to get started
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <CardActions sx={{ p: 3, pt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate(`/Ciis-network/create-user?company=${company._id}&companyCode=${company.companyCode}`)}
                startIcon={<Person />}
                disabled={!company._id}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Add New User
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Edit User Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.50',
          borderBottom: '1px solid',
          borderColor: 'primary.100',
          py: 2,
          px: 3
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Person sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Edit User Details
              </Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setEditModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedUser && (
            <Stack spacing={3}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Editing: <strong>{selectedUser.name}</strong>
              </Alert>
              
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={editFormData.name}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                required
              />
              
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={editFormData.designation}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
              
              <Autocomplete
                freeSolo
                options={jobRoleOptions}
                value={editFormData.role}
                onChange={handleRoleChange}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.label || option.name || '';
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Job Role"
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Work sx={{ mr: 1, color: 'action.active' }} />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Work sx={{ fontSize: 18, color: 'action.active' }} />
                      <Typography>{option.label || option.name}</Typography>
                    </Stack>
                  </li>
                )}
                loading={loadingJobRoles}
                loadingText="Loading job roles..."
              />
              
              <Autocomplete
                freeSolo
                options={departmentOptions}
                value={editFormData.department}
                onChange={handleDepartmentChange}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.label || option.name || '';
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Business sx={{ mr: 1, color: 'action.active' }} />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Business sx={{ fontSize: 18, color: 'action.active' }} />
                      <Typography>{option.label || option.name}</Typography>
                    </Stack>
                  </li>
                )}
                loading={loadingDepartments}
                loadingText="Loading departments..."
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active User"
              />
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            color="inherit"
            disabled={saveLoading}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleDeleteUser}
            color="error"
            startIcon={<Delete />}
            disabled={saveLoading}
          >
            Delete
          </Button>
          
          <Button
            onClick={handleSaveUser}
            variant="contained"
            startIcon={<Save />}
            disabled={saveLoading}
            sx={{ 
              px: 3,
              fontWeight: 600
            }}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyDetails;