import express from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";


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
  adminOnly,
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
  adminOnly,
  listAdminUsers
);

// Get single user
// GET /api/admin/users/:id
router.get(
  "/users/:id",
  authRequired,
  adminOnly,
  getAdminUser
);

// Promote user to admin
// PATCH /api/admin/users/:id/promote
router.patch(
  "/users/:id/promote",
  authRequired,
  adminOnly,
  promoteUser
);

// Demote admin to customer
// PATCH /api/admin/users/:id/demote
router.patch(
  "/users/:id/demote",
  authRequired,
  adminOnly,
  demoteUser
);

export default router;
