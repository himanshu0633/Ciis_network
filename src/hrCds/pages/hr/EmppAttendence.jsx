import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../../../utils/axiosConfig";
import './employee-attendance.css';

// Import export libraries
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Icons
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiFileText,
  FiImage,
} from "react-icons/fi";

// Employee Type Filter Component
const EmployeeTypeFilter = ({ selected, onChange }) => {
  const options = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
  ];

  return (
    <select
      className="filter-input"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const EmployeeAttendance = () => {
  const [records, setRecords] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    onTime: 0,
    late: 0,
  });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const tableRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (allUsers.length > 0) {
      fetchAttendanceData(selectedDate);
    }
  }, [selectedDate, allUsers]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('/users/all-users');
      setAllUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
      showSnackbar("Error loading users data", "error");
    }
  };

  const fetchAttendanceData = async (date) => {
    setLoading(true);
    try {
      const formatted = date;
      const res = await axios.get(`/attendance/all?date=${formatted}`);
      
      // Combine attendance data with all users
      const attendanceMap = {};
      res.data.data.forEach(record => {
        attendanceMap[record.user._id] = {
          ...record,
          status: record.status.toLowerCase()
        };
      });

      // Create combined records
      const combinedRecords = allUsers.map(user => {
        const attendanceRecord = attendanceMap[user._id];
        if (attendanceRecord) {
          return {
            ...attendanceRecord,
            user: {
              ...user,
              employeeType: user.employeeType || 'technical'
            }
          };
        } else {
          // Create absent record for users without attendance
          return {
            _id: `absent_${user._id}_${date}`,
            user: {
              ...user,
              employeeType: user.employeeType || 'technical'
            },
            date: date,
            inTime: null,
            outTime: null,
            totalTime: "00:00:00",
            lateBy: "00:00:00",
            earlyLeave: "00:00:00",
            overTime: "00:00:00",
            status: "absent",
            isClockedIn: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      });

      setRecords(combinedRecords);
      calculateStats(combinedRecords);
    } catch (err) {
      console.error("Failed to load attendance", err);
      showSnackbar("Error loading attendance data", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const present = attendanceData.filter((r) => r.status === "present").length;
    const absent = attendanceData.filter((r) => r.status === "absent").length;
    const halfDay = attendanceData.filter((r) => r.status === "halfday").length;
    const late = attendanceData.filter(
      (r) => r.lateBy && r.lateBy !== "00:00:00"
    ).length;
    
    setStats({
      total: attendanceData.length,
      present,
      absent,
      halfDay,
      late,
      onTime: attendanceData.length - late,
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSelectedEmployeeType("all");
    setSearchTerm("");
  };

const exportToPDF = async () => {
  setExportMenuOpen(false);
  setLoading(true);

  try {
    const input = tableRef.current;
    input.classList.add("pdf-export");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: input.scrollWidth,
      height: input.scrollHeight,
    });

    input.classList.remove("pdf-export");

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // 🔹 TITLE
    pdf.setFontSize(16);
    pdf.text(
      `Attendance Report - ${formatExportDate(selectedDate)}`,
      pdfWidth / 2,
      8,
      { align: "center" }
    );

    // 🔹 SUMMARY
    pdf.setFontSize(10);
    pdf.text(
      `Total: ${stats.total} | Present: ${stats.present} | Absent: ${stats.absent} | Half Day: ${stats.halfDay}`,
      margin,
      15
    );

    position = 20;

    // 🔹 FIRST PAGE
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= usableHeight;

    // 🔹 EXTRA PAGES
    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - heightLeft;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= usableHeight;
    }

    // 🔹 PAGE NUMBERS
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pdfWidth - 20,
        pdfHeight - 8
      );
    }

    pdf.save(`attendance_report_${selectedDate}.pdf`);
    showSnackbar("Full attendance PDF exported successfully!", "success");
  } catch (error) {
    console.error("PDF Export Error:", error);
    showSnackbar("Failed to export PDF", "error");
  } finally {
    setLoading(false);
  }
};


  const exportToImage = async () => {
    setExportMenuOpen(false);
    setLoading(true);
    
    try {
      const input = tableRef.current;
      
      // Add a temporary class for better image formatting
      input.classList.add('image-export');
      
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
      });
      
      // Remove the temporary class
      input.classList.remove('image-export');
      
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `attendance_report_${selectedDate}.jpg`;
      link.href = image;
      link.click();
      
      showSnackbar("Image exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting to image:", error);
      showSnackbar("Error exporting image", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    setExportMenuOpen(false);
    
    // Create CSV content
    const headers = ['Employee Name', 'Email', 'Employee Type', 'Date', 'Check In', 'Check Out', 'Total Time', 'Status', 'Late By'];
    
    const csvData = filteredRecords.map(record => [
      record.user?.name || 'N/A',
      record.user?.email || 'N/A',
      record.user?.employeeType?.toUpperCase() || 'N/A',
      formatDate(record.date),
      formatTime(record.inTime),
      formatTime(record.outTime),
      record.totalTime || '00:00:00',
      record.status.charAt(0).toUpperCase() + record.status.slice(1),
      record.lateBy || '00:00:00'
    ]);
    
    // Add summary row
    csvData.push([]);
    csvData.push(['SUMMARY', '', '', '', '', '', '', '', '']);
    csvData.push(['Total Employees', stats.total, '', '', '', '', '', '', '']);
    csvData.push(['Present', stats.present, '', '', '', '', '', '', '']);
    csvData.push(['Absent', stats.absent, '', '', '', '', '', '', '']);
    csvData.push(['Half Day', stats.halfDay, '', '', '', '', '', '', '']);
    csvData.push(['Late Arrivals', stats.late, '', '', '', '', '', '', '']);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSnackbar("CSV exported successfully!", "success");
  };

  const formatExportDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar({ ...snackbar, open: false });
    }, 4000);
  };

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedEmployeeType !== "all") {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.employeeType &&
          rec.user.employeeType.toLowerCase() ===
            selectedEmployeeType.toLowerCase()
      );
    }

    if (statusFilter !== "all") {
      if (["present", "absent", "halfday"].includes(statusFilter)) {
        filtered = filtered.filter((rec) => rec.status === statusFilter);
      } else if (statusFilter === "late") {
        filtered = filtered.filter(
          (rec) => rec.lateBy && rec.lateBy !== "00:00:00"
        );
      } else if (statusFilter === "ontime") {
        filtered = filtered.filter(
          (rec) => !rec.lateBy || rec.lateBy === "00:00:00"
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [records, selectedEmployeeType, searchTerm, statusFilter]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "present") return "status-present";
    if (status === "absent") return "status-absent";
    if (status === "halfday") return "status-halfday";
    return "";
  };

  const getEmployeeTypeClass = (type) => {
    if (!type) return "";
    const typeLower = type.toLowerCase();
    if (typeLower.includes("full")) return "type-full-time";
    if (typeLower.includes("part")) return "type-part-time";
    if (typeLower.includes("contract")) return "type-contract";
    if (typeLower.includes("intern")) return "type-intern";
    return "";
  };

  const getRowClass = (status) => {
    if (status === "present") return "row-present";
    if (status === "absent") return "row-absent";
    if (status === "halfday") return "row-halfday";
    return "";
  };

  // Loading State
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="employee-attendance">
      {/* Header */}
      <div className="attendance-header">
        <div>
          <h1 className="attendance-title">Attendance Management</h1>
          <p className="attendance-subtitle">
            Monitor and manage employee attendance in real-time
          </p>
        </div>

        {/* Action Bar */}
        <div className="header-actions">
 
          {/* Export Button with Dropdown */}
          <div className="export-container" ref={exportMenuRef}>
            <button 
              className="action-button export-button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              title="Export Report"
            >
         
              <span style={{ marginLeft: '-40px' }}>Export</span>
            </button>
            
            {exportMenuOpen && (
              <div className="export-dropdown">
                <button 
                  className="export-option"
                  onClick={exportToPDF}
                >
                  <FiFileText size={16} />
                  <span>Export as PDF</span>
                </button>
                <button 
                  className="export-option"
                  onClick={exportToImage}
                >
                  <FiImage size={16} />
                  <span>Export as Image (JPG)</span>
                </button>
                <button 
                  className="export-option"
                  onClick={exportToCSV}
                >
                  <FiDownload size={16} />
                  <span>Export as CSV</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="date-chip">
            <FiCalendar size={16} />
            {new Date(selectedDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter size={20} color="#1976d2" />
          <h3>Filters & Search</h3>
        </div>
        
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">Select Date</label>
            <input
              type="date"
              className="filter-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Employee Type</label>
            <EmployeeTypeFilter
              selected={selectedEmployeeType}
              onChange={setSelectedEmployeeType}
            />
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <div style={{ position: 'relative' }}>
              <FiSearch 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }}
              />
              <input
                type="text"
                className="filter-input"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="btn btn-outlined"
              onClick={clearFilters}
            >
              Clear All
            </button>
            <button 
              className="btn btn-contained"
              onClick={() => fetchAttendanceData(selectedDate)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-container">
        {[
          { 
            label: "Total Employees", 
            count: stats.total, 
            color: "primary", 
            value: "all", 
            icon: <FiUsers />,
            description: "Total tracked employees",
            statClass: "stat-card-primary",
            iconClass: "stat-icon-primary"
          },
          { 
            label: "Present", 
            count: stats.present, 
            color: "success", 
            value: "present", 
            icon: <FiCheckCircle />,
            description: "Employees present today",
            statClass: "stat-card-success",
            iconClass: "stat-icon-success"
          },
          { 
            label: "Absent", 
            count: stats.absent, 
            color: "error", 
            value: "absent", 
            icon: <FiXCircle />,
            description: "Employees absent today",
            statClass: "stat-card-error",
            iconClass: "stat-icon-error"
          },
          { 
            label: "Half Day", 
            count: stats.halfDay, 
            color: "warning", 
            value: "halfday", 
            icon: <FiAlertCircle />,
            description: "Employees on half day",
            statClass: "stat-card-warning",
            iconClass: "stat-icon-warning"
          },
          { 
            label: "On Time", 
            count: stats.onTime, 
            color: "info", 
            value: "ontime", 
            icon: <FiClock />,
            description: "Arrived on time",
            statClass: "stat-card-info",
            iconClass: "stat-icon-info"
          },
          { 
            label: "Late Arrivals", 
            count: stats.late, 
            color: "secondary", 
            value: "late", 
            icon: <FiTrendingUp />,
            description: "Arrived late today",
            statClass: "stat-card-secondary",
            iconClass: "stat-icon-secondary"
          },
        ].map((stat) => (
          <div 
            key={stat.label}
            className={`stat-card ${stat.statClass} ${statusFilter === stat.value ? 'stat-card-active' : ''}`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === stat.value ? "all" : stat.value
              )
            }
          >
            <div className="stat-content">
              <div className={`stat-icon ${stat.iconClass}`}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.count}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container" ref={tableRef}>
        <div className="table-header">
          <h3 className="table-title">Attendance Records</h3>
          <div className="table-count">
            {filteredRecords.length} records found • 
            <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
              Date: {formatExportDate(selectedDate)}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Time</th>
                <th>Status</th>
    
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length ? (
                filteredRecords.map((rec) => (
                  <tr key={rec._id} className={getRowClass(rec.status)}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-avatar">
                          {getInitials(rec.user?.name)}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">
                            {rec.user?.name || "N/A"}
                          </div>
                          <div className="employee-email">
                            {rec.user?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-chip ${getEmployeeTypeClass(rec.user?.employeeType)}`}>
                        {rec.user?.employeeType?.toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                        {formatDate(rec.date)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {formatTime(rec.inTime)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {formatTime(rec.outTime)}
                      </div>
                    </td>
                    <td>
                      <span className="time-chip">
                        {rec.totalTime || "00:00:00"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip ${getStatusClass(rec.status)}`}>
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </span>
                    </td>
                
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FiCalendar size={48} />
                      </div>
                      <h4 className="empty-state-title">No Records Found</h4>
                      <p className="empty-state-text">
                        Try adjusting your filters or search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="snackbar">
          <div className={`snackbar-content snackbar-${snackbar.type}`}>
            {snackbar.type === "success" && <FiCheckCircle size={20} />}
            {snackbar.type === "error" && <FiXCircle size={20} />}
            {snackbar.type === "info" && <FiAlertCircle size={20} />}
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;