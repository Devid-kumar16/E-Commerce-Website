import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function CategoryPage() {
  const { slug } = useParams();

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/products/category/${slug}`);

        // ✅ SAFE & CORRECT
        setItems(res.data?.products || []);
        setTitle(res.data?.category?.name || "");
      } catch (err) {
        console.error("Category load error:", err);
        setError("Failed to load products");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [slug]);

  if (loading) return <p className="center">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="category-page">
      {/* ✅ REAL CATEGORY NAME FROM DB */}
      <h2 className="category-title">{title}</h2>

      {items.length === 0 ? (
        <p>No products found in this category</p>
      ) : (
        <div className="product-grid">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
