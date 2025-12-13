// routes/userRoutes.js
import express from "express";
import { listCustomers, setCustomerActive } from "../controllers/customerController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/customers", verifyToken, isAdmin, listCustomers);
router.patch("/customers/:id/active", verifyToken, isAdmin, setCustomerActive);

export default router;
