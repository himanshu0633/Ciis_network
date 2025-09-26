import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const Bannerbtn = ({ backgroundImage, title, buttonText, onClick }) => {
    return (
        <Box
            sx={{
                backgroundColor: '#fdfbf7',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                py: { xs: 6, md: 8 },
                px: 2,
                textAlign: 'center',
            }}
        >
            <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                    color: '#2c3e50',
                    mb: 3,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                }}
            >
                {title}
            </Typography>
            <Button
                variant="contained"
                onClick={onClick}
                sx={{
                    backgroundColor: '#3498db',
                    color: '#fff',
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&:hover': {
                        backgroundColor: '#2980b9',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                }}
            >
                {buttonText}
            </Button>
        </Box>
    );
};

export default Bannerbtn;
