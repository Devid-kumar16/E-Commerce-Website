import React from "react";
import products from "../data/products";
import ProductCard from "./ProductCard";
import "../styles/Home.css";

export default function BestSellers() {
  const best = products.slice(0, 8);

  return (
    <div className="product-grid">
      {best.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
