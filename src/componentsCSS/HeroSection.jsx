import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Paper
} from '@mui/material';
import {
  AutoAwesome,
  Mic,
  NotificationsActive,
  Groups,
  Phone,
  QueryStats,
  Dashboard,
  Contacts,
  EmojiEmotions,
  SmartToy,
  Shuffle,
  WhatsApp,
  PlayArrow,
  Star
} from '@mui/icons-material';

const featureList = [
  { label: 'AI Call Summaries', icon: <AutoAwesome />, color: '#2196f3' },
  { label: 'Call Recording', icon: <Mic />, color: '#4caf50' },
  { label: 'Follow-Up Reminder', icon: <NotificationsActive />, color: '#ff9800' },
  { label: 'Live Team Status', icon: <Groups />, color: '#9c27b0' },
  { label: 'Auto Dialer', icon: <Phone />, color: '#f44336' },
  { label: 'Call Analytics', icon: <QueryStats />, color: '#00bcd4' },
  { label: 'Live Dashboard', icon: <Dashboard />, color: '#673ab7' },
  { label: 'Advanced Caller ID', icon: <Contacts />, color: '#009688' },
  { label: 'AI Sentiment Analysis', icon: <EmojiEmotions />, color: '#ff5722' },
  { label: 'AI Sales Assistant', icon: <SmartToy />, color: '#795548' },
  { label: 'Auto Lead Allocation', icon: <Shuffle />, color: '#607d8b' },
  { label: 'WhatsApp Integration', icon: <WhatsApp />, color: '#25d366' },
];

const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }
      }}
    >
      <Container maxWidth="xl">
        {/* Hero Text Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Chip
              label="AI-POWERED CALL MANAGEMENT"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mb: 3,
                px: 2,
                py: 1,
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              AI-Powered SIM-Based Call Management CRM
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              2x Calling Productivity in Just 2 Weeks. Earn Trust on Every Call.
            </Typography>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
              {[
                { number: '2x', label: 'Calling Productivity' },
                { number: '85%', label: 'Higher Connect Rate' },
                { number: '40%', label: 'More Conversions' }
              ].map((stat, index) => (
                <Grid item xs={4} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#4caf50' }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Book A Demo
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start 10-Day Free Trial
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              No Credit Card Required • Setup in 5 Minutes
            </Typography>
          </Box>
        </Fade>

        {/* Features Section */}
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Phone Mockup */}
          <Grid item xs={12} lg={6}>
            <Slide in timeout={1000} direction="right">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    width: 300,
                    height: 600,
                    borderRadius: 6,
                    background: 'linear-gradient(145deg, #1e3c72 0%, #2a5298 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Mock Phone Screen */}
                  <Box sx={{ p: 3, color: 'white', height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      CiisNetwork
                    </Typography>
                    
                    {/* Quick Stats */}
                    <Grid container spacing={1} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>24</Typography>
                          <Typography variant="caption">Today's Calls</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>12</Typography>
                          <Typography variant="caption">Follow-ups</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700}>8</Typography>
                          <Typography variant="caption">Hot Leads</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Next Action Card */}
                    <Paper 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        p: 2, 
                        borderRadius: 3, 
                        mb: 2,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Next Call
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        Rajesh Kumar
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        +91 9876543210
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Phone />}
                        sx={{
                          bgcolor: '#4caf50',
                          borderRadius: 3,
                          py: 1
                        }}
                      >
                        Call Now
                      </Button>
                    </Paper>

                    {/* Recent Activity */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                        Recent Activity
                      </Typography>
                      {[
                        { name: 'Priya S.', time: '2 min ago', status: 'Completed' },
                        { name: 'Amit P.', time: '5 min ago', status: 'Missed' },
                        { name: 'Neha G.', time: '8 min ago', status: 'Completed' }
                      ].map((activity, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: activity.status === 'Completed' ? '#4caf50' : '#f44336',
                              mr: 1.5
                            }}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {activity.name}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Slide>
          </Grid>

          {/* Right Side - Features Grid */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={1200}>
              <Paper
                elevation={8}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    textAlign: 'center',
                    color: 'text.primary',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                   
                  }}
                >
                  All That You Need in One App
                </Typography>

                <Grid container spacing={2}>
                  {featureList.map((feature, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Zoom in timeout={1000 + index * 100}>
                        <Card
                          sx={{
                            height: '100%',
                            border: `2px solid ${feature.color}20`,
                            bgcolor: `${feature.color}08`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 25px ${feature.color}20`
                            }
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box
                              sx={{
                                color: feature.color,
                                fontSize: '2rem',
                                mb: 1
                              }}
                            >
                              {feature.icon}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                lineHeight: 1.2
                              }}
                            >
                              {feature.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<Star />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Explore All Features
                  </Button>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>

        {/* Trust Badges */}
        <Fade in timeout={1500}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Trusted by 500+ Sales Teams
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              justifyContent="center"
              sx={{ opacity: 0.7 }}
            >
              {['🏆 Enterprise Ready', '🔒 GDPR Compliant', '⭐ 4.8/5 Rating'].map((badge, index) => (
                <Chip
                  key={index}
                  label={badge}
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </Stack>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default HeroSection;