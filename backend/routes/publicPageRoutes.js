import express from "express";
import { getPageBySlug } from "../controllers/cmsController.js";

const router = express.Router();

// PUBLIC – no auth
router.get("/:slug", getPageBySlug);

export default router;
