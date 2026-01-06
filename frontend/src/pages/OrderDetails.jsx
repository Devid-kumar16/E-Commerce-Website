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
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
        setItems(res.data.items || []);
      } catch (err) {
        setError("Order not found");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) return <p className="center">Loading…</p>;
  if (error) return <p className="center error">{error}</p>;
  if (!order) return null;

  const subtotal = Number(order.total_amount ?? 0);
  const discount = Number(order.discount_amount ?? 0);
  const total = Number(order.final_amount ?? subtotal - discount);

  const paymentStatus = (order.payment_status || "Pending").toLowerCase();
  const deliveryStatus = (order.delivery_status || "Pending").toLowerCase();

  return (
    <div className="order-page">
      <h1 className="order-title">Order {order.id}</h1>

      <div className="order-grid">
        {/* ===== LEFT: ITEMS ===== */}
        <div className="order-left">
          <div className="card">
            <h2 className="section-title">Items</h2>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const price = Number(item.price ?? 0);
                  const qty = Number(item.quantity ?? 0);

                  return (
                    <tr key={index}>
                      <td className="product-name">
                        {item.product_name}
                      </td>
                      <td>₹{price.toFixed(2)}</td>
                      <td>{qty}</td>
                      <td>₹{(price * qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== RIGHT: SUMMARY ===== */}
        <div className="order-right">
          <div className="card summary-card">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row discount">
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>

            <div className="divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="divider"></div>

            <div className="payment-section">
              <p>
                <strong>Payment Method:</strong> {order.payment_method}
              </p>

              <div className="badges">
                <span className={`badge ${paymentStatus}`}>
                  {order.payment_status}
                </span>
                <span className={`badge ${deliveryStatus}`}>
                  {order.delivery_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link to="/orders" className="back-link">
         Back to My Orders
      </Link>
    </div>
  );
}
