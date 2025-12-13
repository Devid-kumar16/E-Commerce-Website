// src/componentss/Footer.jsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <footer>
    </footer>
  );
}
