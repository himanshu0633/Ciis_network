import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../utils/axiosConfig";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Avatar,
  Stack, Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Divider, Fade, LinearProgress,
  useTheme, useMediaQuery, Paper, Tooltip, Dialog,
  DialogTitle, DialogContent, IconButton, TextField,
  DialogActions, Badge, Modal, List, ListItem, ListItemText,
  ListItemAvatar, InputAdornment
} from "@mui/material";
import {
  FiUsers, FiUser, FiCalendar, FiCheckCircle, FiClock,
  FiAlertCircle, FiXCircle, FiTrendingUp, FiList, 
  FiArrowRight, FiX, FiBarChart2, FiPieChart, FiSearch, 
  FiMail, FiBriefcase, FiMessageSquare, FiPlus, FiImage,
  FiCamera, FiZoomIn, FiSend, FiTrash2
} from "react-icons/fi";
import { styled } from "@mui/material/styles";

// ---------------- Styled Components ---------------- //
const UserCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: "pointer",
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.standard,
  }),
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  background: selected
    ? `${theme.palette.primary.main}08`
    : theme.palette.background.paper,
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-2px)",
    borderColor: theme.palette.primary.main,
  },
}));

const TaskCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.primary.main,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === "approved" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
  ...(status === "rejected" && {
    background: `${theme.palette.error.main}20`,
    color: theme.palette.error.dark,
  }),
  ...(status === "pending" && {
    background: `${theme.palette.warning.main}20`,
    color: theme.palette.warning.dark,
  }),
  ...(status === "in-progress" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(status === "completed" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
}));

const EmployeeTypeChip = styled(Chip)(({ theme, type }) => ({
  fontWeight: 500,
  ...(type === "intern" && {
    background: `${theme.palette.info.main}20`,
    color: theme.palette.info.dark,
  }),
  ...(type === "technical" && {
    background: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.dark,
  }),
  ...(type === "non-technical" && {
    background: `${theme.palette.secondary.main}20`,
    color: theme.palette.secondary.dark,
  }),
  ...(type === "sales" && {
    background: `${theme.palette.success.main}20`,
    color: theme.palette.success.dark,
  }),
}));

const GraphBar = styled(Box)(({ theme, height, color }) => ({
  width: '100%',
  height: `${height}%`,
  backgroundColor: color,
  borderRadius: '4px 4px 0 0',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  minHeight: '20px',
  position: 'relative',
}));

const ImageUploadArea = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: isDragActive ? `${theme.palette.primary.main}08` : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}04`,
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[2],
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: theme.palette.error.main,
  color: 'white',
  width: 20,
  height: 20,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

const ZoomModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

// ✅ EMPLOYEE_TYPES CONSTANT
const EMPLOYEE_TYPES = [
  { value: "all", label: "All Employees", icon: FiUsers },
  { value: "intern", label: "Intern", icon: FiUser },
  { value: "technical", label: "Technical", icon: FiTrendingUp },
  { value: "non-technical", label: "Non-Technical", icon: FiUsers },
  { value: "sales", label: "Sales", icon: FiUser },
];

const TaskDetails = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  
  // Remark States
  const [openRemarksDialog, setOpenRemarksDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState('');
  const [remarkImages, setRemarkImages] = useState([]);
  const [isUploadingRemark, setIsUploadingRemark] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: { count: 0, percentage: 0 },
    inProgress: { count: 0, percentage: 0 },
    completed: { count: 0, percentage: 0 },
    approved: { count: 0, percentage: 0 },
    rejected: { count: 0, percentage: 0 },
    overdue: { count: 0, percentage: 0 }
  });
  
  const [timeFilter, setTimeFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [graphLoading, setGraphLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ✅ Role from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const role = (
          parsedUser?.role ||
          parsedUser?.user?.role ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();
        setCurrentUserRole(role);
      } catch {
        setCurrentUserRole("");
      }
    }
  }, []);

  const canManage = useMemo(
    () => ["admin", "manager", "hr", "SuperAdmin"].includes(currentUserRole),
    [currentUserRole]
  );

  // ✅ Fetch all users with task counts - NEW API
  useEffect(() => {
    const fetchUsersWithTasks = async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get(`/task/admin/users-with-tasks?employeeType=${selectedEmployeeType}`);
        console.log("Users with tasks API Response:", res.data);
        
        if (res.data.success) {
          setUsers(res.data.users || []);
        }
      } catch (err) {
        console.error("Error fetching users with tasks:", err);
        setError(
          err?.response?.data?.error ||
            "Error fetching users. Please try again."
        );
      } finally {
        setUsersLoading(false);
      }
    };
    
    if (canManage) {
      fetchUsersWithTasks();
    }
  }, [canManage, selectedEmployeeType]);

  // ✅ Fetch Task Status Counts for Graph - NEW WORKING API
  const fetchTaskStatusCounts = async (userId, period = 'today') => {
    try {
      setGraphLoading(true);
      const response = await axios.get(`/task/user/${userId}/stats?period=${period}`);
      
      if (response.data.success) {
        setTaskStats(response.data.statusCounts);
      }
    } catch (err) {
      console.error('❌ Error fetching task status counts:', err);
      // Fallback to calculate from tasks
      calculateStatsFromTasks();
    } finally {
      setGraphLoading(false);
    }
  };

  // ✅ Calculate stats from tasks data
  const calculateStatsFromTasks = () => {
    if (tasks.length === 0) return;
    
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      approved: 0,
      rejected: 0,
      overdue: 0
    };

    tasks.forEach(task => {
      const status = task.userStatus || task.status || task.overallStatus;
      if (status && statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const total = tasks.length;
    setTaskStats({
      total,
      pending: { count: statusCounts.pending, percentage: Math.round((statusCounts.pending / total) * 100) },
      inProgress: { count: statusCounts['in-progress'], percentage: Math.round((statusCounts['in-progress'] / total) * 100) },
      completed: { count: statusCounts.completed, percentage: Math.round((statusCounts.completed / total) * 100) },
      approved: { count: statusCounts.approved, percentage: Math.round((statusCounts.approved / total) * 100) },
      rejected: { count: statusCounts.rejected, percentage: Math.round((statusCounts.rejected / total) * 100) },
      overdue: { count: statusCounts.overdue, percentage: Math.round((statusCounts.overdue / total) * 100) }
    });
  };

  // ✅ Handle Time Filter Change
  const handleTimeFilterChange = (period) => {
    setTimeFilter(period);
    if (selectedUserId) {
      fetchTaskStatusCounts(selectedUserId, period);
      fetchUserTasks(selectedUserId, period, statusFilter, searchQuery);
    }
  };

  // ✅ Handle Status Filter Change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (selectedUserId) {
      fetchUserTasks(selectedUserId, timeFilter, status, searchQuery);
    }
  };

  // ✅ Handle Search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (selectedUserId) {
      fetchUserTasks(selectedUserId, timeFilter, statusFilter, query);
    }
  };

  // ✅ Fetch user tasks - NEW WORKING API
  const fetchUserTasks = async (userId, period = 'today', status = 'all', search = '') => {
    setLoading(true);
    setError("");
    try {
      const user = users.find((x) => x._id === userId);
      setSelectedUser(user);
      setSelectedUserId(userId);

      // Fetch tasks using new API
      const params = new URLSearchParams();
      if (period !== 'all') params.append('period', period);
      if (status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      const res = await axios.get(`/task/user/${userId}/tasks?${params.toString()}`);
      console.log("User tasks response:", res.data);

      if (res.data.success) {
        setTasks(res.data.tasks || []);
        
        // Fetch statistics
        await fetchTaskStatusCounts(userId, period);
        
        setOpenDialog(true);
      } else {
        setError("Failed to fetch user tasks");
      }
      
    } catch (err) {
      console.error("Error fetching user tasks:", err);
      setError(
        err?.response?.data?.error || 
        err?.message || 
        "Error fetching tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enhanced Remark Functions
  const fetchRemarks = async (task) => {
    try {
      setSelectedTask(task);
      const data = await axios.get(`/task/${task._id}/remarks`);
      setRemarks(data.data.remarks || data.data.data || []);
      setOpenRemarksDialog(true);
    } catch (error) {
      console.error('Error fetching remarks:', error);
      setError('Failed to load remarks');
    }
  };

  const handleRemarkImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    // For single image upload, replace existing image
    const newImage = {
      file: imageFiles[0],
      preview: URL.createObjectURL(imageFiles[0]),
      name: imageFiles[0].name,
      size: imageFiles[0].size
    };

    // Clear existing images and add new one
    remarkImages.forEach(image => URL.revokeObjectURL(image.preview)); // Clean up memory
    setRemarkImages([newImage]);
  };

  const handleRemoveRemarkImage = (index) => {
    setRemarkImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const inputEvent = {
        target: {
          files: event.dataTransfer.files
        }
      };
      handleRemarkImageUpload(inputEvent);
    }
  };

  const addRemark = async () => {
    if (!newRemark.trim() && remarkImages.length === 0) {
      setError('Please enter a remark or upload an image');
      return;
    }
    
    if (!selectedTask) return;
    
    setIsUploadingRemark(true);
    
    try {
      const formData = new FormData();
      formData.append('text', newRemark.trim());

      // Append single image (since backend expects single image)
      if (remarkImages.length > 0) {
        formData.append('image', remarkImages[0].file);
      }

      await axios.post(`/task/${selectedTask._id}/remarks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setNewRemark('');
      setRemarkImages([]);
      // Refresh remarks
      await fetchRemarks(selectedTask);
      
    } catch (error) {
      console.error('Error adding remark:', error);
      
      // More specific error messages
      if (error.response?.status === 413) {
        setError('File size too large. Maximum 5MB per image');
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || 'Invalid file type');
      } else {
        setError('Failed to add remark');
      }
    } finally {
      setIsUploadingRemark(false);
    }
  };

  // ✅ Graph Data Preparation
  const getGraphData = () => {
    const data = [
      { 
        status: 'Pending', 
        count: taskStats.pending?.count || 0, 
        percentage: taskStats.pending?.percentage || 0,
        color: '#ffc107',
        icon: '⏳'
      },
      { 
        status: 'In Progress', 
        count: taskStats.inProgress?.count || 0, 
        percentage: taskStats.inProgress?.percentage || 0,
        color: '#17a2b8',
        icon: '🔄'
      },
      { 
        status: 'Completed', 
        count: taskStats.completed?.count || 0, 
        percentage: taskStats.completed?.percentage || 0,
        color: '#28a745',
        icon: '✅'
      },
      { 
        status: 'Approved', 
        count: taskStats.approved?.count || 0, 
        percentage: taskStats.approved?.percentage || 0,
        color: '#20c997',
        icon: '👍'
      },
      { 
        status: 'Rejected', 
        count: taskStats.rejected?.count || 0, 
        percentage: taskStats.rejected?.percentage || 0,
        color: '#dc3545',
        icon: '❌'
      },
      { 
        status: 'Overdue', 
        count: taskStats.overdue?.count || 0, 
        percentage: taskStats.overdue?.percentage || 0,
        color: '#dc3545',
        icon: '⚠️'
      }
    ].filter(item => item.count > 0);

    return data.length > 0 ? data : [
      { status: 'No Tasks', count: 1, percentage: 100, color: '#6c757d', icon: '📊' }
    ];
  };

  // ✅ Calculate Bar Heights for Graph
  const calculateBarHeight = (count) => {
    const graphData = getGraphData();
    const maxCount = Math.max(...graphData.map(item => item.count));
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  };

  const filteredUsers = useMemo(() => {
    return users; // Already filtered by backend
  }, [users]);

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "approved":
      case "complete":
      case "completed":
        return <FiCheckCircle color={theme.palette.success.main} />;
      case "rejected":
        return <FiXCircle color={theme.palette.error.main} />;
      case "pending":
        return <FiClock color={theme.palette.warning.main} />;
      case "in-progress":
        return <FiAlertCircle color={theme.palette.info.main} />;
      default:
        return <FiClock color={theme.palette.text.secondary} />;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Not set";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to get user name
  const getUserName = (userId) => {
    if (typeof userId === 'object') {
      return userId.name || 'Unknown User';
    }
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return {};
    
    return tasks.reduce((groups, task) => {
      const date = task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : "No Date";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    }, {});
  }, [tasks]);

  // ✅ Render Enhanced Remarks Dialog
  const renderRemarksDialog = () => (
    <Dialog 
      open={openRemarksDialog} 
      onClose={() => {
        setOpenRemarksDialog(false);
        setRemarkImages([]);
        setNewRemark('');
      }}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
        pb: 2
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FiMessageSquare color={theme.palette.info.main} />
            <Typography variant="h6" fontWeight={600}>
              Remarks for: {selectedTask?.title}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {remarks.length} remark(s)
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Add New Remark Section */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Add New Remark
              </Typography>
              
              {/* Text Input */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Your Remark"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark here... (Optional if uploading images)"
                sx={{ mb: 2 }}
              />

              {/* Image Upload Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Attach Image (Optional)
                </Typography>
                
                <ImageUploadArea
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('remark-image-upload').click()}
                  isDragActive={false}
                >
                  <Stack spacing={1} alignItems="center">
                    <FiImage size={24} color={theme.palette.primary.main} />
                    <Typography variant="body2" fontWeight={600}>
                      Click to upload or drag & drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports JPG, PNG, GIF • Max 5MB
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<FiCamera />}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Choose Image
                    </Button>
                  </Stack>
                  
                  <input
                    id="remark-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleRemarkImageUpload}
                    style={{ display: 'none' }}
                  />
                </ImageUploadArea>

                {/* Image Preview */}
                {remarkImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Selected Image:
                    </Typography>
                    <ImagePreviewContainer>
                      {remarkImages.map((image, index) => (
                        <ImagePreview key={index}>
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onClick={() => setZoomImage(image.preview)}
                          />
                          <RemoveImageButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRemarkImage(index);
                            }}
                          >
                            <FiX size={12} />
                          </RemoveImageButton>
                        </ImagePreview>
                      ))}
                    </ImagePreviewContainer>
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={addRemark}
                  disabled={isUploadingRemark || (!newRemark.trim() && remarkImages.length === 0)}
                  startIcon={isUploadingRemark ? <CircularProgress size={16} /> : <FiSend />}
                  fullWidth
                >
                  {isUploadingRemark ? 'Uploading...' : 'Add Remark'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Remarks History */}
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Remarks History
            </Typography>
            
            {remarks.length > 0 ? (
              <Stack spacing={2}>
                {remarks.map((remark, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={1.5}>
                        {/* User Info and Date */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                bgcolor: theme.palette.primary.main,
                                fontSize: '0.75rem'
                              }}
                            >
                              {getUserName(remark.user)?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {getUserName(remark.user)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(remark.createdAt)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>

                        {/* Remark Text */}
                        {remark.text && (
                          <Typography variant="body2" sx={{ 
                            mt: 0.5,
                            p: 1.5,
                            backgroundColor: theme.palette.background.default,
                            borderRadius: 1,
                            borderLeft: `3px solid ${theme.palette.primary.main}`
                          }}>
                            {remark.text}
                          </Typography>
                        )}

                        {/* Remark Image */}
                        {remark.image && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                              Attached Image:
                            </Typography>
                            <ImagePreview 
                              sx={{ 
                                maxWidth: 200,
                                borderRadius: 1
                              }}
                              onClick={() => setZoomImage(`http://localhost:3000/${remark.image}`)}
                            >
                              <img
                                src={`http://localhost:3000/${remark.image}`}
                                alt="Remark attachment"
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  borderRadius: theme.shape.borderRadius,
                                  cursor: 'pointer'
                                }}
                              />
                              <Tooltip title="Zoom">
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0,0,0,0.8)',
                                    }
                                  }}
                                >
                                  <FiZoomIn size={12} />
                                </IconButton>
                              </Tooltip>
                            </ImagePreview>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <FiMessageSquare size={32} color={theme.palette.text.secondary} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
                    No remarks yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Be the first to add a remark for this task
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );

  // ✅ Render Image Zoom Modal
  const renderImageZoomModal = () => (
    <ZoomModal
      open={!!zoomImage}
      onClose={() => setZoomImage(null)}
      closeAfterTransition
    >
      <Fade in={!!zoomImage}>
        <Box sx={{ 
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none'
        }}>
          <IconButton
            onClick={() => setZoomImage(null)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
            }}
          >
            <FiX size={20} />
          </IconButton>
          <img
            src={zoomImage}
            alt="Zoomed view"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: theme.shape.borderRadius
            }}
          />
        </Box>
      </Fade>
    </ZoomModal>
  );

  if (!canManage)
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6" fontWeight={700}>
            Access Denied
          </Typography>
          <Typography>
            You don't have the required permissions to view this page.
          </Typography>
        </Alert>
      </Box>
    );

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Employee Tasks Overview
              </Typography>
              <Typography color="text.secondary">
                Monitor and manage tasks across your team with real-time data
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <FiUsers color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={600}>
                {filteredUsers.length} Employees
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Filter */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Filter Employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select employee type to filter the list
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Employee Type</InputLabel>
              <Select
                value={selectedEmployeeType}
                label="Employee Type"
                onChange={(e) => setSelectedEmployeeType(e.target.value)}
              >
                {EMPLOYEE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {React.createElement(type.icon, {
                        color: theme.palette.primary.main,
                      })}
                      <Typography>{type.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Users Grid */}
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {usersLoading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography mt={2}>Loading employees...</Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <FiUsers size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No Employees Found
              </Typography>
              <Typography>
                {selectedEmployeeType !== "all" 
                  ? `No ${selectedEmployeeType} employees found.` 
                  : "No employees available."
                }
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredUsers.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user._id}>
                  <UserCard
                    selected={selectedUserId === user._id}
                    onClick={() => fetchUserTasks(user._id)}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 48,
                              height: 48
                            }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} noWrap>
                              {user.name || "Unknown User"}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <FiMail size={14} color={theme.palette.text.secondary} />
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {user.email || "No email"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                        
                        {/* Task Stats */}
                        {user.taskStats && (
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Total Tasks:
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {user.taskStats.total}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Completion:
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                color={
                                  user.taskStats.completionRate >= 80 ? "success.main" :
                                  user.taskStats.completionRate >= 50 ? "warning.main" : "error.main"
                                }
                              >
                                {user.taskStats.completionRate}%
                              </Typography>
                            </Stack>
                          </Stack>
                        )}
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip
                            label={user.role ? user.role.toUpperCase() : "NO ROLE"}
                            color="primary"
                            size="small"
                          />
                          {user.employeeType && (
                            <EmployeeTypeChip
                              label={user.employeeType.toUpperCase()}
                              type={user.employeeType}
                              size="small"
                            />
                          )}
                        </Stack>
                        
                        <Button
                          fullWidth
                          variant={
                            selectedUserId === user._id
                              ? "contained"
                              : "outlined"
                          }
                          endIcon={<FiArrowRight />}
                          size="small"
                        >
                          View Tasks & Analytics
                        </Button>
                      </Stack>
                    </CardContent>
                  </UserCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* ---------- Dialog Popup with Graph + Tasks ---------- */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="lg"
          scroll="paper"
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2
          }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedUser?.name}'s Tasks Overview
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                <FiBriefcase size={16} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  {selectedUser?.role} • {selectedUser?.employeeType}
                </Typography>
                {selectedUser?.email && (
                  <>
                    <FiMail size={14} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
            <IconButton onClick={() => setOpenDialog(false)}>
              <FiX />
            </IconButton>
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: 3 }}>
            {loading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
                <Typography mt={2}>Loading tasks and analytics...</Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {/* Task Statistics Graph */}
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FiBarChart2 color={theme.palette.primary.main} />
                      <Typography variant="h6" fontWeight={600}>
                        Task Status Distribution
                      </Typography>
                      <Chip 
                        label={`Total: ${taskStats.total || 0}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Stack>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {['today', 'week', 'month'].map((period) => (
                        <Button 
                          key={period}
                          size="small" 
                          variant={timeFilter === period ? 'contained' : 'outlined'}
                          onClick={() => handleTimeFilterChange(period)}
                          sx={{ mb: 1 }}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>

                  {graphLoading ? (
                    <Box textAlign="center" py={3}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Loading statistics...
                      </Typography>
                    </Box>
                  ) : (taskStats.total === 0 && tasks.length === 0) ? (
                    <Box textAlign="center" py={3} color="text.secondary">
                      <FiPieChart size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No Tasks Found
                      </Typography>
                      <Typography>
                        No tasks available for the selected period.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Bar Graph */}
                      <Box sx={{ height: 200, mb: 3 }}>
                        <Stack direction="row" justifyContent="space-around" alignItems="flex-end" sx={{ height: '100%' }} spacing={1}>
                          {getGraphData().map((item) => (
                            <Box key={item.status} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '80px' }}>
                              <Typography variant="caption" textAlign="center" sx={{ mb: 1, height: '32px', display: 'flex', alignItems: 'center' }}>
                                {item.status}
                              </Typography>
                              <Tooltip title={`${item.count} tasks (${item.percentage}%)`} arrow>
                                <GraphBar 
                                  height={calculateBarHeight(item.count)} 
                                  color={item.color}
                                  sx={{
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                    }
                                  }}
                                >
                                  <Typography variant="caption" sx={{ 
                                    color: 'white', 
                                    fontWeight: 'bold', 
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                    fontSize: '10px'
                                  }}>
                                    {item.count}
                                  </Typography>
                                </GraphBar>
                              </Tooltip>
                              <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>
                                {item.percentage}%
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      {/* Statistics Summary */}
                      <Grid container spacing={1}>
                        {getGraphData().map((item) => (
                          <Grid item xs={6} sm={4} md={2} key={item.status}>
                            <Card variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={700} color={item.color}>
                                {item.count}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {item.status}
                              </Typography>
                              <Typography variant="caption" display="block" fontWeight={600}>
                                {item.percentage}%
                              </Typography>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Paper>

                <Divider />

                {/* Task List with Filters */}
                <Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FiList color={theme.palette.primary.main} />
                      <Typography variant="h6" fontWeight={600}>
                        Task Details
                      </Typography>
                      <Chip 
                        label={`${tasks.length} tasks`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      {/* Status Filter */}
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => handleStatusFilterChange(e.target.value)}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Search */}
                      <TextField
                        size="small"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        InputProps={{
                          startAdornment: <FiSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                        }}
                        sx={{ minWidth: 200 }}
                      />
                    </Stack>
                  </Stack>

                  {tasks.length === 0 ? (
                    <Box textAlign="center" py={4} color="text.secondary">
                      <FiList size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No Tasks Found
                      </Typography>
                      <Typography>
                        {selectedUser?.name} has no tasks matching the current filters.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      {Object.keys(groupedTasks).map((date) => (
                        <Box key={date}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <FiCalendar color={theme.palette.primary.main} />
                            <Typography variant="h6" fontWeight={600}>
                              {formatDate(date)}
                            </Typography>
                            <Chip 
                              label={`${groupedTasks[date].length} tasks`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </Stack>
                          
                          <Grid container spacing={2}>
                            {groupedTasks[date].map((task) => (
                              <Grid item xs={12} key={task._id}>
                                <TaskCard>
                                  <CardContent>
                                    <Stack spacing={1.5}>
                                      <Typography variant="h6" fontWeight={600}>
                                        {task.title || "Untitled Task"}
                                      </Typography>
                                      
                                      {task.description && (
                                        <Typography variant="body2" color="text.secondary">
                                          {task.description}
                                        </Typography>
                                      )}
                                      
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        {/* Task Status */}
                                        {(task.userStatus || task.status || task.overallStatus) && (
                                          <StatusChip
                                            label={(task.userStatus || task.status || task.overallStatus).toUpperCase()}
                                            status={task.userStatus || task.status || task.overallStatus}
                                            icon={getStatusIcon(task.userStatus || task.status || task.overallStatus)}
                                            size="small"
                                          />
                                        )}
                                        
                                        {/* Priority */}
                                        {task.priority && (
                                          <Chip 
                                            label={`Priority: ${task.priority}`} 
                                            size="small" 
                                            variant="outlined" 
                                            color={
                                              task.priority === 'high' ? 'error' : 
                                              task.priority === 'medium' ? 'warning' : 'default'
                                            }
                                          />
                                        )}
                                        
                                        {/* Due Date */}
                                        {task.dueDateTime && (
                                          <Typography variant="caption" color="text.secondary">
                                            Due: {formatDate(task.dueDateTime)}
                                          </Typography>
                                        )}
                                      </Stack>

                                      {/* Task Metadata */}
                                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                        {task.createdBy && (
                                          <Typography variant="caption" color="text.secondary">
                                            Created by: {task.createdBy.name}
                                          </Typography>
                                        )}
                                        {task.assignedUsers && task.assignedUsers.length > 0 && (
                                          <Typography variant="caption" color="text.secondary">
                                            Assigned to: {task.assignedUsers.map(u => u.name).join(', ')}
                                          </Typography>
                                        )}
                                      </Stack>

                                      {/* Remarks Section */}
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Button
                                          size="small"
                                          startIcon={<FiMessageSquare />}
                                          onClick={() => fetchRemarks(task)}
                                          variant="outlined"
                                        >
                                          Remarks
                                          {task.remarksCount > 0 && (
                                            <Badge 
                                              badgeContent={task.remarksCount} 
                                              color="primary"
                                              sx={{ ml: 1 }}
                                            />
                                          )}
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  </CardContent>
                                </TaskCard>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced Remarks Dialog */}
        {renderRemarksDialog()}

        {/* Image Zoom Modal */}
        {renderImageZoomModal()}
      </Box>
    </Fade>
  );
};

export default TaskDetails;