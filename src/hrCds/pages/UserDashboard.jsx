import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, IconButton,
  Stack, Grid, Tooltip, Avatar, useTheme, useMediaQuery,
  Card, CardContent, LinearProgress, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText,
  ListItemIcon, Divider
} from '@mui/material';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';
import {
  FiClock, FiUser, FiCalendar, FiTrendingUp, FiAward,
  FiChevronLeft, FiChevronRight, FiPlay, FiSquare,
  FiMapPin, FiBriefcase, FiBarChart2
} from 'react-icons/fi';
import {
  MdAccessTime, MdToday, MdDateRange, MdLocationOn,
  MdWork, MdAnalytics, MdRestore
} from 'react-icons/md';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const StyledDay = styled(Paper)(({ marked, istoday, iscurrentmonth, theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: marked 
    ? theme.palette.success.main 
    : istoday 
    ? theme.palette.primary.main 
    : iscurrentmonth
    ? theme.palette.background.paper
    : theme.palette.action.hover,
  color: marked 
    ? theme.palette.success.contrastText 
    : istoday 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  borderRadius: '12px',
  width: 40,
  height: 40,
  minWidth: 40,
  minHeight: 40,
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.15)',
    boxShadow: theme.shadows[4],
    zIndex: 1
  },
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    fontSize: '0.75rem'
  }
}));

const TimeBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -8,
  fontSize: '0.55rem',
  background: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
  borderRadius: 8,
  padding: '1px 6px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '90%',
  fontWeight: 600,
  boxShadow: theme.shadows[1]
}));

const ClockButton = styled(Button)(({ isactive, theme }) => ({
  minWidth: 160,
  height: 56,
  fontWeight: 700,
  borderRadius: 12,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  fontSize: '1rem',
  ...(isactive === 'true'
    ? {
        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
        '&:hover': {
          background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.dark})`,
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[8]
        }
      }
    : {
        background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
        '&:hover': {
          background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.dark})`,
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[8]
        }
      }),
  '&.Mui-disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    boxShadow: theme.shadows[1],
    transform: 'none'
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
    height: 48,
    fontSize: '0.9rem'
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [markedDates, setMarkedDates] = useState([]);
  const [monthlyPresentCount, setMonthlyPresentCount] = useState(0);
  const [dailyTimeMap, setDailyTimeMap] = useState({});
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  console.log("jhdhcdb", user)
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({ 
    totalDays: 0, 
    presentDays: 0, 
    averageTime: '00:00:00',
    currentStreak: 0,
    longestStreak: 0,
    monthlyAverage: '00:00:00'
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stable functions that don't change
  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/stats', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStats(prev => ({ ...prev, ...res.data }));
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
      setuser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceHistory(res.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [statusRes, listRes] = await Promise.all([
        axios.get('/attendance/status', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get('/attendance/list', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      setTodayStatus(statusRes.data);
      
      if (statusRes.data.isClockedIn) {
        const inTime = new Date(statusRes.data.inTime);
        setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
        setIsRunning(true);
      } else if (statusRes.data.totalTime) {
        const secs = statusRes.data.totalTime.split(':').reduce((a, v, i) => 
          (+v) + a * (i === 0 ? 3600 : i === 1 ? 60 : 1), 0);
        setTimer(secs);
      }

      const dates = []; 
      const timeMap = {}; 
      let countPresent = 0;
      const thisMonth = new Date().getMonth();
      
      listRes.data.data.forEach(e => {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        dates.push(key);
        if (e.totalTime) timeMap[key] = e.totalTime;
        if (d.getMonth() === thisMonth && e.status === 'PRESENT') countPresent++;
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

  // Initialize data - only run once on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      await fetchStats();
      await fetchData();
      await fetchAttendanceHistory();
    };
    
    initializeData();
  }, []); // Empty dependency array - runs only once

  // Timer effect - separate from data fetching
  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => setTimer(t => t + 1), 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isRunning]); // Only depend on isRunning

  const handleIn = async () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    if (markedDates.includes(key)) {
      toast.warn("You have already clocked in today");
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
      
      // Refresh data after successful clock-in
      await fetchData();
      await fetchStats();
    } catch (error) {
      console.error('Clock-in error:', error);
      toast.error("❌ Clock-in failed. Please try again.");
    }
  };

  const handleOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/attendance/out', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setIsRunning(false);
      const secs = res.data.data.totalTime.split(':').reduce((a, v, i) => 
        (+v) + a * (i === 0 ? 3600 : i === 1 ? 60 : 1), 0);
      setTimer(secs);
      toast.success(`✅ Attendance Recorded: ${res.data.data.totalTime}`);
      
      // Refresh data after successful clock-out
      await fetchData();
      await fetchStats();
      await fetchAttendanceHistory();
    } catch (error) {
      console.error('Clock-out error:', error);
      toast.error("❌ Clock-out failed. Please try again.");
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(m => {
      if (m === 0) {
        setCalendarYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth(m => {
      if (m === 11) {
        setCalendarYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const handleResetTimer = () => {
    setTimer(0);
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);
  const today = new Date();

  const isMarked = day => markedDates.includes(`${calendarYear}-${calendarMonth}-${day}`);
  const isToday = day => day === today.getDate() && 
    calendarMonth === today.getMonth() && 
    calendarYear === today.getFullYear();
  const isCurrentMonth = calendarMonth === today.getMonth() && 
    calendarYear === today.getFullYear();

  const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const attendanceRate = Math.round((monthlyPresentCount / totalDaysInMonth) * 100);

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3, 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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

      {/* Header Section */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'sticky',
        top: 16,
        zIndex: 1000,
        boxShadow: theme.shadows[8]
      }}>
        <Stack direction={isMobile ? 'column' : 'row'} 
               spacing={3} 
               alignItems="center" 
               justifyContent="space-between">
          
          {/* User Info */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar 
              src={user?.avatar} 
              sx={{ 
                width: 64, 
                height: 64,
                border: '3px solid rgba(255,255,255,0.3)'
              }} 
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.name || 'Loading...'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {user?.role || 'Employee'} 
                 {user?.employeeType || ''}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
          </Stack>

          {/* Clock Buttons */}
          <Stack direction={isMobile ? 'column' : 'row'} 
                 spacing={2} 
                 sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Tooltip title={isRunning ? "Already clocked in" : "Start your work day"}>
              <span>
                <ClockButton 
                  onClick={handleIn} 
                  isactive={(!isRunning).toString()} 
                  disabled={isRunning || loading}
                  startIcon={<FiPlay size={20} />}
                >
                  Clock In
                </ClockButton>
              </span>
            </Tooltip>
            <Tooltip title={!isRunning ? "Clock in first" : "End your work day"}>
              <span>
                <ClockButton 
                  onClick={handleOut} 
                  isactive={isRunning.toString()} 
                  disabled={!isRunning || loading}
                  startIcon={<FiSquare size={20} />}
                >
                  Clock Out
                </ClockButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        
        {/* Left Column - Timer and Quick Stats */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            
            {/* Timer Card */}
            <StatCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FiClock /> Live Timer
                  </Typography>
                  <Chip 
                    label={isRunning ? "ACTIVE" : "INACTIVE"} 
                    color={isRunning ? "success" : "default"}
                    size="small"
                  />
                </Stack>
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    fontSize: isMobile ? '3rem' : '4rem'
                  }}>
                    {formatTime(timer)}
                  </Typography>
                  
                  {todayStatus?.isClockedIn && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Clocked in at {new Date(todayStatus.inTime).toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>

                {/* <Stack direction="row" spacing={1} justifyContent="center">
                  <Button 
                    variant="outlined" 
                    onClick={handleResetTimer}
                    disabled={isRunning}
                    startIcon={<MdRestore />}
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => setShowHistory(true)}
                    startIcon={<MdAnalytics />}
                  >
                    History
                  </Button>
                </Stack> */}
              </CardContent>
            </StatCard>

            {/* Stats Grid */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <MdToday size={24} color={theme.palette.primary.main} />
                    <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                      {monthlyPresentCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <FiTrendingUp size={24} color={theme.palette.success.main} />
                    <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                      {attendanceRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Rate
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <FiAward size={24} color={theme.palette.warning.main} />
                    <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                      {stats.currentStreak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Streak
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <MdAccessTime size={24} color={theme.palette.info.main} />
                    <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                      {stats.averageTime.split(':').slice(0, 2).join(':')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Time
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>

            {/* Calendar Section */}
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiCalendar /> {monthNames[calendarMonth]} {calendarYear}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Previous Month">
                    <IconButton onClick={handlePrevMonth} size="small">
                      <FiChevronLeft />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Next Month">
                    <IconButton onClick={handleNextMonth} size="small">
                      <FiChevronRight />
                    </IconButton>
                  </Tooltip>
                  <Button 
                    onClick={() => {
                      setCalendarMonth(new Date().getMonth());
                      setCalendarYear(new Date().getFullYear());
                    }}
                    variant="outlined"
                    size="small"
                  >
                    Today
                  </Button>
                </Stack>
              </Stack>

              {/* Calendar Grid */}
              <Box>
                {/* Day Headers */}
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  {daysOfWeek.map(day => (
                    <Grid item xs key={day} sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 700, 
                        color: 'text.secondary',
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}>
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Calendar Days */}
                {calendarDays.map((week, wi) => (
                  <Grid container spacing={1} key={wi} sx={{ mb: 1 }}>
                    {week.map((day, di) => (
                      <Grid item xs key={di} sx={{ display: 'flex', justifyContent: 'center' }}>
                        {day ? (
                          <Tooltip 
                            title={
                              dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] 
                                ? `Worked: ${dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`]}` 
                                : 'No attendance'
                            }
                          >
                            <StyledDay 
                              marked={isMarked(day)} 
                              istoday={isToday(day)}
                              iscurrentmonth={isCurrentMonth}
                            >
                              {day}
                              {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] && (
                                <TimeBadge>
                                  {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`].split(':').slice(0, 2).join(':')}
                                </TimeBadge>
                              )}
                            </StyledDay>
                          </Tooltip>
                        ) : (
                          <Box sx={{ width: 40, height: 40 }} />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                ))}
              </Box>

              {/* Calendar Legend */}
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, flexWrap: 'wrap' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="caption">Today</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="caption">Present</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'action.hover' }} />
                  <Typography variant="caption">Future</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column - Additional Info */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            
            {/* Monthly Progress */}
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Monthly Progress
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Attendance</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {monthlyPresentCount}/{totalDaysInMonth} days
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={attendanceRate} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={attendanceRate >= 80 ? "success" : attendanceRate >= 60 ? "warning" : "error"}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Target Completion</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {Math.round((today.getDate() / totalDaysInMonth) * 100)}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(today.getDate() / totalDaysInMonth) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="primary"
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
              
                <Button 
                  variant="outlined" 
                    onClick={handleOut} 
                  startIcon={<MdWork />}
                  fullWidth
                >
                  Request Time Off
                </Button>
                {/* <Button 
                  variant="outlined" 
                  startIcon={<MdLocationOn />}
                  fullWidth
                >
                  Location Settings
                </Button> */}
              </Stack>
            </Paper>

            {/* Recent Activity */}
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {attendanceHistory.slice(0, 3).map((record, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(record.date).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={record.status} 
                        color={record.status === 'PRESENT' ? 'success' : 'error'}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {record.totalTime || 'No time recorded'}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
                {attendanceHistory.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent activity
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Attendance History Dialog */}
      <Dialog 
        open={showHistory} 
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Attendance History
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {attendanceHistory.map((record, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  {record.status === 'PRESENT' ? (
                    <MdToday color={theme.palette.success.main} />
                  ) : (
                    <MdAccessTime color={theme.palette.error.main} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  secondary={
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {record.status}
                      </Typography>
                      {record.totalTime && (
                        <Typography variant="body2" color="text.secondary">
                          Time: {record.totalTime}
                        </Typography>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;