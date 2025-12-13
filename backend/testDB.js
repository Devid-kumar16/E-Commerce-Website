// backend/testDb.js
import { pool } from "./config/db.js";

(async () => {
  try {
    const [r] = await pool.query("SELECT 1+1 AS ok");
    console.log("MySQL connection ok:", r);
    const [dbs] = await pool.query("SHOW DATABASES LIKE 'ecommerce'");
    console.log("ecommerce DB exists:", dbs.length > 0);
    const [tables] = await pool.query("SHOW TABLES FROM ecommerce");
    console.log("Tables in ecommerce:", tables.length ? tables : "none");
  } catch (e) {
    console.error("DB test error:", e.code, e.message);
  } finally {
    try { await pool.end(); } catch (e) {}
    process.exit();
  }
})();
