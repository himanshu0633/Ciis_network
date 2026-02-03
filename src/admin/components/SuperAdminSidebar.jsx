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
  useMediaQuery,
  Button
} from '@mui/material';
import {
  BusinessCenter as CompanyManagementIcon,
  SupervisorAccount as SuperAdminDashboardIcon,
  Apartment as DepartmentIcon,
  Work as JobRoleManagementIcon,
  PersonAdd as CreateUserCIIsIcon,
  Business as AllCompaniesIcon, // ✅ Naya icon
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

// Sidebar Component
const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('superAdmin'));
    if (user?.jobRole) {
      setUserRole(user.jobRole);
    }
  }, []);

  // ✅ Validation function
  const validateSuperAdmin = () => {
    console.log("=== VALIDATE SUPER ADMIN (Sidebar) ===");
    
    const superAdminRaw = localStorage.getItem("superAdmin");
    const token = localStorage.getItem("token");

    if (!superAdminRaw) {
      console.log("❌ ERROR: No superAdmin found in localStorage");
      return false;
    }

    if (!token) {
      console.log("❌ ERROR: No token found in localStorage");
      return false;
    }

    try {
      const superAdmin = JSON.parse(superAdminRaw);
      
      if (superAdmin.department !== "Management") {
        console.log(`❌ ACCESS DENIED: Department is "${superAdmin.department}", expected "Management"`);
        return false;
      }

      if (superAdmin.role !== "super-admin") {
        console.log(`❌ ACCESS DENIED: Role is "${superAdmin.role}", expected "super-admin"`);
        return false;
      }

      console.log("✅ ALL VALIDATIONS PASSED in Sidebar");
      return true;
    } catch (error) {
      console.log("❌ ERROR: Failed to parse superAdmin");
      return false;
    }
  };

  // CIIS/Admin menu items (only for SuperAdmin)
  const ciisMenuItems = userRole === 'super_admin' ? [
    { heading: 'CIIS Admin' },
    { icon: <SuperAdminDashboardIcon />, name: 'Super Admin Dashboard', route: '/Ciis/SuperAdminDashboard' },
    { icon: <CompanyManagementIcon />, name: 'Company Management', route: '/Ciis/CompanyManagement' },
    { icon: <AllCompaniesIcon />, name: 'All Companies', route: '/Ciis/all-companies' }, // ✅ Yahan add kiya
    { icon: <CreateUserCIIsIcon />, name: 'Create User', route: '/Ciis/create-user' },
    { icon: <DepartmentIcon />, name: 'Department', route: '/Ciis/department' },
    { icon: <JobRoleManagementIcon />, name: 'Job Role Management', route: '/Ciis/job-role-management' },
  ] : [];

  // Combine all menu items
  const menuItems = [...ciisMenuItems];

  const handleClick = (route) => {
    // ✅ Validation check before navigation
    if (!validateSuperAdmin()) {
      console.log("❌ Validation failed, preventing navigation");
      
      // Optionally show error message
      localStorage.removeItem("superAdmin");
      localStorage.removeItem("token");
      navigate("/Ciis/login");
      return;
    }
    
    navigate(route);
    if (isMobile) {
      closeSidebar?.();
    }
  };

  const SidebarComponent = isOpen ? SidebarContainer : CollapsedSidebar;

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <SidebarComponent>
      <List>
        {menuItems.map((item, idx) => {
          // Check if this item is a heading
          if (item.heading) {
            if (!isOpen) return null;
            
            return (
              <SectionHeading key={`heading-${idx}`}>
                {item.heading}
              </SectionHeading>
            );
          }
          
          // Check if this is a button (Create User)
          if (item.isButton) {
            return (
              <StyledListItem key={`item-${idx}`} disablePadding>
                {isOpen ? (
                  <StyledListItemButton
                    onClick={item.onClick}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    <StyledListItemIcon>
                      {item.icon}
                    </StyledListItemIcon>
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
                      onClick={item.onClick}
                      sx={{ justifyContent: 'center' }}
                    >
                      <StyledListItemIcon sx={{ marginRight: 0 }}>
                        {item.icon}
                      </StyledListItemIcon>
                    </StyledListItemButton>
                  </Tooltip>
                )}
              </StyledListItem>
            );
          }
          
          // Regular menu item with route
          return (
            <StyledListItem key={`item-${idx}`} disablePadding>
              {isOpen ? (
                <StyledListItemButton
                  selected={location.pathname === item.route || location.pathname.startsWith(item.route)}
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
                    selected={location.pathname === item.route || location.pathname.startsWith(item.route)}
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
          );
        })}
      </List>
    </SidebarComponent>
  );
};

export default Sidebar;