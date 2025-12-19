import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/admin/list");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Products</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/products/new")}
        >
          Add Product
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Price</th>
            <th>Status</th>
            <th>Category</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {paginatedProducts.map((p, index) => (
            <tr key={p.id}>
              <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>

              <td>{p.name}</td>

              <td>
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                ) : (
                  <span className="text-muted">No Image</span>
                )}
              </td>

              <td>₹{p.price}</td>

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

              {/* ✅ FIXED CATEGORY COLUMN */}
              <td>{p.category_name || "-"}</td>

              <td>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(`/admin/products/${p.id}/edit`)
                  }
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {!loading && paginatedProducts.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
