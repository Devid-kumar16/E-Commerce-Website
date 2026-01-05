import express from "express";
import {
  createOrder,
  listOrdersForSession,
  getOrderWithItemsForSession,
  createOrderAdmin,
} from "../controllers/orderController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ================= CUSTOMER / GUEST ORDERS
 * Base path: /api/orders
 */

// Guest + logged-in checkout
router.post("/", createOrder);

// Guest + logged-in order history
router.get("/my", listOrdersForSession);

// Guest + logged-in order details
router.get("/:id", getOrderWithItemsForSession);

/**
 * ================= ADMIN ORDERS
 * Base path: /api/admin/orders
 */

// ✅ ADMIN CREATE ORDER (FIX)
router.post(
  "/admin/orders",
  authRequired,
  adminOnly,
  createOrderAdmin
);

export default router;
