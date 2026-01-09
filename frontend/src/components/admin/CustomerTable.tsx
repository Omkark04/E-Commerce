import { useState } from 'react'
import { Search, UserCog } from 'lucide-react'
import { useCustomers, useUpdateCustomerRole } from '@/hooks/admin/useCustomers'
import { formatDate } from '@/utils/formatters'
import LoadingSpinner from '@/components/LoadingSpinner'

const ROLES = [
  { value: 'customer', label: 'Customer', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivery_partner', label: 'Delivery Partner', color: 'bg-purple-100 text-purple-800' },
  { value: 'co_shop_owner', label: 'Co-Shop Owner', color: 'bg-orange-100 text-orange-800' },
  { value: 'shop_owner', label: 'Shop Owner', color: 'bg-red-100 text-red-800' },
  { value: 'admin', label: 'Admin', color: 'bg-gray-900 text-white' },
]

export default function CustomerTable() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')

  const { data: customers, isLoading } = useCustomers({ search, role: roleFilter })
  const updateRole = useUpdateCustomerRole()

  const handleUpdateRole = (userId: string) => {
    if (newRole && window.confirm('Are you sure you want to change this user\'s role?')) {
      updateRole.mutate({ userId, role: newRole })
      setSelectedCustomer(null)
      setNewRole('')
    }
  }

  const getRoleColor = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role: string) => {
    return ROLES.find(r => r.value === role)?.label || role
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Roles</option>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loyalty Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers && customers.length > 0 ? (
                customers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{customer.full_name}</p>
                      <p className="text-xs text-gray-500">ID: {customer.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(customer.role)}`}>
                        {getRoleLabel(customer.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(customer.created_at, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {customer.loyalty_points || 0}
                    </td>
                    <td className="px-6 py-4">
                      {selectedCustomer === customer.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select role</option>
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateRole(customer.id)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setSelectedCustomer(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer.id)
                            setNewRole(customer.role)
                          }}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <UserCog className="w-4 h-4" />
                          Change Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
