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
  Typography,
  Collapse
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  LogoutOutlined // Changed from LogoutIcon
} from '@mui/icons-material';
import Swal from "sweetalert2";
import {
  FaHome, FaClipboardList, FaFileAlt, FaRocket, FaClock, FaMoneyBill, FaWallet,
  FaBullseye, FaChartLine, FaTasks, FaUserPlus, FaUserTie, FaNetworkWired,
  FaGraduationCap, FaBell, FaUsers, FaUser, FaCog, FaBuilding
} from 'react-icons/fa';

const drawerWidthOpen = 260;
const drawerWidthClosed = 70;

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
  transition: 'width 0.3s ease',
  '&::-webkit-scrollbar': { 
    width: 6,
    display: 'none'
  },
  '&:hover::-webkit-scrollbar': {
    display: 'block'
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.action.hover,
    borderRadius: 3,
  },
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
  borderRight: selected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
  margin: theme.spacing(0.2, 1),
  borderRadius: 8,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(2px)',
    transition: 'all 0.2s ease',
  },
  '& .MuiListItemIcon-root': {
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 0,
  marginRight: theme.spacing(2),
  color: 'inherit',
  fontSize: '1.1rem',
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5, 2, 1),
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  letterSpacing: '0.5px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: theme.spacing(0, 1),
}));

const CollapsedHeading = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: theme.spacing(0, 1),
  display: 'flex',
  justifyContent: 'center',
}));

const Sidebar = ({ isOpen = true, closeSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [openSections, setOpenSections] = useState({});

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

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You'll be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      background: "#f9f9f9",
      color: "#333",
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "text-lg font-semibold",
        confirmButton: "px-4 py-2 rounded-md",
        cancelButton: "px-4 py-2 rounded-md",
      },
    });

    if (result.isConfirmed) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      Swal.fire({
        title: "Logged Out!",
        text: "You have successfully logged out.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => navigate("/login"), 1800);
    }
  };

  // -----------------------------
  // ENHANCED MENU STRUCTURE WITH PROPER ROLE CONTROL
  // -----------------------------
  const menuSections = [
    {
      id: 'main',
      heading: 'Main Menu',
      items: [
        { 
          icon: <FaHome />, 
          name: 'Dashboard', 
          path: '/cds/user-dashboard', 
          roles: ['user', 'hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaClipboardList />, 
          name: 'Attendance', 
          path: '/cds/attendance', 
          roles: ['user', 'hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaFileAlt />, 
          name: 'My Leaves', 
          path: '/cds/my-leaves', 
          roles: ['user', 'hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaRocket />, 
          name: 'My Assets', 
          path: '/cds/my-assets', 
          roles: ['user', 'hr', 'manager', 'admin', 'SuperAdmin'] 
        },
      ]
    },
    {
      id: 'tasks',
      heading: 'Tasks & Projects',
      items: [
        { 
          icon: <FaGraduationCap />, 
          name: 'Create Task', 
          path: '/cds/task-management', 
          roles: ['user', 'hr', 'manager'] // ❌ Admin can't see
        },
        { 
          icon: <FaTasks />, 
          name: 'Employee Project', 
          path: '/cds/project', 
          roles: ['user', 'hr', 'manager'] // ❌ Admin can't see
        },
      ]
    },
    {
      id: 'communication',
      heading: 'Communication',
      items: [
        { 
          icon: <FaBell />, 
          name: 'Alerts', 
          path: '/cds/alert', 
          roles: ['user', 'hr', 'manager', 'admin', 'SuperAdmin'] // ✅ Everyone
        },
        { 
          icon: <FaTasks />, 
          name: 'Employee Meeting', 
          path: '/cds/employee-meeting', 
          roles: ['user', 'hr', 'manager', 'admin', 'SuperAdmin'] // ✅ Everyone
        },
      ]
    },
    {
      id: 'admin',
      heading: 'Administration',
      roles: ['hr', 'manager', 'admin', 'SuperAdmin'], // Only these roles can see this section
      items: [
        { 
          icon: <FaUser />, 
          name: 'Employee Details', 
          path: '/cds/admin/emp-details', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaClipboardList />, 
          name: 'Employees Attendance', 
          path: '/cds/admin/emp-attendance', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaFileAlt />, 
          name: 'Employees Leaves', 
          path: '/cds/admin/emp-leaves', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaRocket />, 
          name: 'Employees Assets', 
          path: '/cds/admin/emp-assets', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaTasks />, 
          name: 'Employees Task Create', 
          path: '/cds/admin/admin-task-create', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
         { 
          icon: <FaTasks />, 
          name: 'Client', 
          path: '/cds/admin/emp-client', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaTasks />, 
          name: 'Employees All Task', 
          path: '/cds/admin/emp-all-task', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaUsers />, 
          name: 'Admin Meeting', 
          path: '/cds/admin/admin-meeting', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaNetworkWired />, 
          name: 'Admin Projects', 
          path: '/cds/admin/adminp', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
        { 
          icon: <FaUserPlus />, 
          name: 'Create User', 
          path: '/cds/admin/create-user', 
          roles: ['hr', 'manager', 'admin', 'SuperAdmin'] 
        },
      ]
    }
  ];

  // Filter menu sections based on user role
  const getFilteredMenuSections = () => {
    return menuSections.filter(section => {
      // If section has specific roles, check if user role is included
      if (section.roles) {
        return section.roles.includes(userRole);
      }
      // If no roles specified, show to all
      return true;
    });
  };

  const filteredSections = getFilteredMenuSections();

  const renderMenuSection = (section) => {
    const filteredItems = section.items.filter(item => 
      !item.roles || item.roles.includes(userRole)
    );

    if (filteredItems.length === 0) return null;

    const isSectionOpen = openSections[section.id] || !isOpen;

    return (
      <Box key={section.id}>
        {/* Section Heading */}
        {isOpen ? (
          <SectionHeading>
            {section.heading}
          </SectionHeading>
        ) : (
          <Tooltip title={section.heading} placement="right">
            <CollapsedHeading>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: (theme) => theme.palette.text.secondary,
                }}
              >
                •••
              </Typography>
            </CollapsedHeading>
          </Tooltip>
        )}

        {/* Section Items */}
        <List sx={{ py: 0 }}>
          {filteredItems.map((item, idx) => (
            <StyledListItem key={`${section.id}-${idx}`} disablePadding>
              {isOpen ? (
                <StyledListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  />
                </StyledListItemButton>
              ) : (
                <Tooltip title={item.name} placement="right">
                  <StyledListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{ justifyContent: 'center' }}
                  >
                    <StyledListItemIcon sx={{ marginRight: 0, fontSize: '1.2rem' }}>
                      {item.icon}
                    </StyledListItemIcon>
                  </StyledListItemButton>
                </Tooltip>
              )}
            </StyledListItem>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <SidebarComponent>
      {/* Menu Sections */}
      {filteredSections.map(renderMenuSection)}

      {/* Logout Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Tooltip title="Logout" placement="right">
          <IconButton
            onClick={handleLogout}
            sx={{
              width: '100%',
              justifyContent: isOpen ? 'flex-start' : 'center',
              color: 'text.secondary',
              padding: isOpen ? '8px 16px' : '8px',
              borderRadius: 2,
              '&:hover': { 
                color: 'error.main',
                backgroundColor: 'action.hover'
              }
            }}
          >
            <LogoutOutlined sx={{ mr: isOpen ? 2 : 0, fontSize: '1.2rem' }} />
            {isOpen && (
              <Typography variant="body2" fontWeight={500}>
                Logout
              </Typography>
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </SidebarComponent>
  );
};

export default Sidebar;