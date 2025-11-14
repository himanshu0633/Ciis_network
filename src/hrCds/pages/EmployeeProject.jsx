import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";

const EmployeeProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectUsers, setProjectUsers] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
  });

  const [file, setFile] = useState(null);

  // Load all projects
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const res = await axios.get("/projects");
    setProjects(res.data.items);
  };

  // Load selected project details + tasks
  const handleSelectProject = async (id) => {
    setSelectedProject(id);

    const res = await axios.get(`/projects/${id}`);

    setProjectUsers(res.data.users);
    setTasks(res.data.tasks);
  };

  // Add Task
  const handleAddTask = async () => {
    if (!newTask.assignedTo) {
      alert("Please select user to assign task");
      return;
    }

    const formData = new FormData();
    Object.keys(newTask).forEach((key) =>
      formData.append(key, newTask[key])
    );

    if (file) formData.append("pdfFile", file);

    await axios.post(`/projects/${selectedProject}/tasks`, formData);

    alert("Task Added Successfully");

    // reset form
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    });

    setFile(null);

    // Refresh tasks
    handleSelectProject(selectedProject);
  };

  // Add Remark to a Task
  const handleAddRemark = async (taskId, text) => {
    if (!text || text.trim() === "") return alert("Enter remark");

    await axios.post(
      `/projects/${selectedProject}/tasks/${taskId}/remarks`,
      { text }
    );

    // Reload tasks
    handleSelectProject(selectedProject);
  };

  return (
    <Box p={3}>
      <Typography variant="h5">My Projects</Typography>

      {/* PROJECT LIST */}
      <Grid container spacing={2} mt={1}>
        {projects.map((p) => (
          <Grid item xs={12} md={4} key={p._id}>
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => handleSelectProject(p._id)}
            >
              <CardContent>
                <Typography variant="h6">{p.projectName}</Typography>
                <Typography>Priority: {p.priority}</Typography>
                <Typography>Status: {p.status}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TASK PANEL */}
      {selectedProject && (
        <Card sx={{ mt: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h6">Add New Task</Typography>

            <Stack spacing={2} mt={2}>
              {/* Title */}
              <TextField
                label="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />

              {/* Description */}
              <TextField
                label="Description"
                multiline
                rows={3}
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />

              {/* Assigned To */}
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newTask.assignedTo}
                  label="Assign To"
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignedTo: e.target.value })
                  }
                >
                  {projectUsers.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Due Date */}
              <TextField
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />

              {/* Priority */}
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>

              {/* Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTask.status}
                  label="Status"
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              {/* File */}
              <Button variant="contained" component="label">
                Upload Task File
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={handleAddTask}
              >
                Add Task
              </Button>
            </Stack>

            {/* TASK LIST */}
            <Typography variant="h6" mt={4} mb={2}>
              Project Tasks
            </Typography>

            {tasks.map((t) => (
              <Card key={t._id} sx={{ mb: 2, p: 2 }}>
                <Typography><b>{t.title}</b></Typography>
                <Typography>Status: {t.status}</Typography>
                <Typography>Assigned To: {t.assignedTo?.name}</Typography>
                <Typography>Priority: {t.priority}</Typography>

                {/* Existing remarks */}
                <Box mt={1}>
                  <Typography variant="subtitle2">Remarks:</Typography>
                  {t.remarks?.length > 0 ? (
                    t.remarks.map((r, idx) => (
                      <Typography key={idx} sx={{ fontSize: "14px" }}>
                        • {r.text}
                      </Typography>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: "13px" }}>
                      No remarks yet.
                    </Typography>
                  )}
                </Box>

                {/* Add New Remark */}
                <Stack direction="row" spacing={1} mt={2}>
                  <TextField
                    size="small"
                    placeholder="Add remark..."
                    value={t._newRemark || ""}
                    onChange={(e) =>
                      setTasks((prev) =>
                        prev.map((x) =>
                          x._id === t._id
                            ? { ...x, _newRemark: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddRemark(t._id, t._newRemark)}
                  >
                    Add
                  </Button>
                </Stack>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EmployeeProject;
