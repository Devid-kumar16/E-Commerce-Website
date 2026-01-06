import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/* ======================================================
   USER: CREATE ORDER (FROM CART)
====================================================== */
import { calculateDiscount } from "../utils/couponUtils.js";

export const createOrder = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const {
      cart,
      phone,
      area,
      address,
      payment_method,
      coupon_code,
    } = req.body;

    const userId = req.user?.id || null;
    const checkoutSessionId = req.sessionID || null;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!phone || !address || !payment_method) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    for (const item of cart) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid cart item data" });
      }
    }

    await conn.beginTransaction();

    let cartTotal = 0;
    const productsMap = new Map();

    /* ================= PRODUCT CHECK ================= */
    for (const item of cart) {
      const [[product]] = await conn.query(
        `
        SELECT id, name, price
        FROM products
        WHERE id = ? AND status = 'published'
        `,
        [item.product_id]
      );

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      cartTotal += itemTotal;
      productsMap.set(product.id, product);
    }

    /* ================= APPLY COUPON ================= */
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon_code) {
      const couponCode = coupon_code.trim().toUpperCase();

      const [rows] = await conn.query(
        `
        SELECT *
        FROM coupons
        WHERE code = ?
          AND is_active = 1
          AND (starts_at IS NULL OR starts_at <= NOW())
          AND (expires_at IS NULL OR expires_at >= NOW())
          AND (usage_limit IS NULL OR used_count < usage_limit)
        `,
        [couponCode]
      );

      if (!rows.length) {
        throw new Error("Invalid or expired coupon");
      }

      const coupon = rows[0];

      if (cartTotal < Number(coupon.min_order)) {
        throw new Error(`Minimum order ₹${coupon.min_order} required`);
      }

      if (coupon.type === "percentage") {
        discountAmount = (cartTotal * Number(coupon.value)) / 100;

        if (coupon.max_discount != null) {
          discountAmount = Math.min(
            discountAmount,
            Number(coupon.max_discount)
          );
        }
      } else {
        discountAmount = Number(coupon.value);
      }

      discountAmount = Math.min(discountAmount, cartTotal);
      appliedCoupon = coupon.code;

      /* increment coupon usage */
      await conn.query(
        `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`,
        [coupon.id]
      );
    }

    const finalAmount = Math.max(cartTotal - discountAmount, 0);

    /* ================= PAYMENT STATUS ================= */
    const isOnline = ["UPI", "CARD"].includes(payment_method);
    const payment_status = isOnline ? "Paid" : "Pending";
    const delivery_status = "Pending";

    /* ================= CREATE ORDER ================= */
    const [orderRes] = await conn.query(
      `
      INSERT INTO orders
      (
        user_id,
        checkout_session_id,
        phone,
        area,
        address,
        payment_method,
        payment_status,
        delivery_status,
        total_amount,
        discount_amount,
        final_amount,
        coupon_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        checkoutSessionId,
        phone,
        area || "",
        address,
        payment_method,
        payment_status,
        delivery_status,
        cartTotal,
        discountAmount,
        finalAmount,
        appliedCoupon,
      ]
    );

    const orderId = orderRes.insertId;

    /* ================= ORDER ITEMS ================= */
    for (const item of cart) {
      const product = productsMap.get(item.product_id);

      await conn.query(
        `
        INSERT INTO order_items
        (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          orderId,
          product.id,
          product.name,
          product.price,
          item.quantity,
        ]
      );
    }

    await conn.commit();

    return res.status(201).json({
      ok: true,
      message: "Order placed successfully",
      order_id: orderId,
    });
  } catch (err) {
    await conn.rollback();
    console.error("createOrder error:", err.message);

    if (err.message === "PRODUCT_NOT_FOUND") {
      return res.status(400).json({
        message: "Product not available",
      });
    }

    return res.status(400).json({
      message: err.message || "Order failed",
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
    const userId = req.user?.id ?? null;
    const sessionId = req.sessionID;

    const [orders] = await pool.query(
      `
      SELECT
        id,
        total_amount,
        discount_amount,
        final_amount,
        payment_status,
        delivery_status,
        created_at
      FROM orders
      WHERE
        (user_id = ?)
        OR
        (user_id IS NULL AND checkout_session_id = ?)
      ORDER BY id DESC
      `,
      [userId, sessionId]
    );

    res.json({
      ok: true,
      orders,
    });
  } catch (err) {
    console.error("listOrdersForSession error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load orders",
    });
  }
};





/* ======================================================
   USER / GUEST: ORDER DETAILS (SECURE)
====================================================== */
export const getOrderWithItemsForSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Logged-in user OR guest
    const userId = req.user?.id ?? null;
    const checkoutSessionId = req.sessionID;

    /* ================= FETCH ORDER ================= */
    const [[order]] = await pool.query(
      `
      SELECT
        id,
        phone,
        area,
        address,
        payment_method,
        payment_status,
        delivery_status,
        CAST(total_amount AS DECIMAL(10,2)) AS total_amount,
        CAST(discount_amount AS DECIMAL(10,2)) AS discount_amount,
        CAST(final_amount AS DECIMAL(10,2)) AS final_amount,
        coupon_code,
        created_at
      FROM orders
      WHERE id = ?
        AND (
          user_id = ?
          OR (user_id IS NULL AND checkout_session_id = ?)
        )
      `,
      [id, userId, checkoutSessionId]
    );

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    /* ================= FETCH ITEMS ================= */
    const [items] = await pool.query(
      `
      SELECT
        product_name,
        CAST(price AS DECIMAL(10,2)) AS price,
        quantity
      FROM order_items
      WHERE order_id = ?
      `,
      [id]
    );

    /* ================= RESPONSE ================= */
    return res.json({
      ok: true,
      order,
      items,
    });
  } catch (err) {
    console.error("getOrderWithItemsForSession error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch order",
    });
  }
};



export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
    }

    const [orders] = await pool.query(
      `
      SELECT
        id,
        final_amount AS total,
        discount_amount,
        coupon_code,
        payment_status,
        delivery_status,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
      `,
      [userId]
    );

    res.json({
      ok: true,
      orders,
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to fetch orders",
    });
  }
};
