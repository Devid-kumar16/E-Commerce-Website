// src/admin/CustomersPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { API_BASE } from "../config";

export default function CustomersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setErr("");
      const params = new URLSearchParams();
      params.set("page", pageToLoad);
      params.set("limit", 10);
      if (search) params.set("search", search);

      const res = await fetch(
        `${API_BASE}/api/customers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load customers");

      setItems(data.data || []);
      setPage(data.page || pageToLoad);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [search]);

  return (
    <div className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Customers</h2>
      </div>

      <div className="admin-filters-row">
        <div className="admin-search-input">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {err && <div className="admin-error">{err}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      <div className="admin-table-wrapper">
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
            {items
              .slice() // original array ko copy kiya
              .sort((a, b) => Number(a.id) - Number(b.id)) // ID ascending order
              .map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.orders_count ?? "-"}</td>
                  <td>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}

            {!items.length && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
