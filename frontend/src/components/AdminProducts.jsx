// src/admin/components/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthProvider';

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (p = page, q = search) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: p,
      limit: 10,
      search: q,
    }).toString();

    const res = await fetch(`http://localhost:5000/api/admin/products?${params}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await res.json();
    setItems(data.data || []);
    setPage(data.page);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(1, "");
  }, []);

  const changeStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/products/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(1, search);
  };

  return (
    <div>
      <h1 className="admin-page-title">Products</h1>

      <form onSubmit={onSearchSubmit} className="admin-search-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
              <th>Inventory</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>₹{p.price}</td>
                <td>{p.status}</td>
                <td>{p.inventory}</td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      changeStatus(p.id, e.target.value)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="admin-pagination">
        <button
          disabled={page <= 1}
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            fetchData(newPage);
          }}
        >
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            fetchData(newPage);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

