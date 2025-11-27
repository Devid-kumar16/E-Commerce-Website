import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CATEGORY_SLUG_TO_NAME, CATEGORY_SLUG_TO_NAMES } from '../helpers/categoryHelpers';
import { PRODUCTS } from '../data/products';


export default function CategoryPage({ onAddToCart }) {
    const { name } = useParams();
    const slug = decodeURIComponent(name || '').toLowerCase();
    const mapped = (CATEGORY_SLUG_TO_NAMES && CATEGORY_SLUG_TO_NAMES[slug]) ? CATEGORY_SLUG_TO_NAMES[slug] : [(CATEGORY_SLUG_TO_NAME && CATEGORY_SLUG_TO_NAME[slug]) || slug];
    const lowered = mapped.map(m => String(m).toLowerCase());
    const list = PRODUCTS.filter(p => lowered.includes((p.category || '').toLowerCase()));
    const headingLabel = mapped.join(' & ');
    const heading = headingLabel ? headingLabel.toUpperCase() : 'Category';


    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-2">{heading}</h2>
            {mapped.length > 1 && <div className="text-sm text-gray-500 mb-4">Includes items from: {mapped.join(', ')}</div>}
            {list.length === 0 ? <div className="p-6 bg-white rounded shadow">No items in this category</div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{list.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}</div>}
        </div>
    );
}