import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminGuard() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Wait for auth to initialize
  if (loading) return null;

  // Not logged in → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but NOT admin → home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin → allow nested routes
  return <Outlet />;
}

