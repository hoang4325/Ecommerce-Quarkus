import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShopLayout from './components/layout/ShopLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './auth/ProtectedRoute';

// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/orders/CheckoutPage';
import OrderListPage from './pages/orders/OrderListPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/users/ProfilePage';
import NotificationPage from './pages/notifications/NotificationPage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminPaymentPage from './pages/admin/AdminPaymentPage';

import './api/interceptors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — standalone layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin — requires ADMIN role */}
          <Route
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/orders" element={<AdminOrderListPage />} />
            <Route path="/admin/products" element={<AdminProductListPage />} />
            <Route path="/admin/categories" element={<AdminCategoryPage />} />
            <Route path="/admin/inventory" element={<AdminInventoryPage />} />
            <Route path="/admin/payments" element={<AdminPaymentPage />} />
          </Route>

          {/* Shop layout — public + auth routes inside */}
          <Route element={<ShopLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* Protected shop pages */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderListPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}