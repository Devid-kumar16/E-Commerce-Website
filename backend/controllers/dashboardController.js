// controllers/dashboardController.js
import { pool } from "../config/db.js";

export const adminDashboard = async (req, res) => {
  try {
    // =========================
    // RUN ALL QUERIES IN PARALLEL
    // =========================
    const [
      productsRes,
      categoriesRes,
      customersRes,
      ordersRes,
      couponsRes,
      revenueRes,
      recentRes
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM products"),
      pool.query("SELECT COUNT(*) AS total FROM categories"),
      pool.query("SELECT COUNT(*) AS total FROM users WHERE role='customer'"),
      pool.query("SELECT COUNT(*) AS total FROM orders"),
      pool.query("SELECT COUNT(*) AS total FROM coupons"),

      // Revenue = SUM(final_amount) only for Paid orders
      pool.query(`
        SELECT COALESCE(SUM(final_amount), 0) AS revenue
        FROM orders
        WHERE payment_status IN ('Paid', 'paid')
      `),

      // Recent Orders (match your frontend fields)
      pool.query(`
        SELECT
          o.id,
          COALESCE(u.name, o.customer_name, 'Guest') AS customer_name,
          o.final_amount,
          o.payment_status,
          o.created_at
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.id DESC
        LIMIT 5
      `)
    ]);

    // =========================
    // CLEAN EXTRACTED VALUES
    // =========================
    const productCount   = productsRes[0][0].total;
    const categoryCount  = categoriesRes[0][0].total;
    const customerCount  = customersRes[0][0].total;
    const orderCount     = ordersRes[0][0].total;
    const couponCount    = couponsRes[0][0].total;
    const revenue        = revenueRes[0][0].revenue;

    const recentOrders   = recentRes[0]; // array of rows

    // =========================
    // SEND UNIFIED RESPONSE
    // =========================
    return res.json({
      ok: true,
      counts: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        customers: customerCount,
        coupons: couponCount,
      },
      revenue,
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
