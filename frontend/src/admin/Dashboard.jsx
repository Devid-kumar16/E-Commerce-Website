import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => {
      setStats(res.data.stats);
      setRecentOrders(res.data.recentOrders);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard…</div>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-subtitle">Store performance overview</p>

      {/* ===== STATS ===== */}
      <div className="stats-grid">
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Orders" value={stats.orders} />
        <StatCard title="Customers" value={stats.customers} />
        <StatCard title="Revenue" value={`₹${stats.revenue}`} highlight />
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="card">
        <h3 className="card-title">Recent Orders</h3>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>₹{o.total_amount}</td>
                <td>
                  <span className={`status ${o.status.toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
                <td>{o.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== Small component ===== */
function StatCard({ title, value, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
