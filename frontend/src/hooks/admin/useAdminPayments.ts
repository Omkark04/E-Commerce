import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface PaymentFilters {
  paymentStatus?: string
  paymentMethod?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

// Fetch all payments (orders with payment info)
export function useAdminPayments(filters?: PaymentFilters) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['admin-payments', filters],
    queryFn: async () => {
      if (!user) return []
      // Assuming there's a specific endpoint for admin payments or using orders which contains payment info
      const { data } = await api.get('/admin/payments/', { params: filters })
      return data
    },
    enabled: !!user,
  })
}

// Update payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      paymentStatus,
      paymentId
    }: { 
      orderId: string
      paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
      paymentId?: string
    }) => {
      const updates: any = {
        payment_status: paymentStatus
      }

      if (paymentId) {
        updates.payment_id = paymentId
      }

      await api.patch(`/admin/orders/${orderId}/payment-status/`, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
    },
  })
}

// Get payment statistics
export function usePaymentStats() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      if (!user) return null
      const { data } = await api.get('/admin/payments/stats/')
      return data
    },
    enabled: !!user,
  })
}

