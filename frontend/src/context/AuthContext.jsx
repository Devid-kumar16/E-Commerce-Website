import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     INIT AUTH — Runs ONCE on first page load
  ========================================================= */
  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    if (!storedRole) {
      setLoading(false);
      return;
    }

    // Select correct token
    const token =
      storedRole === "admin"
        ? localStorage.getItem("admin_token")
        : localStorage.getItem("user_token");

    // Firefox FIX: role exists but token missing -> clear everything
    if (!token) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("user_token");
      localStorage.removeItem("role");
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    // Valid user
    setUser({ role: storedRole });
    setRole(storedRole);
    setLoading(false);
  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */
  const login = ({ token, user }) => {
    const r = user.role;
    localStorage.setItem("role", r);

    if (r === "admin") {
      localStorage.setItem("admin_token", token);
      localStorage.removeItem("user_token");
    } else {
      localStorage.setItem("user_token", token);
      localStorage.removeItem("admin_token");
    }

    setUser(user);
    setRole(r);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */
  const logout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_token");
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    loading,

    isAuthenticated: !!role,
    isAdmin: role === "admin",
    isCustomer: role === "customer",

    login,
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
