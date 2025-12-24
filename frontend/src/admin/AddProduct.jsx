import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateProduct() {
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image_url: "",
    category_id: "",
    status: "draft",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await api.get("/categories/active");
    setCategories(res.data.categories || []);
  };

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/products/admin", form);
    navigate("/admin/products");
  };

  return (
    <div className="admin-page">
      {/*  HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Add Product</h2>
          <p className="page-subtitle">
            Create a new product for your store
          </p>
        </div>
      </div>

      {/*  FORM CARD */}
      <div className="admin-card form-card">
        <form onSubmit={submit} className="form-grid">
          {/* NAME */}
          <div className="form-group">
            <label>Product Name</label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          {/* PRICE */}
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />
          </div>

          {/* IMAGE URL */}
          <div className="form-group">
            <label>Image URL</label>
            <input
              placeholder="https://image-url"
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
            />
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  category_id: Number(e.target.value),
                })
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

          {/* STATUS */}
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
            </select>
          </div>

          {/* ACTIONS */}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              Save Product
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
