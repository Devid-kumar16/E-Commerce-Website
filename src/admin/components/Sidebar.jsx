// src/admin/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../AdminStyles.css";

const linkClass = ({ isActive }) =>
  isActive ? "admin-nav-item admin-nav-item-active" : "admin-nav-item";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">E-Store Admin</div>

      {/* MAIN SECTION */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">MAIN</div>
        <NavLink to="/admin/orders" className={linkClass}>
          Orders
        </NavLink>
        <NavLink to="/admin/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
      </div>

      {/* CATALOG SECTION */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">CATALOG</div>
        <NavLink to="/admin/products" className={linkClass}>
          Products
        </NavLink>
        <NavLink to="/admin/categories" className={linkClass}>
          Categories
        </NavLink>
        <NavLink to="/admin/brands" className={linkClass}>
          Brands
        </NavLink>
        <NavLink to="/admin/inventory" className={linkClass}>
          Inventory
        </NavLink>
      </div>

      {/* CUSTOMERS SECTION */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">CUSTOMERS</div>
        <NavLink to="/admin/customers" className={linkClass}>
          Customers
        </NavLink>
        <NavLink to="/admin/reviews" className={linkClass}>
          Reviews
        </NavLink>
      </div>

      {/* SETTINGS SECTION */}
      <div className="admin-menu-group">
        <div className="admin-menu-label">SETTINGS</div>
        <NavLink to="/admin/settings" className={linkClass}>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
