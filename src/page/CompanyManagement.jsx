import React, { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import API_URL from "../config";

/**
 * ✅ Enhanced FormField Component
 */
const FormField = memo(
  ({ label, name, type = "text", placeholder, required, value, onChange, error, autoComplete }) => {
    return (
      <div style={{ marginBottom: "20px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <label style={{ 
            display: "block", 
            fontWeight: "600", 
            color: "#1f2937",
            fontSize: "14px",
          }}>
            {label}
          </label>
          {required && (
            <span style={{ 
              marginLeft: "4px", 
              color: "#ef4444", 
              fontSize: "12px",
              fontWeight: "500"
            }}>• Required</span>
          )}
        </div>

        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete || "off"}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: error ? "2px solid #ef4444" : "1px solid #e5e7eb",
            fontSize: "14px",
            backgroundColor: error ? "#fef2f2" : "#f9fafb",
            outline: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontWeight: "500",
            color: "#111827",
            boxShadow: error ? "0 1px 2px rgba(239, 68, 68, 0.1)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#3b82f6";
            e.target.style.backgroundColor = error ? "#fef2f2" : "#ffffff";
            e.target.style.boxShadow = error 
              ? "0 0 0 3px rgba(239, 68, 68, 0.1)" 
              : "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
            e.target.style.backgroundColor = error ? "#fef2f2" : "#f9fafb";
            e.target.style.boxShadow = error 
              ? "0 1px 2px rgba(239, 68, 68, 0.1)" 
              : "0 1px 2px rgba(0, 0, 0, 0.05)";
          }}
        />

        {error && (
          <div
            style={{
              color: "#dc2626",
              fontSize: "13px",
              marginTop: "8px",
              padding: "10px 14px",
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderLeft: "3px solid #dc2626",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ color: "white", fontSize: "12px" }}>!</span>
            </div>
            <span style={{ fontWeight: "500" }}>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

const CompanyManagement = () => {
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyPhone: "",
    ownerName: "",
    logo: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("view"); // Only view mode now
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searchId, setSearchId] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      
      /* Responsive styles */
      @media (max-width: 768px) {
        .responsive-grid {
          grid-template-columns: 1fr !important;
          gap: 15px !important;
        }
        
        .responsive-flex {
          flex-direction: column !important;
          gap: 12px !important;
        }
        
        .responsive-padding {
          padding: 20px 15px !important;
        }
        
        .responsive-text {
          font-size: 24px !important;
        }
        
        .responsive-table {
          display: block !important;
          overflow-x: auto !important;
        }
        
        .responsive-table th,
        .responsive-table td {
          white-space: nowrap !important;
          padding: 12px 8px !important;
          font-size: 12px !important;
        }
        
        .responsive-buttons {
          flex-wrap: wrap !important;
          gap: 6px !important;
        }
        
        .responsive-button {
          padding: 6px 10px !important;
          font-size: 11px !important;
          min-width: auto !important;
        }
        
        .responsive-header {
          flex-direction: column !important;
          gap: 15px !important;
          text-align: center !important;
          padding: 20px !important;
        }
        
        .responsive-search-grid {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
        }
        
        .responsive-search-input {
          flex-direction: column !important;
          gap: 10px !important;
        }
        
        .responsive-search-button {
          width: 100% !important;
          justify-content: center !important;
        }
        
        .responsive-company-details {
          grid-template-columns: 1fr !important;
        }
        
        .responsive-actions {
          flex-direction: column !important;
          gap: 8px !important;
        }
        
        .responsive-action-button {
          width: 100% !important;
          justify-content: center !important;
        }
      }
      
      @media (min-width: 769px) and (max-width: 1024px) {
        .responsive-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 20px !important;
        }
        
        .responsive-table th,
        .responsive-table td {
          padding: 14px 12px !important;
          font-size: 13px !important;
        }
        
        .responsive-padding {
          padding: 25px 20px !important;
        }
        
        .responsive-text {
          font-size: 26px !important;
        }
        
        .responsive-search-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 20px !important;
        }
        
        .responsive-search-input {
          flex-direction: column !important;
          gap: 10px !important;
        }
        
        .responsive-search-button {
          width: 100% !important;
          justify-content: center !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // ✅ Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const clearMessages = () => {
    setMsg("");
    setError("");
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/company`);

      if (res.data?.success && Array.isArray(res.data?.data)) {
        setCompanies(res.data.data);
      } else if (Array.isArray(res.data?.companies)) {
        setCompanies(res.data.companies);
      } else if (Array.isArray(res.data)) {
        setCompanies(res.data);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setCompanies([]);
      setError("Failed to load companies. Please check backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear field error instantly
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  // ✅ Client-side validation
  const validateForm = () => {
    const errors = {};
    const {
      companyName,
      companyEmail,
      companyAddress,
      companyPhone,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = form;

    // Required fields
    if (!companyName?.trim()) errors.companyName = "Company name is required";
    if (!companyEmail?.trim()) errors.companyEmail = "Company email is required";
    if (!companyAddress?.trim()) errors.companyAddress = "Company address is required";
    if (!companyPhone?.trim()) errors.companyPhone = "Company phone is required";
    if (!ownerName?.trim()) errors.ownerName = "Owner name is required";
    if (!ownerEmail?.trim()) errors.ownerEmail = "Owner email is required";

    // Password only in create mode
    if (!isEditing && !ownerPassword?.trim()) {
      errors.ownerPassword = "Owner password is required";
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (companyEmail && !emailRegex.test(companyEmail)) {
      errors.companyEmail = "Invalid company email format";
    }
    if (ownerEmail && !emailRegex.test(ownerEmail)) {
      errors.ownerEmail = "Invalid owner email format";
    }

    // Phone format check
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (companyPhone && !phoneRegex.test(companyPhone)) {
      errors.companyPhone = "Phone must be 10-15 digits";
    }

    // Password strength
    if (!isEditing && ownerPassword && ownerPassword.length < 6) {
      errors.ownerPassword = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      companyName: "",
      companyEmail: "",
      companyAddress: "",
      companyPhone: "",
      ownerName: "",
      logo: "",
      ownerEmail: "",
      ownerPassword: "",
    });
    setFormErrors({});
  };

  // ✅ Update only (no create)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    clearMessages();

    if (!validateForm()) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const formData = { ...form };

      // ✅ If editing and password empty -> remove from payload
      if (isEditing && !formData.ownerPassword?.trim()) {
        delete formData.ownerPassword;
      }

      if (isEditing && selectedCompany?._id) {
        const res = await axios.put(
          `${API_URL}/company/${selectedCompany._id}`,
          formData
        );
        setMsg(res.data?.message || "Company updated successfully ✅");
        resetForm();
        setSelectedCompany(null);
        setIsEditing(false);
        setViewMode("view");
        fetchCompanies();
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);

      let errorMessage = "Something went wrong ❌";

      if (err.response?.data) {
        if (Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.join(". ");
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Check backend connection.";
      } else {
        errorMessage = err.message || "Unexpected error";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // ✅ Edit
  const handleEdit = (company) => {
    clearMessages();

    setForm({
      companyName: company.companyName || "",
      companyEmail: company.companyEmail || "",
      companyAddress: company.companyAddress || "",
      companyPhone: company.companyPhone || "",
      ownerName: company.ownerName || "",
      logo: company.logo || "",
      ownerEmail: company.ownerEmail || "",
      ownerPassword: "",
    });

    setSelectedCompany(company);
    setIsEditing(true);
    setViewMode("edit"); // Changed to edit mode

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ View
  const handleView = (company) => {
    clearMessages();
    setSelectedCompany(company);
    setViewMode("view");
  };

  // ✅ Deactivate
  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this company? All users will be locked.")) {
      return;
    }

    try {
      await axios.patch(`${API_URL}/company/${id}/deactivate`);
      setMsg("Company deactivated successfully ✅");
      fetchCompanies();

      if (selectedCompany?._id === id) {
        setSelectedCompany((prev) => (prev ? { ...prev, isActive: false } : null));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to deactivate company");
    }
  };

  // ✅ Activate
  const handleActivate = async (id) => {
    try {
      await axios.patch(`${API_URL}/company/${id}/activate`);
      setMsg("Company activated successfully ✅");
      fetchCompanies();

      if (selectedCompany?._id === id) {
        setSelectedCompany((prev) => (prev ? { ...prev, isActive: true } : null));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to activate company");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    setShowDeleteConfirm(true);
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/company/${deleteTargetId}`);
      setMsg("Company deleted successfully ✅");
      fetchCompanies();

      if (selectedCompany?._id === deleteTargetId) {
        setSelectedCompany(null);
        setViewMode("view");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete company");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  // ✅ Search by Code
  const handleGetByCode = async () => {
    if (!searchCode.trim()) {
      setError("Please enter a company code");
      return;
    }

    clearMessages();

    try {
      const res = await axios.get(`${API_URL}/company/code/${searchCode.trim()}`);
      if (res.data?.company) {
        setSelectedCompany(res.data.company);
        setViewMode("view");
      } else {
        setError("Company not found with this code");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Company not found");
    }
  };

  // ✅ Search by ID
  const handleGetById = async () => {
    if (!searchId.trim()) {
      setError("Please enter a company ID");
      return;
    }

    clearMessages();

    try {
      const res = await axios.get(`${API_URL}/company/${searchId.trim()}`);
      if (res.data?.company) {
        setSelectedCompany(res.data.company);
        setViewMode("view");
      } else {
        setError("Company not found");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Company not found");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: isMobile ? "15px 10px" : isTablet ? "20px 15px" : "30px 20px",
      position: "relative",
    }}>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease-out",
          padding: "20px",
        }}>
          <div style={{
            background: "white",
            padding: isMobile ? "25px 20px" : "40px",
            borderRadius: "20px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            animation: "slideIn 0.3s ease-out",
          }}>
            <div style={{
              fontSize: isMobile ? "50px" : "60px",
              textAlign: "center",
              marginBottom: "20px",
              color: "#ef4444",
            }}>
              ⚠️
            </div>
            <h3 style={{
              textAlign: "center",
              marginBottom: "15px",
              color: "#1f2937",
              fontSize: isMobile ? "20px" : "24px",
            }}>
              Confirm Deletion
            </h3>
            <p style={{
              textAlign: "center",
              color: "#6b7280",
              marginBottom: "30px",
              fontSize: isMobile ? "14px" : "16px",
              lineHeight: 1.5,
            }}>
              ⚠️ <strong>WARNING:</strong> This action cannot be undone. 
              This will permanently delete the company and all associated users.
            </p>
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexDirection: isMobile ? "column" : "row",
            }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                }}
                style={{
                  padding: isMobile ? "12px 20px" : "14px 30px",
                  background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: isMobile ? "14px" : "16px",
                  transition: "all 0.3s",
                  minWidth: isMobile ? "auto" : "120px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: isMobile ? "12px 20px" : "14px 30px",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: isMobile ? "14px" : "16px",
                  transition: "all 0.3s",
                  minWidth: isMobile ? "auto" : "120px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(239, 68, 68, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        position: "relative",
        animation: "fadeIn 0.8s ease-out",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "30px",
          padding: isMobile ? "20px" : "25px 30px",
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px -10px rgba(37, 99, 235, 0.3)",
          position: "relative",
          overflow: "hidden",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "15px" : "0",
          textAlign: isMobile ? "center" : "left",
        }}
        className="responsive-header"
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "20px",
            flexDirection: isMobile ? "column" : "row",
            textAlign: isMobile ? "center" : "left",
          }}>
            <div style={{
              width: isMobile ? "60px" : "70px",
              height: isMobile ? "60px" : "70px",
              borderRadius: "16px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              animation: "float 3s ease-in-out infinite",
            }}>
              <span style={{ fontSize: isMobile ? "28px" : "35px", color: "#1e40af" }}>🏢</span>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? "24px" : "32px",
                fontWeight: "800",
                color: "white",
                letterSpacing: "-0.5px",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
              className="responsive-text"
              >
                Company Management
              </h1>
              <p style={{
                margin: "8px 0 0 0",
                color: "#dbeafe",
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "500",
              }}>
                Manage and oversee all registered companies
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchCompanies}
            disabled={loading}
            style={{
              padding: isMobile ? "12px 20px" : "14px 28px",
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "14px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: isMobile ? "13px" : "15px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s",
              minWidth: isMobile ? "100%" : "auto",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "18px",
                  height: "18px",
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Refreshing...
              </>
            ) : (
              <>
                <span>🔄</span>
                Refresh List
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        <div style={{ marginBottom: "30px" }}>
          {msg && (
            <div style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              padding: isMobile ? "20px" : "25px",
              borderRadius: "16px",
              marginBottom: "15px",
              position: "relative",
              overflow: "hidden",
              animation: "slideIn 0.5s ease-out",
            }}>
              <div style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              }} />
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "20px",
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left",
              }}>
                <div style={{
                  width: isMobile ? "40px" : "50px",
                  height: isMobile ? "40px" : "50px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "20px" : "24px",
                  flexShrink: 0,
                }}>
                  ✅
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: isMobile ? "18px" : "22px", 
                    fontWeight: "700" 
                  }}>
                    Success!
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? "14px" : "16px", 
                    opacity: 0.95 
                  }}>
                    {msg}
                  </p>
                </div>
                <button 
                  onClick={clearMessages}
                  style={{
                    padding: isMobile ? "8px 20px" : "10px 24px",
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: isMobile ? "13px" : "14px",
                    transition: "all 0.3s",
                    backdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              padding: isMobile ? "20px" : "25px",
              borderRadius: "16px",
              marginBottom: "15px",
              position: "relative",
              overflow: "hidden",
              animation: "slideIn 0.5s ease-out",
            }}>
              <div style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "100px",
                height: "100px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              }} />
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "20px",
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left",
              }}>
                <div style={{
                  width: isMobile ? "40px" : "50px",
                  height: isMobile ? "40px" : "50px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "20px" : "24px",
                  flexShrink: 0,
                }}>
                  ❌
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: isMobile ? "18px" : "22px", 
                    fontWeight: "700" 
                  }}>
                    Error
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: isMobile ? "14px" : "16px", 
                    opacity: 0.95 
                  }}>
                    {error}
                  </p>
                </div>
                <button 
                  onClick={clearMessages}
                  style={{
                    padding: isMobile ? "8px 20px" : "10px 24px",
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: isMobile ? "13px" : "14px",
                    transition: "all 0.3s",
                    backdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          padding: isMobile ? "20px" : "30px",
          borderRadius: "20px",
          marginBottom: "30px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.1)",
        }}
        className="responsive-padding"
        >
          <h3 style={{ 
            marginBottom: "25px", 
            color: "#1e40af",
            fontSize: isMobile ? "20px" : "24px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: isMobile ? "24px" : "28px" }}>🔍</span>
            Search Company
          </h3>

          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr", 
              gap: isMobile ? "25px" : "25px",
              marginBottom: "25px",
            }}
            className="responsive-search-grid"
          >
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                flexWrap: "wrap",
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                }}>
                  🔢
                </div>
                <span style={{ fontWeight: "600", color: "#374151" }}>Search by Company Code</span>
              </div>
              <div style={{ 
                display: "flex", 
                gap: "12px",
                flexDirection: isMobile ? "column" : "row",
              }}
              className="responsive-search-input"
              >
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Enter Company Code (e.g., CIIS)"
                  autoComplete="off"
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "15px",
                    background: "#f9fafb",
                    outline: "none",
                    transition: "all 0.3s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleGetByCode()}
                />
                <button
                  onClick={handleGetByCode}
                  disabled={!searchCode.trim()}
                  style={{
                    padding: "14px 24px",
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: !searchCode.trim() ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: "15px",
                    transition: "all 0.3s",
                    opacity: !searchCode.trim() ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: isMobile ? "auto" : "160px",
                    justifyContent: "center",
                    width: isMobile ? "100%" : "auto",
                  }}
                  className="responsive-search-button"
                  onMouseEnter={(e) => {
                    if (searchCode.trim()) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchCode.trim()) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <span>🔍</span>
                  Search
                </button>
              </div>
            </div>

            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                flexWrap: "wrap",
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                }}>
                  🆔
                </div>
                <span style={{ fontWeight: "600", color: "#374151" }}>Search by Company ID</span>
              </div>
              <div style={{ 
                display: "flex", 
                gap: "12px",
                flexDirection: isMobile ? "column" : "row",
              }}
              className="responsive-search-input"
              >
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Company ID"
                  autoComplete="off"
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "15px",
                    background: "#f9fafb",
                    outline: "none",
                    transition: "all 0.3s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleGetById()}
                />
                <button
                  onClick={handleGetById}
                  disabled={!searchId.trim()}
                  style={{
                    padding: "14px 24px",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: !searchId.trim() ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: "15px",
                    transition: "all 0.3s",
                    opacity: !searchId.trim() ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: isMobile ? "auto" : "160px",
                    justifyContent: "center",
                    width: isMobile ? "100%" : "auto",
                  }}
                  className="responsive-search-button"
                  onMouseEnter={(e) => {
                    if (searchId.trim()) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchId.trim()) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <span>🔎</span>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form (Only shows when editing) */}
        {viewMode === "edit" && isEditing && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: isMobile ? "20px" : "35px",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
            marginBottom: "30px",
          }}
          className="responsive-padding"
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "30px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "15px" : "0",
              textAlign: isMobile ? "center" : "left",
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "16px",
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left",
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  padding: "14px",
                  borderRadius: "14px",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                }}>
                  <span style={{ fontSize: "26px", color: "white" }}>✏️</span>
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    color: "#f59e0b",
                    fontSize: isMobile ? "22px" : "28px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                  }}>
                    Edit Company
                  </h2>
                  <p style={{
                    margin: "8px 0 0 0",
                    color: "#6b7280",
                    fontSize: isMobile ? "13px" : "15px",
                  }}>
                    Update company details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSelectedCompany(null);
                  setIsEditing(false);
                  setViewMode("view");
                  clearMessages();
                }}
                style={{
                  padding: isMobile ? "10px 20px" : "12px 24px",
                  background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: isMobile ? "13px" : "14px",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "center",
                  width: isMobile ? "100%" : "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span>←</span>
                Back to List
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Company Details Section */}
              <div style={{ marginBottom: "35px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "25px",
                  flexWrap: "wrap",
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "22px", color: "#1e40af" }}>🏢</span>
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: "#1e40af",
                    fontSize: isMobile ? "18px" : "22px",
                    fontWeight: "700",
                  }}>
                    Company Details
                  </h3>
                </div>

                <div 
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "22px",
                    marginBottom: "22px",
                  }}
                  className="responsive-grid"
                >
                  <FormField
                    label="Company Name"
                    name="companyName"
                    placeholder="Enter company name"
                    required
                    value={form.companyName}
                    onChange={handleChange}
                    error={formErrors.companyName}
                    autoComplete="off"
                  />

                  <FormField
                    label="Company Email"
                    name="companyEmail"
                    type="email"
                    placeholder="company@example.com"
                    required
                    value={form.companyEmail}
                    onChange={handleChange}
                    error={formErrors.companyEmail}
                    autoComplete="off"
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <FormField
                    label="Company Address"
                    name="companyAddress"
                    placeholder="Full company address"
                    required
                    value={form.companyAddress}
                    onChange={handleChange}
                    error={formErrors.companyAddress}
                    autoComplete="off"
                  />
                </div>

                <div 
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "22px",
                    marginBottom: "22px",
                  }}
                  className="responsive-grid"
                >
                  <FormField
                    label="Company Phone"
                    name="companyPhone"
                    placeholder="+1234567890"
                    required
                    value={form.companyPhone}
                    onChange={handleChange}
                    error={formErrors.companyPhone}
                    autoComplete="off"
                  />

                  <FormField
                    label="Logo URL (optional)"
                    name="logo"
                    placeholder="https://example.com/logo.png"
                    required={false}
                    value={form.logo}
                    onChange={handleChange}
                    error={formErrors.logo}
                    autoComplete="off"
                  />
                </div>

                <FormField
                  label="Owner Name"
                  name="ownerName"
                  placeholder="Owner full name"
                  required
                  value={form.ownerName}
                  onChange={handleChange}
                  error={formErrors.ownerName}
                  autoComplete="off"
                />
              </div>

              {/* Owner Details Section */}
              <div style={{ marginBottom: "35px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "25px",
                  flexWrap: "wrap",
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "22px", color: "#059669" }}>👤</span>
                  </div>
                  <h3 style={{
                    margin: 0,
                    color: "#059669",
                    fontSize: isMobile ? "18px" : "22px",
                    fontWeight: "700",
                  }}>
                    Owner Login Details
                  </h3>
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <FormField
                    label="Owner Email"
                    name="ownerEmail"
                    type="email"
                    placeholder="owner@example.com"
                    required
                    value={form.ownerEmail}
                    onChange={handleChange}
                    error={formErrors.ownerEmail}
                    autoComplete="off"
                  />
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: "25px" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ 
                      display: "block", 
                      fontWeight: "600", 
                      color: "#1f2937",
                      fontSize: "14px",
                    }}>
                      Owner Password <span style={{ color: "#6b7280", fontSize: "12px" }}>(Optional)</span>
                    </label>
                  </div>

                  <input
                    type="password"
                    name="ownerPassword"
                    placeholder="Leave blank to keep current password"
                    value={form.ownerPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: formErrors.ownerPassword ? "2px solid #ef4444" : "1px solid #e5e7eb",
                      fontSize: "14px",
                      backgroundColor: formErrors.ownerPassword ? "#fef2f2" : "#f9fafb",
                      outline: "none",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontWeight: "500",
                      color: "#111827",
                      boxShadow: formErrors.ownerPassword ? "0 1px 2px rgba(239, 68, 68, 0.1)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = formErrors.ownerPassword ? "#ef4444" : "#3b82f6";
                      e.target.style.backgroundColor = formErrors.ownerPassword ? "#fef2f2" : "#ffffff";
                      e.target.style.boxShadow = formErrors.ownerPassword 
                        ? "0 0 0 3px rgba(239, 68, 68, 0.1)" 
                        : "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = formErrors.ownerPassword ? "#ef4444" : "#e5e7eb";
                      e.target.style.backgroundColor = formErrors.ownerPassword ? "#fef2f2" : "#f9fafb";
                      e.target.style.boxShadow = formErrors.ownerPassword 
                        ? "0 1px 2px rgba(239, 68, 68, 0.1)" 
                        : "0 1px 2px rgba(0, 0, 0, 0.05)";
                    }}
                  />

                  {formErrors.ownerPassword && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "13px",
                        marginTop: "8px",
                        padding: "10px 14px",
                        background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderLeft: "3px solid #dc2626",
                        animation: "slideIn 0.3s ease-out",
                      }}
                    >
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <span style={{ color: "white", fontSize: "12px" }}>!</span>
                      </div>
                      <span style={{ fontWeight: "500" }}>{formErrors.ownerPassword}</span>
                    </div>
                  )}

                  <div style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#6b7280",
                    paddingLeft: "4px",
                  }}>
                    💡 Leave empty to keep the current password
                  </div>
                </div>
              </div>

              <div style={{ 
                display: "flex", 
                gap: "15px",
                flexDirection: isMobile ? "column" : "row",
              }}
              className="responsive-flex"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: isMobile ? "16px 20px" : "18px 30px",
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: isMobile ? "15px" : "17px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    opacity: isSubmitting ? 0.8 : 1,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 10px 25px rgba(245, 158, 11, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 15px 35px rgba(245, 158, 11, 0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(245, 158, 11, 0.25)";
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: "22px",
                        height: "22px",
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: isMobile ? "20px" : "22px" }}>✏️</span>
                      <span>Update Company</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setSelectedCompany(null);
                    setIsEditing(false);
                    setViewMode("view");
                    clearMessages();
                  }}
                  style={{
                    padding: isMobile ? "16px 20px" : "18px 30px",
                    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    color: "#374151",
                    border: "none",
                    borderRadius: "14px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: isMobile ? "15px" : "17px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.3s",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span>←</span>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content - Only Company List */}
        <div>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: isMobile ? "20px" : "35px",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          className="responsive-padding"
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "30px",
              paddingBottom: "20px",
              borderBottom: "2px solid #e5e7eb",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "15px" : "0",
              textAlign: isMobile ? "center" : "left",
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "16px",
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left",
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
                  padding: "14px",
                  borderRadius: "14px",
                  boxShadow: "0 8px 20px rgba(168, 85, 247, 0.2)",
                }}>
                  <span style={{ fontSize: "26px", color: "white" }}>📋</span>
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    color: "#7c3aed",
                    fontSize: isMobile ? "22px" : "28px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                  }}>
                    Companies List
                  </h2>
                  <p style={{
                    margin: "8px 0 0 0",
                    color: "#6b7280",
                    fontSize: isMobile ? "13px" : "15px",
                  }}>
                    Total: <strong>{companies.length}</strong> companies registered
                  </p>
                </div>
              </div>

              <div style={{
                padding: "8px 16px",
                background: companies.length > 0 ? "#10b981" : "#6b7280",
                color: "white",
                borderRadius: "999px",
                fontWeight: "700",
                fontSize: isMobile ? "12px" : "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span>{companies.length > 0 ? "✅" : "📊"}</span>
                {companies.length} companies
              </div>
            </div>

            {/* Company Details Card (View Mode) */}
            {viewMode === "view" && selectedCompany && (
              <div style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                padding: isMobile ? "20px" : "28px",
                borderRadius: "18px",
                marginBottom: "25px",
                border: "2px solid #e5e7eb",
                animation: "slideIn 0.4s ease-out",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? "15px" : "0",
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: "0 0 10px 0",
                      color: "#1e40af",
                      fontSize: isMobile ? "20px" : "24px",
                      fontWeight: "700",
                    }}>
                      {selectedCompany.companyName}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: isMobile ? "13px" : "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}>
                      <code style={{
                        background: "#e0e7ff",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        color: "#3730a3",
                        fontSize: isMobile ? "12px" : "14px",
                      }}>
                        {selectedCompany.companyCode || "N/A"}
                      </code>
                      <span style={{ display: isMobile ? "none" : "inline" }}>•</span>
                      <span>Owner: {selectedCompany.ownerName}</span>
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: isMobile ? "11px" : "13px",
                      background: selectedCompany.isActive 
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                      padding: "8px 20px",
                      borderRadius: "999px",
                      fontWeight: "700",
                      boxShadow: selectedCompany.isActive 
                        ? "0 4px 12px rgba(16, 185, 129, 0.2)"
                        : "0 4px 12px rgba(239, 68, 68, 0.2)",
                      alignSelf: isMobile ? "flex-start" : "auto",
                    }}
                  >
                    {selectedCompany.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: "15px",
                  marginBottom: "25px",
                }}
                className="responsive-company-details"
                >
                  <div>
                    <div style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: "#6b7280",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}>
                      Company Email
                    </div>
                    <div style={{
                      fontSize: isMobile ? "14px" : "15px",
                      fontWeight: "600",
                      color: "#1f2937",
                      wordBreak: "break-word",
                    }}>
                      {selectedCompany.companyEmail}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: "#6b7280",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}>
                      Company Phone
                    </div>
                    <div style={{
                      fontSize: isMobile ? "14px" : "15px",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}>
                      {selectedCompany.companyPhone}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: "#6b7280",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}>
                      Owner Email
                    </div>
                    <div style={{
                      fontSize: isMobile ? "14px" : "15px",
                      fontWeight: "600",
                      color: "#1f2937",
                      wordBreak: "break-word",
                    }}>
                      {selectedCompany.ownerEmail}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: isMobile ? "12px" : "13px",
                      color: "#6b7280",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}>
                      Address
                    </div>
                    <div style={{
                      fontSize: isMobile ? "13px" : "14px",
                      fontWeight: "500",
                      color: "#4b5563",
                      wordBreak: "break-word",
                    }}>
                      {selectedCompany.companyAddress || "Not specified"}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  flexDirection: isMobile ? "column" : "row",
                }}
                className="responsive-actions"
                >
                  <button 
                    onClick={() => handleEdit(selectedCompany)}
                    style={{
                      padding: isMobile ? "12px 16px" : "12px 24px",
                      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: isMobile ? "13px" : "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      justifyContent: "center",
                    }}
                    className="responsive-action-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(245, 158, 11, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>✏️</span>
                    Edit
                  </button>

                  {selectedCompany.isActive ? (
                    <button 
                      onClick={() => handleDeactivate(selectedCompany._id)}
                      style={{
                        padding: isMobile ? "12px 16px" : "12px 24px",
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: isMobile ? "13px" : "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s",
                        justifyContent: "center",
                      }}
                      className="responsive-action-button"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(239, 68, 68, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span>⏸️</span>
                      Deactivate
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleActivate(selectedCompany._id)}
                      style={{
                        padding: isMobile ? "12px 16px" : "12px 24px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: isMobile ? "13px" : "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s",
                        justifyContent: "center",
                      }}
                      className="responsive-action-button"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span>▶️</span>
                      Activate
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(selectedCompany._id)}
                    style={{
                      padding: isMobile ? "12px 16px" : "12px 24px",
                      background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: isMobile ? "13px" : "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      justifyContent: "center",
                    }}
                    className="responsive-action-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>🗑️</span>
                    Delete
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedCompany(null);
                      setViewMode("view");
                    }}
                    style={{
                      padding: isMobile ? "12px 16px" : "12px 24px",
                      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                      color: "#374151",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: isMobile ? "13px" : "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      justifyContent: "center",
                    }}
                    className="responsive-action-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>←</span>
                    Back to List
                  </button>
                </div>
              </div>
            )}

            {/* Companies Table */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}>
              {companies.length === 0 ? (
                <div style={{
                  padding: isMobile ? "40px 20px" : "50px 30px",
                  textAlign: "center",
                  color: "#6b7280",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}>
                  <div style={{
                    width: isMobile ? "60px" : "80px",
                    height: isMobile ? "60px" : "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? "28px" : "35px",
                    color: "#9ca3af",
                  }}>
                    📊
                  </div>
                  <div>
                    <h4 style={{
                      margin: "0 0 8px 0",
                      fontSize: isMobile ? "18px" : "20px",
                      fontWeight: "600",
                      color: "#374151",
                    }}>
                      No Companies Found
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: isMobile ? "13px" : "15px",
                      color: "#6b7280",
                    }}>
                      No companies are registered in the system
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }} className="responsive-table">
                  <table style={{ 
                    width: "100%", 
                    borderCollapse: "collapse", 
                    fontSize: "14px",
                    minWidth: isMobile ? "600px" : "auto",
                  }}>
                    <thead>
                      <tr style={{ 
                        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}>
                        <th style={{
                          padding: isMobile ? "12px 8px" : "18px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          fontWeight: "700",
                          color: "#374151",
                          fontSize: isMobile ? "12px" : "14px",
                          whiteSpace: "nowrap",
                        }}>
                          Company Name
                        </th>
                        <th style={{
                          padding: isMobile ? "12px 8px" : "18px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          fontWeight: "700",
                          color: "#374151",
                          fontSize: isMobile ? "12px" : "14px",
                          whiteSpace: "nowrap",
                        }}>
                          Email
                        </th>
                        <th style={{
                          padding: isMobile ? "12px 8px" : "18px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          fontWeight: "700",
                          color: "#374151",
                          fontSize: isMobile ? "12px" : "14px",
                          whiteSpace: "nowrap",
                        }}>
                          Status
                        </th>
                        <th style={{
                          padding: isMobile ? "12px 8px" : "18px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          fontWeight: "700",
                          color: "#374151",
                          fontSize: isMobile ? "12px" : "14px",
                          whiteSpace: "nowrap",
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company, index) => (
                        <tr
                          key={company._id || index}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: index % 2 === 0 ? "#fff" : "#fafafa",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafafa";
                          }}
                        >
                          <td style={{
                            padding: isMobile ? "12px 8px" : "18px 20px",
                            fontSize: isMobile ? "12px" : "14px",
                            fontWeight: "600",
                            color: "#1f2937",
                            whiteSpace: "nowrap",
                          }}>
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "12px",
                              flexWrap: "wrap",
                            }}>
                              <div style={{
                                width: isMobile ? "30px" : "36px",
                                height: isMobile ? "30px" : "36px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#4f46e5",
                                fontSize: isMobile ? "14px" : "16px",
                              }}>
                                🏢
                              </div>
                              <span style={{ 
                                fontSize: isMobile ? "13px" : "14px",
                                wordBreak: "break-word",
                                maxWidth: isMobile ? "150px" : "none",
                              }}>
                                {company.companyName || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td style={{
                            padding: isMobile ? "12px 8px" : "18px 20px",
                            fontSize: isMobile ? "12px" : "14px",
                            color: "#4b5563",
                            whiteSpace: "nowrap",
                            wordBreak: "break-word",
                            maxWidth: isMobile ? "120px" : "none",
                          }}>
                            {company.companyEmail || "N/A"}
                          </td>
                          <td style={{
                            padding: isMobile ? "12px 8px" : "18px 20px",
                            fontSize: isMobile ? "12px" : "14px",
                            whiteSpace: "nowrap",
                          }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: isMobile ? "4px 10px" : "6px 16px",
                              background: company.isActive 
                                ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                                : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                              color: company.isActive ? "#065f46" : "#7f1d1d",
                              borderRadius: "999px",
                              fontWeight: "700",
                              fontSize: isMobile ? "10px" : "12px",
                              border: company.isActive 
                                ? "1px solid #a7f3d0"
                                : "1px solid #fecaca",
                            }}>
                              <span>{company.isActive ? "✅" : "⏸️"}</span>
                              {company.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{
                            padding: isMobile ? "12px 8px" : "18px 20px",
                            fontSize: isMobile ? "12px" : "14px",
                            whiteSpace: "nowrap",
                          }}>
                            <div style={{ 
                              display: "flex", 
                              gap: "8px", 
                              flexWrap: "wrap",
                              flexDirection: isMobile ? "column" : "row",
                            }}
                            className="responsive-buttons"
                            >
                              <button 
                                onClick={() => handleView(company)}
                                style={{
                                  padding: isMobile ? "6px 10px" : "8px 16px",
                                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: isMobile ? "11px" : "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  transition: "all 0.2s",
                                  minWidth: isMobile ? "auto" : "70px",
                                  justifyContent: "center",
                                }}
                                className="responsive-button"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                <span>👁️</span>
                                View
                              </button>
                              <button 
                                onClick={() => handleEdit(company)}
                                style={{
                                  padding: isMobile ? "6px 10px" : "8px 16px",
                                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: isMobile ? "11px" : "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  transition: "all 0.2s",
                                  minWidth: isMobile ? "auto" : "70px",
                                  justifyContent: "center",
                                }}
                                className="responsive-button"
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                <span>✏️</span>
                                Edit
                              </button>
                              {company.isActive ? (
                                <button 
                                  onClick={() => handleDeactivate(company._id)}
                                  style={{
                                    padding: isMobile ? "6px 10px" : "8px 16px",
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: isMobile ? "11px" : "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    transition: "all 0.2s",
                                    minWidth: isMobile ? "auto" : "90px",
                                    justifyContent: "center",
                                  }}
                                  className="responsive-button"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                >
                                  <span>⏸️</span>
                                  Deactivate
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleActivate(company._id)}
                                  style={{
                                    padding: isMobile ? "6px 10px" : "8px 16px",
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: isMobile ? "11px" : "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    transition: "all 0.2s",
                                    minWidth: isMobile ? "auto" : "80px",
                                    justifyContent: "center",
                                  }}
                                  className="responsive-button"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                >
                                  <span>▶️</span>
                                  Activate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "40px",
          padding: isMobile ? "20px" : "25px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
        }}>
          <p style={{
            margin: 0,
            color: "#6b7280",
            fontSize: isMobile ? "12px" : "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}>
            <span>🔒</span>
            <span>Secure Company Management System</span>
            <span style={{ color: "#e5e7eb", display: isMobile ? "none" : "inline" }}>•</span>
            <span>Total Companies: <strong>{companies.length}</strong></span>
            <span style={{ color: "#e5e7eb", display: isMobile ? "none" : "inline" }}>•</span>
            <span>© {new Date().getFullYear()} Company Management Portal</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;