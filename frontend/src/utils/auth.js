// src/utils/auth.js

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  return !!token && token !== "null" && token !== "undefined";
};
