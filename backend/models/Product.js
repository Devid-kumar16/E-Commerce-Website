// backend/models/Product.js
import pool from "../config/db.js";

/* ================= HELPERS ================= */

function buildWhereClause({ q, categoryId, published, active }, params) {
  const where = [];

  if (published !== undefined) {
    where.push(
      published ? "p.status = 'published'" : "p.status <> 'published'"
    );
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

function makeSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ================= MODEL ================= */

const ProductModel = {
  /* ================= ADMIN LIST ================= */
  async listAdmin({ page = 1, limit = 10, q, categoryId, published, active } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const where = buildWhereClause({ q, categoryId, published, active }, params);

    const [products] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.status,
        p.active,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`,
      params
    );

    return { products, total };
  },

  /* ================= FIND BY ID ================= */
  async findById(id) {
    const [[product]] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.status,
        p.active,
        c.name AS category,
        p.category_id
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
      LIMIT 1
      `,
      [id]
    );

    return product || null;
  },

  /* ================= CREATE ================= */
  async create(data) {
    const {
      name,
      description = null,
      price,
      category_id,
      stock = 0,
      status = "draft",
      admin_id = null,
    } = data;

    if (!name) throw new Error("Product name is required");

    const slug = makeSlug(name);
    const active = stock > 0 ? 1 : 0;

    const [result] = await pool.query(
      `
      INSERT INTO products
      (admin_id, name, slug, description, price, category_id, stock, status, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        admin_id,
        name,
        slug,
        description,
        price,
        category_id,
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
      "stock",
      "status",
    ];

    const set = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        set.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    // auto-active handling
    if (fields.stock !== undefined) {
      set.push("active = ?");
      params.push(fields.stock > 0 ? 1 : 0);
    }

    if (!set.length) return this.findById(id);

    await pool.query(
      `UPDATE products SET ${set.join(", ")} WHERE id = ?`,
      [...params, id]
    );

    return this.findById(id);
  },

  /* ================= INVENTORY UPDATE (ADMIN) ================= */
  async setInventory(id, stock) {
    const active = stock > 0 ? 1 : 0;

    const [result] = await pool.query(
      `
      UPDATE products
      SET stock = ?, active = ?
      WHERE id = ?
      `,
      [stock, active, id]
    );

    if (result.affectedRows === 0) return null;

    return this.findById(id);
  },

  /* ================= DELETE ================= */
  async remove(id) {
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return true;
  },
};

export default ProductModel;
