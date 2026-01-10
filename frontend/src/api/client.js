import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ====================================================
   ATTACH THE CORRECT TOKEN (Admin / Customer)
==================================================== */
api.interceptors.request.use((config) => {
  const role = localStorage.getItem("role");

  let token = null;

  if (role === "admin") {
    token = localStorage.getItem("admin_token");
  } else if (role === "customer") {
    token = localStorage.getItem("user_token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ====================================================
   SAFE 401 HANDLING — no redirect loop, no blinking
==================================================== */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      console.warn("⚠️ API returned 401 (unauthorized)");

      // ⛔ DO NOT FORCE REDIRECT (this causes loops!)
      // Just return the error and let AuthGuard handle it.
      return Promise.reject(err);
    }

    return Promise.reject(err);
  }
);

export default api;
