import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(
          (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
        )
        
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }
        }
        
        return { items: [...state.items, item] }
      }),
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      })),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product?.base_price || 0
          const variantPrice = item.variant?.additional_price || 0
          const discount = item.product?.discount_percentage || 0
          const finalPrice = (price + variantPrice) * (1 - discount / 100)
          return total + finalPrice * item.quantity
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
