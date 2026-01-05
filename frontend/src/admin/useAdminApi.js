// src/admin/useAdminApi.js
import axios from "axios";

/* ================= ADMIN AXIOS INSTANCE ================= */

const adminApi = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ CONSISTENT BASE URL
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= TOKEN INTERCEPTOR ================= */

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= ADMIN API HOOK ================= */
/**
 * Usage:
 * const api = useAdminApi();
 * api.get("/admin/products");
 */
export default function useAdminApi() {
  return adminApi;
}
