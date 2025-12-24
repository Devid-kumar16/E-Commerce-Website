import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= TOTAL ================= */
  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.qty || 1),
    0
  );

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!phone || !area || !address || !paymentMethod) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cart: cart.map((item) => ({
          product_id: item.id,
          quantity: item.qty || 1,
        })),
        phone,
        area,
        address,
        payment_method: paymentMethod,   // ✅ BACKEND MATCH
        total_amount: totalAmount,       // ✅ BACKEND MATCH
      };

      const res = await api.post("/orders", payload);

      if (res.data?.ok) {
        clearCart();
        navigate(`/order-success/${res.data.orderId}`);
      } else {
        setError(res.data?.message || "Order failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.message ||
        "Order failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {error && <p className="checkout-error">{error}</p>}

      <div className="checkout-form">
        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <textarea
          placeholder="Full Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
        </select>

        <p><strong>Total:</strong> ₹{totalAmount.toFixed(2)}</p>

        <button
          className="checkout-btn"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
