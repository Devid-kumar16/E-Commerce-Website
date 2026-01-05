import { Link } from "react-router-dom";

export default function NavbarCategories({ categories }) {
  return (
    <div className="navbar-categories">
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/category/${c.slug}`}   // ✅ ALWAYS USE SLUG
          className="navbar-category"
        >
          <img
            src={c.image_url || "/images/categories/default.png"}
            alt={c.name}
            className="navbar-category-img"
            onError={(e) => {
              e.currentTarget.src = "/images/categories/default.png";
            }}
          />
          <span className="navbar-category-name">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
