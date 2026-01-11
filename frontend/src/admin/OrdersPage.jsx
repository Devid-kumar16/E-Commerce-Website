import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAdminApi from "./useAdminApi";
import { useAuth } from "../context/AuthContext";   // 🔥 Add this
import "./OrdersAdmin.css";

export default function OrdersPage() {
  const api = useAdminApi();
  const { loading: authLoading, isAdmin } = useAuth();   // 🔥 Add this

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const PAGE_SIZE = 10;

  /* ======================================================
        FIX #1 — WAIT FOR AUTH BEFORE LOADING ORDERS
  =======================================================*/
  useEffect(() => {
    if (authLoading) return;   // 🔥 Wait for AuthContext
    if (!isAdmin) return;      // 🔥 AdminGuard will handle redirect

    loadOrders();
  }, [authLoading, isAdmin, page, search]);

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async () => {
    try {
      setLoading(true);

      // SEARCH MODE
      if (search.trim()) {
        const res = await api.get("/admin/orders", {
          params: { limit: 10000 },
        });
        setOrders(res.data?.orders || []);
        setTotalPages(1);
        return;
      }

      // PAGINATION MODE
      const res = await api.get("/orders", {
        params: { page, limit: PAGE_SIZE },
      });

      setOrders(res.data?.orders || []);

      const total = res.data?.meta?.total || 0;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error("ORDER LOAD ERROR:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH HELPERS ================= */
  const getDateVariants = (dateStr) => {
    if (!dateStr) return [];
    const d = new Date(dateStr);
    if (isNaN(d)) return [];

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return [`${dd}/${mm}/${yyyy}`, `${mm}/${dd}/${yyyy}`, `${yyyy}-${mm}-${dd}`];
  };

  /* ================= FILTER LOGIC ================= */
  const filteredOrders = orders.filter((o) => {
    const amount = o.final_amount ?? o.total_amount ?? "";
    const dateVariants = getDateVariants(o.created_at);

    const text = `
      ${o.id}
      ${o.customer_name || ""}
      ${o.area || ""}
      ${o.delivery_status || ""}
      ${o.payment_status || ""}
      ${amount}
      ${dateVariants.join(" ")}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  /* ================= DELETE ORDER ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");

      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  /* ======================================================
        FIX #2 — SHOW LOADING UNTIL AUTH IS READY
  =======================================================*/
  if (authLoading) {
    return <div className="admin-loading">Checking access…</div>;
  }

  if (loading) {
    return <div className="admin-loading">Loading orders…</div>;
  }

  /* ================= RENDER UI ================= */
  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">Orders</h2>

        <div className="header-actions">
          <div className="admin-search">
            <span className="search-icon">🔍</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, date, status, amount..."
            />

            {search && (
              <button className="clear-btn" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <Link to="/admin/orders/new" className="btn-primary">
            Create Order
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-card">
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

            {filteredOrders.map((o, index) => (
              <tr key={o.id}>
                <td>{index + 1}</td>
                <td>{o.customer_name || "Guest User"}</td>
                <td>{o.area || "—"}</td>

                <td>
                  ₹{Number(o.final_amount ?? o.total_amount ?? 0).toFixed(2)}
                </td>

                <td>
                  <span
                    className={`status-badge status-${
                      o.delivery_status?.toLowerCase() || "pending"
                    }`}
                  >
                    {o.delivery_status || "Pending"}
                  </span>
                  <div className="payment-sub">
                    Payment: <strong>{o.payment_status}</strong>
                  </div>
                </td>

                <td>{new Date(o.created_at).toLocaleDateString()}</td>

                <td>
                  <Link to={`/admin/orders/${o.id}`} className="btn-view">
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
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        {!search && totalPages > 1 && (
          <div className="pagination-wrapper">
            <button
              className="pagination-btn left-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span className="pagination-center">
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <button
              className="pagination-btn right-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
