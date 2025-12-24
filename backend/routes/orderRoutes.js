import express from "express";
import {
  createOrder,
  listOrdersForUser,
  listOrdersAdmin,
  createOrderAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
  getOrderWithItemsAdmin, // ✅ ONLY THIS
} from "../controllers/orderController.js";

import { authRequired, isAdmin } from "../middleware/authMiddleware.js";
import { searchCustomers } from "../controllers/customerController.js";

const router = express.Router();

/* USER */
router.post("/", authRequired, createOrder);
router.get("/my", authRequired, listOrdersForUser);

/* ADMIN */
router.post("/admin/create", authRequired, isAdmin, createOrderAdmin);
router.get("/admin", authRequired, isAdmin, listOrdersAdmin);
router.get("/admin/:id", authRequired, isAdmin, getOrderWithItemsAdmin);
router.put("/admin/:id", authRequired, isAdmin, updateOrderAdmin);
router.delete("/admin/:id", authRequired, isAdmin, deleteOrderAdmin);

/* CUSTOMER SEARCH */
router.get("/customers/search", authRequired, isAdmin, searchCustomers);
router.post(
  "/admin/create",
  authRequired,
  isAdmin,
  createOrderAdmin
);
export default router;
