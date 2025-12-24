import { pool } from "../config/db.js";

/* ================= SLUG ================= */
const makeSlug = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

/* ================= LIST ALL (ADMIN) ================= */
export async function listCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, slug, image_url, status FROM categories ORDER BY id ASC"
    );
    res.json({ ok: true, categories: rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Failed to load categories" });
  }
}

/* ================= LIST ACTIVE (PRODUCT PAGE) ================= */
export async function listActiveCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM categories WHERE status = 'active'"
    );
    res.json({ ok: true, categories: rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Failed to load active categories" });
  }
}

/* ================= GET ONE ================= */
export async function getCategory(req, res) {
  const { id } = req.params;
  const [[category]] = await pool.query(
    "SELECT id, name, image_url, status FROM categories WHERE id = ?",
    [id]
  );

  if (!category) {
    return res.status(404).json({ ok: false, message: "Category not found" });
  }

  res.json({ ok: true, category });
}

/* ================= CREATE ================= */
export async function createCategory(req, res) {
  let { name, image_url } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ ok: false, message: "Name required" });
  }

  const slug = makeSlug(name);

  const [[exists]] = await pool.query(
    "SELECT id FROM categories WHERE slug = ?",
    [slug]
  );

  if (exists) {
    return res.status(400).json({ ok: false, message: "Category already exists" });
  }

  await pool.query(
    `INSERT INTO categories (name, slug, image_url, status, active, created_at)
     VALUES (?, ?, ?, 'active', 1, NOW())`,
    [name.trim(), slug, image_url || null]
  );

  res.status(201).json({ ok: true, message: "Category created" });
}

/* ================= UPDATE ================= */
export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, image_url, status } = req.body;

  const slug = makeSlug(name);

  await pool.query(
    `UPDATE categories
     SET name=?, slug=?, image_url=?, status=?, active=?, updated_at=NOW()
     WHERE id=?`,
    [name, slug, image_url || null, status, status === "active" ? 1 : 0, id]
  );

  res.json({ ok: true, message: "Category updated" });
}
