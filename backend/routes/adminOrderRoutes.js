import express from "express";
import {
  getAdminOrders,        // ✅ PAGINATION FIXED
  createOrderAdmin,
  deleteOrderAdmin,
  getOrderWithItemsAdmin,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   ADMIN — LIST ORDERS WITH PAGINATION
   GET /admin/orders?page=1&limit=10
====================================================== */
router.get("/", authRequired, adminOnly, getAdminOrders);

/* ======================================================
   ADMIN — GET SINGLE ORDER
   GET /admin/orders/:id
====================================================== */
router.get("/:id", authRequired, adminOnly, getOrderWithItemsAdmin);

/* ======================================================
   ADMIN — CREATE ORDER (Manual Entry)
   POST /admin/orders
====================================================== */
router.post("/", authRequired, adminOnly, createOrderAdmin);

/* ======================================================
   ADMIN — UPDATE ORDER STATUS
   PUT/PATCH /admin/orders/:id/status
====================================================== */
router.put("/:id/status", authRequired, adminOnly, updateOrderStatus);
router.patch("/:id/status", authRequired, adminOnly, updateOrderStatus);

/* ======================================================
   ADMIN — DELETE ORDER
   DELETE /admin/orders/:id
====================================================== */
router.delete("/:id", authRequired, adminOnly, deleteOrderAdmin);

export default router;


