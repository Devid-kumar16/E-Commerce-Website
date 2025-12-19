import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_id: "",
    area: "",
    address: "",
    phone: "",
    payment_method: "COD",
    total_amount: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.user_id || !form.total_amount) {
      setError("Customer User ID and Total Amount are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/orders/admin", form);

      navigate("/admin/orders");
    } catch (err) {
      console.error("Create order error:", err);
      setError("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <h2 className="page-title">Create Order</h2>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-card form-grid" onSubmit={handleSubmit}>
        {/* Customer ID */}
        <div className="form-group">
          <label>Customer User ID *</label>
          <input
            type="number"
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            placeholder="e.g. 6"
            required
          />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
          />
        </div>

        {/* Area */}
        <div className="form-group">
          <label>Area</label>
          <input
            type="text"
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="e.g. Karol Bagh"
          />
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="NetBanking">Net Banking</option>
          </select>
        </div>

        {/* Address */}
        <div className="form-group full-width">
          <label>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full delivery address"
            rows={3}
          />
        </div>

        {/* Total Amount */}
        <div className="form-group">
          <label>Total Amount (₹) *</label>
          <input
            type="number"
            name="total_amount"
            value={form.total_amount}
            onChange={handleChange}
            placeholder="e.g. 2000"
            required
          />
        </div>

        {/* Status */}
        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="form-actions full-width">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Order"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/orders")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
