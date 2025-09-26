import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, IconButton,
  Stack, Grid, Tooltip, Avatar, useTheme, useMediaQuery
} from '@mui/material';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { styled } from '@mui/material/styles';
import { FiClock } from 'react-icons/fi';
import { MdAccessTime, MdToday, MdDateRange, MdDateRange as MdDate } from 'react-icons/md';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const StyledDay = styled(Box)(({ marked, istoday }) => ({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: marked ? '#4caf50' : istoday ? '#e3f2fd' : 'transparent',
  color: marked ? '#fff' : istoday ? '#1976d2' : '#000',
  borderRadius: '50%',
  width: 36,
  height: 36,
  fontWeight: 700,
  fontSize: '0.875rem',
  '&:hover': { transform: 'scale(1.1)', transition: 'all .2s ease' }
}));

const TimeBadge = styled(Box)(() => ({
  position: 'absolute',
  bottom: -14,
  fontSize: '0.6rem',
  background: '#ff9800',
  color: '#fff',
  borderRadius: 4,
  padding: '0 4px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%'
}));

const ClockButton = styled(Button)(({ isactive }) => ({
  minWidth: 140,
  fontWeight: 700,
  borderRadius: 3,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: 3,
  ...(isactive === 'true'
    ? {
        bgcolor: '#4caf50',
        '&:hover': { bgcolor: '#388e3c', transform: 'translateY(-2px)' }
      }
    : {
        bgcolor: '#f44336',
        '&:hover': { bgcolor: '#d32f2f', transform: 'translateY(-2px)' }
      }),
  '&.Mui-disabled': {
    bgcolor: '#e0e0e0',
    color: '#9e9e9e',
    boxShadow: 3,
    transform: 'none'
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
  const grid = []; let week = Array(firstDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week); week = [];
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

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/stats', { headers: { Authorization: `Bearer ${token}` }});
      setStats(res.data);
    } catch {}
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/user/profile', { headers: { Authorization: `Bearer ${token}` }});
      setUserData(res.data);
    } catch {}
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const statusRes = await axios.get('/attendance/status', { headers: { Authorization: `Bearer ${token}` }});
      setTodayStatus(statusRes.data);
      if (statusRes.data.isClockedIn) {
        const inTime = new Date(statusRes.data.inTime);
        setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
        setIsRunning(true);
      } else if (statusRes.data.totalTime) {
        const secs = statusRes.data.totalTime.split(':').reduce((a, v, i) => (+v) + a * (i===0?3600: i===1?60:1), 0);
        setTimer(secs);
      }

      const listRes = await axios.get('/attendance/list', { headers: { Authorization: `Bearer ${token}` }});
      const dates = []; const timeMap = {}; let countPresent = 0;
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
    } catch {}
  };

  useEffect(() => { fetchUser(); fetchStats(); fetchData(); }, []);
  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => setTimer(t => t + 1), 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) clearInterval(intervalId);
  }, [isRunning]);

  const handleIn = async () => {
    const today = new Date(), key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    if (markedDates.includes(key)) {
      toast.warn("Already clocked in today");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/attendance/in', {}, { headers: { Authorization: `Bearer ${token}` }});
      setTimer(0); setIsRunning(true);
      setMarkedDates(prev => [...prev, key]);
      toast.success("Clocked IN successfully!");
      fetchData(); fetchStats();
    } catch {
      toast.error("Clock-in failed");
    }
  };

  const handleOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/attendance/out', {}, { headers: { Authorization: `Bearer ${token}` }});
      setIsRunning(false);
      const secs = res.data.data.totalTime.split(':').reduce((a,v,i) => (+v) + a*(i===0?3600: i===1?60:1), 0);
      setTimer(secs);
      toast.success(`Attendance Recorded: ${res.data.data.totalTime}`);
      fetchData(); fetchStats();
    } catch {
      toast.error("Clock-out failed");
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(m => (m === 0 ? 11 : m - 1));
    if (calendarMonth === 0) setCalendarYear(y => y - 1);
  };
  const handleNextMonth = () => {
    setCalendarMonth(m => (m === 11 ? 0 : m + 1));
    if (calendarMonth === 11) setCalendarYear(y => y + 1);
  };

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);
  const today = new Date();

  const isMarked = day => markedDates.includes(`${calendarYear}-${calendarMonth}-${day}`);
  const isToday = day => day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();

  return (
    <Box sx={{ p: isMobile ? 1 : 3, background: '#f7f7f7', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <Paper sx={{ p:2, mb:3, borderRadius:3, position:'sticky', top:16, zIndex:1000 }}>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center" alignItems="center">
          <Tooltip title="Clock In">
            <span><ClockButton onClick={handleIn} isactive={!isRunning+''} disabled={isRunning} sx={{ width: isMobile? '100%' : 140 }}>Clock In</ClockButton></span>
          </Tooltip>
          <Tooltip title="Clock Out">
            <span><ClockButton onClick={handleOut} isactive={isRunning+''} disabled={!isRunning} sx={{ width: isMobile? '100%' : 140 }}>Clock Out</ClockButton></span>
          </Tooltip>
        </Stack>
      </Paper>

      <Grid container spacing={3} sx={{ mb:3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:3, borderRadius:3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb:3 }}>
              {userData && <Avatar src={userData.avatar} sx={{ width:56,height:56 }} />}
              <Box>
                <Typography variant="h6" sx={{ fontWeight:600 }}>{userData?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap">
              <Paper sx={{ p:2, borderRadius:2, bgcolor:'#ff6d00', color:'#fff', flex: isMobile? '1 1 100%' : '0 0 220px'}}>
                <Typography sx={{ fontSize: isMobile?24:28, fontWeight:700 }}>{formatTime(timer)}</Typography>
                <Typography sx={{ fontWeight:500, fontSize: isMobile?14:16 }}>Elapsed Time</Typography>
                {todayStatus?.isClockedIn && (
                  <Typography variant="caption" sx={{ mt:1 }}>
                    Clocked in at {new Date(todayStatus.inTime).toLocaleTimeString()}
                  </Typography>
                )}
              </Paper>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p:3, borderRadius:3 }}>
            <Typography variant="h6" sx={{ fontWeight:600, mb:2 }}>Attendance Stats</Typography>
            <Stack spacing={2}>
              {[{
                label: 'This Month', value: `${monthlyPresentCount} / ${new Date(calendarYear, calendarMonth+1,0).getDate()}`, icon: <MdDate /> },
              //{
              //   label: 'Total Present', value: `${stats.presentDays} / ${stats.totalDays}`, icon: <MdToday />
              // },{
              //   label: 'Average Time', value: stats.averageTime, icon: <MdAccessTime />
              // }
              ].map((item,i)=>
                <Stack key={i} direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor:'#e3f2fd', color:'#1976d2' }}>{item.icon}</Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight:600 }}>{item.value}</Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p:3, borderRadius:3, mb:3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:3 }}>
          <Typography variant="h6" sx={{ fontWeight:600 }}>{monthNames[calendarMonth]} {calendarYear}</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Previous Month"><IconButton onClick={handlePrevMonth}>{'<'}</IconButton></Tooltip>
            <Tooltip title="Next Month"><IconButton onClick={handleNextMonth}>{'>'}</IconButton></Tooltip>
            <Button onClick={()=>{setCalendarMonth(new Date().getMonth());setCalendarYear(new Date().getFullYear());}}>Today</Button>
          </Stack>
        </Stack>

        {!isMobile ? (
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {daysOfWeek.map(d => <th key={d} style={{ background:'#42a5f5', color:'#fff', padding:'12px 8px', fontWeight:600, textAlign:'center' }}>{d}</th>)}
            </tr></thead>
            <tbody>{
              calendarDays.map((week, wi) => (
                <tr key={wi}>
                  {week.map((day, di) => (
                    <td key={di} style={{ height:60, textAlign:'center', padding:'4px', border:'1px solid #f0f0f0' }}>
                      {day && (
                        <Tooltip title={dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] || ''}>
                          <StyledDay marked={isMarked(day)} istoday={isToday(day)}>
                            {day}
                            {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] && (
                              <TimeBadge>
                                {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`].split(':').slice(0,2).join(':')}
                              </TimeBadge>
                            )}
                          </StyledDay>
                        </Tooltip>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            }</tbody>
          </Box>
        ) : (
          <Box>
            {calendarDays.map((week, wi) => (
              <Stack key={wi} direction="row" justifyContent="space-between" mb={1}>
                {week.map((day, di) => (
                  <Box key={di} sx={{ flex: 1, textAlign: 'center' }}>
                    {day && (
                      <Tooltip title={dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] || ''}>
                        <StyledDay marked={isMarked(day)} istoday={isToday(day)}>
                          {day}
                          {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] && (
                            <TimeBadge>
                              {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`].split(':').slice(0,2).join(':')}
                            </TimeBadge>
                          )}
                        </StyledDay>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Stack>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserDashboard;
