// backend/controllers/authController.js
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ======================================================
   REGISTER (Customer only)
====================================================== */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (exists.length)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, active)
       VALUES (?, ?, ?, 'customer', 1)`,
      [name, email, hashed]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role: "customer",
    };

    const token = createToken(user);

    return res.json({ ok: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   LOGIN (Admin + Customer)
====================================================== */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash, role, active 
       FROM users 
       WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];

    if (!user.active)
      return res.status(403).json({ message: "Account disabled" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


/* ======================================================
   GET LOGGED-IN USER
====================================================== */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      `SELECT id, name, email, role, phone, area, state, pincode, address 
       FROM users WHERE id = ?`,
      [userId]
    );

    return res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
}




/* ========================= UPDATE PROFILE ========================= */
export async function updateProfile(req, res) {
  try {
    const { name, phone, area, address, state, pincode } = req.body;

    await pool.query(
      `UPDATE users SET name=?, phone=?, area=?, address=?, state=?, pincode=?
       WHERE id = ?`,
      [name, phone, area, address, state, pincode, req.user.id]
    );

    return res.json({ ok: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
}

