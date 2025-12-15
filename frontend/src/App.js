// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
  Navigate
} from "react-router-dom";
import './styles.css';
import { PRODUCTS } from "./data/products";
import { API_BASE } from "./config";
// ===== ADMIN IMPORTS =====
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ProductsPage from "./admin/ProductsPage";
import CategoriesPage from "./admin/CategoriesPage";
import OrdersPage from "./admin/OrdersPage";
import CustomersPage from "./admin/CustomersPage";

/* IMPORTANT: import the shared AuthProvider and hook from your context file */
import { AuthProvider, useAuth } from "./context/AuthProvider";

/* localStorage keys */
const CART_KEY = "estore_cart_v1";
const WISHLIST_KEY = "estore_wishlist_v1";
const USERS_KEY = "estore_users_v1";
const AUTH_KEY = "estore_auth_v1";
const TOKEN_KEY = "estore_token_v1";

/* helpers */
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
};
const saveWishlist = (wl) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl || []));
const readWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch { return []; }
};
const readUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
};
const saveUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u || []));
const readAuth = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
};
const saveAuth = (a) => localStorage.setItem(AUTH_KEY, JSON.stringify(a || null));

/* category constants (same as you had) */
const CATEGORY_IMAGES = {
  electronics: "electronics.jpg",
  fashion: "fashion3.jpg",
  home: ["kitchen1.jpg","kitchen2.jpg","home1.jpg","home2.jpg","home4.jpg","home.jpg"],
  beauty: "beauty.jpg",
  toys: "toys.jpg",
  sports: ["sports1.jpg","sports2.jpg","sports3.jpg","sports4.jpg","sports.jpg"],
  laptops: "laptops.webp",
  grocery: ["grocery1.jpg","grocery2.jpg","grocery3.jpg","grocery4.jpg","Grocery.jpg"],
  "tvs & appliances": ["tv1.jpg","tv2.jpg","tv3.jpg","appliance1.jpg","appliance2.jpg","TVs & Appliances.jpg"],
  "mobile & tablets": "Mobiles & Tablets.jpg",
  "mobiles & tablets": "Mobiles & Tablets.jpg"
};

const ALL_CATEGORIES = [
  { key: "mobiles & tablets", label: "Mobiles & Tablets" },
  { key: "electronics", label: "Electronics" },
  { key: "computers", label: "Computers & Accessories" },
  { key: "tvs & appliances", label: "TVs & Appliances" },
  { key: "home", label: "Home & Kitchen" },
  { key: "laptops", label: "Laptops" },
  { key: "furniture", label: "Furniture" },
  { key: "grocery", label: "Grocery" },
  { key: "fashion", label: "Fashion" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
  { key: "beauty", label: "Beauty & Personal Care" },
  { key: "health", label: "Health & Household" },
  { key: "sports", label: "Sports & Fitness" },
  { key: "toys", label: "Toys & Baby" },
  { key: "books", label: "Books" },
  { key: "movies", label: "Movies, Music & Games" },
  { key: "automotive", label: "Automotive" },
  { key: "pet", label: "Pet Supplies" },
  { key: "office", label: "Office Products" },
  { key: "jewelry", label: "Jewelry & Accessories" },
  { key: "watches", label: "Watches" },
  { key: "shoes", label: "Shoes" },
  { key: "luggage", label: "Luggage & Bags" },
  { key: "garden", label: "Garden & Outdoors" },
  { key: "tools", label: "Tools & Home Improvement" },
  { key: "musical", label: "Musical Instruments" },
  { key: "cameras", label: "Cameras & Photography" },
  { key: "software", label: "Software" },
  { key: "smart-home", label: "Smart Home" },
  { key: "appliances", label: "Large Appliances" }
];

const CATEGORY_SLUG_TO_NAME = Object.fromEntries(ALL_CATEGORIES.map((c) => [c.key, c.label]));
CATEGORY_SLUG_TO_NAME["mobile & tablets"] = CATEGORY_SLUG_TO_NAME["mobiles & tablets"] || "Mobiles & Tablets";
CATEGORY_SLUG_TO_NAME["mobiles & tablets"] = CATEGORY_SLUG_TO_NAME["mobiles & tablets"] || "Mobiles & Tablets";
CATEGORY_SLUG_TO_NAME["tvs & appliances"] = CATEGORY_SLUG_TO_NAME["tvs & appliances"] || "TVs & Appliances";
CATEGORY_SLUG_TO_NAME["beauty"] = "Beauty";
CATEGORY_SLUG_TO_NAME["home"] = CATEGORY_SLUG_TO_NAME["home"] || "Home";
CATEGORY_SLUG_TO_NAME["toys"] = "Toys";
CATEGORY_SLUG_TO_NAME["toys & baby"] = "Toys";

const TOP_CATEGORIES = [
  "electronics",
  "mobiles & tablets",
  "laptops",
  "fashion",
  "home",
  "beauty",
  "toys",
  "sports",
  "grocery",
  "tvs & appliances"
];

const CATEGORY_SLUG_TO_NAMES = {};
Object.keys(CATEGORY_SLUG_TO_NAME).forEach((k) => {
  const v = CATEGORY_SLUG_TO_NAME[k];
  CATEGORY_SLUG_TO_NAMES[k] = Array.isArray(v) ? v : [v];
});
CATEGORY_SLUG_TO_NAMES["toys"] = Array.from(new Set([...(CATEGORY_SLUG_TO_NAMES["toys"] || []), "Sports"]));
CATEGORY_SLUG_TO_NAMES["toys & baby"] = CATEGORY_SLUG_TO_NAMES["toys"];
CATEGORY_SLUG_TO_NAMES["sports"] = Array.from(new Set([...(CATEGORY_SLUG_TO_NAMES["sports"] || []), "Sports"]));
CATEGORY_SLUG_TO_NAMES["sports & fitness"] = CATEGORY_SLUG_TO_NAMES["sports"];
CATEGORY_SLUG_TO_NAMES["grocery"] = CATEGORY_SLUG_TO_NAMES["grocery"] || ["Grocery"];
CATEGORY_SLUG_TO_NAMES["tvs & appliances"] = CATEGORY_SLUG_TO_NAMES["tvs & appliances"] || ["TVs & Appliances"];

/* ------------------ SafeImage ------------------ */
function SafeImage({ candidates = [], alt = "", className = "", width, height, ...rest }) {
  const [idx, setIdx] = useState(0);
  const list = Array.isArray(candidates) ? candidates : [candidates];
  const src = list[idx] || "";
  const onErr = () => { if (idx < list.length - 1) setIdx((i) => i + 1); };
  const candidatesKey = JSON.stringify(candidates);
  useEffect(() => { setIdx(0); }, [candidatesKey]);
  return (
    <img
      src={encodeURI(src || "")}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={onErr}
      {...rest}
    />
  );
}

/* ------------------ Header ------------------ */
function Header({ onSearch, cart }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const categories = ALL_CATEGORIES;
  const [openCats, setOpenCats] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    onSearch(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const goAdmin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (user && (user.role || "").toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      navigate("/login", { state: { from: "/admin" } });
    }
  };

  return (
    <header className="main-header">
      <div className="main-header-inner">
        <Link to="/" className="main-logo">E-Store</Link>

        <div className="categories-wrapper">
          <button
            onClick={() => {
              setOpenCats((s) => !s);
              setOpenAccount(false);
            }}
            className="main-header-categories"
          >
            All Categories ▾
          </button>
          {openCats && (
            <div className="categories-dropdown" role="menu" aria-label="All categories">
              <div className="categories-grid">
                {categories.map((cat) => (
                  <Link
                    key={cat.key}
                    to={`/category/${encodeURIComponent(cat.key)}`}
                    onClick={() => setOpenCats(false)}
                    className="categories-item"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="main-search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands..." className="main-search-input" />
          <button className="main-search-btn">Search</button>
        </form>

        <div className="main-header-right">
          <Link to="/wishlist" className="pill-btn">Wishlist</Link>

          <Link to="/cart" className="pill-btn">
            Cart <span className="pill-badge">{(cart && cart.reduce((s, c) => s + (c.qty || 0), 0)) || 0}</span>
          </Link>

          <div className="account-wrapper">
            <button
              onClick={() => {
                setOpenAccount((s) => !s);
                setOpenCats(false);
              }}
              className="pill-btn"
            >
              My Account ▾
            </button>

            {openAccount && (
              <div className="account-menu">
                {user ? (
                  <>
                    <div className="account-menu-header">
                      <div className="account-avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                      <div>
                        <div className="account-name">{user.name}</div>
                        <div className="account-email">{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => { goAdmin(); setOpenAccount(false); }}
                      className="account-menu-item"
                    >
                      {/* Admin panel */}
                    </button>

                    <button onClick={() => { navigate("/profile"); setOpenAccount(false); }} className="account-menu-item">Profile</button>
                    <button onClick={() => { navigate("/orders"); setOpenAccount(false); }} className="account-menu-item">Orders</button>
                    <button onClick={() => { navigate("/account/settings"); setOpenAccount(false); }} className="account-menu-item">Account settings</button>
                    <button onClick={() => { logout(); setOpenAccount(false); }} className="account-menu-item logout">Logout</button>
                  </>
                ) : (
                  <>
                    <div className="account-menu-title">Welcome to E-Store</div>
                    <div className="account-menu-sub">Login or create an account to track orders.</div>
                    <div className="account-menu-actions">
                      <Link to="/login" onClick={() => setOpenAccount(false)} className="account-menu-btn primary">Login</Link>
                      <Link to="/signup" onClick={() => setOpenAccount(false)} className="account-menu-btn">Signup</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="category-strip">
        <div className="category-strip-inner">
          {TOP_CATEGORIES.map((key) => {
            const label = CATEGORY_SLUG_TO_NAME[key] || key;
            const entry = CATEGORY_IMAGES[key];
            const candidates = Array.isArray(entry)
              ? entry.map((f) => `/images/${f}`)
              : [`/images/${entry || `${key}.jpg`}`, `/images/${key}.jpg`];

            return (
              <Link key={key} to={`/category/${encodeURIComponent(key)}`} className="category-strip-item">
                <div className="category-strip-thumb">
                  <SafeImage candidates={candidates} alt={label} className="category-strip-img" />
                </div>
                <div className="category-strip-label">{label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

/* ------------------ MAIN SITE COMPONENTS (Home / ProductCard / ProductDetail / etc.) ------------------ */

/* Home */
function Home({ products, onAddToCart, searchQuery }) {
  const [filtered, setFiltered] = useState(products);
  useEffect(() => {
    if (!searchQuery) setFiltered(products);
    else {
      const q = searchQuery.toLowerCase();
      setFiltered(products.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    }
  }, [searchQuery, products]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <div className="rounded overflow-hidden shadow">
            <img src="/images/hero.jpg" alt="hero" className="w-full h-96 object-cover rounded" loading="eager" />
          </div>
        </div>

        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded overflow-hidden shadow">
            <img src="/images/vendor-1.jpg" alt="promo" className="w-full h-48 object-cover" />
          </div>
          <div className="bg-white rounded shadow p-4">
            <h4 className="font-semibold">Hot Offers</h4>
            <p className="text-sm text-gray-600 mt-1">Use code SAVE20 on checkout</p>
          </div>
        </aside>
      </div>

      <section id="deals" className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold">Top Deals</h3>
          <Link to="/products" className="text-sm text-blue-600">See all</Link>
        </div>

        {filtered.length === 0 ? (
          <div className="home-no-results">No products found for "<strong>{searchQuery}</strong>"</div>
        ) : (
          <div className="product-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>
        )}
      </section>
    </main>
  );
}

/* ProductCard */
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-card-img-wrap">
          <SafeImage candidates={[product.image, "/images/category-1.jpg"]} alt={product.title} className="product-card-img" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("toggle-wishlist", { detail: product }));
            }}
            className="product-card-heart"
            aria-label="Add to wishlist"
          >
            ♥
          </button>
        </div>

        <div className="product-card-body">
          <h3 className="product-card-title">{product.title}</h3>
          <p className="product-card-category">{product.category}</p>
          <p className="product-card-price">₹{product.price}</p>
        </div>
      </Link>

      <button className="btn-primary btn-block" onClick={() => onAddToCart(product)}>Add to cart</button>
    </div>
  );
}

/* ProductDetail */
function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const pid = Number(id);
  const product = PRODUCTS.find((p) => p.id === pid);
  if (!product) return <div className="max-w-3xl mx-auto p-6">Product not found</div>;
  const similar = PRODUCTS.filter((p) => p.category === product.category && p.id !== pid).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded shadow p-4">
          <SafeImage candidates={[product.image, "/images/category-1.jpg"]} alt={product.title} width="600" height="480" className="w-full h-96 object-contain" />
          <h2 className="text-2xl font-semibold mt-4">{product.title}</h2>
          <div className="text-lg font-bold mt-2">₹{product.price}</div>
          <p className="mt-4 text-gray-700">Category: <strong>{product.category}</strong></p>
          <div className="mt-6 flex gap-3 items-center flex-wrap">
            <button type="button" onClick={() => onAddToCart(product)} className="bg-yellow-400 px-5 py-2 rounded font-semibold">Add to cart</button>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("toggle-wishlist", { detail: product }))} className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-pink-50 hover:border-pink-400 transition" aria-label="Toggle wishlist">
              <span className="text-base">♡</span>
            </button>
            <button type="button" className="px-5 py-2 border rounded">Buy now</button>
          </div>
        </div>

        <aside className="bg-white rounded shadow p-4">
          <h4 className="font-semibold">Similar products</h4>
          <div className="mt-3 space-y-3">
            {similar.length === 0 ? <div className="text-sm text-gray-500">No similar products</div> : similar.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <SafeImage candidates={[s.image, "/images/category-1.jpg"]} alt={s.title} width="64" height="64" className="w-16 h-16 object-contain bg-gray-100 p-2 rounded" />
                <div>
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-gray-500">₹{s.price}</div>
                </div>
                <Link to={`/product/${s.id}`} className="ml-auto text-xs text-blue-600">View</Link>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ProductsPage */
function StoreProductsPage({ products, onAddToCart }) {
  const groups = products.reduce((acc, p) => {
    const k = p.category || "Uncategorized";
    acc[k] = acc[k] || [];
    acc[k].push(p);
    return acc;
  }, {});

  const allCategoryLabels = ALL_CATEGORIES.map((c) => c.label);
  const ordered = [];
  allCategoryLabels.forEach((label) => {
    if (groups[label]) ordered.push(label);
  });
  Object.keys(groups).forEach((k) => {
    if (!allCategoryLabels.includes(k)) ordered.push(k);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">All Products</h2>
      {ordered.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">No products available</div>
      ) : (
        ordered.map((cat) => (
          <section key={cat} className="mb-8">
            <h3 className="text-xl font-semibold mb-3">{cat}</h3>
            <div className="product-grid">
              {groups[cat].map((p) => <ProductCard key={p.id + "-" + cat} product={p} onAddToCart={onAddToCart} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

/* CategoryPage */
function CategoryPage({ onAddToCart }) {
  const { name } = useParams();
  const slug = decodeURIComponent(name || "").toLowerCase();
  const mapped = CATEGORY_SLUG_TO_NAMES[slug] || [CATEGORY_SLUG_TO_NAME[slug] || slug];
  const lowered = mapped.map((m) => String(m).toLowerCase());
  const list = PRODUCTS.filter((p) => lowered.includes((p.category || "").toLowerCase()));
  const headingLabel = mapped.map((m) => String(m)).join(" & ");
  const heading = headingLabel ? headingLabel.toUpperCase() : "Category";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-2">{heading}</h2>
      {mapped.length > 1 && <div className="text-sm text-gray-500 mb-4">Includes items from: {mapped.join(", ")}</div>}
      {list.length === 0 ? <div className="p-6 bg-white rounded shadow">No items in this category</div> : <div className="product-grid">{list.map((p) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>}
    </div>
  );
}

/* small hook */
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

/* SearchResults */
function SearchResults({ products, onAddToCart }) {
  const q = useQuery().get("q") || "";
  const filtered = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Search results for "{q}"</h2>
      {filtered.length === 0 ? <div className="p-6 bg-white rounded shadow">No results</div> : <div className="product-grid">{filtered.map((p) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>}
    </div>
  );
}

/* WishlistPage */
function WishlistPage({ wishlist, setWishlist, onAddToCart }) {
  const remove = (id) => setWishlist((prev) => {
    const next = prev.filter((p) => p.id !== id);
    saveWishlist(next);
    return next;
  });
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
      {!wishlist || wishlist.length === 0 ? <div className="p-6 bg-white rounded shadow">Your wishlist is empty</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((p) => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <SafeImage candidates={[p.image, "/images/category-1.jpg"]} alt={p.title} className="w-full h-40 object-contain mb-3" />
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-500">₹{p.price}</div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => onAddToCart(p)} className="px-3 py-1 bg-yellow-300/80 border rounded text-xs">Add to cart</button>
                <button type="button" onClick={() => remove(p.id)} className="px-3 py-1 border rounded text-xs">Remove</button>
                <Link to={`/product/${p.id}`} className="px-3 py-1 border rounded text-blue-600 text-xs">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* VendorPage, BrandPage, AccountSettings */
function VendorPage() {
  const { id } = useParams();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold">Vendor {id}</h2>
      <p className="mt-3 text-gray-700">Vendor profile and products (demo).</p>
    </div>
  );
}
function BrandPage() {
  const { name } = useParams();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold">Brand: {name}</h2>
      <p className="mt-3 text-gray-700">Brand page showing products from {name}.</p>
    </div>
  );
}
function AccountSettings() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold">Account Settings</h2>
      <p className="mt-3 text-gray-700">Manage your account details here.</p>
    </div>
  );
}

/* Checkout (protected) */
function Checkout() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const cart = readCart();
  const total = cart.reduce((s, c) => s + c.price * (c.qty || 1), 0);
  const navigate = useNavigate();

  const placeOrder = () => {
    if (!user) {
      if (window.showEstoreToast) window.showEstoreToast("Please login first");
      else alert("Please login first");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const users = readUsers();
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) {
        const order = { id: Date.now(), items: cart, total, placedAt: new Date().toISOString() };
        users[idx].orders = users[idx].orders || [];
        users[idx].orders.push(order);
        saveUsers(users);
        localStorage.removeItem(CART_KEY);
        if (window.showEstoreToast) window.showEstoreToast("Order placed! Order id: " + order.id);
        else alert("Order placed! Order id: " + order.id);
        navigate("/");
      } else {
        if (window.showEstoreToast) window.showEstoreToast("User not found");
        else alert("User not found");
      }
      setProcessing(false);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <div className="bg-white rounded shadow p-6">
        <div className="mb-4">Total: <strong>₹{total}</strong></div>
        <button type="button" onClick={placeOrder} disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">
          {processing ? "Processing..." : "Place order"}
        </button>
      </div>
    </div>
  );
}

/* Profile, Orders (customer) */
function Profile() {
  const { user } = useAuth();
  const users = readUsers();
  const cur = (user && users.find((u) => u.email === user.email)) || user || { name: "", email: "" };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <div className="bg-white rounded shadow p-6">
        <div><strong>Name:</strong> {cur.name}</div>
        <div className="mt-2"><strong>Email:</strong> {cur.email}</div>
        <div className="mt-4"><Link to="/orders" className="text-blue-600">View Orders</Link></div>
      </div>
    </div>
  );
}
function Orders() {
  const { user } = useAuth();
  const users = readUsers();
  const cur = user && users.find((u) => u.email === user.email);
  const orders = (cur && cur.orders) || [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded shadow p-6">You have no orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded shadow p-4">Order #{o.id} - ₹{o.total}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Static pages: FAQ, Terms, Privacy, Support, BlogList, BlogPost, About, Contact, Careers */
function FAQ() {
  const faqs = [
    { q: "How long does delivery take?", a: "Delivery usually takes 3-7 business days." },
    { q: "What is your return policy?", a: "30-day returns on unused items." }
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">FAQ</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded shadow p-4">
            <div className="font-semibold">{f.q}</div>
            <div className="text-sm text-gray-700 mt-1">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Terms & Conditions</h1>
      <p className="mt-3 text-gray-700">Standard terms for using the demo store.</p>
    </div>
  );
}
function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-gray-700">We respect your privacy — this site stores demo data only.</p>
    </div>
  );
}
function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Support</h1>
      <p className="mt-3 text-gray-700">Email us at support@estore.example or use the contact page.</p>
    </div>
  );
}
function BlogList() {
  const posts = [
    { id: "1", title: "How to choose the best headphones", excerpt: "Short guide to picking headphones for every budget." },
    { id: "2", title: "Top 10 gadgets this year", excerpt: "A roundup of the most useful gadgets of the year." }
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid gap-4">
        {posts.map((p) => (
          <Link key={p.id} to={`/blog/${p.id}`} className="block bg-white rounded shadow p-4 hover:shadow-md">
            <div className="text-xl font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600 mt-1">{p.excerpt}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
function BlogPost() {
  const { id } = useParams();
  const content = {
    "1": "Full article about headphones...",
    "2": "Full article about top gadgets..."
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{`Post ${id}`}</h1>
      <div className="prose max-w-none">{content[id] || "Post not found"}</div>
    </div>
  );
}
function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold">About</h2>
      <p className="mt-3 text-gray-700">E-Store demo.</p>
    </div>
  );
}
function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold">Contact</h2>
      <p className="mt-3 text-gray-700">support@estore.example</p>
    </div>
  );
}
function Careers() {
  const jobs = [{ id: "frontend", title: "Frontend Developer" }, { id: "support", title: "Customer Support" }];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Careers</h1>
      <p className="text-gray-700 mb-4">Join our team — remote friendly.</p>
      <div className="grid gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white rounded shadow p-4">
            <div className="font-semibold">{j.title}</div>
            <div className="text-sm text-gray-600 mt-2"><Link to="/contact" className="text-blue-600">Apply via contact</Link></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------ AUTH (Login & Signup) ------------------ */
/* Login & Signup use the shared useAuth imported from ./context/AuthProvider */

function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = location?.state?.from;
  const fromPath = typeof rawFrom === "string" ? rawFrom : "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const role = (user.role || "").toString().toLowerCase();
      const target = role === "admin" ? fromPath : "/";
      try {
        navigate(target, { replace: true });
      } catch {
        window.location.href = target;
      }
    }
  }, [user, loading, navigate, fromPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login({ email: form.email, password: form.password });

      let u = null;
      try {
        u = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
      } catch { u = null; }
      const role = (u?.role || (window?.__ESTORE_USER__?.role) || "").toString().toLowerCase();
      const target = role === "admin" ? fromPath : "/";
      try {
        navigate(target, { replace: true });
      } catch {
        window.location.href = target;
      }
    } catch (ex) {
      setErr(ex?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-card">
        <h1 className="account-title">Sign in to E-Store</h1>
        <p className="account-subtitle">Access your orders, wishlist and account settings.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", marginTop: "4px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: "100%", marginTop: "4px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
              required
            />
          </div>

          {err && <div style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{err}</div>}

          <div className="account-actions">
            <button type="submit" className="btn-primary" style={{ padding: "8px 24px" }} disabled={busy}>
              {busy ? "Logging in..." : "Login"}
            </button>
            <Link to="/signup" className="btn-outline">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const newUser = await signup(form);
      if (newUser && (newUser.role || "").toLowerCase() === "admin") navigate("/admin");
      else navigate("/");
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="account-page">
      <div className="account-card">
        <h1 className="account-title">Create your E-Store account</h1>
        <p className="account-subtitle">Shop faster, track orders and manage returns easily.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", marginTop: "4px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" }} required />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: "100%", marginTop: "4px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" }} type="email" required />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: "100%", marginTop: "4px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db" }} required />
          </div>

          {err && <div style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{err}</div>}

          <div className="account-actions">
            <button type="submit" className="btn-primary" style={{ padding: "8px 24px" }}>Signup</button>
            <Link to="/login" className="btn-outline">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------ ProtectedRoute and AdminRoute ------------------ */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div style={{ padding: 20 }}>Checking authentication…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ------------------ Conditional header/footer (hide on admin/login pages) ------------------ */
function ConditionalHeader({ onSearch, cart, wishlist }) {
  const location = useLocation();
  if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname.startsWith("/admin")) {
    return null;
  }
  return <Header onSearch={onSearch} cart={cart} wishlist={wishlist} />;
}
function ConditionalFooter() {
  const location = useLocation();
  if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-gray-900 text-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <div className="text-xl font-bold">E-Store</div>
          <div className="text-sm mt-2">Fast delivery & easy returns.</div>
        </div>
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Help</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link to="/support" className="hover:underline">Support</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-sm">support@estore.example</div>
        </div>
      </div>
      <div className="text-center text-xs py-4 border-t border-gray-800">© {new Date().getFullYear()} E-Store</div>
    </footer>
  );
}


/* ------------------ CartPage (paste this above export default App) ------------------ */
function CartPage({ cart, setCart }) {
  // update qty and remove helpers
  const updateQty = (id, qty) => {
    setCart((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, qty } : it)).filter((it) => it.qty > 0);
      saveCart(next);
      return next;
    });
  };

  const remove = (id) => {
    setCart((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCart(next);
      return next;
    });
  };

  const total = (cart || []).reduce((s, c) => s + (c.price || 0) * (c.qty || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Your cart</h2>

      {!cart || cart.length === 0 ? (
        <div className="p-8 bg-white rounded shadow text-center">Your cart is empty</div>
      ) : (
        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-white rounded shadow p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b last:border-b-0 pb-4 last:pb-0">
                <SafeImage
                  candidates={[item.image, "/images/category-1.jpg"]}
                  alt={item.title}
                  width="80"
                  height="80"
                  className="w-20 h-20 object-contain bg-gray-100 p-2 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">₹{item.price}</div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, Math.max(1, Number(e.target.value)))}
                      className="w-20 border rounded p-1 text-sm"
                    />
                    <button type="button" onClick={() => remove(item.id)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                </div>
                <div className="w-28 text-right font-semibold">₹{(item.qty || 0) * (item.price || 0)}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded shadow p-4 h-fit">
            <h3 className="text-lg font-semibold mb-3">Order summary</h3>
            <div className="flex justify-between text-sm mb-2">
              <span>Items ({cart.length})</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-3 mt-2">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <Link to="/checkout" className="mt-4 block text-center bg-blue-600 text-white px-4 py-2 rounded font-semibold">Proceed to checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}


function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Checking admin access…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if ((user.role || "").toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}



/* ------------------ App (root) ------------------ */
export default function App() {
  const [products] = useState(PRODUCTS);
  const [cart, setCart] = useState(() => readCart());
  const [wishlist, setWishlist] = useState(() => readWishlist());
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => saveCart(cart), [cart]);

  useEffect(() => {
    window.showEstoreToast = (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 1800);
    };
    return () => {
      try { delete window.showEstoreToast; } catch { }
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const p = e.detail;
      setWishlist((prev) => {
        const exists = prev.find((i) => i.id === p.id);
        const next = exists ? prev.filter((i) => i.id !== p.id) : [...prev, p];
        saveWishlist(next);
        if (window.showEstoreToast) window.showEstoreToast(exists ? "Removed from wishlist" : "Added to wishlist");
        return next;
      });
    };
    window.addEventListener("toggle-wishlist", handler);
    return () => window.removeEventListener("toggle-wishlist", handler);
  }, []);

  const onAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      let next;
      if (existing) next = prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      else next = [...prev, { ...product, qty: 1 }];
      saveCart(next);
      return next;
    });
    setToast(`${product.title} added to cart`);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <AuthProvider>
      <ConditionalHeader onSearch={(q) => setSearchQuery(q)} cart={cart} wishlist={wishlist} />

      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div className="bg-black text-white px-4 py-2 rounded shadow">{toast}</div>
        </div>
      )}

      <Routes>

  {/* ================= ADMIN PANEL (PROTECTED) ================= */}
  <Route
    path="/admin"
    element={
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    }
  >
    <Route index element={<Dashboard />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="categories" element={<CategoriesPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="customers" element={<CustomersPage />} />
  </Route>

  {/* ================= MAIN SITE ================= */}
  <Route
    path="/"
    element={
      <Home
        products={products}
        onAddToCart={onAddToCart}
        searchQuery={searchQuery}
      />
    }
  />

  <Route
    path="/products"
    element={<StoreProductsPage products={products} onAddToCart={onAddToCart} />}
  />

  <Route
    path="/search"
    element={<SearchResults products={products} onAddToCart={onAddToCart} />}
  />

  <Route
    path="/product/:id"
    element={<ProductDetail onAddToCart={onAddToCart} />}
  />

  <Route
    path="/category/:name"
    element={<CategoryPage onAddToCart={onAddToCart} />}
  />

  <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />

  <Route
    path="/wishlist"
    element={
      <WishlistPage
        wishlist={wishlist}
        setWishlist={setWishlist}
        onAddToCart={onAddToCart}
      />
    }
  />

  <Route path="/vendor/:id" element={<VendorPage />} />
  <Route path="/brand/:name" element={<BrandPage />} />
  <Route path="/account/settings" element={<AccountSettings />} />

  {/* ================= PROTECTED CUSTOMER PAGES ================= */}
  <Route
    path="/checkout"
    element={
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route
    path="/orders"
    element={
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    }
  />

  {/* ================= AUTH ================= */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  {/* ================= STATIC PAGES ================= */}
  <Route path="/faq" element={<FAQ />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/support" element={<Support />} />
  <Route path="/blog" element={<BlogList />} />
  <Route path="/blog/:id" element={<BlogPost />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/careers" element={<Careers />} />

  {/* ================= 404 ================= */}
  <Route
    path="*"
    element={
      <div className="p-12">
        Not found — <Link to="/">Home</Link>
      </div>
    }
  />

</Routes>

      <ConditionalFooter />
    </AuthProvider>
  );
}
