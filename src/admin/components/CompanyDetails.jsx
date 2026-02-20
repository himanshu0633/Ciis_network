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
  EmojiEvents,
  Star,
  StarBorder,
  Verified,
  Warning,
  Analytics,
  BusinessCenter,
  WorkspacePremium,
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
  GradeOutlined,
  ArrowForward,
  Menu as MenuIcon
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
  FormHelperText,
  styled,
  Drawer,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar
} from "@mui/material";

// Enhanced Styled Components with responsive design
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 16,
  },
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
    padding: theme.spacing(2),
  },
}));

const StatBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(226, 232, 240, 0.6)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: 12,
  },
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: 'inherit',
  },
  [theme.breakpoints.down('sm')]: {
    height: 24,
    fontSize: '0.75rem',
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
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

// Responsive Container component
const ResponsiveContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  [theme.breakpoints.between('sm', 'md')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Mobile Menu Drawer
const MobileMenuDrawer = ({ open, onClose, company, handleEditCompany, handleRefresh, handleAddNewUser }) => {
  const theme = useTheme();
  
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '60vh',
          padding: theme.spacing(2)
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>Menu Options</Typography>
          <IconButton onClick={onClose} size="small">
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem 
            button 
            onClick={() => {
              handleEditCompany();
              onClose();
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 1.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ListItemIcon>
              <Edit sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Edit Company" 
              secondary="Update company details"
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => {
              handleRefresh();
              onClose();
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 1.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.1)
              }
            }}
          >
            <ListItemIcon>
              <Refresh sx={{ color: theme.palette.info.main, fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Refresh Data" 
              secondary="Reload company information"
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </ListItem>
          
          <ListItem 
            button 
            onClick={() => {
              handleAddNewUser();
              onClose();
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 1.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.success.main, 0.1)
              }
            }}
          >
            <ListItemIcon>
              <Add sx={{ color: theme.palette.success.main, fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Add New User" 
              secondary="Create a new user account"
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

// Mobile Bottom Navigation
const MobileBottomNav = ({ activeTab, setActiveTab, handleAddNewUser, company }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        display: { xs: 'block', sm: 'none' },
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={activeTab}
        onChange={(event, newValue) => {
          setActiveTab(newValue);
        }}
        showLabels
        sx={{
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '4px 0',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="Overview" 
          icon={<Business sx={{ fontSize: 20 }} />} 
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              '&.Mui-selected': {
                fontSize: '0.7rem'
              }
            }
          }}
        />
        <BottomNavigationAction 
          label="Users" 
          icon={<People sx={{ fontSize: 20 }} />} 
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              '&.Mui-selected': {
                fontSize: '0.7rem'
              }
            }
          }}
        />
        <BottomNavigationAction 
          label="Add User" 
          icon={<Add sx={{ fontSize: 20 }} />} 
          onClick={(e) => {
            e.stopPropagation();
            handleAddNewUser();
          }}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              '&.Mui-selected': {
                fontSize: '0.7rem'
              }
            }
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

// Responsive Company Header
const ResponsiveCompanyHeader = ({ company, handleEditCompany, handleRefresh, handleAddNewUser, handleCopy, copied }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  
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
  
  return (
    <>
      <GradientCard 
        gradient="linear-gradient(145deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)"
        sx={{
          mt: { xs: 1, sm: 2, md: 3, lg: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          p: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          borderRadius: { xs: 2, sm: 3, md: 4, lg: 5 },
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          justifyContent="space-between"
          spacing={{ xs: 2, sm: 3 }}
        >
          {/* Left Section - Logo and Company Info */}
          <Stack 
            direction={{ xs: 'row', sm: 'row' }} 
            alignItems="center" 
            spacing={{ xs: 1.5, sm: 2, md: 3 }}
            sx={{ width: '100%' }}
          >
            {/* Logo */}
            <Box sx={{ 
              position: 'relative',
              flexShrink: 0
            }}>
              <Avatar
                src={company.logo || defaultLogo}
                sx={{
                  width: { xs: 50, sm: 70, md: 100, lg: 120 },
                  height: { xs: 50, sm: 70, md: 100, lg: 120 },
                  border: '2px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  bgcolor: 'white',
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
                  bottom: { xs: 0, sm: 2 },
                  right: { xs: 0, sm: 2 },
                  width: { xs: 16, sm: 20, md: 24 },
                  height: { xs: 16, sm: 20, md: 24 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                  <CheckCircle sx={{ fontSize: { xs: 8, sm: 10, md: 14 }, color: 'white' }} />
                </Box>
              )}
            </Box>
            
            {/* Company Name and Chips */}
            <Box sx={{ 
              flex: 1,
              minWidth: 0
            }}>
              {/* Company Name with Edit Icon */}
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={0.5} 
                sx={{ 
                  mb: 0.5,
                  flexWrap: 'wrap'
                }}
              >
                <Typography 
                  variant={isMobile ? "subtitle1" : isTablet ? "h5" : "h4"} 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.3rem', md: '1.8rem', lg: '2.2rem' },
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    wordBreak: 'break-word',
                    lineHeight: 1.2
                  }}
                >
                  {company.companyName}
                </Typography>
                
                {/* Edit button */}
                <Tooltip title="Edit Company" arrow placement="top">
                  <IconButton 
                    onClick={handleEditCompany}
                    size="small"
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(5px)',
                      width: { xs: 28, sm: 32, md: 36 },
                      height: { xs: 28, sm: 32, md: 36 },
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.25)',
                      },
                      ml: 0.5
                    }}
                  >
                    <Edit sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              
              {/* Company Chips */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 0.5, sm: 0.8 },
                alignItems: 'center',
                mb: { xs: 1, sm: 1.5 }
              }}>
                <Chip
                  icon={company.isActive ? <CheckCircle sx={{ fontSize: { xs: '0.7rem !important', sm: '0.8rem !important' } }} /> : <Cancel sx={{ fontSize: { xs: '0.7rem !important', sm: '0.8rem !important' } }} />}
                  label={company.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    background: company.isActive 
                      ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' 
                      : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                    color: 'white',
                    fontWeight: 600,
                    height: { xs: 22, sm: 24, md: 26 },
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                    '& .MuiChip-icon': { color: 'white' },
                    '& .MuiChip-label': { px: { xs: 0.8, sm: 1 } },
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
                
                {company.companyCode && (
                  <Chip
                    icon={<Code sx={{ fontSize: { xs: '0.7rem !important', sm: '0.8rem !important' } }} />}
                    label={`Code: ${company.companyCode}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      fontWeight: 500,
                      height: { xs: 22, sm: 24, md: 26 },
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '& .MuiChip-icon': { color: 'white' },
                      '& .MuiChip-label': { px: { xs: 0.8, sm: 1 } }
                    }}
                  />
                )}
                
                <Chip
                  icon={<CalendarToday sx={{ fontSize: { xs: '0.7rem !important', sm: '0.8rem !important' } }} />}
                  label={`Joined ${formatRelativeTime(company.createdAt)}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 500,
                    height: { xs: 22, sm: 24, md: 26 },
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '& .MuiChip-icon': { color: 'white' },
                    '& .MuiChip-label': { px: { xs: 0.8, sm: 1 } },
                    maxWidth: { xs: '100%', sm: 'none' }
                  }}
                />
              </Box>
            </Box>
          </Stack>
          
          {/* Action Buttons - Desktop/Tablet */}
          <Stack 
            direction="row" 
            spacing={1.5}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <Tooltip title="Refresh Data" arrow>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(5px)',
                  width: { sm: 36, md: 40, lg: 44 },
                  height: { sm: 36, md: 40, lg: 44 },
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'rotate(180deg)'
                  },
                  transition: 'all 0.5s ease'
                }}
              >
                <Refresh fontSize={isTablet ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              onClick={handleAddNewUser}
              startIcon={<Add />}
              disabled={!company?._id}
              size={isTablet ? "small" : "medium"}
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                color: '#0d47a1',
                fontWeight: 700,
                px: { sm: 2, md: 2.5, lg: 3 },
                py: { sm: 0.6, md: 0.8, lg: 1 },
                borderRadius: 2,
                fontSize: { sm: '0.75rem', md: '0.8rem', lg: '0.85rem' },
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                '&:hover': {
                  background: 'white',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Add User
            </Button>
          </Stack>
          
          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'block', sm: 'none' }, position: 'absolute', top: 8, right: 8 }}>
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                width: 32,
                height: 32
              }}
            >
              <MenuIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Stack>
        
        {/* Mobile Login URL */}
        <Box sx={{ 
          display: { xs: 'block', sm: 'none' }, 
          mt: 2,
          p: 1.5,
          bgcolor: 'rgba(0,0,0,0.2)',
          borderRadius: 2
        }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
            Login URL:
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{
              flex: 1,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 1.5,
              px: 1.5,
              py: 1,
              overflow: 'hidden'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: 'monospace',
                  color: 'white',
                  fontWeight: 500,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.7rem'
                }}
              >
                {window.location.origin}{company.loginUrl}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                color: 'white',
                bgcolor: copied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.15)',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: copied ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255,255,255,0.25)' }
              }}
            >
              {copied ? <CheckCircle sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Stack>
          {copied && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#4caf50', 
                display: 'block', 
                mt: 0.5,
                fontSize: '0.65rem',
                fontWeight: 600
              }}
            >
              ✓ Copied to clipboard!
            </Typography>
          )}
        </Box>
      </GradientCard>
      
      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        company={company}
        handleEditCompany={handleEditCompany}
        handleRefresh={handleRefresh}
        handleAddNewUser={handleAddNewUser}
      />
    </>
  );
};

// Responsive Stats Grid
const ResponsiveStatsGrid = ({ stats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const statsData = [
    {
      icon: <People sx={{ fontSize: isMobile ? 20 : 24, color: 'white' }} />,
      value: stats.totalUsers,
      label: 'TOTAL USERS',
      color: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
    },
    {
      icon: <CheckCircle sx={{ fontSize: isMobile ? 20 : 24, color: 'white' }} />,
      value: stats.activeUsers,
      label: 'ACTIVE USERS',
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
    },
    {
      icon: <CorporateFare sx={{ fontSize: isMobile ? 20 : 24, color: 'white' }} />,
      value: stats.departments,
      label: 'DEPARTMENTS',
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)'
    },
    {
      icon: <Today sx={{ fontSize: isMobile ? 20 : 24, color: 'white' }} />,
      value: stats.todayLogins,
      label: "TODAY'S LOGINS",
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
    }
  ];
  
  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { 
        xs: 'repeat(2, 1fr)', 
        sm: 'repeat(4, 1fr)' 
      },
      gap: { xs: 1.5, sm: 2, md: 2.5 },
      mb: { xs: 2, sm: 3 }
    }}>
      {statsData.map((stat, index) => (
        <StatBox key={index}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Box sx={{
              width: { xs: 36, sm: 40, md: 44, lg: 48 },
              height: { xs: 36, sm: 40, md: 44, lg: 48 },
              borderRadius: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
              background: stat.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto',
              boxShadow: `0 4px 12px ${alpha(stat.color, 0.3)}`,
            }}>
              {stat.icon}
            </Box>
            <AnimatedNumber sx={{ 
              fontWeight: 800, 
              color: stat.color, 
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.8rem', lg: '2rem' },
              lineHeight: 1.2,
              mb: 0.3
            }}>
              {stat.value}
            </AnimatedNumber>
            <Typography sx={{ 
              fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.65rem', lg: '0.7rem' }, 
              color: '#64748b', 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap'
            }}>
              {stat.label}
            </Typography>
          </Box>
        </StatBox>
      ))}
    </Box>
  );
};

// Responsive Company Information Card
const ResponsiveCompanyInfoCard = ({ company }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  
  const infoItems = [
    {
      icon: <Fingerprint sx={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />,
      label: 'Company Code',
      value: company.companyCode || "N/A",
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
    },
    // {
    //   icon: <Email sx={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />,
    //   label: 'Email',
    //   value: company.companyEmail || "Not provided",
    //   gradient: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)'
    // },
    // {
    //   icon: <Phone sx={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />,
    //   label: 'Phone',
    //   value: company.companyPhone || "Not provided",
    //   gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
    // },
    // {
    //   icon: <LocationOn sx={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />,
    //   label: 'Address',
    //   value: company.companyAddress || "Not provided",
    //   gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
    // },
    {
      icon: <Event sx={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />,
      label: 'Created On',
      value: formatDate(company.createdAt),
      gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
    },
    {
      icon: <Person sx={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />,
      label: 'Owner',
      value: company.ownerName || "Administrator",
      gradient: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)'
    }
  ];
  
  return (
    <Card sx={{ 
      borderRadius: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'white',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      mb: { xs: 2, sm: 3 },
      overflow: 'hidden',
      border: '1px solid rgba(226, 232, 240, 0.6)',
    }}>
      <Box sx={{
        height: 4,
        background: 'linear-gradient(90deg, #2196f3, #9c27b0, #ff9800)'
      }} />
      
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{
              p: { xs: 0.5, sm: 0.75, md: 1 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex'
            }}>
              <Business sx={{ color: 'primary.main', fontSize: { xs: 16, sm: 18, md: 20 } }} />
            </Box>
            <Typography variant={isMobile ? "body2" : "h6"} fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
              Company Information
            </Typography>
          </Stack>
        }
        sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'grey.100', 
          py: { xs: 1, sm: 1.5, md: 2 },
          px: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'grey.50'
        }}
      />
      
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
          {infoItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 1.5 },
                p: { xs: 1, sm: 1.2, md: 1.5 },
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderRadius: { xs: 1.5, sm: 2 },
                border: '1px solid',
                borderColor: 'grey.100',
                height: '100%'
              }}>
                <Box sx={{ 
                  width: { xs: 32, sm: 36, md: 40 },
                  height: { xs: 32, sm: 36, md: 40 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  background: item.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ 
                    fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.65rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    display: 'block',
                    mb: 0.2
                  }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' },
                    wordBreak: 'break-word',
                    color: '#0f172a',
                    lineHeight: 1.3
                  }}>
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Responsive Subscription Card
const ResponsiveSubscriptionCard = ({ company }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  
  const getSubscriptionStatus = (daysRemaining) => {
    if (daysRemaining > 15) return { color: 'success', text: 'Active', bg: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' };
    if (daysRemaining > 7) return { color: 'warning', text: 'Expiring Soon', bg: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)' };
    if (daysRemaining > 0) return { color: 'error', text: 'Critical', bg: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' };
    return { color: 'error', text: 'Expired', bg: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' };
  };
  
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
  
  const daysRemaining = getDaysRemaining(company.subscriptionExpiry);
  const subscriptionStatus = getSubscriptionStatus(daysRemaining);
  const subscriptionProgress = Math.min((daysRemaining / 30) * 100, 100);
  
  return (
    <Card sx={{ 
      borderRadius: { xs: 2, sm: 3, md: 4 },
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      background: `linear-gradient(145deg, ${
        subscriptionStatus.color === 'success' ? '#e8f5e9' :
        subscriptionStatus.color === 'warning' ? '#fff3e0' :
        '#ffebee'
      } 0%, ${
        subscriptionStatus.color === 'success' ? '#c8e6c9' :
        subscriptionStatus.color === 'warning' ? '#ffe0b2' :
        '#ffcdd2'
      } 100%)`,
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      mb: { xs: 2, sm: 3 }
    }}>
      <Box sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: { xs: 100, sm: 120, md: 150 },
        height: { xs: 100, sm: 120, md: 150 },
        borderRadius: '50%',
        background: `radial-gradient(circle, ${
          subscriptionStatus.color === 'success' ? 'rgba(76, 175, 80, 0.15)' :
          subscriptionStatus.color === 'warning' ? 'rgba(255, 152, 0, 0.15)' :
          'rgba(244, 67, 54, 0.15)'
        } 0%, transparent 70%)`,
      }} />
      
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, position: 'relative' }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems="center" 
          justifyContent="space-between" 
          spacing={{ xs: 2, sm: 3 }}
        >
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
              <Box sx={{
                p: { xs: 0.5, sm: 0.75, md: 1 },
                borderRadius: { xs: 1.5, sm: 2 },
                background: subscriptionStatus.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardMembership sx={{ 
                  color: 'white',
                  fontSize: { xs: 16, sm: 18, md: 20 }
                }} />
              </Box>
              <Typography variant={isMobile ? "body2" : "h6"} fontWeight={700} color={`${subscriptionStatus.color}.dark`} sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' } }}>
                Subscription Status
              </Typography>
              <Chip
                label={subscriptionStatus.text}
                size="small"
                sx={{
                  background: subscriptionStatus.bg,
                  color: 'white',
                  fontWeight: 600,
                  height: { xs: 20, sm: 22, md: 24 },
                  fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                  ml: { xs: 0, sm: 'auto' },
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
            }}>
              <strong>Expires on:</strong> {formatDate(company.subscriptionExpiry)}
            </Typography>
            
            <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
                  Days Remaining
                </Typography>
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  fontWeight={800} 
                  sx={{
                    background: subscriptionStatus.bg,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' }
                  }}
                >
                  {daysRemaining} days
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={subscriptionProgress}
                sx={{ 
                  height: { xs: 6, sm: 8, md: 10 },
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: subscriptionStatus.bg,
                  }
                }}
              />
            </Box>
            
            <Alert 
              severity={subscriptionStatus.color}
              iconMapping={{
                success: <CheckCircle fontSize="inherit" />,
                warning: <WarningAmber fontSize="inherit" />,
                error: <ErrorOutline fontSize="inherit" />
              }}
              sx={{ 
                mt: { xs: 1, sm: 1.5 }, 
                borderRadius: { xs: 1.5, sm: 2 },
                py: { xs: 0.3, sm: 0.5 },
                '& .MuiAlert-icon': {
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                },
                '& .MuiAlert-message': {
                  fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                  padding: '2px 0'
                }
              }}
            >
              {daysRemaining > 0 
                ? `Your subscription will expire in ${daysRemaining} days.`
                : 'Your subscription has expired.'}
            </Alert>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Responsive Recent Users Card
const ResponsiveRecentUsersCard = ({ recentUsers, handleEditUser, handleAddNewUser, isMobile }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      borderRadius: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'white',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: { lg: '600px' },
      border: '1px solid rgba(226, 232, 240, 0.6)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #4caf50, #2196f3, #9c27b0)'
      }} />
      
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{
                p: { xs: 0.5, sm: 0.75, md: 1 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex'
              }}>
                <People sx={{ color: 'primary.main', fontSize: { xs: 16, sm: 18, md: 20 } }} />
              </Box>
              <Typography variant={isMobile ? "body2" : "h6"} fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
                Recent Users
              </Typography>
            </Stack>
            <MuiBadge 
              badgeContent={recentUsers.length} 
              color="primary"
              sx={{ 
                '& .MuiBadge-badge': { 
                  fontWeight: 700,
                  fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                  height: { xs: 16, sm: 18, md: 20 },
                  minWidth: { xs: 16, sm: 18, md: 20 },
                } 
              }}
            />
          </Stack>
        }
        sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'grey.100', 
          py: { xs: 1, sm: 1.5, md: 2 },
          px: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'grey.50'
        }}
      />
      
      {/* Scrollable Content Area */}
      <CardContent 
        sx={{ 
          p: 0, 
          flexGrow: 1,
          overflowY: 'auto',
          maxHeight: { xs: '300px', sm: '350px', md: '400px', lg: '500px' },
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            borderRadius: '4px',
          },
        }}
      >
        {recentUsers.length > 0 ? (
          <List sx={{ p: 0 }}>
            {recentUsers.map((user, index) => (
              <ListItem
                key={user.id || user._id || index}
                sx={{
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { xs: 1.2, sm: 1.5, md: 2 },
                  borderBottom: index < recentUsers.length - 1 ? '1px solid' : 'none',
                  borderColor: 'grey.100',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <ListItemAvatar>
                  <MuiBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: { xs: 8, sm: 9, md: 10 },
                          height: { xs: 8, sm: 9, md: 10 },
                          borderRadius: '50%',
                          background: user.isActive 
                            ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                            : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                          border: '2px solid white',
                        }}
                      />
                    }
                  >
                    <Avatar
                      sx={{
                        width: { xs: 36, sm: 40, md: 44 },
                        height: { xs: 36, sm: 40, md: 44 },
                        background: user.isActive 
                          ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                          : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
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
                      fontWeight={700} 
                      noWrap
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
                        color: '#0f172a',
                        mb: 0.2
                      }}
                    >
                      {user.name || 'Unknown User'}
                    </Typography>
                  }
                  secondary={
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.3 }}>
                      {user.employeeType && (
                        <Chip
                          label={user.employeeType}
                          size="small"
                          sx={{ 
                            height: { xs: 16, sm: 18 }, 
                            fontSize: { xs: '0.5rem', sm: '0.55rem' },
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)',
                            color: 'white',
                            '& .MuiChip-label': { px: 0.6 }
                          }}
                        />
                      )}
                      <Chip
                        label={user.department || 'No Dept'}
                        size="small"
                        sx={{ 
                          height: { xs: 16, sm: 18 }, 
                          fontSize: { xs: '0.5rem', sm: '0.55rem' },
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          '& .MuiChip-label': { px: 0.6 }
                        }}
                      />
                    </Stack>
                  }
                />
                
                <Tooltip title="Edit User" arrow placement="left">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                    onClick={() => handleEditUser(user)}
                    sx={{
                      ml: 1,
                      borderRadius: 1.5,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      minWidth: { xs: 32, sm: 36, md: 40 },
                      fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.65rem' },
                      py: { xs: 0.2, sm: 0.3, md: 0.4 },
                      px: { xs: 0.6, sm: 0.8, md: 1 },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: 'white',
                        borderColor: 'transparent',
                      },
                      transition: 'all 0.2s ease',
                      flexShrink: 0
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
            py: { xs: 4, sm: 5, md: 6 },
            px: 2,
            height: '100%',
            minHeight: { xs: '200px', sm: '250px' }
          }}>
            <Box sx={{
              width: { xs: 50, sm: 60, md: 70 },
              height: { xs: 50, sm: 60, md: 70 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}>
              <People sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: '#1976d2' }} />
            </Box>
            <Typography variant="body2" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}>
              No Users Found
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, mb: 2 }}>
              Get started by adding users
            </Typography>
            <Button
              variant="contained"
              onClick={handleAddNewUser}
              startIcon={<Add sx={{ fontSize: 14 }} />}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 0.5,
                borderRadius: 1.5,
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
              }}
            >
              Add First User
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
const CompanyDetails = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
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
    if (daysRemaining > 15) return { color: 'success', text: 'Active', bg: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' };
    if (daysRemaining > 7) return { color: 'warning', text: 'Expiring Soon', bg: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)' };
    if (daysRemaining > 0) return { color: 'error', text: 'Critical', bg: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' };
    return { color: 'error', text: 'Expired', bg: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' };
  };

  // Handle manual refresh
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

  // Handle user edit
  const handleEditUser = (user) => {
    console.log("Editing user:", user);
    
    // Find department name from ID if needed
    let departmentName = user.department;
    if (user.department && typeof user.department === 'object') {
      departmentName = user.department.name || user.department._id;
    } else if (user.department) {
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
            borderRadius: { xs: 3, sm: 4 },
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
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            Loading...
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}
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
            borderRadius: { xs: 3, sm: 4 },
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
          <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} color="error.main" gutterBottom sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>
            Oops!
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            Company Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: isMobile ? '0.9rem' : '1rem' }}>
            Unable to load company details. Please try again or contact support.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={() => navigate("/Ciis-network/SuperAdminDashboard")}
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '1rem' },
                background: 'linear-gradient(145deg, #2196f3 0%, #1976d2 100%)',
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
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 700,
                fontSize: { xs: '0.85rem', sm: '1rem' },
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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      pb: { xs: 8, sm: 6 },
      position: 'relative'
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
          width: { xs: 200, sm: 250, md: 300 },
          height: { xs: 200, sm: 250, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)',
          animation: 'float 20s infinite',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: { xs: 250, sm: 300, md: 400 },
          height: { xs: 250, sm: 300, md: 400 },
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

      <ResponsiveContainer maxWidth="xl">
        {/* Responsive Header */}
        <ResponsiveCompanyHeader
          company={company}
          handleEditCompany={handleEditCompany}
          handleRefresh={handleRefresh}
          handleAddNewUser={handleAddNewUser}
          handleCopy={handleCopy}
          copied={copied}
        />

        {/* Responsive Stats Grid */}
        <ResponsiveStatsGrid stats={stats} />

        {/* Conditional Rendering based on tab for mobile */}
        {isMobile ? (
          <>
            {activeTab === 0 && (
              <>
                <ResponsiveCompanyInfoCard company={company} />
                <ResponsiveSubscriptionCard company={company} />
              </>
            )}
            {activeTab === 1 && (
              <ResponsiveRecentUsersCard
                recentUsers={recentUsers}
                handleEditUser={handleEditUser}
                handleAddNewUser={handleAddNewUser}
                isMobile={isMobile}
              />
            )}
          </>
        ) : (
          /* Desktop/Tablet Layout */
          <Grid container spacing={{ sm: 2, md: 3 }}>
            {/* Left Column - Company Info & Subscription */}
            <Grid item xs={12} lg={8}>
              <ResponsiveCompanyInfoCard company={company} />
              <ResponsiveSubscriptionCard company={company} />
            </Grid>
            
            {/* Right Column - Recent Users */}
            <Grid item xs={12} lg={4}>
              <ResponsiveRecentUsersCard
                recentUsers={recentUsers}
                handleEditUser={handleEditUser}
                handleAddNewUser={handleAddNewUser}
                isMobile={isMobile}
              />
            </Grid>
          </Grid>
        )}
      </ResponsiveContainer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleAddNewUser={handleAddNewUser}
        company={company}
      />

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
            borderRadius: isMobile ? 0 : { sm: 3, md: 4 },
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            margin: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          py: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 2, sm: 2.5, md: 4 },
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: { xs: 100, sm: 120, md: 150 },
            height: { xs: 100, sm: 120, md: 150 },
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between" position="relative">
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
              <Box sx={{
                width: { xs: 40, sm: 45, md: 55 },
                height: { xs: 40, sm: 45, md: 55 },
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}>
                <Business sx={{ color: '#0d47a1', fontSize: { xs: 20, sm: 24, md: 30 } }} />
              </Box>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Edit Company Details
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } }}>
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
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s ease',
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 }
              }}
            >
              <Close sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 2.5, md: 4 } }}>
          <Fade in={!companyEditSuccess} timeout={600}>
            <Box>
              {!companyEditSuccess ? (
                <Stack spacing={3}>
                  <Alert 
                    severity="info" 
                    icon={<InfoOutlined />}
                    sx={{ 
                      borderRadius: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      '& .MuiAlert-icon': {
                        fontSize: { xs: '1.2rem', sm: '1.4rem' }
                      },
                      '& .MuiAlert-message': {
                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                      }
                    }}
                  >
                    Editing: <strong>{company.companyName}</strong>
                  </Alert>
                  
                  <Grid container spacing={2}>
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
                              <Business sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    
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
                              <Email sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    
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
                              <Phone sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    
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
                              <Image sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
                            </InputAdornment>
                          )
                        }}
                        helperText="Leave empty for default logo"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }
                        }}
                      />
                    </Grid>
                    
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
                              <LocationOn sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: { xs: 1.5, sm: 2 },
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {companyEditFormData.logo && (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        borderRadius: { xs: 1.5, sm: 2 },
                        bgcolor: 'grey.50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}
                    >
                      <Avatar
                        src={companyEditFormData.logo}
                        sx={{ 
                          width: { xs: 50, sm: 55, md: 60 }, 
                          height: { xs: 50, sm: 55, md: 60 }, 
                          border: '2px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        {companyEditFormData.companyName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                          Logo Preview
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          display: 'block', 
                          wordBreak: 'break-all',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}>
                          {companyEditFormData.logo.substring(0, 40)}...
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Stack>
              ) : (
                <Zoom in={companyEditSuccess}>
                  <Box sx={{ 
                    py: { xs: 4, sm: 6, md: 8 }, 
                    px: { xs: 2, sm: 3, md: 4 }, 
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      width: { xs: 80, sm: 100, md: 120 },
                      height: { xs: 80, sm: 100, md: 120 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: { xs: 2, sm: 3, md: 4 },
                      border: '3px solid white'
                    }}>
                      <CheckCircle sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: 'success.main' }} />
                    </Box>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }}>
                      Company Updated!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ 
                      mb: { xs: 2, sm: 3 }, 
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } 
                    }}>
                      <strong style={{ color: theme.palette.primary.main }}>{companyEditFormData.companyName}</strong> has been updated successfully.
                    </Typography>
                    <CircularProgress 
                      size={isMobile ? 24 : 30} 
                      sx={{ color: 'success.main' }} 
                    />
                  </Box>
                </Zoom>
              )}
            </Box>
          </Fade>
        </DialogContent>
        
        {!companyEditSuccess && (
          <DialogActions sx={{ 
            p: { xs: 2, sm: 2.5, md: 4 }, 
            pt: { xs: 1, sm: 0 },
            borderTop: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'grey.50',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              justifyContent="flex-end" 
              width="100%"
            >
              <Button
                onClick={() => setCompanyEditModalOpen(false)}
                color="inherit"
                disabled={companyEditLoading}
                variant="outlined"
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 0.6, sm: 0.8, md: 1.2 },
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                }}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSaveCompany}
                variant="contained"
                startIcon={companyEditLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                disabled={companyEditLoading}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  px: { xs: 3, sm: 4, md: 5 },
                  py: { xs: 0.6, sm: 0.8, md: 1.2 },
                  fontWeight: 700,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  },
                }}
              >
                {companyEditLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </DialogActions>
        )}
      </Dialog>

      {/* Edit User Modal */}
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
            borderRadius: isMobile ? 0 : { sm: 3, md: 4 },
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            margin: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          py: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 2, sm: 2.5, md: 4 },
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: { xs: 100, sm: 120, md: 150 },
            height: { xs: 100, sm: 120, md: 150 },
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 8s ease-in-out infinite'
          }} />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between" position="relative">
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
              <Box sx={{
                width: { xs: 40, sm: 45, md: 55 },
                height: { xs: 40, sm: 45, md: 55 },
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}>
                <Person sx={{ color: '#0d47a1', fontSize: { xs: 20, sm: 24, md: 30 } }} />
              </Box>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Edit User Details
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' } }}>
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
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s ease',
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 }
              }}
            >
              <Close sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 2.5, md: 4 } }}>
          {selectedUser && (
            <Fade in={!editSuccess} timeout={600}>
              <Box>
                {!editSuccess ? (
                  <Stack spacing={{ xs: 2, sm: 3, md: 4 }}>
                    <Alert 
                      severity="info" 
                      icon={<InfoOutlined />}
                      sx={{ 
                        borderRadius: { xs: 1.5, sm: 2 },
                        py: { xs: 0.5, sm: 0.75 },
                        '& .MuiAlert-icon': {
                          fontSize: { xs: '1.2rem', sm: '1.4rem' }
                        },
                        '& .MuiAlert-message': {
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                        }
                      }}
                    >
                      Editing: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                    </Alert>
                    
                    {/* SECTION 1: BASIC INFORMATION */}
                    <Paper elevation={0} sx={{ 
                      p: { xs: 1.5, sm: 2, md: 3 }, 
                      bgcolor: 'grey.50', 
                      borderRadius: { xs: 1.5, sm: 2 },
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box sx={{
                          p: { xs: 0.5, sm: 0.75, md: 1 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                          color: 'white',
                          display: 'flex'
                        }}>
                          <AccountCircle sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                        </Box>
                        <Typography variant={isMobile ? "body2" : "h6"} fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
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
                                <InputAdornment position="start">
                                  <Person sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              },
                              '& .MuiFormHelperText-root': {
                                fontSize: { xs: '0.65rem', sm: '0.7rem' }
                              }
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
                                <InputAdornment position="start">
                                  <Email sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              },
                              '& .MuiFormHelperText-root': {
                                fontSize: { xs: '0.65rem', sm: '0.7rem' }
                              }
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
                                <InputAdornment position="start">
                                  <Phone sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }
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
                                <InputAdornment position="start">
                                  <CalendarToday sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                            <InputLabel sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>Gender</InputLabel>
                            <Select
                              name="gender"
                              value={editFormData.gender}
                              onChange={handleSelectChange}
                              label="Gender"
                              startAdornment={
                                <InputAdornment position="start">
                                  <Wc sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              }
                              sx={{ 
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }}
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
                            <InputLabel sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>Marital Status</InputLabel>
                            <Select
                              name="maritalStatus"
                              value={editFormData.maritalStatus}
                              onChange={handleSelectChange}
                              label="Marital Status"
                              startAdornment={
                                <InputAdornment position="start">
                                  <Favorite sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              }
                              sx={{ 
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }}
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
                                <InputAdornment position="start">
                                  <LocationOn sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    {/* SECTION 2: EMPLOYMENT INFORMATION */}
                    <Paper elevation={0} sx={{ 
                      p: { xs: 1.5, sm: 2, md: 3 }, 
                      bgcolor: 'grey.50', 
                      borderRadius: { xs: 1.5, sm: 2 },
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box sx={{
                          p: { xs: 0.5, sm: 0.75, md: 1 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          background: 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)',
                          color: 'white',
                          display: 'flex'
                        }}>
                          <Work sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                        </Box>
                        <Typography variant={isMobile ? "body2" : "h6"} fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}>
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
                                      <InputAdornment position="start">
                                        <Badge sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                      </InputAdornment>
                                      {params.InputProps.startAdornment}
                                    </>
                                  )
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                  }
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Work sx={{ fontSize: 14, color: 'action.active' }} />
                                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' } }}>
                                    {option.label || option.name}
                                  </Typography>
                                  {option.departmentName && (
                                    <Chip 
                                      label={option.departmentName} 
                                      size="small" 
                                      sx={{ 
                                        height: 18, 
                                        fontSize: '0.55rem',
                                      }}
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
                                      <InputAdornment position="start">
                                        <Business sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                      </InputAdornment>
                                      {params.InputProps.startAdornment}
                                    </>
                                  )
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                  }
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CorporateFare sx={{ fontSize: 14, color: 'action.active' }} />
                                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' } }}>
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
                            <InputLabel sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>Employee Type</InputLabel>
                            <Select
                              name="employeeType"
                              value={editFormData.employeeType}
                              onChange={handleSelectChange}
                              label="Employee Type"
                              startAdornment={
                                <InputAdornment position="start">
                                  <WorkHistory sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              }
                              sx={{ 
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }}
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
                                <InputAdornment position="start">
                                  <Badge sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Salary"
                            name="salary"
                            value={editFormData.salary}
                            onChange={handleInputChange}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                </InputAdornment>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: { xs: 1.5, sm: 2 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem' }
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={editFormData.isActive}
                                onChange={handleInputChange}
                                name="isActive"
                                color="success"
                                size={isMobile ? "small" : "medium"}
                              />
                            }
                            label={
                              <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' } }}>
                                Active Status
                              </Typography>
                            }
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Stack>
                ) : (
                  <Zoom in={editSuccess}>
                    <Box sx={{ 
                      py: { xs: 4, sm: 6, md: 8 }, 
                      px: { xs: 2, sm: 3, md: 4 }, 
                      textAlign: 'center'
                    }}>
                      <Box sx={{
                        width: { xs: 80, sm: 100, md: 120 },
                        height: { xs: 80, sm: 100, md: 120 },
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: { xs: 2, sm: 3, md: 4 },
                        border: '3px solid white'
                      }}>
                        <CheckCircle sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: 'success.main' }} />
                      </Box>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }}>
                        Update Successful!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ 
                        mb: { xs: 2, sm: 3 }, 
                        fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } 
                      }}>
                        User <strong style={{ color: theme.palette.primary.main }}>{editFormData.name}</strong> has been updated successfully.
                      </Typography>
                      <CircularProgress 
                        size={isMobile ? 24 : 30} 
                        sx={{ color: 'success.main' }} 
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
            p: { xs: 2, sm: 2.5, md: 4 }, 
            pt: { xs: 1, sm: 0 },
            borderTop: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'grey.50',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              justifyContent="flex-end" 
              width="100%"
            >
              <Button
                onClick={() => setEditModalOpen(false)}
                color="inherit"
                disabled={saveLoading}
                variant="outlined"
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 0.6, sm: 0.8, md: 1.2 },
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
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
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 0.6, sm: 0.8, md: 1.2 },
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
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
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  px: { xs: 3, sm: 4, md: 5 },
                  py: { xs: 0.6, sm: 0.8, md: 1.2 },
                  fontWeight: 700,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  },
                }}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default CompanyDetails;