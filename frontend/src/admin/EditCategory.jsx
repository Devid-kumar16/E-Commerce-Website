import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./EditCategory.css";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    image_url: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);

  /* ================= LOAD CATEGORY ================= */
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    const loadCategory = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/admin/categories/${id}`);
        const category = res.data?.category;

        if (!category) return toast.error("Category not found");

        setForm({
          name: category.name || "",
          image_url: category.image_url || "",
          status: category.status || "active",
        });
      } catch {
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id, user, authLoading]);

  /* ================= UPDATE CATEGORY ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/categories/${id}`, form);

      toast.success("Category updated successfully");

      navigate("/admin/categories");
    } catch {
      toast.error("Failed to update category");
    }
  };

  /* ================= UI ================= */
  if (loading || authLoading) return <p className="loading-text">Loading...</p>;
  if (!user || user.role !== "admin") return <p className="admin-error">Access denied</p>;

  return (
    <div className="admin-page edit-category-page">
      <div className="edit-header">
        <h2>Edit Category</h2>
        <p>Manage category details and visibility</p>
      </div>

      <form className="edit-card" onSubmit={handleSubmit}>
        <div className="edit-grid">
          
          {/* LEFT */}
          <div className="left-panel">
            <div className="form-group">
              <label>Category Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="preview-card">
            {form.image_url ? (
              <>
                <img src={form.image_url} alt="Preview" className="preview-image" />
                <p className="preview-text">Image Preview</p>
              </>
            ) : (
              <div className="preview-placeholder">No Image Preview</div>
            )}
          </div>

        </div>

        {/* FIXED & CLEAN BUTTONS */}
        <div className="edit-actions">
          <button type="submit" className="btn-save">Update Category</button>

          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/categories")}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
