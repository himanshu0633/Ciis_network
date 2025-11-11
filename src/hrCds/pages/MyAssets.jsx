import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, Button,
  Snackbar, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Chip, List, ListItem, ListItemText,
  Card, CardContent, Grid, Stack, Avatar, Fade,
  Tooltip, LinearProgress, useTheme, useMediaQuery,
  Divider, Badge, InputAdornment, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  FiRefreshCw, FiPackage, FiSmartphone, 
  FiHeadphones, FiCpu, FiCheckCircle, FiClock,
  FiXCircle, FiPlus, FiSearch, FiUser, FiSettings,
  FiMonitor, FiFilter, FiDownload, FiEye, FiEdit, FiTrash2,
  FiArrowUp, FiTrendingUp, FiAlertCircle, FiInfo
} from 'react-icons/fi';
import axios from '../../utils/axiosConfig';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Enhanced Styled Components
const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
    transform: 'translateY(-8px)',
    '& .stat-icon': {
      transform: 'scale(1.1)',
      animation: `${pulse} 2s infinite`,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
    opacity: 0.8,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette[color].main}08, transparent)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::after': {
    opacity: 1,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.75rem',
  height: '32px',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  ...(status === 'approved' && {
    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    color: 'white',
    '&:hover': {
      boxShadow: `0 4px 16px ${theme.palette.success.main}40`,
    },
  }),
  ...(status === 'pending' && {
    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    color: 'white',
    '&:hover': {
      boxShadow: `0 4px 16px ${theme.palette.warning.main}40`,
    },
  }),
  ...(status === 'rejected' && {
    background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
    color: 'white',
    '&:hover': {
      boxShadow: `0 4px 16px ${theme.palette.error.main}40`,
    },
  }),
}));

const AssetTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  height: '28px',
  borderRadius: '14px',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  ...(type === 'phone' && {
    background: `linear-gradient(135deg, ${theme.palette.info.light}20, ${theme.palette.info.main}20)`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}30`,
  }),
  ...(type === 'laptop' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}20)`,
    color: theme.palette.primary.dark,
    border: `1px solid ${theme.palette.primary.main}30`,
  }),
  ...(type === 'desktop' && {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light}20, ${theme.palette.secondary.main}20)`,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}30`,
  }),
  ...(type === 'headphone' && {
    background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.success.main}20)`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}30`,
  }),
  ...(type === 'sim' && {
    background: `linear-gradient(135deg, ${theme.palette.warning.light}20, ${theme.palette.warning.main}20)`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}30`,
  }),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  '& .MuiTableHead-root': {
    background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
  },
  '& .MuiTableCell-head': {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    padding: '16px 12px',
    background: 'transparent',
  },
  '& .MuiTableCell-body': {
    padding: '16px 12px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  animation: `${slideIn} 0.5s ease-out`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(8px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    '& .action-buttons': {
      opacity: 1,
      transform: 'translateX(0)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: `linear-gradient(180deg, ${
      status === 'approved' ? theme.palette.success.main :
      status === 'pending' ? theme.palette.warning.main :
      theme.palette.error.main
    }, transparent)`,
    opacity: 0.8,
  },
}));

const ActionButton = styled(IconButton)(({ theme, variant = 'primary' }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: '8px',
  margin: '0 4px',
  transition: 'all 0.3s ease',
  opacity: 0,
  transform: 'translateX(10px)',
  ...(variant === 'view' && {
    color: theme.palette.info.main,
    '&:hover': {
      backgroundColor: theme.palette.info.main,
      color: 'white',
      borderColor: theme.palette.info.main,
      transform: 'scale(1.1)',
    },
  }),
  ...(variant === 'edit' && {
    color: theme.palette.warning.main,
    '&:hover': {
      backgroundColor: theme.palette.warning.main,
      color: 'white',
      borderColor: theme.palette.warning.main,
      transform: 'scale(1.1)',
    },
  }),
  ...(variant === 'delete' && {
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.main,
      color: 'white',
      borderColor: theme.palette.error.main,
      transform: 'scale(1.1)',
    },
  }),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: 'white',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 2,
  padding: '14px 28px',
  textTransform: 'none',
  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: theme.palette.action.disabled,
    boxShadow: 'none',
    transform: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    transition: 'all 0.3s ease',
    background: theme.palette.background.paper,
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

const MobileRequestCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: `linear-gradient(180deg, ${
      status === 'approved' ? theme.palette.success.main :
      status === 'pending' ? theme.palette.warning.main :
      theme.palette.error.main
    }, transparent)`,
  },
}));

const PropertyItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  background: theme.palette.background.paper,
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(8px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const allowedAssets = [
  { value: 'phone', label: 'Smartphone', icon: FiSmartphone, color: 'info' },
  { value: 'sim', label: 'SIM Card', icon: FiCpu, color: 'warning' },
  { value: 'laptop', label: 'Laptop', icon: FiMonitor, color: 'primary' },
  { value: 'desktop', label: 'Desktop', icon: FiSettings, color: 'secondary' },
  { value: 'headphone', label: 'Headphones', icon: FiHeadphones, color: 'success' }
];

const MyAssets = () => {
  const [newAsset, setNewAsset] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [count, setCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    setFetching(true);
    try {
      const res = await axios.get('/assets/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
      setCount(res.data.count);
      calculateStats(res.data.requests);
    } catch (err) {
      setNotification({
        message: err.response?.data?.error || 'Failed to fetch requests',
        severity: 'error',
      });
    } finally {
      setFetching(false);
    }
  };

  const calculateStats = (requestsData) => {
    const approved = requestsData.filter(req => req.status === 'approved').length;
    const pending = requestsData.filter(req => req.status === 'pending').length;
    const rejected = requestsData.filter(req => req.status === 'rejected').length;
    
    setStats({
      total: requestsData.length,
      approved,
      pending,
      rejected
    });
  };

  useEffect(() => {
    fetchRequests();

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setProperties(parsedUser.properties || []);
      } catch (err) {
        console.error('Failed to parse user data from localStorage:', err);
      }
    }
  }, []);

  const handleRequest = async () => {
    if (!newAsset) {
      setNotification({ message: 'Please select an asset.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        '/assets/request',
        { assetName: newAsset },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification({ message: res.data.message, severity: 'success' });
      setNewAsset('');
      fetchRequests();
    } catch (err) {
      setNotification({
        message: err.response?.data?.error || 'Request failed',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle size={16} />;
      case 'pending':
        return <FiClock size={16} />;
      case 'rejected':
        return <FiXCircle size={16} />;
      default:
        return <FiPackage size={16} />;
    }
  };

  const getAssetIcon = (assetType) => {
    const asset = allowedAssets.find(a => a.value === assetType);
    if (asset && asset.icon) {
      return React.createElement(asset.icon, { 
        size: 20,
        color: theme.palette[asset.color]?.main || theme.palette.primary.main 
      });
    }
    return <FiPackage size={20} color={theme.palette.primary.main} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (fetching && requests.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: theme.palette.primary.main,
            animation: `${pulse} 2s infinite`
          }} 
        />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Loading Your Assets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preparing your asset management dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Fade in={!fetching} timeout={800}>
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        minHeight: '100vh'
      }}>
        {/* Enhanced Header Section */}
        <Paper sx={{ 
          p: { xs: 3, sm: 4, md: 5 },
          mb: { xs: 3, md: 4 },
          borderRadius: theme.shape.borderRadius * 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, transparent)`,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          }
        }}>
         <Grid container spacing={1.5} alignItems="center">
  <Grid item xs={10} md={6}>
    <Typography 
      variant="h5" 
      fontWeight={700} 
      gutterBottom
      sx={{ 
        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }, // smaller font
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        lineHeight: 1.1,
        mb: 1.5
      }}
    >
      Asset Management
    </Typography>

    <Typography 
      variant="body1" 
      color="text.secondary"
      sx={{ 
        fontSize: { xs: '0.9rem', md: '1rem' }, // smaller paragraph text
        fontWeight: 400,
        maxWidth: '450px', // smaller width
        lineHeight: 1.4
      }}
    >
      Efficiently manage and request company assets with our comprehensive management system
    </Typography>
  </Grid>

  {/* Optional button section (if you want to bring it back later)
  <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
    <Tooltip title="Refresh dashboard data">
      <IconButton 
        onClick={fetchRequests} 
        disabled={fetching}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          borderRadius: theme.shape.borderRadius * 1.5,
          p: 1.2, // smaller padding
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': { 
            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            transform: 'rotate(90deg) scale(1.05)',
          }
        }}
      >
        {fetching ? <CircularProgress size={20} color="inherit" /> : <FiRefreshCw size={20} />}
      </IconButton>
    </Tooltip>
  </Grid>
  */}
</Grid>

        </Paper>

        {/* Enhanced Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
  {[
    { key: 'total', label: 'Total Requests', color: 'primary', icon: FiPackage, trend: '+12%' },
    { key: 'approved', label: 'Approved', color: 'success', icon: FiCheckCircle, trend: '+8%' },
    { key: 'pending', label: 'Pending', color: 'warning', icon: FiClock, trend: '+5%' },
    { key: 'rejected', label: 'Rejected', color: 'error', icon: FiXCircle, trend: '-3%' }
  ].map((stat, index) => (
    <Grid item xs={12} sm={6} md={3} key={stat.key}>
      <StatCard 
        color={stat.color} 
        sx={{ 
          animationDelay: `${index * 0.1}s`,
          transform: 'scale(0.95)', // slightly smaller overall
        }}
      >
        <CardContent sx={{ p: 2.2, position: 'relative' }}> {/* smaller padding */}
          <Stack 
            direction="row" 
            alignItems="flex-start" 
            justifyContent="space-between" 
            spacing={1.5}
          >
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600} 
                sx={{ mb: 0.6, fontSize: '0.85rem' }}
              >
                {stat.label}
              </Typography>

              <Typography 
                variant="h4" 
                fontWeight={800}
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2rem' }, // smaller number
                  background: `linear-gradient(135deg, ${theme.palette[stat.color].main}, ${theme.palette[stat.color].dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.1
                }}
              >
                {stats[stat.key]}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mt: 0.5 }}>
                <FiTrendingUp size={12} color={theme.palette.success.main} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {stat.trend}
                </Typography>
              </Stack>
            </Box>

            <Avatar 
              className="stat-icon"
              sx={{ 
                bgcolor: `${theme.palette[stat.color].main}15`, 
                color: theme.palette[stat.color].main,
                width: 45, // smaller avatar
                height: 45,
                borderRadius: theme.shape.borderRadius * 1.5,
                transition: 'all 0.3s ease'
              }}
            >
              {React.createElement(stat.icon, { size: 20 })} {/* smaller icon */}
            </Avatar>
          </Stack>
        </CardContent>
      </StatCard>
    </Grid>
  ))}
</Grid>


        {/* Enhanced Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Request Form & Properties */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Enhanced Request Asset Card */}
              <Card sx={{ 
                borderRadius: theme.shape.borderRadius * 3,
                boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                animation: `${fadeIn} 0.6s ease-out`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.primary.main}15`, 
                      color: theme.palette.primary.main,
                      width: 48,
                      height: 48
                    }}>
                      <FiPlus size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        Request New Asset
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submit a request for new equipment
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
                        Select Asset Type
                      </Typography>
                      <Select
                        value={newAsset}
                        onChange={(e) => setNewAsset(e.target.value)}
                        displayEmpty
                        fullWidth
                        sx={{ 
                          borderRadius: theme.shape.borderRadius * 2,
                          '& .MuiSelect-select': {
                            py: 2,
                            px: 2
                          }
                        }}
                        renderValue={(selected) => {
                          if (!selected) {
                            return (
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <FiPackage color={theme.palette.text.secondary} size={20} />
                                <Typography color="text.secondary" fontWeight={500}>
                                  Choose asset type...
                                </Typography>
                              </Stack>
                            );
                          }
                          const asset = allowedAssets.find(a => a.value === selected);
                          return (
                            <Stack direction="row" alignItems="center" spacing={2}>
                              {React.createElement(asset.icon, { 
                                color: theme.palette[asset.color]?.main,
                                size: 20
                              })}
                              <Typography fontWeight={600}>{asset.label}</Typography>
                            </Stack>
                          );
                        }}
                      >
                        {allowedAssets.map((asset) => (
                          <MenuItem key={asset.value} value={asset.value} sx={{ py: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ 
                                bgcolor: `${theme.palette[asset.color]?.main}15`, 
                                color: theme.palette[asset.color]?.main,
                                width: 40,
                                height: 40
                              }}>
                                {React.createElement(asset.icon, { size: 18 })}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600}>{asset.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {asset.value.charAt(0).toUpperCase() + asset.value.slice(1)} Equipment
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>

                    <GradientButton
                      onClick={handleRequest}
                      disabled={loading || !newAsset}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FiPlus />}
                      fullWidth
                      size="large"
                    >
                      {loading ? 'Submitting Request...' : 'Request Asset'}
                    </GradientButton>
                  </Stack>
                </CardContent>
              </Card>

              {/* Enhanced Assigned Properties Card */}
              <Card sx={{ 
                borderRadius: theme.shape.borderRadius * 3,
                boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                border: `1px solid ${theme.palette.divider}`,
                animation: `${fadeIn} 0.7s ease-out`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette.info.main}15`, 
                      color: theme.palette.info.main,
                      width: 48,
                      height: 48
                    }}>
                      <FiSettings size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        Assigned Properties
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {properties.length} items assigned to you
                      </Typography>
                    </Box>
                  </Stack>

                  {properties.length > 0 ? (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      <List dense>
                        {properties.map((item, index) => (
                          <PropertyItem key={index}>
                            <ListItemText 
                              primary={
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    boxShadow: `0 2px 8px ${theme.palette.primary.main}40`
                                  }} />
                                  <Typography variant="body1" fontWeight={600}>
                                    {item}
                                  </Typography>
                                </Stack>
                              } 
                              secondary={
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                  Company assigned property
                                </Typography>
                              }
                            />
                          </PropertyItem>
                        ))}
                      </List>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      color: theme.palette.text.secondary
                    }}>
                      <FiPackage size={64} style={{ opacity: 0.3 }} />
                      <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        No Properties Assigned
                      </Typography>
                      <Typography variant="body2">
                        Your assigned properties will appear here once allocated
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column - Enhanced Requests Table */}
         <Grid item xs={12} lg={8}>
  <Card
    sx={{
      borderRadius: theme.shape.borderRadius * 3,
      boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
      border: `1px solid ${theme.palette.divider}`,
      overflow: 'hidden',
      background: theme.palette.background.paper,
      animation: `${fadeIn} 0.8s ease-out`,
    }}
  >
    <CardContent sx={{ p: 0 }}>
      {/* ==== HEADER SECTION ==== */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  mb: 0.5,
                  fontSize: { xs: '1.15rem', sm: '1.25rem' },
                }}
              >
                Asset Requests
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  {count} total requests
                </Typography>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'text.secondary',
                    opacity: 0.6,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {filteredRequests.length} shown
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="flex-end"
            >
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
                sx={{
                  minWidth: 130,
                  borderRadius: theme.shape.borderRadius * 2,
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-input': {
                    py: 0.8,
                  },
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <FiFilter size={14} />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* ==== TABLE CONTENT ==== */}
      {!isMobile ? (
        <StyledTableContainer>
         <Table
  sx={{
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    backgroundColor: theme.palette.background.paper,
  }}
>
  <TableHead>
    <TableRow>
      {[
        { label: "ASSET TYPE", width: "20%" },
        { label: "STATUS", width: "20%" },
        { label: "APPROVED BY", width: "20%" },
        { label: "REQUESTED DATE", width: "20%" },
        { label: "ACTIONS", width: "20%", align: "center" },
      ].map((header) => (
        <TableCell
          key={header.label}
          sx={{
            width: header.width,
            textAlign: header.align || "left",
            fontWeight: 700,
            fontSize: "0.75rem",
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 1, // smaller header height
          }}
        >
          {header.label}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>

  <TableBody>
    {filteredRequests.length > 0 ? (
      filteredRequests.map((req) => (
        <StyledTableRow
          key={req._id}
          status={req.status}
          sx={{
            "&:hover": {
              backgroundColor: `${theme.palette.action.hover}`,
              transition: "background-color 0.2s ease",
            },
          }}
        >
          {/* ASSET TYPE */}
          <TableCell sx={{ py: 1.2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                sx={{
                  bgcolor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                }}
              >
                {getAssetIcon(req.assetName)}
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: "0.85rem" }}
                >
                  {req.assetName.charAt(0).toUpperCase() +
                    req.assetName.slice(1)}
                </Typography>
                <AssetTypeChip
                  label={req.assetName}
                  type={req.assetName}
                  size="small"
                />
              </Box>
            </Stack>
          </TableCell>

          {/* STATUS */}
          <TableCell sx={{ py: 1 }}>
            <StatusChip
              label={req.status.toUpperCase()}
              status={req.status}
              icon={getStatusIcon(req.status)}
            />
          </TableCell>

          {/* APPROVED BY */}
          <TableCell sx={{ py: 1 }}>
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: "0.8rem" }}
              >
                {req.approvedBy
                  ? req.approvedBy.name
                  : req.status === "pending"
                  ? "Waiting for approval"
                  : "Not assigned"}
              </Typography>
              {req.approvedBy && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {req.approvedBy.role}
                </Typography>
              )}
              {req.adminComment && (
                <Tooltip title={req.adminComment}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontStyle: "italic",
                      mt: 0.3,
                      fontSize: "0.7rem",
                    }}
                  >
                    {req.adminComment.length > 35
                      ? `${req.adminComment.substring(0, 35)}...`
                      : req.adminComment}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </TableCell>

          {/* REQUESTED DATE */}
          <TableCell sx={{ py: 1 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontSize: "0.8rem" }}
            >
              {formatDate(req.createdAt)}
            </Typography>
          </TableCell>

          {/* ACTIONS */}
          <TableCell align="center" sx={{ py: 1 }}>
            <Stack direction="row" spacing={0.6} justifyContent="center">
              <Tooltip title="View Details">
                <ActionButton variant="view" size="small">
                  <FiEye size={13} />
                </ActionButton>
              </Tooltip>
              {req.status === "pending" && (
                <>
                  <Tooltip title="Edit Request">
                    <ActionButton variant="edit" size="small">
                      <FiEdit size={13} />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Cancel Request">
                    <ActionButton variant="delete" size="small">
                      <FiTrash2 size={13} />
                    </ActionButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </TableCell>
        </StyledTableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
          <Box sx={{ textAlign: "center" }}>
            <FiPackage
              size={50}
              color={theme.palette.text.secondary}
              style={{ opacity: 0.3 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mt: 1, fontWeight: 600, fontSize: "0.95rem" }}
            >
              {searchTerm || filterStatus !== "all"
                ? "No Matching Requests"
                : "No Requests Yet"}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>

        </StyledTableContainer>
      ) : (
       <Box sx={{ p: 2 }}>
  {filteredRequests.length > 0 ? (
    <Stack spacing={2}>
      {filteredRequests.map((req) => (
        <Card
          key={req._id}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            p: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack spacing={1.5}>
            {/* Asset Info */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                }}
              >
                {getAssetIcon(req.assetName)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={700}>
                  {req.assetName.charAt(0).toUpperCase() + req.assetName.slice(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Requested on {formatDate(req.createdAt)}
                </Typography>
              </Box>
            </Stack>

            {/* Status */}
            <Box>
              <StatusChip
                label={req.status.toUpperCase()}
                status={req.status}
                icon={getStatusIcon(req.status)}
                size="small"
              />
            </Box>

            {/* Approved By */}
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Approved By:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {req.approvedBy
                  ? `${req.approvedBy.name} (${req.approvedBy.role})`
                  : req.status === "pending"
                  ? "Waiting for approval"
                  : "Not assigned"}
              </Typography>
            </Box>

            {/* Admin Comment */}
            {req.adminComment && (
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ mb: 0.3 }}
                >
                  Admin Comment:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    fontSize: "0.85rem",
                  }}
                >
                  {req.adminComment}
                </Typography>
              </Box>
            )}

            {/* Actions */}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ mt: 1 }}
            >
              <Tooltip title="View Details">
                <ActionButton variant="view" size="small">
                  <FiEye size={14} />
                </ActionButton>
              </Tooltip>
              {req.status === "pending" && (
                <>
                  <Tooltip title="Edit Request">
                    <ActionButton variant="edit" size="small">
                      <FiEdit size={14} />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="Cancel Request">
                    <ActionButton variant="delete" size="small">
                      <FiTrash2 size={14} />
                    </ActionButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  ) : (
    <Box sx={{ textAlign: "center", py: 5 }}>
      <FiPackage
        size={50}
        color={theme.palette.text.secondary}
        style={{ opacity: 0.3 }}
      />
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ mt: 1, fontWeight: 600, fontSize: "0.9rem" }}
      >
        No Requests Yet
      </Typography>
    </Box>
  )}
</Box>

      )}
    </CardContent>
  </Card>
</Grid>

        </Grid>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              borderRadius: theme.shape.borderRadius * 3
            }
          }}
        >
          <Card sx={{ 
            minWidth: 300,
            background: notification?.severity === 'error' 
              ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
              : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            color: 'white',
            borderRadius: theme.shape.borderRadius * 3,
            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
            border: 'none'
          }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {notification?.severity === 'error' ? 
                  <FiXCircle size={24} /> : 
                  <FiCheckCircle size={24} />
                }
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {notification?.severity === 'error' ? 'Error' : 'Success'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {notification?.message}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default MyAssets;