// backend/testDb.js
import { pool } from "./config/db.js";

(async () => {
  try {
    console.log("Testing MySQL connection...");

    // test connection
    const [result] = await pool.query("SELECT 1 + 1 AS test");
    console.log("Connection OK →", result);

    // check table structure
    const [rows] = await pool.query("DESCRIBE products");
    console.log("Products Table Structure:");
    console.table(rows);

  } catch (e) {
    console.error("DESCRIBE error:", e.code, e.message);
  } finally {
    await pool.end();
    process.exit();
  }
})();

