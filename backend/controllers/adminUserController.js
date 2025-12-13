// backend/controllers/adminUserController.js
import { pool } from "../config/db.js";

/**
 * Promote a normal user to admin.
 * Accepts : POST /api/admin/users/:id/promote  OR body { id }
 */
export async function promoteUser(req, res) {
  try {
    const id = req.params.id || (req.body && req.body.id);
    if (!id) return res.status(400).json({ message: "user id required" });

    // set role to admin and active = 1
    await pool.query("UPDATE users SET role = 'admin', active = 1, updated_at = NOW() WHERE id = ?", [id]);

    // optional: insert audit row if admin_audit table exists
    try {
      await pool.query(
        "INSERT INTO admin_audit (admin_user_id, target_email, action, actor, ip, meta) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user && req.user.id ? req.user.id : null, null, "promote", req.user ? req.user.email || req.user.id : "script", null, JSON.stringify({ via: "promoteUser" })]
      );
    } catch (_) {
      // ignore if admin_audit doesn't exist
    }

    res.json({ id, promoted: true });
  } catch (err) {
    console.error("promoteUser error:", err);
    res.status(500).json({ message: "Server error promoting user" });
  }
}

/**
 * Demote admin back to customer (or a given role)
 * Accepts: POST /api/admin/users/:id/demote  OR body { id, role }
 */
export async function demoteUser(req, res) {
  try {
    const id = req.params.id || (req.body && req.body.id);
    if (!id) return res.status(400).json({ message: "user id required" });

    const role = req.body.role || "customer";
    await pool.query("UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?", [role, id]);

    // optional audit
    try {
      await pool.query(
        "INSERT INTO admin_audit (admin_user_id, target_email, action, actor, ip, meta) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user && req.user.id ? req.user.id : null, null, "demote", req.user ? req.user.email || req.user.id : "script", null, JSON.stringify({ via: "demoteUser", role })]
      );
    } catch (_) {}

    res.json({ id, role });
  } catch (err) {
    console.error("demoteUser error:", err);
    res.status(500).json({ message: "Server error demoting user" });
  }
}

/**
 * List admin users (or all users) with pagination & search
 * GET /api/admin/users?page=&limit=&q=
 */
export async function listAdminUsers(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q}%` : null;
    const where = ["role = 'admin'"];
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
    console.error("listAdminUsers error:", err);
    res.status(500).json({ message: "Server error listing admin users" });
  }
}

/**
 * Get single admin user
 * GET /api/admin/users/:id
 */
export async function getAdminUser(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      "SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getAdminUser error:", err);
    res.status(500).json({ message: "Server error getting admin user" });
  }
}
