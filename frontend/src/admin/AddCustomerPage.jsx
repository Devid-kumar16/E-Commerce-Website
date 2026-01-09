import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AddCustomerPage.css";

export default function AddCustomerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/admin/customers", form);

      navigate("/admin/customers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">

      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Add Customer</h2>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="form-card" onSubmit={submit}>

        <div className="form-group">
          <label>Name</label>
          <input
            name="name"
            placeholder="Enter full name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            className="btn-secondary"
            type="button"
            onClick={() => navigate("/admin/customers")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
