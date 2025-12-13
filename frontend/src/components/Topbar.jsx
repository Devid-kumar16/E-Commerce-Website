// src/admin/components/Topbar.jsx
import React from "react";

export default function Topbar() {
  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button className="hamburger" title="Menu">☰</button>
        <div className="topbar-search">
          <input placeholder="Search products, orders or customers" />
        </div>
      </div>

      <div className="topbar-actions">
        <button className="small-muted">Notifications</button>
        <button className="small-muted">Messages</button>
        <div className="avatar">AU</div>
      </div>
    </div>
  );
}