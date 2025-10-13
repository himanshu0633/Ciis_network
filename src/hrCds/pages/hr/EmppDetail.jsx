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
  Paper
} from "@mui/material";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiUsers,
  FiHeart,
  FiAlertTriangle,
  FiSearch,
  FiX,
  FiClock ,
  FiEdit,
  FiDownload
} from "react-icons/fi";
import axios from "../../../utils/axiosConfig";
import EmployeeTypeFilter from "../../Filter/EmployeeTypeFilter";
import { styled } from "@mui/material/styles";

// Enhanced Styled Components
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

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
  }),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  },
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  ...(type === 'full-time' && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}40`,
  }),
  ...(type === 'part-time' && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}40`,
  }),
  ...(type === 'contract' && {
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

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    fullTime: 0,
    partTime: 0,
    contract: 0,
    intern: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/users/all-users");
        setEmployees(res.data);
        calculateStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const calculateStats = (employeesData) => {
    const fullTime = employeesData.filter(emp => emp.employeeType?.toLowerCase() === 'full-time').length;
    const partTime = employeesData.filter(emp => emp.employeeType?.toLowerCase() === 'part-time').length;
    const contract = employeesData.filter(emp => emp.employeeType?.toLowerCase() === 'contract').length;
    const intern = employeesData.filter(emp => emp.employeeType?.toLowerCase() === 'intern').length;
    
    setStats({
      total: employeesData.length,
      fullTime,
      partTime,
      contract,
      intern
    });
  };

  const handleOpenUser = (user) => setSelectedUser(user);
  const handleCloseUser = () => setSelectedUser(null);

  // Filter logic with search
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    // Filter by employee type
    if (selectedEmployeeType !== "all") {
      filtered = filtered.filter(
        (u) =>
          u.employeeType &&
          u.employeeType.toLowerCase() === selectedEmployeeType.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.mobile?.includes(searchTerm) ||
          u.phone?.includes(searchTerm)
      );
    }
    
    return filtered;
  }, [employees, selectedEmployeeType, searchTerm]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getEmployeeTypeColor = (type) => {
    if (!type) return 'default';
    const typeLower = type.toLowerCase();
    return typeLower === 'full-time' ? 'success' :
           typeLower === 'part-time' ? 'warning' :
           typeLower === 'contract' ? 'info' :
           typeLower === 'intern' ? 'secondary' : 'default';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh'
      }}>
        <LinearProgress sx={{ width: '100px' }} />
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius * 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[4]
        }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Employee Directory
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find and connect with your colleagues
              </Typography>
            </Box>

            {/* Search and Filter Section */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <TextField
                placeholder="Search employees by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                  ),
                  endAdornment: searchTerm && (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      sx={{ mr: -0.5 }}
                    >
                      <FiX size={16} />
                    </IconButton>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: theme.shape.borderRadius * 2,
                  }
                }}
              />
              
              <EmployeeTypeFilter
                selected={selectedEmployeeType}
                onChange={setSelectedEmployeeType}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <StatCard color="primary">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.primary.main}20`, 
                    color: theme.palette.primary.main 
                  }}>
                    <FiUsers />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Employees
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="success">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.success.main}20`, 
                    color: theme.palette.success.main 
                  }}>
                    <FiBriefcase />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Time
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.fullTime}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="warning">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.warning.main}20`, 
                    color: theme.palette.warning.main 
                  }}>
                    <FiClock />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Part Time
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.partTime}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="info">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    bgcolor: `${theme.palette.info.main}20`, 
                    color: theme.palette.info.main 
                  }}>
                    <FiUser />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contract
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.contract}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Results Header */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 3 }}
        >
          <Typography variant="h6" fontWeight={700}>
            {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedEmployeeType !== 'all' && `Filtered by: ${selectedEmployeeType}`}
          </Typography>
        </Stack>

        {/* Employees Grid */}
        {filteredEmployees.length === 0 ? (
          <Paper sx={{ 
            textAlign: 'center', 
            py: 8,
            borderRadius: theme.shape.borderRadius * 2
          }}>
            <FiUsers size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Employees Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedEmployeeType !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No employees in the directory'
              }
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEmployees.map((emp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
                <EmployeeCard onClick={() => handleOpenUser(emp)}>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Header with Avatar and Basic Info */}
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar 
                          src={emp.image} 
                          sx={{ 
                            width: 56, 
                            height: 56,
                            border: `2px solid ${theme.palette.primary.main}20`
                          }}
                        >
                          {getInitials(emp.name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} noWrap>
                            {emp.name}
                          </Typography>
                          <Typography variant="body2" color="primary.main" fontWeight={500}>
                            {emp.jobRole || 'No role specified'}
                          </Typography>
                          <EmployeeTypeChip
                            label={emp.employeeType?.toUpperCase() || 'N/A'}
                            type={emp.employeeType?.toLowerCase()}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Stack>

                      <Divider />

                      {/* Contact Information */}
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiMail size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2" noWrap title={emp.email}>
                            {emp.email || 'No email'}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FiPhone size={14} color={theme.palette.text.secondary} />
                          <Typography variant="body2">
                            {formatPhoneNumber(emp.mobile || emp.phone)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Action Button */}
                      <Button 
                        variant="outlined" 
                        fullWidth
                        size="small"
                        startIcon={<FiUser size={14} />}
                        sx={{ 
                          borderRadius: theme.shape.borderRadius * 2,
                          mt: 1
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

        {/* Enhanced User Detail Dialog */}
        <Dialog 
          open={Boolean(selectedUser)} 
          onClose={handleCloseUser} 
          maxWidth="md" 
          fullWidth
          scroll="paper"
        >
          {selectedUser && (
            <>
              <DialogTitle>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {selectedUser.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip 
                        label={selectedUser.jobRole || 'No role specified'} 
                        color="primary"
                        size="small"
                      />
                      <EmployeeTypeChip
                        label={selectedUser.employeeType?.toUpperCase() || 'N/A'}
                        type={selectedUser.employeeType?.toLowerCase()}
                        size="small"
                      />
                    </Stack>
                  </Box>
                  <IconButton onClick={handleCloseUser}>
                    <FiX />
                  </IconButton>
                </Stack>
              </DialogTitle>
              
              <DialogContent dividers>
                <Stack spacing={3}>
                  {/* Personal Information */}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <FiUser />
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiUser color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Full Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.name || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiCalendar color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Date of Birth
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiUser color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Gender
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.gender || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiHeart color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Marital Status
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.maritalStatus || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiMail color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email Address
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.email || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiPhone color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone Number
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {formatPhoneNumber(selectedUser.mobile || selectedUser.phone)}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiMapPin color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.address || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Family & Emergency Information */}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <FiUsers />
                      Family & Emergency Contact
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiUser color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Father's Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.fatherName || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiUser color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Mother's Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.motherName || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiAlertTriangle color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Emergency Contact
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.emergencyName || 'Not provided'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selectedUser.emergencyRelation && `(${selectedUser.emergencyRelation})`}
                              {selectedUser.emergencyPhone && ` • ${formatPhoneNumber(selectedUser.emergencyPhone)}`}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Bank Information */}
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <FiDollarSign />
                      Bank Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiBriefcase color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Bank Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.bankName || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <FiDollarSign color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Account Number
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.accountNumber || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                        
                        <DetailItem>
                          <FiDollarSign color={theme.palette.text.secondary} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              IFSC Code
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedUser.ifsc || 'Not provided'}
                            </Typography>
                          </Box>
                        </DetailItem>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button 
                  onClick={handleCloseUser}
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                >
                  Close
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<FiMail />}
                  sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                >
                  Send Message
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
};

export default EmployeeDirectory;