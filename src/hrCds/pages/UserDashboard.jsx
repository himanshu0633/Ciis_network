import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiClock, FiCalendar, FiTrendingUp, FiAward,
  FiChevronLeft, FiChevronRight, FiPlay, FiSquare, FiRefreshCw,
  FiUser, FiBriefcase, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import {
  MdToday, MdAccessTime, MdWork, MdBeachAccess, MdSick
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
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
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
  const [recentTasks, setRecentTasks] = useState([]);
  const [error, setError] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Auto clock-out references
  const autoClockOutTimeoutRef = useRef(null);
  const autoClockOutIntervalRef = useRef(null);

  // Debug function to check data


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
      const isRunning = localStorage.getItem('isRunning') === 'true';
      
      // Only proceed if user is currently clocked in

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

  // ✅ CORRECTED: Recent tasks fetch करने का function
  const fetchRecentTasks = async () => {
    try {
      setTasksLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/task/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

   

      // ✅ FIXED: API response structure के according data extract करें
      let tasksData = [];
      
      if (response.data.groupedTasks) {
        // groupedTasks से सभी tasks को एक array में combine करें
        Object.values(response.data.groupedTasks).forEach(dateGroup => {
          if (Array.isArray(dateGroup)) {
            tasksData = tasksData.concat(dateGroup);
          }
        });
      } else if (response.data.tasks) {
        tasksData = response.data.tasks;
      } else if (response.data.data) {
        tasksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        tasksData = response.data;
      }

  

      // Tasks को created date के descending order में sort करें और latest 3 tasks लें
      const sortedTasks = tasksData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

      setRecentTasks(sortedTasks);
      
    } catch (err) {
      console.error('❌ Error fetching recent tasks:', err);
      setError('Failed to load recent activities');
      toast.error('Failed to load recent activities');
    } finally {
      setTasksLoading(false);
    }
  };

  // ✅ Refresh button handler
  const handleRefreshTasks = () => {
    fetchRecentTasks();
  };

  useEffect(() => {
    fetchRecentTasks();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/stats', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
 
      setStats(prev => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/attendance/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // console.log('📅 Attendance History:', res.data);
      setAttendanceHistory(res.data || []);
    } catch (error) {
      console.error('❌ Error fetching history:', error);
    }
  };

  // Fetch leaves data
  const fetchLeaves = async () => {
    const token = localStorage.getItem('token');
    try {
      // console.log('🔄 Fetching leaves...');
      const res = await axios.get('http://localhost:3000/api/leaves/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      
      if (res.data.leaves && Array.isArray(res.data.leaves)) {
        const approvedLeaves = res.data.leaves.filter(leave => 
          leave.status === 'Approved' || leave.status === 'APPROVED'
        );
        
        // console.log('✅ Approved Leaves:', approvedLeaves);
        
        const leaveDatesArray = [];
        
        approvedLeaves.forEach(leave => {
          try {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            
            // console.log(`📅 Processing approved leave from ${startDate.toDateString()} to ${endDate.toDateString()}`);
            
            // Add all dates in the leave range
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
              leaveDatesArray.push(dateKey);
              // console.log(`   Added leave date: ${dateKey}`);
              currentDate.setDate(currentDate.getDate() + 1);
            }
          } catch (err) {
            console.error('❌ Error processing leave date:', err);
          }
        });
        
        // console.log('✅ Final Leave Dates Array:', leaveDatesArray);
        setLeaveDates(leaveDatesArray);
      } else {
        // console.log('ℹ️ No leaves data found');
        setLeaveDates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching leaves:', error);
      // console.log('Error details:', error.response?.data || error.message);
      // toast.error('Failed to load leave data');
      setLeaveDates([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // console.log('🔄 Fetching attendance data...');
      
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
            }
          } catch (err) {
            console.error('❌ Error processing attendance record:', err);
          }
        });
      }
 
      
      setMarkedDates([...new Set(dates)]);
      setDailyTimeMap(timeMap);
      setAbsentDates(absentDatesArray);
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
        
        // Check for missed clock-out
        await checkMissedClockOut();
        
        // Setup auto clock-out
        setupAutoClockOut();
        
        // Debug after all data is loaded
        setTimeout(debugData, 1000);
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

  const handleIn = async () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    if (markedDates.includes(key)) {
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

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);
  const today = new Date();

  // Check different statuses for a day
  const getDayStatus = (day) => {
    if (!day) return null;
    
    try {
      const dateKey = `${calendarYear}-${calendarMonth}-${day}`;
      const dateObj = new Date(calendarYear, calendarMonth, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check if it's weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'weekend';
      }
      
      // Check if present (attendance marked)
      if (markedDates.includes(dateKey)) {
        return 'present';
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

  const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const attendanceRate = Math.round((monthlyPresentCount / totalDaysInMonth) * 100);

  // ✅ Task status check function
  const getTaskStatus = (task) => {
    // Check if task has statusInfo array
    if (task.statusInfo && Array.isArray(task.statusInfo)) {
      const userStatus = task.statusInfo.find(status => 
        status.userId === user?._id || status.userId === user?.id
      );
      return userStatus?.status || 'pending';
    }
    
    // Fallback to statusByUser array
    if (task.statusByUser && Array.isArray(task.statusByUser)) {
      const userStatus = task.statusByUser.find(status => 
        status.user === user?._id || status.user === user?.id
      );
      return userStatus?.status || 'pending';
    }
    
    return 'pending';
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

      {/* Debug Button - Remove in production */}
  

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
                {isRunning && <span className="auto-clockout-note">(Auto clock-out at 8 PM)</span>}
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
          
          {/* Enhanced Timer Card */}
          <div className="timer-card">
            <div className="card-header">
              <h3><FiClock /> Live Timer</h3>
              <span className={`status-badge ${isRunning ? 'active' : 'inactive'}`}>
                {isRunning ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            
            <div className="timer-content">
              <div className="timer-display-main">
                <div className="timer-value-main">{formatTime(timer)}</div>
                {todayStatus?.isClockedIn && (
                  <p className="clocked-in-time">
                    Clocked in at {new Date(todayStatus.inTime).toLocaleTimeString()}
                  </p>
                )}
                {isRunning && (
                  <p className="auto-clockout-info">
                    ⏰ Auto clock-out scheduled for 8:00 PM
                  </p>
                )}
              </div>
              
              <div className="timer-stats">
                <div className="stat-item">
                  <span className="stat-label">Today's Time</span>
                  <span className="stat-value">{formatTime(timer)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value ${isRunning ? 'active' : 'inactive'}`}>
                    {isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>
            </div>
          </div>

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

        {/* Right Column - Stats & Activities */}
        <div className="right-column">

          {/* Enhanced Stats Grid */}
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
            
            <div className="stat-card-enhanced leave">
              <div className="stat-icon-container">
                <MdBeachAccess size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{leaveDates.length}</div>
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

          {/* Enhanced Activity Card */}
          <div className="activity-card-enhanced">
            <div className="activity-header">
              <h3>Recent Activities</h3>
              <button 
                onClick={handleRefreshTasks}
                className="refresh-btn-enhanced"
                disabled={tasksLoading}
              >
                <FiRefreshCw size={16} className={tasksLoading ? 'spinning' : ''} />
                {tasksLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="activity-list-enhanced">
              {tasksLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading activities...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <FiAlertCircle size={32} />
                  <p>{error}</p>
                  <button onClick={handleRefreshTasks} className="retry-btn">
                    Try Again
                  </button>
                </div>
              ) : recentTasks.length > 0 ? (
                recentTasks.map((task, index) => {
                  const taskStatus = getTaskStatus(task);
                  return (
                    <div key={task._id || index} className="activity-item-enhanced">
                      <div className="activity-item-header">
                        <div className="activity-type-indicator"></div>
                        <span className="activity-date">
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                        <span className={`task-status ${taskStatus}`}>
                          {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                        </span>
                      </div>
                      <p className="activity-title">{task.title || 'Untitled Task'}</p>
                      {task.description && (
                        <p className="activity-description">
                          {task.description.length > 80 
                            ? `${task.description.substring(0, 80)}...` 
                            : task.description
                          }
                        </p>
                      )}
                      {task.projectId?.projectName && (
                        <div className="activity-project">
                          Project: {task.projectId.projectName}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <FiCheckCircle size={32} />
                  <p>No recent activities found</p>
                  <button onClick={handleRefreshTasks} className="retry-btn">
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;