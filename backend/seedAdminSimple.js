// seedAdminSimple.js
import dotenv from "dotenv";
dotenv.config();
import { pool } from "./config/db.js";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    const email = "admin@example.com";
    const name = "Super Admin";
    const password = "Password123";
    const role = "admin";

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) {
      console.log("Admin already exists, skipping.");
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const [res] = await pool.query(
      "INSERT INTO users (name, email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())",
      [name, email, hashed, role]
    );
    console.log("Seeded admin: id=", res.insertId, " email=", email, " password=", password);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
