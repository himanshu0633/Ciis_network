import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem,
  FormControl, InputLabel, Button, TextField, Tooltip, Snackbar, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const EmppAssets = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState(null);
  const [editingCommentReq, setEditingCommentReq] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`/assets/all${statusFilter ? `?status=${statusFilter}` : ''}`);
      setRequests(data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to fetch requests',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await axios.delete(`/assets/delete/${id}`);
      setNotification({ message: '🗑️ Request deleted successfully', severity: 'success' });
      fetchRequests();
    } catch (err) {
      console.error('Failed to delete:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to delete request',
        severity: 'error',
      });
    }
  };

  const handleCommentEditOpen = (req) => {
    setEditingCommentReq(req);
    setCommentText(req.adminComment || '');
  };

  const handleCommentUpdate = async () => {
    try {
      await axios.patch(`/assets/update/${editingCommentReq._id}`, {
        comment: commentText,
        status: editingCommentReq.status
      });
      setNotification({ message: '✏️ Comment updated successfully', severity: 'success' });
      setEditingCommentReq(null);
      fetchRequests();
    } catch (err) {
      console.error('Failed to update comment:', err);
      setNotification({
        message: err.response?.data?.error || 'Failed to update comment',
        severity: 'error',
      });
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>🛠️ Admin Asset Requests</Typography>

      <FormControl sx={{ mb: 2, minWidth: 200 }} size="small">
        <InputLabel>Status Filter</InputLabel>
        <Select
          value={statusFilter}
          label="Status Filter"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value=''>All</MenuItem>
          <MenuItem value='pending'>Pending</MenuItem>
          <MenuItem value='approved'>Approved</MenuItem>
          <MenuItem value='rejected'>Rejected</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req, idx) => (
              <TableRow key={req._id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{req.user?.name} ({req.user?.role})</TableCell>
                <TableCell>{req.assetName}</TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={req.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await axios.patch(`/assets/update/${req._id}`, {
                            status: newStatus,
                            comment: req.adminComment || ''
                          });
                          setNotification({ message: '✅ Status updated successfully', severity: 'success' });
                          fetchRequests();
                        } catch (err) {
                          console.error('Status update failed:', err);
                          setNotification({
                            message: err.response?.data?.error || 'Failed to update status',
                            severity: 'error',
                          });
                        }
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{req.adminComment || '-'}</TableCell>
                <TableCell>
                  {req.approvedBy
                    ? `${req.approvedBy.name} (${req.approvedBy.role})`
                    : req.status === 'approved'
                      ? 'Approved (no name)'
                      : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Comment">
                    <IconButton size="small" onClick={() => handleCommentEditOpen(req)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(req._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editingCommentReq} onClose={() => setEditingCommentReq(null)}>
        <DialogTitle>Edit Admin Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            label="Admin Comment"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCommentReq(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleCommentUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default EmppAssets;
