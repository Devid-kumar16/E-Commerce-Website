import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import {
  listCustomersAdmin,
  searchCustomers,
  getCustomerByPhone,
  getProfile,
  createCustomerAdmin
} from "../controllers/customerController.js";

const router = express.Router();

// LIST customers
router.get("/", authRequired, adminOnly, listCustomersAdmin);

// SEARCH customers
router.get("/search", authRequired, adminOnly, searchCustomers);

// GET customer by phone
router.get("/get-by-phone", authRequired, adminOnly, getCustomerByPhone);

// CREATE a customer (ADMIN)  ⭐ FIX ADDED
router.post("/", authRequired, adminOnly, createCustomerAdmin);

// Admin view single customer (optional)
router.get("/:id", authRequired, adminOnly, getProfile);

export default router;
