import express from "express";
import { register, login, getProfile, updateProfile } from "../controllers/authController.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);

export default router;
