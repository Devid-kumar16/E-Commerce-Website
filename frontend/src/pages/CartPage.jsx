import React, { useEffect, useState } from "react";
import "../styles/Cart.css";

/* ✅ Cart helpers */
const CART_KEY = "estore_cart_v1";

const getCart = () =>
  JSON.parse(localStorage.getItem(CART_KEY) || "[]");

const saveCart = (cart) =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

export default function CartPage() {
  const [cart, setCart] = useState([]);

  /* 🔁 Load cart on page load */
  useEffect(() => {
    setCart(getCart());
  }, []);

  /* ➕➖ Update quantity */
  const updateQty = (id, qty) => {
    if (qty < 1) return;

    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty } : item
    );

    setCart(updated);
    saveCart(updated);
  };

  /* ❌ Remove item */
  const removeFromCart = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    saveCart(updated);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

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
                src={item.image}
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
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>
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
            <span>{cart.length}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
