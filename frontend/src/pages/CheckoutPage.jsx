import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import "../styles/CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, []);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price) * (item.qty || 1),
    0
  );

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      setError("Your cart is empty");
      return;
    }

    if (!phone || !area || !address) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        cart: cart.map((item) => ({
          product_id: item.id,
          quantity: item.qty || 1,
        })),
        phone,
        area,
        address,
        payment_method: paymentMethod,
      };

      const res = await api.post("/orders", payload);

      if (res.data?.ok === true) {
        clearCart(); // ✅ VERY IMPORTANT
        navigate(`/order-success/${res.data.order_id}`);
        return;
      }

      throw new Error("Order failed");
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Order failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2 className="checkout-title">Checkout</h2>

      {error && <p className="checkout-error">{error}</p>}

      <div className="checkout-box">
        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Area / City"
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

        <div className="checkout-total">
          <strong>Total:</strong> ₹{totalAmount.toFixed(2)}
        </div>

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
