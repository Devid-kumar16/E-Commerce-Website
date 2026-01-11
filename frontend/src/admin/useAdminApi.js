// src/admin/useAdminApi.js
import api from "../api/client";

export default function useAdminApi() {
  return {
    // ❗ DO NOT prefix `url` with /admin if url ALREADY starts with it
    get: (url, config) =>
      api.get(url.startsWith("/admin") ? url : `/admin${url}`, config),

    post: (url, data) =>
      api.post(url.startsWith("/admin") ? url : `/admin${url}`, data),

    put: (url, data) =>
      api.put(url.startsWith("/admin") ? url : `/admin${url}`, data),

    patch: (url, data) =>
      api.patch(url.startsWith("/admin") ? url : `/admin${url}`, data),

    delete: (url) =>
      api.delete(url.startsWith("/admin") ? url : `/admin${url}`),
  };
}
