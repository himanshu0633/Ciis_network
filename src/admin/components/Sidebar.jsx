import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  styled,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountTree as AllocationsIcon,
  People as CustomersIcon,
  Forum as InteractionsIcon,
  AssignmentTurnedIn as FollowUpsIcon,
  CalendarToday as CalendarIcon,
  Call as CallLogsIcon,
  History as RecurringFollowUpsIcon,
  Description as RequestReportsIcon,
  HowToReg as RechurnCustomersIcon,
  BarChart as AnalyticsIcon,
  WhatsApp as WhatsappIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Groups as TeamIcon,
  Tune as RolesPermissionsIcon,
  ViewColumn as CRMFieldsIcon,
  Business as CompanyDetailsIcon,
  Delete as DataCleanupIcon,
  SwapHoriz as TransferDataIcon,
  ListAlt as ActivityLogsIcon,
  Settings as ConfigurationsIcon,
  VpnKey as PasswordIcon,            // ✅ For Change Password
  GppGood as LicensesIcon,           // ✅ Fix for Licenses (previously undefined)
  Storage as StorageLimitsIcon,
  Public as AdminWebIcon,
  Settings as SettingsIcon,
  People as CreateUserIcon
} from '@mui/icons-material';

// Styled components
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  height: 'calc(100vh - 64px)',
  position: 'fixed',
  top: 64,
  left: 0,
  zIndex: theme.zIndex.drawer,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowY: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const CollapsedSidebar = styled(SidebarContainer)(({ theme }) => ({
  width: 72,
  overflowX: 'hidden',
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5, 2, 1),
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.5px',
}));

const StyledListItem = styled(ListItem)({
  padding: 0,
});

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  minHeight: 48,
  justifyContent: 'initial',
  padding: theme.spacing(1, 2),
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiListItemIcon-root': {
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 0,
  marginRight: theme.spacing(2),
  color: 'inherit',
}));

// Sidebar Component
const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role) {
      setUserRole(user.role);
    }
  }, []);

  const menuItems = [
    { heading: 'Main' },
    { icon: <DashboardIcon />, name: 'Dashboard', route: '/user/dashboard' },
    { icon: <AllocationsIcon />, name: 'Allocations', route: '/user/allocations' },
    { icon: <CustomersIcon />, name: 'Customers', route: '/user/customers' },
    { icon: <InteractionsIcon />, name: 'Interactions', route: '/user/interactions' },
    { icon: <FollowUpsIcon />, name: 'Follow-Ups', route: '/user/follow-ups' },
    { icon: <CalendarIcon />, name: 'Calendar', route: '/user/calendar' },
    { icon: <CallLogsIcon />, name: 'Call Logs', route: '/user/call-logs' },
    { icon: <RecurringFollowUpsIcon />, name: 'Recurring Follow-Ups', route: '/user/recurring-follow-ups' },
    { icon: <RequestReportsIcon />, name: 'Request Reports', route: '/user/request-reports' },
    { icon: <RechurnCustomersIcon />, name: 'Rechurn Customers', route: '/user/rechurn-customers' },
    { icon: <AnalyticsIcon />, name: 'Analytics', route: '/user/analytics' },

    { heading: 'Templates' },
    { icon: <WhatsappIcon />, name: 'Whatsapp', route: '/user/templates/whatsapp' },
    { icon: <EmailIcon />, name: 'Email', route: '/user/templates/email' },
    { icon: <SmsIcon />, name: 'SMS', route: '/user/templates/sms' },

    { heading: 'Administration' },

    ...(userRole === 'manager' || userRole === 'admin' || userRole === 'hr'|| userRole === 'SuperAdmin'
      ? [
        { icon: <CreateUserIcon />, name: 'Create User', route: '/admin/create-user' },
        { icon: <PasswordIcon />, name: 'Change Password', route: '/admin/change-password' },
        { icon: <TeamIcon />, name: 'Team', route: '/admin/team' },
        { icon: <RolesPermissionsIcon />, name: 'Roles & Permissions', route: '/admin/roles' },
        { icon: <CRMFieldsIcon />, name: 'CRM Fields', route: '/admin/crm-fields' },
        { icon: <CompanyDetailsIcon />, name: 'Company Details', route: '/admin/company' },
        { icon: <DataCleanupIcon />, name: 'Data Cleanup', route: '/admin/data-cleanup' },
        { icon: <TransferDataIcon />, name: 'Transfer Data', route: '/admin/transfer' },
        { icon: <ActivityLogsIcon />, name: 'Activity Logs', route: '/admin/activity' },
        { icon: <ConfigurationsIcon />, name: 'Configurations', route: '/admin/config' },
        { icon: <LicensesIcon />, name: 'Licenses', route: '/admin/licenses' },
        { icon: <StorageLimitsIcon />, name: 'Storage Limits', route: '/admin/storage' },
        { icon: <AdminWebIcon />, name: 'Admin Web', route: '/admin/web' },
      ]
      : []),
    { icon: <SettingsIcon />, name: 'Settings', route: '/user/settings' },
  ];

  const handleClick = (route) => {
    navigate(route);
    closeSidebar?.(); // optional
  };

  const SidebarComponent = isOpen ? SidebarContainer : CollapsedSidebar;

  return (
    <SidebarComponent>
      <List>
        {menuItems.map((item, idx) =>
          item.heading ? (
            isOpen && (
              <SectionHeading key={idx}>
                {item.heading}
              </SectionHeading>
            )
          ) : (
            <StyledListItem key={idx} disablePadding>
              {isOpen ? (
                <StyledListItemButton
                  selected={location.pathname.startsWith(item.route)}
                  onClick={() => handleClick(item.route)}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500,
                    }}
                  />
                </StyledListItemButton>
              ) : (
                <Tooltip title={item.name} placement="right">
                  <StyledListItemButton
                    selected={location.pathname.startsWith(item.route)}
                    onClick={() => handleClick(item.route)}
                    sx={{ justifyContent: 'center' }}
                  >
                    <StyledListItemIcon sx={{ marginRight: 0 }}>
                      {item.icon}
                    </StyledListItemIcon>
                  </StyledListItemButton>
                </Tooltip>
              )}
            </StyledListItem>
          )
        )}
      </List>
    </SidebarComponent>
  );
};

export default Sidebar;
