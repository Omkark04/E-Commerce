import { Check, Circle, Truck, Package, Home } from 'lucide-react'
import type { Order } from '@/hooks/useOrders'
import { formatDate } from '@/utils/formatters'

interface OrderTimelineProps {
  order: Order
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const timelineSteps = [
    { 
      status: 'pending', 
      label: 'Order Placed', 
      icon: Circle,
      description: 'Your order has been received'
    },
    { 
      status: 'confirmed', 
      label: 'Confirmed', 
      icon: Check,
      description: 'Order confirmed by seller'
    },
    { 
      status: 'packed', 
      label: 'Packed', 
      icon: Package,
      description: 'Your order is being packed'
    },
    { 
      status: 'shipped', 
      label: 'Shipped', 
      icon: Truck,
      description: 'Order has been shipped'
    },
    { 
      status: 'out_for_delivery', 
      label: 'Out for Delivery', 
      icon: Truck,
      description: 'Order is out for delivery'
    },
    { 
      status: 'delivered', 
      label: 'Delivered', 
      icon: Home,
      description: 'Order has been delivered'
    },
  ]

  const statusOrder = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']
  const currentStatusIndex = statusOrder.indexOf(order.status)

  // Handle cancelled/returned orders
  if (order.status === 'cancelled' || order.status === 'returned') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <Circle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-red-900">
              Order {order.status === 'cancelled' ? 'Cancelled' : 'Returned'}
            </h4>
            <p className="text-sm text-red-700">
              {order.status === 'cancelled' 
                ? 'This order has been cancelled' 
                : 'This order has been returned'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estimated Delivery */}
      {order.estimated_delivery && order.status !== 'delivered' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Estimated Delivery:</strong> {formatDate(order.estimated_delivery, 'MMM dd, yyyy')}
          </p>
        </div>
      )}

      {/* Delivery Partner Info */}
      {order.delivery_partner && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-900">
            <strong>Delivery Partner:</strong> {order.delivery_partner.full_name}
          </p>
          {order.tracking_number && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Tracking Number:</strong> {order.tracking_number}
            </p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index <= currentStatusIndex
          const isCurrent = index === currentStatusIndex
          const isLast = index === timelineSteps.length - 1

          return (
            <div key={step.status} className="relative pb-8 last:pb-0">
              {/* Connector Line */}
              {!isLast && (
                <div 
                  className={`absolute left-6 top-12 w-0.5 h-full ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}

              {/* Step */}
              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </h4>
                  <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Current Status
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delivered Info */}
      {order.status === 'delivered' && order.delivered_at && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            <strong>Delivered on:</strong> {formatDate(order.delivered_at, 'MMM dd, yyyy hh:mm a')}
          </p>
        </div>
      )}
    </div>
  )
}
