import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserDashboard.css';
import useIsMobile from '../../hooks/useIsMobile';

import NewYearPopup from '../../components/NewYearPopup';
import {
  FiClock, FiCalendar, FiChevronLeft, FiChevronRight,
  FiPlay, FiSquare, FiRefreshCw, FiBriefcase, FiUser,
  FiCheckCircle, FiAlertCircle, FiTrendingUp, FiActivity,
  FiX
} from 'react-icons/fi';
import {
  MdWork, MdOutlineCrop54, MdBeachAccess, MdSick,
  MdOutlineWatchLater, MdToday, MdAccessTime
} from 'react-icons/md';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatTime = seconds => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
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
  while (week.length && week.length < 7) week.push(null);
  if (week.length) grid.push(week);

  return grid;
};

const UserDashboard = () => {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // State for confirmation popup
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const markedDates = useMemo(() => {
    return attendanceData
      .filter(record => record.status === 'PRESENT')
      .map(record => {
        const d = new Date(record.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      });
  }, [attendanceData]);

  const halfDayDates = useMemo(() => {
    return attendanceData
      .filter(record => record.status === 'HALF DAY')
      .map(record => {
        const d = new Date(record.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      });
  }, [attendanceData]);

  const absentDates = useMemo(() => {
    return attendanceData
      .filter(record => record.status === 'ABSENT')
      .map(record => {
        const d = new Date(record.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      });
  }, [attendanceData]);

  const leaveDates = useMemo(() => {
    const dates = [];
    leaveData.forEach(leave => {
      if (leave.status === 'APPROVED' || leave.status === 'Approved') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const current = new Date(start);
        
        while (current <= end) {
          dates.push(`${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`);
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return [...new Set(dates)];
  }, [leaveData]);

  const monthlyStats = useMemo(() => {
    const presentDays = attendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear && 
             record.status === 'PRESENT';
    }).length;

    const halfDays = attendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear && 
             record.status === 'HALF DAY';
    }).length;

    const absentDays = attendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear && 
             record.status === 'ABSENT';
    }).length;

    const leavesTaken = leaveDates.filter(dateStr => {
      const [year, month] = dateStr.split('-').map(Number);
      return month === currentMonth && year === currentYear;
    }).length;

    return {
      presentDays,
      halfDays,
      absentDays,
      leavesTaken
    };
  }, [attendanceData, leaveDates, currentMonth, currentYear]);

  const getDayStatus = (day) => {
    if (!day) return null;
    
    const dateObj = new Date(calendarYear, calendarMonth, day);
    const key = `${calendarYear}-${calendarMonth}-${day}`;
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (markedDates.includes(key)) return "present";
    if (halfDayDates.includes(key)) return "halfday";
    if (leaveDates.includes(key)) return "leave";
    if (absentDates.includes(key)) return "absent";
    if (isWeekend) return "weekend";
    
    return null;
  };

  const isToday = (day) => {
    return day === currentDate.getDate() && 
           calendarMonth === currentDate.getMonth() && 
           calendarYear === currentDate.getFullYear();
  };

  const getDayIcon = (day) => {
    const status = getDayStatus(day);
    switch(status) {
      case 'present': return '✓';
      case 'halfday': return '½';
      case 'leave': return 'L';
      case 'absent': return '✗';
      case 'weekend': return '⚭';
      default: return '';
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/attendance/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data?.data || [];
      setAttendanceData(data);
      
      const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(sortedData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveData = async () => {
    try {
      const response = await axios.get('/leaves/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveData(response.data?.leaves || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchCurrentStatus = async () => {
    try {
      const response = await axios.get('/attendance/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.isClockedIn) {
        const inTime = new Date(response.data.inTime);
        setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleIn = async () => {
    try {
      await axios.post('/attendance/in', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsRunning(true);
      setTimer(0);
      toast.success('Clocked in successfully!');
      
      await fetchCurrentStatus();
      await fetchAttendanceData();
    } catch (error) {
      console.error('Clock-in error:', error);
      toast.error('Clock-in failed');
    }
  };

  const confirmClockOut = () => {
    setShowClockOutConfirm(true);
  };

  const cancelClockOut = () => {
    setShowClockOutConfirm(false);
  };

  const handleClockOut = async () => {
    try {
      setIsProcessing(true);
      await axios.post(
        "/attendance/out",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsRunning(false);
      setShowClockOutConfirm(false);
      toast.success("Clocked out successfully!");

      // Clear auth data (LOGOUT)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optional: clear axios default header
      delete axios.defaults.headers.common["Authorization"];

      // Small delay so toast is visible
      setTimeout(() => {
        window.location.href = "/login"; // or use navigate("/login") if using react-router
      }, 1200);

    } catch (error) {
      console.error("Clock-out error:", error);
      toast.error("Clock-out failed");
      setIsProcessing(false);
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 0) {
        setCalendarYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 11) {
        setCalendarYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const resetToCurrentMonth = () => {
    setCalendarMonth(currentDate.getMonth());
    setCalendarYear(currentDate.getFullYear());
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return 'status-present';
      case 'HALF DAY': return 'status-halfday';
      case 'ABSENT': return 'status-absent';
      default: return 'status-default';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAttendanceData();
      await fetchLeaveData();
      await fetchCurrentStatus();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px"
      }}>
        <h2>
          😄 Hi {user?.name || "User"}, <br /><br />
          This dashboard does not work on mobile devices.  
          Even your phone agrees: "Sorry, not my job." <br /><br />
          Please use a Desktop or Laptop  
          for the best and complete experience
        </h2>
      </div>
    );
  }

  return (
    <div className="App">
      <NewYearPopup />
    </div>,
    <div className="dashboard-container">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="colored"
        pauseOnHover
      />
      
      {/* Clock Out Confirmation Popup */}
      {showClockOutConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-popup">
            <button 
              className="confirmation-close-btn"
              onClick={cancelClockOut}
              disabled={isProcessing}
            >
              <FiX size={20} />
            </button>
            
            
            <h3 className="confirmation-title">Confirm Clock Out</h3>
            
            <p className="confirmation-message">
              Are you sure you want to clock out? 
              <br />
              <span className="confirmation-warning">
                This will log you out of the system.
              </span>
            </p>
            
            <div className="confirmation-timer">
              <FiClock size={16} />
              <span>Current session: {formatTime(timer)}</span>
            </div>
            
            <div className="confirmation-buttons">
              <button
                className="confirmation-btn confirmation-btn-cancel"
                onClick={cancelClockOut}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="confirmation-btn confirmation-btn-confirm"
                onClick={handleClockOut}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Clock Out'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-user-details">
            <h1 className="dashboard-user-name">
              Welcome back, {user?.name || 'User'}
            </h1>

            <p className="dashboard-user-welcome">
              {new Date().getHours() < 12
                ? 'Good morning! Let\'s make today count.'
                : new Date().getHours() < 18
                ? 'Good afternoon! Stay focused and productive.'
                : 'Good evening! Wrapping up strong.'}
            </p>

            <div className="dashboard-user-tags">
              <span className="dashboard-tag dashboard-tag-role">
                <FiBriefcase size={14} />
                {user?.role || 'Employee'}
              </span>
              <span className="dashboard-tag dashboard-tag-type">
                <FiUser size={14} />
                {user?.employeeType || 'Full-time'}
              </span>
            </div>

            <div className="dashboard-date-info">
              <MdToday size={14} />
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="dashboard-clock-section">
            <div className="dashboard-timer-display">
              <div className="dashboard-timer-value">{formatTime(timer)}</div>
              <div className={`dashboard-timer-status ${isRunning ? 'status-active-text' : 'status-inactive-text'}`}>
                <div className={`dashboard-timer-dot ${isRunning ? 'dot-active' : 'dot-inactive'}`}></div>
                {isRunning ? 'Active Timer • Live' : 'Timer Stopped'}
              </div>
            </div>
            
            <div className="dashboard-clock-buttons">
              <button
                onClick={handleIn}
                disabled={isRunning || loading}
                className={`dashboard-btn dashboard-btn-clockin ${isRunning ? 'btn-disabled' : ''}`}
              >
                <FiPlay size={20} />
                Clock In
              </button>
              <button
                onClick={confirmClockOut}
                disabled={!isRunning || loading}
                className={`dashboard-btn dashboard-btn-clockout ${!isRunning ? 'btn-disabled' : ''}`}
              >
                <FiSquare size={20} />
                Clock Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Month Stats */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card stat-card-present">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-present">
              <MdWork className="stat-icon" />
            </div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.presentDays}</div>
          <div className="stat-label">Days Present</div>
          <div className="stat-footer">
            <FiTrendingUp className="stat-trend-icon" />
            <span className="stat-month-text">Tracked in {monthNames[currentMonth]}</span>
          </div>
        </div>

        <div className="dashboard-stat-card stat-card-halfday">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-halfday">
              <MdOutlineCrop54 className="stat-icon" />
            </div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.halfDays}</div>
          <div className="stat-label">Half Days</div>
          <div className="stat-footer">
            <FiActivity className="stat-trend-icon" />
            <span className="stat-month-text">Tracked in {monthNames[currentMonth]}</span>
          </div>
        </div>

        <div className="dashboard-stat-card stat-card-leave">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-leave">
              <MdBeachAccess className="stat-icon" />
            </div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.leavesTaken}</div>
          <div className="stat-label">Leaves Taken</div>
          <div className="stat-footer">
            <FiCheckCircle className="stat-trend-icon" />
            <span className="stat-month-text">Approved in {monthNames[currentMonth]}</span>
          </div>
        </div>

        <div className="dashboard-stat-card stat-card-absent">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-absent">
              <MdSick className="stat-icon" />
            </div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.absentDays}</div>
          <div className="stat-label">Absent Days</div>
          <div className="stat-footer">
            <FiAlertCircle className="stat-trend-icon" />
            <span className="stat-month-text">Tracked in {monthNames[currentMonth]}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Calendar */}
        <div className="dashboard-calendar-card">
          <div className="calendar-header">
            <div className="calendar-title-section">
              <div className="calendar-icon-container">
                <FiCalendar className="calendar-icon" />
              </div>
              <div>
                <h2 className="calendar-title">
                  {monthNames[calendarMonth]} {calendarYear}
                </h2>
                <p className="calendar-subtitle">Attendance Calendar</p>
              </div>
            </div>
            
            <div className="calendar-controls">
              <button
                onClick={handlePrevMonth}
                className="calendar-nav-btn"
              >
                <FiChevronLeft className="nav-icon" />
              </button>
              <button
                onClick={resetToCurrentMonth}
                className="calendar-today-btn"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="calendar-nav-btn"
              >
                <FiChevronRight className="nav-icon" />
              </button>
            </div>
          </div>

          <div className="calendar-body">
            <div className="calendar-week-header">
              {daysOfWeek.map(day => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="calendar-week">
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} className="calendar-day-wrapper">
                      {day ? (
                        <div className="calendar-day-container">
                          <div
                            className={`calendar-day ${
                              getDayStatus(day) || 'empty'
                            } ${isToday(day) ? 'day-today' : ''}`}
                            title={getDayStatus(day)?.charAt(0).toUpperCase() + getDayStatus(day)?.slice(1) || 'No Record'}
                          >
                            <span className="day-number">{day}</span>
                            {getDayIcon(day) && (
                              <span className="day-status-icon">{getDayIcon(day)}</span>
                            )}
                          </div>
                          {isToday(day) && (
                            <div className="today-indicator"></div>
                          )}
                        </div>
                      ) : (
                        <div className="calendar-empty-day"></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color color-present"></div>
              <span>Present</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-halfday"></div>
              <span>Half Day</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-leave"></div>
              <span>Leave</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-absent"></div>
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-weekend"></div>
              <span>Weekend</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-activity-card">
          <div className="activity-header">
            <div className="activity-title-section">
              <div className="activity-icon-container">
                <MdOutlineWatchLater className="activity-icon" />
              </div>
              <div>
                <h2 className="activity-title">Recent Activity</h2>
                <p className="activity-subtitle">Latest attendance records</p>
              </div>
            </div>
            <button
              onClick={fetchAttendanceData}
              disabled={loading}
              className="activity-refresh-btn"
            >
              <FiRefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
            </button>
          </div>

          <div className="activity-list">
            {recentActivity.map((record, index) => {
              const date = new Date(record.date);
              const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
              
              return (
                <div key={index} className="activity-item">
                  <div className="activity-item-content">
                    <div className={`activity-status-icon ${getStatusColor(record.status)}`}>
                      {record.status === 'PRESENT' && <FiCheckCircle className="status-icon" />}
                      {record.status === 'HALF DAY' && <FiAlertCircle className="status-icon" />}
                      {record.status === 'ABSENT' && <FiAlertCircle className="status-icon" />}
                      {!['PRESENT', 'HALF DAY', 'ABSENT'].includes(record.status) && <FiClock className="status-icon" />}
                    </div>
                    <div className="activity-details">
                      <div className="activity-date">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {isCurrentMonth && (
                          <span className="current-month-badge">Current Month</span>
                        )}
                      </div>
                      <div className="activity-time">
                        <MdAccessTime size={12} />
                        {record.totalTime || '--:--:--'}
                      </div>
                    </div>
                  </div>
                  <div className={`activity-status ${getStatusColor(record.status)}`}>
                    {record.status}
                  </div>
                </div>
              );
            })}
            
            {recentActivity.length === 0 && !loading && (
              <div className="activity-empty-state">
                <div className="empty-icon-container">
                  <FiClock className="empty-icon" />
                </div>
                <p className="empty-title">No attendance records found</p>
                <p className="empty-subtitle">Your attendance records will appear here</p>
              </div>
            )}
            
            {loading && (
              <div className="activity-loading-state">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading records...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Month Info */}
      <div className="dashboard-month-info">
        <div className="month-info-content">
          <div className="month-info-left">
            <div className="month-info-title">
              <div className="month-info-icon">
                <FiCalendar />
              </div>
              <h3>Current Month: {monthNames[currentMonth]} {currentYear}</h3>
            </div>
            <p className="month-info-description">
              Stats show only this month's data. Calendar displays complete attendance history. 
              <span className="month-info-note">Weekends with attendance show actual status color instead of gray.</span>
            </p>
          </div>
          <div className="month-info-right">
            <div className="month-current-day">{new Date().getDate()}</div>
            <div className="month-current-info">
              {monthNames[currentMonth].substring(0, 3)} • Today
            </div>
            <div className="month-day-count">
              Day {currentDate.getDate()} of {new Date(currentYear, currentMonth + 1, 0).getDate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;