import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Fetch default sizes
export function useDefaultSizes(categoryId?: string) {
  return useQuery({
    queryKey: ['default-sizes', categoryId],
    queryFn: async () => {
      const params = categoryId ? { category: categoryId } : {}
      const response = await api.get('/admin/default-sizes/', { params })
      // Handle both paginated and non-paginated responses
      return response.data?.results || response.data || []
    },
    enabled: !!categoryId, // Only fetch if category is selected
  })
}

// Fetch default colors
export function useDefaultColors() {
  return useQuery({
    queryKey: ['default-colors'],
    queryFn: async () => {
      const response = await api.get('/admin/default-colors/')
      // Handle both paginated and non-paginated responses
      return response.data?.results || response.data || []
    },
  })
}

// Create default size
export function useCreateDefaultSize() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/default-sizes/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-sizes'] })
    },
  })
}

// Update default size
export function useUpdateDefaultSize() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/admin/default-sizes/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-sizes'] })
    },
  })
}

// Delete default size
export function useDeleteDefaultSize() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/default-sizes/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-sizes'] })
    },
  })
}

// Create default color
export function useCreateDefaultColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/default-colors/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-colors'] })
    },
  })
}

// Update default color
export function useUpdateDefaultColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/admin/default-colors/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-colors'] })
    },
  })
}

// Delete default color
export function useDeleteDefaultColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/default-colors/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-colors'] })
    },
  })
}
