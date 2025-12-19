import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_id: "",
    area: "",
    address: "",
    phone: "",
    payment_method: "",
    total_amount: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);

  /* LOAD ORDER */
  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const res = await api.get(`/orders/admin/${id}`);
    setForm(res.data.order);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* SAVE */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await api.put(`/orders/admin/${id}`, form);

    navigate("/admin/orders");
  };

  return (
    <div className="admin-page">
      <h2>Edit Order</h2>

      <form className="admin-card form-grid" onSubmit={handleSubmit}>
        <div>
          <label>User ID</label>
          <input name="user_id" value={form.user_id} disabled />
        </div>

        <div>
          <label>Phone</label>
          <input name="phone" value={form.phone || ""} onChange={handleChange} />
        </div>

        <div>
          <label>Area</label>
          <input name="area" value={form.area || ""} onChange={handleChange} />
        </div>

        <div>
          <label>Payment Method</label>
          <select
            name="payment_method"
            value={form.payment_method || ""}
            onChange={handleChange}
          >
            <option value="COD">COD</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="full-width">
          <label>Address</label>
          <textarea
            name="address"
            value={form.address || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Total Amount</label>
          <input
            type="number"
            name="total_amount"
            value={form.total_amount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option>Pending</option>
            <option>Paid</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className="full-width">
          <button className="btn btn-primary" disabled={loading}>
            Save Changes
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
