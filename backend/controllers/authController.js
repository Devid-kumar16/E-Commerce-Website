// backend/controllers/authController.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/* ========================= TOKEN CREATOR ========================= */
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

/* ========================= REGISTER ========================= */
export async function register(req, res) {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({ ok: false, message: "Email exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, active)
       VALUES (?, ?, ?, 'customer', 1)`,
      [name, email, password_hash]
    );

    return res.json({ ok: true, message: "Registration successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}

/* ========================= LOGIN ========================= */
export async function login(req, res) {
  try {
    let { email, password } = req.body;

    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role, phone, area, state, pincode, address
       FROM users WHERE email = ? AND active = 1 LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const token = createToken(user);

    return res.json({
      ok: true,
      token,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
}

/* ========================= GET PROFILE ========================= */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, name, email, phone, area, state, pincode, address
       FROM users WHERE id = ?`,
      [userId]
    );

    return res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
}

/* ========================= UPDATE PROFILE ========================= */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, area, address, pincode, state } = req.body;

    await pool.query(
      `UPDATE users SET name=?, phone=?, area=?, address=?, pincode=?, state=?
       WHERE id = ?`,
      [name, phone, area, address, pincode, state, userId]
    );

    return res.json({ ok: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Update failed" });
  }
}
