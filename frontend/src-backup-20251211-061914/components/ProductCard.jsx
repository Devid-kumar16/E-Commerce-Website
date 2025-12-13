// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, onAddToCart = () => {} }) {
  if (!product) return null;

  const price = product.price ?? product.salePrice ?? product.mrp;


  const toggleWishlist = (e) => {
    e.preventDefault(); // image pe jaane se bachaao
    if (window && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("toggle-wishlist", { detail: product })
      );
    }
  };

  return (
    <div className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-card-link"
      >
        <div className="product-card-img-wrap">
          <img
            src={product.image || "/images/placeholder.png"}
            alt={product.title}
            className="product-card-img"
          />

          <button
            type="button"
            className="product-card-heart"
            onClick={toggleWishlist}
          >
            ♡
          </button>
        </div>

        <div className="product-card-body">
          <h3 className="product-card-title">{product.title}</h3>
          <p className="product-card-category">
            {product.category}
          </p>
          <p className="product-card-price">₹{price}</p>
        </div>
      </Link>

      <button
        className="btn-primary btn-block"
        onClick={() => onAddToCart(product)}
      >
        Add to cart
      </button>
    </div>
  );
}
