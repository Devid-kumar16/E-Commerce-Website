// src/admin/CategoriesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { API_BASE } from "../config";

export default function CategoriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    status: "active",
  });

  const load = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setErr("");
      const params = new URLSearchParams();
      params.set("page", pageToLoad);
      params.set("limit", 10);
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(
        `${API_BASE}/api/categories?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load categories");

      setItems(data.data || []);
      setPage(data.page || pageToLoad);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    load(1);

  }, [search, statusFilter]);

  const startNew = () => {
    setEditing(null);
    setForm({ name: "", status: "active" });
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, status: cat.status });
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      const url = editing
        ? `${API_BASE}/api/categories/${editing.id}`
        : `${API_BASE}/api/categories`;

      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Save failed");

      startNew();
      load(page);
    } catch (e) {
      setErr(e.message);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      setErr("");
      const res = await fetch(
        `${API_BASE}/api/categories/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Status update failed");

      load(page);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="admin-main-content">
      <div className="admin-page-header-row">
        <h2 className="admin-page-title">Categories</h2>
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
                    type="button"
                    className="admin-link-btn"
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>
                  {" | "}
                  <button
                    type="button"
                    className="admin-link-btn"
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

      <div className="admin-pagination">
        <button disabled={page <= 1} onClick={() => load(page - 1)} type="button">
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
          type="button"
        >
          Next
        </button>
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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
    </div>
  );
}
