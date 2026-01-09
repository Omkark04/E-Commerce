import { useCartItems } from './useCartItems'
import { formatCurrency } from '@/utils/formatters'

export function useOrderCalculations() {
  const { data: cartItems } = useCartItems()

  // Handle both array and paginated response
  const itemsArray = Array.isArray(cartItems) ? cartItems : ((cartItems as any)?.results || [])

  const subtotal = itemsArray.reduce((sum: number, item: any) => {
    const basePrice = Number(item.product?.base_price || 0)
    const variantPrice = Number(item.variant?.additional_price || 0)
    const discount = Number(item.product?.discount_percentage || 0)
    
    // Calculate price with discount
    const totalPrice = basePrice + variantPrice
    const discountedPrice = totalPrice * (1 - discount / 100)
    
    return sum + discountedPrice * item.quantity
  }, 0)

  // Calculate delivery charges based on order value
  const deliveryCharges = subtotal >= 500 ? 0 : 50

  // Tax calculation (example: 18% GST)
  const tax = subtotal * 0.18

  // Total
  const total = subtotal + deliveryCharges + tax

  return {
    subtotal,
    deliveryCharges,
    tax,
    total,
    itemCount: itemsArray.length,
    formattedSubtotal: formatCurrency(subtotal),
    formattedDeliveryCharges: formatCurrency(deliveryCharges),
    formattedTax: formatCurrency(tax),
    formattedTotal: formatCurrency(total),
  }
}
