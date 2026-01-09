import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./CustomersAdmin.css";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ============= DATE VARIANTS FOR SEARCH ============= */
  const getDateVariants = (dateStr) => {
    if (!dateStr) return [];
    const d = new Date(dateStr);
    if (isNaN(d)) return [];

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return [`${dd}/${mm}/${yyyy}`, `${mm}/${dd}/${yyyy}`, `${yyyy}-${mm}-${dd}`];
  };

  /* ============= LOAD CUSTOMERS ============= */
  const load = useCallback(
    async (pageToLoad = 1) => {
      if (authLoading || !user || user.role !== "admin") return;

      try {
        setLoading(true);
        setError("");

        // SEARCH → Load all customers
        if (search.trim()) {
          const res = await api.get("/admin/customers", { params: { limit: 10000 } });
          const customers = res.data?.customers || res.data?.data || [];
          setItems(customers);
          setTotalPages(1);
          setPage(1);
          return;
        }

        // PAGINATION → Load per page
        const res = await api.get("/admin/customers", {
          params: { page: pageToLoad, limit: PAGE_SIZE },
        });

        const customers = res.data?.customers || res.data?.data || [];
        const meta = res.data?.meta || {};

        setItems(customers);
        setPage(meta.page || pageToLoad);

        const total = meta.total ?? customers.length;
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    },
    [user, authLoading, search]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  /* ============= SEARCH FILTER ============= */
  const filteredItems = items.filter((c) => {
    const dateVariants = getDateVariants(c.created_at);

    const searchText = `
      ${c.name}
      ${c.email}
      ${c.orders}
      ${dateVariants.join(" ")}
    `.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  /* ============= AUTH CHECK ============= */
  if (authLoading) return <div className="admin-loading">Loading…</div>;
  if (!user || user.role !== "admin") return <div className="admin-error">Access denied</div>;

  /* ============= UI ============= */
  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">View and manage registered customers</p>
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
              <button className="clear-btn" onClick={() => setSearch("")}>
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
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filteredItems.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No customers found
                </td>
              </tr>
            )}

            {filteredItems.map((c, index) => (
              <tr key={c.id}>
                <td>{!search ? (page - 1) * PAGE_SIZE + index + 1 : index + 1}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.orders ?? 0}</td>
                <td>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION - FIXED (Left–Center–Right) */}
        {!search && totalPages > 1 && (
          <div className="pagination-wrapper">

            <button
              className="pagination-btn left-btn"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
            >
              Prev
            </button>

            <span className="pagination-center">
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <button
              className="pagination-btn right-btn"
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
            >
              Next
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
