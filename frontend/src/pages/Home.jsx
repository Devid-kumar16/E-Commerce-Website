import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import "../styles/Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { wishlist, toggleWishlist, addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Home products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const topDeals = products.slice(0, 20);

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="home-hero">
        <img src="/images/hero.jpg" alt="Sale Banner" />
      </section>

      {/* ===== TOP DEALS ===== */}
      <section className="home-section">
        <h2 className="section-title">Top Deals</h2>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : topDeals.length === 0 ? (
          <p className="loading-text">No products found.</p>
        ) : (
          <div className="product-grid">
            {topDeals.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={() => addToCart(p)}
                isWishlisted={wishlist.some((i) => i.id === p.id)}
                onToggleWishlist={() => toggleWishlist(p)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
