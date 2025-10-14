import { Routes, Route, Navigate } from 'react-router-dom';
import Runo from './page/Runo';
import Pricing from './page/Pricing';
import Contact from './page/Contact';
import Login from './page/Login';
import Register from './page/Register';
import AutoDialer from './page/AutoDialer';
import CallManagement from './page/CallManagement';
import LeadManagement from './page/LeadManagement';
import Telecaller from './page/Telecaller';
import CallCenter from './page/CallCenter';
import ForgotPassword from './page/ForgotPassword';
import ResetPassword from './page/ResetPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Admin/User Layouts and Components
import Layout from './admin/components/Layout';
import Layout2 from './hrCds/UserLayout';
import ProtectedRoute from './admin/components/ProtectedRoute';
import ThemeContextProvider from './Theme/ThemeContext';

// Admin Pages
import Dashboard from './admin/page/Dashboard';
import Allocations from './admin/page/Allocations';
import Customers from './admin/page/Customers';
import Interactions from './admin/page/Interactions';
import FollowUps from './admin/page/FollowUps';
import Calendar from './admin/page/Calendar';
import CallLogs from './admin/page/CallLogs';
import RecurringFollowUps from './admin/page/RecurringFollowUps';
import RequestReports from './admin/page/RequestReports';
import RechurnCustomers from './admin/page/RechurnCustomers';
import Analytics from './admin/page/Analytics';
import WhatsappTemplate from './admin/page/WhatsappTemplate';
import EmailTemplate from './admin/page/EmailTemplate';
import SMSTemplate from './admin/page/SMSTemplate';
import Team from './admin/page/Team';
import Roles from './admin/page/Roles';
import CRMFields from './admin/page/CRMFields';
import CompanyDetails from './admin/page/CompanyDetails';
import DataCleanup from './admin/page/DataCleanup';
import TransferData from './admin/page/TransferData';
import ActivityLogs from './admin/page/ActivityLogs';
import Configurations from './admin/page/Configurations';
import Licenses from './admin/page/Licenses';
import StorageLimits from './admin/page/StorageLimits';
import AdminWeb from './admin/page/AdminWeb';
import Settings from './admin/page/Settings';
import CreateUser from './admin/page/CreateUser';
import ChangePassword from './admin/page/ChangePassword';
import EmppTask from './hrCds/pages/hr/EmmpTask';

// HR CDS Pages
import Alerts from './hrCds/pages/Alerts';
import Attendance from './hrCds/pages/Attendance';
import ExpenseManagement from './hrCds/pages/ExpenseManagement';
import ExternalRecruiter from './hrCds/pages/ExternalRecruiter';
import Intranet from './hrCds/pages/Intranet';
import MyAssets from './hrCds/pages/MyAssets';
import MyCompensation from './hrCds/pages/MyCompensation';
import MyLearning from './hrCds/pages/MyLearning';
import MyLeaves from './hrCds/pages/MyLeaves';
import MyOKR from './hrCds/pages/MyOKR';
import MyPerformance from './hrCds/pages/MyPerformance';
import MyTaskManagement from './hrCds/pages/MyTaskManagement';
import Recruitment from './hrCds/pages/Recruitment';
import People from './hrCds/pages/People';
import Profile from './hrCds/pages/Profile';
import Timesheet from './hrCds/pages/Timesheet';
import UserDashboard from './hrCds/pages/UserDashboard';


//hr
import EmppDetail from './hrCds/pages/hr/EmppDetail';
import EmppLeave from './hrCds/pages/hr/EmppLeaves';
import EmppAsset from './hrCds/pages/hr/EmppAssets';
import EmppAttendence from './hrCds/pages/hr/EmppAttendence';
import TaskDeatils from './hrCds/pages/hr/TaskDetails';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route index element={<Runo />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/autodialer" element={<AutoDialer />} />
        <Route path="/callmanagement" element={<CallManagement />} />
        <Route path="/leadmanagement" element={<LeadManagement />} />
        <Route path="/telecaller" element={<Telecaller />} />
        <Route path="/callcenter" element={<CallCenter />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected USER Routes */}
        <Route
          path="/user/*"
          element={
            <ThemeContextProvider>
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            </ThemeContextProvider>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="allocations" element={<Allocations />} />
          <Route path="customers" element={<Customers />} />
          <Route path="interactions" element={<Interactions />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="call-logs" element={<CallLogs />} />
          <Route path="recurring-follow-ups" element={<RecurringFollowUps />} />
          <Route path="request-reports" element={<RequestReports />} />
          <Route path="rechurn-customers" element={<RechurnCustomers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="templates/whatsapp" element={<WhatsappTemplate />} />
          <Route path="templates/email" element={<EmailTemplate />} />
          <Route path="templates/sms" element={<SMSTemplate />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Protected ADMIN Routes */}
        <Route
          path="/admin/*"
          element={
            <ThemeContextProvider>
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            </ThemeContextProvider>
          }
        >
          <Route path="team" element={<Team />} />
          <Route path="roles" element={<Roles />} />
          <Route path="crm-fields" element={<CRMFields />} />
          <Route path="company" element={<CompanyDetails />} />
          <Route path="data-cleanup" element={<DataCleanup />} />
          <Route path="transfer" element={<TransferData />} />
          <Route path="activity" element={<ActivityLogs />} />
          <Route path="config" element={<Configurations />} />
          <Route path="licenses" element={<Licenses />} />
          <Route path="storage" element={<StorageLimits />} />
          <Route path="web" element={<AdminWeb />} />

          {userRole === 'manager' && (
            <>
              <Route path="create-user" element={<CreateUser />} />
              <Route path="change-password" element={<ChangePassword />} />
            </>
          )}
        </Route>

        {/* Protected HR CDS Routes */}
        <Route
          path="/cds/*"
          element={
            <ThemeContextProvider>
              <ProtectedRoute>
                <Layout2 />
              </ProtectedRoute>
            </ThemeContextProvider>
          }
        >
          <Route path="alert" element={<Alerts />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="expense-management" element={<ExpenseManagement />} />
          <Route path="external-recruiter" element={<ExternalRecruiter />} />
          <Route path="intranet" element={<Intranet />} />
          <Route path="my-assets" element={<MyAssets />} />
          <Route path="my-compensation" element={<MyCompensation />} />
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="my-leaves" element={<MyLeaves />} />
          <Route path="my-okr" element={<MyOKR />} />
          <Route path="my-performance" element={<MyPerformance />} />
          <Route path="my-task-management" element={<MyTaskManagement />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="people" element={<People />} />
          <Route path="profile" element={<Profile />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="emp-details" element={<EmppDetail />} />
          <Route path="emp-leaves" element={<EmppLeave />} />
          <Route path="emp-assets" element={<EmppAsset />} />
          <Route path="emp-attendance" element={<EmppAttendence />} />
          <Route path="emp-task-management" element={<EmppTask />} />
          <Route path="emp-task-details" element={<TaskDeatils />} />
        </Route>
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
