// src/admin/AdminApp.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, NavLink, useNavigate, Link, Navigate } from "react-router-dom";
import axiosApi from "../api/axios"; // your axios instance (should set Authorization header)
import { useAuth } from "../context/AuthProvider";

/**
 * Updated AdminApp.jsx
 * - Uses a memoized api() wrapper that prefixes /api/admin
 * - Safe navigation on 401/403 (avoids "operation is insecure" issues)
 * - Redirects non-admin users out of admin pages
 * - Keeps your original pages (Products, Categories, Orders, Customers) shape
 */

/* ---------- Small UI pieces ---------- */
function AdminTable({ columns, rows }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rows || rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">No data</td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={row.id || row._id || rowIndex} className="border-t border-gray-100 hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2 align-top">
                    {typeof c.render === "function" ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-2 py-1 rounded-full border disabled:opacity-40">Prev</button>
      <span>Page <strong>{page}</strong> of {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="px-2 py-1 rounded-full border disabled:opacity-40">Next</button>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function DashboardCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="text-[11px] uppercase tracking-[0.08em] text-gray-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function AdminDashboard({ api }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError("");
        // Expect backend: GET /api/admin/dashboard OR fallback to lists
        try {
          const r = await api("/dashboard");
          if (mounted) setStats(r || {});
        } catch {
          // fallback: fetch lists and count
          const [p, c, o, u] = await Promise.all([api("/products"), api("/categories"), api("/orders"), api("/customers")]);
          if (!mounted) return;
          setStats({
            products: Array.isArray(p) ? p.length : p?.total ?? 0,
            categories: Array.isArray(c) ? c.length : c?.total ?? 0,
            orders: Array.isArray(o) ? o.length : o?.total ?? 0,
            customers: Array.isArray(u) ? u.length : u?.total ?? 0,
          });
        }
      } catch (err) {
        if (mounted) setError(err?.message || String(err));
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      {error && <div className="px-4 py-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard label="Products" value={stats?.products ?? "—"} />
        <DashboardCard label="Categories" value={stats?.categories ?? "—"} />
        <DashboardCard label="Orders" value={stats?.orders ?? "—"} />
        <DashboardCard label="Customers" value={stats?.customers ?? "—"} />
      </div>
    </div>
  );
}

/* ---------- Products (kept similar to your implementation) ---------- */
function AdminProducts({ api }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category_id: "", status: "draft", inventory: 0 });

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const data = await api("/products");
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(list);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, [api]);

  function startNew() {
    setEditing(null);
    setForm({ name: "", price: "", category_id: "", status: "draft", inventory: 0 });
  }

  function startEdit(p) {
    setEditing(p);
    setForm({
      name: p.name || p.title || "",
      price: p.price ?? "",
      category_id: p.category_id ?? p.category ?? "",
      status: p.status || "draft",
      inventory: p.inventory ?? p.stock ?? 0,
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      const payload = {
        name: form.name,
        price: Number(form.price),
        category_id: form.category_id || null,
        status: form.status,
        inventory: Number(form.inventory),
      };
      if (!payload.name || !payload.price) throw new Error("Name and price are required");
      if (editing) await api(`/products/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/products", { method: "POST", body: JSON.stringify(payload) });
      await loadProducts();
      startNew();
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  async function changeStatus(id, status) {
    try {
      setError("");
      await api(`/products/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadProducts();
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  const filtered = items.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || String(p.name || p.title || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || (p.status || "draft") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <button type="button" onClick={() => { startNew(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }} className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-sm">+ Add Product</button>
      </div>

      {error && <div className="px-4 py-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm border text-sm">
          <span>🔎</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="outline-none border-none bg-transparent text-sm w-48" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-full text-sm bg-white shadow-sm">
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={loading ? "opacity-70 pointer-events-none" : ""}>
        <AdminTable
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name", render: (p) => p.name || p.title },
            { key: "price", label: "Price", render: (p) => `₹${Number(p.price || 0).toFixed(2)}` },
            { key: "status", label: "Status", render: (p) => <span className={"px-2 py-0.5 rounded-full text-xs capitalize " + (p.status === "published" ? "bg-green-100 text-green-700" : p.status === "inactive" ? "bg-gray-200 text-gray-700" : "bg-yellow-100 text-yellow-700")}>{p.status || "draft"}</span> },
            { key: "inventory", label: "Inventory", render: (p) => p.inventory ?? p.stock ?? "-" },
            {
              key: "actions", label: "Actions", render: (p) => (
                <div className="flex flex-wrap gap-1 text-xs">
                  <button onClick={() => startEdit(p)} className="px-2 py-1 rounded-full border border-gray-300 bg-white">Edit</button>
                  <button onClick={() => changeStatus(p.id, "published")} className="px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50">Publish</button>
                  <button onClick={() => changeStatus(p.id, "draft")} className="px-2 py-1 rounded-full border border-amber-200 bg-amber-50">Draft</button>
                  <button onClick={() => changeStatus(p.id, "inactive")} className="px-2 py-1 rounded-full border border-gray-200 bg-gray-50">Inactive</button>
                </div>
              )
            }
          ]}
          rows={pageItems}
        />
        <Pager page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-3 text-gray-800 text-sm">{editing ? "Edit product" : "Add new product"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Price</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category ID / Name</label>
            <input value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Inventory</label>
            <input type="number" value={form.inventory} onChange={(e) => setForm({ ...form, inventory: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex gap-2 mt-2">
            <button type="submit" className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold">Save</button>
            {editing && <button type="button" onClick={startNew} className="px-4 py-2 rounded-full border text-sm">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

/* Categories (accepts api prop) */
function AdminCategories({ api }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", is_active: true });
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  async function load() {
    try {
      setError("");
      const data = await api("/categories");
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(list);
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew() {
    setEditing(null);
    setForm({ name: "", is_active: true });
  }

  function startEdit(c) {
    setEditing(c);
    setForm({ name: c.name, is_active: !!c.is_active });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      const payload = {
        name: form.name,
        is_active: form.is_active ? 1 : 0,
      };
      if (editing) {
        await api(`/categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await load();
      startNew();
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  const filtered = items.filter((c) => (c.name || "").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <button
          type="button"
          onClick={() => {
            startNew();
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow-sm"
        >
          + Add Category
        </button>
      </div>

      {error && <div className="px-4 py-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="px-3 py-2 border rounded-full text-sm w-full sm:w-64 bg-white shadow-sm"
        />
      </div>

      <AdminTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          {
            key: "is_active",
            label: "Status",
            render: (c) => (
              <span
                className={
                  "px-2 py-0.5 rounded-full text-xs " +
                  (c.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700")
                }
              >
                {c.is_active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (c) => (
              <button type="button" onClick={() => startEdit(c)} className="text-xs px-2 py-1 rounded-full border border-gray-300 bg-white">
                Edit
              </button>
            ),
          },
        ]}
        rows={pageItems}
      />
      <Pager page={page} totalPages={totalPages} onChange={setPage} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-3 text-gray-800 text-sm">{editing ? "Edit category" : "Add new category"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input id="cat-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label htmlFor="cat-active" className="text-xs text-gray-600">Active</label>
          </div>

          <div className="sm:col-span-2 flex gap-2 mt-2">
            <button type="submit" className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold">Save</button>
            {editing && (
              <button type="button" onClick={startNew} className="px-4 py-2 rounded-full border text-sm">Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* Orders (accepts api prop) */
function AdminOrders({ api }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [form, setForm] = useState({
    user_id: "",
    total_amount: "",
    status: "created",
  });

  async function load() {
    try {
      setError("");
      const data = await api("/orders");
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(list);
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = items.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(o.id).includes(q) ||
      String(o.customer_name || "").toLowerCase().includes(q) ||
      String(o.status || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setError("");
      if (!form.user_id || !form.total_amount) {
        throw new Error("User ID and total amount required");
      }
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          user_id: Number(form.user_id),
          total_amount: Number(form.total_amount),
          status: form.status,
        }),
      });
      setForm({ user_id: "", total_amount: "", status: "created" });
      await load();
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

      {error && <div className="px-4 py-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by order id, customer or status..."
        className="px-3 py-2 border rounded-full text-sm w-full sm:w-80 bg-white shadow-sm"
      />

      <AdminTable
        columns={[
          { key: "id", label: "Order ID" },
          { key: "customer", label: "Customer", render: (o) => o.customer_name || "-" },
          { key: "total", label: "Total", render: (o) => `₹${o.total || o.total_amount || 0}` },
          { key: "status", label: "Status", render: (o) => o.status || "created" },
          { key: "created_at", label: "Created", render: (o) => (o.created_at || o.createdAt || "").toString().slice(0, 10) },
        ]}
        rows={pageItems}
      />
      <Pager page={page} totalPages={totalPages} onChange={setPage} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-3 text-gray-800 text-sm">Create order (admin)</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Customer user_id</label>
            <input type="number" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total amount</label>
            <input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              <option value="created">Created</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="sm:col-span-3 mt-2">
            <button type="submit" className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold">Save order</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Customers (accepts api prop) */
function AdminCustomers({ api }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError("");
        const data = await api("/customers");
        const list = Array.isArray(data) ? data : data?.data || [];
        if (mounted) setItems(list);
      } catch (err) {
        if (mounted) setError(err?.message || String(err));
      }
    }
    load();
    return () => { mounted = false; };
  }, [api]);

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return !q || String(c.name || "").toLowerCase().includes(q) || String(c.email || "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Customers</h1>

      {error && <div className="px-4 py-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="px-3 py-2 border rounded-full text-sm w-full sm:w-80 bg-white shadow-sm" />

      <AdminTable columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "created_at", label: "Joined", render: (c) => (c.created_at || c.createdAt || "").toString().slice(0, 10) },
      ]} rows={pageItems} />
      <Pager page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

/* ---------- MAIN AdminApp (layout + auth + api wrapper) ---------- */
export default function AdminApp() {
  const auth = useAuth();
  const navigate = useNavigate();

  // API prefix for admin routes
  const API_PREFIX = "/api/admin";

  // memoized api helper
  const api = useMemo(() => {
    return async function apiRequest(path, options = {}) {
      // normalize path
      const p = String(path || "").startsWith("/") ? `${API_PREFIX}${path}` : `${API_PREFIX}/${path}`;
      const method = (options.method || "GET").toUpperCase();
      const config = { url: p, method, headers: options.headers || {} };
      if (options.body) {
        try { config.data = typeof options.body === "string" ? JSON.parse(options.body) : options.body; }
        catch { config.data = options.body; }
      }
      try {
        const res = await axiosApi.request(config);
        return res.data;
      } catch (err) {
        const status = err?.response?.status;
        // If session expired -> logout then navigate to login safely
        if (status === 401 || status === 403) {
          try { auth?.logout && auth.logout(); } catch {}
          // ensure navigation happens after current render stack
          setTimeout(() => navigate("/login"), 0);
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(err?.response?.data?.message || err?.message || "Request failed");
      }
    };
  }, [navigate, auth]);

  // auth not ready
  if (!auth) return <div className="p-8"><div className="text-gray-600">Initializing authentication...</div></div>;
  const { user, loading, logout } = auth;
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />; // not logged in -> login

  // restrict to admin role
  if ((user.role || "").toString().toLowerCase() !== "admin") {
    // normal users -> back to home
    return <Navigate to="/" replace />;
  }

  // layout
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center font-bold">{user?.name?.slice(0,2).toUpperCase() || "ES"}</div>
          <div>
            <div className="font-semibold">E-Store Admin</div>
            <div className="text-xs opacity-70">Logged in as {user?.name}</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/admin" end className={({isActive}) => "py-2 px-3 rounded-lg " + (isActive ? "bg-white/10" : "hover:bg-white/5")}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={({isActive}) => "py-2 px-3 rounded-lg " + (isActive ? "bg-white/10" : "hover:bg-white/5")}>Products</NavLink>
          <NavLink to="/admin/categories" className={({isActive}) => "py-2 px-3 rounded-lg " + (isActive ? "bg-white/10" : "hover:bg-white/5")}>Categories</NavLink>
          <NavLink to="/admin/orders" className={({isActive}) => "py-2 px-3 rounded-lg " + (isActive ? "bg-white/10" : "hover:bg-white/5")}>Orders</NavLink>
          <NavLink to="/admin/customers" className={({isActive}) => "py-2 px-3 rounded-lg " + (isActive ? "bg-white/10" : "hover:bg-white/5")}>Customers</NavLink>
        </nav>

        <div className="mt-auto">
          <button onClick={() => { try { logout && logout(); } catch {} navigate("/login"); }} className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">Log out</button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex items-center gap-4 mb-6">
          <Link to="/" className="px-3 py-2 bg-white rounded shadow-sm text-sm">← Back to store</Link>
          <div className="ml-auto text-sm text-gray-600">Admin</div>
          <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center">{user?.name?.[0]?.toUpperCase() || "A"}</div>
        </header>

        <section className="space-y-6">
          <Routes>
            <Route path="/" element={<AdminDashboard api={api} />} />
            <Route path="products" element={<AdminProducts api={api} />} />
            <Route path="categories" element={<AdminCategories api={api} />} />
            <Route path="orders" element={<AdminOrders api={api} />} />
            <Route path="customers" element={<AdminCustomers api={api} />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}