import React, { useEffect, useState, useCallback } from "react";
import useAdminApi from "../useAdminApi";

export default function OrdersPage() {
  const api = useAdminApi();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    total_amount: "",
    status: "Pending",
  });

  /* ================= LOAD ORDERS ================= */
  const load = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoading(true);
        setErr("");

        const res = await api(
          `/orders/admin?page=${pageToLoad}&limit=10`
        );

        setItems(res.orders || []);
        setPage(res.meta?.page || pageToLoad);
        setTotalPages(
          Math.ceil((res.meta?.total || 0) / 10) || 1
        );
      } catch (e) {
        console.error(e);
        setErr("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  /* ================= CREATE ORDER ================= */
  const saveOrder = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      await api("/orders/admin", {
        method: "POST",
        body: {
          user_id: Number(form.user_id),
          total_amount: Number(form.total_amount),
          status: form.status,
        },
      });

      setForm({ user_id: "", total_amount: "", status: "Pending" });
      load(page);
    } catch (e) {
      console.error(e);
      setErr("Failed to create order");
    }
  };

  const goPrev = () => page > 1 && load(page - 1);
  const goNext = () => page < totalPages && load(page + 1);

  return (
    <section className="admin-main-content">
      <h2 className="admin-page-title">Orders</h2>

      {err && <div className="admin-error">{err}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
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
                <td>{o.customer_name || "-"}</td>
                <td>₹{o.total_amount}</td>
                <td>{o.status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}

            {!items.length && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button disabled={page <= 1} onClick={goPrev}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={goNext}>
          Next
        </button>
      </div>

      <hr />

      <h3>Create Order (Admin)</h3>

      <form onSubmit={saveOrder} className="admin-form-grid">
        <label>
          User ID
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
          Total Amount
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
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Create Order
        </button>
      </form>
    </section>
  );
}
