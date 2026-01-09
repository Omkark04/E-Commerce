import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'

// Fetch all orders with filters
export function useAdminOrders(filters?: {
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const { data } = await ordersAPI.adminGetAll(filters)
      // Handle both paginated { results: [...] } and direct array responses
      const orders = Array.isArray(data) ? data : (data?.results || [])
      return orders
    },
  })
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      trackingNumber 
    }: { 
      orderId: string
      status: string
      trackingNumber?: string
    }) => {
      const updates: any = { status }
      if (trackingNumber) updates.tracking_number = trackingNumber
      
      const { data } = await ordersAPI.updateStatus(orderId, updates)
      
      if (trackingNumber) {
          await ordersAPI.updateTracking(orderId, { tracking_number: trackingNumber })
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] })
    },
  })
}
