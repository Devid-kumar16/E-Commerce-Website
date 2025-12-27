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
        const res = await api.get(`/orders/${id}`);

        setOrder(res.data.order);
        setItems(res.data.items || []);
      } catch (err) {
        console.error("Order load failed", err);
        setError("Order not found");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) return <p className="center">Loading...</p>;
  if (error || !order) return <p className="center">{error}</p>;

  return (
    <div className="order-details-page">
      <h2>Order #{order.id}</h2>

      <div className="order-summary">
        <p><strong>Total:</strong> ₹{order.total_amount}</p>
        <p><strong>Payment:</strong> {order.payment_method}</p>
        <p><strong>Status:</strong> {order.delivery_status}</p>
      </div>

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
            
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>{item.qty}</td>
                <td>₹{item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/orders" className="back-link">
        ← Back to My Orders
      </Link>
    </div>
  );
}
