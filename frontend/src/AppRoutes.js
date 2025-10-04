import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Hero from './components/Hero/Hero';
import Formmissing from './components/missing form/Formmissing';
import Missing_persons from './components/missing_list/Missing_persons';
import Loc_page from './components/find_loc/Loc_page';
import Emergency from './components/Emergency/Emergency';
import Dashboard from './components/admin/Dashboard';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import UpdateProfile from './components/update_profile/UpdateProfile';
import AdminLogin from './components/admin/AdminLogin';
import AdminRegister from './components/admin/AdminRegister';
import PendingAdmins from './components/admin/PendingAdmins';
import ManageNodes from './components/admin/ManageNodes';
import ManageAdmins from './components/admin/ManageAdmins';
import ApproveCases from './components/admin/ApproveCases';
import ManageSupervisors from './components/admin/ManageSupervisors';
import ViewUsers from './components/admin/ViewUsers';
import AdminRoute from './components/admin/AdminRoute';
import { getAdmin } from './components/admin/utils/adminAuth';

function AppRoutes() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div>
      {!isAdminRoute && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/Formmissing" element={<Formmissing />} />
        <Route path="/Missingpeople" element={<Missing_persons />} />
        <Route path="/locations" element={<Loc_page />} />
        <Route path="/Emergency" element={<Emergency />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/profile" element={<Profile setUser={setUser} />} />
        <Route path="/edit-profile" element={<UpdateProfile />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin setAdmin={() => {}} />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/pending" element={
          <AdminRoute allowedRoles={['super_admin', 'node_admin']}>
            <PendingAdmins />
          </AdminRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute allowedRoles={['super_admin', 'node_admin', 'supervisor']}>
            <Dashboard />
          </AdminRoute>
        } />
        <Route path="/admin/nodes" element={
          <AdminRoute allowedRoles={['super_admin']}>
            <ManageNodes />
          </AdminRoute>
        } />
        <Route path="/admin/admins" element={
          <AdminRoute allowedRoles={['super_admin']}>
            <ManageAdmins />
          </AdminRoute>
        } />
        <Route path="/admin/cases" element={
          <AdminRoute allowedRoles={['super_admin', 'node_admin', 'supervisor']}>
            <ApproveCases />
          </AdminRoute>
        } />
        <Route path="/admin/supervisors" element={
          <AdminRoute allowedRoles={['node_admin']}>
            <ManageSupervisors />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute allowedRoles={['supervisor']}>
            <ViewUsers />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default AppRoutes; 