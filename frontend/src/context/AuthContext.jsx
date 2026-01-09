import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

/* ================= CONTEXT ================= */
const AuthContext = createContext(null);

/* ================= PROVIDER ================= */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= INIT AUTH ON APP LOAD ================= */
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error("Auth init error:", err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= LOGIN ================= */
  const login = ({ token, user }) => {
    if (!token || !user) {
      throw new Error("Invalid login payload");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  /* ================= SIGNUP ================= */
  const signup = ({ token, user }) => {
    if (!token || !user) {
      throw new Error("Invalid signup payload");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    clearAuth();
  };

  /* ================= CLEAR AUTH ================= */
  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  /* ================= CONTEXT VALUE ================= */
  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    signup,
    logout,
  };

  /* ================= RENDER ================= */
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}