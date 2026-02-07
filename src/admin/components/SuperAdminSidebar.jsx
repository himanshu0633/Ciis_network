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
  Business as CompanyIcon, // ✅ NEW icon
  CorporateFare as DepartmentIcon, // Changed icon
  WorkOutline as JobRoleIcon, // ✅ NEW icon
  PersonAdd as CreateUserIcon, // ✅ NEW icon
  VpnKey as PasswordIcon,
  Badge as EmpDetailsIcon,
  EventAvailable as EmpLeavesIcon,
  Computer as EmpAssetsIcon,
  Schedule as EmpAttendanceIcon,
  Task as TaskManagementIcon,
  Assignment as TaskDetailsIcon,
  AddTask as AdminTaskIcon,
  MeetingRoom as MeetingIcon,
  AssignmentInd as AdminProjectIcon,
  ListAlt as AllTasksIcon,
  PeopleAlt as ClientIcon,
  NotificationsActive as AlertIcon,
  Today as AttendanceIcon,
  DevicesOther as MyAssetsIcon,
  BeachAccess as MyLeavesIcon,
  TrendingUp as MyPerformanceIcon,
  ManageAccounts as ProfileIcon,
  Work as ProjectIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';

// Styled components (same as before)
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

// Updated Sidebar Component with new routes
const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const ciisUserMenuItems = [
    { heading: 'Dashboard' },
    { icon: <DashboardIcon />, name: 'Super Admin Dashboard', route: '/Ciis-network/SuperAdminDashboard' },
    
    { heading: 'Company Management' },
    { icon: <CompanyIcon />, name: 'All Company', route: '/Ciis-network/all-company' },
    { icon: <DepartmentIcon />, name: 'Department', route: '/Ciis-network/department' },
    { icon: <JobRoleIcon />, name: 'Job Roles', route: '/Ciis-network/JobRoleManagement' },
    { icon: <CreateUserIcon />, name: 'Create User', route: '/Ciis-network/create-user' },
    
    // Removed the old ciisUser routes as per your request
  ];

  const handleClick = (route) => {
    navigate(route);
    if (isMobile) {
      closeSidebar?.();
    }
  };

  const SidebarComponent = isOpen ? SidebarContainer : CollapsedSidebar;

  return (
    <SidebarComponent>
      <List>
        {ciisUserMenuItems.map((item, idx) =>
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