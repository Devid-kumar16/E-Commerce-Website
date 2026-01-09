import { pool } from "../config/db.js";

/* ============================================================
   1) ADMIN — LIST CUSTOMERS (pagination + search)
   GET /api/admin/customers
   Query: ?page=1&limit=10&q=abc
============================================================ */
export async function listCustomersAdmin(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const q = req.query.q ? `%${req.query.q}%` : null;

    const where = [`u.role = 'customer'`];
    const params = [];

    if (q) {
      where.push("(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)");
      params.push(q, q, q);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [rows] = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.area,
        u.created_at,
        COUNT(o.id) AS orders
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      ${whereSql}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total 
      FROM users u 
      ${whereSql}
      `,
      params
    );

    res.json({
      customers: rows,
      meta: {
        total: countRows[0].total,
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("listCustomersAdmin error:", err);
    res.status(500).json({ message: "Server error fetching customers" });
  }
}

/* ============================================================
   2) ADMIN — SEARCH CUSTOMERS (phone auto-fill)
   GET /api/admin/customers/search?q=xxxx
============================================================ */
export const searchCustomers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (q.length < 3) {
      return res.json({ customers: [] });
    }

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        name,
        email,
        phone,
        area
      FROM users
      WHERE role = 'customer'
        AND active = 1
        AND (
          phone LIKE ?
          OR name LIKE ?
          OR email LIKE ?
        )
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [like, like, like]
    );

    res.json({ customers: rows });
  } catch (err) {
    console.error("Customer search error:", err);
    res.status(500).json({ message: "Failed to search customers" });
  }
};


/* ============================================================
   3) USER — GET PROFILE
   GET /api/customers/profile
============================================================ */
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Authentication required",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        role, 
        created_at
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    res.json({
      ok: true,
      user: rows[0],
    });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load profile",
    });
  }
};
