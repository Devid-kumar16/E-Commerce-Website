import { pool } from "../config/db.js";

/* ================= USER: CREATE ORDER ================= */
export async function createOrder(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      area,
      address,
      phone,
      payment_method,
      total_amount,
      status = "Pending",
    } = req.body;

    if (!total_amount) {
      return res.status(400).json({ message: "total_amount required" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO orders
      (user_id, area, address, phone, payment_method, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        area || null,
        address || null,
        phone || null,
        payment_method || null,
        total_amount,
        status,
      ]
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

/* ================= USER: MY ORDERS ================= */
export async function listOrdersForUser(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({ orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}

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
        o.user_id,
        o.area,
        o.address,
        o.phone,
        o.payment_method,
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
      `SELECT COUNT(*) AS total FROM orders`
    );

    res.json({
      orders,
      meta: { page, total },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders" });
  }
}

/* ================= ADMIN: CREATE ORDER ================= */
export async function createOrderAdmin(req, res) {
  try {
    const {
      user_id,
      area,
      address,
      phone,
      payment_method,
      total_amount,
      status = "Pending",
    } = req.body;

    if (!user_id || !total_amount) {
      return res.status(400).json({
        message: "user_id and total_amount required",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO orders
      (user_id, area, address, phone, payment_method, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        area || null,
        address || null,
        phone || null,
        payment_method || null,
        total_amount,
        status,
      ]
    );

    res.status(201).json({
      ok: true,
      order_id: result.insertId,
    });
  } catch (err) {
    console.error("createOrderAdmin error:", err);
    res.status(500).json({ message: "Admin order create failed" });
  }
}


export async function getOrderAdmin(req, res) {
  const { id } = req.params;

  const [[order]] = await pool.query(
    `SELECT * FROM orders WHERE id = ?`,
    [id]
  );

  res.json({ order });
}


export async function updateOrderAdmin(req, res) {
  const { id } = req.params;
  const {
    area,
    address,
    phone,
    payment_method,
    total_amount,
    status,
  } = req.body;

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
    [
      area,
      address,
      phone,
      payment_method,
      total_amount,
      status,
      id,
    ]
  );

  res.json({ ok: true });
}


export async function deleteOrderAdmin(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM orders WHERE id = ?`,
      [id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("deleteOrderAdmin error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
}
