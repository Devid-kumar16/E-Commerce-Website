// src/admin/AdminRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // while auth is being determined, don't redirect - show nothing or a spinner
  if (loading) {
    return <div style={{padding: 20}}>Checking authentication…</div>;
  }

  // not logged in -> send to login and remember where we came from
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // normalize role check — expecting 'admin' (lowercase)
  const role = (user.role || "").toString().toLowerCase();
  if (role !== "admin") {
    // logged in but not admin -> send home (or unauthorized page)
    return <Navigate to="/" replace />;
  }

  return children;
}
