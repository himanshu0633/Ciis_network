import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config";
import {
  Business,
  People,
  Search,
  FilterList,
  Download,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  Close,
  Email,
  Phone,
  Person,
  CheckCircle,
  Cancel,
  MoreVert,
  Edit,
  LocationOn,
  CalendarToday,
  Add,
  Refresh,
  Delete,
  Block,
  Info,
  AssignmentInd,
  PersonAdd,
  Apartment,
  Groups,
  NotificationsNone,
  ChevronRight,
  CorporateFare,
  Language,
  Storage,
  Schedule,
  TrendingUp,
  Assessment,
  ArrowUpward,
  ArrowDownward,
  Sort,
  Menu as MenuIcon,
  Dashboard,
  Settings,
  Home,
  Star,
  StarBorder,
  Verified,
  Warning,
  Timeline as TimelineIcon,
  Analytics,
  BusinessCenter,
  WorkspacePremium,
  AccountBalance,
  PrecisionManufacturing,
  AutoGraph,
  BarChart,
  FileDownload,
  Print,
  Share,
  Bookmark,
  BookmarkBorder,
  PushPin,
  PushPinOutlined,
  Grade,
  GradeOutlined
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
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Collapse,
  Container,
  alpha,
  styled,
  Badge as MuiBadge,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Pagination,
  Breadcrumbs,
  Link,
  Grow,
  Fade,
  Slide,
  ButtonGroup,
  Skeleton,
  Alert,
  AlertTitle,
  Checkbox,
  Select,
  MenuItem as SelectMenuItem,
  Drawer,
  AppBar,
  Toolbar,
  useScrollTrigger,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  LinearProgress,
  Rating,
  CardMedia,
  CardHeader,
  AvatarGroup
} from "@mui/material";

// Import Timeline components from @mui/lab
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from "@mui/lab";

// Enhanced Professional Styled Components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
}));

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 24,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 20,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #fafcff 100%)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(37, 99, 235, 0.12)',
    borderColor: '#2563eb',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 20,
  },
}));

const CompanyCard = styled(Card)(({ theme }) => ({
  borderRadius: 28,
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #ffffff 0%, #fafcff 100%)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #2563eb, #7c3aed, #db2777)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 30px 60px rgba(37, 99, 235, 0.15)',
    borderColor: '#2563eb',
    '&::after': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 24,
  },
}));

const StatusBadge = styled(Box)(({ active, theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: 100,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.3px',
  background: active 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: 'white',
  boxShadow: active 
    ? '0 4px 10px rgba(16, 185, 129, 0.3)'
    : '0 4px 10px rgba(239, 68, 68, 0.3)',
  '& svg': {
    fontSize: 14,
    marginRight: 4,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '4px 10px',
    fontSize: '0.7rem',
    '& svg': {
      fontSize: 12,
    },
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#64748b',
  marginBottom: 4,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
  },
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#0f172a',
  wordBreak: 'break-word',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const GradientButton = styled(Button)(({ theme, variant, size }) => ({
  borderRadius: 14,
  padding: size === 'small' ? '6px 18px' : '8px 24px',
  fontWeight: 600,
  fontSize: size === 'small' ? '0.8rem' : '0.9rem',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
      transform: 'translateY(-1px)',
    },
  }),
  ...(variant === 'outlined' && {
    border: '1px solid rgba(37, 99, 235, 0.3)',
    color: '#2563eb',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      borderColor: '#2563eb',
      background: 'white',
      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.1)',
    },
  }),
  [theme.breakpoints.down('sm')]: {
    borderRadius: 12,
    padding: size === 'small' ? '4px 14px' : '6px 18px',
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  background: 'white',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    borderColor: 'transparent',
    color: 'white',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: 6,
    '& svg': {
      fontSize: 18,
    },
  },
}));

const LogoContainer = styled(Box)(({ theme, size = 'medium' }) => {
  const sizes = {
    small: { width: 44, height: 44, borderRadius: 14 },
    medium: { width: 80, height: 80, borderRadius: 20 },
    large: { width: 110, height: 110, borderRadius: 24 },
  };
  
  const mobileSizes = {
    small: { width: 40, height: 40, borderRadius: 12 },
    medium: { width: 64, height: 64, borderRadius: 16 },
    large: { width: 90, height: 90, borderRadius: 20 },
  };
  
  const selectedSize = theme.breakpoints.down('sm') ? mobileSizes[size] : sizes[size];
  
  return {
    ...selectedSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '2px solid rgba(37, 99, 235, 0.1)',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#2563eb',
      transform: 'scale(1.05)',
      boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15)',
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  };
});

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 20,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: '#2563eb',
    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: 16,
  },
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'countUp 2s ease-out',
  '@keyframes countUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(90deg)',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    boxShadow: '0 12px 35px rgba(37, 99, 235, 0.5)',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 30,
    background: 'white',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    '&:hover': {
      background: '#ffffff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    },
    '&.Mui-focused': {
      borderColor: '#2563eb',
      boxShadow: '0 4px 25px rgba(37, 99, 235, 0.15)',
    },
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '85%',
    maxWidth: 320,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    backdropFilter: 'blur(10px)',
  },
}));

const NotificationBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.7rem',
    minWidth: 18,
    height: 18,
  },
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: 20,
  border: '1px solid rgba(226, 232, 240, 0.6)',
}));

// Responsive Container
const ResponsiveContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  [theme.breakpoints.between('sm', 'md')]: {
    paddingLeft: 24,
    paddingRight: 24,
  },
}));

const AllCompany = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLaptop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Bottom navigation value for mobile
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // State variables (keep all existing state variables)
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New company registered', time: '5 min ago', read: false, type: 'registration' },
    { id: 2, message: 'Subscription expiring soon', time: '1 hour ago', read: false, type: 'subscription' },
    { id: 3, message: 'User limit reached', time: '2 hours ago', read: true, type: 'alert' },
  ]);
  
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

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Items per page based on screen size
  const itemsPerPage = isMobile ? 5 : isTablet ? 8 : 10;

  // Validation function (keep existing)
  const validateSuperAdmin = () => {
    try {
      const superAdminRaw = localStorage.getItem("superAdmin");
      const token = localStorage.getItem("token");

      if (!superAdminRaw || !token) {
        toast.error("Please login as super admin");
        localStorage.clear();
        navigate("/superAdmin/login");
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

  // Fetch company details by ID (keep existing)
  const fetchCompanyDetails = async (companyId) => {
    try {
      setCompanyDetailsLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        `${API_URL}/company/${companyId}`,
        { headers }
      );
      
      if (response.data) {
        setCompanyDetails(response.data.company);
        setEditedCompany(response.data.company);
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

  // Update company details (keep existing)
  const handleUpdateCompany = async () => {
    try {
      if (!validateSuperAdmin()) return;
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.put(
        `${API_URL}/company/${editedCompany?._id}`,
        editedCompany,
        { headers }
      );
      
      if (response.data) {
        toast.success("Company updated successfully!");
        
        const updatedCompanies = companies.map(company => 
          company._id === editedCompany._id ? { ...company, ...editedCompany } : company
        );
        
        setCompanies(updatedCompanies);
        setFilteredCompanies(updatedCompanies);
        setCompanyDetails(response.data);
        setEditMode(false);
        
        fetchCompaniesWithUsers();
      }
    } catch (error) {
      console.error("❌ ERROR updating company:", error);
      toast.error(error.response?.data?.message || "Failed to update company");
    }
  };

  // Fetch all users and group by company (keep existing)
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(`${API_URL}/superAdmin/users`, { headers });
      
      if (response.data && response.data.length > 0) {
        const usersByCompany = {};
        
        response.data.forEach(user => {
          const companyId = user.company?._id || user.company;
          if (companyId) {
            if (!usersByCompany[companyId]) {
              usersByCompany[companyId] = [];
            }
            usersByCompany[companyId].push(user);
          }
        });
        
        return usersByCompany;
      }
      return {};
    } catch (error) {
      console.error("❌ ERROR in fetchAllUsers:", error);
      return {};
    }
  };

  // Main function to fetch companies with users (keep existing)
  const fetchCompaniesWithUsers = async () => {
    if (!validateSuperAdmin()) return;

    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const companiesRes = await axios.get(
        `${API_URL}/superAdmin/companies`,
        { headers }
      );

      const companiesData = companiesRes.data || [];
      const usersByCompany = await fetchAllUsers();

      const companiesWithUsers = companiesData.map(company => {
        const companyUsers = usersByCompany[company._id] || [];
        return {
          ...company,
          userCount: companyUsers.length,
          users: companyUsers.slice(0, isMobile ? 1 : 2) // Show fewer users on mobile
        };
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
    } finally {
      setLoading(false);
    }
  };

  // Handle search and filter with sorting (keep existing)
  useEffect(() => {
    let results = [...companies];

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

    results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.companyName || '').localeCompare(b.companyName || '');
          break;
        case 'users':
          comparison = (a.userCount || 0) - (b.userCount || 0);
          break;
        case 'date':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Reset to first page when filters change
    setPage(1);
    setFilteredCompanies(results);
  }, [searchTerm, filter, sortBy, sortOrder, companies]);

  // Initial load
  useEffect(() => {
    fetchCompaniesWithUsers();
  }, []);

  // Fetch users for popup (keep existing)
  const fetchCompanyUsers = async (companyId) => {
    try {
      setUsersLoading(true);
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      let users = [];
      
      try {
        const response = await axios.get(
          `${API_URL}/superAdmin/company/${companyId}/users`,
          { headers }
        );
        users = response.data;
      } catch (error) {
        const allUsersRes = await axios.get(
          `${API_URL}/superAdmin/users`,
          { headers }
        );
        
        users = allUsersRes.data.filter(user => 
          user.company?._id === companyId || user.company === companyId
        );
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

  // Open users popup (keep existing)
  const handleOpenUsersPopup = async (company) => {
    setSelectedCompany(company);
    await fetchCompanyUsers(company._id);
    setUsersPopupOpen(true);
  };

  // Close users popup (keep existing)
  const handleCloseUsersPopup = () => {
    setUsersPopupOpen(false);
    setSelectedCompany(null);
    setCompanyUsers([]);
  };

  // Open company details popup (keep existing)
  const handleOpenCompanyDetails = async (company) => {
    setSelectedCompany(company);
    await fetchCompanyDetails(company._id);
  };

  // Close company details popup (keep existing)
  const handleCloseCompanyDetails = () => {
    setCompanyDetailsPopupOpen(false);
    setSelectedCompany(null);
    setCompanyDetails(null);
    setEditMode(false);
    setEditedCompany(null);
  };

  // Handle edit field change (keep existing)
  const handleEditChange = (field, value) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date (keep existing)
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format relative time (keep existing)
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Export to CSV (keep existing)
  const handleExportCSV = () => {
    try {
      const csvRows = [];
      csvRows.push(['Company Code', 'Company Name', 'Email', 'Phone', 'Owner', 'Users', 'Status', 'Created'].join(','));
      
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
      link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  // Toggle company expansion (keep existing)
  const toggleCompanyExpansion = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  // Navigate to create user page (keep existing)
  const handleNavigateToCreateUser = (companyId, companyCode, companyName) => {
    if (companyId && companyCode) {
      navigate(`/create-user?company=${companyId}&companyCode=${companyCode}&companyName=${encodeURIComponent(companyName || '')}`);
    } else {
      toast.error("Company information is missing");
    }
  };

  // Navigate to create company page (keep existing)
  const handleNavigateToCreateCompany = () => {
    navigate('/RegisterCompany');
  };

  // Get role badge color (keep existing)
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#2563eb';
      case 'manager': return '#7e22ce';
      case 'supervisor': return '#0891b2';
      case 'employee': return '#0a5e0a';
      default: return '#64748b';
    }
  };

  // Handle menu actions (keep existing)
  const handleMenuOpen = (event, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedAction(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAction(null);
  };

  const handleAction = (action) => {
    if (selectedAction) {
      switch (action) {
        case 'edit':
          handleOpenCompanyDetails(selectedAction);
          break;
        case 'users':
          handleOpenUsersPopup(selectedAction);
          break;
        case 'deactivate':
          toast.info('Deactivate functionality coming soon');
          break;
        case 'delete':
          toast.info('Delete functionality coming soon');
          break;
      }
    }
    handleMenuClose();
  };

  const handleNotificationsOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
    setNotificationAnchor(null);
  };

  // Add new user function
  const handleAddNewUser = (company) => {
    if (company && company._id && company.companyCode) {
      navigate(`/create-user?company=${company._id}&companyCode=${company.companyCode}&companyName=${encodeURIComponent(company.companyName || '')}`);
    } else {
      toast.error("Company information is incomplete");
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    handleNotificationsClose();
    toast.success('All notifications cleared');
  };

  // Handle bulk selection (keep existing)
  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map(c => c._id));
    }
  };

  // Handle filter menu (keep existing)
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // Calculate statistics
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.isActive).length;
  const totalUsers = companies.reduce((total, company) => total + (company.userCount || 0), 0);
  const activePercentage = totalCompanies > 0 ? Math.round((activeCompanies / totalCompanies) * 100) : 0;

  // Get company color
  const getCompanyColor = (company) => {
    if (!company) return '#2563eb';
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
    const index = (company.companyName?.length || 0) % colors.length;
    return colors[index];
  };

  // Pagination logic
  const paginatedCompanies = filteredCompanies.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Mobile drawer toggle
  const toggleMobileDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileDrawerOpen(open);
  };

  // Handle bottom navigation
  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    switch (newValue) {
      case 0:
        // Already on companies page
        break;
      case 1:
        handleNavigateToCreateCompany();
        break;
      case 2:
        fetchCompaniesWithUsers();
        break;
      case 3:
        handleExportCSV();
        break;
      default:
        break;
    }
  };

  // Loading state with enhanced skeletons
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        py: { xs: 2, sm: 3, md: 4 } 
      }}>
        <ResponsiveContainer maxWidth="xl">
          {/* Mobile App Bar Skeleton */}
          {isMobile && (
            <AppBar position="sticky" color="transparent" elevation={0} sx={{ mb: 2, bgcolor: 'transparent' }}>
              <Toolbar sx={{ px: 0 }}>
                <IconButton edge="start" color="inherit" onClick={toggleMobileDrawer(true)}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1, ml: 1, fontWeight: 700 }}>Companies</Typography>
                <Skeleton variant="circular" width={44} height={44} sx={{ borderRadius: 14 }} />
              </Toolbar>
            </AppBar>
          )}

          {/* Header Skeleton for Desktop */}
          {!isMobile && (
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
              <Box>
                <Skeleton variant="text" width={250} height={50} />
                <Skeleton variant="text" width={180} height={24} />
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Skeleton variant="rounded" width={140} height={44} sx={{ borderRadius: 14 }} />
                <Skeleton variant="rounded" width={120} height={44} sx={{ borderRadius: 14 }} />
                <Skeleton variant="circular" width={44} height={44} />
              </Stack>
            </Stack>
          )}

          {/* Stats Cards Skeleton */}
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={6} sm={6} md={3} key={i}>
                <Skeleton 
                  variant="rounded" 
                  height={isMobile ? 110 : 140} 
                  sx={{ borderRadius: { xs: 4, sm: 5 } }} 
                />
              </Grid>
            ))}
          </Grid>

          {/* Search Bar Skeleton */}
          <Skeleton 
            variant="rounded" 
            height={isMobile ? 56 : 72} 
            sx={{ borderRadius: { xs: 5, sm: 6 }, mb: { xs: 2, sm: 3, md: 4 } }} 
          />

          {/* Company Cards Skeleton */}
          <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton 
                key={i} 
                variant="rounded" 
                height={isMobile ? 200 : 250} 
                sx={{ borderRadius: { xs: 5, sm: 6 } }} 
              />
            ))}
          </Stack>
        </ResponsiveContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      position: 'relative',
      pb: isMobile ? 8 : 4,
    }}>
      {/* Animated Background */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)',
          animation: 'float 20s infinite',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.03) 0%, transparent 70%)',
          animation: 'float 25s infinite reverse',
        }} />
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(-20px, 20px) scale(1.05); }
              50% { transform: translate(20px, -20px) scale(0.95); }
              75% { transform: translate(-10px, -10px) scale(1.02); }
            }
          `}
        </style>
      </Box>

      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
            mb: 2,
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ minHeight: 64 }}>
            <IconButton edge="start" color="inherit" onClick={toggleMobileDrawer(true)}>
              <MenuIcon sx={{ color: '#1e293b' }} />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 1, fontWeight: 700, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Companies
            </Typography>
            <NotificationBadge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <IconButton color="inherit" onClick={handleNotificationsOpen}>
                <NotificationsNone sx={{ color: '#1e293b' }} />
              </IconButton>
            </NotificationBadge>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile Drawer */}
      <MobileDrawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={toggleMobileDrawer(false)}
        SlideProps={{ direction: 'right' }}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  fontSize: 32,
                }}
              >
                SA
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Super Admin
              </Typography>
              <Typography variant="body2" color="#64748b">
                admin@company.com
              </Typography>
            </Box>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 1 }}>
              Navigation
            </Typography>
            
            <Button
              fullWidth
              startIcon={<CorporateFare sx={{ color: '#2563eb' }} />}
              onClick={() => {
                toggleMobileDrawer(false)();
              }}
              sx={{ 
                justifyContent: 'flex-start', 
                borderRadius: 3,
                py: 1.5,
                color: '#1e293b',
                '&:hover': {
                  bgcolor: alpha('#2563eb', 0.04),
                }
              }}
            >
              Companies
            </Button>
            
            <Button
              fullWidth
              startIcon={<Add sx={{ color: '#10b981' }} />}
              onClick={() => {
                toggleMobileDrawer(false)();
                handleNavigateToCreateCompany();
              }}
              sx={{ 
                justifyContent: 'flex-start', 
                borderRadius: 3,
                py: 1.5,
                color: '#1e293b',
                '&:hover': {
                  bgcolor: alpha('#10b981', 0.04),
                }
              }}
            >
              Add Company
            </Button>
            
            <Button
              fullWidth
              startIcon={<Refresh sx={{ color: '#8b5cf6' }} />}
              onClick={() => {
                toggleMobileDrawer(false)();
                fetchCompaniesWithUsers();
              }}
              sx={{ 
                justifyContent: 'flex-start', 
                borderRadius: 3,
                py: 1.5,
                color: '#1e293b',
                '&:hover': {
                  bgcolor: alpha('#8b5cf6', 0.04),
                }
              }}
            >
              Refresh
            </Button>
            
            <Button
              fullWidth
              startIcon={<Download sx={{ color: '#f59e0b' }} />}
              onClick={() => {
                toggleMobileDrawer(false)();
                handleExportCSV();
              }}
              sx={{ 
                justifyContent: 'flex-start', 
                borderRadius: 3,
                py: 1.5,
                color: '#1e293b',
                '&:hover': {
                  bgcolor: alpha('#f59e0b', 0.04),
                }
              }}
            >
              Export
            </Button>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 1 }}>
              Analytics
            </Typography>
            
            <Box sx={{ px: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="#64748b">Total Companies</Typography>
                    <Typography variant="body2" fontWeight={700}>{totalCompanies}</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: alpha('#2563eb', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="#64748b">Active Companies</Typography>
                    <Typography variant="body2" fontWeight={700}>{activeCompanies}</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={activePercentage} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: alpha('#10b981', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="#64748b">Total Users</Typography>
                    <Typography variant="body2" fontWeight={700}>{totalUsers}</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((totalUsers / 1000) * 100, 100)} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: alpha('#8b5cf6', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }}
                  />
                </Box>
              </Stack>
            </Box>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Button
              fullWidth
              startIcon={<Dashboard />}
              onClick={() => {
                toggleMobileDrawer(false)();
                navigate('/dashboard');
              }}
              sx={{ 
                justifyContent: 'flex-start', 
                borderRadius: 3,
                py: 1.5,
                color: '#1e293b',
              }}
            >
              Dashboard
            </Button>
            
            <Button
              fullWidth
              startIcon={<Settings />}
              onClick={() => {
                toggleMobileDrawer(false)();
                navigate('/settings');
              }}
              sx={{ 
                justifyContent: 'flex-start', 
                borderRadius: 3,
                py: 1.5,
                color: '#1e293b',
              }}
            >
              Settings
            </Button>
          </Stack>
        </Box>
      </MobileDrawer>

      <ResponsiveContainer maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 0, sm: 2, md: 3, lg: 4 } }}>
        {/* Desktop Header with Breadcrumbs */}
        {!isMobile && (
          <Stack spacing={2} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <Breadcrumbs 
              separator={<ChevronRight fontSize="small" sx={{ color: '#94a3b8' }} />}
              sx={{ '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
            >
              <Link 
                color="inherit" 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigate('/dashboard');
                }}
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#64748b',
                  textDecoration: 'none',
                  '&:hover': { color: '#2563eb' }
                }}
              >
                <Dashboard sx={{ fontSize: 16 }} />
                Dashboard
              </Link>
              <Typography 
                color="text.primary" 
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: 600,
                  color: '#0f172a'
                }}
              >
                <CorporateFare sx={{ fontSize: 16 }} />
                Companies
              </Typography>
            </Breadcrumbs>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  borderRadius: { xs: 3, sm: 4 },
                  boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
                }}>
                  <CorporateFare sx={{ fontSize: { xs: 28, sm: 32 }, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant={isTablet ? "h5" : "h4"} sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Companies
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="#64748b">
                      {totalCompanies} organizations • {totalUsers} total users
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${activePercentage}% active`}
                      sx={{ 
                        bgcolor: alpha('#10b981', 0.1), 
                        color: '#059669',
                        fontWeight: 600,
                        height: 24,
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1.5}>
                {!isMobile && (
                  <>
                    <GradientButton
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleNavigateToCreateCompany}
                      size={isTablet ? "small" : "medium"}
                    >
                      Add Company
                    </GradientButton>
                    <GradientButton
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchCompaniesWithUsers}
                      size={isTablet ? "small" : "medium"}
                    >
                      Refresh
                    </GradientButton>
                  </>
                )}
                {!isMobile && (
                  <ActionIconButton onClick={handleNotificationsOpen}>
                    <NotificationBadge badgeContent={notifications.filter(n => !n.read).length} color="error">
                      <NotificationsNone />
                    </NotificationBadge>
                  </ActionIconButton>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Statistics Cards - Enhanced */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={6} md={3}>
            <Zoom in timeout={300}>
              <StatCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600, 
                          textTransform: 'uppercase',
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: '#64748b',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {isMobile ? 'Total' : 'Total Companies'}
                      </Typography>
                      <AnimatedNumber 
                        variant={isMobile ? "h5" : "h3"} 
                        sx={{ 
                          mt: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                        }}
                      >
                        {totalCompanies}
                      </AnimatedNumber>
                      {!isMobile && (
                        <Typography variant="caption" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUp sx={{ fontSize: 14 }} />
                          +12% from last month
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                      borderRadius: { xs: 2, sm: 3 }, 
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                    }}>
                      <Apartment sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Zoom>
          </Grid>

          <Grid item xs={6} md={3}>
            <Zoom in timeout={400}>
              <StatCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600, 
                          textTransform: 'uppercase',
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: '#64748b',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {isMobile ? 'Active' : 'Active Companies'}
                      </Typography>
                      <AnimatedNumber 
                        variant={isMobile ? "h5" : "h3"} 
                        sx={{ 
                          mt: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                        }}
                      >
                        {activeCompanies}
                      </AnimatedNumber>
                      {!isMobile && (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {activePercentage}% of total
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: { xs: 2, sm: 3 }, 
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                    }}>
                      <CheckCircle sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Zoom>
          </Grid>

          <Grid item xs={6} md={3}>
            <Zoom in timeout={500}>
              <StatCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600, 
                          textTransform: 'uppercase',
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: '#64748b',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {isMobile ? 'Users' : 'Total Users'}
                      </Typography>
                      <AnimatedNumber 
                        variant={isMobile ? "h5" : "h3"} 
                        sx={{ 
                          mt: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                        }}
                      >
                        {totalUsers}
                      </AnimatedNumber>
                      {!isMobile && (
                        <Typography variant="caption" sx={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People sx={{ fontSize: 14 }} />
                          Avg 24 per company
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: { xs: 2, sm: 3 }, 
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                    }}>
                      <Groups sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Zoom>
          </Grid>

          <Grid item xs={6} md={3}>
            <Zoom in timeout={600}>
              <StatCard>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600, 
                          textTransform: 'uppercase',
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          color: '#64748b',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {isMobile ? 'View' : 'Current View'}
                      </Typography>
                      <AnimatedNumber 
                        variant={isMobile ? "h5" : "h3"} 
                        sx={{ 
                          mt: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                        }}
                      >
                        {filteredCompanies.length}
                      </AnimatedNumber>
                      {!isMobile && (
                        <Typography variant="caption" sx={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FilterList sx={{ fontSize: 14 }} />
                          Filtered results
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ 
                      p: { xs: 1, sm: 1.5 }, 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: { xs: 2, sm: 3 }, 
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                    }}>
                      <FilterList sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Search and Filter Section - Enhanced */}
        <GlassPaper sx={{ 
          p: { xs: 1.5, sm: 2, md: 2.5 }, 
          mb: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: { xs: 4, sm: 5 },
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <SearchField
                fullWidth
                placeholder={isMobile ? "Search companies..." : "Search by name, email, code or owner..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Close fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1.5} 
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              >
                <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={(e, value) => value && setFilter(value)}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    p: 0.5,
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: 2.5,
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="active">Active</ToggleButton>
                  <ToggleButton value="inactive">Inactive</ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  endIcon={sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                  onClick={handleFilterMenuOpen}
                  sx={{ 
                    borderRadius: 3, 
                    borderColor: 'rgba(226, 232, 240, 0.8)',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#1e293b',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: 'white',
                    }
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  Sort by {sortBy}
                </Button>

                {!isMobile && (
                  <GradientButton
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportCSV}
                    size={isTablet ? "small" : "medium"}
                  >
                    Export
                  </GradientButton>
                )}

                {selectedCompanies.length > 0 && (
                  <Fade in>
                    <Chip
                      label={`${selectedCompanies.length} selected`}
                      onDelete={() => setSelectedCompanies([])}
                      color="primary"
                      sx={{ 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        fontWeight: 600,
                        height: { xs: 32, sm: 36 },
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                          '&:hover': {
                            color: 'rgba(255,255,255,0.8)',
                          }
                        }
                      }}
                    />
                  </Fade>
                )}
              </Stack>
            </Grid>
          </Grid>
        </GlassPaper>

        {/* Companies List */}
        {filteredCompanies.length === 0 ? (
          <Fade in>
            <Paper sx={{ 
              p: { xs: 4, sm: 5, md: 6 }, 
              textAlign: 'center', 
              borderRadius: { xs: 5, sm: 6 },
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}>
              <Box sx={{
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                }
              }}>
                <CorporateFare sx={{ fontSize: { xs: 50, sm: 60, md: 70 }, color: '#cbd5e1', mb: 2 }} />
              </Box>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: '#64748b', mb: 2, fontWeight: 600 }}>
                No companies found
              </Typography>
              <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                Try adjusting your search or filter to find what you're looking for.
              </Typography>
              <GradientButton
                variant="contained"
                startIcon={<Add />}
                onClick={handleNavigateToCreateCompany}
                size={isMobile ? "small" : "medium"}
              >
                Add New Company
              </GradientButton>
            </Paper>
          </Fade>
        ) : (
          <>
            <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {paginatedCompanies.map((company, index) => (
                <Grow in timeout={300 + index * 100} key={company._id}>
                  <CompanyCard>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      {/* Header Row */}
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        sx={{ mb: { xs: 1.5, sm: 2 } }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {bulkMode && (
                            <Checkbox
                              checked={selectedCompanies.includes(company._id)}
                              onChange={() => handleSelectCompany(company._id)}
                              size="small"
                              sx={{ 
                                p: { xs: 0.5, sm: 0.75 },
                                color: '#2563eb',
                                '&.Mui-checked': {
                                  color: '#2563eb',
                                }
                              }}
                            />
                          )}
                          <Chip
                            label={company.companyCode || 'N/A'}
                            size="small"
                            sx={{ 
                              background: `linear-gradient(135deg, ${alpha(getCompanyColor(company), 0.1)} 0%, ${alpha(getCompanyColor(company), 0.2)} 100%)`,
                              color: getCompanyColor(company),
                              fontWeight: 700,
                              border: `1px solid ${alpha(getCompanyColor(company), 0.2)}`,
                              height: { xs: 24, sm: 28 },
                              '& .MuiChip-label': {
                                fontSize: { xs: '0.65rem', sm: '0.75rem' }
                              }
                            }}
                          />
                          <StatusBadge active={company.isActive ? 1 : 0}>
                            {company.isActive ? <CheckCircle /> : <Cancel />}
                            {!isMobile && (company.isActive ? "Active" : "Inactive")}
                          </StatusBadge>
                          
                          {/* Rating/Importance Indicator */}
                          {company.userCount > 50 && (
                            <Tooltip title="High Impact Company">
                              <Star sx={{ color: '#fbbf24', fontSize: 20 }} />
                            </Tooltip>
                          )}
                        </Stack>
                        
                        <Stack direction="row" spacing={0.5}>
                          <ActionIconButton 
                            size="small" 
                            onClick={() => toggleCompanyExpansion(company._id)}
                            sx={{ p: { xs: 0.5, sm: 0.75 } }}
                          >
                            {expandedCompany === company._id ? 
                              <KeyboardArrowUp sx={{ fontSize: { xs: 18, sm: 20 } }} /> : 
                              <KeyboardArrowDown sx={{ fontSize: { xs: 18, sm: 20 } }} />
                            }
                          </ActionIconButton>
                          <ActionIconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, company)}
                            sx={{ p: { xs: 0.5, sm: 0.75 } }}
                          >
                            <MoreVert sx={{ fontSize: { xs: 18, sm: 20 } }} />
                          </ActionIconButton>
                        </Stack>
                      </Stack>

                      {/* Main Company Info - Enhanced */}
                      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                        <Grid item xs={12} md={8}>
                          <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={{ xs: 2, sm: 3 }} 
                            alignItems="flex-start"
                          >
                            <LogoContainer size={isMobile ? 'small' : isTablet ? 'medium' : 'medium'}>
                              {company.logo ? (
                                <img src={company.logo} alt={company.companyName} />
                              ) : (
                                <Avatar 
                                  sx={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    background: `linear-gradient(135deg, ${getCompanyColor(company)} 0%, ${alpha(getCompanyColor(company), 0.8)} 100%)`,
                                    fontSize: isMobile ? 24 : 32,
                                  }}
                                >
                                  {company.companyName?.charAt(0) || 'C'}
                                </Avatar>
                              )}
                            </LogoContainer>

                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant={isMobile ? "subtitle1" : "h5"} 
                                sx={{ 
                                  fontWeight: 800, 
                                  color: '#0f172a', 
                                  mb: { xs: 0.5, sm: 1 },
                                  fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.6rem' },
                                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                }}
                              >
                                {company.companyName || "Unnamed Company"}
                              </Typography>
                              
                              <Stack 
                                direction="row" 
                                spacing={{ xs: 1, sm: 2 }} 
                                sx={{ 
                                  mb: { xs: 1, sm: 2 }, 
                                  flexWrap: 'wrap', 
                                  gap: 0.5 
                                }}
                              >
                                <Chip
                                  icon={<Email sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                                  label={isMobile && company.companyEmail?.length > 15 ? 
                                    `${company.companyEmail?.substring(0, 12)}...` : 
                                    company.companyEmail || "No email"
                                  }
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: { xs: 24, sm: 28 },
                                    borderColor: alpha('#2563eb', 0.2),
                                    color: '#1e293b',
                                    '& .MuiChip-label': {
                                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                    }
                                  }}
                                />
                                {company.companyPhone && !isMobile && (
                                  <Chip
                                    icon={<Phone sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                                    label={company.companyPhone}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      height: { xs: 24, sm: 28 },
                                      borderColor: alpha('#10b981', 0.2),
                                      color: '#1e293b',
                                      '& .MuiChip-label': {
                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                      }
                                    }}
                                  />
                                )}
                                {company.ownerName && !isMobile && (
                                  <Chip
                                    icon={<Person sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                                    label={company.ownerName}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      height: { xs: 24, sm: 28 },
                                      borderColor: alpha('#8b5cf6', 0.2),
                                      color: '#1e293b',
                                      '& .MuiChip-label': {
                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                      }
                                    }}
                                  />
                                )}
                              </Stack>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                                <Box>
                                  <InfoLabel>Users</InfoLabel>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography 
                                      variant={isMobile ? "body1" : "h6"} 
                                      sx={{ 
                                        fontWeight: 800, 
                                        color: '#2563eb',
                                        fontSize: { xs: '1.1rem', sm: '1.35rem' }
                                      }}
                                    >
                                      {company.userCount || 0}
                                    </Typography>
                                    <Chip 
                                      size="small"
                                      label={company.userCount > 0 ? `${Math.round((company.userCount / totalUsers) * 100)}%` : '0%'}
                                      sx={{ 
                                        height: 20,
                                        fontSize: '0.6rem',
                                        bgcolor: alpha('#2563eb', 0.1),
                                        color: '#2563eb',
                                      }}
                                    />
                                  </Stack>
                                </Box>
                                {!isMobile && (
                                  <>
                                    <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#2563eb', 0.2) }} />
                                    <Box>
                                      <InfoLabel>Created</InfoLabel>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <CalendarToday sx={{ fontSize: 14, color: '#64748b' }} />
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            color: '#1e293b',
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                          }}
                                        >
                                          {formatRelativeTime(company.createdAt)}
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  </>
                                )}
                              </Box>
                            </Box>
                          </Stack>
                        </Grid>

                        {!isMobile && (
                          <Grid item xs={12} md={4}>
                            <MetricCard sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontWeight: 700, 
                                  mb: 1.5, 
                                  display: 'block',
                                  color: '#64748b',
                                  letterSpacing: '0.5px',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Quick Stats
                              </Typography>
                              
                              <Stack spacing={1.5}>
                                {company.companyAddress && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOn sx={{ fontSize: { xs: 14, sm: 16 }, color: '#ef4444' }} />
                                    <Typography 
                                      variant="body2" 
                                      color="#1e293b" 
                                      noWrap
                                      sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                                    >
                                      {company.companyAddress?.substring(0, 40)}
                                      {company.companyAddress?.length > 40 ? '...' : ''}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {company.subscriptionExpiry && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Schedule sx={{ fontSize: { xs: 14, sm: 16 }, color: '#f59e0b' }} />
                                    <Typography 
                                      variant="body2" 
                                      color="#1e293b"
                                      sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                                    >
                                      Expires: {formatDate(company.subscriptionExpiry)}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Activity Indicator */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AutoGraph sx={{ fontSize: { xs: 14, sm: 16 }, color: '#10b981' }} />
                                  <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                      <Typography variant="caption" color="#64748b">Activity</Typography>
                                      <Typography variant="caption" fontWeight={600} color="#10b981">High</Typography>
                                    </Stack>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={Math.min((company.userCount || 0) * 2, 100)} 
                                      sx={{ 
                                        height: 4, 
                                        borderRadius: 2,
                                        bgcolor: alpha('#10b981', 0.1),
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: '#10b981',
                                        }
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Stack>
                            </MetricCard>
                          </Grid>
                        )}
                      </Grid>

                      {/* Mobile Metrics Row - Enhanced */}
                      {isMobile && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: '#ef4444' }} />
                            <Typography variant="caption" color="#1e293b" noWrap sx={{ maxWidth: 150 }}>
                              {company.companyAddress?.substring(0, 30) || "No address"}
                            </Typography>
                          </Box>
                          {company.subscriptionExpiry && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: '#f59e0b' }} />
                              <Typography variant="caption" color="#1e293b">
                                {formatDate(company.subscriptionExpiry)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Team Section - Enhanced */}
                      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                        <Stack 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center" 
                          sx={{ mb: { xs: 1.5, sm: 2 } }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ 
                              p: 0.5, 
                              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                              borderRadius: 1.5,
                              color: 'white',
                            }}>
                              <Groups sx={{ fontSize: { xs: 18, sm: 20 } }} />
                            </Box>
                            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ fontWeight: 700, color: '#0f172a' }}>
                              Team Members
                            </Typography>
                            <Chip 
                              label={company.userCount || 0} 
                              size="small" 
                              sx={{ 
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                color: 'white',
                                fontWeight: 600,
                                height: { xs: 20, sm: 24 },
                                '& .MuiChip-label': {
                                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                }
                              }} 
                            />
                          </Stack>
                          
                          <Stack direction="row" spacing={1}>
                            {(company.userCount || 0) > 0 && (
                              <Button 
                                size="small"
                                onClick={() => handleOpenUsersPopup(company)}
                                endIcon={<ChevronRight sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                                sx={{ 
                                  color: '#2563eb', 
                                  textTransform: 'none',
                                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                  fontWeight: 600,
                                  '&:hover': {
                                    background: alpha('#2563eb', 0.04),
                                  }
                                }}
                              >
                                {isMobile ? 'View' : 'View All'}
                              </Button>
                            )}
                            <Tooltip title="Add Team Member">
                              <IconButton 
                                size="small"
                                onClick={() => handleAddNewUser(company)}
                                sx={{ 
                                  color: '#10b981',
                                  '&:hover': {
                                    background: alpha('#10b981', 0.1),
                                  }
                                }}
                              >
                                <PersonAdd sx={{ fontSize: { xs: 16, sm: 18 } }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {company.userCount > 0 ? (
                          <Grid container spacing={{ xs: 1, sm: 2 }}>
                            {(company.users || []).map((user, idx) => (
                              <Grid item xs={6} sm={3} key={idx}>
                                <Paper sx={{ 
                                  p: { xs: 1, sm: 2 }, 
                                  borderRadius: { xs: 3, sm: 4 }, 
                                  border: '1px solid rgba(226, 232, 240, 0.6)',
                                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    borderColor: getRoleColor(user.role),
                                    boxShadow: `0 8px 20px ${alpha(getRoleColor(user.role), 0.15)}`,
                                  },
                                }}>
                                  <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
                                    <MuiBadge
                                      overlap="circular"
                                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                      badgeContent={
                                        <Box sx={{ 
                                          width: { xs: 8, sm: 10 }, 
                                          height: { xs: 8, sm: 10 }, 
                                          borderRadius: '50%', 
                                          background: user.isActive ? '#10b981' : '#ef4444',
                                          border: '2px solid white',
                                          boxShadow: user.isActive ? '0 0 10px #10b981' : '0 0 10px #ef4444',
                                        }} />
                                      }
                                    >
                                      <Avatar 
                                        sx={{ 
                                          width: { xs: 36, sm: 48 }, 
                                          height: { xs: 36, sm: 48 },
                                          background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${alpha(getRoleColor(user.role), 0.8)} 100%)`,
                                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                          boxShadow: `0 4px 12px ${alpha(getRoleColor(user.role), 0.3)}`,
                                        }}
                                      >
                                        {user.name?.charAt(0) || 'U'}
                                      </Avatar>
                                    </MuiBadge>
                                    <Box sx={{ overflow: 'hidden' }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          color: '#1e293b',
                                          fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: { xs: 70, sm: 90 }
                                        }}
                                      >
                                        {user.name || "User"}
                                      </Typography>
                                      <Chip 
                                        label={user.role || "User"} 
                                        size="small" 
                                        sx={{ 
                                          height: { xs: 18, sm: 22 }, 
                                          fontSize: { xs: '0.55rem', sm: '0.65rem' },
                                          background: `linear-gradient(135deg, ${alpha(getRoleColor(user.role), 0.1)} 0%, ${alpha(getRoleColor(user.role), 0.2)} 100%)`,
                                          color: getRoleColor(user.role),
                                          fontWeight: 600,
                                          border: `1px solid ${alpha(getRoleColor(user.role), 0.2)}`,
                                          '& .MuiChip-label': {
                                            px: { xs: 0.5, sm: 1 }
                                          }
                                        }} 
                                      />
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Box sx={{ 
                            p: { xs: 2, sm: 3, md: 4 }, 
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: { xs: 4, sm: 5 }, 
                            textAlign: 'center',
                            border: '2px dashed #cbd5e1',
                          }}>
                            <PersonAdd sx={{ fontSize: { xs: 40, sm: 48 }, color: '#94a3b8', mb: 1 }} />
                            <Typography 
                              variant="body2"
                              sx={{ 
                                color: '#64748b', 
                                mb: { xs: 1, sm: 2 },
                                fontWeight: 600,
                              }}
                            >
                              No team members yet
                            </Typography>
                            {/* <GradientButton
                              variant="outlined"
                              size="small"
                              startIcon={<PersonAdd />}
                              onClick={() => handleAddNewUser(company)}
                            >
                              Add Member
                            </GradientButton> */}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </CompanyCard>
                </Grow>
              ))}
            </Stack>

            {/* Pagination - Enhanced */}
            {filteredCompanies.length > 0 && (
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                mt: { xs: 2, sm: 3 }, 
                borderRadius: { xs: 4, sm: 5 },
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(226, 232, 240, 0.6)',
              }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  justifyContent="space-between" 
                  alignItems="center"
                  spacing={1}
                >
                  <Typography color="#64748b" variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                    Showing {Math.min((page - 1) * itemsPerPage + 1, filteredCompanies.length)} - {Math.min(page * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                  </Typography>
                  <Pagination 
                    count={Math.ceil(filteredCompanies.length / itemsPerPage)} 
                    page={page} 
                    onChange={(e, v) => setPage(v)} 
                    shape="rounded" 
                    color="primary"
                    size={isMobile ? "small" : isTablet ? "medium" : "medium"}
                    siblingCount={isMobile ? 0 : 1}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 600,
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                          }
                        }
                      }
                    }}
                  />
                </Stack>
              </Paper>
            )}
          </>
        )}
      </ResponsiveContainer>

      {/* Mobile Bottom Navigation - Enhanced */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1100,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          }} 
          elevation={0}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={handleBottomNavChange}
            showLabels
            sx={{ 
              height: 64,
              background: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: '#64748b',
                '&.Mui-selected': {
                  color: '#2563eb',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }
                }
              }
            }}
          >
            <BottomNavigationAction label="Companies" icon={<CorporateFare />} />
            <BottomNavigationAction label="Add" icon={<Add />} />
            <BottomNavigationAction label="Refresh" icon={<Refresh />} />
            <BottomNavigationAction label="Export" icon={<Download />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Enhanced Floating Action Button for Mobile */}
      {isMobile && (
        <Zoom in>
          <SpeedDial
            ariaLabel="Actions"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            icon={<SpeedDialIcon />}
            FabProps={{ 
              sx: { 
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                }
              } 
            }}
          >
            <SpeedDialAction
              icon={<Add />}
              tooltipTitle="Add Company"
              tooltipOpen
              onClick={handleNavigateToCreateCompany}
              FabProps={{
                sx: {
                  background: '#2563eb',
                  '&:hover': { background: '#1d4ed8' }
                }
              }}
            />
            <SpeedDialAction
              icon={<PersonAdd />}
              tooltipTitle="Add User"
              tooltipOpen
              onClick={() => {
                if (companies.length > 0) {
                  handleAddNewUser(companies[0]);
                } else {
                  toast.info('Please create a company first');
                }
              }}
              FabProps={{
                sx: {
                  background: '#10b981',
                  '&:hover': { background: '#059669' }
                }
              }}
            />
            <SpeedDialAction
              icon={<Refresh />}
              tooltipTitle="Refresh"
              tooltipOpen
              onClick={fetchCompaniesWithUsers}
              FabProps={{
                sx: {
                  background: '#8b5cf6',
                  '&:hover': { background: '#7c3aed' }
                }
              }}
            />
            <SpeedDialAction
              icon={<Download />}
              tooltipTitle="Export"
              tooltipOpen
              onClick={handleExportCSV}
              FabProps={{
                sx: {
                  background: '#f59e0b',
                  '&:hover': { background: '#d97706' }
                }
              }}
            />
          </SpeedDial>
        </Zoom>
      )}

      {/* Company Details Dialog - Enhanced */}
      <Dialog 
        open={companyDetailsPopupOpen} 
        onClose={handleCloseCompanyDetails} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Slide : Fade}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 6,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <LogoContainer size="medium">
                <Avatar 
                  src={selectedCompany?.logo} 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    background: `linear-gradient(135deg, ${getCompanyColor(selectedCompany)} 0%, ${alpha(getCompanyColor(selectedCompany), 0.8)} 100%)`,
                  }}
                >
                  {selectedCompany?.companyName?.charAt(0) || 'C'}
                </Avatar>
              </LogoContainer>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {selectedCompany?.companyName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={selectedCompany?.companyCode} 
                    size="small" 
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.2)} 100%)`,
                      color: '#2563eb',
                      fontWeight: 600,
                    }}
                  />
                  <StatusBadge active={selectedCompany?.isActive ? 1 : 0}>
                    {selectedCompany?.isActive ? <CheckCircle /> : <Cancel />}
                    {selectedCompany?.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                </Stack>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={1}>
              {!editMode ? (
                <GradientButton
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                >
                  Edit
                </GradientButton>
              ) : (
                <>
                  <Button 
                    onClick={() => { 
                      setEditMode(false); 
                      setEditedCompany(companyDetails); 
                    }}
                    size={isMobile ? "small" : "medium"}
                    sx={{ borderRadius: 3 }}
                  >
                    Cancel
                  </Button>
                  <GradientButton
                    onClick={handleUpdateCompany}
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                  >
                    Save Changes
                  </GradientButton>
                </>
              )}
              <IconButton onClick={handleCloseCompanyDetails} sx={{ borderRadius: 2 }}>
                <Close />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {companyDetailsLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ color: '#2563eb', mb: 2 }} />
              <Typography sx={{ color: '#64748b' }}>Loading company details...</Typography>
            </Box>
          ) : companyDetails ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MetricCard sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ color: '#1e293b', lineHeight: 1.6 }}>
                    {companyDetails.description || "No description provided."}
                  </Typography>
                </MetricCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Basic Information
                </Typography>
                <MetricCard sx={{ p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <InfoLabel>Company Name</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyName || ''} 
                          onChange={(e) => handleEditChange('companyName', e.target.value)}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyName}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Company Code</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyCode || ''} 
                          onChange={(e) => handleEditChange('companyCode', e.target.value)}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyCode}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Owner Name</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.ownerName || ''} 
                          onChange={(e) => handleEditChange('ownerName', e.target.value)}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.ownerName || "Not specified"}</InfoValue>
                      )}
                    </Box>
                  </Stack>
                </MetricCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Contact Information
                </Typography>
                <MetricCard sx={{ p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <InfoLabel>Email Address</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyEmail || ''} 
                          onChange={(e) => handleEditChange('companyEmail', e.target.value)}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyEmail || "Not provided"}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Phone Number</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyPhone || ''} 
                          onChange={(e) => handleEditChange('companyPhone', e.target.value)}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyPhone || "Not provided"}</InfoValue>
                      )}
                    </Box>
                    
                    <Box>
                      <InfoLabel>Domain</InfoLabel>
                      {editMode ? (
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={editedCompany?.companyDomain || ''} 
                          onChange={(e) => handleEditChange('companyDomain', e.target.value)}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      ) : (
                        <InfoValue>{companyDetails.companyDomain || "Not specified"}</InfoValue>
                      )}
                    </Box>
                  </Stack>
                </MetricCard>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Address
                </Typography>
                <MetricCard sx={{ p: 2.5 }}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editedCompany?.companyAddress || ''}
                      onChange={(e) => handleEditChange('companyAddress', e.target.value)}
                      placeholder="Enter full address"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  ) : (
                    <InfoValue>{companyDetails.companyAddress || "No address provided"}</InfoValue>
                  )}
                </MetricCard>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  System Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <Storage sx={{ fontSize: 24, color: '#2563eb', mb: 1 }} />
                      <InfoLabel>Database ID</InfoLabel>
                      <InfoValue sx={{ fontSize: '0.9rem' }}>{companyDetails.dbIdentifier || "N/A"}</InfoValue>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <Schedule sx={{ fontSize: 24, color: '#f59e0b', mb: 1 }} />
                      <InfoLabel>Subscription</InfoLabel>
                      <InfoValue sx={{ fontSize: '0.9rem' }}>{formatDate(companyDetails.subscriptionExpiry)}</InfoValue>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <CalendarToday sx={{ fontSize: 24, color: '#10b981', mb: 1 }} />
                      <InfoLabel>Created</InfoLabel>
                      <InfoValue sx={{ fontSize: '0.9rem' }}>{formatDate(companyDetails.createdAt)}</InfoValue>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <MetricCard sx={{ p: 2, textAlign: 'center' }}>
                      <AutoGraph sx={{ fontSize: 24, color: '#8b5cf6', mb: 1 }} />
                      <InfoLabel>Last Updated</InfoLabel>
                      <InfoValue sx={{ fontSize: '0.9rem' }}>{formatDate(companyDetails.updatedAt)}</InfoValue>
                    </MetricCard>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  fontSize: 24,
                }
              }}
            >
              <AlertTitle>Error</AlertTitle>
              Company details could not be loaded
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          borderTop: '1px solid rgba(226, 232, 240, 0.6)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          gap: 1 
        }}>
          <Button 
            onClick={handleCloseCompanyDetails} 
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              borderColor: 'rgba(226, 232, 240, 0.8)',
              color: '#64748b',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users Dialog - Enhanced */}
      <Dialog 
        open={usersPopupOpen} 
        onClose={handleCloseUsersPopup} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Slide : Fade}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 6,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ 
                background: `linear-gradient(135deg, ${getCompanyColor(selectedCompany)} 0%, ${alpha(getCompanyColor(selectedCompany), 0.8)} 100%)`,
                width: 48,
                height: 48,
              }}>
                <Groups />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {selectedCompany?.companyName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="#64748b">
                    {companyUsers.length} team members
                  </Typography>
                  <Chip 
                    size="small"
                    label={companyUsers.length > 0 ? `${Math.round((companyUsers.filter(u => u.isActive).length / companyUsers.length) * 100)}% active` : '0% active'}
                    sx={{ 
                      height: 20,
                      fontSize: '0.6rem',
                      bgcolor: alpha('#10b981', 0.1),
                      color: '#059669',
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
            <IconButton onClick={handleCloseUsersPopup} sx={{ borderRadius: 2 }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {usersLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ color: '#2563eb', mb: 2 }} />
              <Typography sx={{ color: '#64748b' }}>Loading team members...</Typography>
            </Box>
          ) : companyUsers.length > 0 ? (
            <TableContainer component={Paper} sx={{ 
              borderRadius: 4,
              border: '1px solid rgba(226, 232, 240, 0.6)',
              overflow: 'hidden',
            }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Member</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow 
                      key={user._id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha('#2563eb', 0.02),
                        }
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            src={user.avatar} 
                            sx={{ 
                              background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${alpha(getRoleColor(user.role), 0.8)} 100%)`,
                              width: 36,
                              height: 36,
                              fontSize: '0.9rem',
                            }}
                          >
                            {user.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {user.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#1e293b">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role || 'User'} 
                          size="small"
                          sx={{ 
                            background: `linear-gradient(135deg, ${alpha(getRoleColor(user.role), 0.1)} 0%, ${alpha(getRoleColor(user.role), 0.2)} 100%)`,
                            color: getRoleColor(user.role),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={user.isActive ? 1 : 0} sx={{ py: '2px' }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                }
              }}>
                <PersonAdd sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#1e293b', mb: 1, fontWeight: 700 }}>
                No team members yet
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
                Start building your team by adding members
              </Typography>
              <GradientButton
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => {
                  handleCloseUsersPopup();
                  handleAddNewUser(selectedCompany);
                }}
              >
                Add Team Member
              </GradientButton>
            </Box>
          )}
        </DialogContent>

        {companyUsers.length > 0 && (
          <DialogActions sx={{ 
            p: { xs: 2.5, sm: 3 }, 
            borderTop: '1px solid rgba(226, 232, 240, 0.6)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          }}>
            <Button 
              onClick={handleCloseUsersPopup}
              sx={{ 
                borderRadius: 3,
                color: '#64748b',
              }}
            >
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Notifications Popover - Enhanced */}
      <Popover
        open={notificationsOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Grow}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 380 },
            maxWidth: '100%',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button 
                size="small" 
                onClick={clearAllNotifications}
                sx={{ 
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                Clear All
              </Button>
            )}
          </Stack>

          {notifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    mb: 0.5,
                    background: notification.read ? 'transparent' : `linear-gradient(135deg, ${alpha('#2563eb', 0.04)} 0%, ${alpha('#2563eb', 0.02)} 100%)`,
                    border: notification.read ? 'none' : '1px solid rgba(37, 99, 235, 0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: alpha('#2563eb', 0.02),
                    }
                  }}
                  secondaryAction={
                    !notification.read && (
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={() => markNotificationAsRead(notification.id)}
                        sx={{ 
                          color: '#10b981',
                          '&:hover': {
                            background: alpha('#10b981', 0.1),
                          }
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      background: notification.type === 'registration' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                               notification.type === 'subscription' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                               notification.type === 'alert' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 
                               'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      width: 40,
                      height: 40,
                    }}>
                      {notification.type === 'registration' ? <Business /> :
                       notification.type === 'subscription' ? <Schedule /> :
                       notification.type === 'alert' ? <Info /> : <Person />}
                    </Avatar>
                  </ListItemAvatar>
                  <MuiListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 700, color: '#0f172a' }}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <Schedule sx={{ fontSize: 12, color: '#94a3b8' }} />
                        <Typography variant="caption" color="#94a3b8">
                          {notification.time}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsNone sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography color="#64748b" sx={{ fontWeight: 600 }}>No notifications</Typography>
              <Typography variant="caption" color="#94a3b8">You're all caught up!</Typography>
            </Box>
          )}
        </Box>
      </Popover>

      {/* Action Menu - Enhanced */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Grow}
        PaperProps={{ 
          sx: { 
            borderRadius: 4, 
            minWidth: 200,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          } 
        }}
      >
        <MenuItem onClick={() => handleAction('edit')} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Edit fontSize="small" sx={{ color: '#2563eb' }} />
          </ListItemIcon>
          <ListItemText primary="Edit Company" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
        </MenuItem>
        <MenuItem onClick={() => handleAction('users')} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Groups fontSize="small" sx={{ color: '#8b5cf6' }} />
          </ListItemIcon>
          <ListItemText primary="View Users" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
        </MenuItem>
        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        <MenuItem onClick={() => handleAction('deactivate')} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Block fontSize="small" sx={{ color: '#f59e0b' }} />
          </ListItemIcon>
          <ListItemText primary="Deactivate" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ py: 1.5, px: 2, color: '#ef4444' }}>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText primary="Delete" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
        </MenuItem>
      </Menu>

      {/* Filter/Sort Menu - Enhanced */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        TransitionComponent={Grow}
        PaperProps={{ 
          sx: { 
            borderRadius: 4, 
            minWidth: 220,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          } 
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
            Sort By
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('name'); handleFilterMenuClose(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemText primary="Company Name" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
          {sortBy === 'name' && <CheckCircle fontSize="small" sx={{ color: '#2563eb', ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('users'); handleFilterMenuClose(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemText primary="User Count" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
          {sortBy === 'users' && <CheckCircle fontSize="small" sx={{ color: '#2563eb', ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('date'); handleFilterMenuClose(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemText primary="Created Date" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
          {sortBy === 'date' && <CheckCircle fontSize="small" sx={{ color: '#2563eb', ml: 1 }} />}
        </MenuItem>
        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        <MenuItem onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); handleFilterMenuClose(); }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            {sortOrder === 'asc' ? 
              <ArrowUpward fontSize="small" sx={{ color: '#2563eb' }} /> : 
              <ArrowDownward fontSize="small" sx={{ color: '#2563eb' }} />
            }
          </ListItemIcon>
          <ListItemText primary={sortOrder === 'asc' ? 'Ascending' : 'Descending'} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AllCompany;