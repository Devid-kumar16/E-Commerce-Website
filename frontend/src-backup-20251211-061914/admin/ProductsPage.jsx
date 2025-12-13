// src/admin/ProductsPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import useAdminApi from "../useAdminApi";

// page size constant
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const api = useAdminApi();
  // keep stable reference to api to avoid unnecessary re-renders
  const apiRef = useRef(api);
  useEffect(() => { apiRef.current = api; }, [api]);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // categories for the select
  const [categories, setCategories] = useState([]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    inventory: 0,
    status: "draft",
    category_id: "",      // selected category id
    category_name: "",    // optional category name
  });

  // load products (page-aware)
  const load = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoading(true);
        setErr("");

        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("limit", PAGE_SIZE);
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);

        const data = await apiRef.current(`/products?${params.toString()}`);
        // expect data.data array or data itself an array
        setItems(data.data || data || []);
        setPage(data.page || pageToLoad);
        setTotalPages(data.totalPages || data.total_pages || 1);
      } catch (e) {
        setErr(e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter] // apiRef is stable, so not included
  );

  // load categories once for the category select
  const loadCategories = useCallback(async () => {
    try {
      const c = await apiRef.current("/categories");
      // normalize categories: data or array
      setCategories(c.data || c || []);
    } catch (e) {
      // don't block the page if categories fail; show small console message
      console.warn("Failed to load categories:", e.message || e);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load(1);
    loadCategories();
  }, [load, loadCategories]);

  const startNew = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      inventory: 0,
      status: "draft",
      category_id: "",
      category_name: "",
    });
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name ?? "",
      price: p.price ?? "",
      inventory: p.inventory ?? 0,
      status: p.status ?? "draft",
      category_id: p.category_id ?? p.category?.id ?? "",
      category_name: p.category_name ?? p.category?.name ?? "",
    });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      const body = {
        ...form,
        price: Number(form.price),
        inventory: Number(form.inventory),
        // include both category_id and category_name for compatibility
        category_id: form.category_id || undefined,
        category_name: form.category_name || undefined,
      };

      const path = editing ? `/products/${editing.id}` : "/products";
      const method = editing ? "PUT" : "POST";

      await apiRef.current(path, { method, body });
      startNew();
      load(page);
    } catch (e) {
      setErr(e.message || "Failed to save product");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      setErr("");
      await apiRef.current(`/products/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      load(page);
    } catch (e) {
      setErr(e.message || "Failed to change status");
    }
  };

  const goPrev = () => page > 1 && load(page - 1);
  const goNext = () => page < totalPages && load(page + 1);

  return (
    <section className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Products</h2>
      </div>

      <div className="admin-filters-row">
        <div className="admin-search-input">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="button" className="btn-primary" onClick={startNew}>
          + New Product
        </button>
      </div>

      {err && <div className="admin-error">{err}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {/* show user-friendly serial, not DB id */}
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Price (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, index) => {
              // serial number across pages
              const serial = (page - 1) * PAGE_SIZE + index + 1;
              const categoryDisplay =
                p.category_name || (p.category && p.category.name) || p.category_id || "-";

              return (
                <tr key={p.id || `prod-${serial}`}>
                  <td>{serial}</td>
                  {/* still show DB id so admin can reference it */}
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{categoryDisplay}</td>
                  <td>{p.status}</td>
                  <td>{p.inventory}</td>
                  <td>{p.price}</td>
                  <td>
                    <button
                      className="admin-link-btn"
                      type="button"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    {" | "}
                    <button
                      className="admin-link-btn"
                      type="button"
                      onClick={() =>
                        changeStatus(
                          p.id,
                          p.status === "published" ? "inactive" : "published"
                        )
                      }
                    >
                      {p.status === "published" ? "Make inactive" : "Publish"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!items.length && !loading && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 16 }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button disabled={page <= 1} onClick={goPrev} type="button">
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={goNext} type="button">
          Next
        </button>
      </div>

      <div className="admin-edit-panel">
        <h3 className="admin-panel-title">
          {editing ? `Edit Product #${editing.id}` : "Add New Product"}
        </h3>
        <form onSubmit={saveProduct} className="admin-form-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </label>

          <label>
            Price (₹)
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />
          </label>

          <label>
            Category
            <select
              value={form.category_id}
              onChange={(e) => {
                const sel = categories.find((c) => String(c.id) === String(e.target.value));
                setForm({
                  ...form,
                  category_id: e.target.value,
                  category_name: sel ? sel.name : "",
                });
              }}
            >
              <option value="">-- Select category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Inventory
            <input
              type="number"
              value={form.inventory}
              onChange={(e) =>
                setForm({ ...form, inventory: e.target.value })
              }
            />
          </label>

          <label>
            Status
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
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              Save
            </button>
            {editing && (
              <button
                type="button"
                className="btn-outline"
                onClick={startNew}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
