import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useLanguageStore } from './store/languageStore'

// Layout
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

// Pages
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import WishlistPage from './pages/WishlistPage'
import AuthPage from './pages/AuthPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

// Admin Pages
import AdminLayout from './components/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import ProductsManagementPage from './pages/admin/ProductsManagementPage'
import ProductFormPage from './pages/admin/ProductFormPage'
import OrdersManagementPage from './pages/admin/OrdersManagementPage'
import ReviewsManagementPage from './pages/admin/ReviewsManagementPage'
import PaymentsManagementPage from './pages/admin/PaymentsManagementPage'
import DiscountsManagementPage from './pages/admin/DiscountsManagementPage'
import CustomersPage from './pages/admin/CustomersPage'
import RefundsPage from './pages/admin/RefundsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import BannersPage from './pages/admin/BannersPage'
import SizeChartsPage from './pages/admin/SizeChartsPage'

// Profile Pages
import ProfileLayout from './pages/profile/ProfileLayout'
import ProfileDetailsPage from './pages/profile/ProfileDetailsPage'
import ProfileOverviewPage from './pages/profile/ProfileOverviewPage'

function App() {
  const { checkAuth } = useAuthStore()
  const { language } = useLanguageStore()
  const location = useLocation()
  
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="min-h-screen flex flex-col" key={language}>
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      
      <main className={isAdminRoute ? 'h-screen overflow-hidden' : 'flex-grow'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
            <Route index element={<ProfileOverviewPage />} />
            <Route path="details" element={<ProfileDetailsPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
          
          {/* Admin Management Routes */}
          <Route path="/admin/products" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><ProductsManagementPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><ProductFormPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/products/:id/edit" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><ProductFormPage /></AdminLayout></ProtectedRoute>} />
          
          <Route path="/admin/categories" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><CategoriesPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><OrdersManagementPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><CustomersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/refunds" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><RefundsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><ReviewsManagementPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><PaymentsManagementPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/discounts" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><DiscountsManagementPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/banners" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><BannersPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/size-charts" element={<ProtectedRoute requiredRole="shop_owner"><AdminLayout><SizeChartsPage /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
