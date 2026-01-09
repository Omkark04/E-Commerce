import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface BulkDiscountParams {
  discountPercentage: number
  categoryId?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  searchText?: string | null
}

export function useBulkDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: BulkDiscountParams) => {
      const { data } = await api.post('/admin/products/bulk-discount/', params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useCoupons() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons/')
      return data
    },
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (couponData: any) => {
      const { data } = await api.post('/admin/coupons/', couponData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/coupons/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    },
  })
}

export function useFlashSales() {
  return useQuery({
    queryKey: ['admin-flash-sales'],
    queryFn: async () => {
      const { data } = await api.get('/admin/flash-sales/')
      return data
    },
  })
}

export function useCreateFlashSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (saleData: any) => {
      const { data } = await api.post('/admin/flash-sales/', saleData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] })
    },
  })
}

export function useDeleteFlashSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/flash-sales/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sales'] })
    },
  })
}

