// src/pages/Profile.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 1) Agar login hi nahi hai
  if (!user) {
    return (
      <div className="page account-page">
        <div className="account-card">
          <h1 className="account-title">My Account</h1>
          <p className="account-subtitle">
            Sign in to view your orders, wishlist and account details.
          </p>
          <div className="account-actions">
            <Link className="btn-primary" to="/login">
              Sign in
            </Link>
            <Link className="btn-outline" to="/signup">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2) LocalStorage se extra info (agar tumne signup ke time store ki ho)
  const users = (() => {
    try {
      return JSON.parse(localStorage.getItem("estore_users_v1") || "[]");
    } catch {
      return [];
    }
  })();

  const cur = users.find((u) => u.id === user.id) || {};

  const displayName =
    cur.name || user.name || user.username || "Customer";

  const email = cur.email || user.email || "";
  const phone = cur.phone || "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page account-page">
      <div className="account-layout">
        {/* LEFT SIDEBAR – Amazon/Flipkart style */}
        <aside className="account-sidebar">
          <div className="account-user">
            <div className="account-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="account-user-name">{displayName}</div>
              {email && <div className="account-user-email">{email}</div>}
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
              <div className="account-nav-label">Account Settings</div>
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

        {/* RIGHT SIDE – overview card */}
        <main className="account-main">
          <section className="account-main-card">
            <h1>Account Overview</h1>

            <div className="account-overview-grid">
              <div className="account-overview-item">
                <h3>Contact info</h3>
                <p>{displayName}</p>
                {email && <p>{email}</p>}
                {phone && <p>{phone}</p>}
              </div>

              <div className="account-overview-item">
                <h3>Quick actions</h3>
                <ul>
                  <li>
                    <Link to="/orders">Track your orders</Link>
                  </li>
                  <li>
                    <Link to="/cart">Go to cart</Link>
                  </li>
                  <li>
                    <Link to="/">Continue shopping</Link>
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
