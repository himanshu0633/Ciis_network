import React, { useEffect, useState, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Chip,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  InputAdornment,
  IconButton,
  Tooltip,
  Container,
  alpha,
} from "@mui/material";
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEye,
} from "react-icons/fi";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import format from "date-fns/format";
import EmployeeTypeFilter from "../../Filter/EmployeeTypeFilter";
import { styled } from "@mui/material/styles";

// Enhanced Styled Components
const GradientStatCard = styled(Card)(({ theme, color = "primary", active }) => ({
  background: active 
    ? `linear-gradient(135deg, ${theme.palette[color].main}15, ${theme.palette[color].main}08)`
    : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: active ? theme.shadows[8] : theme.shadows[2],
  border: `1px solid ${active ? theme.palette[color].main + '40' : theme.palette.divider}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  transform: active ? "translateY(-4px)" : "translateY(0)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-4px)",
    border: `1px solid ${theme.palette[color].main + '60'}`,
  },
  "&::before": active ? {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  } : {},
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  borderRadius: 20,
  ...(status === "present" && {
    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    color: theme.palette.success.contrastText,
    boxShadow: `0 2px 8px ${theme.palette.success.main}40`,
  }),
  ...(status === "halfday" && {
    background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
    color: theme.palette.warning.contrastText,
    boxShadow: `0 2px 8px ${theme.palette.warning.main}40`,
  }),
  ...(status === "absent" && {
    background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    color: theme.palette.error.contrastText,
    boxShadow: `0 2px 8px ${theme.palette.error.main}40`,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 600,
  borderRadius: 16,
  fontSize: "0.75rem",
  ...(type === "full-time" && {
    background: `${theme.palette.success.main}15`,
    color: theme.palette.success.dark,
    border: `1px solid ${theme.palette.success.main}30`,
  }),
  ...(type === "part-time" && {
    background: `${theme.palette.warning.main}15`,
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}30`,
  }),
  ...(type === "contract" && {
    background: `${theme.palette.info.main}15`,
    color: theme.palette.info.dark,
    border: `1px solid ${theme.palette.info.main}30`,
  }),
  ...(type === "intern" && {
    background: `${theme.palette.secondary.main}15`,
    color: theme.palette.secondary.dark,
    border: `1px solid ${theme.palette.secondary.main}30`,
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "scale(1.01)",
  },
  "& td": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  ...(status === "present" && {
    background: `${theme.palette.success.main}08`,
    "&:hover": {
      background: `${theme.palette.success.main}12`,
    },
  }),
  ...(status === "halfday" && {
    background: `${theme.palette.warning.main}08`,
    "&:hover": {
      background: `${theme.palette.warning.main}12`,
    },
  }),
  ...(status === "absent" && {
    background: `${theme.palette.error.main}08`,
    "&:hover": {
      background: `${theme.palette.error.main}12`,
    },
  }),
}));

const EnhancedHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: `linear-gradient(45deg, ${theme.palette.primary.main}20, transparent)`,
  },
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
}));

const EmppAttendence = () => {
  const [records, setRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    onTime: 0,
    late: 0,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const fetchData = async (date = new Date()) => {
    setLoading(true);
    try {
      const formatted = format(date, "yyyy-MM-dd");
      const res = await axios.get(`/attendance/all?date=${formatted}`);
      setRecords(res.data.data);
      calculateStats(res.data.data);
    } catch (err) {
      console.error("Failed to load attendance", err);
      setSnackbar({
        open: true,
        message: "Error loading attendance data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const present = attendanceData.filter((r) => r.status === "present").length;
    const absent = attendanceData.filter((r) => r.status === "absent").length;
    const halfDay = attendanceData.filter((r) => r.status === "halfday").length;
    const late = attendanceData.filter(
      (r) => r.lateBy && r.lateBy !== "00:00:00"
    ).length;
    setStats({
      total: attendanceData.length,
      present,
      absent,
      halfDay,
      late,
      onTime: attendanceData.length - late,
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSelectedEmployeeType("all");
    setSearchTerm("");
  };

  const exportData = () => {
    // Implement export functionality
    setSnackbar({
      open: true,
      message: "Export feature coming soon!",
      severity: "info",
    });
  };

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedEmployeeType !== "all") {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.employeeType &&
          rec.user.employeeType.toLowerCase() ===
            selectedEmployeeType.toLowerCase()
      );
    }

    if (statusFilter !== "all") {
      if (["present", "absent", "halfday"].includes(statusFilter)) {
        filtered = filtered.filter((rec) => rec.status === statusFilter);
      } else if (statusFilter === "late") {
        filtered = filtered.filter(
          (rec) => rec.lateBy && rec.lateBy !== "00:00:00"
        );
      } else if (statusFilter === "ontime") {
        filtered = filtered.filter(
          (rec) => !rec.lateBy || rec.lateBy === "00:00:00"
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (rec) =>
          rec.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [records, selectedEmployeeType, searchTerm, statusFilter]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

  if (loading && records.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Box sx={{ width: "60%", textAlign: "center" }}>
          <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading attendance data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={500}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          {/* Enhanced Header */}
          <EnhancedHeader>
            <Stack spacing={3}>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={800}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Attendance Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  Monitor and manage employee attendance in real-time
                </Typography>
              </Box>

              {/* Action Bar */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={() => fetchData(selectedDate)}
                    sx={{
                      background: theme.palette.background.paper,
                      boxShadow: theme.shadows[1],
                      "&:hover": {
                        background: theme.palette.action.hover,
                      },
                    }}
                  >
                    <FiRefreshCw />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Report">
                  <IconButton 
                    onClick={exportData}
                    sx={{
                      background: theme.palette.background.paper,
                      boxShadow: theme.shadows[1],
                      "&:hover": {
                        background: theme.palette.action.hover,
                      },
                    }}
                  >
                    <FiDownload />
                  </IconButton>
                </Tooltip>
                <Box sx={{ flex: 1 }} />
                <Chip
                  icon={<FiCalendar />}
                  label={format(selectedDate, "MMMM d, yyyy")}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Stack>
          </EnhancedHeader>

          {/* Filters Section */}
          <FilterSection sx={{ mb: 4 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FiFilter size={20} color={theme.palette.primary.main} />
                <Typography variant="h6" fontWeight={600}>
                  Filters & Search
                </Typography>
              </Stack>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <EmployeeTypeFilter
                    selected={selectedEmployeeType}
                    onChange={setSelectedEmployeeType}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search employees by name, email, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiSearch size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      variant="outlined" 
                      onClick={clearFilters}
                      fullWidth
                    >
                      Clear All
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={() => fetchData(selectedDate)}
                      fullWidth
                    >
                      Apply
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </FilterSection>

          {/* Enhanced Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { 
                label: "Total Employees", 
                count: stats.total, 
                color: "primary", 
                value: "all", 
                icon: <FiUsers />,
                description: "Total tracked employees"
              },
              { 
                label: "Present", 
                count: stats.present, 
                color: "success", 
                value: "present", 
                icon: <FiCheckCircle />,
                description: "Employees present today"
              },
              { 
                label: "Absent", 
                count: stats.absent, 
                color: "error", 
                value: "absent", 
                icon: <FiXCircle />,
                description: "Employees absent today"
              },
              { 
                label: "Half Day", 
                count: stats.halfDay, 
                color: "warning", 
                value: "halfday", 
                icon: <FiAlertCircle />,
                description: "Employees on half day"
              },
              { 
                label: "On Time", 
                count: stats.onTime, 
                color: "info", 
                value: "ontime", 
                icon: <FiClock />,
                description: "Arrived on time"
              },
              { 
                label: "Late Arrivals", 
                count: stats.late, 
                color: "secondary", 
                value: "late", 
                icon: <FiTrendingUp />,
                description: "Arrived late today"
              },
            ].map((stat) => (
              <Grid item xs={6} md={4} lg={2} key={stat.label}>
                <GradientStatCard
                  color={stat.color}
                  active={statusFilter === stat.value}
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev === stat.value ? "all" : stat.value
                    )
                  }
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: `${theme.palette[stat.color].main}20`,
                            color: theme.palette[stat.color].main,
                            width: 48,
                            height: 48,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                            {stat.label}
                          </Typography>
                          <Typography variant="h4" fontWeight={800} lineHeight={1}>
                            {stat.count}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        {stat.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </GradientStatCard>
              </Grid>
            ))}
          </Grid>

          {/* Enhanced Attendance Table */}
          <Paper 
            sx={{ 
              borderRadius: 4, 
              boxShadow: theme.shadows[2],
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  Attendance Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredRecords.length} records found
                </Typography>
              </Stack>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: theme.palette.primary.main + "08",
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Total Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length ? (
                    filteredRecords.map((rec) => (
                      <StyledTableRow key={rec._id} status={rec.status}>
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(rec.user?.name)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} fontSize="0.95rem">
                                {rec.user?.name || "N/A"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                {rec.user?.email || "N/A"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <EmployeeTypeChip
                            label={rec.user?.employeeType?.toUpperCase() || "N/A"}
                            type={rec.user?.employeeType?.toLowerCase()}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography fontWeight={500} fontSize="0.9rem">
                            {new Date(rec.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography fontWeight={500}>
                            {formatTime(rec.inTime)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography fontWeight={500}>
                            {formatTime(rec.outTime)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Chip 
                            label={rec.totalTime || "00:00:00"} 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <StatusChip
                            label={
                              rec.status.charAt(0).toUpperCase() + rec.status.slice(1)
                            }
                            status={rec.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" sx={{ 
                              background: theme.palette.action.hover,
                              "&:hover": {
                                background: theme.palette.primary.main,
                                color: "white",
                              }
                            }}>
                              <FiEye size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <FiCalendar size={48} color={theme.palette.text.secondary} />
                          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            No Records Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or search criteria
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${
                  snackbar.severity === "error" 
                    ? theme.palette.error.main 
                    : snackbar.severity === "warning"
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }, ${
                  snackbar.severity === "error" 
                    ? theme.palette.error.dark 
                    : snackbar.severity === "warning"
                    ? theme.palette.warning.dark
                    : theme.palette.success.dark
                })`,
                color: "#fff",
                borderRadius: 3,
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent sx={{ py: 2, px: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {snackbar.severity === "error" && <FiXCircle size={20} />}
                  {snackbar.severity === "success" && <FiCheckCircle size={20} />}
                  {snackbar.severity === "info" && <FiAlertCircle size={20} />}
                  <Typography variant="body2" fontWeight={500}>
                    {snackbar.message}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Snackbar>
        </Container>
      </Fade>
    </LocalizationProvider>
  );
};

export default EmppAttendence;