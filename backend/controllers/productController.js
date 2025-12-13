// controllers/productController.js
import ProductModel from "../models/Product.js";

/* ---------- helpers ---------- */
function makeSlug(text) {
  if (!text) return null;
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars
    .replace(/\s+/g, "-")       // spaces -> hyphens
    .replace(/-+/g, "-");       // collapse dashes
}

/* ---------- public listings ---------- */
export async function listPublicProducts(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const q = req.query.q || "";
    const categoryId = req.query.categoryId || undefined;

    const products = await ProductModel.list({ page, limit, q, categoryId, published: true, active: true });
    const total = await ProductModel.count({ q, categoryId, published: true, active: true });
    res.json({ page, limit, total, products });
  } catch (err) { next(err); }
}

// admin: list all (active/inactive, etc.)
export async function listAdminProducts(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const q = req.query.q || "";
    const status = req.query.status; // optional
    const active = typeof req.query.active !== "undefined" ? (req.query.active === "1" || req.query.active === "true") : undefined;
    const products = await ProductModel.list({ page, limit, q, active, published: typeof req.query.published !== "undefined" ? (req.query.published === "1" || req.query.published === "true") : undefined });
    const total = await ProductModel.count({ q, active });
    res.json({ page, limit, total, products });
  } catch (err) { next(err); }
}

export async function getProduct(req, res, next) {
  try {
    const id = req.params.id;
    const p = await ProductModel.findById(id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) { next(err); }
}

/* ---------- CREATE (fixed) ---------- */
export async function createProduct(req, res, next) {
  try {
    const incoming = req.body || {};

    // basic validation
    const name = incoming.name && String(incoming.name).trim();
    const priceRaw = incoming.price;
    if (!name || priceRaw == null) {
      return res.status(400).json({ message: "name and price are required" });
    }

    // prepare sanitized data object to send to ProductModel.create
    const slug = incoming.slug && String(incoming.slug).trim().length ? String(incoming.slug).trim() : makeSlug(name);
    if (!slug) return res.status(400).json({ message: "slug could not be generated; provide slug or valid name" });

    const data = {
      name,
      slug,
      price: Number(priceRaw) || 0,
      inventory: typeof incoming.inventory !== "undefined" ? Number(incoming.inventory) || 0 : 0,
      stock: typeof incoming.stock !== "undefined" ? Number(incoming.stock) || 0 : 0,
      description: typeof incoming.description !== "undefined" ? incoming.description : null,
      active: typeof incoming.active !== "undefined" ? (incoming.active === 1 || incoming.active === "1" || incoming.active === true || incoming.active === "true") : 1,
      status: typeof incoming.status !== "undefined" ? incoming.status : "draft",
      category_id: typeof incoming.category_id !== "undefined" ? incoming.category_id : null,
    };

    // attach admin id from req.user if available
    if (req.user && req.user.id) data.admin_id = req.user.id;

    // create via model
    const p = await ProductModel.create(data);

    // return created product (model should return inserted row or id)
    // if model returned inserted id, attempt to fetch full row
    if (p && p.id) {
      // assume model returns full product; if it only returns id, the model should be patched.
      return res.status(201).json(p);
    }

    // fallback: return whatever model returned
    return res.status(201).json(p);
  } catch (err) {
    // handle duplicate slug / unique violations
    // If your model throws underlying SQL error, adapt checks. Common code: ER_DUP_ENTRY
    if (err && (err.code === "ER_DUP_ENTRY" || (err.sqlMessage && err.sqlMessage.toLowerCase().includes("duplicate")))) {
      return res.status(400).json({ message: "Duplicate entry (probably slug already exists)", error: err.sqlMessage || err.message });
    }
    // generic pass-through to error handler
    next(err);
  }
}

/* ---------- updates / deletes ---------- */
export async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;
    const fields = req.body;
    const p = await ProductModel.update(id, fields);
    res.json(p);
  } catch (err) { next(err); }
}

export async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;
    await ProductModel.remove(id);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

/* ---------- toggles / inventory ---------- */
export async function publishToggle(req, res, next) {
  try {
    const id = req.params.id;
    const { published } = req.body;
    const p = await ProductModel.setPublished(id, published === true || published === "true" || published === 1);
    res.json(p);
  } catch (err) { next(err); }
}

export async function activeToggle(req, res, next) {
  try {
    const id = req.params.id;
    const { active } = req.body;
    const p = await ProductModel.setActive(id, active === true || active === "true" || active === 1);
    res.json(p);
  } catch (err) { next(err); }
}

export async function updateInventory(req, res, next) {
  try {
    const id = req.params.id;
    const { inventory } = req.body;
    const p = await ProductModel.setInventory(id, inventory);
    res.json(p);
  } catch (err) { next(err); }
}
