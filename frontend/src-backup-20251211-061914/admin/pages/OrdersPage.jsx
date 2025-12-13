// src/admin/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";


import { API_BASE } from "../../config";


export default function OrdersPage() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // create order form state
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("created");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [formMsg, setFormMsg] = useState("");

  const load = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      params.set("page", pageToLoad);
      params.set("limit", 10);
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE}/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");

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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormErr("");
    setFormMsg("");

    if (!customerId || !amount) {
      setFormErr("Customer user_id and total amount required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: customerId,
          total_amount: amount,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      setFormMsg(`Order #${data.id} created for ${data.customer_name}`);
      setCustomerId("");
      setAmount("");
      setStatus("created");

      // reload first page
      load(1);
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Orders</h2>
      </div>

      <div className="admin-filters-row">
        <div className="admin-search-input">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Search by order id, customer or status..."
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
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  {o.customer_name}
                  <br />
                  <span className="admin-table-subtext">
                    {o.customer_email}
                  </span>
                </td>
                <td>₹{o.total_amount}</td>
                <td className="admin-status-cell">
                  <span className={`badge badge-status-${o.status || "default"}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  {o.created_at
                    ? new Date(o.created_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}

            {!items.length && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>
                  No orders found
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

      {/* Create order (admin) */}
      <div style={{ marginTop: 32 }}>
        <h3 className="admin-section-title">Create order (admin)</h3>

        {formErr && <div className="admin-error">{formErr}</div>}
        {formMsg && <div className="admin-success">{formMsg}</div>}

        <form
          className="admin-form-row"
          onSubmit={handleCreateOrder}
          style={{ gap: 12, alignItems: "center" }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label>Customer user_id</label>
            <input
              type="number"
              min="1"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label>Total amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="created">Created</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !customerId || !amount}
            className="admin-primary-btn"
          >
            {saving ? "Saving..." : "Save order"}
          </button>
        </form>
      </div>
    </div>
  );
}
