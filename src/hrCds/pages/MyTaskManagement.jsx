import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import {
  Box, Typography, Paper, Chip, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Tooltip, Tabs, Tab, Button, Dialog,
  DialogTitle, DialogContent, TextField, DialogActions, InputLabel,
  OutlinedInput, Checkbox, ListItemText, Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const statusColors = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  rejected: 'error'
};

const MyTaskManagement = () => {
  const [tab, setTab] = useState(0);
  const [myTasksGrouped, setMyTasksGrouped] = useState({});
  const [assignedTasksGrouped, setAssignedTasksGrouped] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '', description: '', dueDate: '', assignedUsers: [],
    whatsappNumber: '', priorityDays: '', files: null, voiceNote: null
  });
  const [snackbar, setSnackbar] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  const fetchMyTasks = async () => {
    try {
      const url = statusFilter ? `/task?status=${statusFilter}` : '/task/my';
      const res = await axios.get(url);
      setMyTasksGrouped(res.data.groupedTasks || {});
    } catch (err) {
      setSnackbar('Failed to load tasks');
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const res = await axios.get('/task/assigned');
      setAssignedTasksGrouped(res.data.groupedTasks || {});
    } catch (err) {
      setSnackbar('Failed to load assigned tasks');
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const res = await axios.get('/task/assignable-users');
      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (error) {
      setUsers([]);
    }
  };

  const fetchUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user.role);
    setUserId(user.id);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/task/${taskId}/status`, { status: newStatus });
      fetchMyTasks();
      fetchAssignedTasks();
    } catch (err) {
      console.error("❌ Error in handleStatusChange:", err.response || err);
      setSnackbar(err?.response?.data?.error || 'Unauthorized to update status');
    }
  };

  const handleCreateTask = async () => {
    const formData = new FormData();
    const finalAssignedUsers =
      userRole === 'employee' || userRole === 'staff'
        ? [userId]
        : newTask.assignedUsers;

    formData.append('title', newTask.title);
    formData.append('description', newTask.description);
    formData.append('dueDate', newTask.dueDate);
    formData.append('whatsappNumber', newTask.whatsappNumber);
    formData.append('priorityDays', newTask.priorityDays);
    formData.append('assignedUsers', JSON.stringify(finalAssignedUsers));

    if (newTask.files) {
      for (let i = 0; i < newTask.files.length; i++) {
        formData.append('files', newTask.files[i]);
      }
    }

    if (newTask.voiceNote) {
      formData.append('voiceNote', newTask.voiceNote);
    }

    try {
      await axios.post('/task/create', formData);
      fetchAssignedTasks();
      fetchMyTasks();
      setOpenDialog(false);
      setSnackbar('Task created successfully');
      setNewTask({
        title: '', description: '', dueDate: '', assignedUsers: [],
        whatsappNumber: '', priorityDays: '', files: null, voiceNote: null
      });
    } catch (err) {
      setSnackbar(err?.response?.data?.error || 'Task creation failed');
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    fetchMyTasks();
    fetchAssignedTasks();
    fetchAssignableUsers();
  }, [statusFilter]);

  const renderGroupedTasks = (groupedTasks) => {
    return Object.entries(groupedTasks).map(([dateKey, tasks]) => (
      <Box key={dateKey} mt={3}>
        <Typography variant="h6" gutterBottom>{dateKey}</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Files</TableCell>
                <TableCell>Voice</TableCell>
                <TableCell>Change Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const myStatusObj = task.statusByUser?.find(s => s.user === userId || s.user?._id === userId);
                const myStatus = myStatusObj?.status || 'pending';
                const canChangeStatus = !!myStatusObj;

                return (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.dueDate?.split('T')[0]}</TableCell>
                    <TableCell><Chip label={myStatus} color={statusColors[myStatus]} /></TableCell>
                    <TableCell>
                      {task.files?.length ? task.files.map((file, i) => (
                        <Tooltip title="Download" key={i}>
                          <IconButton href={`http://localhost:5000/${file}`} target="_blank">📌</IconButton>
                        </Tooltip>
                      )) : 'No file'}
                    </TableCell>
                    <TableCell>
                      {task.voiceNote ? <audio controls src={`http://localhost:5000/${task.voiceNote}`} /> : '-'}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" disabled={!canChangeStatus}>
                        <Tooltip title={canChangeStatus ? '' : 'You are not authorized to update status'}>
                          <Select
                            value={myStatus}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </Tooltip>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={2}>📋 My Task Management</Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="My Tasks" />
        <Tab label="Assigned by Me" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <Box display="flex" alignItems="center" gap={2} my={2}>
            <FormControl size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                input={<OutlinedInput label="Status Filter" />}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchMyTasks}><RefreshIcon /></IconButton>
          </Box>
          {renderGroupedTasks(myTasksGrouped)}
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
            <Button startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>Create Task</Button>
            <IconButton onClick={fetchAssignedTasks}><RefreshIcon /></IconButton>
          </Box>
          {renderGroupedTasks(assignedTasksGrouped)}
        </Box>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} sx={{ my: 1 }} />
          <TextField fullWidth label="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} sx={{ my: 1 }} />
          <TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} sx={{ my: 1 }} />
          <TextField fullWidth label="WhatsApp Number" value={newTask.whatsappNumber} onChange={e => setNewTask({ ...newTask, whatsappNumber: e.target.value })} sx={{ my: 1 }} />
          <TextField fullWidth label="Priority Days" value={newTask.priorityDays} onChange={e => setNewTask({ ...newTask, priorityDays: e.target.value })} sx={{ my: 1 }} />
          <TextField fullWidth type="file" inputProps={{ multiple: true }} onChange={(e) => setNewTask({ ...newTask, files: e.target.files })} sx={{ my: 1 }} />
          <TextField fullWidth type="file" onChange={(e) => setNewTask({ ...newTask, voiceNote: e.target.files[0] })} sx={{ my: 1 }} />
          {userRole !== 'employee' && userRole !== 'staff' ? (
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                multiple
                value={newTask.assignedUsers}
                onChange={(e) => setNewTask({ ...newTask, assignedUsers: e.target.value })}
                input={<OutlinedInput label="Assign To" />}
                renderValue={(selected) =>
                  users.filter(u => selected.includes(u._id)).map(u => u.name).join(', ')
                }
              >
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    <Checkbox checked={newTask.assignedUsers.includes(user._id)} />
                    <ListItemText primary={`${user.name} (${user.role})`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box my={1}>
              <Typography variant="body2">Assigned To: <strong>You (Self)</strong></Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
};

export default MyTaskManagement;
