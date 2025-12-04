// src/admin/AdminApp.jsx
import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./AdminStyles.css";

import ProductsPage from "./components/ProductsPage";
import OrdersPage from "./components/OrdersPage";

/* ---------- Sidebar ---------- */
function AdminSidebar() {
  const navClass = ({ isActive }) =>
    "admin-nav-item" + (isActive ? " admin-nav-item-active" : "");

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">E-Store Admin</div>

      {/* MAIN */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">MAIN</div>
        <NavLink to="/admin/orders" className={navClass}>
          Orders
        </NavLink>
        <NavLink to="/admin/dashboard" className={navClass}>
          Dashboard
        </NavLink>
      </div>

      {/* CATALOG */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">CATALOG</div>
        <NavLink to="/admin/products" className={navClass}>
          Products
        </NavLink>
        <NavLink to="/admin/categories" className={navClass}>
          Categories
        </NavLink>
        <NavLink to="/admin/brands" className={navClass}>
          Brands
        </NavLink>
        <NavLink to="/admin/inventory" className={navClass}>
          Inventory
        </NavLink>
      </div>

      {/* CUSTOMERS */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">CUSTOMERS</div>
        <NavLink to="/admin/customers" className={navClass}>
          Customers
        </NavLink>
        <NavLink to="/admin/reviews" className={navClass}>
          Reviews
        </NavLink>
      </div>

      {/* SETTINGS */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">SETTINGS</div>
        <NavLink to="/admin/settings" className={navClass}>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

/* ---------- Placeholder pages (Dashboard, Categories, etc.) ---------- */
function AdminPlaceholder({ title }) {
  return (
    <div className="admin-main">
      <header className="admin-main-header">
        <div className="left">
          <button className="back-btn" type="button">
            ←
          </button>
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-main-avatar">HM</div>
      </header>

      <div className="admin-main-content">
        <h2 className="admin-page-title">{title}</h2>
        <div className="admin-empty">
          {title} page coming soon (placeholder).
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin root ---------- */
export default function AdminApp() {
  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main-area">
        <Routes>
          {/* default: /admin → /admin/products */}
          <Route index element={<Navigate to="products" replace />} />

          {/* REAL PAGES */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />

          {/* PLACEHOLDER PAGES */}
          <Route
            path="dashboard"
            element={<AdminPlaceholder title="Dashboard" />}
          />
          <Route
            path="categories"
            element={<AdminPlaceholder title="Categories" />}
          />
          <Route path="brands" element={<AdminPlaceholder title="Brands" />} />
          <Route
            path="inventory"
            element={<AdminPlaceholder title="Inventory" />}
          />
          <Route
            path="customers"
            element={<AdminPlaceholder title="Customers" />}
          />
          <Route path="reviews" element={<AdminPlaceholder title="Reviews" />} />
          <Route
            path="settings"
            element={<AdminPlaceholder title="Settings" />}
          />

          {/* unknown admin routes → products */}
          <Route path="*" element={<Navigate to="products" replace />} />
        </Routes>
      </div>
    </div>
  );
}
