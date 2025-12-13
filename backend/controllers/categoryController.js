// backend/controllers/categoryController.js
import { pool } from "../config/db.js";

/**
 * Public categories (active only, intended for storefront)
 */
export const listPublicCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, slug, description FROM categories WHERE active = 1 ORDER BY name ASC"
    );
    return res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list all categories (paginated optional)
 */
export const listCategories = async (req, res, next) => {
  try {
    // simple list; add pagination/filters as needed
    const [rows] = await pool.query(
      "SELECT id, name, slug, description, active, created_at FROM categories ORDER BY created_at DESC"
    );
    return res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new category (admin)
 * Expects { name, slug, description, active? }
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description = null, active = 1 } = req.body;
    if (!name || !slug) return res.status(400).json({ message: "name and slug are required" });

    const [existing] = await pool.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [slug]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ message: "Category with this slug already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (name, slug, description, active, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, slug, description, active ? 1 : 0]
    );

    const insertId = result.insertId;
    const [rows] = await pool.query("SELECT id, name, slug, description, active FROM categories WHERE id = ? LIMIT 1", [insertId]);

    return res.status(201).json({ category: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a category by id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, active } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (slug !== undefined) { fields.push("slug = ?"); values.push(slug); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (active !== undefined) { fields.push("active = ?"); values.push(active ? 1 : 0); }

    if (fields.length === 0) return res.status(400).json({ message: "Nothing to update" });

    values.push(id);
    const sql = `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query("SELECT id, name, slug, description, active FROM categories WHERE id = ? LIMIT 1", [id]);
    return res.json({ category: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle category active state (admin)
 */
export const toggleCategoryActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (active === undefined) return res.status(400).json({ message: "active is required (true/false)" });

    await pool.query("UPDATE categories SET active = ? WHERE id = ?", [active ? 1 : 0, id]);
    const [rows] = await pool.query("SELECT id, name, slug, active FROM categories WHERE id = ? LIMIT 1", [id]);
    return res.json({ category: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single category (public/admin)
 */
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT id, name, slug, description, active FROM categories WHERE id = ? LIMIT 1", [id]);
    const category = rows && rows[0];
    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.json({ category });
  } catch (err) {
    next(err);
  }
};
