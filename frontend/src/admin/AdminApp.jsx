import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import ProductsPage from "./ProductsPage";
import CategoriesPage from "./CategoriesPage";
import OrdersPage from "./OrdersPage";
import CustomersPage from "./CustomersPage";

export default function AdminApp() {
  return (
    <ProtectedAdminRoute>
      <Routes>
        <Route element={<AdminLayout />}>
          {/* 👇 DEFAULT ADMIN PAGE */}
          <Route index element={<Dashboard />} />

          {/* 👇 RELATIVE PATHS */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
        </Route>
      </Routes>
    </ProtectedAdminRoute>
  );
}

