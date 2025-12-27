import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

/* ================== SAFETY CHECK ================== */
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/* ================== TOKEN HELPER ================== */
function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

/* ==================================================
   REGISTER
   - Default role: customer
   - Admin requires admin_key
================================================== */
export async function register(req, res) {
  try {
    let { name, email, password, role, admin_key } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Name, email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    let finalRole = "customer";

    if (role === "admin") {
      if (!admin_key || admin_key !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          ok: false,
          message: "Invalid admin key",
        });
      }
      finalRole = "admin";
    }

    // Check existing email
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        ok: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, active)
       VALUES (?, ?, ?, ?, 1)`,
      [name, email, password_hash, finalRole]
    );

    return res.status(201).json({
      ok: true,
      message: "Registration successful",
      role: finalRole,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
}

/* ==================================================
   LOGIN
================================================== */
export async function login(req, res) {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    // Get active user only
    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = ? AND active = 1
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    // Compare password with password_hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = createToken(user);

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
}
