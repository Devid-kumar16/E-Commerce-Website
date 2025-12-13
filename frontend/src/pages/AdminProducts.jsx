import React, { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const limit = 10; // per page

  const fetchProducts = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/admin/products", {
        params: {
          search,
          page,
          limit,
        },
      });
      // assume res.data = { items: [...], totalPages }
      setProducts(res.data.items);
      setPages(res.data.totalPages);
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const toggleActive = async (id, active) => {
    try {
      await api.patch(`/admin/products/${id}/status`, { active: !active });
      fetchProducts();
    } catch (ex) {
      alert(ex.response?.data?.message || ex.message);
    }
  };

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by name or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {err && <p style={{ color: "red" }}>{err}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <table border="1" cellPadding="6" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Publish/Draft</th>
                <th>Active?</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.title}</td>
                  <td>{p.status}</td> {/* "publish" / "draft" */}
                  <td>{p.price}</td>
                  <td>{p.inventory}</td>
                  <td>{p.status}</td>
                  <td>
                    <button onClick={() => toggleActive(p.id, p.active)}>
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="7">No products found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: "1rem" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {page} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
