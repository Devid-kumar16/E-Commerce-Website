import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAdminApi from "./useAdminApi";
import "./OrdersAdmin.css";
import AdminSearchBar from "../components/AdminSearchBar";

export default function OrdersPage() {
  const api = useAdminApi();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const PAGE_SIZE = 10;

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const res = await api.get("/admin/orders", {
          params: { page, limit: PAGE_SIZE },
        });

        setOrders(res.data?.orders || []);

        const total = res.data?.meta?.total || 0;
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (err) {
        console.error("Load orders error:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [page]); // keep dependency clean

  /* ================= SEARCH ================= */
  const filteredOrders = orders.filter((o) =>
    `${o.customer_name} ${o.area} ${o.delivery_status} ${o.payment_status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`/admin/orders/${id}`);
      toast.success("Order deleted");

      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2>Orders</h2>

        <div style={{ display: "flex", gap: 12 }}>
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search orders..."
          />

          <Link to="/admin/orders/new" className="btn btn-primary">
            Create Order
          </Link>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading orders…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Customer</th>
                <th>Area</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No orders found
                  </td>
                </tr>
              )}

              {filteredOrders.map((o, index) => {
                const deliveryStatus = o.delivery_status || "Pending";
                const paymentStatus = o.payment_status || "Pending";

                // normalize for CSS
                const deliveryClass = deliveryStatus
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <tr key={o.id}>
                    <td>
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td>{o.customer_name || "—"}</td>

                    <td>{o.area || "—"}</td>

                    <td>
                      ₹{Number(o.total_amount || 0).toFixed(2)}
                    </td>

                    {/* ✅ DELIVERY + PAYMENT STATUS */}
                    <td>
                      <span
                        className={`status-badge status-${deliveryClass}`}
                      >
                        {deliveryStatus}
                      </span>

                      <div className="payment-sub">
                        Payment:{" "}
                        <strong>{paymentStatus}</strong>
                      </div>
                    </td>

                    <td>
                      {o.created_at
                        ? new Date(o.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="actions-cell">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="btn-view"
                      >
                        View
                      </Link>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(o.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
