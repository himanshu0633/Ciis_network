import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Button, Stack,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';

// import { useAssets } from '../context/AssetsContext';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  // const { assets } = useAssets();

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser?.id || null;

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ userId not found in localStorage");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://147.93.106.84:6000/api/users/profile/${userId}`);
        const user = res.data;

        const formatted = {
          personal: {
            employeeId: user._id,
            name: user.name || '',
            email: user.email || '',
            permanentAddress: user.address || '',
            dateOfBirth: user.dob ? user.dob.split('T')[0] : '',
            gender: user.gender || '',
            phone: user.phone || '',
            aadharCard: '',
            panCard: '',
            maritalStatus: user.maritalStatus || ''
          },
          family: {
            fatherName: user.fatherName || '',
            motherName: user.motherName || ''
          },
          emergency: {
            name: user.emergencyName || '',
            relationship: user.emergencyRelation || '',
            presentAddress: user.emergencyAddress || ''
          },
          bank: {
            accountNumber: user.accountNumber || '',
            ifscCode: user.ifsc || '',
            bankName: user.bankName || '',
            bankHolderName: user.bankHolderName || ''
          },
          company: {
            branch: '-',
            department: user.employeeType || '',
            target: user.salary || '',
            designation: user.jobRole || ''
          }
        };

        setProfileData(formatted);
        setEditForm(formatted);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleUpdate = () => {
    setEditOpen(true);
  };

  const handleEditChange = (section, field, value) => {
    setEditForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    setEditOpen(false);
  };

  if (!userId) return <Typography color="error">User not logged in. Please login first.</Typography>;
  if (!profileData) return <Typography>Loading profile...</Typography>;

  return (
    <Box sx={{ p: 3, background: '#fff', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>My Profile</Typography>
        <Button variant="contained" sx={{ background: '#ff7900', borderRadius: 2, px: 4, fontWeight: 700 }} onClick={handleUpdate}>
          Update
        </Button>
      </Box>

      <Stack spacing={3}>
        {/* Personal Details */}
        <Paper sx={{ borderRadius: 3, p: 0 }}>
          <Box sx={{ background: '#ff7900', color: '#fff', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Details</Typography>
          </Box>
          <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography><b>Employee ID:</b> {profileData.personal.employeeId}</Typography>
              <Typography><b>Name:</b> {profileData.personal.name}</Typography>
              <Typography><b>Email:</b> {profileData.personal.email}</Typography>
              <Typography><b>Permanent Address:</b> {profileData.personal.permanentAddress}</Typography>
              <Typography><b>Date of Birth:</b> {profileData.personal.dateOfBirth}</Typography>
              <Typography><b>Gender:</b> {profileData.personal.gender}</Typography>
              <Typography><b>Phone:</b> {profileData.personal.phone}</Typography>
              <Typography><b>Aadhar Card:</b> {profileData.personal.aadharCard || '-'}</Typography>
              <Typography><b>Pan Card:</b> {profileData.personal.panCard || '-'}</Typography>
              <Typography><b>Marital Status:</b> {profileData.personal.maritalStatus}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Family Details */}
        <Paper sx={{ borderRadius: 3 }}>
          <Box sx={{ background: '#2ecc40', color: '#fff', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Family Details</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Typography><b>Father's Name:</b> {profileData.family.fatherName}</Typography>
            <Typography><b>Mother's Name:</b> {profileData.family.motherName}</Typography>
          </Box>
        </Paper>

        {/* Emergency Details */}
        <Paper sx={{ borderRadius: 3 }}>
          <Box sx={{ background: '#e74c3c', color: '#fff', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Emergency Details</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Typography><b>Name:</b> {profileData.emergency.name}</Typography>
            <Typography><b>Relationship:</b> {profileData.emergency.relationship}</Typography>
            <Typography><b>Present Address:</b> {profileData.emergency.presentAddress}</Typography>
          </Box>
        </Paper>

        {/* Bank Details */}
        <Paper sx={{ borderRadius: 3 }}>
          <Box sx={{ background: '#2196f3', color: '#fff', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Bank Details</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Typography><b>Account Number:</b> {profileData.bank.accountNumber}</Typography>
            <Typography><b>IFSC Code:</b> {profileData.bank.ifscCode}</Typography>
            <Typography><b>Bank Name:</b> {profileData.bank.bankName}</Typography>
            <Typography><b>Bank Holder Name:</b> {profileData.bank.bankHolderName}</Typography>
          </Box>
        </Paper>

        {/* Company Details */}
        <Paper sx={{ borderRadius: 3 }}>
          <Box sx={{ background: '#34495e', color: '#fff', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Company Details</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Typography><b>Branch:</b> {profileData.company.branch}</Typography>
            <Typography><b>Department:</b> {profileData.company.department}</Typography>
            <Typography><b>Target:</b> {profileData.company.target}</Typography>
            <Typography><b>Designation:</b> {profileData.company.designation}</Typography>
          </Box>
        </Paper>

        {/* Assets */}
        {/* <Paper sx={{ borderRadius: 3 }}>
          <Box sx={{ background: '#8e44ad', color: '#fff', px: 3, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>My Assets</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {assets.length === 0 ? (
              <Typography>No assets assigned.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Assigned Date</TableCell>
                      <TableCell>Returned Date</TableCell>
                      <TableCell>Condition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assets.map(asset => (
                      <TableRow key={asset.id}>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>{asset.serialNumber}</TableCell>
                        <TableCell>{asset.assignedDate}</TableCell>
                        <TableCell>{asset.returnedDate || '-'}</TableCell>
                        <TableCell>{asset.condition}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper> */}
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Name" value={editForm.personal.name} onChange={e => handleEditChange('personal', 'name', e.target.value)} fullWidth />
            <TextField label="Email" value={editForm.personal.email} onChange={e => handleEditChange('personal', 'email', e.target.value)} fullWidth />
            <TextField label="Phone" value={editForm.personal.phone} onChange={e => handleEditChange('personal', 'phone', e.target.value)} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile;
