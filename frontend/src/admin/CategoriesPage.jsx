import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./CategoriesAdmin.css";

const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/categories/admin");
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

  /* SEARCH */
  const filteredItems = items.filter((c) => {
    const searchableText = `${c.name} ${c.status}`.toLowerCase();
    return searchableText.includes(search.toLowerCase());
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* PAGINATION */
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">Categories</h2>

        <div className="header-actions">
          <div className="admin-search">
            <span className="search-icon">🔍</span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or status..."
            />

            {search && (
              <button className="clear-btn" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <Link to="/admin/categories/new" className="btn-primary">
            Add Category
          </Link>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p className="admin-loading">Loading...</p>}

      {/* TABLE */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Status</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No categories found
                </td>
              </tr>
            )}

            {paginatedItems.map((c, index) => (
              <tr key={c.id}>
                <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>

                <td>{c.name}</td>

                <td>
                  <span
                    className={`status-badge ${
                      c.status === "active" ? "badge-active" : "badge-inactive"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>

                <td>
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      className="category-img"
                    />
                  ) : (
                    <span className="muted">No Image</span>
                  )}
                </td>

                <td>
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/admin/categories/${c.id}/edit`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              className="pagination-btn left-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span className="pagination-center">
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <button
              className="pagination-btn right-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
