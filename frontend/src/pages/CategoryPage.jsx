// src/admin/pages/CategoriesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import useAdminApi from "../useAdminApi";

export default function CategoriesPage() {
  const api = useAdminApi();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", is_active: true });

  const load = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoading(true);
        setErr("");

        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("limit", 10);
        if (search) params.set("search", search);
        if (activeFilter) params.set("active", activeFilter);

        const data = await api(`/categories?${params.toString()}`);
        setItems(data.data || []);
        setPage(data.page || pageToLoad);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        setErr(e.message || "Server error");
      } finally {
        setLoading(false);
      }
    },
    [api, search, activeFilter]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const startNew = () => {
    setEditing(null);
    setForm({ name: "", is_active: true });
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, is_active: !!c.is_active });
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      const body = {
        name: form.name,
        is_active: !!form.is_active,
      };

      const path = editing ? `/categories/${editing.id}` : "/categories";
      const method = editing ? "PUT" : "POST";

      await api(path, { method, body });
      startNew();
      load(page);
    } catch (e) {
      setErr(e.message || "Server error");
    }
  };

  const goPrev = () => page > 1 && load(page - 1);
  const goNext = () => page < totalPages && load(page + 1);

  return (
    <section className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Categories</h2>
      </div>

      <div className="admin-filters-row">
        <div className="admin-search-input">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <button type="button" className="btn-primary" onClick={startNew}>
          + Add Category
        </button>
      </div>

      {err && <div className="admin-error">{err}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 16 }}>
                  No data
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
          {editing ? `Edit Category #${editing.id}` : "Add new category"}
        </h3>
        <form onSubmit={saveCategory} className="admin-form-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </label>
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active
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