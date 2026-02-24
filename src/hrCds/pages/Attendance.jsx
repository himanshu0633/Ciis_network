import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "../../utils/axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiTrendingUp,
  FiDownload,
  FiEye,
  FiChevronRight,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiMinusCircle,
  FiX,
  FiBarChart2,
  FiRefreshCw,
  FiAlertTriangle,
  FiWatch
} from "react-icons/fi";
import '../Css/Attendance.css';
import CIISLoader from '../../Loader/CIISLoader'; // ✅ Import CIISLoader

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // ✅ Page loading state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // User join date from createdAt
  const [userJoinDate, setUserJoinDate] = useState(null);
  const [formattedJoinDate, setFormattedJoinDate] = useState('');
  
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    total: 0,
    percentage: 0,
  });

  // Get user from localStorage
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  const token = useMemo(() => localStorage.getItem('token'), []);

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
      
      console.log('User joined on:', joinDate.toISOString());
    }
  }, [user?.createdAt]);

  // Check if date is before join date
  const isBeforeJoinDate = useCallback((date) => {
    if (!userJoinDate) return false;
    
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const joinDate = new Date(userJoinDate);
    joinDate.setHours(0, 0, 0, 0);
    
    return compareDate < joinDate;
  }, [userJoinDate]);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch attendance with join date filtering
  const fetchAttendance = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("/attendance/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let attendanceData = [];

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        attendanceData = response.data.data;
      } else if (Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (response.data && Array.isArray(response.data.attendance)) {
        attendanceData = response.data.attendance;
      } else {
        attendanceData = [];
      }

      // Filter out records before user's join date
      if (userJoinDate) {
        attendanceData = attendanceData.filter(record => !isBeforeJoinDate(record.date));
      }

      setAttendance(attendanceData);
      calculateStats(attendanceData);

      if (showRefresh) {
        toast.success("🔄 Attendance data refreshed!");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast.error("❌ Failed to load attendance records");
      setAttendance([]);
      calculateStats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userJoinDate, isBeforeJoinDate]);

  // ✅ Load data on mount - with page loader
  const initialLoadRef = useRef(false);
  
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (!userJoinDate) return;
    
    initialLoadRef.current = true;
    setPageLoading(true);
    
    const loadData = async () => {
      try {
        await fetchAttendance();
      } catch (error) {
        console.error('Error loading attendance data:', error);
      } finally {
        // Minimum 500ms loader show karega
        setTimeout(() => {
          setPageLoading(false);
        }, 500);
      }
    };
    
    loadData();
  }, [userJoinDate, fetchAttendance]);

  const calculateStats = (data) => {
    const present = data.filter((record) => record.status === "PRESENT").length;
    const late = data.filter((record) => record.status === "LATE").length;
    const absent = data.filter((record) => record.status === "ABSENT").length;
    const halfDay = data.filter((record) => record.status === "HALF DAY").length;
    const total = data.length;
    
    const workingDays = present + late;
    const percentage = total > 0 ? Math.round((workingDays / total) * 100) : 0;

    setStats({
      present,
      late,
      absent,
      halfDay,
      total,
      percentage,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "--";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PRESENT":
        return <FiCheckCircle className="Attendance-status-icon" />;
      case "LATE":
        return <FiAlertTriangle className="Attendance-status-icon" />;
      case "ABSENT":
        return <FiMinusCircle className="Attendance-status-icon" />;
      case "HALF DAY":
        return <FiAlertCircle className="Attendance-status-icon" />;
      default:
        return <FiClock className="Attendance-status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return "#4caf50";
      case "LATE":
        return "#ff9800";
      case "ABSENT":
        return "#f44336";
      case "HALF DAY":
        return "#ff5722";
      default:
        return "#757575";
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case "PRESENT":
        return "PRESENT";
      case "LATE":
        return "LATE";
      case "ABSENT":
        return "ABSENT";
      case "HALF DAY":
        return "HALF DAY";
      default:
        return status;
    }
  };

  const filteredData = useMemo(() => {
    return attendance.filter((record) => {
      const matchesSearch =
        formatDate(record.date).toLowerCase().includes(search.toLowerCase()) ||
        (record.status && record.status.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus =
        statusFilter === "ALL" || 
        (statusFilter === "LATE" ? record.status === "LATE" :
         statusFilter === "PRESENT" ? record.status === "PRESENT" :
         statusFilter === "ABSENT" ? record.status === "ABSENT" :
         statusFilter === "HALF DAY" ? record.status === "HALF DAY" : true);

      const recordDate = new Date(record.date);
      const now = new Date();
      let matchesTimeRange = true;

      switch (timeRange) {
        case "TODAY":
          matchesTimeRange = recordDate.toDateString() === now.toDateString();
          break;
        case "WEEK": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTimeRange = recordDate >= weekAgo;
          break;
        }
        case "MONTH": {
          const monthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          matchesTimeRange = recordDate >= monthAgo;
          break;
        }
        default:
          matchesTimeRange = true;
      }

      return matchesSearch && matchesStatus && matchesTimeRange;
    });
  }, [attendance, search, statusFilter, timeRange]);

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      const headers = [
        "Date",
        "Login Time",
        "Logout Time",
        "Status",
        "Total Time",
        "Late By",
        "Early Leave",
        "Overtime",
      ];
      const csvData = filteredData.map((record) => [
        formatDate(record.date),
        formatTime(record.inTime),
        formatTime(record.outTime),
        getStatusDisplayText(record.status),
        record.totalTime || "00:00:00",
        record.lateBy || "00:00:00",
        record.earlyLeave || "00:00:00",
        record.overTime || "00:00:00",
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("📊 CSV exported successfully!");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSearch(date ? formatDate(date) : "");
    setShowCalendar(false);
  };

  const handleRefresh = () => {
    fetchAttendance(true);
  };

  const statusOptions = ["ALL", "PRESENT", "LATE", "HALF DAY", "ABSENT"];

  // ✅ Show CIISLoader while page is loading
  if (pageLoading) {
    return <CIISLoader />;
  }

  return (
    <div className="Attendance-container">
      <ToastContainer
        position={isMobile ? "top-center" : "top-right"}
        autoClose={4000}
        theme="light"
      />

      {/* Header Section */}
      <div className="Attendance-header">
        <div className="Attendance-header-content">
          <div className="Attendance-header-text">
            <h1 className="Attendance-title">Attendance</h1>
            <p className="Attendance-subtitle">
              Track your attendance history and insights
            </p>
            {userJoinDate && (
              <div className="Attendance-join-info">
                <FiClock />
                <span>Joined on: {formattedJoinDate}</span>
              </div>
            )}
          </div>

          <div className="Attendance-header-actions">
            <div className="Attendance-search-container">
              <FiSearch className="Attendance-search-icon" />
              <input
                type="text"
                placeholder="Search attendance..."
                className="Attendance-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="Attendance-clear-search"
                  onClick={() => setSearch("")}
                >
                  <FiX />
                </button>
              )}
            </div>

            <button
              className="Attendance-icon-button"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <FiCalendar />
            </button>

            <button
              className="Attendance-icon-button"
              onClick={
                isMobile
                  ? () => setShowMobileFilter(true)
                  : () => setShowFilterMenu(!showFilterMenu)
              }
            >
              <FiFilter />
            </button>

            <button
              className="Attendance-icon-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "Attendance-spin" : ""} />
            </button>

            <button
              className="Attendance-export-button"
              onClick={exportToCSV}
              disabled={filteredData.length === 0}
            >
              <FiDownload />
              Export CSV
            </button>
          </div>
        </div>

        {/* Calendar Popover */}
        {showCalendar && (
          <div className="Attendance-calendar-popover">
            <input
              type="date"
              className="Attendance-date-picker"
              value={selectedDate || ""}
              onChange={(e) => handleDateSelect(e.target.value)}
              min={userJoinDate ? userJoinDate.toISOString().split('T')[0] : undefined}
            />
            {userJoinDate && (
              <div className="Attendance-calendar-note">
                <FiClock size={12} />
                <span>Records available from {formattedJoinDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Filter Menu */}
        {showFilterMenu && !isMobile && (
          <div className="Attendance-filter-menu">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`Attendance-filter-menu-item ${
                  statusFilter === status ? "Attendance-active" : ""
                }`}
                onClick={() => {
                  setStatusFilter(status);
                  setShowFilterMenu(false);
                }}
              >
                {status === "ALL" ? "All Status" : `${status} Only`}
              </button>
            ))}
          </div>
        )}

        {/* Time Range Tabs */}
        <div className="Attendance-time-range-tabs">
          {["ALL", "TODAY", "WEEK", "MONTH"].map((range) => (
            <button
              key={range}
              className={`Attendance-time-tab ${timeRange === range ? "Attendance-active" : ""}`}
              onClick={() => setTimeRange(range)}
            >
              {range === "ALL" ? "All Time" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && isMobile && (
        <div className="Attendance-mobile-filter-drawer">
          <div className="Attendance-filter-drawer-content">
            <div className="Attendance-filter-drawer-header">
              <h3>Filters</h3>
              <button
                className="Attendance-close-filter"
                onClick={() => setShowMobileFilter(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="Attendance-filter-options">
              <h4>Status Filter</h4>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  className={`Attendance-filter-option ${
                    statusFilter === status ? "Attendance-active" : ""
                  }`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowMobileFilter(false);
                  }}
                >
                  {status === "ALL" ? "All Status" : status}
                </button>
              ))}
            </div>
            {userJoinDate && (
              <div className="Attendance-filter-join-info">
                <FiClock size={14} />
                <span>Records from {formattedJoinDate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Date Info Banner */}
      {userJoinDate && attendance.length === 0 && !loading && (
        <div className="Attendance-join-banner">
          <div className="Attendance-join-banner-content">
            <FiCalendar size={20} />
            <div>
              <h3>No attendance records found</h3>
              <p>You joined on {formattedJoinDate}. Your attendance records will appear here once you clock in.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="Attendance-stats-grid">
        {[
          {
            key: "present",
            label: "Present Days",
            value: stats.present,
            icon: FiCheckCircle,
            color: "success",
            extra: `${stats.percentage}%`,
          },
          {
            key: "late",
            label: "Late Days",
            value: stats.late,
            icon: FiAlertTriangle,
            color: "warning",
          },
          {
            key: "halfDay",
            label: "Half Days",
            value: stats.halfDay,
            icon: FiAlertCircle,
            color: "warning",
          },
          {
            key: "absent",
            label: "Absent Days",
            value: stats.absent,
            icon: FiMinusCircle,
            color: "error",
          },
          {
            key: "total",
            label: "Total Records",
            value: stats.total,
            icon: FiBarChart2,
            color: "info",
          },
        ]
          .filter(stat => stat.value > 0 || stat.key === "total")
          .map((stat) => (
            <div
              key={stat.key}
              className={`Attendance-stat-card ${
                statusFilter === stat.key.toUpperCase() ? "Attendance-active" : ""
              }`}
              onClick={() => {
                if (stat.key !== "total") {
                  setStatusFilter(
                    statusFilter === stat.key.toUpperCase()
                      ? "ALL"
                      : stat.key.toUpperCase()
                  );
                }
              }}
            >
              <div className="Attendance-stat-card-content">
                <div className="Attendance-stat-icon-container">
                  <stat.icon className={`Attendance-stat-icon Attendance-${stat.color}`} />
                </div>
                <div className="Attendance-stat-details">
                  <p className="Attendance-stat-label">{stat.label}</p>
                  <div className="Attendance-stat-value-container">
                    <h3 className="Attendance-stat-value">{stat.value}</h3>
                    {stat.extra && (
                      <span className="Attendance-stat-extra">{stat.extra}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Active Filters Display */}
      {(statusFilter !== "ALL" || timeRange !== "ALL") && (
        <div className="Attendance-active-filters">
          <h4>Active filters:</h4>
          <div className="Attendance-filter-chips">
            {statusFilter !== "ALL" && (
              <div className="Attendance-filter-chip">
                <span>Status: {getStatusDisplayText(statusFilter)}</span>
                <button onClick={() => setStatusFilter("ALL")}>×</button>
              </div>
            )}
            {timeRange !== "ALL" && (
              <div className="Attendance-filter-chip Attendance-secondary">
                <span>Time: {timeRange}</span>
                <button onClick={() => setTimeRange("ALL")}>×</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="Attendance-results-count">
        <h3>
          Showing {filteredData.length} of {attendance.length} records
        </h3>
        {stats.late > 0 && (
          <div className="Attendance-late-info">
            <FiWatch className="Attendance-late-info-icon" />
            <span>{stats.late} late day(s) recorded</span>
          </div>
        )}
        {userJoinDate && attendance.length > 0 && (
          <div className="Attendance-range-info">
            <FiCalendar />
            <span>Since {formattedJoinDate}</span>
          </div>
        )}
      </div>

      {/* Desktop/Tablet Table */}
      {!isMobile && (
        <div className="Attendance-table-container">
          <table className="Attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Status</th>
                <th>Total Time</th>
                <th>Late By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record) => {
                  const statusClass = record.status.toLowerCase().replace(" ", "-");
                  return (
                    <tr
                      key={record._id}
                      className={`Attendance-table-row Attendance-status-${statusClass}`}
                      onClick={() => openDetailsModal(record)}
                    >
                      <td>
                        <strong>{formatDate(record.date)}</strong>
                      </td>
                      <td>
                        <div className="Attendance-time-cell">
                          <FiClock />
                          <span>{formatTime(record.inTime)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="Attendance-time-cell">
                          <FiClock />
                          <span>{formatTime(record.outTime)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`Attendance-status-chip Attendance-status-${statusClass}`}>
                          {getStatusIcon(record.status)}
                          <span>{getStatusDisplayText(record.status)}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="Attendance-total-time">
                          {record.totalTime || "00:00:00"}
                        </strong>
                      </td>
                      <td>
                        <div className="Attendance-late-cell">
                          {record.lateBy && record.lateBy !== "00:00:00" ? (
                            <span className="Attendance-late-badge">
                              {record.lateBy}
                            </span>
                          ) : (
                            <span className="Attendance-no-late">--</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="Attendance-view-details-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailsModal(record);
                          }}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="Attendance-no-data-cell">
                    <FiUser className="Attendance-no-data-icon" />
                    <h3>No attendance records found</h3>
                    <p>
                      {userJoinDate 
                        ? `You joined on ${formattedJoinDate}. No records before this date.`
                        : 'Try adjusting your filters or search terms'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {isMobile && (
        <div className="Attendance-mobile-cards">
          {filteredData.length > 0 ? (
            filteredData.map((record) => {
              const statusClass = record.status.toLowerCase().replace(" ", "-");
              return (
                <div
                  key={record._id}
                  className={`Attendance-mobile-card Attendance-status-${statusClass}`}
                  onClick={() => openDetailsModal(record)}
                >
                  <div className="Attendance-mobile-card-content">
                    <div className="Attendance-mobile-card-header">
                      <h3>{formatDate(record.date)}</h3>
                      <FiChevronRight className="Attendance-card-arrow" />
                    </div>
                    <div className="Attendance-mobile-card-times">
                      <div className="Attendance-time-item">
                        <FiClock />
                        <span>In: {formatTime(record.inTime)}</span>
                      </div>
                      <div className="Attendance-time-item">
                        <FiClock />
                        <span>Out: {formatTime(record.outTime)}</span>
                      </div>
                    </div>
                    <div className="Attendance-mobile-card-footer">
                      <div className={`Attendance-mobile-status-chip Attendance-status-${statusClass}`}>
                        {getStatusIcon(record.status)}
                        <span>{getStatusDisplayText(record.status)}</span>
                      </div>
                      <div className="Attendance-mobile-card-right">
                        {record.lateBy && record.lateBy !== "00:00:00" && (
                          <div className="Attendance-mobile-late">
                            <FiAlertTriangle />
                            <span>{record.lateBy}</span>
                          </div>
                        )}
                        <strong className="Attendance-mobile-total-time">
                          {record.totalTime || "00:00:00"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="Attendance-no-data-card">
              <FiUser className="Attendance-no-data-icon" />
              <h3>No records found</h3>
              <p>
                {userJoinDate 
                  ? `You joined on ${formattedJoinDate}`
                  : 'Adjust your search or filters'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {openModal && selectedRecord && (
        <div className="Attendance-modal-overlay" onClick={closeModal}>
          <div
            className="Attendance-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `linear-gradient(135deg, ${getStatusColor(
                selectedRecord.status
              )} 0%, #667eea 100%)`,
            }}
          >
            <div className="Attendance-modal-header">
              <h2>Attendance Details</h2>
              <h3>{formatDate(selectedRecord.date)}</h3>
            </div>
            <div className="Attendance-modal-body">
              <div className="Attendance-modal-section">
                <h4>Status</h4>
                <div className={`Attendance-modal-status-chip Attendance-status-${selectedRecord.status.toLowerCase().replace(" ", "-")}`}>
                  {getStatusIcon(selectedRecord.status)}
                  <span>{getStatusDisplayText(selectedRecord.status)}</span>
                </div>
              </div>
              <div className="Attendance-modal-divider"></div>
              
              <div className="Attendance-modal-grid">
                <div className="Attendance-modal-grid-item">
                  <h4>Login Time</h4>
                  <p className="Attendance-modal-time">{formatTime(selectedRecord.inTime)}</p>
                </div>
                <div className="Attendance-modal-grid-item">
                  <h4>Logout Time</h4>
                  <p className="Attendance-modal-time">
                    {formatTime(selectedRecord.outTime)}
                  </p>
                </div>
              </div>
              
              <div className="Attendance-modal-grid">
                <div className="Attendance-modal-grid-item">
                  <h4>Total Duration</h4>
                  <p className="Attendance-modal-duration">
                    {selectedRecord.totalTime || "00:00:00"}
                  </p>
                </div>
                <div className="Attendance-modal-grid-item">
                  <h4>Late By</h4>
                  <p className="Attendance-modal-late">
                    {selectedRecord.lateBy || "00:00:00"}
                  </p>
                </div>
              </div>
              
              <div className="Attendance-modal-grid">
                <div className="Attendance-modal-grid-item">
                  <h4>Early Leave</h4>
                  <p className="Attendance-modal-early-leave">
                    {selectedRecord.earlyLeave || "00:00:00"}
                  </p>
                </div>
                <div className="Attendance-modal-grid-item">
                  <h4>Overtime</h4>
                  <p className="Attendance-modal-overtime">
                    {selectedRecord.overTime || "00:00:00"}
                  </p>
                </div>
              </div>
              
              <button className="Attendance-modal-close-button" onClick={closeModal}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;