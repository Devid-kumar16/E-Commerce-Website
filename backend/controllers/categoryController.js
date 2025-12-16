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
      "SELECT id, name, slug, status FROM categories ORDER BY id DESC"
    );

    res.json({ categories: rows });
  } catch (err) {
    console.error("List categories error:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
}

/* ================= CREATE CATEGORY ================= */
export async function createCategory(req, res) {
  try {
    let { name, status = "active" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    name = name.trim();
    const slug = makeSlug(name);

    // check duplicate slug
    const [[exists]] = await pool.query(
      "SELECT id FROM categories WHERE slug = ?",
      [slug]
    );

    if (exists) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    await pool.query(
      "INSERT INTO categories (name, slug, status) VALUES (?, ?, ?)",
      [name, slug, status]
    );

    res.status(201).json({
      message: "Category created successfully",
      name,
      slug,
      status,
    });
  } catch (err) {
    console.error("Create category error:", err.sqlMessage || err);
    res.status(500).json({
      message: "Failed to create category",
    });
  }
}

