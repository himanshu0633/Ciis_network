// UserDashboard.js - FULLY UPDATED WITH JOB ROLE INTEGRATION
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  MdWork, MdOutlineCrop54, MdBeachAccess, MdSick,
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
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [jobRolesLoading, setJobRolesLoading] = useState(false);
  
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');
  const companyDetails = localStorage.getItem('companyDetails') ? JSON.parse(localStorage.getItem('companyDetails')) : null;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getCompanyId = () => {
    const companyId = 
      companyDetails?._id || 
      companyDetails?.id ||
      user?.company ||
      user?.companyId ||
      user?.companyDetails?._id;
    
    console.log("🏢 Company ID:", {
      companyDetailsId: companyDetails?._id,
      userCompany: user?.company,
      finalCompanyId: companyId
    });
    
    return companyId;
  };

  // ✅ UPDATED: Enhanced Fetch Job Roles Function
  const fetchJobRoles = async () => {
    const companyId = getCompanyId();
    
    if (!companyId) {
      console.error("❌ No company ID found");
      toast.warning('Company information not found');
      return [];
    }
    
    setJobRolesLoading(true);
    
    try {
      console.log(`🌐 Fetching job roles for company: ${companyId}`);
      
      let jobRolesData = [];
      const endpoints = [
        `/job-roles?company=${companyId}`,
        `/job-roles?company=${companyId}`,
        `/api/job-roles`,
        `/job-roles`
      ];
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`✅ Success from ${endpoint}:`, response.data);
          
          if (response.data) {
            // Extract job roles from different possible response structures
            if (Array.isArray(response.data.jobRoles)) {
              jobRolesData = response.data.jobRoles;
            } else if (Array.isArray(response.data.data)) {
              jobRolesData = response.data.data;
            } else if (response.data.message && Array.isArray(response.data.message)) {
              jobRolesData = response.data.message;
            } else if (Array.isArray(response.data)) {
              jobRolesData = response.data;
            } else if (response.data.jobRole) {
              // Single job role object
              jobRolesData = [response.data.jobRole];
            }
            
            if (jobRolesData.length > 0) break; // Stop if we got data
          }
        } catch (error) {
          console.log(`⚠️ ${endpoint} failed:`, error.message);
          continue; // Try next endpoint
        }
      }
      
      console.log(`✅ Final job roles data: ${jobRolesData.length} roles`);
      
      // Format the job roles data
      const formattedJobRoles = jobRolesData.map(role => ({
        _id: role._id || role.id || role.roleId || Math.random().toString(36).substr(2, 9),
        roleName: role.roleName || role.name || role.jobRole || role.title || 'Unnamed Role',
        roleNumber: role.roleNumber || role.roleNo || role.number || role.code || role.roleCode || 'N/A',
        description: role.description || role.desc || '',
        company: role.company || companyId
      }));
      
      // If still no roles, create default ones
      if (formattedJobRoles.length === 0) {
        console.log("📝 Creating default job roles");
        formattedJobRoles.push(
          { _id: 'admin', roleName: 'Admin', roleNumber: 'ADM001', description: 'Administrator' },
          { _id: 'manager', roleName: 'Manager', roleNumber: 'MGR001', description: 'Manager' },
          { _id: 'employee', roleName: 'Employee', roleNumber: 'EMP001', description: 'Employee' },
          { _id: 'hr', roleName: 'HR', roleNumber: 'HR001', description: 'Human Resources' },
          { _id: 'superadmin', roleName: 'Super Admin', roleNumber: 'SADM001', description: 'Super Administrator' }
        );
      }
      
      setJobRoles(formattedJobRoles);
      console.log("📋 Job roles set successfully:", formattedJobRoles);
      return formattedJobRoles;
      
    } catch (err) {
      console.error("❌ Error fetching job roles:", err);
      
      // Create default job roles as fallback
      const defaultRoles = [
        { _id: 'admin', roleName: 'Admin', roleNumber: 'ADM001' },
        { _id: 'manager', roleName: 'Manager', roleNumber: 'MGR001' },
        { _id: 'employee', roleName: 'Employee', roleNumber: 'EMP001' },
        { _id: 'hr', roleName: 'HR', roleNumber: 'HR001' },
        { _id: 'superadmin', roleName: 'Super Admin', roleNumber: 'SADM001' }
      ];
      
      setJobRoles(defaultRoles);
      toast.warning('Using default job roles - API unavailable');
      return defaultRoles;
    } finally {
      setJobRolesLoading(false);
    }
  };

  // ✅ UPDATED: Smart Job Role Name Resolver
  const getJobRoleDisplayName = (jobRoleData) => {
    // Debug logging
    console.log("🔍 Getting job role display name:", {
      inputJobRoleData: jobRoleData,
      userObject: user,
      availableJobRoles: jobRoles.map(r => ({ id: r._id, name: r.roleName })),
      jobRolesCount: jobRoles.length
    });
    
    // If no jobRoles loaded yet, show loading or default
    if (jobRolesLoading) {
      return 'Loading...';
    }
    
    // If jobRoles is empty after loading, show default
    if (jobRoles.length === 0) {
      return 'Employee';
    }
    
    // Strategy 1: Direct string/object matching
    let jobRoleId = null;
    let jobRoleName = null;
    
    // Extract job role ID/name from different possible sources
    if (typeof jobRoleData === 'string') {
      jobRoleId = jobRoleData;
      jobRoleName = jobRoleData;
    } else if (jobRoleData && typeof jobRoleData === 'object') {
      jobRoleId = jobRoleData._id || jobRoleData.id || jobRoleData.roleId;
      jobRoleName = jobRoleData.roleName || jobRoleData.name || jobRoleData.jobRole;
    }
    
    // Also check user object directly
    if (!jobRoleId && user) {
      jobRoleId = user.jobRole || user.role || user.roleId;
      jobRoleName = user.jobRoleName || user.roleName;
    }
    
    console.log("📊 Extracted job role info:", { jobRoleId, jobRoleName });
    
    // Strategy 2: Find in jobRoles array
    let foundRole = null;
    
    // First try to find by ID
    if (jobRoleId) {
      foundRole = jobRoles.find(role => 
        role._id === jobRoleId || 
        role.id === jobRoleId ||
        role.roleNumber === jobRoleId
      );
      
      if (foundRole) {
        console.log("✅ Found role by ID:", foundRole.roleName);
        return foundRole.roleName;
      }
    }
    
    // Then try to find by name
    if (jobRoleName) {
      foundRole = jobRoles.find(role => 
        role.roleName === jobRoleName ||
        role.name === jobRoleName
      );
      
      if (foundRole) {
        console.log("✅ Found role by name:", foundRole.roleName);
        return foundRole.roleName;
      }
    }
    
    // Strategy 3: Check if jobRoleName looks like a displayable name
    if (jobRoleName && (jobRoleName.includes(' ') || jobRoleName.length > 3)) {
      console.log("✅ Using jobRoleName as display name:", jobRoleName);
      return jobRoleName.charAt(0).toUpperCase() + jobRoleName.slice(1);
    }
    
    // Strategy 4: Try to find any role that matches user's data
    if (user) {
      // Check if user has role information in other fields
      const userRoleFields = [
        user.role,
        user.jobRole,
        user.position,
        user.designation,
        user.title
      ].filter(Boolean);
      
      for (const roleField of userRoleFields) {
        foundRole = jobRoles.find(role => 
          role._id === roleField ||
          role.roleNumber === roleField ||
          role.roleName.toLowerCase() === roleField.toLowerCase()
        );
        
        if (foundRole) {
          console.log("✅ Found role in user fields:", foundRole.roleName);
          return foundRole.roleName;
        }
      }
    }
    
    // Strategy 5: Try partial matching
    if (jobRoleId || jobRoleName) {
      const searchTerm = (jobRoleId || jobRoleName || '').toLowerCase();
      foundRole = jobRoles.find(role => 
        role._id.toLowerCase().includes(searchTerm) ||
        role.roleNumber.toLowerCase().includes(searchTerm) ||
        role.roleName.toLowerCase().includes(searchTerm)
      );
      
      if (foundRole) {
        console.log("✅ Found role by partial match:", foundRole.roleName);
        return foundRole.roleName;
      }
    }
    
    // Final fallback
    console.log("📝 Using default 'Employee' role");
    return 'Employee';
  };

  const isUserInCurrentCompany = useMemo(() => {
    if (!user || !companyDetails) {
      console.log("⚠️ User or company details missing");
      return false;
    }
    
    const userCompanyCode = user.companyCode || (user.company && user.company.companyCode);
    const companyCode = companyDetails.companyCode;
    
    const isSameCompany = userCompanyCode === companyCode;
    console.log("🏢 Company check:", {
      userCompanyCode,
      companyCode,
      isSameCompany
    });
    
    return isSameCompany;
  }, [user, companyDetails]);

  const lateDates = useMemo(() => {
    return attendanceData
      .filter(record => record.status === 'LATE')
      .map(record => {
        const d = new Date(record.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      });
  }, [attendanceData]);

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

    const lateDays = attendanceData.filter(record => {
      const d = new Date(record.date);
      return d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear && 
             record.status === 'LATE';
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
      lateDays,
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
    if (lateDates.includes(key)) return "late";
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
      case 'late': return 'L';
      case 'halfday': return '½';
      case 'leave': return 'L';
      case 'absent': return '✗';
      case 'weekend': return '⚭';
      default: return '';
    }
  };

  const fetchAttendanceData = async () => {
    try {
      if (!isUserInCurrentCompany) {
        toast.error('Access denied: User does not belong to this company');
        return;
      }

      setLoading(true);
      const response = await axios.get('/attendance/list', {
        params: {
          month: calendarMonth,
          year: calendarYear
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data?.data || [];
      setAttendanceData(data);
      
      const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivity(sortedData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied: Company mismatch');
      } else {
        toast.error('Failed to load attendance data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveData = async () => {
    try {
      if (!isUserInCurrentCompany) {
        return;
      }

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
      if (!isUserInCurrentCompany) {
        setIsRunning(false);
        return;
      }

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
      setIsRunning(false);
    }
  };

  const handleIn = async () => {
    try {
      if (!isUserInCurrentCompany) {
        toast.error('Cannot clock in: Company mismatch');
        return;
      }

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
      if (error.response?.status === 403) {
        toast.error('Access denied: Company mismatch');
      } else {
        toast.error('Clock-in failed');
      }
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
      
      if (!isUserInCurrentCompany) {
        toast.error('Cannot clock out: Company mismatch');
        setIsProcessing(false);
        return;
      }

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

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("companyDetails");

      delete axios.defaults.headers.common["Authorization"];

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);

    } catch (error) {
      console.error("Clock-out error:", error);
      if (error.response?.status === 403) {
        toast.error('Access denied: Company mismatch');
      } else {
        toast.error("Clock-out failed");
      }
      setIsProcessing(false);
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 0) {
        const newYear = calendarYear - 1;
        setCalendarYear(newYear);
        
        setTimeout(() => {
          fetchAttendanceData();
        }, 100);
        
        return 11;
      }
      const newMonth = prev - 1;
      
      setTimeout(() => {
        fetchAttendanceData();
      }, 100);
      
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 11) {
        const newYear = calendarYear + 1;
        setCalendarYear(newYear);
        
        setTimeout(() => {
          fetchAttendanceData();
        }, 100);
        
        return 0;
      }
      const newMonth = prev + 1;
      
      setTimeout(() => {
        fetchAttendanceData();
      }, 100);
      
      return newMonth;
    });
  };

  const resetToCurrentMonth = () => {
    setCalendarMonth(currentDate.getMonth());
    setCalendarYear(currentDate.getFullYear());
    
    setTimeout(() => {
      fetchAttendanceData();
    }, 100);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return 'status-present';
      case 'LATE': return 'status-late';
      case 'HALF DAY': return 'status-halfday';
      case 'ABSENT': return 'status-absent';
      default: return 'status-default';
    }
  };

  // ✅ UPDATED: Load initial data with job roles
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("🚀 Loading initial dashboard data");
      
      if (isUserInCurrentCompany) {
        try {
          // First fetch job roles
          await fetchJobRoles();
          
          // Then fetch other data
          await Promise.all([
            fetchAttendanceData(),
            fetchLeaveData(),
            fetchCurrentStatus()
          ]);
          
          console.log("✅ All dashboard data loaded successfully");
        } catch (error) {
          console.error("❌ Error loading dashboard data:", error);
          toast.error('Some data failed to load');
        }
      } else {
        console.log("⚠️ User does not belong to current company");
        toast.error('User does not belong to this company. Please log in again.');
        
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    };
    
    loadInitialData();
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

  useEffect(() => {
    if ((attendanceData.length > 0 || loading) && isUserInCurrentCompany) {
      const fetchData = async () => {
        await fetchAttendanceData();
      };
      
      const timer = setTimeout(() => {
        fetchData();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [calendarMonth, calendarYear]);

  const calendarDays = getCalendarGrid(calendarYear, calendarMonth);
  const isMobile = useIsMobile();

  // ✅ Get user's job role display name
  const userJobRoleDisplay = getJobRoleDisplayName(user?.jobRole);

  if (!isUserInCurrentCompany) {
    return (
      <div className="dashboard-container">
        <div className="access-denied-message">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>
            You do not have access to this company's dashboard.
            <br />
            User company code: <strong>{user?.companyCode || 'Not set'}</strong>
            <br />
            Current company code: <strong>{companyDetails?.companyCode || 'Not set'}</strong>
          </p>
          <button 
            className="btn-primary"
            onClick={() => window.location.href = "/login"}
          >
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
          This dashboard does not work on mobile devices.  
          Even your phone agrees: "Sorry, not my job." <br /><br />
          Please use a Desktop or Laptop  
          for the best and complete experience
        </h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="colored"
        pauseOnHover
      />
      
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
              {/* ✅ UPDATED: Job Role Display */}
              <span className="dashboard-tag dashboard-tag-role">
                <FiBriefcase size={14} />
                {userJobRoleDisplay}
              </span>
              <span className="dashboard-tag dashboard-tag-type">
                <FiUser size={14} />
                {user?.employeeType || 'Full-time'}
              </span>
              <span className="dashboard-tag dashboard-tag-company">
                <FiBriefcase size={14} />
                {companyDetails?.companyName || 'Company'}
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
                disabled={isRunning || loading || !isUserInCurrentCompany}
                className={`dashboard-btn dashboard-btn-clockin ${isRunning ? 'btn-disabled' : ''}`}
              >
                <FiPlay size={20} />
                Clock In
              </button>
              <button
                onClick={confirmClockOut}
                disabled={!isRunning || loading || !isUserInCurrentCompany}
                className={`dashboard-btn dashboard-btn-clockout ${!isRunning ? 'btn-disabled' : ''}`}
              >
                <FiSquare size={20} />
                Clock Out
              </button>
            </div>
          </div>
        </div>
      </div>

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

        <div className="dashboard-stat-card stat-card-late">
          <div className="stat-card-header">
            <div className="stat-icon-container icon-late">
              <MdOutlineAlarm className="stat-icon" />
            </div>
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
      </div>

      <div className="dashboard-content-grid">
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
              <div className="legend-color color-late"></div>
              <span>Late</span>
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
              disabled={loading || !isUserInCurrentCompany}
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
                      {record.status === 'LATE' && <FiAlertTriangle className="status-icon" />}
                      {record.status === 'HALF DAY' && <FiAlertCircle className="status-icon" />}
                      {record.status === 'ABSENT' && <FiAlertCircle className="status-icon" />}
                      {!['PRESENT', 'LATE', 'HALF DAY', 'ABSENT'].includes(record.status) && <FiClock className="status-icon" />}
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