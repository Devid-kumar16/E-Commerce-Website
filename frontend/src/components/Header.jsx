import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/Layout.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { loading, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const { cart = [], wishlist = [] } = useCart();

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  /* =========================================================
     FIX: WAIT FOR AUTH LOADING BEFORE HIDE CHECK
     (Prevents admin page blank white screen)
  ========================================================= */
  if (loading) return null;

  /* =========================================================
     SAFELY HIDE HEADER ON ADMIN ROUTES
  ========================================================= */
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const wishlistCount = wishlist.length;

  /* =========================================================
      LOGOUT HANDLER
  ========================================================= */
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  /* =========================================================
      SEARCH HANDLER
  ========================================================= */
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
      setQuery("");
    }
  };

  return (
    <header className="header">
      <div className="header-inner">

        {/* LOGO */}
        <Link to="/" className="logo">E-Store</Link>

        {/* SEARCH */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products, brands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {/* ACTION BUTTONS */}
        <div className="header-actions">

          {/* Wishlist (customer only) */}
          {isCustomer && (
            <Link to="/wishlist" className="nav-chip">
              Wishlist {wishlistCount > 0 && <span>{wishlistCount}</span>}
            </Link>
          )}

          {/* Cart (customer only) */}
          {isCustomer && (
            <Link to="/cart" className="nav-chip">
              Cart {cartCount > 0 && <span>{cartCount}</span>}
            </Link>
          )}

          {/* Guest users */}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-chip">Login</Link>
              <Link to="/signup" className="nav-chip">Register</Link>
            </>
          )}

          {/* Logged in customer */}
          {isAuthenticated && isCustomer && (
            <div className="account-menu-wrapper">
              <button
                className="nav-chip"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                My Account ▾
              </button>

              {menuOpen && (
                <div className="account-dropdown">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}

          {/* Admin quick link */}
          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="nav-chip">Admin Panel</Link>
          )}

        </div>
      </div>
    </header>
  );
}
