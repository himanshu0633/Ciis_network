import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, Button,
  Snackbar, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Chip, List, ListItem, ListItemText
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from '../../utils/axiosConfig';

const allowedAssets = ['phone', 'sim', 'laptop', 'desktop', 'headphone'];

const MyAssets = () => {
  const [newAsset, setNewAsset] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [count, setCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [properties, setProperties] = useState([]);

  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    setFetching(true);
    try {
      const res = await axios.get('/assets/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
      setCount(res.data.count);
    } catch (err) {
      setNotification({
        message: err.response?.data?.error || 'Failed to fetch requests',
        severity: 'error',
      });
    } finally {
      setFetching(false);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">📦 My Assets</Typography>
        <IconButton onClick={fetchRequests} disabled={fetching}>
          {fetching ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {/* Asset request form */}
      <Box display="flex" gap={2} mb={3}>
        <Select
          value={newAsset}
          onChange={(e) => setNewAsset(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>Select an asset</MenuItem>
          {allowedAssets.map((asset) => (
            <MenuItem key={asset} value={asset}>
              {asset.charAt(0).toUpperCase() + asset.slice(1)}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          onClick={handleRequest}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Requesting...' : 'Request Asset'}
        </Button>
      </Box>

      {/* Asset request table */}
      <Typography variant="h6" mb={1}>Total Requests: {count}</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Requested At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req._id}>
                <TableCell>{req.assetName}</TableCell>
                <TableCell>
                  <Chip
                    label={req.status}
                    color={getStatusColor(req.status)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {req.approvedBy
                    ? `${req.approvedBy.name} (${req.approvedBy.role})`
                    : req.status === 'pending'
                      ? 'Pending'
                      : 'Unknown'}
                </TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar for toast messages */}
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box
          sx={{
            backgroundColor:
              notification?.severity === 'error' ? '#d32f2f' : '#2e7d32',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 500,
          }}
        >
          {notification?.message}
        </Box>
      </Snackbar>

      {/* Assigned properties section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          🧾 Your Assigned Properties
        </Typography>

        {properties.length > 0 ? (
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <List>
              {properties.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography color="text.secondary">No properties assigned.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyAssets;
