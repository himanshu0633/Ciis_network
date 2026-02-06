import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedSuperAdminRoute = ({ children }) => {
  // Check if super admin is logged in
  const superAdmin = JSON.parse(localStorage.getItem('superAdmin'));
  const token = localStorage.getItem('token');

  if (!superAdmin || !token) {
    // Redirect to super admin login
    return <Navigate to="/super-admin/login" replace />;
  }

  // Optional: Verify token with backend
  // You can add token validation API call here

  return children;
};

export default ProtectedSuperAdminRoute;