import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home({ onAddToCart = () => {} }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* LOAD PUBLISHED + ACTIVE PRODUCTS */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products"); 
      // this should return ONLY published + active products
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Home products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const topDeals = products.slice(0, 100);

  return (
    <div className="home-page">
      {/* HERO BANNER */}
      <section className="home-hero">
        <img src="/images/hero.jpg" alt="Sale Banner" />
      </section>

      {/* TOP DEALS */}
      <section className="home-top-deals">
        <h2>Top Deals</h2>

        {loading ? (
          <p>Loading...</p>
        ) : topDeals.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="product-grid">
            {topDeals.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
