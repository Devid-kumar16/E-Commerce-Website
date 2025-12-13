import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";


function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email & password required"
      });
    }

    // Check duplicate email
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?)",
      [name, email, password_hash, role || "customer", 1]
    );

    // Prepare response user (NO TOKEN)
    const user = {
      id: result.insertId,
      name,
      email,
      role: role || "customer"
    };

    // IMPORTANT: NO TOKEN HERE
    return res.status(201).json({
      message: "Registration successful. Please login.",
      user
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      detail: err.message
    });
  }
}

// LOGIN 
export async function login(req, res) {
  console.log("LOGIN BODY:", req.body);
  try {
    const { email, password } = req.body;
    console.log(email, password )
    if (!email || !password) {
      return res.status(400).json({
        error: "Email & password required"
      });
    }

    // Fetch user
    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, role, active FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const user = rows[0];

    if (user.active === 0) {
      return res.status(403).json({
        error: "User account disabled"
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    // Generate token (ONLY HERE ✅)
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
    return res.status(500).json({
      error: "Server error",
      detail: err.message
    });
  }
}
