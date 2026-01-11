// routes/orderRoutes.js

import express from "express";

import {
  createOrder,
  listOrdersForSession,
  getOrderWithItemsForSession,
  createOrderAdmin
} from "../controllers/orderController.js";

import {
  authRequired,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   CUSTOMER / GUEST — CREATE ORDER
   POST /api/orders
====================================================== */
router.post("/", createOrder);

/* ======================================================
   CUSTOMER / GUEST — LIST MY ORDERS
   GET /api/orders/my
====================================================== */
router.get("/my", listOrdersForSession);

/* ======================================================
   CUSTOMER / GUEST — ORDER DETAILS
   GET /api/orders/details/:id
====================================================== */
router.get("/details/:id", getOrderWithItemsForSession);

/* ======================================================
   ADMIN — CREATE ORDER MANUALLY
   POST /api/orders/admin
====================================================== */
router.post("/admin", authRequired, adminOnly, createOrderAdmin);

export default router;

