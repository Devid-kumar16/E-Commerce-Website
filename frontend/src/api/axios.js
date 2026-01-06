import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // ✅ required for cookies (checkout session)
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ✅ Attach JWT for admin / protected routes
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Auto logout on invalid / expired token
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect only from admin routes (avoid checkout break)
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
