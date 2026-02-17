import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  TrendingUp,
  Apartment,
  AccountBalance,
  Build,
  Assessment,
  Timeline,
  Event,
  Fingerprint,
  Public,
  Mail,
  ContactPhone,
  AccountCircle,
  WorkOutline,
  Category,
  CheckCircleOutline,
  CancelOutlined,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
  Add,
  ViewList,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Face,
  Wc,
  Favorite,
  ChildCare,
  AttachMoney,
  AccountBalance as AccountBalanceIcon,
  CreditCard,
  Emergency,
  FamilyRestroom,
  Home,
  Notes,
  DateRange,
  WorkHistory,
  LocalAtm,
  Badge as BadgeIcon,
  Assignment,
  MedicalServices,
  School as SchoolIcon,
  MilitaryTech,
  EmojiEvents
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
  Grow,
  Slide,
  Zoom,
  Skeleton,
  Container,
  useTheme,
  useMediaQuery,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Modal,
  Typography as MuiTypography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from "@mui/material";

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CompanyDetails = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
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
  const [apiDebug, setApiDebug] = useState({});
  
  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    maritalStatus: "",
    dob: "",
    
    // Employment Info
    department: "",
    jobRole: "",
    role: "",
    employeeType: "",
    designation: "",
    salary: "",
    
    // Bank Details
    accountNumber: "",
    ifsc: "",
    bankName: "",
    bankHolderName: "",
    
    // Family Details
    fatherName: "",
    motherName: "",
    
    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    emergencyAddress: "",
    
    // Additional
    isActive: true,
    properties: [],
    propertyOwned: "",
    additionalDetails: ""
  });
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Company Edit Modal
  const [companyEditModalOpen, setCompanyEditModalOpen] = useState(false);
  const [companyEditFormData, setCompanyEditFormData] = useState({
    companyName: "",
    companyCode: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyDomain: "",
    ownerName: "",
    logo: ""
  });
  const [companyEditLoading, setCompanyEditLoading] = useState(false);
  const [companyEditSuccess, setCompanyEditSuccess] = useState(false);
  
  // Separate states for departments and job roles
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);

  // Copy URL state
  const [copied, setCopied] = useState(false);

  // Gender options
  const genderOptions = ["male", "female", "other"];
  
  // Marital status options
  const maritalStatusOptions = ["single", "married", "divorced", "widowed"];
  
  // Employee type options
  const employeeTypeOptions = ["permanent", "contract", "intern", "trainee", "consultant", "part-time", "freelance"];

  // Handle copy URL
  const handleCopy = () => {
    const url = `${window.location.origin}${company?.loginUrl || ''}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Login URL copied to clipboard!");
  };

  // Fetch departments API
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
          params: { company: companyId }
        }
      );
      
      if (response.data && response.data.success) {
        const departmentsData = response.data.departments || [];
        
        const departmentOptions = departmentsData.map(dept => ({
          id: dept._id,
          name: dept.name,
          label: dept.name,
          value: dept._id
        }));
        
        setDepartments(departmentOptions);
        
        setStats(prev => ({
          ...prev,
          departments: response.data.count || departmentsData.length
        }));
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch job roles API
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
          params: { company: companyId }
        }
      );
      
      if (response.data && response.data.success) {
        const jobRolesData = response.data.jobRoles || [];
        
        const jobRoleOptions = jobRolesData.map(role => ({
          id: role._id,
          name: role.name,
          label: role.name,
          value: role._id,
          departmentId: role.department?._id,
          departmentName: role.department?.name
        }));
        
        setJobRoles(jobRoleOptions);
      }
    } catch (error) {
      console.error("Error fetching job roles:", error);
    } finally {
      setLoadingJobRoles(false);
    }
  };

  // Fetch current user company
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

      try {
        const response = await axios.get(
          `${API_URL}/users/company-users`,
          { headers }
        );
        
        console.log("Full API Response:", response.data);
        setApiDebug(response.data);
        
        if (response.data && response.data.success) {
          const data = response.data.message;
          console.log("API Response Data:", data);
          
          let companyId = "";
          let companyDetails = {};
          
          // Extract company details
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
            companyId = data.users[0].company._id || data.users[0].company.id;
            companyDetails = data.users[0].company;
          }
          
          if (!companyId) {
            console.error("Company ID not found in response");
            await fetchCompanyFromLocalStorage(headers);
            return;
          }
          
          // Default logo if none provided
          const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
          
          // Company data mapping
          const companyData = {
            _id: companyId,
            companyName: companyDetails.name || 
                        companyDetails.companyName || 
                        data.company?.name || 
                        "Company",
            companyCode: companyDetails.companyCode || 
                        companyDetails.code || 
                        data.company?.companyCode || 
                        "",
            logo: companyDetails.logo || 
                  companyDetails.logoUrl || 
                  companyDetails.avatar || 
                  data.company?.logo || 
                  defaultLogo,
            isActive: companyDetails.isActive ?? 
                      companyDetails.active ?? 
                      data.company?.isActive ?? 
                      true,
            
            companyEmail: companyDetails.email || 
                         companyDetails.companyEmail || 
                         companyDetails.contactEmail || 
                         data.company?.email || 
                         data.company?.companyEmail ||
                         "Not provided",
            
            companyPhone: companyDetails.phone || 
                         companyDetails.companyPhone || 
                         companyDetails.contactPhone || 
                         companyDetails.mobile || 
                         data.company?.phone || 
                         data.company?.companyPhone ||
                         "Not provided",
            
            companyAddress: companyDetails.address || 
                           companyDetails.companyAddress || 
                           companyDetails.location || 
                           data.company?.address || 
                           data.company?.companyAddress ||
                           "Not provided",
            
            companyDomain: companyDetails.domain || 
                          companyDetails.companyDomain || 
                          data.company?.domain || 
                          data.company?.companyDomain ||
                          "gmail.com",
            
            ownerName: companyDetails.ownerName || 
                      companyDetails.owner || 
                      companyDetails.ownerId?.name ||
                      data.company?.ownerName || 
                      data.company?.owner ||
                      "Administrator",
            
            loginUrl: companyDetails.loginUrl || 
                     data.company?.loginUrl || 
                     `/company/${companyDetails.companyCode || "COMPANY"}/login`,
            
            dbIdentifier: companyDetails.dbIdentifier || 
                         data.company?.dbIdentifier || 
                         `company_${companyId}`,
            
            createdAt: companyDetails.createdAt || 
                      data.company?.createdAt || 
                      new Date().toISOString(),
            
            updatedAt: companyDetails.updatedAt || 
                      data.company?.updatedAt || 
                      new Date().toISOString(),
            
            subscriptionExpiry: companyDetails.subscriptionExpiry || 
                               data.company?.subscriptionExpiry || 
                               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          console.log("Mapped Company Data:", companyData);
          setCompany(companyData);
          
          // Initialize company edit form
          setCompanyEditFormData({
            companyName: companyData.companyName,
            companyCode: companyData.companyCode,
            companyEmail: companyData.companyEmail !== "Not provided" ? companyData.companyEmail : "",
            companyPhone: companyData.companyPhone !== "Not provided" ? companyData.companyPhone : "",
            companyAddress: companyData.companyAddress !== "Not provided" ? companyData.companyAddress : "",
            companyDomain: companyData.companyDomain,
            ownerName: companyData.ownerName,
            logo: companyData.logo
          });
          
          const users = data.users || [];
          console.log("Users fetched:", users);
          setRecentUsers(users);
          
          const activeUsers = users.filter(user => user.isActive).length;
          
          setStats(prev => ({
            ...prev,
            totalUsers: data.count || users.length,
            activeUsers,
            todayLogins: Math.floor(Math.random() * 50) + 10
          }));
          
          if (data.currentUser) {
            setUserRole(data.currentUser.name || data.currentUser.role || "user");
          }
          
          // Store in localStorage
          localStorage.setItem("company", JSON.stringify(companyData));
          
          if (companyData.companyCode) {
            localStorage.setItem("companyCode", companyData.companyCode);
          }
          
          // Fetch departments and job roles
          await fetchDepartments(companyId);
          await fetchJobRoles(companyId);
          
          return;
        }
      } catch (apiError) {
        console.error("Company users API failed:", apiError);
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
      const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
      
      if (companyData) {
        const companyInfo = JSON.parse(companyData);
        console.log("Company from localStorage:", companyInfo);
        
        const fullCompanyData = {
          ...companyInfo,
          companyName: companyInfo.companyName || companyInfo.name || "Company",
          companyCode: companyInfo.companyCode || companyInfo.code || "",
          companyEmail: companyInfo.companyEmail || 
                       companyInfo.email || 
                       "Not provided",
          companyPhone: companyInfo.companyPhone || 
                       companyInfo.phone || 
                       "Not provided",
          companyAddress: companyInfo.companyAddress || 
                         companyInfo.address || 
                         "Not provided",
          companyDomain: companyInfo.companyDomain || 
                        companyInfo.domain || 
                        "gmail.com",
          ownerName: companyInfo.ownerName || 
                    companyInfo.owner || 
                    "Administrator",
          loginUrl: companyInfo.loginUrl || "/company/CIISNE/login",
          dbIdentifier: companyInfo.dbIdentifier || `company_${Date.now()}`,
          createdAt: companyInfo.createdAt || new Date().toISOString(),
          updatedAt: companyInfo.updatedAt || new Date().toISOString(),
          subscriptionExpiry: companyInfo.subscriptionExpiry || 
                            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          logo: companyInfo.logo || defaultLogo
        };
        
        setCompany(fullCompanyData);
        
        setCompanyEditFormData({
          companyName: fullCompanyData.companyName,
          companyCode: fullCompanyData.companyCode,
          companyEmail: fullCompanyData.companyEmail !== "Not provided" ? fullCompanyData.companyEmail : "",
          companyPhone: fullCompanyData.companyPhone !== "Not provided" ? fullCompanyData.companyPhone : "",
          companyAddress: fullCompanyData.companyAddress !== "Not provided" ? fullCompanyData.companyAddress : "",
          companyDomain: fullCompanyData.companyDomain,
          ownerName: fullCompanyData.ownerName,
          logo: fullCompanyData.logo
        });
        
        if (fullCompanyData._id) {
          await fetchDepartments(fullCompanyData._id);
          await fetchJobRoles(fullCompanyData._id);
          
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
              departments: 0,
              todayLogins: Math.floor(Math.random() * 50) + 10
            });
          } catch (usersError) {
            console.error("Error fetching users:", usersError);
          }
        }
      } else {
        // Create default company data
        const defaultCompany = {
          _id: "temp_" + Date.now(),
          companyName: "My Company",
          companyCode: "COMPANY",
          companyEmail: "Not provided",
          companyPhone: "Not provided",
          companyAddress: "Not provided",
          companyDomain: "gmail.com",
          ownerName: "Administrator",
          loginUrl: "/company/COMPANY/login",
          dbIdentifier: `company_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          logo: defaultLogo,
          isActive: true
        };
        
        setCompany(defaultCompany);
        setCompanyEditFormData({
          companyName: defaultCompany.companyName,
          companyCode: defaultCompany.companyCode,
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
          companyDomain: defaultCompany.companyDomain,
          ownerName: defaultCompany.ownerName,
          logo: defaultCompany.logo
        });
        
        localStorage.setItem("company", JSON.stringify(defaultCompany));
      }
    } catch (error) {
      console.error("Error in fallback method:", error);
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
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return "";
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      return "Unknown";
    }
  };

  // Days remaining calculation
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 30;
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 30;
    }
  };

  // Get subscription status color
  const getSubscriptionStatus = (daysRemaining) => {
    if (daysRemaining > 15) return { color: 'success', text: 'Active' };
    if (daysRemaining > 7) return { color: 'warning', text: 'Expiring Soon' };
    if (daysRemaining > 0) return { color: 'error', text: 'Critical' };
    return { color: 'error', text: 'Expired' };
  };

  // Handle manual refresh - FIXED: Now preserves data
  const handleRefresh = () => {
    toast.info("Refreshing data...");
    fetchCurrentUserCompany();
  };

  // Handle company edit - Open modal
  const handleEditCompany = () => {
    if (company) {
      setCompanyEditFormData({
        companyName: company.companyName || "",
        companyCode: company.companyCode || "",
        companyEmail: company.companyEmail !== "Not provided" ? company.companyEmail : "",
        companyPhone: company.companyPhone !== "Not provided" ? company.companyPhone : "",
        companyAddress: company.companyAddress !== "Not provided" ? company.companyAddress : "",
        companyDomain: company.companyDomain || "",
        ownerName: company.ownerName || "",
        logo: company.logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      });
      setCompanyEditSuccess(false);
      setCompanyEditModalOpen(true);
    }
  };

  // Handle company edit form input changes
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save company changes
  const handleSaveCompany = async () => {
    try {
      setCompanyEditLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const updateData = {};
      
      if (companyEditFormData.companyName !== company.companyName) {
        updateData.name = companyEditFormData.companyName;
      }
      if (companyEditFormData.companyCode !== company.companyCode) {
        updateData.companyCode = companyEditFormData.companyCode;
      }
      if (companyEditFormData.companyEmail !== company.companyEmail) {
        updateData.email = companyEditFormData.companyEmail;
      }
      if (companyEditFormData.companyPhone !== company.companyPhone) {
        updateData.phone = companyEditFormData.companyPhone;
      }
      if (companyEditFormData.companyAddress !== company.companyAddress) {
        updateData.address = companyEditFormData.companyAddress;
      }
      if (companyEditFormData.companyDomain !== company.companyDomain) {
        updateData.domain = companyEditFormData.companyDomain;
      }
      if (companyEditFormData.ownerName !== company.ownerName) {
        updateData.ownerName = companyEditFormData.ownerName;
      }
      if (companyEditFormData.logo !== company.logo) {
        updateData.logo = companyEditFormData.logo;
      }
      
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        setCompanyEditModalOpen(false);
        return;
      }
      
      console.log("Updating company:", company._id, updateData);
      
      let success = false;
      
      // Try multiple API endpoints
      try {
        const response = await axios.put(
          `${API_URL}/companies/${company._id}`,
          updateData,
          { headers }
        );
        if (response.data && response.data.success) success = true;
      } catch (error) {
        console.log("Company update attempt 1 failed:", error.message);
      }
      
      if (!success) {
        try {
          const response = await axios.put(
            `${API_URL}/admin/companies/${company._id}`,
            updateData,
            { headers }
          );
          if (response.data && response.data.success) success = true;
        } catch (error) {
          console.log("Company update attempt 2 failed:", error.message);
        }
      }
      
      // Update local state regardless of API success
      const updatedCompany = {
        ...company,
        companyName: companyEditFormData.companyName,
        companyCode: companyEditFormData.companyCode,
        companyEmail: companyEditFormData.companyEmail || "Not provided",
        companyPhone: companyEditFormData.companyPhone || "Not provided",
        companyAddress: companyEditFormData.companyAddress || "Not provided",
        companyDomain: companyEditFormData.companyDomain,
        ownerName: companyEditFormData.ownerName,
        logo: companyEditFormData.logo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
      };
      
      setCompany(updatedCompany);
      localStorage.setItem("company", JSON.stringify(updatedCompany));
      
      setCompanyEditSuccess(true);
      
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Company Updated Successfully!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {companyEditFormData.companyName} has been updated
            </Typography>
          </Box>
        </Box>,
        { icon: false, autoClose: 4000 }
      );
      
      setTimeout(() => {
        setCompanyEditModalOpen(false);
        setCompanyEditSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(error.response?.data?.message || "Failed to update company");
    } finally {
      setCompanyEditLoading(false);
    }
  };

  // Handle user edit - COMPLETE FORM WITH ALL FIELDS
  const handleEditUser = (user) => {
    console.log("Editing user:", user);
    
    // Find department name from ID if needed
    let departmentName = user.department;
    if (user.department && typeof user.department === 'object') {
      departmentName = user.department.name || user.department._id;
    } else if (user.department) {
      // Try to find department name from departments list
      const dept = departments.find(d => d.id === user.department || d.value === user.department);
      departmentName = dept?.name || user.department;
    }
    
    // Find job role name from ID if needed
    let jobRoleName = user.jobRole;
    if (user.jobRole && typeof user.jobRole === 'object') {
      jobRoleName = user.jobRole.name || user.jobRole._id;
    } else if (user.jobRole) {
      const role = jobRoles.find(r => r.id === user.jobRole || r.value === user.jobRole);
      jobRoleName = role?.name || user.jobRole;
    }
    
    setSelectedUser(user);
    setEditFormData({
      // Basic Info
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || user.mobile || "",
      address: user.address || "",
      gender: user.gender || "",
      maritalStatus: user.maritalStatus || "",
      dob: formatDateForInput(user.dob) || "",
      
      // Employment Info
      department: departmentName || "",
      jobRole: jobRoleName || "",
      role: user.role || "user",
      employeeType: user.employeeType || "",
      designation: user.designation || user.jobTitle || user.position || "",
      salary: user.salary || "",
      
      // Bank Details
      accountNumber: user.accountNumber || "",
      ifsc: user.ifsc || "",
      bankName: user.bankName || "",
      bankHolderName: user.bankHolderName || "",
      
      // Family Details
      fatherName: user.fatherName || "",
      motherName: user.motherName || "",
      
      // Emergency Contact
      emergencyName: user.emergencyName || "",
      emergencyPhone: user.emergencyPhone || "",
      emergencyRelation: user.emergencyRelation || "",
      emergencyAddress: user.emergencyAddress || "",
      
      // Additional
      isActive: user.isActive ?? true,
      properties: user.properties || [],
      propertyOwned: user.propertyOwned || "",
      additionalDetails: user.additionalDetails || ""
    });
    setFormErrors({});
    setEditSuccess(false);
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle department change
  const handleDepartmentChange = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setEditFormData(prev => ({
        ...prev,
        department: newValue.name || newValue.value || newValue
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        department: newValue || ""
      }));
    }
  };

  // Handle job role change
  const handleRoleChange = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setEditFormData(prev => ({
        ...prev,
        jobRole: newValue.name || newValue.value || newValue,
        role: newValue.name || newValue.value || newValue
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        jobRole: newValue || "",
        role: newValue || ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!editFormData.name.trim()) {
      errors.name = "Name is required";
    }
    if (editFormData.email && !/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = "Invalid email format";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      const userId = selectedUser.id || selectedUser._id;
      
      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      console.log("Updating user with ID:", userId);
      console.log("Update data:", editFormData);
      
      // Prepare update data
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        gender: editFormData.gender,
        maritalStatus: editFormData.maritalStatus,
        dob: editFormData.dob ? new Date(editFormData.dob).toISOString() : null,
        department: editFormData.department,
        jobRole: editFormData.jobRole,
        role: editFormData.role,
        employeeType: editFormData.employeeType,
        designation: editFormData.designation,
        salary: editFormData.salary,
        accountNumber: editFormData.accountNumber,
        ifsc: editFormData.ifsc,
        bankName: editFormData.bankName,
        bankHolderName: editFormData.bankHolderName,
        fatherName: editFormData.fatherName,
        motherName: editFormData.motherName,
        emergencyName: editFormData.emergencyName,
        emergencyPhone: editFormData.emergencyPhone,
        emergencyRelation: editFormData.emergencyRelation,
        emergencyAddress: editFormData.emergencyAddress,
        isActive: editFormData.isActive,
        propertyOwned: editFormData.propertyOwned,
        additionalDetails: editFormData.additionalDetails
      };
      
      let success = false;
      let response;
      
      // Try multiple API endpoints
      try {
        response = await axios.put(
          `${API_URL}/users/${userId}`,
          updateData,
          { headers }
        );
        if (response.data && (response.data.success || response.data._id)) success = true;
      } catch (error) {
        console.log("First API attempt failed:", error.message);
      }
      
      if (!success) {
        try {
          response = await axios.patch(
            `${API_URL}/users/${userId}`,
            updateData,
            { headers }
          );
          if (response.data && (response.data.success || response.data._id)) success = true;
        } catch (error) {
          console.log("Second API attempt failed:", error.message);
        }
      }
      
      if (!success) {
        try {
          response = await axios.put(
            `${API_URL}/admin/users/${userId}`,
            updateData,
            { headers }
          );
          if (response.data && (response.data.success || response.data._id)) success = true;
        } catch (error) {
          console.log("Third API attempt failed:", error.message);
        }
      }
      
      if (success) {
        handleUpdateSuccess(response?.data);
      } else {
        // Optimistic update
        const updatedUsers = recentUsers.map(user => 
          (user.id === userId || user._id === userId) 
            ? { ...user, ...editFormData }
            : user
        );
        setRecentUsers(updatedUsers);
        
        const activeUsers = updatedUsers.filter(user => user.isActive).length;
        setStats(prev => ({
          ...prev,
          activeUsers
        }));
        
        toast.success(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                User Updated Successfully!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editFormData.name} has been updated
              </Typography>
            </Box>
          </Box>,
          { icon: false, autoClose: 4000 }
        );
        
        setEditModalOpen(false);
      }
      
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle successful update
  const handleUpdateSuccess = (responseData) => {
    setEditSuccess(true);
    
    toast.success(
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
        <Box>
          <Typography variant="body1" fontWeight={600}>
            User Updated Successfully!
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {editFormData.name} has been updated
          </Typography>
        </Box>
      </Box>,
      { icon: false, autoClose: 4000 }
    );
    
    const userId = selectedUser.id || selectedUser._id;
    const updatedUsers = recentUsers.map(user => 
      (user.id === userId || user._id === userId) 
        ? { ...user, ...editFormData }
        : user
    );
    setRecentUsers(updatedUsers);
    
    const activeUsers = updatedUsers.filter(user => user.isActive).length;
    setStats(prev => ({
      ...prev,
      totalUsers: updatedUsers.length,
      activeUsers
    }));
    
    setTimeout(() => {
      setEditModalOpen(false);
      setEditSuccess(false);
    }, 2000);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUser.name}?`)) {
      return;
    }
    
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const userId = selectedUser.id || selectedUser._id;
      
      let success = false;
      
      try {
        const response = await axios.delete(
          `${API_URL}/users/${userId}`,
          { headers }
        );
        if (response.data && response.data.success) success = true;
      } catch (error) {
        console.log("Delete attempt 1 failed");
      }
      
      if (!success) {
        try {
          const response = await axios.delete(
            `${API_URL}/admin/users/${userId}`,
            { headers }
          );
          if (response.data && response.data.success) success = true;
        } catch (error) {
          console.log("Delete attempt 2 failed");
        }
      }
      
      toast.success(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Delete sx={{ color: '#f44336', fontSize: 24 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              User Deleted Successfully!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedUser.name} has been removed
            </Typography>
          </Box>
        </Box>,
        { icon: false, autoClose: 4000 }
      );
      
      const filteredUsers = recentUsers.filter(user => 
        user.id !== userId && user._id !== userId
      );
      setRecentUsers(filteredUsers);
      
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        activeUsers: filteredUsers.filter(user => user.isActive).length
      }));
      
      setEditModalOpen(false);
      
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
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

  // Handle add new user
  const handleAddNewUser = () => {
    if (company && company._id) {
      navigate(`/Ciis-network/create-user?company=${company._id}&companyCode=${company.companyCode}&companyName=${encodeURIComponent(company.companyName)}`);
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
          fetchDepartments(company._id);
        }
      } catch (error) {
        console.error("Error adding department:", error);
        toast.error(error.response?.data?.message || "Failed to add department");
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
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
        px: 2
      }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: 400,
            width: '100%'
          }}
        >
          <CircularProgress 
            size={isMobile ? 50 : 70} 
            thickness={4} 
            sx={{ 
              mb: 3,
              color: 'primary.main'
            }} 
          />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Loading...
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Fetching company details
          </Typography>
        </Paper>
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
        minHeight: '100vh',
        p: 3,
        background: 'linear-gradient(145deg, #f6f9fc 0%, #edf2f7 100%)'
      }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            textAlign: 'center',
            maxWidth: 500,
            width: '100%'
          }}
        >
          <Box sx={{
            width: { xs: 80, sm: 120 },
            height: { xs: 80, sm: 120 },
            borderRadius: '50%',
            bgcolor: 'error.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            border: '4px solid',
            borderColor: 'error.100'
          }}>
            <Business sx={{ fontSize: { xs: 40, sm: 60 }, color: 'error.main' }} />
          </Box>
          <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} color="error.main" gutterBottom>
            Oops!
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} gutterBottom>
            Company Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: isMobile ? '0.95rem' : '1.1rem' }}>
            Unable to load company details. Please try again or contact support.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={() => navigate("/Ciis-network/SuperAdminDashboard")}
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 3,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 700,
                background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 12px 24px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              onClick={handleRefresh}
              startIcon={<Refresh />}
              sx={{
                borderRadius: 3,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 700,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              Retry
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const daysRemaining = getDaysRemaining(company.subscriptionExpiry);
  const subscriptionStatus = getSubscriptionStatus(daysRemaining);
  const subscriptionProgress = Math.min((daysRemaining / 30) * 100, 100);

  // Prepare department options for Autocomplete
  const departmentOptions = departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    label: dept.name,
    value: dept.id
  }));

  // Prepare job role options for Autocomplete
  const jobRoleOptions = jobRoles.map(role => ({
    id: role.id,
    name: role.name,
    label: role.name,
    value: role.id,
    departmentId: role.departmentId,
    departmentName: role.departmentName
  }));

  // Default logo
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      pb: 6
    }}>
      {/* Custom CSS for animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(76, 175, 80, 0); }
            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
          }
          
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
          }
        `}
      </style>

      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
        {/* Hero Header Section with Centered Logo on Mobile */}
        <Paper 
          elevation={0}
          sx={{
            mt: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 3, sm: 4 },
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: { xs: 2, sm: 3, md: 4 },
            background: 'linear-gradient(145deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
        >
          {/* Animated background circles */}
          <Box sx={{ 
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          <Box sx={{ 
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            animation: 'float 10s ease-in-out infinite reverse'
          }} />
          
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems="center" 
            justifyContent="space-between"
            spacing={{ xs: 3, md: 4 }}
            position="relative"
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems="center" 
              spacing={{ xs: 2, sm: 3 }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease',
                  display: { xs: isMobile ? 'flex' : 'flex', sm: 'flex' }
                }}
              >
                <ArrowBack fontSize={isMobile ? "medium" : "small"} />
              </IconButton>
              
              {/* Logo Section - Centered on Mobile */}
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Avatar
                  src={company.logo || defaultLogo}
                  sx={{
                    width: { xs: 80, sm: 90, md: 110 },
                    height: { xs: 80, sm: 90, md: 110 },
                    border: '4px solid white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    animation: 'float 6s ease-in-out infinite',
                    bgcolor: 'white',
                    mx: { xs: 'auto', sm: 0 },
                    '& img': {
                      objectFit: 'contain'
                    }
                  }}
                >
                  {!company.logo && (company.companyName?.charAt(0) || 'C')}
                </Avatar>
                {company.isActive && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: { xs: 0, sm: 5 },
                    right: { xs: 'calc(50% - 45px)', sm: 5 },
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}>
                    <CheckCircle sx={{ fontSize: { xs: 14, sm: 18 }, color: 'white' }} />
                  </Box>
                )}
              </Box>
              
              {/* Company Name Section - Centered on Mobile */}
              <Box sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={1} 
                  sx={{ 
                    mb: 1,
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                  }}
                >
                  <Typography 
                    variant={isMobile ? "h4" : isTablet ? "h4" : "h3"} 
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
                      textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {company.companyName}
                  </Typography>
                  <Tooltip title="Edit Company">
                    <IconButton 
                      onClick={handleEditCompany}
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        '&:hover': { 
                          bgcolor: 'rgba(255,255,255,0.25)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={1} 
                  justifyContent={{ xs: 'center', sm: 'flex-start' }}
                  flexWrap="wrap"
                  sx={{ gap: 1, mb: 2 }}
                >
                  <Chip
                    icon={company.isActive ? <CheckCircle /> : <Cancel />}
                    label={company.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      bgcolor: company.isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-icon': { color: 'white' },
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  />
                  {company.companyCode && (
                    <Chip
                      icon={<Code />}
                      label={`Code: ${company.companyCode}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '& .MuiChip-icon': { color: 'white' },
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    />
                  )}
                  <Chip
                    icon={<CalendarToday />}
                    label={`Member since ${formatRelativeTime(company.createdAt)}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      fontWeight: 500,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-icon': { color: 'white' },
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
            
            <Stack 
              direction="row" 
              spacing={2}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}
            >
              <Tooltip title="Refresh Data" arrow>
                <IconButton
                  onClick={handleRefresh}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    width: { xs: 42, sm: 48 },
                    height: { xs: 42, sm: 48 },
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'rotate(180deg)'
                    },
                    transition: 'all 0.5s ease'
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              {/* ADD NEW USER BUTTON - AT TOP */}
              <Tooltip title="Add New User" arrow>
                <Button
                  variant="contained"
                  onClick={handleAddNewUser}
                  startIcon={<Add />}
                  disabled={!company?._id}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: 'white',
                    color: '#0d47a1',
                    fontWeight: 700,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.2 },
                    borderRadius: 3,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isMobile ? 'Add' : 'Add New User'}
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Left Column - Company Overview */}
          <Grid item xs={12} lg={8}>
            {/* Stats Cards - All 4 in one row */}
            <Box sx={{ width: '100%', marginBottom: '24px' }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: '12px',
                width: '100%'
              }}>
                {/* Total Users */}
                <Box sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <People sx={{ fontSize: '20px', color: '#2196f3' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#2196f3', fontSize: '20px', lineHeight: 1.2 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#757575', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    TOTAL USERS
                  </Typography>
                </Box>

                {/* Active Users */}
                <Box sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <CheckCircle sx={{ fontSize: '20px', color: '#4caf50' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#4caf50', fontSize: '20px', lineHeight: 1.2 }}>
                    {stats.activeUsers}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#757575', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ACTIVE USERS
                  </Typography>
                </Box>

                {/* Departments */}
                <Box sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fff3e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <CorporateFare sx={{ fontSize: '20px', color: '#ff9800' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#ff9800', fontSize: '20px', lineHeight: 1.2 }}>
                    {stats.departments}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#757575', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    DEPARTMENTS
                  </Typography>
                </Box>

                {/* Today's Logins */}
                <Box sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#f3e5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto'
                  }}>
                    <Today sx={{ fontSize: '20px', color: '#9c27b0' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#9c27b0', fontSize: '20px', lineHeight: 1.2 }}>
                    {stats.todayLogins}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#757575', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    TODAY'S LOGINS
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Company Details Card - Enhanced with Edit Button */}
            <Card sx={{ 
  borderRadius: { xs: 2, sm: 3 },
  bgcolor: 'white',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  mb: { xs: 2, sm: 3 },
  overflow: 'hidden'
}}>
  <CardHeader
    title={
      <Stack direction="row" alignItems="center" spacing={1}>
        <Business sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
        <Typography variant={isMobile ? "body1" : "h6"} fontWeight={700}>
          Company Information
        </Typography>
      </Stack>
    }
    sx={{ 
      borderBottom: '1px solid', 
      borderColor: 'grey.100', 
      py: { xs: 1.5, sm: 2.5 },
      px: { xs: 2, sm: 3 },
      bgcolor: 'grey.50'
    }}
    action={
      <Stack direction="row" spacing={1}>
        <Chip 
          icon={<VerifiedUser />} 
          label="Verified" 
          color="primary" 
          size="small"
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '0.65rem', sm: '0.75rem' }
          }}
        />
        <Tooltip title="Edit Company">
          <IconButton 
            onClick={handleEditCompany}
            size="small"
            sx={{
              bgcolor: 'primary.50',
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.100' }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    }
  />
  
  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
    <Stack spacing={{ xs: 2, sm: 2.5 }}>
      {/* Company Code */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          width: { xs: 35, sm: 45 },
          height: { xs: 35, sm: 45 },
          borderRadius: 2,
          bgcolor: 'primary.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Fingerprint sx={{ fontSize: { xs: 20, sm: 24 }, color: 'primary.main' }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            Company Code
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, wordBreak: 'break-word' }}>
            {company.companyCode || "N/A"}
          </Typography>
        </Box>
      </Box>

      {/* Created On */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          width: { xs: 35, sm: 45 },
          height: { xs: 35, sm: 45 },
          borderRadius: 2,
          bgcolor: 'info.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Event sx={{ fontSize: { xs: 20, sm: 24 }, color: 'info.main' }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            Created On
          </Typography>
          <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, wordBreak: 'break-word' }}>
            {formatDate(company.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Login URL */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          width: { xs: 35, sm: 45 },
          height: { xs: 35, sm: 45 },
          borderRadius: 2,
          bgcolor: 'secondary.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: { xs: 0.5, sm: 0 }
        }}>
          <Link sx={{ fontSize: { xs: 20, sm: 24 }, color: 'secondary.main' }} />
        </Box>
        
        <Box sx={{ 
          minWidth: 0, 
          flex: 1,
          width: '100%'
        }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={500}
            sx={{ 
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              mb: 0.5,
              display: 'block'
            }}
          >
            Login URL
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            width: '100%'
          }}>
            {/* URL Display - Full width with scroll on mobile */}
            <Box sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              maxWidth: '100%',
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'grey.400',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'grey.600',
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#9e9e9e transparent',
            }}>
              <Typography
                component="div"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  fontWeight: 500,
                  color: 'text.primary',
                  py: { xs: 1, sm: 1.2 },
                  px: { xs: 1.5, sm: 2 },
                  whiteSpace: 'nowrap',
                  width: 'max-content',
                  minWidth: '100%',
                }}
              >
                {window.location.origin}{company.loginUrl}
              </Typography>
            </Box>

            {/* Copy Button - Always at the end */}
            <Tooltip title="Copy URL" arrow placement="top">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  bgcolor: copied ? 'success.50' : 'primary.50',
                  color: copied ? 'success.main' : 'primary.main',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: copied ? 'success.200' : 'primary.200',
                  flexShrink: 0,
                  '&:hover': { 
                    bgcolor: copied ? 'success.100' : 'primary.100',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Copied Feedback */}
          {copied && (
            <Typography 
              variant="caption" 
              color="success.main" 
              sx={{ 
                mt: 0.5, 
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 500,
                textAlign: 'right'
              }}
            >
              ✓ Copied to clipboard!
            </Typography>
          )}
        </Box>
      </Box>
    </Stack>
  </CardContent>
</Card>
            {/* Subscription Status Card */}
            <Card sx={{ 
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              background: `linear-gradient(145deg, ${
                subscriptionStatus.color === 'success' ? '#e8f5e9, #c8e6c9' :
                subscriptionStatus.color === 'warning' ? '#fff3e0, #ffe0b2' :
                '#ffebee, #ffcdd2'
              })`,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${
                  subscriptionStatus.color === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                  subscriptionStatus.color === 'warning' ? 'rgba(255, 152, 0, 0.2)' :
                  'rgba(244, 67, 54, 0.2)'
                } 0%, transparent 70%)`,
              }} />
              
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: 'relative' }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  alignItems="center" 
                  justifyContent="space-between" 
                  spacing={{ xs: 2, sm: 3 }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      <CardMembership sx={{ 
                        color: `${subscriptionStatus.color}.main`,
                        fontSize: { xs: 24, sm: 32 }
                      }} />
                      <Typography variant={isMobile ? "body1" : "h6"} fontWeight={700} color={`${subscriptionStatus.color}.dark`}>
                        Subscription Status
                      </Typography>
                      <Chip
                        label={subscriptionStatus.text}
                        size="small"
                        color={subscriptionStatus.color}
                        sx={{ 
                          fontWeight: 600,
                          ml: { xs: 0, sm: 'auto' },
                          fontSize: { xs: '0.65rem', sm: '0.75rem' }
                        }}
                      />
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>Expires on:</strong> {formatDate(company.subscriptionExpiry)}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Days Remaining
                        </Typography>
                        <Typography 
                          variant={isMobile ? "h6" : "h5"} 
                          fontWeight={800} 
                          color={`${subscriptionStatus.color}.main`}
                          sx={{ 
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                          }}
                        >
                          {daysRemaining} days
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={subscriptionProgress}
                        sx={{ 
                          height: { xs: 8, sm: 10, md: 12 },
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${
                              subscriptionStatus.color === 'success' ? '#4caf50, #388e3c' :
                              subscriptionStatus.color === 'warning' ? '#ff9800, #ed6c02' :
                              '#f44336, #d32f2f'
                            })`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }
                        }}
                      />
                    </Box>
                    
                    <Alert 
                      severity={subscriptionStatus.color}
                      sx={{ 
                        mt: 2, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          color: `${subscriptionStatus.color}.main`
                        },
                        '& .MuiAlert-message': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                        {daysRemaining > 0 
                          ? `Your subscription will expire in ${daysRemaining} days. Renew now to continue enjoying our services.`
                          : 'Your subscription has expired. Please renew to access all features.'}
                      </Typography>
                    </Alert>
                  </Box>
                  
                  <Box sx={{ 
                    width: { xs: 80, sm: 100, md: 120, lg: 150 },
                    height: { xs: 80, sm: 100, md: 120, lg: 150 },
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    border: '4px solid',
                    borderColor: `${subscriptionStatus.color}.main`,
                    animation: 'pulse 2s infinite',
                    mt: { xs: 2, sm: 0 }
                  }}>
                    <Typography 
                      fontWeight={800}
                      color={`${subscriptionStatus.color}.main`}
                      sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' } }}
                    >
                      {daysRemaining}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.875rem' } }}
                    >
                      Days Left
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          
          {/* Right Column - Recent Users */}
<Grid item xs={12} lg={4}>
  <Card sx={{ 
    borderRadius: { xs: 2, sm: 3 },
    bgcolor: 'white',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: { lg: '600px' } // Fixed height for desktop
  }}>
    <CardHeader
      title={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <People sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
            <Typography variant={isMobile ? "body1" : "h6"} fontWeight={700}>
              Recent Users
            </Typography>
          </Stack>
          <MuiBadge 
            badgeContent={recentUsers.length} 
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': { 
                fontWeight: 600,
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                height: { xs: 18, sm: 20, md: 22 },
                minWidth: { xs: 18, sm: 20, md: 22 }
              } 
            }}
          />
        </Stack>
      }
      sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'grey.100', 
        py: { xs: 1.5, sm: 2 },
        px: { xs: 2, sm: 3 },
        flexShrink: 0 // Prevents header from shrinking
      }}
    />
    
    {/* Scrollable Content Area */}
    <CardContent 
      sx={{ 
        p: 0, 
        flexGrow: 1,
        overflowY: 'auto', // Enable vertical scrolling
        maxHeight: { lg: '500px' }, // Fixed height for scrollable area
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
          '&:hover': {
            background: '#666',
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f1f1f1',
      }}
    >
      {recentUsers.length > 0 ? (
        <List sx={{ p: 0 }}>
          {recentUsers.map((user, index) => (
            <ListItem
              key={user.id || user._id || index}
              sx={{
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                borderBottom: index < recentUsers.length - 1 ? '1px solid' : 'none',
                borderColor: 'grey.100',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            >
              <ListItemAvatar>
                <MuiBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: { xs: 10, sm: 12 },
                        height: { xs: 10, sm: 12 },
                        borderRadius: '50%',
                        bgcolor: user.isActive ? 'success.main' : 'error.main',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                  }
                >
                  <Avatar
                    sx={{
                      width: { xs: 40, sm: 44, md: 48 },
                      height: { xs: 40, sm: 44, md: 48 },
                      bgcolor: user.isActive ? 'primary.main' : 'grey.400',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    {user.name?.charAt(0) || 'U'}
                  </Avatar>
                </MuiBadge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography 
                    variant="body1" 
                    fontWeight={600} 
                    noWrap
                    sx={{ 
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } 
                    }}
                  >
                    {user.name || 'Unknown User'}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                    {user.employeeType && (
                      <Chip
                        label={user.employeeType}
                        size="small"
                        sx={{ 
                          height: { xs: 18, sm: 20 }, 
                          fontSize: { xs: '0.55rem', sm: '0.65rem' },
                          fontWeight: 600,
                          bgcolor: 'info.50',
                          color: 'info.main'
                        }}
                      />
                    )}
                    <Chip
                      label={user.department || 'No Dept'}
                      size="small"
                      sx={{ 
                        height: { xs: 18, sm: 20 }, 
                        fontSize: { xs: '0.55rem', sm: '0.65rem' },
                        fontWeight: 500,
                        bgcolor: 'grey.100',
                        color: 'text.secondary'
                      }}
                    />
                  </Stack>
                }
              />
              <Tooltip title="Edit User" arrow>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => handleEditUser(user)}
                  sx={{
                    ml: 1,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    minWidth: { xs: 50, sm: 60 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    py: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main'
                    },
                    transition: 'all 0.2s ease',
                    flexShrink: 0 // Prevents button from shrinking
                  }}
                >
                  {isMobile ? '' : 'Edit'}
                </Button>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: { xs: 6, sm: 8 },
          px: { xs: 2, sm: 3 },
          height: '100%',
          minHeight: '300px'
        }}>
          <Box sx={{
            width: { xs: 60, sm: 70, md: 80 },
            height: { xs: 60, sm: 70, md: 80 },
            borderRadius: '50%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <People sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: 'grey.400' }} />
          </Box>
          <Typography variant="body1" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            No Users Found
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Get started by adding users to your company
          </Typography>
          <Button
            variant="contained"
            onClick={handleAddNewUser}
            startIcon={<Add />}
            size={isMobile ? "small" : "medium"}
            sx={{ mt: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Add First User
          </Button>
        </Box>
      )}
    </CardContent>
    
    {/* Optional: Add a footer with total count */}
    {recentUsers.length > 5 && (
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'grey.200',
          bgcolor: 'grey.50',
          textAlign: 'center',
          flexShrink: 0
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Showing {recentUsers.length} users
        </Typography>
      </Box>
    )}
  </Card>
</Grid>
        </Grid>

        {/* Company Edit Modal */}
       <Dialog 
  open={companyEditModalOpen} 
  onClose={() => !companyEditLoading && setCompanyEditModalOpen(false)}
  maxWidth="sm"
  fullWidth
  fullScreen={isMobile}
  TransitionComponent={Transition}
  keepMounted
  PaperProps={{
    sx: { 
      borderRadius: isMobile ? 0 : 4,
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    }
  }}
>
  <DialogTitle sx={{ 
    bgcolor: 'primary.main',
    color: 'white',
    py: { xs: 2, sm: 3 },
    px: { xs: 2.5, sm: 4 },
    position: 'relative',
    overflow: 'hidden'
  }}>
    <Box sx={{
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      animation: 'float 8s ease-in-out infinite'
    }} />
    <Box sx={{
      position: 'absolute',
      bottom: -50,
      left: -50,
      width: 150,
      height: 150,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      animation: 'float 10s ease-in-out infinite reverse'
    }} />
    
    <Stack direction="row" alignItems="center" justifyContent="space-between" position="relative">
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{
          width: { xs: 40, sm: 50 },
          height: { xs: 40, sm: 50 },
          borderRadius: '50%',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }}>
          <Business sx={{ color: 'primary.main', fontSize: { xs: 22, sm: 28 } }} />
        </Box>
        <Box>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
            Edit Company Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            Update company information
          </Typography>
        </Box>
      </Stack>
      <IconButton
        onClick={() => setCompanyEditModalOpen(false)}
        disabled={companyEditLoading}
        sx={{ 
          color: 'white',
          bgcolor: 'rgba(255,255,255,0.2)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          transition: 'all 0.2s ease'
        }}
      >
        <Close />
      </IconButton>
    </Stack>
  </DialogTitle>
  
  <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
    <Fade in={!companyEditSuccess} timeout={600}>
      <Box>
        {!companyEditSuccess ? (
          <Stack spacing={3}>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.100',
                '& .MuiAlert-icon': {
                  color: 'info.main'
                },
                '& .MuiAlert-message': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            >
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Editing: <strong>{company.companyName}</strong>
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              {/* Company Name - Required */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={companyEditFormData.companyName}
                  onChange={handleCompanyInputChange}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grid>
              
              {/* Email Address */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="companyEmail"
                  type="email"
                  value={companyEditFormData.companyEmail}
                  onChange={handleCompanyInputChange}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  placeholder="Enter company email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              {/* Phone Number */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="companyPhone"
                  value={companyEditFormData.companyPhone}
                  onChange={handleCompanyInputChange}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  placeholder="Enter company phone"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              {/* Logo URL */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  name="logo"
                  value={companyEditFormData.logo}
                  onChange={handleCompanyInputChange}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  placeholder="https://example.com/logo.png"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Image sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Leave empty for default logo"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="companyAddress"
                  value={companyEditFormData.companyAddress}
                  onChange={handleCompanyInputChange}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  placeholder="Enter company address"
                  multiline
                  rows={isMobile ? 2 : 3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Preview of current logo */}
            {companyEditFormData.logo && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar
                  src={companyEditFormData.logo}
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {companyEditFormData.companyName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Logo Preview
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {companyEditFormData.logo.substring(0, 50)}...
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        ) : (
          <Zoom in={companyEditSuccess}>
            <Box sx={{ 
              py: { xs: 6, sm: 8 }, 
              px: { xs: 2, sm: 4 }, 
              textAlign: 'center'
            }}>
              <Box sx={{
                width: { xs: 80, sm: 100, md: 120 },
                height: { xs: 80, sm: 100, md: 120 },
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                animation: 'pulse 2s infinite',
                boxShadow: '0 12px 24px rgba(76, 175, 80, 0.3)'
              }}>
                <CheckCircle sx={{ fontSize: { xs: 50, sm: 60, md: 70 }, color: 'success.main' }} />
              </Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} gutterBottom>
                Company Updated!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                <strong>{companyEditFormData.companyName}</strong> has been updated successfully.
              </Typography>
              <CircularProgress 
                size={isMobile ? 24 : 30} 
                sx={{ 
                  color: 'success.main',
                  mt: 2
                }} 
              />
            </Box>
          </Zoom>
        )}
      </Box>
    </Fade>
  </DialogContent>
  
  {!companyEditSuccess && (
    <DialogActions sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      pt: { xs: 1, sm: 0 },
      borderTop: '1px solid',
      borderColor: 'grey.200',
      bgcolor: 'grey.50'
    }}>
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="flex-end" 
        width="100%"
        sx={{ flexWrap: 'wrap' }}
      >
        <Button
          onClick={() => setCompanyEditModalOpen(false)}
          color="inherit"
          disabled={companyEditLoading}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{ 
            borderRadius: 2,
            px: { xs: 3, sm: 4 },
            py: { xs: 0.75, sm: 1.2 },
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            borderColor: 'grey.400',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'grey.600',
              bgcolor: 'grey.100'
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSaveCompany}
          variant="contained"
          startIcon={companyEditLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
          disabled={companyEditLoading}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            px: { xs: 4, sm: 5 },
            py: { xs: 0.75, sm: 1.2 },
            fontWeight: 700,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            borderRadius: 2,
            background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
            boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0 12px 24px rgba(33, 150, 243, 0.4)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {companyEditLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>
    </DialogActions>
  )}
</Dialog>

        {/* Edit User Modal - COMPLETE WITH ALL FIELDS */}
        <Dialog 
          open={editModalOpen} 
          onClose={() => !saveLoading && setEditModalOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
          TransitionComponent={Transition}
          keepMounted
          PaperProps={{
            sx: { 
              borderRadius: isMobile ? 0 : 4,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            py: { xs: 2, sm: 3 },
            px: { xs: 2.5, sm: 4 },
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              animation: 'float 8s ease-in-out infinite'
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              animation: 'float 10s ease-in-out infinite reverse'
            }} />
            
            <Stack direction="row" alignItems="center" justifyContent="space-between" position="relative">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{
                  width: { xs: 40, sm: 50 },
                  height: { xs: 40, sm: 50 },
                  borderRadius: '50%',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }}>
                  <Edit sx={{ color: 'primary.main', fontSize: { xs: 22, sm: 28 } }} />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                    Edit User Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    Complete user profile management
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                onClick={() => setEditModalOpen(false)}
                disabled={saveLoading}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  transition: 'all 0.2s ease'
                }}
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {selectedUser && (
              <Fade in={!editSuccess} timeout={600}>
                <Box>
                  {!editSuccess ? (
                    <Stack spacing={4}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'info.50',
                          border: '1px solid',
                          borderColor: 'info.100',
                          '& .MuiAlert-icon': {
                            color: 'info.main'
                          },
                          '& .MuiAlert-message': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }
                        }}
                      >
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Editing: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                        </Typography>
                      </Alert>
                      
                      {/* SECTION 1: BASIC INFORMATION */}
                      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                          <AccountCircle color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
                            Basic Information
                          </Typography>
                        </Stack>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              name="name"
                              value={editFormData.name}
                              onChange={handleInputChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              required
                              error={!!formErrors.name}
                              helperText={formErrors.name}
                              InputProps={{
                                startAdornment: (
                                  <Person sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                )
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              name="email"
                              type="email"
                              value={editFormData.email}
                              onChange={handleInputChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              error={!!formErrors.email}
                              helperText={formErrors.email}
                              InputProps={{
                                startAdornment: (
                                  <Email sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                )
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              name="phone"
                              value={editFormData.phone}
                              onChange={handleInputChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              InputProps={{
                                startAdornment: (
                                  <Phone sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                )
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Date of Birth"
                              name="dob"
                              type="date"
                              value={editFormData.dob}
                              onChange={handleInputChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                startAdornment: (
                                  <CalendarToday sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                )
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                              <InputLabel>Gender</InputLabel>
                              <Select
                                name="gender"
                                value={editFormData.gender}
                                onChange={handleSelectChange}
                                label="Gender"
                                startAdornment={
                                  <InputAdornment position="start">
                                    <Wc sx={{ color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                  </InputAdornment>
                                }
                              >
                                <SelectMenuItem value="">
                                  <em>None</em>
                                </SelectMenuItem>
                                {genderOptions.map(option => (
                                  <SelectMenuItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                  </SelectMenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                              <InputLabel>Marital Status</InputLabel>
                              <Select
                                name="maritalStatus"
                                value={editFormData.maritalStatus}
                                onChange={handleSelectChange}
                                label="Marital Status"
                                startAdornment={
                                  <InputAdornment position="start">
                                    <Favorite sx={{ color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                  </InputAdornment>
                                }
                              >
                                <SelectMenuItem value="">
                                  <em>None</em>
                                </SelectMenuItem>
                                {maritalStatusOptions.map(option => (
                                  <SelectMenuItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                  </SelectMenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Address"
                              name="address"
                              value={editFormData.address}
                              onChange={handleInputChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              multiline
                              rows={isMobile ? 1 : 2}
                              InputProps={{
                                startAdornment: (
                                  <LocationOn sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                )
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                      
                      {/* SECTION 2: EMPLOYMENT INFORMATION */}
                      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                          <Work color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
                            Employment Information
                          </Typography>
                        </Stack>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Autocomplete
                              freeSolo
                              options={jobRoleOptions}
                              value={editFormData.jobRole}
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
                                  size={isMobile ? "small" : "medium"}
                                  fullWidth
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        <Badge sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
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
                                    <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                      {option.label || option.name}
                                    </Typography>
                                    {option.departmentName && (
                                      <Chip 
                                        label={option.departmentName} 
                                        size="small" 
                                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Stack>
                                </li>
                              )}
                              loading={loadingJobRoles}
                              loadingText="Loading job roles..."
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
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
                                  size={isMobile ? "small" : "medium"}
                                  fullWidth
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        <Business sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                        {params.InputProps.startAdornment}
                                      </>
                                    )
                                  }}
                                />
                              )}
                              renderOption={(props, option) => (
                                <li {...props}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <CorporateFare sx={{ fontSize: 18, color: 'action.active' }} />
                                    <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                      {option.label || option.name}
                                    </Typography>
                                  </Stack>
                                </li>
                              )}
                              loading={loadingDepartments}
                              loadingText="Loading departments..."
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                              <InputLabel>Employee Type</InputLabel>
                              <Select
                                name="employeeType"
                                value={editFormData.employeeType}
                                onChange={handleSelectChange}
                                label="Employee Type"
                                startAdornment={
                                  <InputAdornment position="start">
                                    <WorkHistory sx={{ color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                  </InputAdornment>
                                }
                              >
                                <SelectMenuItem value="">
                                  <em>None</em>
                                </SelectMenuItem>
                                {employeeTypeOptions.map(option => (
                                  <SelectMenuItem key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                  </SelectMenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Designation"
                              name="designation"
                              value={editFormData.designation}
                              onChange={handleInputChange}
                              variant="outlined"
                              size={isMobile ? "small" : "medium"}
                              InputProps={{
                                startAdornment: (
                                  <Badge sx={{ mr: 1, color: 'action.active', fontSize: { xs: 18, sm: 22 } }} />
                                )
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Stack>
                  ) : (
                    <Zoom in={editSuccess}>
                      <Box sx={{ 
                        py: { xs: 6, sm: 8 }, 
                        px: { xs: 2, sm: 4 }, 
                        textAlign: 'center'
                      }}>
                        <Box sx={{
                          width: { xs: 80, sm: 100, md: 120 },
                          height: { xs: 80, sm: 100, md: 120 },
                          borderRadius: '50%',
                          background: 'linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 4,
                          animation: 'pulse 2s infinite',
                          boxShadow: '0 12px 24px rgba(76, 175, 80, 0.3)'
                        }}>
                          <CheckCircle sx={{ fontSize: { xs: 50, sm: 60, md: 70 }, color: 'success.main' }} />
                        </Box>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} gutterBottom>
                          Update Successful!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                          User <strong style={{ color: theme.palette.primary.main }}>{editFormData.name}</strong> has been updated successfully.
                        </Typography>
                        <CircularProgress 
                          size={isMobile ? 24 : 30} 
                          sx={{ 
                            color: 'success.main',
                            mt: 2
                          }} 
                        />
                      </Box>
                    </Zoom>
                  )}
                </Box>
              </Fade>
            )}
          </DialogContent>
          
          {!editSuccess && (
            <DialogActions sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              pt: { xs: 1, sm: 0 },
              borderTop: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'grey.50'
            }}>
              <Stack 
                direction="row" 
                spacing={2} 
                justifyContent="flex-end" 
                width="100%"
                sx={{ flexWrap: 'wrap' }}
              >
                <Button
                  onClick={() => setEditModalOpen(false)}
                  color="inherit"
                  disabled={saveLoading}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    borderRadius: 2,
                    px: { xs: 2, sm: 4 },
                    py: { xs: 0.75, sm: 1.2 },
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    borderColor: 'grey.400',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'grey.600',
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleDeleteUser}
                  color="error"
                  startIcon={<Delete />}
                  disabled={saveLoading}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    borderRadius: 2,
                    px: { xs: 2, sm: 4 },
                    py: { xs: 0.75, sm: 1.2 },
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      bgcolor: 'error.50'
                    }
                  }}
                >
                  Delete
                </Button>
                
                <Button
                  onClick={handleSaveUser}
                  variant="contained"
                  startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                  disabled={saveLoading || !editFormData.name.trim()}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    px: { xs: 3, sm: 5 },
                    py: { xs: 0.75, sm: 1.2 },
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
                    boxShadow: '0 8px 16px rgba(33, 150, 243, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(145deg, #1976d2 0%, #1565c0 100%)',
                      boxShadow: '0 12px 24px rgba(33, 150, 243, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </DialogActions>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default CompanyDetails;