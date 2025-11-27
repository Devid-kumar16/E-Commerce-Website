// src/admin/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/ecommerce", label: "E-commerce" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/bestsellers", label: "Best Sellers" },
  { to: "/admin/overview", label: "Product Overview" },
];

export default function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="sidebar" role="navigation" aria-label="Admin sidebar">
      <div className="logo">
        <div className="badge">RS</div>
        <div>
          <div style={{fontWeight:700}}>Remos Admin</div>
          <div className="small">E-commerce panel</div>
        </div>
      </div>

      <nav className="nav">
        {items.map(i => (
          <Link key={i.to} to={i.to} className={loc.pathname === i.to ? "active" : ""}>
            <div style={{width:8,height:8,background:"#e6eefc",borderRadius:4}}></div>
            <div style={{flex:1}}>{i.label}</div>
          </Link>
        ))}
      </nav>

      <div style={{marginTop:"auto"}} className="small">
        <div style={{marginBottom:8}}>Quick actions</div>
        <Link to="/admin/products" className="btn secondary" style={{display:"inline-block"}}>Manage products</Link>
      </div>
    </aside>
  );
}
