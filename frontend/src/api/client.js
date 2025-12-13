// src/api/client.js
import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api", // Your backend base URL
  withCredentials: false,
});

// Restore Authorization header from localStorage after page reload
const storedToken = localStorage.getItem("token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

export default api;


