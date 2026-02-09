import React, { useState, useCallback, memo, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";


const FormField = memo(
  ({ label, name, type = "text", placeholder, required, value, onChange, error, autoComplete }) => {
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: "500", color: "#374151" }}>
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
            padding: "12px 14px",
            borderRadius: 8,
            border: error ? "2px solid #ef4444" : "1px solid #d1d5db",
            fontSize: "15px",
            backgroundColor: error ? "#fef2f2" : "#fff",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />

        {error && (
          <div
            style={{
              color: "#dc2626",
              fontSize: "13px",
              marginTop: 6,
              padding: "6px 10px",
              background: "#fef2f2",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

const CompanyRegister = () => {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({}); // New state for API errors
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  const clearMessages = () => {
    setMsg("");
    setError("");
    setApiErrors({}); // Clear API errors too
  };

  /**
   * ✅ Stable handleChange
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error instantly
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    
    // Clear API error for this field
    setApiErrors((prev) => ({
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
    if (!ownerPassword?.trim()) errors.ownerPassword = "Owner password is required";

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (companyEmail && !emailRegex.test(companyEmail)) {
      errors.companyEmail = "Invalid company email format";
    }
    if (ownerEmail && !emailRegex.test(ownerEmail)) {
      errors.ownerEmail = "Invalid owner email format";
    }

    // Phone format check - Updated to exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    const phoneDigits = companyPhone.replace(/\D/g, '');
    if (companyPhone && !phoneRegex.test(phoneDigits)) {
      errors.companyPhone = "Phone must be exactly 10 digits";
    }

    // Password strength
    if (ownerPassword && ownerPassword.length < 6) {
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
    setApiErrors({});
  };

  // Function to map backend field names to frontend field names
  const mapFieldName = (backendField) => {
    const fieldMap = {
      'phone': 'companyPhone',
      'email': 'companyEmail',
      'address': 'companyAddress',
      'name': 'companyName',
      // Add more mappings as needed
    };
    return fieldMap[backendField] || backendField;
  };

  const navigate = useNavigate();


  // ✅ Register Company
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    clearMessages();

    if (!validateForm()) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);
    setLogoLoading(true);

    try {
      // Format phone number to remove any non-digits
      const formData = { 
        ...form,
        companyPhone: form.companyPhone.replace(/\D/g, '')
      };

      const res = await axios.post(`${API_URL}/company`, formData);
      
      setMsg(res.data?.message || "Company registered successfully! 🎉");
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate("/SuperAdminLogin"); 
      }, 2000);
      resetForm();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setMsg("");
      }, 5000);

    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);

      let errorMessage = "Something went wrong ❌";
      const errorData = err.response?.data;

      if (errorData) {
        // Set the main error message
        if (errorData.message) {
          errorMessage = errorData.message;
        }

        // Handle validation errors from details object
        if (errorData.details) {
          const newApiErrors = {};
          
          Object.entries(errorData.details).forEach(([field, errorInfo]) => {
            if (errorInfo && errorInfo.message) {
              const frontendField = mapFieldName(field);
              newApiErrors[frontendField] = errorInfo.message;
            }
          });
          
          setApiErrors(newApiErrors);
          
          // Show first error as main error
          const firstError = Object.values(newApiErrors)[0];
          if (firstError) {
            errorMessage = firstError;
          }
        }
        
        // Handle array errors
        if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(". ");
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message || "Unexpected error";
      }

      setError(errorMessage);
      setRegistrationSuccess(false);
    } finally {
      setIsSubmitting(false);
      setLogoLoading(false);
    }
  };

  // Combine form errors and API errors for display
  const getFieldError = (fieldName) => {
    return apiErrors[fieldName] || formErrors[fieldName];
  };

  // Add CSS for spinner animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "60px auto", padding: 20 }}>
      {/* Logo Box - Added just before the header */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 8,
          backgroundColor: 'white',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {logoLoading ? (
          <div className="spinner" style={{
            width: 40,
            height: 40,
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        ) : form.logo ? (
          <img
            src={form.logo}
            alt="Company Logo Preview"
            style={{
              width: 70,
              height: 70,
              objectFit: 'contain',
              borderRadius: '6px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="font-size: 44px; color: #2563eb;">🏢</div>
              `;
            }}
          />
        ) : (
          <div style={{ fontSize: "44px", color: "#2563eb" }}>🏢</div>
        )}
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: "2.5rem", color: "#1e40af", marginBottom: 8 }}>
          Company Registration
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.1rem" }}>
          Register your company and create owner account
        </p>
      </div>

      {/* Success Message */}
      {msg && (
        <div style={{
          ...successBox,
          textAlign: "center",
          marginBottom: 30,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>🎉</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#065f46" }}>
            Registration Successful!
          </h3>
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {msg} Your company has been registered successfully.
          </p>
          <button 
            onClick={clearMessages}
            style={{
              marginTop: 15,
              padding: "8px 20px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Error Message - Always show when there's an error */}
      {error && (
        <div style={{
          ...errorBox,
          marginBottom: 30,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>❌</span>
            <div style={{ flex: 1 }}>
              <strong style={{ display: "block", marginBottom: 5 }}>
                Registration Failed
              </strong>
              <p style={{ margin: "0 0 10px 0" }}>{error}</p>
              
              {/* Show specific field errors if available */}
              {Object.keys(apiErrors).length > 0 && (
                <div style={{ 
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "500" }}>
                    Please fix the following errors:
                  </p>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: 20,
                    fontSize: "14px"
                  }}>
                    {Object.entries(apiErrors).map(([field, message]) => (
                      <li key={field} style={{ marginBottom: 4 }}>
                        <strong>{field}:</strong> {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={clearMessages} 
            style={clearBtnRed}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Registration Form */}
      {!registrationSuccess && (
        <div style={card}>
          <form onSubmit={handleSubmit}>
            {/* Company Details Section */}
            <div style={{ marginBottom: 30 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                paddingBottom: 10,
                borderBottom: "2px solid #e5e7eb",
              }}>
                <div style={{
                  background: "#dbeafe",
                  padding: "8px",
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: "1.2rem" }}>🏢</span>
                </div>
                <h2 style={{ margin: 0, color: "#1e40af" }}>
                  Company Details
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <FormField
                  label="Company Name"
                  name="companyName"
                  placeholder="Enter company name"
                  required
                  value={form.companyName}
                  onChange={handleChange}
                  error={getFieldError("companyName")}
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
                  error={getFieldError("companyEmail")}
                  autoComplete="off"
                />
              </div>

              <FormField
                label="Company Address"
                name="companyAddress"
                placeholder="Full company address"
                required
                value={form.companyAddress}
                onChange={handleChange}
                error={getFieldError("companyAddress")}
                autoComplete="off"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <FormField
                  label="Company Phone"
                  name="companyPhone"
                  placeholder="Enter 10 digits (e.g., 9389111476)"
                  required
                  value={form.companyPhone}
                  onChange={handleChange}
                  error={getFieldError("companyPhone")}
                  autoComplete="off"
                  type="tel"
                />

                <FormField
                  label="Logo URL (optional)"
                  name="logo"
                  placeholder="https://example.com/logo.png"
                  required={false}
                  value={form.logo}
                  onChange={handleChange}
                  error={getFieldError("logo")}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Owner Details Section */}
            <div style={{ marginBottom: 30 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                paddingBottom: 10,
                borderBottom: "2px solid #e5e7eb",
              }}>
                <div style={{
                  background: "#f0fdf4",
                  padding: "8px",
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: "1.2rem" }}>👤</span>
                </div>
                <h2 style={{ margin: 0, color: "#059669" }}>
                  Owner Account Details
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <FormField
                  label="Owner Full Name"
                  name="ownerName"
                  placeholder="Owner full name"
                  required
                  value={form.ownerName}
                  onChange={handleChange}
                  error={getFieldError("ownerName")}
                  autoComplete="off"
                />

                <FormField
                  label="Owner Email / For Super Admin Login"
                  name="ownerEmail"
                  type="email"
                  placeholder="owner@example.com"
                  required
                  value={form.ownerEmail}
                  onChange={handleChange}
                  error={getFieldError("ownerEmail")}
                  autoComplete="off"
                />
              </div>

              <FormField
                label="Owner Password"
                name="ownerPassword"
                type="password"
                placeholder="Enter strong password (min 8 characters)"
                required
                value={form.ownerPassword}
                onChange={handleChange}
                error={getFieldError("ownerPassword")}
                autoComplete="new-password"
              />
            </div>

            {/* Terms & Submit */}
            <div style={{ 
              background: "#f8fafc", 
              padding: 20, 
              borderRadius: 10,
              marginBottom: 25,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  required 
                  style={{ marginTop: 4 }}
                />
                <label htmlFor="terms" style={{ fontSize: "14px", color: "#4b5563" }}>
                  I confirm that all information provided is accurate and I have the authority to 
                  register this company. By submitting, I agree to the terms and conditions.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "15px 40px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: "all 0.3s",
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: 20,
                      height: 20,
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Register Company
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "15px 30px",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Clear Form
              </button>
            </div>

            {/* Help Text */}
            <div style={{ 
              textAlign: "center", 
              marginTop: 25, 
              color: "#6b7280",
              fontSize: "14px",
              padding: "15px",
              background: "#f9fafb",
              borderRadius: 8,
            }}>
              <p style={{ margin: 0 }}>
                <strong>Note:</strong> After registration, a company code will be generated 
                automatically. The owner can use the provided email and password to login.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanyRegister;

/* ----------------- Styles ----------------- */

const card = {
  background: "#ffffff",
  padding: 40,
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const successBox = {
  color: "#065f46",
  padding: "30px",
  background: "#d1fae5",
  borderRadius: 12,
  border: "2px solid #10b981",
  position: "relative",
};

const errorBox = {
  color: "#991b1b",
  padding: "20px",
  background: "#fee2e2",
  borderRadius: 12,
  border: "2px solid #f87171",
  position: "relative",
};

const clearBtnRed = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "5px 12px",
  background: "transparent",
  border: "1px solid #dc2626",
  color: "#dc2626",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};