import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import AdminSearchBar from "../components/AdminSearchBar";

/* ===== PAGINATION CONFIG ===== */
const ITEMS_PER_PAGE = 10;

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

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

  /* ================= SEARCH ================= */
  const filteredItems = items.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  

  // reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );

  const paginatedItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* HEADER */}
<div className="page-header">
  <h2>Categories</h2>

  <div style={{ display: "flex", gap: 12 }}>
    <AdminSearchBar
      value={search}
      onChange={setSearch}
      placeholder="Search categories..."
    />

    <Link to="/admin/categories/new" className="btn btn-primary">
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
                {/* Serial number */}
                <td>
                  {(page - 1) * ITEMS_PER_PAGE + index + 1}
                </td>

                <td>{c.name}</td>

                <td>
                  <span
                    className={`badge ${
                      c.status === "active"
                        ? "badge-success"
                        : "badge-danger"
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
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <span className="text-muted">No Image</span>
                  )}
                </td>

                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      navigate(`/admin/categories/${c.id}/edit`)
                    }
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
          <div className="admin-pagination">
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <span className="pagination-info">
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
