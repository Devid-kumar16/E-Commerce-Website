// src/admin/useAdminApi.js
import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const adminApi = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* 🔐 Attach token automatically */
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`; // ✅ IMPORTANT
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
 * api.get("/orders/admin/35");
 */
export default function useAdminApi() {
  return adminApi;
}

/* ================= PRODUCTS ================= */

export const getProducts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await adminApi.get("/products/admin/list", {
      params: { page, limit },
    });

    return {
      products: res.data.products || [],
      total: res.data.total || 0,
      page,
      limit,
    };
  } catch (err) {
    console.error("❌ getProducts failed:", err?.response || err);
    return { products: [], total: 0, page, limit };
  }
};

/* ================= ORDERS ================= */

export const getOrders = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await adminApi.get("/orders/admin", {
      params: { page, limit },
    });

    if (res.data?.ok) {
      return {
        orders: res.data.orders || [],
        total: res.data.meta?.total || 0,
        page: res.data.meta?.page || page,
        limit,
      };
    }

    return { orders: [], total: 0, page, limit };
  } catch (err) {
    console.error("❌ getOrders failed:", err?.response || err);
    return { orders: [], total: 0, page, limit };
  }
};
