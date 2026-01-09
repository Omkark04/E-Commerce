import { Search, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react'
import { useAdminCustomers } from '@/hooks/admin/useAdmin'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency } from '@/utils/formatters'
import { format } from 'date-fns'

export default function CustomersPage() {
  const { data: customers, isLoading } = useAdminCustomers()

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400">Manage your customer base</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Orders</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Total Spent</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers?.results?.map((customer: any) => (
                <tr key={customer.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {customer.full_name?.charAt(0) || customer.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{customer.full_name || 'Guest User'}</p>
                        <p className="text-xs text-gray-500">ID: #{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="w-3 h-3 text-gray-500" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone className="w-3 h-3 text-gray-500" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-600" />
                      {format(new Date(customer.date_joined), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
                      <ShoppingBag className="w-3 h-3 text-purple-400" />
                      <span className="text-sm font-medium text-white">{customer.order_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    {formatCurrency(customer.total_spent || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
