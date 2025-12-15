import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import "./AdminStyles.css";

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Prevent blank screen while auth loads
  if (loading) {
    return <div style={{ padding: 20 }}>Loading admin panel…</div>;
  }

  // ✅ Extra safety: if user vanished, redirect
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>E-Store Admin</h2>
          <p>Logged in as <strong>{user.name}</strong></p>
        </div>

        <nav className="admin-nav">
          <NavLink end to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/customers">Customers</NavLink>
        </nav>

        <button
          className="admin-logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </aside>

      {/* ✅ THIS IS CORRECT AND REQUIRED */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
