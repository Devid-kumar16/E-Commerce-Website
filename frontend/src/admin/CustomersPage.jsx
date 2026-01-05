import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PAGE_SIZE = 10;

  /* ================= LOAD CUSTOMERS ================= */
  const load = useCallback(
    async (pageToLoad = 1) => {
      // ⛔ wait for auth
      if (authLoading) return;

      // 🔐 admin guard
      if (!user || user.role !== "admin") {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await api.get("/admin/customers", {
          params: {
            page: pageToLoad,
            limit: PAGE_SIZE,
            q: search || undefined,
          },
        });

        // ✅ normalize response (industry standard)
        const customers =
          res.data?.customers ||
          res.data?.data ||
          [];

        const meta = res.data?.meta || {};

        setItems(customers);
        setPage(meta.page || pageToLoad);

        const total =
          meta.total ?? customers.length;

        setTotalPages(
          Math.max(1, Math.ceil(total / PAGE_SIZE))
        );
      } catch (err) {
        // ✅ 401 handled by interceptor
        if (err.response?.status === 401) {
          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to load customers"
        );
      } finally {
        setLoading(false);
      }
    },
    [user, authLoading, search]
  );

  /* ================= INITIAL + SEARCH LOAD ================= */
  useEffect(() => {
    load(1);
  }, [load]);

  /* ================= STATES ================= */
  if (authLoading) {
    return <div className="admin-loading">Loading…</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="admin-error">Access denied</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">
            View and manage registered customers
          </p>
        </div>

        <Link to="/admin/customers/new" className="btn-primary">
          Add Customer
        </Link>
      </div>

      {/* ================= FILTER ================= */}
      <div className="admin-filters-row">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading…</div>}

      {/* ================= TABLE ================= */}
      <div className="admin-card">
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

            {items.map((c, index) => (
              <tr key={c.id}>
                {/* ✅ SERIAL NUMBER (pagination-safe) */}
                <td>
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>

                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.orders ?? 0}</td>
                <td>
                  {String(c.created_at).slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        <div className="pagination-bar">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            Prev
          </button>

          <span className="pagination-info">
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            className="pagination-btn"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
