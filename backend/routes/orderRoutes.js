import express from "express";
import {
  listOrdersAdmin,
  createOrderAdmin,
} from "../controllers/orderController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADMIN
router.get("/admin", authRequired, isAdmin, listOrdersAdmin);
router.post("/admin", authRequired, isAdmin, createOrderAdmin);

export default router;
