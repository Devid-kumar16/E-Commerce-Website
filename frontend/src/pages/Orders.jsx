import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/orders/my");
        setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
      } catch (err) {
        console.error("Load orders failed:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="center error">{error}</p>;

  return (
    <div className="orders-page">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div className="order-card">You have no orders yet.</div>
      ) : (
        orders.map((order) => {
          /* ================= SAFE AMOUNT HANDLING ================= */

          const totalAmount = Number(order.total_amount ?? 0);
          const discountAmount = Number(order.discount_amount ?? 0);
          const finalAmount =
            order.final_amount !== null && order.final_amount !== undefined
              ? Number(order.final_amount)
              : totalAmount - discountAmount;

          const status = order.delivery_status || "Pending";

          return (
            <div className="order-card" key={order.id}>
              <div className="order-info">
                <strong>Order #{order.id}</strong>

                <div>
                  <strong>Total:</strong> ₹{finalAmount.toFixed(2)}
                </div>

                <div>
                  <strong>Status:</strong> {status}
                </div>
              </div>

              <Link to={`/orders/${order.id}`} className="view-link">
                View
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
}
