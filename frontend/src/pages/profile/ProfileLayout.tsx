// useState removed
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FiUser, FiPackage, FiMapPin, FiCreditCard, FiFileText, FiShield } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'

const menuSections = [
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Overview', path: '/profile', icon: FiUser }
    ]
  },
  {
    title: 'ORDERS',
    items: [
      { label: 'Orders & Returns', path: '/orders', icon: FiPackage }
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Profile', path: '/profile/details', icon: FiUser },
      { label: 'Saved Cards', path: '/profile/cards', icon: FiCreditCard },
      { label: 'Addresses', path: '/profile/addresses', icon: FiMapPin }
    ]
  },
  {
    title: 'LEGAL',
    items: [
      { label: 'Terms of Use', path: '/terms', icon: FiFileText },
      { label: 'Privacy Center', path: '/privacy', icon: FiShield }
    ]
  }
]

export default function ProfileLayout() {
  const location = useLocation()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border-b border-gray-200 last:border-0">
                  <div className="px-4 py-3 bg-gray-50">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {section.title}
                    </h3>
                  </div>
                  <nav className="py-2">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isActive
                              ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-600'
                              : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
