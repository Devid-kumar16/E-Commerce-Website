// backend/controllers/authController.js
import { pool } from "../config/db.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY; // 🔐

// helper
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

/**
 * REGISTER (CUSTOMER by default)
 * Admin creation ONLY via admin_key
 */
export async function register(req, res) {
  try {
    const { name, email, password, role, admin_key } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email & password required" });
    }

    let finalRole = "customer";

    // 🔐 ADMIN CREATION VIA SECRET KEY
    if (role === "admin") {
      if (!admin_key || admin_key !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: "Invalid admin key" });
      }
      finalRole = "admin";
    }

    // check existing user
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, active)
       VALUES (?, ?, ?, ?, 1)`,
      [name, email, password_hash, finalRole]
    );

    return res.status(201).json({
      message: "Registration successful",
      role: finalRole
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}


/**
 * LOGIN
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role, active
       FROM users WHERE email = ?`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.active === 0) {
      return res.status(403).json({ error: "Account disabled" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
}
