import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiClock, FiUser, FiCalendar, FiTrendingUp, FiAward,
  FiChevronLeft, FiChevronRight, FiPlay, FiSquare,
  FiMapPin, FiBriefcase, FiBarChart2
} from 'react-icons/fi';
import {
  MdAccessTime, MdToday, MdDateRange, MdLocationOn,
  MdWork, MdAnalytics, MdRestore
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

  useEffect(() => {
    axios.get('http://localhost:3000/api/task/my')
      .then(res => {
        setRecentTasks(res.data || []);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  }, []);

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
      // setuser(res.data); // This line seems to have a typo - should be setUser
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

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          {/* User Info */}
          <div className="user-info">
            
            <div className="user-details">
              <h3>{user?.name || 'Loading...'}</h3>
              <p>{user?.role || 'Employee'} {user?.employeeType || ''}</p>
              <span>
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Clock Buttons */}
          <div className="clock-buttons">
            <button
              onClick={handleIn}
              className={`clock-btn ${!isRunning ? 'active' : ''}`}
              disabled={isRunning || loading}
            >
              <FiPlay size={20} />
              Clock In
            </button>
            <button
              onClick={handleOut}
              className={`clock-btn ${isRunning ? 'active' : ''}`}
              disabled={!isRunning || loading}
            >
              <FiSquare size={20} />
              Clock Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Left Column - Timer and Quick Stats */}
        <div className="left-column">
          {/* Timer Card */}
          <div className="timer-card">
            <div className="card-header">
              <h3><FiClock /> Live Timer</h3>
              <span className={`status-badge ${isRunning ? 'active' : 'inactive'}`}>
                {isRunning ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            
            <div className="timer-display">
              <div className="timer-value">{formatTime(timer)}</div>
              
              {todayStatus?.isClockedIn && (
                <p className="clocked-in-time">
                  Clocked in at {new Date(todayStatus.inTime).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* <div className="timer-actions">
              <button 
                className="btn-outline"
                onClick={handleResetTimer}
                disabled={isRunning}
              >
                <MdRestore /> Reset
              </button>
              <button 
                className="btn-outline"
                onClick={() => setShowHistory(true)}
              >
                <MdAnalytics /> History
              </button>
            </div> */}
          </div>

          {/* Stats Grid */}
          

          {/* Calendar Section */}
          <div className="calendar-card">
            <div className="calendar-header">
              <h3><FiCalendar /> {monthNames[calendarMonth]} {calendarYear}</h3>
              <div className="calendar-controls">
                <button onClick={handlePrevMonth} className="icon-btn">
                  <FiChevronLeft />
                </button>
                <button onClick={handleNextMonth} className="icon-btn">
                  <FiChevronRight />
                </button>
                <button 
                  onClick={() => {
                    setCalendarMonth(new Date().getMonth());
                    setCalendarYear(new Date().getFullYear());
                  }}
                  className="btn-outline"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day Headers */}
              <div className="calendar-week-header">
                {daysOfWeek.map(day => (
                  <div key={day} className="calendar-day-header">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {calendarDays.map((week, wi) => (
                <div key={wi} className="calendar-week">
                  {week.map((day, di) => (
                    <div key={di} className="calendar-day-container">
                      {day ? (
                        <div 
                          className={`calendar-day ${
                            isMarked(day) ? 'marked' : ''} ${
                            isToday(day) ? 'today' : ''} ${
                            isCurrentMonth ? 'current-month' : ''}`
                          }
                        >
                          {day}
                          {/* {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`] && (
                            <div className="time-badge">
                              {dailyTimeMap[`${calendarYear}-${calendarMonth}-${day}`].split(':').slice(0, 2).join(':')}
                            </div>
                          )} */}
                        </div>
                      ) : (
                        <div className="calendar-empty"></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Calendar Legend */}
            <div className="calendar-legend">
              {/* <div className="legend-item">
                <div className="legend-color today"></div>
                <span>Today</span>
              </div> */}
              <div className="legend-item">
                <div className="legend-color present"></div>
                <span>Present</span>
              </div>
              {/* <div className="legend-item">
                <div className="legend-color future"></div>
                <span>Future</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="right-column">
          {/* Monthly Progress */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <MdToday size={24} className="stat-icon" />
                <div className="stat-value">{monthlyPresentCount}</div>
                <div className="stat-label">This Month</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <FiTrendingUp size={24} className="stat-icon" />
                <div className="stat-value">{attendanceRate}%</div>
                <div className="stat-label">Attendance Rate</div>
              </div>
            </div>
            
            {/* <div className="stat-card">
              <div className="stat-content">
                <FiAward size={24} className="stat-icon" />
                <div className="stat-value">{stats.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
            </div> */}
            
            {/* <div className="stat-card">
              <div className="stat-content">
                <MdAccessTime size={24} className="stat-icon" />
                <div className="stat-value">{stats.averageTime.split(':').slice(0, 2).join(':')}</div>
                <div className="stat-label">Avg. Time</div>
              </div>
            </div> */}
          </div>
          <div className="progress-card">
            <h3>Monthly Progress</h3>
            <div className="progress-items">
              <div className="progress-item">
                <div className="progress-header">
                  <span>Attendance</span>
                  <span>{monthlyPresentCount}/{totalDaysInMonth} days</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar ${
                      attendanceRate >= 80 ? 'success' : 
                      attendanceRate >= 60 ? 'warning' : 'error'
                    }`}
                    style={{width: `${attendanceRate}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <span>Target Completion</span>
                  <span>{Math.round((today.getDate() / totalDaysInMonth) * 100)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar primary"
                    style={{width: `${(today.getDate() / totalDaysInMonth) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
    
          {/* Recent Activity */}
          <div className="activity-card">
            <h3>Recent Activity</h3>

            <div className="activity-list">
              {loading ? (
                <p className="loading-text">Loading...</p>
              ) : recentTasks.length > 0 ? (
                recentTasks.map((task, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-header">
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      <span className={`status-badge ${
                        task.status === 'Completed' ? 'completed' :
                        task.status === 'In Progress' ? 'in-progress' : 'pending'
                      }`}>
                        {task.status || 'Pending'}
                      </span>
                    </div>

                    <p className="activity-title">{task.title || 'Untitled task'}</p>

                    <div className="activity-divider"></div>
                  </div>
                ))
              ) : (
                <p className="no-activity">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Dialog */}
      {showHistory && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Attendance History</h3>
              <button 
                className="close-btn"
                onClick={() => setShowHistory(false)}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="history-list">
                {attendanceHistory.map((record, index) => (
                  <div key={index} className="history-item">
                    <div className="history-icon">
                      {record.status === 'PRESENT' ? (
                        <MdToday className="present" />
                      ) : (
                        <MdAccessTime className="absent" />
                      )}
                    </div>
                    <div className="history-details">
                      <div className="history-date">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="history-info">
                        <span>Status: {record.status}</span>
                        {record.totalTime && (
                          <span>Time: {record.totalTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dialog-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowHistory(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;