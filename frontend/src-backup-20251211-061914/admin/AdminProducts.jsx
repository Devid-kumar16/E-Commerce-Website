// src/admin/components/AdminProducts.jsx
import React, { useMemo, useState } from "react";
import { PRODUCTS } from "../../data/products";

export default function AdminProducts() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const set = new Set();
    PRODUCTS.forEach((p) => set.add(p.category || "Uncategorized"));
    return Array.from(set);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();

    return PRODUCTS.filter((p) => {
      const name = (p.title || "").toLowerCase();
      const cat = (p.category || "Uncategorized").toLowerCase();

      const matchText =
        !q || name.includes(q) || String(p.id).toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "all"
          ? true
          : (p.category || "Uncategorized") === categoryFilter;

      return matchText && matchCategory;
    });
  }, [query, categoryFilter]);

  return (
    <div className="orders-page">
      <h2 style={{ marginBottom: 8 }}>Products</h2>

      {/* Search + filters bar (reuse orders styles) */}
      <div className="orders-toolbar">
        <div className="orders-search-box">
          <span className="search-icon">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or ID"
          />
        </div>

        <select
          className="orders-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="orders-card">
        <table className="orders-table">
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
            {filteredProducts.map((p, index) => (
              <tr key={`${p.id}-${index}`}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td className="orders-actions">
                  <a
                    href={`/product/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-btn"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="no-results">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
