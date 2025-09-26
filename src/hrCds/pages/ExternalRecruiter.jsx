import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const ExternalRecruiter = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>External Recruitment</Typography>
            <Paper sx={{ p: 4, textAlign: 'center', background: '#fffde7' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>🚧 Coming Soon</Typography>
                <Typography>This feature is currently under development.</Typography>
                <Typography color="text.secondary">Check back later for updates!</Typography>
            </Paper>
        </Box>
    );
};

export default ExternalRecruiter;