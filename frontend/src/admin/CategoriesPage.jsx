import React, { useEffect, useState } from "react";
import api from "../api/axios";

/* ---------- slug helper ---------- */
const makeSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    status: "active",
  });

  /* ================= LOAD CATEGORIES ================= */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      // 🔥 MUST MATCH BACKEND: /api/categories
      const res = await api.get("/categories");

      setItems(res.data?.categories ?? []);
    } catch (err) {
      console.error("Load categories error:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= SAVE CATEGORY ================= */
  const saveCategory = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    if (!name) {
      setError("Category name is required");
      return;
    }

    try {
      await api.post("/categories", {
        name,
        slug: makeSlug(name),                 // ✅ safe slug
        status: form.status,                  // enum('active','inactive')
        active: form.status === "active",     // tinyint(1)
      });

      setForm({ name: "", status: "active" });
      loadCategories();
    } catch (err) {
      console.error("Save category error:", err);
      setError(err.response?.data?.message || "Save failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <h2>Categories</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {items.map((c, i) => (
            <tr key={c.id}>
              <td>{i + 1}</td>
              <td>{c.name}</td>
              <td>{c.status || (c.active ? "active" : "inactive")}</td>
            </tr>
          ))}

          {!items.length && !loading && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Add Category</h3>

      <form onSubmit={saveCategory}>
        <input
          placeholder="Category name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
