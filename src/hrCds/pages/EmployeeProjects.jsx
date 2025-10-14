// src/pages/EmployeeProjects.jsx
import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { initialProjects } from '../../data/projectData';

const EmployeeProjects = () => {
  const [projects, setProjects] = useState(initialProjects);

  const handleEdit = (params) => {
    const updated = projects.map((proj) =>
      proj.id === params.id ? { ...proj, [params.field]: params.value } : proj
    );
    setProjects(updated);
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5, editable: false },
    { field: 'projectName', headerName: 'Project Name', flex: 1, editable: false },
    { field: 'owner', headerName: 'Owner', flex: 1, editable: false },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      editable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Active' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'progress',
      headerName: '%',
      flex: 0.5,
      editable: true,
      renderCell: (params) => `${params.value}%`,
    },
    { field: 'tasks', headerName: 'Tasks', flex: 0.5, editable: false },
    { field: 'startDate', headerName: 'Start Date', flex: 0.7, editable: false },
    { field: 'endDate', headerName: 'End Date', flex: 0.7, editable: false },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} mb={2}>
        Employee Projects
      </Typography>
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={projects}
          columns={columns}
          getRowId={(row) => row.id}
          onCellEditStop={(_, params) => handleEdit(params)}
          sx={{
            '& .MuiDataGrid-cell': { outline: 'none !important' },
            backgroundColor: 'background.paper',
          }}
        />
      </Box>
    </Box>
  );
};

export default EmployeeProjects;
