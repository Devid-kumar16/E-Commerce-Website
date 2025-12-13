// src/admin/components/CustomersPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import useAdminApi from "../useAdminApi";

export default function CustomersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const data = await api(`/customers?${params.toString()}`);
      setItems(data.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, search]);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <section className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Customers</h2>
      </div>

      <div className="admin-filters-row">
        <div className="admin-search-input">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email"
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
              <th>Total Orders</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.total_orders}</td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 16 }}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
