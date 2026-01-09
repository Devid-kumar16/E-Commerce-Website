import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import {
  getProfile,
  listCustomersAdmin,
  searchCustomers
} from "../controllers/customerController.js";

const router = express.Router();

// USER — profile
router.get("/profile", authRequired, getProfile);

// ADMIN — list customers
router.get("/", authRequired, adminOnly, listCustomersAdmin);

// ADMIN — search (auto-fill)
router.get("/search", authRequired, adminOnly, searchCustomers);

export default router;

