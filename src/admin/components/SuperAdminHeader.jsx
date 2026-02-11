import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Badge,
    Typography,
    Box,
    Avatar,
    Tooltip,
    styled,
    useTheme,
    useMediaQuery,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Notifications as NotificationsIcon,
    Campaign as CampaignIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    PrivacyTip as PrivacyPolicyIcon,
    ContactSupport as ContactSupportIcon,
    ExitToApp as LogoutIcon,
    Info as VersionIcon,
    List as ViewLogsIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { ColorModeContext } from '../../Theme/ThemeContext';
import { useAuth } from '../../context/useAuth';
import logo from '/logoo.png'

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    transition: theme.transitions.create(['margin', 'width']),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    height: 56,
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(0, 2),
        height: 64,
    },
    zIndex: theme.zIndex.drawer + 1,
}));

const ProcessName = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    [theme.breakpoints.up('md')]: {
        fontSize: '0.875rem',
    },
}));

const UserProfile = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    borderRadius: '30px',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.5),
        gap: theme.spacing(0.25),
    },
}));

const SuperAdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userData, setUserData] = useState({
        name: 'Admin',
        companyName: 'CIIS',
        logo: logo
    });
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const navigate = useNavigate();
    const { user } = useAuth();

    const open = Boolean(anchorEl);

    // Function to get data from localStorage
    const getLocalStorageData = () => {
        try {
            // Get superAdmin data from localStorage
            const superAdminStr = localStorage.getItem('superAdmin');
            let name = 'Admin';
            
            if (superAdminStr) {
                const superAdminData = JSON.parse(superAdminStr);
                if (superAdminData && superAdminData.name) {
                    name = superAdminData.name;
                }
            }

            // Get company data from localStorage
            const companyStr = localStorage.getItem('company');
            let companyName = 'CIIS';
            let companyLogo = logo;
            
            if (companyStr) {
                const companyData = JSON.parse(companyStr);
                if (companyData) {
                    if (companyData.companyName) {
                        companyName = companyData.companyName;
                    }
                    if (companyData.logo) {
                        companyLogo = companyData.logo;
                    }
                }
            }

            return { name, companyName, logo: companyLogo };
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
            return {
                name: 'Admin',
                companyName: 'CIIS',
                logo: logo
            };
        }
    };

    // Update user data on component mount and when localStorage changes
    useEffect(() => {
        const updateUserData = () => {
            const data = getLocalStorageData();
            setUserData(data);
        };

        // Initial update
        updateUserData();

        // Listen for storage changes (if other tabs update localStorage)
        const handleStorageChange = (e) => {
            if (e.key === 'superAdmin' || e.key === 'company') {
                updateUserData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Optional: Check localStorage periodically (every 2 seconds)
        const interval = setInterval(updateUserData, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Using your UI library's confirmation dialog (example)
        // This is more customizable and looks better than window.confirm
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            navigate('/');

            // Optional: Show success message
            alert('Logged out successfully!'); // or use toast notification
        }
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <StyledAppBar
            position="fixed"
            elevation={isScrolled ? 4 : 0}
            sx={{
                backgroundColor: isScrolled ? 'background.paper' : 'transparent',
                color: 'text.primary',
                backdropFilter: isScrolled ? 'blur(8px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : 'none',
            }}
        >
            <Toolbar sx={{ width: '100%', padding: '0 !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: isMobile ? 2 : 1 }}>
                    <IconButton
                        color="inherit"
                        onClick={toggleSidebar}
                        edge="start"
                        sx={{ mr: isMobile ? 0.5 : 1 }}
                    >
                        {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>

                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover img': {
                                opacity: 0.9,
                                transform: 'scale(1.05)',
                                transition: 'all 0.3s ease',
                            },
                        }}
                        onClick={() => navigate('/user/dashboard')}
                    >
                        <img
                            src={userData.logo}
                            alt="Logo"
                            style={{
                                height: isMobile ? '35px' : '45px',
                                width: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                            }}
                        />
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1, flex: 1, justifyContent: 'flex-end' }}>
                    <UserProfile onClick={handleProfileClick}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PersonIcon />
                        </Avatar>
                        {!isMobile && (
                            <Box>
                                <Typography variant="subtitle2" noWrap>
                                    {userData.name}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                                    {userData.companyName}
                                </Typography>
                            </Box>
                        )}
                    </UserProfile>

                    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                   
                    
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Log out</ListItemText>
                        </MenuItem>
                
                    </Menu>
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};

export default SuperAdminHeader;