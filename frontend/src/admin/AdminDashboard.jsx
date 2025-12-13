// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthProvider";

export default function AdminDashboard() {
  const { user, loading: authLoading, token } = useAuth() || {};
  const [counts, setCounts] = useState({
    products: null,
    categories: null,
    orders: null,
    customers: null,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const parseCount = (res) => {
    if (res == null) return 0;
    if (typeof res === "number") return res;
    if (Array.isArray(res)) return res.length;
    if (res && typeof res.total === "number") return res.total;
    if (res && typeof res.totalItems === "number") return res.totalItems;
    if (res && typeof res.count === "number") return res.count;
    if (res && Array.isArray(res.data)) return res.data.length;
    return 0;
  };

  async function fetchCount(path) {
    try {
      // use api instance which already attaches Authorization header
      const response = await api.get(path);
      return { ok: true, value: response.data };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  async function loadAllCounts() {
    // if no token or auth still loading, skip
    if (!token || authLoading) return;

    setLoading(true);
    setErr("");

    try {
      const promises = {
        products: fetchCount("/products"),
        categories: fetchCount("/categories"),
        orders: fetchCount("/orders"),
        customers: fetchCount("/customers"),
      };

      const results = await Promise.all([
        promises.products,
        promises.categories,
        promises.orders,
        promises.customers,
      ]);

      const [pR, cR, oR, uR] = results;

      setCounts({
        products: pR.ok ? parseCount(pR.value) : null,
        categories: cR.ok ? parseCount(cR.value) : null,
        orders: oR.ok ? parseCount(oR.value) : null,
        customers: uR.ok ? parseCount(uR.value) : null,
      });

      const allFailed = [pR, cR, oR, uR].every((r) => !r.ok);
      if (allFailed) {
        const firstErr = pR.error || cR.error || oR.error || uR.error;
        setErr(
          (firstErr && firstErr.response && firstErr.response.data && firstErr.response.data.error) ||
            (firstErr && firstErr.message) ||
            "Network error when attempting to fetch resources."
        );
      } else {
        setErr("");
      }
    } catch (e) {
      setErr(e && e.message ? e.message : "Network error when attempting to fetch resources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load when token becomes available and auth finished loading
    if (!authLoading && token) {
      loadAllCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading]);

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Admin Dashboard</h2>
      <p className="admin-muted">Welcome back, {user?.name || "Admin"}.</p>

      {err && (
        <div className="admin-error" style={{ marginBottom: 12 }}>
          {err}
          <div style={{ marginTop: 8 }}>
            <button
              className="btn-primary"
              onClick={() => {
                setErr("");
                loadAllCounts();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {(authLoading || loading) && <div className="admin-loading">Loading overview...</div>}

      <div className="admin-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 16 }}>
        <DashboardCard label="Products" value={counts.products} loading={loading && counts.products == null} />
        <DashboardCard label="Categories" value={counts.categories} loading={loading && counts.categories == null} />
        <DashboardCard label="Orders" value={counts.orders} loading={loading && counts.orders == null} />
        <DashboardCard label="Customers" value={counts.customers} loading={loading && counts.customers == null} />
      </div>
    </div>
  );
}

function DashboardCard({ label, value, loading }) {
  const display =
    loading && (value === null || value === undefined)
      ? "—"
      : typeof value === "number"
      ? value
      : value === null
      ? "—"
      : value;

  return (
    <div className="admin-stat-card" style={{ padding: 16, borderRadius: 8, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="admin-stat-label" style={{ fontSize: 14, color: "#666" }}>{label}</div>
      <div className="admin-stat-value" style={{ fontSize: 28, marginTop: 8 }}>{display}</div>
    </div>
  );
}
