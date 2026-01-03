import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { getCart } from "../utils/cart";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  /* 🔁 Update cart count */
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCart().length);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  /* 🔐 Admin navigation */
  const goAdmin = (e) => {
    e.preventDefault();

    if (user && (user.role || "").toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      navigate("/login", {
        state: { from: { pathname: "/admin" } },
      });
    }
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          E-Store
        </Link>
      </div>

      {/* CENTER */}
      <div className="nav-center">
        <Link to="/" className="nav-link">Home</Link>

        {/* ✅ CATEGORY LINKS — SLUG BASED */}
        <Link to="/category/electronics" className="nav-link">
          Electronics
        </Link>

        <Link to="/category/mobiles-tablets" className="nav-link">
          Mobiles & Tablets
        </Link>

        <Link to="/category/laptops" className="nav-link">
          Laptops
        </Link>

        <Link to="/category/fashion" className="nav-link">
          Fashion
        </Link>

        <Link to="/category/home" className="nav-link">
          Home
        </Link>

        <Link to="/category/beauty" className="nav-link">
          Beauty
        </Link>

        <Link to="/category/toys" className="nav-link">
          Toys
        </Link>

        <Link to="/category/sports" className="nav-link">
          Sports
        </Link>

        <Link to="/category/grocery" className="nav-link">
          Grocery
        </Link>

        <Link to="/category/tvs-appliances" className="nav-link">
          TVs & Appliances
        </Link>

        <Link to="/cart" className="nav-link">
          Cart
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <a href="/admin" onClick={goAdmin} className="nav-link">
          Admin Panel
        </a>

        {user ? (
          <span className="nav-user">Hi, {user.name}</span>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
