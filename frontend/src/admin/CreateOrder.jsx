import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateOrder() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_id: "",
    area: "",
    address: "",
    total_amount: "",
    status: "Pending",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post("/orders/admin/orders", form);
      navigate("/admin/orders", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="admin-page">
      <h2 className="page-title">Create Order</h2>

      <div className="admin-card">
        <form onSubmit={submitOrder} className="form-grid">

          <div>
            <label>Customer User ID</label>
            <input
              type="number"
              name="user_id"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Area</label>
            <input
              type="text"
              name="area"
              placeholder="e.g. Sector 62"
              onChange={handleChange}
              required
            />
          </div>

          <div className="full">
            <label>Address</label>
            <textarea
              name="address"
              rows="3"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Total Amount (₹)</label>
            <input
              type="number"
              name="total_amount"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Status</label>
            <select name="status" onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="actions full">
            <button type="submit" className="btn btn-primary">
              Save Order
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/admin/orders")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
