import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import {
  FiPackage,
  FiSmartphone,
  FiHeadphones,
  FiCpu,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPlus,
  FiSearch,
  FiSettings,
  FiMonitor,
  FiTrendingUp,
  FiAlertCircle,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import "../Css/MyAssets.css";

const MyAssets = () => {
  const [newAsset, setNewAsset] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    approvalRate: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  const allowedAssets = [
    { value: "phone", label: "Smartphone", icon: FiSmartphone, color: "primary" },
    { value: "sim", label: "SIM Card", icon: FiCpu, color: "secondary" },
    { value: "laptop", label: "Laptop", icon: FiMonitor, color: "info" },
    { value: "desktop", label: "Desktop", icon: FiSettings, color: "warning" },
    { value: "headphone", label: "Headphones", icon: FiHeadphones, color: "success" },
  ];

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/assets/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.requests || [];
      setRequests(data);
      calculateStats(data);
      if (showRefresh) {
        setNotification({
          message: "Asset data refreshed!",
          severity: "success",
        });
      }
    } catch (err) {
      setNotification({
        message: "Failed to fetch requests",
        severity: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (data) => {
    const approved = data.filter((r) => r.status === "approved").length;
    const pending = data.filter((r) => r.status === "pending").length;
    const rejected = data.filter((r) => r.status === "rejected").length;
    
    setStats({
      total: data.length,
      approved,
      pending,
      rejected,
      approvalRate: data.length > 0 ? Math.round((approved / data.length) * 100) : 0,
    });
  };

  useEffect(() => {
    fetchRequests();
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setProperties(JSON.parse(userData).properties || []);
      } catch {}
    }
  }, []);

  const handleRequest = async () => {
    if (!newAsset) {
      setNotification({ message: "Please select an asset.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/assets/request",
        { assetName: newAsset },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification({ 
        message: "🎉 Request submitted successfully!", 
        severity: "success" 
      });
      setNewAsset("");
      fetchRequests();
    } catch {
      setNotification({ 
        message: "❌ Request failed. Please try again.", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getAssetIcon = (assetType) => {
    const asset = allowedAssets.find(a => a.value === assetType);
    return asset ? asset.icon : FiPackage;
  };

  const getAssetColor = (assetType) => {
    const asset = allowedAssets.find(a => a.value === assetType);
    return asset ? asset.color : 'primary';
  };

  return (
    <div className="MyAssets-container">
      {/* Header */}
      <div className="MyAssets-header">
        <div className="MyAssets-header-content">
          <div className="MyAssets-header-text">
            <h1 className="MyAssets-title">Asset Management</h1>
            <p className="MyAssets-subtitle">
              Manage and request assets with real-time status tracking
            </p>
          </div>

          <div className="MyAssets-header-actions">
            <button
              className="MyAssets-icon-button"
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "MyAssets-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="MyAssets-stats-grid">
        {[
          { 
            key: "total", 
            label: "Total Requests", 
            color: "primary", 
            icon: FiPackage,
            value: stats.total,
          },
          { 
            key: "approved", 
            label: "Approved", 
            color: "success", 
            icon: FiCheckCircle,
            value: stats.approved,
            extra: `${stats.approvalRate}%`
          },
          { 
            key: "pending", 
            label: "Pending", 
            color: "warning", 
            icon: FiClock,
            value: stats.pending,
          },
          { 
            key: "rejected", 
            label: "Rejected", 
            color: "error", 
            icon: FiXCircle,
            value: stats.rejected,
          },
        ]
        .filter(stat => stat.value > 0)
        .map((stat) => (
          <div
            key={stat.key}
            className={`MyAssets-stat-card ${filterStatus === (stat.key === "total" ? "all" : stat.key) ? "MyAssets-active" : ""}`}
            onClick={() => setFilterStatus(stat.key === "total" ? "all" : stat.key)}
          >
            <div className="MyAssets-stat-card-content">
              <div className={`MyAssets-stat-avatar MyAssets-${stat.color}`}>
                <stat.icon className="MyAssets-stat-icon" />
              </div>
              <div className="MyAssets-stat-details">
                <p className="MyAssets-stat-label">{stat.label}</p>
                <div className="MyAssets-stat-value-container">
                  <h3 className="MyAssets-stat-value">{stat.value}</h3>
                  {stat.extra && (
                    <span className="MyAssets-stat-extra">{stat.extra}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards Grid */}
      <div className="MyAssets-action-grid">
        {/* Request New Asset Card */}
        <div className="MyAssets-request-card">
          <div className="MyAssets-card-content">
            <div className="MyAssets-card-header">
              <h2 className="MyAssets-card-title">🚀 Request New Asset</h2>
              <p className="MyAssets-card-subtitle">
                Select from available assets to make a request
              </p>
            </div>

            <div className="MyAssets-form-section">
              <select
                className="MyAssets-asset-select"
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
              >
                <option value="">Select asset type...</option>
                {allowedAssets.map((asset) => (
                  <option key={asset.value} value={asset.value}>
                    {asset.label}
                  </option>
                ))}
              </select>

              <button
                className="MyAssets-submit-button"
                onClick={handleRequest}
                disabled={!newAsset || loading}
              >
                {loading ? (
                  <>
                    <span className="MyAssets-loading-spinner"></span>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <FiPlus className="MyAssets-button-icon" />
                    Request Asset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Properties Card */}
        <div className="MyAssets-properties-card">
          <div className="MyAssets-card-content">
            <div className="MyAssets-card-header">
              <h2 className="MyAssets-card-title">💼 My Assigned Assets</h2>
              <p className="MyAssets-card-subtitle">
                Assets currently assigned to you
              </p>
            </div>

            <div className="MyAssets-properties-list">
              {properties.length > 0 ? (
                properties.map((item, idx) => (
                  <div key={idx} className="MyAssets-property-item">
                    <div className="MyAssets-property-content">
                      <div className="MyAssets-property-icon">
                        <FiPackage />
                      </div>
                      <div className="MyAssets-property-details">
                        <h4>{item}</h4>
                        <p>Company-assigned asset • Active</p>
                      </div>
                      <span className="MyAssets-property-status MyAssets-status-approved">Active</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="MyAssets-no-properties">
                  <FiPackage className="MyAssets-no-properties-icon" />
                  <h3>No Assets Assigned</h3>
                  <p>Your assigned assets will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <div className="MyAssets-requests-section">
        <div className="MyAssets-requests-header">
          <div className="MyAssets-requests-title-section">
            <h2>📋 Asset Requests</h2>
            <p>Track your asset request history and status</p>
          </div>

          <div className="MyAssets-requests-actions">
            <div className="MyAssets-search-container">
              <FiSearch className="MyAssets-search-icon" />
              <input
                type="text"
                placeholder="Search requests..."
                className="MyAssets-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="MyAssets-filter-tabs">
          <button
            className={`MyAssets-filter-tab ${filterStatus === "all" ? "MyAssets-active-tab" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Requests ({stats.total})
          </button>
          <button
            className={`MyAssets-filter-tab ${filterStatus === "approved" ? "MyAssets-active-tab" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={`MyAssets-filter-tab ${filterStatus === "pending" ? "MyAssets-active-tab" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`MyAssets-filter-tab ${filterStatus === "rejected" ? "MyAssets-active-tab" : ""}`}
            onClick={() => setFilterStatus("rejected")}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Requests Table (Desktop) */}
        {!isMobile && (
          <div className="MyAssets-table-container">
            <table className="MyAssets-table">
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Requested At</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const AssetIcon = getAssetIcon(req.assetName);
                    const assetColor = getAssetColor(req.assetName);
                    return (
                      <tr
                        key={req._id}
                        className={`MyAssets-table-row MyAssets-status-${req.status}`}
                      >
                        <td>
                          <div className="MyAssets-asset-cell">
                            <div className={`MyAssets-asset-icon MyAssets-${assetColor}`}>
                              <AssetIcon />
                            </div>
                            <span className="MyAssets-asset-name">{req.assetName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`MyAssets-status-chip MyAssets-status-${req.status}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {req.approvedBy
                              ? `${req.approvedBy.name} (${req.approvedBy.role})`
                              : req.status === "pending"
                              ? "Pending Approval"
                              : "Not Approved"}
                          </strong>
                        </td>
                        <td>
                          <strong>{formatDate(req.createdAt)}</strong>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="MyAssets-no-data-cell">
                      <FiPackage className="MyAssets-no-data-icon" />
                      <h3>No requests found</h3>
                      <p>
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Start by requesting a new asset"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards View */}
        {isMobile && (
          <div className="MyAssets-mobile-cards">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => {
                const AssetIcon = getAssetIcon(req.assetName);
                const assetColor = getAssetColor(req.assetName);
                return (
                  <div
                    key={req._id}
                    className={`MyAssets-mobile-card MyAssets-status-${req.status}`}
                  >
                    <div className="MyAssets-mobile-card-content">
                      <div className="MyAssets-mobile-card-header">
                        <div className="MyAssets-mobile-asset-info">
                          <div className={`MyAssets-mobile-asset-icon MyAssets-${assetColor}`}>
                            <AssetIcon />
                          </div>
                          <div>
                            <h3 className="MyAssets-mobile-asset-name">{req.assetName}</h3>
                            <p className="MyAssets-mobile-asset-date">
                              Requested on {formatDate(req.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`MyAssets-mobile-status-chip MyAssets-status-${req.status}`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="MyAssets-mobile-card-divider"></div>

                      <div className="MyAssets-mobile-card-details">
                        <p>
                          <strong>Approved By:</strong>{" "}
                          {req.approvedBy
                            ? `${req.approvedBy.name} (${req.approvedBy.role})`
                            : req.status === "pending"
                            ? "Pending Approval"
                            : "Not Approved"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="MyAssets-no-data-card">
                <FiPackage className="MyAssets-no-data-icon" />
                <h3>No requests found</h3>
                <p>
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start by requesting a new asset"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`MyAssets-notification MyAssets-notification-${notification.severity}`}>
          <div className="MyAssets-notification-content">
            {notification.severity === "error" ? (
              <FiXCircle className="MyAssets-notification-icon" />
            ) : (
              <FiCheckCircle className="MyAssets-notification-icon" />
            )}
            <div className="MyAssets-notification-text">
              <strong>{notification.severity === "error" ? "Error" : "Success"}</strong>
              <p>{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssets;