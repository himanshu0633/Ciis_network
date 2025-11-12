import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Fade,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  FiPackage,
  FiSmartphone,
  FiHeadphones,
  FiCpu,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPlus,
  FiSearch,
  FiSettings,
  FiMonitor,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "../../utils/axiosConfig";
import { styled, keyframes } from "@mui/material/styles";

/* --------------------------------
  🔹 ANIMATIONS
---------------------------------*/
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* --------------------------------
  🔹 STYLED COMPONENTS
---------------------------------*/
const StatCard = styled(Card)(({ theme, color = "primary" }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
  position: "relative",
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  },
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: "0.75rem",
  height: 28,
  borderRadius: 14,
  ...(status === "approved" && {
    background: `${theme.palette.success.main}`,
    color: "white",
  }),
  ...(status === "pending" && {
    background: `${theme.palette.warning.main}`,
    color: "white",
  }),
  ...(status === "rejected" && {
    background: `${theme.palette.error.main}`,
    color: "white",
  }),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: "white",
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: "translateY(-2px)",
  },
}));

const PropertyItem = styled(ListItem)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    transform: "translateX(5px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
}));

/* --------------------------------
  🔹 COMPONENT START
---------------------------------*/
const MyAssets = () => {
  const [newAsset, setNewAsset] = useState("");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const token = localStorage.getItem("token");

  const allowedAssets = [
    { value: "phone", label: "Smartphone", icon: FiSmartphone },
    { value: "sim", label: "SIM Card", icon: FiCpu },
    { value: "laptop", label: "Laptop", icon: FiMonitor },
    { value: "desktop", label: "Desktop", icon: FiSettings },
    { value: "headphone", label: "Headphones", icon: FiHeadphones },
  ];

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/assets/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.requests || [];
      setRequests(data);
      calculateStats(data);
    } catch (err) {
      setNotification({
        message: "Failed to fetch requests",
        severity: "error",
      });
    }
  };

  const calculateStats = (data) => {
    const approved = data.filter((r) => r.status === "approved").length;
    const pending = data.filter((r) => r.status === "pending").length;
    const rejected = data.filter((r) => r.status === "rejected").length;
    setStats({
      total: data.length,
      approved,
      pending,
      rejected,
    });
  };

  useEffect(() => {
    fetchRequests();
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setProperties(JSON.parse(userData).properties || []);
      } catch {}
    }
  }, []);

  const handleRequest = async () => {
    if (!newAsset) {
      setNotification({ message: "Please select an asset.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "/assets/request",
        { assetName: newAsset },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification({ message: "Request submitted successfully!", severity: "success" });
      setNewAsset("");
      fetchRequests();
    } catch {
      setNotification({ message: "Request failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  /* --------------------------------
    🔹 RENDER UI
  ---------------------------------*/
  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
            gutterBottom
          >
            Asset Management
          </Typography>
          <Typography color="text.secondary">
            Manage and request assets with real-time status tracking.
          </Typography>
        </Paper>

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { key: "total", label: "Total Requests", color: "primary" },
            { key: "approved", label: "Approved", color: "success" },
            { key: "pending", label: "Pending", color: "warning" },
            { key: "rejected", label: "Rejected", color: "error" },
          ].map((stat) => (
            <Grid item xs={6} md={3} key={stat.key}>
              <StatCard
                color={stat.color}
                onClick={() =>
                  setFilterStatus(
                    stat.key === "total" ? "all" : stat.key
                  )
                }
                sx={{
                  border:
                    filterStatus === stat.key ||
                    (filterStatus === "all" && stat.key === "total")
                      ? `2px solid ${theme.palette[stat.color].main}`
                      : "1px solid transparent",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stats[stat.key]}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: `${theme.palette[stat.color].main}15`,
                        color: theme.palette[stat.color].main,
                      }}
                    >
                      {stat.key === "approved" ? (
                        <FiCheckCircle />
                      ) : stat.key === "pending" ? (
                        <FiClock />
                      ) : stat.key === "rejected" ? (
                        <FiXCircle />
                      ) : (
                        <FiPackage />
                      )}
                    </Avatar>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Request + Properties */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Request Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Request New Asset
              </Typography>
              <Select
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
                fullWidth
                displayEmpty
                sx={{ borderRadius: 3, mb: 2 }}
              >
                <MenuItem disabled value="">
                  Select asset type...
                </MenuItem>
                {allowedAssets.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <a.icon />
                      <Typography>{a.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <GradientButton
                onClick={handleRequest}
                disabled={!newAsset || loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <FiPlus />
                  )
                }
                fullWidth
              >
                {loading ? "Submitting..." : "Request Asset"}
              </GradientButton>
            </Card>
          </Grid>

          {/* Assigned Properties */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Assigned Properties
              </Typography>
              {properties.length ? (
                <List dense>
                  {properties.map((item, idx) => (
                    <PropertyItem key={idx}>
                      <ListItemText
                        primary={<Typography fontWeight={600}>{item}</Typography>}
                        secondary="Company-assigned asset"
                      />
                    </PropertyItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No properties assigned yet.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Requests Table */}
        <Card sx={{ borderRadius: 4, p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6" fontWeight={700}>
              Asset Requests
            </Typography>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {!isMobile ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approved By</TableCell>
                    <TableCell>Requested At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length ? (
                    filteredRequests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>{req.assetName}</TableCell>
                        <TableCell>
                          <StatusChip label={req.status} status={req.status} />
                        </TableCell>
                        <TableCell>
                          {req.approvedBy
                            ? `${req.approvedBy.name} (${req.approvedBy.role})`
                            : req.status === "pending"
                            ? "Pending"
                            : "--"}
                        </TableCell>
                        <TableCell>{formatDate(req.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">
                          No requests found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Stack spacing={2}>
              {filteredRequests.length ? (
                filteredRequests.map((req) => (
                  <Card key={req._id} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {req.assetName}
                    </Typography>
                    <Typography variant="body2">
                      Status: {req.status}
                    </Typography>
                    <Typography variant="body2">
                      Approved By:{" "}
                      {req.approvedBy
                        ? `${req.approvedBy.name} (${req.approvedBy.role})`
                        : req.status === "pending"
                        ? "Pending"
                        : "--"}
                    </Typography>
                    <Typography variant="body2">
                      Requested: {formatDate(req.createdAt)}
                    </Typography>
                  </Card>
                ))
              ) : (
                <Typography align="center" color="text.secondary">
                  No requests found
                </Typography>
              )}
            </Stack>
          )}
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Card
            sx={{
              background:
                notification?.severity === "error"
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              color: "white",
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                {notification?.severity === "error" ? (
                  <FiXCircle />
                ) : (
                  <FiCheckCircle />
                )}
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {notification?.severity === "error" ? "Error" : "Success"}
                  </Typography>
                  <Typography variant="body2">
                    {notification?.message}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default MyAssets;
