// src/App.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import AdminApp from "./admin/AdminApp";
import { PRODUCTS } from "./data/products";

import {
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
  Navigate
} from "react-router-dom";

/* ------------------ localStorage keys ------------------ */
const CART_KEY = "estore_cart_v1";
const WISHLIST_KEY = "estore_wishlist_v1";
const USERS_KEY = "estore_users_v1";
const AUTH_KEY = "estore_auth_v1";

const saveCart = (cart) =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveWishlist = (wl) =>
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl || []));
const readWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
};
const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveUsers = (u) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(u || []));
const readAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
};
const saveAuth = (a) =>
  localStorage.setItem(AUTH_KEY, JSON.stringify(a || null));

/* ------------------ Category images & mapping ------------------ */
const CATEGORY_IMAGES = {
  electronics: "electronics.jpg",
  fashion: "fashion3.jpg",
  home: [
    "kitchen1.jpg",
    "kitchen2.jpg",
    "home1.jpg",
    "home2.jpg",
    "home4.jpg",
    "home.jpg"
  ],
  beauty: "beauty.jpg",
  toys: "toys.jpg",
  sports: [
    "sports1.jpg",
    "sports2.jpg",
    "sports3.jpg",
    "sports4.jpg",
    "sports.jpg"
  ],
  laptops: "laptops.webp",
  grocery: [
    "grocery1.jpg",
    "grocery2.jpg",
    "grocery3.jpg",
    "grocery4.jpg",
    "Grocery.jpg"
  ],
  "tvs & appliances": [
    "tv1.jpg",
    "tv2.jpg",
    "tv3.jpg",
    "appliance1.jpg",
    "appliance2.jpg",
    "TVs & Appliances.jpg"
  ],
  "mobile & tablets": "Mobiles & Tablets.jpg",
  "mobiles & tablets": "Mobiles & Tablets.jpg"
};

/* SafeImage */
function SafeImage({
  candidates = [],
  alt = "",
  className = "",
  width,
  height,
  ...rest
}) {
  const [idx, setIdx] = useState(0);
  const list = Array.isArray(candidates) ? candidates : [candidates];
  const src = list[idx] || "";
  const onErr = () => {
    if (idx < list.length - 1) setIdx((i) => i + 1);
  };
  useEffect(() => {
    setIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(candidates)]);
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

/* All categories used in header */
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

const CATEGORY_SLUG_TO_NAME = Object.fromEntries(
  ALL_CATEGORIES.map((c) => [c.key, c.label])
);
CATEGORY_SLUG_TO_NAME["mobile & tablets"] =
  CATEGORY_SLUG_TO_NAME["mobiles & tablets"] || "Mobiles & Tablets";
CATEGORY_SLUG_TO_NAME["mobiles & tablets"] =
  CATEGORY_SLUG_TO_NAME["mobiles & tablets"] || "Mobiles & Tablets";
CATEGORY_SLUG_TO_NAME["tvs & appliances"] =
  CATEGORY_SLUG_TO_NAME["tvs & appliances"] || "TVs & Appliances";
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
CATEGORY_SLUG_TO_NAMES["toys"] = Array.from(
  new Set([...(CATEGORY_SLUG_TO_NAMES["toys"] || []), "Sports"])
);
CATEGORY_SLUG_TO_NAMES["toys & baby"] = CATEGORY_SLUG_TO_NAMES["toys"];
CATEGORY_SLUG_TO_NAMES["sports"] = Array.from(
  new Set([...(CATEGORY_SLUG_TO_NAMES["sports"] || []), "Sports"])
);
CATEGORY_SLUG_TO_NAMES["sports & fitness"] = CATEGORY_SLUG_TO_NAMES["sports"];
CATEGORY_SLUG_TO_NAMES["grocery"] =
  CATEGORY_SLUG_TO_NAMES["grocery"] || ["Grocery"];
CATEGORY_SLUG_TO_NAMES["tvs & appliances"] =
  CATEGORY_SLUG_TO_NAMES["tvs & appliances"] || ["TVs & Appliances"];

/* ------------------ Auth context ------------------ */
const AuthContext = createContext();
function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readAuth());

  useEffect(() => {
    saveAuth(user);
  }, [user]);

  const signup = ({ name, email, password }) => {
    const users = readUsers();
    if (!name || !email || !password) throw new Error("All fields required");
    if (users.find((u) => u.email === email))
      throw new Error("User already exists");
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      orders: []
    };
    users.push(newUser);
    saveUsers(users);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
  };

  const login = ({ email, password }) => {
    const users = readUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Invalid credentials");
    setUser({ id: found.id, name: found.name, email: found.email });
  };

  const logout = () => {
    setUser(null);
    saveAuth(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------ Header ------------------ */
function Header({ onSearch, cart, wishlist }) {
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

  const cartCount =
    (cart && cart.reduce((s, c) => s + (c.qty || 0), 0)) || 0;
  const wishlistCount = wishlist ? wishlist.length : 0;

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-blue-600">
          E-Store
        </Link>

        {/* All Categories dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenCats((s) => !s);
              setOpenAccount(false);
            }}
            className="text-sm px-3 py-1 border rounded flex items-center gap-2"
          >
            All Categories ▾
          </button>

          {openCats && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded shadow-lg border p-3 z-50">
              <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.key}
                    to={`/category/${encodeURIComponent(cat.key)}`}
                    onClick={() => setOpenCats(false)}
                    className="block text-sm px-2 py-1 hover:bg-gray-50 rounded"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <form onSubmit={submit} className="flex-1">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands..."
              className="w-full border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded px-4 py-1 text-sm">
              Search
            </button>
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="text-sm px-3 py-1 border rounded flex items-center gap-2"
          >
            Wishlist
            {wishlistCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-pink-500 text-white rounded">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative text-sm px-3 py-1 border rounded flex items-center gap-2"
          >
            Cart
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded">
              {cartCount}
            </span>
          </Link>

          {/* My Account dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenAccount((s) => !s);
                setOpenCats(false);
              }}
              className="text-sm px-3 py-1 border rounded flex items-center gap-2"
            >
              My Account ▾
            </button>

            {openAccount && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg border p-4 z-50">
                {user ? (
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                    <div className="mt-3 space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setOpenAccount(false)}
                        className="block text-sm px-3 py-2 hover:bg-gray-50 rounded"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setOpenAccount(false)}
                        className="block text-sm px-3 py-2 hover:bg-gray-50 rounded"
                      >
                        Orders
                      </Link>
                      <Link
                        to="/account/settings"
                        onClick={() => setOpenAccount(false)}
                        className="block text-sm px-3 py-2 hover:bg-gray-50 rounded"
                      >
                        Account settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setOpenAccount(false);
                        }}
                        className="w-full text-left text-sm px-3 py-2 border rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm">Not signed in</div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/login"
                        onClick={() => setOpenAccount(false)}
                        className="px-3 py-1 border rounded"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setOpenAccount(false)}
                        className="px-3 py-1 bg-white text-blue-600 rounded"
                      >
                        Signup
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top category strip with images */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-3">
            {TOP_CATEGORIES.map((key) => {
              const label = CATEGORY_SLUG_TO_NAME[key] || key;
              const entry = CATEGORY_IMAGES[key];
              const candidates = Array.isArray(entry)
                ? entry.map((f) => `/images/${f}`)
                : [`/images/${entry || `${key}.jpg`}`, `/images/${key}.jpg`];
              if (!candidates.includes("/images/category-1.jpg"))
                candidates.push("/images/category-1.jpg");
              return (
                <Link
                  key={key}
                  to={`/category/${encodeURIComponent(key)}`}
                  className="min-w-[110px] text-center"
                >
                  <div className="h-14 w-14 rounded bg-white overflow-hidden shadow-sm mx-auto mb-2">
                    <SafeImage
                      candidates={candidates}
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-700">{label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------ Home & product components ------------------ */
function Home({ products, onAddToCart, searchQuery }) {
  const [filtered, setFiltered] = useState(products);
  useEffect(() => {
    if (!searchQuery) setFiltered(products);
    else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, products]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <div className="rounded overflow-hidden shadow">
            <img
              src="/images/hero.jpg"
              alt="hero"
              className="w-full h-96 object-cover rounded"
              loading="eager"
            />
          </div>
        </div>

        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded overflow-hidden shadow">
            <img
              src="/images/vendor-1.jpg"
              alt="promo"
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="bg-white rounded shadow p-4">
            <h4 className="font-semibold">Hot Offers</h4>
            <p className="text-sm text-gray-600 mt-1">
              Use code SAVE20 on checkout
            </p>
          </div>
        </aside>
      </div>
      <section id="deals" className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold">Top Deals</h3>
          <Link to="/products" className="text-sm text-blue-600">
            See all
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded shadow">
            No products found for "<strong>{searchQuery}</strong>"
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------ Product card (with wishlist heart) ------------------ */
function ProductCard({ product, onAddToCart }) {
  const toggleWishlist = () => {
    window.dispatchEvent(
      new CustomEvent("toggle-wishlist", { detail: product })
    );
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      {/* Image + heart icon */}
      <div className="relative h-44 bg-gray-50 flex items-center justify-center">
        <Link
          to={`/product/${product.id}`}
          className="flex items-center justify-center w-full h-full"
        >
          <SafeImage
            candidates={[product.image, "/images/category-1.jpg"]}
            alt={product.title}
            width="200"
            height="160"
            className="max-h-full max-w-full object-contain"
          />
        </Link>

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border hover:bg-pink-50 hover:border-pink-500 transition"
          aria-label="Toggle wishlist"
        >
          <span className="text-pink-500 text-sm">♡</span>
        </button>
      </div>

      {/* Text + actions */}
      <div className="p-4 flex-1 flex flex-col">
        <Link
          to={`/product/${product.id}`}
          className="font-medium hover:underline line-clamp-2"
        >
          {product.title}
        </Link>

        <div className="mt-2 text-lg font-semibold">₹{product.price}</div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="text-xs border px-3 py-1 rounded bg-yellow-300/80 hover:bg-yellow-400 font-medium"
          >
            Add to cart
          </button>

          <Link
            to={`/product/${product.id}`}
            className="text-xs text-blue-600 hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const pid = Number(id);
  const product = PRODUCTS.find((p) => p.id === pid);
  if (!product)
    return <div className="max-w-3xl mx-auto p-6">Product not found</div>;
  const similar = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== pid
  ).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded shadow p-4">
          <SafeImage
            candidates={[product.image, "/images/category-1.jpg"]}
            alt={product.title}
            width="600"
            height="480"
            className="w-full h-96 object-contain"
          />
          <h2 className="text-2xl font-semibold mt-4">{product.title}</h2>
          <div className="text-lg font-bold mt-2">₹{product.price}</div>
          <p className="mt-4 text-gray-700">
            Category: <strong>{product.category}</strong>
          </p>
          <div className="mt-6 flex gap-3 items-center flex-wrap">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="bg-yellow-400 px-5 py-2 rounded font-semibold"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("toggle-wishlist", { detail: product })
                )
              }
              className="w-9 h-9 flex items-center justify-center rounded-full border hover:bg-pink-50 hover:border-pink-400 transition"
              aria-label="Toggle wishlist"
            >
              <span className="text-base">♡</span>
            </button>
            <button type="button" className="px-5 py-2 border rounded">
              Buy now
            </button>
          </div>
        </div>

        <aside className="bg-white rounded shadow p-4">
          <h4 className="font-semibold">Similar products</h4>
          <div className="mt-3 space-y-3">
            {similar.length === 0 ? (
              <div className="text-sm text-gray-500">
                No similar products
              </div>
            ) : (
              similar.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <SafeImage
                    candidates={[s.image, "/images/category-1.jpg"]}
                    alt={s.title}
                    width="64"
                    height="64"
                    className="w-16 h-16 object-contain bg-gray-100 p-2 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-gray-500">₹{s.price}</div>
                  </div>
                  <Link
                    to={`/product/${s.id}`}
                    className="ml-auto text-xs text-blue-600"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------ Product list pages ------------------ */
function ProductsPage({ products, onAddToCart }) {
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
        <div className="p-6 bg-white rounded shadow">
          No products available
        </div>
      ) : (
        ordered.map((cat) => (
          <section key={cat} className="mb-8">
            <h3 className="text-xl font-semibold mb-3">{cat}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groups[cat].map((p) => (
                <ProductCard
                  key={p.id + "-" + cat}
                  product={p}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function CategoryPage({ onAddToCart }) {
  const { name } = useParams();
  const slug = decodeURIComponent(name || "").toLowerCase();
  const mapped =
    CATEGORY_SLUG_TO_NAMES[slug] || [CATEGORY_SLUG_TO_NAME[slug] || slug];
  const lowered = mapped.map((m) => String(m).toLowerCase());
  const list = PRODUCTS.filter((p) =>
    lowered.includes((p.category || "").toLowerCase())
  );
  const headingLabel = mapped.map((m) => String(m)).join(" & ");
  const heading = headingLabel ? headingLabel.toUpperCase() : "Category";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-2">{heading}</h2>
      {mapped.length > 1 && (
        <div className="text-sm text-gray-500 mb-4">
          Includes items from: {mapped.join(", ")}
        </div>
      )}
      {list.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">
          No items in this category
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------ Search / Wishlist / misc pages ------------------ */
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function SearchResults({ products, onAddToCart }) {
  const q = useQuery().get("q") || "";
  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">
        Search results for "{q}"
      </h2>
      {filtered.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">No results</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistPage({ wishlist, setWishlist, onAddToCart }) {
  const remove = (id) =>
    setWishlist((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveWishlist(next);
      return next;
    });
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
      {!wishlist || wishlist.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">
          Your wishlist is empty
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((p) => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <SafeImage
                candidates={[p.image, "/images/category-1.jpg"]}
                alt={p.title}
                className="w-full h-40 object-contain mb-3"
              />
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-500">₹{p.price}</div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAddToCart(p)}
                  className="px-3 py-1 bg-yellow-300/80 border rounded text-xs"
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="px-3 py-1 border rounded text-xs"
                >
                  Remove
                </button>
                <Link
                  to={`/product/${p.id}`}
                  className="px-3 py-1 border rounded text-blue-600 text-xs"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <p className="mt-3 text-gray-700">
        Brand page showing products from {name}.
      </p>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold">Account Settings</h2>
      <p className="mt-3 text-gray-700">
        Manage your account details here.
      </p>
    </div>
  );
}

/* ------------------ Cart (new layout) ------------------ */
function CartPage({ cart, setCart }) {
  const updateQty = (id, qty) => {
    setCart((prev) => {
      const next = prev
        .map((it) => (it.id === id ? { ...it, qty } : it))
        .filter((it) => it.qty > 0);
      saveCart(next);
      return next;
    });
  };

  const remove = (id) =>
    setCart((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCart(next);
      return next;
    });

  const total = (cart || []).reduce(
    (s, c) => s + c.price * c.qty,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Your cart</h2>

      {!cart || cart.length === 0 ? (
        <div className="p-8 bg-white rounded shadow text-center">
          Your cart is empty
        </div>
      ) : (
        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          {/* Items */}
          <div className="bg-white rounded shadow p-4 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b last:border-b-0 pb-4 last:pb-0"
              >
                <SafeImage
                  candidates={[item.image, "/images/category-1.jpg"]}
                  alt={item.title}
                  width="80"
                  height="80"
                  className="w-20 h-20 object-contain bg-gray-100 p-2 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">
                    ₹{item.price}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(
                          item.id,
                          Math.max(1, Number(e.target.value))
                        )
                      }
                      className="w-20 border rounded p-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="w-28 text-right font-semibold">
                  ₹{item.qty * item.price}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded shadow p-4 h-fit">
            <h3 className="text-lg font-semibold mb-3">
              Order summary
            </h3>
            <div className="flex justify-between text-sm mb-2">
              <span>Items ({cart.length})</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-3 mt-2">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-4 block text-center bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ ProtectedRoute ------------------ */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ------------------ Auth pages ------------------ */
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    try {
      login(form);
      navigate("/profile");
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm">Email</label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Login
            </button>
            <Link
              to="/signup"
              className="px-4 py-2 border rounded"
            >
              Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    try {
      signup(form);
      navigate("/profile");
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Create account
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm">Full name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Signup
            </button>
            <Link
              to="/login"
              className="px-4 py-2 border rounded"
            >
              Have account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------ Profile / Orders ------------------ */
function Profile() {
  const { user } = useAuth();
  const users = readUsers();
  const cur = users.find((u) => u.id === user.id) || user;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <div className="bg-white rounded shadow p-6">
        <div>
          <strong>Name:</strong> {cur.name}
        </div>
        <div className="mt-2">
          <strong>Email:</strong> {cur.email}
        </div>
        <div className="mt-4">
          <Link to="/orders" className="text-blue-600">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const { user } = useAuth();
  const users = readUsers();
  const cur = users.find((u) => u.id === user.id);
  const orders = (cur && cur.orders) || [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded shadow p-6">
          You have no orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded shadow p-4"
            >
              Order #{o.id} - ₹{o.total}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------ Checkout ------------------ */
function Checkout() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const cart = readCart();
  const total = cart.reduce(
    (s, c) => s + c.price * (c.qty || 1),
    0
  );
  const navigate = useNavigate();

  const placeOrder = () => {
    if (!user) {
      if (window.showEstoreToast)
        window.showEstoreToast("Please login first");
      else alert("Please login first");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const users = readUsers();
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) {
        const order = {
          id: Date.now(),
          items: cart,
          total,
          placedAt: new Date().toISOString()
        };
        users[idx].orders = users[idx].orders || [];
        users[idx].orders.push(order);
        saveUsers(users);
        localStorage.removeItem(CART_KEY);
        if (window.showEstoreToast)
          window.showEstoreToast(
            "Order placed! Order id: " + order.id
          );
        else alert("Order placed! Order id: " + order.id);
        navigate("/");
      } else {
        if (window.showEstoreToast)
          window.showEstoreToast("User not found");
        else alert("User not found");
      }
      setProcessing(false);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <div className="bg-white rounded shadow p-6">
        <div className="mb-4">
          Total: <strong>₹{total}</strong>
        </div>
        <button
          type="button"
          onClick={placeOrder}
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {processing ? "Processing..." : "Place order"}
        </button>
      </div>
    </div>
  );
}

/* ------------------ Misc pages ------------------ */
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
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <div className="text-xl font-bold">E-Store</div>
          <div className="text-sm mt-2">
            Fast delivery & easy returns.
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="text-sm space-y-1">
            <li>
              <Link to="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Help</div>
          <ul className="text-sm space-y-1">
            <li>
              <Link to="/faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:underline">
                Support
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-sm">support@estore.example</div>
        </div>
      </div>
      <div className="text-center text-xs py-4 border-t border-gray-800">
        © {new Date().getFullYear()} E-Store
      </div>
    </footer>
  );
}

function BlogList() {
  const posts = [
    {
      id: "1",
      title: "How to choose the best headphones",
      excerpt: "Short guide to picking headphones for every budget."
    },
    {
      id: "2",
      title: "Top 10 gadgets this year",
      excerpt: "A roundup of the most useful gadgets of the year."
    }
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid gap-4">
        {posts.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.id}`}
            className="block bg-white rounded shadow p-4 hover:shadow-md"
          >
            <div className="text-xl font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600 mt-1">
              {p.excerpt}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BlogPost() {
  const { id } = useParams();
  const content = {
    1: "Full article about headphones...",
    2: "Full article about top gadgets..."
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{`Post ${id}`}</h1>
      <div className="prose max-w-none">
        {content[id] || "Post not found"}
      </div>
    </div>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "How long does delivery take?",
      a: "Delivery usually takes 3-7 business days."
    },
    {
      q: "What is your return policy?",
      a: "30-day returns on unused items."
    }
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
      <p className="mt-3 text-gray-700">
        Standard terms for using the demo store.
      </p>
    </div>
  );
}

function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-gray-700">
        We respect your privacy — this site stores demo data only.
      </p>
    </div>
  );
}

function Careers() {
  const jobs = [
    { id: "frontend", title: "Frontend Developer" },
    { id: "support", title: "Customer Support" }
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Careers</h1>
      <p className="text-gray-700 mb-4">
        Join our team — remote friendly.
      </p>
      <div className="grid gap-4">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white rounded shadow p-4">
            <div className="font-semibold">{j.title}</div>
            <div className="text-sm text-gray-600 mt-2">
              <Link to="/contact" className="text-blue-600">
                Apply via contact
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Support</h1>
      <p className="mt-3 text-gray-700">
        Email us at support@estore.example or use the contact page.
      </p>
    </div>
  );
}

/* ------------------ Conditional Header/Footer ------------------ */
function ConditionalHeader({ onSearch, cart, wishlist }) {
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <Header
      onSearch={onSearch}
      cart={cart}
      wishlist={wishlist}
    />
  );
}

function ConditionalFooter() {
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  return <Footer />;
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
      try {
        delete window.showEstoreToast;
      } catch {}
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const p = e.detail;
      setWishlist((prev) => {
        const exists = prev.find((i) => i.id === p.id);
        const next = exists
          ? prev.filter((i) => i.id !== p.id)
          : [...prev, p];
        saveWishlist(next);
        if (window.showEstoreToast)
          window.showEstoreToast(
            exists ? "Removed from wishlist" : "Added to wishlist"
          );
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
      if (existing) {
        next = prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        next = [...prev, { ...product, qty: 1 }];
      }
      saveCart(next);
      return next;
    });
    setToast(`${product.title} added to cart`);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <AuthProvider>
      <ConditionalHeader
        onSearch={(q) => setSearchQuery(q)}
        cart={cart}
        wishlist={wishlist}
      />

      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div className="bg-black text-white px-4 py-2 rounded shadow">
            {toast}
          </div>
        </div>
      )}

      <Routes>
        {/* Admin panel */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Main site */}
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
          element={
            <ProductsPage
              products={products}
              onAddToCart={onAddToCart}
            />
          }
        />
        <Route
          path="/search"
          element={
            <SearchResults
              products={products}
              onAddToCart={onAddToCart}
            />
          }
        />
        <Route
          path="/product/:id"
          element={<ProductDetail onAddToCart={onAddToCart} />}
        />
        <Route
          path="/category/:name"
          element={<CategoryPage onAddToCart={onAddToCart} />}
        />
        <Route
          path="/cart"
          element={<CartPage cart={cart} setCart={setCart} />}
        />
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
        <Route
          path="/account/settings"
          element={<AccountSettings />}
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />

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
