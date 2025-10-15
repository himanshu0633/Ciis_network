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
  Badge
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
  Call,
  Assignment,
  AutoMode,
  TrackChanges,
  Groups,
  Schedule
} from '@mui/icons-material';
import RunoHeader from '../components/RunoHeader';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import FAQ from '../components/FAQ';
import Review from '../components/Review';
import Bannerbtn from '../components/Bannerbtn';
import Logo from '../components/Logo';

function CallCenter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const callCenterFeatures = [
    {
      title: 'Smart Auto Dialer',
      description: 'Call faster without manual dialing between calls.',
      icon: <AutoMode sx={{ fontSize: 40 }} />,
      color: '#2196f3'
    },
    {
      title: 'Call Recording & Monitoring',
      description: 'Record every call for training, compliance, and quality checks.',
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Real-Time Call Tracking',
      description: 'See every call status, duration, and outcome instantly.',
      icon: <TrackChanges sx={{ fontSize: 40 }} />,
      color: '#ff9800'
    },
    {
      title: 'Auto Lead Allocation',
      description: 'Assign leads instantly based on source, region, or rules you set.',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    },
    {
      title: 'Follow-Up Automation',
      description: 'Get notified when it’s time to call back or check in on a lead.',
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: '#f44336'
    },
    {
      title: 'Built-in CRM',
      description: 'No switching between tools, CRM is built right in.',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      color: '#00bcd4'
    },
    {
      title: 'Live Agent Status',
      description: 'Know who’s active, available, or idle at any given moment.',
      icon: <Groups sx={{ fontSize: 40 }} />,
      color: '#673ab7'
    },
    {
      title: 'Interaction Timeline',
      description: 'Access full call history and notes for every lead instantly.',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#009688'
    }
  ];

  const performanceStats = [
    { metric: 'Call Productivity', value: '2x', description: 'Increase in calls per hour' },
    { metric: 'Connection Rate', value: '85%', description: 'Higher answer rates' },
    { metric: 'Lead Conversion', value: '40%', description: 'Improved conversion rates' },
    { metric: 'Agent Efficiency', value: '60%', description: 'Reduced manual work' }
  ];

  const agentStatus = [
    { name: 'Rajesh Kumar', status: 'On Call', calls: 12, color: '#f44336' },
    { name: 'Priya Sharma', status: 'Available', calls: 8, color: '#4caf50' },
    { name: 'Amit Patel', status: 'On Call', calls: 15, color: '#f44336' },
    { name: 'Neha Gupta', status: 'Wrap Up', calls: 10, color: '#ff9800' }
  ];

  const aiFeatures = [
    {
      title: 'AI Call Analytics',
      description: 'Real-time insights on call patterns, sentiment, and agent performance.',
      icon: <Analytics sx={{ fontSize: 40 }} />
    },
    {
      title: 'Smart Call Routing',
      description: 'Intelligent call distribution based on agent skills and availability.',
      icon: <Call sx={{ fontSize: 40 }} />
    },
    {
      title: 'Automated Quality Scoring',
      description: 'AI-powered call quality assessment and agent coaching recommendations.',
      icon: <Star sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <>
      <RunoHeader />
      
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
                      label="Call Center App"
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
                    Call Center App With<br />
                    No Complex Infrastructure
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
                    Run high-performance call operations with 2x calling productivity
                  </Typography>

                  {/* Features List */}
                  <List sx={{ mb: 4 }}>
                    {[
                      'SIM-based calling without IVR drop-offs',
                      'Real-time call, follow-up, and lead tracking',
                      'Auto lead allocation with no manual effort',
                      'Call recording, monitoring, and CRM built in'
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
                      overflow: 'hidden'
                    }}
                  >
                    {/* Call Center Dashboard Mockup */}
                    <Box sx={{ p: 3, color: 'white' }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Call Center Dashboard
                      </Typography>
                      
                      {/* Performance Stats */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {performanceStats.map((stat, index) => (
                          <Grid item xs={6} key={index}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h4" fontWeight={700} sx={{ color: '#4caf50' }}>
                                {stat.value}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                                {stat.metric}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Agent Status */}
                      <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 2 }}>
                        Agent Status
                      </Typography>
                      {agentStatus.slice(0, 2).map((agent, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: agent.color }}>
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box sx={{ ml: 1, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {agent.name}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {agent.status} • {agent.calls} calls
                            </Typography>
                          </Box>
                        </Box>
                      ))}
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
              Features Built for High-Performance Calling Teams
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Simplifies how your team calls and converts
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {callCenterFeatures.map((feature, index) => (
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
        title="Manage your entire call flow without the clutter"
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
                Make Smarter Calls With{' '}
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
                </Box>{' '}
                Tools
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Power up your team with real call intelligence
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
                  {/* AI Call Analytics */}
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    AI Call Analytics
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#e91e63' }}>N</Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Navjot Kaur
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          00:10
                        </Typography>
                      </Box>
                    </Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        borderLeft: '4px solid #ffeb3b'
                      }}
                    >
                      <Typography>
                        Ha ji regarding the usages sir, I just wanted to know that how the usage is happening.
                      </Typography>
                    </Paper>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#4caf50' }}>V</Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Vikas Tiwari
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          00:15
                        </Typography>
                      </Box>
                    </Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        borderLeft: '4px solid #4caf50'
                      }}
                    >
                      <Typography>
                        Apne check kiya tha apne team ka kaise use kar rahe hain. Hum bahut kam dekh rahe the…
                      </Typography>
                    </Paper>
                  </Box>

                  {/* AI Insights */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                      AI Insights:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High engagement detected. Recommended follow-up: Product demonstration
                    </Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Bannerbtn
        title="Ready to see what smart calling actually feels like?"
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
              Data Protection
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              {[
                { name: 'GDPR Compliant', description: 'Full data protection compliance', icon: <Security /> },
                { name: 'ISO 27001 Certified', description: 'Enterprise security standards', icon: <Security /> },
                { name: 'SOC 2 Type II', description: 'Industry-leading security audit', icon: <Security /> },
                { name: 'End-to-End Encryption', description: 'Military-grade data protection', icon: <Security /> }
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

      {/* Mobile Call Center Section */}
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
                A Call Center App <br />
                Built for Mobile Teams
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Stay connected to every call and every rep, whether you're in the office or on the move. 
                Track lead activity, assign follow-ups, and monitor team performance directly from your 
                phone using CiisNetwork SIM-based call center app. No desktops, no delays.
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
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

export default CallCenter;