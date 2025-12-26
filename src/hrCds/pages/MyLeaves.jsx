import React, { useState, useEffect, useCallback } from "react";
import axios from "../../utils/axiosConfig";
import {
  FiCalendar,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiList,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import '../Css/MyLeaves.css';

const MyLeaves = () => {
  const [tab, setTab] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [form, setForm] = useState({
    type: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [historyDialog, setHistoryDialog] = useState({
    open: false,
    title: "",
    items: [],
  });
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getHistoryLabel = (h) => {
    if (!h) return "";
    const dateText = h.at
      ? ` on ${new Date(h.at).toLocaleString()}`
      : "";
    const remarksText = h.remarks ? ` — "${h.remarks}"` : "";
    if (h.action === "approved")
      return `✅ Approved by ${h.role}${dateText}${remarksText}`;
    if (h.action === "rejected")
      return `❌ Rejected by ${h.role}${dateText}${remarksText}`;
    if (h.action === "applied") return `📝 Applied${dateText}${remarksText}`;
    return `⏳ Pending${dateText}${remarksText}`;
  };

  const fetchLeaves = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/leaves/status");
      const list = res.data.leaves || [];
      setLeaves(list);
      calculateStats(list);
      if (showRefresh)
        setNotification({
          message: "Leaves data refreshed!",
          severity: "success",
        });
    } catch {
      setNotification({
        message: "Failed to fetch leaves",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const calculateStats = (data) => {
    const approved = data.filter((l) => l.status === "Approved").length;
    const pending = data.filter((l) => l.status === "Pending").length;
    const rejected = data.filter((l) => l.status === "Rejected").length;
    setStats({ total: data.length, approved, pending, rejected });
  };

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : l.status === statusFilter;
    const matchesSearch =
      l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.status.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diff = e - s;
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const applyLeave = async () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setNotification({
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setNotification({
        message: "End date cannot be before start date",
        severity: "error",
      });
      return;
    }

    const payload = {
      type: form.type,
      startDate: new Date(form.startDate).toISOString().split("T")[0],
      endDate: new Date(form.endDate).toISOString().split("T")[0],
      reason: form.reason,
      days: calculateDays(form.startDate, form.endDate),
    };

    try {
      setLoading(true);
      await axios.post("/leaves/apply", payload);
      setNotification({
        message: "Leave applied successfully",
        severity: "success",
      });
      await fetchLeaves();
      setForm({ type: "Casual", startDate: "", endDate: "", reason: "" });
      setTab(0);
    } catch (err) {
      setNotification({
        message:
          err?.response?.data?.message || "Failed to apply leave",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openHistoryModal = (leave) => {
    const items = Array.isArray(leave.history) ? leave.history : [];
    setHistoryDialog({
      open: true,
      title: `${leave.type} Leave — ${leave.user?.name || "Employee"}`,
      items,
    });
  };

  const closeHistoryModal = () => {
    setHistoryDialog({ open: false, title: "", items: [] });
  };

  if (loading && !refreshing) {
    return (
      <div className="MyLeaves-loading">
        <div className="MyLeaves-loading-content">
          <div className="MyLeaves-loading-bar">
            <div className="MyLeaves-loading-progress"></div>
          </div>
          <h2 className="MyLeaves-loading-text">
            Loading your leave records...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="MyLeaves-container">
      {/* Header Section */}
      <div className="MyLeaves-header">
        <div className="MyLeaves-header-content">
          <div className="MyLeaves-header-text">
            <h1 className="MyLeaves-title">Leave Management</h1>
            <p className="MyLeaves-subtitle">
              Manage and track all your leave requests
            </p>
          </div>

          <div className="MyLeaves-header-actions">
            <div className="MyLeaves-search-container">
              <FiSearch className="MyLeaves-search-icon" />
              <input
                type="text"
                placeholder="Search leaves..."
                className="MyLeaves-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="MyLeaves-icon-button"
              onClick={() => fetchLeaves(true)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "MyLeaves-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter !== "ALL" || searchTerm) && (
          <div className="MyLeaves-active-filters">
            <span className="MyLeaves-active-filters-label">Active filters:</span>
            <div className="MyLeaves-filter-chips">
              {statusFilter !== "ALL" && (
                <div className="MyLeaves-filter-chip MyLeaves-primary">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter("ALL")}>×</button>
                </div>
              )}
              {searchTerm && (
                <div className="MyLeaves-filter-chip MyLeaves-secondary">
                  <span>Search: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm("")}>×</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="MyLeaves-stats-grid">
        {[
          {
            key: "total",
            label: "Total Leaves",
            value: stats.total,
            icon: FiCalendar,
            color: "primary",
            filter: "ALL",
          },
          {
            key: "approved",
            label: "Approved",
            value: stats.approved,
            icon: FiCheckCircle,
            color: "success",
            filter: "Approved",
          },
          {
            key: "pending",
            label: "Pending",
            value: stats.pending,
            icon: FiClock,
            color: "warning",
            filter: "Pending",
          },
          {
            key: "rejected",
            label: "Rejected",
            value: stats.rejected,
            icon: FiXCircle,
            color: "error",
            filter: "Rejected",
          },
        ]
        .filter(stat => stat.value > 0)
        .map((stat) => (
          <div
            key={stat.key}
            className={`MyLeaves-stat-card ${statusFilter === stat.filter ? "MyLeaves-active" : ""}`}
            onClick={() =>
              setStatusFilter(
                statusFilter === stat.filter ? "ALL" : stat.filter
              )
            }
          >
            <div className="MyLeaves-stat-card-content">
              <div
                className={`MyLeaves-stat-icon-container MyLeaves-${stat.color}`}
              >
                <stat.icon className="MyLeaves-stat-icon" />
              </div>
              <div className="MyLeaves-stat-details">
                <p className="MyLeaves-stat-label">{stat.label}</p>
                <h3 className="MyLeaves-stat-value">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="MyLeaves-tabs-container">
        <div className="MyLeaves-tabs-header">
          <button
            className={`MyLeaves-tab ${tab === 0 ? "MyLeaves-active-tab" : ""}`}
            onClick={() => setTab(0)}
          >
            <FiCalendar />
            <span>Leave Requests</span>
            {stats.total > 0 && (
              <span className="MyLeaves-tab-badge">{stats.total}</span>
            )}
          </button>
          <button
            className={`MyLeaves-tab ${tab === 1 ? "MyLeaves-active-tab" : ""}`}
            onClick={() => setTab(1)}
          >
            <FiPlus />
            <span>Apply Leave</span>
          </button>
        </div>

        {/* Leave Requests Tab */}
        {tab === 0 && (
          <div className="MyLeaves-requests-tab">
            {/* Results Count */}
            <h3 className="MyLeaves-results-count">
              Showing {filteredLeaves.length} of {leaves.length} records
            </h3>

            {!isMobile ? (
              <div className="MyLeaves-table-container">
                <table className="MyLeaves-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length > 0 ? (
                      filteredLeaves.map((leave) => (
                        <tr
                          key={leave._id}
                          className={`MyLeaves-table-row MyLeaves-status-${leave.status.toLowerCase()}`}
                        >
                          <td>
                            <span
                              className={`MyLeaves-type-chip MyLeaves-type-${leave.type.toLowerCase()}`}
                            >
                              {leave.type}
                            </span>
                          </td>
                          <td>
                            <strong>{formatDate(leave.startDate)}</strong>
                          </td>
                          <td>
                            <strong>{formatDate(leave.endDate)}</strong>
                          </td>
                          <td>
                            <strong className="MyLeaves-days-count">
                              {leave.days}
                            </strong>
                          </td>
                          <td className="MyLeaves-reason-cell">
                            {leave.reason}
                          </td>
                          <td>
                            <span
                              className={`MyLeaves-status-chip MyLeaves-status-${leave.status.toLowerCase()}`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="MyLeaves-history-button"
                              onClick={() => openHistoryModal(leave)}
                            >
                              <FiList />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="MyLeaves-no-data-cell">
                          <FiCalendar className="MyLeaves-no-data-icon" />
                          <h3>No leave requests found</h3>
                          <p>Try adjusting your filters or search terms</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mobile View Cards */
              <div className="MyLeaves-mobile-cards">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className={`MyLeaves-mobile-card MyLeaves-status-${leave.status.toLowerCase()}`}
                    >
                      <div className="MyLeaves-mobile-card-content">
                        <div className="MyLeaves-mobile-card-header">
                          <h3>{leave.type} Leave</h3>
                          <span
                            className={`MyLeaves-mobile-status-chip MyLeaves-status-${leave.status.toLowerCase()}`}
                          >
                            {leave.status}
                          </span>
                        </div>
                        <div className="MyLeaves-mobile-card-date">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </div>
                        <p className="MyLeaves-mobile-card-reason">
                          {leave.reason}
                        </p>
                        <div className="MyLeaves-mobile-card-footer">
                          <strong className="MyLeaves-mobile-days">
                            {leave.days} days
                          </strong>
                          <button
                            className="MyLeaves-mobile-history-button"
                            onClick={() => openHistoryModal(leave)}
                          >
                            <FiList />
                            History
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="MyLeaves-no-data-card">
                    <FiCalendar className="MyLeaves-no-data-icon" />
                    <h3>No leave requests</h3>
                    <p>Adjust your search or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Apply Leave Tab */}
        {tab === 1 && (
          <div className="MyLeaves-apply-tab">
            <div className="MyLeaves-apply-form-container">
              <h2 className="MyLeaves-form-title">Apply for New Leave</h2>
              <p className="MyLeaves-form-subtitle">
                Fill in the details to submit a leave request
              </p>

              <div className="MyLeaves-form">
                {/* Leave Type */}
                <select
                  className="MyLeaves-form-select"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  {["Casual", "Sick", "Paid", "Unpaid", "Other"].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                  )}
                </select>

                {/* Start Date */}
                <div className="MyLeaves-form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="MyLeaves-form-input"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* End Date */}
                <div className="MyLeaves-form-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    className="MyLeaves-form-input"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Day Count */}
                {form.startDate && form.endDate && (
                  <div className="MyLeaves-days-display">
                    <h3>
                      Total Days: {calculateDays(form.startDate, form.endDate)}
                    </h3>
                  </div>
                )}

                {/* Reason */}
                <div className="MyLeaves-form-field">
                  <label>Reason for Leave</label>
                  <textarea
                    className="MyLeaves-form-textarea"
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Enter the reason for your leave..."
                    rows="4"
                  />
                </div>

                {/* Submit Button */}
                <button
                  className="MyLeaves-submit-button"
                  onClick={applyLeave}
                >
                  Submit Leave Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Dialog */}
      {historyDialog.open && (
        <div className="MyLeaves-modal-overlay" onClick={closeHistoryModal}>
          <div
            className="MyLeaves-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="MyLeaves-modal-header">
              <h2>Action History</h2>
              <p>{historyDialog.title}</p>
            </div>

            <div className="MyLeaves-modal-body">
              <div className="MyLeaves-history-list">
                {historyDialog.items.length ? (
                  historyDialog.items.map((h, i) => (
                    <div
                      key={i}
                      className={`MyLeaves-history-item MyLeaves-history-${h.action}`}
                    >
                      <p>{getHistoryLabel(h)}</p>
                    </div>
                  ))
                ) : (
                  <div className="MyLeaves-no-history">
                    <FiInfo className="MyLeaves-no-history-icon" />
                    <h3>No history available</h3>
                  </div>
                )}
              </div>
            </div>

            <div className="MyLeaves-modal-footer">
              <button
                className="MyLeaves-modal-close-button"
                onClick={closeHistoryModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Snackbar */}
      {notification?.message && (
        <div className={`MyLeaves-notification MyLeaves-notification-${notification.severity}`}>
          <div className="MyLeaves-notification-content">
            {notification.severity === "error" ? (
              <FiXCircle className="MyLeaves-notification-icon" />
            ) : (
              <FiCheckCircle className="MyLeaves-notification-icon" />
            )}
            <span className="MyLeaves-notification-message">
              {notification.message}
            </span>
          </div>
          <button
            className="MyLeaves-notification-close"
            onClick={() => setNotification(null)}
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;