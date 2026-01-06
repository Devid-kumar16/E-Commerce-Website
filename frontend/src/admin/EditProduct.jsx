import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/client";

import "../styles/admin-form.css";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = searchParams.get("page") || 1;

  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    status: "draft",
    stock: "",
    image_url: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PRODUCT + CATEGORIES (SAFE) ================= */
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data?.product;

        if (!cancelled && p) {
          setForm({
            name: p.name ?? "",
            price: p.price ?? "",
            category_id: p.category_id ?? "",
            status: p.status ?? "draft",
            stock: p.stock ?? "",
            image_url: p.image_url ?? "",
            description: p.description ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Product load error:", err);
          toast.error("Failed to load product data");
        }
      }
    };

    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/admin");
        if (!cancelled) {
          setCategories(res.data?.categories || []);
        }
      } catch (err) {
        // ❌ Do NOT show toast here (not critical)
        console.error("Category load error:", err);
      }
    };

    Promise.all([loadProduct(), loadCategories()]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ================= UPDATE PRODUCT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/products/${id}`, {
        name: form.name.trim(),
        price: Number(form.price),
        category_id: Number(form.category_id),
        status: form.status,
        stock: Number(form.stock),
        image_url: form.image_url.trim(),
        description: form.description.trim(),
      });

      toast.success("Product updated successfully");
      navigate(`/admin/products?page=${page}`);
    } catch (err) {
      console.error("Update product error:", err);
      toast.error("Failed to update product");
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading product…</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Edit Product</h1>
        <p>Update product details and stock</p>
      </div>

      <form className="admin-card" onSubmit={handleSubmit}>
        <div className="admin-grid">
          <div>
            <div className="form-group">
              <label>Product Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="image-preview-card">
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" />
            ) : (
              <div className="image-placeholder">
                No Image Preview
              </div>
            )}
          </div>
        </div>

        <div className="form-actions-left">
          <button type="submit" className="btn-primary">
            Update Product
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() =>
              navigate(`/admin/products?page=${page}`)
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
