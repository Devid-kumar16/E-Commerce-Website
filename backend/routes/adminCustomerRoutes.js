import express from "express";
import { searchCustomers } from "../controllers/customerController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Base path: /api/admin/customers
 * Purpose: Admin-only customer utilities
 */
router.get("/customers/search", authRequired, adminOnly, searchCustomers);

export default router;
