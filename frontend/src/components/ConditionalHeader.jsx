import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ConditionalHeader({ onSearch }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  /* Hide header on admin routes */
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="header">
      <Link to="/" className="logo">
        E-Store
      </Link>

      <input
        type="text"
        placeholder="Search products..."
        onChange={(e) => onSearch?.(e.target.value)}
      />

      <nav className="nav">
        <Link to="/wishlist">Wishlist</Link>

        <Link to="/cart">
          Cart {cartCount > 0 && <span>({cartCount})</span>}
        </Link>

        {user ? (
          <>
            <Link to="/profile">My Account</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
