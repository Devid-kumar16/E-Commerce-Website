import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    status: "draft",
    stock: 0,
    image_url: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [productCategoryName, setProductCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/products/admin/${id}`);
        const p = res.data.product;

        setForm({
          name: p.name ?? "",
          price: p.price ?? "",
          category_id: "", // set later
          status: p.status ?? "draft",
          stock: p.stock ?? 0,
          image_url: p.image ?? "",
          description: p.description ?? "",
        });

        // 🔑 save category NAME temporarily
        setProductCategoryName(p.category);
      } catch (err) {
        setError("Failed to load product");
      }
    };

    loadProduct();
  }, [id]);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/active");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    loadCategories();
  }, []);

  /* ================= MAP CATEGORY NAME → ID ================= */
  useEffect(() => {
    if (categories.length && productCategoryName) {
      const matched = categories.find(
        (c) => c.name === productCategoryName
      );

      if (matched) {
        setForm((prev) => ({
          ...prev,
          category_id: matched.id,
        }));
      }
      setLoading(false);
    }
  }, [categories, productCategoryName]);

  /* ================= UPDATE PRODUCT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/products/admin/${id}`, {
        name: form.name,
        price: Number(form.price),
        category_id: Number(form.category_id),
        status: form.status,
        stock: Number(form.stock),
        image_url: form.image_url,
        description: form.description,
      });

      navigate("/admin/products");
    } catch (err) {
      setError("Failed to update product");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Edit Product</h2>
        <p className="page-subtitle">
          Update product details and manage inventory
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <form className="product-card" onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* LEFT COLUMN */}
          <div className="form-section">
            <label>Product Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter product name"
              required
            />

            <label>Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

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

            <label>Stock Quantity</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="form-section">
            <label>Image URL</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />

            {form.image_url && (
              <div className="image-preview">
                <img src={form.image_url} alt="Preview" />
              </div>
            )}

            <label>Description</label>
            <textarea
              rows="6"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Write a short product description..."
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Update Product
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
