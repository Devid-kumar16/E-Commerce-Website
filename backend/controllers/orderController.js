// backend/controllers/orderController.js
import { pool } from "../config/db.js";

/**
 * createOrder (authenticated checkout)
 * Expects body: { items: [{ product_id, quantity }], shipping_address, shipping_meta, payment_method, phone, total_amount, user_id (optional admin only) }
 * Returns { order: {...} }
 */
export async function createOrder(req, res) {
  try {
    const body = req.body || {};

    // Require authentication: verifyToken middleware must set req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Determine target user id:
    let userId = req.user.id;
    if (req.user.role && String(req.user.role).toLowerCase() === "admin" && body.user_id) {
      userId = Number(body.user_id) || userId;
    }

    if (!userId) return res.status(400).json({ message: "user_id is required" });

    const items = body.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    // basic items validation
    for (const it of items) {
      if (!it.product_id || !it.quantity || Number(it.quantity) <= 0) {
        return res.status(400).json({ message: "Each item must have product_id and positive quantity" });
      }
    }

    const total_amount = parseFloat(body.total_amount || 0);
    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ message: "total_amount must be provided and greater than 0" });
    }

    const shipping_address = body.shipping_address || null;
    const shipping_meta = body.shipping_meta || null;
    const payment_method = body.payment_method || null;
    const phone = body.phone || null;

    // Prepare product id list (unique numbers)
    const productIds = [...new Set(items.map((i) => Number(i.product_id)).filter((v) => Number.isFinite(v)))];

    if (productIds.length === 0) {
      return res.status(400).json({ message: "No valid product_id provided" });
    }

    // Start transaction and validate products in one go
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Fetch all products referenced by the order
      const placeholders = productIds.map(() => "?").join(",");
      const [prodRows] = await conn.query(
        `SELECT id, price, inventory, stock FROM products WHERE id IN (${placeholders})`,
        productIds
      );

      const foundIds = new Set(prodRows.map((r) => Number(r.id)));
      const missing = productIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: "Some products not found", missing });
      }

      // Check stock/inventory if present
      const stockErrors = [];
      for (const it of items) {
        const pid = Number(it.product_id);
        const qty = Number(it.quantity);
        const prod = prodRows.find((r) => Number(r.id) === pid);
        const invVal = prod && (prod.inventory ?? prod.stock);
        if (invVal != null) {
          const avail = Number(invVal);
          if (Number.isFinite(avail) && qty > avail) {
            stockErrors.push({ product_id: pid, requested: qty, available: avail });
          }
        }
      }
      if (stockErrors.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: "Insufficient stock for one or more items", details: stockErrors });
      }

      // Insert order (store items JSON for quick lookup)
      const [orderResult] = await conn.query(
        `INSERT INTO orders 
          (user_id, items, shipping_address, shipping_meta, payment_method, phone, total_amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          userId,
          JSON.stringify(items),
          shipping_address,
          shipping_meta ? JSON.stringify(shipping_meta) : null,
          payment_method,
          phone,
          total_amount,
        ]
      );

      const orderId = orderResult.insertId;

      // Build bulk insert for order_items using unit_price from DB (trusted)
      const values = [];
      const placeholdersItems = [];
      for (const it of items) {
        const pid = Number(it.product_id);
        const qty = Number(it.quantity);
        const prod = prodRows.find((r) => Number(r.id) === pid);
        const unitPrice = prod && (prod.price != null ? Number(prod.price) : 0);
        placeholdersItems.push("(?,?,?,?,NOW())"); // order_id, product_id, quantity, unit_price
        values.push(orderId, pid, qty, unitPrice);
      }

      if (values.length > 0) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, created_at) VALUES ${placeholdersItems.join(
            ","
          )}`,
          values
        );
      }

      // Decrement inventory/stock where numeric
      for (const it of items) {
        const pid = Number(it.product_id);
        const qty = Number(it.quantity);
        const prod = prodRows.find((r) => Number(r.id) === pid);
        const invKey = prod && (prod.inventory != null ? "inventory" : prod.stock != null ? "stock" : null);
        if (invKey) {
          await conn.query(`UPDATE products SET ${invKey} = GREATEST(0, ${invKey} - ?) WHERE id = ?`, [qty, pid]);
        }
      }

      await conn.commit();

      // select order to return (fresh)
      const [orderRows] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [orderId]);
      const createdOrder = orderRows && orderRows[0] ? orderRows[0] : { id: orderId };

      conn.release();
      return res.status(201).json({ order: createdOrder });
    } catch (txErr) {
      await conn.rollback().catch(() => {});
      conn.release();
      console.error("createOrder transaction error:", txErr && txErr.stack ? txErr.stack : txErr);
      if (String(txErr.message || "").toLowerCase().includes("product not found")) {
        return res.status(400).json({ message: txErr.message });
      }
      return res.status(500).json({ message: "Server error creating order", error: txErr.message });
    }
  } catch (err) {
    console.error("createOrder error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * listOrdersForUser - returns paginated orders for logged-in user (req.user required)
 * Query: ?page=&limit=&q=
 */
export async function listOrdersForUser(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user.sub);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, o.status, o.created_at, o.shipping_meta,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countRows] = await pool.query("SELECT COUNT(*) AS total FROM orders WHERE user_id = ?", [userId]);
    const total = countRows && countRows[0] ? Number(countRows[0].total) : rows.length;

    res.json({ meta: { total, page }, data: rows });
  } catch (err) {
    console.error("listOrdersForUser error:", err);
    res.status(500).json({ message: "Server error listing user orders" });
  }
}

/**
 * listOrdersPublic - admin listing all orders with pagination and optional search
 * Query: ?page=&limit=&q=&status=
 */
export async function listOrdersPublic(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;
    const q = req.query.q ? `%${req.query.q}%` : null;
    const status = req.query.status ? String(req.query.status) : null;

    const where = [];
    const params = [];

    if (q) {
      where.push("(o.id LIKE ? OR o.status LIKE ? OR o.shipping_meta LIKE ?)");
      params.push(q, q, q);
    }
    if (status) {
      where.push("o.status = ?");
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, o.status, o.created_at, o.shipping_meta,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       ${whereSql}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM orders o ${whereSql}`, params);
    const total = countRows && countRows[0] ? Number(countRows[0].total) : rows.length;

    res.json({ meta: { total, page }, data: rows });
  } catch (err) {
    console.error("listOrdersPublic error:", err);
    res.status(500).json({ message: "Server error listing orders" });
  }
}

/**
 * getOrder - returns a single order. Admins can view any; owners can view their own.
 */
export async function getOrder(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query("SELECT id, user_id, status, shipping_meta, created_at FROM orders WHERE id = ? LIMIT 1", [
      id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: "Order not found" });

    const order = rows[0];

    // if not admin, ensure owner
    if (req.user && req.user.role !== "admin" && String(req.user.id) !== String(order.user_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [items] = await pool.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, p.name
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;
    res.json(order);
  } catch (err) {
    console.error("getOrder error:", err);
    res.status(500).json({ message: "Server error getting order" });
  }
}

/**
 * createOrderFromAdmin - admin creates an order for a user (lightweight)
 * Body: { user_id, items: [{product_id, quantity}], shipping: {...} }
 */
export async function createOrderFromAdmin(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Admin required" });

    const { user_id, items, shipping = null } = req.body;
    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "user_id and items are required" });
    }

    // normalize incoming items and filter invalid ones
    const normalizedItems = items
      .map((it) => ({ product_id: Number(it.product_id), quantity: Number(it.quantity) || 0 }))
      .filter((it) => it.product_id && it.quantity > 0);

    const productIds = [...new Set(normalizedItems.map((i) => i.product_id))];
    if (productIds.length === 0) {
      return res.status(400).json({ message: "No valid product_id provided" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // fetch product prices for all referenced products
      const placeholders = productIds.map(() => "?").join(",");
      const [prodRows] = await conn.query(`SELECT id, price FROM products WHERE id IN (${placeholders})`, productIds);

      const foundIds = new Set(prodRows.map((r) => Number(r.id)));
      const missing = productIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: "Some products not found", missing });
      }

      // compute total amount using DB prices
      let totalAmount = 0;
      const priceById = {};
      for (const p of prodRows) {
        priceById[Number(p.id)] = Number(p.price) || 0;
      }
      for (const it of normalizedItems) {
        const unitPrice = priceById[it.product_id] || 0;
        totalAmount += unitPrice * Number(it.quantity);
      }

      // Insert order including total_amount
      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (user_id, items, shipping_meta, total_amount, status, created_at)
         VALUES (?, ?, ?, ?, 'pending', NOW())`,
        [user_id, JSON.stringify(normalizedItems), shipping ? JSON.stringify(shipping) : null, totalAmount]
      );

      const orderId = orderResult.insertId;

      // Insert order_items (use DB unit_price)
      const values = [];
      const placeholdersItems = [];
      for (const it of normalizedItems) {
        const unitPrice = priceById[it.product_id] || 0;
        placeholdersItems.push("(?,?,?,?,NOW())"); // order_id, product_id, quantity, unit_price
        values.push(orderId, it.product_id, it.quantity, unitPrice);
      }

      if (values.length > 0) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, created_at) VALUES ${placeholdersItems.join(",")}`,
          values
        );
      }

      await conn.commit();
      conn.release();
      return res.status(201).json({ id: orderId });
    } catch (err) {
      await conn.rollback().catch(() => {});
      conn.release();
      console.error("createOrderFromAdmin tx error:", err && err.stack ? err.stack : err);
      return res.status(500).json({ message: "Server error creating admin order", error: err.message });
    }
  } catch (err) {
    console.error("createOrderFromAdmin error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error creating admin order" });
  }
}

/**
 * updateOrderStatus - admin only, change status of an order
 * Body: { status: "shipped" }
 */
export async function updateOrderStatus(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Admin required" });
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "status is required" });

    await pool.query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]);

    res.json({ id, status });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: "Server error updating order status" });
  }
}
