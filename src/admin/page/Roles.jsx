import React from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import { Add, PersonOutline } from '@mui/icons-material';

const rolesData = [
  {
    role: 'Admin',
    color: '#ec4899',
    permissions: ['User Web Panel', 'Web Admin Panel', 'Play Call Recordings'],
    moreCount: 5,
    users: 1,
    createdOn: '08:37 AM, 14 Apr',
  },
  {
    role: 'User',
    color: '#334155',
    permissions: ['User Web Panel', 'Play Call Recordings', 'Show Pop-up'],
    moreCount: 5,
    users: 0,
    createdOn: '08:37 AM, 14 Apr',
  },
];

const Roles = () => {
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Roles & Permissions
        </Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#ff7a59' }}>
          Add a Role
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Role Name</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell><strong>Users</strong></TableCell>
              <TableCell><strong>Created On</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rolesData.map((role, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Chip
                    label={role.role}
                    icon={
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: role.color,
                        }}
                      />
                    }
                    sx={{
                      backgroundColor: `${role.color}10`,
                      color: role.color,
                      fontWeight: 'bold',
                      px: 2,
                      py: 1,
                      fontSize: '0.9rem',
                    }}
                  />
                </TableCell>
                <TableCell>
                  {role.permissions.slice(0, 3).join(', ')}
                  {role.moreCount > 0 && (
                    <Typography component="span" sx={{ color: 'orangered', ml: 1 }}>
                      +{role.moreCount} More
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" color="orangered">
                    <PersonOutline sx={{ fontSize: 18, mr: 0.5 }} />
                    {role.users}
                  </Box>
                </TableCell>
                <TableCell>{role.createdOn}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Roles;
