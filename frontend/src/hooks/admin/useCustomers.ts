import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { customersAPI, api } from '@/lib/api'

// Fetch all customers
export function useCustomers(filters?: {
  search?: string
  role?: string
}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const { data } = await customersAPI.getAll(filters)
      return data || []
    },
  })
}

// Update customer role
export function useUpdateCustomerRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await api.patch(`/admin/users/${userId}/role/`, { role })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
