// src/api/category.js
import api from "./client";

// Proper slug fix (for safety)
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export const getCategories = async () => {
  try {
    const res = await api.get("/categories/active");

    const list = res.data.categories || [];

    return list.map((c) => ({
      ...c,
      slug: slugify(c.slug || c.name),  // use backend slug or fallback
      image_url: c.image_url || "/images/default-category.png", // KEEP BACKEND IMAGE
    }));
  } catch (err) {
    console.error("getCategories API error:", err);
    return [];
  }
};

export const getAllCategories = async () => getCategories();
