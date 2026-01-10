import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./CustomersAdmin.css";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ======================= DATE FORMATTER ======================= */
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  /* ======================= LOAD CUSTOMERS ======================= */
  const loadCustomers = useCallback(
    async (pageToLoad = 1) => {
      if (authLoading || !user || user.role !== "admin") return;

      try {
        setLoading(true);
        setError("");

        // 👉 SEARCH MODE — Load all once then filter
        if (search.trim()) {
          const res = await api.get("/admin/customers", {
            params: { limit: 10000 },
          });

          let list = res.data?.customers || [];

          // Sort (latest first)
          list.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          setCustomers(list);
          setPage(1);
          setTotalPages(1);
          return;
        }

        // 👉 PAGINATION MODE
        const res = await api.get("/admin/customers", {
          params: { page: pageToLoad, limit: PAGE_SIZE },
        });

        const list = res.data?.customers || [];
        const meta = res.data?.meta || {};

        // Always sort (latest first)
        list.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setCustomers(list);
        setPage(meta.page || pageToLoad);

        const total = meta.total ?? list.length;
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    },
    [user, authLoading, search]
  );

  /* ======================= AUTO LOAD ======================= */
  useEffect(() => {
    loadCustomers(1);
  }, [loadCustomers]);

  /* ======================= FILTER SEARCH ======================= */
  const filtered = customers.filter((c) => {
    const text = `
      ${c.name}
      ${c.email}
      ${c.orders}
      ${formatDate(c.created_at)}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  /* ======================= AUTH CHECK ======================= */
  if (authLoading) return <div className="admin-loading">Loading…</div>;
  if (!user || user.role !== "admin")
    return <div className="admin-error">Access denied</div>;

  /* ======================= UI ======================= */
  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">
            View and manage registered customers
          </p>
        </div>

        <div className="header-actions">
          <div className="admin-search">
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Search by name, email, orders or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="clear-btn"
                onClick={() => {
                  setSearch("");
                  loadCustomers(1); // Reload after clear
                }}
              >
                ×
              </button>
            )}
          </div>

          <Link to="/admin/customers/new" className="btn-primary">
            Add Customer
          </Link>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading…</div>}

      {/* TABLE */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No customers found
                </td>
              </tr>
            )}

            {filtered.map((c, index) => (
              <tr key={c.id}>
                <td>{!search ? (page - 1) * PAGE_SIZE + index + 1 : index + 1}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.orders ?? 0}</td>
                <td>{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        {!search && totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              className="pagination-btn left-btn"
              disabled={page <= 1}
              onClick={() => loadCustomers(page - 1)}
            >
              Prev
            </button>

            <span className="pagination-center">
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <button
              className="pagination-btn right-btn"
              disabled={page >= totalPages}
              onClick={() => loadCustomers(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
