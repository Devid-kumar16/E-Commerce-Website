import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/category";
import "../styles/CategoryNavbar.css";

export default function CategoryNavbar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (err) {
      console.error("Category load error:", err);
    }
  }

  if (!categories.length) return null;

  return (
    <div className="category-navbar-wrapper">
      <nav className="category-navbar">
        {categories.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className="category-item">
            <img
              src={c.image_url}
              alt={c.name}
              className="category-icon"
              onError={(e) => (e.currentTarget.src = "/images/categories/default.png")}
            />
            <span>{c.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
