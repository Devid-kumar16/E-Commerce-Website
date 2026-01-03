import { pool } from "../config/db.js";
import ProductModel from "../models/Product.js";

/* ---------- helpers ---------- */
function makeSlug(text) {
  if (!text) return null;
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const [[row]] = await pool.query(
      "SELECT id FROM products WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (!row) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

/* ---------- PUBLIC PRODUCTS ---------- */
export async function listPublicProducts(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        price,
        image_url,
        category_id
      FROM products
      WHERE status = 'published'
        AND active = 1
      ORDER BY id DESC
      LIMIT 20
    `);

    // ✅ ALWAYS return consistent JSON
    return res.json({
      ok: true,
      products: rows,
    });
  } catch (err) {
    console.error("❌ listPublicProducts error:", err);
    return res.status(500).json({
      ok: false,
      products: [],
      message: "Failed to load products",
    });
  }
}


/* ---------- ADMIN PRODUCTS ---------- */
export async function listAdminProducts(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.image_url,
        p.price,
        p.status,
        p.active,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
    `);

    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load products" });
  }
}



/* ---------- SINGLE PRODUCT ---------- */
export async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.status,
        p.stock,
        p.image_url AS image,
        p.description,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product: rows[0] });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to load product" });
  }
}




/* ---------- CREATE PRODUCT ---------- */
export async function createProduct(req, res) {
  try {
    const {
      name,
      price,
      status,
      category_id,
      image_url
    } = req.body;

    await pool.query(
      `INSERT INTO products (name, price, status, category_id, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, price, status, category_id, image_url || null]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
  }
}


/* ---------- UPDATE PRODUCT ---------- */

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, price, status, category_id, image_url } = req.body;

    await pool.query(
      `UPDATE products
       SET name=?, price=?, status=?, category_id=?, image_url=?
       WHERE id=?`,
      [name, price, status, category_id, image_url || null, id]
    );

    res.json({ message: "Product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
}



/* ---------- DELETE PRODUCT ---------- */
export async function deleteProduct(req, res, next) {
  try {
    await ProductModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ---------- PUBLISH / DRAFT ---------- */
export async function publishToggle(req, res, next) {
  try {
    const published =
      req.body.published === true ||
      req.body.published === "true" ||
      req.body.published === 1;

    const product = await ProductModel.setPublished(req.params.id, published);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/* ---------- ACTIVE / INACTIVE ---------- */
export async function activeToggle(req, res, next) {
  try {
    const active =
      req.body.active === true ||
      req.body.active === "true" ||
      req.body.active === 1;

    const product = await ProductModel.setActive(req.params.id, active);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/* ---------- UPDATE INVENTORY ---------- */
export async function updateInventory(req, res, next) {
  try {
    const inventory = Number(req.body.inventory) || 0;
    const product = await ProductModel.setInventory(req.params.id, inventory);
    res.json(product);
  } catch (err) {
    next(err);
  }
}


/**
 * GET products by category slug
 * URL: /api/products/category/:slug
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1️⃣ Find category by slug
    const [categories] = await pool.query(
      "SELECT id, name FROM categories WHERE slug = ?",
      [slug]
    );

    if (categories.length === 0) {
      return res.json({
        products: [],
        message: "Category not found",
      });
    }

    const categoryId = categories[0].id;

    // 2️⃣ Fetch products using category_id
    const [products] = await pool.query(
      "SELECT * FROM products WHERE category_id = ?",
      [categoryId]
    );

    res.json({
      category: categories[0],
      products,
    });
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
