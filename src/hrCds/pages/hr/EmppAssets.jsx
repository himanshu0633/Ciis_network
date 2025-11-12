import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Button, TextField, Tooltip, Snackbar, Dialog,
  DialogTitle, DialogContent, DialogActions, Card, CardContent, Grid,
  Stack, Avatar, Chip, Fade, LinearProgress, useTheme, useMediaQuery,
  Badge
} from '@mui/material';
import {
  FiEdit, FiTrash2, FiPackage, FiCheckCircle,
  FiXCircle, FiClock, FiMessageCircle, FiSearch, FiUsers
} from 'react-icons/fi';
import { styled } from '@mui/material/styles';

/* =========================
   Styled Components
   ========================= */
const StatCard = styled(Card)(({ theme, active, color = 'primary' }) => ({
  background: active
    ? `linear-gradient(135deg, ${theme.palette[color].main}10, ${theme.palette[color].main}05)`
    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  borderLeft: active
    ? `4px solid ${theme.palette[color].main}`
    : `4px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
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

/* =========================
   Main Component
   ========================= */
const EmppAssets = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStat, setSelectedStat] = useState('All');
  const [notification, setNotification] = useState(null);
  const [editingCommentReq, setEditingCommentReq] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/assets/all${statusFilter ? `?status=${statusFilter}` : ''}`);
      setRequests(data.requests);
      calculateStats(data.requests);
    } catch (err) {
      setNotification({ message: 'Failed to fetch requests', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const pending = data.filter(r => r.status === 'pending').length;
    const approved = data.filter(r => r.status === 'approved').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    setStats({ total: data.length, pending, approved, rejected });
  };

  const handleStatFilter = (type) => {
    setSelectedStat(prev => (prev === type ? 'All' : type));
    setStatusFilter(type === 'All' ? '' : type.toLowerCase());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/assets/delete/${id}`);
      setNotification({ message: 'Request deleted successfully', severity: 'success' });
      fetchRequests();
    } catch {
      setNotification({ message: 'Failed to delete request', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`/assets/update/${reqId}`, { status: newStatus });
      setNotification({ message: 'Status updated successfully', severity: 'success' });
      fetchRequests();
    } catch {
      setNotification({ message: 'Failed to update status', severity: 'error' });
    } finally { setActionLoading(false); }
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
    } catch {
      setNotification({ message: 'Failed to update comment', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U';

  const filteredRequests = requests.filter(req =>
    req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.adminComment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !requests.length)
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><LinearProgress sx={{ width: '100px' }} /></Box>;

  return (
    <Fade in={!loading} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h4" fontWeight={800}>Asset Requests Management</Typography>
          <Typography color="text.secondary">Review and manage employee asset requests</Typography>
        </Paper>

        {/* Clickable Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Requests', count: stats.total, color: 'primary', type: 'All', icon: <FiUsers /> },
            { label: 'Pending', count: stats.pending, color: 'warning', type: 'Pending', icon: <FiClock /> },
            { label: 'Approved', count: stats.approved, color: 'success', type: 'Approved', icon: <FiCheckCircle /> },
            { label: 'Rejected', count: stats.rejected, color: 'error', type: 'Rejected', icon: <FiXCircle /> },
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.type}>
              <StatCard
                color={item.color}
                active={selectedStat === item.type}
                onClick={() => handleStatFilter(item.type)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: `${theme.palette[item.color].main}20`, color: theme.palette[item.color].main }}>
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="h4" fontWeight={700}>{item.count}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Search + Filter */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
            }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Stack>

        {/* Table Section */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Asset</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Comment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <StyledTableRow key={req._id} status={req.status}>
                      <TableCell>
                        <Stack direction="row" spacing={2}>
                          <Avatar>{getInitials(req.user?.name)}</Avatar>
                          <Box>
                            <Typography fontWeight={600}>{req.user?.name}</Typography>
                            <Typography color="text.secondary" variant="body2">{req.user?.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <AssetTypeChip label={req.assetName} type={req.assetName} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={req.status} label={req.status.toUpperCase()} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={req.adminComment || "No comment"}>
                          <CommentBadge hasComment={!!req.adminComment}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <FiMessageCircle size={12} />
                              <Typography variant="caption">{req.adminComment || 'Add Comment'}</Typography>
                            </Stack>
                          </CommentBadge>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit Comment">
                            <IconButton color="info" onClick={() => handleCommentEditOpen(req)}>
                              <FiEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Request">
                            <IconButton color="error" onClick={() => handleDelete(req._id)}>
                              <FiTrash2 />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography>No Asset Requests Found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Comment Dialog */}
        <Dialog open={!!editingCommentReq} onClose={() => setEditingCommentReq(null)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Admin Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingCommentReq(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleCommentUpdate}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Card sx={{
            background: notification?.severity === 'error'
              ? theme.palette.error.main
              : theme.palette.success.main,
            color: 'white',
            borderRadius: 2,
          }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                {notification?.severity === 'error' ? <FiXCircle /> : <FiCheckCircle />}
                <Typography>{notification?.message}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default EmppAssets;
