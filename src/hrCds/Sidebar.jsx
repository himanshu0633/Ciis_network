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
  BusinessCenter as DepartmentIcon
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

  const ciisUserMenuItems = [
    { heading: 'Dashboard' },
    { icon: <DashboardIcon />, name: 'User Dashboard', route: '/ciisUser/user-dashboard' },
    
    // { heading: 'My Profile' },
    // { icon: <ProfileIcon />, name: 'Profile', route: '/ciisUser/profile' },
    // { icon: <PasswordIcon />, name: 'Change Password', route: '/ciisUser/change-password' },
    
    { heading: 'Employee Management' },
    { icon: <EmpDetailsIcon />, name: 'Employee Details', route: '/ciisUser/emp-details' },
    { icon: <EmpLeavesIcon />, name: 'Employee Leaves', route: '/ciisUser/emp-leaves' },
    { icon: <EmpAssetsIcon />, name: 'Employee Assets', route: '/ciisUser/emp-assets' },
    { icon: <EmpAttendanceIcon />, name: 'Employee Attendance', route: '/ciisUser/emp-attendance' },
    
    { heading: 'Task Management' },
    { icon: <TaskManagementIcon />, name: 'Task Management', route: '/ciisUser/task-management' },
    { icon: <TaskDetailsIcon />, name: 'Task Details', route: '/ciisUser/emp-task-details' },
    { icon: <AllTasksIcon />, name: 'All Tasks', route: '/ciisUser/emp-all-task' },
    { icon: <TaskManagementIcon />, name: 'My Task Management', route: '/ciisUser/my-task-management' },
    { icon: <AdminTaskIcon />, name: 'Admin Task Create', route: '/ciisUser/admin-task-create' },
    
    { heading: 'Meetings' },
    { icon: <MeetingIcon />, name: 'Admin Meeting', route: '/ciisUser/admin-meeting' },
    { icon: <MeetingIcon />, name: 'Employee Meeting', route: '/ciisUser/employee-meeting' },
    { icon: <MeetingIcon />, name: 'Client Meeting', route: '/ciisUser/client-meeting' },
    
    { heading: 'Projects & Clients' },
    { icon: <ProjectIcon />, name: 'Projects', route: '/ciisUser/project' },
    { icon: <AdminProjectIcon />, name: 'Admin Projects', route: '/ciisUser/adminproject' },
    { icon: <ClientIcon />, name: 'Clients', route: '/ciisUser/emp-client' },
    
    { heading: 'Attendance & Time' },
    
    { icon: <AttendanceIcon />, name: 'Attendance', route: '/ciisUser/attendance' },
    
    { heading: 'My Records' },
    { icon: <MyAssetsIcon />, name: 'My Assets', route: '/ciisUser/my-assets' },
    { icon: <MyLeavesIcon />, name: 'My Leaves', route: '/ciisUser/my-leaves' },
    
    
    { heading: 'Organization' },
   
    { icon: <AlertIcon />, name: 'Alerts', route: '/ciisUser/alert' },
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