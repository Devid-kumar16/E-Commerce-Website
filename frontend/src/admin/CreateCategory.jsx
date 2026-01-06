import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function CreateCategory() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= CREATE CATEGORY ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/categories", {
        name: name.trim(),                 // ✅ FIXED
        image_url: imageUrl.trim() || null,
        status,                            // "active" | "inactive"
      });

      toast.success("Category added successfully");

      setTimeout(() => {
        navigate("/admin/categories");
      }, 1200);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Add Category</h2>
        <p className="page-subtitle">Create a new product category</p>
      </div>

      <form onSubmit={submit} className="product-card">
        <div className="form-grid">
          {/* LEFT */}
          <div className="form-section">
            <label>Category Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
            />

            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* RIGHT */}
          <div className="form-section">
            <label>Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            {imageUrl && (
              <div className="image-preview">
                <img src={imageUrl} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Category"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/categories")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
