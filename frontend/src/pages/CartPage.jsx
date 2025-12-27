import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/CartPage.css";

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useCart();

  // ✅ IMPORTANT: define navigate
  const navigate = useNavigate();

  if (!cart.length) {
    return <h2 className="cart-empty">Your cart is empty</h2>;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  );

  return (
    <div className="cart-page">
      <h2 className="cart-title">My Cart</h2>

      <div className="cart-container">
        {/* CART ITEMS */}
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-card">
              <img
                src={item.image_url || item.image}
                alt={item.name}
                className="cart-img"
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />

              <div className="cart-info">
                <h4>{item.name}</h4>
                <p className="price">₹{item.price}</p>

                <div className="qty-row">
                  <button
                    onClick={() =>
                      updateQty(item.id, Math.max(1, item.qty - 1))
                    }
                  >
                    -
                  </button>

                  <span>{item.qty}</span>

                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CART SUMMARY */}
        <div className="cart-summary">
          <h3>Price Details</h3>

          <p>Total Items: {cart.length}</p>

          <p className="total">
            Total: ₹{total}
          </p>

          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
