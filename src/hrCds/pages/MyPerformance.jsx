import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

const MyPerformance = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Performance Management</Typography>
            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ mb: 2 }}
                textColor="primary"
                indicatorColor="primary"
            >
                <Tab label="My 1:1" />
                <Tab label="Updates" />
                <Tab label="Regular Feedback" />
                <Tab label="Reviews" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
                {activeTab === 0 && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">My 1:1</Typography>
                        <Typography color="text.secondary">Coming Soon</Typography>
                    </Paper>
                )}
                {activeTab === 1 && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Updates</Typography>
                        <Typography color="text.secondary">Coming Soon</Typography>
                    </Paper>
                )}
                {activeTab === 2 && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Regular Feedback</Typography>
                        <Typography color="text.secondary">Coming Soon</Typography>
                    </Paper>
                )}
                {activeTab === 3 && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Reviews</Typography>
                        <Typography color="text.secondary">Coming Soon</Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default MyPerformance;