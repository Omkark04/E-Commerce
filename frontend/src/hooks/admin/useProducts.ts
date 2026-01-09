import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api'

// Fetch all products (including inactive) for admin
export function useAdminProducts(filters?: {
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'all'
}) {
  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: async () => {
      const response = await productsAPI.adminGetAll(filters)
      // Handle paginated response
      return response.data?.results || response.data || []
    },
  })
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productData: any) => {
      const { data } = await productsAPI.create(productData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data } = await productsAPI.update(id, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await productsAPI.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

// Toggle product active status
export function useToggleProductStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await productsAPI.update(id, { is_active: isActive })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

