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
} from "@mui/material";
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import format from "date-fns/format";
import EmployeeTypeFilter from "../../Filter/EmployeeTypeFilter";
import { styled } from "@mui/material/styles";

// Styled Components
const StatCard = styled(Card)(({ theme, color = "primary", active }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  borderLeft: `4px solid ${theme.palette[color].main}`,
  transition: "all 0.3s ease",
  cursor: "pointer",
  transform: active ? "scale(1.05)" : "scale(1)",
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "scale(1.05)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === "present" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(status === "halfday" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(status === "absent" && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === "full-time" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(type === "part-time" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(type === "contract" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === "intern" && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  ...(status === "present" && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(status === "halfday" && {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(status === "absent" && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
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
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "50vh" }}>
        <LinearProgress sx={{ width: "60%" }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header + Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={800}>
                Attendance Management
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                />
                <EmployeeTypeFilter
                  selected={selectedEmployeeType}
                  onChange={setSelectedEmployeeType}
                />
                <TextField
                  fullWidth
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiUsers size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button variant="outlined" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: "Total", count: stats.total, color: "primary", value: "all", icon: <FiUsers /> },
              { label: "Present", count: stats.present, color: "success", value: "present", icon: <FiCheckCircle /> },
              { label: "Absent", count: stats.absent, color: "error", value: "absent", icon: <FiXCircle /> },
              { label: "Half Day", count: stats.halfDay, color: "warning", value: "halfday", icon: <FiAlertCircle /> },
              { label: "On Time", count: stats.onTime, color: "info", value: "ontime", icon: <FiClock /> },
              { label: "Late Arrivals", count: stats.late, color: "secondary", value: "late", icon: <FiTrendingUp /> },
            ].map((stat) => (
              <Grid item xs={6} md={2} key={stat.label}>
                <StatCard
                  color={stat.color}
                  active={statusFilter === stat.value}
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev === stat.value ? "all" : stat.value
                    )
                  }
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: `${theme.palette[stat.color].main}20`,
                          color: theme.palette[stat.color].main,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {stat.count}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          {/* Attendance Table */}
          <Paper sx={{ borderRadius: 4, boxShadow: theme.shadows[2] }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main + "10" }}>
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Total Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length ? (
                    filteredRecords.map((rec) => (
                      <StyledTableRow key={rec._id} status={rec.status}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar>{getInitials(rec.user?.name)}</Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {rec.user?.name || "N/A"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rec.user?.email || "N/A"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <EmployeeTypeChip
                            label={rec.user?.employeeType?.toUpperCase() || "N/A"}
                            type={rec.user?.employeeType?.toLowerCase()}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(rec.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{formatTime(rec.inTime)}</TableCell>
                        <TableCell>{formatTime(rec.outTime)}</TableCell>
                        <TableCell>{rec.totalTime || "00:00:00"}</TableCell>
                        <TableCell>
                          <StatusChip
                            label={
                              rec.status.charAt(0).toUpperCase() + rec.status.slice(1)
                            }
                            status={rec.status}
                          />
                        </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <FiCalendar size={40} />
                        <Typography variant="h6">No Records Found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Card
              sx={{
                background:
                  snackbar.severity === "error"
                    ? theme.palette.error.main
                    : theme.palette.success.main,
                color: "#fff",
              }}
            >
              <CardContent>
                <Typography>{snackbar.message}</Typography>
              </CardContent>
            </Card>
          </Snackbar>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default EmppAttendence;
