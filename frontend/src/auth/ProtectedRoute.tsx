import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from './authStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'ADMIN' && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // When used as layout wrapper (no children), render Outlet
  return children ? <>{children}</> : <Outlet />;
}