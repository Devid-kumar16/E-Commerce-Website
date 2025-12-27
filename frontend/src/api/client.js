import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= AUTH INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    // 🚫 public routes (NO TOKEN)
    const publicRoutes = [
      "/auth/login",
      "/auth/register",
    ];

    const isPublic = publicRoutes.some((route) =>
      config.url?.includes(route)
    );

    if (isPublic) {
      // 🔥 IMPORTANT: ensure no token is sent
      delete config.headers.Authorization;
      return config;
    }

    // ✅ protected routes
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

export default api;
