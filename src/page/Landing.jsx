import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  BeachAccess as BeachAccessIcon,
  Computer as ComputerIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Contacts as ContactsIcon,
  Security as SecurityIcon,
  BusinessCenter as BusinessCenterIcon,
  AccessTime as AccessTimeIcon,
  Sync as SyncIcon,
  PhoneAndroid as PhoneAndroidIcon,
  DesktopWindows as DesktopWindowsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';

// Light Color Scheme - Soft Blue & Mint
const COLOR_SCHEME = {
  primary: '#3b82f6',      // Soft Blue
  secondary: '#06b6d4',    // Cyan
  accent: '#8b5cf6',       // Light Purple
  light: '#f0f9ff',        // Very Light Blue
  lighter: '#f8fafc',      // Off White
  text: '#475569',         // Soft Gray
  dark: '#1e293b',         // Dark Blue Gray
  success: '#10b981',      // Emerald
  warning: '#f59e0b',      // Amber
};

const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [employeeCount, setEmployeeCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);

  useEffect(() => {
    const animateCount = (setter, target, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCount(setEmployeeCount, 125);
    animateCount(setAttendanceCount, 3420);
    animateCount(setLeaveCount, 87);
    animateCount(setTaskCount, 64);
    animateCount(setAssetCount, 210);
  }, []);

  const features = [
    { icon: <AccessTimeIcon />, title: 'Attendance Management', description: 'Mark IN/OUT, track login/logout, and view total work hours with precision analytics.' },
    { icon: <BeachAccessIcon />, title: 'Leave Management', description: 'Apply, approve, and track employee leaves with automated workflows and notifications.' },
    { icon: <ComputerIcon />, title: 'Asset Management', description: 'Request and manage company assets with tracking, maintenance alerts, and inventory control.' },
    { icon: <AssignmentIcon />, title: 'Task Management', description: 'Create, assign, and monitor task progress with real-time status updates and deadlines.' },
    { icon: <NotificationsIcon />, title: 'System Alerts', description: 'Get instant notifications and important announcements with smart prioritization.' },
    { icon: <ContactsIcon />, title: 'Employee Directory', description: 'View, search, and manage employee profiles with advanced filtering and analytics.' }
  ];

  const stats = [
    { icon: <PeopleIcon />, value: employeeCount, label: 'Total Employees' },
    { icon: <ScheduleIcon />, value: attendanceCount, label: 'Attendance Records' },
    { icon: <BeachAccessIcon />, value: leaveCount, label: 'Total Leaves' },
    { icon: <AssignmentIcon />, value: taskCount, label: 'Tasks in Progress' },
    { icon: <ComputerIcon />, value: assetCount, label: 'Active Assets' }
  ];

  const benefits = [
    { icon: <AccessTimeIcon />, title: '24/7 Access', description: 'Access your dashboard anytime, anywhere' },
    { icon: <SyncIcon />, title: 'Real-time Updates', description: 'Instant synchronization across all devices' },
    { icon: <SecurityIcon />, title: 'Secure Data', description: 'Enterprise-grade security and encryption' },
    { icon: <PhoneAndroidIcon />, title: 'User-friendly', description: 'Intuitive interface for all users' },
    { icon: <DesktopWindowsIcon />, title: 'Fully Responsive', description: 'Perfect experience on any device' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ 
        backgroundColor: 'white', 
        color: COLOR_SCHEME.text, 
        boxShadow: '0 2px 20px rgba(59, 130, 246, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box 
              component="img"
              src="src/assets/logo.png"
              alt=""
              sx={{ 
                height: 40,
                width: 'auto',
                mr: 2
              }}
            />
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 'bold', 
              background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`, 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' } 
            }}>
              
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            sx={{ 
              background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
              boxShadow: `0 4px 15px ${alpha(COLOR_SCHEME.primary, 0.2)}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(COLOR_SCHEME.primary, 0.3)}`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
              fontWeight: 600,
              px: 3
            }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 50%, ${alpha(COLOR_SCHEME.accent, 0.8)} 100%)`,
      color: 'white',
      pt: 15,
      pb: 10,
      position: 'relative',
      overflow: 'hidden',

      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 30% 20%, ${alpha(COLOR_SCHEME.secondary, 0.3)} 0%, transparent 50%)`,
      },
      '&:after': {
        content: '""',
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
      },
    }}>

  {/* Animated background elements */}
  <Box sx={{
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite',
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' }
    }
  }} />
  
  <Box sx={{
    position: 'absolute',
    bottom: '30%',
    right: '15%',
    width: '60px',
    height: '60px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '50%',
    animation: 'float 4s ease-in-out infinite 1s',
  }} />

  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
    <Grid container spacing={4} alignItems="center">
      <Grid item xs={12} md={6}>
        <Typography
  variant="h2"
  component="h1"
  gutterBottom
  sx={{
    fontWeight: 'bold',
    fontSize: { xs: '2.5rem', md: '3.5rem' },
    textShadow: '0 2px 10px rgba(255,255,255,0.1)',
  }}
>
  <Box
    component="span"
    sx={{
      fontSize: { xs: '2.8rem', md: '4rem' },
      fontWeight: 800,
      letterSpacing: '2px',
      background: 'linear-gradient(135deg, #ffffff 10%, #d4e4ff 40%, #a5b4fc 90%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 4px 12px rgba(255,255,255,0.3)',
      display: 'block',
      mb: 1,
    }}
  >
    CIIS NETWORK
  </Box>
  Smart Employee Management Portal
</Typography>

        
        <Typography 
  variant="h5" 
  gutterBottom 
  sx={{ 
    mb: 3, 
    opacity: 0.9, 
    lineHeight: 1.6,
    fontSize: { xs: '1.1rem', md: '1.25rem' }
  }}
>
  Manage Attendance, Leaves, Assets, Tasks, And Employees — All in One Intelligent Dashboard Designed For Modern Workplaces.  
  Empower your HR and team leaders with real-time insights to boost productivity and streamline workforce operations.  
  Simplify onboarding, performance tracking, and daily operations with an intuitive and data-driven employee management system.
</Typography>

        {/* Feature chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {['Attendance Tracking', 'Leave Management', 'Asset Management', 'Task Automation'].map((feature) => (
            <Chip
              key={feature}
              label={feature}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                }
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="large" 
            sx={{ 
              borderColor: 'rgba(255,255,255,0.5)', 
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.05)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.15)',
                borderColor: 'white',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 20px rgba(255, 255, 255, 0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Login
              <Box component="span" sx={{ 
                fontSize: '1.2rem',
                transition: 'transform 0.3s ease'
              }}>
                →
              </Box>
            </Box>
          </Button>
        </Box>

        {/* Trust indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 4, opacity: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>500+ Companies</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>⭐ 4.9/5 Rating</Box>
          </Box>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          maxWidth: 400, 
          ml: 'auto', 
          boxShadow: `0 25px 50px ${alpha(COLOR_SCHEME.primary, 0.3)}`,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 35px 60px ${alpha(COLOR_SCHEME.primary, 0.4)}`
          }
        }}>
        </Card>
      </Grid>
    </Grid>
  </Container>
</Box>

      {/* About Section */}
      <Box sx={{ 
  py: { xs: 4, md: 8 }, // Reduced from py: { xs: 8, md: 15 }
  position: 'relative', 
  overflow: 'hidden', 
  bgcolor: COLOR_SCHEME.lighter 
}}>
  <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
    {/* Section Header */}
    <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}> {/* Reduced from mb: { xs: 6, md: 10 } */}
      <Typography 
        variant="h2" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 1, // Further reduced from mb: 2
          background: `linear-gradient(45deg, ${COLOR_SCHEME.text} 30%, ${COLOR_SCHEME.dark} 90%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          lineHeight: 1.2
        }}
      >
        Powerful Features
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          color: COLOR_SCHEME.text,
          maxWidth: '600px',
          mx: 'auto',
          lineHeight: 1.6,
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
          px: 2,
          mb: 1 // Reduced from mb: 2
        }}
      >
        Everything you need to manage your workforce efficiently and effectively
      </Typography>
      <Box sx={{ 
        width: '80px', 
        height: '4px', 
        background: `linear-gradient(45deg, ${COLOR_SCHEME.primary}, ${COLOR_SCHEME.secondary})`,
        margin: '1rem auto 0 auto', // Reduced from margin: '1.5rem auto 0 auto'
        borderRadius: '2px'
      }} />
    </Box>

    {/* Features Grid */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        justifyContent: 'center',
        alignItems: 'stretch',
        maxWidth: '1200px',
        mx: 'auto',
        px: { xs: 2, sm: 0 }
      }}
    >
      {[
        {
          icon: '📊',
          title: 'Advanced Analytics',
          description: 'Real-time insights and detailed reports for informed decision-making.'
        },
        {
          icon: '⚡',
          title: 'Lightning Fast',
          description: 'Optimized performance with instant updates and seamless navigation.'
        },
        {
          icon: '🔒',
          title: 'Enterprise Security',
          description: 'Military-grade encryption and compliance with industry standards.'
        },
        {
          icon: '🔄',
          title: 'Automated Workflows',
          description: 'Streamline operations with customizable automation rules.'
        }
      ].map((feature, index) => (
        <Card
          key={index}
          sx={{
            height: '100%',
            bgcolor: 'white',
            border: '1px solid',
            borderColor: alpha(COLOR_SCHEME.primary, 0.1),
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(45deg, ${COLOR_SCHEME.primary}, ${COLOR_SCHEME.secondary})`,
              transform: 'scaleX(0)',
              transition: 'transform 0.3s ease',
            },
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-8px)' },
              boxShadow: { 
                xs: `0 8px 24px ${alpha(COLOR_SCHEME.primary, 0.1)}`,
                sm: `0 20px 40px ${alpha(COLOR_SCHEME.primary, 0.15)}`
              },
              borderColor: alpha(COLOR_SCHEME.primary, 0.2),
              '&:before': {
                transform: 'scaleX(1)',
              }
            }
          }}
        >
          <Box sx={{ 
            width: { xs: '70px', sm: '80px' },
            height: { xs: '70px', sm: '80px' },
            bgcolor: alpha(COLOR_SCHEME.primary, 0.08),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: alpha(COLOR_SCHEME.primary, 0.12),
            }
          }}>
            <Box sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem' }, 
              transition: 'transform 0.3s ease' 
            }}>
              {feature.icon}
            </Box>
          </Box>

          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              color: COLOR_SCHEME.dark,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            {feature.title}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: COLOR_SCHEME.text, 
              lineHeight: 1.6,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {feature.description}
          </Typography>
        </Card>
      ))}
    </Box>
  </Container>
</Box>
      {/* Features Section */}
      <Box sx={{ 
  py: 8, // Reduced from py: 15
  bgcolor: COLOR_SCHEME.light,
  position: 'relative',
  overflow: 'hidden'
}}>
  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
    {/* Section Header */}
    <Box sx={{ textAlign: 'center', mb: 6 }}> {/* Reduced from mb: 10 */}
      <Chip 
        label="Why Choose Our Portal"
        sx={{
          bgcolor: alpha(COLOR_SCHEME.primary, 0.08),
          color: COLOR_SCHEME.primary,
          fontWeight: 700,
          px: 3,
          py: 1,
          mb: 2, // Reduced from mb: 3
          fontSize: '0.9rem',
          border: '1px solid',
          borderColor: alpha(COLOR_SCHEME.primary, 0.2),
          boxShadow: `0 2px 8px ${alpha(COLOR_SCHEME.primary, 0.1)}`
        }}
      />
      <Typography 
        variant="h2" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: 2, // Reduced from mb: 3
          background: `linear-gradient(45deg, ${COLOR_SCHEME.text} 30%, ${COLOR_SCHEME.dark} 90%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontSize: { xs: '2.5rem', md: '3.2rem' },
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        Key Features
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          color: COLOR_SCHEME.text,
          maxWidth: 600,
          mx: 'auto',
          mb: 2,
          lineHeight: 1.7,
          fontSize: '1.25rem',
          fontWeight: 400
        }}
      >
        Explore the essential tools that make our Employee Management Portal smart, seamless, and efficient.
      </Typography>
      <Box sx={{ 
        width: '80px', 
        height: '4px', 
        background: `linear-gradient(45deg, ${COLOR_SCHEME.primary}, ${COLOR_SCHEME.secondary})`,
        margin: '1rem auto 0 auto', // Reduced from margin: '2rem auto 0 auto'
        borderRadius: '2px',
        boxShadow: `0 2px 8px ${alpha(COLOR_SCHEME.primary, 0.2)}`
      }} />
    </Box>

    {/* Features Grid */}
    <Grid container spacing={4} justifyContent="center">
      {[
        {
          title: 'Attendance Management',
          description: 'Mark IN/OUT, track login/logout, and view total work hours with precision analytics.',
          image: '📊',
          imageBg: `linear-gradient(135deg, ${alpha(COLOR_SCHEME.primary, 0.1)} 0%, ${alpha(COLOR_SCHEME.secondary, 0.1)} 100%)`
        },
        {
          title: 'Leave Management',
          description: 'Apply, approve, and track employee leaves with automated workflows and notifications.',
          image: '🏖️',
          imageBg: `linear-gradient(135deg, ${alpha('#4CAF50', 0.1)} 0%, ${alpha('#8BC34A', 0.1)} 100%)`
        },
        {
          title: 'Asset Management',
          description: 'Request and manage company assets with tracking, maintenance alerts, and inventory control.',
          image: '💻',
          imageBg: `linear-gradient(135deg, ${alpha('#FF9800', 0.1)} 0%, ${alpha('#FFC107', 0.1)} 100%)`
        },
        {
          title: 'Task Management',
          description: 'Create, assign, and monitor task progress with real-time status updates and deadlines.',
          image: '✅',
          imageBg: `linear-gradient(135deg, ${alpha('#9C27B0', 0.1)} 0%, ${alpha('#E91E63', 0.1)} 100%)`
        },
        {
          title: 'System Alerts',
          description: 'Get instant notifications and important announcements with smart prioritization.',
          image: '🔔',
          imageBg: `linear-gradient(135deg, ${alpha('#F44336', 0.1)} 0%, ${alpha('#FF5722', 0.1)} 100%)`
        },
        {
          title: 'Employee Directory',
          description: 'View, search, and manage employee profiles with advanced filtering and analytics.',
          image: '👥',
          imageBg: `linear-gradient(135deg, ${alpha('#2196F3', 0.1)} 0%, ${alpha('#03A9F4', 0.1)} 100%)`
        }
      ].map((feature, index) => (
        <Grid 
          item 
          xs={12} sm={6} md={4} 
          key={index} 
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <Card 
            sx={{ 
              width: '100%',
              maxWidth: 330,
              height: '100%', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              border: '1px solid',
              borderColor: alpha(COLOR_SCHEME.primary, 0.1),
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(45deg, ${COLOR_SCHEME.primary}, ${COLOR_SCHEME.secondary})`,
                transform: 'scaleX(0)',
                transition: 'transform 0.4s ease',
                borderRadius: '4px 4px 0 0'
              },
              '&:hover': {
                transform: 'translateY(-12px)',
                boxShadow: `0 32px 64px ${alpha(COLOR_SCHEME.primary, 0.15)}`,
                borderColor: alpha(COLOR_SCHEME.primary, 0.2),
                '&:before': { transform: 'scaleX(1)' },
                '& .feature-image': {
                  transform: 'scale(1.1) rotate(5deg)',
                }
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 0 }}>
              {/* Image Container */}
              <Box 
                sx={{ 
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: feature.imageBg,
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 3
                }}
              >
                <Box 
                  className="feature-image"
                  sx={{ 
                    fontSize: '4rem',
                    transition: 'all 0.4s ease',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                >
                  {feature.image}
                </Box>
              </Box>

              {/* Content */}
              <Box sx={{ px: 4, pb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    background: `linear-gradient(45deg, ${COLOR_SCHEME.text}, ${COLOR_SCHEME.dark})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography 
                  variant="body1" 
                  color={COLOR_SCHEME.text} 
                  sx={{ 
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    mb: 2
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>

      {/* Dashboard Overview */}
      <Box sx={{ 
  py: 5, // Reduced from py: 10
  background: `linear-gradient(135deg, ${COLOR_SCHEME.lighter} 0%, ${COLOR_SCHEME.light} 100%)`,
}}>
  <Container maxWidth="lg">
    {/* Header */}
    <Box sx={{ textAlign: 'center', mb: 4 }}> {/* Reduced from mb: 8 */}
      <Typography 
        variant="h2" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: 1, // Reduced from mb: 2
          background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '2rem', md: '3rem' }
        }}
      >
        Dashboard Overview
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          color: COLOR_SCHEME.text,
          fontSize: { xs: '1rem', md: '1.25rem' },
          lineHeight: 1.6
        }}
      >
        Real-time insights and analytics at your fingertips. Monitor your key metrics with beautiful visualizations.
      </Typography>
    </Box>

    {/* Stats Grid */}
    <Grid 
      container 
      spacing={4} 
      justifyContent="center" 
      alignItems="stretch"
    >
      {[
        { label: 'Employees', icon: '👥' },
        { label: 'Attendance Records', icon: '⏰' },
        { label: 'Leaves', icon: '🌴' },
        { label: 'Tasks in Progress', icon: '📋' }
      ].map((stat, index) => (
        <Grid 
          item 
          xs={12} sm={6} md={3} 
          key={index} 
          sx={{ 
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Card 
            sx={{ 
              width: 220,
              height: 250,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid',
              borderColor: alpha(COLOR_SCHEME.primary, 0.1),
              borderRadius: 5,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 25px 50px ${alpha(COLOR_SCHEME.primary, 0.1)}`,
                borderColor: alpha(COLOR_SCHEME.primary, 0.2)
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover::before': {
                opacity: 1
              }
            }}
          >
            <CardContent sx={{ p: 3, width: '100%' }}>
              {/* Circular Icon */}
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
                  borderRadius: '50%',
                  mx: 'auto',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  boxShadow: `0 8px 25px ${alpha(COLOR_SCHEME.primary, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 12px 35px ${alpha(COLOR_SCHEME.primary, 0.4)}`
                  }
                }}
              >
                {stat.icon}
              </Box>

              {/* Label */}
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: COLOR_SCHEME.dark,
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  mt: 2
                }}
              >
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>

      {/* Admin & Employee Access */}
      <Box
  sx={{
    py: 6, // Reduced from py: 12
    background: `linear-gradient(135deg, ${COLOR_SCHEME.lighter} 0%, ${COLOR_SCHEME.light} 100%)`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${alpha(COLOR_SCHEME.primary, 0.2)}, transparent)`,
    },
  }}
>
  <Container maxWidth="lg">
    {/* Section Header */}
    <Box sx={{ textAlign: 'center', mb: 5 }}> {/* Reduced from mb: 10 */}
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          mb: 2, // Reduced from mb: 3
          background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '2.5rem', md: '3.5rem' },
          textShadow: '0 4px 8px rgba(0,0,0,0.05)',
        }}
      >
        Admin & Employee Access
      </Typography>
      <Typography
        variant="h6"
        color={COLOR_SCHEME.text}
        sx={{
          maxWidth: 700,
          mx: 'auto',
          fontSize: { xs: '1.1rem', md: '1.25rem' },
          lineHeight: 1.6,
          fontWeight: 400,
        }}
      >
        Tailored experiences for different user roles with comprehensive functionality
        and intuitive workflows
      </Typography>
    </Box>

    {/* Cards Grid */}
    <Grid
  container
  spacing={4}
  justifyContent="center"
  alignItems="stretch"
>
  {[
    {
      title: 'For Admins',
      subtitle: 'Full system control & management',
      color1: COLOR_SCHEME.primary,
      color2: COLOR_SCHEME.secondary,
      list: [
        'Manage all employees and departments',
        'Approve leaves and asset requests',
        'Assign tasks and track progress',
        'Generate comprehensive reports and analytics',
        'System configuration and permissions',
      ],
      chip: 'Administrative Access',
    },
    {
      title: 'For Employees',
      subtitle: 'Streamlined daily operations',
      color1: COLOR_SCHEME.success,
      color2: '#059669',
      list: [
        'Check attendance records and work hours',
        'Apply for leaves with easy workflows',
        'Track assigned tasks and deadlines',
        'Request company assets and resources',
        'Update personal profile and preferences',
      ],
      chip: 'Employee Access',
    },
  ].map((card, index) => (
    <Grid
      item
      xs={12}
      md={6}
      key={index}
      sx={{ display: 'flex' }}
    >
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, #ffffff 0%, ${
            index === 0 ? '#fafbff' : '#f0fdf9'
          } 100%)`,
          border: '1px solid',
          borderColor:
            index === 0
              ? alpha(COLOR_SCHEME.primary, 0.1)
              : alpha(COLOR_SCHEME.success, 0.1),
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          boxShadow:
            index === 0
              ? `0 8px 32px ${alpha(COLOR_SCHEME.primary, 0.05)}`
              : `0 8px 32px ${alpha(COLOR_SCHEME.success, 0.05)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(135deg, ${card.color1} 0%, ${card.color2} 100%)`,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow:
              index === 0
                ? `0 25px 50px ${alpha(COLOR_SCHEME.primary, 0.1)}`
                : `0 25px 50px ${alpha(COLOR_SCHEME.success, 0.1)}`,
            borderColor:
              index === 0
                ? alpha(COLOR_SCHEME.primary, 0.2)
                : alpha(COLOR_SCHEME.success, 0.2),
          },
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 5,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                background: `linear-gradient(135deg, ${card.color1} 0%, ${card.color2} 100%)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 3,
                color: 'white',
                boxShadow: `0 8px 25px ${alpha(card.color1, 0.3)}`,
              }}
            >
              {index === 0 ? '🛡️' : '💼'}
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${card.color1} 0%, ${card.color2} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                {card.title}
              </Typography>
              <Typography
                variant="body2"
                color={COLOR_SCHEME.text}
                sx={{ fontWeight: 500, mt: 0.5 }}
              >
                {card.subtitle}
              </Typography>
            </Box>
          </Box>

          {/* List */}
          <List sx={{ flexGrow: 1 }}>
            {card.list.map((item, i) => (
              <ListItem
                key={i}
                sx={{
                  px: 0,
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(card.color1, 0.03),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 45 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      background: `linear-gradient(135deg, ${card.color1} 0%, ${card.color2} 100%)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: `0 4px 12px ${alpha(card.color1, 0.2)}`,
                    }}
                  >
                    ✓
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: COLOR_SCHEME.dark,
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Footer Chip */}
          <Box
            sx={{
              textAlign: 'center',
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${alpha(card.color1, 0.1)}`,
            }}
          >
            <Chip
              label={card.chip}
              sx={{
                background: `linear-gradient(135deg, ${card.color1} 0%, ${card.color2} 100%)`,
                color: 'white',
                fontWeight: 'bold',
                px: 2,
                py: 1,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

  </Container>
</Box>

      {/* Benefits Section */}
      <Box sx={{ py: 6, background: `linear-gradient(135deg, ${COLOR_SCHEME.lighter} 0%, ${COLOR_SCHEME.light} 100%)` }}> {/* Reduced from py: 12 */}
  <Container maxWidth="lg">
    {/* Header Section */}
    <Box sx={{ textAlign: 'center', mb: 5 }}> {/* Reduced from mb: 10 */}
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        sx={{ 
          fontWeight: 800, 
          mb: 2, // Reduced from mb: 3
          background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '2rem', md: '3rem' }
        }}
      >
        Why Choose Our Portal?
      </Typography>

      <Typography
        variant="h6"
        color={COLOR_SCHEME.text}
        sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          lineHeight: 1.6,
          fontSize: { xs: '1rem', md: '1.2rem' }
        }}
      >
        Experience the difference with our cutting-edge employee management solution designed for modern workplaces
      </Typography>
    </Box>

    {/* Benefits Grid */}
    <Grid container spacing={4} justifyContent="center">
      {benefits.map((benefit, index) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={index}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <Card
            sx={{
              width: 280,
              height: 280,
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              border: `1px solid ${alpha(COLOR_SCHEME.primary, 0.1)}`,
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              position: 'relative',
              overflow: 'visible',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 25px 50px ${alpha(COLOR_SCHEME.primary, 0.1)}`,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                '& .icon-container': {
                  transform: 'scale(1.1)',
                  boxShadow: `0 15px 30px ${alpha(COLOR_SCHEME.primary, 0.3)}`,
                }
              },
            }}
          >
            {/* Icon Container */}
            <Box
              className="icon-container"
              sx={{
                width: 90,
                height: 90,
                background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                color: 'white',
                boxShadow: `0 12px 30px ${alpha(COLOR_SCHEME.primary, 0.2)}`,
                transition: 'all 0.4s ease',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
                  borderRadius: '50%',
                  zIndex: -1,
                  opacity: 0.2,
                  filter: 'blur(8px)',
                }
              }}
            >
              {React.cloneElement(benefit.icon, { 
                sx: { 
                  fontSize: 36,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                } 
              })}
            </Box>

            {/* Content */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                background: `linear-gradient(135deg, ${COLOR_SCHEME.text} 0%, ${COLOR_SCHEME.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.1rem'
              }}
            >
              {benefit.title}
            </Typography>

            <Typography 
              variant="body2" 
              color={COLOR_SCHEME.text}
              sx={{ 
                lineHeight: 1.6,
                fontSize: '0.9rem'
              }}
            >
              {benefit.description}
            </Typography>

            {/* Hover Indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 3,
                background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
                transition: 'width 0.3s ease',
                borderRadius: 2,
                '.MuiCard-root:hover &': {
                  width: '80%',
                }
              }}
            />
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* Bottom CTA */}
    <Box sx={{ textAlign: 'center', mt: 6 }}> {/* Reduced from mt: 8 */}
      <Button
        variant="contained"
        size="large"
        sx={{
          background: `linear-gradient(135deg, ${COLOR_SCHEME.primary} 0%, ${COLOR_SCHEME.secondary} 100%)`,
          px: 6,
          py: 1.5,
          borderRadius: 3,
          fontWeight: 600,
          fontSize: '1.1rem',
          textTransform: 'none',
          boxShadow: `0 10px 30px ${alpha(COLOR_SCHEME.primary, 0.2)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 15px 40px ${alpha(COLOR_SCHEME.primary, 0.3)}`,
          },
          transition: 'all 0.3s ease',
        }}
      >
        Get Started Today
      </Button>
    </Box>
  </Container>
</Box>

      {/* Footer */}
      <Box
  sx={{
    bgcolor: COLOR_SCHEME.dark,
    color: "white",
    pt: 10,
    pb: 6,
    background: `linear-gradient(135deg, ${COLOR_SCHEME.dark} 0%, #1e293b 100%)`,
  }}
>
  <Container maxWidth="lg">
    <Grid container spacing={6} justifyContent="space-between">
      {/* Company Info Section */}
      <Grid item xs={12} md={4}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Box
            component="img"
            src="src/assets/Logo.png"
            alt="CIIS Tech Solutions"
            sx={{
              height: 50,
              width: "auto",
              mr: 3,
              display: "block",
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#000",
              fontSize: "1.5rem",
            }}
          ></Typography>
        </Box>

        <Typography
          variant="body1"
          color="grey.300"
          sx={{
            lineHeight: 1.7,
            fontSize: "1rem",
            maxWidth: "320px",
          }}
        >
          Streamlining employee management for modern businesses with innovative
          solutions and cutting-edge technology.
        </Typography>
      </Grid>

      {/* Legal Section - Centered */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "flex-start", md: "center" },
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 4,
            fontSize: "1.1rem",
            color: "white",
          }}
        >
          Legal
        </Typography>
        <List dense sx={{ py: 0 }}>
          {["Privacy Policy", "Terms of Service", "Contact Us", "Support"].map(
            (item) => (
              <ListItem key={item} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={item}
                  sx={{
                    color: "grey.400",
                    "&:hover": {
                      color: COLOR_SCHEME.secondary,
                      transform: "translateX(5px)",
                    },
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "& .MuiTypography-root": {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItem>
            )
          )}
        </List>
      </Grid>

      {/* Contact Info Section - Right Align */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "flex-start", md: "flex-end" },
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: "1.1rem",
            color: "white",
          }}
        >
          Contact Info
        </Typography> 
        <List dense sx={{ py: 0 }}>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: COLOR_SCHEME.secondary,
              }}
            >
              <EmailIcon fontSize="medium" />
            </ListItemIcon>
            <ListItemText
              primary="info@careerinfowisitsolution.com"
              sx={{
                color: "grey.300",
                "& .MuiTypography-root": {
                  fontSize: "1rem",
                  fontWeight: 500,
                },
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: COLOR_SCHEME.secondary,
              }}
            >
              <PhoneIcon fontSize="medium" />
            </ListItemIcon>
            <ListItemText
              primary="+91 98759 29761"
              sx={{
                color: "grey.300",
                "& .MuiTypography-root": {
                  fontSize: "1rem",
                  fontWeight: 500,
                },
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1.5 }}>
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: COLOR_SCHEME.secondary,
              }}
            >
              <LocationOnIcon fontSize="medium" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "grey.300",
                      fontSize: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    Phase - 8B Azda Tower Mohali
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontSize: "0.9rem" }}
                  >
                    Mohali, Punjab
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>
      </Grid>
    </Grid>

    {/* Footer Bottom Section */}
    <Box
      sx={{
        borderTop: 1,
        borderColor: "grey.800",
        pt: 5,
        mt: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Typography variant="body1" color="grey.400" sx={{ fontWeight: 500 }}>
        © 2025 CIIS Network. All rights reserved.
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: { xs: 2, md: 0 },
        }}
      >
        {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map(
          (Icon, index) => (
            <IconButton
              key={index}
              sx={{
                color: "grey.400",
                backgroundColor: "rgba(255,255,255,0.05)",
                "&:hover": {
                  color: COLOR_SCHEME.secondary,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "translateY(-3px)",
                },
                transition: "all 0.3s ease",
                width: 44,
                height: 44,
              }}
            >
              <Icon fontSize="medium" />
            </IconButton>
          )
        )}
      </Box>
    </Box>
  </Container>
    </Box>
    </Box>
  );
};

export default App;