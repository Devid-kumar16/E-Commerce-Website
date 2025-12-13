// routes/adminRoles.js
import express from "express";
import { pool } from "../config/db.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js"; // adjust path if different

const router = express.Router();

/**
 * GET /api/admin/roles/users
 * Return list of users with their roles (for admin UI)
 */
router.get("/users", authRequired, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.token_version,
        IFNULL(GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ','), '') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       GROUP BY u.id
       ORDER BY u.id`
    );
    return res.json({ ok: true, users: rows });
  } catch (err) {
    console.error("GET /api/admin/roles/users error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

/**
 * Helper: get role id by name using provided connection
 */
async function getRoleIdByName(conn, roleName) {
  const [rows] = await conn.query("SELECT id FROM roles WHERE name = ? LIMIT 1", [roleName]);
  if (!rows || rows.length === 0) return null;
  return rows[0].id;
}

/**
 * POST /api/admin/roles/grant
 * body: { userId, roleName, reason }
 */
router.post("/grant", authRequired, adminOnly, async (req, res) => {
  const { userId, roleName, reason } = req.body || {};
  const changedBy = req.user?.id || null;

  if (!userId || !roleName) {
    return res.status(400).json({ ok: false, message: "userId and roleName are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const roleId = await getRoleIdByName(conn, roleName);
    if (!roleId) {
      await conn.rollback();
      return res.status(400).json({ ok: false, message: "Unknown role" });
    }

    // snapshot before
    const [beforeRows] = await conn.query(
      `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?`,
      [userId]
    );
    const before = (beforeRows || []).map((r) => r.name);

    // insert mapping (ignore duplicates)
    await conn.query(
      `INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by, assigned_at, reason)
       VALUES (?, ?, ?, NOW(), ?)`,
      [userId, roleId, changedBy, reason || null]
    );

    // bump token_version for the user (invalidate previous tokens)
    await conn.query("UPDATE users SET token_version = COALESCE(token_version,0) + 1 WHERE id = ?", [userId]);

    // snapshot after
    const [afterRows] = await conn.query(
      `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?`,
      [userId]
    );
    const after = (afterRows || []).map((r) => r.name);

    // audit
    await conn.query(
      `INSERT INTO role_change_audit (user_id, changed_by, old_roles, new_roles, reason, ip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, changedBy, JSON.stringify(before), JSON.stringify(after), reason || null, req.ip || null]
    );

    await conn.commit();
    return res.json({ ok: true, message: "Role granted", userId, roleName, newRoles: after });
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    console.error("grant role error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  } finally {
    conn.release();
  }
});

/**
 * POST /api/admin/roles/revoke
 * body: { userId, roleName, reason }
 */
router.post("/revoke", authRequired, adminOnly, async (req, res) => {
  const { userId, roleName, reason } = req.body || {};
  const changedBy = req.user?.id || null;

  if (!userId || !roleName) {
    return res.status(400).json({ ok: false, message: "userId and roleName are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const roleId = await getRoleIdByName(conn, roleName);
    if (!roleId) {
      await conn.rollback();
      return res.status(400).json({ ok: false, message: "Unknown role" });
    }

    // snapshot before
    const [beforeRows] = await conn.query(
      `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?`,
      [userId]
    );
    const before = (beforeRows || []).map((r) => r.name);

    // delete mapping
    await conn.query("DELETE FROM user_roles WHERE user_id = ? AND role_id = ?", [userId, roleId]);

    // bump token_version for the user (invalidate tokens)
    await conn.query("UPDATE users SET token_version = COALESCE(token_version,0) + 1 WHERE id = ?", [userId]);

    // snapshot after
    const [afterRows] = await conn.query(
      `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?`,
      [userId]
    );
    const after = (afterRows || []).map((r) => r.name);

    // audit
    await conn.query(
      `INSERT INTO role_change_audit (user_id, changed_by, old_roles, new_roles, reason, ip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, changedBy, JSON.stringify(before), JSON.stringify(after), reason || null, req.ip || null]
    );

    await conn.commit();
    return res.json({ ok: true, message: "Role revoked", userId, roleName, newRoles: after });
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* ignore */ }
    console.error("POST /api/admin/roles/revoke error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  } finally {
    conn.release();
  }
});

export default router;
