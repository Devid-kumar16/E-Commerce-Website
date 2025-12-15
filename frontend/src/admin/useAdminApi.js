// src/admin/hooks/useAdminApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* 🔐 attach token automatically (SAFE) */
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    // prevent "null"/"undefined" token bugs
    if (token && token !== "null" && token !== "undefined") {
      req.headers.authorization = `Bearer ${token}`; // ✅ lowercase
    } else {
      delete req.headers.authorization;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

/* ---------- PRODUCTS ---------- */

/**
 * Get admin products (SAFE)
 * Always returns a predictable object
 */
export const getProducts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await API.get("/products/admin/list", {
      params: { page, limit },
    });

    if (res.data?.ok) {
      return {
        products: res.data.products || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit,
      };
    }

    // backend responded but not ok
    return {
      products: [],
      total: 0,
      page,
      limit,
    };
  } catch (err) {
    console.error("❌ getProducts failed:", err?.response || err);

    // ✅ NEVER crash React
    return {
      products: [],
      total: 0,
      page,
      limit,
      error: true,
    };
  }
};

/**
 * Create product (SAFE)
 */
export const createProduct = async (data) => {
  try {
    const res = await API.post("/products/admin", data);
    return res.data;
  } catch (err) {
    console.error("❌ createProduct failed:", err?.response || err);

    return {
      ok: false,
      message:
        err?.response?.data?.message ||
        "Failed to create product",
    };
  }
};
