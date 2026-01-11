// controllers/customerController.js
import { pool } from "../config/db.js";

/* ============================================================
   ADMIN — LIST CUSTOMERS (WITH PAGINATION + SEARCH SUPPORT)
============================================================ */
export const listCustomersAdmin = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    let offset = (page - 1) * limit;
    let search = (req.query.search || "").trim();

    // ============================
    // SEARCH MODE → FULL LIST
    // ============================
    if (search.length > 0) {
      const like = `%${search}%`;

      const [rows] = await pool.query(
        `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          DATE(u.created_at) AS joined,
          (
            SELECT COUNT(*) 
            FROM orders 
            WHERE user_id = u.id
          ) AS orders
        FROM users u
        WHERE u.role = 'customer'
          AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)
        ORDER BY u.id DESC
        `,
        [like, like, like]
      );

      return res.json({
        ok: true,
        customers: rows,
        meta: {
          total: rows.length,
          page: 1,
          limit: rows.length,
        },
      });
    }

    // ============================
    // NORMAL PAGINATION MODE
    // ============================

    // 1️⃣ Get total customers
    const [[countRow]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      WHERE role='customer'
      `
    );

    const total = countRow.total;

    // 2️⃣ Get paginated customers
    const [rows] = await pool.query(
      `
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.created_at,
  DATE(u.created_at) AS joined,
  (
    SELECT COUNT(*)
    FROM orders
    WHERE user_id = u.id
  ) AS orders
FROM users u
WHERE u.role = 'customer'
ORDER BY u.id DESC
LIMIT ? OFFSET ?

      `,
      [limit, offset]
    );

    return res.json({
      ok: true,
      customers: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Customer list error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load customers",
    });
  }
};


/* ============================================================
   ADMIN — SEARCH CUSTOMERS (PARTIAL PHONE OR NAME)
============================================================ */
export const searchCustomers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (q.length < 2) {
      return res.json({ ok: true, customers: [] });
    }

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT id, name, email, phone, area
      FROM users
      WHERE role='customer'
        AND (phone LIKE ? OR name LIKE ?)
      ORDER BY name ASC
      LIMIT 10
      `,
      [like, like]
    );

    return res.json({ ok: true, customers: rows });
  } catch (err) {
    console.error("customer search error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to search customers",
    });
  }
};


/* ============================================================
   ADMIN — GET SINGLE CUSTOMER BY PHONE (EXACT MATCH)
============================================================ */
export const getCustomerByPhone = async (req, res) => {
  try {
    const phone = req.query.phone;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        name,
        email,
        phone,
        area,
        state,
        pincode,
        address
      FROM users
      WHERE phone = ? AND role='customer'
      LIMIT 1
      `,
      [phone]
    );

    if (!rows.length) {
      return res.json({ ok: false, message: "Customer not found" });
    }

    return res.json({
      ok: true,
      customer: rows[0],
    });
  } catch (err) {
    console.error("getCustomerByPhone error:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};





/* ============================================================
   USER — GET PROFILE
============================================================ */
export const getProfile = async (req, res) => {
  try {
    const [[user]] = await pool.query(
      `
      SELECT
        id, name, email, phone, address, state, pincode,
        role, created_at
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    if (!user)
      return res.status(404).json({ ok: false, message: "User not found" });

    return res.json({ ok: true, user });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to load profile",
    });
  }
};

/* ============================================================
   USER — UPDATE PROFILE
============================================================ */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, state, pincode } = req.body;

    await pool.query(
      `
      UPDATE users 
      SET name = ?, phone = ?, address = ?, state = ?, pincode = ?
      WHERE id = ?
      `,
      [name, phone, address, state, pincode, req.user.id]
    );

    return res.json({
      ok: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to update profile",
    });
  }
};


/* ============================================================
   ADMIN — CREATE CUSTOMER
============================================================ */
export const createCustomerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Name, email and password are required",
      });
    }

    // check duplicate email
    const [[existing]] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing) {
      return res.status(400).json({
        ok: false,
        message: "Email already exists",
      });
    }

    await pool.query(
      `
      INSERT INTO users 
      (name, email, phone, password, role)
      VALUES (?, ?, ?, ?, 'customer')
      `,
      [name, email, phone || null, password]
    );

    return res.json({
      ok: true,
      message: "Customer created successfully"
    });
  } catch (err) {
    console.error("createCustomerAdmin error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to create customer"
    });
  }
};
