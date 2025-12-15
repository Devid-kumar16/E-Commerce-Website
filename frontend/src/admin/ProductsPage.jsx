import React, { useEffect, useState, useCallback } from "react";
import { getProducts, createProduct } from "./useAdminApi";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    stock: "",
    category_id: "",
    status: "published",
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getProducts({ page, limit: 10 });

      console.log("✅ PRODUCTS PAGE RESPONSE:", res);

      setItems(res.products || []);
      setTotalPages(Math.ceil((res.total || 0) / 10) || 1);
    } catch (err) {
      console.error("❌ Load products error:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page]);


  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const saveProduct = async (e) => {
    e.preventDefault();
    await createProduct({
      ...form,
      price: Number(form.price),
      inventory: Number(form.inventory),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    });

    setShowForm(false);
    setForm({
      name: "",
      description: "",
      price: "",
      inventory: "",
      stock: "",
      category_id: "",
      status: "published",
    });
    loadProducts();
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">
            Manage your store products, stock and categories
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Product
        </button>
      </div>

      {/* FORM CARD */}
      {showForm && (
        <div className="card">
          <h3>Add New Product</h3>

          <form onSubmit={saveProduct} className="form-grid">
            <input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Inventory"
              value={form.inventory}
              onChange={(e) => setForm({ ...form, inventory: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Category ID"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              required
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Product
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="card">
        <h3>Product List</h3>

        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Stock</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, index) => (
              <tr key={p.id}>
                <td>{(page - 1) * 10 + index + 1}</td> {/* 👈 SERIAL NUMBER */}
                <td className="bold">{p.name}</td>
                <td>{p.description || "-"}</td>
                <td>₹{p.price}</td>
                <td>
                  <span className={`badge ${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.inventory}</td>
                <td>{p.stock}</td>
                <td>{p.category_id}</td>
              </tr>
            ))}


            {!items.length && !loading && (
              <tr>
                <td colSpan="8" className="empty">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
