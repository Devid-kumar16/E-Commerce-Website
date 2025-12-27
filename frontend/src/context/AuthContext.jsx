import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/axios";

/* ================= CONTEXT ================= */
const AuthContext = createContext(null);

/* ================= PROVIDER ================= */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= INIT AUTH ON APP LOAD ================= */
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          setUser(JSON.parse(storedUser));
        } else {
          cleanupAuth();
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        cleanupAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ================= LOGIN ================= */
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
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      setUser(user);
      return user;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  };

  /* ================= SIGNUP ================= */
  const signup = async (payload) => {
    try {
      const res = await api.post("/auth/register", payload);

      const { token, user } = res.data || {};

      if (!token || !user) {
        throw new Error("Invalid signup response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      setUser(user);
      return user;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Signup failed"
      );
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    cleanupAuth();
  };

  /* ================= CLEANUP ================= */
  const cleanupAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  /* ================= CONTEXT VALUE ================= */
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
  };

  /* ⛔ Prevent app render until auth is ready */
  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
