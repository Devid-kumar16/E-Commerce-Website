import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

/* ===== PAGINATION CONFIG ===== */
const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* pagination state */
  const [page, setPage] = useState(1);

  /* ================= LOAD CATEGORIES ================= */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/categories");
      setItems(res.data?.categories || []);
    } catch (err) {
      console.error("Load categories error:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  const paginatedItems = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* ---------- HEADER ---------- */}
      <div className="page-header">
        <h2>Categories</h2>

        <Link to="/admin/categories/new" className="btn btn-primary">
          Add Category
        </Link>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p className="admin-loading">Loading...</p>}

      {/* ---------- TABLE ---------- */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.map((c, index) => (
              <tr key={c.id}>
                {/* sequential ID across pages */}
                <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td>{c.name}</td>
                <td>
                  <span
                    className={`badge ${c.status === "active" || c.active
                        ? "badge-active"
                        : "badge-inactive"
                      }`}
                  >
                    {c.status || (c.active ? "Active" : "Inactive")}
                  </span>
                </td>
              </tr>
            ))}

            {!loading && paginatedItems.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ---------- PAGINATION ---------- */}
        {/* ---------- PAGINATION ---------- */}
        <div className="admin-pagination">
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span className="pagination-info">
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
