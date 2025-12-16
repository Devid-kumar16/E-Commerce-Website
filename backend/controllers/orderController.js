// backend/controllers/orderController.js
import { pool } from "../config/db.js";

/* =====================================================
   USER: CREATE ORDER (CHECKOUT)
===================================================== */
export async function createOrder(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      area,
      address,
      total_amount,
      status = "Pending",
    } = req.body;

    if (!area || !address || !total_amount) {
      return res.status(400).json({
        message: "area, address and total_amount are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, area, address, total_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, area, address, total_amount, status]
    );

    res.status(201).json({
      ok: true,
      order_id: result.insertId,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
}

/* =====================================================
   USER: LIST OWN ORDERS
===================================================== */
export async function listOrdersForUser(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `SELECT *
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ orders: rows });
  } catch (err) {
    console.error("listOrdersForUser error:", err);
    res.status(500).json({ message: "Failed to list user orders" });
  }
}

/* =====================================================
   ADMIN: LIST ALL ORDERS
===================================================== */
export async function listOrdersAdmin(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `
      SELECT
        o.id,
        o.area,
        o.address,
        o.total_amount,
        o.status,
        o.created_at,
        u.name AS customer_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id ASC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    res.json({
      orders: rows,
      meta: { page, total },
    });
  } catch (err) {
    console.error("listOrdersAdmin error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}


/* =====================================================
   ADMIN: CREATE ORDER (MANUAL)
===================================================== */
export async function createOrderAdmin(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    let {
      user_id,
      area,
      address,
      total_amount,
      status = "Pending",
    } = req.body;

    if (!user_id || !area || !address || !total_amount) {
      return res.status(400).json({
        message: "user_id, area, address, total_amount are required",
      });
    }

    // ENUM SAFE STATUS
    const STATUS_MAP = {
      pending: "Pending",
      paid: "Paid",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    status =
      STATUS_MAP[String(status).toLowerCase()] || "Pending";

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, area, address, total_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, area, address, total_amount, status]
    );

    res.status(201).json({
      ok: true,
      order_id: result.insertId,
    });
  } catch (err) {
    console.error("createOrderAdmin error:", err.sqlMessage || err);
    res.status(500).json({
      message: "Failed to create admin order",
      error: err.sqlMessage,
    });
  }
}

/* =====================================================
   ADMIN: UPDATE ORDER STATUS
===================================================== */
export async function updateOrderStatus(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: "status required" });
    }

    await pool.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, orderId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
}
