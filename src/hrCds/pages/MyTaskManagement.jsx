import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';
import {
  Box, Typography, Paper, Chip, MenuItem, FormControl,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Tooltip, Tabs, Tab, Button, Dialog,
  DialogTitle, DialogContent, TextField, DialogActions, InputLabel,
  OutlinedInput, Checkbox, ListItemText, Snackbar, Card, CardContent,
  Grid, Stack, Avatar, LinearProgress, Fade, Badge, Divider,
  useTheme, useMediaQuery, InputAdornment
} from '@mui/material';
import {
  FiRefreshCw, FiPlus, FiCalendar, FiUser, FiFileText,
  FiMic, FiMessageCircle, FiAlertCircle, FiCheckCircle,
  FiClock, FiXCircle, FiDownload, FiFilter, FiSearch,
  FiChevronRight, FiUsers, FiFlag
} from 'react-icons/fi';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  borderLeft: `4px solid ${
    status === 'completed' ? theme.palette.success.main :
    status === 'in-progress' ? theme.palette.info.main :
    status === 'pending' ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
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
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '', description: '', dueDate: null, assignedUsers: [],
    whatsappNumber: '', priorityDays: '', priority: 'medium', files: null, voiceNote: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
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

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/task?status=${statusFilter}` : '/task/my';
      const res = await axios.get(url);
      setMyTasksGrouped(res.data.groupedTasks || {});
      if (tab === 0) calculateStats(res.data.groupedTasks || {});
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const res = await axios.get('/task/assigned');
      setAssignedTasksGrouped(res.data.groupedTasks || {});
      if (tab === 1) calculateStats(res.data.groupedTasks || {});
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load assigned tasks', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
    } catch (err) {
      console.error("❌ Error in handleStatusChange:", err.response || err);
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Unauthorized to update status', severity: 'error' });
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
    formData.append('dueDate', newTask.dueDate.toISOString().split('T')[0]);
    formData.append('whatsappNumber', newTask.whatsappNumber);
    formData.append('priorityDays', newTask.priorityDays);
    formData.append('priority', newTask.priority);
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
      setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      setNewTask({
        title: '', description: '', dueDate: null, assignedUsers: [],
        whatsappNumber: '', priorityDays: '', priority: 'medium', files: null, voiceNote: null
      });
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Task creation failed', severity: 'error' });
    }
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    fetchMyTasks();
    fetchAssignedTasks();
    fetchAssignableUsers();
  }, [statusFilter, tab]);

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
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
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
                        <Typography variant="body2" color={isOverdue(task.dueDate) ? 'error' : 'text.primary'}>
                          {task.dueDate?.split('T')[0]}
                        </Typography>
                        {isOverdue(task.dueDate) && (
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
                        <Typography variant="body2" color={isOverdue(task.dueDate) ? 'error' : 'text.primary'}>
                          {task.dueDate?.split('T')[0]}
                        </Typography>
                      </Stack>
                      <PriorityChip
                        label={task.priority || 'medium'}
                        priority={task.priority || 'medium'}
                        size="small"
                      />
                    </Stack>

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
                  Task Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage and track your tasks efficiently
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Tooltip title="Refresh">
                  <IconButton 
                    onClick={tab === 0 ? fetchMyTasks : fetchAssignedTasks}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                  >
                    <FiRefreshCw />
                  </IconButton>
                </Tooltip>
                {tab === 1 && (
                  <Button
                    variant="contained"
                    startIcon={<FiPlus />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      borderRadius: theme.shape.borderRadius * 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    Create Task
                  </Button>
                )}
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
                  <Stack direction="row" alignItems="center" spacing={1}>
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

          {/* Create Task Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5" fontWeight={700}>
                Create New Task
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField 
                  fullWidth 
                  label="Task Title" 
                  value={newTask.title} 
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                />
                <TextField 
                  fullWidth 
                  label="Description" 
                  multiline
                  rows={3}
                  value={newTask.description} 
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Due Date"
                      value={newTask.dueDate}
                      onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        label="Priority"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="WhatsApp Number" 
                      value={newTask.whatsappNumber} 
                      onChange={e => setNewTask({ ...newTask, whatsappNumber: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FiMessageCircle color={theme.palette.text.secondary} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="Priority Days" 
                      value={newTask.priorityDays} 
                      onChange={e => setNewTask({ ...newTask, priorityDays: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Attachments
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<FiFileText />}
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
                  <Box sx={{ p: 2, bgcolor: `${theme.palette.primary.main}10`, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Assigned To:</strong> You (Self)
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask} 
                variant="contained"
                disabled={!newTask.title || !newTask.description || !newTask.dueDate}
                sx={{ borderRadius: theme.shape.borderRadius * 2 }}
              >
                Create Task
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