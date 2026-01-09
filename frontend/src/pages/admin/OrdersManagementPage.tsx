import { useState } from 'react'
import { Search, Filter, Calendar, Download, Eye, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/admin/useAdminOrders'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { exportOrdersToCSV } from '@/utils/csvExport'

export default function OrdersManagementPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: orders, isLoading } = useAllOrders({
    status: statusFilter,
    paymentMethod: paymentFilter,
    search: searchQuery,
  })

  const updateStatus = useUpdateOrderStatus()

  // Ensure orders is an array
  const ordersArray = Array.isArray(orders) ? orders : ((orders as any)?.results || [])

  // Calculate stats
  const stats = {
    total: ordersArray.length,
    pending: ordersArray.filter((o: any) => o.status === 'pending').length,
    processing: ordersArray.filter((o: any) => ['confirmed', 'packed', 'shipped'].includes(o.status)).length,
    delivered: ordersArray.filter((o: any) => o.status === 'delivered').length,
    cancelled: ordersArray.filter((o: any) => o.status === 'cancelled').length,
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus })
    } catch (error: any) {
      alert(error.message || 'Failed to update status')
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const paymentOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'online', label: 'Online Payment' },
  ]

  const clearFilters = () => {
    setStatusFilter('all')
    setPaymentFilter('all')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Order Management</h1>
          <p className="text-gray-400">View and manage all customer orders</p>
        </div>
        <button 
          onClick={() => {
            if (ordersArray.length > 0) {
              exportOrdersToCSV(ordersArray as any)
            } else {
              alert('No orders to export')
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-400">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.processing}</p>
              <p className="text-xs text-gray-400">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.delivered}</p>
              <p className="text-xs text-gray-400">Delivered</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              <p className="text-xs text-gray-400">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search order number, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Filter */}
          <div className="relative min-w-[160px]">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="From"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="To"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || paymentFilter !== 'all' || searchQuery || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : ordersArray.length > 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ordersArray.map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{order.order_number}</p>
                          <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{order.user_name || order.user?.full_name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.user_email || order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{formatDate(order.created_at, 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.created_at, 'hh:mm a')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          order.payment_method === 'cod' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.payment_method === 'cod' ? 'COD' : 'Online'}
                        </span>
                        <span className={`text-xs ${
                          order.payment_status === 'completed' ? 'text-green-400' :
                          order.payment_status === 'failed' ? 'text-red-400' :
                          order.payment_status === 'refunded' ? 'text-orange-400' :
                          'text-gray-400'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white font-semibold">{formatCurrency(order.final_amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                          title="Update Status"
                        >
                          {statusOptions.slice(1).map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No orders found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Order Number</p>
                  <p className="text-white font-semibold">{selectedOrder.order_number}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Date</p>
                  <p className="text-white font-semibold">{formatDate(selectedOrder.created_at, 'MMM dd, yyyy hh:mm a')}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Payment</p>
                  <p className="text-white font-semibold">
                    {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'} - {selectedOrder.payment_status}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">{selectedOrder.user_name || selectedOrder.user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedOrder.user_email || selectedOrder.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.shipping_address && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Delivery Address</h3>
                  <p className="text-gray-300">{selectedOrder.shipping_address.full_name}</p>
                  <p className="text-gray-300">{selectedOrder.shipping_address.phone}</p>
                  <p className="text-gray-300 mt-2">{selectedOrder.shipping_address.address_line1}</p>
                  <p className="text-gray-300">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-white">{item.product?.name_en || item.product_name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white font-medium">{formatCurrency(item.price_at_purchase * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(selectedOrder.final_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
