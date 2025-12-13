// backend/routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrder,
  listOrdersPublic,
  listOrdersForUser,
  createOrderFromAdmin,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * USER ROUTES
 */
// create an order (authenticated checkout)
router.post("/", verifyToken, createOrder);

// list orders for the logged-in user
// keep /me as an alias, and also support GET /api/orders
router.get("/", verifyToken, listOrdersForUser);
router.get("/me", verifyToken, listOrdersForUser);

// get a single order (owner or admin)
router.get("/:id", verifyToken, getOrder);

/**
 * ADMIN ROUTES (protected)
 * Mounted under /api/orders/admin/*
 */
router.get("/admin", verifyToken, isAdmin, listOrdersPublic);         // GET /api/orders/admin -> list all
router.get("/admin/:id", verifyToken, isAdmin, getOrder);            // GET /api/orders/admin/:id -> view any
router.post("/admin", verifyToken, isAdmin, createOrderFromAdmin);   // POST /api/orders/admin -> create for a user
router.patch("/admin/:id/status", verifyToken, isAdmin, updateOrderStatus); // PATCH /api/orders/admin/:id/status

export default router;
