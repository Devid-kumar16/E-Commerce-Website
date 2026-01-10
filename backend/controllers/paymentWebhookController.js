// backend/controllers/paymentWebhookController.js

import pool from "../db.js";  // <-- your database connection

export const razorpayWebhook = async (req, res) => {
  try {
    const payment = req.body;

    // Razorpay sends `payment.entity.status`
    const status = payment?.payload?.payment?.entity?.status;
    const orderId = payment?.payload?.payment?.entity?.order_id;

    if (!orderId) {
      return res.status(400).json({ message: "Missing order ID" });
    }

    if (status === "captured") {
      await pool.query(
        "UPDATE orders SET payment_status = ?, delivery_status = ? WHERE id = ?",
        ["Paid", "Processing", orderId]
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Webhook handling failed" });
  }
};
