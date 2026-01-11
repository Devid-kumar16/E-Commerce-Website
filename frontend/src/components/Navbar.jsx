import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="main-navbar">

      {/* LEFT SECTION — LOGO */}
      <div className="nav-left">
        <Link to="/" className="logo">
          E-Store
        </Link>
      </div>

      {/* MIDDLE — SEARCH BAR */}
      <div className="nav-center">
        <div className="search-box">
          <input placeholder="Search for products, brands..." />
          <button>Search</button>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="nav-right">

        {/* Wishlist */}
        <Link to="/wishlist" className="nav-btn">
          Wishlist
        </Link>

        {/* Cart */}
        <Link to="/cart" className="nav-btn">
          Cart
        </Link>

        {/* ⭐ ADMIN PANEL — ONLY IF user.role === 'admin' */}
        {user?.role === "admin" && (
          <Link to="/admin" className="nav-btn admin-btn">
            Admin Panel
          </Link>
        )}

        {/* Auth Buttons */}
        {!user ? (
          <Link to="/login" className="nav-btn">
            Sign In
          </Link>
        ) : (
          <button onClick={handleLogout} className="nav-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
