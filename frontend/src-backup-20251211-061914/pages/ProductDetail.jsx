// src/pages/ProductDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";
import PRODUCTS from "../data/products";

export default function ProductDetail({ onAddToCart = () => {} }) {
  const { id } = useParams();
  const product = PRODUCTS.find((p) => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="page product-detail-page">
        <h2>Product not found</h2>
      </div>
    );
  }

  const price = product.price ?? product.salePrice ?? product.mrp;

  return (
    <div className="page product-detail-page">
      <div className="product-detail-layout">
        {/* LEFT: IMAGE CARD */}
        <div className="product-detail-image-card">
          <div className="product-detail-image-wrap">
            <img
              src={product.image || "/images/placeholder.png"}
              alt={product.title}
            />
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.title}</h1>
          <p className="product-detail-category">{product.category}</p>
          <p className="product-detail-price">₹{price}</p>

          {product.description && (
            <p className="product-detail-description">
              {product.description}
            </p>
          )}

          <button
            className="btn-primary product-detail-add-btn"
            onClick={() => onAddToCart(product)}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
