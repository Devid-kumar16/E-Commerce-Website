// src/pages/CategoryProducts.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function CategoryProducts() {
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchProducts(slug);
    }
  }, [slug]);

  const fetchProducts = async (rawSlug) => {
    try {
      setLoading(true);
      setError("");

      // ✅ VERY IMPORTANT: encode slug
      const safeSlug = encodeURIComponent(rawSlug);

      const res = await api.get(`/products/category/${slug}`);


      console.log("Category API response:", res.data);

      // ✅ Always normalize to array
      const list = Array.isArray(res.data?.products)
        ? res.data.products
        : [];

      setProducts(list);
    } catch (err) {
      console.error("Category API error:", err?.response || err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading products...</p>;
  }

  if (error) {
    return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  }

  return (
    <div className="category-products-page">
      <h2 className="category-title">{slug.replace(/-/g, " ").toUpperCase()}</h2>

      {products.length === 0 ? (
        <p>No products found in this category</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}