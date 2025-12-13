// server.js - robust dynamic router mounting using pathToFileURL
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

function globalErrorHandler(err, req, res, next) {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ message: err && err.message ? err.message : "Internal server error" });
}

/**
 * tryMountRoute:
 * - mountPath: URL mount point, e.g. "/api/auth"
 * - relPath: relative path to module from project root, e.g. "./routes/authRoutes.js"
 * - useDefaultExport: whether to prefer default export as router
 */
async function tryMountRoute(app, mountPath, relPath, useDefaultExport = true) {
  try {
    const full = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(full)) {
      console.log(`[skip] ${relPath} not found; skipping ${mountPath}`);
      return false;
    }

    // Reliable ESM import from absolute path
    const mod = await import(pathToFileURL(full).href);
    const router = useDefaultExport ? (mod.default ?? mod.router ?? mod) : (mod.router ?? mod.default ?? mod);

    if (!router || typeof router !== "function") {
      console.warn(`[warn] ${relPath} imported but did not export an express router (export type: ${typeof router})`);
      return false;
    }

    app.use(mountPath, router);
    console.log(`[mounted] ${mountPath} -> ${relPath}`);
    return true;
  } catch (err) {
    console.warn(`[error] Failed to mount ${relPath} on ${mountPath}:`, err && err.stack ? err.stack : err);
    return false;
  }
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    // Import DB pool AFTER dotenv so config/db.js reads env correctly
    try {
      const dbMod = await import(pathToFileURL(path.resolve(process.cwd(), "./config/db.js")).href);
      // optional log if pool available
      if (dbMod && dbMod.pool) console.log("DB pool module loaded.");
    } catch (e) {
      console.warn("Warning: ./config/db.js not loaded (it may be missing). Continuing - some routes may fail if they need DB.");
    }

    // Mount routes (adjust paths if your project structure differs)
    await tryMountRoute(app, "/api/auth", "./routes/authRoutes.js", true);
    await tryMountRoute(app, "/api/products", "./routes/productRoutes.js", true);
    await tryMountRoute(app, "/api/categories", "./routes/categoryRoutes.js", true);
    await tryMountRoute(app, "/api/orders", "./routes/orderRoutes.js", true);
    await tryMountRoute(app, "/api/users", "./routes/userRoutes.js", true);
    await tryMountRoute(app, "/api/customers", "./routes/customerRoutes.js", true);

    // Admin optional routes
    await tryMountRoute(app, "/api/admin/roles", "./routes/adminRoles.js", true);
    await tryMountRoute(app, "/api/admin/users", "./routes/adminUserRoutes.js", true);

    // Optional admin products route if exists
    const adminProdRel = "./routes/adminProductRoutes.js";
    if (fs.existsSync(path.resolve(process.cwd(), adminProdRel))) {
      await tryMountRoute(app, "/api/admin/products", adminProdRel, true);
    } else {
      console.log("[note] optional adminProductRoutes.js not found; skipping /api/admin/products");
    }

    // summary log
    console.log("Mounted endpoints (attempted): /api/health, /api/auth, /api/products, /api/categories, /api/orders, /api/users, /api/customers, /api/admin/*");

    app.use(globalErrorHandler);

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server listening on http://${HOST}:${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server listen error:", err && err.stack ? err.stack : err);
      process.exit(1);
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught exception:", err && err.stack ? err.stack : err);
    });
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled rejection:", reason && reason.stack ? reason.stack : reason);
    });
  } catch (err) {
    console.error("Failed to start server:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

startServer();
