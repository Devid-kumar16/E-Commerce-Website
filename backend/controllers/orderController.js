// backend/controllers/orderController.js
import { pool } from "../config/db.js";

/**
 * createOrder (authenticated checkout)
 */
export async function createOrder(req, res) {
  try {
    const body = req.body || {};

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let userId = req.user.id;
    if (req.user.role === "admin" && body.user_id) {
      userId = Number(body.user_id) || userId;
    }

    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    const total_amount = Number(body.total_amount);
    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ message: "total_amount must be > 0" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const productIds = [...new Set(items.map(i => Number(i.product_id)))];
      const placeholders = productIds.map(() => "?").join(",");

      const [products] = await conn.query(
        `SELECT id, price FROM products WHERE id IN (${placeholders})`,
        productIds
      );

      if (products.length !== productIds.length) {
        await conn.rollback();
        return res.status(400).json({ message: "Some products not found" });
      }

      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, items, total_amount, status, created_at)
         VALUES (?, ?, ?, 'pending', NOW())`,
        [userId, JSON.stringify(items), total_amount]
      );

      const orderId = orderResult.insertId;

      const values = [];
      const place = [];

      for (const it of items) {
        const prod = products.find(p => p.id === Number(it.product_id));
        place.push("(?,?,?,?,NOW())");
        values.push(orderId, it.product_id, it.quantity, prod.price);
      }

      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, created_at)
         VALUES ${place.join(",")}`,
        values
      );

      await conn.commit();
      conn.release();

      const [order] = await pool.query(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );

      res.status(201).json({ order: order[0] });
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error(err);
      res.status(500).json({ message: "Order creation failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * listOrdersForUser
 */
export async function listOrdersForUser(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list user orders" });
  }
}

/**
 * ADMIN: list all orders
 */
export async function listOrdersPublic(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `
  SELECT 
    o.id,
    o.total_amount,
    o.status,
    o.created_at,
    u.name AS customer_name,
    u.email AS customer_email
  FROM orders o
  LEFT JOIN users u ON u.id = o.user_id
  ORDER BY o.id ASC
  LIMIT ? OFFSET ?
  `,
      [limit, offset]
    );


    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders`
    );

    res.json({
      orders: rows,
      meta: {
        page,
        total,
      },
    });
  } catch (err) {
    console.error("listOrdersPublic error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}


/**
 * ADMIN: create order for a user
 */
export async function createOrderFromAdmin(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    const { user_id, items } = req.body;
    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "user_id and items required" });
    }

    let total = 0;
    for (const it of items) total += Number(it.quantity || 0);

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, items, total_amount, status, created_at)
       VALUES (?, ?, ?, 'pending', NOW())`,
      [user_id, JSON.stringify(items), total]
    );

    res.status(201).json({ order_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin order creation failed" });
  }
}

/**
 * ADMIN: update order status
 */
export async function updateOrderStatus(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    const { status } = req.body;
    await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
}



/**
 * createOrderAdminSimple
 * Admin creates an order without items (manual order)
 * Body: { user_id, total_amount, status }
 */
export async function createOrderAdminSimple(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    let { user_id, total_amount, status } = req.body;

    if (!user_id || !total_amount) {
      return res.status(400).json({
        message: "user_id and total_amount required",
      });
    }

    // ✅ FORCE ENUM-SAFE STATUS (PERMANENT FIX)
    const STATUS_MAP = {
      pending: "Pending",
      paid: "Paid",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    status = STATUS_MAP[String(status || "").toLowerCase()] || "Pending";

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES (?, ?, ?)`,
      [Number(user_id), Number(total_amount), status]
    );

    return res.status(201).json({
      ok: true,
      order_id: result.insertId,
    });
  } catch (err) {
    // 🔥 THIS WILL SHOW THE REAL MYSQL ERROR
    console.error("ADMIN ORDER MYSQL ERROR:", err.sqlMessage || err.message);

    return res.status(500).json({
      message: "Failed to create admin order",
      error: err.sqlMessage || err.message,
    });
  }
}



/* ===========================================================
   ✅ ADMIN ALIASES (THIS FIXES YOUR ERROR PERMANENTLY)
   DO NOT REMOVE
=========================================================== */

export const listOrdersAdmin = listOrdersPublic;
export const createOrderAdmin = createOrderAdminSimple;
