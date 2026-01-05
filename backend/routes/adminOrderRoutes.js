import express from "express";
import {
  listOrdersAdmin,
  createOrderAdmin,
  getOrderWithItemsAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
} from "../controllers/orderController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Base path: /api/admin/orders
 */

router.get("/", authRequired, adminOnly, listOrdersAdmin);
router.post("/", authRequired, adminOnly, createOrderAdmin);
router.get("/:id", authRequired, adminOnly, getOrderWithItemsAdmin);
router.put("/:id", authRequired, adminOnly, updateOrderAdmin);
router.delete("/:id", authRequired, adminOnly, deleteOrderAdmin);

export default router;
