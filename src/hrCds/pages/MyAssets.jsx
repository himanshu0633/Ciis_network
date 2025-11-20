import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Fade,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  alpha,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import {
  FiPackage,
  FiSmartphone,
  FiHeadphones,
  FiCpu,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPlus,
  FiSearch,
  FiSettings,
  FiMonitor,
  FiTrendingUp,
  FiAlertCircle,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import axios from "../../utils/axiosConfig";
import { styled, keyframes } from "@mui/material/styles";

/* --------------------------------
  🔥 ENHANCED ANIMATIONS
---------------------------------*/
const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* --------------------------------
  🎨 ENHANCED STYLED COMPONENTS
---------------------------------*/
const GlassCard = styled(Card)(({ theme, color = "primary" }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
    ${alpha(theme.palette.background.default, 0.7)} 100%)`,
  backdropFilter: 'blur(20px)',
  borderRadius: theme.shape.borderRadius * 4,
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 15px 35px ${alpha(theme.palette.common.black, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, 
      ${theme.palette[color].main} 0%, 
      ${theme.palette[color].light || theme.palette[color].main} 100%)`,
    animation: `${gradientShift} 3s ease infinite`,
    backgroundSize: '200% 200%',
  },
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 25px 50px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const StatCard = styled(GlassCard)(({ theme, color = "primary" }) => ({
  cursor: 'pointer',
  minHeight: 140,
  '&:hover::before': {
    height: '6px',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 800,
  fontSize: '0.75rem',
  height: 32,
  borderRadius: 16,
  padding: '0 12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  ...(status === "approved" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.3)} 100%)`,
    color: theme.palette.success.dark,
    border: `2px solid ${alpha(theme.palette.success.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.2)}`,
  }),
  ...(status === "pending" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.main, 0.3)} 100%)`,
    color: theme.palette.warning.dark,
    border: `2px solid ${alpha(theme.palette.warning.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.warning.main, 0.2)}`,
  }),
  ...(status === "rejected" && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, ${alpha(theme.palette.error.main, 0.3)} 100%)`,
    color: theme.palette.error.dark,
    border: `2px solid ${alpha(theme.palette.error.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.2)}`,
  }),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  fontWeight: 800,
  borderRadius: theme.shape.borderRadius * 3,
  padding: '12px 32px',
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
    transition: 'left 0.5s',
  },
  
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.6)}`,
    '&::before': {
      left: '100%',
    },
  },
  
  '&:disabled': {
    background: theme.palette.grey[400],
    transform: 'none',
    boxShadow: 'none',
  },
}));

const PropertyItem = styled(ListItem)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.8)} 0%, 
    ${alpha(theme.palette.background.default, 0.6)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2.5),
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateX(8px) translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.05)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 3,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.common.white, 0.9)} 0%, 
      ${alpha(theme.palette.common.white, 0.8)} 100%)`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderWidth: 2,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.9)} 0%, 
    ${alpha(theme.palette.common.white, 0.8)} 100%)`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '70%',
    borderRadius: '0 8px 8px 0',
    background: 
      status === 'approved' ? `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)` :
      status === 'pending' ? `linear-gradient(180deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)` :
      `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
  },
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(8px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

/* --------------------------------
  🔥 ENHANCED COMPONENT
---------------------------------*/
const MyAssets = () => {
  const [newAsset, setNewAsset] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const token = localStorage.getItem("token");

  const allowedAssets = [
    { value: "phone", label: "Smartphone", icon: FiSmartphone, color: "primary" },
    { value: "sim", label: "SIM Card", icon: FiCpu, color: "secondary" },
    { value: "laptop", label: "Laptop", icon: FiMonitor, color: "info" },
    { value: "desktop", label: "Desktop", icon: FiSettings, color: "warning" },
    { value: "headphone", label: "Headphones", icon: FiHeadphones, color: "success" },
  ];

  const fetchRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const res = await axios.get("/assets/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.requests || [];
      setRequests(data);
      calculateStats(data);
      if (showRefresh) {
        setNotification({
          message: "Asset data refreshed!",
          severity: "success",
        });
      }
    } catch (err) {
      setNotification({
        message: "Failed to fetch requests",
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    const approved = data.filter((r) => r.status === "approved").length;
    const pending = data.filter((r) => r.status === "pending").length;
    const rejected = data.filter((r) => r.status === "rejected").length;
    
    setStats({
      total: data.length,
      approved,
      pending,
      rejected,
      approvalRate: data.length > 0 ? Math.round((approved / data.length) * 100) : 0,
    });
  };

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    approvalRate: 0,
  });

  useEffect(() => {
    fetchRequests();
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setProperties(JSON.parse(userData).properties || []);
      } catch {}
    }
  }, []);

  const handleRequest = async () => {
    if (!newAsset) {
      setNotification({ message: "Please select an asset.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "/assets/request",
        { assetName: newAsset },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification({ 
        message: "🎉 Request submitted successfully!", 
        severity: "success" 
      });
      setNewAsset("");
      fetchRequests();
    } catch {
      setNotification({ 
        message: "❌ Request failed. Please try again.", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getAssetIcon = (assetType) => {
    const asset = allowedAssets.find(a => a.value === assetType);
    return asset ? asset.icon : FiPackage;
  };

  const getAssetColor = (assetType) => {
    const asset = allowedAssets.find(a => a.value === assetType);
    return asset ? asset.color : 'primary';
  };

  /* --------------------------------
    🎨 ENHANCED RENDER UI
  ---------------------------------*/
  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          minHeight: "100vh",
        }}
      >
        {/* Enhanced Header */}
        <GlassCard 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            mb: { xs: 3, sm: 4 },
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, 0.95)} 0%, 
              ${alpha(theme.palette.common.white, 0.85)} 100%)`,
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography
                variant={isSmallMobile ? "h3" : isMobile ? "h2" : "h1"}
                fontWeight={900}
                sx={{
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 1,
                  lineHeight: 1.1,
                }}
              >
                Asset Management
              </Typography>
              <Typography 
                variant={isSmallMobile ? "body1" : "h6"}
                color="text.secondary" 
                sx={{ opacity: 0.8, fontWeight: 500 }}
              >
                Manage and request assets with real-time status tracking
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={() => fetchRequests(true)}
                  disabled={refreshing}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    borderRadius: '14px',
                    p: 1.5,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                    }
                  }}
                >
                  <FiRefreshCw 
                    className={refreshing ? 'spin' : ''} 
                    size={20}
                    color={theme.palette.primary.main}
                  />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </GlassCard>

        {/* Enhanced Stat Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
          {[
            { 
              key: "total", 
              label: "Total Requests", 
              color: "primary", 
              icon: FiPackage,
              value: stats.total,
            },
            { 
              key: "approved", 
              label: "Approved", 
              color: "success", 
              icon: FiCheckCircle,
              value: stats.approved,
              extra: `${stats.approvalRate}%`
            },
            { 
              key: "pending", 
              label: "Pending", 
              color: "warning", 
              icon: FiClock,
              value: stats.pending,
            },
            { 
              key: "rejected", 
              label: "Rejected", 
              color: "error", 
              icon: FiXCircle,
              value: stats.rejected,
            },
          ].map((stat) => (
            <Grid item xs={6} sm={6} md={3} key={stat.key}>
              <StatCard 
                color={stat.color}
                onClick={() => setFilterStatus(stat.key === "total" ? "all" : stat.key)}
                sx={{
                  border: filterStatus === (stat.key === "total" ? "all" : stat.key) 
                    ? `2px solid ${theme.palette[stat.color].main}`
                    : `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 2.5 }}>
                    <Avatar sx={{ 
                      bgcolor: `${theme.palette[stat.color].main}15`, 
                      color: theme.palette[stat.color].main,
                      borderRadius: '16px',
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      boxShadow: `0 8px 25px ${alpha(theme.palette[stat.color].main, 0.3)}`
                    }}>
                      <stat.icon size={isSmallMobile ? 22 : 26} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant={isSmallMobile ? "body2" : "body1"}
                        color="text.secondary" 
                        sx={{ 
                          opacity: 0.8,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography 
                          variant={isSmallMobile ? "h4" : "h3"}
                          fontWeight={900}
                          sx={{ lineHeight: 1 }}
                        >
                          {stat.value}
                        </Typography>
                        {stat.extra && (
                          <Typography 
                            variant="h6" 
                            color={`${stat.color}.main`}
                            fontWeight={800}
                            sx={{ ml: 1 }}
                          >
                            {stat.extra}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Action Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Request New Asset Card */}
          <Grid item xs={12} lg={6}>
            <GlassCard sx={{ p: { xs: 3, sm: 4 }, height: '100%' }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="primary.main" gutterBottom>
                    🚀 Request New Asset
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select from available assets to make a request
                  </Typography>
                </Box>

                <Select
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  fullWidth
                  displayEmpty
                  sx={{ 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.common.white, 0.9)} 0%, 
                      ${alpha(theme.palette.common.white, 0.8)} 100%)`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return "Select asset type...";
                    }
                    const asset = allowedAssets.find(a => a.value === selected);
                    return asset ? asset.label : selected;
                  }}
                >
                  <MenuItem disabled value="">
                    <Typography color="text.secondary">Select asset type...</Typography>
                  </MenuItem>
                  {allowedAssets.map((asset) => (
                    <MenuItem key={asset.value} value={asset.value}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: `${theme.palette[asset.color].main}15`, 
                            color: theme.palette[asset.color].main,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <asset.icon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{asset.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Available for request
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>

                <GradientButton
                  onClick={handleRequest}
                  disabled={!newAsset || loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <FiPlus />
                    )
                  }
                  fullWidth
                  size="large"
                >
                  {loading ? "Submitting Request..." : "Request Asset"}
                </GradientButton>
              </Stack>
            </GlassCard>
          </Grid>

          {/* Assigned Properties Card */}
          <Grid item xs={12} lg={6}>
            <GlassCard sx={{ p: { xs: 3, sm: 4 }, height: '100%' }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="primary.main" gutterBottom>
                    💼 My Assigned Assets
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Assets currently assigned to you
                  </Typography>
                </Box>

                {properties.length > 0 ? (
                  <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {properties.map((item, idx) => (
                      <PropertyItem key={idx}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${theme.palette.primary.main}15`, 
                              color: theme.palette.primary.main,
                            }}
                          >
                            <FiPackage />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={700} variant="body1">
                              {item}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Company-assigned asset • Active
                            </Typography>
                          </Box>
                          <StatusChip label="Active" status="approved" size="small" />
                        </Stack>
                      </PropertyItem>
                    ))}
                  </List>
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      borderRadius: 3,
                    }}
                  >
                    <FiPackage size={48} color={theme.palette.primary.main} style={{ opacity: 0.5, marginBottom: 16 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Assets Assigned
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                      Your assigned assets will appear here
                    </Typography>
                  </Box>
                )}
              </Stack>
            </GlassCard>
          </Grid>
        </Grid>

        {/* Enhanced Requests Table */}
        <GlassCard sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={3}
            sx={{ mb: 4 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={900} color="primary.main" gutterBottom>
                📋 Asset Requests
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your asset request history and status
              </Typography>
            </Box>

            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              spacing={2} 
              alignItems="center"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <SearchField
                size="small"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiSearch color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  width: { xs: '100%', sm: 250 },
                }}
              />
            </Stack>
          </Stack>

          {/* Status Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={filterStatus} 
              onChange={(e, newValue) => setFilterStatus(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={`All Requests (${stats.total})`} 
                value="all" 
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
              <Tab 
                label={`Approved (${stats.approved})`} 
                value="approved" 
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
              <Tab 
                label={`Pending (${stats.pending})`} 
                value="pending" 
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
              <Tab 
                label={`Rejected (${stats.rejected})`} 
                value="rejected" 
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
            </Tabs>
          </Box>

          {!isMobile ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow> 
                    <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}></TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>Asset Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>Approved By</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>Requested At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                      const AssetIcon = getAssetIcon(req.assetName);
                      return (
                        <StyledTableRow key={req._id} status={req.status}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: `${theme.palette[getAssetColor(req.assetName)].main}15`, 
                                  color: theme.palette[getAssetColor(req.assetName)].main,
                                }}
                              >
                                <AssetIcon />
                              </Avatar>
                              <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                {req.assetName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <StatusChip label={req.status} status={req.status} />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {req.approvedBy
                                ? `${req.approvedBy.name} (${req.approvedBy.role})`
                                : req.status === "pending"
                                ? "Pending Approval"
                                : "Not Approved"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600} color="text.primary">
                              {formatDate(req.createdAt)}
                            </Typography>
                          </TableCell>
                        </StyledTableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <FiPackage size={60} color={theme.palette.primary.main} style={{ opacity: 0.5 }} />
                        <Typography variant="h5" color="primary.main" fontWeight={800} sx={{ mt: 3, opacity: 0.7 }}>
                          No requests found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, opacity: 0.5 }}>
                          {searchTerm ? 'Try adjusting your search terms' : 'Start by requesting a new asset'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Stack spacing={2}>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const AssetIcon = getAssetIcon(req.assetName);
                  return (
                    <GlassCard key={req._id} sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: `${theme.palette[getAssetColor(req.assetName)].main}15`, 
                                color: theme.palette[getAssetColor(req.assetName)].main,
                              }}
                            >
                              <AssetIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                                {req.assetName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Requested on {formatDate(req.createdAt)}
                              </Typography>
                            </Box>
                          </Stack>
                          <StatusChip label={req.status} status={req.status} />
                        </Stack>
                        
                        <Divider />
                        
                        <Typography variant="body2">
                          <strong>Approved By:</strong>{' '}
                          {req.approvedBy
                            ? `${req.approvedBy.name} (${req.approvedBy.role})`
                            : req.status === "pending"
                            ? "Pending Approval"
                            : "Not Approved"}
                        </Typography>
                      </Stack>
                    </GlassCard>
                  );
                })
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <FiPackage size={60} color={theme.palette.primary.main} style={{ opacity: 0.5 }} />
                  <Typography variant="h5" color="primary.main" fontWeight={800} sx={{ mt: 3, opacity: 0.7 }}>
                    No requests found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, opacity: 0.5 }}>
                    {searchTerm ? 'Try adjusting your search terms' : 'Start by requesting a new asset'}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </GlassCard>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <GlassCard 
            sx={{ 
              background: notification?.severity === "error" 
                ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: "white",
              minWidth: 300,
            }}
          >
            <CardContent sx={{ py: 2, px: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {notification?.severity === "error" ? (
                  <FiXCircle size={24} />
                ) : (
                  <FiCheckCircle size={24} />
                )}
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    {notification?.severity === "error" ? "Error" : "Success"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {notification?.message}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </GlassCard>
        </Snackbar>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default MyAssets;