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
  Stack
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
 

} from '@mui/icons-material';
import RunoHeader from '../components/RunoHeader';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import FAQ from '../components/FAQ';
import Review from '../components/Review';
import Bannerbtn from '../components/Bannerbtn';
import Logo from '../components/Logo';

function CallManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      title: 'Auto Dialer',
      description: 'Call leads back-to-back without dialing manually. Boost call speed and focus.',
      icon: <Phone sx={{ fontSize: 40 }} />,
      color: '#2196f3'
    },
    {
      title: 'Advanced Caller ID',
      description: 'See the lead\'s name, last interaction, and notes before every call',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Call Recording',
      description: 'Record every call automatically for training, compliance, and audit purposes.',
      icon: <RecordVoiceOver sx={{ fontSize: 40 }} />,
      color: '#ff9800'
    },
    {
      title: 'Live Performance Dashboard',
      description: 'Track daily calling metrics, follow-ups, and lead movement with visual reports.',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    },
    {
      title: 'Follow-Up Notifications',
      description: 'Get automatic reminders for pending follow-ups to avoid losing hot leads.',
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: '#f44336'
    },
    {
      title: 'Lead Management',
      description: 'Capture, track, and update every lead in real time from a single dashboard.',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#00bcd4'
    },
    {
      title: 'Auto Lead Allocation',
      description: 'Distribute leads instantly to the right agent based on pre-set rules.',
      icon: <PlayArrow sx={{ fontSize: 40 }} />,
      color: '#673ab7'
    },
    {
      title: 'CRM Integration',
      description: 'Access lead details, call notes, and previous interactions without leaving the app.',
      icon: <IntegrationInstructions sx={{ fontSize: 40 }} />,
      color: '#009688'
    },
    {
      title: 'Real-Time Team Tracking',
      description: 'Monitor agent activity live. See who is calling, who is idle, and who is behind on follow-ups.',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#ff5722'
    },
    {
      title: 'WhatsApp Templates',
      description: 'Send pre-approved WhatsApp templates directly from the app after each call.',
      icon: <WhatsApp sx={{ fontSize: 40 }} />,
      color: '#25d366'
    }
  ];

  const aiFeatures = [
    {
      title: 'AI Call Transcripts',
      description: 'Get a complete, accurate text version of every call. No need to re-listen or take notes.',
  
    },
    {
      title: 'Smart Call Analytics',
      description: 'AI-powered insights on call patterns, customer sentiment, and agent performance.',
      icon: <Analytics sx={{ fontSize: 40 }} />
    },
    {
      title: 'Automated Follow-ups',
      description: 'Intelligent scheduling and prioritization of follow-up calls based on conversation analysis.',
      icon: <Notifications sx={{ fontSize: 40 }} />
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
                      label="Call Management CRM"
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
                    Call Management App <br />
                    For Mobile-First Sales Teams
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
                    Our dialer, CRM, and live call tracker, rolled into one app
                  </Typography>

                  {/* Features List */}
                  <List sx={{ mb: 4 }}>
                    {[
                      'SIM-based calling for higher call connection rates',
                      'Designed for businesses with 5 to 500+ agents',
                      'Monitor team activity, follow-ups, and call status in one view'
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
                      width: 300,
                      height: 600,
                      borderRadius: 6,
                      background: 'linear-gradient(145deg, #1e3c72 0%, #2a5298 100%)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Mock Phone Screen */}
                    <Box sx={{ p: 3, color: 'white' }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        CiisNetwork Dialer
                      </Typography>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Next Call
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          Rajesh Kumar
                        </Typography>
                        <Typography variant="body2">
                          +91 9876543210
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Phone />}
                        sx={{
                          bgcolor: '#4caf50',
                          mb: 2,
                          py: 1.5,
                          borderRadius: 3
                        }}
                      >
                        Call Now
                      </Button>
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
              Your Sales Toolkit, Simplified
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Speed up your sales process with our powerful tools
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
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
                  {/* AI Chat Simulation */}
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
              Committed to the Highest{' '}
              <br />
              Standards of Data Protection
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              {[
                { name: 'GDPR Compliant', icon: <Security /> },
                { name: 'ISO 27001 Certified', icon: <Security /> },
                { name: 'SOC 2 Type II', icon: <Security /> },
                { name: 'End-to-End Encryption', icon: <Security /> }
              ].map((item, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Zoom in timeout={800 + index * 200}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Container>

      {/* Telecalling Section */}
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
                Simplify Your{' '}
                <br />
                Telecalling Operations
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
                Streamline your telecalling workflow. CiisNetwork simplifies call management,
                lead tracking, and team monitoring in one app.
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
                  Download on the App Store
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
                  4.7 Star
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

export default CallManagement;