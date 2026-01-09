import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addressesAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  is_default: boolean
  address_type: 'home' | 'work' | 'other'
  created_at: string
}

// Fetch user addresses
export function useAddresses() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await addressesAPI.getAll()
      // Handle both array and paginated response
      return (Array.isArray(data) ? data : (data?.results || [])) as Address[]
    },
    enabled: !!user,
  })
}

// Create address
export function useCreateAddress() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated')
      const { data } = await addressesAPI.create(addressData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

// Update address
export function useUpdateAddress() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Address> }) => {
      if (!user) throw new Error('User not authenticated')
      const { data } = await addressesAPI.update(id, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

// Delete address
export function useDeleteAddress() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')
      await addressesAPI.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

// Set default address
export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')
      const { data } = await addressesAPI.setDefault(id)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}
