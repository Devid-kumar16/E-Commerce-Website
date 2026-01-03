import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");

      setStats({
        products: res.data.products,
        categories: res.data.categories,
        orders: res.data.orders,
        customers: res.data.customers,
        revenue: res.data.revenue,
      });

      setRecentOrders(res.data.recentOrders || []);
    } catch (err) {
      console.error("❌ Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard…</div>;
  }

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
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          highlight
        />
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="card">
        <h3 className="card-title">Recent Orders</h3>

        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No.</th> {/* ✅ SERIAL NUMBER */}
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan="5" className="center">
                  No recent orders
                </td>
              </tr>
            )}

            {recentOrders.map((o, index) => (
              <tr key={o.id}>
                <td>{index + 1}</td> {/* ✅ FIXED SEQUENCE */}
                <td>{o.customer_name || "Guest"}</td>
                <td>₹{Number(o.total_amount).toFixed(2)}</td>
                <td>
                  <span
                    className={`status ${o.payment_status.toLowerCase()}`}
                  >
                    {o.payment_status}
                  </span>
                </td>
                <td>
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENT ===== */
function StatCard({ title, value, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
