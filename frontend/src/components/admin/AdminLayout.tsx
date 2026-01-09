import { type ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Star, 
  CreditCard,
  Percent,
  Menu,
  X,
  ChevronLeft,
  Users,
  RotateCcw,
  Image,
  Ruler,
  FolderTree,
  Bell,
  LogOut,
  Settings,
  AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLowStockProducts } from '@/hooks/admin/useAdmin'

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/discounts', label: 'Discounts', icon: Percent },
  { path: '/admin/banners', label: 'Banners', icon: Image },
  { path: '/admin/size-charts', label: 'Size Charts', icon: Ruler },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { profile, logout } = useAuthStore()
  const { data: lowStockData } = useLowStockProducts()

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const lowStockCount = lowStockData?.count || 0

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Desktop Sidebar - Glassmorphism */}
      <aside 
        className={`hidden lg:flex flex-col h-full transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } backdrop-blur-xl bg-white/10 border-r border-white/20`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tenz Admin</h2>
                <p className="text-xs text-white/60">Shop Management</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && isSidebarOpen && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur flex-shrink-0">
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{lowStockCount} Low Stock Items</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      active
                        ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/25 backdrop-blur'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                    {isSidebarOpen && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="backdrop-blur-lg bg-white/10 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-white/50">Logged in as</p>
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-white/40 truncate">{profile?.role}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Button - Fixed position works regardless of layout */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-lg shadow-purple-500/25 backdrop-blur-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside 
            className="absolute left-0 top-0 bottom-0 w-72 backdrop-blur-xl bg-slate-900/95 border-r border-white/10 flex flex-col h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <h2 className="text-lg font-bold text-white">Tenz Admin</h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
              <ul className="space-y-1 px-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/60'}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Admin Header */}
        <header className="h-16 backdrop-blur-xl bg-white/5 border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">
              {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white">
              <Bell className="w-5 h-5" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {lowStockCount > 9 ? '9+' : lowStockCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/25">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-white">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-white/50 capitalize">{profile?.role}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
