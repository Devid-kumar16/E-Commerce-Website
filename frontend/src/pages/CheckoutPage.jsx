import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import "../styles/CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  /* DELIVERY FIELDS */
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  /* COUPON STATE */
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* CALCULATE SUBTOTAL */
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.qty || 1),
      0
    );
  }, [cart]);

  const safeDiscount = Number(discount) || 0;
  const finalTotal = Math.max(subtotal - safeDiscount, 0);

  /* =====================================================
     LOAD ALL ACTIVE COUPONS
     Fix: show coupons even if min_order is NULL
  ===================================================== */
  const loadAvailableCoupons = async () => {
    try {
      const res = await api.get("/coupons/available", {
        params: { cartTotal: subtotal }
      });

      let coupons = res.data?.coupons || [];

      // FIX: min_order NULL should be treated as 0
      coupons = coupons.map(c => ({
        ...c,
        min_order: c.min_order ?? 0,
        max_discount: c.max_discount ?? c.value
      }));

      setAvailableCoupons(coupons);
    } catch (err) {
      console.error("Available coupons error:", err);
    }
  };

  useEffect(() => {
    if (subtotal > 0) {
      loadAvailableCoupons();
    }
  }, [subtotal]);

  /* APPLY COUPON */
  const applyCoupon = async (code) => {
    try {
      setCouponMsg("");
      setCoupon(null);
      setDiscount(0);

      const res = await api.post("/coupons/apply", {
        code,
        cartTotal: subtotal
      });

      setCoupon(code);
      setDiscount(Number(res.data.discount));
      setCouponMsg("Coupon applied successfully");
    } catch (err) {
      setCoupon(null);
      setDiscount(0);
      setCouponMsg(err.response?.data?.message || "Invalid coupon");
    }
  };

  /* PLACE ORDER */
  const placeOrder = async () => {
    setError("");

    if (!cart.length) return setError("Your cart is empty");
    if (!phone || !area || !address)
      return setError("Please fill all delivery details");
    if (!/^\d{10}$/.test(phone))
      return setError("Enter valid 10-digit phone number");

    try {
      setLoading(true);

      const payload = {
        cart: cart.map((item) => ({
          product_id: item.id,
          quantity: Number(item.qty || 1)
        })),
        phone,
        area,
        address,
        payment_method: paymentMethod,
        coupon_code: coupon
      };

      const res = await api.post("/orders", payload);

      if (res.data.ok) {
        clearCart();
        navigate(`/orders/${res.data.order_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      {/* LEFT SIDE */}
      <div className="checkout-left">
        <h3>Delivery Details</h3>
        {error && <p className="error">{error}</p>}

        <input
          placeholder="Phone Number"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
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
          <option value="CARD">Card</option>
        </select>
      </div>

      {/* RIGHT SIDE */}
      <div className="checkout-right">
        <h3>Order Summary</h3>

        <div className="price-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="price-row discount">
          <span>Discount</span>
          <span>-₹{safeDiscount.toFixed(2)}</span>
        </div>

        <div className="price-row total">
          <span>Total</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>

        {/* AVAILABLE COUPONS */}
        <div className="coupon-section">
          <h4>Available Offers</h4>

          {availableCoupons.length === 0 ? (
            <p className="no-coupons">No offers available</p>
          ) : (
            availableCoupons.map((c) => (
              <div
                key={c.id}
                className={`coupon-card ${coupon === c.code ? "active" : ""}`}
                onClick={() => applyCoupon(c.code)}
              >
                <div className="coupon-code">{c.code}</div>

                <div className="coupon-desc">
                  {c.type === "flat"
                    ? `₹${c.value} off`
                    : `${c.value}% off (Max ₹${c.max_discount})`}
                </div>
              </div>
            ))
          )}

          {couponMsg && (
            <p
              className={`coupon-msg ${
                discount > 0 ? "success" : "error"
              }`}
            >
              {couponMsg}
            </p>
          )}
        </div>

        <button
          className="place-order-btn"
          onClick={placeOrder}
          disabled={loading}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
