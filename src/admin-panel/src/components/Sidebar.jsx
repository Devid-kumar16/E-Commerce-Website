// src/admin/components/Sidebar.jsx
import React from "react";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="#0f4ad2" strokeWidth="2" strokeLinecap="round"/></svg>
        Admin Panel
      </div>

      <div className="section">ALL PAGE</div>
      <nav className="admin-nav">
        <a href="#ecom"><span className="icon">🛒</span> Ecommerce</a>
        <a href="#category"><span className="icon">📚</span> Category</a>
        <a href="#attributes"><span className="icon">📦</span> Attributes</a>
        <a href="#order"><span className="icon">🧾</span> Order</a>
        <a href="#user"><span className="icon">👤</span> User</a>
        <a href="#roles"><span className="icon">👥</span> Roles</a>
        <a href="#gallery"><span className="icon">🖼️</span> Gallery</a>
        <a href="#report"><span className="icon">📊</span> Report</a>
      </nav>

      <div className="section">SETTING</div>
      <nav className="admin-nav">
        <a href="#location"><span className="icon">📍</span> Location</a>
        <a href="#currency"><span className="icon">💱</span> Currency</a>
        <a href="#integrations"><span className="icon">🔌</span> Integrations</a>
      </nav>

      <div style={{flex:1}} />
      <div className="small-muted">v1.0 • Your Company</div>
    </aside>
  );
}

