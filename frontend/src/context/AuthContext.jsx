// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     RESTORE SESSION FROM TOKEN
  ========================================================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/profile")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */
  const login = ({ token, user }) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  /* =========================================================
     SIGNUP
  ========================================================= */
  const signup = async ({ name, email, password }) => {
    const res = await api.post("/auth/register", { name, email, password });
    login({ token: res.data.token, user: res.data.user });
    return res.data;
  };

  /* =========================================================
     LOGOUT
  ========================================================= */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,

    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",

    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
