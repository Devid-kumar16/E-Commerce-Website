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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories/admin");
        setCategories(res.data.categories || []);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
    } catch {
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="add-wrapper">
      <h2>Add Product</h2>

      <form className="add-card" onSubmit={handleSubmit}>
        
        {/* LEFT COLUMN */}
        <div className="left-column">

          <div className="form-group">
            <label>Product Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
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
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="two-grid">
            <div>
              <label>Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>

            <div>
              <label>Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
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
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            ></textarea>
          </div>

        </div>

        {/* RIGHT COLUMN - IMAGE PREVIEW */}
        <div className="right-column">
          <div className="preview-box">
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" />
            ) : (
              <p>No Image Preview</p>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>

          <button type="submit" className="btn-primary">
            Save Product
          </button>
        </div>

      </form>
    </div>
  );
}
