import React from 'react';
import { Box, Typography, } from '@mui/material';

const Beyond = () => {

  return (
    <Box
      sx={{
        backgroundImage: 'url(/src/image/runo/cloud-back.webp)', // Adjust path if needed
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover', // Changed to cover for better responsiveness
        width: '100%',
        maxWidth: '1215px',
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        borderTopLeftRadius: 0,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'transparent',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4 },
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          textAlign="center"
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '1.5rem', md: '2rem' }, // Responsive font size
          }}
        >
          Beyond Cloud Technology: Built for Modern, Personalized Outreach
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            textAlign: 'left',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              flex: 1,
              color: '#4a5568',
              fontSize: { xs: '14px', md: '16px' }, // Responsive font size
              lineHeight: 1.6,
              px: 1,
            }}
          >
            Cloud telephony solved the problems of the past, but sales has moved on. Personalised outreach is the
            future. Customers want to see a real number, talk to a real person, and trust who's calling. Masked or
            landline numbers make your calls feel robotic and impersonal. SIM-based calling builds that trust, which is
            why many teams already use it, but they often lack a proper CRM to track leads and manage performance,
            thinking cloud telephony is the only way to get there.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              flex: 1,
              color: '#4a5568',
              fontSize: { xs: '14px', md: '16px' }, // Responsive font size
              lineHeight: 1.6,
              px: 1,
            }}
          >
            Runo bridges this gap. It combines SIM-based calling with a powerful CRM that's built for modern sales
            teams. You get better call connect rates, clear visibility, and a sales process your team will actually
            follow, without needing cloud telephony. This isn't a workaround. It's a new category built for how sales
            should work today.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Beyond;
