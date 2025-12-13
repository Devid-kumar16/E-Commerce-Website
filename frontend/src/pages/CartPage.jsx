import React from 'react';
import SafeImage from '../components/SafeImage';
import { Link } from 'react-router-dom';


export default function CartPage({ cart, setCart }) {
    const updateQty = (id, qty) => {
        setCart(prev => { const next = prev.map(it => it.id === id ? { ...it, qty } : it).filter(it => it.qty > 0); localStorage.setItem('estore_cart_v1', JSON.stringify(next)); return next; });
    };
    const remove = (id) => { setCart(prev => { const next = prev.filter(c => c.id !== id); localStorage.setItem('estore_cart_v1', JSON.stringify(next)); return next; }); };
    const total = (cart || []).reduce((s, c) => s + c.price * c.qty, 0);


    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold mb-4">Your cart</h2>
            {(!cart || cart.length === 0) ? <div className="p-8 bg-white rounded shadow">Your cart is empty</div> : (
                <div className="bg-white rounded shadow p-4 space-y-4">{cart.map(item => (<div key={item.id} className="flex items-center gap-4"><SafeImage candidates={[item.image, '/images/category-1.jpg']} alt={item.title} width="80" height="80" className="w-20 h-20 object-contain bg-gray-100 p-2 rounded" /><div className="flex-1"><div className="font-medium">{item.title}</div><div className="text-sm text-gray-500">₹{item.price}</div></div><input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, Math.max(1, Number(e.target.value)))} className="w-20 border rounded p-1" /><div className="w-28 text-right">₹{item.qty * item.price}</div><button onClick={() => remove(item.id)} className="px-3 py-1 border rounded">Remove</button></div>))}<div className="flex items-center justify-between pt-4 border-t"><div className="font-semibold">Total</div><div className="font-bold text-lg">₹{total}</div></div><div className="text-right"><Link to="/checkout" className="bg-blue-600 text-white px-4 py-2 rounded">Proceed to checkout</Link></div></div>
            )}
        </div>
    );
}