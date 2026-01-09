import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

interface CreateOrderData {
  shippingAddressId: string
  paymentMethod: 'razorpay' | 'cod'
  subtotal: number
  deliveryCharges: number
  tax: number
  finalAmount: number
  cartItems: any[]
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { clearCart } = useCartStore()

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('User not authenticated')

      const { data } = await ordersAPI.create({
        shipping_address_id: orderData.shippingAddressId,
        payment_method: orderData.paymentMethod === 'razorpay' ? 'online' : 'cod',
        subtotal: Number(orderData.subtotal.toFixed(2)),
        delivery_charges: Number(orderData.deliveryCharges.toFixed(2)),
        tax: Number(orderData.tax.toFixed(2)),
        final_amount: Number(orderData.finalAmount.toFixed(2)),
      })

      // Front-end cart store clear
      clearCart()

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// Razorpay payment (setup only, no actual integration)
export function useRazorpayPayment() {
  return useMutation({
    mutationFn: async ({ orderId, amount }: { orderId: string; amount: number }) => {
      // This is where you would integrate Razorpay
      // For now, we'll just simulate the payment flow
      
      // In production, you would:
      // 1. Create Razorpay order on backend
      // 2. Open Razorpay checkout
      // 3. Handle payment success/failure
      // 4. Update order payment status

      console.log('Razorpay payment initiated for order:', orderId, 'Amount:', amount)
      
      // Simulate payment success
      return { success: true, paymentId: `pay_${Date.now()}` }
    },
  })
}

