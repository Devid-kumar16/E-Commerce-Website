import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";

// Admin Management UI
// - Lists users (with search & pagination)
// - Allows promote -> admin and demote -> customer
// - Protects against self-promotion/demotion in the UI
// - Uses Tailwind for styling

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

export default function AdminManagement() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function api(path, opts = {}) {
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    if (res.status === 401 || res.status === 403) {
      // token invalid or unauthorized -> logout
      logout();
      throw new Error("Session expired or unauthorized");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Request failed");
    return data;
  }

  async function loadUsers(q = search, p = page) {
    try {
      setLoading(true);
      setError("");
      // backend listCustomers endpoint returns { data, page, limit, total }
      // we support search via query param
      const qstr = q ? `?search=${encodeURIComponent(q)}&page=${p}&limit=${limit}` : `?page=${p}&limit=${limit}`;
      const data = await api(`/customers${qstr}`);
      // support both array or { data, total }
      const list = Array.isArray(data) ? data : data.data || [];
      setUsers(list);
      setTotal(data.total ?? (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadUsers(search, 1);
  }

  function confirmAction(msg) {
    return window.confirm(msg);
  }

  async function changeRole(targetId, newRole) {
    if (!confirmAction(`Are you sure you want to change role to '${newRole}' for user id ${targetId}?`)) return;
    setBusyId(targetId);
    try {
      await api(`/admin/users/${targetId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      // refresh
      await loadUsers();
      alert("Role updated successfully");
    } catch (err) {
      alert("Failed: " + (err.message || "Unknown error"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Management</h1>
          <div className="text-sm text-gray-600">Logged in as: <strong>{user?.name || user?.email}</strong> ({user?.role})</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <form onSubmit={onSearchSubmit} className="flex gap-2 items-center mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="border px-3 py-2 rounded w-80"
            />
            <button type="submit" className="px-3 py-2 bg-sky-600 text-white rounded">Search</button>
            <button
              type="button"
              onClick={() => { setSearch(""); setPage(1); loadUsers("", 1); }}
              className="px-3 py-2 border rounded"
            >Reset</button>
          </form>

          {error && <div className="text-red-600 mb-3">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Joined</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No users</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3">{u.name || "-"}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${u.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{(u.created_at || u.createdAt || "").toString().slice(0,10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.id === user?.id ? (
                          <button className="px-3 py-1 border rounded text-xs text-gray-500" disabled>Self</button>
                        ) : u.role === 'admin' ? (
                          <button
                            onClick={() => changeRole(u.id, 'customer')}
                            disabled={busyId === u.id}
                            className="px-3 py-1 border rounded text-xs bg-white"
                          >{busyId === u.id ? '...' : 'Demote'}</button>
                        ) : (
                          <button
                            onClick={() => changeRole(u.id, 'admin')}
                            disabled={busyId === u.id}
                            className="px-3 py-1 border rounded text-xs bg-white"
                          >{busyId === u.id ? '...' : 'Promote'}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pager */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Total: {total}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Prev</button>
              <div className="text-sm">Page {page} / {totalPages}</div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

