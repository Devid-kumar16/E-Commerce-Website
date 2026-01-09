import React from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminStyles.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🔐 Protect admin routes
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      {/* 🔔 GLOBAL ADMIN TOAST (FIXED & VISIBLE) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        limit={3}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{ zIndex: 99999 }} // ✅ VERY IMPORTANT
      />

      {/* ---------- SIDEBAR ---------- */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>E-Store Admin</h2>
          <p>
            Logged in as <strong>{user.name}</strong>
          </p>
        </div>

        <nav className="admin-nav">
          <NavLink end to="/admin">
            Dashboard
          </NavLink>
          <NavLink to="/admin/products">
            Products
          </NavLink>
          <NavLink to="/admin/categories">
            Categories
          </NavLink>
          <NavLink to="/admin/orders">
            Orders
          </NavLink>
          <NavLink to="/admin/customers">
            Customers
          </NavLink>
          <NavLink to="/admin/coupons" className="sidebar-link">
            Coupons
          </NavLink>
          <NavLink to="/admin/cms">
            CMS
          </NavLink>
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

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}