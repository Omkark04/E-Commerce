import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/types'

interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await productsAPI.getAll(filters)
      // Handle both paginated { results: [...] } and direct array responses
      const products = Array.isArray(data) ? data : (data?.results || [])
      return products as Product[]
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await productsAPI.getById(id)
      return data as Product
    },
    enabled: !!id,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await productsAPI.getFeatured()
      // Handle both paginated { results: [...] } and direct array responses
      const products = Array.isArray(data) ? data : (data?.results || [])
      return products as Product[]
    },
  })
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      const { data } = await productsAPI.getByCategory(categoryId)
      // Handle both paginated { results: [...] } and direct array responses
      const products = Array.isArray(data) ? data : (data?.results || [])
      return products as Product[]
    },
    enabled: !!categoryId,
  })
}

