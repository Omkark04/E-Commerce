import { Package, Calendar, MapPin, CreditCard, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Order } from '@/hooks/useOrders'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface OrderCardProps {
  order: Order
  onReorder?: (orderId: string) => void
}

export default function OrderCard({ order, onReorder }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
      case 'packed':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{order.order_number}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(order.created_at, 'MMM dd, yyyy')}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Order Items Preview */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {order.items?.slice(0, 4).map((item: any) => {
          const imageUrl = item.product?.images?.[0]?.image_url || 
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23e5e7eb"/%3E%3C/svg%3E'
          
          return (
            <img
              key={item.id}
              src={imageUrl}
              alt={item.product?.name_en}
              className="w-16 h-16 object-cover rounded border border-gray-200"
            />
          )
        })}
        {order.items && order.items.length > 4 && (
          <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-sm text-gray-600">
            +{order.items.length - 4}
          </div>
        )}
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="w-4 h-4" />
          <span>{order.items?.length || 0} items</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {order.address.city}, {order.address.state}
          </span>
        </div>
      )}

      {/* Total Amount */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
        <span className="text-gray-600">Total Amount</span>
        <span className="text-xl font-bold text-gray-900">{formatCurrency(order.final_amount)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/orders/${order.id}`}
          className="flex-1 px-4 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700 text-center font-medium"
        >
          View Details
        </Link>
        {order.status === 'delivered' && onReorder && (
          <button
            onClick={() => onReorder(order.id)}
            className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reorder
          </button>
        )}
      </div>
    </div>
  )
}
