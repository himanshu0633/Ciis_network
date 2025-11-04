import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import {
  Box, Typography, Paper, Chip, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Tooltip, Tabs, Tab, Button, Dialog,
  DialogTitle, DialogContent, TextField, DialogActions, InputLabel,
  OutlinedInput, Checkbox, ListItemText, Snackbar, Card, CardContent,
  Grid, Stack, Avatar, LinearProgress, Fade, Badge, Divider,
  useTheme, useMediaQuery, InputAdornment, List, ListItem,
  ListItemIcon, ListItemSecondaryAction, ListItemButton
} from '@mui/material';
import {
  FiRefreshCw, FiPlus, FiCalendar, FiUser, FiInfo ,FiPaperclip ,FiFolder ,FiCheck ,FiFileText,
  FiMic, FiMessageCircle, FiAlertCircle, FiCheckCircle,
  FiClock, FiXCircle, FiDownload, FiFilter, FiSearch,
  FiChevronRight, FiUsers, FiFlag, FiEdit2, FiTrash2,
  FiSave, FiX, FiUserPlus, FiUserMinus, FiLogOut
} from 'react-icons/fi';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(status === 'in-progress' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(status === 'completed' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => ({
  fontWeight: 500,
  ...(priority === 'high' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
  ...(priority === 'medium' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(priority === 'low' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
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
  ...(status === 'completed' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'in-progress' && {
    borderLeft: `4px solid ${theme.palette.info.main}`,
  }),
  ...(status === 'pending' && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(status === 'rejected' && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
}));

const MobileTaskCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${status === 'completed' ? theme.palette.success.main :
    status === 'in-progress' ? theme.palette.info.main :
      status === 'pending' ? theme.palette.warning.main :
        theme.palette.error.main
    }`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const GroupChip = styled(Chip)(({ theme }) => ({
  background: `${theme.palette.secondary.main}20`,
  color: theme.palette.secondary.dark,
  border: `1px solid ${theme.palette.secondary.main}40`,
  fontWeight: 500,
}));

const statusColors = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  rejected: 'error'
};

const statusIcons = {
  pending: FiClock,
  'in-progress': FiAlertCircle,
  completed: FiCheckCircle,
  rejected: FiXCircle
};

const MyTaskManagement = () => {
  const [tab, setTab] = useState(0);
  const [myTasksGrouped, setMyTasksGrouped] = useState({});
  const [assignedTasksGrouped, setAssignedTasksGrouped] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '', description: '', dueDateTime: null, assignedUsers: [],
    assignedGroups: [], whatsappNumber: '', priorityDays: '', priority: 'medium', files: null, voiceNote: null
  });
  const [newGroup, setNewGroup] = useState({
    name: '', description: '', members: []
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Fixed: Proper user data fetching with error handling
  const fetchUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found in localStorage');
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Please log in to access task management',
          severity: 'error'
        });
        return;
      }

      const user = JSON.parse(userStr);
      if (!user || !user.role || !user.id) {
        console.error('Invalid user data structure:', user);
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Invalid user data. Please log in again.',
          severity: 'error'
        });
        return;
      }

      setUserRole(user.role);
      setUserId(user.id);
      setAuthError(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setAuthError(true);
      setSnackbar({
        open: true,
        message: 'Error loading user data. Please log in again.',
        severity: 'error'
      });
    }
  };

  const calculateStats = (tasks) => {
    let total = 0;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let rejected = 0;

    Object.values(tasks).forEach(dateTasks => {
      dateTasks.forEach(task => {
        total++;
        const myStatusObj = task.statusByUser?.find(s => s.user === userId || s.user?._id === userId);
        const status = myStatusObj?.status || 'pending';

        switch (status) {
          case 'pending':
            pending++;
            break;
          case 'in-progress':
            inProgress++;
            break;
          case 'completed':
            completed++;
            break;
          case 'rejected':
            rejected++;
            break;
        }
      });
    });

    setStats({ total, pending, inProgress, completed, rejected });
  };

  // Fixed: Combined data fetching with proper authentication check
  const fetchAssignableData = async () => {
    if (authError || !userId) {
      console.log('Skipping data fetch due to authentication issues');
      return;
    }

    try {
      const [usersRes, groupsRes] = await Promise.all([
        axios.get('/task/assignable-users'),
        axios.get('/groups')
      ]);

      setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);
      setGroups(Array.isArray(groupsRes.data.groups) ? groupsRes.data.groups : []);
    } catch (error) {
      console.error('Error fetching assignable data:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      }
      setUsers([]);
      setGroups([]);
    }
  };

  const fetchMyTasks = async () => {
    if (authError || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = statusFilter ? `/task?status=${statusFilter}` : '/task/my';
      const res = await axios.get(url);
      setMyTasksGrouped(res.data.groupedTasks || {});
      if (tab === 0) calculateStats(res.data.groupedTasks || {});
    } catch (err) {
      console.error('Error fetching my tasks:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    if (authError || !userId) return;

    try {
      const res = await axios.get('/task/assigned');
      setAssignedTasksGrouped(res.data.groupedTasks || {});
      if (tab === 1) calculateStats(res.data.groupedTasks || {});
    } catch (err) {
      console.error('Error fetching assigned tasks:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: 'Failed to load assigned tasks', severity: 'error' });
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to update task status',
        severity: 'error'
      });
      return;
    }

    try {
      await axios.patch(`/task/${taskId}/status`, { status: newStatus });
      fetchMyTasks();
      fetchAssignedTasks();
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
    } catch (err) {
      console.error("❌ Error in handleStatusChange:", err.response || err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.error || 'Unauthorized to update status', severity: 'error' });
      }
    }
  };

  const handleCreateTask = async () => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to create tasks',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    const finalAssignedUsers =
      userRole === 'employee' || userRole === 'staff'
        ? [userId]
        : newTask.assignedUsers;

    formData.append('title', newTask.title);
    formData.append('description', newTask.description);
    formData.append('dueDateTime', newTask.dueDateTime.toISOString().split('T')[0]);
    formData.append('whatsappNumber', newTask.whatsappNumber);
    formData.append('priorityDays', newTask.priorityDays);
    formData.append('priority', newTask.priority);
    formData.append('assignedUsers', JSON.stringify(finalAssignedUsers));
    formData.append('assignedGroups', JSON.stringify(newTask.assignedGroups));

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
      setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      setNewTask({
        title: '', description: '', dueDateTime: null, assignedUsers: [],
        assignedGroups: [], whatsappNumber: '', priorityDays: '', priority: 'medium', files: null, voiceNote: null
      });
    } catch (err) {
      console.error('Error creating task:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.error || 'Task creation failed', severity: 'error' });
      }
    }
  };

  const handleCreateGroup = async () => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to manage groups',
        severity: 'error'
      });
      return;
    }

    try {
      if (editingGroup) {
        await axios.put(`/groups/${editingGroup._id}`, newGroup);
        setSnackbar({ open: true, message: 'Group updated successfully', severity: 'success' });
      } else {
        await axios.post('/groups', newGroup);
        setSnackbar({ open: true, message: 'Group created successfully', severity: 'success' });
      }
      fetchAssignableData();
      setOpenGroupDialog(false);
      setNewGroup({ name: '', description: '', members: [] });
      setEditingGroup(null);
    } catch (err) {
      console.error('Error in group operation:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.error || 'Group operation failed', severity: 'error' });
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (authError || !userId) {
      setSnackbar({
        open: true,
        message: 'Please log in to manage groups',
        severity: 'error'
      });
      return;
    }

    try {
      await axios.delete(`/groups/${groupId}`);
      fetchAssignableData();
      setSnackbar({ open: true, message: 'Group deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting group:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setSnackbar({
          open: true,
          message: 'Session expired. Please log in again.',
          severity: 'error'
        });
      } else {
        setSnackbar({ open: true, message: err?.response?.data?.error || 'Group deletion failed', severity: 'error' });
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description,
      members: group.members.map(m => m._id || m)
    });
    setOpenGroupDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    const IconComponent = statusIcons[status] || FiClock;
    return <IconComponent color={theme.palette[statusColors[status]]?.main} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDateTime) => {
    if (!dueDateTime) return false;
    return new Date(dueDateTime) < new Date();
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g._id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!authError && userId) {
      fetchMyTasks();
      fetchAssignedTasks();
      fetchAssignableData();
    }
  }, [statusFilter, tab, authError, userId]);

  // Show authentication error message
  if (authError) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CardContent>
            <FiAlertCircle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please log in to access the Task Management system.
            </Typography>
            <Button
              variant="contained"
              onClick={handleLogout}
              startIcon={<FiLogOut />}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const renderDesktopTable = (groupedTasks) => {
    return Object.entries(groupedTasks).map(([dateKey, tasks]) => (
      <Box key={dateKey} sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{
          color: 'text.primary',
          borderBottom: `2px solid ${theme.palette.primary.main}20`,
          pb: 1
        }}>
          {dateKey}
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: theme.shape.borderRadius * 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                {/* <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell> */}
                <TableCell sx={{ fontWeight: 700 }}>Files</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Voice</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Change Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const myStatusObj = task.statusByUser?.find(s => s.user === userId || s.user?._id === userId);
                const myStatus = myStatusObj?.status || 'pending';
                const canChangeStatus = !!myStatusObj;

                return (
                  <StyledTableRow key={task._id} status={myStatus}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={task.description}>
                        <Typography variant="body2" sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {task.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                   <TableCell>
  <Stack direction="row" alignItems="center" spacing={1}>
    <FiCalendar size={14} color={theme.palette.text.secondary} />
    <Typography
      variant="body2"
      color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'}
    >
      {task.dueDateTime
        ? new Date(task.dueDateTime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : '—'}
    </Typography>
    {isOverdue(task.dueDateTime) && (
      <FiAlertCircle size={14} color={theme.palette.error.main} />
    )}
  </Stack>
</TableCell>

                    <TableCell>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        priority={task.priority || 'medium'}
                        size="small"
                        icon={<FiFlag size={14} />}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={myStatus.charAt(0).toUpperCase() + myStatus.slice(1)}
                        status={myStatus}
                        icon={getStatusIcon(myStatus)}
                      />
                    </TableCell>
                    {/* <TableCell>
                      <Stack spacing={0.5}>
                        {task.assignedUsers?.map(userId => (
                          <Chip
                            key={userId}
                            label={getUserName(userId)}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                        {task.assignedGroups?.map(groupId => (
                          <GroupChip
                            key={groupId}
                            label={getGroupName(groupId)}
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </TableCell> */}
                    <TableCell>
                      {task.files?.length ? task.files.map((file, i) => (
                        <Tooltip title="Download" key={i}>
                          <IconButton
                            size="small"
                            href={`http://localhost:5000/${file}`}
                            target="_blank"
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': { bgcolor: `${theme.palette.primary.main}10` }
                            }}
                          >
                            <FiDownload size={16} />
                          </IconButton>
                        </Tooltip>
                      )) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.voiceNote ? (
                        <audio controls style={{ width: 120, height: 32 }}>
                          <source src={`http://localhost:5000/${task.voiceNote}`} />
                        </audio>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" disabled={!canChangeStatus}>
                        <Tooltip title={canChangeStatus ? '' : 'You are not authorized to update status'}>
                          <Select
                            value={myStatus}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            sx={{
                              borderRadius: theme.shape.borderRadius,
                              minWidth: 120
                            }}
                          >
                            <MenuItem value="pending">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiClock color={theme.palette.warning.main} />
                                <Typography>Pending</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="in-progress">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiAlertCircle color={theme.palette.info.main} />
                                <Typography>In Progress</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="completed">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiCheckCircle color={theme.palette.success.main} />
                                <Typography>Completed</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="rejected">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FiXCircle color={theme.palette.error.main} />
                                <Typography>Rejected</Typography>
                              </Stack>
                            </MenuItem>
                          </Select>
                        </Tooltip>
                      </FormControl>
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  const renderMobileCards = (groupedTasks) => {
    return Object.entries(groupedTasks).map(([dateKey, tasks]) => (
      <Box key={dateKey} sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{
          color: 'text.primary',
          borderBottom: `2px solid ${theme.palette.primary.main}20`,
          pb: 1
        }}>
          {dateKey}
        </Typography>
        <Stack spacing={2}>
          {tasks.map((task) => {
            const myStatusObj = task.statusByUser?.find(s => s.user === userId || s.user?._id === userId);
            const myStatus = myStatusObj?.status || 'pending';
            const canChangeStatus = !!myStatusObj;

            return (
              <MobileTaskCard key={task._id} status={myStatus}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.description}
                        </Typography>
                      </Box>
                      <StatusChip
                        label={myStatus.charAt(0).toUpperCase() + myStatus.slice(1)}
                        status={myStatus}
                        size="small"
                      />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiCalendar size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color={isOverdue(task.dueDateTime) ? 'error' : 'text.primary'}>
                          {task.dueDateTime?.split('T')[0]}
                        </Typography>
                      </Stack>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        priority={task.priority || 'medium'}
                        size="small"
                      />
                    </Stack>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Assigned To:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {task.assignedUsers?.map(userId => (
                          <Chip
                            key={userId}
                            label={getUserName(userId)}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                        {task.assignedGroups?.map(groupId => (
                          <GroupChip
                            key={groupId}
                            label={getGroupName(groupId)}
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {task.files?.length > 0 && (
                        <Tooltip title={`${task.files.length} files`}>
                          <IconButton size="small">
                            <FiFileText size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {task.voiceNote && (
                        <Tooltip title="Voice note available">
                          <IconButton size="small">
                            <FiMic size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {task.whatsappNumber && (
                        <Tooltip title="WhatsApp connected">
                          <IconButton size="small">
                            <FiMessageCircle size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>

                    <FormControl fullWidth size="small" disabled={!canChangeStatus}>
                      <Tooltip title={canChangeStatus ? '' : 'You are not authorized to update status'}>
                        <Select
                          value={myStatus}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          sx={{ borderRadius: theme.shape.borderRadius }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </Tooltip>
                    </FormControl>
                  </Stack>
                </CardContent>
              </MobileTaskCard>
            );
          })}
        </Stack>
      </Box>
    ));
  };

  const renderGroupedTasks = (groupedTasks) => {
    if (Object.keys(groupedTasks).length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FiCalendar size={48} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === 0 ? 'You have no tasks assigned' : 'You have not assigned any tasks'}
          </Typography>
        </Box>
      );
    }

    return isMobile ? renderMobileCards(groupedTasks) : renderDesktopTable(groupedTasks);
  };

  const renderGroupsManagement = () => (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {/* Group Management */}
        </Typography>
        <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => {
            setEditingGroup(null);
            setNewGroup({ name: '', description: '', members: [] });
            setOpenGroupDialog(true);
          }}
          sx={{
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Create Group
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} md={6} lg={4} key={group._id}>
            <Card sx={{ borderRadius: theme.shape.borderRadius * 2 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Group">
                        <IconButton
                          size="small"
                          onClick={() => handleEditGroup(group)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <FiEdit2 size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Group">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteGroup(group._id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <FiTrash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Divider />
 
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Members ({group.members.length})
                    </Typography>
                    <Stack spacing={1}>
                      {group.members.map(memberId => {
                        const member = users.find(u => u._id === memberId);
                        return member ? (
                          <Stack key={memberId} direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {member.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.role}
                              </Typography>
                            </Box>
                          </Stack>
                        ) : null;
                      })}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {groups.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FiUsers size={48} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            No groups created yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first group to assign tasks to multiple users at once
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (loading) {
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header Section */}
        <Paper
  sx={{
    p: 3,
    mb: 3,
    borderRadius: theme.shape.borderRadius * 2,
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
    boxShadow: theme.shadows[4],
    position: "sticky",
    top: 0,
    zIndex: 20,
  }}
>
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={3}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
  >
    {/* ---------- Left Section: Title & Info ---------- */}
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        {tab === 2 ? "Group Management" : "Task Management"}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {tab === 2
          ? "Create and manage user groups easily"
          : "Manage and track your tasks efficiently"}
      </Typography>
    </Box>

    {/* ---------- Right Section: Buttons ---------- */}
    <Stack direction="row" spacing={2}>
      {/* Show Manage Groups only when NOT already on tab 2 */}
      {tab !== 2 &&
        (userRole === "hr" ||
          userRole === "manager" ||
          userRole === "admin") && (
          <Button
            variant="outlined"
            startIcon={<FiUsers />}
            onClick={() => setTab(2)}
            sx={{
              borderRadius: theme.shape.borderRadius * 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Manage Groups
          </Button>
        )}

      {/* ✅ Create Task is always visible on all tabs */}
      <Button
        variant="contained"
        startIcon={<FiPlus />}
        onClick={() => setOpenDialog(true)}
        sx={{
          borderRadius: theme.shape.borderRadius * 2,
          textTransform: "none",
          fontWeight: 600,
          px: 3,
        }}
      >
        Create Task
      </Button>
    </Stack>
  </Stack>
</Paper>

          {tab === 2 ? (
            renderGroupsManagement()
          ) : (
            <>
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
                          <FiCalendar />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Tasks
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
                  <StatCard color="info">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{
                          bgcolor: `${theme.palette.info.main}20`,
                          color: theme.palette.info.main
                        }}>
                          <FiAlertCircle />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            In Progress
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {stats.inProgress}
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
                            Completed
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {stats.completed}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </StatCard>
                </Grid>
              </Grid>

              {/* Tabs Section */}
              <Paper sx={{
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[2],
                overflow: 'hidden'
              }}>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 2
                    }
                  }}
                >
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <FiUser />
                        <Typography>My Tasks</Typography>
                        {stats.total > 0 && (
                          <Badge
                            badgeContent={stats.total}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Stack>
                    }
                  />
                  <Tab
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiUsers />
                        <Typography>Assigned by Me</Typography>
                      </Stack>
                    }
                  />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ p: 3 }}>
                  {/* Filter Section */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mb: 3 }}
                  >
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status Filter</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        input={<OutlinedInput label="Status Filter" />}
                        sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary">
                      Showing {stats.total} tasks
                    </Typography>
                  </Stack>

                  {/* Tasks Content */}
                  {renderGroupedTasks(tab === 0 ? myTasksGrouped : assignedTasksGrouped)}
                </Box>
              </Paper>
            </>
          )}

          {/* Create Task Dialog */}
      <Dialog 
  open={openDialog} 
  onClose={() => setOpenDialog(false)} 
  maxWidth="md" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
    }
  }}
>
  {/* Enhanced Header */}
  <DialogTitle sx={{ 
    pb: 2, 
    borderBottom: 1, 
    borderColor: 'divider',
    background: theme.palette.primary.main,
    color: 'white',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '5%',
      width: '90%',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ 
        p: 1, 
        borderRadius: 2, 
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <FiPlus size={24} />
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Create New Task
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Fill in the details to create a new task
        </Typography>
      </Box>
    </Box>
  </DialogTitle>

  <DialogContent sx={{ p: 0 }}>
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Enhanced Basic Fields */}
        <Box sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: 1, 
          borderColor: 'divider',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiInfo size={20} color={theme.palette.primary.main} />
            Basic Information
          </Typography>
          
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }
              }}
              placeholder="Enter a descriptive task title"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              placeholder="Provide detailed description of the task..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Due Date & Time"
                  value={newTask.dueDateTime}
                  onChange={(dateTime) => setNewTask({ ...newTask, dueDateTime: dateTime })}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    label="Priority"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  >
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'success.main' 
                        }} />
                        Low
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'warning.main' 
                        }} />
                        Medium
                      </Box>
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'error.main' 
                        }} />
                        High
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Priority Days"
                  value={newTask.priorityDays}
                  onChange={(e) => setNewTask({ ...newTask, priorityDays: e.target.value })}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                  placeholder="Enter priority days"
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Enhanced File Uploads */}
        <Box sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: 1, 
          borderColor: 'divider',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiPaperclip size={20} color={theme.palette.primary.main} />
            Attachments
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<FiFileText />}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.light10',
                }
              }}
            >
              Upload Files
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => setNewTask({ ...newTask, files: e.target.files })}
              />
            </Button>

            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<FiMic />}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: 'secondary.light',
                color: 'secondary.main',
                '&:hover': {
                  borderColor: 'secondary.main',
                  backgroundColor: 'secondary.light10',
                }
              }}
            >
              Voice Note
              <input
                type="file"
                accept="audio/*"
                hidden
                onChange={(e) => setNewTask({ ...newTask, voiceNote: e.target.files[0] })}
              />
            </Button>
          </Stack>
        </Box>

        {/* Enhanced Role-based Assign Sections */}
        {userRole === "user" ? (
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: 1, 
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${theme.palette.primary.light}10 0%, ${theme.palette.primary.main}05 100%)`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              background: theme.palette.primary.main
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: theme.palette.primary.main,
                color: 'white'
              }}>
                <FiUser size={20} />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Assigned To You
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This task will be automatically assigned to your account
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            {/* Enhanced Assign To Users */}
            <Box sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: 1, 
              borderColor: 'divider',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiUsers size={20} color={theme.palette.primary.main} />
                Assign to Team Members
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Select Team Members</InputLabel>
                <Select
                  multiple
                  value={newTask.assignedUsers}
                  onChange={(e) => setNewTask({ ...newTask, assignedUsers: e.target.value })}
                  input={<OutlinedInput label="Select Team Members" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {users
                        .filter((u) => selected.includes(u._id))
                        .map((u) => (
                          <Chip 
                            key={u._id}
                            label={u.name}
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                        ))}
                    </Box>
                  )}
                  sx={{ borderRadius: 2 }}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Checkbox checked={newTask.assignedUsers.includes(user._id)} />
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">{user.name}</Typography>
                            <Chip 
                              label={user.role} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        } 
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Enhanced Assign To Groups */}
            {(userRole === "hr" || userRole === "manager" || userRole === "admin") && (
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                border: 1, 
                borderColor: 'divider',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiFolder size={20} color={theme.palette.primary.main} />
                  Assign to Groups
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Select Groups</InputLabel>
                  <Select
                    multiple
                    value={newTask.assignedGroups}
                    onChange={(e) => setNewTask({ ...newTask, assignedGroups: e.target.value })}
                    input={<OutlinedInput label="Select Groups" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {groups
                          .filter((g) => selected.includes(g._id))
                          .map((g) => (
                            <Chip 
                              key={g._id}
                              label={`${g.name} (${g.members.length})`}
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          ))}
                      </Box>
                    )}
                    sx={{ borderRadius: 2 }}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group._id} value={group._id}>
                        <Checkbox checked={newTask.assignedGroups.includes(group._id)} />
                        <ListItemText
                          primary={`${group.name}`}
                          secondary={`${group.members.length} members`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Box>
  </DialogContent>

  {/* Enhanced Footer */}
  <DialogActions sx={{ 
    p: 3, 
    borderTop: 1, 
    borderColor: 'divider',
    background: '#f8fafc'
  }}>
    <Button
      onClick={() => setOpenDialog(false)}
      variant="outlined"
      startIcon={<FiX />}
      sx={{ 
        borderRadius: 2,
        px: 3,
        py: 1
      }}
    >
      Cancel
    </Button>

    <Button
      onClick={() => {
        if (userRole === "user") {
          handleCreateTask({
            ...newTask,
            assignedUsers: [userId],
            assignedGroups: [],
          });
        } else {
          handleCreateTask(newTask);
        }
      }}
      variant="contained"
      disabled={!newTask.title || !newTask.description || !newTask.dueDateTime}
      startIcon={<FiCheck />}
      sx={{ 
        borderRadius: 2,
        px: 3,
        py: 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          transform: 'translateY(-1px)',
        },
        '&:disabled': {
          background: theme.palette.grey[300],
          transform: 'none',
          boxShadow: 'none'
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      Create Task
    </Button>
  </DialogActions>
</Dialog>

          {/* Group Management Dialog */}
          <Dialog
            open={openGroupDialog}
            onClose={() => setOpenGroupDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: theme.shape.borderRadius * 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              }
            }}
          >
            <DialogTitle sx={{
              pb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, transparent 100%)`,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40
                }}>
                  <FiUsers size={20} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {editingGroup ? 'Edit Group' : 'Create New Group'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingGroup ? 'Update group details and members' : 'Create a new group to assign tasks efficiently'}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                {/* Group Basic Info */}
                <Card variant="outlined" sx={{ borderRadius: theme.shape.borderRadius * 2, p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <FiUser size={20} />
                    Basic Information
                  </Typography>

                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Group Name"
                      value={newGroup.name}
                      onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="Enter a descriptive group name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FiUsers color={theme.palette.primary.main} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: theme.shape.borderRadius * 2,
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={newGroup.description}
                      onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="Describe the purpose of this group..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <FiFileText color={theme.palette.primary.main} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: theme.shape.borderRadius * 2,
                        }
                      }}
                    />
                  </Stack>
                </Card>

                {/* Group Members Selection */}
                <Card variant="outlined" sx={{ borderRadius: theme.shape.borderRadius * 2, p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <FiUserPlus size={20} />
                    Group Members
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Members</InputLabel>
                    <Select
                      multiple
                      value={newGroup.members}
                      onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value })}
                      input={<OutlinedInput label="Select Members" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const user = users.find(u => u._id === value);
                            return user ? (
                              <Chip
                                key={value}
                                label={user.name}
                                size="small"
                                variant="outlined"
                                avatar={
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                }
                              />
                            ) : null;
                          })}
                        </Box>
                      )}
                      sx={{
                        borderRadius: theme.shape.borderRadius * 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.divider,
                        }
                      }}
                    >
                      {users.map((user) => (
                        <MenuItem
                          key={user._id}
                          value={user._id}
                          sx={{
                            py: 1,
                            borderRadius: theme.shape.borderRadius,
                            '&:hover': {
                              backgroundColor: `${theme.palette.primary.main}10`,
                            }
                          }}
                        >
                          <Checkbox
                            checked={newGroup.members.includes(user._id)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              }
                            }}
                          />
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight={600}>
                                {user.name}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {user.role} • {user.email || 'No email'}
                              </Typography>
                            }
                          />
                         <Avatar
  sx={{
    width: 32,
    height: 32,
    fontSize: "0.875rem",
    bgcolor: theme.palette.primary.main,
  }}
>
  {(user?.name?.charAt(0)?.toUpperCase() || "U")}
</Avatar>

                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Selected Members Preview */}
                  {newGroup.members.length > 0 ? (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                          Selected Members ({newGroup.members.length})
                        </Typography>
                        <Chip
                          label={`${newGroup.members.length} selected`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>

                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: theme.shape.borderRadius * 2,
                          maxHeight: 300,
                          overflow: 'auto',
                          background: theme.palette.background.default
                        }}
                      >
                        <List dense>
                          {newGroup.members.map((memberId) => {
                            const member = users.find(u => u._id === memberId);
                            return member ? (
                              <ListItem
                                key={memberId}
                                sx={{
                                  py: 2,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  '&:last-child': { borderBottom: 'none' },
                                  '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: theme.palette.primary.main,
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {member.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body1" fontWeight={600}>
                                      {member.name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <Chip
                                        label={member.role}
                                        size="small"
                                        variant="filled"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.7rem',
                                          bgcolor: `${theme.palette.secondary.main}20`,
                                          color: theme.palette.secondary.dark
                                        }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        {member.email || 'No email provided'}
                                      </Typography>
                                    </Stack>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Tooltip title="Remove member">
                                    <IconButton
                                      edge="end"
                                      onClick={() => setNewGroup({
                                        ...newGroup,
                                        members: newGroup.members.filter(id => id !== memberId)
                                      })}
                                      sx={{
                                        color: theme.palette.error.main,
                                        '&:hover': {
                                          backgroundColor: `${theme.palette.error.main}10`,
                                        }
                                      }}
                                    >
                                      <FiUserMinus size={18} />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ) : null;
                          })}
                        </List>
                      </Paper>
                    </Box>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: theme.shape.borderRadius * 2,
                        background: theme.palette.background.default
                      }}
                    >
                      <FiUsers size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16, opacity: 0.5 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No members selected
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Select team members from the dropdown above to add them to this group
                      </Typography>
                    </Paper>
                  )}
                </Card>

                {/* Quick Stats */}
                {newGroup.members.length > 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: `${theme.palette.primary.main}05`,
                        border: `1px solid ${theme.palette.primary.main}20`,
                        borderRadius: theme.shape.borderRadius * 2
                      }}>
                        <Typography variant="h4" fontWeight={800} color="primary.main">
                          {newGroup.members.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Members
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: `${theme.palette.success.main}05`,
                        border: `1px solid ${theme.palette.success.main}20`,
                        borderRadius: theme.shape.borderRadius * 2
                      }}>
                        <Typography variant="h4" fontWeight={800} color="success.main">
                          {[...new Set(users.filter(u => newGroup.members.includes(u._id)).map(u => u.role))].length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Unique Roles
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: `${theme.palette.info.main}05`,
                        border: `1px solid ${theme.palette.info.main}20`,
                        borderRadius: theme.shape.borderRadius * 2
                      }}>
                        <Typography variant="h4" fontWeight={800} color="info.main">
                          {Math.ceil(newGroup.members.length / 5)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Estimated Teams
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{
              p: 4,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.default
            }}>
              <Button
                onClick={() => {
                  setOpenGroupDialog(false);
                  setEditingGroup(null);
                }}
                variant="outlined"
                startIcon={<FiX size={18} />}
                sx={{
                  borderRadius: theme.shape.borderRadius * 2,
                  px: 4,
                  fontWeight: 600,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                variant="contained"
                disabled={!newGroup.name || newGroup.members.length === 0}
                startIcon={editingGroup ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
                sx={{
                  borderRadius: theme.shape.borderRadius * 2,
                  px: 4,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${theme.palette.primary.main}40`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabled,
                    boxShadow: 'none',
                  }
                }}
              >
                {editingGroup ? 'Update Group' : 'Create Group'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Card sx={{
              minWidth: 300,
              background: snackbar.severity === 'error'
                ? theme.palette.error.main
                : theme.palette.success.main,
              color: 'white'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {snackbar.severity === 'error' ?
                    <FiXCircle size={20} /> :
                    <FiCheckCircle size={20} />
                  }
                  <Typography variant="body2" fontWeight={500}>
                    {snackbar.message}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Snackbar>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default MyTaskManagement;