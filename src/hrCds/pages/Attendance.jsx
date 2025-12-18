import React, { useState, useEffect } from "react";
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
} from "react-icons/fi";
import '../Css/Attendance.css';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    total: 0,
    percentage: 0,
  });

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("Fetching attendance data from API...");

      const response = await axios.get("/attendance/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", response.data);

      let attendanceData = [];

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        attendanceData = response.data.data;
      } else if (Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (response.data && Array.isArray(response.data.attendance)) {
        attendanceData = response.data.attendance;
      } else {
        console.warn("Unexpected response structure, using empty array");
        attendanceData = [];
      }

      console.log("Processed attendance data:", attendanceData);

      if (attendanceData.length === 0) {
        console.log("No attendance records found in response");
        toast.info("No attendance records found");
      }

      setAttendance(attendanceData);
      calculateStats(attendanceData);

      if (showRefresh) {
        toast.success("🔄 Attendance data refreshed!");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);

      let errorMessage = "Failed to load attendance records";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        console.error("Server error response:", error.response.data);
      } else if (error.request) {
        errorMessage = "Network error - Please check your connection";
        console.error("Network error:", error.request);
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      toast.error(`❌ ${errorMessage}`);
      setAttendance([]);
      calculateStats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    console.log("Calculating stats for data:", data);

    const present = data.filter((record) => record.status === "PRESENT").length;
    const absent = data.filter((record) => record.status === "ABSENT").length;
    const halfDay = data.filter(
      (record) => record.status === "HALF DAY"
    ).length;
    const total = data.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    console.log("Calculated stats:", {
      present,
      absent,
      halfDay,
      total,
      percentage,
    });

    setStats({
      present,
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
      console.error("Error formatting date:", dateStr, error);
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
      console.error("Error formatting time:", timeStr, error);
      return "Invalid Time";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PRESENT":
        return <FiCheckCircle className="Attendance-status-icon" />;
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
      case "ABSENT":
        return "#f44336";
      case "HALF DAY":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  const filteredData = attendance.filter((record) => {
    const matchesSearch =
      formatDate(record.date).toLowerCase().includes(search.toLowerCase()) ||
      (record.status &&
        record.status.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" || record.status === statusFilter;

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
      ];
      const csvData = filteredData.map((record) => [
        formatDate(record.date),
        formatTime(record.inTime),
        formatTime(record.outTime),
        record.status,
        record.totalTime || "00:00:00",
        record.lateBy || "00:00:00",
        record.earlyLeave || "00:00:00",
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
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSearch(date ? formatDate(date) : "");
    setShowCalendar(false);
  };

  if (loading) {
    return (
      <div className="Attendance-loading">
        <div className="Attendance-loading-content">
          <div className="Attendance-loading-bar">
            <div className="Attendance-loading-progress"></div>
          </div>
          <h2 className="Attendance-loading-text">Loading your attendance records...</h2>
        </div>
      </div>
    );
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
              onClick={() => fetchAttendance(true)}
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
            />
          </div>
        )}

        {/* Filter Menu */}
        {showFilterMenu && !isMobile && (
          <div className="Attendance-filter-menu">
            {["ALL", "PRESENT", "ABSENT", "HALF DAY"].map((status) => (
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
              {["ALL", "PRESENT", "ABSENT", "HALF DAY"].map((status) => (
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
            key: "absent",
            label: "Absent Days",
            value: stats.absent,
            icon: FiMinusCircle,
            color: "error",
          },
          {
            key: "halfDay",
            label: "Half Days",
            value: stats.halfDay,
            icon: FiAlertCircle,
            color: "warning",
          },
          {
            key: "total",
            label: "Total Records",
            value: stats.total,
            icon: FiBarChart2,
            color: "info",
          },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`Attendance-stat-card ${
              statusFilter === stat.key.toUpperCase() ? "Attendance-active" : ""
            }`}
            onClick={() =>
              setStatusFilter(
                statusFilter === stat.key.toUpperCase()
                  ? "ALL"
                  : stat.key.toUpperCase()
              )
            }
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
                <span>Status: {statusFilter}</span>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr
                    key={record._id}
                    className={`Attendance-table-row Attendance-status-${record.status.toLowerCase().replace(" ", "-")}`}
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
                      <div
                        className={`Attendance-status-chip Attendance-status-${record.status.toLowerCase().replace(" ", "-")}`}
                      >
                        {getStatusIcon(record.status)}
                        <span>{record.status}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="Attendance-total-time">
                        {record.totalTime || "00:00:00"}
                      </strong>
                    </td>
                    <td>
                      <button
                        className="Attendance-view-details-button"
                        onClick={() => openDetailsModal(record)}
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="Attendance-no-data-cell">
                    <FiUser className="Attendance-no-data-icon" />
                    <h3>No attendance records found</h3>
                    <p>Try adjusting your filters or search terms</p>
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
            filteredData.map((record) => (
              <div
                key={record._id}
                className={`Attendance-mobile-card Attendance-status-${record.status.toLowerCase().replace(" ", "-")}`}
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
                    <div
                      className={`Attendance-mobile-status-chip Attendance-status-${record.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {record.status}
                    </div>
                    <strong className="Attendance-mobile-total-time">
                      {record.totalTime || "00:00:00"}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="Attendance-no-data-card">
              <FiUser className="Attendance-no-data-icon" />
              <h3>No records found</h3>
              <p>Adjust your search or filters</p>
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
                <div
                  className={`Attendance-modal-status-chip Attendance-status-${selectedRecord.status.toLowerCase().replace(" ", "-")}`}
                >
                  {selectedRecord.status}
                </div>
              </div>
              <div className="Attendance-modal-divider"></div>
              <div className="Attendance-modal-section">
                <h4>Login Time</h4>
                <p className="Attendance-modal-time">{formatTime(selectedRecord.inTime)}</p>
              </div>
              <div className="Attendance-modal-section">
                <h4>Logout Time</h4>
                <p className="Attendance-modal-time">
                  {formatTime(selectedRecord.outTime)}
                </p>
              </div>
              <div className="Attendance-modal-section">
                <h4>Total Duration</h4>
                <p className="Attendance-modal-duration">
                  {selectedRecord.totalTime || "00:00:00"}
                </p>
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