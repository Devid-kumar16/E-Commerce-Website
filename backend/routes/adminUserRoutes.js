import express from "express";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";


import {
  createCustomer,
  promoteUser,
  demoteUser,
  listAdminUsers,
  getAdminUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

/* ===============================
   CUSTOMER MANAGEMENT (ADMIN)
================================ */

// Add customer directly from Admin Panel
// POST /api/admin/customers
router.post(
  "/customers",
  authRequired,
  isAdmin,
  createCustomer
);

/* ===============================
   ADMIN USER MANAGEMENT
================================ */

// List admin users
// GET /api/admin/users
router.get(
  "/users",
  authRequired,
  isAdmin,
  listAdminUsers
);

// Get single user
// GET /api/admin/users/:id
router.get(
  "/users/:id",
  authRequired,
  isAdmin,
  getAdminUser
);

// Promote user to admin
// PATCH /api/admin/users/:id/promote
router.patch(
  "/users/:id/promote",
  authRequired,
  isAdmin,
  promoteUser
);

// Demote admin to customer
// PATCH /api/admin/users/:id/demote
router.patch(
  "/users/:id/demote",
  authRequired,
  isAdmin,
  demoteUser
);

export default router;
