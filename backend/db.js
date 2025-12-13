// backend/db.js

// Re-export the pool from backend/config/db.js
export { pool, getDB } from "./config/db.js";

// Default export for convenience
import { pool as defaultPool } from "./config/db.js";
export default defaultPool;

