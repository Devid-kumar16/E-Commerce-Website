import { useEffect, useState } from "react";
import { getProducts, createProduct } from "./useAdminApi";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    inventory: "",
    status: "published",
  });

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    setLoading(true);
    setError(""); // ✅ CLEAR OLD ERROR

    try {
      const res = await getProducts({ page: 1, limit: 10 });

      // ✅ IMPORTANT: backend already returns products
      if (res && Array.isArray(res.products)) {
        setProducts(res.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD ON PAGE OPEN ================= */
  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= CREATE PRODUCT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await createProduct(form);

      if (!res?.ok) {
        throw new Error(res?.message || "Failed to save product");
      }

      alert("✅ Product added successfully");

      setForm({
        name: "",
        price: "",
        inventory: "",
        status: "published",
      });

      // 🔥 THIS WAS THE MAIN FIX
      await fetchProducts();
    } catch (err) {
      console.error("Create product error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save product"
      );
    }
  };

  return (
    <>
      <h1>Products</h1>

      {/* States */}
      {loading && <p>Loading products...</p>}
      {error && !loading && <p style={{ color: "red" }}>{error}</p>}

      {/* Products table */}
      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6">No products found</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.status}</td>
                  <td>{p.inventory}</td>
                  <td>
                    <button>Edit</button>
                    <button>Publish</button>
                    <button>Draft</button>
                    <button className="danger">Inactive</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Add product */}
      <h2>Add new product</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Inventory"
          value={form.inventory}
          onChange={(e) => setForm({ ...form, inventory: e.target.value })}
          required
        />

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button type="submit">Save</button>
      </form>
    </>
  );
}
