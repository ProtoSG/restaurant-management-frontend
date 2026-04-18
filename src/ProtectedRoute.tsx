import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./features/auth";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <span className="text-lg">Cargando...</span>
  </div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
