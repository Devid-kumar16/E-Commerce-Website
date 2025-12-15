import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function AdminRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // logged in but not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // admin → allow access
  return <Outlet />;
}
