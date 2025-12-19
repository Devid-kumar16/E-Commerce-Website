import express from "express";
import {
  createOrder,
  listOrdersForUser,
  listOrdersAdmin,
  createOrderAdmin,
  getOrderAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
} from "../controllers/orderController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===== USER ===== */
router.post("/", authRequired, createOrder);
router.get("/my", authRequired, listOrdersForUser);

/* ===== ADMIN ===== */
router.get("/admin", authRequired, isAdmin, listOrdersAdmin);
router.post("/admin", authRequired, isAdmin, createOrderAdmin);


router.get("/admin/:id", authRequired, isAdmin, getOrderAdmin);
router.put("/admin/:id", authRequired, isAdmin, updateOrderAdmin);
router.delete(
  "/admin/:id",
  authRequired,
  isAdmin,
  deleteOrderAdmin
);

export default router;
