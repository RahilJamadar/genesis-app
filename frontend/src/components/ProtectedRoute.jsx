import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Enhanced ProtectedRoute
 * @param {string} role - The role required to access the route ('admin' or 'faculty')
 */
const ProtectedRoute = ({ children, role = 'admin' }) => {
  const location = useLocation();
  
  // 1. Get tokens for both roles
  const adminToken = localStorage.getItem('adminToken');
  const facultyToken = localStorage.getItem('facultyToken');

  // 2. Logic for Admin routes
  if (role === 'admin') {
    if (!adminToken) {
      // Redirect to Admin login, but save the location they were trying to access
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
  }

  // 3. Logic for Faculty/Judge routes
  if (role === 'faculty') {
    if (!facultyToken) {
      // Redirect to Faculty login
      return <Navigate to="/admin/faculty/login" state={{ from: location }} replace />;
    }
    return children;
  }

  // Fallback to home if role is undefined or logic fails
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;