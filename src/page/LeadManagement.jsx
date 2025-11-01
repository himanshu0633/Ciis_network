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
  Tab,
  Tabs
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
  Assignment,
  TrackChanges,
  AutoAwesome,
  Insights,
  Group
} from '@mui/icons-material';
import ciisHeader from '../components/CiisHeader';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import FAQ from '../components/FAQ';
import Review from '../components/Review';
import Bannerbtn from '../components/Bannerbtn';
import Logo from '../components/Logo';

function LeadManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const leadFeatures = [
    {
      title: 'Smart Lead Capture',
      description: 'Automatically capture leads from multiple sources and centralize them in one dashboard.',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#2196f3'
    },
    {
      title: 'Lead Scoring & Prioritization',
      description: 'AI-powered lead scoring to focus on high-potential prospects first.',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Automated Lead Distribution',
      description: 'Smart routing of leads to the right agents based on skills and availability.',
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      color: '#ff9800'
    },
    {
      title: 'Real-Time Lead Tracking',
      description: 'Track every lead through the entire sales pipeline with visual progress indicators.',
      icon: <TrackChanges sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    },
    {
      title: 'Follow-Up Automation',
      description: 'Never miss a follow-up with automated reminders and scheduling.',
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: '#f44336'
    },
    {
      title: 'Performance Analytics',
      description: 'Comprehensive analytics on lead conversion rates and agent performance.',
      icon: <Insights sx={{ fontSize: 40 }} />,
      color: '#00bcd4'
    },
    {
      title: 'Multi-Channel Lead Management',
      description: 'Manage leads from calls, emails, web forms, and social media in one place.',
      icon: <Group sx={{ fontSize: 40 }} />,
      color: '#673ab7'
    },
    {
      title: 'CRM Integration',
      description: 'Seamless integration with your existing CRM systems and tools.',
      icon: <IntegrationInstructions sx={{ fontSize: 40 }} />,
      color: '#009688'
    }
  ];

  const pipelineStages = [
    { stage: 'New Lead', count: '1,234', color: '#ff6b6b' },
    { stage: 'Contacted', count: '856', color: '#4ecdc4' },
    { stage: 'Qualified', count: '432', color: '#45b7d1' },
    { stage: 'Proposal Sent', count: '289', color: '#96ceb4' },
    { stage: 'Negotiation', count: '156', color: '#feca57' },
    { stage: 'Won', count: '98', color: '#ff9ff3' }
  ];

  const aiFeatures = [
    {
      title: 'AI-Powered Lead Scoring',
      description: 'Intelligent lead scoring based on behavior, engagement, and demographic data.',
      icon: <Analytics sx={{ fontSize: 40 }} />
    },
    {
      title: 'Predictive Analytics',
      description: 'Forecast lead conversion probabilities and identify promising opportunities.',
      icon: <Insights sx={{ fontSize: 40 }} />
    },
    {
      title: 'Automated Lead Nurturing',
      description: 'Smart follow-up sequences and personalized communication based on lead behavior.',
      icon: <AutoAwesome sx={{ fontSize: 40 }} />
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
                      label="Lead Management CRM"
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
                    Lead Management App <br />
                    That Tracks Every Lead, <br />
                    Every Step
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
                      'Smart lead capture from multiple channels',
                      'AI-powered lead scoring and prioritization',
                      'Real-time pipeline tracking and analytics'
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
                    {/* Lead Pipeline Visualization */}
                    <Box sx={{ p: 3, color: 'white' }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Lead Pipeline
                      </Typography>
                      
                      {pipelineStages.map((stage, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{stage.stage}</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {stage.count}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 8,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                bgcolor: stage.color,
                                width: `${(index + 1) * 15}%`,
                                borderRadius: 4
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                      
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Analytics />}
                        sx={{
                          bgcolor: '#4caf50',
                          mt: 2,
                          py: 1.5,
                          borderRadius: 3
                        }}
                      >
                        View Dashboard
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
              Complete Lead Management Solution
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              From capture to conversion, manage every lead with precision and intelligence
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {leadFeatures.map((feature, index) => (
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
                Intelligent Lead Management With{' '}
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
                Transform your lead management with artificial intelligence
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
                  {/* AI Lead Scoring Simulation */}
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    AI Lead Scoring Dashboard
                  </Typography>
                  
                  {[
                    { name: 'Enterprise Corp', score: 95, status: 'Hot Lead', color: '#4caf50' },
                    { name: 'Startup Tech', score: 78, status: 'Warm Lead', color: '#ff9800' },
                    { name: 'Local Business', score: 45, status: 'Cold Lead', color: '#f44336' },
                    { name: 'Global Solutions', score: 88, status: 'Warm Lead', color: '#ff9800' }
                  ].map((lead, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {lead.name}
                        </Typography>
                        <Chip
                          label={lead.status}
                          size="small"
                          sx={{
                            bgcolor: `${lead.color}20`,
                            color: lead.color,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            bgcolor: lead.color,
                            width: `${lead.score}%`,
                            borderRadius: 4
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        AI Score: {lead.score}/100
                      </Typography>
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
              Data Protection
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
              {[
                { name: 'GDPR Compliant', description: 'Full compliance with data protection regulations', icon: <Security /> },
                { name: 'ISO 27001 Certified', description: 'Enterprise-level security certification', icon: <Security /> },
                { name: 'SOC 2 Type II', description: 'Industry-leading security standards', icon: <Security /> },
                { name: 'End-to-End Encryption', description: 'Military-grade data encryption', icon: <Security /> }
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
                Start Managing Leads <br />
                More Effectively
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
                Join thousands of sales teams using CiisNetwork to transform their lead management process
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

export default LeadManagement;