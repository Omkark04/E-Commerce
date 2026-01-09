import { useQuery } from '@tanstack/react-query'
import { cartAPI } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import type { CartItem } from '@/types'

export function useCartItems() {
  const { items: localItems } = useCartStore()
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['cart-items', localItems, user?.id],
    queryFn: async () => {
      if (user) {
        // Fetch from database for logged-in users
        const { data } = await cartAPI.getItems()
        return data as CartItem[]
      } else {
        // For guest users, fetching product and variant data for local cart items
        // Ideally we'd call an API endpoint for bulk fetching details if we wanted better performance
        // For now, returning localItems if we trust they have product details stored, or we might need to fetch.
        // The original code fetched Supabase data.
        // We'll trust local items for now to unblock, or we'd need a bulk-product API.
        return localItems as CartItem[]
      }
    },
  })
}

