import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

export default function OrdersPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    total_amount: "",
    status: "created",
  });

  const PAGE_SIZE = 10;

  /* ---------- LOAD ORDERS ---------- */
  const load = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoading(true);
        setErr("");

        const res = await api.get("/orders/admin", {
          params: {
            page: pageToLoad,
            limit: PAGE_SIZE,
            q: search,
          },
        });

        setItems(res.data.orders || []);
        setPage(res.data.page || pageToLoad);
        setTotalPages(
          Math.ceil((res.data.total || 0) / PAGE_SIZE) || 1
        );
      } catch (e) {
        setErr(
          e.response?.data?.message ||
            e.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  /* ---------- CREATE ORDER (ADMIN) ---------- */
  const saveOrder = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      await api.post("/orders/admin", {
        user_id: Number(form.user_id),
        total_amount: Number(form.total_amount),
        status: form.status,
      });

      setForm({ user_id: "", total_amount: "", status: "created" });
      load(page);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.message ||
          "Failed to save order"
      );
    }
  };

  const goPrev = () => page > 1 && load(page - 1);
  const goNext = () => page < totalPages && load(page + 1);

  /* ---------- UI ---------- */
  return (
    <section className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Orders</h2>
      </div>

      {/* Search */}
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

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total (₹)</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  <td>{o.customer_name || "-"}</td>


                </td>
                <td>{o.total_amount}</td>
                <td>{o.status}</td>
                <td>{String(o.created_at).slice(0, 10)}</td>
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

      {/* Pagination */}
      <div className="admin-pagination">
        <button disabled={page <= 1} onClick={goPrev} type="button">
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={goNext} type="button">
          Next
        </button>
      </div>

      {/* Admin Create Order */}
      <div className="admin-edit-panel">
        <h3 className="admin-panel-title">Create order (admin)</h3>

        <form onSubmit={saveOrder} className="admin-form-grid">
          <label>
            Customer user_id
            <input
              type="number"
              value={form.user_id}
              onChange={(e) =>
                setForm({ ...form, user_id: e.target.value })
              }
              required
            />
          </label>

          <label>
            Total amount (₹)
            <input
              type="number"
              value={form.total_amount}
              onChange={(e) =>
                setForm({ ...form, total_amount: e.target.value })
              }
              required
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="created">Created</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              Save order
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
