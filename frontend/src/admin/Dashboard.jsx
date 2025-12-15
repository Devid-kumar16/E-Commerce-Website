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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError("");
      setLoading(true);

      /* ---------- PRODUCTS COUNT ---------- */
      const productsRes = await api.get("/products/admin/list", {
        params: { page: 1, limit: 1 },
      });

      /* ---------- CATEGORIES COUNT ---------- */
      const categoriesRes = await api.get("/categories");

      /* ---------- ORDERS (for count + recent) ---------- */
      const ordersRes = await api.get("/orders/admin", {
        params: { page: 1, limit: 5 },
      });

      /* ---------- CUSTOMERS COUNT ---------- */
      const customersRes = await api.get("/customers/admin", {
        params: { page: 1, limit: 1 },
      });

      const orders = ordersRes.data?.data || [];

      /* ---------- REVENUE ---------- */
      const revenue = orders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      );

      setStats({
        products: productsRes.data?.meta?.total ?? productsRes.data?.products?.length ?? 0,
        categories: categoriesRes.data?.categories?.length ?? 0,
        orders: ordersRes.data?.meta?.total ?? 0,
        customers: customersRes.data?.meta?.total ?? 0,
        revenue,
      });

      setRecentOrders(orders);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-main-content">
      <h2 className="admin-page-title">Admin Dashboard</h2>
      <p className="admin-subtitle">Overview of store performance</p>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading dashboard...</div>}

      {/* ---------- STATS CARDS ---------- */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h4>Products</h4>
          <p>{stats.products}</p>
        </div>
        <div className="dashboard-card">
          <h4>Categories</h4>
          <p>{stats.categories}</p>
        </div>
        <div className="dashboard-card">
          <h4>Orders</h4>
          <p>{stats.orders}</p>
        </div>
        <div className="dashboard-card">
          <h4>Customers</h4>
          <p>{stats.customers}</p>
        </div>
        <div className="dashboard-card">
          <h4>Revenue</h4>
          <p>₹{stats.revenue}</p>
        </div>
      </div>

      {/* ---------- RECENT ORDERS ---------- */}
      <div className="dashboard-section">
        <h3>Recent Orders</h3>

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
                <td>{o.customer_name || "-"}</td>
                <td>₹{o.total_amount}</td>
                <td>{o.status}</td>
                <td>{String(o.created_at).slice(0, 10)}</td>
              </tr>
            ))}

            {!recentOrders.length && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
