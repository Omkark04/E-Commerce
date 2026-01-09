import { useCartItems } from '@/hooks/useCartItems'
import { useOrderCalculations } from '@/hooks/useOrderCalculations'
import { formatCurrency } from '@/utils/formatters'

export default function OrderSummary() {
  const { data: cartItems, isLoading } = useCartItems()
  const { subtotal, deliveryCharges, formattedSubtotal, formattedDeliveryCharges, formattedTax, formattedTotal } = useOrderCalculations()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {(() => {
          const itemsArray = Array.isArray(cartItems) ? cartItems : ((cartItems as any)?.results || [])
          return itemsArray.map((item: any) => {
            const basePrice = Number(item.product?.base_price || 0)
            const variantPrice = Number(item.variant?.additional_price || 0)
            const discount = Number(item.product?.discount_percentage || 0)
            const totalPrice = basePrice + variantPrice
            const discountedPrice = totalPrice * (1 - discount / 100)
            const imageUrl = item.product?.images?.[0]?.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23e5e7eb"/%3E%3C/svg%3E'

            return (
              <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <img
                  src={imageUrl}
                  alt={item.product?.name_en}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{item.product?.name_en}</h4>
                  <p className="text-xs text-gray-500">
                    {item.variant?.size} • {item.variant?.color}
                  </p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(discountedPrice * item.quantity)}</p>
              </div>
            )
          })
        })()}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({(() => {
            const itemsArray = Array.isArray(cartItems) ? cartItems : ((cartItems as any)?.results || [])
            return itemsArray.length
          })()} items)</span>
          <span className="font-medium text-gray-900">{formattedSubtotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Charges</span>
          <span className="font-medium text-gray-900">
            {deliveryCharges === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formattedDeliveryCharges
            )}
          </span>
        </div>

        {deliveryCharges > 0 && subtotal < 500 && (
          <p className="text-xs text-gray-500">
            Add {formatCurrency(500 - subtotal)} more for FREE delivery
          </p>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (GST 18%)</span>
          <span className="font-medium text-gray-900">{formattedTax}</span>
        </div>

        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span className="text-gray-900">Total</span>
          <span className="text-primary-600">{formattedTotal}</span>
        </div>
      </div>
    </div>
  )
}
