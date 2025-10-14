import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, Button,
  Snackbar, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Chip, List, ListItem, ListItemText,
  Card, CardContent, Grid, Stack, Avatar, Fade,
  Tooltip, LinearProgress, useTheme, useMediaQuery,
  Divider, Badge, InputAdornment, TextField
} from '@mui/material';
import {
  FiRefreshCw, FiPackage, FiSmartphone, 
  FiHeadphones, FiCpu, FiCheckCircle, FiClock,
  FiXCircle, FiPlus, FiSearch, FiUser, FiSettings,
  FiChevronRight // Ensure this is imported correctly
} from 'react-icons/fi';
import axios from '../../utils/axiosConfig';
import { styled } from '@mui/material/styles';

// Enhanced Styled Components
const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'approved' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const AssetTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === 'phone' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === 'laptop' && {
    background: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.dark,
  }),
  ...(type === 'desktop' && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
  ...(type === 'headphone' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(type === 'sim' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  ...(status === 'approved' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'pending' && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(status === 'rejected' && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
}));

const MobileRequestCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${
    status === 'approved' ? theme.palette.success.main :
    status === 'pending' ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const PropertyItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const allowedAssets = [
  { value: 'phone', label: 'Phone', icon: FiSmartphone },
  { value: 'sim', label: 'SIM Card', icon: FiCpu },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop', icon: FiSettings },
  { value: 'headphone', label: 'Headphone', icon: FiHeadphones }
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
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    // Load properties from localStorage
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
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'pending':
        return <FiClock color={theme.palette.warning.main} />;
      case 'rejected':
        return <FiXCircle color={theme.palette.error.main} />;
      default:
        return <FiPackage color={theme.palette.text.secondary} />;
    }
  };

  const getAssetIcon = (assetType) => {
    const asset = allowedAssets.find(a => a.value === assetType);
    return asset ? React.createElement(asset.icon, { 
      color: theme.palette.primary.main 
    }) : <FiPackage />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(req =>
    req.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetching && requests.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <Fade in={!fetching} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[4]
        }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Asset Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Request and manage your company assets
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={fetchRequests} 
                  disabled={fetching}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: theme.palette.action.hover }
                  }}
                >
                  {fetching ? <CircularProgress size={20} /> : <FiRefreshCw />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <StatCard color="primary">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.primary.main}20`, 
                    color: theme.palette.primary.main 
                  }}>
                    <FiPackage />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="success">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.success.main}20`, 
                    color: theme.palette.success.main 
                  }}>
                    <FiCheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.approved}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="warning">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.warning.main}20`, 
                    color: theme.palette.warning.main 
                  }}>
                    <FiClock />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.pending}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="error">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.error.main}20`, 
                    color: theme.palette.error.main 
                  }}>
                    <FiXCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Rejected
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.rejected}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Request Form & Properties */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Request Asset Card */}
              <Card sx={{ 
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[2]
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Request New Asset
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select an asset type to submit a request
                  </Typography>

                  <Stack spacing={2}>
                    <Select
                      value={newAsset}
                      onChange={(e) => setNewAsset(e.target.value)}
                      displayEmpty
                      fullWidth
                      sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                    >
                      <MenuItem value="" disabled>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FiPackage color={theme.palette.text.secondary} />
                          <Typography color="text.secondary">
                            Select an asset
                          </Typography>
                        </Stack>
                      </MenuItem>
                      {allowedAssets.map((asset) => (
                        <MenuItem key={asset.value} value={asset.value}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {React.createElement(asset.icon, { 
                              color: theme.palette.primary.main 
                            })}
                            <Typography>{asset.label}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleRequest}
                      disabled={loading || !newAsset}
                      startIcon={loading ? <CircularProgress size={20} /> : <FiPlus />}
                      sx={{
                        borderRadius: theme.shape.borderRadius * 2,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none'
                      }}
                    >
                      {loading ? 'Requesting...' : 'Request Asset'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Assigned Properties Card */}
              <Card sx={{ 
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[2]
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <FiSettings color={theme.palette.primary.main} />
                    <Typography variant="h6" fontWeight={700}>
                      Your Assigned Properties
                    </Typography>
                  </Stack>

                  {properties.length > 0 ? (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: theme.shape.borderRadius,
                        p: 1
                      }}
                    >
                      <List dense>
                        {properties.map((item, index) => (
                          <PropertyItem key={index}>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" fontWeight={500}>
                                  {item}
                                </Typography>
                              } 
                            />
                          </PropertyItem>
                        ))}
                      </List>
                    </Paper>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: theme.palette.text.secondary
                    }}>
                      <FiPackage size={32} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        No properties assigned
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column - Requests Table */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              borderRadius: theme.shape.borderRadius * 2,
              boxShadow: theme.shadows[2]
            }}>
              <CardContent>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Asset Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {count} requests
                    </Typography>
                  </Box>

                  <TextField
                    placeholder="Search requests..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiSearch color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      width: { xs: '100%', sm: 250 },
                      borderRadius: theme.shape.borderRadius * 2
                    }}
                  />
                </Stack>

                {!isMobile ? (
                  // Desktop Table View
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Asset Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Approved By</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Requested At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((req) => (
                            <StyledTableRow key={req._id} status={req.status}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  {getAssetIcon(req.assetName)}
                                  <AssetTypeChip
                                    label={req.assetName.charAt(0).toUpperCase() + req.assetName.slice(1)}
                                    type={req.assetName}
                                    size="small"
                                  />
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <StatusChip
                                  label={req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                  status={req.status}
                                  icon={getStatusIcon(req.status)}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {req.approvedBy
                                    ? `${req.approvedBy.name} (${req.approvedBy.role})`
                                    : req.status === 'pending'
                                      ? 'Pending Approval'
                                      : '--'
                                  }
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(req.createdAt)}
                                </Typography>
                              </TableCell>
                            </StyledTableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <FiPackage size={48} color={theme.palette.text.secondary} />
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                                  No requests found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {searchTerm ? 'Try adjusting your search' : 'Request your first asset to get started'}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  // Mobile Card View
                  <Stack spacing={2}>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((req) => (
                        <MobileRequestCard key={req._id} status={req.status}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    {getAssetIcon(req.assetName)}
                                    <Typography variant="h6" fontWeight={600}>
                                      {req.assetName.charAt(0).toUpperCase() + req.assetName.slice(1)}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDate(req.createdAt)}
                                  </Typography>
                                </Box>
                                <StatusChip
                                  label={req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                  status={req.status}
                                  size="small"
                                />
                              </Stack>
                              
                              <Divider />

                              <Typography variant="body2">
                                <strong>Approved By:</strong>{' '}
                                {req.approvedBy
                                  ? `${req.approvedBy.name} (${req.approvedBy.role})`
                                  : req.status === 'pending'
                                    ? 'Pending Approval'
                                    : '--'
                                }
                              </Typography>
                            </Stack>
                          </CardContent>
                        </MobileRequestCard>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <FiPackage size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                          No requests found
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Card sx={{ 
            minWidth: 300,
            background: notification?.severity === 'error' 
              ? theme.palette.error.main 
              : theme.palette.success.main,
            color: 'white'
          }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {notification?.severity === 'error' ? 
                  <FiXCircle size={20} /> : 
                  <FiCheckCircle size={20} />
                }
                <Typography variant="body2" fontWeight={500}>
                  {notification?.message}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default MyAssets;
