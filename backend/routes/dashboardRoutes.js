import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { authRequired, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin/dashboard", authRequired, isAdmin, adminDashboard);

export default router;
