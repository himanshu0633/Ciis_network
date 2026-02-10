import React, { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import API_URL from "../config";



/**
 * ✅ Memoized FormField (Important)
 * Cursor jumping usually happens when input remounts/re-renders too aggressively.
 */
const FormField = memo(
  ({ label, name, type = "text", placeholder, required, value, onChange, error, autoComplete }) => {
    return (
      <div>
        <label style={{ display: "block", marginBottom: 5, fontWeight: "500" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>

        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete || "off"}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: error ? "1px solid #ef4444" : "1px solid #ccc",
            fontSize: "14px",
            backgroundColor: error ? "#fef2f2" : "#fff",
            outline: "none",
          }}
        />

        {error && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "12px",
              marginTop: 4,
              padding: "4px 8px",
              background: "#fef2f2",
              borderRadius: 6,
            }}
          >
            ⚠️ {error}
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

  const [viewMode, setViewMode] = useState("create"); // create | view
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searchId, setSearchId] = useState("");

  const [formErrors, setFormErrors] = useState({});

  // ✅ Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const clearMessages = () => {
    setMsg("");
    setError("");
  };

  const fetchCompanies = async () => {
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
    }
  };

  /**
   * ✅ FIXED handleChange (Stable + No focus reset)
   */
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

  // ✅ Create + Update
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
        const res = await axios.patch(
          `${API_URL}/company/${selectedCompany._id}`,
          formData
        );
        setMsg(res.data?.message || "Company updated successfully ✅");
      } else {
        const res = await axios.post(`${API_URL}/company`, formData);
        setMsg(res.data?.message || "Company created successfully 🎉");
      }

      resetForm();
      setSelectedCompany(null);
      setIsEditing(false);
      setViewMode("create");
      fetchCompanies();
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
    setViewMode("create");

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
    if (!window.confirm("⚠️ WARNING: This will permanently delete the company and all users. Continue?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/company/${id}`);
      setMsg("Company deleted successfully ✅");
      fetchCompanies();

      if (selectedCompany?._id === id) {
        setSelectedCompany(null);
        setViewMode("create");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete company");
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
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 25 }}>🏢 Company Management</h1>

      {/* Success */}
      {msg && (
        <div style={successBox}>
          <strong>✅ Success:</strong> {msg}
          <button onClick={clearMessages} style={clearBtnGreen}>Clear</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={errorBox}>
          <strong>❌ Error:</strong> {error}
          <button onClick={clearMessages} style={clearBtnRed}>Clear</button>
        </div>
      )}

      {/* Search Section */}
      <div style={searchBox}>
        <h3 style={{ marginBottom: 15, color: "#374151" }}>🔍 Search Company</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter Company Code (e.g., CIIS)"
              autoComplete="off"
              style={searchInput}
              onKeyDown={(e) => e.key === "Enter" && handleGetByCode()}
            />
          </div>

          <button
            onClick={handleGetByCode}
            disabled={!searchCode.trim()}
            style={{
              ...searchBtn,
              background: !searchCode.trim() ? "#9ca3af" : "#6366f1",
            }}
          >
            🔍 Search by Code
          </button>

          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Company ID"
              autoComplete="off"
              style={searchInput}
              onKeyDown={(e) => e.key === "Enter" && handleGetById()}
            />
          </div>

          <button
            onClick={handleGetById}
            disabled={!searchId.trim()}
            style={{
              ...searchBtn,
              background: !searchId.trim() ? "#9ca3af" : "#8b5cf6",
            }}
          >
            🔎 Search by ID
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        {/* Left Form */}
        <div>
          <div style={card}>
            <h2 style={{ color: isEditing ? "#f59e0b" : "#2563eb" }}>
              {isEditing ? "✏️ Edit Company" : "🏢 Create New Company"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h4 style={sectionTitle}>🏢 Company Details</h4>

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
                label="Owner Name"
                name="ownerName"
                placeholder="Owner full name"
                required
                value={form.ownerName}
                onChange={handleChange}
                error={formErrors.ownerName}
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

              <h4 style={sectionTitle}>👤 Owner Login Details</h4>

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

              {/* Owner Password */}
              <div>
                <label style={{ display: "block", marginBottom: 5, fontWeight: "500" }}>
                  Owner Password {!isEditing && <span style={{ color: "#ef4444" }}>*</span>}
                </label>

                <input
                  type="password"
                  name="ownerPassword"
                  placeholder={isEditing ? "Leave blank to keep current password" : "Enter strong password"}
                  value={form.ownerPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: formErrors.ownerPassword ? "1px solid #ef4444" : "1px solid #ccc",
                    backgroundColor: formErrors.ownerPassword ? "#fef2f2" : "#fff",
                    outline: "none",
                  }}
                />

                {formErrors.ownerPassword && (
                  <div style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: 4,
                    padding: "4px 8px",
                    background: "#fef2f2",
                    borderRadius: 6,
                  }}>
                    ⚠️ {formErrors.ownerPassword}
                  </div>
                )}

                <small style={{ color: "#6b7280", fontSize: 12 }}>
                  {isEditing ? "Leave blank to keep old password" : "Minimum 6 characters"}
                </small>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: isEditing ? "#f59e0b" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: loading || isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    opacity: loading || isSubmitting ? 0.7 : 1,
                  }}
                >
                  {loading || isSubmitting
                    ? `⏳ ${isEditing ? "Updating..." : "Creating..."}`
                    : isEditing
                    ? "Update Company"
                    : "Create Company"}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setSelectedCompany(null);
                      setIsEditing(false);
                      clearMessages();
                    }}
                    style={{
                      padding: "12px 16px",
                      background: "#6b7280",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right List */}
        <div>
          <div style={{ ...card, height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <h2 style={{ margin: 0, color: "#374151" }}>
                📋 Companies List ({companies.length})
              </h2>
              <button onClick={fetchCompanies} style={btnGreen}>
                Refresh
              </button>
            </div>

            {/* Details Card */}
            {viewMode === "view" && selectedCompany && (
              <div style={detailsCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, color: "#1e40af" }}>Company Details</h3>
                  <span
                    style={{
                      fontSize: 12,
                      background: selectedCompany.isActive ? "#10b981" : "#ef4444",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontWeight: "bold",
                    }}
                  >
                    {selectedCompany.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p><strong>Name:</strong> {selectedCompany.companyName}</p>
                <p><strong>Email:</strong> {selectedCompany.companyEmail}</p>
                <p><strong>Phone:</strong> {selectedCompany.companyPhone}</p>
                <p><strong>Owner:</strong> {selectedCompany.ownerName}</p>
                <p><strong>Code:</strong> <code>{selectedCompany.companyCode || "N/A"}</code></p>
                <p style={{ fontSize: 12 }}><strong>ID:</strong> {selectedCompany._id}</p>
                <p><strong>Address:</strong> {selectedCompany.companyAddress}</p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <button onClick={() => handleEdit(selectedCompany)} style={btnOrange}>Edit</button>

                  {selectedCompany.isActive ? (
                    <button onClick={() => handleDeactivate(selectedCompany._id)} style={btnRed}>Deactivate</button>
                  ) : (
                    <button onClick={() => handleActivate(selectedCompany._id)} style={btnGreenSmall}>Activate</button>
                  )}

                  <button onClick={() => handleDelete(selectedCompany._id)} style={btnDark}>Delete</button>

                  <button
                    onClick={() => {
                      setSelectedCompany(null);
                      setViewMode("create");
                    }}
                    style={btnGray}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div style={tableWrap}>
              {companies.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>
                  No companies found
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company, index) => (
                      <tr
                        key={company._id || index}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: index % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td style={tdStyle}>{company.companyName || "N/A"}</td>
                        <td style={tdStyle}>{company.companyEmail || "N/A"}</td>
                        <td style={tdStyle}>
                          <span style={{
                            fontWeight: "bold",
                            fontSize: 12,
                            color: company.isActive ? "#10b981" : "#ef4444",
                            background: company.isActive ? "#f0fdf4" : "#fef2f2",
                            padding: "4px 12px",
                            borderRadius: 999,
                          }}>
                            {company.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button onClick={() => handleView(company)} style={btnBlue}>View</button>
                            <button onClick={() => handleEdit(company)} style={btnOrangeSmall}>Edit</button>

                            {company.isActive ? (
                              <button onClick={() => handleDeactivate(company._id)} style={btnRedSmall}>
                                Deactivate
                              </button>
                            ) : (
                              <button onClick={() => handleActivate(company._id)} style={btnGreenSmall}>
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;

/* ----------------- Styles ----------------- */

const card = {
  background: "#f8fafc",
  padding: 25,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const sectionTitle = {
  marginTop: 10,
  paddingBottom: 10,
  borderBottom: "2px solid #e5e7eb",
  color: "#374151",
};

const searchBox = {
  marginBottom: 30,
  padding: 20,
  background: "#f8fafc",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

const searchInput = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  outline: "none",
};

const searchBtn = {
  padding: "10px 18px",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const tableWrap = {
  maxHeight: 520,
  overflowY: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};

const detailsCard = {
  background: "#fff",
  padding: 18,
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  marginBottom: 15,
};

const thStyle = {
  padding: 12,
  textAlign: "left",
  borderBottom: "2px solid #cbd5e1",
  fontWeight: "bold",
  color: "#374151",
};

const tdStyle = {
  padding: 12,
  fontSize: 13,
};

const successBox = {
  color: "#047857",
  padding: "15px",
  background: "#f0fdf4",
  borderRadius: 10,
  marginBottom: 20,
  border: "1px solid #10b981",
  position: "relative",
};

const errorBox = {
  color: "#b91c1c",
  padding: "15px",
  background: "#fef2f2",
  borderRadius: 10,
  marginBottom: 20,
  border: "1px solid #fca5a5",
  position: "relative",
};

const clearBtnGreen = {
  float: "right",
  padding: "3px 10px",
  background: "transparent",
  border: "1px solid #10b981",
  color: "#047857",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};

const clearBtnRed = {
  float: "right",
  padding: "3px 10px",
  background: "transparent",
  border: "1px solid #b91c1c",
  color: "#b91c1c",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};

// Buttons
const btnBlue = {
  padding: "6px 12px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 12,
};

const btnOrange = {
  padding: "8px 14px",
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const btnOrangeSmall = {
  padding: "6px 12px",
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 12,
};

const btnRed = {
  padding: "8px 14px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const btnRedSmall = {
  padding: "6px 12px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 12,
};

const btnGreen = {
  padding: "8px 14px",
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 13,
};

const btnGreenSmall = {
  padding: "6px 12px",
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 12,
};

const btnGray = {
  padding: "8px 14px",
  background: "#6b7280",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const btnDark = {
  padding: "8px 14px",
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};
