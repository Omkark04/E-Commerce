import { useState } from 'react'
import { Search, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAdminRefunds, useUpdateRefund } from '@/hooks/admin/useAdmin'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency } from '@/utils/formatters'
import { format } from 'date-fns'

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  processed: 'text-green-400 bg-green-400/10 border-green-400/20',
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  processed: CheckCircle,
}

export default function RefundsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: refunds, isLoading } = useAdminRefunds({ status: statusFilter })
  const updateRefund = useUpdateRefund()

  const handleStatusUpdate = (id: string, newStatus: string) => {
    if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updateRefund.mutate({ id, data: { status: newStatus } })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Refund Requests</h1>
          <p className="text-gray-400">Manage order refund requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search order #..."
              className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Request ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Order & User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Reason</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {refunds?.length > 0 ? (
                refunds.map((refund: any) => {
                  const StatusIcon = statusIcons[refund.status as keyof typeof statusIcons]
                  
                  return (
                    <tr key={refund.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-300">#{refund.id.slice(0, 8)}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(refund.created_at), 'MMM d, p')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-white">{refund.order_number}</div>
                          <div className="text-sm text-gray-400">{refund.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {formatCurrency(Number(refund.refund_amount))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <span className="block text-sm text-white font-medium mb-1">{refund.reason_display}</span>
                          <span className="block text-xs text-gray-400 truncate">{refund.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border w-fit mx-auto capitalize text-xs font-medium ${statusColors[refund.status as keyof typeof statusColors]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {refund.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {refund.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(refund.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(refund.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {refund.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(refund.id, 'processed')}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-medium transition-colors"
                          >
                            Mark Processed
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No refund requests found</p>
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
