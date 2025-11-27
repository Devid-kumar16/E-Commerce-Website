import React, { useState } from 'react';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import { PRODUCTS } from './data/products';


export default function App() {
    const [products] = useState(PRODUCTS);
    const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('estore_cart_v1') || '[]') } catch { return [] } });
    const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('estore_wishlist_v1') || '[]') } catch { return [] } });
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);


    useEffect(() => localStorage.setItem('estore_cart_v1', JSON.stringify(cart)), [cart]);


    useEffect(() => {
        window.showEstoreToast = (msg) => { setToast(msg); window.setTimeout(() => setToast(null), 1800); };
        return () => { try { delete window.showEstoreToast } catch { } };
    }, []);


    useEffect(() => {
        const handler = (e) => { const p = e.detail; setWishlist(prev => { const exists = prev.find(i => i.id === p.id); const next = exists ? prev.filter(i => i.id !== p.id) : [...prev, p]; localStorage.setItem('estore_wishlist_v1', JSON.stringify(next)); if (window.showEstoreToast) window.showEstoreToast(exists ? 'Removed from wishlist' : 'Added to wishlist'); return next; }); };
        window.addEventListener('toggle-wishlist', handler);
        return () => window.removeEventListener('toggle-wishlist', handler);
    }, []);


    const onAddToCart = (product) => {
        setCart(prev => { const existing = prev.find(c => c.id === product.id); let next; if (existing) next = prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c); else next = [...prev, { ...product, qty: 1 }]; localStorage.setItem('estore_cart_v1', JSON.stringify(next)); return next; });
        setToast(`${product.title} added to cart`);
        window.setTimeout(() => setToast(null), 1800);
    };


    return (
        <AuthProvider>
            <Router>
                <Header onSearch={(q) => setSearchQuery(q)} cart={cart} />
                {toast && (<div className="fixed right-4 top-4 z-50"><div className="bg-black text-white px-4 py-2 rounded shadow">{toast}</div></div>)}
                <Routes>
                    <Route path="/" element={<Home products={products} onAddToCart={onAddToCart} searchQuery={searchQuery} />} />
                    <Route path="/products" element={<ProductsPage products={products} onAddToCart={onAddToCart} />} />
                    <Route path="/product/:id" element={<ProductDetail onAddToCart={onAddToCart} />} />
                    <Route path="/category/:name" element={<CategoryPage onAddToCart={onAddToCart} />} />
                    <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="*" element={<div className="p-12">Not found — <Link to="/">Home</Link></div>} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}