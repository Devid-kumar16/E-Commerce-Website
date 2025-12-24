import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/admin-form.css";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    image_url: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategory();
    // eslint-disable-next-line
  }, [id]);

  const loadCategory = async () => {
    try {
      const res = await api.get(`/categories/${id}`);
      setForm(res.data.category);
      setLoading(false);
    } catch (err) {
      setError("Failed to load category");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.put(`/categories/${id}`, form);
      navigate("/admin/categories");
    } catch (err) {
      setError("Failed to update category");
    }
  };

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Edit Category</h1>
        <p>Manage category details and visibility</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className="admin-grid">
          {/* LEFT SIDE */}
          <div>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="image-preview-card">
            {form.image_url ? (
              <>
                <img src={form.image_url} alt="Preview" />
                <span>Image Preview</span>
              </>
            ) : (
              <div className="image-placeholder">
                No Image Preview
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/admin/categories")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Update Category
          </button>
        </div>
      </form>
    </div>
  );
}
