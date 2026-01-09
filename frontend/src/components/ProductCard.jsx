import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const isWishlisted = wishlist?.some((w) => w.id === product.id);

  /* ================= WISHLIST ================= */
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleWishlist(product);
  };

  /* ================= ADD TO CART ================= */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    addToCart(product); // 🚫 NO TOAST
  };

  return (
    <div className="product-card">
      
      {/* ❤️ Wishlist Button */}
      <button
        className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlistClick}
      >
        ♥
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="img-container">
        <img
          src={product.image_url || "/images/placeholder.png"}
          alt={product.name}
          className="product-image"
        />
      </Link>

      {/* Info */}
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>

        <p className="product-price">₹{product.price}</p>

        {/* Add to Cart */}
        <button className="btn-add-cart" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
