import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

export default function CustomersPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PAGE_SIZE = 10;

  /* ---------- LOAD CUSTOMERS ---------- */
  const load = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/customers/admin", {
          params: {
            page: pageToLoad,
            limit: PAGE_SIZE,
            q: search,
          },
        });

        // ✅ CORRECT RESPONSE MAPPING
        const customers = res.data?.data || [];
        const meta = res.data?.meta || {};

        setItems(customers);
        setPage(meta.page || pageToLoad);
        setTotalPages(
          Math.max(1, Math.ceil((meta.total || 0) / PAGE_SIZE))
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load customers"
        );
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  /* Reload when search changes */
  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="admin-main-content">
      <h2 className="admin-page-title">Customers</h2>

      {/* Search */}
      <div className="admin-filters-row">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      {/* Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No customers found
              </td>
            </tr>
          )}

          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.orders}</td>
              <td>{String(c.created_at).slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="admin-pagination">
        <button
          disabled={page <= 1}
          onClick={() => load(page - 1)}
          type="button"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
