import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

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

  /* ================= LOAD PRODUCTS (SERVER PAGINATION) ================= */
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
    return () => {
      cancelled = true;
    };
  }, [page, search, user, authLoading]);

  /* ================= PAGE CHANGE ================= */
  const goToPage = (newPage) => {
    setSearchParams({ page: newPage });
  };

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
        <h2 className="page-title">Products</h2>

        <div className="header-actions">
          {/* SEARCH */}
          <div className="admin-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchParams({ page: 1 });
              }}
              placeholder="Search by name, category or price"
            />
            {search && (
              <button
                className="clear-btn"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          {/* ADD PRODUCT */}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/products/new")}
          >
            Add Product
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>S. no.</th>
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
              <td colSpan="7" style={{ textAlign: "center" }}>
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
                    width={40}
                    height={40}
                    style={{ objectFit: "cover", borderRadius: 6 }}
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
                      ? "badge badge-success"
                      : "badge badge-warning"
                  }
                >
                  {p.status}
                </span>
              </td>

              <td>{p.category || "-"}</td>

              <td>
                <button
                  className="btn btn-primary"
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
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
