import pool from "../config/db.js";

export const adminDashboard = async (req, res) => {
  try {
    /* ================== COUNTS ================== */
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

    const [[couponCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM coupons"
    );


    /* ================== REVENUE ================== */
    const [[revenue]] = await pool.query(
      `
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM orders
      WHERE payment_status = 'Paid'
      `
    );

    /* ================== RECENT ORDERS ================== */
    const [recentOrders] = await pool.query(
      `
      SELECT 
        o.id,
        o.total_amount,
        o.payment_status,
        o.delivery_status,
        o.created_at,
        u.name AS customer_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 5
      `
    );

    /* ================== RESPONSE (STANDARDIZED) ================== */
    res.json({
      ok: true,
      counts: {
        products: products.total,
        categories: categories.total,
        orders: orders.total,
        customers: customers.total,
        coupons: couponCount.total,
      },
      revenue: revenue.total,
      recentOrders,
    });
  } catch (err) {
    console.error("❌ Dashboard API error:", err);
    res.status(500).json({
      ok: false,
      message: "Failed to load dashboard data",
    });
  }
};
