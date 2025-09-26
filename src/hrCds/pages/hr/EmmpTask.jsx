import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, Paper, TableContainer, Chip, CircularProgress,
  Stack, Divider
} from '@mui/material';
import {
  Assignment,
  HourglassTop,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const EmmpTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      const res = await axios.get('/task/assigned-tasks-status');
      const sortedTasks = (res.data.tasks || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTasks(sortedTasks);
    } catch (err) {
      console.error('❌ Error fetching assigned tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle sx={{ color: 'green' }} fontSize="small" />;
      case 'rejected':
        return <Cancel sx={{ color: 'red' }} fontSize="small" />;
      case 'pending':
        return <HourglassTop sx={{ color: 'orange' }} fontSize="small" />;
      case 'in progress':
        return <HourglassTop sx={{ color: 'blue' }} fontSize="small" />;
      case 'complete':
        return <CheckCircle sx={{ color: 'green' }} fontSize="small" />;
      default:
        return <HourglassTop color="disabled" fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'orange';
      case 'in progress':
        return 'blue';
      case 'complete':
        return 'green';
      default:
        return 'grey';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
        Task Status (Assigned Users)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {tasks.length === 0 ? (
            <Typography align="center" my={3}>No tasks assigned yet.</Typography>
          ) : (
            tasks.map((task, tIndex) => (
              <Paper key={task._id} elevation={3} sx={{ mb: 3, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">{task.title}</Typography>
                  <Chip
                    label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                    color="info"
                    variant="outlined"
                  />
                </Stack>

                <Divider sx={{ mb: 1 }} />

                {task.statusInfo?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No status updates yet.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><b>User</b></TableCell>
                          <TableCell><b>Role</b></TableCell>
                          <TableCell><b>Status</b></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {task.statusInfo.map((status, sIndex) => (
                          <TableRow key={`${task._id}-${sIndex}`}>
                            <TableCell>{status.name}</TableCell>
                            <TableCell>{status.role || 'N/A'}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {getStatusIcon(status.status)}
                                <Chip
                                  label={status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: getStatusColor(status.status),
                                    borderColor: getStatusColor(status.status),
                                  }}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmmpTask;
