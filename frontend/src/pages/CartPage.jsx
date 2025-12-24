import React from "react";
import "../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthProvider";

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useCart();
  const { user } = useAuth(); // ✅ logged-in user
  const navigate = useNavigate();

  /* 🧮 Calculate total */
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  /* ✅ CHECKOUT HANDLER (INDUSTRY STANDARD) */
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!user) {
      // redirect to login, then back to checkout
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="cart-page">
      <h2 className="cart-title">Your Cart</h2>

      <div className="cart-container">
        {/* LEFT - CART ITEMS */}
        <div className="cart-items">
          {cart.length === 0 && (
            <p className="empty-cart">Your cart is empty</p>
          )}

          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img
                src={item.image || item.image_url}
                alt={item.name}
                className="cart-image"
                onError={(e) =>
                  (e.currentTarget.src = "/images/placeholder.png")
                }
              />

              <div className="cart-details">
                <h4>{item.name}</h4>
                <p className="cart-price">₹{item.price}</p>

                <div className="cart-actions">
                  <div className="qty-box">
                    Qty:
                    <div className="qty-control">
                      <button
                        onClick={() =>
                          updateQty(item.id, item.qty - 1)
                        }
                        disabled={item.qty <= 1}
                      >
                        -
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(item.id, item.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-subtotal">
                ₹{item.price * item.qty}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Items</span>
            <span>
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* ✅ FIXED BUTTON */}
          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
