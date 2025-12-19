import { pool } from "../config/db.js";

/* ================= SLUG HELPER ================= */
const makeSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/* ================= LIST CATEGORIES ================= */
export async function listCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, slug, image_url, status FROM categories WHERE status = 'active'"
    );
    res.json({ categories: rows });
  } catch (err) {
    console.error("List categories error:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
}

/* ================= GET SINGLE CATEGORY ================= */
export async function getCategory(req, res) {
  try {
    const { id } = req.params;

    const [[category]] = await pool.query(
      "SELECT id, name, image_url, status FROM categories WHERE id = ?",
      [id]
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ✅ IMPORTANT: return category DIRECTLY
    res.json(category);
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ message: "Failed to fetch category" });
  }
}


/* ================= CREATE CATEGORY ================= */
export async function createCategory(req, res) {
  try {
    let { name, image_url, status = "active" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    name = name.trim();
    const slug = makeSlug(name);

    const [[exists]] = await pool.query(
      "SELECT id FROM categories WHERE slug = ?",
      [slug]
    );

    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    await pool.query(
      `INSERT INTO categories 
       (name, slug, image_url, status, active, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, slug, image_url || null, status, status === "active" ? 1 : 0]
    );

    res.status(201).json({ message: "Category created successfully" });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
}

/* ================= UPDATE CATEGORY ================= */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    let { name, image_url, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    name = name.trim();
    const slug = makeSlug(name);

    await pool.query(
      `UPDATE categories 
       SET name = ?, slug = ?, image_url = ?, status = ?, active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, slug, image_url || null, status, status === "active" ? 1 : 0, id]
    );

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Failed to update category" });
  }
}
