import { useQuery } from '@tanstack/react-query'
import { categoriesAPI } from '@/lib/api'
import type { Category } from '@/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesAPI.getCategories()
      // Handle both paginated { results: [...] } and direct array responses
      const categories = Array.isArray(data) ? data : (data?.results || [])
      return categories as Category[]
    },
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data } = await categoriesAPI.getById(id)
      return data as Category
    },
    enabled: !!id,
  })
}

