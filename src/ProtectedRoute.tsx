import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, roleHome } from "./features/auth";
import type { RoleName } from "./features/auth/types/Login";

interface ProtectedRouteProps {
  /** If set, only these roles may render the nested routes. Others are sent to their role home. */
  allowedRoles?: RoleName[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, verifyAuth } = useAuth();

  // Refresh stale persisted auth data on mount (e.g. role changed, token revoked).
  // verifyAuth is a stable zustand action, so this runs once.
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}
