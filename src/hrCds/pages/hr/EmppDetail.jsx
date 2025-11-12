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
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiSearch,
  FiX,
  FiEdit,
  FiEye,
  FiMoreVertical,
  FiTrash2,
  FiSave,
  FiShield
} from "react-icons/fi";
import axios from "../../../utils/axiosConfig";
import { styled } from "@mui/material/styles";

// === Styled Components ===
const EmployeeCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
    borderColor: theme.palette.primary.main,
  },
}));

const StatCard = styled(Card)(({ theme, active }) => ({
  background: active
    ? `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}10)`
    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  borderLeft: active
    ? `4px solid ${theme.palette.primary.main}`
    : `4px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  ...(type === 'technical' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(type === 'non-technical' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(type === 'sales' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(type === 'intern' && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}40`,
  }),
}));

const RoleChip = styled(Chip)(({ theme, role }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  ...(role === 'admin' && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}40`,
  }),
  ...(role === 'manager' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(role === 'hr' && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}40`,
  }),
  ...(role === 'user' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(role === 'SuperAdmin' && {
    background: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.dark,
    border: `1px solid ${theme.palette.primary.main}40`,
  }),
}));
const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // <-- NEW for StatCard filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuUser, setSelectedMenuUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users/all-users");
      setEmployees(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      showSnackbar('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // 📊 Calculate stats
  const stats = useMemo(() => ({
    total: employees.length,
    technical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'technical').length,
    nonTechnical: employees.filter(emp => emp.employeeType?.toLowerCase() === 'non-technical').length,
    sales: employees.filter(emp => emp.employeeType?.toLowerCase() === 'sales').length,
    intern: employees.filter(emp => emp.employeeType?.toLowerCase() === 'intern').length,
  }), [employees]);

  // 🧩 Filter Logic
  useEffect(() => {
    let filtered = employees;

    // Role-based filtering
    if (selectedRole !== "all") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }

    // Type-based filtering (Stat Card click)
    if (selectedType !== "all") {
      filtered = filtered.filter((u) => u.employeeType?.toLowerCase() === selectedType);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, selectedRole, selectedType, searchTerm]);

  // 🧠 Helpers
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    const phoneStr = phone.toString();
    return phoneStr.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const handleCardFilter = (type) => {
    setSelectedType(prev => (prev === type ? "all" : type)); // Toggle filter
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <LinearProgress sx={{ width: "100px" }} />
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* ================= HEADER SECTION ================= */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: theme.shape.borderRadius * 2,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            boxShadow: theme.shadows[4],
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Employee Directory
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find and connect with your colleagues
              </Typography>
            </Box>

            {/* 🔍 SEARCH + ROLE FILTER SECTION */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                placeholder="Search employees by name, email, role, or job role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <FiSearch
                      style={{ marginRight: 8, color: theme.palette.text.secondary }}
                    />
                  ),
                  endAdornment: searchTerm && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm("")}
                      sx={{ mr: -0.5 }}
                    >
                      <FiX size={16} />
                    </IconButton>
                  ),
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 2,
                  },
                }}
              />

              {/* Role Filter */}
              <FormControl
                sx={{
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 2,
                  },
                }}
                size="small"
              >
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Filter by Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        {/* ================= STATISTIC CARDS ================= */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* TOTAL */}
          <Grid item xs={6} md={2.4}>
            <StatCard
              active={selectedType === "all"}
              onClick={() => handleCardFilter("all")}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.palette.primary.main}20`,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <FiUsers />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          {/* TECHNICAL */}
          <Grid item xs={6} md={2.4}>
            <StatCard
              active={selectedType === "technical"}
              onClick={() => handleCardFilter("technical")}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.palette.success.main}20`,
                      color: theme.palette.success.main,
                    }}
                  >
                    <FiBriefcase />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Technical
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.technical}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          {/* NON-TECH */}
          <Grid item xs={6} md={2.4}>
            <StatCard
              active={selectedType === "non-technical"}
              onClick={() => handleCardFilter("non-technical")}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.palette.warning.main}20`,
                      color: theme.palette.warning.main,
                    }}
                  >
                    <FiClock />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Non-Tech
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.nonTechnical}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          {/* SALES */}
          <Grid item xs={6} md={2.4}>
            <StatCard
              active={selectedType === "sales"}
              onClick={() => handleCardFilter("sales")}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.palette.info.main}20`,
                      color: theme.palette.info.main,
                    }}
                  >
                    <FiUser />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Sales
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.sales}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          {/* INTERNS */}
          <Grid item xs={6} md={2.4}>
            <StatCard
              active={selectedType === "intern"}
              onClick={() => handleCardFilter("intern")}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.palette.secondary.main}20`,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    <FiUsers />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Interns
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.intern}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>
        {/* ================= EMPLOYEE GRID ================= */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {filteredEmployees.length} Employee
            {filteredEmployees.length !== 1 ? "s" : ""} Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(selectedType !== "all" || selectedRole !== "all") &&
              `Filtered by ${
                selectedType !== "all"
                  ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
                  : selectedRole
              }`}
          </Typography>
        </Stack>

        {filteredEmployees.length === 0 ? (
          <Paper
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: theme.shape.borderRadius * 2,
            }}
          >
            <FiUsers
              size={48}
              color={theme.palette.text.secondary}
              style={{ marginBottom: 16 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Employees Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedType !== "all" || selectedRole !== "all"
                ? "Try adjusting your filters or search terms"
                : "No employees in the directory"}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEmployees.map((emp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
                <EmployeeCard>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* --- Avatar and Header --- */}
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                          src={emp.image}
                          sx={{
                            width: 56,
                            height: 56,
                            border: `2px solid ${theme.palette.primary.main}20`,
                          }}
                        >
                          {getInitials(emp.name)}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box>
                              <Typography variant="h6" fontWeight={600} noWrap>
                                {emp.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="primary.main"
                                fontWeight={500}
                              >
                                {emp.jobRole || "No role specified"}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ mt: 0.5 }}
                                flexWrap="wrap"
                                gap={0.5}
                              >
                                <EmployeeTypeChip
                                  label={
                                    emp.employeeType?.toUpperCase() || "N/A"
                                  }
                                  type={emp.employeeType?.toLowerCase()}
                                  size="small"
                                />
                                <RoleChip
                                  label={emp.role}
                                  role={emp.role}
                                  size="small"
                                />
                              </Stack>
                            </Box>

                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchorEl(e.currentTarget);
                                setSelectedMenuUser(emp);
                              }}
                              sx={{ mt: -0.5, mr: -0.5 }}
                            >
                              <FiMoreVertical size={16} />
                            </IconButton>
                          </Stack>
                        </Box>
                      </Stack>

                      <Divider />

                      {/* --- Contact Info --- */}
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiMail size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2" noWrap title={emp.email}>
                            {emp.email || "No email"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiPhone size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2">
                            {formatPhoneNumber(emp.phone)}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiShield size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2">
                            Role: {emp.role || "User"}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* --- View Button --- */}
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<FiEye size={14} />}
                        onClick={() => setSelectedUser(emp)}
                        sx={{
                          borderRadius: theme.shape.borderRadius * 2,
                          mt: 1,
                        }}
                      >
                        View Profile
                      </Button>
                    </Stack>
                  </CardContent>
                </EmployeeCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ================= MENU ================= */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          elevation={3}
        >
          <MenuItem onClick={() => setEditingUser(selectedMenuUser)}>
            <ListItemIcon>
              <FiEdit size={18} />
            </ListItemIcon>
            <ListItemText>Edit Employee</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setSelectedUser(selectedMenuUser)}>
            <ListItemIcon>
              <FiEye size={18} />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setUserToDelete(selectedMenuUser);
              setDeleteConfirmOpen(true);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <FiTrash2 size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText>Delete Employee</ListItemText>
          </MenuItem>
        </Menu>

        {/* ================= DELETE CONFIRM ================= */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => !deleting && setDeleteConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1} color="error.main">
              <FiAlertTriangle />
              <Typography variant="h6" fontWeight={600}>
                Confirm Delete
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={deleting ? <CircularProgress size={16} /> : <FiTrash2 />}
              onClick={() => handleDeleteConfirm(userToDelete)}
              disabled={deleting}
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= SNACKBAR ================= */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{ borderRadius: theme.shape.borderRadius * 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default EmployeeDirectory;
