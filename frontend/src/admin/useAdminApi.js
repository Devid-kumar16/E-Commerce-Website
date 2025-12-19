// src/admin/hooks/useAdminApi.js
import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* 🔐 Attach token automatically */
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      req.headers.authorization = `Bearer ${token}`;
    } else {
      delete req.headers.authorization;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

/* ================= GENERIC ADMIN API HOOK ================= */

/**
 * Generic admin API caller
 * Used like: api("/orders/admin?page=1")
 */
export default function useAdminApi() {
  return async function api(path, options = {}) {
    try {
      const res = await API({
        url: path,
        method: options.method || "GET",
        params: options.params,
        data: options.body,
      });

      return res.data;
    } catch (err) {
      console.error("❌ Admin API error:", err?.response || err);
      throw new Error(
        err?.response?.data?.message || "Admin API request failed"
      );
    }
  };
}

/* ================= PRODUCTS ================= */

export const getProducts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await API.get("/products/admin/list", {
      params: { page, limit },
    });

    return {
      products: res.data.products || [],
      total: res.data.total || 0,
      page: res.data.page || page,
      limit: res.data.limit || limit,
    };
  } catch (err) {
    console.error("❌ getProducts failed:", err?.response || err);
    return { products: [], total: 0, page, limit };
  }
};

export const createProduct = async (data) => {
  try {
    const res = await API.post("/products/admin", data);
    return res.data;
  } catch (err) {
    console.error("❌ createProduct failed:", err?.response || err);
    return {
      ok: false,
      message:
        err?.response?.data?.message || "Failed to create product",
    };
  }
};


/* ================= ORDERS ================= */

export const getOrders = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await API.get("/orders/admin", {
      params: { page, limit },
    });

    if (res.data?.ok) {
      return {
        orders: res.data.orders || [],
        total: res.data.total || 0,
        pages: res.data.pages || 1,
      };
    }

    return { orders: [], total: 0, pages: 1 };
  } catch (err) {
    console.error("❌ getOrders failed:", err?.response || err);
    return { orders: [], total: 0, pages: 1 };
  }
};
