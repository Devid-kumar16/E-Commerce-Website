import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  /* ================= LOGIN ================= */
  const login = async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data?.token;
    const userData = res.data?.user;

    if (!token || !userData) {
      throw new Error("Invalid login response");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // ensure axios always has token
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(userData);

    return { user: userData }; // ✅ REQUIRED by Login.jsx
  };

  /* ================= SIGNUP ================= */
  const signup = async (payload) => {
    const res = await api.post("/auth/register", payload);

    const token = res.data?.token;
    const userData = res.data?.user;

    if (!token || !userData) {
      throw new Error("Invalid signup response");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common.authorization = `Bearer ${token}`;
    setUser(userData);

    return { user: userData };
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}