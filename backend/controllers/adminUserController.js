import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

/* ===============================
   CREATE CUSTOMER (ADMIN PANEL)
   POST /api/admin/customers
================================ */
export async function createCustomer(req, res) {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // check duplicate email
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ CORRECT INSERT (matches table 100%)
    await pool.query(
      `INSERT INTO users
       (name, email, password_hash, role, active, token_version, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name.trim(),
        email.trim(),
        passwordHash,
        "customer",
        1,
        0,
      ]
    );

    res.json({
      ok: true,
      message: "Customer created successfully",
    });
  } catch (err) {
    console.error("❌ createCustomer DB error:", err.sqlMessage || err);

    res.status(500).json({
      message: "Server error creating customer",
    });
  }
}

/* ===============================
   PROMOTE USER TO ADMIN
================================ */
export async function promoteUser(req, res) {
  try {
    const id = req.params.id || req.body?.id;
    if (!id) return res.status(400).json({ message: "user id required" });

    await pool.query(
      "UPDATE users SET role = 'admin', active = 1, updated_at = NOW() WHERE id = ?",
      [id]
    );

    res.json({ id, promoted: true });
  } catch (err) {
    console.error("promoteUser error:", err);
    res.status(500).json({ message: "Server error promoting user" });
  }
}

/* ===============================
   DEMOTE ADMIN TO CUSTOMER
================================ */
export async function demoteUser(req, res) {
  try {
    const id = req.params.id || req.body?.id;
    if (!id) return res.status(400).json({ message: "user id required" });

    const role = req.body.role || "customer";

    await pool.query(
      "UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?",
      [role, id]
    );

    res.json({ id, role });
  } catch (err) {
    console.error("demoteUser error:", err);
    res.status(500).json({ message: "Server error demoting user" });
  }
}

/* ===============================
   LIST ADMIN USERS
================================ */
export async function listAdminUsers(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q}%` : null;

    let where = "WHERE role = 'admin'";
    const params = [];

    if (q) {
      where += " AND (name LIKE ? OR email LIKE ?)";
      params.push(q, q);
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, role, active, created_at
       FROM users
       ${where}
       ORDER BY created_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [count] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    );

    res.json({
      meta: { total: count[0].total, page },
      data: rows,
    });
  } catch (err) {
    console.error("listAdminUsers error:", err);
    res.status(500).json({ message: "Server error listing admin users" });
  }
}

/* ===============================
   GET SINGLE USER
================================ */
export async function getAdminUser(req, res) {
  try {
    const id = req.params.id;

    const [rows] = await pool.query(
      "SELECT id, name, email, role, active, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("getAdminUser error:", err);
    res.status(500).json({ message: "Server error getting user" });
  }
}
