import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/utils/formatters'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [showAnimation, setShowAnimation] = useState(true)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null
      const { data } = await ordersAPI.getById(orderId)
      // Map shipping_address to address for compatibility if needed, 
      // or update usage below. The component uses order.address.
      // If the API returns shipping_address, we might need to adjust.
      // Let's check typical generic usage or mapped it here.
      return {
        ...data,
        address: data.shipping_address || data.address
      }
    },
    enabled: !!orderId,
  })

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showAnimation ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-green-200 rounded-full animate-ping opacity-75"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-8">Order Placed Successfully!</h1>
          <p className="text-gray-600 mt-2">Processing your order...</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-900">{formatDate(order.created_at, 'MMM dd, yyyy')}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{order.address?.full_name}</p>
                <p className="text-sm text-gray-600">{order.address?.phone}</p>
                <p className="text-sm text-gray-700 mt-2">
                  {order.address?.address_line1}, {order.address?.address_line2}
                  <br />
                  {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product?.name_en}</p>
                      <p className="text-sm text-gray-600">
                        {item.variant?.size} • {item.variant?.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-medium text-gray-900">{formatCurrency(Number(order.delivery_charges))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">{formatCurrency(Number(order.tax))}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">{formatCurrency(Number(order.final_amount))}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Payment Method:</strong> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/orders"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Package className="w-5 h-5" />
              Track Order
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
