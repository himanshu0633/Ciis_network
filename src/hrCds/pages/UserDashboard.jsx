import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, IconButton,
  Stack, Grid, Tooltip, Avatar, useTheme, useMediaQuery,
  Card, CardContent, Chip, LinearProgress, Fade, Badge
} from '@mui/material';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';
import {
  FiClock, FiUser, FiCalendar, FiTrendingUp,
  FiChevronLeft, FiChevronRight, FiPlay, FiSquare,
  FiClock as FiClockIcon, FiCheckCircle, FiAlertCircle,
  FiList, FiArrowRight
} from 'react-icons/fi';
import {
  MdAccessTime, MdToday, MdDateRange,
  MdCheckCircle, MdSchedule
} from 'react-icons/md';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Enhanced Styled Components with Theme Integration
const StyledDay = styled(Box, {
  shouldForwardProp: (prop) => !['marked', 'istoday', 'theme'].includes(prop)
})(({ theme, marked, istoday }) => ({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: marked 
    ? theme.palette.primary.main 
    : istoday 
    ? theme.palette.primary.light + '20'
    : 'transparent',
  color: marked 
    ? theme.palette.primary.contrastText 
    : istoday 
    ? theme.palette.primary.main 
    : theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius,
  width: 40,
  height: 40,
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[2],
  },
  border: istoday ? `2px solid ${theme.palette.primary.main}` : 'none',
}));

const TimeBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -12,
  fontSize: '0.6rem',
  background: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  borderRadius: 8,
  padding: '1px 6px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '90%',
  fontWeight: 500,
  boxShadow: theme.shadows[1],
}));

const ClockButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isactive'
})(({ theme, isactive }) => ({
  minWidth: 160,
  height: 56,
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  ...(isactive === 'true'
    ? {
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
        }
      }
    : {
        background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
        color: theme.palette.secondary.contrastText,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
          background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
        }
      }),
  '&.Mui-disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    boxShadow: theme.shadows[1],
    transform: 'none'
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const TimerDisplay = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: theme.palette.primary.light,
  }
}));

const TaskCard = styled(Card)(({ theme, status }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
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

const formatTime = seconds => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const getCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];
  let week = Array(firstDay).fill(null);
  
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  
  if (week.length) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  
  return grid;
};

const UserDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [markedDates, setMarkedDates] = useState([]);
  const [monthlyPresentCount, setMonthlyPresentCount] = useState(0);
  const [dailyTimeMap, setDailyTimeMap] = useState({});
  const [userData, setUserData] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, averageTime: '00:00:00' });
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/stats', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/user/profile', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchTaskSummary = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/task/summary', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskStats(res.data.stats || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
      });
      setRecentTasks(res.data.recentTasks || []);
    } catch (error) {
      console.error('Error fetching task summary:', error);
      // Set default values if API fails
      setTaskStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
      });
      setRecentTasks([]);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const statusRes = await axios.get('/attendance/status', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayStatus(statusRes.data);
      
      if (statusRes.data.isClockedIn) {
        const inTime = new Date(statusRes.data.inTime);
        setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
        setIsRunning(true);
      } else if (statusRes.data.totalTime) {
        const secs = statusRes.data.totalTime.split(':').reduce((acc, val, idx) => 
          (+val) + acc * (idx === 0 ? 3600 : idx === 1 ? 60 : 1), 0
        );
        setTimer(secs);
      }

      const listRes = await axios.get('/attendance/list', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      const dates = [];
      const timeMap = {};
      let countPresent = 0;
      const currentMonth = new Date().getMonth();
      
      listRes.data.data.forEach(entry => {
        const date = new Date(entry.date);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        dates.push(key);
        if (entry.totalTime) timeMap[key] = entry.totalTime;
        if (date.getMonth() === currentMonth && entry.status === 'PRESENT') {
          countPresent++;
        }
      });
      
      setMarkedDates([...new Set(dates)]);
      setDailyTimeMap(timeMap);
      setMonthlyPresentCount(countPresent);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchStats();
    fetchData();
    fetchTaskSummary();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => setTimer(prev => prev + 1), 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
    }
  }, [isRunning]);

  const handleClockIn = async () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    if (markedDates.includes(key)) {
      toast.warning("You have already clocked in today");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/attendance/in', {}, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimer(0);
      setIsRunning(true);
      setMarkedDates(prev => [...prev, key]);
      toast.success("🟢 Clocked IN successfully!");
      await Promise.all([fetchData(), fetchStats()]);
    } catch (error) {
      console.error('Clock-in error:', error);
      toast.error("❌ Clock-in failed. Please try again.");
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/attendance/out', {}, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRunning(false);
      const totalSeconds = res.data.data.totalTime.split(':').reduce((acc, val, idx) => 
        (+val) + acc * (idx === 0 ? 3600 : idx === 1 ? 60 : 1), 0
      );
      setTimer(totalSeconds);
      toast.success(`✅ Attendance Recorded: ${res.data.data.totalTime}`);
      await Promise.all([fetchData(), fetchStats()]);
    } catch (error) {
      console.error('Clock-out error:', error);
      toast.error("❌ Clock-out failed. Please try again.");
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 0) {
        setCalendarYear(year => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 11) {
        setCalendarYear(year => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
  };

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const isMarked = day => markedDates.includes(`${calendarYear}-${calendarMonth}-${day}`);
  const isToday = day => day === currentDay && calendarMonth === currentMonth && calendarYear === currentYear;

  const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const attendancePercentage = Math.round((monthlyPresentCount / totalDaysInMonth) * 100);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle color={theme.palette.success.main} />;
      case 'in-progress':
        return <FiAlertCircle color={theme.palette.info.main} />;
      case 'pending':
        return <FiClock color={theme.palette.warning.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: theme.palette.background.default
      }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={500}>
      <Box sx={{ 
        p: isSmallMobile ? 2 : 3, 
        background: theme.palette.background.default, 
        minHeight: '100vh' 
      }}>
        <ToastContainer 
          position="top-right" 
          autoClose={4000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Clock In/Out Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          position: 'sticky',
          top: 16,
          zIndex: 1000,
          boxShadow: theme.shadows[4]
        }}>
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={3} 
            justifyContent="center" 
            alignItems="center"
          >
            <Tooltip title={isRunning ? "Already clocked in" : "Start your work day"}>
              <span>
                <ClockButton 
                  onClick={handleClockIn} 
                  isactive={(!isRunning).toString()}
                  disabled={isRunning}
                  startIcon={<FiPlay size={20} />}
                  sx={{ width: isMobile ? '100%' : 160 }}
                >
                  Clock In
                </ClockButton>
              </span>
            </Tooltip>
            
            <Tooltip title={!isRunning ? "Clock in first to enable" : "End your work day"}>
              <span>
                <ClockButton 
                  onClick={handleClockOut} 
                  isactive={isRunning.toString()}
                  disabled={!isRunning}
                  startIcon={<FiSquare size={20} />}
                  sx={{ width: isMobile ? '100%' : 160 }}
                >
                  Clock Out
                </ClockButton>
              </span>
            </Tooltip>
          </Stack>
        </Paper>

        {/* Main Content Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* User Info and Timer Section */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* User Profile Card */}
              <StatCard>
                <CardContent>
                  <Stack 
                    direction={isSmallMobile ? 'column' : 'row'} 
                    alignItems={isSmallMobile ? 'flex-start' : 'center'} 
                    spacing={3}
                  >
                    <Avatar 
                      src={userData?.avatar} 
                      sx={{ 
                        width: 64, 
                        height: 64,
                        border: `3px solid ${theme.palette.primary.main}` 
                      }}
                    >
                      <FiUser size={32} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {userData?.name || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {today.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip 
                          icon={<MdCheckCircle />} 
                          label={isRunning ? "Clocked In" : "Not Clocked In"} 
                          color={isRunning ? "success" : "default"}
                          size="small"
                        />
                        {todayStatus?.isClockedIn && (
                          <Chip 
                            icon={<FiClockIcon />}
                            label={`In at ${new Date(todayStatus.inTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>

              {/* Timer Display */}
              <TimerDisplay>
                <Stack 
                  direction={isSmallMobile ? 'column' : 'row'} 
                  alignItems="center" 
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography 
                      variant={isSmallMobile ? "h4" : "h3"} 
                      sx={{ 
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        letterSpacing: 2
                      }}
                    >
                      {formatTime(timer)}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        opacity: 0.9
                      }}
                    >
                      {isRunning ? "Active Timer" : "Today's Total"}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: isSmallMobile ? 'center' : 'right' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {isRunning ? "Working since" : "Last clocked out"}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {todayStatus?.isClockedIn 
                        ? new Date(todayStatus.inTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : todayStatus?.lastOutTime 
                        ? new Date(todayStatus.lastOutTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : '--:--'
                      }
                    </Typography>
                  </Box>
                </Stack>
              </TimerDisplay>

              {/* Task Summary Section */}
              <StatCard>
                <CardContent>
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FiList />
                      My Tasks
                    </Typography>
                    <Button 
                      endIcon={<FiArrowRight />} 
                      size="small"
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      View All
                    </Button>
                  </Stack>

                  {/* Task Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                      { label: 'Total', value: taskStats.total, color: 'primary' },
                      { label: 'Pending', value: taskStats.pending, color: 'warning' },
                      { label: 'In Progress', value: taskStats.inProgress, color: 'info' },
                      { label: 'Completed', value: taskStats.completed, color: 'success' },
                    ].map((stat, index) => (
                      <Grid item xs={3} key={index}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: `${theme.palette[stat.color].main}` }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Recent Tasks */}
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      RECENT TASKS
                    </Typography>
                    {recentTasks.length > 0 ? (
                      recentTasks.slice(0, 3).map((task, index) => (
                        <TaskCard key={index} status={task.status}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" alignItems="flex-start" spacing={2}>
                              <Box sx={{ pt: 0.5 }}>
                                {getStatusIcon(task.status)}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {task.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                  {task.description && task.description.length > 60 
                                    ? `${task.description.substring(0, 60)}...` 
                                    : task.description
                                  }
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                  <Chip 
                                    label={task.status} 
                                    size="small"
                                    color={getStatusColor(task.status)}
                                    variant="outlined"
                                  />
                                  {task.dueDate && (
                                    <Chip 
                                      icon={<FiCalendar size={12} />}
                                      label={new Date(task.dueDate).toLocaleDateString()} 
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </CardContent>
                        </TaskCard>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <FiList size={32} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          No tasks assigned
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </StatCard>
            </Stack>
          </Grid>

          {/* Stats Section */}
          <Grid item xs={12} lg={4}>
            <StatCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiTrendingUp />
                  Attendance Overview
                </Typography>
                <Stack spacing={2.5}>
                  {[
                    {
                      label: 'This Month',
                      value: `${monthlyPresentCount} / ${totalDaysInMonth}`,
                      icon: <MdDateRange />,
                      progress: attendancePercentage,
                      color: 'primary'
                    },
                    {
                      label: 'Total Present',
                      value: `${stats.presentDays} / ${stats.totalDays}`,
                      icon: <MdToday />,
                      progress: stats.totalDays ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0,
                      color: 'success'
                    },
                    // {
                    //   label: 'Average Time',
                    //   value: stats.averageTime,
                    //   icon: <MdAccessTime />,
                    //   color: 'info'
                    // }
                  ].map((item, index) => (
                    <Box key={index}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          bgcolor: `${theme.palette[item.color].light}20`, 
                          color: theme.palette[item.color].main 
                        }}>
                          {item.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Stack>
                      {item.progress !== undefined && (
                        <LinearProgress 
                          variant="determinate" 
                          value={item.progress} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: theme.palette.action.hover,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette[item.color].main,
                            }
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </StatCard>
           
          </Grid>
           <StatCard sx={{ maxWidth: 400, mx: 'auto' }}>
  <CardContent sx={{ p: 2 }}>
    <Stack 
      direction="row" 
      alignItems="center" 
      justifyContent="space-between" 
      spacing={1}
      sx={{ mb: 2 }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: '1rem'
        }}
      >
        <FiCalendar size={18} />
        {monthNames[calendarMonth]} {calendarYear}
      </Typography>
      
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Previous Month">
          <IconButton 
            onClick={handlePrevMonth}
            size="small"
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { bgcolor: theme.palette.action.hover }
            }}
          >
            <FiChevronLeft size={16} />
          </IconButton>
        </Tooltip>
        
        <Button 
          variant="outlined" 
          onClick={handleToday}
          size="small"
          sx={{ 
            minWidth: 'auto',
            px: 1,
            fontSize: '0.75rem'
          }}
        >
          Today
        </Button>
        
        <Tooltip title="Next Month">
          <IconButton 
            onClick={handleNextMonth}
            size="small"
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': { bgcolor: theme.palette.action.hover }
            }}
          >
            <FiChevronRight size={16} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>

    {/* Calendar Grid */}
    <Box sx={{ overflowX: 'auto' }}>
      <Box 
        component="table" 
        sx={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          minWidth: 300
        }}
      >
        <thead>
          <tr>
            {daysOfWeek.map(day => (
              <th 
                key={day} 
                style={{ 
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  padding: '8px 4px',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarDays.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dayKey = `${calendarYear}-${calendarMonth}-${day}`;
                const workedTime = dailyTimeMap?.[dayKey];

                return (
                  <td
                    key={dayIndex}
                    style={{
                      height: 45,
                      textAlign: 'center',
                      padding: '2px 1px',
                      border: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.paper
                    }}
                  >
                    {day && (
                      <Tooltip
                        title={workedTime ? `Worked: ${workedTime}` : 'No attendance'}
                        placement="top"
                      >
                        <StyledDay 
                          marked={isMarked(day)} 
                          istoday={isToday(day)}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.75rem'
                          }}
                        >
                          {day}
                          {workedTime && (
                            <TimeBadge
                              sx={{
                                bottom: -10,
                                fontSize: '0.5rem',
                                padding: '0px 4px',
                                maxWidth: '85%'
                              }}
                            >
                              {workedTime.split(':').slice(0, 2).join(':')}
                            </TimeBadge>
                          )}
                        </StyledDay>
                      </Tooltip>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  </CardContent>
</StatCard>
        </Grid>

 
      </Box>
    </Fade>
  );
};

export default UserDashboard;
