import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    status: "draft",
    stock: 0,
    image: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`); // ✅ PUBLIC GET
      const p = res.data.product;

      setForm({
        name: p.name || "",
        price: p.price || "",
        category: p.category || "",
        status: p.status || "draft",
        stock: p.stock || 0,
        image: p.image || "",
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
    const res = await api.get("/categories");
    setCategories(res.data.categories || []);
  };

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.put(`/products/admin/${id}`, {
        name: form.name,
        price: Number(form.price),
        category: form.category, // ✅ CATEGORY NAME
        status: form.status,
        stock: Number(form.stock),
        image: form.image,
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

      {error && <p style={{ color: "red" }}>{error}</p>}
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
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
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
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

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
