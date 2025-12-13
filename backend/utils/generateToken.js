// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function generateToken(user) {
  if (!user || typeof user.id === "undefined") {
    throw new Error("generateToken requires a user object with an id");
  }
  if (!JWT_SECRET || typeof JWT_SECRET !== "string") {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id: user.id, role: user.role || "customer" }, JWT_SECRET, {
    expiresIn: "7d"
  });
}
