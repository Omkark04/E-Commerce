import { X, MapPin, CreditCard, Package, Download, XCircle } from 'lucide-react'
import type { Order } from '@/hooks/useOrders'
import { useCancelOrder } from '@/hooks/useOrders'
import OrderTimeline from './OrderTimeline'
import { formatCurrency, formatDate } from '@/utils/formatters'
import LoadingSpinner from '../LoadingSpinner'

interface OrderDetailsModalProps {
  order: Order
  onClose: () => void
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const cancelOrder = useCancelOrder()

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      await cancelOrder.mutateAsync(order.id)
      alert('Order cancelled successfully')
      onClose()
    } catch (error: any) {
      alert(error.message || 'Failed to cancel order')
    }
  }

  const canCancel = order.status === 'pending'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-600 mt-1">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <OrderTimeline order={order} />
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h3>
            {order.address && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{order.address.full_name}</p>
                <p className="text-sm text-gray-600">{order.address.phone}</p>
                <p className="text-sm text-gray-700 mt-2">
                  {order.address.address_line1}, {order.address.address_line2}
                  <br />
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => {
                const imageUrl = item.product?.images?.[0]?.image_url || 
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23e5e7eb"/%3E%3C/svg%3E'
                
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={imageUrl}
                      alt={item.product?.name_en}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product?.name_en}</h4>
                      <p className="text-sm text-gray-600">
                        {item.variant?.size} • {item.variant?.color}
                      </p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price_at_purchase * item.quantity)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium ${
                  order.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-medium text-gray-900">{order.payment_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Details</h3>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-medium text-gray-900">
                  {order.delivery_charges === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(order.delivery_charges)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (GST 18%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-primary-600">{formatCurrency(order.final_amount)}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Order Date:</strong> {formatDate(order.created_at, 'MMM dd, yyyy hh:mm a')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrder.isPending}
                className="flex-1 px-6 py-3 bg-red-600 text-black rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {cancelOrder.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Cancel Order
                  </>
                )}
              </button>
            )}
            <button
              className="flex-1 px-6 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              onClick={() => alert('Invoice download feature coming soon!')}
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
