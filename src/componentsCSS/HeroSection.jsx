import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
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
  WhatsApp
} from '@mui/icons-material';

import call from '../image/runo/banner.jpg';
import image from '../image/runo/1.png';

const featureList = [
  { label: 'AI Call Summaries', icon: <AutoAwesome /> },
  { label: 'Call Recording', icon: <Mic /> },
  { label: 'Follow-Up Reminder', icon: <NotificationsActive /> },
  { label: 'Live Team Status', icon: <Groups /> },
  { label: 'Auto Dialer', icon: <Phone /> },
  { label: 'Call Analytics', icon: <QueryStats /> },
  { label: 'Live Intuitive Dashboard', icon: <Dashboard /> },
  { label: 'Advanced Caller ID', icon: <Contacts /> },
  { label: 'AI Sentiment Analysis', icon: <EmojiEmotions /> },
  { label: 'AI Sales Assistant', icon: <SmartToy /> },
  { label: 'Auto Lead Allocation', icon: <Shuffle /> },
  { label: 'Biz WhatsApp Integration', icon: <WhatsApp /> },
];

const HeroSection = () => {
  return (
    <Box
      sx={{
        backgroundImage: `url(${call})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 6,
        px: 2,
        color: 'black',
      }}
    >
      <Box maxWidth="lg" mx="auto">
        {/* Hero Text */}
        <Box textAlign="center" mb={6} maxWidth="70%" mx="auto">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            AI-Powered SIM-Based Call Management CRM
          </Typography>
          <Typography variant="h6" mb={4}>
            2x Calling Productivity in Just 2 Weeks. Earn Trust on Every Call.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              sx={{
                borderColor: '#FF6F61',
                color: '#FF6F61',
                borderRadius: '16px',
                '&:hover': {
                  backgroundColor: '#FF6F61',
                  color: '#fff',
                },
              }}
            >
              Book A Demo
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '16px',
                background: 'linear-gradient(90deg, #FF6F61 0%, #FFC837 100%)',
              }}
            >
              Start 10-Day Free Trial
            </Button>
          </Box>
        </Box>

        {/* Image + Feature Section */}
        <Grid container columns={12} spacing={4} justifyContent="center">
          {/* Left Image */}
          <Grid columnSpan={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src={image}
              alt="Agent"
              sx={{ width: '100%', borderRadius: 2 }}
            />
          </Grid>

          {/* Right Features */}
          <Grid columnSpan={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                backgroundColor: '#fff',
                p: 3,
                borderRadius: '31px',
                height: '100%',
              }}
            >
              <Typography variant="h5" fontWeight="bold" mb={3}>
                All That You Need in One App
              </Typography>

              <Grid container columns={12} spacing={1}>
                {featureList.map((feature, index) => (
                  <Grid key={index} columnSpan={{ xs: 6, sm: 4 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={feature.icon}
                      sx={{
                        borderRadius: 2,
                        color: '#000',
                        borderColor: '#000',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        '&:hover': {
                          borderColor: '#FF6F61',
                        },
                      }}
                    >
                      {feature.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Box textAlign="center" mt={3}>
                <Button
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    background: 'linear-gradient(90deg, #FF6F61 0%, #FFC837 100%)',
                    color: 'black',
                    borderRadius: '16px',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FF3C00 0%, #FFB300 100%)',
                    },
                  }}
                >
                  See All Features
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HeroSection;
