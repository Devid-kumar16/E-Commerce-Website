// src/auth/Login.jsx
import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // call backend
      const { data } = await api.post("/api/auth/login", { email, password });

      if (!data || !data.token) {
        throw new Error("No token returned from server");
      }

      // store token and refresh user via AuthProvider
      await login(data.token);

      // navigate based on role (backend returned user in response)
      if (data.user?.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Login failed");
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Sign in to E-Store</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}

