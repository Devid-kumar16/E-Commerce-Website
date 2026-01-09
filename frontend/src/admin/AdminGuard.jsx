import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Checking admin access…</div>;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}