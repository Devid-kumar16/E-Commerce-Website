import React from "react";
import "./AdminSearchBar.css";

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="admin-search">
      <svg
        className="search-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M21 20l-5.6-5.6a7 7 0 1 0-1.4 1.4L20 21zM4 10a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
