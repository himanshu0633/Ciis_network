import React from 'react';
import {
  
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';

const FeaturesSection = ({
  title = 'Built for Doers, Dreamers, and Deal Closers: Peep In.',
  subheading = 'Manage calls, track insights, and close deals, everything from your mobile phone',
  features = [],
  footer = null,
}) => {
  return (
    <Box
      sx={{
        maxWidth: '80%',
        margin: '0 auto',
        padding: { xs: '20px', sm: '40px 20px' },
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
            mb: 2,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#4a5568',
            maxWidth: 600,
            margin: '0 auto',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
            lineHeight: 1.6,
          }}
        >
          {subheading}
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                background: 'white',
                borderRadius: '10px',
                padding: '25px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                minHeight: { xs: 'auto', md: 300 },
                display: 'flex',
                flexDirection: 'column',
                ':hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <CardMedia
                component="img"
                image={feature.icon}
                alt={`Icon for ${feature.title}`}
                sx={{
                  height: { xs: 80, sm: 100, md: 120 },
                  width: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease',
                  marginBottom: '15px',
                  ':hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              />
              <CardContent
                sx={{
                  px: { xs: 1, md: 2 },
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#2d3748',
                      mb: 1,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#4a5568',
                      lineHeight: 1.5,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
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

      {/* Optional Footer */}
      {footer && (
        <Box
          sx={{
            textAlign: 'center',
            padding: { xs: '15px', md: '20px' },
            background: '#f7fafc',
            borderRadius: '8px',
            maxWidth: { xs: '100%', sm: 600 },
            margin: '40px auto 0',
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(FeaturesSection);
