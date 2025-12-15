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
export async function listPublicProducts(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const q = req.query.q || "";
    const categoryId = req.query.categoryId || undefined;

    const products = await ProductModel.list({
      page,
      limit,
      q,
      categoryId,
      published: true,
      active: true,
    });

    const total = await ProductModel.count({
      q,
      categoryId,
      published: true,
      active: true,
    });

    res.json({ page, limit, total, products });
  } catch (err) {
    next(err);
  }
}

/* ---------- ADMIN PRODUCTS ---------- */
export async function listAdminProducts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    const [products] = await pool.query(
      "SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    const [[count]] = await pool.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    res.json({
      ok: true,
      products,
      total: count.total,
      page,
      limit,
    });
  } catch (err) {
    console.error("listAdminProducts error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load admin products",
    });
  }
}

/* ---------- SINGLE PRODUCT ---------- */
export async function getProduct(req, res, next) {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/* ---------- CREATE PRODUCT ---------- */
export async function createProduct(req, res) {
  try {
    console.log("CREATE PRODUCT BODY:", req.body);
    console.log("USER FROM TOKEN:", req.user);

    const {
      name,
      description,
      price,
      inventory,
      stock,
      category_id,
      status,
    } = req.body || {};

    if (!name || price == null) {
      return res.status(400).json({
        message: "Product name and price are required",
      });
    }

    const baseSlug = makeSlug(name);
    const slug = await generateUniqueSlug(baseSlug); // ✅ FIX

    const data = {
      name: String(name).trim(),
      slug,
      description: description || null,
      price: Number(price),
      inventory: Number(inventory) || 0,
      stock: Number(stock) || 0,
      category_id: category_id ? Number(category_id) : null,
      status: status || "draft",
      active: 1,
      admin_id: req.user.id,
    };

    const product = await ProductModel.create(data);

    res.status(201).json({
      ok: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Product with same name already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create product",
    });
  }
}

/* ---------- UPDATE PRODUCT ---------- */
export async function updateProduct(req, res, next) {
  try {
    const product = await ProductModel.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
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
