import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./AdminProducts.css";

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);

        const res = await api.get("/products/admin", {
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            search: search || undefined,
          },
        });

        if (!cancelled) {
          setProducts(res.data.products || []);
          setTotalPages(res.data.meta?.totalPages || 1);
        }
      } catch (err) {
        console.error("❌ Failed to load products:", err);
        if (!cancelled) {
          setProducts([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();
    return () => (cancelled = true);
  }, [page, search, user, authLoading]);

  const goToPage = (newPage) => setSearchParams({ page: newPage });

  /* ================= STATES ================= */
  if (loading || authLoading) {
    return <div className="admin-loading">Loading products…</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="admin-error">Access denied</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2>Products</h2>

        <div className="header-actions">
          {/* SEARCH BAR */}
          <div className="search-box">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchParams({ page: 1 });
              }}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/admin/products/new")}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Name</th>
              <th>Image</th>
              <th>Price</th>
              <th>Status</th>
              <th>Category</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No products found
                </td>
              </tr>
            )}

            {products.map((p, index) => (
              <tr key={p.id}>
                <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td>{p.name}</td>

                <td>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="product-img"
                    />
                  ) : (
                    <span className="text-muted">No Image</span>
                  )}
                </td>

                <td>₹{Number(p.price).toFixed(2)}</td>

                <td>
                  <span
                    className={
                      p.status === "published"
                        ? "status-badge status-published"
                        : "status-badge status-draft"
                    }
                  >
                    {p.status}
                  </span>
                </td>

                <td>{p.category || "-"}</td>

                <td>
                  <button
                    className="btn-edit"
                    onClick={() =>
                      navigate(`/admin/products/${p.id}/edit?page=${page}`)
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page === 1} onClick={() => goToPage(page - 1)}>
            Prev
          </button>

          <span>
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
