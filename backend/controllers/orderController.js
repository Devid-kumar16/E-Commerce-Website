import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/* ======================================================
   USER: CREATE ORDER (FROM CART)
====================================================== */
// controllers/orderController.js
export const createOrder = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { cart, phone, area, address, payment_method } = req.body;

    // ✅ FIX: safe user id (guest or logged-in)
    const userId = req.user?.id ?? null;

    /* ================= BASIC VALIDATION ================= */
    if (
      !Array.isArray(cart) ||
      cart.length === 0 ||
      !phone ||
      !address ||
      !payment_method
    ) {
      return res.status(400).json({
        ok: false,
        message: "Invalid order data",
      });
    }

    await conn.beginTransaction();

    let totalAmount = 0;
    const productsMap = new Map();

    /* ================= STOCK CHECK + LOCK ================= */
    for (const item of cart) {
      if (!item.product_id || item.quantity <= 0) {
        await conn.rollback();
        return res.status(400).json({
          ok: false,
          message: "Invalid cart item",
        });
      }

      const [[product]] = await conn.query(
        `
        SELECT id, name, price, stock
        FROM products
        WHERE id = ? AND status = 'published'
        FOR UPDATE
        `,
        [item.product_id]
      );

      if (!product) {
        await conn.rollback();
        return res.status(404).json({
          ok: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({
          ok: false,
          code: "INSUFFICIENT_STOCK",
          product_id: product.id,
          product_name: product.name,
          available_stock: product.stock,
          message: `Only ${product.stock} left for ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;
      productsMap.set(product.id, product);
    }

    /* ================= PAYMENT STATUS ================= */
    const payment_status = payment_method === "COD" ? "Pending" : "Paid";

    /* ================= CREATE ORDER ================= */
    const [orderRes] = await conn.query(
      `
      INSERT INTO orders
      (user_id, phone, area, address, payment_method, payment_status, delivery_status, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
      `,
      [
        userId,                    // ✅ FIXED
        phone.trim(),
        area?.trim() || "",
        address.trim(),
        payment_method,
        payment_status,
        totalAmount,
      ]
    );

    const orderId = orderRes.insertId;

    /* ================= INSERT ITEMS + DEDUCT STOCK ================= */
    for (const item of cart) {
      const product = productsMap.get(item.product_id);

      await conn.query(
        `
        INSERT INTO order_items
        (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
        `,
        [orderId, product.id, product.name, product.price, item.quantity]
      );

      // ✅ SINGLE SAFE STOCK UPDATE
      const [updateRes] = await conn.query(
        `
        UPDATE products
        SET stock = stock - ?
        WHERE id = ? AND stock >= ?
        `,
        [item.quantity, product.id, item.quantity]
      );

      if (updateRes.affectedRows === 0) {
        throw new Error("Stock update failed");
      }

      // ✅ STOCK LOG
      await conn.query(
        `
        INSERT INTO stock_logs
        (product_id, change_qty, reason, ref_id)
        VALUES (?, ?, 'order', ?)
        `,
        [product.id, -item.quantity, orderId]
      );
    }

    await conn.commit();

    return res.status(201).json({
      ok: true,
      order_id: orderId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("createOrder error:", err);

    return res.status(500).json({
      ok: false,
      message: "Order failed",
    });
  } finally {
    conn.release();
  }
};










/* ======================================================
   ADMIN: CREATE ORDER (FIXED)
====================================================== */
export const createOrderAdmin = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      phone,
      customer_name,
      customer_email,
      area,
      state,
      pincode,
      address,
      payment_method,
      payment_status,
      delivery_status,
      items,
    } = req.body;

    /* ================= VALIDATION ================= */
    if (
      !phone ||
      !customer_name ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "Invalid order data",
      });
    }

    await conn.beginTransaction();

    /* ================= FIND OR CREATE CUSTOMER ================= */
    let customerId;

    const [[existingUser]] = await conn.query(
      `SELECT id FROM users WHERE phone = ? LIMIT 1`,
      [phone]
    );

    if (existingUser) {
      customerId = existingUser.id;
    } else {
      const [result] = await conn.query(
        `
        INSERT INTO users (name, email, phone, role, active)
        VALUES (?, ?, ?, 'customer', 1)
        `,
        [customer_name, customer_email || null, phone]
      );
      customerId = result.insertId;
    }

    /* ================= CALCULATE TOTAL AMOUNT ================= */
    let totalAmount = 0;

    for (const item of items) {
      const [[product]] = await conn.query(
        `SELECT price, stock FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product || product.stock < item.quantity) {
        throw new Error("Insufficient stock");
      }

      totalAmount += product.price * item.quantity;
    }

    /* ================= CREATE ORDER ================= */
    const [orderResult] = await conn.query(
      `
      INSERT INTO orders
        (user_id, phone, area, state, pincode, address, total_amount, payment_method, payment_status, delivery_status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customerId,
        phone,
        area || "",
        state || "",
        pincode || "",
        address,
        totalAmount,
        payment_method,
        payment_status,
        delivery_status,
      ]
    );

    const orderId = orderResult.insertId;

    /* ================= ORDER ITEMS + STOCK UPDATE ================= */
    for (const item of items) {
      const [[product]] = await conn.query(
        `SELECT price, stock FROM products WHERE id = ?`,
        [item.product_id]
      );

      await conn.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.quantity, product.price]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await conn.commit();

    res.json({
      ok: true,
      message: "Order created successfully",
      order_id: orderId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("createOrderAdmin error:", err);

    res.status(500).json({
      ok: false,
      message: "Failed to create order",
    });
  } finally {
    conn.release();
  }
};





/* ======================================================
   ADMIN: LIST ORDERS (FINAL – FIXED)
====================================================== */
export const listOrdersAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // ✅ IMPORTANT: select BOTH statuses
    const [orders] = await pool.query(
      `
      SELECT
        o.id,
        u.name AS customer_name,
        o.area,
        o.total_amount,
        o.delivery_status,
        o.payment_status,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT ?, ?
      `,
      [offset, limit]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders`
    );

    res.json({
      ok: true,
      orders,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (err) {
    console.error("listOrdersAdmin error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load orders",
    });
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


export const cancelOrder = async (req, res) => {
  const conn = await pool.getConnection();
  const { id } = req.params;

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [id]
    );

    for (const item of items) {
      await conn.query(
        `UPDATE products
         SET stock = stock + ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await conn.query(
      `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
      [id]
    );

    await conn.commit();
    res.json({ ok: true });
  } catch {
    await conn.rollback();
    res.status(500).json({ ok: false });
  } finally {
    conn.release();
  }
};


export const getLowStockProducts = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, stock FROM products WHERE stock <= 5"
  );
  res.json({ products: rows });
};


/* ======================================================
   USER / GUEST: LIST MY ORDERS (INDUSTRY STANDARD)
====================================================== */
export const listOrdersForSession = async (req, res) => {
  try {
    let orders;

    if (req.user) {
      // ✅ Logged-in user
      [orders] = await pool.query(
        `SELECT id, total_amount, payment_status, delivery_status, created_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [req.user.id]
      );
    } else {
      // ✅ Guest user (checkout session)
      if (!req.checkoutSessionId) {
        return res.json({ ok: true, orders: [] });
      }

      [orders] = await pool.query(
        `SELECT id, total_amount, payment_status, delivery_status, created_at
         FROM orders
         WHERE checkout_session_id = ?
         ORDER BY created_at DESC`,
        [req.checkoutSessionId]
      );
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.error("listOrdersForSession error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to fetch orders",
    });
  }
};


/* ======================================================
   USER / GUEST: ORDER DETAILS (SECURE)
====================================================== */
export const getOrderWithItemsForSession = async (req, res) => {
  try {
    const orderId = req.params.id;
    let order;

    if (req.user) {
      // ✅ Logged-in user
      [[order]] = await pool.query(
        "SELECT * FROM orders WHERE id = ? AND user_id = ?",
        [orderId, req.user.id]
      );
    } else {
      // ✅ Guest user
      if (!req.checkoutSessionId) {
        return res.status(404).json({
          ok: false,
          message: "Order not found",
        });
      }

      [[order]] = await pool.query(
        "SELECT * FROM orders WHERE id = ? AND checkout_session_id = ?",
        [orderId, req.checkoutSessionId]
      );
    }

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    const [items] = await pool.query(
      "SELECT product_name, price, quantity FROM order_items WHERE order_id = ?",
      [orderId]
    );

    res.json({ ok: true, order, items });
  } catch (err) {
    console.error("getOrderWithItemsForSession error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load order details",
    });
  }
};

