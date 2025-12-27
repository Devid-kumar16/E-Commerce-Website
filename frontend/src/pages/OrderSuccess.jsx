import { useParams, Link } from "react-router-dom";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="order-success-page">
      <div className="success-card">
        <h1>🎉 Thank You!</h1>
        <p>Your order has been placed successfully.</p>

        <div className="order-id">
          <strong>Order ID:</strong> {id}
        </div>

        <div className="success-actions">
          <Link to="/orders" className="btn-outline">
            View My Orders
          </Link>

          <Link to="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
