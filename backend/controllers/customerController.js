// backend/controllers/customerController.js
import { pool } from "../config/db.js";

/**
 * listCustomers (admin)
 * GET /api/customers?search=&page=&limit=
 */
export async function listCustomers(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;
    const q = req.query.search ? `%${req.query.search}%` : null;

    const where = [];
    const params = [];

    if (q) {
      where.push("(name LIKE ? OR email LIKE ?)");
      params.push(q, q);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT id, name, email, role, active, created_at, updated_at
       FROM users
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);
    const total = countRows && countRows[0] ? Number(countRows[0].total) : rows.length;

    res.json({ meta: { total, page }, data: rows });
  } catch (err) {
    console.error("listCustomers error:", err);
    res.status(500).json({ message: "Server error listing customers" });
  }
}

/**
 * getCustomer
 * GET /api/customers/:id
 */
export async function getCustomer(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      "SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Customer not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getCustomer error:", err);
    res.status(500).json({ message: "Server error getting customer" });
  }
}

/**
 * createCustomer (admin)
 * POST /api/customers
 * Body: { name, email, password_hash (optional), role?, active? }
 */
export async function createCustomer(req, res) {
  try {
    const { name, email, password_hash = null, role = "customer", active = 1 } = req.body;
    if (!name || !email) return res.status(400).json({ message: "name and email are required" });

    // Check duplicate email
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing && existing.length) return res.status(409).json({ message: "Email already exists" });

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, active, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, email, password_hash, role, active ? 1 : 0]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("createCustomer error:", err);
    res.status(500).json({ message: "Server error creating customer" });
  }
}

/**
 * updateCustomer (admin)
 * PUT /api/customers/:id
 * Body: { name?, email?, role?, active? }
 */
export async function updateCustomer(req, res) {
  try {
    const id = req.params.id;
    const { name, email, role, active } = req.body;

    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push("name = ?");
      params.push(name);
    }
    if (email !== undefined) {
      fields.push("email = ?");
      params.push(email);
    }
    if (role !== undefined) {
      fields.push("role = ?");
      params.push(role);
    }
    if (active !== undefined) {
      fields.push("active = ?");
      params.push(active ? 1 : 0);
    }

    if (!fields.length) return res.status(400).json({ message: "Nothing to update" });

    params.push(id);
    const sql = `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await pool.query(sql, params);

    res.json({ id });
  } catch (err) {
    console.error("updateCustomer error:", err);
    res.status(500).json({ message: "Server error updating customer" });
  }
}

/**
 * setCustomerActive - toggles active flag (admin)
 * PATCH /api/customers/:id/active  with body { active: 1 } or { active: 0 }
 */
export async function setCustomerActive(req, res) {
  try {
    const id = req.params.id;
    const { active } = req.body;
    if (active === undefined) return res.status(400).json({ message: "active is required in body" });

    await pool.query("UPDATE users SET active = ?, updated_at = NOW() WHERE id = ?", [active ? 1 : 0, id]);

    res.json({ id, active: Boolean(active) });
  } catch (err) {
    console.error("setCustomerActive error:", err);
    res.status(500).json({ message: "Server error toggling customer active" });
  }
}
