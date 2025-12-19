import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/* ROUTES  */
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"; // ✅ ADD THIS
import cmsRoutes from "./routes/cmsRoutes.js";
import publicPageRoutes from "./routes/publicPageRoutes.js";
import publicCmsRoutes from "./routes/publicCmsRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

/*  DEBUG  */
console.log("🔥 INDEX SERVER FILE LOADED");
console.log("✅ BACKEND DB NAME:", process.env.DB_NAME);

const app = express();

/*  GLOBAL MIDDLEWARE  */
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

/*  API ROUTES  */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", dashboardRoutes); // ✅ THIS IS THE KEY FIX
app.use("/api/admin", adminUserRoutes);

app.use("/api/admin/cms", cmsRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api", publicPageRoutes);
app.use("/api/pages", publicCmsRoutes);
/* HEALTH CHECK  */
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", pid: process.pid });
});

/*  SERVER  */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("❌ SERVER FAILED TO START");
  console.error(err);
  process.exit(1);
});
