// src/components/CategoryStrip.jsx
import React from "react";

// yahan category ke icons set karo (ye naam tumhare images folder se liye hain)
const CATEGORIES = [
  { id: "all", label: "All Categories", icon: null },
  { id: "Electronics", label: "Electronics", icon: "/images/electronics.jpg" },
  {
    id: "Mobiles & Tablets",
    label: "Mobiles & Tablets",
    icon: "/images/mobile1.jpg",
  },
  { id: "Laptops", label: "Laptops", icon: "/images/Laptop1.jpg" },
  { id: "Fashion", label: "Fashion", icon: "/images/fashion1.jpg" },
  {
    id: "Home & Kitchen",
    label: "Home & Kitchen",
    icon: "/images/kitchen1.jpg",
  },
  { id: "Beauty", label: "Beauty", icon: "/images/beauty1.jpg" },
  { id: "Toys", label: "Toys", icon: "/images/toy1.jpg" },
  {
    id: "Sports & Fitness",
    label: "Sports & Fitness",
    icon: "/images/fitness1.jpg",
  },
];

export default function CategoryStrip({ activeCategory, onCategoryChange }) {
  return (
    <div className="cat-strip">
      {CATEGORIES.map((cat) => {
        const isActive =
          (!activeCategory && cat.id === "all") || activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            className={`cat-chip ${isActive ? "cat-chip-active" : ""}`}
            onClick={() =>
              onCategoryChange(cat.id === "all" ? "" : cat.id)
            }
          >
            {cat.icon && (
              <img
                src={cat.icon}
                alt={cat.label}
                className="cat-chip-icon"
              />
            )}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
