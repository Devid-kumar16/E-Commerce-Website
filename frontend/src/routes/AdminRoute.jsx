import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Not admin → redirect to login
  if (!isAdmin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
