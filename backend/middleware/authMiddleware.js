import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

/* ======================================================
   OPTIONAL AUTH — Reads token if present
====================================================== */
export function attachUserIfExists(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
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
  } catch {
    req.user = null;
  }

  next();
}


/* ======================================================
   REQUIRED LOGIN — Protects secure routes
====================================================== */
export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
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
   ADMIN ONLY — protects all admin routes
====================================================== */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      ok: false,
      message: "Admin access only",
    });
  }

  next();
}



/* ======================================================
   CHECKOUT SESSION (Guest checkout support)
====================================================== */
export function checkoutSession(req, res, next) {
  if (req.user) {
    req.sessionUser = req.user;
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
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  req.sessionUser = { id: null };
  req.checkoutSessionId = sessionId;

  next();
}
