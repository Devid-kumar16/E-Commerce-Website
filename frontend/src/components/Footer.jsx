import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ padding: "40px", background: "#f9fafb" }}>
      <h3>E-Store</h3>
      <p>Fast delivery & easy returns.</p>

      <h4>Company</h4>
      <ul>
        <li><Link to="/page/about">About</Link></li>
        <li><Link to="/page/terms">Terms</Link></li>
        <li><Link to="/page/privacy">Privacy</Link></li>
      </ul>

      <h4>Help</h4>
      <ul>
        <li><Link to="/faq">FAQ</Link></li>
        <li><Link to="/support">Support</Link></li>
      </ul>

      <p>© {new Date().getFullYear()} E-Store</p>
    </footer>
  );
}
