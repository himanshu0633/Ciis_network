import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiClock, FiCalendar, FiTrendingUp, FiAward,
  FiChevronLeft, FiChevronRight, FiPlay, FiSquare, FiRefreshCw,
  FiUser, FiBriefcase, FiCheckCircle, FiAlertCircle,
  FiBarChart2, FiPieChart, FiSun, FiMoon
} from 'react-icons/fi';
import {
  MdToday, MdAccessTime, MdWork, MdBeachAccess, MdSick,
  MdOutlineWatchLater, MdOutlineCrop54
} from 'react-icons/md';

import './UserDashboard.css';
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [markedDates, setMarkedDates] = useState([]);
  const [monthlyPresentCount, setMonthlyPresentCount] = useState(0);
  const [dailyTimeMap, setDailyTimeMap] = useState({});
  const [leaveDates, setLeaveDates] = useState([]);
  const [absentDates, setAbsentDates] = useState([]);
  const [halfDayDates, setHalfDayDates] = useState([]);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({ 
    totalDays: 0, 
    presentDays: 0, 
    averageTime: '00:00:00',
    currentStreak: 0,
    longestStreak: 0,
    monthlyAverage: '00:00:00',
    halfDays: 0
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Task status graph states
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: { count: 0, percentage: 0 },
    inProgress: { count: 0, percentage: 0 },
    completed: { count: 0, percentage: 0 },
    overdue: { count: 0, percentage: 0 },
    rejected: { count: 0, percentage: 0 },
    onHold: { count: 0, percentage: 0 },
    reopen: { count: 0, percentage: 0 },
    cancelled: { count: 0, percentage: 0 }
  });
  
  const [timeFilter, setTimeFilter] = useState('today');
  const [graphLoading, setGraphLoading] = useState(false);

  // New states for work hours analysis
  const [workHoursData, setWorkHoursData] = useState({
    averageDaily: '00:00:00',
    weeklyTotal: '00:00:00',
    monthlyTotal: '00:00:00',
    overtime: '00:00:00'
  });

  // Auto clock-out references
  const autoClockOutTimeoutRef = useRef(null);
  const autoClockOutIntervalRef = useRef(null);

  // ✅ Fetch Task Status Counts for Graph
  const fetchTaskStatusCounts = async (period = 'today') => {
    try {
      setGraphLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/task/status-counts?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setTaskStats(response.data.statusCounts);
      } else {
        // Set mock data for demo
        setTaskStats({
          total: 15,
          pending: { count: 3, percentage: 20 },
          inProgress: { count: 5, percentage: 33 },
          completed: { count: 4, percentage: 27 },
          overdue: { count: 2, percentage: 13 },
          rejected: { count: 1, percentage: 7 },
          onHold: { count: 0, percentage: 0 },
          reopen: { count: 0, percentage: 0 },
          cancelled: { count: 0, percentage: 0 }
        });
      }
      
    } catch (err) {
      console.error('❌ Error fetching task status counts:', err);
      // Set mock data for demo purposes
      setTaskStats({
        total: 15,
        pending: { count: 3, percentage: 20 },
        inProgress: { count: 5, percentage: 33 },
        completed: { count: 4, percentage: 27 },
        overdue: { count: 2, percentage: 13 },
        rejected: { count: 1, percentage: 7 },
        onHold: { count: 0, percentage: 0 },
        reopen: { count: 0, percentage: 0 },
        cancelled: { count: 0, percentage: 0 }
      });
    } finally {
      setGraphLoading(false);
    }
  };

  // ✅ Handle Time Filter Change
  const handleTimeFilterChange = (period) => {
    setTimeFilter(period);
    fetchTaskStatusCounts(period);
  };

  // ✅ Refresh Graph Data
  const handleRefreshGraph = () => {
    fetchTaskStatusCounts(timeFilter);
  };

  // ✅ Auto Clock-out Setup
  const setupAutoClockOut = () => {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(20, 0, 0, 0); // 8:00 PM
    
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilTarget = targetTime.getTime() - now.getTime();

    if (autoClockOutTimeoutRef.current) {
      clearTimeout(autoClockOutTimeoutRef.current);
    }

    autoClockOutTimeoutRef.current = setTimeout(() => {
      autoClockOut();
      autoClockOutIntervalRef.current = setInterval(autoClockOut, 24 * 60 * 60 * 1000);
    }, timeUntilTarget);
  };

  // ✅ Auto Clock-out Function
  const autoClockOut = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post('/attendance/out', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Update local storage
      localStorage.setItem('isRunning', 'false');
      localStorage.removeItem('lastClockIn');
      
      // Update state if component is mounted
      setIsRunning(false);
      
      const secs = res.data.data.totalTime.split(':').reduce((a, v, i) => 
        (+v) + a * (i === 0 ? 3600 : i === 1 ? 60 : 1), 0);
      
      setTimer(secs);
      
      toast.success(`🕗 Auto Clock-out Completed: ${res.data.data.totalTime}`);
      
      // Refresh data
      await fetchData();
      await fetchStats();
      await fetchAttendanceHistory();
      
    } catch (error) {
      console.error('❌ Auto clock-out error:', error);
      toast.error("❌ Auto clock-out failed");
    }
  };

  // ✅ Check for missed clock-out on page load
  const checkMissedClockOut = async () => {
    const lastClockIn = localStorage.getItem('lastClockIn');
    const isRunning = localStorage.getItem('isRunning') === 'true';
    
    if (isRunning && lastClockIn) {
      const lastClockInDate = new Date(lastClockIn);
      const now = new Date();
      const today8PM = new Date();
      today8PM.setHours(20, 0, 0, 0);
      
      // If last clock-in was before today's 8 PM and it's after 8 PM now
      if (lastClockInDate < today8PM && now > today8PM) {
        toast.info("🕗 Processing auto clock-out for previous session...");
        await autoClockOut();
      }
    }
  };

  // ✅ Fetch Attendance History
  const fetchAttendanceHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceHistory(res.data || []);
    } catch (error) {
      console.error('❌ Error fetching history:', error);
    }
  };

  // ✅ Fetch leaves data
  const fetchLeaves = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/leaves/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.leaves && Array.isArray(res.data.leaves)) {
        const approvedLeaves = res.data.leaves.filter(leave => 
          leave.status === 'Approved' || leave.status === 'APPROVED'
        );
        
        const leaveDatesArray = [];
        
        approvedLeaves.forEach(leave => {
          try {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            
            // Add all dates in the leave range
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
              leaveDatesArray.push(dateKey);
              currentDate.setDate(currentDate.getDate() + 1);
            }
          } catch (err) {
            console.error('❌ Error processing leave date:', err);
          }
        });
        
        setLeaveDates(leaveDatesArray);
      } else {
        setLeaveDates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching leaves:', error);
      setLeaveDates([]);
    }
  };

  // ✅ Fetch Work Hours Analysis
  const fetchWorkHoursAnalysis = async () => {
    try {
      // Mock data for work hours analysis
      setWorkHoursData({
        averageDaily: '08:15:00',
        weeklyTotal: '41:15:00',
        monthlyTotal: '165:00:00',
        overtime: '05:30:00'
      });
    } catch (error) {
      console.error('❌ Error fetching work hours analysis:', error);
    }
  };

  // ✅ Fetch Stats
  const fetchStats = async () => {
    try {
      // Mock stats data based on your attendance data
      setStats({
        totalDays: 45,
        presentDays: 40,
        averageTime: '08:15:00',
        currentStreak: 5,
        longestStreak: 15,
        monthlyAverage: '08:20:00',
        halfDays: 2
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  // ✅ Main Data Fetching Function
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
      
      // Timer setup
      if (statusRes.data.isClockedIn) {
        const inTime = new Date(statusRes.data.inTime);
        setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
        setIsRunning(true);
        // Store clock-in state in localStorage
        localStorage.setItem('isRunning', 'true');
        localStorage.setItem('lastClockIn', statusRes.data.inTime);
      } else if (statusRes.data.totalTime) {
        const secs = statusRes.data.totalTime.split(':').reduce((a, v, i) => 
          (+v) + a * (i === 0 ? 3600 : i === 1 ? 60 : 1), 0);
        setTimer(secs);
        localStorage.setItem('isRunning', 'false');
      }

      // Process attendance data
      const dates = []; 
      const timeMap = {}; 
      const absentDatesArray = [];
      const halfDayDatesArray = [];
      let countPresent = 0;
      const thisMonth = new Date().getMonth();
      const today = new Date();
      
      if (listRes.data && listRes.data.data && Array.isArray(listRes.data.data)) {
        listRes.data.data.forEach(e => {
          try {
            const d = new Date(e.date);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            
            if (e.status === 'PRESENT') {
              dates.push(key);
              if (e.totalTime) timeMap[key] = e.totalTime;
              if (d.getMonth() === thisMonth) countPresent++;
            } else if (e.status === 'ABSENT') {
              absentDatesArray.push(key);
            } else if (e.status === 'HALF DAY') {
              halfDayDatesArray.push(key);
              if (d.getMonth() === thisMonth) countPresent += 0.5;
            }
          } catch (err) {
            console.error('❌ Error processing attendance record:', err);
          }
        });
      }
      
      setMarkedDates([...new Set(dates)]);
      setDailyTimeMap(timeMap);
      setAbsentDates(absentDatesArray);
      setHalfDayDates(halfDayDatesArray);
      setMonthlyPresentCount(countPresent);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchData();
        await fetchStats();
        await fetchAttendanceHistory();
        await fetchLeaves();
        await fetchTaskStatusCounts('today');
        await fetchWorkHoursAnalysis();
        
        // Check for missed clock-out
        await checkMissedClockOut();
        
        // Setup auto clock-out
        setupAutoClockOut();
      } catch (error) {
        console.error('❌ Error initializing data:', error);
      }
    };
    
    initializeData();

    // Cleanup function
    return () => {
      if (autoClockOutTimeoutRef.current) {
        clearTimeout(autoClockOutTimeoutRef.current);
      }
      if (autoClockOutIntervalRef.current) {
        clearInterval(autoClockOutIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => setTimer(t => t + 1), 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isRunning]);

  // ✅ Clock In Function
  const handleIn = async () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    if (markedDates.includes(key) || halfDayDates.includes(key)) {
      toast.warn("You have already clocked in today");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/attendance/in', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Store clock-in state in localStorage
      localStorage.setItem('isRunning', 'true');
      localStorage.setItem('lastClockIn', new Date().toISOString());
      
      setTimer(0);
      setIsRunning(true);
      setMarkedDates(prev => [...prev, key]);
      
      // Setup auto clock-out for today
      setupAutoClockOut();
      
      toast.success(`🟢 Clocked IN successfully! ${res.data.data.lateBy !== "00:00:00" ? `Late by ${res.data.data.lateBy}` : ""}`);
      
      await fetchData();
      await fetchStats();
      await fetchWorkHoursAnalysis();
    } catch (error) {
      console.error('Clock-in error:', error);
      toast.error("❌ Clock-in failed. Please try again.");
    }
  };

  // ✅ Clock Out Function
  const handleOut = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/attendance/out', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Update local storage
      localStorage.setItem('isRunning', 'false');
      localStorage.removeItem('lastClockIn');
      
      setIsRunning(false);
      const secs = res.data.data.totalTime.split(':').reduce((a, v, i) => 
        (+v) + a * (i === 0 ? 3600 : i === 1 ? 60 : 1), 0);
      setTimer(secs);
      toast.success(`✅ Attendance Recorded: ${res.data.data.totalTime}`);
      
      await fetchData();
      await fetchStats();
      await fetchAttendanceHistory();
      await fetchWorkHoursAnalysis();
    } catch (error) {
      console.error('Clock-out error:', error);
      toast.error("❌ Clock-out failed. Please try again.");
    }
  };

  // ✅ Handle Half Day Request
  const handleHalfDay = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date();
      const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      
      const res = await axios.post('/attendance/half-day', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("✅ Half day marked successfully!");
      
      // Update local state
      setHalfDayDates(prev => [...prev, key]);
      setMonthlyPresentCount(prev => prev + 0.5);
      
      await fetchData();
      await fetchStats();
      await fetchWorkHoursAnalysis();
      
    } catch (error) {
      console.error('Half day error:', error);
      toast.error("❌ Failed to mark half day");
    }
  };

  // ✅ Calendar Functions
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

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);
  const today = new Date();

  // ✅ Check different statuses for a day
  const getDayStatus = (day) => {
    if (!day) return null;
    
    try {
      const dateKey = `${calendarYear}-${calendarMonth}-${day}`;
      const dateObj = new Date(calendarYear, calendarMonth, day);
      const dayOfWeek = dateObj.getDay();
      
      // Check if it's weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'weekend';
      }
      
      // Check if present (attendance marked)
      if (markedDates.includes(dateKey)) {
        return 'present';
      }
      
      // Check if half day
      if (halfDayDates.includes(dateKey)) {
        return 'halfday';
      }
      
      // Check if on approved leave
      if (leaveDates.includes(dateKey)) {
        return 'leave';
      }
      
      // Check if absent (only for past dates that are not weekends and not on leave)
      if (dateObj < today && !leaveDates.includes(dateKey) && dayOfWeek !== 0 && dayOfWeek !== 6) {
        if (absentDates.includes(dateKey)) {
          return 'absent';
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error in getDayStatus:', error);
      return null;
    }
  };

  const isToday = day => day === today.getDate() && 
    calendarMonth === today.getMonth() && 
    calendarYear === today.getFullYear();

  // ✅ Graph Data Preparation for Chart
  const getGraphData = () => {
    return [
      { 
        status: 'Pending', 
        count: taskStats.pending.count, 
        percentage: taskStats.pending.percentage,
        color: '#ffc107',
        icon: '⏳'
      },
      { 
        status: 'In Progress', 
        count: taskStats.inProgress.count, 
        percentage: taskStats.inProgress.percentage,
        color: '#17a2b8',
        icon: '🔄'
      },
      { 
        status: 'Completed', 
        count: taskStats.completed.count, 
        percentage: taskStats.completed.percentage,
        color: '#28a745',
        icon: '✅'
      },
      { 
        status: 'Overdue', 
        count: taskStats.overdue.count, 
        percentage: taskStats.overdue.percentage,
        color: '#dc3545',
        icon: '⚠️'
      },
      { 
        status: 'Rejected', 
        count: taskStats.rejected.count, 
        percentage: taskStats.rejected.percentage,
        color: '#dc3545',
        icon: '❌'
      },
      { 
        status: 'On Hold', 
        count: taskStats.onHold.count, 
        percentage: taskStats.onHold.percentage,
        color: '#6c757d',
        icon: '⏸️'
      },
      { 
        status: 'Reopen', 
        count: taskStats.reopen.count, 
        percentage: taskStats.reopen.percentage,
        color: '#fd7e14',
        icon: '↩️'
      },
      { 
        status: 'Cancelled', 
        count: taskStats.cancelled.count, 
        percentage: taskStats.cancelled.percentage,
        color: '#6c757d',
        icon: '🚫'
      }
    ];
  };

  // ✅ Calculate Bar Heights for Graph
  const calculateBarHeight = (count) => {
    const maxCount = Math.max(
      taskStats.pending.count,
      taskStats.inProgress.count,
      taskStats.completed.count,
      taskStats.overdue.count,
      taskStats.rejected.count,
      taskStats.onHold.count,
      taskStats.reopen.count,
      taskStats.cancelled.count
    );
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  };

  return (
    <div className="dashboard-container">
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

      {/* Enhanced Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info-section">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <h1 className="user-name">{user?.name || 'Loading...'}</h1>
              <div className="user-meta">
                <span className="user-role">
                  <FiBriefcase size={14} />
                  {user?.role || 'Employee'}
                </span>
                <span className="user-type">
                  <FiUser size={14} />
                  {user?.employeeType || 'Full-time'}
                </span>
              </div>
              <span className="current-date">
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="clock-section">
            <div className="timer-display-large">
              <div className="timer-value-large">{formatTime(timer)}</div>
              <div className="timer-status">
                {isRunning ? 'Active Timer' : 'Timer Stopped'}
              </div>
            </div>
            <div className="clock-buttons">
              <button
                onClick={handleIn}
                className={`clock-btn clock-in ${!isRunning ? 'active' : ''}`}
                disabled={isRunning || loading}
              >
                <FiPlay size={20} />
                Clock In
              </button>
              <button
                onClick={handleOut}
                className={`clock-btn clock-out ${isRunning ? 'active' : ''}`}
                disabled={!isRunning || loading}
              >
                <FiSquare size={20} />
                Clock Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        
        {/* Left Column - Timer & Calendar */}
        <div className="left-column">
          
          {/* Enhanced Calendar Card */}
          <div className="calendar-card">
            <div className="calendar-header">
              <h3><FiCalendar /> {monthNames[calendarMonth]} {calendarYear}</h3>
              <div className="calendar-controls">
                <button onClick={handlePrevMonth} className="icon-btn">
                  <FiChevronLeft />
                </button>
                <button 
                  onClick={() => {
                    setCalendarMonth(new Date().getMonth());
                    setCalendarYear(new Date().getFullYear());
                  }}
                  className="btn-today"
                >
                  Today
                </button>
                <button onClick={handleNextMonth} className="icon-btn">
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="calendar-week-header">
                {daysOfWeek.map(day => (
                  <div key={day} className="calendar-day-header">
                    {day}
                  </div>
                ))}
              </div>

              {calendarDays.map((week, wi) => (
                <div key={wi} className="calendar-week">
                  {week.map((day, di) => {
                    const dayStatus = getDayStatus(day);
                    return (
                      <div key={di} className="calendar-day-container">
                        {day ? (
                          <div 
                            className={`calendar-day ${dayStatus || ''} ${isToday(day) ? 'today' : ''}`}
                            title={dayStatus ? 
                              dayStatus.charAt(0).toUpperCase() + dayStatus.slice(1) : 
                              'No Record'
                            }
                          >
                            {day}
                            {dayStatus === 'leave' && (
                              <div className="leave-indicator" title="On Leave"></div>
                            )}
                            {dayStatus === 'halfday' && (
                              <div className="halfday-indicator" title="Half Day"></div>
                            )}
                          </div>
                        ) : (
                          <div className="calendar-empty"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color present"></div>
                <span>Present</span>
              </div>
              <div className="legend-item">
                <div className="legend-color halfday"></div>
                <span>Half Day</span>
              </div>
              <div className="legend-item">
                <div className="legend-color leave"></div>
                <span>Leave</span>
              </div>
              <div className="legend-item">
                <div className="legend-color absent"></div>
                <span>Absent</span>
              </div>
              <div className="legend-item">
                <div className="legend-color weekend"></div>
                <span>Weekend</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Graph */}
        <div className="right-column">

          {/* Stats Grid */}
        

          {/* Task Status Graph Card */}
          <div className="graph-card-enhanced">
            <div className="graph-header">
              <div className="graph-title-section">
                <FiBarChart2 size={20} />
                <h3>Task Status Overview</h3>
                <span className="total-tasks-badge">
                  Total: {taskStats.total}
                </span>
              </div>
              
              <div className="graph-controls">
                <div className="time-filters">
                  <button 
                    className={`time-filter-btn ${timeFilter === 'today' ? 'active' : ''}`}
                    onClick={() => handleTimeFilterChange('today')}
                  >
                    Today
                  </button>
                  <button 
                    className={`time-filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                    onClick={() => handleTimeFilterChange('week')}
                  >
                    This Week
                  </button>
                  <button 
                    className={`time-filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                    onClick={() => handleTimeFilterChange('month')}
                  >
                    This Month
                  </button>
                </div>
                
                <button 
                  onClick={handleRefreshGraph}
                  className="refresh-graph-btn"
                  disabled={graphLoading}
                >
                  <FiRefreshCw size={14} className={graphLoading ? 'spinning' : ''} />
                </button>
              </div>
            </div>

            <div className="graph-content">
              {graphLoading ? (
                <div className="graph-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading task statistics...</p>
                </div>
              ) : taskStats.total === 0 ? (
                <div className="graph-empty-state">
                  <FiPieChart size={48} />
                  <p>No tasks found for {timeFilter}</p>
                  <span>Tasks will appear here when assigned or created</span>
                </div>
              ) : (
                <>
                  {/* Bar Graph */}
                  <div className="bar-graph-container">
                    <div className="bar-graph">
                      {getGraphData().map((item, index) => (
                        <div key={item.status} className="bar-item">
                          <div className="bar-label">
                            <span className="bar-icon">{item.icon}</span>
                            <span className="bar-status">{item.status}</span>
                          </div>
                          <div className="bar-wrapper">
                            <div 
                              className="bar-fill"
                              style={{
                                height: `${calculateBarHeight(item.count)}%`,
                                backgroundColor: item.color
                              }}
                              title={`${item.count} tasks (${item.percentage}%)`}
                            >
                              <div className="bar-count">{item.count}</div>
                            </div>
                          </div>
                          <div className="bar-percentage">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistics Summary */}
                  <div className="graph-stats-summary">
                    {getGraphData().map((item) => (
                      <div key={item.status} className="stat-summary-item">
                        <div 
                          className="stat-color-indicator"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="stat-summary-content">
                          <span className="stat-summary-label">{item.status}</span>
                          <span className="stat-summary-value">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                </>
              )}
            </div>
            
          </div>
        </div>  


        
      </div>


        <div className="stats-grid-enhanced">
            <div className="stat-card-enhanced present">
              <div className="stat-icon-container">
                <MdWork size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{monthlyPresentCount}</div>
                <div className="stat-label">Days Present</div>
                <div className="stat-trend">This Month</div>
              </div>
            </div>
            
            <div className="stat-card-enhanced halfday">
              <div className="stat-icon-container">
                <MdOutlineCrop54 size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{halfDayDates.length}</div>
                <div className="stat-label">Half Days</div>
                <div className="stat-trend">This Month</div>
              </div>
            </div>
            
            <div className="stat-card-enhanced leave">
              <div className="stat-icon-container">
                <MdBeachAccess size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{leaveDates.length} </div>
                <div className="stat-label">Leaves Taken</div>
                <div className="stat-trend">Approved</div>
              </div>
            </div>
            
            <div className="stat-card-enhanced absent">
              <div className="stat-icon-container">
                <MdSick size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{absentDates.length}</div>
                <div className="stat-label">Absent Days</div>
                <div className="stat-trend">This Month</div>
              </div>
            </div>
          </div>
    </div>
  );
};

export default UserDashboard;