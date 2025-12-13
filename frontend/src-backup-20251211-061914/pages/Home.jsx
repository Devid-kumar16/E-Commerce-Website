// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import PRODUCTS, { ALL_CATEGORIES } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function Home({
  products = PRODUCTS,
  onAddToCart = () => {},
  searchQuery = "",
}) {
  const navigate = useNavigate();

  // categories ke liye representative image (us category ka first product)
  const categoriesWithImage = ALL_CATEGORIES.map((cat) => {
    const prod = PRODUCTS.find((p) => p.category === cat);
    return {
      name: cat,
      image: prod?.image || "/images/placeholder.png",
    };
  });

  // search apply karke top deals (pehle 8)
  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const topDeals = filtered.slice(0, 8);

  return (
    <div className="home-page">
      {/* CATEGORY STRIP WITH IMAGES */}
      <section className="home-category-strip">
        {categoriesWithImage.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className="home-category-item"
            onClick={() =>
              navigate(`/category/${encodeURIComponent(cat.name)}`)
            }
          >
            <div className="home-category-img-wrap">
              <img src={cat.image} alt={cat.name} />
            </div>
            <span className="home-category-label">{cat.name}</span>
          </button>
        ))}
      </section>

      {/* HERO BANNER */}
      <section className="home-hero">
        <img
          src="/images/hero.jpg"
          alt="Big sale banner"
          className="home-hero-img"
        />
        {/* right side small offer card optional */}
        {/* <div className="home-hero-side-card">Hot offers...</div> */}
      </section>

      {/* TOP DEALS GRID */}
      <section className="home-top-deals">
        <div className="home-section-header">
          <h2>Top Deals</h2>
          {/* <button className="link-button">See all</button> */}
        </div>

        {topDeals.length === 0 ? (
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
