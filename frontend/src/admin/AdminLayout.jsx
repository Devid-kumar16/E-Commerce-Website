import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminStyles.css";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  /* =========================================================
      IMPORTANT:
      Do NOT redirect here.
      AdminGuard already restricts access.
      Here we only make sure the UI does not crash.
  ========================================================= */

  // Wait until user is fully restored from AuthContext
  if (loading) return null;

  return (
    <div className="admin-container">
      
      {/* GLOBAL ADMIN TOAST */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        limit={3}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{ zIndex: 99999 }}
      />

      {/* =================== SIDEBAR =================== */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>E-Store Admin</h2>

          <p>
            Logged in as:{" "}
            <strong>{user?.name || user?.email || "Admin User"}</strong>
          </p>
        </div>

        <nav className="admin-nav">
          <NavLink end to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/customers">Customers</NavLink>
          <NavLink to="/admin/coupons">Coupons</NavLink>
          <NavLink to="/admin/cms">CMS</NavLink>
        </nav>

        <button
          className="admin-logout"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </button>
      </aside>

      {/* =================== MAIN CONTENT =================== */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
