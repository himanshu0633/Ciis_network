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
  overflow: 'auto',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  marginLeft: isMobile ? 0 : open ? drawerWidthOpen : drawerWidthClosed,
}));

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <LayoutContainer>
      <CssBaseline />

      <Header
        toggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
      />

      {/* Permanent Sidebar for Desktop */}
      {!isMobile && (
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: drawerWidthOpen } }}
        >
          <Sidebar
            isOpen
            closeSidebar={() => setSidebarOpen(false)}
          />
        </Drawer>
      )}

      <MainContent open={sidebarOpen} isMobile={isMobile}>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default UserLayout;
