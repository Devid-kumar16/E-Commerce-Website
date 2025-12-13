// models/Category.js
import { pool } from "../config/db.js";

export const CategoryModel = {
  async findById(id) {
    const [rows] = await pool.query("SELECT id, name, description, active, created_at, updated_at FROM categories WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async list({ page = 1, limit = 50, q, active } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const whereParts = [];
    if (q) {
      whereParts.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (typeof active !== "undefined") {
      whereParts.push("active = ?");
      params.push(active ? 1 : 0);
    }
    const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    const [rows] = await pool.query(`SELECT id, name, description, active, created_at FROM categories ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
    return rows;
  },

  async count({ q, active } = {}) {
    const params = [];
    const whereParts = [];
    if (q) {
      whereParts.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (typeof active !== "undefined") {
      whereParts.push("active = ?");
      params.push(active ? 1 : 0);
    }
    const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM categories ${where}`, params);
    return rows[0]?.total || 0;
  },

  async create({ name, description, active = 1 }) {
    const [res] = await pool.query("INSERT INTO categories (name, description, active, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())", [name, description || null, active ? 1 : 0]);
    const insertId = res.insertId;
    return this.findById(insertId);
  },

  async update(id, fields = {}) {
    const allowed = ["name", "description", "active"];
    const sets = [];
    const params = [];
    for (const k of Object.keys(fields)) {
      if (!allowed.includes(k)) continue;
      sets.push(`${k} = ?`);
      params.push(fields[k]);
    }
    if (!sets.length) throw new Error("No valid fields to update");
    params.push(id);
    await pool.query(`UPDATE categories SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`, params);
    return this.findById(id);
  },

  async remove(id) {
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    return true;
  }
};

export default CategoryModel;
