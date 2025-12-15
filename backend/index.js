import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/* ---------- ROUTES ---------- */
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";


/* ---------- DEBUG ---------- */
console.log("✅ BACKEND DB NAME:", process.env.DB_NAME);

const app = express();

/* ---------- GLOBAL MIDDLEWARE (ORDER MATTERS) ---------- */
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

/* ---------- API ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);


/* ---------- HEALTH CHECK ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running", pid: process.pid });
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("❌ SERVER FAILED TO START");
  console.error(err);
  process.exit(1);
});
