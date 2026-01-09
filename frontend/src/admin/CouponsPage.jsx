import { useEffect, useState } from "react";
import api from "../api/client";
import "./CouponsAdmin.css";

const PAGE_SIZE = 10;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "flat",
    value: "",
    min_order: "",
    max_discount: "",
    expires_at: "",
  });

  /* ================= LOAD COUPONS WITH PAGINATION ================= */
  const loadCoupons = async (pageToLoad = 1) => {
    try {
      setLoading(true);

      const res = await api.get("/admin/coupons", {
        params: { page: pageToLoad, limit: PAGE_SIZE },
      });

      setCoupons(res.data?.coupons || res.data?.data || []);

      const meta = res.data?.meta || {};
      const total = meta.total ?? (res.data?.coupons?.length || 0);

      setPage(meta.page || pageToLoad);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons(1);
  }, []);

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (id) => {
    await api.patch(`/admin/coupons/${id}/toggle`);
    loadCoupons(page);
  };

  /* ================= ADD COUPON ================= */
  const submitCoupon = async (e) => {
    e.preventDefault();

    await api.post("/admin/coupons", {
      ...form,
      value: Number(form.value),
      min_order: Number(form.min_order || 0),
      max_discount: form.max_discount ? Number(form.max_discount) : null,
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

    loadCoupons(1);
  };

  if (loading) return <p className="loading-center">Loading...</p>;

  return (
    <div className="admin-page">

      {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">Coupons</h2>

        <button className="btn-primary add-btn" onClick={() => setShowForm(true)}>
          + Add Coupon
        </button>
      </div>

      {/* TABLE */}
      <div className="admin-card">
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
            {coupons.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No coupons found
                </td>
              </tr>
            )}

            {coupons.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.type}</td>
                <td>{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td>
                <td>{c.used_count}</td>

                <td>
                  <button
                    className={`status-badge ${c.is_active ? "badge-active" : "badge-inactive"}`}
                    onClick={() => toggleStatus(c.id)}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">

            <button
              className="pagination-btn left-btn"
              disabled={page <= 1}
              onClick={() => loadCoupons(page - 1)}
            >
              Prev
            </button>

            <span className="pagination-center">
              Page <strong>{page}</strong> of {totalPages}
            </span>

            <button
              className="pagination-btn right-btn"
              disabled={page >= totalPages}
              onClick={() => loadCoupons(page + 1)}
            >
              Next
            </button>

          </div>
        )}

      </div>

      {/* ADD COUPON MODAL */}
      {showForm && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={submitCoupon}>
            <h3 className="modal-title">Add Coupon</h3>

            <div className="modal-group">
              <label>Coupon Code</label>
              <input
                placeholder="Enter coupon code"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
                required
              />
            </div>

            <div className="modal-group">
              <label>Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option value="flat">Flat</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div className="modal-group">
              <label>Value</label>
              <input
                type="number"
                placeholder="Enter value"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
                required
              />
            </div>

            <div className="modal-group">
              <label>Minimum Order</label>
              <input
                type="number"
                placeholder="Enter minimum order"
                value={form.min_order}
                onChange={(e) =>
                  setForm({ ...form, min_order: e.target.value })
                }
              />
            </div>

            {form.type === "percentage" && (
              <div className="modal-group">
                <label>Max Discount</label>
                <input
                  type="number"
                  placeholder="Enter max discount"
                  value={form.max_discount}
                  onChange={(e) =>
                    setForm({ ...form, max_discount: e.target.value })
                  }
                />
              </div>
            )}

            <div className="modal-group">
              <label>Expires At</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) =>
                  setForm({ ...form, expires_at: e.target.value })
                }
              />
            </div>

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
