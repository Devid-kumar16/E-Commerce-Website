// src/componentss/Footer.jsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  // ⬇️ keep your existing footer JSX below
  return (
    <footer>
      {/* existing footer markup */}
    </footer>
  );
}
