import { pool } from "../config/db.js";

export async function listCustomersAdmin(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q}%` : null;

    const where = [`u.role = 'customer'`];
    const params = [];

    if (q) {
      where.push("(u.name LIKE ? OR u.email LIKE ?)");
      params.push(q, q);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    /* ================= MAIN QUERY ================= */
    const [rows] = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(o.id) AS orders
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      ${whereSql}
      GROUP BY u.id
      ORDER BY u.created_at DESC   -- ✅ MOST RECENT FIRST
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    /* ================= COUNT QUERY ================= */
    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM users u
      ${whereSql}
      `,
      params
    );

    res.json({
      data: rows,
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


export const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 3) {
      return res.json({ customers: [] });
    }

    const [customers] = await pool.query(
      `
      SELECT id, name, email, phone, area
      FROM users
      WHERE role = 'customer'
        AND active = 1
        AND (
          phone LIKE ?
          OR name LIKE ?
          OR email LIKE ?
        )
      LIMIT 5
      `,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({ customers });
  } catch (err) {
    console.error("Customer search error:", err);
    res.status(500).json({ message: "Failed to search customers" });
  }
};





/* ================= USER PROFILE ================= */
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
      SELECT id, name, email, phone, role, created_at
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


export const searchCustomersAdmin = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (q.length < 3) {
      return res.json({ customers: [] });
    }

    const [rows] = await pool.query(
      `
      SELECT id, name, email, phone, area, state, pincode, address
      FROM customers
      WHERE phone LIKE ? OR name LIKE ?
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [`%${q}%`, `%${q}%`]
    );

    res.json({ customers: rows });
  } catch (err) {
    console.error("Admin customer search error:", err);
    res.status(500).json({ message: "Failed to search customers" });
  }
};
