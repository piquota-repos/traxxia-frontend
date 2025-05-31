import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = sessionStorage.getItem('token');
  const isAdmin = sessionStorage.getItem('isAdmin');
 
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    if (isAdmin !== 'true') {
      console.log('User is not admin, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('Access granted');
  return children;
};

export default ProtectedRoute;