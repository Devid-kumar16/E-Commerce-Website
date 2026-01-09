import express from "express";
import {
  listOrdersAdmin,
  createOrderAdmin,
  getOrderAdmin,
  getOrderWithItemsAdmin,
  updateOrderAdmin,
  deleteOrderAdmin
} from "../controllers/orderController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Base path: /api/admin/orders
 */

// LIST ALL ORDERS
router.get("/", authRequired, adminOnly, listOrdersAdmin);

// CREATE ORDER (ADMIN)
router.post("/", authRequired, adminOnly, createOrderAdmin);

// GET FULL ORDER DETAILS + ITEMS (Main API for frontend)
router.get("/single/:id", authRequired, adminOnly, getOrderWithItemsAdmin);

// GET BASIC ORDER (Optional)
router.get("/:id", authRequired, adminOnly, getOrderAdmin);

// UPDATE ORDER
router.put("/:id", authRequired, adminOnly, updateOrderAdmin);

// DELETE ORDER
router.delete("/:id", authRequired, adminOnly, deleteOrderAdmin);

export default router;

