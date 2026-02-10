import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  useTheme,
  CircularProgress,
  Alert,
  Collapse,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventNoteIcon,
  Computer as ComputerIcon,
  Task as TaskIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
  VideoCall as VideoCallIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ListAlt as ListAltIcon,
  MeetingRoom as MeetingRoomIcon,
  Apartment as ApartmentIcon,
  PersonAdd as PersonAddIcon,
  Key as KeyIcon,
  AccountCircle as ProfileIcon,
  LogoutOutlined,
  Settings as SettingsIcon,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  ChevronLeft,
  Home,
  Assignment,
  BusinessCenter,
  People,
  Chat,
  Description,
  Assessment,
  Security,
  AdminPanelSettings
} from '@mui/icons-material';
import Swal from "sweetalert2";
import  axiosInstance  from '../utils/axiosConfig';

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
  overflowX: 'hidden',
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
  overflowX: 'hidden',
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CollapsedHeading = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: theme.spacing(0, 1),
  display: 'flex',
  justifyContent: 'center',
}));

// Comprehensive icon mapping
const iconMap = {
  'Dashboard': DashboardIcon,
  'Home': Home,
  'CalendarToday': CalendarIcon,
  'Calendar': CalendarIcon,
  'EventNote': EventNoteIcon,
  'Event': EventNoteIcon,
  'Computer': ComputerIcon,
  'Laptop': ComputerIcon,
  'Task': TaskIcon,
  'Assignment': Assignment,
  'Groups': GroupsIcon,
  'People': People,
  'Notifications': NotificationsIcon,
  'Notification': NotificationsIcon,
  'VideoCall': VideoCallIcon,
  'Video': VideoCallIcon,
  'Person': PersonIcon,
  'User': PersonIcon,
  'Business': BusinessIcon,
  'BusinessCenter': BusinessCenter,
  'ListAlt': ListAltIcon,
  'List': ListAltIcon,
  'MeetingRoom': MeetingRoomIcon,
  'Meeting': MeetingRoomIcon,
  'Apartment': ApartmentIcon,
  'Building': ApartmentIcon,
  'PersonAdd': PersonAddIcon,
  'AddUser': PersonAddIcon,
  'Key': KeyIcon,
  'Lock': KeyIcon,
  'ProfileIcon': ProfileIcon,
  'Profile': ProfileIcon,
  'Settings': SettingsIcon,
  'Setting': SettingsIcon,
  'Menu': SettingsIcon,
  'ProjectIcon': ApartmentIcon,
  'Project': ApartmentIcon,
  'ClientIcon': BusinessIcon,
  'Client': BusinessIcon,
  'Chat': Chat,
  'Message': Chat,
  'Description': Description,
  'Document': Description,
  'Assessment': Assessment,
  'Report': Assessment,
  'Security': Security,
  'AdminPanelSettings': AdminPanelSettings,
  'Admin': AdminPanelSettings,
  'Logout': LogoutOutlined
};

// Default fallback menu items (used when no config is found)
const defaultFallbackMenuItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'Dashboard',
    path: '/ciisUser/user-dashboard',
    category: 'main',
    order: 1
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: 'Profile',
    path: '/ciisUser/profile',
    category: 'settings',
    order: 1
  },

];

// ✅ Helper function to get icon component
const getIconComponent = (iconName) => {
  const IconComponent = iconMap[iconName] || DashboardIcon;
  return <IconComponent />;
};

// ✅ Path mapping helper
const getPathFromName = (name) => {
  const pathMap = {
    'Dashboard': '/ciisUser/user-dashboard',
    'Attendance': '/ciisUser/attendance',
    'My Leaves': '/ciisUser/my-leaves',
    'My Assets': '/ciisUser/my-assets',
    'Profile': '/ciisUser/profile',
    'Change Password': '/ciisUser/change-password',
    'Task Management': '/ciisUser/task-management',
    'My Tasks': '/ciisUser/my-task-management',
    'Employee Project': '/ciisUser/project',
    'Projects': '/ciisUser/project',
    'Alerts': '/ciisUser/alert',
    'Employee Meeting': '/ciisUser/employee-meeting',
    'Client Meeting': '/ciisUser/client-meeting',
    'Employee Details': '/ciisUser/emp-details',
    'Employees Attendance': '/ciisUser/emp-attendance',
    'Employee Attendance': '/ciisUser/emp-attendance',
    'Employees Leaves': '/ciisUser/emp-leaves',
    'Employee Leaves': '/ciisUser/emp-leaves',
    'Employees Assets': '/ciisUser/emp-assets',
    'Employee Assets': '/ciisUser/emp-assets',
    'Employee Task Management': '/ciisUser/emp-task-management',
    'Admin Create Task': '/ciisUser/admin-task-create',
    'Client Management': '/ciisUser/emp-client',
    'Company All Tasks': '/ciisUser/company-all-task',
    'Department All Tasks': '/ciisUser/department-all-task',
    'Admin Meeting': '/ciisUser/admin-meeting',
    'Admin Projects': '/ciisUser/adminproject',
    'Task Details': '/ciisUser/emp-task-details',
    'Create User': '/ciisUser/create-user',
    'Sidebar Management': '/ciisUser/sidebar-management',
    'Settings': '/ciisUser/settings',
    'Admin Dashboard': '/ciisUser/admin-dashboard'
  };
  
  return pathMap[name] || '/ciisUser/user-dashboard';
};

// ✅ Default menu items for different roles
const getDefaultMenuItemsByRole = (role = '') => {
  const roleLower = role.toLowerCase();
  
  const baseItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'Dashboard',
      path: '/ciisUser/user-dashboard',
      category: 'main',
      order: 1
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: 'Profile',
      path: '/ciisUser/profile',
      category: 'settings',
      order: 1
    },
    {
      id: 'change-password',
      name: 'Change Password',
      icon: 'Key',
      path: '/ciisUser/change-password',
      category: 'settings',
      order: 2
    }
  ];

  if (['admin', 'superadmin', 'hr', 'manager'].includes(roleLower)) {
    return [
      ...baseItems,
      {
        id: 'employee-management',
        name: 'Employee Management',
        icon: 'People',
        path: '/ciisUser/emp-details',
        category: 'administration',
        order: 1
      },
      {
        id: 'attendance-management',
        name: 'Attendance',
        icon: 'Calendar',
        path: '/ciisUser/emp-attendance',
        category: 'administration',
        order: 2
      },
      {
        id: 'leave-management',
        name: 'Leaves',
        icon: 'Event',
        path: '/ciisUser/emp-leaves',
        category: 'administration',
        order: 3
      },
      {
        id: 'task-management',
        name: 'Task Management',
        icon: 'Task',
        path: '/ciisUser/emp-task-management',
        category: 'administration',
        order: 4
      },
      {
        id: 'sidebar-management',
        name: 'Sidebar Management',
        icon: 'Settings',
        path: '/ciisUser/sidebar-management',
        category: 'administration',
        order: 5
      }
    ];
  }

  return [
    ...baseItems,
    {
      id: 'my-attendance',
      name: 'My Attendance',
      icon: 'Calendar',
      path: '/ciisUser/attendance',
      category: 'main',
      order: 2
    },
    {
      id: 'my-leaves',
      name: 'My Leaves',
      icon: 'Event',
      path: '/ciisUser/my-leaves',
      category: 'main',
      order: 3
    },
    {
      id: 'my-tasks',
      name: 'My Tasks',
      icon: 'Task',
      path: '/ciisUser/my-task-management',
      category: 'main',
      order: 4
    }
  ];
};

const Sidebar = ({ isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [sidebarConfig, setSidebarConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);
  const hoverTimer = useRef(null);
  const leaveTimer = useRef(null);

  // Mobile पर always open रहेगा, Desktop पर hover-based
  const isSidebarOpen = isMobile ? true : isHovered;

  // LocalStorage से user data और company details fetch करें
  useEffect(() => {
    const fetchLocalData = () => {
      try {
        const user = localStorage.getItem("user");
        const companyDetails = localStorage.getItem("companyDetails");
        
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserData(parsedUser);
        }
        
        if (companyDetails) {
          const parsedCompany = JSON.parse(companyDetails);
          setCompanyData(parsedCompany);
        }
      } catch (error) {
        console.error("Error parsing local storage data:", error);
        setError("Failed to load user data");
      }
    };

    fetchLocalData();
  }, []);

  // Fetch sidebar configuration when user and company data are loaded
  const fetchSidebarConfig = useCallback(async () => {
    if (!userData || !companyData) return;

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      
      console.log('Fetching sidebar config with:', {
        companyId: userData.company,
        departmentId: userData.department,
        role: userData.jobRole
      });

      const response = await axiosInstance.get(`/sidebar/config`, {
        params: {
          companyId: userData.company,
          departmentId: userData.department,
          role: userData.jobRole
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Sidebar config API response:', response.data);

      if (response.data && response.data.success) {
        if (response.data.data) {
          // Use custom configuration from database
          setSidebarConfig(response.data.data);
        } else {
          // No custom config found, use default based on role
          setSidebarConfig({ 
            useDefault: true,
            message: 'Using default configuration'
          });
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch sidebar config');
      }
    } catch (error) {
      console.error('Error fetching sidebar config:', error);
      setError(`Failed to load sidebar configuration: ${error.message}`);
      // Use default configuration on error
      setSidebarConfig({ 
        useDefault: true,
        message: 'Using default due to error'
      });
    } finally {
      setLoading(false);
    }
  }, [userData, companyData]);

  useEffect(() => {
    if (userData && companyData) {
      fetchSidebarConfig();
    } else {
      setLoading(false);
    }
  }, [userData, companyData, fetchSidebarConfig]);

  useEffect(() => {
    // Initialize expanded sections based on current path
    const pathSections = location.pathname.split('/').filter(Boolean);
    const currentSection = pathSections[1] || 'main';
    setExpandedSections(prev => ({
      ...prev,
      [currentSection]: true
    }));
  }, [location.pathname]);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;
    
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    
    hoverTimer.current = setTimeout(() => {
      setIsHovered(true);
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    
    leaveTimer.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavigate = (path) => {
    if (path === 'logout') {
      handleLogout();
      return;
    }
    
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
      localStorage.removeItem("companyDetails");

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

  const handleManageSidebar = () => {
    navigate('/ciisUser/sidebar-management');
  };

  const handleRetry = () => {
    setError(null);
    if (userData && companyData) {
      fetchSidebarConfig();
    }
  };

  // ✅ Get menu items based on configuration
  const menuItems = useMemo(() => {
    if (loading) return [];

    console.log('Current sidebar config:', sidebarConfig);

    // If we have a custom config from database
    if (sidebarConfig && sidebarConfig.menuItems && Array.isArray(sidebarConfig.menuItems)) {
      console.log('Using custom config with', sidebarConfig.menuItems.length, 'items');
      
      return sidebarConfig.menuItems
        .map(item => {
          // Ensure item has required properties
          const processedItem = {
            id: item.id || item._id || Math.random().toString(36).substr(2, 9),
            name: item.name || 'Unnamed Item',
            icon: item.icon || 'Dashboard',
            category: item.category || 'main',
            order: item.order || 99,
            path: item.path || getPathFromName(item.name),
            disabled: item.disabled || false,
            visible: item.visible !== false // Default to true if not specified
          };

          return processedItem;
        })
        .filter(item => item.visible && !item.disabled) // Filter out hidden/disabled items
        .sort((a, b) => (a.order || 99) - (b.order || 99)); // Sort by order
    } 
    // If no custom config, use default based on role
    else if (sidebarConfig && sidebarConfig.useDefault) {
      console.log('Using default menu items for role:', userData?.jobRole);
      return getDefaultMenuItemsByRole(userData?.jobRole);
    }
    // Fallback to minimal items
    else {
      console.log('Using fallback menu items');
      return defaultFallbackMenuItems;
    }
  }, [sidebarConfig, loading, userData]);

  // ✅ Organize items into sections
  const menuSections = useMemo(() => {
    if (!menuItems || menuItems.length === 0) {
      return [];
    }

    // Define all possible sections
    const sectionDefinitions = [
      { id: 'main', name: 'Main Menu', icon: 'Home', defaultExpanded: true },
      { id: 'tasks', name: 'Tasks', icon: 'Task', defaultExpanded: false },
      { id: 'projects', name: 'Projects', icon: 'Project', defaultExpanded: false },
      { id: 'meetings', name: 'Meetings', icon: 'Meeting', defaultExpanded: false },
      { id: 'communication', name: 'Communication', icon: 'Chat', defaultExpanded: false },
      { id: 'administration', name: 'Administration', icon: 'Admin', defaultExpanded: false },
      { id: 'settings', name: 'Settings', icon: 'Settings', defaultExpanded: false },
      { id: 'clients', name: 'Clients', icon: 'Client', defaultExpanded: false }
    ];

    // Group items by category
    const groupedItems = {};
    menuItems.forEach(item => {
      const category = item.category || 'main';
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(item);
    });

    // Create sections with items
    const sections = sectionDefinitions
      .filter(section => groupedItems[section.id] && groupedItems[section.id].length > 0)
      .map(section => ({
        ...section,
        items: groupedItems[section.id],
        isExpanded: expandedSections[section.id] !== undefined 
          ? expandedSections[section.id] 
          : section.defaultExpanded
      }));

    return sections;
  }, [menuItems, expandedSections]);

  const renderMenuSection = (section) => {
    const shouldShowFull = isMobile ? true : isSidebarOpen;
    const isExpanded = section.isExpanded && shouldShowFull;

    return (
      <Box key={section.id} sx={{ mb: 1 }}>
        {/* Section Heading */}
        {shouldShowFull ? (
          <SectionHeading>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getIconComponent(section.icon)}
              <span>{section.name}</span>
            </Box>
            {section.items.length > 0 && (
              <IconButton
                size="small"
                onClick={() => toggleSection(section.id)}
                sx={{ p: 0 }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </SectionHeading>
        ) : (
          <Tooltip title={section.name} placement="right">
            <CollapsedHeading>
              {getIconComponent(section.icon)}
            </CollapsedHeading>
          </Tooltip>
        )}

        {/* Section Items */}
        <Collapse in={isExpanded} timeout="auto">
          <List sx={{ py: 0 }}>
            {section.items.map((item) => (
              <StyledListItem key={item.id} disablePadding>
                {shouldShowFull ? (
                  <StyledListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => !item.disabled && handleNavigate(item.path)}
                    disabled={item.disabled}
                    sx={{
                      opacity: item.disabled ? 0.5 : 1,
                      cursor: item.disabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <StyledListItemIcon>
                      {getIconComponent(item.icon)}
                    </StyledListItemIcon>
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.9rem'
                      }}
                    />
                    {item.badge && (
                      <Box sx={{ 
                        ml: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '12px',
                        px: 1,
                        py: 0.25,
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        {item.badge}
                      </Box>
                    )}
                  </StyledListItemButton>
                ) : (
                  <Tooltip title={item.name} placement="right">
                    <StyledListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => !item.disabled && handleNavigate(item.path)}
                      disabled={item.disabled}
                      sx={{ 
                        justifyContent: 'center',
                        opacity: item.disabled ? 0.5 : 1,
                        cursor: item.disabled ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <StyledListItemIcon sx={{ marginRight: 0, fontSize: '1.2rem' }}>
                        {getIconComponent(item.icon)}
                      </StyledListItemIcon>
                    </StyledListItemButton>
                  </Tooltip>
                )}
              </StyledListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  };

  // Mobile और Desktop के लिए अलग containers
  const Container = isMobile ? MobileSidebarContainer : SidebarContainer;

  // Check if user has permission to manage sidebar (admin users only)
  const canManageSidebar = useMemo(() => {
    if (!userData || !userData.jobRole) return false;
    const adminRoles = ['admin', 'hr', 'manager', 'superadmin', 'SuperAdmin'];
    return adminRoles.includes(userData.jobRole);
  }, [userData]);

  // Loading state
  if (loading) {
    return (
      <Container
        sx={!isMobile ? {
          width: isSidebarOpen ? drawerWidthOpen : drawerWidthClosed,
        } : undefined}
      >
        <Box sx={{ 
          p: 2, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <CircularProgress size={24} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading menu...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error && !sidebarConfig) {
    return (
      <Container
        sx={!isMobile ? {
          width: isSidebarOpen ? drawerWidthOpen : drawerWidthClosed,
        } : undefined}
      >
        <Box sx={{ p: 2 }}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Using basic navigation
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      ref={sidebarRef}
      onMouseEnter={isMobile ? undefined : handleMouseEnter}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      sx={!isMobile ? {
        width: isSidebarOpen ? drawerWidthOpen : drawerWidthClosed,
      } : undefined}
    >
      {/* User Info (only when sidebar is open) */}
      {/* {isSidebarOpen && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {userData?.name || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {userData?.jobRole || 'Role'} <br />
             {userData?.department || 'Company'}
          </Typography>
          {sidebarConfig && sidebarConfig.useDefault ? (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
              Using default configuration
            </Typography>
          ) : sidebarConfig && sidebarConfig.menuItems ? (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
              Custom menu ({sidebarConfig.menuItems.length} items)
            </Typography>
          ) : null}
        </Box>
      )} */}

      {/* Menu Sections */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuSections.length > 0 ? (
          menuSections.map((section) => renderMenuSection(section))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No menu items available
            </Typography>
          </Box>
        )}
      </Box>

      {/* Management Button (for admin users) */}
      {canManageSidebar && (isMobile || isSidebarOpen) && (
        <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <StyledListItemButton
            onClick={handleManageSidebar}
            sx={{
              color: 'primary.main',
              '&:hover': { 
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <StyledListItemIcon>
              <SettingsIcon />
            </StyledListItemIcon>
            <ListItemText
              primary="Manage Sidebar"
              primaryTypographyProps={{ 
                variant: 'body2', 
                fontWeight: 500 
              }}
            />
          </StyledListItemButton>
        </Box>
      )}

      {/* Refresh Button */}
      {/* {isSidebarOpen && (
        <Box sx={{ px: 2, py: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={handleRetry}
            disabled={loading}
          >
            Refresh Menu
          </Button>
        </Box>
      )} */}

      {/* Logout Section */}
      <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        {isMobile || isSidebarOpen ? (
          <StyledListItemButton
            onClick={handleLogout}
            sx={{
              color: 'error.main',
              '&:hover': { 
                backgroundColor: 'error.light',
                color: 'error.dark'
              }
            }}
          >
            <StyledListItemIcon>
              <LogoutOutlined />
            </StyledListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ 
                variant: 'body2', 
                fontWeight: 600 
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
                color: 'error.main',
                padding: '8px',
                borderRadius: 2,
                '&:hover': { 
                  color: 'error.dark',
                  backgroundColor: 'error.light'
                }
              }}
            >
              <LogoutOutlined />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Container>
  );
};

export default Sidebar;