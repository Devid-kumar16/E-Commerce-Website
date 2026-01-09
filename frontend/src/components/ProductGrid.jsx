import React from "react";
import ProductCard from "./ProductCard";
import "../styles/ProductGrid.css";

export default function ProductGrid({ products = [] }) {

  // If API returns null or empty
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="no-products">
        <p>No products available</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
