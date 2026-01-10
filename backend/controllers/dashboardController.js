// controllers/dashboardController.js
import { pool } from "../config/db.js";

export const adminDashboard = async (req, res) => {
  try {
    // ============================
    // COUNTS
    // ============================
    const [[products]] = await pool.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    const [[categories]] = await pool.query(
      "SELECT COUNT(*) AS total FROM categories"
    );

    const [[customers]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'customer'
    `);

    const [[orders]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE delivery_status NOT IN ('Cancelled', 'Returned')
    `);

    // ============================
    // REVENUE (Final amount ONLY)
    // ============================
    const [[revenue]] = await pool.query(`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN final_amount IS NOT NULL THEN final_amount
            ELSE total_amount 
          END
        ), 0) AS total
      FROM orders
      WHERE payment_status = 'Paid'
        AND delivery_status NOT IN ('Cancelled','Returned')
    `);

    // ============================
    // RECENT ORDERS (MATCH FRONTEND)
    // ============================
    const [recentOrders] = await pool.query(`
      SELECT
        o.id,
        COALESCE(o.final_amount, o.total_amount, 0) AS total_amount,
        o.payment_status,
        o.delivery_status,
        o.created_at,
        COALESCE(u.name, o.customer_name, 'Guest User') AS customer_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // ============================
    // ACTIVE COUPONS
    // ============================
    const [[coupons]] = await pool.query(`
      SELECT COUNT(*) AS total 
      FROM coupons 
      WHERE is_active = 1
    `);

    // ============================
    // RESPONSE (FRONTEND MATCHING)
    // ============================
    res.json({
      ok: true,
      counts: {
        products: products.total,
        categories: categories.total,
        customers: customers.total,
        orders: orders.total,
        coupons: coupons.total,
      },
      revenue: revenue.total,
      recentOrders,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load dashboard data",
    });
  }
};
