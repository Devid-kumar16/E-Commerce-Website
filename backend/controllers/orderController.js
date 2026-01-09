import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/* ======================================================
   USER: CREATE ORDER (FROM CART)
====================================================== */
import { calculateDiscount } from "../utils/couponUtils.js";

export const createOrder = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user?.id || null;        // logged in or guest
    const sessionId = req.sessionID;             // guest tracking

    const {
      cart,
      phone,
      area,
      address,
      payment_method,
      coupon_code,
    } = req.body;

    // =============== VALIDATION ===============
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is empty" });
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ ok: false, message: "Enter valid 10-digit phone number" });
    }

    if (!address || address.trim().length < 3) {
      return res.status(400).json({ ok: false, message: "Enter full address" });
    }

    await conn.beginTransaction();

    let cartTotal = 0;
    const productsMap = new Map();

    // =============== PRODUCT CHECK ===============
    for (const item of cart) {
      const [[product]] = await conn.query(
        `SELECT id, name, price, stock FROM products WHERE id = ? AND status='published'`,
        [item.product_id]
      );

      if (!product) throw new Error("Product not available");
      if (product.stock < item.quantity) throw new Error(`${product.name} is out of stock`);

      productsMap.set(product.id, product);

      cartTotal += Number(product.price) * Number(item.quantity);
    }

    // =============== COUPON LOGIC ===============
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon_code) {
      const code = coupon_code.trim().toUpperCase();

      const [rows] = await conn.query(
        `SELECT * FROM coupons WHERE code = ? AND is_active = 1
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (expires_at IS NULL OR expires_at >= NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [code]
      );

      if (!rows.length) throw new Error("Invalid or expired coupon");

      const coupon = rows[0];

      if (cartTotal < coupon.min_order)
        throw new Error(`Minimum order ₹${coupon.min_order} required`);

      if (coupon.type === "percentage") {
        discountAmount = (cartTotal * coupon.value) / 100;

        if (coupon.max_discount != null) {
          discountAmount = Math.min(discountAmount, coupon.max_discount);
        }
      } else {
        discountAmount = coupon.value;
      }

      discountAmount = Math.min(discountAmount, cartTotal);
      appliedCoupon = code;

      await conn.query(
        `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`,
        [coupon.id]
      );
    }

    const finalAmount = cartTotal - discountAmount;

    // =============== PAYMENT LOGIC ===============
    const paymentStatus = ["UPI", "CARD"].includes(payment_method)
      ? "Paid"
      : "Pending";

    // =============== FETCH USER NAME & EMAIL ===============
    let customerName = null;
    let customerEmail = null;

    if (userId) {
      const [[user]] = await conn.query(
        "SELECT name, email FROM users WHERE id = ?",
        [userId]
      );

      if (user) {
        customerName = user.name;
        customerEmail = user.email;
      }
    }

    // =============== CREATE ORDER ===============
    const [orderRes] = await conn.query(
      `INSERT INTO orders (
        user_id, checkout_session_id,
        customer_name, email, phone,
        area, address,
        payment_method, payment_status, delivery_status,
        total_amount, discount_amount, final_amount,
        coupon_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?)`,
      [
        userId,
        sessionId,
        customerName,
        customerEmail,
        phone,
        area || "",
        address,
        payment_method,
        paymentStatus,
        cartTotal,
        discountAmount,
        finalAmount,
        appliedCoupon,
      ]
    );

    const orderId = orderRes.insertId;

    // =============== ORDER ITEMS ===============
    for (const item of cart) {
      const product = productsMap.get(item.product_id);

      await conn.query(
        `INSERT INTO order_items 
        (order_id, product_id, product_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          product.id,
          product.name,
          product.price,
          item.quantity,
          Number(product.price) * Number(item.quantity),
        ]
      );

      // Reduce stock
      await conn.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, product.id]
      );
    }

    await conn.commit();

    return res.status(201).json({
      ok: true,
      order_id: orderId,
      message: "Order placed successfully",
    });

  } catch (err) {
    await conn.rollback();
    return res.status(400).json({ ok: false, message: err.message });
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
      payment_status,
      delivery_status,
      items,
    } = req.body;

    if (!phone || !customer_name || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: "Invalid order data" });
    }

    const finalPaymentStatus = payment_status || "Pending";  // ⭐ default
    const finalDeliveryStatus = delivery_status || "Pending"; // ⭐ default

    let customerId;
    const [[existing]] = await conn.query(`SELECT id FROM users WHERE phone = ? LIMIT 1`, [phone]);

    if (existing) {
      customerId = existing.id;
    } else {
      const [result] = await conn.query(
        `INSERT INTO users (name, email, phone, role, active) VALUES (?, ?, ?, 'customer', 1)`,
        [customer_name, customer_email || null, phone]
      );
      customerId = result.insertId;
    }

    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
      const [[product]] = await conn.query(
        `SELECT id, name, price, stock FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product) throw new Error("Product not found");
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const subtotal = Number(product.price) * Number(item.quantity);
      totalAmount += subtotal;

      itemDetails.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    const [orderResult] = await conn.query(
      `
      INSERT INTO orders
      (user_id, phone, customer_name, email, area, state, pincode, address,
       total_amount, payment_method, payment_status, delivery_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customerId,
        phone,
        customer_name,
        customer_email || "",
        area || "",
        state || "",
        pincode || "",
        address,
        totalAmount,
        payment_method,
        finalPaymentStatus,   // ⭐ fixed
        finalDeliveryStatus,  // ⭐ fixed
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of itemDetails) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.price, item.quantity, item.subtotal]
      );

      await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [
        item.quantity,
        item.product_id,
      ]);
    }

    await conn.commit();

    return res.json({ ok: true, message: "Order created successfully", order_id: orderId });
  } catch (err) {
    await conn.rollback();
    console.error("createOrderAdmin error:", err);
    return res.status(500).json({ ok: false, message: err.message });
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
    const orderId = req.params.id;
    const userId = req.user?.id || null;
    const sessionId = req.sessionID;

    const [[order]] = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = ?
      AND (
        user_id = ?
        OR (user_id IS NULL AND checkout_session_id = ?)
      )`,
      [orderId, userId, sessionId]
    );

    if (!order) {
      return res.status(404).json({ ok: false, message: "Order not found" });
    }

    const [items] = await pool.query(
      `
      SELECT product_name, price, quantity, subtotal
      FROM order_items WHERE order_id = ?
      `,
      [orderId]
    );

    return res.json({
      ok: true,
      order,
      items,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Error fetching order" });
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


export const getOrderAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    /* ================= FETCH ORDER ================= */
    const [[order]] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        customer_name,
        email,
        phone,
        area,
        state,
        pincode,
        address,
        total_amount,
        discount_amount,
        final_amount,
        payment_method,
        payment_status,
        delivery_status,
        coupon_code,
        created_at
      FROM orders
      WHERE id = ?
      `,
      [orderId]
    );

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Order not found",
      });
    }

    /* ================= FETCH ORDER ITEMS WITH PRODUCT IMAGE ================= */
    const [items] = await pool.query(
      `
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.price,
        oi.quantity,
        oi.subtotal,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      `,
      [orderId]
    );

    return res.json({
      ok: true,
      order,
      items,
    });
  } catch (err) {
    console.error("getOrderAdmin error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load order details",
    });
  }
};


/* ======================================================
   ADMIN: GET SINGLE ORDER (INDUSTRY STANDARD)
====================================================== */
export const getSingleOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    /* ================= FETCH ORDER ================= */
    const [[order]] = await pool.query(
      `
      SELECT 
        o.id,
        o.user_id,
        o.customer_name,
        o.email AS customer_email,
        o.phone,
        o.area,
        o.state,
        o.pincode,
        o.address,
        o.total_amount,
        o.discount_amount,
        o.final_amount,
        o.payment_method,
        o.payment_status,
        o.delivery_status,
        o.coupon_code,
        o.created_at
      FROM orders o
      WHERE o.id = ?
      `,
      [orderId]
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
        oi.product_id,
        oi.product_name,
        oi.price,
        oi.quantity,
        oi.subtotal,
        p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      `,
      [orderId]
    );

    return res.json({
      ok: true,
      order,
      items,
    });

  } catch (err) {
    console.error("getSingleOrder error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load order details",
    });
  }
};
