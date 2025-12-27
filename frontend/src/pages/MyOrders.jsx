import { useEffect, useState } from "react";
import api from "../api/client";
import { Link } from "react-router-dom";
import "./MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my")
      .then(res => {
        setOrders(res.data.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center">Loading...</p>;

  if (!orders.length) {
    return <p className="center">No orders found</p>;
  }

  return (
    <div className="my-orders-page">
      <h2>My Orders</h2>

      {orders.map(order => (
        <div className="order-card" key={order.id}>
          <div>
            <strong>Order {order.id}</strong>
            <p>Total: ₹{order.total_amount}</p>
            <p>Status: {order.delivery_status}</p>
          </div>

          <Link to={`/orders/${order.id}`} className="view-btn">
            View
          </Link>
        </div>
      ))}
    </div>
  );
}
