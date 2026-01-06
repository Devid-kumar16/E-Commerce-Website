import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

/* ======================================================
   1️⃣ SOFT AUTH (OPTIONAL USER)
   - Safe for checkout, cart, wishlist
   - NEVER blocks request
====================================================== */
export function attachUserIfExists(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (err) {
      // Invalid token → treat as guest
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

/* ======================================================
   2️⃣ HARD AUTH (PROTECTED ROUTES)
   - ALWAYS validates token itself
====================================================== */
export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "Authentication required",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      message: "Invalid or expired token",
    });
  }
}

/* ======================================================
   3️⃣ ADMIN ONLY (ROLE CHECK)
====================================================== */
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

/* ======================================================
   4️⃣ CHECKOUT SESSION (GUEST USERS)
====================================================== */
export function checkoutSession(req, res, next) {
  // Logged-in users don't need guest session
  if (req.user) {
    req.checkoutSessionId = null;
    return next();
  }

  let sessionId = req.cookies?.checkout_session_id;

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    res.cookie("checkout_session_id", sessionId, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  req.checkoutSessionId = sessionId;
  next();
}
