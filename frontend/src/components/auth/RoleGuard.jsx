import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export function RoleGuard({ children, allowedRoles = [] }) {
  const { user, role, loading, isSignedIn } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage text="Checking workspace authorization..." />;
  }

  if (!user && !isSignedIn) {
    if (allowedRoles.includes('ADMIN') && !allowedRoles.includes('AGENT')) {
      return <Navigate to="/login/admin" state={{ from: location }} replace />;
    }
    return <Navigate to="/admin/agent" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'CUSTOMER') {
      return <Navigate to="/portal/dashboard" replace />;
    }
    return <Navigate to="/staff/dashboard" replace />;
  }

  return children;
}

export default RoleGuard;
