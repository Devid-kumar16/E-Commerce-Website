import express from "express";
import {
  listOrdersAdmin,
  createOrderAdmin,
} from "../controllers/orderController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ORDERS ================= */

// GET all orders (Admin)
router.get("/admin/orders", authRequired, isAdmin, listOrdersAdmin);

// CREATE order (Admin)
router.post("/admin/orders", authRequired, isAdmin, createOrderAdmin);

export default router;

