// src/pages/AdminProjects.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { initialProjects } from '../../data/projectData';

const AdminProjects = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [open, setOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    id: '',
    projectName: '',
    owner: '',
    status: 'Active',
    progress: '0',
    totaltask: '',
    startDate: '',
    endDate: '',
  });

  const handleEditCellChange = (params) => {
    const updated = projects.map((proj) =>
      proj.id === params.id ? { ...proj, [params.field]: params.value } : proj
    );
    setProjects(updated);
  };

  const handleAddProject = () => {
    setProjects([...projects, newProject]);
    setNewProject({
      id: '',
      projectName: '',
      owner: '',
      status: 'Active',
      progress: '0',
      totaltask: '',
      startDate: '',
      endDate: '',
    });
    setOpen(false);
  };

  const handleDelete = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5, editable: false },
    { field: 'projectName', headerName: 'Project Name', flex: 1, editable: true },
    { field: 'owner', headerName: 'Owner', flex: 1, editable: true },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      editable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Active' ? 'primary' : 'secondary'}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      field: 'progress',
      headerName: '%',
      type: 'number',
      flex: 0.5,
      editable: true,
      renderCell: (params) => `${params.value}%`,
    },
    { field: 'totaltask', headerName: 'Total task', flex: 0.5, editable: true },
    { field: 'startDate', headerName: 'Start Date', flex: 0.7, editable: true },
    { field: 'endDate', headerName: 'End Date', flex: 0.7, editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.6,
      renderCell: (params) => (
        <Button
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Admin Projects
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Project
        </Button>
      </Stack>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={projects}
          columns={columns}
          getRowId={(row) => row.id}
          onCellEditStop={(_, params) => handleEditCellChange(params)}
          sx={{
            '& .MuiDataGrid-cell': { outline: 'none !important' },
            backgroundColor: 'background.paper',
          }}
        />
      </Box>

      {/* Add Project Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Project ID"
            value={newProject.id}
            onChange={(e) => setNewProject({ ...newProject, id: e.target.value })}
          />
          <TextField
            label="Project Name"
            value={newProject.projectName}
            onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
          />
          <TextField
            label="Owner"
            value={newProject.owner}
            onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
          />
             <TextField
            label="Total Task"
            value={newProject.totaltask}
            onChange={(e) => setNewProject({ ...newProject, totaltask: e.target.value })}
          />
          <TextField
            label="Start Date"
            value={newProject.startDate}
            onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
          />
            <TextField
            label="End Date"
            value={newProject.endDate}
            onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProject}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProjects;
