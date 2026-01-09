import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { FiUser, FiPackage, FiMapPin } from 'react-icons/fi'

export default function ProfileOverviewPage() {
  const { user, profile } = useAuthStore()

  const quickLinks = [
    {
      icon: FiPackage,
      title: 'Orders',
      description: 'View and track your orders',
      path: '/orders',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: FiUser,
      title: 'Profile Details',
      description: 'Edit your personal information',
      path: '/profile/details',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: FiMapPin,
      title: 'Addresses',
      description: 'Manage shipping addresses',
      path: '/profile/addresses',
      color: 'bg-green-50 text-green-600'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {profile?.full_name || 'User'}!
        </h3>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{link.title}</h4>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Account Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Wishlist Items</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{profile?.loyalty_points || 0}</div>
          <div className="text-sm text-gray-600">Loyalty Points</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600">Reviews Written</div>
        </div>
      </div>
    </div>
  )
}
