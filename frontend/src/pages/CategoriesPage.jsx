// src/pages/CategoriesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import useAdminApi from "../admin/useAdminApi";

export default function CategoriesPage() {
  const api = useAdminApi();

  const [items, setItems] = useState([]); // ✅ always array
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

        const params = new URLSearchParams({
          page: pageToLoad,
          limit: 10,
        });

        if (search) params.set("search", search);
        if (activeFilter !== "") params.set("active", activeFilter);

        const res = await api(`/categories?${params.toString()}`);

        // ✅ SAFELY NORMALIZE RESPONSE
        const list =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.categories) ? res.categories :
          Array.isArray(res.data?.data) ? res.data.data :
          [];

        setItems(list);
        setPage(res.page || pageToLoad);
        setTotalPages(res.totalPages || 1);
      } catch (e) {
        setErr(e.message || "Server error");
        setItems([]); // ✅ fallback
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

  return (
    <section className="admin-main-content">
      <h2>Categories</h2>

      {err && <div className="admin-error">{err}</div>}
      {loading && <div>Loading...</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading ? (
            <tr>
              <td colSpan="4" align="center">No data</td>
            </tr>
          ) : (
            items.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <button onClick={() => startEdit(c)}>Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
