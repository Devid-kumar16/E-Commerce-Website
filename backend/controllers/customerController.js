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
      ORDER BY u.created_at ASC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u ${whereSql}`,
      params
    );

    res.json({
      data: rows,
      meta: {
        total: countRows[0].total,
        page,
      },
    });
  } catch (err) {
    console.error("listCustomersAdmin error:", err);
    res.status(500).json({ message: "Server error fetching customers" });
  }
}
