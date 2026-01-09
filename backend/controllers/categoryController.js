import { pool } from "../config/db.js";
import slugify from "slugify";

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

/* ================= LIST ACTIVE (PUBLIC NAVBAR) ================= */
/* ================= LIST ACTIVE (PRODUCT PAGE) ================= */
export async function listActiveCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, slug, image_url FROM categories WHERE status = 'active'"
    );

    res.json({ ok: true, categories: rows });
  } catch (err) {
    console.error("Active categories error:", err);
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
export const createCategory = async (req, res) => {
  try {
    const { name, image_url, status } = req.body;

    /* ===== Validation ===== */
    if (!name || !name.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Category name is required",
      });
    }

    const finalStatus =
      status === "inactive" ? "inactive" : "active";

    /* ===== Generate unique slug ===== */
    let baseSlug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const [[exists]] = await pool.query(
        "SELECT id FROM categories WHERE slug = ?",
        [slug]
      );

      if (!exists) break;
      slug = `${baseSlug}-${counter++}`;
    }

    /* ===== Insert ===== */
    const [result] = await pool.query(
      `
      INSERT INTO categories (name, slug, image_url, status)
      VALUES (?, ?, ?, ?)
      `,
      [name.trim(), slug, image_url || null, finalStatus]
    );

    res.status(201).json({
      ok: true,
      message: "Category created successfully",
      category_id: result.insertId,
    });
  } catch (err) {
    console.error("createCategory error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to create category",
    });
  }
};

/* ================= UPDATE ================= */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, status, image_url } = req.body;

    if (!name || !status) {
      return res.status(400).json({
        ok: false,
        message: "Name and status are required",
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    await pool.query(
      `
      UPDATE categories
      SET
        name = ?,
        slug = ?,
        image_url = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [name.trim(), slug, image_url || null, status, id]
    );

    res.json({
      ok: true,
      message: "Category updated successfully",
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    res.status(500).json({
      ok: false,
      message: "Update failed",
    });
  }
}


/* ================= ADMIN: LIST CATEGORIES ================= */
export const listCategoriesAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, status, image_url, created_at
      FROM categories
      ORDER BY created_at DESC
    `);

    res.json({
      ok: true,
      categories: rows,
    });
  } catch (err) {
    console.error("listCategoriesAdmin error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load categories",
    });
  }
};


/* ================= ADMIN: GET SINGLE CATEGORY ================= */
export const getCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [[category]] = await pool.query(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );

    if (!category) {
      return res.status(404).json({
        ok: false,
        message: "Category not found",
      });
    }

    res.json({
      ok: true,
      category,
    });
  } catch (err) {
    console.error("getCategoryAdmin error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load category",
    });
  }
};

/* ================= ADMIN: UPDATE CATEGORY ================= */
export const updateCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, image_url } = req.body;

    const [result] = await pool.query(
      `
      UPDATE categories
      SET name = ?, status = ?, image_url = ?
      WHERE id = ?
      `,
      [name, status, image_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Category not found",
      });
    }

    res.json({
      ok: true,
      message: "Category updated successfully",
    });
  } catch (err) {
    console.error("updateCategoryAdmin error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to update category",
    });
  }
};

export const getAdminCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT
        id,
        name,
        slug,
        status,
        image_url,
        created_at
      FROM categories
      ORDER BY created_at DESC
    `);

    res.json({
      ok: true,
      categories,
    });
  } catch (err) {
    console.error("Admin categories error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load categories",
    });
  }
};
