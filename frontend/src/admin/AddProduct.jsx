import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
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

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/active");
        setCategories(res.data.categories || []);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  /* ================= ADD PRODUCT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/products/admin", {
        name: form.name,
        price: Number(form.price),
        category_id: Number(form.category_id),
        status: form.status,
        stock: Number(form.stock),
        image_url: form.image_url,
        description: form.description,
      });

      toast.success("Product added successfully");
      setTimeout(() => navigate("/admin/products"), 1200);
    } catch {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1>Add Product</h1>
        <p>Create a new product for your store</p>
      </div>

      <form className="product-card" onSubmit={handleSubmit}>
        {/* ===== BASIC INFO ===== */}
        <h3 className="section-title">Basic Information</h3>

        <div className="form-grid">
          {/* Row 1 */}
          <div className="form-field">
            <label>Product Name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-field">
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

          {/* Row 2 (FIXED) */}
          <div className="form-field">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-field">
            <label>Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
            />
          </div>
        </div>

        {/* ===== PRICING ===== */}
        <h3 className="section-title">Pricing</h3>

        <div className="form-grid">
          <div className="form-field">
            <label>Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-field">
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

        {/* ===== IMAGE PREVIEW ===== */}
        {form.image_url && (
          <div className="image-preview">
            <img src={form.image_url} alt="Preview" />
          </div>
        )}

        {/* ===== DESCRIPTION ===== */}
        <h3 className="section-title">Description</h3>
        <textarea
          rows="5"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="Write a short product description..."
        />

{/* ===== ACTIONS ===== */}
<div className="add-product-actions">
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => navigate("/admin/products")}
  >
    Cancel
  </button>

  <button
    type="submit"
    className="btn btn-primary"
    disabled={loading}
  >
    {loading ? "Saving..." : "Save Product"}
  </button>
</div>




      </form>
    </div>
  );
}
