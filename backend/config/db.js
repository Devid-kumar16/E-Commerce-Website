import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ DB HOST:", process.env.DB_HOST);
console.log("✅ DB USER:", process.env.DB_USER);
console.log("✅ DB NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "estore_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* ✅ Export BOTH (prevents ESM errors forever) */
export { pool };
export default pool;
