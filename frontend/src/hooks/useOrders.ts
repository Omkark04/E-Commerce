import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number | null
  discount_amount: number
  delivery_charges: number
  subtotal: number
  tax: number
  final_amount: number
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'
  payment_method: 'cod' | 'online'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_id: string | null
  shipping_address_id: string
  delivery_partner_id: string | null
  tracking_number: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  address?: any
  items?: any[]
  delivery_partner?: any
}

// Fetch customer's orders
export function useCustomerOrders(filters?: {
  status?: string
  search?: string
  sortBy?: 'newest' | 'oldest'
}) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['customer-orders', user?.id, filters],
    queryFn: async () => {
      if (!user) return []
      const { data } = await ordersAPI.getAll(filters)
      // Handle both array and paginated response
      return (Array.isArray(data) ? data : (data?.results || [])) as Order[]
    },
    enabled: !!user,
  })
}

// Fetch single order details
export function useOrderDetails(orderId: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user || !orderId) return null
      const { data } = await ordersAPI.getById(orderId)
      return data as Order
    },
    enabled: !!user && !!orderId,
  })
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user) throw new Error('User not authenticated')
      await ordersAPI.cancel(orderId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
    },
  })
}

// Reorder - create new order from previous order
export function useReorder() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user) throw new Error('User not authenticated')
      await ordersAPI.reorder(orderId)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
  })
}

