import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  /* ================= AUTH GUARD ================= */
  if (!isAuthenticated || !user) {
    return (
      <div className="page account-page">
        <div className="account-card">
          <h1 className="account-title">My Account</h1>
          <p className="account-subtitle">
            Please sign in to view your profile and orders.
          </p>
          <div className="account-actions">
            <Link className="btn-primary" to="/login">
              Login
            </Link>
            <Link className="btn-outline" to="/register">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================= DATA ================= */
  const displayName =
    user.name || user.username || "Customer";

  const email = user.email || "";
  const phone = user.phone || "";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="page account-page">
      <div className="account-layout">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="account-sidebar">
          <div className="account-user">
            <div className="account-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="account-user-name">{displayName}</div>
              {email && (
                <div className="account-user-email">{email}</div>
              )}
            </div>
          </div>

          <nav className="account-nav">
            <div className="account-nav-group">
              <div className="account-nav-label">Orders</div>
              <Link to="/orders" className="account-nav-link">
                My Orders
              </Link>
            </div>

            <div className="account-nav-group">
              <div className="account-nav-label">
                Account Settings
              </div>
              <button
                type="button"
                className="account-nav-link is-button"
              >
                Profile Information
              </button>
              <button
                type="button"
                className="account-nav-link is-button"
              >
                Saved Addresses
              </button>
            </div>

            <div className="account-nav-group">
              <div className="account-nav-label">More</div>
              <Link to="/wishlist" className="account-nav-link">
                Wishlist
              </Link>
              <button
                type="button"
                className="account-nav-link is-button logout-link"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* ================= RIGHT CONTENT ================= */}
        <main className="account-main">
          <section className="account-main-card">
            <h1>Account Overview</h1>

            <div className="account-overview-grid">
              <div className="account-overview-item">
                <h3>Contact Information</h3>
                <p>{displayName}</p>
                {email && <p>{email}</p>}
                {phone && <p>{phone}</p>}
              </div>

              <div className="account-overview-item">
                <h3>Quick Actions</h3>
                <ul>
                  <li>
                    <Link to="/orders">Track Orders</Link>
                  </li>
                  <li>
                    <Link to="/cart">Go to Cart</Link>
                  </li>
                  <li>
                    <Link to="/">Continue Shopping</Link>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
