import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ordersAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Order } from '@/hooks/useOrders'

// Fetch all orders (admin only)
export function useAllOrders(filters?: {
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  paymentMethod?: string
}) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      if (!user) return []
      const { data } = await ordersAPI.getAll(filters)
      return data as Order[]
    },
    enabled: !!user,
  })
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status,
      estimatedDelivery 
    }: { 
      orderId: string
      status: string
      estimatedDelivery?: string
    }) => {
      const updates: any = {
        status
      }

      if (estimatedDelivery) {
        updates.estimated_delivery = estimatedDelivery
      }

      await api.patch(`/orders/${orderId}/`, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] })
    },
  })
}

// Assign delivery partner
export function useAssignDeliveryPartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      deliveryPartnerId 
    }: { 
      orderId: string
      deliveryPartnerId: string | null
    }) => {
      await api.patch(`/orders/${orderId}/`, { 
        delivery_partner_id: deliveryPartnerId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
    },
  })
}

// Update tracking number
export function useUpdateTracking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      trackingNumber 
    }: { 
      orderId: string
      trackingNumber: string
    }) => {
      await api.patch(`/orders/${orderId}/`, { 
        tracking_number: trackingNumber
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
    },
  })
}

// Get order statistics
export function useOrderStats() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      if (!user) return null
      const { data } = await api.get('/admin/orders/stats/')
      return data
    },
    enabled: !!user,
  })
}

// Fetch delivery partners
export function useDeliveryPartners() {
  return useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data } = await api.get('/admin/delivery-partners/')
      return data || []
    },
  })
}

