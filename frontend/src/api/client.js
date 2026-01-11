// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================================
   ATTACH JWT TOKEN
====================================================== */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

/* ======================================================
   SAFER ERROR HANDLING
====================================================== */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Do not force redirect here
    return Promise.reject(err);
  }
);

export default api;

