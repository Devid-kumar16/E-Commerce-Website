// models/Order.js
import { pool } from "../config/db.js";

export const OrderModel = {
  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
    const order = rows[0];
    if (!order) return null;
    // load items (assuming order_items table)
    const [items] = await pool.query("SELECT oi.id, oi.order_id, oi.product_id, oi.qty, oi.price, p.name AS product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?", [order.id]);
    order.items = items;
    return order;
  },

  async list({ page = 1, limit = 20, q, status, customerId } = {}) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (q) {
      where.push("(o.status LIKE ? OR CAST(o.total AS CHAR) LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (status) {
      where.push("o.status = ?");
      params.push(status);
    }
    if (customerId) {
      where.push("o.customer_id = ?");
      params.push(customerId);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `
      SELECT o.id, o.customer_id, u.name AS customer_name, o.total, o.status, o.created_at
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async count({ q, status, customerId } = {}) {
    const where = [];
    const params = [];
    if (q) { where.push("(status LIKE ? OR CAST(total AS CHAR) LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
    if (status) { where.push("status = ?"); params.push(status); }
    if (customerId) { where.push("customer_id = ?"); params.push(customerId); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM orders ${whereSql}`, params);
    return rows[0]?.total || 0;
  },

  // create order: { customerId, items: [{ productId, qty, price }], status }
  async create({ customerId, items = [], status = "pending", createdByAdmin = false }) {
    if (!customerId) throw new Error("customerId required");
    if (!items.length) throw new Error("items required");

    // compute total
    const total = items.reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0);

    const [res] = await pool.query("INSERT INTO orders (customer_id, total, status, created_by_admin, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())", [customerId, total, status, createdByAdmin ? 1 : 0]);
    const orderId = res.insertId;
    // insert order items
    const itemPromises = items.map(it => pool.query("INSERT INTO order_items (order_id, product_id, qty, price, created_at) VALUES (?, ?, ?, ?, NOW())", [orderId, it.productId, it.qty, it.price]));
    await Promise.all(itemPromises);
    return this.findById(orderId);
  },

  async updateStatus(id, status) {
    await pool.query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]);
    return this.findById(id);
  }
};

export default OrderModel;
