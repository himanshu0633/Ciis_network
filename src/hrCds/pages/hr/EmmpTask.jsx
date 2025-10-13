import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, Paper, TableContainer, Chip, CircularProgress,
  Stack, Divider, Card, CardContent, Grid, Avatar, Fade,
  LinearProgress, useTheme, useMediaQuery, Tooltip, Badge,
  Button
} from '@mui/material';
import {
  FiCheckCircle, FiClock, FiAlertCircle, FiXCircle,
  FiUsers, FiTrendingUp, FiCalendar, FiFilter,
  FiRefreshCw, FiArrowRight, FiUser, FiList
} from 'react-icons/fi';
import { styled } from '@mui/material/styles';

// Enhanced Styled Components
const TaskCard = styled(Card)(({ theme, priority = 'medium' }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${
    priority === 'high' ? theme.palette.error.main :
    priority === 'medium' ? theme.palette.warning.main :
    theme.palette.success.main
  }`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

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
  ...(status === 'rejected' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
  ...(status === 'pending' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(status === 'in progress' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(status === 'complete' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
}));

const PriorityBadge = styled(Box)(({ theme, priority = 'medium' }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 16,
  fontSize: '0.75rem',
  fontWeight: 600,
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
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  ...(status === 'complete' && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === 'in progress' && {
    borderLeft: `4px solid ${theme.palette.info.main}`,
  }),
}));

const EmmpTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    complete: 0,
    approved: 0,
    rejected: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      calculateStats(sortedTasks);
    } catch (err) {
      console.error('❌ Error fetching assigned tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasksData) => {
    let pending = 0;
    let inProgress = 0;
    let complete = 0;
    let approved = 0;
    let rejected = 0;

    tasksData.forEach(task => {
      task.statusInfo?.forEach(status => {
        const statusLower = status.status?.toLowerCase();
        switch (statusLower) {
          case 'pending':
            pending++;
            break;
          case 'in progress':
            inProgress++;
            break;
          case 'complete':
            complete++;
            break;
          case 'approved':
            approved++;
            break;
          case 'rejected':
            rejected++;
            break;
        }
      });
    });

    setStats({
      total: tasksData.reduce((acc, task) => acc + (task.statusInfo?.length || 0), 0),
      pending,
      inProgress,
      complete,
      approved,
      rejected
    });
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'complete':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'rejected':
        return <FiXCircle color={theme.palette.error.main} />;
      case 'pending':
        return <FiClock color={theme.palette.warning.main} />;
      case 'in progress':
        return <FiAlertCircle color={theme.palette.info.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTaskProgress = (task) => {
    if (!task.statusInfo?.length) return 0;
    const completed = task.statusInfo.filter(s => 
      s.status?.toLowerCase() === 'complete' || s.status?.toLowerCase() === 'approved'
    ).length;
    return Math.round((completed / task.statusInfo.length) * 100);
  };

  if (loading && tasks.length === 0) {
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
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Task Status Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track progress and status of all assigned tasks
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Tooltip title="Refresh">
                <Button
                  variant="outlined"
                  startIcon={<FiRefreshCw />}
                  onClick={fetchAssignedTasks}
                  sx={{
                    borderRadius: theme.shape.borderRadius * 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Refresh
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={2}>
            <StatCard color="primary">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.primary.main}20`, 
                    color: theme.palette.primary.main 
                  }}>
                    <FiList />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Tasks
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {tasks.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={2}>
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

          <Grid item xs={6} md={2}>
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

          <Grid item xs={6} md={2}>
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
                      {stats.complete}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={2}>
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

          <Grid item xs={6} md={2}>
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

        {/* Tasks List */}
        <Stack spacing={3}>
          {tasks.length === 0 ? (
            <Card sx={{ 
              textAlign: 'center', 
              py: 8,
              borderRadius: theme.shape.borderRadius * 2
            }}>
              <FiList size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Tasks Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't been assigned any tasks yet
              </Typography>
            </Card>
          ) : (
            tasks.map((task, tIndex) => (
              <TaskCard 
                key={task._id} 
                priority={task.priority || 'medium'}
              >
                <CardContent>
                  {/* Task Header */}
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    justifyContent="space-between" 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {task.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {task.description}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiCalendar size={14} color={theme.palette.text.secondary} />
                          <Typography 
                            variant="body2" 
                            color={isOverdue(task.dueDate) ? 'error' : 'text.secondary'}
                            fontWeight={500}
                          >
                            Due: {formatDate(task.dueDate)}
                          </Typography>
                          {isOverdue(task.dueDate) && (
                            <FiAlertCircle size={14} color={theme.palette.error.main} />
                          )}
                        </Stack>
                        
                        <PriorityBadge priority={task.priority || 'medium'}>
                          {task.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                        </PriorityBadge>
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {getTaskProgress(task)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={getTaskProgress(task)} 
                        sx={{ 
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          width: 100
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Assigned Users Table */}
                  <Box>
                    <Stack 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center" 
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Assigned Team Members
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.statusInfo?.length || 0} member{task.statusInfo?.length !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>

                    {!task.statusInfo || task.statusInfo.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center" py={2}>
                        No team members assigned to this task
                      </Typography>
                    ) : (
                      <TableContainer 
                        component={Paper} 
                        variant="outlined" 
                        sx={{ borderRadius: theme.shape.borderRadius }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                              <TableCell sx={{ fontWeight: 700 }}>Team Member</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Last Update</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {task.statusInfo.map((status, sIndex) => (
                              <StyledTableRow 
                                key={`${task._id}-${sIndex}`} 
                                status={status.status?.toLowerCase()}
                              >
                                <TableCell>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar 
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      {getInitials(status.name)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {status.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {status.email || 'No email'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={status.role || 'Not specified'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <StatusChip
                                    label={status.status?.charAt(0).toUpperCase() + status.status?.slice(1)}
                                    status={status.status?.toLowerCase()}
                                    icon={getStatusIcon(status.status)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {status.updatedAt 
                                      ? formatDate(status.updatedAt)
                                      : 'Never updated'
                                    }
                                  </Typography>
                                </TableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>

                  {/* Task Footer */}
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(task.createdAt)}
                    </Typography>
                    
                    <Button 
                      variant="text" 
                      endIcon={<FiArrowRight />}
                      size="small"
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      View Details
                    </Button>
                  </Stack>
                </CardContent>
              </TaskCard>
            ))
          )}
        </Stack>
      </Box>
    </Fade>
  );
};

export default EmmpTask;