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

      const res = await api.get("/orders/admin/orders", {
        params: {
          page: pageToLoad,
          limit: PAGE_SIZE,
        },
      });

      const data = res.data?.orders || [];
      const meta = res.data?.meta || {};

      setOrders(data);
      setPage(meta.page || pageToLoad);

      const total = meta.total ?? data.length;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error("Load orders error:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, []);

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h2 className="page-title">Orders</h2>

        <Link to="/admin/orders/new" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      {/* ===== TABLE CARD ===== */}
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
            </tr>
          </thead>

          <tbody>
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((o, index) => (
              <tr key={o.id || index}>
                {/* Order ID */}
                <td>{o.id ?? (page - 1) * PAGE_SIZE + index + 1}</td>

                {/* Customer */}
                <td>{o.customer_name || "—"}</td>

                {/* Area */}
                <td>{o.area || "—"}</td>

                {/* Address */}
                <td>{o.address || "—"}</td>

                {/* Total */}
                <td>{o.total_amount}</td>

                {/* Status */}
                <td>
                  <span className={`badge badge-${o.status?.toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>

                {/* Created */}
                <td>{o.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        <div className="pagination-bar">
          <button
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => loadOrders(page - 1)}
          >
            Prev
          </button>

          <span className="pagination-info">
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            className="pagination-btn"
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
