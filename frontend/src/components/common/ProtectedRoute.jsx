import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader text="Verifying credentials..." />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // If authenticated but role is unauthorized, redirect to their home dashboard
    if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (user.role === 'PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
