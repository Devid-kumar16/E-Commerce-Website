// src/api/auth.js
import api from "./client";

/**
 * When this module loads, ensure axios has Authorization header set
 * if a token was previously saved in localStorage (persistence across reloads).
 */
(function initAuthHeaderFromStorage() {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  } catch (e) {
    // localStorage may throw in some environments — fail gracefully
    console.warn("initAuthHeaderFromStorage:", e && e.message ? e.message : e);
    delete api.defaults.headers.common["Authorization"];
  }
})();

// ⭐ Save token + user in localStorage and set axios default header
function storeAuth(token, user) {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user || {}));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (e) {
    console.warn("storeAuth error:", e && e.message ? e.message : e);
  }
}

// Helper to safely read stored user
export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("getStoredUser parse error:", e && e.message ? e.message : e);
    return null;
  }
}

// SIGNUP (create account + auto login)
// NOTE: backend auth routes are mounted under /api/auth
export async function signup(form) {
  // make sure endpoint matches your backend mount
  const res = await api.post("/api/auth/signup", form);
  const { token, user } = res.data || {};

  // store token + user (user should include `role` and/or `roles`)
  storeAuth(token, user);

  return { token, user };
}

// LOGIN
export async function loginApi(form) {
  const res = await api.post("/api/auth/login", form);
  const { token, user } = res.data || {};

  // store token + user
  storeAuth(token, user);

  return { token, user };
}

// LOGOUT
export function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  } catch (e) {
    console.warn("logout error:", e && e.message ? e.message : e);
  }
}

// Convenience: returns currently stored user (null if none)
export default {
  signup,
  loginApi,
  logout,
  getStoredUser,
};
