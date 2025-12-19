import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddCustomerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      if (!form.name || !form.email || !form.password) {
        setError("All fields are required");
        return;
      }

      setLoading(true);
      setError("");

      await api.post("/admin/customers", form);

      navigate("/admin/customers");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Add Customer</h2>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading}
          >
            Save
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/customers")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
