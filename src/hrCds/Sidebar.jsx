import React, { useEffect, useState, useRef } from 'react';
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
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  LogoutOutlined
} from '@mui/icons-material';
import Swal from "sweetalert2";
import {
  FaHome, FaClipboardList, FaFileAlt, FaRocket, FaMoneyBill, FaWallet,
  FaBullseye, FaChartLine, FaTasks, FaUserPlus, FaUserTie, FaNetworkWired,
  FaGraduationCap, FaBell, FaUsers, FaUser, FaCog, FaBuilding
} from 'react-icons/fa';

const drawerWidthOpen = 260;
const drawerWidthClosed = 70;

const SidebarContainer = styled(Box)(({ theme }) => ({
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
  transition: 'width 0.3s ease, transform 0.3s ease',
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

const MobileSidebarContainer = styled(Box)(({ theme }) => ({
  width: drawerWidthOpen,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  height: 'calc(100vh - 64px)',
  overflowY: 'auto',
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

const Sidebar = ({ isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);
  const hoverTimer = useRef(null);
  const leaveTimer = useRef(null);

  // Mobile पर always open रहेगा, Desktop पर hover-based
  const isSidebarOpen = isMobile ? true : isHovered;

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return; // Mobile पर hover नहीं चाहिए
    
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    
    hoverTimer.current = setTimeout(() => {
      setIsHovered(true);
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isMobile) return; // Mobile पर hover नहीं चाहिए
    
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    
    leaveTimer.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (!isMobile) {
      setIsHovered(false);
    }
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

  // Menu Structure - सभी items सभी users के लिए दिखेंगे
  const menuSections = [
    {
      id: 'main',
      heading: 'Main Menu',
      items: [
        { 
          icon: <FaHome />, 
          name: 'Dashboard', 
          path: '/cds/user-dashboard'
        },
        { 
          icon: <FaClipboardList />, 
          name: 'Attendance', 
          path: '/cds/attendance'
        },
        { 
          icon: <FaFileAlt />, 
          name: 'My Leaves', 
          path: '/cds/my-leaves'
        },
        { 
          icon: <FaRocket />, 
          name: 'My Assets', 
          path: '/cds/my-assets'
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
          path: '/cds/task-management'
        },
        { 
          icon: <FaTasks />, 
          name: 'Employee Project', 
          path: '/cds/project'
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
          path: '/cds/alert'
        },
        { 
          icon: <FaTasks />, 
          name: 'Employee Meeting', 
          path: '/cds/employee-meeting'
        },
      ]
    },
    {
      id: 'admin',
      heading: 'Administration',
      items: [
        { 
          icon: <FaUser />, 
          name: 'Employee Details', 
          path: '/cds/admin/emp-details'
        },
        { 
          icon: <FaClipboardList />, 
          name: 'Employees Attendance', 
          path: '/cds/admin/emp-attendance'
        },
        { 
          icon: <FaFileAlt />, 
          name: 'Employees Leaves', 
          path: '/cds/admin/emp-leaves'
        },
        { 
          icon: <FaRocket />, 
          name: 'Employees Assets', 
          path: '/cds/admin/emp-assets'
        },
        { 
          icon: <FaTasks />, 
          name: 'Employees Task Create', 
          path: '/cds/admin/admin-task-create'
        },
        { 
          icon: <FaTasks />, 
          name: 'Client', 
          path: '/cds/admin/emp-client'
        },
        { 
          icon: <FaTasks />, 
          name: 'Employees All Task', 
          path: '/cds/admin/emp-all-task'
        },
        { 
          icon: <FaUsers />, 
          name: 'Admin Meeting', 
          path: '/cds/admin/admin-meeting'
        },
        { 
          icon: <FaNetworkWired />, 
          name: 'Admin Projects', 
          path: '/cds/admin/adminp'
        },
        { 
          icon: <FaUserPlus />, 
          name: 'Create User', 
          path: '/cds/admin/create-user'
        },
      ]
    }
  ];

  const renderMenuSection = (section) => {
    // Mobile पर always open दिखाना है, desktop पर conditional
    const shouldShowFull = isMobile ? true : isSidebarOpen;

    return (
      <Box key={section.id}>
        {/* Section Heading */}
        {shouldShowFull ? (
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
          {section.items.map((item, idx) => (
            <StyledListItem key={`${section.id}-${idx}`} disablePadding>
              {shouldShowFull ? (
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

  // Mobile और Desktop के लिए अलग containers
  const Container = isMobile ? MobileSidebarContainer : SidebarContainer;

  return (
    <Container
      ref={sidebarRef}
      onMouseEnter={isMobile ? undefined : handleMouseEnter}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      sx={!isMobile ? {
        width: isSidebarOpen ? drawerWidthOpen : drawerWidthClosed,
      } : undefined}
    >
      {/* Menu Sections */}
      {menuSections.map((section) => renderMenuSection(section))}

      {/* Logout Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Mobile पर always full view में दिखाना है */}
        {isMobile || isSidebarOpen ? (
          <StyledListItemButton
            onClick={handleLogout}
            sx={{
              color: 'text.secondary',
              '&:hover': { 
                color: 'error.main',
                backgroundColor: 'action.hover'
              }
            }}
          >
            <StyledListItemIcon>
              <LogoutOutlined sx={{ fontSize: '1.2rem' }} />
            </StyledListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ 
                variant: 'body2', 
                fontWeight: 500 
              }}
            />
          </StyledListItemButton>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              onClick={handleLogout}
              sx={{
                width: '100%',
                justifyContent: 'center',
                color: 'text.secondary',
                padding: '8px',
                borderRadius: 2,
                '&:hover': { 
                  color: 'error.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <LogoutOutlined sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Container>
  );
};

export default Sidebar;