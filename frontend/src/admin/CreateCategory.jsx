import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./CreateCategory.css";

export default function CreateCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/categories", {
        name: name.trim(),
        image_url: imageUrl.trim() || null,
        status,
      });

      toast.success("Category added successfully");
      navigate("/admin/categories");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page create-category-page">
      

      <div className="page-header">
        <h2>Add Category</h2>
        <p className="page-subtitle">Create a new product category</p>
      </div>

      <form className="create-category-card" onSubmit={submit}>
        <div className="create-grid">

          <div className="left-panel">
            <div className="form-group">
              <label>Category Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="preview-panel">
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Preview" className="preview-image" />
                <p className="preview-text">Image Preview</p>
              </>
            ) : (
              <div className="preview-placeholder">No Image Preview</div>
            )}
          </div>
        </div>

        <div className="create-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Saving..." : "Save Category"}
          </button>

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
