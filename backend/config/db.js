import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("✅ DB USER:", process.env.DB_USER);
console.log("✅ DB NAME:", process.env.DB_NAME);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,              // 🔴 MUST EXIST
  password: process.env.DB_PASSWORD,      // 🔴 MUST EXIST
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
