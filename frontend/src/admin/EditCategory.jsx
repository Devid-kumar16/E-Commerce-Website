import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

import "../styles/admin-form.css";

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

    // 🔐 ADMIN GUARD (frontend safety)
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCategory = async () => {
      try {
        setLoading(true);

        // ✅ CORRECT ADMIN API
        const res = await api.get(`/admin/categories/${id}`);
        const category = res.data?.category;

        if (!category) {
          toast.error("Category not found");
          return;
        }

        if (!cancelled) {
          setForm({
            name: category.name || "",
            image_url: category.image_url || "",
            status: category.status || "active",
          });
        }
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          toast.error("Authentication required");
        } else if (err.response?.status === 404) {
          toast.error("Category not found");
        } else {
          toast.error("Failed to load category");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading]);

  /* ================= UPDATE CATEGORY ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ CORRECT UPDATE API
      await api.put(`/admin/categories/${id}`, {
        name: form.name,
        image_url: form.image_url,
        status: form.status,
      });

      toast.success("Category updated successfully");

      navigate("/admin/categories");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        toast.error("Unauthorized");
      } else if (err.response?.status === 404) {
        toast.error("Update API not found");
      } else {
        toast.error("Failed to update category");
      }
    }
  };

  /* ================= STATES ================= */
  if (loading || authLoading) {
    return <p className="loading-text">Loading...</p>;
  }

  if (!user || user.role !== "admin") {
    return <p className="admin-error">Access denied</p>;
  }

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Edit Category</h1>
        <p>Manage category details and visibility</p>
      </div>

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className="admin-grid">
          {/* LEFT */}
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

          {/* RIGHT */}
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

        <div className="form-actions-left">
          <button type="submit" className="btn-primary">
            Update Category
          </button>

          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/admin/categories")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
