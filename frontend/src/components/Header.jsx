import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/Layout.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuth();
  const { cart = [], wishlist = [] } = useCart();

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const wishlistCount = wishlist.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${query}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">

        {/* LOGO */}
        <Link to="/" className="logo">
          E-Store
        </Link>

        {/* SEARCH BAR */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products, brands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {/* ACTIONS */}
        <div className="header-actions">

          {/* Wishlist */}
          <Link to="/wishlist" className="nav-chip">
            Wishlist {wishlistCount > 0 && <span>{wishlistCount}</span>}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="nav-chip">
            Cart {cartCount > 0 && <span>{cartCount}</span>}
          </Link>

          {/* Account */}
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-chip">Login</Link>
              <Link to="/signup" className="nav-chip">Register</Link>
            </>
          ) : (
            <div className="account-menu-wrapper">
              <button
                className="nav-chip"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                My Account ▾
              </button>

              {menuOpen && (
                <div className="account-dropdown">
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
