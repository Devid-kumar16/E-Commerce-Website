// src/admin/components/ProductsPage.jsx
import React, { useState } from "react";
import PRODUCTS from "../../data/products";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  return (
    <div className="admin-main">
      <header className="admin-main-header">
        <button className="back-btn">←</button>
        <h1>Admin Panel</h1>
        <div className="admin-main-avatar">HM</div>
      </header>

      <section className="admin-main-content">
        <h2 className="admin-page-title">Products</h2>

        <div className="admin-filters-row">
          <div className="admin-search-input">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td>{p.price}</td>
                  <td className="text-right">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
