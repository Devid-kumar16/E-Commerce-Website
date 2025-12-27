// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function CategoryPage() {
  const { slug } = useParams();
  const [items, setItems] = useState([]); // always array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, [slug]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/products/category/${slug}`);

      // ✅ THIS IS THE KEY LINE (NO MORE map error)
      setItems(res.data?.products || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="category-page">
      <h2 className="category-title">{slug.toUpperCase()}</h2>

      {items.length === 0 ? (
        <p>No products found</p>
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
