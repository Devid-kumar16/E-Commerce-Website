// in Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function goAdmin(e) {
    e.preventDefault();
    if (user && (user.role || "").toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      // not logged in -> send to login and remember where to go after login
      navigate("/login", { state: { from: { pathname: "/admin" } } });
    }
  }

  return (
    <nav>
      <Link to="/">Home</Link>
      <a href="/admin" onClick={goAdmin}>Admin Panel</a>
    </nav>
  );
}
