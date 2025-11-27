import React from 'react';
import ProductCard from '../components/ProductCard';
import { ALL_CATEGORIES } from '../data/products';


export default function ProductsPage({ products, onAddToCart }) {
    const groups = products.reduce((acc, p) => { const k = p.category || 'Uncategorized'; acc[k] = acc[k] || []; acc[k].push(p); return acc; }, {});
    const allCategoryLabels = ALL_CATEGORIES.map(c => c.label);
    const ordered = [];
    allCategoryLabels.forEach(label => { if (groups[label]) ordered.push(label); });
    Object.keys(groups).forEach(k => { if (!allCategoryLabels.includes(k)) ordered.push(k); });


    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-4">All Products</h2>
            {ordered.length === 0 ? (<div className="p-6 bg-white rounded shadow">No products available</div>) : (ordered.map(cat => (
                <section key={cat} className="mb-8"><h3 className="text-xl font-semibold mb-3">{cat}</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{groups[cat].map(p => <ProductCard key={p.id + "-" + cat} product={p} onAddToCart={onAddToCart} />)}</div></section>
            )))}
        </div>
    );
}