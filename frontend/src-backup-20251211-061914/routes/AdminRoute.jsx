// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/AuthProvider'; // <- correct relative import from routes -> context

export default function AdminRoute({ redirectTo = "/login" }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to={redirectTo} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}








