import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatters'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import { useAdminOrders } from '@/hooks/admin/useAdmin'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function RecentOrders() {
  const { data: orders, isLoading } = useAdminOrders({ 
    // Ideally we'd limit this via API query param, but basic filtering handled in backend
    // Just taking the first 5 from the most recent list
  })

  // Get only first 5 recent orders - handle paginated response
  const ordersArray = Array.isArray(orders) ? orders : (orders?.results || [])
  const recentOrders = ordersArray.slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-white/10">
            <th className="pb-3 text-sm font-medium text-gray-400">Order ID</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Customer</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Date</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
            <th className="pb-3 text-sm font-medium text-gray-400 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {recentOrders.length > 0 ? (
            recentOrders.map((order: any) => (
              <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 text-sm font-medium text-white">{order.order_number}</td>
                <td className="py-4 text-sm text-gray-300">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{order.user_name || 'Guest'}</span>
                    <span className="text-xs text-gray-500">{order.user_email}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-400">
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                </td>
                <td className="py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="py-4 text-sm font-medium text-white text-right">
                  {formatCurrency(Number(order.final_amount))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                No active orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
