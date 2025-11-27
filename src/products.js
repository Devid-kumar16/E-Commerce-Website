export const PRODUCTS = [
{ id: 1, title: "Wireless Headphones", price: 1499, category: "Electronics", image: "/images/product 1.jpg" },
{ id: 2, title: "Smart Watch", price: 2499, category: "Electronics", image: "/images/product 2.jpg" },
{ id: 3, title: "Bluetooth Speaker", price: 1899, category: "Electronics", image: "/images/product 3.jpg" },
{ id: 4, title: "Gaming Mouse", price: 999, category: "Electronics", image: "/images/product 4.jpg" },
{ id: 5, title: "Mobile", price: 9999, category: "Mobiles & Tablets", image: "/images/mobile.jpg" },
{ id: 21, title: "Robot Toy", price: 899, category: "Toys", image: "/images/toys.jpg" },
{ id: 29, title: "Fitness Band", price: 999, category: "Sports", image: "/images/sports1.jpg" },
{ id: 35, title: "Basmati Rice 5kg", price: 399, category: "Grocery", image: "/images/grocery1.jpg" },
{ id: 43, title: '42" Smart LED TV', price: 24999, category: "TVs & Appliances", image: "/images/tv1.jpg" },
// ... add the rest or import your full array
];


export const CATEGORY_IMAGES = {
electronics: 'electronics.jpg',
fashion: 'fashion3.jpg',
home: ['kitchen1.jpg','kitchen2.jpg','home1.jpg'],
beauty: 'beauty.jpg',
toys: 'toys.jpg',
sports: ['sports1.jpg','sports2.jpg'],
laptops: 'laptops.webp',
grocery: ['grocery1.jpg','grocery2.jpg'],
'tvs & appliances': ['tv1.jpg','tv2.jpg'],
};


export const ALL_CATEGORIES = [
{ key: 'mobiles & tablets', label: 'Mobiles & Tablets' },
{ key: 'electronics', label: 'Electronics' },
{ key: 'computers', label: 'Computers & Accessories' },
{ key: 'tvs & appliances', label: 'TVs & Appliances' },
{ key: 'home', label: 'Home & Kitchen' },
{ key: 'laptops', label: 'Laptops' },
{ key: 'fashion', label: 'Fashion' },
{ key: 'beauty', label: 'Beauty & Personal Care' },
{ key: 'sports', label: 'Sports & Fitness' },
{ key: 'toys', label: 'Toys & Baby' },
{ key: 'grocery', label: 'Grocery' },
];


export const TOP_CATEGORIES = ['electronics','mobiles & tablets','laptops','fashion','home','beauty','toys','sports','grocery','tvs & appliances'];