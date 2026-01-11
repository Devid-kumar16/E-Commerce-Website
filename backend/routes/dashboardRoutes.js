// routes/dashboardRoutes.js
import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authRequired, adminOnly, adminDashboard);

export default router;



