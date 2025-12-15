// backend/models/Product.js
import {pool} from "../config/db.js";

/**
 * Product model
 * Matches DB columns exactly
 */

function buildWhereClause({ q, categoryId, published, active }, params) {
  const where = [];

  if (published !== undefined) {
    where.push(published ? "p.status = 'published'" : "p.status <> 'published'");
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

/* slug helper */
function makeSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const ProductModel = {
  /* ================= ADMIN LIST ================= */
  async listAdmin({ page = 1, limit = 10, q, categoryId, published, active } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const where = buildWhereClause({ q, categoryId, published, active }, params);

    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.inventory,
        p.stock,
        p.status,
        p.active,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.id ASC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [products] = await pool.query(sql, params);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`,
      params.slice(0, params.length - 2)
    );

    return { products, total };
  },

  /* ================= FIND BY ID ================= */
  async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.inventory,
        p.stock,
        p.status,
        p.active,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
      LIMIT 1
      `,
      [id]
    );
    return rows[0] || null;
  },

  /* ================= CREATE ================= */
  async create(data) {
    const {
      name,
      description = null,
      price,
      category_id,
      inventory = 0,
      stock = 0,
      status = "draft",
      admin_id = null,
      active = 1,
    } = data;

    if (!name) throw new Error("name is required");

    const slug = makeSlug(name);

    const [result] = await pool.query(
      `
      INSERT INTO products
      (admin_id, name, slug, description, price, category_id, inventory, stock, status, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        admin_id,
        name,
        slug,
        description,
        price,
        category_id,
        inventory,
        stock,
        status,
        active,
      ]
    );

    return this.findById(result.insertId);
  },

  /* ================= UPDATE ================= */
  async update(id, fields) {
    const allowed = [
      "name",
      "description",
      "price",
      "category_id",
      "inventory",
      "stock",
      "status",
      "active",
    ];

    const set = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        set.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    if (!set.length) return this.findById(id);

    await pool.query(
      `UPDATE products SET ${set.join(", ")} WHERE id = ?`,
      [...params, id]
    );

    return this.findById(id);
  },

  /* ================= DELETE ================= */
  async remove(id) {
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return true;
  },
};

export default ProductModel;
