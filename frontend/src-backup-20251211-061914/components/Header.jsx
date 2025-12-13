// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthProvider'; // keep same import pattern as your Login.jsx

export default function Header({
  onSearch = () => {},
  cart = [],
  wishlist = [],
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [query, setQuery] = useState("");

  // Hide header when already in admin area
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const wishlistCount = wishlist.length;

  // Robust admin check: supports user.role or user.roles[]
  const isAdmin =
    user &&
    (String(user.role || "")
      .toLowerCase() === "admin" ||
      (Array.isArray(user.roles) &&
        user.roles.map((r) => String(r).toLowerCase()).includes("admin")));

  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      // ignore
    }
    navigate("/login");
  };

  return (
    <header className="estore-header">
      <div className="estore-header-inner">
        {/* Logo */}
        <Link to="/" className="estore-logo">
          <span className="estore-logo-text">E-Store</span>
        </Link>

        {/* LEFT NAV – All Categories */}
        <nav className="estore-nav-left">
          <button
            type="button"
            className="estore-category-btn"
            onClick={() => navigate("/products")}
          >
            All Categories ▾
          </button>
        </nav>

        {/* Search */}
        <form className="estore-search" onSubmit={handleSubmit}>
          <input
            type="text"
            className="estore-search-input"
            placeholder="Search for products, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="estore-search-btn" type="submit">
            Search
          </button>
        </form>

        {/* Right actions */}
        <div className="estore-nav-right">
          {/* Admin Panel link (visible only for admins) */}
          {isAdmin && (
            <Link to="/admin" className="estore-chip" style={{ marginRight: 8 }}>
              Admin Panel
            </Link>
          )}

          <Link to="/wishlist" className="estore-chip">
            Wishlist{" "}
            {wishlistCount > 0 && (
              <span className="estore-chip-badge">{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className="estore-chip">
            Cart{" "}
            {cartCount > 0 && (
              <span className="estore-chip-badge">{cartCount}</span>
            )}
          </Link>

          {/* My Account / Login / Logout */}
          {user ? (
            <>
              <Link to="/profile" className="estore-chip">
                {user.name || user.email || "My Account"} ▾
              </Link>
              <button
                onClick={handleLogout}
                className="estore-chip"
                style={{ marginLeft: 8 }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="estore-chip">
                Login
              </Link>
              <Link to="/register" className="estore-chip" style={{ marginLeft: 8 }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

