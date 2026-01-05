import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import {
  getProfile,
  listCustomersAdmin,
} from "../controllers/customerController.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// ✅ Logged-in user profile
router.get("/profile", authRequired, getProfile);

/* ================= ADMIN ROUTES ================= */
/* Base path: /api/admin/customers */

// ✅ Admin: list all customers (pagination + search)
router.get("/", authRequired, adminOnly, listCustomersAdmin);

export default router;


