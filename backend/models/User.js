// backend/models/User.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

export const UserModel = {
  async create({ name, email, password, role = "customer" }) {
    const hashed = await bcrypt.hash(password, 10);
    const [res] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, hashed, role]
    );
    const insertedId = res.insertId;
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [insertedId]
    );
    return rows[0];
  },

  // Return the raw passwordHash as a string (or null) and other user fields
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash AS passwordHash, role
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    const r = rows[0] || null;
    if (!r) return null;

    // Normalize passwordHash to string or null
    if (typeof r.passwordHash === "undefined" || r.passwordHash === null) {
      r.passwordHash = null;
    } else {
      // ensure it's a string (some drivers may return Buffer)
      r.passwordHash = String(r.passwordHash);
    }

    return r;
  },

  // Safe compare that handles missing hash gracefully
  async comparePassword(raw, hash) {
    if (typeof raw !== "string") {
      throw new Error("Invalid password argument (expected string)");
    }
    if (typeof hash !== "string" || hash.length === 0) {
      // do not expose internal details — return false so login fails cleanly
      return false;
    }
    return bcrypt.compare(raw, hash);
  }
};

export default UserModel;
