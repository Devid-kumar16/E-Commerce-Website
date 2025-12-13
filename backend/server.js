// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());                 // 🔥 REQUIRED
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);    

app.get("/", (req, res) => {
  res.json({ status: "Backend is running", pid: process.pid });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
