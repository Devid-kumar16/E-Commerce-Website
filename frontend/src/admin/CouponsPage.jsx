import { useEffect, useState } from "react";
import api from "../api/client";
import "./AdminStyles.css";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "flat",
    value: "",
    min_order: "",
    max_discount: "",
    expires_at: "",
  });

  const loadCoupons = async () => {
    const res = await api.get("/admin/coupons");
    setCoupons(res.data.coupons || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const toggleStatus = async (id) => {
    await api.patch(`/admin/coupons/${id}/toggle`);
    loadCoupons();
  };

  const submitCoupon = async (e) => {
    e.preventDefault();

    await api.post("/admin/coupons", {
      ...form,
      value: Number(form.value),
      min_order: Number(form.min_order || 0),
      max_discount: form.max_discount
        ? Number(form.max_discount)
        : null,
    });

    setShowForm(false);
    setForm({
      code: "",
      type: "flat",
      value: "",
      min_order: "",
      max_discount: "",
      expires_at: "",
    });

    loadCoupons();
  };

  if (loading) return <p className="center">Loading...</p>;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="admin-header">
        <h2>Coupons</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Coupon
        </button>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Used</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td>{c.code}</td>
              <td>{c.type}</td>
              <td>
                {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
              </td>
              <td>{c.used_count}</td>
              <td>
                <button
                  className={c.is_active ? "btn-green" : "btn-red"}
                  onClick={() => toggleStatus(c.id)}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD COUPON MODAL */}
      {showForm && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={submitCoupon}>
            <h3>Add Coupon</h3>

            <input
              placeholder="Coupon Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="flat">Flat</option>
              <option value="percentage">Percentage</option>
            </select>

            <input
              type="number"
              placeholder="Value"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Min Order"
              value={form.min_order}
              onChange={(e) =>
                setForm({ ...form, min_order: e.target.value })
              }
            />

            {form.type === "percentage" && (
              <input
                type="number"
                placeholder="Max Discount"
                value={form.max_discount}
                onChange={(e) =>
                  setForm({ ...form, max_discount: e.target.value })
                }
              />
            )}

            <input
              type="date"
              value={form.expires_at}
              onChange={(e) =>
                setForm({ ...form, expires_at: e.target.value })
              }
            />

<div className="modal-actions">
  <button type="submit" className="btn-primary">
    Save
  </button>

  <button
    type="button"
    className="btn-secondary"
    onClick={() => setShowForm(false)}
  >
    Cancel
  </button>
</div>


          </form>
        </div>
      )}
    </div>
  );
}
