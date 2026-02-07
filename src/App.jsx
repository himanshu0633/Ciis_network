import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllCompany from "./page/AllCompany.jsx";

// Layouts
import Layout from "./admin/components/Layout";
import Layout2 from "./hrCds/UserLayout";
import SuperLayout from "./admin/components/SuperAdminLayout";
// Protected Route
import ProtectedRoute from "./admin/components/ProtectedRoute";
import ThemeContextProvider from "./Theme/ThemeContext";

// Admin Pages
import CreateUser from "./admin/page/CreateUser";
import Department from "./admin/page/DepartmentManagement";
import ChangePassword from "./admin/page/ChangePassword";

// HR/Admin Pages (CDS)
import EmppTask from "./hrCds/pages/hr/EmmpTask";
import AdminTaskCreate from "./hrCds/pages/hr/AdminTaskCreate";
import AdminMeetingPage from "./hrCds/pages/hr/AdminMeetingPage";
import EmppDetail from "./hrCds/pages/hr/EmppDetail";
import EmppLeave from "./hrCds/pages/hr/EmppLeaves";
import EmppAsset from "./hrCds/pages/hr/EmppAssets";
import EmppAttendence from "./hrCds/pages/hr/EmppAttendence";
import TaskDeatils from "./hrCds/pages/hr/TaskDetails";
import EmpAllTask from "./hrCds/pages/hr/EmpAllTask";
import EmpDepartmentAllTask from "./hrCds/pages/hr/EmpDepartmentAllTask.jsx";
import AdminProject from "./hrCds/pages/AdminProject";
import Client from "./hrCds/pages/hr/Client";

// User Pages (CDS)
import Alerts from "./hrCds/pages/Alerts";
import Attendance from "./hrCds/pages/Attendance";
import MyAssets from "./hrCds/pages/MyAssets";
import MyLeaves from "./hrCds/pages/MyLeaves";

import MyTaskManagement from "./hrCds/pages/MyTaskManagement";
import Profile from "./hrCds/pages/Profile";
import UserDashboard from "./hrCds/pages/UserDashboard";
import TaskManagement from "./hrCds/pages/TaskManagement";
import EmployeeMeetingPage from "./hrCds/pages/EmployeeMeetingPage";
import EmployeeProject from "./hrCds/pages/EmployeeProject";
import ClientMeeting from "./hrCds/pages/ClientMeeting";


// Website Pages
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs";
import ContactUs from "./Pages/ContactUs";
import RegisterCompany from "./admin/components/CompanyRegister.jsx";
// Super Admin
import SuperAdminLogin from "./page/SuperAdminLogin";
import SuperAdminDashboard from "./page/SuperAdminDashboard.jsx";
import CompanyManagement from "./page/CompanyManagement.jsx";
import JobRoleManagement from "./admin/page/JobRoleManagement.jsx";
import SidebarManagement from "./admin/components/SidebarManagement.jsx";
import CompanyDetails from "./admin/components/CompanyDetails.jsx";
function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  return (
    <>
      <Routes>
        {/* ✅ Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/SuperAdminLogin" element={<SuperAdminLogin />} />
        <Route path="company/:companyCode/login" element={<Login />} />
        <Route path="/RegisterCompany" element={<RegisterCompany />} />
        
        <Route
          path="/Ciis-network/*"
          element={
            <ThemeContextProvider>
              <ProtectedRoute>
                <SuperLayout />
              </ProtectedRoute>
            </ThemeContextProvider>
          }
        >
<Route path="company-details" element={<CompanyDetails />} />
          <Route path="department" element={<Department />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="SuperAdminDashboard" element={<SuperAdminDashboard />} />
          <Route path="JobRoleManagement" element={<JobRoleManagement />} />
          <Route path="all-company" element={<AllCompany />} />
          <Route path="CompanyManagement" element={<CompanyManagement />} />
          <Route path="SidebarManagement" element={<SidebarManagement />} />
        </Route>


        {/* ✅ CDS USER Routes */}
        <Route
          path="/ciisUser/*"
          element={
            <ThemeContextProvider>
              <ProtectedRoute>
                <Layout2 />
              </ProtectedRoute>
            </ThemeContextProvider>
          }
        >
          
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="emp-details" element={<EmppDetail />} />
          <Route path="emp-leaves" element={<EmppLeave />} />
          <Route path="emp-assets" element={<EmppAsset />} />
          <Route path="emp-attendance" element={<EmppAttendence />} />
          {/* <Route path="emp-task-management" element={<EmppTask />} /> */}
          <Route path="emp-task-details" element={<TaskDeatils />} />
          <Route path="admin-task-create" element={<AdminTaskCreate />} />
          <Route path="admin-meeting" element={<AdminMeetingPage />} />
          <Route path="adminproject" element={<AdminProject />} />
          <Route path="company-all-task" element={<EmpAllTask />} />
          <Route path="department-all-task" element={<EmpDepartmentAllTask />} />
          <Route path="emp-client" element={<Client />} />
          <Route path="alert" element={<Alerts />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="my-assets" element={<MyAssets />} />
          <Route path="my-leaves" element={<MyLeaves />} />
          {/* <Route path="my-task-management" element={<MyTaskManagement />} /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="project" element={<EmployeeProject />} />
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="employee-meeting" element={<EmployeeMeetingPage />} />
          <Route path="client-meeting" element={<ClientMeeting />} />
         
        </Route>

        {/* ✅ Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;