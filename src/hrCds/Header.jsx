import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/useAuth';
import { ColorModeContext } from '../../src/Theme/ThemeContext';
import logo from '/logoo.png'
const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: isMobile ? 56 : 64,
        justifyContent: 'center',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: isMobile ? 1.5 : 3,
          minHeight: '100% !important',
          width: '100%',
        }}
      >
        {/* Left: Menu + ciis */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
          <IconButton onClick={toggleSidebar} edge="start" size={isMobile ? 'small' : 'medium'}>
            <MenuIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        <Typography
  variant="h6"
  noWrap
  component="img"              // 👈 Typography ko image bana diya
  src={logo}             // 👈 Apna logo yahan daalo
  alt="Logo"
  onClick={() => navigate('/user/dashboard')}
  sx={{
    height: isMobile ? 35 : 50,  // 👈 Responsive height
    width: 'auto',
    cursor: 'pointer',
    display: 'block',
    objectFit: 'contain',
    '&:hover': {
      opacity: 0.9,
      transform: 'scale(1.05)',
      transition: 'all 0.3s ease',
    },
  }}
/>

        </Box>

        {/* Center: Welcome (hidden on mobile), Name (shown always) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {!isMobile && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.secondary,
              }}
            >
              Welcome, {user?.name || 'User'}
            </Typography>
          )}

          {isMobile && (
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 500,
                color: theme.palette.text.secondary,
                fontSize: '0.8rem',
              }}
            >
              {user?.name || 'User'}
            </Typography>
          )}
        </Box>

        {/* Right: Theme Toggle + Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
          <Tooltip title="Toggle Theme">
            <IconButton onClick={colorMode.toggleColorMode} size={isMobile ? 'small' : 'medium'}>
              {theme.palette.mode === 'dark' ? '🌞' : '🌙'}
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} color="error" size={isMobile ? 'small' : 'medium'}>
              <LogoutIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
