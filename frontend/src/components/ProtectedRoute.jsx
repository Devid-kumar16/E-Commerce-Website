import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { loading, isAuthenticated, isAdmin, isCustomer } = useAuth();
  const location = useLocation();

  // Wait for auth restore
  if (loading) return null;

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Admin trying to enter customer pages → redirect to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Customer only
  if (!isCustomer) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

