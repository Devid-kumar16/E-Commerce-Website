import { pool } from "../config/db.js";

export async function listCategories(req, res) {
  const [rows] = await pool.query(
    "SELECT id, name, status, active FROM categories ORDER BY id DESC"
  );
  res.json({ categories: rows });
}

export async function createCategory(req, res) {
  const { name, slug, status, active } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: "Name & slug required" });
  }

  await pool.query(
    "INSERT INTO categories (name, slug, status, active) VALUES (?, ?, ?, ?)",
    [name, slug, status || "active", active ? 1 : 0]
  );

  res.status(201).json({ message: "Category created" });
}
