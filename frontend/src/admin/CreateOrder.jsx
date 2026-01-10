import React, { useEffect, useState } from "react";
import useAdminApi from "./useAdminApi";
import { toast } from "react-toastify";
import "./CreateOrder.css";

export default function CreateOrder() {
  const api = useAdminApi();

  /* ========================================================
      STATE
  ======================================================== */
  const [products, setProducts] = useState([]);

  const [customer, setCustomer] = useState({
    phone: "",
    name: "",
    email: "",
    area: "",
    state: "",
    pincode: "",
    address: "",
  });

  const [suggestions, setSuggestions] = useState([]);

  const [items, setItems] = useState([
    { product_id: "", quantity: 1, price: 0, product_name: "" },
  ]);

  const [loading, setLoading] = useState(false);

  const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  /* ========================================================
      LOAD PRODUCTS
  ======================================================== */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data?.products || []);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  /* ========================================================
      HANDLE PHONE INPUT + DROPDOWN SEARCH
  ======================================================== */
  const handlePhoneInput = async (value) => {
    setCustomer({ ...customer, phone: value });

    // ---- PARTIAL SEARCH (Dropdown) ----
    if (value.length >= 3) {
      try {
        const res = await api.get(`/admin/customers/search?q=${value}`);
        setSuggestions(res.data.customers || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }

    // ---- EXACT SEARCH (Auto-fill) ----
    if (value.length === 10) {
      try {
        const res = await api.get(`/admin/customers/get-by-phone?phone=${value}`);

        if (res.data.ok) {
          const c = res.data.customer;
          setCustomer({
            phone: c.phone,
            name: c.name || "",
            email: c.email || "",
            area: c.area || "",
            state: c.state || "",
            pincode: c.pincode || "",
            address: c.address || "",
          });

          toast.success("Customer found — auto-filled");
          setSuggestions([]);
        }
      } catch { }
    }
  };

  /* ========================================================
      ITEM HANDLERS
  ======================================================== */
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "product_id") {
      const p = products.find((x) => x.id == value);
      if (p) {
        updated[index].price = p.price;
        updated[index].product_name = p.name;
      }
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product_id: "", quantity: 1, price: 0, product_name: "" },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ========================================================
      TOTAL PRICE
  ======================================================== */
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  /* ========================================================
      SUBMIT ORDER
  ======================================================== */
  const submitOrder = async () => {
    if (!customer.phone || !customer.name || !customer.address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (items.length === 0 || items[0].product_id === "") {
      toast.error("Add at least one product");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        phone: customer.phone,
        customer_name: customer.name,
        customer_email: customer.email,
        area: customer.area,
        state: customer.state,
        pincode: customer.pincode,
        address: customer.address,
        payment_method: "COD",
        items,
      };

      const res = await api.post("/admin/orders", payload);

      if (res.data.ok) {
        toast.success("Order created successfully!");
        window.location.href = "/admin/orders";
      }
    } catch (err) {
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  /* ========================================================
      UI
  ======================================================== */
  return (
    <div className="admin-page">
      <h2>Create Order</h2>

      {/* CUSTOMER SECTION */}
      <div className="admin-card">
        <h3>Customer Details</h3>

        <div className="form-grid">
          <div style={{ position: "relative" }}>
            <label>Phone *</label>

            <input
              value={customer.phone}
              onChange={(e) => handlePhoneInput(e.target.value)}
              placeholder="Enter phone number"
              maxLength={10}
            />

            {/* SUGGESTION DROPDOWN */}
            {suggestions.length > 0 && (
              <div className="suggestion-box">
                {suggestions.map((u) => (
                  <div
                    key={u.id}
                    className="suggestion-item"
                    onClick={() => {
                      setCustomer({
                        ...customer,
                        phone: u.phone,
                        name: u.name,
                        email: u.email,
                      });
                      setSuggestions([]);
                    }}
                  >
                    {u.name} — {u.phone}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label>Name *</label>
            <input
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
            />
          </div>

          <div>
            <label>Area</label>
            <input
              value={customer.area}
              onChange={(e) =>
                setCustomer({ ...customer, area: e.target.value })
              }
            />
          </div>

          <div>
            <label>State</label>
            <select
              value={customer.state}
              onChange={(e) =>
                setCustomer({ ...customer, state: e.target.value })
              }
            >
              <option value="">Select State</option>

              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label>Pincode</label>
            <input
              value={customer.pincode}
              onChange={(e) =>
                setCustomer({ ...customer, pincode: e.target.value })
              }
            />
          </div>

          <div className="full">
            <label>Address *</label>
            <input
              value={customer.address}
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* ITEMS SECTION */}
      <div className="admin-card">
        <h3>Order Items</h3>

        {items.map((item, index) => (
          <div key={index} className="order-row">
            <select
              value={item.product_id}
              onChange={(e) =>
                handleItemChange(index, "product_id", e.target.value)
              }
            >
              <option value="">Select Product</option>
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
              onChange={(e) =>
                handleItemChange(index, "quantity", Number(e.target.value))
              }
            />

            <span>₹{(item.quantity * item.price).toFixed(2)}</span>

            {index > 0 && (
              <button className="btn-delete" onClick={() => removeItem(index)}>
                ×
              </button>
            )}
          </div>
        ))}

        <button className="btn-primary mt" onClick={addItem}>
          + Add Product
        </button>

        <h3 className="total-box">Total: ₹{totalAmount.toFixed(2)}</h3>
      </div>

      <button
        className="btn-primary large"
        disabled={loading}
        onClick={submitOrder}
      >
        {loading ? "Saving…" : "Create Order"}
      </button>
    </div>
  );
}
