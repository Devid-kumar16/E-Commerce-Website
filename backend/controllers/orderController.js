import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/* ================= USER: CREATE ORDER ================= */
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      cart,
      total_amount,
      area,
      address,
      phone,
      payment_method,
    } = req.body;

    /* ================= VALIDATION ================= */
    if (
      !phone ||
      !area ||
      !address ||
      !payment_method ||
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "Invalid order data",
      });
    }

    await connection.beginTransaction();

    /* ================= USER (PHONE BASED) ================= */
    const [[existingUser]] = await connection.query(
      `SELECT id FROM users WHERE phone = ?`,
      [phone]
    );

    let userId;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const guestEmail = `guest_${phone}@estore.local`;
      const passwordHash = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

      const [userRes] = await connection.query(
        `
        INSERT INTO users (name, phone, email, password_hash, role)
        VALUES (?, ?, ?, ?, 'customer')
        `,
        ["Guest User", phone, guestEmail, passwordHash]
      );

      userId = userRes.insertId;
    }

    /* ================= CALCULATE TOTAL (DB SAFE) ================= */
    let calculatedTotal = 0;

    for (const item of cart) {
      if (!item.product_id || !item.quantity) {
        throw new Error("Invalid cart item");
      }

      const [[product]] = await connection.query(
        `SELECT name, price FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product) {
        throw new Error("Invalid product selected");
      }

      calculatedTotal += product.price * item.quantity;
    }

    if (Number(calculatedTotal) !== Number(total_amount)) {
      throw new Error("Order total mismatch");
    }

    /* ================= CREATE ORDER ================= */
    const [orderResult] = await connection.query(
      `
      INSERT INTO orders
      (user_id, phone, area, address, payment_method, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        userId,
        phone,
        area,
        address,
        payment_method,
        calculatedTotal,
      ]
    );

    const orderId = orderResult.insertId;

    /* ================= ORDER ITEMS ================= */
    for (const item of cart) {
      const [[product]] = await connection.query(
        `SELECT name, price FROM products WHERE id = ?`,
        [item.product_id]
      );

      await connection.query(
        `
        INSERT INTO order_items
        (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id,
          product.name,
          product.price,
          item.quantity,
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      ok: true,
      orderId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create order error:", error);

    res.status(400).json({
      ok: false,
      message: error.message || "Failed to place order",
    });
  } finally {
    connection.release();
  }
};




/* ================= ADMIN: LIST ALL ORDERS ================= */
export async function listOrdersAdmin(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [orders] = await pool.query(
      `
      SELECT
        o.id,
        o.area,
        o.address,
        o.phone,
        o.payment_method,
        o.total_amount,
        o.status,
        o.created_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders`
    );

    res.json({ ok: true, orders, meta: { page, total } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders" });
  }
}

/* ================= USER: MY ORDERS ================= */
export async function listOrdersForUser(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [orders] = await pool.query(
      `
      SELECT id, total_amount, status, created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json({ ok: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}

/* ================= ADMIN: CREATE ORDER ================= */
export async function createOrderAdmin(req, res) {
  const connection = await pool.getConnection();

  try {
    const { customer, items, payment_method, status } = req.body;

if (
  !customer?.phone ||
  !customer?.address ||
  !payment_method ||
  !status ||
  !Array.isArray(items) ||
  items.length === 0
) {
  return res.status(400).json({
    message: "Address, payment method, status and items are required",
  });
}


    await connection.beginTransaction();

    /* 1️⃣ FIND CUSTOMER BY PHONE (PRIMARY KEY) */
    const [[existingUser]] = await connection.query(
      `SELECT id FROM users WHERE phone = ?`,
      [customer.phone]
    );

    let userId;

    if (existingUser) {
      // ✅ REUSE EXISTING CUSTOMER
      userId = existingUser.id;

      // 🔄 Update name/email if admin entered new values
      await connection.query(
        `
        UPDATE users
        SET name = ?, email = ?
        WHERE id = ?
        `,
        [
          customer.name || "",
          customer.email || "",
          userId,
        ]
      );
    } else {
      // ✅ CREATE NEW CUSTOMER
      const dummyPasswordHash = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

      const [userRes] = await connection.query(
        `
        INSERT INTO users (name, phone, email, password_hash, role)
        VALUES (?, ?, ?, ?, 'customer')
        `,
        [
          customer.name || "",
          customer.phone,
          customer.email || "",
          dummyPasswordHash,
        ]
      );

      userId = userRes.insertId;
    }

    /* 2️⃣ CALCULATE TOTAL FROM DB */
    let totalAmount = 0;

    for (const item of items) {
      const [[product]] = await connection.query(
        `SELECT price FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product) throw new Error("Invalid product");

      totalAmount += product.price * item.qty;
    }

    /* 3️⃣ CREATE ORDER */
    const [orderRes] = await connection.query(
      `
      INSERT INTO orders
      (user_id, phone, area, address, payment_method, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        customer.phone,
        customer.area || "",
        customer.address,
        payment_method,
        totalAmount,
        status,
      ]
    );

    const orderId = orderRes.insertId;

    /* 4️⃣ CREATE ORDER ITEMS */
    for (const item of items) {
      const [[product]] = await connection.query(
        `SELECT name, price FROM products WHERE id = ?`,
        [item.product_id]
      );

      await connection.query(
        `
        INSERT INTO order_items
        (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id,
          product.name,
          product.price,
          item.qty,
        ]
      );
    }

    await connection.commit();

    res.json({ ok: true, order_id: orderId });
  } catch (err) {
    await connection.rollback();
    console.error("createOrderAdmin error:", err);

    res.status(400).json({
      message: err.message || "Failed to create order",
    });
  } finally {
    connection.release();
  }
}


/* ================= ADMIN: UPDATE ORDER ================= */
export async function updateOrderAdmin(req, res) {
  const { id } = req.params;
  const { area, address, phone, payment_method, total_amount, status } =
    req.body;

  await pool.query(
    `
    UPDATE orders SET
      area = ?,
      address = ?,
      phone = ?,
      payment_method = ?,
      total_amount = ?,
      status = ?
    WHERE id = ?
    `,
    [area, address, phone, payment_method, total_amount, status, id]
  );

  res.json({ ok: true });
}

/* ================= ADMIN: DELETE ORDER ================= */
export async function deleteOrderAdmin(req, res) {
  try {
    await pool.query(`DELETE FROM orders WHERE id = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete order" });
  }
}

/* ================= ADMIN: GET SINGLE ORDER ================= */
export async function getOrderWithItemsAdmin(req, res) {
  try {
    const { id } = req.params;

    const [[order]] = await pool.query(
      `
      SELECT 
        o.id,
        o.area,
        o.address,
        o.phone,
        o.payment_method,
        o.total_amount,
        o.status,
        o.created_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = ?
      `,
      [id]
    );

    if (!order) {
      return res.status(404).json({ ok: false, message: "Order not found" });
    }

    const [items] = await pool.query(
      `
      SELECT product_name, price, quantity, (price * quantity) AS subtotal
      FROM order_items
      WHERE order_id = ?
      `,
      [id]
    );

    res.json({ ok: true, order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to load order details" });
  }
}
