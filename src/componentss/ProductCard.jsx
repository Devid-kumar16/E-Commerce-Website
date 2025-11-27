import React from 'react';
import { Link } from 'react-router-dom';
import SafeImage from './SafeImage';


export default function ProductCard({ product, onAddToCart }) {
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
