
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

  const SidebarComponent = isOpen ? SidebarContainer : CollapsedSidebar;

  const [userRole, setUserRole] = useState('');

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

  const staticMenu = [
    { icon: <FaHome />, name: 'Dashboard', path: '/cds/user-dashboard' },
    { icon: <FaClipboardList />, name: 'Attendance', path: '/cds/attendance' },
    { icon: <FaFileAlt />, name: 'My Leaves', path: '/cds/my-leaves' },
    { icon: <FaRocket />, name: 'My Assets', path: '/cds/my-assets' },
    // { icon: <FaClock />, name: 'Timesheet', path: '/cds/timesheet' },
    // { icon: <FaMoneyBill />, name: 'My Compensation', path: '/cds/my-compensation' },
    // { icon: <FaWallet />, name: 'Expense Management', path: '/cds/expense-management' },
    // { icon: <FaBullseye />, name: 'My OKR', path: '/cds/my-okr' },
    // { icon: <FaChartLine />, name: 'My Performance', path: '/cds/my-performance' },
    { icon: <FaTasks />, name: 'My Task Management', path: '/cds/my-task-management' },
    // { icon: <FaUserPlus />, name: 'Recruitment', path: '/cds/recruitment' },
    // { icon: <FaUserTie />, name: 'External Recruiter', path: '/cds/external-recruiter' },
    // { icon: <FaNetworkWired />, name: 'Intranet', path: '/cds/intranet' },
    // { icon: <FaGraduationCap />, name: 'My Learning', path: '/cds/my-learning' },
    { icon: <FaBell />, name: 'Alerts', path: '/cds/alert' },
    // { icon: <FaUser />, name: 'Profile', path: '/cds/profile' },
  ];

  const hrMenu = [
    { heading: "Employee's" },
    { icon: <FaClipboardList />, name: 'Employees Attendance', path: '/cds/emp-attendance' },
    { icon: <FaUser />, name: 'Employees Details', path: '/cds/emp-details' },
    { icon: <FaFileAlt />, name: 'Employees Leaves', path: '/cds/emp-leaves' },
    { icon: <FaRocket />, name: 'Employees Assests', path: '/cds/emp-assets' },
    { icon: <FaTasks />, name: 'Employees Task Management', path: '/cds/emp-task-management' },
    { icon: <FaGraduationCap />, name: 'Employees Task Details', path: '/cds/emp-task-details' },
  ];

  // const managerMenu = [
  //   { heading: "HR's" },
  //   { icon: <FaUsers />, name: 'People', path: '/cds/people' },
  //   { icon: <FaClipboardList />, name: 'HR Attendance', path: '/cds/attendance' },
  //   { icon: <FaUser />, name: 'HR Details', path: '/cds/emp-details' },
  //   { icon: <FaFileAlt />, name: 'HR Leaves', path: '/cds/attendance' },
  //   { icon: <FaRocket />, name: 'HR Assests', path: '/cds/attendance' },
  // ];

  const userMenu = [
    ...staticMenu,
    ...(userRole === 'hr' || userRole === 'manager' || userRole === 'admin' || userRole === 'SuperAdmin' ? hrMenu : []),
    // ...(userRole === 'manager' || userRole === 'admin' ? managerMenu : []),
  ];


  return (
    <SidebarComponent>
      <List>
        <SectionHeading>Menu</SectionHeading>
        {/* {userMenu.map((item, idx) => (
          <StyledListItem key={idx} disablePadding>
            {isOpen ? (
              <StyledListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                {item.heading}
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
        ))} */}

        {userMenu.map((item, idx) => {
          if (item.heading) {
            return isOpen ? (
              <SectionHeading key={`heading-${idx}`}>{item.heading}</SectionHeading>
            ) : (
              <Tooltip key={`heading-${idx}`} title={item.heading} placement="right">
                <SectionHeading
                  sx={{
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: theme => theme.spacing(1.5, .5),
                  }}
                >
                  {item.heading}
                </SectionHeading>
              </Tooltip>
            );
          }

          return (
            <StyledListItem key={idx} disablePadding>
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

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

    </SidebarComponent>
  );
};

export default Sidebar;