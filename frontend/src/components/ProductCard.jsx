import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({
  product,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) {
  // 🛑 Stop event bubbling (VERY IMPORTANT)
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onToggleWishlist === "function") {
      onToggleWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onAddToCart === "function") {
      onAddToCart(product);
    }
  };

  return (
    <div className="product-card">
      {/* ❤️ Wishlist Button */}
      <button
        type="button"
        className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlistClick}
        aria-label="Add to wishlist"
      >
        ♥
      </button>

      {/* 🖼 Product Image */}
      <Link to={`/product/${product.id}`} className="product-img">
        <img
          src={product.image_url || product.image || "/images/placeholder.png"}
          alt={product.name}
          loading="lazy"
        />
      </Link>

      {/* ℹ Product Info */}
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">₹{product.price}</p>

        <button
          type="button"
          className="btn-cart"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
