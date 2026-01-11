// src/admin/useAdminApi.js
import api from "../api/client";

// Admin API is same client but with base path prefix
export default function useAdminApi() {
  return {
    get: (url, config) => api.get(`/admin${url}`, config),
    post: (url, data) => api.post(`/admin${url}`, data),
    put: (url, data) => api.put(`/admin${url}`, data),
    patch: (url, data) => api.patch(`/admin${url}`, data),
    delete: (url) => api.delete(`/admin${url}`),
  };
}
