import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories } from "../api/category";
import "../styles/Categorystrip.css";

export default function CategoryNavbar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Category load failed:", err);
    }
  };

  return (
    <nav className="category-navbar">
      {categories.map((cat) => (
        <Link key={cat.id} to={`/category/${cat.slug}`} className="category-item">
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
