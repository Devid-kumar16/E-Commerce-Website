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

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  /* ===================== LOGIN ===================== */
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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { token, user };
    } catch (err) {
      throw new Error(
        err?.response?.data?.message || "Login failed"
      );
    }
  };

  /* ===================== SIGNUP (FIX) ===================== */
  const signup = async ({ name, email, password }) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      return res.data;
    } catch (err) {
      throw new Error(
        err?.response?.data?.message || "Signup failed"
      );
    }
  };

  /* ===================== LOGOUT ===================== */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,   // ✅ VERY IMPORTANT
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
