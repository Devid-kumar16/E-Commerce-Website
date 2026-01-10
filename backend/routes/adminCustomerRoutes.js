import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import {
  listCustomersAdmin,
  searchCustomers,
  getCustomerByPhone,
  getProfile,
} from "../controllers/customerController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", authRequired, adminOnly, listCustomersAdmin);
router.get("/search", authRequired, adminOnly, searchCustomers);

router.get("/get-by-phone", authRequired, adminOnly, getCustomerByPhone);

// Admin view of a customer (optional)
router.get("/:id", authRequired, adminOnly, getProfile);

export default router;


