import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Header.css";

/* ================= CATEGORY DATA ================= */
const CATEGORY_IMAGES = {
  electronics: "electronics.jpg",
  "mobiles & tablets": "Mobiles & Tablets.jpg",
  laptops: "laptops.webp",
  fashion: "fashion3.jpg",
  home: ["home.jpg", "home1.jpg", "home2.jpg"],
  beauty: "beauty.jpg",
  toys: "toys.jpg",
  sports: ["sports.jpg", "sports1.jpg"],
  grocery: ["grocery1.jpg", "grocery2.jpg"],
  "tvs & appliances": ["tv1.jpg", "appliance1.jpg"],
};

const TOP_CATEGORIES = [
  "electronics",
  "mobiles & tablets",
  "laptops",
  "fashion",
  "home",
  "beauty",
  "toys",
  "sports",
  "grocery",
  "tvs & appliances",
];

/* ================= SAFE IMAGE ================= */
function SafeImage({ candidates = [], alt = "", className = "" }) {
  const [idx, setIdx] = useState(0);
  const list = Array.isArray(candidates) ? candidates : [candidates];

  useEffect(() => setIdx(0), [JSON.stringify(candidates)]);

  return (
    <img
      src={`/images/${list[idx]}`}
      alt={alt}
      className={className}
      onError={() => idx < list.length - 1 && setIdx((i) => i + 1)}
    />
  );
}

/* ================= HEADER ================= */
export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuth();
  const { cart = [], wishlist = [] } = useCart();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // ❌ Hide header on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  const cartCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const wishlistCount = wishlist.length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      {/* ================= TOP BAR ================= */}
      <div className="header-inner">
        <Link to="/" className="logo">E-Store</Link>

        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) navigate(`/search?q=${query}`);
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands..."
          />
          <button type="submit">Search</button>
        </form>

        <div className="actions">
          <Link to="/wishlist" className="chip">
            Wishlist {wishlistCount > 0 && <span>{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className="chip">
            Cart {cartCount > 0 && <span>{cartCount}</span>}
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="chip">Login</Link>
              <Link to="/signup" className="chip">Register</Link>
            </>
          ) : (
            <div className="account">
              <button className="chip" onClick={() => setOpen(!open)}>
                My Account ▾
              </button>

              {open && (
                <div className="account-menu">
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <button onClick={handleLogout} className="logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= CATEGORY STRIP ================= */}
      <div className="category-strip">
        {TOP_CATEGORIES.map((key) => (
          <Link key={key} to={`/category/${key}`} className="category-item">
            <SafeImage
              candidates={CATEGORY_IMAGES[key]}
              alt={key}
              className="category-img"
            />
            <span>{key}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}
