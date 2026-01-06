import React, { useEffect, useState } from "react";
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
  const [search, setSearch] = useState("");

  const PAGE_SIZE = 10;

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        // 🔥 IF SEARCH EXISTS → LOAD ALL ORDERS
        if (search.trim()) {
          const res = await api.get("/admin/orders", {
            params: { limit: 10000 }, // load all for search
          });

          setOrders(res.data?.orders || []);
          setTotalPages(1);
          return;
        }

        // 🔹 NORMAL PAGINATION MODE
        const res = await api.get("/admin/orders", {
          params: { page, limit: PAGE_SIZE },
        });

        setOrders(res.data?.orders || []);

        const total = res.data?.meta?.total || 0;
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [page, search]);

  /* ================= DATE VARIANTS ================= */
  const getDateVariants = (dateStr) => {
    if (!dateStr) return [];
    const d = new Date(dateStr);
    if (isNaN(d)) return [];

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return [
      `${dd}/${mm}/${yyyy}`,
      `${mm}/${dd}/${yyyy}`,
      `${yyyy}-${mm}-${dd}`,
    ];
  };

  /* ================= SEARCH FILTER ================= */
  const filteredOrders = orders.filter((o) => {
    const finalAmount = o.final_amount ?? o.total_amount ?? "";

    const dateVariants = getDateVariants(o.created_at);

    const text = `
      ${o.id}
      ${o.customer_name || ""}
      ${o.area || ""}
      ${o.delivery_status || ""}
      ${o.payment_status || ""}
      ${finalAmount}
      ${dateVariants.join(" ")}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`/admin/orders/${id}`);
      toast.success("Order deleted");
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">Orders</h2>

        <div className="header-actions">
          {/* SEARCH */}
          <div className="admin-search">
            <span className="search-icon">🔍</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, date, status, total..."
            />

            {search && (
              <button className="clear-btn" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <Link to="/admin/orders/new" className="btn btn-primary">
            Create Order
          </Link>
        </div>
      </div>

      {/* TABLE */}
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

              {filteredOrders.map((o, index) => (
                <tr key={o.id}>
                  <td>{index + 1}</td>
                  <td>{o.customer_name || "Guest"}</td>
                  <td>{o.area || "—"}</td>
                  <td>
                    ₹{Number(o.final_amount ?? o.total_amount ?? 0).toFixed(2)}
                  </td>
                  <td>
                    <span className="status-badge">
                      {o.delivery_status || "Pending"}
                    </span>
                    <div className="payment-sub">
                      Payment: <strong>{o.payment_status}</strong>
                    </div>
                  </td>
                  <td>
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString()
                      : "—"}
                  </td>
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
        )}

        {/* PAGINATION (ONLY WHEN NOT SEARCHING) */}
        {!search && totalPages > 1 && (
          <div className="pagination-bar">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
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
