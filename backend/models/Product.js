// backend/models/Product.js
import { pool } from "../config/db.js";

/**
 * Product model - SQL wrapper
 * Matches your DB columns exactly:
 * id, admin_id, name, description, price, category_id,
 * status, inventory, created_at, active
 */

function buildWhereClause({ q, categoryId, published, active }, params) {
  const where = [];

  if (published !== undefined) {
    if (published) where.push("p.status = 'published'");
    else where.push("(p.status IS NULL OR p.status <> 'published')");
  }

  if (active !== undefined) {
    where.push("p.active = ?");
    params.push(active ? 1 : 0);
  }

  if (categoryId) {
    where.push("p.category_id = ?");
    params.push(categoryId);
  }

  if (q) {
    where.push("(p.name LIKE ? OR p.description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  return where.length ? `WHERE ${where.join(" AND ")}` : "";
}

/* helper to make slugs */
function makeSlug(text) {
  if (!text) return null;
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars
    .replace(/\s+/g, "-")       // spaces -> hyphens
    .replace(/-+/g, "-");       // collapse dashes
}

const ProductModel = {
  /** List for public + admin with filters */
  async list({ page = 1, limit = 12, q, categoryId, published, active } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const where = buildWhereClause({ q, categoryId, published, active }, params);

    const sql = `
      SELECT
        p.id,
        p.admin_id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        p.status,
        p.inventory,
        p.active,
        p.created_at,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /** Count for pagination */
  async count({ q, categoryId, published, active } = {}) {
    const params = [];
    const where = buildWhereClause({ q, categoryId, published, active }, params);

    const sql = `SELECT COUNT(*) AS total FROM products p ${where}`;
    const [rows] = await pool.query(sql, params);

    return rows?.[0]?.total || 0;
  },

  /** Get product by ID */
  async findById(id) {
    const sql = `
      SELECT
        p.id,
        p.admin_id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        p.status,
        p.inventory,
        p.active,
        p.created_at,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [id]);
    return rows?.[0] || null;
  },

  /** Create product (ensures slug present) */
  async create(data) {
    const {
      name,
      description = null,
      price = 0.0,
      category_id = null,
      status = "draft",
      inventory = 0,
      active = 1,
      admin_id = null,
      stock = 0,
      slug: incomingSlug,
    } = data;

    const nameClean = name && String(name).trim();
    if (!nameClean) throw new Error("name is required");

    const slug = incomingSlug && String(incomingSlug).trim().length ? String(incomingSlug).trim() : makeSlug(nameClean);
    if (!slug) throw new Error("unable to generate slug");

    const sql = `
      INSERT INTO products
        (admin_id, name, slug, description, price, category_id, status, inventory, stock, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      admin_id,
      nameClean,
      slug,
      description,
      Number(price) || 0,
      category_id,
      status,
      Number(inventory) || 0,
      Number(stock) || 0,
      active ? 1 : 0,
    ];

    const [result] = await pool.query(sql, params);
    return this.findById(result.insertId);
  },

  /** Update product */
  async update(id, fields = {}) {
    const allowed = ["name", "description", "price", "category_id", "status", "inventory", "active", "admin_id", "stock", "slug"];
    const set = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        set.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    if (!set.length) return this.findById(id);

    const sql = `UPDATE products SET ${set.join(", ")} WHERE id = ?`;
    params.push(id);

    await pool.query(sql, params);
    return this.findById(id);
  },

  /** Delete product */
  async remove(id) {
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return true;
  },

  /** Publish / Draft toggle */
  async setPublished(id, published = true) {
    const status = published ? "published" : "draft";

    await pool.query(
      "UPDATE products SET status = ? WHERE id = ?",
      [status, id]
    );

    return this.findById(id);
  },

  /** Active / Inactive toggle */
  async setActive(id, active = true) {
    await pool.query(
      "UPDATE products SET active = ? WHERE id = ?",
      [active ? 1 : 0, id]
    );
    return this.findById(id);
  },

  /** Update inventory */
  async setInventory(id, inventory = 0) {
    await pool.query(
      "UPDATE products SET inventory = ? WHERE id = ?",
      [inventory, id]
    );
    return this.findById(id);
  },
};

export default ProductModel;
