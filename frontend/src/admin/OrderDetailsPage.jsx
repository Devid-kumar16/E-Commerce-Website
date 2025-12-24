import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAdminApi from "./useAdminApi";
import "./OrderDetails.css";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const api = useAdminApi();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/orders/admin/${id}`);
        const data = res?.data;

        if (!data?.order) throw new Error("Order not found");

        const o = data.order;

        const normalizedOrder = {
          id: o.id,
          totalAmount: Number(o.total_amount || 0),
          paymentMethod: o.payment_method,
          status: o.status,
          createdAt: o.created_at,

          customerName: o.customer_name,
          customerEmail: o.customer_email,
          phone: o.phone,
          address: o.address,
          area: o.area,
        };

        if (mounted) {
          setOrder(normalizedOrder);
          setItems(data.items || []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load order details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();
    return () => (mounted = false);
  }, [id, api]);

  /* ================= INVOICE ================= */
  const printInvoice = () => {
    const win = window.open("", "_blank");

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${order.id}</title>
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      background: #f4f6f8;
      padding: 30px;
    }

    .invoice {
      max-width: 800px;
      margin: auto;
      background: #fff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #eee;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }

    .brand {
      font-size: 26px;
      font-weight: bold;
      color: #4f46e5;
    }

    .invoice-id {
      text-align: right;
      font-size: 14px;
      color: #555;
    }

    .section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
    }

    .box {
      width: 48%;
      font-size: 14px;
      line-height: 1.6;
    }

    h3 {
      margin-bottom: 10px;
      font-size: 16px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px;
      font-size: 14px;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    .right {
      text-align: right;
    }

    .total-box {
      margin-top: 30px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
      display: flex;
      justify-content: flex-end;
      font-size: 18px;
      font-weight: bold;
    }

    .status {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      display: inline-block;
      background: #fde68a;
      color: #92400e;
      margin-top: 4px;
    }

    @media print {
      body { background: #fff; }
      .invoice { box-shadow: none; }
    }
  </style>
</head>

<body>
  <div class="invoice">

    <div class="header">
      <div class="brand">E-Store</div>
      <div class="invoice-id">
        <div><b>Invoice #${order.id}</b></div>
        <div>${new Date(order.createdAt).toLocaleDateString()}</div>
        <div class="status">${order.status}</div>
      </div>
    </div>

    <div class="section">
      <div class="box">
        <h3>Bill To</h3>
        ${order.customerName}<br/>
        ${order.customerEmail}<br/>
        ${order.phone}<br/>
        ${order.address}
      </div>

      <div class="box">
        <h3>Order Info</h3>
        Payment Method: <b>${order.paymentMethod}</b><br/>
        Area: ${order.area || "-"}
      </div>
    </div>

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
        ${items.map(i => `
          <tr>
            <td>${i.product_name}</td>
            <td class="right">₹${Number(i.price).toFixed(2)}</td>
            <td class="right">${i.quantity}</td>
            <td class="right">₹${Number(i.subtotal).toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="total-box">
      Total: ₹${order.totalAmount.toFixed(2)}
    </div>

  </div>

  <script>
    window.print();
  </script>
</body>
</html>
`);

    win.document.close();
  };


  /* ================= SAFE RENDER ================= */
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

      {/* STATS */}
      <div className="order-stats">
        <div className="stat-card total">
          <h4>Total</h4>
          <p>₹{order.totalAmount.toFixed(2)}</p>
        </div>

        <div className="stat-card payment">
          <h4>Payment</h4>
          <p>{order.paymentMethod}</p>
        </div>

        <div className={`stat-card status ${order.status.toLowerCase()}`}>
          <h4>Status</h4>
          <p>{order.status}</p>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="admin-card">
        <h3>Customer Details</h3>
        <p><b>Name:</b> {order.customerName}</p>
        <p><b>Email:</b> {order.customerEmail}</p>
        <p><b>Phone:</b> {order.phone || "Not provided"}</p>
        <p><b>Address:</b> {order.address}</p>
      </div>

      {/* ITEMS */}
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
