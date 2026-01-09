import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import { FiGlobe, FiChevronDown } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useLanguageStore } from '@/store/languageStore'
import { useCategories } from '@/hooks/useCategories'
import { getTranslatedCategoryName } from '@/utils/translations'

// Mega menu data for each category
const megaMenuData: Record<string, { title: string; items: string[] }[]> = {
  'paithani-sarees': [
    {
      title: 'By Design',
      items: ['Peacock Design', 'Traditional Motifs', 'Modern Patterns', 'Floral Designs', 'Geometric Patterns']
    },
    {
      title: 'By Color',
      items: ['Purple & Gold', 'Yellow & Red', 'Green & Gold', 'Pink & Gold', 'Multicolor']
    },
    {
      title: 'By Occasion',
      items: ['Wedding Sarees', 'Festival Wear', 'Party Wear', 'Traditional Events', 'Casual Wear']
    },
    {
      title: 'By Price',
      items: ['Under ₹15,000', '₹15,000 - ₹25,000', '₹25,000 - ₹35,000', 'Above ₹35,000']
    }
  ],
  'ladies-kurtis': [
    {
      title: 'By Style',
      items: ['Straight Cut', 'Anarkali', 'A-Line', 'Palazzo Set', 'Kurta Set']
    },
    {
      title: 'By Fabric',
      items: ['Cotton', 'Silk', 'Rayon', 'Georgette', 'Chanderi']
    },
    {
      title: 'By Occasion',
      items: ['Casual Wear', 'Office Wear', 'Party Wear', 'Festive Wear', 'Wedding Wear']
    },
    {
      title: 'By Work',
      items: ['Embroidered', 'Printed', 'Plain', 'Block Print', 'Hand Work']
    }
  ],
  'dupattas-accessories': [
    {
      title: 'Dupattas',
      items: ['Silk Dupattas', 'Cotton Dupattas', 'Georgette Dupattas', 'Banarasi Dupattas']
    },
    {
      title: 'Jewelry',
      items: ['Necklaces', 'Earrings', 'Bangles', 'Rings', 'Anklets']
    },
    {
      title: 'Bags',
      items: ['Clutches', 'Potli Bags', 'Handbags', 'Sling Bags']
    },
    {
      title: 'Others',
      items: ['Bindis', 'Hair Accessories', 'Footwear', 'Shawls']
    }
  ]
}

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { language, setLanguage } = useLanguageStore()
  const { data: categories } = useCategories()
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-3xl font-bold">
              <span className="text-transparent align-center bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Tenz
              </span>
              <p className="text-sm align-center text-gray-600">The Fashion World</p>
            </div>
          </Link>

          {/* Category Navigation */}
          <nav className="hidden lg:flex items-center gap-8 ml-12">
            {(Array.isArray(categories) ? categories : [])?.slice(0, 4).map((category) => (
              <div
                key={category.id}
                className="relative group"
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="relative text-sm font-semibold text-gray-800 hover:text-pink-600 transition-colors uppercase tracking-wide py-6 block"
                  onMouseEnter={() => setHoveredCategory(category.slug)}
                >
                  {getTranslatedCategoryName(category)}
                  {/* Animated Underline */}
                  <span className="absolute bottom-5 left-0 w-0 h-0.5 bg-pink-600 group-hover:w-full transition-all duration-300 ease-out" />
                </Link>

                {/* Mega Menu Dropdown */}
                {hoveredCategory === category.slug && megaMenuData[category.slug] && (
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => setHoveredCategory(category.slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-8 min-w-[800px] mt-0">
                      <div className="grid grid-cols-4 gap-8">
                        {megaMenuData[category.slug].map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-sm font-bold text-pink-600 mb-4 uppercase tracking-wide">
                              {section.title}
                            </h3>
                            <ul className="space-y-2">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link
                                    to={`/products?category=${category.slug}&filter=${encodeURIComponent(item)}`}
                                    className="text-sm text-gray-700 hover:text-pink-600 hover:translate-x-1 transition-all duration-200 block"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:bg-white focus:border-purple-300 transition-colors text-sm"
              />
            </div>
          </form>

          {/* Language Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiGlobe className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-700 uppercase">{language}</span>
              <FiChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Language Dropdown */}
            {showLanguageMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLanguageMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिंदी' },
                    { code: 'mr', label: 'मराठी' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'hi' | 'mr')
                        setShowLanguageMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-purple-50 text-purple-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {/* Profile */}
            {/* Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex flex-col items-center gap-1 hover:text-purple-600 transition-colors group"
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-semibold">Profile</span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">Welcome</p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          setShowProfileMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-2"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex flex-col items-center gap-1 hover:text-purple-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-semibold">Login</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center gap-1 hover:text-purple-600 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs font-semibold">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center gap-1 hover:text-purple-600 transition-colors relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mega menu */}
      {hoveredCategory && (
        <div className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200" />
      )}
    </header>
  )
}
