import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  CssBaseline,
  useMediaQuery,
  Drawer,
  Box
} from '@mui/material';
import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidthOpen = 240;
const drawerWidthClosed = 72;

const LayoutContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
});

const MainContent = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})(({ theme, open, isMobile }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: '100vh',
  width: '100%',
  overflow: 'auto',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && !isMobile && {
    width: `calc(100% - ${drawerWidthOpen}px)`,
    marginLeft: `${drawerWidthOpen}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && !isMobile && {
    width: `calc(100% - ${drawerWidthClosed}px)`,
    marginLeft: `${drawerWidthClosed}px`,
  }),
}));

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Changed to 'md' for better mobile handling

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Close sidebar on mobile when route changes
  const handleCloseMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <LayoutContainer>
      <CssBaseline />

      <Header
        toggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      {/* Permanent Sidebar for Desktop */}
      {!isMobile && (
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={toggleSidebar}
          drawerWidthOpen={drawerWidthOpen}
          drawerWidthClosed={drawerWidthClosed}
        />
      )}

      {/* Drawer for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={sidebarOpen}
          onClose={handleCloseMobileSidebar}
          ModalProps={{ 
            keepMounted: true,
            BackdropProps: { invisible: false }
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidthOpen,
            },
          }}
        >
          <Sidebar
            isOpen={true}
            closeSidebar={handleCloseMobileSidebar}
            isMobile={isMobile}
          />
        </Drawer>
      )}

      <MainContent open={sidebarOpen} isMobile={isMobile}>
        <Box sx={{ 
          maxWidth: '100%', 
          overflow: 'hidden',
          padding: { xs: 1, sm: 2, md: 7 } // Responsive padding
        }}>
          <Outlet />
        </Box>
      </MainContent>
    </LayoutContainer>
  );
};

export default UserLayout;