// src/pages/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "admin-nav-link active" : "admin-nav-link";

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        className="admin-sidebar"
        style={{ width: 240, padding: 20, borderRight: "1px solid #eee" }}
      >
        <div className="sidebar-header" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>E-Store Admin</h2>
          <small style={{ color: "#666" }}>
            {user?.name} {user ? `(${user.role})` : null}
          </small>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            <li>
              <NavLink to="/admin" end className={linkClass}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/products" className={linkClass}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className={linkClass}>
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/orders" className={linkClass}>
                Orders
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/customers" className={linkClass}>
                Customers
              </NavLink>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 20 }}>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </aside>

      <main
        className="admin-main"
        style={{ flex: 1, padding: 20, background: "#fafafa", minHeight: "100vh" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
