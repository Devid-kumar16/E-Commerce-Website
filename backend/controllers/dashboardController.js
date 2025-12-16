// backend/controllers/dashboardController.js
import { pool } from "../config/db.js";

export async function adminDashboard(req, res) {
  try {
    const [[products]] = await pool.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    const [[categories]] = await pool.query(
      "SELECT COUNT(*) AS total FROM categories"
    );

    const [[orders]] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    const [[customers]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'customer'"
    );

    const [[revenue]] = await pool.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS total FROM orders WHERE status = 'Paid'"
    );

    const [recentOrders] = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at,
             u.name AS customer
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id ASC
      LIMIT 5
    `);

    res.json({
      stats: {
        products: products.total,
        categories: categories.total,
        orders: orders.total,
        customers: customers.total,
        revenue: revenue.total,
      },
      recentOrders,
    });
  } catch (err) {
    console.error("❌ Dashboard API error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
}
