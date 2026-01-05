import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./ProductCard.css";

export default function ProductCard({
  product,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /* ================= WISHLIST ================= */
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to use wishlist");
      navigate("/login");
      return;
    }

    onToggleWishlist?.(product);
  };

  /* ================= ADD TO CART ================= */
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    onAddToCart?.(product);
  };

  return (
    <div className="product-card">
      {/* ❤️ Wishlist */}
      <button
        className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlistClick}
      >
        ♥
      </button>

      {/* 🖼 Image */}
      <Link to={`/product/${product.id}`} className="product-img">
        <img
          src={product.image_url || "/images/placeholder.png"}
          alt={product.name}
        />
      </Link>

      {/* ℹ Info */}
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>₹{product.price}</p>

        <button
          className="btn-cart"
          disabled={!isAuthenticated}
          onClick={handleAddToCart}
          title={!isAuthenticated ? "Login required" : ""}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
