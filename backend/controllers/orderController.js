import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/* ======================================================
   USER: CREATE ORDER (FROM CART)
====================================================== */
export const createOrder = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { cart, phone, area, address, payment_method } = req.body;

    if (!phone || !address || !payment_method || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, message: "Invalid order data" });
    }

    await conn.beginTransaction();

    /* FIND OR CREATE USER */
    const [[existingUser]] = await conn.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    let userId;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      const [u] = await conn.query(
        `INSERT INTO users (name, phone, email, password_hash, role)
         VALUES ('Guest User', ?, ?, ?, 'customer')`,
        [phone, `guest_${phone}@estore.local`, passwordHash]
      );
      userId = u.insertId;
    }

    /* CALCULATE TOTAL */
    let total = 0;

    for (const item of cart) {
      const [[product]] = await conn.query(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );

      if (!product) throw new Error("Invalid product");

      total += product.price * item.quantity;
    }

    /* CREATE ORDER */
    const [orderRes] = await conn.query(
      `INSERT INTO orders
       (user_id, phone, area, address, payment_method, payment_status, delivery_status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'Pending', 'Pending', ?)`,
      [userId, phone, area || "", address, payment_method, total]
    );

    const orderId = orderRes.insertId;

    /* ORDER ITEMS */
    for (const item of cart) {
      const [[product]] = await conn.query(
        "SELECT name, price FROM products WHERE id = ?",
        [item.product_id]
      );

      await conn.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, product.name, product.price, item.quantity]
      );
    }

    await conn.commit();

    res.status(201).json({
      ok: true,
      order_id: orderId,
      message: "Order placed successfully",
    });

  } catch (err) {
    await conn.rollback();
    console.error("ORDER ERROR:", err);
    res.status(500).json({ ok: false, message: "Order failed" });
  } finally {
    conn.release();
  }
};

/* ======================================================
   ADMIN: CREATE ORDER
====================================================== */
export const createOrderAdmin = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { customer, items, payment_method, delivery_status, total_amount } = req.body;

    if (!customer?.phone || !customer?.address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: "Invalid order data" });
    }

    await conn.beginTransaction();

    /* FIND OR CREATE USER */
    const [[existingUser]] = await conn.query(
      "SELECT id FROM users WHERE phone = ?",
      [customer.phone]
    );

    let userId;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const hash = await bcrypt.hash(Math.random().toString(36), 10);
      const [u] = await conn.query(
        `INSERT INTO users (name, phone, email, password_hash, role, area)
         VALUES (?, ?, ?, ?, 'customer', ?)`,
        [customer.name || "", customer.phone, customer.email || "", hash, customer.area || ""]
      );
      userId = u.insertId;
    }

    /* CALCULATE TOTAL */
    let calculatedTotal = 0;

    for (const item of items) {
      const [[product]] = await conn.query(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );

      if (!product) throw new Error("Invalid product");
      calculatedTotal += product.price * item.qty;
    }

    if (Number(calculatedTotal) !== Number(total_amount)) {
      throw new Error("Total mismatch");
    }

    /* CREATE ORDER */
    const [orderRes] = await conn.query(
      `INSERT INTO orders
       (user_id, phone, area, address, payment_method, payment_status, delivery_status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [
        userId,
        customer.phone,
        customer.area || "",
        customer.address,
        payment_method,
        delivery_status || "Pending",
        calculatedTotal,
      ]
    );

    const orderId = orderRes.insertId;

    /* ORDER ITEMS */
    for (const item of items) {
      const [[product]] = await conn.query(
        "SELECT name, price FROM products WHERE id = ?",
        [item.product_id]
      );

      await conn.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, product.name, product.price, item.qty]
      );
    }

    await conn.commit();
    res.json({ ok: true, order_id: orderId });

  } catch (err) {
    await conn.rollback();
    console.error("createOrderAdmin error:", err);
    res.status(400).json({ ok: false, message: err.message });
  } finally {
    conn.release();
  }
};

/* ======================================================
   ADMIN: LIST ORDERS (🔥 FIXED – MAIN ISSUE)
====================================================== */
export const listOrdersAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[count]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    res.json({
      ok: true,
      orders, // ✅ THIS FIXES YOUR ADMIN PANEL
      meta: {
        total: count.total,
        page,
        totalPages: Math.ceil(count.total / limit),
      },
    });
  } catch (err) {
    console.error("listOrdersAdmin error:", err);
    res.status(500).json({ ok: false, message: "Failed to load orders" });
  }
};

/* ======================================================
   ADMIN: ORDER DETAILS
====================================================== */
export const getOrderWithItemsAdmin = async (req, res) => {
  const { id } = req.params;

  const [[order]] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [id]
  );

  if (!order) {
    return res.status(404).json({ ok: false, message: "Order not found" });
  }

  const [items] = await pool.query(
    `SELECT product_name, price, quantity, (price * quantity) AS subtotal
     FROM order_items WHERE order_id = ?`,
    [id]
  );

  res.json({ ok: true, order, items });
};

/* ======================================================
   ADMIN: DELETE ORDER
====================================================== */
export const deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM orders WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Order not found" });
    }

    res.json({ ok: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("deleteOrderAdmin error:", err);
    res.status(500).json({ ok: false, message: "Failed to delete order" });
  }
};

/* ======================================================
   USER: LIST MY ORDERS
====================================================== */
export const listOrdersForUser = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, total_amount, payment_status, delivery_status, created_at
       FROM orders WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ ok: true, orders });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Failed to fetch orders" });
  }
};



/* ======================================================
   ADMIN: UPDATE ORDER
====================================================== */
export const updateOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      area,
      address,
      phone,
      payment_method,
      delivery_status, // we map this to orders.status
    } = req.body;

    const [result] = await pool.query(
      `
      UPDATE orders SET
        area = ?,
        address = ?,
        phone = ?,
        payment_method = ?,
        status = ?
      WHERE id = ?
      `,
      [
        area || "",
        address || "",
        phone || "",
        payment_method,
        delivery_status, // ✅ FIX
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    res.json({
      ok: true,
      message: "Order updated successfully",
    });
  } catch (err) {
    console.error("updateOrderAdmin error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to update order",
    });
  }
};


export const getOrderWithItemsForUser = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  const [[order]] = await pool.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId]
  );

  if (!order) {
    return res.status(404).json({ ok: false, message: "Order not found" });
  }

  const [items] = await pool.query(
    "SELECT * FROM order_items WHERE order_id = ?",
    [orderId]
  );

  res.json({ ok: true, order, items });
};
