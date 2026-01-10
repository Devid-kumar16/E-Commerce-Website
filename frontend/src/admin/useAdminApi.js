// src/admin/useAdminApi.js
import axios from "axios";

export default function useAdminApi() {
  const instance = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      // Read role and admin token
      const role = localStorage.getItem("role");
      let token = null;

      if (role === "admin") {
        token = localStorage.getItem("admin_token");
      }

      // Attach admin token
      if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
}
