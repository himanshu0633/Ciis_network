// UserDashboard.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserDashboard.css';
import useIsMobile from '../../hooks/useIsMobile';

import {
  FiClock, FiCalendar, FiChevronLeft, FiChevronRight,
  FiPlay, FiSquare, FiRefreshCw, FiBriefcase, FiUser,
  FiCheckCircle, FiAlertCircle, FiTrendingUp, FiActivity,
  FiX, FiAlertTriangle
} from 'react-icons/fi';
import {
  MdWork, MdOutlineCrop54, MdBeachAccess,
  MdOutlineWatchLater, MdToday, MdAccessTime, MdOutlineAlarm
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
  const navigate = useNavigate();
  
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState({
    attendance: false,
    leaves: false,
    status: false,
    jobRoles: false
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [jobRolesLoading, setJobRolesLoading] = useState(false);
  
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [userJoinDate, setUserJoinDate] = useState(null);
  const [formattedJoinDate, setFormattedJoinDate] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Get user data from localStorage
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  const token = useMemo(() => localStorage.getItem('token'), []);
  
  const companyDetails = useMemo(() => {
    try {
      const details = localStorage.getItem('companyDetails');
      return details ? JSON.parse(details) : null;
    } catch {
      return null;
    }
  }, []);

  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Refs to prevent infinite loops
  const fetchInProgress = useRef({
    attendance: false,
    leaves: false,
    status: false,
    jobRoles: false
  });

  const abortControllerRef = useRef(null);
  const attendanceTimeoutRef = useRef(null);
  const leavesTimeoutRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const initialLoadRef = useRef(false);

  // Parse user's creation date
  useEffect(() => {
    if (user?.createdAt) {
      const joinDate = new Date(user.createdAt);
      setUserJoinDate(joinDate);
      
      const formatted = joinDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      setFormattedJoinDate(formatted);
    }
  }, [user?.createdAt]);

  const getCompanyId = useCallback(() => {
    return companyDetails?._id || 
           companyDetails?.id ||
           user?.company ||
           user?.companyId ||
           user?.companyDetails?._id;
  }, [companyDetails, user]);

  const isUserInCurrentCompany = useMemo(() => {
    if (!user || !companyDetails) return false;
    const userCompanyCode = user.companyCode || user?.company?.companyCode;
    const companyCode = companyDetails.companyCode;
    return userCompanyCode === companyCode;
  }, [user, companyDetails]);

  const isBeforeJoinDate = useCallback((date) => {
    if (!userJoinDate) return false;
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const joinDate = new Date(userJoinDate);
    joinDate.setHours(0, 0, 0, 0);
    return compareDate < joinDate;
  }, [userJoinDate]);

  const isMonthBeforeJoin = useCallback((year, month) => {
    if (!userJoinDate) return false;
    const joinYear = userJoinDate.getFullYear();
    const joinMonth = userJoinDate.getMonth();
    if (year < joinYear) return true;
    if (year === joinYear && month < joinMonth) return true;
    return false;
  }, [userJoinDate]);

  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    [attendanceTimeoutRef, leavesTimeoutRef, statusTimeoutRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  }, []);

  // Fetch job roles
  const fetchJobRoles = useCallback(async () => {
    if (!isUserInCurrentCompany) return [];
    if (fetchInProgress.current.jobRoles) return [];
    
    const companyId = getCompanyId();
    if (!companyId) return [];
    
    setJobRolesLoading(true);
    fetchInProgress.current.jobRoles = true;
    
    try {
      const response = await axios.get(`/job-roles?company=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      let jobRolesData = [];
      if (response.data) {
        if (Array.isArray(response.data.jobRoles)) jobRolesData = response.data.jobRoles;
        else if (Array.isArray(response.data.data)) jobRolesData = response.data.data;
        else if (Array.isArray(response.data)) jobRolesData = response.data;
      }
      
      const formattedJobRoles = jobRolesData.map(role => ({
        _id: role._id || role.id || role.roleId || 'employee',
        roleName: role.roleName || role.name || role.jobRole || role.title || 'Employee',
        roleNumber: role.roleNumber || role.roleNo || role.code || 'N/A',
      }));
      
      setJobRoles(formattedJobRoles.length ? formattedJobRoles : [
        { _id: 'employee', roleName: 'Employee', roleNumber: 'EMP001' }
      ]);
      
    } catch (error) {
      console.error('Job roles fetch error:', error);
      setJobRoles([{ _id: 'employee', roleName: 'Employee', roleNumber: 'EMP001' }]);
    } finally {
      setJobRolesLoading(false);
      fetchInProgress.current.jobRoles = false;
    }
  }, [getCompanyId, token, isUserInCurrentCompany]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async (force = false) => {
    if (!isUserInCurrentCompany) return;
    if (!force && fetchInProgress.current.attendance) return;
    
    if (attendanceTimeoutRef.current) {
      clearTimeout(attendanceTimeoutRef.current);
    }

    attendanceTimeoutRef.current = setTimeout(async () => {
      if (fetchInProgress.current.attendance) return;
      
      fetchInProgress.current.attendance = true;
      setLoading(prev => ({ ...prev, attendance: true }));

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.get('/attendance/list', {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
          timeout: 15000
        });
        
        let data = response.data?.data || [];
        
        if (userJoinDate) {
          data = data.filter(record => !isBeforeJoinDate(record.date));
        }
        
        setAttendanceData(data);
        setRecentActivity([...data].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
        
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to load attendance data:', error);
      } finally {
        setLoading(prev => ({ ...prev, attendance: false }));
        fetchInProgress.current.attendance = false;
        attendanceTimeoutRef.current = null;
      }
    }, 300);

  }, [token, isUserInCurrentCompany, userJoinDate, isBeforeJoinDate]);

  // Fetch leave data
  const fetchLeaveData = useCallback(async () => {
    if (!isUserInCurrentCompany) return;
    if (fetchInProgress.current.leaves) return;
    
    if (leavesTimeoutRef.current) {
      clearTimeout(leavesTimeoutRef.current);
    }

    leavesTimeoutRef.current = setTimeout(async () => {
      if (fetchInProgress.current.leaves) return;
      
      fetchInProgress.current.leaves = true;
      setLoading(prev => ({ ...prev, leaves: true }));

      try {
        const response = await axios.get('/leaves/status', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        
        let leaves = response.data?.leaves || [];
        
        if (userJoinDate) {
          leaves = leaves.filter(leave => 
            !isBeforeJoinDate(leave.startDate) && !isBeforeJoinDate(leave.endDate)
          );
        }
        
        setLeaveData(leaves);
        
      } catch (error) {
        console.error('Failed to load leave data:', error);
      } finally {
        setLoading(prev => ({ ...prev, leaves: false }));
        fetchInProgress.current.leaves = false;
        leavesTimeoutRef.current = null;
      }
    }, 300);

  }, [token, isUserInCurrentCompany, userJoinDate, isBeforeJoinDate]);

  // Fetch current status
  const fetchCurrentStatus = useCallback(async () => {
    if (!isUserInCurrentCompany) {
      setIsRunning(false);
      return;
    }
    
    if (fetchInProgress.current.status) return;
    
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }

    statusTimeoutRef.current = setTimeout(async () => {
      if (fetchInProgress.current.status) return;
      
      fetchInProgress.current.status = true;
      setLoading(prev => ({ ...prev, status: true }));

      try {
        const response = await axios.get('/attendance/status', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        
        if (response.data?.isClockedIn) {
          const inTime = new Date(response.data.inTime);
          setTimer(Math.floor((Date.now() - inTime.getTime()) / 1000));
          setIsRunning(true);
        } else {
          setIsRunning(false);
          setTimer(0);
        }
        
      } catch (error) {
        console.error('Failed to load status:', error);
        setIsRunning(false);
        setTimer(0);
      } finally {
        setLoading(prev => ({ ...prev, status: false }));
        fetchInProgress.current.status = false;
        statusTimeoutRef.current = null;
      }
    }, 300);

  }, [token, isUserInCurrentCompany]);

  // Load initial data - ONLY ONCE
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (!isUserInCurrentCompany) return;
    
    initialLoadRef.current = true;
    
    const loadData = async () => {
      cancelPendingRequests();
      await fetchJobRoles();
      
      setTimeout(() => fetchAttendanceData(true), 100);
      setTimeout(() => fetchLeaveData(), 200);
      setTimeout(() => {
        fetchCurrentStatus();
        setInitialLoadDone(true);
      }, 300);
    };
    
    loadData();
    
    return () => cancelPendingRequests();
  }, []); // Empty dependency array - runs once

  // Timer effect
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPendingRequests();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cancelPendingRequests]);

  const getJobRoleDisplayName = useCallback(() => {
    if (jobRolesLoading) return 'Loading...';
    if (!jobRoles.length) return 'Employee';
    
    const userJobRole = user?.jobRole;
    if (!userJobRole) return 'Employee';
    
    const foundRole = jobRoles.find(role => 
      role._id === userJobRole || 
      role.roleNumber === userJobRole ||
      role.roleName === userJobRole
    );
    
    return foundRole?.roleName || 'Employee';
  }, [jobRoles, jobRolesLoading, user?.jobRole]);

  const filteredAttendanceData = useMemo(() => {
    if (!userJoinDate) return attendanceData;
    return attendanceData.filter(record => !isBeforeJoinDate(record.date));
  }, [attendanceData, userJoinDate, isBeforeJoinDate]);

  const filteredLeaveData = useMemo(() => {
    if (!userJoinDate) return leaveData;
    return leaveData.filter(leave => 
      !isBeforeJoinDate(leave.startDate) && !isBeforeJoinDate(leave.endDate)
    );
  }, [leaveData, userJoinDate, isBeforeJoinDate]);

  const markedDates = useMemo(() => {
    return filteredAttendanceData
      .filter(record => record.status === 'PRESENT')
      .map(record => `${new Date(record.date).getFullYear()}-${new Date(record.date).getMonth()}-${new Date(record.date).getDate()}`);
  }, [filteredAttendanceData]);

  const lateDates = useMemo(() => {
    return filteredAttendanceData
      .filter(record => record.status === 'LATE')
      .map(record => `${new Date(record.date).getFullYear()}-${new Date(record.date).getMonth()}-${new Date(record.date).getDate()}`);
  }, [filteredAttendanceData]);

  const halfDayDates = useMemo(() => {
    return filteredAttendanceData
      .filter(record => record.status === 'HALF DAY')
      .map(record => `${new Date(record.date).getFullYear()}-${new Date(record.date).getMonth()}-${new Date(record.date).getDate()}`);
  }, [filteredAttendanceData]);

  const absentDates = useMemo(() => {
    return filteredAttendanceData
      .filter(record => record.status === 'ABSENT')
      .map(record => `${new Date(record.date).getFullYear()}-${new Date(record.date).getMonth()}-${new Date(record.date).getDate()}`);
  }, [filteredAttendanceData]);

  const leaveDates = useMemo(() => {
    const dates = [];
    filteredLeaveData.forEach(leave => {
      if (leave.status === 'APPROVED' || leave.status === 'Approved') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const current = new Date(start);
        
        while (current <= end) {
          if (!isBeforeJoinDate(current)) {
            dates.push(`${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`);
          }
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return [...new Set(dates)];
  }, [filteredLeaveData, isBeforeJoinDate]);

  const monthlyStats = useMemo(() => {
    const presentDays = filteredAttendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && record.status === 'PRESENT';
    }).length;

    const lateDays = filteredAttendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && record.status === 'LATE';
    }).length;

    const halfDays = filteredAttendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && record.status === 'HALF DAY';
    }).length;

    const absentDays = filteredAttendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && record.status === 'ABSENT';
    }).length;

    const leavesTaken = leaveDates.filter(dateStr => {
      const [year, month] = dateStr.split('-').map(Number);
      return month === currentMonth && year === currentYear;
    }).length;

    return { presentDays, lateDays, halfDays, absentDays, leavesTaken };
  }, [filteredAttendanceData, leaveDates, currentMonth, currentYear]);

  const getDayStatus = useCallback((day) => {
    if (!day) return null;
    
    const dateObj = new Date(calendarYear, calendarMonth, day);
    const key = `${calendarYear}-${calendarMonth}-${day}`;
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isBeforeJoinDate(dateObj)) return "before-join";
    if (markedDates.includes(key)) return "present";
    if (lateDates.includes(key)) return "late";
    if (halfDayDates.includes(key)) return "halfday";
    if (leaveDates.includes(key)) return "leave";
    if (absentDates.includes(key)) return "absent";
    if (isWeekend) return "weekend";
    
    return null;
  }, [calendarYear, calendarMonth, isBeforeJoinDate, markedDates, lateDates, halfDayDates, leaveDates, absentDates]);

  const isToday = useCallback((day) => {
    return day === currentDate.getDate() && 
           calendarMonth === currentDate.getMonth() && 
           calendarYear === currentDate.getFullYear();
  }, [currentDate, calendarMonth, calendarYear]);

  const getDayIcon = useCallback((day) => {
    const status = getDayStatus(day);
    switch(status) {
      case 'present': return '✓';
      case 'late': return 'L';
      case 'halfday': return '½';
      case 'leave': return 'L';
      case 'absent': return '✗';
      case 'weekend': return '⚭';
      default: return '';
    }
  }, [getDayStatus]);

  const handleIn = async () => {
    if (!isUserInCurrentCompany || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await axios.post('/attendance/in', {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      setIsRunning(true);
      setTimer(5);
      toast.success('Clocked in successfully!');
      
      setTimeout(() => {
        fetchCurrentStatus();
        fetchAttendanceData(true);
      }, 500);
      
    } catch (error) {
      toast.error('Clock-in failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (!isUserInCurrentCompany || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await axios.post("/attendance/out", {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      setIsRunning(false);
      setShowClockOutConfirm(false);
      toast.success("Clocked out successfully!");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("companyDetails");
      delete axios.defaults.headers.common["Authorization"];
      
      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      toast.error("Clock-out failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrevMonth = useCallback(() => {
    if (calendarMonth === 0) {
      const prevYear = calendarYear - 1;
      if (isMonthBeforeJoin(prevYear, 11)) {
        toast.info('Cannot view months before your joining date');
        return;
      }
      setCalendarYear(prevYear);
      setCalendarMonth(11);
    } else {
      if (isMonthBeforeJoin(calendarYear, calendarMonth - 1)) {
        toast.info('Cannot view months before your joining date');
        return;
      }
      setCalendarMonth(prev => prev - 1);
    }
  }, [calendarMonth, calendarYear, isMonthBeforeJoin]);

  const handleNextMonth = useCallback(() => {
    if (calendarMonth === 11) {
      setCalendarYear(prev => prev + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  }, [calendarMonth]);

  const resetToCurrentMonth = useCallback(() => {
    setCalendarMonth(currentDate.getMonth());
    setCalendarYear(currentDate.getFullYear());
  }, [currentDate]);

  const handleRefresh = useCallback(() => {
    if (loading.attendance) return;
    fetchAttendanceData(true);
  }, [loading.attendance, fetchAttendanceData]);

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case 'PRESENT': return 'status-present';
      case 'LATE': return 'status-late';
      case 'HALF DAY': return 'status-halfday';
      case 'ABSENT': return 'status-absent';
      default: return 'status-default';
    }
  }, []);

  const calendarDays = useMemo(() => getCalendarGrid(calendarYear, calendarMonth), [calendarYear, calendarMonth]);
  const isMobile = useIsMobile();
  const userJobRoleDisplay = getJobRoleDisplayName();

  // Don't render if not authenticated
  if (!user || !token) {
    navigate('/login');
    return null;
  }

  if (!isUserInCurrentCompany) {
    return (
      <div className="dashboard-container">
        <div className="access-denied-message">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You do not have access to this company's dashboard.</p>
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
          This dashboard does not work on mobile devices. <br /><br />
          Please use a Desktop or Laptop for the best experience
        </h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" pauseOnHover />
      
      {showClockOutConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-popup">
            <button className="confirmation-close-btn" onClick={() => setShowClockOutConfirm(false)} disabled={isProcessing}>
              <FiX size={20} />
            </button>
            <h3 className="confirmation-title">Confirm Clock Out</h3>
            <p className="confirmation-message">
              Are you sure you want to clock out? 
              <br />
              <span className="confirmation-warning">This will log you out of the system.</span>
            </p>
            <div className="confirmation-timer">
              <FiClock size={16} />
              <span>Current session: {formatTime(timer)}</span>
            </div>
            <div className="confirmation-buttons">
              <button className="confirmation-btn confirmation-btn-cancel" onClick={() => setShowClockOutConfirm(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button className="confirmation-btn confirmation-btn-confirm" onClick={handleClockOut} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm Clock Out'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-user-details">
            <h1 className="dashboard-user-name">Welcome back, {user?.name || 'User'}</h1>
            <p className="dashboard-user-welcome">
              {new Date().getHours() < 12 ? 'Good morning! Let\'s make today count.' :
               new Date().getHours() < 18 ? 'Good afternoon! Stay focused and productive.' :
               'Good evening! Wrapping up strong.'}
            </p>
            <div className="dashboard-user-tags">
              <span className="dashboard-tag dashboard-tag-role">
                <FiBriefcase size={14} /> {userJobRoleDisplay}
              </span>
              <span className="dashboard-tag dashboard-tag-type">
                <FiUser size={14} /> {user?.employeeType || 'Full-time'}
              </span>
              <span className="dashboard-tag dashboard-tag-company">
                <FiBriefcase size={14} /> {companyDetails?.companyName || 'Company'}
              </span>
            </div>
            <div className="dashboard-date-info">
              <MdToday size={14} />
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {/* {userJoinDate && (
              <div className="dashboard-join-info">
                <FiClock size={14} />
                <span>Joined on: {formattedJoinDate}</span>
              </div>
            )} */}
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
                disabled={isRunning || loading.attendance || !isUserInCurrentCompany || isProcessing}
                className={`dashboard-btn dashboard-btn-clockin ${isRunning ? 'btn-disabled' : ''}`}
              >
                <FiPlay size={20} /> Clock In
              </button>
              <button
                onClick={() => setShowClockOutConfirm(true)}
                disabled={!isRunning || loading.attendance || !isUserInCurrentCompany || isProcessing}
                className={`dashboard-btn dashboard-btn-clockout ${!isRunning ? 'btn-disabled' : ''}`}
              >
                <FiSquare size={20} /> Clock Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card stat-card-present">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-present"><MdWork className="stat-icon" /></div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.presentDays}</div>
          <div className="stat-label">Days Present</div>
          <div className="stat-footer">
            <FiTrendingUp className="stat-trend-icon" />
            <span className="stat-month-text">Tracked in {monthNames[currentMonth]}</span>
          </div>
        </div>

        <div className="dashboard-stat-card stat-card-late">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-late"><MdOutlineAlarm className="stat-icon" /></div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.lateDays}</div>
          <div className="stat-label">Late Days</div>
          <div className="stat-footer">
            <FiAlertTriangle className="stat-trend-icon" />
            <span className="stat-month-text">Tracked in {monthNames[currentMonth]}</span>
          </div>
        </div>

        <div className="dashboard-stat-card stat-card-halfday">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-halfday"><MdOutlineCrop54 className="stat-icon" /></div>
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
            <div className="stat-icon-container icon-leave"><MdBeachAccess className="stat-icon" /></div>
            <div className="stat-current-month">Current Month</div>
          </div>
          <div className="stat-value">{monthlyStats.leavesTaken}</div>
          <div className="stat-label">Leaves Taken</div>
          <div className="stat-footer">
            <FiCheckCircle className="stat-trend-icon" />
            <span className="stat-month-text">Approved in {monthNames[currentMonth]}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-calendar-card">
          <div className="calendar-header">
            <div className="calendar-title-section">
              <div className="calendar-icon-container"><FiCalendar className="calendar-icon" /></div>
              <div>
                <h2 className="calendar-title">{monthNames[calendarMonth]} {calendarYear}</h2>
                <p className="calendar-subtitle">Attendance Calendar</p>
              </div>
            </div>
            <div className="calendar-controls">
              <button onClick={handlePrevMonth} className="calendar-nav-btn" disabled={isMonthBeforeJoin(calendarYear, calendarMonth)}>
                <FiChevronLeft className="nav-icon" />
              </button>
              <button onClick={resetToCurrentMonth} className="calendar-today-btn">Today</button>
              <button onClick={handleNextMonth} className="calendar-nav-btn">
                <FiChevronRight className="nav-icon" />
              </button>
            </div>
          </div>

          {isMonthBeforeJoin(calendarYear, calendarMonth) && (
            <div className="calendar-before-join-message">
              <FiClock size={16} />
              <span>You joined on {formattedJoinDate}. No attendance records before this date.</span>
            </div>
          )}

          <div className="calendar-body">
            <div className="calendar-week-header">
              {daysOfWeek.map(day => <div key={day} className="calendar-day-header">{day}</div>)}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="calendar-week">
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} className="calendar-day-wrapper">
                      {day ? (
                        <div className="calendar-day-container">
                          <div
                            className={`calendar-day ${getDayStatus(day) || 'empty'} ${isToday(day) ? 'day-today' : ''}`}
                            title={isBeforeJoinDate(new Date(calendarYear, calendarMonth, day)) 
                              ? 'Before joining date' 
                              : getDayStatus(day)?.charAt(0).toUpperCase() + getDayStatus(day)?.slice(1) || 'No Record'}
                          >
                            <span className="day-number">{day}</span>
                            {getDayIcon(day) && <span className="day-status-icon">{getDayIcon(day)}</span>}
                          </div>
                          {isToday(day) && <div className="today-indicator"></div>}
                        </div>
                      ) : <div className="calendar-empty-day"></div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item"><div className="legend-color color-present"></div><span>Present</span></div>
            <div className="legend-item"><div className="legend-color color-late"></div><span>Late</span></div>
            <div className="legend-item"><div className="legend-color color-halfday"></div><span>Half Day</span></div>
            <div className="legend-item"><div className="legend-color color-leave"></div><span>Leave</span></div>
            <div className="legend-item"><div className="legend-color color-absent"></div><span>Absent</span></div>
            <div className="legend-item"><div className="legend-color color-weekend"></div><span>Weekend</span></div>
            <div className="legend-item"><div className="legend-color color-before-join"></div><span>Before Joining</span></div>
          </div>
        </div>

        <div className="dashboard-activity-card">
          <div className="activity-header">
            <div className="activity-title-section">
              <div className="activity-icon-container"><MdOutlineWatchLater className="activity-icon" /></div>
              <div>
                <h2 className="activity-title">Recent Activity</h2>
                <p className="activity-subtitle">Latest attendance records</p>
              </div>
            </div>
            <button onClick={handleRefresh} disabled={loading.attendance} className="activity-refresh-btn">
              <FiRefreshCw className={`refresh-icon ${loading.attendance ? 'spinning' : ''}`} />
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
                      {record.status === 'LATE' && <FiAlertTriangle className="status-icon" />}
                      {record.status === 'HALF DAY' && <FiAlertCircle className="status-icon" />}
                      {record.status === 'ABSENT' && <FiAlertCircle className="status-icon" />}
                      {!['PRESENT', 'LATE', 'HALF DAY', 'ABSENT'].includes(record.status) && <FiClock className="status-icon" />}
                    </div>
                    <div className="activity-details">
                      <div className="activity-date">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {isCurrentMonth && <span className="current-month-badge">Current Month</span>}
                      </div>
                      <div className="activity-time">
                        <MdAccessTime size={12} /> {record.totalTime || '--:--:--'}
                      </div>
                    </div>
                  </div>
                  <div className={`activity-status ${getStatusColor(record.status)}`}>{record.status}</div>
                </div>
              );
            })}
            
            {!recentActivity.length && !loading.attendance && (
              <div className="activity-empty-state">
                <div className="empty-icon-container"><FiClock className="empty-icon" /></div>
                <p className="empty-title">No attendance records found</p>
                <p className="empty-subtitle">
                  {userJoinDate ? `You joined on ${formattedJoinDate}. Records will appear after this date.` : 'Your attendance records will appear here'}
                </p>
              </div>
            )}
            
            {loading.attendance && (
              <div className="activity-loading-state">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading records...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-month-info">
        <div className="month-info-content">
          <div className="month-info-left">
            <div className="month-info-title">
              <div className="month-info-icon"><FiCalendar /></div>
              <h3>Current Month: {monthNames[currentMonth]} {currentYear}</h3>
            </div>
            <p className="month-info-description">
              Stats show only this month's data. Calendar displays complete attendance history from your join date.
              {userJoinDate && <span className="month-info-note"> Dates before {formattedJoinDate} are shown in white.</span>}
            </p>
          </div>
          <div className="month-info-right">
            <div className="month-current-day">{new Date().getDate()}</div>
            <div className="month-current-info">{monthNames[currentMonth].substring(0, 3)} • Today</div>
            <div className="month-day-count">Day {currentDate.getDate()} of {new Date(currentYear, currentMonth + 1, 0).getDate()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;