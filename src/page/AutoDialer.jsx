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
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  Divider,
  Rating,
  Stack,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Phone,
  PlayArrow,
  Analytics,
  Security,
  Download,
  Star,
  CheckCircle,
  People,
  RecordVoiceOver,
  Notifications,
  Dashboard,
  IntegrationInstructions,
  WhatsApp,
  Dialpad,
  AutoMode,
  SmartToy,
  CallMade,
  CallReceived
} from '@mui/icons-material';
import ciisHeader from '../components/CiisHeader';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import FAQ from '../components/FAQ';
import Review from '../components/Review';
import Bannerbtn from '../components/Bannerbtn';
import Logo from '../components/Logo';

function AutoDialer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const autoDialerFeatures = [
    {
      title: 'Smart Auto Dialer',
      description: 'Call leads back-to-back without dialing manually. Boost call speed and focus.',
      icon: <AutoMode sx={{ fontSize: 40 }} />,
      color: '#2196f3'
    },
    {
      title: 'SIM-Based Calling',
      description: 'Higher connection rates with trusted SIM-based calling technology.',
      icon: <Dialpad sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Intelligent Call Routing',
      description: 'Smart routing based on agent availability and lead priority.',
      icon: <CallMade sx={{ fontSize: 40 }} />,
      color: '#ff9800'
    },
    {
      title: 'Call Recording & Analytics',
      description: 'Record every call automatically for training and compliance purposes.',
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    },
    {
      title: 'Real-Time Performance Dashboard',
      description: 'Track calling metrics, follow-ups, and lead movement with live reports.',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      color: '#f44336'
    },
    {
      title: 'Advanced Caller ID',
      description: 'See lead details, last interaction, and notes before every call.',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#00bcd4'
    },
    {
      title: 'Automated Follow-Ups',
      description: 'Never miss a follow-up with smart reminders and scheduling.',
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: '#673ab7'
    },
    {
      title: 'CRM Integration',
      description: 'Seamless integration with your existing CRM systems and tools.',
      icon: <IntegrationInstructions sx={{ fontSize: 40 }} />,
      color: '#009688'
    },
    {
      title: 'Live Team Monitoring',
      description: 'Monitor agent activity in real-time with live status updates.',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#ff5722'
    },
    {
      title: 'WhatsApp Automation',
      description: 'Send automated WhatsApp messages directly from the dialer.',
      icon: <WhatsApp sx={{ fontSize: 40 }} />,
      color: '#25d366'
    }
  ];

  const dialerStats = [
    { label: 'Calls Per Day', value: '100+', icon: <CallMade /> },
    { label: 'Connection Rate', value: '85%', icon: <CallReceived /> },
    { label: 'Time Saved', value: '70%', icon: <AutoMode /> },
    { label: 'Lead Conversion', value: '40%', icon: <Analytics /> }
  ];

  const aiFeatures = [
    {
      title: 'AI-Powered Call Optimization',
      description: 'Intelligent call timing and routing based on historical data and patterns.',
      icon: <SmartToy sx={{ fontSize: 40 }} />
    },
    {
      title: 'Smart Call Transcriptions',
      description: 'Automatic call transcription with sentiment analysis and key insights.',
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />
    },
    {
      title: 'Predictive Dialing',
      description: 'AI algorithms predict the best time to call each lead for maximum connection rates.',
      icon: <AutoMode sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <>
      <ciisHeader />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={800}>
                <Box>
                  {/* Breadcrumb */}
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      opacity: 0.9,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Chip
                      label="Home"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                    <span>&gt;</span>
                    <Chip
                      label="Product"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                    <span>&gt;</span>
                    <Chip
                      label="AutoDialer App"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Typography>

                  {/* Main Title */}
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.1
                    }}
                  >
                    SIM-Based Auto Dialer <br />
                    That Ends Manual Calling <br />
                    For Good
                  </Typography>

                  {/* Subtitle */}
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      opacity: 0.9,
                      fontWeight: 400
                    }}
                  >
                    Integrated with CiisNetwork Call Management CRM, it speeds up outreach and helps your team stay on track with every lead.
                  </Typography>

                  {/* Features List */}
                  <List sx={{ mb: 4 }}>
                    {[
                      'Auto Dial 100+ leads/day',
                      'SIM-based calling that builds trust with every ring',
                      'Live call updates in the CRM'
                    ].map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            sx: { fontSize: '1.1rem', opacity: 0.9 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: 'white',
                        color: '#667eea',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2,
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
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2,
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
                  </Box>

                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    No Credit Card Required
                  </Typography>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Slide in timeout={1000} direction="left">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      width: '100%',
                      maxWidth: 400,
                      borderRadius: 4,
                      background: 'linear-gradient(145deg, #1e3c72 0%, #2a5298 100%)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {/* Auto Dialer Interface Mockup */}
                    <Box sx={{ p: 3, color: 'white' }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Auto Dialer Dashboard
                      </Typography>
                      
                      {/* Stats Grid */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {dialerStats.map((stat, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40, mx: 'auto', mb: 1 }}>
                                {stat.icon}
                              </Avatar>
                              <Typography variant="h6" fontWeight={600}>
                                {stat.value}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {stat.label}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Next Call Card */}
                      <Paper sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Next in Queue
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
                            borderRadius: 3
                          }}
                        >
                          Auto Dial Next
                        </Button>
                      </Paper>
                    </Box>
                  </Paper>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Logo />

      {/* Features Section */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'text.primary'
              }}
            >
              Advanced Auto Dialing Features
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Boost productivity and conversion rates with intelligent auto dialing technology
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {autoDialerFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Zoom in timeout={800 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    border: `2px solid ${feature.color}20`,
                    bgcolor: `${feature.color}08`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 35px ${feature.color}20`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Bannerbtn
        title="Give it a spin with your team today"
        buttonText="Start 10-day free trial"
        onClick={() => alert("Trial started")}
      />

      {/* AI Tools Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Intelligent Auto Dialing With{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  CiisNetwork AI
                </Box>
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Power up your dialing strategy with artificial intelligence
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  {aiFeatures.map((feature, index) => (
                    <Box key={index} sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                          {feature.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={600} gutterBottom>
                            {feature.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                      {index < aiFeatures.length - 1 && <Divider sx={{ my: 3 }} />}
                    </Box>
                  ))}
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Slide in timeout={1200} direction="left">
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  }}
                >
                  {/* AI Call Analytics Simulation */}
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    AI Call Analytics
                  </Typography>
                  
                  {[
                    { metric: 'Optimal Call Time', value: '2:30 PM', confidence: '92%' },
                    { metric: 'Expected Answer Rate', value: '78%', confidence: '85%' },
                    { metric: 'Lead Engagement Score', value: '8.5/10', confidence: '88%' },
                    { metric: 'Recommended Approach', value: 'Product Demo', confidence: '90%' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {item.metric}
                        </Typography>
                        <Chip
                          label={item.confidence}
                          size="small"
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          bgcolor: 'white',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Bannerbtn
        title="Take a closer look at how CiisNetwork works for real teams like yours"
        buttonText="Book A Demo"
        onClick={() => alert("Demo scheduled")}
      />

      <Review />
      <FAQ />

      {/* Data Protection Section */}
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.2
              }}
            >
              Enterprise-Grade Security & <br />
              Compliance Standards
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              {[
                { name: 'GDPR Compliant', description: 'Full data protection compliance', icon: <Security /> },
                { name: 'ISO 27001 Certified', description: 'Enterprise security standards', icon: <Security /> },
                { name: 'TCPA Compliant', description: 'Telephone consumer protection', icon: <Security /> },
                { name: 'End-to-End Encryption', description: 'Military-grade security', icon: <Security /> }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Zoom in timeout={800 + index * 200}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        height: '100%',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Container>

      {/* Download Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 10 }
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3rem' }
                }}
              >
                Start Auto Dialing <br />
                Today
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Join thousands of sales teams using CiisNetwork Auto Dialer to maximize productivity and conversions
              </Typography>

              {/* Download Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Download on App Store
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
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  GET IT ON Google Play
                </Button>
              </Stack>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Rating value={4.7} precision={0.1} readOnly sx={{ color: 'white' }} />
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#ffeb3b' }} />
                  4.7 Star Rating
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  50K+ Downloads
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

export default AutoDialer;