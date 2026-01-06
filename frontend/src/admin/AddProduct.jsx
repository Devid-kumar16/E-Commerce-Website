import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/client";
import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  /* ================= LOAD CATEGORIES (ADMIN SAFE) ================= */
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/admin");
        if (!cancelled) {
          setCategories(res.data?.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Load categories error:", err);
          toast.error("Failed to load categories");
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.stock === "" || Number(form.stock) < 0) {
      toast.error("Stock must be 0 or greater");
      return;
    }

    try {
      setLoading(true);

      await api.post("/products/admin", {
        name: form.name.trim(),
        price: Number(form.price),
        category_id: Number(form.category_id),
        status: form.status,
        stock: Number(form.stock),
        image_url: form.image_url.trim(),
        description: form.description.trim(),
      });

      toast.success("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      console.error("Add product error:", err);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Add Product</h1>
        <p>Create a new product</p>
      </div>

      <form className="product-card" onSubmit={handleSubmit}>
        <label>Product Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <label>Category</label>
        <select
          value={form.category_id}
          onChange={(e) =>
            setForm({ ...form, category_id: e.target.value })
          }
          required
          disabled={loadingCategories}
        >
          <option value="">
            {loadingCategories ? "Loading categories..." : "Select category"}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="inactive">Inactive</option>
        </select>

        <label>Stock Quantity</label>
        <input
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          required
        />

        <label>Price (₹)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <label>Image URL</label>
        <input
          value={form.image_url}
          onChange={(e) =>
            setForm({ ...form, image_url: e.target.value })
          }
        />

        <label>Description</label>
        <textarea
          rows="4"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <div className="add-product-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
