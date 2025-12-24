import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAdminApi from "./useAdminApi";
import "./OrderDetails.css";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const api = useAdminApi();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/orders/admin/${id}`);
        const data = res?.data || res;

        if (!data?.order) {
          throw new Error("Order not found");
        }

        const rawOrder = data.order;

        // ✅ NORMALIZE BACKEND DATA (PERMANENT FIX)
        const normalizedOrder = {
          id: rawOrder.id,
          totalAmount: Number(rawOrder.total_amount),
          paymentMethod: rawOrder.payment_method,
          status: rawOrder.status,
          createdAt: rawOrder.created_at,

          customerName: rawOrder.customer_name,
          customerEmail: rawOrder.customer_email,
          phone: rawOrder.phone,
          address: rawOrder.address,
          area: rawOrder.area,
        };

        if (mounted) {
          setOrder(normalizedOrder);
          setItems(data.items || []);
        }
      } catch (err) {
        console.error("Order load error:", err);
        if (mounted) {
          setError("Failed to load order details");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();
    return () => (mounted = false);
  }, [id]);

  /* ================= SAFE RENDER ================= */

  if (loading) return <div className="admin-page">Loading…</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!order) return null;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Order {order.id}</h2>
        <Link to="/admin/orders" className="btn-secondary">
          Back
        </Link>
      </div>

      <div className="summary-grid">
        <div className="summary-box">
          <h4>Total</h4>
          <p>₹{order.totalAmount.toFixed(2)}</p>
        </div>

        <div className="summary-box">
          <h4>Payment</h4>
          <p>{order.paymentMethod}</p>
        </div>

        <div className="summary-box">
          <h4>Status</h4>
          <p>{order.status}</p>
        </div>
      </div>

      <div className="admin-card">
        <h3>Customer Details</h3>
        <p><b>Name:</b> {order.customerName || "-"}</p>
        <p><b>Email:</b> {order.customerEmail || "-"}</p>
        <p>
          <b>Phone:</b>{" "}
          {order.phone && order.phone.trim() !== ""
            ? order.phone
            : "Not provided"}
        </p>
        <p><b>Address:</b> {order.address || "-"}</p>
      </div>

      <div className="admin-card">
        <h3>Order Items</h3>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No items found
                </td>
              </tr>
            )}

            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name}</td>
                <td>₹{Number(item.price).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
