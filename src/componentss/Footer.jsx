import React from 'react';
import { Link } from 'react-router-dom';


export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-200 mt-10">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div><div className="text-xl font-bold">E-Store</div><div className="text-sm mt-2">Fast delivery & easy returns.</div></div>
                <div><div className="font-semibold mb-2">Company</div><ul className="text-sm space-y-1"><li><Link to="/about" className="hover:underline">About</Link></li><li><Link to="/terms" className="hover:underline">Terms</Link></li></ul></div>
                <div><div className="font-semibold mb-2">Help</div><ul className="text-sm space-y-1"><li><Link to="/faq" className="hover:underline">FAQ</Link></li><li><Link to="/support" className="hover:underline">Support</Link></li><li><Link to="/privacy" className="hover:underline">Privacy</Link></li></ul></div>
                <div><div className="font-semibold mb-2">Contact</div><div className="text-sm">support@estore.example</div></div>
            </div>
            <div className="text-center text-xs py-4 border-t border-gray-800">© {new Date().getFullYear()} E-Store</div>
        </footer>
    );
}