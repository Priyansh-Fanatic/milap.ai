import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAdmin } from './utils/adminAuth';

export default function AdminRoute({ children, allowedRoles }) {
  const admin = getAdmin();
  if (!admin || (allowedRoles && !allowedRoles.includes(admin.role))) {
    return <Navigate to="/admin/login" />;
  }
  return children;
} 