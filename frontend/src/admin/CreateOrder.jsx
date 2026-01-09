import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/client";
import "./CreateOrder.css";

const STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Uttar Pradesh", "West Bengal",
];

export default function CreateOrder() {
  const navigate = useNavigate();

  /* =================== STATES =================== */
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  // Customer
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lockPhone, setLockPhone] = useState(false);

  // Form
  const [form, setForm] = useState({
    phone: "",
    customer_name: "",
    customer_email: "",
    area: "",
    state: "",
    pincode: "",
    address: "",
    payment_method: "COD",
    payment_status: "Pending",
    delivery_status: "Pending",
  });

  const [loading, setLoading] = useState(false);

  /* =================== LOAD PRODUCTS =================== */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products/admin", { params: { limit: 200 } });
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      }
    };

    loadProducts();
  }, []);

  /* =================== CUSTOMER SEARCH =================== */
  useEffect(() => {
    if (lockPhone || form.phone.trim().length < 4) {
      setCustomers([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingCustomers(true);

        const res = await api.get("/admin/customers/search", {
          params: { q: form.phone },
        });

        setCustomers(res.data.customers || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCustomers(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.phone, lockPhone]);

  /* =================== SELECT CUSTOMER =================== */
  const selectCustomer = (c) => {
    setForm((prev) => ({
      ...prev,
      phone: c.phone || "",
      customer_name: c.name || "",
      customer_email: c.email || "",
      area: c.area || "",
      state: c.state || "",
      pincode: c.pincode || "",
      address: c.address || "",
    }));

    setCustomers([]);
    setShowSuggestions(false);
    setLockPhone(true);
  };

  /* =================== ORDER ITEMS =================== */
  const addItem = () =>
    setItems([...items, { product_id: "", price: 0, quantity: 1 }]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;

    if (field === "product_id") {
      const p = products.find((x) => x.id === Number(value));
      if (p) copy[index].price = Number(p.price);
    }

    setItems(copy);
  };

  const totalAmount = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* =================== SUBMIT =================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone || !form.customer_name || !form.address) {
      return toast.error("Please complete customer details");
    }

    if (items.length === 0) {
      return toast.error("Add at least one product");
    }

    try {
      setLoading(true);

      await api.post("/orders/admin", {
        ...form,
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          price: Number(i.price),
        })),
      });

      toast.success("Order created successfully");
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      toast.error("Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* =================== UI =================== */
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Create Order</h2>
        <p>Create and manage customer orders</p>
      </div>

      <form className="order-page-grid" onSubmit={handleSubmit}>

        {/* LEFT SIDE — CUSTOMER + STATUS */}
        <div className="left-column">

          <div className="card">
            <h3>Customer Information</h3>

            <label>Mobile Number *</label>
            <input
              value={form.phone}
              disabled={lockPhone}
              onChange={(e) => {
                const phone = e.target.value;

                setForm({
                  ...form,
                  phone,
                  customer_name: "",   // reset for new number
                  customer_email: "",
                });

                setLockPhone(false); // <-- allow editing name + email
              }}
            />


            {showSuggestions && customers.length > 0 && (
              <div className="autocomplete-box">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    className="autocomplete-item"
                    onClick={() => selectCustomer(c)}
                  >
                    <strong>{c.name}</strong>
                    <div className="muted">{c.phone} — {c.email}</div>
                  </div>
                ))}
              </div>
            )}

            <label>Customer Name *</label>
            <input
              value={form.customer_name}
              readOnly={lockPhone}   // <-- NEW
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />

            <label>Email</label>
            <input
              value={form.customer_email}
              readOnly={lockPhone}   // <-- NEW
              onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
            />


            <label>Area / City</label>
            <input
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />

            <label>State *</label>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label>Pincode *</label>
            <input
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />

            <label>Full Address *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="card">
            <h3>Order Status</h3>

            <label>Payment Status</label>
            <select
              value={form.payment_status}
              onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>

            <label>Delivery Status</label>
            <select
              value={form.delivery_status}
              onChange={(e) => setForm({ ...form, delivery_status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* RIGHT SIDE — ITEMS + SUMMARY */}
        <div className="right-column">

          <div className="card">
            <h3>Order Items</h3>

            {items.map((item, i) => {
              const product = products.find((p) => p.id === Number(item.product_id));

              return (
                <div key={i} className="item-row">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(i, "product_id", e.target.value)}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  />

                  <span className="price">₹{(item.price * item.quantity).toFixed(2)}</span>

                  <button type="button" className="btn-remove" onClick={() => removeItem(i)}>
                    Remove
                  </button>
                </div>
              );
            })}

            <button type="button" className="btn-outline" onClick={addItem}>+ Add Product</button>
          </div>

          <div className="card summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Total Amount</span>
              <strong>₹{totalAmount.toFixed(2)}</strong>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
