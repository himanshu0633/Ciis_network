import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  styled,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Divider,
  Typography
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import {
  FaHome, FaClipboardList, FaFileAlt, FaRocket, FaClock, FaMoneyBill, FaWallet,
  FaBullseye, FaChartLine, FaTasks, FaUserPlus, FaUserTie, FaNetworkWired,
  FaGraduationCap, FaBell, FaUsers, FaUser
} from 'react-icons/fa';

const drawerWidthOpen = 240;
const drawerWidthClosed = 82;

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: drawerWidthOpen,
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
  overflowY: 'auto',
  '&::-webkit-scrollbar': { display: 'none' },
}));

const CollapsedSidebar = styled(SidebarContainer)({
  width: drawerWidthClosed,
  overflowX: 'hidden',
});

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

const SectionHeading = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5, 2, 1),
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.5px',
}));

const Sidebar = ({ isOpen = true, closeSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  const SidebarComponent = isOpen ? SidebarContainer : CollapsedSidebar;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role) {
      setUserRole(user.role);
    }
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    if (closeSidebar) closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Menu configuration
  const staticMenu = [
    { icon: <FaHome />, name: 'Dashboard', path: '/cds/user-dashboard' },
    { icon: <FaClipboardList />, name: 'Attendance', path: '/cds/attendance' },
    { icon: <FaFileAlt />, name: 'My Leaves', path: '/cds/my-leaves' },
    { icon: <FaRocket />, name: 'My Assets', path: '/cds/my-assets' },
    // { icon: <FaTasks />, name: 'My Task Management', path: '/cds/my-task-management' },
    { icon: <FaGraduationCap />, name: 'Create task', path: '/cds/task-management' },
    { icon: <FaBell />, name: 'Alerts', path: '/cds/alert' },
      { icon: <FaTasks />, name: 'Employee Meeting', path: '/cds/employee-meeting' },
       { icon: <FaTasks />, name: 'Employee project', path: '/cds/emp' },
  ];

  const hrMenu = [
    { heading: "Employee's" },
    { icon: <FaClipboardList />, name: 'Employees Attendance', path: '/cds/admin/emp-attendance' },
    { icon: <FaUser />, name: 'Employees Details', path: '/cds/admin/emp-details' },
    { icon: <FaFileAlt />, name: 'Employees Leaves', path: '/cds/admin/emp-leaves' },
    { icon: <FaRocket />, name: 'Employees Assets', path: '/cds/admin/emp-assets' },
    { icon: <FaTasks />, name: 'Employees Task Create', path: '/cds/admin/admin-task-create' },
    // { icon: <FaTasks />, name: 'Employees Task Management', path: '/cds/admin/emp-task-management' },
    { icon: <FaGraduationCap />, name: 'Employees Task Details', path: '/cds/admin/emp-task-details' },
    { icon: <FaUser />, name: 'Create User', path: '/cds/admin/create-user' },
  ];

  // Combine menus based on user role
  const getUserMenu = () => {
    let menu = [...staticMenu];
    
    if (userRole === 'hr' || userRole === 'manager' || userRole === 'admin' || userRole === 'SuperAdmin') {
      menu = [...menu, ...hrMenu];
    }
    
    return menu;
  };

  const userMenu = getUserMenu();

  return (
    <SidebarComponent>
      <List>
        <SectionHeading>Menu</SectionHeading>
        
        {userMenu.map((item, idx) => {
          // Render section headings
          if (item.heading) {
            return isOpen ? (
              <SectionHeading key={`heading-${idx}`}>{item.heading}</SectionHeading>
            ) : (
              <Tooltip key={`heading-${idx}`} title={item.heading} placement="right">
                <Box sx={{ padding: (theme) => theme.spacing(1, 0.5) }}>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      color: (theme) => theme.palette.text.secondary,
                    }}
                  >
                    ...
                  </Typography>
                </Box>
              </Tooltip>
            );
          }

          // Render menu items
          return (
            <StyledListItem key={`item-${idx}`} disablePadding>
              {isOpen ? (
                <StyledListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </StyledListItemButton>
              ) : (
                <Tooltip title={item.name} placement="right">
                  <StyledListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{ justifyContent: 'center' }}
                  >
                    <StyledListItemIcon sx={{ marginRight: 0 }}>{item.icon}</StyledListItemIcon>
                  </StyledListItemButton>
                </Tooltip>
              )}
            </StyledListItem>
          );
        })}
      </List>

      {/* Logout button at bottom */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Tooltip title="Logout" placement="right">
          <IconButton 
            onClick={handleLogout}
            sx={{ 
              width: '100%', 
              justifyContent: isOpen ? 'flex-start' : 'center',
              color: 'text.secondary',
              '&:hover': { color: 'error.main' }
            }}
          >
            <LogoutIcon sx={{ mr: isOpen ? 2 : 0 }} />
            {isOpen && 'Logout'}
          </IconButton>
        </Tooltip>
      </Box>
    </SidebarComponent>
  );
};

export default Sidebar;