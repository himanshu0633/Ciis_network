import React, { useState } from 'react';
import {
  Box, Typography, Tab, Tabs, Paper, Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const RecurringFollowUps = () => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const renderEmptyState = () => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ height: '300px' }}
    >
      <img
        src="https://www.svgrepo.com/show/508699/task-done.svg"
        alt="No Followups"
        width={120}
        style={{ opacity: 0.6 }}
      />
      <Typography variant="body2" color="textSecondary" mt={2}>
        No {tab === 0 ? 'Pending' : 'Upcoming'} Followups
      </Typography>
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} color="primary">
        Recurring Follow-Ups
      </Typography>

      <Tabs
        value={tab}
        onChange={handleChange}
        sx={{ mt: 3 }}
        indicatorColor="secondary"
        textColor="inherit"
      >
        <Tab
          label={
            <Badge badgeContent={0} color="default">
              <Typography>Pending Followups</Typography>
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={0} color="default">
              <Typography color="error">Upcoming Followups</Typography>
            </Badge>
          }
        />
      </Tabs>

      <Paper elevation={0} sx={{ mt: 2, p: 2, minHeight: 200, background: theme.palette.background.paper }}>
        {renderEmptyState()}
      </Paper>
    </Box>
  );
};

export default RecurringFollowUps;
