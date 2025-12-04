// src/admin/components/OrdersPage.jsx
import React, { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";

// SAME key as App.jsx me use hua tha
const USERS_KEY = "estore_users_v1";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

// Users ke andar se orders nikal ke admin ke liye flat list bana rahe hain
function buildOrders() {
  const users = readUsers();
  const rows = [];

  users.forEach((u) => {
    (u.orders || []).forEach((o) => {
      rows.push({
        id: o.id, // Checkout me jo Date.now() id di thi
        customer: u.name || u.email,
        total: o.total,
        status: o.status || "Pending",
        date: o.placedAt,
      });
    });
  });

  // Newest first
  rows.sort((a, b) => b.id - a.id);

  return rows;
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // localStorage se orders ek hi baar load kar rahe hain
  const orders = useMemo(() => buildOrders(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        String(o.id).includes(q) ||
        (o.customer || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (o.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const statusOptions = ["all", "pending", "delivered", "cancelled"];

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB");
  };

  return (
    <div className="admin-main">
      {/* Top blue bar */}
      <header className="admin-main-header">
        <div className="left">
          <button className="back-btn">←</button>
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-main-avatar">HM</div>
      </header>

      <section className="admin-main-content">
        <h2 className="admin-page-title">Orders</h2>

        {/* Search + status filter row */}
        <div className="admin-filters-row">
          <div className="admin-search-input">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Search orders or customers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Orders table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>₹{o.total}</td>
                    <td>
                      <StatusBadge status={o.status || "Pending"} />
                    </td>
                    <td>{formatDate(o.date)}</td>
                    <td className="text-right">…</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
