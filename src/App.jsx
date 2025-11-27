// src/App.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
// add import
import AdminApp from "./admin/AdminApp";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";

/*
  Full single-file React app (updated header):
  - Home, Products, Category, Product detail, Cart, Checkout
  - Login, Signup, Profile, Orders (auth via localStorage)
  - Add to cart (localStorage)
  - Header now has an "All Categories" dropdown (with images) and a "My Account" dropdown that shows account details and links.
*/

/* ------------------ Utilities: localStorage keys ------------------ */
const CART_KEY = "estore_cart_v1";
const WISHLIST_KEY = "estore_wishlist_v1";
const USERS_KEY = "estore_users_v1";
const AUTH_KEY = "estore_auth_v1";

const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
const readCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
};
const saveWishlist = (wl) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl || []));
const readWishlist = () => { try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch { return []; } };
const readUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
};
const saveUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u || []));
const readAuth = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
};
const saveAuth = (a) => localStorage.setItem(AUTH_KEY, JSON.stringify(a || null));

/* ------------------ Sample products (update images as needed) ------------------ */
const PRODUCTS = [
  { id: 1, title: "Wireless Headphones", price: 1499, category: "Electronics", image: "/images/product 1.jpg" },
  { id: 2, title: "Smart Watch", price: 2499, category: "Electronics", image: "/images/product 2.jpg" },
  { id: 3, title: "Bluetooth Speaker", price: 1899, category: "Electronics", image: "/images/product 3.jpg" },
  { id: 4, title: "Gaming Mouse", price: 999, category: "Electronics", image: "/images/product 4.jpg" },
  // Boys Trouser, T-Shirt, and Saree products are not part of Electronics
  { id: 5, title: "Mobile", price: 9999, category: "Mobiles & Tablets", image: "/images/mobile.jpg" },
  { id: 5, title: "Mobile", price: 10999, category: "Mobiles & Tablets", image: "/images/mobile1.jpg" },
  { id: 5, title: "Mobile", price: 8999, category: "Mobiles & Tablets", image: "/images/mobile2.jpg" },
  { id: 5, title: "Mobile", price: 15999, category: "Mobiles & Tablets", image: "/images/mobile3.jpg" },
  { id: 5, title: "Mobile", price: 20999, category: "Mobiles & Tablets", image: "/images/mobile4.jpg" },
  { id: 5, title: "Mobile", price: 22999, category: "Mobiles & Tablets", image: "/images/mobile5.jpg" },

  { id: 5, title: "Tablet", price: 50999, category: "Mobiles & Tablets", image: "/images/tablet1.jpg" },
  { id: 5, title: "Tablet", price: 60999, category: "Mobiles & Tablets", image: "/images/tablet2.jpg" },
  { id: 5, title: "Tablet", price: 49999, category: "Mobiles & Tablets", image: "/images/tablet3.jpg" },
  { id: 5, title: "Tablet", price: 70999, category: "Mobiles & Tablets", image: "/images/tablet4.jpg" },
  { id: 5, title: "Tablet", price: 30999, category: "Mobiles & Tablets", image: "/images/tablet5.jpg" },

  { id: 5, title: "Kitchen", price: 30999, category: "Home & Kitchen", image: "/images/kitchen1.jpg" },
  { id: 5, title: "Kitchen", price: 30999, category: "Home & Kitchen", image: "/images/kitchen2.jpg" },
  { id: 5, title: "Kitchen", price: 30999, category: "Home & Kitchen", image: "/images/kitchen3.jpg" },
  { id: 5, title: "Kitchen", price: 30999, category: "Home & Kitchen", image: "/images/kitchen4.jpg" },
  { id: 5, title: "Kitchen", price: 30999, category: "Home & Kitchen", image: "/images/kitchen5.jpg" },

  { id: 5, title: "Boys Trouser", price: 299, category: "Fashion", image: "/images/Fashion5.jpg" },
  { id: 6, title: "T-Shirt", price: 999, category: "Fashion", image: "/images/Fashion-1.jpg" },
  { id: 5, title: "Saree", price: 1299, category: "Fashion", image: "/images/Fashion4.jpg" },
  { id: 5, title: "Saree", price: 3299, category: "Fashion", image: "/images/Fashion6.jpg" },
  { id: 5, title: "Saree", price: 2299, category: "Fashion", image: "/images/Fashion7.jpg" },
  { id: 5, title: "Saree", price: 4299, category: "Fashion", image: "/images/Fashion8.jpg" },
  { id: 5, title: "Saree", price: 2999, category: "Fashion", image: "/images/Fashion9.jpg" },
  { id: 7, title: "Coffee Maker", price: 2999, category: "Home", image: "/images/product 7.jpg" },


  { id: 21, title: "Robot Toy", price: 899, category: "Toys", image: "/images/toys.jpg" },
  { id: 22, title: "Toy Car", price: 99, category: "Toys", image: "/images/toy2.jpg" },
  { id: 23, title: "Building Blocks", price: 89, category: "Toys", image: "/images/toy3.jpg" },
  { id: 24, title: "Doll", price: 80, category: "Toys", image: "/images/toy4.jpg" },
  { id: 25, title: "Puzzle Game", price: 109, category: "Toys", image: "/images/toy5.jpg" },
  { id: 26, title: "Action Figure", price: 100, category: "Toys", image: "/images/toy6.jpg" },
  { id: 27, title: "RC Helicopter", price: 150, category: "Toys", image: "/images/toy7.jpg" },
  { id: 28, title: "Board Game", price: 120, category: "Toys", image: "/images/toy8.jpg" },

  { id: 29, title: "Fitness Band", price: 999, category: "Sports", image: "/images/sports1.jpg" },
  { id: 30, title: "Dumbbell Set", price: 1299, category: "Sports", image: "/images/sports2.jpg" },
  { id: 31, title: "Exercise Bike", price: 2110, category: "Sports", image: "/images/sports3.jpg" },
  { id: 32, title: "Treadmill", price: 1510, category: "Sports", image: "/images/sports4.jpg" },
  { id: 33, title: "Skipping Rope", price: 199, category: "Sports", image: "/images/sports.jpg" },
  { id: 34, title: "Resistance Bands", price: 520, category: "Sports", image: "/images/sports.jpg" },
  
  // Grocery products
  { id: 35, title: "Basmati Rice 5kg", price: 399, category: "Grocery", image: "/images/grocery1.jpg" },
  { id: 36, title: "Wheat Flour 1kg", price: 49, category: "Grocery", image: "/images/grocery2.jpg" },
  { id: 37, title: "Sugar 1kg", price: 56, category: "Grocery", image: "/images/grocery3.jpg" },
  { id: 38, title: "Cooking Oil 1L", price: 199, category: "Grocery", image: "/images/grocery4.jpg" },
  { id: 39, title: "Salt 1kg", price: 20, category: "Grocery", image: "/images/grocery5.jpg"},
  { id: 40, title: "Tea 250g", price: 149, category: "Grocery", image: "/images/grocery6.jpg" },
  { id: 41, title: "Instant Noodles (Pack)", price: 30, category: "Grocery", image: "/images/grocery7.jpg" },
  { id: 42, title: "Biscuits Family Pack", price: 99, category: "Grocery", image: "/images/grocery8.jpg" },

  { id: 9, title: "Face Moisturizer", price: 799, category: "Beauty", image: "/images/beauty.jpg" },
  { id: 10, title: "Perfume Spray", price: 1499, category: "Beauty", image: "/images/perfume.jpg" },
  { id: 10, title: "Sunscreen", price: 199, category: "Beauty", image: "/images/beat1.jpg" },
  { id: 10, title: "Face Serum", price: 499, category: "Beauty", image: "/images/beat2.jpg" },
  { id: 10, title: "Moisturizor", price: 299, category: "Beauty", image: "/images/beat3.jpg" },
  { id: 10, title: "Cream", price: 499, category: "Beauty", image: "/images/beat4.jpg" },
  { id: 10, title: "Brush", price: 149, category: "Beauty", image: "/images/beat5.jpg" },
  { id: 10, title: "Mackup", price: 1499, category: "Beauty", image: "/images/beat6.jpg" },
  { id: 10, title: "Hair Color", price: 99, category: "Beauty", image: "/images/beat7.jpg" },

  { id: 11, title: "Yoga Mat", price: 599, category: "Sports", image: "/images/yoga mat.jpg" },
  { id: 12, title: "Water Bottle", price: 299, category: "Sports", image: "/images/water bottel.jpg" },
  { id: 12, title: "Laptop", price: 55599, category: "Laptops", image: "/images/Laptop1.jpg" },
  { id: 12, title: "Laptop", price: 45599, category: "Laptops", image: "/images/Laptop2.jpg" },
  { id: 12, title: "Laptop", price: 69999, category: "Laptops", image: "/images/Laptop3.jpg" },
  { id: 12, title: "Laptop", price: 55500, category: "Laptops", image: "/images/Laptop4.jpg" },
  { id: 12, title: "Laptop", price: 75599, category: "Laptops", image: "/images/Laptop5.jpg" },
  { id: 12, title: "Laptop", price: 55599, category: "Laptops", image: "/images/Laptop6.jpg" },
  { id: 12, title: "Laptop", price: 65599, category: "Laptops", image: "/images/Laptop7.jpg" },
  
  // TVs & Appliances products
  { id: 43, title: "42\" Smart LED TV", price: 24999, category: "TVs & Appliances", image: "/images/tv1.jpg" },
  { id: 44, title: "55\" 4K Smart TV", price: 49999, category: "TVs & Appliances", image: "/images/tv2.jpg" },
  { id: 45, title: "Soundbar System", price: 7999, category: "TVs & Appliances", image: "/images/appliance1.jpg" },
  { id: 46, title: "Microwave Oven", price: 5999, category: "TVs & Appliances", image: "/images/appliance2.jpg" },
  { id: 47, title: "Air Fryer", price: 3999, category: "TVs & Appliances", image: "/images/appliance3.jpg" },
  { id: 48, title: "Refrigerator 200L", price: 21999, category: "TVs & Appliances", image: "/images/appliance4.jpg" },
  { id: 49, title: "Washing Machine 6kg", price: 17999, category: "TVs & Appliances", image: "/images/appliance5.jpg" },
  { id: 50, title: "LED TV Wall Mount", price: 1199, category: "TVs & Appliances", image: "/images/tv3.jpg" },
];

// Map category key -> image filename (override defaults when needed)
const CATEGORY_IMAGES = {
  electronics: 'electronics.jpg',
  // normalized to use plural 'mobiles & tablets' below
  fashion: 'fashion3.jpg',
  // prefer kitchen images when available; fall back to existing home images
  home: ['kitchen1.jpg','kitchen2.jpg','home1.jpg','home2.jpg','home4.jpg','home.jpg'],
  beauty: 'beauty.jpg',
  toys: 'toys.jpg',
  // sport image candidates (prefer existing sports images)
  sports: ['sports1.jpg','sports2.jpg','sports3.jpg','sports4.jpg','sports.jpg'],
  laptops: 'laptops.webp',
  grocery: ['grocery1.jpg','grocery2.jpg','grocery3.jpg','grocery4.jpg','Grocery.jpg'],
  'tvs & appliances': ['tv1.jpg','tv2.jpg','tv3.jpg','appliance1.jpg','appliance2.jpg','TVs & Appliances.jpg'],
  // support both 'mobile & tablets' and 'mobiles & tablets' keys
  'mobile & tablets': 'Mobiles & Tablets.jpg',
  'mobiles & tablets': 'Mobiles & Tablets.jpg',

};

/* ------------------ SafeImage helper ------------------ */
function SafeImage({ candidates = [], alt = '', className = '', width, height, ...rest }) {
  const [idx, setIdx] = React.useState(0);
  const list = Array.isArray(candidates) ? candidates : [candidates];
  const src = list[idx] || '';
  const onErr = () => {
    if (idx < list.length - 1) setIdx(i => i + 1);
  };
  // ensure we reset if candidates change
  React.useEffect(() => { setIdx(0); }, [candidates]);
  return (
    <img src={encodeURI(src || '')} alt={alt} className={className} width={width} height={height} onError={onErr} {...rest} />
  );
}

// Comprehensive category list (slugs used as keys)
const ALL_CATEGORIES = [
  { key: 'mobiles & tablets', label: 'Mobiles & Tablets' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'computers', label: 'Computers & Accessories' },
  { key: 'tvs & appliances', label: 'TVs & Appliances' },
  { key: 'home', label: 'Home & Kitchen' },
  { key: 'laptops', label: 'Laptops' },
  { key: 'furniture', label: 'Furniture' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'kids', label: 'Kids' },
  { key: 'beauty', label: 'Beauty & Personal Care' },
  { key: 'health', label: 'Health & Household' },
  { key: 'sports', label: 'Sports & Fitness' },
  { key: 'toys', label: 'Toys & Baby' },
  { key: 'books', label: 'Books' },
  { key: 'movies', label: 'Movies, Music & Games' },
  { key: 'automotive', label: 'Automotive' },
  { key: 'pet', label: 'Pet Supplies' },
  { key: 'office', label: 'Office Products' },
  { key: 'jewelry', label: 'Jewelry & Accessories' },
  { key: 'watches', label: 'Watches' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'luggage', label: 'Luggage & Bags' },
  { key: 'garden', label: 'Garden & Outdoors' },
  { key: 'tools', label: 'Tools & Home Improvement' },
  { key: 'musical', label: 'Musical Instruments' },
  { key: 'cameras', label: 'Cameras & Photography' },
  { key: 'software', label: 'Software' },
  { key: 'smart-home', label: 'Smart Home' },
  { key: 'appliances', label: 'Large Appliances' },
];

// Map URL slug -> canonical product category name (generated from ALL_CATEGORIES).
// This keeps a single source of truth so category slugs used in the header match
// the canonical product category names used in `PRODUCTS`.
const CATEGORY_SLUG_TO_NAME = Object.fromEntries(ALL_CATEGORIES.map(c => [c.key, c.label]));
// add common alias keys and ensure canonical casing where products expect it
CATEGORY_SLUG_TO_NAME['mobile & tablets'] = CATEGORY_SLUG_TO_NAME['mobiles & tablets'] || 'Mobiles & Tablets';
CATEGORY_SLUG_TO_NAME['mobiles & tablets'] = CATEGORY_SLUG_TO_NAME['mobiles & tablets'] || 'Mobiles & Tablets';
CATEGORY_SLUG_TO_NAME['tvs & appliances'] = CATEGORY_SLUG_TO_NAME['tvs & appliances'] || 'TVs & Appliances';
// some product objects use the short category 'Beauty' — add alias so
// /category/beauty shows products categorized as 'Beauty'
CATEGORY_SLUG_TO_NAME['beauty'] = 'Beauty';
// likewise map 'home' slug to short product category 'Home' when needed
CATEGORY_SLUG_TO_NAME['home'] = CATEGORY_SLUG_TO_NAME['home'] || 'Home';
// ensure 'toys' and 'toys & baby' slugs resolve to the short product category 'Toys'
CATEGORY_SLUG_TO_NAME['toys'] = 'Toys';
CATEGORY_SLUG_TO_NAME['toys & baby'] = 'Toys';

// Top categories shown in the header strip (use slugs from ALL_CATEGORIES)
const TOP_CATEGORIES = ['electronics','mobiles & tablets','laptops','fashion','home','beauty','toys','sports','grocery','tvs & appliances'];

// Support mapping a slug to multiple canonical product category names.
// This allows e.g. the "toys" slug to show both Toys and Sports items.
const CATEGORY_SLUG_TO_NAMES = {};
Object.keys(CATEGORY_SLUG_TO_NAME).forEach(k => {
  const v = CATEGORY_SLUG_TO_NAME[k];
  CATEGORY_SLUG_TO_NAMES[k] = Array.isArray(v) ? v : [v];
});
// Make toys include sports items as requested
CATEGORY_SLUG_TO_NAMES['toys'] = Array.from(new Set([...(CATEGORY_SLUG_TO_NAMES['toys'] || []), 'Sports']));
CATEGORY_SLUG_TO_NAMES['toys & baby'] = CATEGORY_SLUG_TO_NAMES['toys'];
// ensure 'sports' slug includes short product category 'Sports' so products with
// `category: "Sports"` will appear under the Sports & Fitness page.
CATEGORY_SLUG_TO_NAMES['sports'] = Array.from(new Set([...(CATEGORY_SLUG_TO_NAMES['sports'] || []), 'Sports']));
CATEGORY_SLUG_TO_NAMES['sports & fitness'] = CATEGORY_SLUG_TO_NAMES['sports'];
// ensure grocery slug maps to canonical 'Grocery'
CATEGORY_SLUG_TO_NAMES['grocery'] = CATEGORY_SLUG_TO_NAMES['grocery'] || ['Grocery'];
// ensure tvs & appliances slug maps to canonical 'TVs & Appliances'
CATEGORY_SLUG_TO_NAMES['tvs & appliances'] = CATEGORY_SLUG_TO_NAMES['tvs & appliances'] || ['TVs & Appliances'];

/* ------------------ Auth context ------------------ */
const AuthContext = createContext();
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readAuth());

  useEffect(() => {
    saveAuth(user);
  }, [user]);

  const signup = ({ name, email, password }) => {
    const users = readUsers();
    if (!name || !email || !password) throw new Error("All fields required");
    if (users.find(u => u.email === email)) throw new Error("User already exists");
    const newUser = { id: Date.now(), name, email, password, createdAt: new Date().toISOString(), orders: [] };
    users.push(newUser);
    saveUsers(users);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
  };

  const login = ({ email, password }) => {
    const users = readUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");
    setUser({ id: found.id, name: found.name, email: found.email });
  };

  const logout = () => { setUser(null); saveAuth(null); };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------ Header (updated) ------------------ */
function Header({ onSearch, cart }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // use the comprehensive category list for the dropdown
  const categories = ALL_CATEGORIES;

  const [openCats, setOpenCats] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  useEffect(() => {
    // close dropdowns on route change
    return navigate.listen ? () => {} : undefined;
  }, [navigate]);

  const submit = (e) => {
    e.preventDefault();
    onSearch(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link to="/" className="text-2xl font-extrabold text-blue-600">E-Store</Link>

        {/* All Categories */}
        <div className="relative">
          <button onClick={() => { setOpenCats(s => !s); setOpenAccount(false); }} className="text-sm px-3 py-1 border rounded flex items-center gap-2">All Categories ▾</button>
          {openCats && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded shadow-lg border p-3 z-50">
              <div className="grid grid-cols-1 gap-1">
                {categories.map(cat => (
                  <Link key={cat.key} to={`/category/${encodeURIComponent(cat.key)}`} onClick={() => setOpenCats(false)} className="block text-sm px-2 py-1 hover:bg-gray-50 rounded">
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <nav className="hidden md:flex gap-4 text-sm text-gray-700">
          <Link to="/products" className="hover:text-blue-600">Products</Link>
        </nav>

        <form onSubmit={submit} className="flex-1">
          <div className="relative">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands..." className="w-full border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-300"/>
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded px-4 py-1 text-sm">Search</button>
          </div>
        </form>

        <div className="flex items-center gap-4">
          <Link to="/wishlist" className="text-sm px-3 py-1 border rounded flex items-center gap-2">Wishlist</Link>
          <Link to="/cart" className="relative text-sm px-3 py-1 border rounded flex items-center gap-2">
            Cart
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
              {(cart && cart.reduce((s, c) => s + (c.qty || 0), 0)) || 0}
            </span>
          </Link>

          {/* My Account dropdown (shows account details) */}
          <div className="relative">
            <button onClick={() => { setOpenAccount(s => !s); setOpenCats(false); }} className="text-sm px-3 py-1 border rounded flex items-center gap-2">My Account ▾</button>
            {openAccount && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg border p-4 z-50">
                {user ? (
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    <div className="mt-3 space-y-2">
                      <Link to="/profile" onClick={() => setOpenAccount(false)} className="block text-sm px-3 py-2 hover:bg-gray-50 rounded">Profile</Link>
                      <Link to="/orders" onClick={() => setOpenAccount(false)} className="block text-sm px-3 py-2 hover:bg-gray-50 rounded">Orders</Link>
                      <Link to="/account/settings" onClick={() => setOpenAccount(false)} className="block text-sm px-3 py-2 hover:bg-gray-50 rounded">Account settings</Link>
                      <button onClick={() => { logout(); setOpenAccount(false); }} className="w-full text-left text-sm px-3 py-2 border rounded">Logout</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm">Not signed in</div>
                    <div className="mt-3 flex gap-2">
                      <Link to="/login" onClick={() => setOpenAccount(false)} className="px-3 py-1 border rounded">Login</Link>
                      <Link to="/signup" onClick={() => setOpenAccount(false)} className="px-3 py-1 bg-white text-blue-600 rounded">Signup</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-3">
                {TOP_CATEGORIES.map((key) => {
              const label = CATEGORY_SLUG_TO_NAME[key] || key;
              const entry = CATEGORY_IMAGES[key];
              const candidates = Array.isArray(entry) ? entry.map(f => `/images/${f}`) : [`/images/${entry || `${key}.jpg`}`, `/images/${key}.jpg`];
              // ensure a final fallback
              if (!candidates.includes('/images/category-1.jpg')) candidates.push('/images/category-1.jpg');
              return (
                <Link key={key} to={`/category/${encodeURIComponent(key)}`} className="min-w-[110px] text-center">
                  <div className="h-14 w-14 rounded bg-white overflow-hidden shadow-sm mx-auto mb-2">
                    <SafeImage candidates={candidates} alt={label} className="w-full h-full object-cover" />
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

/* ------------------ Home ------------------ */
function Home({ products, onAddToCart, searchQuery }) {
  const [filtered, setFiltered] = useState(products);
  useEffect(() => {
    if (!searchQuery) setFiltered(products);
    else {
      const q = searchQuery.toLowerCase();
      setFiltered(products.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    }
  }, [searchQuery, products]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <div className="rounded overflow-hidden shadow">
            {/* static hero avoids flashing */}
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
          <div className="text-center py-12 bg-white rounded shadow">No products found for "<strong>{searchQuery}</strong>"</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------ Product Card ------------------ */
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden flex flex-col">
      <Link to={`/product/${product.id}`} className="block h-44 flex items-center justify-center bg-gray-100 overflow-hidden">
        <SafeImage candidates={[product.image, '/images/category-1.jpg']} alt={product.title} width="200" height="160" className="max-h-full object-contain" />
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`} className="font-medium hover:underline">{product.title}</Link>
        <div className="mt-2 text-lg font-semibold">₹{product.price}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => onAddToCart(product)} className="text-xs border px-3 py-1 rounded">Add to cart</button>
            <button onClick={() => { window.dispatchEvent(new CustomEvent('toggle-wishlist', { detail: product })); }} className="text-xs border px-3 py-1 rounded">♥</button>
          </div>
          <Link to={`/product/${product.id}`} className="text-xs text-blue-600">View</Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Product Detail ------------------ */
function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const pid = Number(id);
  const product = PRODUCTS.find(p => p.id === pid);
  if (!product) return <div className="max-w-3xl mx-auto p-6">Product not found</div>;
  const similar = PRODUCTS.filter(p => p.category === product.category && p.id !== pid).slice(0,4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded shadow p-4">
          <SafeImage candidates={[product.image, '/images/category-1.jpg']} alt={product.title} width="600" height="480" className="w-full h-96 object-contain" />
          <h2 className="text-2xl font-semibold mt-4">{product.title}</h2>
          <div className="text-lg font-bold mt-2">₹{product.price}</div>
          <p className="mt-4 text-gray-700">Category: <strong>{product.category}</strong></p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => onAddToCart(product)} className="bg-yellow-400 px-5 py-2 rounded font-semibold">Add to cart</button>
            <button className="px-5 py-2 border rounded">Buy now</button>
          </div>
        </div>

        <aside className="bg-white rounded shadow p-4">
          <h4 className="font-semibold">Similar products</h4>
          <div className="mt-3 space-y-3">
            {similar.length === 0 ? <div className="text-sm text-gray-500">No similar products</div> : similar.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <SafeImage candidates={[s.image, '/images/category-1.jpg']} alt={s.title} width="64" height="64" className="w-16 h-16 object-contain bg-gray-100 p-2 rounded" />
                <div><div className="text-sm font-medium">{s.title}</div><div className="text-xs text-gray-500">₹{s.price}</div></div>
                <Link to={`/product/${s.id}`} className="ml-auto text-xs text-blue-600">View</Link>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------ Products / Category pages ------------------ */
function ProductsPage({ products, onAddToCart }) {
  // Group products by their category
  const groups = products.reduce((acc, p) => {
    const k = (p.category || 'Uncategorized');
    acc[k] = acc[k] || [];
    acc[k].push(p);
    return acc;
  }, {});

  // Preserve order from ALL_CATEGORIES where possible, then append leftover categories
  const allCategoryLabels = ALL_CATEGORIES.map(c => c.label);
  const ordered = [];
  allCategoryLabels.forEach(label => { if (groups[label]) ordered.push(label); });
  Object.keys(groups).forEach(k => { if (!allCategoryLabels.includes(k)) ordered.push(k); });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">All Products</h2>
      {ordered.length === 0 ? (
        <div className="p-6 bg-white rounded shadow">No products available</div>
      ) : (
        ordered.map(cat => (
          <section key={cat} className="mb-8">
            <h3 className="text-xl font-semibold mb-3">{cat}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groups[cat].map(p => <ProductCard key={p.id + '-' + cat} product={p} onAddToCart={onAddToCart} />)}
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
  // resolve slug to one or more canonical product category names when possible
  const mapped = (typeof CATEGORY_SLUG_TO_NAMES !== 'undefined' && CATEGORY_SLUG_TO_NAMES[slug]) ? CATEGORY_SLUG_TO_NAMES[slug] : [(CATEGORY_SLUG_TO_NAME && CATEGORY_SLUG_TO_NAME[slug]) || slug];
  const lowered = mapped.map(m => String(m).toLowerCase());
  const list = PRODUCTS.filter(p => lowered.includes((p.category || '').toLowerCase()));
  const headingLabel = mapped.map(m => String(m)).join(' & ');
  const heading = headingLabel ? headingLabel.toUpperCase() : 'Category';
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-2">{heading}</h2>
      {mapped.length > 1 && <div className="text-sm text-gray-500 mb-4">Includes items from: {mapped.join(', ')}</div>}
      {list.length === 0 ? <div className="p-6 bg-white rounded shadow">No items in this category</div> :
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{list.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>}
    </div>
  );
}

/* ------------------ New pages: Search, Wishlist, Vendor, Brand, Account Settings ------------------ */
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function SearchResults({ products, onAddToCart }) {
  const q = useQuery().get('q') || '';
  const filtered = products.filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Search results for "{q}"</h2>
      {filtered.length === 0 ? <div className="p-6 bg-white rounded shadow">No results</div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>}
    </div>
  );
}

function WishlistPage({ wishlist, setWishlist }) {
  const remove = (id) => setWishlist(prev => { const next = prev.filter(p => p.id !== id); saveWishlist(next); return next; });
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
      {(!wishlist || wishlist.length === 0) ? <div className="p-6 bg-white rounded shadow">Your wishlist is empty</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{wishlist.map(p => (
          <div key={p.id} className="bg-white rounded shadow p-4">
            <SafeImage candidates={[p.image, '/images/category-1.jpg']} alt={p.title} className="w-full h-40 object-contain mb-3" />
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-500">₹{p.price}</div>
            <div className="mt-3 flex gap-2"><button onClick={()=>remove(p.id)} className="px-3 py-1 border rounded">Remove</button><Link to={`/product/${p.id}`} className="px-3 py-1 border rounded text-blue-600">View</Link></div>
          </div>
        ))}</div>) }
    </div>
  );
}

function VendorPage() {
  const { id } = useParams();
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h2 className="text-2xl font-bold">Vendor {id}</h2><p className="mt-3 text-gray-700">Vendor profile and products (demo).</p></div>);
}

function BrandPage() {
  const { name } = useParams();
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h2 className="text-2xl font-bold">Brand: {name}</h2><p className="mt-3 text-gray-700">Brand page showing products from {name}.</p></div>);
}

function AccountSettings() {
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h2 className="text-2xl font-bold">Account Settings</h2><p className="mt-3 text-gray-700">Manage your account details here.</p></div>);
}

/* ------------------ Cart page (App passes cart & setCart) ------------------ */
function CartPage({ cart, setCart }) {
  const updateQty = (id, qty) => {
    setCart(prev => {
      const next = prev.map(it => it.id === id ? { ...it, qty } : it).filter(it => it.qty > 0);
      saveCart(next);
      return next;
    });
  };
  const remove = (id) => { setCart(prev => { const next = prev.filter(c => c.id !== id); saveCart(next); return next; }); };
  const total = (cart || []).reduce((s,c) => s + c.price * c.qty, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Your cart</h2>
      {(!cart || cart.length === 0) ? <div className="p-8 bg-white rounded shadow">Your cart is empty</div> : (
        <div className="bg-white rounded shadow p-4 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <SafeImage candidates={[item.image, '/images/category-1.jpg']} alt={item.title} width="80" height="80" className="w-20 h-20 object-contain bg-gray-100 p-2 rounded" />
              <div className="flex-1"><div className="font-medium">{item.title}</div><div className="text-sm text-gray-500">₹{item.price}</div></div>
              <input type="number" min="1" value={item.qty} onChange={(e)=>updateQty(item.id, Math.max(1, Number(e.target.value)))} className="w-20 border rounded p-1" />
              <div className="w-28 text-right">₹{item.qty * item.price}</div>
              <button onClick={()=>remove(item.id)} className="px-3 py-1 border rounded">Remove</button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t"><div className="font-semibold">Total</div><div className="font-bold text-lg">₹{total}</div></div>
          <div className="text-right"><Link to="/checkout" className="bg-blue-600 text-white px-4 py-2 rounded">Proceed to checkout</Link></div>
        </div>
      )}
    </div>
  );
}

/* ------------------ Protected Route ------------------ */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* ------------------ Auth Pages (Login / Signup) ------------------ */
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
    } catch (ex) { setErr(ex.message); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full border p-2 rounded" /></div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Login</button><Link to="/signup" className="px-4 py-2 border rounded">Signup</Link></div>
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

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    try {
      signup(form);
      navigate("/profile");
    } catch (ex) { setErr(ex.message); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create account</h2>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm">Full name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full border p-2 rounded" /></div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Signup</button><Link to="/login" className="px-4 py-2 border rounded">Have account?</Link></div>
        </form>
      </div>
    </div>
  );
}

/* ------------------ Profile / Orders ------------------ */
function Profile() {
  const { user } = useAuth();
  const [users, setUsers] = useState(readUsers());
  const cur = users.find(u => u.id === user.id) || user;

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
  const cur = users.find(u => u.id === user.id);
  const orders = (cur && cur.orders) || [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      {orders.length === 0 ? <div className="bg-white rounded shadow p-6">You have no orders yet.</div> : (
        <div className="space-y-4">{orders.map(o => <div key={o.id} className="bg-white rounded shadow p-4">Order #{o.id} - ₹{o.total}</div>)}</div>
      )}
    </div>
  );
}

/* ------------------ Checkout ------------------ */
function Checkout() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const cart = readCart();
  const total = cart.reduce((s,c) => s + c.price * (c.qty || 1), 0);
  const navigate = useNavigate();

  const placeOrder = () => {
    if (!user) { if (window.showEstoreToast) window.showEstoreToast("Please login first"); else alert("Please login first"); return; }
    setProcessing(true);
    setTimeout(() => {
      // save order into user's orders (simple localStorage)
      const users = readUsers();
      const idx = users.findIndex(u => u.email === user.email);
      if (idx !== -1) {
        const order = { id: Date.now(), items: cart, total, placedAt: new Date().toISOString() };
        users[idx].orders = users[idx].orders || [];
        users[idx].orders.push(order);
        saveUsers(users);
        // clear cart
        localStorage.removeItem(CART_KEY);
        if (window.showEstoreToast) window.showEstoreToast("Order placed! Order id: " + order.id);
        else alert("Order placed! Order id: " + order.id);
        navigate("/");
      } else {
        if (window.showEstoreToast) window.showEstoreToast("User not found"); else alert("User not found");
      }
      setProcessing(false);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <div className="bg-white rounded shadow p-6">
        <div className="mb-4">Total: <strong>₹{total}</strong></div>
        <button onClick={placeOrder} disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">{processing ? "Processing..." : "Place order"}</button>
      </div>
    </div>
  );
}

/* ------------------ Misc pages ------------------ */
function About() { return <div className="max-w-7xl mx-auto px-4 py-8"><h2 className="text-2xl font-semibold">About</h2><p className="mt-3 text-gray-700">E-Store demo.</p></div>; }
function Contact() { return <div className="max-w-7xl mx-auto px-4 py-8"><h2 className="text-2xl font-semibold">Contact</h2><p className="mt-3 text-gray-700">support@estore.example</p></div>; }
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div><div className="text-xl font-bold">E-Store</div><div className="text-sm mt-2">Fast delivery & easy returns.</div></div>
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
        <div><div className="font-semibold mb-2">Contact</div><div className="text-sm">support@estore.example</div></div>
      </div>
      <div className="text-center text-xs py-4 border-t border-gray-800">© {new Date().getFullYear()} E-Store</div>
    </footer>
  );
}

/* ------------------ Professional pages ------------------ */
function BlogList() {
  const posts = [
    { id: '1', title: 'How to choose the best headphones', excerpt: 'Short guide to picking headphones for every budget.' },
    { id: '2', title: 'Top 10 gadgets this year', excerpt: 'A roundup of the most useful gadgets of the year.' },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid gap-4">
        {posts.map(p => (
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
  const content = { '1': 'Full article about headphones...', '2': 'Full article about top gadgets...' };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{`Post ${id}`}</h1>
      <div className="prose max-w-none">{content[id] || 'Post not found'}</div>
    </div>
  );
}

function FAQ() {
  const faqs = [
    { q: 'How long does delivery take?', a: 'Delivery usually takes 3-7 business days.' },
    { q: 'What is your return policy?', a: '30-day returns on unused items.' },
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">FAQ</h1>
      <div className="space-y-4">{faqs.map((f,i)=>(<div key={i} className="bg-white rounded shadow p-4"><div className="font-semibold">{f.q}</div><div className="text-sm text-gray-700 mt-1">{f.a}</div></div>))}</div>
    </div>
  );
}

function Terms() {
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Terms & Conditions</h1><p className="mt-3 text-gray-700">Standard terms for using the demo store.</p></div>);
}

function Privacy() {
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Privacy Policy</h1><p className="mt-3 text-gray-700">We respect your privacy — this site stores demo data only.</p></div>);
}

function Careers() {
  const jobs = [{ id: 'frontend', title: 'Frontend Developer' }, { id: 'support', title: 'Customer Support' }];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Careers</h1>
      <p className="text-gray-700 mb-4">Join our team — remote friendly.</p>
      <div className="grid gap-4">{jobs.map(j=>(<div key={j.id} className="bg-white rounded shadow p-4"><div className="font-semibold">{j.title}</div><div className="text-sm text-gray-600 mt-2"><Link to="/contact" className="text-blue-600">Apply via contact</Link></div></div>))}</div>
    </div>
  );
}

function Support() {
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Support</h1><p className="mt-3 text-gray-700">Email us at support@estore.example or use the contact page.</p></div>);
}
/* ------------------ Conditional Header/Footer for auth pages ------------------ */
function ConditionalHeader({ onSearch, cart }) {
  const location = useLocation();
  // hide header on auth pages
  if (location.pathname === "/login" || location.pathname === "/signup") return null;
  return <Header onSearch={onSearch} cart={cart} />;
}

function ConditionalFooter() {
  const location = useLocation();
  if (location.pathname === "/login" || location.pathname === "/signup") return null;
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

  // expose a global toast helper so other components (e.g., Checkout) can show messages
  useEffect(() => {
    window.showEstoreToast = (msg) => {
      setToast(msg);
      window.setTimeout(() => setToast(null), 1800);
    };
    return () => { try { delete window.showEstoreToast; } catch {} };
  }, []);

  // listen for wishlist toggle events from ProductCard buttons
  useEffect(() => {
    const handler = (e) => {
      const p = e.detail;
      setWishlist(prev => {
        const exists = prev.find(i => i.id === p.id);
        const next = exists ? prev.filter(i => i.id !== p.id) : [...prev, p];
        saveWishlist(next);
        if (window.showEstoreToast) window.showEstoreToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
        return next;
      });
    };
    window.addEventListener('toggle-wishlist', handler);
    return () => window.removeEventListener('toggle-wishlist', handler);
  }, []);

  // Add to cart (keeps qty)
  const onAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      let next;
      if (existing) next = prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      else next = [...prev, { ...product, qty: 1 }];
      saveCart(next);
      return next;
    });
    // use a non-blocking toast instead of alert (alerts cause blinking/focus issues)
    setToast(`${product.title} added to cart`);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <AuthProvider>
      <Router>
        <ConditionalHeader onSearch={(q)=>setSearchQuery(q)} cart={cart} />
        {toast && (
          <div className="fixed right-4 top-4 z-50">
            <div className="bg-black text-white px-4 py-2 rounded shadow">{toast}</div>
          </div>
        )}

        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/" element={<Home products={products} onAddToCart={onAddToCart} searchQuery={searchQuery} />} />
          <Route path="/products" element={<ProductsPage products={products} onAddToCart={onAddToCart} />} />
          <Route path="/search" element={<SearchResults products={products} onAddToCart={onAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={onAddToCart} />} />
          <Route path="/category/:name" element={<CategoryPage onAddToCart={onAddToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
          <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} setWishlist={setWishlist} />} />
          <Route path="/vendor/:id" element={<VendorPage />} />
          <Route path="/brand/:name" element={<BrandPage />} />
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          

          <Route path="*" element={<div className="p-12">Not found — <Link to="/">Home</Link></div>} />
        </Routes>

        <ConditionalFooter />
      </Router>
    </AuthProvider>
  );
}
