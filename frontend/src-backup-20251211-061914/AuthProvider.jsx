// src/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);

  // restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) setToken(parsed.token);
        if (parsed?.user) setUser(parsed.user);
      }
    } catch (err) {
      console.warn("Auth restore failed", err);
    } finally {
      setRestoring(false);
    }
  }, []);

  // keep multiple tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "auth") return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        setToken(parsed?.token ?? null);
        setUser(parsed?.user ?? null);
      } catch (err) {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = useCallback((tok, usr) => {
    // update memory first (helps avoid race redirects)
    setToken(tok || null);
    setUser(usr || null);
    try {
      if (tok || usr) {
        localStorage.setItem("auth", JSON.stringify({ token: tok || null, user: usr || null }));
      } else {
        localStorage.removeItem("auth");
      }
    } catch (err) {
      console.warn("Failed to persist auth to localStorage:", err);
    }
  }, []);

  const login = useCallback((tok, usr) => save(tok, usr), [save]);
  const logout = useCallback(() => save(null, null), [save]);

  // optional helper: refresh user from server (needs /api/auth/me)
  const refreshUser = useCallback(async (fetchFn = fetch) => {
    if (!token) return null;
    try {
      const res = await fetchFn("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      const payload = await res.json().catch(() => null);
      const updatedUser = payload?.user ?? payload ?? null;
      if (updatedUser) {
        save(token, updatedUser);
        return updatedUser;
      }
      return null;
    } catch (err) {
      console.warn("refreshUser failed", err);
      return null;
    }
  }, [token, save]);

  const isAuthenticated = Boolean(token && user);

  // memoize value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({ token, user, restoring, login, logout, refreshUser, isAuthenticated }),
    [token, user, restoring, login, logout, refreshUser, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
