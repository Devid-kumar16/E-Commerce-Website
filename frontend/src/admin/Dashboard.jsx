import React, { useEffect, useState } from "react";
import useAdminApi from "./useAdminApi";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const admin = useAdminApi();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
    coupons: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        const res = await admin.get("/admin/dashboard"); // 🟢 FIXED URL

        setStats({
          products: res.data?.counts?.products ?? 0,
          categories: res.data?.counts?.categories ?? 0,
          orders: res.data?.counts?.orders ?? 0,
          customers: res.data?.counts?.customers ?? 0,
          coupons: res.data?.counts?.coupons ?? 0,
          revenue: res.data?.revenue ?? 0,
        });

        setRecentOrders(res.data?.recentOrders || []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, authLoading, admin]);

  if (loading || authLoading) return <div className="admin-loading">Loading…</div>;

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-subtitle">Store performance overview</p>

      <div className="stats-grid">
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Orders" value={stats.orders} />
        <StatCard title="Customers" value={stats.customers} />
        <StatCard title="Coupons" value={stats.coupons} />
        <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} highlight />
      </div>

      <div className="card">
        <h3 className="card-title">Recent Orders</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 && (
              <tr><td colSpan="5" className="center">No recent orders</td></tr>
            )}

            {recentOrders.map((o, index) => (
              <tr key={o.id}>
                <td>{index + 1}</td>
                <td>{o.customer_name || "Guest"}</td>
                <td>₹{Number(o.final_amount ?? o.total_amount ?? 0).toFixed(2)}</td>

                <td>
                  <span className={`status ${o.payment_status?.toLowerCase()}`}>
                    {o.payment_status}
                  </span>
                </td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
