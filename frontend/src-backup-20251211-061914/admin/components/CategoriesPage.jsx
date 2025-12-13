// src/admin/components/CategoriesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import useAdminApi from "../useAdminApi";

export default function CategoriesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    status: "active",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const data = await api(`/categories?${params.toString()}`);
      setItems(data.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, search, statusFilter]);

  useEffect(() => {
    load(1);
  }, [load]);

  const startNew = () => {
    setEditing(null);
    setForm({ name: "", status: "active" });
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, status: c.status });
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      const path = editing ? `/categories/${editing.id}` : "/categories";
      const method = editing ? "PUT" : "POST";
      await api(path, { method, body: form });
      startNew();
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      setErr("");
      await api(`/categories/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

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
            placeholder="Search category"
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="button" className="btn-primary" onClick={startNew}>
          + New Category
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
                <td>{c.status}</td>
                <td>
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>{" "}
                  |{" "}
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() =>
                      changeStatus(
                        c.id,
                        c.status === "active" ? "inactive" : "active"
                      )
                    }
                  >
                    {c.status === "active" ? "Make inactive" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: 16 }}>
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-edit-panel">
        <h3 className="admin-panel-title">
          {editing ? `Edit Category #${editing.id}` : "Add New Category"}
        </h3>
        <form onSubmit={saveCategory} className="admin-form-grid">
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
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="active">Active</option>
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
