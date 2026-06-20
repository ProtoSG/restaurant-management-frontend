import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./features/auth";

export function ProtectedRoute() {
  const { isAuthenticated, verifyAuth } = useAuth();

  // Refresh stale persisted auth data on mount (e.g. role changed, token revoked)
  useEffect(() => {
    verifyAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
