// routes/authRoutes.js
import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, getProfile);
router.get("/profile", authRequired, getProfile);

export default router;


