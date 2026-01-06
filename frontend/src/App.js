import React from "react";
import { Routes, Route } from "react-router-dom";

/* ================= CONTEXT ================= */
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

/* ================= COMPONENTS ================= */
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

/* ================= PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import PageBySlug from "./pages/PageBySlug";
import ProductDetail from "./components/ProductDetail";
import CategoryProducts from "./pages/CategoryProducts";
import MyOrders from "./pages/MyOrders";
/* ================= ADMIN ================= */
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ProductsPage from "./admin/ProductsPage";
import AddProduct from "./admin/AddProduct";
import EditProduct from "./admin/EditProduct";
import CategoriesPage from "./admin/CategoriesPage";
import CreateCategory from "./admin/CreateCategory";
import EditCategory from "./admin/EditCategory";
import OrdersPage from "./admin/OrdersPage";
import CreateOrder from "./admin/CreateOrder";
import OrderDetailsPage from "./admin/OrderDetailsPage";
import CustomersPage from "./admin/CustomersPage";
import AddCustomerPage from "./admin/AddCustomerPage";
import OrderDetails from "./pages/OrderDetails";
import CouponsPage from "./admin/CouponsPage";


/* ================= CMS ================= */
import CMSDashboard from "./admin/cms/CMSDashboard";
import CMSPages from "./admin/cms/CMSPages";
import EditCMSPage from "./admin/cms/EditCMSPage";
import CMSBanners from "./admin/cms/CMSBanners";
import CMSEO from "./admin/cms/CMSEO";

/* ================= ADMIN GUARD ================= */
import AdminGuard from "./admin/AdminGuard";

/* ================= ROOT APP ================= */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <div className="main-content">
          <AppRoutes />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

/* ================= ROUTES ================= */
function AppRoutes() {
  return (
    <Routes>
      {/* ========== ADMIN ========== */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/:id/edit" element={<EditProduct />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CreateCategory />} />
        <Route path="categories/:id/edit" element={<EditCategory />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<AddCustomerPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        
        <Route path="cms">
          <Route index element={<CMSDashboard />} />
          <Route path="pages" element={<CMSPages />} />
          <Route path="pages/edit/:id" element={<EditCMSPage />} />
          <Route path="banners" element={<CMSBanners />} />
          <Route path="seo" element={<CMSEO />} />
        </Route>
      </Route>

      {/* ========== PUBLIC ========== */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* ✅ CATEGORY ROUTE (THIS FIXES YOUR ISSUE) */}
      <Route path="/category/:slug" element={<CategoryProducts />} />

      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/order-success/:id" element={<OrderSuccess />} />
      <Route path="/orders/:id" element={<OrderDetails />} />

      <Route path="/orders" element={<MyOrders />} />
      <Route path="/page/:slug" element={<PageBySlug />} />

      {/* ========== AUTH ========== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ========== PROTECTED ========== */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* ========== 404 ========== */}
      <Route path="*" element={<div className="p-10">Page not found</div>} />
    </Routes>
  );
}