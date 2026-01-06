import express from "express";
import {
  createOrder,
  listOrdersForSession,
  getOrderWithItemsForSession,
  createOrderAdmin,
} from "../controllers/orderController.js";

import {
  attachUserIfExists,
  checkoutSession,
  authRequired,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   CUSTOMER / GUEST ORDERS
   Base path: /api/orders
===================================================== */

// ✅ Guest + logged-in checkout
router.post(
  "/",
  attachUserIfExists,
  checkoutSession,
  createOrder
);

// ✅ Guest + logged-in order history
router.get(
  "/my",
  attachUserIfExists,
  checkoutSession,
  listOrdersForSession
);

// ✅ Guest + logged-in order details
router.get(
  "/:id",
  attachUserIfExists,
  checkoutSession,
  getOrderWithItemsForSession
);

/* =====================================================
   ADMIN ORDERS
   Base path: /api/admin/orders
===================================================== */

router.post(
  "/admin",
  authRequired,
  adminOnly,
  createOrderAdmin
);

export default router;
