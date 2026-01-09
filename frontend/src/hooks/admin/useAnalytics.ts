import { useQuery } from '@tanstack/react-query'
import { dashboardAPI, api } from '@/lib/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await dashboardAPI.getStats()
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSalesData(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: ['sales-data', period],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/sales/', { params: { period } })
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopProducts(limit: number = 5) {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/top-products/', { params: { limit } })
      return data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
