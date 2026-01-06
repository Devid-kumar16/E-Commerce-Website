import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/* AUTH MIDDLEWARE */
import {
  attachUserIfExists,
  checkoutSession,
} from "./middleware/authMiddleware.js";

/* ROUTES */
import couponRoutes from "./routes/couponRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminCouponRoutes from "./routes/adminCouponRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import publicPageRoutes from "./routes/publicPageRoutes.js";
import publicCmsRoutes from "./routes/publicCmsRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminCustomerRoutes from "./routes/adminCustomerRoutes.js";


/* DEBUG */
console.log("🔥 INDEX SERVER FILE LOADED");
console.log("✅ BACKEND DB NAME:", process.env.DB_NAME);

const app = express();

/* ================= GLOBAL MIDDLEWARE ================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ✅ REQUIRED FOR GUEST CHECKOUT */
app.use(cookieParser());

/* ✅ ORDER MATTERS (INDUSTRY STANDARD) */
app.use(attachUserIfExists); // soft auth (JWT if exists)
app.use(checkoutSession);    // guest checkout identity

/* ================= API ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/coupons", couponRoutes);
/* CART & WISHLIST */
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

/* ADMIN */
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/cms", cmsRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/", adminCustomerRoutes);
app.use("/api/admin", orderRoutes);


/* CMS */
app.use("/api/cms", cmsRoutes);
app.use("/api/pages", publicCmsRoutes);

/* GENERIC API (LAST) */
app.use("/api", dashboardRoutes);
app.use("/api", publicPageRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend is running",
    pid: process.pid,
  });
});

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({ message: "Page not found" });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
let server;

server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});

/* HANDLE PORT ERRORS */
server.on("error", (err) => {
  console.error("❌ SERVER FAILED TO START");
  console.error(err);
  process.exit(1);
});

/* ✅ GRACEFUL SHUTDOWN */
const shutdown = (signal) => {
  console.log(`🛑 ${signal} received. Closing server...`);
  if (server) {
    server.close(() => {
      console.log("✅ Server closed cleanly");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
