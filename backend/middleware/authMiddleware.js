// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js"; // your mysql pool
import dotenv from "dotenv";
dotenv.config();

export const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info (minimal) to request
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    console.error("authRequired err:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  return next();
};
