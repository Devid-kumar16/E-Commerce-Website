import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminSearchBar from "../components/AdminSearchBar";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const { user, loading: authLoading } = useAuth();

  // ✅ page from URL
  const page = Math.max(
    1,
    Number(searchParams.get("page")) || 1
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const res = await api.get("/admin/products");

        const list =
          res.data?.products ||
          res.data?.data ||
          res.data ||
          [];

        if (!cancelled) {
          setProducts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("❌ Failed to load products:", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /* ================= SEARCH ================= */
  const filteredProducts = products.filter((p) =>
    `${p.name} ${p.category_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔁 reset page when search changes
  useEffect(() => {
    setSearchParams({ page: 1 });
  }, [search, setSearchParams]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
  <h2>Products</h2>

  <div style={{ display: "flex", gap: 12 }}>
    <AdminSearchBar
      value={search}
      onChange={setSearch}
      placeholder="Search products..."
    />

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
          {paginatedProducts.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No products found
              </td>
            </tr>
          )}

          {paginatedProducts.map((p, index) => (
            <tr key={p.id}>
              <td>
                {(page - 1) * ITEMS_PER_PAGE + index + 1}
              </td>

              <td>{p.name}</td>

              <td>
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    width={40}
                    height={40}
                    style={{
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
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

              <td>{p.category_name || "-"}</td>

              <td>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(
                      `/admin/products/${p.id}/edit?page=${page}`
                    )
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
