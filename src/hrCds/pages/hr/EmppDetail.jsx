import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "../../../utils/axiosConfig";
import EmployeeTypeFilter from "../../Filter/EmployeeTypeFilter"; // 👈 import filter component

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all"); // 👈 state for filter

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/users/all-users");
        setEmployees(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleOpenUser = (user) => setSelectedUser(user);
  const handleCloseUser = () => setSelectedUser(null);

  // 👇 Filter logic
  const filteredEmployees = useMemo(() => {
    if (selectedEmployeeType === "all") return employees;
    return employees.filter(
      (u) =>
        u.employeeType &&
        u.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
    );
  }, [employees, selectedEmployeeType]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Employee Directory
      </Typography>

      {/* 👇 Employee Type Filter */}
      <EmployeeTypeFilter
        selected={selectedEmployeeType}
        onChange={setSelectedEmployeeType}
      />

      <Grid container spacing={2}>
        {filteredEmployees.map((emp) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { boxShadow: 6 },
              }}
              onClick={() => handleOpenUser(emp)}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={emp.image} alt={emp.name} />
                  <Box>
                    <Typography variant="subtitle1">{emp.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {emp.mobile || emp.phone}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {emp.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {emp.employeeType?.toUpperCase() || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* User Detail Popup */}
      <Dialog open={Boolean(selectedUser)} onClose={handleCloseUser} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Name:</strong> {selectedUser.name}</Typography>
                  <Typography><strong>Gender:</strong> {selectedUser.gender}</Typography>
                  <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedUser.mobile || selectedUser.phone}</Typography>
                  <Typography><strong>DOB:</strong> {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : ""}</Typography>
                  <Typography><strong>Employee Type:</strong> {selectedUser.employeeType}</Typography>
                  <Typography><strong>Job Role:</strong> {selectedUser.jobRole}</Typography>
                  <Typography><strong>Marital Status:</strong> {selectedUser.maritalStatus}</Typography>
                  <Typography><strong>Address:</strong> {selectedUser.address}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Bank Name:</strong> {selectedUser.bankName}</Typography>
                  <Typography><strong>Account No.:</strong> {selectedUser.accountNumber}</Typography>
                  <Typography><strong>IFSC:</strong> {selectedUser.ifsc}</Typography>
                  <Typography><strong>Father:</strong> {selectedUser.fatherName}</Typography>
                  <Typography><strong>Mother:</strong> {selectedUser.motherName}</Typography>
                  <Typography><strong>Emergency Name:</strong> {selectedUser.emergencyName}</Typography>
                  <Typography><strong>Emergency Phone:</strong> {selectedUser.emergencyPhone}</Typography>
                  <Typography><strong>Emergency Relation:</strong> {selectedUser.emergencyRelation}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUser} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDirectory;
