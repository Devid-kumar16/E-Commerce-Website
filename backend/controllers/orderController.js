// controllers/orderController.js
import { pool } from "../config/db.js";

/* =====================================================================
   USER / CUSTOMER – CREATE ORDER
===================================================================== */
export const createOrder = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.user?.id ?? null;

    const {
      cart,
      phone,
      area,
      state,
      pincode,
      address,
      payment_method,
      coupon_code,
    } = req.body;

    if (!Array.isArray(cart) || cart.length === 0)
      return res.status(400).json({ ok: false, message: "Cart is empty" });

    /* ---------------- CART VALIDATION ---------------- */
    let cartTotal = 0;
    const productMap = new Map();

    for (const item of cart) {
      const [[product]] = await conn.query(
        `SELECT id, name, price, stock FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product) throw new Error("Product not found");
      if (product.stock < item.quantity)
        throw new Error(`${product.name} has insufficient stock`);

      productMap.set(product.id, product);

      cartTotal += Number(product.price) * Number(item.quantity);
    }

    /* ---------------- COUPON HANDLING ---------------- */
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon_code) {
      const [[coupon]] = await conn.query(
        `SELECT * FROM coupons WHERE code = ? AND is_active = 1`,
        [coupon_code.trim()]
      );

      if (!coupon) throw new Error("Invalid coupon");

      if (cartTotal >= coupon.min_order) {
        if (coupon.type === "percentage") {
          discountAmount = (cartTotal * coupon.value) / 100;
          if (coupon.max_discount)
            discountAmount = Math.min(discountAmount, coupon.max_discount);
        } else {
          discountAmount = coupon.value;
        }
        appliedCoupon = coupon.code;
      }
    }

    const finalAmount = cartTotal - discountAmount;
    const paymentStatus =
      ["UPI", "CARD", "ONLINE"].includes(payment_method) ? "Paid" : "Pending";

    /* ---------------- INSERT ORDER ---------------- */
    const [orderRes] = await conn.query(
      `
      INSERT INTO orders (
        user_id, customer_name, customer_email, phone,
        area, state, pincode, address,
        payment_method, payment_status, delivery_status,
        total_amount, discount_amount, final_amount, coupon_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        req.user?.name || "Guest User",
        req.user?.email || null,
        phone,
        area,
        state,
        pincode,
        address,
        payment_method,
        paymentStatus,
        "Pending",
        cartTotal,
        discountAmount,
        finalAmount,
        appliedCoupon
      ]
    );

    const orderId = orderRes.insertId;

    /* ---------------- INSERT ORDER ITEMS + UPDATE STOCK ---------------- */
    for (const item of cart) {
      const product = productMap.get(item.product_id);

      await conn.query(
        `
        INSERT INTO order_items 
        (order_id, product_id, product_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          product.id,
          product.name,
          product.price,
          item.quantity,
          Number(product.price) * Number(item.quantity),
        ]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, product.id]
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
    console.error("createOrder error:", err);
    res.status(400).json({ ok: false, message: err.message });
  } finally {
    conn.release();
  }
};

/* =====================================================================
   ADMIN – MANUAL ORDER CREATION (Optional)
===================================================================== */
export const createOrderAdmin = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      phone,
      customer_name,
      customer_email,
      area,
      state,
      pincode,
      address,
      payment_method,
      items
    } = req.body;

    if (!phone || !customer_name || !address)
      return res.status(400).json({ ok: false, message: "Missing fields" });

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ ok: false, message: "Items required" });

    /* ---------------- VALIDATE PRODUCTS ---------------- */
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const [[product]] = await conn.query(
        `SELECT id, name, price, stock FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product) throw new Error("Product not found");
      if (product.stock < item.quantity)
        throw new Error(`${product.name} out of stock`);

      const subtotal = Number(product.price) * Number(item.quantity);
      totalAmount += subtotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal
      });
    }

    /* ---------------- FIND OR CREATE CUSTOMER ---------------- */
    const [[existing]] = await conn.query(
      `SELECT id FROM users WHERE phone = ? LIMIT 1`,
      [phone]
    );

    let userId;
    if (existing) {
      userId = existing.id;

      await conn.query(
        `
        UPDATE users SET 
          name = ?, email = ?, area = ?, state = ?, 
          pincode = ?, address = ?, last_order_at = NOW()
        WHERE id = ?
        `,
        [
          customer_name,
          customer_email || null,
          area || "",
          state || "",
          pincode || "",
          address || "",
          userId,
        ]
      );
    } else {
      const [insert] = await conn.query(
        `
        INSERT INTO users 
        (name, email, phone, area, state, pincode, address, role, last_order_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', NOW())
        `,
        [
          customer_name,
          customer_email || null,
          phone,
          area || "",
          state || "",
          pincode || "",
          address || "",
        ]
      );
      userId = insert.insertId;
    }

    /* ---------------- PAYMENT ---------------- */
    const paymentStatus =
      ["UPI", "CARD", "ONLINE"].includes(payment_method) ? "Paid" : "Pending";

    /* ---------------- INSERT ORDER ---------------- */
    const [orderRes] = await conn.query(
      `
      INSERT INTO orders (
        user_id, customer_name, customer_email, phone,
        area, state, pincode, address,
        payment_method, payment_status, delivery_status,
        total_amount, discount_amount, final_amount, coupon_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        customer_name,
        customer_email,
        phone,
        area,
        state,
        pincode,
        address,
        payment_method,
        paymentStatus,
        "Pending",
        totalAmount,
        0,
        totalAmount,
        null
      ]
    );

    const orderId = orderRes.insertId;

    /* ---------------- INSERT ITEMS & UPDATE STOCK ---------------- */
    for (const item of validatedItems) {
      await conn.query(
        `
        INSERT INTO order_items
        (order_id, product_id, product_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.price,
          item.quantity,
          item.subtotal
        ]
      );

      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await conn.commit();

    res.json({
      ok: true,
      order_id: orderId,
      message: "Order created successfully",
    });

  } catch (err) {
    await conn.rollback();
    console.error("createOrderAdmin error:", err);
    res.status(500).json({ ok: false, message: err.message });
  } finally {
    conn.release();
  }
};

/* =====================================================================
   ADMIN – LIST ALL ORDERS
===================================================================== */
export const listOrdersAdmin = async (req, res) => {
  try {
    // Read pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 1️⃣ Get total orders count
    const [countRows] = await pool.query(`
      SELECT COUNT(*) AS total FROM orders
    `);
    const total = countRows[0].total;

    // 2️⃣ Get paginated rows
    const [rows] = await pool.query(
      `
      SELECT
        o.id,
        COALESCE(u.name, o.customer_name, 'Guest User') AS customer_name,
        o.area,
        o.final_amount,
        o.payment_status,
        o.delivery_status,
        DATE(o.created_at) AS created_at
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    // 3️⃣ Response format expected by frontend
    return res.json({
      ok: true,
      orders: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (err) {
    console.error("Admin orders error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load orders",
    });
  }
};


/* =====================================================================
   ADMIN – ORDER DETAILS
===================================================================== */
export const getOrderWithItemsAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [[order]] = await pool.query(`
      SELECT 
        o.*,
        COALESCE(u.name, o.customer_name) AS customer_name,
        u.email AS account_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = ?
    `, [orderId]);

    if (!order) {
      return res.status(404).json({ ok: false, message: "Order not found" });
    }

    const [items] = await pool.query(`
      SELECT 
        product_name,
        price,
        quantity,
        subtotal
      FROM order_items
      WHERE order_id = ?
    `, [orderId]);

    return res.json({
      ok: true,
      order,
      items
    });

  } catch (err) {
    console.error("Order details error:", err);
    res.status(500).json({ ok: false, message: "Order load failed" });
  }
};


/* =====================================================================
   ADMIN – UPDATE ORDER STATUS
===================================================================== */
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const VALID = [
      "Pending",
      "Processing",
      "Packed",
      "Shipped",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
      "Returned"
    ];

    if (!VALID.includes(status))
      return res.status(400).json({ ok: false, message: "Invalid status" });

    await pool.query(
      `UPDATE orders SET delivery_status = ? WHERE id = ?`,
      [status, orderId]
    );

    res.json({ ok: true, message: "Status updated successfully" });

  } catch (err) {
    console.error("updateOrderStatusAdmin error:", err);
    res.status(500).json({ ok: false, message: "Failed to update order status" });
  }
};

/* =====================================================================
   ADMIN – DELETE ORDER
===================================================================== */
export const deleteOrderAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    await pool.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
    await pool.query(`DELETE FROM orders WHERE id = ?`, [orderId]);

    res.json({ ok: true, message: "Order deleted successfully" });

  } catch (err) {
    console.error("deleteOrderAdmin error:", err);
    res.status(500).json({ ok: false, message: "Failed to delete order" });
  }
};


/* =====================================================================
   USER / GUEST – LIST ORDERS FOR SESSION
===================================================================== */
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
      WHERE user_id = ? OR (user_id IS NULL AND checkout_session_id = ?)
      ORDER BY id DESC
      `,
      [userId, sessionId]
    );

    res.json({ ok: true, orders });

  } catch (err) {
    console.error("listOrdersForSession error:", err);
    res.status(500).json({ ok: false, message: "Failed to load session orders" });
  }
};


/* =====================================================================
   USER / GUEST – ORDER DETAILS FOR SESSION
===================================================================== */
export const getOrderWithItemsForSession = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id ?? null;
    const sessionId = req.sessionID;

    const [[order]] = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      AND (user_id = ? OR (user_id IS NULL AND checkout_session_id = ?))
      `,
      [orderId, userId, sessionId]
    );

    if (!order)
      return res.status(404).json({ ok: false, message: "Order not found" });

    const [items] = await pool.query(
      `SELECT product_name, price, quantity, subtotal FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    res.json({ ok: true, order, items });

  } catch (err) {
    console.error("getOrderWithItemsForSession error:", err);
    res.status(500).json({ ok: false, message: "Failed to load order details" });
  }
};


/* ==========================================================
   ADMIN — LIST ORDERS WITH PAGINATION (FINAL FIXED VERSION)
========================================================== */
export const getAdminOrders = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    // TOTAL ORDERS COUNT
    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
    `);

    // PAGINATED ORDERS
    const [orders] = await pool.query(
      `
      SELECT
        o.id,
        COALESCE(u.name, o.customer_name) AS customer_name,
        o.area,
        o.final_amount,
        o.payment_status,
        o.delivery_status,
        DATE(o.created_at) AS created_at
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    return res.json({
      ok: true,
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("getAdminOrders error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load orders",
    });
  }
};
