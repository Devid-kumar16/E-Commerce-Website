// src/admin/ProtectedAdminRoute.jsx
import { useAuth } from "../context/AuthProvider";
import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" />;

  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
}
