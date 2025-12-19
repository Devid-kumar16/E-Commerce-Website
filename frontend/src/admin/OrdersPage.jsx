import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PAGE_SIZE = 10;

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/orders/admin", {
        params: { page: pageToLoad, limit: PAGE_SIZE },
      });

      setOrders(res.data.orders || []);
      setPage(res.data.meta?.page || pageToLoad);

      const total = res.data.meta?.total || 0;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, []);

  /* ================= DELETE ORDER ================= */
  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this order?");
    if (!ok) return;

    try {
      await api.delete(`/orders/admin/${id}`);
      loadOrders(page); // reload current page
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Orders</h2>
        <Link to="/admin/orders/new" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Area</th>
              <th>Address</th>
              <th>Total (₹)</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.area || "—"}</td>
                <td>{o.address || "—"}</td>
                <td>{o.total_amount}</td>
                <td>{o.status}</td>
                <td>{o.created_at?.slice(0, 10)}</td>

                {/* ✅ ACTION COLUMN (RIGHT SIDE) */}
                <td className="actions-cell">
                  <Link
                    to={`/admin/orders/${o.id}/edit`}
                    className="btn-edit"
                  >
                    Edit
                  </Link>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(o.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination-bar">
          <button
            disabled={page <= 1}
            onClick={() => loadOrders(page - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => loadOrders(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
