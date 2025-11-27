import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';


export default function Home({ products, onAddToCart, searchQuery }) {
    const [filtered, setFiltered] = useState(products);
    useEffect(() => {
        if (!searchQuery) setFiltered(products);
        else { const q = searchQuery.toLowerCase(); setFiltered(products.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))); }
    }, [searchQuery, products]);


    return (
        <main className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9">
                    <div className="rounded overflow-hidden shadow"><img src="/images/hero.jpg" alt="hero" className="w-full h-96 object-cover rounded" loading="eager" /></div>
                </div>
                <aside className="lg:col-span-3 space-y-4"><div className="rounded overflow-hidden shadow"><img src="/images/vendor-1.jpg" alt="promo" className="w-full h-48 object-cover" /></div><div className="bg-white rounded shadow p-4"><h4 className="font-semibold">Hot Offers</h4><p className="text-sm text-gray-600 mt-1">Use code SAVE20 on checkout</p></div></aside>
            </div>


            <section id="deals" className="mt-10">
                <div className="flex items-center justify-between mb-4"><h3 className="text-2xl font-semibold">Top Deals</h3><Link to="/products" className="text-sm text-blue-600">See all</Link></div>
                {filtered.length === 0 ? (<div className="text-center py-12 bg-white rounded shadow">No products found for "<strong>{searchQuery}</strong>"</div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">{filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>)}
            </section>
        </main>
    );
}