import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const payloadStart = token.indexOf('.') + 1;
    const payloadEnd = token.indexOf('.', payloadStart);
    if (payloadStart === 0 || payloadEnd === -1) throw new Error('Invalid token');
    
    const payloadStr = atob(token.slice(payloadStart, payloadEnd));
    const payload = JSON.parse(payloadStr);

    if (requireAdmin && !payload.is_admin) {
      // Must be an admin, but is not -> Redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Token decoding failed", error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
