import React from "react";
import "../styles/Categorystrip.css";

export default function CategoryStrip({ categories = [], activeCategory, onCategoryChange }) {
  return (
    <div className="cat-navbar">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`cat-item ${activeCategory === cat.name ? "active" : ""}`}
          onClick={() => onCategoryChange(cat.name)}
        >
          <img
            src={cat.image_url}
            alt={cat.name}
            className="cat-icon"
          />
          <span>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
