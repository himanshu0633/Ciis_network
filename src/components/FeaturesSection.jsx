import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Chip,
  Button,
  Stack
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  Psychology
} from '@mui/icons-material';

const FeaturesSection = ({
  title = 'Built for Doers, Dreamers, and Deal Closers: Peep In.',
  subheading = 'Manage calls, track insights, and close deals, everything from your mobile phone',
  features = [],
  footer = null,
  showCta = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Default features if none provided
  const defaultFeatures = [
    {
      title: 'AI Call Summaries',
      description: 'Get instant AI-powered summaries of every call for quick review and insights.',
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      color: '#2196f3'
    },
    {
      title: 'Live Team Status',
      description: 'Monitor your entire team in real-time with live status updates and performance metrics.',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Smart Analytics',
      description: 'Advanced analytics and insights to optimize your sales strategy and team performance.',
      icon: <Psychology sx={{ fontSize: 40 }} />,
      color: '#ff9800'
    }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
            <Chip
              label="POWERFUL FEATURES"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mb: 3,
                px: 2,
                py: 1,
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            />
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              {subheading}
            </Typography>
          </Box>
        </Fade>

        {/* Features Grid */}
        <Grid container spacing={3}>
          {displayFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Zoom in timeout={800 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    border: `2px solid ${feature.color}20`,
                    background: `linear-gradient(145deg, #ffffff 0%, ${feature.color}08 100%)`,
                    borderRadius: 4,
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${feature.color}30`,
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`
                      },
                      '& .feature-content': {
                        transform: 'translateY(-5px)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                      transform: 'scaleX(0)',
                      transition: 'transform 0.3s ease',
                      zIndex: 1
                    },
                    '&:hover::before': {
                      transform: 'scaleX(1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Avatar
                        className="feature-icon"
                        sx={{
                          width: 80,
                          height: 80,
                          background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}cc 100%)`,
                          transition: 'all 0.3s ease',
                          boxShadow: `0 8px 25px ${feature.color}40`
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                    </Box>

                    {/* Content */}
                    <Box className="feature-content" sx={{ transition: 'transform 0.3s ease', flex: 1 }}>
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          textAlign: 'center',
                          color: 'text.primary',
                          fontSize: { xs: '1.3rem', md: '1.5rem' }
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          textAlign: 'center',
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>

                    {/* Hover Indicator */}
                    <Box
                      sx={{
                        textAlign: 'center',
                        mt: 3,
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        transform: 'translateY(10px)',
                        '.MuiCard:hover &': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      <Chip
                        label="Learn More"
                        size="small"
                        sx={{
                          bgcolor: feature.color,
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: feature.color
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Optional CTA Section */}
        {showCta && (
          <Fade in timeout={1200}>
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: 'text.primary'
                }}
              >
                Ready to Transform Your Sales Process?
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
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
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.50',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Book Demo
                </Button>
              </Stack>
            </Box>
          </Fade>
        )}

        {/* Optional Footer */}
        {footer && (
          <Fade in timeout={1500}>
            <Box
              sx={{
                textAlign: 'center',
                mt: 6,
                p: 4,
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {footer}
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default React.memo(FeaturesSection);