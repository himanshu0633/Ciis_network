import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Button, TextField, Tooltip, Snackbar, Dialog,
  DialogTitle, DialogContent, DialogActions, Card, CardContent, Grid,
  Stack, Avatar, Chip, Fade, LinearProgress, useTheme, useMediaQuery,
  Badge, Divider
} from '@mui/material';
import {
  FiEdit, FiTrash2, FiPackage, FiFilter, FiCheckCircle,
  FiXCircle, FiClock, FiUser, FiRefreshCw, FiMessageCircle,
  FiTrendingUp, FiAlertCircle, FiSearch
} from 'react-icons/fi';
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

const CommentBadge = styled(Box)(({ theme, hasComment }) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: 12,
  fontSize: '0.75rem',
  fontWeight: 500,
  background: hasComment 
    ? `${theme.palette.info.main}20` 
    : `${theme.palette.grey[300]}20`,
  color: hasComment 
    ? theme.palette.info.dark 
    : theme.palette.text.secondary,
  cursor: 'pointer',
  '&:hover': {
    background: hasComment 
      ? `${theme.palette.info.main}30` 
      : `${theme.palette.grey[300]}30`,
  },
}));

const EmppAssets = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState(null);
  const [editingCommentReq, setEditingCommentReq] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/assets/all${statusFilter ? `?status=${statusFilter}` : ''}`);
      setRequests(data.requests);
      calculateStats(data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to fetch requests',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requestsData) => {
    const pending = requestsData.filter(req => req.status === 'pending').length;
    const approved = requestsData.filter(req => req.status === 'approved').length;
    const rejected = requestsData.filter(req => req.status === 'rejected').length;
    
    setStats({
      total: requestsData.length,
      pending,
      approved,
      rejected
    });
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/assets/delete/${id}`);
      setNotification({ message: 'Request deleted successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      console.error('Failed to delete:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to delete request',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${reqId}`, {
        status: newStatus,
        comment: requests.find(req => req._id === reqId)?.adminComment || ''
      });
      setNotification({ message: 'Status updated successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      console.error('Status update failed:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to update status',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentEditOpen = (req) => {
    setEditingCommentReq(req);
    setCommentText(req.adminComment || '');
  };

  const handleCommentUpdate = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${editingCommentReq._id}`, {
        comment: commentText,
        status: editingCommentReq.status
      });
      setNotification({ message: 'Comment updated successfully', severity: 'success' });
      setEditingCommentReq(null);
      fetchRequests();
    } catch (err) {
      console.error('Failed to update comment:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to update comment',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredRequests = requests.filter(req =>
    req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.adminComment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && requests.length === 0) {
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
    <Fade in={!loading} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[4]
        }}>
          <Stack spacing={3}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Asset Requests Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Review and manage employee asset requests
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                {/* <Tooltip title="Refresh">
                  <IconButton 
                    onClick={fetchRequests}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                  >
                    <FiRefreshCw />
                  </IconButton>
                </Tooltip> */}
              </Stack>
            </Stack>

            {/* Filters Section */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <TextField
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius * 2,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                  ),
                }}
              />

              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                >
                  <MenuItem value=''>All Status</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='approved'>Approved</MenuItem>
                  <MenuItem value='rejected'>Rejected</MenuItem>
                </Select>
              </FormControl>
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

        {/* Results Header */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {filteredRequests.length} Request{filteredRequests.length !== 1 ? 's' : ''} Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter && `Filtered by: ${statusFilter}`}
            {searchTerm && ` • Searching: "${searchTerm}"`}
          </Typography>
        </Stack>

        {/* Requests Table */}
        <Paper sx={{ 
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[2],
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main + '10' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Asset Requested</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Admin Comment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Approved By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req, idx) => (
                    <StyledTableRow key={req._id} status={req.status} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            src={req.user?.avatar} 
                            sx={{ width: 40, height: 40 }}
                          >
                            {getInitials(req.user?.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {req.user?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {req.user?.email}
                            </Typography>
                            <Chip
                              label={req.user?.role}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <AssetTypeChip
                          label={req.assetName?.charAt(0).toUpperCase() + req.assetName?.slice(1)}
                          type={req.assetName}
                          size="small"
                          icon={<FiPackage size={14} />}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={req.status}
                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                            disabled={actionLoading}
                            sx={{ borderRadius: theme.shape.borderRadius }}
                          >
                            <MenuItem value="pending">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiClock color={theme.palette.warning.main} />
                                <Typography>Pending</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="approved">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiCheckCircle color={theme.palette.success.main} />
                                <Typography>Approved</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="rejected">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiXCircle color={theme.palette.error.main} />
                                <Typography>Rejected</Typography>
                              </Stack>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={req.adminComment || "No comment added"}>
                          <CommentBadge hasComment={!!req.adminComment}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <FiMessageCircle size={12} />
                              <Typography variant="caption">
                                {req.adminComment 
                                  ? (req.adminComment.length > 30 
                                      ? `${req.adminComment.substring(0, 30)}...` 
                                      : req.adminComment)
                                  : 'Add Comment'
                                }
                              </Typography>
                            </Stack>
                          </CommentBadge>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {req.approvedBy
                            ? `${req.approvedBy.name} (${req.approvedBy.role})`
                            : req.status === 'approved'
                              ? 'Pending Assignment'
                              : '-'
                          }
                        </Typography>
                        {req.updatedAt && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(req.updatedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit Comment">
                            <IconButton 
                              size="small"
                              onClick={() => handleCommentEditOpen(req)}
                              disabled={actionLoading}
                              sx={{
                                color: theme.palette.info.main,
                                '&:hover': { bgcolor: `${theme.palette.info.main}10` }
                              }}
                            >
                              <FiEdit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Request">
                            <IconButton 
                              size="small"
                              onClick={() => handleDelete(req._id)}
                              disabled={actionLoading}
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': { bgcolor: `${theme.palette.error.main}10` }
                              }}
                            >
                              <FiTrash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <FiPackage size={48} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                          No Requests Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm || statusFilter 
                            ? 'Try adjusting your search criteria' 
                            : 'No asset requests found'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Enhanced Comment Edit Dialog */}
        <Dialog 
          open={!!editingCommentReq} 
          onClose={() => setEditingCommentReq(null)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={700}>
              Edit Admin Comment
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Comment for {editingCommentReq?.user?.name}'s {editingCommentReq?.assetName} request
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                label="Admin Comment"
                placeholder="Enter your comments about this asset request..."
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setEditingCommentReq(null)}
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCommentUpdate}
              disabled={actionLoading}
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              Save Comment
            </Button>
          </DialogActions>
        </Dialog>

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

export default EmppAssets;