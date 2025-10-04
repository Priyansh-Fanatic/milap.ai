// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // You should store the role during login

  // If no token or the user role is not in allowed roles, redirect to login
  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authorized, render the children (protected component)
  return children;
};

export default ProtectedRoute;
