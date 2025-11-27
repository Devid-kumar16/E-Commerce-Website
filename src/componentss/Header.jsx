import React, { useEffect, useState } from 'react';
import SafeImage from './SafeImage';
import Sidebar from './Sidebar';
import { ALL_CATEGORIES, TOP_CATEGORIES, CATEGORY_IMAGES, CATEGORY_IMAGES as CI } from '../data/products';


export default function Header({ onSearch, cart }) {
    const [q, setQ] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [openCats, setOpenCats] = useState(false);
    const [openAccount, setOpenAccount] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);


    useEffect(() => { setOpenCats(false); setOpenAccount(false); setOpenSidebar(false); }, [location.pathname]);


    const submit = (e) => { e.preventDefault(); onSearch(q); navigate(`/search?q=${encodeURIComponent(q)}`); };


    return (
        <>
            <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} categories={ALL_CATEGORIES} categoryImages={CATEGORY_IMAGES} />
            <header className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
                    <button onClick={() => setOpenSidebar(true)} className="p-2 rounded hover:bg-gray-100 md:hidden" aria-label="Open menu">☰</button>
                    <Link to="/" className="text-2xl font-extrabold text-blue-600">E-Store</Link>


                    <div className="relative hidden sm:block">
                        <button onClick={() => { setOpenCats(s => !s); setOpenAccount(false); }} className="text-sm px-3 py-1 border rounded flex items-center gap-2">All Categories ▾</button>
                        {openCats && (
                            <div className="absolute left-0 mt-2 w-64 bg-white rounded shadow-lg border p-3 z-50">
                                <div className="grid grid-cols-1 gap-1">
                                    {ALL_CATEGORIES.map(cat => (
                                        <Link key={cat.key} to={`/category/${encodeURIComponent(cat.key)}`} onClick={() => setOpenCats(false)} className="block text-sm px-2 py-1 hover:bg-gray-50 rounded">{cat.label}</Link>
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
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands..." className="w-full border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded px-4 py-1 text-sm">Search</button>
                        </div>
                    </form>


                    <div className="flex items-center gap-4">
                        <Link to="/wishlist" className="text-sm px-3 py-1 border rounded flex items-center gap-2">Wishlist</Link>
                        <Link to="/cart" className="relative text-sm px-3 py-1 border rounded flex items-center gap-2">Cart<span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">{(cart && cart.reduce((s, c) => s + (c.qty || 0), 0)) || 0}</span></Link>


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
                                            <div className="mt-3 flex gap-2"><Link to="/login" onClick={() => setOpenAccount(false)} className="px-3 py-1 border rounded">Login</Link><Link to="/signup" onClick={() => setOpenAccount(false)} className="px-3 py-1 bg-white text-blue-600 rounded">Signup</Link></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="bg-gray-50 border-t hidden sm:block">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center gap-6 overflow-x-auto py-3">
                            {TOP_CATEGORIES.map(key => {
                                const label = key;
                                const entry = CI[key];
                                const candidates = Array.isArray(entry) ? entry.map(f => `/images/${f}`) : [`/images/${entry || `${key}.jpg`}`, `/images/${key}.jpg`];
                                if (!candidates.includes('/images/category-1.jpg')) candidates.push('/images/category-1.jpg');
                                return (
                                    <Link key={key} to={`/category/${encodeURIComponent(key)}`} className="min-w-[110px] text-center">
                                        <div className="h-14 w-14 rounded bg-white overflow-hidden shadow-sm mx-auto mb-2"><SafeImage candidates={candidates} alt={label} className="w-full h-full object-cover" /></div>
                                        <div className="text-xs text-gray-700">{label}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}