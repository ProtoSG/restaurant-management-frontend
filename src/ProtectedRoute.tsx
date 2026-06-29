import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./features/auth";

export function ProtectedRoute() {
  const { isAuthenticated, verifyAuth } = useAuth();

  // Refresh stale persisted auth data on mount (e.g. role changed, token revoked).
  // verifyAuth is a stable zustand action, so this runs once.
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
