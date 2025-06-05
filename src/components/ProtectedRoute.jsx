import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = sessionStorage.getItem('token');
  const isAdmin = sessionStorage.getItem('isAdmin');
 
  if (!token) { 
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    if (isAdmin !== 'true') { 
      return <Navigate to="/dashboard" replace />;
    }
  }
 
  return children;
};

export default ProtectedRoute;