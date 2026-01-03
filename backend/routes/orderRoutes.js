import express from "express";
import {
  createOrder,
  listOrdersForUser,
  listOrdersAdmin,
  createOrderAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
  getOrderWithItemsAdmin,
  getOrderWithItemsForUser,
} from "../controllers/orderController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import { searchCustomers } from "../controllers/customerController.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

// ✅ Admin: list all orders
router.get("/admin", authRequired, adminOnly, listOrdersAdmin);

// ✅ Admin: create order (MAIN FIX 🔥)
router.post("/admin/create", authRequired, adminOnly, createOrderAdmin);

// ✅ Admin: order details
router.get("/admin/:id", authRequired, adminOnly, getOrderWithItemsAdmin);

// ✅ Admin: update order
router.put("/admin/:id", authRequired, adminOnly, updateOrderAdmin);

// ✅ Admin: delete order
router.delete("/admin/:id", authRequired, adminOnly, deleteOrderAdmin);

// ✅ Admin: customer search
router.get("/customers/search", authRequired, adminOnly, searchCustomers);

/* ================= USER / WEBSITE ================= */

// ✅ Guest checkout
router.post("/", createOrder);

// ✅ Logged-in user: order history
router.get("/my", authRequired, listOrdersForUser);

// ✅ Logged-in user: order details
router.get("/:id", authRequired, getOrderWithItemsForUser);

export default router;
