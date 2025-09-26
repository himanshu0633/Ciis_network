import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import { orange } from '@mui/material/colors';
import { styled } from '@mui/system';

const StyledBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 12,
  marginTop: theme.spacing(4),
}));

const TransferTypeCard = styled(Box)(({ selected }) => ({
  border: `2px solid ${selected ? orange[500] : '#e0e0e0'}`,
  borderRadius: 8,
  padding: '24px 36px',
  textAlign: 'center',
  backgroundColor: selected ? '#fff7f0' : '#fff',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
}));

const TransferData = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [transferType, setTransferType] = useState('Allocations');
  const [fromUser, setFromUser] = useState('');
  const [toUser, setToUser] = useState('');

  return (
    <StyledBox>
      <Typography variant="h6" fontWeight={600} color="text.primary">
        Transfer data
      </Typography>

      <Box mt={4}>
        <Typography fontWeight={500} gutterBottom>
          Transfer Type
        </Typography>
        <TransferTypeCard
          selected={transferType === 'Allocations'}
          onClick={() => setTransferType('Allocations')}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/9332/9332681.png"
            alt="Allocations"
            width={32}
            style={{ marginBottom: 8 }}
          />
          <Typography>Allocations</Typography>
        </TransferTypeCard>
      </Box>

      <Box mt={4} display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={4}>
        <Box flex={1}>
          <Typography gutterBottom>Transfer from</Typography>
          <TextField
            fullWidth
            select
            value={fromUser}
            onChange={(e) => setFromUser(e.target.value)}
            variant="outlined"
            placeholder="Select"
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="user1">User 1</MenuItem>
            <MenuItem value="user2">User 2</MenuItem>
          </TextField>
        </Box>
        <Box flex={1}>
          <Typography gutterBottom>Transfer to</Typography>
          <TextField
            fullWidth
            select
            value={toUser}
            onChange={(e) => setToUser(e.target.value)}
            variant="outlined"
            placeholder="Select"
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="user3">User 3</MenuItem>
            <MenuItem value="user4">User 4</MenuItem>
          </TextField>
        </Box>
      </Box>

      <Box mt={4}>
        <Button
          variant="contained"
          sx={{ backgroundColor: orange[500], paddingX: 4 }}
          disabled={!fromUser || !toUser}
        >
          Initiate Transfer
        </Button>
        <Typography variant="body2" color="text.secondary" mt={2}>
          Note: Please ensure that both the users are part of same processes
        </Typography>
      </Box>
    </StyledBox>
  );
};

export default TransferData;
