import pool from "../config/db.js";

/**
 * APPLY COUPON
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || !cartTotal) {
      return res.status(400).json({
        ok: false,
        message: "Coupon code and cart total required",
      });
    }

    const couponCode = code.trim().toUpperCase();

    const [rows] = await pool.query(
      `
      SELECT *
      FROM coupons
      WHERE UPPER(code) = ?
        AND is_active = 1
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at >= NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
      `,
      [couponCode]
    );

    if (!rows.length) {
      return res.status(400).json({
        ok: false,
        message: "Invalid or expired coupon",
      });
    }

    const coupon = rows[0];

    if (Number(cartTotal) < Number(coupon.min_order || 0)) {
      return res.status(400).json({
        ok: false,
        message: `Minimum order ₹${coupon.min_order} required`,
      });
    }

    let discount = 0;

    if (coupon.type === "percentage") {
      discount = (cartTotal * coupon.value) / 100;

      if (coupon.max_discount) {
        discount = Math.min(discount, coupon.max_discount);
      }
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, cartTotal);

    res.json({
      ok: true,
      discount,
      finalAmount: cartTotal - discount,
      message: "Coupon applied successfully",
    });
  } catch (err) {
    console.error("applyCoupon error:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};

/* ================= ADMIN: GET ALL COUPONS ================= */

export const getAllCouponsAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `
      SELECT id, code, type, value, used_count, is_active, created_at
      FROM coupons
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const [[countResult]] = await pool.query(
      `SELECT COUNT(*) AS total FROM coupons`
    );

    res.json({
      ok: true,
      coupons: rows,
      meta: {
        page,
        limit,
        total: countResult.total
      }
    });
  } catch (err) {
    console.error("getAllCouponsAdmin:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};


export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE coupons SET is_active = NOT is_active WHERE id = ?`,
      [id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("toggleCouponStatus:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

/* =============== CREATE COUPON =============== */

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      min_order,
      max_discount,
      starts_at,
      expires_at,
      usage_limit,
    } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({
        ok: false,
        message: "Code, type and value are required",
      });
    }

    await pool.query(
      `
      INSERT INTO coupons
      (code, type, value, min_order, max_discount, starts_at, expires_at, usage_limit, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        code.trim().toUpperCase(),
        type,
        value,
        min_order || 0,
        max_discount || null,
        starts_at || null,
        expires_at || null,
        usage_limit || null,
      ]
    );

    res.json({
      ok: true,
      message: "Coupon created successfully",
    });
  } catch (err) {
    console.error("createCoupon error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "Coupon code already exists",
      });
    }

    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};

/* =============== AVAILABLE COUPONS FOR CHECKOUT =============== */

export const getAvailableCoupons = async (req, res) => {
  try {
    const { cartTotal } = req.query;

    if (!cartTotal) {
      return res.status(400).json({
        ok: false,
        message: "Cart total required",
      });
    }

    const [coupons] = await pool.query(
      `
SELECT
  id, code, type, value, max_discount, min_order
FROM coupons
WHERE is_active = 1
  AND (starts_at IS NULL OR starts_at <= NOW())
  AND (expires_at IS NULL OR expires_at >= NOW())
  AND (usage_limit IS NULL OR used_count < usage_limit)
ORDER BY created_at DESC;

      `,
      [Number(cartTotal)]
    );

    res.json({
      ok: true,
      coupons,
    });
  } catch (err) {
    console.error("getAvailableCoupons error:", err);
    res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
};
