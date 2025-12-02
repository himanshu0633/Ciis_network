import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Popover,
  Modal,
  Stack,
  useMediaQuery,
  Card,
  CardContent,
  InputAdornment,
  Button,
  Avatar,
  LinearProgress,
  Fade,
  Tooltip,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Drawer,
  useTheme,
  alpha,
} from "@mui/material";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiTrendingUp,
  FiDownload,
  FiEye,
  FiChevronRight,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiMinusCircle,
  FiX,
  FiBarChart2,
  FiRefreshCw,
  FiMenu,
  FiGrid,
} from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "../../utils/axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { styled } from "@mui/material/styles";

// Enhanced Glass Morphism Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.95)} 0%, 
    ${alpha(theme.palette.common.white, 0.85)} 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 15px 35px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    borderRadius: "16px",
  },
  "&:hover": {
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
    transform: "translateY(-5px)",
  },
}));

const StatCard = styled(GlassCard)(({ theme, active }) => ({
  position: "relative",
  overflow: "hidden",
  height: "100%",
  cursor: "pointer",
  background: active
    ? `linear-gradient(135deg, ${alpha(
        theme.palette.primary.main,
        0.1
      )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
    : `linear-gradient(135deg, ${alpha(
        theme.palette.common.white,
        0.95
      )} 0%, ${alpha(theme.palette.common.white, 0.85)} 100%)`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: active
      ? `linear-gradient(90deg, 
      ${theme.palette.primary.main} 0%, 
      ${theme.palette.secondary.main} 100%)`
      : "transparent",
    [theme.breakpoints.down("sm")]: {
      height: "3px",
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  position: "relative",
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.9)} 0%, 
    ${alpha(theme.palette.common.white, 0.8)} 100%)`,
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "70%",
    borderRadius: "0 8px 8px 0",
    background:
      status === "PRESENT"
        ? `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
        : status === "ABSENT"
        ? `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
        : status === "HALF DAY"
        ? `linear-gradient(180deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
        : `linear-gradient(180deg, ${theme.palette.grey[400]} 0%, ${theme.palette.grey[600]} 100%)`,
    [theme.breakpoints.down("md")]: {
      width: "3px",
    },
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: "translateX(8px)",
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: "0.75rem",
  borderRadius: "12px",
  padding: "4px 12px",
  height: "32px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.7rem",
    height: "28px",
    padding: "2px 10px",
  },
  ...(status === "PRESENT" && {
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.success.main,
      0.2
    )} 0%, ${alpha(theme.palette.success.main, 0.3)} 100%)`,
    color: theme.palette.success.dark,
    border: `2px solid ${alpha(theme.palette.success.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.2)}`,
  }),
  ...(status === "ABSENT" && {
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.error.main,
      0.2
    )} 0%, ${alpha(theme.palette.error.main, 0.3)} 100%)`,
    color: theme.palette.error.dark,
    border: `2px solid ${alpha(theme.palette.error.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.2)}`,
  }),
  ...(status === "HALF DAY" && {
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.warning.main,
      0.2
    )} 0%, ${alpha(theme.palette.warning.main, 0.3)} 100%)`,
    color: theme.palette.warning.dark,
    border: `2px solid ${alpha(theme.palette.warning.main, 0.4)}`,
    boxShadow: `0 4px 15px ${alpha(theme.palette.warning.main, 0.2)}`,
  }),
}));

const MobileRecordCard = styled(GlassCard)(({ theme, status }) => ({
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "5px",
    height: "80%",
    borderRadius: "0 8px 8px 0",
    background:
      status === "PRESENT"
        ? `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
        : status === "ABSENT"
        ? `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
        : status === "HALF DAY"
        ? `linear-gradient(180deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
        : `linear-gradient(180deg, ${theme.palette.grey[400]} 0%, ${theme.palette.grey[600]} 100%)`,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.common.white, 0.9)} 0%, 
      ${alpha(theme.palette.common.white, 0.8)} 100%)`,
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    [theme.breakpoints.down("sm")]: {
      borderRadius: "12px",
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderWidth: 2,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  fontWeight: 700,
  borderRadius: "16px",
  padding: "12px 24px",
  textTransform: "none",
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    padding: "10px 20px",
    fontSize: "0.9rem",
    borderRadius: "12px",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent, ${alpha(
      theme.palette.common.white,
      0.2
    )}, transparent)`,
    transition: "left 0.5s",
  },
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.6)}`,
    "&::before": {
      left: "100%",
    },
  },
  "&:disabled": {
    background: theme.palette.grey[400],
    transform: "none",
    boxShadow: "none",
  },
}));

const ResponsiveTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "20px",
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.common.white, 0.95)} 0%, 
    ${alpha(theme.palette.common.white, 0.85)} 100%)`,
  "& .MuiTableCell-root": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    [theme.breakpoints.down("lg")]: {
      padding: "16px 12px",
      fontSize: "0.9rem",
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 8px",
      fontSize: "0.85rem",
    },
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.05)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    fontWeight: 700,
    color: theme.palette.primary.dark,
    fontSize: "0.95rem",
  },
}));

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    total: 0,
    percentage: 0,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ✅ API se data fetch karna
  const fetchAttendance = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("📡 Fetching attendance data from API...");

      const response = await axios.get("/attendance/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ API Response:", response.data);

      let attendanceData = [];

      // ✅ Different response structures handle karna
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Aapke response structure ke hisaab: { message: "...", data: [...] }
        attendanceData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        attendanceData = response.data;
      } else if (response.data && Array.isArray(response.data.attendance)) {
        // Alternative structure
        attendanceData = response.data.attendance;
      } else {
        console.warn("⚠️ Unexpected response structure, using empty array");
        attendanceData = [];
      }

      console.log("📊 Processed attendance data:", attendanceData);

      if (attendanceData.length === 0) {
        console.log("📭 No attendance records found in response");
        toast.info("No attendance records found");
      }

      setAttendance(attendanceData);
      calculateStats(attendanceData);

      if (showRefresh) {
        toast.success("🔄 Attendance data refreshed!");
      }
    } catch (error) {
      console.error("❌ Error fetching attendance data:", error);

      let errorMessage = "Failed to load attendance records";
      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        console.error("❌ Server error response:", error.response.data);
      } else if (error.request) {
        // Network error
        errorMessage = "Network error - Please check your connection";
        console.error("❌ Network error:", error.request);
      } else {
        // Other errors
        errorMessage = error.message || "Unknown error occurred";
      }

      toast.error(`❌ ${errorMessage}`);

      // Fallback: Empty array set karna
      setAttendance([]);
      calculateStats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Stats calculate karna
  const calculateStats = (data) => {
    console.log("📈 Calculating stats for data:", data);

    const present = data.filter((record) => record.status === "PRESENT").length;
    const absent = data.filter((record) => record.status === "ABSENT").length;
    const halfDay = data.filter(
      (record) => record.status === "HALF DAY"
    ).length;
    const total = data.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    console.log("📊 Calculated stats:", {
      present,
      absent,
      halfDay,
      total,
      percentage,
    });

    setStats({
      present,
      absent,
      halfDay,
      total,
      percentage,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("❌ Error formatting date:", dateStr, error);
      return "Invalid Date";
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "--";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("❌ Error formatting time:", timeStr, error);
      return "Invalid Time";
    }
  };

  const getStatusIcon = (status) => {
    const iconSize = isSmallMobile ? 16 : 18;
    switch (status) {
      case "PRESENT":
        return <FiCheckCircle size={iconSize} />;
      case "ABSENT":
        return <FiMinusCircle size={iconSize} />;
      case "HALF DAY":
        return <FiAlertCircle size={iconSize} />;
      default:
        return <FiClock size={iconSize} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return theme.palette.success.main;
      case "ABSENT":
        return theme.palette.error.main;
      case "HALF DAY":
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const handleCalendarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = () => {
    setAnchorEl(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSearch(date ? formatDate(date) : "");
    handleCalendarClose();
  };

  const filteredData = attendance.filter((record) => {
    const matchesSearch =
      formatDate(record.date).toLowerCase().includes(search.toLowerCase()) ||
      (record.status &&
        record.status.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" || record.status === statusFilter;

    // Time range filtering
    const recordDate = new Date(record.date);
    const now = new Date();
    let matchesTimeRange = true;

    switch (timeRange) {
      case "TODAY":
        matchesTimeRange = recordDate.toDateString() === now.toDateString();
        break;
      case "WEEK":
        { const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesTimeRange = recordDate >= weekAgo;
        break; }
      case "MONTH":
        { const monthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        matchesTimeRange = recordDate >= monthAgo;
        break; }
      default:
        matchesTimeRange = true;
    }

    return matchesSearch && matchesStatus && matchesTimeRange;
  });

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      const headers = [
        "Date",
        "Login Time",
        "Logout Time",
        "Status",
        "Total Time",
        "Late By",
        "Early Leave",
      ];
      const csvData = filteredData.map((record) => [
        formatDate(record.date),
        formatTime(record.inTime),
        formatTime(record.outTime),
        record.status,
        record.totalTime || "00:00:00",
        record.lateBy || "00:00:00",
        record.earlyLeave || "00:00:00",
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("📊 CSV exported successfully!");
    } catch (error) {
      console.error("❌ Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMobileFilterOpen = () => {
    setMobileFilterOpen(true);
  };

  const handleMobileFilterClose = () => {
    setMobileFilterOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          px: 2,
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
          <LinearProgress
            sx={{
              height: 8,
              borderRadius: 4,
              mb: 3,
              background: alpha("#fff", 0.2),
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, #fff 0%, ${alpha(
                  "#fff",
                  0.7
                )} 100%)`,
                borderRadius: 4,
              },
            }}
          />
          <Typography
            variant={isSmallMobile ? "h6" : "h5"}
            color="white"
            fontWeight={700}
            sx={{ opacity: 0.9 }}
          >
            Loading your attendance records...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in={!loading} timeout={800}>
       <Box
  sx={{
    px: { xs: 2, sm: 3, md: 4, lg: 6 },
    py: { xs: 3, sm: 4 },
    pt: { xs: 6, sm: 8, md: 10 },  // ⭐ EXTRA TOP SPACE
    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
    minHeight: "100vh",
  }}
>
          <ToastContainer
            position={isMobile ? "top-center" : "top-right"}
            autoClose={4000}
            theme="light"
          />

          {/* Enhanced Header Section */}
          <GlassCard
            sx={{
              p: { xs: 3, sm: 4 },
              mb: { xs: 3, sm: 4 },
            }}
          >
         <Stack
  direction={{ xs: "column", md: "row" }}
  spacing={{ xs: 2, md: 3 }}
  alignItems={{ xs: "stretch", md: "center" }}
  justifyContent="space-between"
  sx={{
    width: "100%",
    py: { xs: 2, md: 0 },
    px: { xs: 2, md: 0 },
  }}
>
  {/* Header Text Section */}
  <Box 
    sx={{ 
      textAlign: { xs: "center", md: "left" },
      mb: { xs: 1, md: 0 }
    }}
  >
    <Typography
      variant="h4"
      fontWeight={800}
      sx={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        lineHeight: 1.2,
        mb: 1,
        fontSize: {
          xs: "1.8rem",   // mobile
          sm: "2.2rem",   // small tablet
          md: "2.5rem",   // desktop
          lg: "2.8rem"    // large desktop
        },
      }}
    >
      Attendance
    </Typography>

    <Typography
      variant="subtitle1"
      color="text.secondary"
      sx={{
        opacity: 0.8,
        fontWeight: 500,
        fontSize: {
          xs: "0.875rem",  // mobile
          sm: "0.95rem",   // tablet
          md: "1rem"       // desktop
        },
      }}
    >
      Track your attendance history and insights
    </Typography>
  </Box>

  {/* Action Buttons Section */}
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={{ xs: 1.5, sm: 1.5, md: 2 }}
    alignItems="center"
    justifyContent={{ xs: "center", md: "flex-end" }}
    sx={{
      width: { xs: "100%", md: "auto" },
      flexWrap: "wrap",
      gap: { xs: 1.5, sm: 2 },
    }}
  >
    {/* Search Field */}
    <TextField
      placeholder="Search attendance..."
      variant="outlined"
      size="small"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FiSearch 
              size={16} 
              color={theme.palette.primary.main} 
            />
          </InputAdornment>
        ),
        endAdornment: search && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setSearch("")}
              sx={{ p: 0.5 }}
            >
              <FiX size={14} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        width: { xs: "100%", sm: 200, md: 220 },
        '& .MuiOutlinedInput-root': {
          borderRadius: "30px",
          height: 40,
          fontSize: "0.875rem",
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900],
        },
        '& .MuiOutlinedInput-input': {
          padding: "8px 12px",
        },
      }}
    />

    {/* Calendar Button */}
    <IconButton
      onClick={handleCalendarClick}
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderRadius: "10px",
        p: 1,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
        },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <FiCalendar size={18} color={theme.palette.primary.main} />
    </IconButton>

    {/* Filter Button */}
    <IconButton
      onClick={isMobile ? handleMobileFilterOpen : handleFilterClick}
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderRadius: "10px",
        p: 1,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
        },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <FiFilter size={18} color={theme.palette.primary.main} />
    </IconButton>

    {/* Refresh Button */}
    <IconButton
      onClick={() => fetchAttendance(true)}
      disabled={refreshing}
      sx={{
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderRadius: "10px",
        p: 1,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
        },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        '&:disabled': {
          opacity: 0.5,
        },
      }}
    >
      <FiRefreshCw
        size={18}
        className={refreshing ? "spin" : ""}
        color={theme.palette.primary.main}
      />
    </IconButton>

    {/* Export Button */}
    <Button
      variant="contained"
      startIcon={<FiDownload size={16} />}
      onClick={exportToCSV}
      disabled={filteredData.length === 0}
      sx={{
        minWidth: { xs: "100%", sm: 120 },
        py: 1,
        px: 3,
        borderRadius: "10px",
        fontSize: "0.875rem",
        fontWeight: 600,
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)`,
        },
        '&:disabled': {
          background: theme.palette.grey[400],
        },
      }}
    >
      Export CSV
    </Button>
  </Stack>
</Stack>
<style>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`}</style>

            {/* Time Range Tabs */}
            <Box
              sx={{
                mt: { xs: 3, sm: 4 },
                maxWidth: "100%",
                overflow: "auto",
              }}
            >
              <Tabs
                value={timeRange}
                onChange={(e, newValue) => setTimeRange(newValue)}
                variant={isSmallMobile ? "scrollable" : "standard"}
                scrollButtons={isSmallMobile ? "auto" : false}
                sx={{
                  minHeight: "48px",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "12px",
                    minHeight: "40px",
                    minWidth: "auto",
                    px: { xs: 2, sm: 3 },
                    mx: 0.5,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    transition: "all 0.3s ease",
                    "&.Mui-selected": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: "white",
                      boxShadow: `0 6px 20px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    },
                  },
                }}
              >
                <Tab label="All Time" value="ALL" />
                <Tab label="Today" value="TODAY" />
                <Tab label="This Week" value="WEEK" />
                <Tab label="This Month" value="MONTH" />
              </Tabs>
            </Box>

            {/* Calendar Popover */}
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleCalendarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              <GlassCard sx={{ p: 3 }}>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateSelect}
                  renderInput={(params) => (
                    <TextField {...params} size="small" />
                  )}
                />
              </GlassCard>
            </Popover>

            {/* Filter Menu */}
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              PaperProps={{
                sx: {
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.common.white,
                    0.98
                  )} 0%, ${alpha(theme.palette.common.white, 0.92)} 100%)`,
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  boxShadow: `0 15px 35px ${alpha(
                    theme.palette.common.black,
                    0.1
                  )}`,
                  mt: 1,
                },
              }}
            >
              {["ALL", "PRESENT", "ABSENT", "HALF DAY"].map((status) => (
                <MenuItem
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    handleFilterClose();
                  }}
                  sx={{
                    fontWeight: 600,
                    borderRadius: "8px",
                    m: 0.5,
                    background:
                      statusFilter === status
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "transparent",
                  }}
                >
                  {status === "ALL" ? "All Status" : `${status} Only`}
                </MenuItem>
              ))}
            </Menu>
          </GlassCard>

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="right"
            open={mobileFilterOpen}
            onClose={handleMobileFilterClose}
            sx={{
              "& .MuiDrawer-paper": {
                width: { xs: 300, sm: 350 },
                p: 3,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.common.white,
                  0.98
                )} 0%, ${alpha(theme.palette.common.white, 0.92)} 100%)`,
                backdropFilter: "blur(20px)",
              },
            }}
          >
            <Stack spacing={3}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  Filters
                </Typography>
                <IconButton
                  onClick={handleMobileFilterClose}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    borderRadius: "12px",
                  }}
                >
                  <FiX size={20} color={theme.palette.primary.main} />
                </IconButton>
              </Stack>

              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  color="primary.main"
                >
                  Status Filter
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant={statusFilter === "ALL" ? "contained" : "outlined"}
                    onClick={() => {
                      setStatusFilter("ALL");
                      handleMobileFilterClose();
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: "12px",
                      py: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    All Status
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      statusFilter === "PRESENT" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setStatusFilter("PRESENT");
                      handleMobileFilterClose();
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: "12px",
                      py: 1.5,
                      fontWeight: 700,
                    }}
                    startIcon={<FiCheckCircle />}
                  >
                    Present
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      statusFilter === "ABSENT" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setStatusFilter("ABSENT");
                      handleMobileFilterClose();
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: "12px",
                      py: 1.5,
                      fontWeight: 700,
                    }}
                    startIcon={<FiMinusCircle />}
                  >
                    Absent
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      statusFilter === "HALF DAY" ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setStatusFilter("HALF DAY");
                      handleMobileFilterClose();
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: "12px",
                      py: 1.5,
                      fontWeight: 700,
                    }}
                    startIcon={<FiAlertCircle />}
                  >
                    Half Day
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Drawer>

          {/* Enhanced Stat Cards Grid */}
       <Grid
  container
  spacing={{ xs: 1.5, sm: 2, md: 3 }}
  sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
>
  {[
    {
      key: "present",
      label: "Present Days",
      value: stats.present,
      icon: FiCheckCircle,
      color: "success",
      extra: `${stats.percentage}%`,
    },
    {
      key: "absent",
      label: "Absent Days",
      value: stats.absent,
      icon: FiMinusCircle,
      color: "error",
    },
    {
      key: "halfDay",
      label: "Half Days",
      value: stats.halfDay,
      icon: FiAlertCircle,
      color: "warning",
    },
    {
      key: "total",
      label: "Total Records",
      value: stats.total,
      icon: FiBarChart2,
      color: "info",
    },
  ].map((stat) => (
    <Grid item xs={6} sm={6} md={3} key={stat.key}>
      <StatCard
        active={statusFilter === stat.key.toUpperCase()}
        onClick={() =>
          setStatusFilter(
            statusFilter === stat.key.toUpperCase()
              ? "ALL"
              : stat.key.toUpperCase()
          )
        }
        sx={{ borderRadius: "14px" }} // slightly smaller card
      >
        <CardContent sx={{ p: { xs: 1.8, sm: 2.2 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.5, sm: 2 }}
          >
            <Avatar
              sx={{
                bgcolor: `${theme.palette[stat.color].main}15`,
                color: theme.palette[stat.color].main,
                borderRadius: "14px",
                width: { xs: 40, sm: 48 },   // smaller avatar
                height: { xs: 40, sm: 48 },
                boxShadow: `0 4px 15px ${alpha(
                  theme.palette[stat.color].main,
                  0.25
                )}`,
              }}
            >
              <stat.icon size={isSmallMobile ? 18 : 20} /> {/* smaller icon */}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.8rem" }, // smaller label
                }}
              >
                {stat.label}
              </Typography>

              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography
                  fontWeight={900}
                  sx={{
                    lineHeight: 1,
                    fontSize: { xs: "1.4rem", sm: "1.6rem" }, // reduced number size
                  }}
                >
                  {stat.value}
                </Typography>

                {stat.extra && (
                  <Typography
                    color={`${stat.color}.main`}
                    fontWeight={800}
                    sx={{
                      ml: 0.5,
                      fontSize: "0.9rem", // smaller percentage
                    }}
                  >
                    {stat.extra}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </StatCard>
    </Grid>
  ))}
</Grid>

          {/* Active Filters Display */}
          {(statusFilter !== "ALL" || timeRange !== "ALL") && (
            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="black"
                  sx={{ mr: 2 }}
                >
                  Active filters:
                </Typography>
                {statusFilter !== "ALL" && (
                  <Chip
                    label={`Status: ${statusFilter}`}
                    color="black"
                    size="medium"
                    onDelete={() => setStatusFilter("ALL")}
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                      border: `2px solid ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                    }}
                  />
                )}
                {timeRange !== "ALL" && (
                  <Chip
                    label={`Time: ${timeRange}`}
                    color="secondary"
                    size="medium"
                    onDelete={() => setTimeRange("ALL")}
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.secondary.main,
                        0.2
                      )} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                      border: `2px solid ${alpha(
                        theme.palette.secondary.main,
                        0.3
                      )}`,
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Results Count */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              color="black"
              fontWeight={700}
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              Showing {filteredData.length} of {attendance.length} records
            </Typography>
          </Box>

          {/* Enhanced Responsive Table for Desktop/Tablet */}
          {!isMobile && (
            <GlassCard>
              <CardContent sx={{ p: 0 }}>
                <ResponsiveTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        ></TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        >
                          Login
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        >
                          Logout
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        >
                          Total Time
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: {
                              xs: "0.9rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            py: { xs: 2, sm: 2.5 },
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((record) => (
                          <StyledTableRow
                            key={record._id}
                            status={record.status}
                            onClick={() => openDetailsModal(record)}
                          >
                            <TableCell>
                              <Typography
                                variant="body1"
                                fontWeight={700}
                                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                              >
                                {formatDate(record.date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <FiClock
                                  color={theme.palette.primary.main}
                                  size={18}
                                />
                                <Typography variant="body1" fontWeight={600}>
                                  {formatTime(record.inTime)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <FiClock
                                  color={theme.palette.primary.main}
                                  size={18}
                                />
                                <Typography variant="body1" fontWeight={600}>
                                  {formatTime(record.outTime)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <StatusChip
                                label={record.status}
                                status={record.status}
                                size="medium"
                                icon={getStatusIcon(record.status)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body1"
                                fontWeight={800}
                                color="primary.main"
                                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                              >
                                {record.totalTime || "00:00:00"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="medium"
                                  sx={{
                                    background: `linear-gradient(135deg, ${alpha(
                                      theme.palette.primary.main,
                                      0.1
                                    )} 0%, ${alpha(
                                      theme.palette.secondary.main,
                                      0.1
                                    )} 100%)`,
                                    borderRadius: "12px",
                                    p: 1.5,
                                    "&:hover": {
                                      background: `linear-gradient(135deg, ${alpha(
                                        theme.palette.primary.main,
                                        0.2
                                      )} 0%, ${alpha(
                                        theme.palette.secondary.main,
                                        0.2
                                      )} 100%)`,
                                      transform: "scale(1.1)",
                                    },
                                  }}
                                >
                                  <FiEye
                                    size={18}
                                    color={theme.palette.primary.main}
                                  />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </StyledTableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <FiUser
                              size={60}
                              color={theme.palette.primary.main}
                              style={{ opacity: 0.5 }}
                            />
                            <Typography
                              variant={isSmallMobile ? "h5" : "h4"}
                              color="primary.main"
                              fontWeight={800}
                              sx={{ mt: 3, opacity: 0.7 }}
                            >
                              No attendance records found
                            </Typography>
                            <Typography
                              variant="h6"
                              color="text.secondary"
                              sx={{ mt: 1.5, opacity: 0.5, fontWeight: 600 }}
                            >
                              Try adjusting your filters or search terms
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ResponsiveTableContainer>
              </CardContent>
            </GlassCard>
          )}

          {/* Enhanced Mobile Cards */}
          {isMobile && (
            <Stack spacing={2}>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <MobileRecordCard
                    key={record._id}
                    status={record.status}
                    onClick={() => openDetailsModal(record)}
                  >
                    <CardContent sx={{ p: { xs: 3, sm: 3.5 } }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={800}
                            gutterBottom
                            sx={{
                              fontSize: { xs: "1.1rem", sm: "1.3rem" },
                              lineHeight: 1.3,
                            }}
                          >
                            {formatDate(record.date)}
                          </Typography>
                          <Stack spacing={1.5}>
                            <Stack
                              direction={isSmallMobile ? "column" : "row"}
                              spacing={isSmallMobile ? 1 : 4}
                              alignItems={
                                isSmallMobile ? "flex-start" : "center"
                              }
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  minWidth: isSmallMobile ? "auto" : 120,
                                }}
                              >
                                <FiClock
                                  size={16}
                                  color={theme.palette.primary.main}
                                />
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                  }}
                                >
                                  In: {formatTime(record.inTime)}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  minWidth: isSmallMobile ? "auto" : 120,
                                }}
                              >
                                <FiClock
                                  size={16}
                                  color={theme.palette.primary.main}
                                />
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                  }}
                                >
                                  Out: {formatTime(record.outTime)}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <StatusChip
                                label={record.status}
                                status={record.status}
                                size="medium"
                              />
                              <Typography
                                variant="h6"
                                fontWeight={800}
                                color="primary.main"
                                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                              >
                                {record.totalTime || "00:00:00"}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                        <FiChevronRight
                          color={theme.palette.primary.main}
                          size={isSmallMobile ? 20 : 24}
                          style={{ marginTop: 4 }}
                        />
                      </Stack>
                    </CardContent>
                  </MobileRecordCard>
                ))
              ) : (
                <GlassCard sx={{ textAlign: "center", py: 8 }}>
                  <FiUser
                    size={60}
                    color={theme.palette.primary.main}
                    style={{ opacity: 0.5 }}
                  />
                  <Typography
                    variant={isSmallMobile ? "h5" : "h4"}
                    color="primary.main"
                    fontWeight={800}
                    sx={{ mt: 3, opacity: 0.7 }}
                  >
                    No records found
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mt: 1.5, opacity: 0.5, fontWeight: 600 }}
                  >
                    Adjust your search or filters
                  </Typography>
                </GlassCard>
              )}
            </Stack>
          )}

          {/* Enhanced Responsive Modal */}
          <Modal
            open={openModal}
            onClose={closeModal}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Fade in={openModal}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: { xs: "95%", sm: 500, md: 550 },
                  maxHeight: "90vh",
                  overflow: "auto",
                  background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.common.white, 0.98)} 0%, 
                  ${alpha(theme.palette.common.white, 0.92)} 100%)`,
                  borderRadius: "24px",
                  boxShadow: `0 32px 64px ${alpha(
                    theme.palette.common.black,
                    0.3
                  )}`,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  backdropFilter: "blur(20px)",
                }}
              >
                {selectedRecord && (
                  <>
                    <Box
                      sx={{
                        p: { xs: 3, sm: 4 },
                        background: `linear-gradient(135deg, ${getStatusColor(
                          selectedRecord.status
                        )} 0%, ${theme.palette.primary.main} 100%)`,
                        color: "white",
                        textAlign: "center",
                        borderRadius: "24px 24px 0 0",
                      }}
                    >
                      <Typography
                        variant={isSmallMobile ? "h4" : "h3"}
                        fontWeight={900}
                      >
                        Attendance Details
                      </Typography>
                      <Typography
                        variant={isSmallMobile ? "h6" : "h5"}
                        sx={{ opacity: 0.9, mt: 1, fontWeight: 700 }}
                      >
                        {formatDate(selectedRecord.date)}
                      </Typography>
                    </Box>

                    <Box sx={{ p: { xs: 3, sm: 4 } }}>
                      <Stack spacing={3}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={800}
                            color="primary.main"
                          >
                            Status
                          </Typography>
                          <StatusChip
                            label={selectedRecord.status}
                            status={selectedRecord.status}
                            size="large"
                          />
                        </Stack>
                        <Divider
                          sx={{
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          }}
                        />
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={800}
                            color="primary.main"
                          >
                            Login Time
                          </Typography>
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={700}
                          >
                            {formatTime(selectedRecord.inTime)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={800}
                            color="primary.main"
                          >
                            Logout Time
                          </Typography>
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={700}
                          >
                            {formatTime(selectedRecord.outTime)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant={isSmallMobile ? "h6" : "h5"}
                            fontWeight={800}
                            color="primary.main"
                          >
                            Total Duration
                          </Typography>
                          <Typography
                            variant={isSmallMobile ? "h5" : "h4"}
                            fontWeight={900}
                            color="primary.main"
                          >
                            {selectedRecord.totalTime || "00:00:00"}
                          </Typography>
                        </Stack>
                        <GradientButton
                          onClick={closeModal}
                          sx={{ mt: 2, py: 2 }}
                        >
                          Close Details
                        </GradientButton>
                      </Stack>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>

          {/* Custom CSS for spinning animation */}
          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .spin {
              animation: spin 1s linear infinite;
            }
          `}</style>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default Attendance;
