import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import img from '../image/home-integration.webp';

const Cta = () => {
  return (
    <Box>
      {/* CTA Section */}


      {/* Integration Section */}
      <Box
        sx={{
          backgroundColor: '#fff',
          py: { xs: 6, md: 8 },
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ 
            mb: 2, 
            fontSize: { xs: '1.5rem', md: '1.75rem' } // Responsive font size
          }}
        >
          Multiple Lead Sources? Or Existing CRM? Worry Not!
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 4, 
            fontSize: { xs: '1rem', md: '1.2rem' } // Responsive font size
          }}
        >
           CIIS Network Integrates with all available lead sources and top CRMs
        </Typography>

        {/* Placeholder for logos or integrations */}
        <Box
          className="integration-container"
          sx={{
            height: { xs: '300px', md: '400px' }, // Responsive height
            backgroundImage: `url(${img})`, // Use imported image
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            borderRadius: '12px',
            mb: 4,
          }}
        >
          {/* Insert logos/partners here later */}
        </Box>

        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(90deg, #FF6F61 0%, #FFC837 100%)',
            color: '#000',
            px: 4,
            py: 1.5,
            borderRadius: '16px',
            fontSize: { xs: '0.9rem', md: '1rem' }, // Responsive font size
            fontWeight: 500,
            mb: 1,
            '&:hover': {
              background: 'linear-gradient(90deg, #FF3C00 0%, #FFB300 100%)',
            },
          }}
        >
          Start Your 10-Day Free Trial
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            mt: 1, 
            fontSize: { xs: '0.8rem', md: '1rem' } // Responsive font size
          }}
        >
          No Credit Card Required
        </Typography>
      </Box>
    </Box>
  );
};

export default Cta;
