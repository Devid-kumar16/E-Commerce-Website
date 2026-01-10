// routes/orderRoutes.js

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

/* ======================================================
   CUSTOMER / GUEST — CREATE ORDER
   Base: /api/orders
====================================================== */
router.post(
  "/",
  attachUserIfExists,
  checkoutSession,
  createOrder
);

/* ======================================================
   CUSTOMER / GUEST — LIST MY ORDERS
====================================================== */
router.get(
  "/my",
  attachUserIfExists,
  checkoutSession,
  listOrdersForSession
);

/* ======================================================
   CUSTOMER / GUEST — ORDER DETAILS
====================================================== */
router.get(
  "/details/:id",
  attachUserIfExists,
  checkoutSession,
  getOrderWithItemsForSession
);

/* ======================================================
   ADMIN — CREATE ORDER MANUALLY
   Base: /api/orders/admin
====================================================== */
router.post(
  "/admin",
  authRequired,
  adminOnly,
  createOrderAdmin
);

export default router;
