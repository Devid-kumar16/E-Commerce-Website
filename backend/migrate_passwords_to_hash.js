// migrate_passwords_to_hash.js
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { pool } from "./config/db.js"; // adapt path as needed

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

async function main() {
  const conn = await pool.getConnection();
  try {
    // Select users with a plaintext password that hasn't been migrated
    const [rows] = await conn.query(
      "SELECT id, email, password FROM users WHERE password IS NOT NULL AND password <> '' AND (password_hash IS NULL OR password_hash = '')"
    );
    console.log('To migrate:', rows.length);

    for (const r of rows) {
      const pw = r.password;
      // hash
      const hash = await bcrypt.hash(pw, SALT_ROUNDS);
      await conn.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, r.id]);
      console.log(`Migrated id=${r.id} email=${r.email}`);
    }

    console.log("Migration complete. Verify rows and only then drop plaintext column.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    conn.release();
  }
}

main();
