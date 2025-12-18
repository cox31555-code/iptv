import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component
 * Ensures user is authenticated before rendering admin routes
 * Redirects to login page if not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { admin } = useApp();

  // If not authenticated, redirect to login
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
