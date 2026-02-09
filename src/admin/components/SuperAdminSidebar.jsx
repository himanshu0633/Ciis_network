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
  Business as CompanyIcon,
  CorporateFare as DepartmentIcon,
  WorkOutline as JobRoleIcon,
  PersonAdd as CreateUserIcon,
} from '@mui/icons-material';

<<<<<<< HEAD
const Sidebar = () => {
  const menuItems = [
    { path: '/Ciis-network/SuperAdminDashboard', label: 'Dashboard', icon: '📊' },
    { path: '/Ciis-network/all-company', label: 'All Company', icon: '🏭' }, 
    { path: '/Ciis-network/company-details', label: 'Company Details', icon: '🏢' },
    { path: '/Ciis-network/department', label: 'Department', icon: '🏢' },
    { path: '/Ciis-network/JobRoleManagement', label: 'Job Roles', icon: '👔' },
    { path: '/Ciis-network/create-user', label: 'Create User', icon: '👤' },
=======
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

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [companyRole, setCompanyRole] = useState('employee');
  
  useEffect(() => {
    // localStorage से 'superAdmin' key में user object प्राप्त करें
    try {
      const userDataString = localStorage.getItem('superAdmin');
      console.log('superAdmin data from localStorage:', userDataString);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('Parsed user data:', userData);
        
        if (userData && userData.companyRole) {
          setCompanyRole(userData.companyRole);
          console.log('Company role set to:', userData.companyRole);
        } else {
          console.log('companyRole not found in user data');
          setCompanyRole('employee');
        }
      } else {
        console.log('No superAdmin data found in localStorage');
        setCompanyRole('employee');
      }
    } catch (error) {
      console.error('Error parsing superAdmin data from localStorage:', error);
      setCompanyRole('employee');
    }
  }, []);

  const ciisUserMenuItems = [
    { heading: 'Dashboard' },
    { 
      icon: <DashboardIcon />, 
      name: 'Super Admin Dashboard', 
      route: '/Ciis-network/SuperAdminDashboard',
      showForRoles: ['Owner'] // केवल Owner के लिए
    },
    
    { heading: 'Company Management' },
    { 
      icon: <CompanyIcon />, 
      name: 'All Company', 
      route: '/Ciis-network/all-company',
      showForRoles: ['Owner'] // केवल Owner के लिए
    },

    { 
      icon: <CompanyIcon />, 
      name: 'Company Details', 
      route: '/Ciis-network/company-details',
      showForRoles: ['Owner','employee'] // केवल Owner के लिए
    },
    { 
      icon: <DepartmentIcon />, 
      name: 'Department', 
      route: '/Ciis-network/department',
      showForRoles: ['Owner', 'employee'] // Owner और employee दोनों के लिए
    },
    { 
      icon: <JobRoleIcon />, 
      name: 'Job Roles', 
      route: '/Ciis-network/JobRoleManagement',
      showForRoles: ['Owner', 'employee'] // Owner और employee दोनों के लिए
    },
    { 
      icon: <CreateUserIcon />, 
      name: 'Create User', 
      route: '/Ciis-network/create-user',
      showForRoles: ['Owner', 'employee'] // Owner और employee दोनों के लिए
    },
    { 
      icon: <DashboardIcon />, 
      name: 'Company Management', 
      route: '/Ciis-network/CompanyManagement',
      showForRoles: ['Owner'] // केवल Owner के लिए
    },
       { 
      icon: <DepartmentIcon />, 
      name: 'Sidebar Management', 
      route: '/Ciis-network/SidebarManagement',
      showForRoles: ['Owner', 'employee'] // Owner और employee दोनों के लिए
    },
>>>>>>> 240a4e8eaa1426703358d465c5a80169fe41fa38
  ];

  // फ़िल्टर फ़ंक्शन जो रोल के आधार पर आइटम्स दिखाता है
  const getFilteredMenuItems = () => {
    const filteredItems = [];
    let skipNextHeading = false;
    
    for (let i = 0; i < ciisUserMenuItems.length; i++) {
      const item = ciisUserMenuItems[i];
      
      if (item.heading) {
        if (skipNextHeading) {
          skipNextHeading = false;
          continue;
        }
        filteredItems.push(item);
      } else {
        // Check if item should be shown for current role
        const shouldShow = !item.showForRoles || item.showForRoles.includes(companyRole);
        
        if (shouldShow) {
          filteredItems.push(item);
          skipNextHeading = false;
        } else {
          // If this item won't be shown and last item was a heading, mark to skip it
          if (filteredItems.length > 0 && filteredItems[filteredItems.length - 1].heading) {
            skipNextHeading = true;
          }
        }
      }
    }
    
    // Remove any heading that doesn't have items after it
    return filteredItems.filter((item, index, array) => {
      if (item.heading) {
        const hasMenuItemAfter = array
          .slice(index + 1)
          .some(nextItem => !nextItem.heading);
        return hasMenuItemAfter;
      }
      return true;
    });
  };

  const handleClick = (route) => {
    navigate(route);
    if (isMobile) {
      closeSidebar?.();
    }
  };

  const SidebarComponent = isOpen ? SidebarContainer : CollapsedSidebar;
  const filteredMenuItems = getFilteredMenuItems();

  // Debug information
  console.log('Current companyRole:', companyRole);
  console.log('Filtered menu items count:', filteredMenuItems.length);
  console.log('Filtered items:', filteredMenuItems);

  return (
    <SidebarComponent>
      <List>
        {filteredMenuItems.map((item, idx) =>
          item.heading ? (
            isOpen && (
              <SectionHeading key={`heading-${idx}`}>
                {item.heading}
              </SectionHeading>
            )
          ) : (
            <StyledListItem key={`item-${idx}`} disablePadding>
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