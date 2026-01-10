import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

/* ======================================================
   1️⃣ OPTIONAL AUTH (Non-blocking)
   - Reads JWT if present
   - Used for: cart, wishlist, checkout page, public pages
====================================================== */
export function attachUserIfExists(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    req.user = null; // Invalid token → treat as guest
  }

  next();
}

/* ======================================================
   2️⃣ HARD AUTH (Required Login)
   - Protects user profile, orders, admin pages
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
   3️⃣ ADMIN CHECK
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
   4️⃣ CHECKOUT SESSION (For GUEST checkout only)
   - Logged-in user ALWAYS uses req.user
   - Guest gets a temporary checkout session ID
   - This does NOT create fake users
====================================================== */
export function checkoutSession(req, res, next) {
  // Logged-in user → skip guest checkout session
  if (req.user) {
    req.sessionUser = req.user; // always real user
    req.checkoutSessionId = null;
    return next();
  }

  // Guest user → create checkout session
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

  req.sessionUser = { id: null };      // very important
  req.checkoutSessionId = sessionId;

  next();
}
