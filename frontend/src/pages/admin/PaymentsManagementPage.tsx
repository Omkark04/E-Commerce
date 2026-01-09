import { useState } from 'react'
import { Search, Filter, Download, CheckCircle, XCircle, Clock, RefreshCcw, CreditCard, Banknote, DollarSign } from 'lucide-react'
import { useAdminPayments, useUpdatePaymentStatus, usePaymentStats } from '@/hooks/admin/useAdminPayments'
import { exportPaymentsToCSV } from '@/utils/csvExport'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function PaymentsManagementPage() {
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: payments, isLoading } = useAdminPayments({
    paymentStatus: paymentStatusFilter,
    paymentMethod: paymentMethodFilter,
    search: searchQuery,
  })

  const { data: stats, isLoading: statsLoading } = usePaymentStats()
  const updatePaymentStatus = useUpdatePaymentStatus()

  const handleStatusUpdate = async (orderId: string, newStatus: 'pending' | 'completed' | 'failed' | 'refunded') => {
    try {
      await updatePaymentStatus.mutateAsync({ orderId, paymentStatus: newStatus })
      alert('Payment status updated successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to update payment status')
    }
  }

  const handleExportCSV = () => {
    if (payments && payments.length > 0) {
      exportPaymentsToCSV(payments as any)
    } else {
      alert('No payments to export')
    }
  }

  const paymentStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ]

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'online', label: 'Online Payment' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'refunded':
        return <RefreshCcw className="w-4 h-4 text-blue-600" />
      default:
        return null
    }
  }


  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments Management</h1>
          <p className="text-gray-400 mt-1">Track and manage order payments</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 flex items-center gap-2 transition-all"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm p-6 border-l-4 border-green-500 border-y border-r border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">{stats.completedPayments} payments</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500 border-y border-r border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.pendingAmount)}</p>
                <p className="text-xs text-gray-500">{stats.pendingPayments} payments</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm p-6 border-l-4 border-purple-500 border-y border-r border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">COD Payments</p>
                <p className="text-2xl font-bold text-white">{stats.codPayments}</p>
                <p className="text-xs text-gray-500">Cash on delivery</p>
              </div>
              <Banknote className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm p-6 border-l-4 border-blue-500 border-y border-r border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Online Payments</p>
                <p className="text-2xl font-bold text-white">{stats.onlinePayments}</p>
                <p className="text-xs text-gray-500">Digital payments</p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none [&>option]:bg-slate-900"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none [&>option]:bg-slate-900"
            >
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {payment.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{payment.user?.full_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(payment.created_at, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payment.payment_method === 'cod' ? (
                          <Banknote className="w-4 h-4 text-gray-400" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-300">
                          {payment.payment_method === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        payment.payment_status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        payment.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        payment.payment_status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {getStatusIcon(payment.payment_status)}
                        {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {formatCurrency(payment.final_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={payment.payment_status}
                        onChange={(e) => handleStatusUpdate(payment.id, e.target.value as any)}
                        className="text-xs bg-white/5 border border-white/10 text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-900"
                        disabled={updatePaymentStatus.isPending}
                      >
                        {paymentStatusOptions.slice(1).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No payments found</p>
        </div>
      )}
    </div>
  )
}
