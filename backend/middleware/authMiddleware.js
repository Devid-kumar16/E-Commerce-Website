import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔐 Auth middleware
 * - Verifies JWT
 * - Attaches STANDARDIZED user object to req.user
 * - Required for cart / wishlist / orders
 */
export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  // ❌ No token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ STANDARD user object (IMPORTANT)
    req.user = {
      id: decoded.id,       // used as user_id in DB
      email: decoded.email, // optional
      role: decoded.role,   // admin / customer
    };

    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      message: "Invalid or expired token",
    });
  }
}

/**
 * 🔐 Admin check middleware
 * - Must be used AFTER authRequired
 */
export function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      ok: false,
      message: "Admin access only",
    });
  }

  next();
}

