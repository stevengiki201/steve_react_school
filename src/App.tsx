import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import CustomerLayout from "./components/layout/CustomerLayout";
import SellerLayout from "./components/layout/SellerLayout";
import AdminLayout from "./components/layout/AdminLayout";
import RequireAuth from "./components/auth/RequireAuth";

// Customer pages
import HomePage from "./pages/customer/HomePage";
import ExplorePage from "./pages/customer/ExplorePage";
import ProductPage from "./pages/ProductPage";
import SellerStorePage from "./pages/SellerStorePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import AccountPage from "./pages/customer/AccountPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";

// Customer pages
import SellOnboardingPage from "./pages/SellOnboardingPage";

// Seller pages
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import SellerProductNew from "./pages/seller/ProductNew";
import SellerOrders from "./pages/seller/Orders";
import SellerCampaigns from "./pages/seller/Campaigns";
import SellerAnalytics from "./pages/seller/Analytics";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSellers from "./pages/admin/Sellers";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminPayments from "./pages/admin/Payments";
import AdminCategories from "./pages/admin/Categories";
import AdminAds from "./pages/admin/AdsManagement";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

export default function App() {
  return (
    <Routes>
      {/* ==========================================
          AUTH
          ========================================== */}
      <Route path="/auth" element={<AuthPage />} />

      {/* ==========================================
          CUSTOMER ROUTES (with bottom nav)
          ========================================== */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/home"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/explore"
        element={
          <CustomerLayout>
            <ExplorePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/product/:slug"
        element={
          <CustomerLayout>
            <ProductPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/store/:sellerId"
        element={
          <CustomerLayout>
            <SellerStorePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerLayout>
            <CartPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireAuth>
            <CustomerLayout>
              <OrdersPage />
            </CustomerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <RequireAuth>
            <CustomerLayout>
              <OrdersPage />
            </CustomerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/account"
        element={
          <RequireAuth>
            <CustomerLayout>
              <AccountPage />
            </CustomerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/account/profile"
        element={
          <RequireAuth>
            <CustomerLayout>
              <ProfilePage />
            </CustomerLayout>
          </RequireAuth>
        }
      />

      {/* ==========================================
          SELLER ONBOARDING
          ========================================== */}
      <Route
        path="/sell"
        element={
          <RequireAuth>
            <SellOnboardingPage />
          </RequireAuth>
        }
      />

      {/* ==========================================
          SELLER ROUTES (with seller nav)
          ========================================== */}
      <Route
        path="/seller/dashboard"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerDashboard />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/products"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerProducts />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/products/new"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerProductNew />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerOrders />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/campaigns"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerCampaigns />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/analytics"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerAnalytics />
            </SellerLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <RequireAuth allowedRoles={["seller"]}>
            <SellerLayout>
              <ProfilePage />
            </SellerLayout>
          </RequireAuth>
        }
      />

      {/* ==========================================
          ADMIN ROUTES (with admin nav)
          ========================================== */}
      <Route
        path="/admin"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminSellers />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminPayments />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/ads"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminAds />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/campaigns"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminAds />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
