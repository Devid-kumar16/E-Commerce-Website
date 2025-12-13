// test_db.js
import pool from "./config/db.js";

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS test");
    console.log("DB OK:", rows);
    await pool.end();
  } catch (err) {
    console.error("DB ERROR:", err);
    process.exit(1);
  }
})();

