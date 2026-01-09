import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ⏳ Wait until auth is resolved
  if (loading) {
    return null; // or a loader component
  }

  // ❌ Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // ❌ Logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin → allow access
  return <Outlet />;
}