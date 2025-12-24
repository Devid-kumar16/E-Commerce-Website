import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./CreateOrder.css";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [lockPhone, setLockPhone] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    phone: "",
    area: "",
    address: "",
    payment_method: "COD",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    api.get("/products/admin/list").then((res) => {
      setProducts(res.data.products || []);
    });
  }, []);

  /* ================= SEARCH CUSTOMER ================= */
  useEffect(() => {
    if (lockPhone || form.phone.length < 5) {
      setCustomers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        const res = await api.get(
          `/orders/customers/search?q=${form.phone}`
        );
        setCustomers(res.data.customers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCustomers(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.phone, lockPhone]);

  /* ================= SELECT CUSTOMER ================= */
  const selectCustomer = (c) => {
    setCustomers([]);
    setForm((prev) => ({
      ...prev,
      customer_name: c.name || "",
      phone: c.phone,
      customer_email: c.email || "",
    }));
    setLockPhone(true);
  };

  /* ================= ORDER ITEMS ================= */
  const addItem = () => {
    setItems([
      ...items,
      { product_id: "", name: "", price: 0, quantity: 1, image: "" },
    ]);
  };

  const updateItem = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;

    if (field === "product_id") {
      const p = products.find((x) => x.id === Number(value));
      if (p) {
        copy[index].name = p.name;
        copy[index].price = Number(p.price);
        copy[index].image = p.image_url;
      }
    }

    setItems(copy);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ================= TOTAL ================= */
  const totalAmount = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_name.trim())
      return toast.error("Customer name is required");
    if (!form.phone)
      return toast.error("Phone number is required");
    if (!form.customer_email)
      return toast.error("Customer email is required");
    if (!form.address)
      return toast.error("Address is required");
    if (!items.length)
      return toast.error("Add at least one product");

    for (const i of items) {
      if (!i.product_id) {
        return toast.error("Please select all products");
      }
    }

    try {
      setLoading(true);

      const payload = {
        customer: {
          name: form.customer_name.trim(),
          phone: form.phone,
          email: form.customer_email.trim(),
          area: form.area,
          address: form.address,
        },
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          qty: Number(i.quantity),
        })),
        payment_method: form.payment_method,
        status: form.status,
      };

      const res = await api.post("/orders/admin/create", payload);

      if (res.data?.ok) {
        toast.success("Order created successfully");

        setTimeout(() => {
          navigate("/admin/orders");
        }, 1200);
      } else {
        toast.error(res.data?.message || "Order failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page">
      <h2>Create Order</h2>

      <form className="order-card" onSubmit={handleSubmit}>
        {/* CUSTOMER INFO */}
        <div className="card-section">
          <h3>Customer Information</h3>

          <div className="grid-4">
            <input
              placeholder="Customer Name *"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />

            <input
              placeholder="Customer Mobile *"
              value={form.phone}
              disabled={lockPhone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                setLockPhone(false);
              }}
            />

            <input
              type="email"
              placeholder="Customer Email *"
              value={form.customer_email}
              onChange={(e) =>
                setForm({
                  ...form,
                  customer_email: e.target.value,
                })
              }
            />

            <input
              placeholder="Area"
              value={form.area}
              onChange={(e) =>
                setForm({ ...form, area: e.target.value })
              }
            />

            <textarea
              placeholder="Full Address *"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </div>

          {loadingCustomers && (
            <div className="hint">Searching...</div>
          )}

          {customers.length > 0 && (
            <div className="customer-dropdown">
              {customers.map((c) => (
                <div key={c.id} onClick={() => selectCustomer(c)}>
                  📱 {c.phone} {c.email ? `– ${c.email}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ORDER ITEMS */}
        <div className="card-section">
          <h3>Order Items</h3>

          {items.map((item, i) => (
            <div key={i} className="item-row">
              {item.image && <img src={item.image} alt="" />}

              <select
                value={item.product_id}
                onChange={(e) =>
                  updateItem(i, "product_id", e.target.value)
                }
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", Number(e.target.value))
                }
              />

              <span>
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>

              <button type="button" onClick={() => removeItem(i)}>
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn-outline"
            onClick={addItem}
          >
            + Add Product
          </button>
        </div>

        {/* SUMMARY */}
        <div className="summary">
          <strong>Total: ₹{totalAmount.toFixed(2)}</strong>
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <select
            value={form.payment_method}
            onChange={(e) =>
              setForm({
                ...form,
                payment_method: e.target.value,
              })
            }
          >
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
