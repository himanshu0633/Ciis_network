import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import './CreateUser.css';
import CIISLoader from '../../Loader/CIISLoader'; // ✅ Import CIISLoader

// Constants
const genderOptions = ['male', 'female', 'other'];
const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed'];
const employeeTypeOptions = ['permanent', 'probation', 'contract', 'intern', 'trainee'];

// Initial form state
const initialFormState = {
  name: '', email: '', password: '', confirmPassword: '',
  department: '', jobRole: '',
  phone: '', address: '', gender: '', maritalStatus: '', dob: '', salary: '',
  accountNumber: '', ifsc: '', bankName: '', bankHolderName: '',
  employeeType: '', properties: [], propertyOwned: '', additionalDetails: '',
  fatherName: '', motherName: '', emergencyName: '', emergencyPhone: '',
  emergencyRelation: '', emergencyAddress: ''
};

const CreateUser = () => {
  const [form, setForm] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // ✅ Page loading state
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);
  const navigate = useNavigate();

  // LocalStorage se company data
  const [companyId, setCompanyId] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // LocalStorage se current user aur company data fetch karna
  useEffect(() => {
    const fetchDataFromLocalStorage = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('superAdmin'));

        if (userData) {
          console.log("📋 LocalStorage User Data:", userData);
          setCurrentUser(userData);

          if (userData.company && userData.companyCode) {
            setCompanyId(userData.company);
            setCompanyCode(userData.companyCode);
          } else {
            toast.error("Company information not found in your profile");
            navigate('/dashboard');
          }
        } else {
          toast.error("Please login again");
          navigate('/login');
        }
      } catch (error) {
        console.error("❌ Error parsing localStorage data:", error);
        toast.error("Error loading user data");
        navigate('/login');
      }
    };

    fetchDataFromLocalStorage();
  }, [navigate]);

  // ✅ FIXED: Departments fetch with DEBUGGING
  useEffect(() => {
    if (companyId) {
      console.log("🔍 Company ID found, fetching departments for:", companyId);
      fetchDepartments();
    } else {
      console.log("⚠️ No company ID yet");
    }
  }, [companyId]);

  // Department change pe job roles fetch karna
  useEffect(() => {
    if (form.department) {
      fetchJobRolesByDepartment(form.department);
    } else {
      setJobRoles([]);
      setForm(prev => ({ ...prev, jobRole: '' }));
    }
  }, [form.department]);

  // ✅ Page loading complete
  useEffect(() => {
    // Jab saara data load ho jaye to page loading off kar do
    if (companyId && departments.length > 0 && !loadingDepartments) {
      setTimeout(() => {
        setPageLoading(false);
      }, 500);
    }
  }, [companyId, departments, loadingDepartments]);

  // ✅ FIXED: Fetch Departments - All possible endpoints try karo
  const fetchDepartments = async () => {
    try {
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }
      
      setLoadingDepartments(true);
      console.log("📡 Fetching departments for company:", companyId);
      
      let response = null;
      let success = false;
      
      // 🔥 TRY MULTIPLE ENDPOINTS - Backend ke according adjust karo
      const endpoints = [
        `/departments?company=${companyId}`,
        `/departments/company/${companyId}`,
        `/api/departments?company=${companyId}`,
        `/department?companyId=${companyId}`,
        `/departments?companyId=${companyId}`,
        `/departments?companyCode=${companyCode}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint);
          console.log(`✅ Success with: ${endpoint}`, response.data);
          success = true;
          break;
        } catch (err) {
          console.log(`❌ Failed: ${endpoint}`, err.message);
        }
      }
      
      if (!success) {
        throw new Error("All endpoints failed");
      }

      // 🔥 HANDLE ALL RESPONSE FORMATS
      let departmentsData = [];
      
      // Response data ko normalize karo
      const data = response.data;
      console.log("📦 Raw response data:", data);
      
      if (data) {
        // Case 1: Direct array
        if (Array.isArray(data)) {
          departmentsData = data;
        }
        // Case 2: { departments: [...] }
        else if (data.departments && Array.isArray(data.departments)) {
          departmentsData = data.departments;
        }
        // Case 3: { data: [...] }
        else if (data.data && Array.isArray(data.data)) {
          departmentsData = data.data;
        }
        // Case 4: { result: [...] }
        else if (data.result && Array.isArray(data.result)) {
          departmentsData = data.result;
        }
        // Case 5: { success: true, data: [...] }
        else if (data.success && data.data && Array.isArray(data.data)) {
          departmentsData = data.data;
        }
        // Case 6: { success: true, departments: [...] }
        else if (data.success && data.departments && Array.isArray(data.departments)) {
          departmentsData = data.departments;
        }
      }
      
      console.log("✅ Processed departments:", departmentsData);
      setDepartments(departmentsData);

      if (departmentsData.length === 0) {
        toast.warning('No departments found for this company');
      } else {
        toast.success(`${departmentsData.length} departments loaded`);
      }

    } catch (err) {
      console.error("❌ All department fetch attempts failed:", err);
      toast.error('Failed to load departments. Check API endpoint.');
      setDepartments([]);
      
      // 🔥 DEBUG: Show current company ID
      console.log("🔍 Current company ID:", companyId);
      console.log("🔍 Current company Code:", companyCode);
      console.log("🔍 Current user:", currentUser);
      
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ✅ FIXED: Fetch Job Roles - Multiple endpoints
  const fetchJobRolesByDepartment = async (departmentId) => {
    try {
      if (!departmentId) {
        setJobRoles([]);
        return;
      }

      setLoadingJobRoles(true);
      console.log("📡 Fetching job roles for department:", departmentId);
      
      let response = null;
      let success = false;
      
      // 🔥 TRY MULTIPLE ENDPOINTS
      const endpoints = [
        `/job-roles?department=${departmentId}`,
        `/job-roles/department/${departmentId}`,
        `/api/job-roles?department=${departmentId}`,
        `/job-roles?departmentId=${departmentId}`,
        `/job-roles?dept=${departmentId}`,
        `/job-roles/by-department/${departmentId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint);
          console.log(`✅ Success with: ${endpoint}`, response.data);
          success = true;
          break;
        } catch (err) {
          console.log(`❌ Failed: ${endpoint}`, err.message);
        }
      }
      
      if (!success) {
        throw new Error("All job role endpoints failed");
      }

      // 🔥 HANDLE ALL RESPONSE FORMATS
      let jobRolesData = [];
      const data = response.data;
      
      if (data) {
        if (Array.isArray(data)) {
          jobRolesData = data;
        }
        else if (data.jobRoles && Array.isArray(data.jobRoles)) {
          jobRolesData = data.jobRoles;
        }
        else if (data.data && Array.isArray(data.data)) {
          jobRolesData = data.data;
        }
        else if (data.result && Array.isArray(data.result)) {
          jobRolesData = data.result;
        }
        else if (data.success && data.jobRoles && Array.isArray(data.jobRoles)) {
          jobRolesData = data.jobRoles;
        }
        else if (data.success && data.data && Array.isArray(data.data)) {
          jobRolesData = data.data;
        }
      }
      
      console.log("✅ Processed job roles:", jobRolesData);
      setJobRoles(jobRolesData);

    } catch (err) {
      console.error("❌ Failed to load job roles:", err);
      toast.error('Failed to load job roles');
      setJobRoles([]);
    } finally {
      setLoadingJobRoles(false);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;

    if (['name', 'fatherName', 'motherName', 'emergencyName', 'bankHolderName'].includes(name)) {
      if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
    else if (['phone', 'salary', 'accountNumber', 'emergencyPhone'].includes(name)) {
      if (/^\d*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    }
    else if (name === 'ifsc') {
      if (/^[a-zA-Z0-9]*$/.test(value) || value === '') {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Agar department change ho raha hai to job role reset karo
    if (name === 'department') {
      setForm(prev => ({ ...prev, jobRole: '' }));
    }
  };

  const validateForm = () => {
    if (!form.name || form.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return false;
    }
    if (!form.email.includes('@')) {
      toast.error('Enter a valid email');
      return false;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!form.department) {
      toast.error('Please select a department');
      return false;
    }
    if (!form.jobRole) {
      toast.error('Please select a job role');
      return false;
    }
    if (!companyId || !companyCode) {
      toast.error('Company information is missing');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!companyId || !companyCode) {
      toast.error("Company reference is missing");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;

      const userData = {
        ...submitData,
        company: companyId,
        companyCode: companyCode
      };

      console.log("📦 Submitting user data:", userData);
      
      const response = await axios.post('/auth/register', userData);
      console.log("✅ Server response:", response.data);
      toast.success('✅ User created successfully');
      
      setForm({ ...initialFormState });

    } catch (err) {
      console.error("❌ Registration error:", err);
      const msg = err?.response?.data?.message || '❌ User creation failed';
      toast.error(msg);

      if (err.response?.status === 409) {
        toast.error('Email already exists in this company');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (currentUser?.name) {
      return currentUser.name.toUpperCase();
    }
    return 'USER';
  };

  // 🔥 DEBUG: Show current state
  console.log("🏢 Current departments state:", departments);
  console.log("📋 Selected department ID:", form.department);
  console.log("🎯 Job Roles:", jobRoles);

  // ✅ Show CIISLoader while page is loading
  if (pageLoading) {
    return <CIISLoader />;
  }

  return (
    <div className="CreateUser-container">
      <div className="CreateUser-paper">
        {/* Header Section */}
        <div className="CreateUser-header">
          <div>
            <h2 className="CreateUser-header-title">
              Create New User
            </h2>
            <p className="CreateUser-header-subtitle">
              Add a new team member to your organization
            </p>
          </div>
        </div>

        {/* Company Info Box */}
        {currentUser && (
          <div className="CreateUser-company-info-box">
            <h3 className="CreateUser-company-name">
              {getUserDisplayName()}
            </h3>
            <p className="CreateUser-company-details">
              Created by: {currentUser.name} ({currentUser.jobRole || 'super_admin'})
            </p>
            <p className="CreateUser-company-details">
              Company ID: {companyId?.substring(0, 8)}...
            </p>
            <p className="CreateUser-company-details CreateUser-company-details-highlight">
              Departments: {departments.length} loaded
            </p>
          </div>
        )}

        <p className="CreateUser-required-text">
          <span className="CreateUser-required-star">*</span> All marked fields are required
        </p>

        <hr className="CreateUser-divider" />

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <h3 className="CreateUser-section-title">
            Personal Information
          </h3>

          <div className="CreateUser-form-grid">
            {/* ROW 1: Name & Email */}
            <div className="CreateUser-form-row">
              <div className="CreateUser-form-group">
                <label htmlFor="name" className="CreateUser-label">
                  Full Name <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-input-wrapper">
                  <span className="CreateUser-input-icon">👤</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleTextChange}
                    className="CreateUser-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <small className="CreateUser-helper-text">Only letters and spaces</small>
              </div>

              <div className="CreateUser-form-group">
                <label htmlFor="email" className="CreateUser-label">
                  Email Address <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-input-wrapper">
                  <span className="CreateUser-input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleTextChange}
                    className="CreateUser-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ROW 2: Password & Confirm Password */}
            <div className="CreateUser-form-row">
              <div className="CreateUser-form-group">
                <label htmlFor="password" className="CreateUser-label">
                  Password <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-input-wrapper">
                  <span className="CreateUser-input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleTextChange}
                    className="CreateUser-input"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="CreateUser-password-toggle"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <small className="CreateUser-helper-text">Minimum 8 characters</small>
              </div>

              <div className="CreateUser-form-group">
                <label htmlFor="confirmPassword" className="CreateUser-label">
                  Confirm Password <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-input-wrapper">
                  <span className="CreateUser-input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleTextChange}
                    className="CreateUser-input"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    className="CreateUser-password-toggle"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 3: Department & Job Role */}
            <div className="CreateUser-form-row">
              {/* Department - Simple Select like Gender */}
              <div className="CreateUser-form-group">
                <label htmlFor="department" className="CreateUser-label">
                  Department <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-select-wrapper">
                  <span className="CreateUser-select-icon">🏢</span>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleSelectChange}
                    className="CreateUser-select"
                    disabled={loadingDepartments || departments.length === 0}
                    required
                  >
                    <option value="">
                      {loadingDepartments 
                        ? "Loading departments..." 
                        : departments.length === 0 
                          ? "No departments available" 
                          : "Select Department"}
                    </option>
                    {departments.map(dept => (
                      <option key={dept._id || dept.id} value={dept._id || dept.id}>
                        {dept.name || dept.departmentName || dept.title}
                      </option>
                    ))}
                  </select>
                  <span className="CreateUser-select-arrow">▼</span>
                </div>
                {departments.length === 0 && !loadingDepartments && (
                  <small className="CreateUser-helper-text CreateUser-helper-text-error">
                    No departments available. Please create departments first.
                  </small>
                )}
              </div>

              {/* Job Role - Simple Select like Gender */}
              <div className="CreateUser-form-group">
                <label htmlFor="jobRole" className="CreateUser-label">
                  Job Role <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-select-wrapper">
                  <span className="CreateUser-select-icon">💼</span>
                  <select
                    id="jobRole"
                    name="jobRole"
                    value={form.jobRole}
                    onChange={handleSelectChange}
                    className="CreateUser-select"
                    disabled={!form.department || loadingJobRoles || jobRoles.length === 0}
                    required
                  >
                    <option value="">
                      {!form.department 
                        ? "Select a department first" 
                        : loadingJobRoles 
                          ? "Loading job roles..." 
                          : jobRoles.length === 0 
                            ? "No job roles available" 
                            : "Select Job Role"}
                    </option>
                    {jobRoles.map(role => (
                      <option key={role._id || role.id} value={role._id || role.id}>
                        {role.name || role.title || role.roleName}
                      </option>
                    ))}
                  </select>
                  <span className="CreateUser-select-arrow">▼</span>
                </div>
                {form.department && jobRoles.length === 0 && !loadingJobRoles && (
                  <small className="CreateUser-helper-text CreateUser-helper-text-error">
                    No job roles defined for this department
                  </small>
                )}
              </div>
            </div>

            {/* ROW 4: Gender & Marital Status */}
            <div className="CreateUser-form-row">
              <div className="CreateUser-form-group">
                <label htmlFor="gender" className="CreateUser-label">
                  Gender <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-select-wrapper">
                  <span className="CreateUser-select-icon">⚥</span>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleSelectChange}
                    className="CreateUser-select"
                    required
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span className="CreateUser-select-arrow">▼</span>
                </div>
              </div>

              <div className="CreateUser-form-group">
                <label htmlFor="maritalStatus" className="CreateUser-label">
                  Marital Status <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-select-wrapper">
                  <span className="CreateUser-select-icon">💍</span>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={form.maritalStatus}
                    onChange={handleSelectChange}
                    className="CreateUser-select"
                    required
                  >
                    <option value="">Select Marital Status</option>
                    {maritalStatusOptions.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span className="CreateUser-select-arrow">▼</span>
                </div>
              </div>
            </div>

            {/* ROW 5: Date of Birth & Phone */}
            <div className="CreateUser-form-row">
              <div className="CreateUser-form-group">
                <label htmlFor="dob" className="CreateUser-label">
                  Date of Birth <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-input-wrapper">
                  <span className="CreateUser-input-icon">🎂</span>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={form.dob}
                    onChange={handleTextChange}
                    className="CreateUser-input"
                    required
                  />
                </div>
              </div>

              <div className="CreateUser-form-group">
                <label htmlFor="phone" className="CreateUser-label">
                  Phone Number <span className="CreateUser-required-star">*</span>
                </label>
                <div className="CreateUser-input-wrapper">
                  <span className="CreateUser-input-icon">📞</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleTextChange}
                    className="CreateUser-input"
                    placeholder="Enter 10 digit number"
                    maxLength="10"
                    required
                  />
                </div>
                <small className="CreateUser-helper-text">10 digits only</small>
              </div>
            </div>
          </div>

          <hr className="CreateUser-divider" />

          {/* Address Information */}
          <h3 className="CreateUser-section-title">
            Address Information
          </h3>

          <div className="CreateUser-form-grid">
            <div className="CreateUser-form-group CreateUser-full-width">
              <label htmlFor="address" className="CreateUser-label">
                Address <span className="CreateUser-required-star">*</span>
              </label>
              <div className="CreateUser-input-wrapper">
                <span className="CreateUser-input-icon CreateUser-textarea-icon">🏠</span>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleTextChange}
                  className="CreateUser-textarea"
                  placeholder="Enter full address"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <hr className="CreateUser-divider" />
          
          {/* Submit Button */}
          <button
            type="submit"
            className="CreateUser-submit-button"
            disabled={loading || !companyId || !companyCode || departments.length === 0 || !form.jobRole}
          >
            {loading ? (
              <>
                <span className="CreateUser-spinner"></span>
                Creating User...
              </>
            ) : (
              <>
                <span className="CreateUser-button-icon">+</span>
                Create New User
              </>
            )}
          </button>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="CreateUser-debug-info">
              <small>
                🔍 Debug: Company ID: {companyId || 'Not set'} | Departments: {departments.length} | 
                Selected Dept: {form.department || 'None'} | Job Roles: {jobRoles.length}
              </small>
            </div>
          )}

          {/* Warning Messages */}
          {(!companyId || !companyCode) && (
            <div className="CreateUser-info-message CreateUser-error-message">
              ⚠️ Company information is missing. Please login again or contact support.
            </div>
          )}

          {departments.length === 0 && companyId && !loadingDepartments && (
            <div className="CreateUser-info-message CreateUser-warning-message">
              ⚠️ No departments found. Please create departments first before adding users.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateUser;