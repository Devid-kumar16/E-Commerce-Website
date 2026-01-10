import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // ========== BLOCK ADMINS FROM OPENING CUSTOMER PROFILE ==========
  if (isAuthenticated && role === "admin") {
    navigate("/admin", { replace: true });
    return null;
  }

  // ========== AUTH REQUIRED ==========
  if (!isAuthenticated || !user) {
    return (
      <div className="page account-page">
        <div className="account-card">
          <h1 className="account-title">My Account</h1>
          <p>Please sign in to view your profile and orders.</p>
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

  const displayName = user.name || "Customer";
  const email = user.email || "";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="page account-page">
      <div className="account-layout">
        
        {/* LEFT SIDEBAR */}
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

        {/* MAIN CONTENT */}
        <main className="account-main">
          <section className="account-main-card">
            <h1>Account Overview</h1>

            <div className="account-overview-grid">
              <div>
                <h3>Contact Information</h3>
                <p>{displayName}</p>
                {email && <p>{email}</p>}
              </div>

              <div>
                <h3>Quick Actions</h3>
                <ul>
                  <li><Link to="/orders">Track Orders</Link></li>
                  <li><Link to="/cart">Go to Cart</Link></li>
                  <li><Link to="/">Continue Shopping</Link></li>
                </ul>
              </div>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}
