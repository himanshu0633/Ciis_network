import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiClock, FiCalendar, FiTrendingUp, FiAward,
  FiChevronLeft, FiChevronRight, FiPlay, FiSquare, FiRefreshCw
} from 'react-icons/fi';
import {
  MdToday, MdAccessTime
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

  // Debug function to check data
  const debugData = () => {
    console.log('🔍 DEBUG DATA:');
    console.log('Marked Dates (Present):', markedDates);
    console.log('Leave Dates:', leaveDates);
    console.log('Absent Dates:', absentDates);
    console.log('Monthly Present Count:', monthlyPresentCount);
    console.log('Recent Tasks:', recentTasks);
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

      console.log('📝 Tasks API Response:', response.data);

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

      console.log('📝 Processed Tasks Data:', tasksData);

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
      console.log('📊 Stats:', res.data);
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
      console.log('📅 Attendance History:', res.data);
      setAttendanceHistory(res.data || []);
    } catch (error) {
      console.error('❌ Error fetching history:', error);
    }
  };

  // Fetch leaves data
  const fetchLeaves = async () => {
    const token = localStorage.getItem('token');
    try {
      console.log('🔄 Fetching leaves...');
      const res = await axios.get('http://localhost:3000/api/leaves/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Leaves API Response:', res.data);
      
      if (res.data.leaves && Array.isArray(res.data.leaves)) {
        const approvedLeaves = res.data.leaves.filter(leave => 
          leave.status === 'Approved' || leave.status === 'APPROVED'
        );
        
        console.log('✅ Approved Leaves:', approvedLeaves);
        
        const leaveDatesArray = [];
        
        approvedLeaves.forEach(leave => {
          try {
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            
            console.log(`📅 Processing approved leave from ${startDate.toDateString()} to ${endDate.toDateString()}`);
            
            // Add all dates in the leave range
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
              leaveDatesArray.push(dateKey);
              console.log(`   Added leave date: ${dateKey}`);
              currentDate.setDate(currentDate.getDate() + 1);
            }
          } catch (err) {
            console.error('❌ Error processing leave date:', err);
          }
        });
        
        console.log('✅ Final Leave Dates Array:', leaveDatesArray);
        setLeaveDates(leaveDatesArray);
      } else {
        console.log('ℹ️ No leaves data found');
        setLeaveDates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching leaves:', error);
      console.log('Error details:', error.response?.data || error.message);
      toast.error('Failed to load leave data');
      setLeaveDates([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      console.log('🔄 Fetching attendance data...');
      
      const [statusRes, listRes] = await Promise.all([
        axios.get('/attendance/status', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get('/attendance/list', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      console.log('✅ Status Response:', statusRes.data);
      console.log('✅ List Response:', listRes.data);

      setTodayStatus(statusRes.data);
      
      // Timer setup
      if (statusRes.data.isClockedIn) {
        const inTime = new Date(statusRes.data.inTime);
        setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
        setIsRunning(true);
      } else if (statusRes.data.totalTime) {
        const secs = statusRes.data.totalTime.split(':').reduce((a, v, i) => 
          (+v) + a * (i === 0 ? 3600 : i === 1 ? 60 : 1), 0);
        setTimer(secs);
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
      
      console.log('✅ Processed Present Dates:', dates);
      console.log('✅ Processed Absent Dates:', absentDatesArray);
      console.log('✅ Monthly Present Count:', countPresent);
      
      setMarkedDates([...new Set(dates)]);
      setDailyTimeMap(timeMap);
      setAbsentDates(absentDatesArray);
      setMonthlyPresentCount(countPresent);
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      console.log('Error details:', error.response?.data || error.message);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing dashboard data...');
      try {
        await fetchData();
        await fetchStats();
        await fetchAttendanceHistory();
        await fetchLeaves();
        
        // Debug after all data is loaded
        setTimeout(debugData, 1000);
      } catch (error) {
        console.error('❌ Error initializing data:', error);
      }
    };
    
    initializeData();
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
      await axios.post('/attendance/in', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setTimer(0);
      setIsRunning(true);
      setMarkedDates(prev => [...prev, key]);
      toast.success("🟢 Clocked IN successfully!");
      
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
      <button 
        onClick={debugData}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: '#ff4444',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        Debug Data
      </button>

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
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

      <div className="dashboard-content">
        <div className="left-column">
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
          </div>

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
              <div className="legend-item">
                <div className="legend-color today"></div>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <MdToday size={24} className="stat-icon" />
                <div className="stat-value">{monthlyPresentCount}</div>
                <div className="stat-label">Present</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <FiTrendingUp size={24} className="stat-icon" />
                <div className="stat-value">{attendanceRate}%</div>
                <div className="stat-label">Attendance</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <FiAward size={24} className="stat-icon" />
                <div className="stat-value">{leaveDates.length}</div>
                <div className="stat-label">Leaves</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <MdAccessTime size={24} className="stat-icon" />
                <div className="stat-value">{absentDates.length}</div>
                <div className="stat-label">Absent</div>
              </div>
            </div>
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
            </div>
          </div>
    
          {/* ✅ CORRECTED Recent Activity Section */}
          <div className="activity-card">
            <div className="activity-header">
              <h3>Recent Activities</h3>
              <button 
                onClick={handleRefreshTasks}
                className="refresh-btn"
                disabled={tasksLoading}
              >
                <FiRefreshCw size={16} className={tasksLoading ? 'spinning' : ''} />
                {tasksLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="activity-list">
              {tasksLoading ? (
                <div className="loading-state">
                  <p>Loading activities...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button onClick={handleRefreshTasks} className="retry-btn">
                    Try Again
                  </button>
                </div>
              ) : recentTasks.length > 0 ? (
                recentTasks.map((task, index) => {
                  const taskStatus = getTaskStatus(task);
                  return (
                    <div key={task._id || index} className="activity-item">
                      <div className="activity-item-header">
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
                          {task.description.length > 50 
                            ? `${task.description.substring(0, 50)}...` 
                            : task.description
                          }
                        </p>
                      )}
                      {index < recentTasks.length - 1 && (
                        <div className="activity-divider"></div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
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