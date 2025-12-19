import React from "react";
import { Link } from "react-router-dom";
import { addToCart } from "../utils/cart";
import "../styles/ProductCard.css";

export default function ProductCard({ product, wishlist = [] }) {
  if (!product) return null;

  // ✅ Image normalization
  const image =
    (product.image_url && product.image_url.trim()) ||
    (product.image && product.image.trim()) ||
    "/images/placeholder.png";

  // ✅ Wishlist active check
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  // ✅ Add to cart (localStorage)
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image
    });
  };

  // ✅ Wishlist toggle
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    window.dispatchEvent(
      new CustomEvent("toggle-wishlist", {
        detail: {
          id: product.id,
          name: product.name,
          price: product.price,
          image
        }
      })
    );
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image-wrapper">
          <img
            src={image}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.png";
            }}
          />

          {/* ❤️ Wishlist (BOTTOM RIGHT like Myntra) */}
          <button
            type="button"
            className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            ♥
          </button>
        </div>

        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-price">₹{product.price}</p>
        </div>
      </Link>

      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to cart
      </button>
    </div>
  );
}
