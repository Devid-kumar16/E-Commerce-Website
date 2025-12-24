import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/* ROUTES */
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import publicPageRoutes from "./routes/publicPageRoutes.js";
import publicCmsRoutes from "./routes/publicCmsRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

/* DEBUG */
console.log("🔥 INDEX SERVER FILE LOADED");
console.log("✅ BACKEND DB NAME:", process.env.DB_NAME);

const app = express();

/* GLOBAL MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);

/* 🔥 CART & WISHLIST (MUST COME EARLY) */
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

/* ADMIN */
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/cms", cmsRoutes);

/* CMS */
app.use("/api/cms", cmsRoutes);
app.use("/api/pages", publicCmsRoutes);

/* ⚠️ GENERIC /api ROUTES (MUST BE LAST) */
app.use("/api", dashboardRoutes);
app.use("/api", publicPageRoutes);


/* HEALTH CHECK */
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", pid: process.pid });
});

/* ❌ 404 PAGE NOT FOUND (MUST BE LAST) */
app.use((req, res) => {
  res.status(404).json({ message: "Page not found" });
});

/* SERVER */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("❌ SERVER FAILED TO START");
  console.error(err);
  process.exit(1);
});
