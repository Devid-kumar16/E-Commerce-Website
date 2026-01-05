import React, { useState, useEffect, useMemo } from "react";
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

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
  }, [cart]);

  /* ================= STOCK CHECK ================= */
  const outOfStockItem = useMemo(
    () => cart.find((item) => item.stock <= 0),
    [cart]
  );

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async () => {
    setError("");

    /* ---- Frontend validations ---- */
    if (!cart.length) {
      setError("Your cart is empty");
      return;
    }

    if (outOfStockItem) {
      setError(`${outOfStockItem.name} is out of stock`);
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!area.trim()) {
      setError("Area / City is required");
      return;
    }

    if (!address.trim()) {
      setError("Address is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cart: cart.map((item) => ({
          product_id: item.id,
          quantity: item.qty,
        })),
        phone: phone.trim(),
        area: area.trim(),
        address: address.trim(),
        payment_method: paymentMethod,
      };

      const res = await api.post("/orders", payload);

      if (res.data?.ok) {
        clearCart();
        navigate(`/order-success/${res.data.order_id}`);
      }
    } catch (err) {
      const data = err.response?.data;

      /* ---- Proper backend error handling ---- */
      if (data?.code === "INSUFFICIENT_STOCK") {
        setError(data.message);
        return;
      }

      setError(data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
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
          disabled={loading || !!outOfStockItem}
          onClick={handlePlaceOrder}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
