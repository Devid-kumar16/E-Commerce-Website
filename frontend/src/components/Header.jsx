import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Header({
  onSearch = () => {},
  cart = [],
  wishlist = [],
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [query, setQuery] = useState("");

  // Hide header inside admin panel
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const wishlistCount = wishlist.length;

  // ✅ STRICT admin check (ONLY role === "admin")
  const isAdmin = user?.role === "admin";

  return (
    <header className="estore-header">
      <div className="estore-header-inner">
        {/* Logo */}
        <Link to="/" className="estore-logo">
          <span className="estore-logo-text">E-Store</span>
        </Link>

        {/* Categories */}
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
          {/* ✅ ADMIN PANEL (ADMIN ONLY) */}
          {isAdmin && (
            <Link to="/admin" className="estore-chip" style={{ marginRight: 8 }}>
              Admin Panel
            </Link>
          )}

          <Link to="/wishlist" className="estore-chip">
            Wishlist
            {wishlistCount > 0 && (
              <span className="estore-chip-badge">{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className="estore-chip">
            Cart
            {cartCount > 0 && (
              <span className="estore-chip-badge">{cartCount}</span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <>
              <Link to="/profile" className="estore-chip">
                {user.name || user.email}
              </Link>
              <button
                onClick={logout} // ✅ logout only (no extra navigate)
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
              <Link
                to="/register"
                className="estore-chip"
                style={{ marginLeft: 8 }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
