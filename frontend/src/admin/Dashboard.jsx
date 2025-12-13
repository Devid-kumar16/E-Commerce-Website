// src/admin/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import useAdminApi from "../useAdminApi";

export default function AdminDashboard() {
  const api = useAdminApi();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [p, c, o, u] = await Promise.all([
          api("/products"),
          api("/categories"),
          api("/orders"),
          api("/customers"),
        ]);

        if (cancelled) return;

        setStats({
          products: (p.data || p).length || 0,
          categories: (c.data || c).length || 0,
          orders: (o.data || o).length || 0,
          customers: (u.data || u).length || 0,
        });
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <section className="admin-main-content">
      <h2 className="admin-page-title">Admin Dashboard</h2>
      {err && <div className="admin-error">{err}</div>}
      {loading && <div className="admin-loading">Loading...</div>}

      <div className="admin-cards-row">
        <DashboardCard label="Products" value={stats.products} />
        <DashboardCard label="Categories" value={stats.categories} />
        <DashboardCard label="Orders" value={stats.orders} />
        <DashboardCard label="Customers" value={stats.customers} />
      </div>
    </section>
  );
}

function DashboardCard({ label, value }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}
