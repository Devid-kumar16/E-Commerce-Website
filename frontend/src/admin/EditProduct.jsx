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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`); // public get
      const p = res.data.product;

      setForm({
        name: p.name || "",
        price: p.price || "",
        category_id: p.category_id || "",
        status: p.status || "draft",
        stock: p.stock || 0,
        image_url: p.image_url || "",
        description: p.description || "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  /* ================= UPDATE PRODUCT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      console.error(err?.response?.data || err);
      setError("Failed to update product");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <h2>Edit Product</h2>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>Product Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Price</label>
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
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <label>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          <label>Image URL</label>
          <input
            type="text"
            value={form.image_url}
            onChange={(e) =>
              setForm({ ...form, image_url: e.target.value })
            }
            placeholder="https://example.com/image.jpg"
          />

          {/* Image Preview */}
          {form.image_url && (
            <img
              src={form.image_url}
              alt="preview"
              style={{ width: 120, marginTop: 10, borderRadius: 6 }}
            />
          )}

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button className="btn btn-primary">Update Product</button>
        </form>
      )}
    </div>
  );
}
