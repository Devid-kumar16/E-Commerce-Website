import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/orders/${id}`);

        if (!res.data?.order) {
          throw new Error("Order not found");
        }

        setOrder(res.data.order);
        setItems(Array.isArray(res.data.items) ? res.data.items : []);
      } catch (err) {
        console.error("Order load failed:", err);
        setError("Order not found");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="center error">{error}</p>;

  return (
    <div className="order-details-page">
      <h2>Order {order.id}</h2>

      {/* ===== ORDER SUMMARY ===== */}
      <div className="order-summary">
        <div>
          <strong>Total:</strong>{" "}
          ₹{Number(order.total_amount ?? 0).toFixed(2)}
        </div>

        <div>
          <strong>Payment Method:</strong> {order.payment_method}
        </div>

        <div>
          <strong>Payment Status:</strong>{" "}
          <span className={`status ${order.payment_status?.toLowerCase()}`}>
            {order.payment_status}
          </span>
        </div>

        <div>
          <strong>Delivery Status:</strong>{" "}
          <span className={`status ${order.delivery_status?.toLowerCase()}`}>
            {order.delivery_status}
          </span>
        </div>
      </div>

      {/* ===== ITEMS ===== */}
      <h3>Items</h3>

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const price = Number(item.price ?? 0);
              const qty = Number(item.quantity ?? 0);
              const subtotal = price * qty;

              return (
                <tr key={idx}>
                  <td>{item.product_name}</td>
                  <td>₹{price.toFixed(2)}</td>
                  <td>{qty}</td>
                  <td>₹{subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Link to="/orders" className="back-link">
        Back to My Orders
      </Link>
    </div>
  );
}
