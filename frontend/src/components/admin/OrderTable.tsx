import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/admin/useOrders'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/utils/formatters'
import { exportToCSV, prepareDataForExport } from '@/utils/export'
import LoadingSpinner from '@/components/LoadingSpinner'

const ORDER_STATUSES = [
  'all',
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned'
]

export default function OrderTable() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const { data: orders, isLoading } = useAdminOrders({ search, status: statusFilter })
  const updateStatus = useUpdateOrderStatus()

  const handleUpdateStatus = (orderId: string) => {
    if (newStatus) {
      updateStatus.mutate({ orderId, status: newStatus })
      setSelectedOrder(null)
      setNewStatus('')
    }
  }

  const handleExport = () => {
    if (!orders || orders.length === 0) return

    const exportData = prepareDataForExport(orders, {
      'Order Number': 'order_number',
      'Customer': (order) => order.profiles?.full_name || 'Guest',
      'Amount': (order) => order.final_amount,
      'Status': 'status',
      'Payment Method': 'payment_method',
      'Payment Status': 'payment_status',
      'Date': (order) => formatDate(order.created_at, 'yyyy-MM-dd'),
    })

    exportToCSV(exportData, `orders-${Date.now()}`)
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
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getStatusText(status)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">#{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.profiles?.full_name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{order.profiles?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.created_at, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(order.final_amount))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 capitalize">{order.payment_method}</p>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.payment_status)}`}>
                          {getStatusText(order.payment_status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {selectedOrder === order.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select status</option>
                            {ORDER_STATUSES.filter(s => s !== 'all').map((status) => (
                              <option key={status} value={status}>{getStatusText(status)}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateStatus(order.id)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrder(order.id)
                            setNewStatus(order.status)
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found
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
