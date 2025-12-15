import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /**
   * LOGIN
   */
  const login = async ({ email, password }) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data || {};

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      // ✅ STORE AUTH DATA
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      // ✅ THIS IS THE FIX
      return { token, user };
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      throw new Error(
        err?.response?.data?.message || "Login failed"
      );
    }
  };

  /**
   * LOGOUT
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
