// src/admin/AdminApp.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import Ecommerce from "./components/Ecommerce";     // product listing (your file name)
import Categories from "./components/Categories";
import Orders from "./components/Orders";
import ProductDetail from "./components/ProductDetail";

import "./AdminStyles.css";

export default function AdminApp() {
  return (
    <div className="admin-root">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ecommerce" element={<Ecommerce />} />
            <Route path="/ecommerce/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
