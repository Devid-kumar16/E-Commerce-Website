import React, { useEffect, useState, useCallback} from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAdminApi from "./useAdminApi";
import "./OrdersAdmin.css";

export default function OrdersPage() {
  const api = useAdminApi();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);

        const res = await api.get("/orders/admin", {
          params: { page, limit: PAGE_SIZE },
        });

        if (!isMounted) return;

        const data = res.data;
        setOrders(data.orders || []);

        const total = data.meta?.total || 0;
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (err) {
        if (!isMounted) return;
        console.error("Load orders error:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load orders"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [page, api]);

  /* ================= DELETE ORDER ================= */
  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!ok) return;

    try {
      await api.delete(`/orders/admin/${id}`);

      toast.success("Order deleted successfully");

      // ✅ Optimistic UI update
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete order"
      );
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2>Orders</h2>

        <Link to="/admin/orders/new" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">
            Loading orders...
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Area</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No orders found
                  </td>
                </tr>
              )}

              {orders.map((order, index) => (
                <tr key={order.id}>
                  {/* Sequential number */}
                  <td>{(page - 1) * PAGE_SIZE + index + 1}</td>

                  <td>{order.customer_name || "—"}</td>
                  <td>{order.area || "—"}</td>

                  <td>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toFixed(2)}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${order.status?.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="actions-cell">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="btn-view"
                    >
                      View
                    </Link>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(order.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
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
      </div>
    </div>
  );
}
