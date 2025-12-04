// src/componentss/Header.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // ✅ Admin pages par header bilkul mat dikhao
  if (isAdmin) {
    return null;
  }

  // ✅ Normal website ka header yahan se render hoga
  return (
    <>
      {/* ====== TOP NAV BAR ====== */}
      <header className="estore-header">
        <div className="estore-header-inner">
          {/* Logo */}
          <Link to="/" className="estore-logo">
            <span className="estore-logo-text">E-Store</span>
          </Link>

          {/* Left nav: categories + products */}
          <nav className="estore-nav-left">
            <button className="estore-category-btn">
              All Categories ▾
            </button>
            <Link to="/products" className="estore-nav-link">
              Products
            </Link>
          </nav>

          {/* Search */}
          <div className="estore-search">
            <input
              type="text"
              className="estore-search-input"
              placeholder="Search for products, brands..."
            />
            <button className="estore-search-btn">Search</button>
          </div>

          {/* Right side actions */}
          <div className="estore-nav-right">
            {/* ❌ Wishlist + Cart sirf normal site pe, admin pe nahi */}
            <Link to="/wishlist" className="estore-chip">
              Wishlist
            </Link>

            <Link to="/cart" className="estore-chip">
              Cart <span className="estore-chip-badge">0</span>
            </Link>

            <Link to="/profile" className="estore-chip">
              My Account ▾
            </Link>
          </div>
        </div>
      </header>

      {/* ====== CATEGORY IMAGE STRIP (home, mobiles, etc.) ====== */}
      <div className="estore-category-strip">
        {/* Yahan tum apne real images ka path laga sakte ho */}
        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-electronics" />
          <span>Electronics</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-mobiles" />
          <span>Mobiles &amp; Tablets</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-laptops" />
          <span>Laptops</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-fashion" />
          <span>Fashion</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-home" />
          <span>Home &amp; Kitchen</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-beauty" />
          <span>Beauty</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-toys" />
          <span>Toys</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-sports" />
          <span>Sports &amp; Fitness</span>
        </button>

        <button className="estore-category-item">
          <div className="estore-category-thumb estore-cat-grocery" />
          <span>Grocery</span>
        </button>
      </div>
    </>
  );
}
