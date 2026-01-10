import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAdminApi from "./useAdminApi";
import { toast } from "react-toastify";
import "./OrderDetails.css";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const api = useAdminApi();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ORDER ================= */
// FIXED: correct endpoint + stable load

useEffect(() => {
  loadOrder();
}, [id]);

const loadOrder = async () => {
  try {
    setLoading(true);

    // ⭐ Correct backend endpoint
    const res = await api.get(`/admin/orders/${id}`);

    const data = res?.data;

    if (!data?.order) {
      throw new Error("Order not found");
    }

    const o = data.order;

    const normalized = {
      id: o.id,
      totalAmount: Number(o.final_amount ?? o.total_amount ?? 0),
      paymentMethod: o.payment_method || "-",
      deliveryStatus: o.delivery_status || "Pending",
      createdAt: o.created_at,

      customerName: o.customer_name || "Unknown",
      customerEmail: o.email || o.customer_email || "Not provided",
      phone: o.phone || "Not provided",
      address: o.address || "",
      area: o.area || "",
      state: o.state || "",
      pincode: o.pincode || "",
    };

    setOrder(normalized);
    setItems(data.items || []);
  } catch (err) {
    console.error(err);
    setError("Failed to load order");
  } finally {
    setLoading(false);
  }
};




  /* ============================================
     INDUSTRY STANDARD STATUS OPTIONS
  ============================================= */
const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Returned"
];

const updateStatus = async (newStatus) => {
  try {
    const res = await api.patch(`/admin/orders/${id}/status`, {
      status: newStatus
    });

    if (!res.data.ok) throw new Error();

    toast.success("Status updated");
    setOrder({ ...order, deliveryStatus: newStatus });

  } catch (err) {
    console.error(err);
    toast.error("Failed to update status");
  }
};



  /* ================= INVOICE ================= */
  const printInvoice = () => {
    const win = window.open("", "_blank");

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${order.id}</title>

  <style>
    @page { margin: 0; }

    body {
      font-family: Arial, sans-serif;
      padding: 30px;
      background: #f3f4f6;
    }

    .invoice-box {
      max-width: 850px;
      margin: auto;
      background: #fff;
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 5px 30px rgba(0,0,0,0.15);
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #eee;
      padding-bottom: 12px;
      margin-bottom: 25px;
    }

    .brand {
      font-size: 28px;
      font-weight: bold;
      color: #4f46e5;
    }

    .invoice-meta {
      text-align: right;
      font-size: 14px;
      color: #555;
    }

    .section-title {
      font-size: 18px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
      font-weight: 600;
    }

    .info-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }

    .info-box {
      width: 48%;
      font-size: 14px;
      line-height: 1.6;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    th {
      background: #eef2ff;
      padding: 10px;
      text-align: left;
      font-size: 14px;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }

    .right { text-align: right; }

    .total-box {
      margin-top: 25px;
      text-align: right;
      font-size: 20px;
      font-weight: bold;
    }

    .status-label {
      padding: 4px 10px;
      background: #fde68a;
      color: #92400e;
      border-radius: 20px;
      font-size: 12px;
      display: inline-block;
      margin-top: 4px;
    }

    @media print {
      body { background: #fff; }
      .invoice-box { box-shadow: none; }
    }
  </style>

</head>

<body>
  <div class="invoice-box">

    <div class="invoice-header">
      <div class="brand">E-Store</div>

      <div class="invoice-meta">
        <b>Invoice ${order.id}</b><br/>
        Date: ${new Date(order.createdAt).toLocaleDateString()}<br/>
        <span class="status-label">${order.deliveryStatus}</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="section-title">Bill To</div>
        ${order.customerName}<br/>
        ${order.customerEmail || "Not provided"}<br/>
        ${order.phone || "Not provided"}<br/>
        ${order.address || "Not provided"}<br/>
        ${order.area || ""}

      </div>

      <div class="info-box">
        <div class="section-title">Order Info</div>
        <b>Payment:</b> ${order.paymentMethod}<br/>
        <b>Status:</b> ${order.deliveryStatus}<br/>
        <b>Order Date:</b> ${new Date(order.createdAt).toLocaleString()}
      </div>
    </div>

    <div class="section-title">Items</div>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="right">Price</th>
          <th class="right">Qty</th>
          <th class="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items
        .map(
          (item) => `
          <tr>
            <td>${item.product_name}</td>
            <td class="right">₹${Number(item.price).toFixed(2)}</td>
            <td class="right">${item.quantity}</td>
            <td class="right">₹${Number(item.subtotal).toFixed(2)}</td>
          </tr>`
        )
        .join("")}
      </tbody>
    </table>

    <div class="total-box">
      Total: ₹${order.totalAmount.toFixed(2)}
    </div>

  </div>

<script> window.print(); </script>

</body>
</html>
    `);

    win.document.close();
  };

  /* ================= RENDER ================= */
  if (loading) return <div className="admin-page">Loading…</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!order) return null;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Order {order.id}</h2>

        <div className="header-actions">
          <button className="btn-outline" onClick={printInvoice}>
            Download Invoice
          </button>

          <Link to="/admin/orders" className="btn-secondary">
            Back
          </Link>
        </div>
      </div>

      <div className="order-stats">
        <div className="stat-card total">
          <h4>Total</h4>
          <p>₹{order.totalAmount.toFixed(2)}</p>
        </div>

        <div className="stat-card payment">
          <h4>Payment</h4>
          <p>{order.paymentMethod}</p>
        </div>

        {/* ⭐ INDUSTRY STANDARD STATUS BUTTONS */}
<div className="card status-card">
  <h3>Status</h3>

  <div className="status-buttons">
    {STATUS_OPTIONS.map((s) => (
<button
  key={s}
  onClick={() => updateStatus(s)}
  className={order.deliveryStatus === s ? "active-status" : ""}
>
  {s}
</button>

    ))}
  </div>
</div>

      </div>

      <div className="admin-card">
        <h3>Customer Details</h3>

        <p><b>Name:</b> {order.customerName}</p>
        <p><b>Email:</b> {order.customerEmail}</p>
        <p><b>Phone:</b> {order.phone}</p>
        <p><b>Address:</b> {order.address}{order.area ? `, ${order.area}` : ""}</p>
      </div>


      <div className="admin-card">
        <h3>Order Items</h3>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.product_name}</td>
                <td>₹{Number(item.price).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
