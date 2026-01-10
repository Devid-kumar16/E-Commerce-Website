import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { getAllCategories } from "../api/category";
import "../styles/Categorystrip.css";

export default function CategoryNavbar() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const res = await getAllCategories();
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (loading) {
    return (
      <nav className="category-navbar">
        <span className="loading-text">Loading categories...</span>
      </nav>
    );
  }

  return (
    <nav className="category-navbar">
      {categories.length === 0 ? (
        <span className="no-categories">No categories available</span>
      ) : (
        categories.map((cat) => (
          <NavLink
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={({ isActive }) =>
              `category-item ${isActive ? "active-category" : ""}`
            }
          >
            {cat.name}
          </NavLink>
        ))
      )}
    </nav>
  );
}
