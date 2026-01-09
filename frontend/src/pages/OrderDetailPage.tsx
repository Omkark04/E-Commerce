import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrderDetails } from '@/hooks/useOrders'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrderDetails(orderId || '')

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-primary-600 text-black rounded-lg hover:bg-primary-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      <OrderDetailsModal 
        order={order} 
        onClose={() => navigate('/orders')} 
      />
    </div>
  )
}
