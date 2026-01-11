import express from "express";

import {
  listOrdersAdmin,              // LIST ORDERS
  createOrderAdmin,             // CREATE ORDER (ADMIN MANUAL)
  deleteOrderAdmin,             // DELETE ORDER
  getOrderWithItemsAdmin,       // ORDER DETAILS
  updateOrderStatusAdmin        // FIXED NAME
} from "../controllers/orderController.js";

import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   ADMIN — LIST ORDERS (NO PAGINATION REQUIRED)
====================================================== */
router.get("/", authRequired, adminOnly, listOrdersAdmin);

/* ======================================================
   ADMIN — GET SINGLE ORDER DETAILS
====================================================== */
router.get("/:id", authRequired, adminOnly, getOrderWithItemsAdmin);

/* ======================================================
   ADMIN — CREATE ORDER (MANUAL ENTRY)
====================================================== */
router.post("/", authRequired, adminOnly, createOrderAdmin);

/* ======================================================
   ADMIN — UPDATE ORDER STATUS
====================================================== */
router.put("/:id/status", authRequired, adminOnly, updateOrderStatusAdmin);
router.patch("/:id/status", authRequired, adminOnly, updateOrderStatusAdmin);

/* ======================================================
   ADMIN — DELETE ORDER
====================================================== */
router.delete("/:id", authRequired, adminOnly, deleteOrderAdmin);

export default router;
